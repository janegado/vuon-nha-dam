import { useState } from 'react'
import { useChemicalLogs } from '../../hooks/useInventory'
import { usePlots, useCrops } from '../../hooks/usePlots'
import { Plus, X, ShieldAlert, AlertTriangle, Lock, Unlock, ShieldCheck, Sprout } from 'lucide-react'

const today = new Date().toISOString().split('T')[0]
const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Không rõ'

// Danh mục thuốc BVTV phổ biến cho nha đam (với PHI mặc định)
const CHEMICALS = [
  { name: 'Thuốc BT sinh học', type: 'Sinh học', phi: 3 },
  { name: 'Trichoderma', type: 'Sinh học', phi: 0 },
  { name: 'Dầu Neem', type: 'Sinh học', phi: 3 },
  { name: 'Beauveria bassiana', type: 'Sinh học', phi: 0 },
  { name: 'Đồng (Bordeaux)', type: 'Hóa học', phi: 7 },
  { name: 'Khác', type: '', phi: 7 },
]

export default function PestPage() {
  const { logs, loading, addLog, isPlotLocked, getPlotLockDate } = useChemicalLogs()
  const { plots } = usePlots()
  const { crops } = useCrops()
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    plot_id: '', agent_name: '', agent_type: 'Sinh học', dose: '',
    date_applied: today, phi_days: 7, technique_notes: '',
    is_correct_drug: true, is_correct_time: true, is_correct_dose: true, is_correct_technique: true
  })

  const handleChemicalSelect = (chem) => {
    setForm({ ...form, agent_name: chem.name, agent_type: chem.type, phi_days: chem.phi })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await addLog(form)
    setForm({
      plot_id: '', agent_name: '', agent_type: 'Sinh học', dose: '',
      date_applied: today, phi_days: 7, technique_notes: '',
      is_correct_drug: true, is_correct_time: true, is_correct_dose: true, is_correct_technique: true
    })
    setShowForm(false)
  }

  const getPlotName = (plotId) => plots.find(p => p.plot_id === plotId)?.name || 'Không rõ'

  // Active PHI locks
  const activeLocks = plots.filter(p => isPlotLocked(p.plot_id))

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🛡️ BVTV & Dịch hại</h1>
          <p className="page-description">Kiểm soát thuốc BVTV, cách ly an toàn (PHI) — "4 đúng"</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Ghi phun thuốc
        </button>
      </div>

      {/* PHI Lock Warnings */}
      {activeLocks.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Lock size={18} style={{ color: 'var(--color-danger)' }} /> Lô đang bị khóa thu hoạch (PHI)
          </h3>
          {activeLocks.map(plot => {
            const lockDate = getPlotLockDate(plot.plot_id)
            const daysLeft = lockDate ? Math.max(0, Math.ceil((new Date(lockDate) - new Date()) / 86400000)) : 0
            return (
              <div key={plot.plot_id} className="phi-warning phi-locked" style={{ marginBottom: 8 }}>
                <Lock size={20} />
                <div style={{ flex: 1 }}>
                  <strong>{plot.name}</strong> — 🔒 Khóa thu hoạch/xuất bán đến {formatDate(lockDate)}
                  <div style={{ fontSize: 13, opacity: 0.8 }}>Còn {daysLeft} ngày cách ly</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Plot PHI Status Overview */}
      <div className="section-header">
        <h2 className="section-title">Trạng thái PHI các lô</h2>
      </div>
      <div className="grid-3" style={{ marginBottom: 32 }}>
        {plots.map(plot => {
          const locked = isPlotLocked(plot.plot_id)
          const plotCrops = (crops || []).filter(c => String(c.plot_id) === String(plot.plot_id))
          const hasCrop = plotCrops.length > 0 || (plot.cultivation_stage && plot.cultivation_stage !== 'Làm đất')

          let borderColor = '#e2e8f0'
          let statusIcon = <Sprout size={24} style={{ color: '#64748b' }} />
          let statusText = '🌱 Đang làm đất (Chưa xuống giống)'
          let statusColor = '#64748b'

          if (locked) {
            borderColor = 'var(--color-danger)'
            statusIcon = <Lock size={24} style={{ color: 'var(--color-danger)' }} />
            statusText = `🔒 Đang cách ly thuốc đến ${formatDate(getPlotLockDate(plot.plot_id))}`
            statusColor = 'var(--color-danger)'
          } else if (hasCrop) {
            borderColor = 'var(--color-success)'
            statusIcon = <ShieldCheck size={24} style={{ color: 'var(--color-success)' }} />
            statusText = '✅ An toàn PHI (Không có dư lượng thuốc)'
            statusColor = 'var(--color-success)'
          }

          return (
            <div key={plot.plot_id} className="card" style={{
              borderColor,
              borderWidth: 2,
              background: locked ? '#fff1f2' : (hasCrop ? '#f0fdf4' : '#ffffff')
            }}>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {statusIcon}
                <div>
                  <div style={{ fontWeight: 700 }}>{plot.name}</div>
                  <div style={{ fontSize: 13, color: statusColor, fontWeight: 600 }}>
                    {statusText}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chemical Logs */}
      <div className="section-header">
        <h2 className="section-title">Lịch sử phun thuốc</h2>
      </div>

      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛡️</div>
          <h3>Chưa có bản ghi nào</h3>
          <p>Ghi lại khi phun thuốc BVTV</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ngày phun</th>
                <th>Lô</th>
                <th>Thuốc</th>
                <th>Liều</th>
                <th>PHI</th>
                <th>Được thu hoạch</th>
                <th>4 Đúng</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const isActive = log.harvest_allowed_date > today
                const allCorrect = log.is_correct_drug && log.is_correct_time && log.is_correct_dose && log.is_correct_technique
                return (
                  <tr key={log.log_id}>
                    <td style={{ fontWeight: 600 }}>{formatDate(log.date_applied)}</td>
                    <td>{getPlotName(log.plot_id)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.agent_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{log.agent_type}</div>
                    </td>
                    <td>{log.dose || '—'}</td>
                    <td><span className="badge badge-info">{log.phi_days} ngày</span></td>
                    <td>
                      {isActive ? (
                        <span className="badge badge-danger">🔒 {formatDate(log.harvest_allowed_date)}</span>
                      ) : (
                        <span className="badge badge-success">✅ Đủ ngày</span>
                      )}
                    </td>
                    <td>
                      {allCorrect ? (
                        <span className="badge badge-success">✅ Đạt</span>
                      ) : (
                        <span className="badge badge-warning">⚠️ Thiếu</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Chemical Log Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ghi phun thuốc BVTV</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Lô vườn <span className="form-required">*</span></label>
                  <select className="form-select" value={form.plot_id} onChange={e => setForm({...form, plot_id: e.target.value})} required>
                    <option value="">Chọn lô...</option>
                    {plots.map(p => <option key={p.plot_id} value={p.plot_id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Thuốc BVTV <span className="form-required">*</span></label>
                  <div className="checkbox-group">
                    {CHEMICALS.map(chem => (
                      <label key={chem.name} className={`checkbox-item ${form.agent_name === chem.name ? 'checked' : ''}`} onClick={() => handleChemicalSelect(chem)}>
                        {chem.name}
                        <span className="badge badge-info" style={{ marginLeft: 4 }}>{chem.phi} ngày</span>
                      </label>
                    ))}
                  </div>
                  <span className="form-hint">Chọn thuốc → tự điền PHI. Thuốc sinh học thường PHI ngắn hơn.</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Liều lượng</label>
                    <input className="form-input" value={form.dose} onChange={e => setForm({...form, dose: e.target.value})} placeholder="VD: 20ml/bình 16L" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày phun</label>
                    <input className="form-input" type="date" value={form.date_applied} onChange={e => setForm({...form, date_applied: e.target.value})} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">PHI (ngày cách ly)</label>
                    <input className="form-input" type="number" value={form.phi_days} onChange={e => setForm({...form, phi_days: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ngày được thu hoạch</label>
                    <div className="form-input" style={{ background: '#f9fafb', display: 'flex', alignItems: 'center' }}>
                      {form.date_applied && form.phi_days >= 0
                        ? formatDate(new Date(new Date(form.date_applied).getTime() + form.phi_days * 86400000).toISOString().split('T')[0])
                        : '—'}
                    </div>
                  </div>
                </div>

                {/* 4 Đúng Checklist */}
                <div className="form-group">
                  <label className="form-label">Danh mục kiểm tra "4 Đúng" (SÁCH tr.154)</label>
                  <div className="checkbox-group">
                    {[
                      { key: 'is_correct_drug', label: '✅ Đúng thuốc' },
                      { key: 'is_correct_time', label: '⏰ Đúng lúc' },
                      { key: 'is_correct_dose', label: '💊 Đúng liều' },
                      { key: 'is_correct_technique', label: '🔧 Đúng kỹ thuật' },
                    ].map(item => (
                      <label key={item.key} className={`checkbox-item ${form[item.key] ? 'checked' : ''}`}>
                        <input type="checkbox" checked={form[item.key]} onChange={e => setForm({...form, [item.key]: e.target.checked})} />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ghi chú kỹ thuật</label>
                  <textarea className="form-textarea" value={form.technique_notes} onChange={e => setForm({...form, technique_notes: e.target.value})} rows={2} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu & Khóa PHI</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
