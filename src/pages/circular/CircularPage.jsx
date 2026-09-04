import { useState } from 'react'
import { useCircularNodes, useCompostBatches } from '../../hooks/useInventory'
import { Plus, X, Recycle, Thermometer, Clock, AlertTriangle } from 'lucide-react'

const today = new Date().toISOString().split('T')[0]
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Không rõ'

export default function CircularPage() {
  const { nodes, addNode } = useCircularNodes()
  const { batches, addBatch, updateBatch } = useCompostBatches()
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [showNodeForm, setShowNodeForm] = useState(false)

  const [nodeForm, setNodeForm] = useState({ node_type: 'Ủ phân', input_source: '', capacity: '' })
  const [batchForm, setBatchForm] = useState({
    node_id: '', compost_type: 'Ủ nhanh', input_mass_kg: '',
    input_composition: '', start_date: today, notes: ''
  })

  const handleAddNode = async (e) => {
    e.preventDefault()
    await addNode(nodeForm)
    setNodeForm({ node_type: 'Ủ phân', input_source: '', capacity: '' })
    setShowNodeForm(false)
  }

  const handleAddBatch = async (e) => {
    e.preventDefault()
    await addBatch(batchForm)
    setBatchForm({ node_id: '', compost_type: 'Ủ nhanh', input_mass_kg: '', input_composition: '', start_date: today, notes: '' })
    setShowBatchForm(false)
  }

  const nodeBatches = (nodeId) => batches.filter(b => b.node_id === nodeId)

  const nodeTypeIcon = (t) => {
    if (t === 'Ủ phân' || t === 'Compost') return '🔥'
    if (t === 'Trùn quế') return '🪱'
    return '⚡'
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">♻️ Vòng tuần hoàn</h1>
          <p className="page-description">Trạm thu gom, xử lý phụ phẩm & ủ phân vi sinh</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setShowNodeForm(true)}>
            <Plus size={18} /> Thêm trạm
          </button>
          <button className="btn btn-primary" onClick={() => setShowBatchForm(true)}>
            <Plus size={18} /> Ghi mẻ ủ
          </button>
        </div>
      </div>

      {/* Nodes */}
      {nodes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">♻️</div>
          <h3>Chưa có trạm tuần hoàn</h3>
          <p>Thêm trạm Compost, Trùn quế hoặc Biogas</p>
        </div>
      ) : (
        <div className="grid-2" style={{ marginBottom: 32 }}>
          {nodes.map(node => (
            <div key={node.node_id} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28 }}>{nodeTypeIcon(node.node_type)}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{node.node_type}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{node.input_source}</div>
                  </div>
                </div>
                <span className={`badge ${node.status === 'Hoạt động' ? 'badge-success' : 'badge-neutral'}`}>{node.status}</span>
              </div>
              <div className="card-body">
                {node.capacity && <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>Sức chứa: {node.capacity}</div>}
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
                  Mẻ ủ ({nodeBatches(node.node_id).filter(b => b.status === 'Đang ủ').length} đang hoạt động)
                </div>
                {nodeBatches(node.node_id).map(batch => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(batch.cover_removal_date) - new Date()) / 86400000))
                  const needsCheck = batch.next_check_date && batch.next_check_date <= today
                  const totalDays = Math.ceil((new Date(batch.cover_removal_date) - new Date(batch.start_date)) / 86400000)
                  const elapsed = totalDays - daysLeft
                  const progress = totalDays > 0 ? Math.min(100, (elapsed / totalDays) * 100) : 0

                  return (
                    <div key={batch.batch_id} style={{
                      border: needsCheck ? '2px solid var(--color-warning)' : '1px solid var(--color-border)',
                      borderRadius: 12, padding: 14, marginBottom: 10,
                      background: needsCheck ? '#fef3c7' : 'var(--color-bg)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{batch.compost_type}</div>
                        <span className={`badge ${batch.status === 'Đang ủ' ? (needsCheck ? 'badge-warning' : 'badge-success') : 'badge-neutral'}`}>
                          {needsCheck ? '⚠️ Cần kiểm tra' : batch.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                        <div>📦 {batch.input_mass_kg} kg — {batch.input_composition || 'Không rõ'}</div>
                        <div>📅 Bắt đầu: {formatDate(batch.start_date)} → Dỡ bạt: {formatDate(batch.cover_removal_date)}</div>
                        <div>🌡️ Mục tiêu: {batch.temp_target_min}–{batch.temp_target_max}°C</div>
                        {batch.next_check_date && <div>🔍 Kiểm tra tiếp: {formatDate(batch.next_check_date)}</div>}
                      </div>
                      {/* Progress bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 3,
                            width: `${progress}%`,
                            background: batch.status === 'Hoàn thành' ? 'var(--color-success)' : 'var(--color-primary)'
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                          {batch.status === 'Hoàn thành' ? '✅' : `${daysLeft} ngày`}
                        </span>
                      </div>
                      {batch.status === 'Đang ủ' && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-secondary" onClick={() => updateBatch(batch.batch_id, { status: 'Hoàn thành' })}>
                            ✅ Hoàn thành
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
                {nodeBatches(node.node_id).length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--color-text-light)' }}>Chưa có mẻ ủ nào</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Node Modal */}
      {showNodeForm && (
        <div className="modal-overlay" onClick={() => setShowNodeForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm trạm tuần hoàn</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNodeForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddNode}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Loại trạm</label>
                  <select className="form-select" value={nodeForm.node_type} onChange={e => setNodeForm({...nodeForm, node_type: e.target.value})}>
                    <option>Ủ phân</option>
                    <option>Trùn quế</option>
                    <option>Khí sinh học</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nguồn đầu vào</label>
                  <input className="form-input" value={nodeForm.input_source} onChange={e => setNodeForm({...nodeForm, input_source: e.target.value})} placeholder="VD: Bã lá nha đam + phân bò" />
                </div>
                <div className="form-group">
                  <label className="form-label">Sức chứa</label>
                  <input className="form-input" value={nodeForm.capacity} onChange={e => setNodeForm({...nodeForm, capacity: e.target.value})} placeholder="VD: 200 kg/mẻ" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNodeForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Thêm trạm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Batch Modal */}
      {showBatchForm && (
        <div className="modal-overlay" onClick={() => setShowBatchForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ghi mẻ ủ mới</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowBatchForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddBatch}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Trạm <span className="form-required">*</span></label>
                  <select className="form-select" value={batchForm.node_id} onChange={e => setBatchForm({...batchForm, node_id: e.target.value})} required>
                    <option value="">Chọn trạm...</option>
                    {nodes.map(n => <option key={n.node_id} value={n.node_id}>{n.node_type} — {n.input_source}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quy trình ủ</label>
                  <select className="form-select" value={batchForm.compost_type} onChange={e => setBatchForm({...batchForm, compost_type: e.target.value})}>
                    <option value="Ủ nhanh">Ủ nhanh (50–60°C, 7–10 ngày) — DOCX</option>
                    <option value="Ủ chuyên biệt bã nha đam">Ủ chuyên biệt bã nha đam (60–65°C, 70 ngày) — SÁCH</option>
                  </select>
                  <span className="form-hint">
                    {batchForm.compost_type === 'Ủ nhanh'
                      ? 'Ủ chung phụ phẩm + phân chuồng + men EM1/Trichoderma'
                      : '60% bã nha đam : 20% xác bã : 20% phân bò khô (SÁCH tr.343-348)'}
                  </span>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Khối lượng (kg) <span className="form-required">*</span></label>
                    <input className="form-input" type="number" step="0.1" value={batchForm.input_mass_kg} onChange={e => setBatchForm({...batchForm, input_mass_kg: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày bắt đầu</label>
                    <input className="form-input" type="date" value={batchForm.start_date} onChange={e => setBatchForm({...batchForm, start_date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Thành phần nguyên liệu</label>
                  <textarea className="form-textarea" value={batchForm.input_composition} onChange={e => setBatchForm({...batchForm, input_composition: e.target.value})} rows={2} placeholder="VD: 60% bã nha đam, 20% xác bã, 20% phân bò" />
                </div>
                <div className="form-group">
                  <label className="form-label">Ghi chú</label>
                  <textarea className="form-textarea" value={batchForm.notes} onChange={e => setBatchForm({...batchForm, notes: e.target.value})} rows={2} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBatchForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Ghi mẻ ủ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
