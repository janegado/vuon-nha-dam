import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlots, useCrops } from '../../hooks/usePlots'
import { useTasks } from '../../hooks/useTasks'
import { STAGES, STAGE_ICONS } from '../../hooks/useCultivationStages'
import { Plus, Trash2, Edit, MapPin, Leaf, X, ChevronRight, Check, Calendar, Bell } from 'lucide-react'

const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : ''
const today = new Date().toISOString().split('T')[0]

export default function PlotsPage() {
  const navigate = useNavigate()
  const { plots, loading, addPlot, updatePlot, deletePlot } = usePlots()
  const { crops, addCrop, deleteCrop } = useCrops()
  const { tasks } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [editingPlot, setEditingPlot] = useState(null)
  const [showCropForm, setShowCropForm] = useState(false)
  const [cropFormPlotId, setCropFormPlotId] = useState(null)

  const [form, setForm] = useState({
    name: '', area_m2: '', soil_ph: '', soil_type: '', status: 'Đang canh tác',
    area_coord_code: '', cultivation_history: '', last_soil_treatment_date: '',
    cultivation_stage: 'Làm đất'
  })

  const [cropForm, setCropForm] = useState({
    plant_type: 'Nha đam', plant_date: today,
    density: '25cm x 30cm', stage: 'Kiến thiết cơ bản', seed_source: ''
  })

  const resetForm = () => {
    setForm({ name: '', area_m2: '', soil_ph: '', soil_type: '', status: 'Đang canh tác', area_coord_code: '', cultivation_history: '', last_soil_treatment_date: '', cultivation_stage: 'Làm đất' })
    setEditingPlot(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingPlot) {
      await updatePlot(editingPlot.plot_id, form)
    } else {
      await addPlot(form)
    }
    resetForm()
  }

  const handleEdit = (plot, e) => {
    e.stopPropagation()
    setForm({
      name: plot.name || '', area_m2: plot.area_m2 || '', soil_ph: plot.soil_ph || '',
      soil_type: plot.soil_type || '', status: plot.status || 'Đang canh tác',
      area_coord_code: plot.area_coord_code || '', cultivation_history: plot.cultivation_history || '',
      last_soil_treatment_date: plot.last_soil_treatment_date || '',
      cultivation_stage: plot.cultivation_stage || 'Làm đất'
    })
    setEditingPlot(plot)
    setShowForm(true)
  }

  const handleAddCrop = async (e) => {
    e.preventDefault()
    await addCrop({ ...cropForm, plot_id: cropFormPlotId })
    setCropForm({ plant_type: 'Nha đam', plant_date: today, density: '25cm x 30cm', stage: 'Kiến thiết cơ bản', seed_source: '' })
    setShowCropForm(false)
  }

  const plotCrops = (plotId) => crops.filter(c => String(c.plot_id) === String(plotId))

  const stageColor = (stage) => {
    if (stage === 'Chăm sóc') return 'badge-success'
    if (stage === 'Thu hoạch') return 'badge-warning'
    if (stage === 'Trồng cây') return 'badge-info'
    return 'badge-neutral'
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🌱 Lô & Cây trồng</h1>
          <p className="page-description">Quy trình canh tác 5 giai đoạn & Lịch tác nghiệp tự động cho từng lô</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>
          <Plus size={18} /> Thêm lô mới
        </button>
      </div>

      {/* Plot Cards */}
      <div className="grid-2">
        {plots.map(plot => {
          const stage = plot.cultivation_stage || 'Làm đất'
          const stageIdx = STAGES.indexOf(stage)
          const cList = plotCrops(plot.plot_id)
          const mainCrop = cList[0] || null
          const pDate = mainCrop?.plant_date
          const ageDays = pDate ? Math.max(0, Math.floor((new Date() - new Date(pDate)) / 86400000)) : null

          const isTaskDone = (t) => {
            if (!t) return false
            const s = String(t.status || '').toLowerCase().trim()
            return s === 'đã hoàn thành' || s === 'hoàn thành' || s === 'đã làm' || s === 'completed' || s === 'done' || !!t.completed_at
          }

          // Việc nhắc nhở kế tiếp cho lô này (chỉ lấy các việc CHƯA làm)
          const nextTask = (tasks || [])
            .filter(t => String(t.plot_id) === String(plot.plot_id) && !isTaskDone(t))
            .sort((a, b) => (a.execute_date || '').localeCompare(b.execute_date || ''))[0]

          const isNextTaskToday = nextTask?.execute_date === today
          const isNextTaskOverdue = nextTask && nextTask.execute_date < today

          return (
            <div
              key={plot.plot_id}
              className="card"
              style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              onClick={() => navigate(`/plots/${plot.plot_id}`)}
            >
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div className="stat-icon green" style={{ width: 40, height: 40, flexShrink: 0 }}><MapPin size={20} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{plot.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {plot.area_m2 ? `${plot.area_m2} m²` : ''} {plot.area_coord_code ? `· ${plot.area_coord_code}` : ''}
                      {ageDays !== null ? ` · ⏳ Cây ${ageDays} ngày tuổi` : ''}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                  <span className={`badge ${stageColor(stage)}`}>
                    {STAGE_ICONS[stage]} {stage}
                  </span>
                </div>
              </div>

              <div className="card-body">
                {/* Mini stage pipeline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                  {STAGES.map((s, idx) => {
                    const isDone = idx < stageIdx
                    const isActive = idx === stageIdx
                    return (
                      <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700,
                          background: isDone ? 'var(--color-primary)' : isActive ? 'var(--color-primary-100)' : 'var(--color-border-light)',
                          color: isDone ? 'white' : isActive ? 'var(--color-primary-800)' : 'var(--color-text-light)',
                          border: isActive ? '2px solid var(--color-primary)' : 'none'
                        }}>
                          {isDone ? <Check size={11} /> : <span style={{ fontSize: 11 }}>{STAGE_ICONS[s]}</span>}
                        </div>
                        {idx < STAGES.length - 1 && (
                          <div style={{
                            flex: 1, height: 2,
                            background: isDone ? 'var(--color-primary)' : 'var(--color-border-light)'
                          }} />
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Nhắc nhở việc kế tiếp của Lô */}
                {nextTask ? (
                  <div style={{
                    background: isNextTaskOverdue ? '#fef2f2' : isNextTaskToday ? '#f0fdf4' : '#f8fafc',
                    border: isNextTaskOverdue ? '1px solid #fca5a5' : isNextTaskToday ? '1px solid #86efac' : '1px solid #e2e8f0',
                    padding: '8px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    marginBottom: 12
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, color: isNextTaskOverdue ? '#dc2626' : isNextTaskToday ? '#166534' : '#475569' }}>
                        🔔 Việc kế tiếp {isNextTaskToday ? '(Hôm nay)' : isNextTaskOverdue ? '(Quá hạn)' : `(${formatDate(nextTask.execute_date)})`}:
                      </span>
                      {nextTask.stage_milestone && (
                        <span style={{ fontSize: 10, background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>
                          {nextTask.stage_milestone}
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#1e293b', fontWeight: 600 }}>
                      {nextTask.task_name}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12, fontStyle: 'italic' }}>
                    ⚡ Đã hoàn tất các mốc tác nghiệp hiện tại
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Leaf size={16} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      {cList.length > 0 ? `${mainCrop?.plant_count || 0} cây trồng` : 'Chưa xuống giống'}
                      {pDate ? ` · Từ ${formatDate(pDate)}` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={(e) => handleEdit(plot, e)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger)' }} onClick={(e) => { e.stopPropagation(); if(confirm('Xóa lô này?')) deletePlot(plot.plot_id) }}>
                      <Trash2 size={16} />
                    </button>
                    <ChevronRight size={18} style={{ color: 'var(--color-text-light)' }} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {plots.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🌱</div>
          <h3>Chưa có lô vườn nào</h3>
          <p>Thêm lô vườn đầu tiên để bắt đầu quản lý</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> Thêm lô mới
          </button>
        </div>
      )}

      {/* Plot Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingPlot ? 'Sửa lô vườn' : 'Thêm lô mới'}</h2>
              <button className="btn btn-ghost btn-icon" onClick={resetForm}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Tên lô <span className="form-required">*</span></label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Lô A - Phía Đông" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Diện tích (m²)</label>
                    <input className="form-input" type="number" step="0.1" value={form.area_m2} onChange={e => setForm({...form, area_m2: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mã khu vực</label>
                    <input className="form-input" value={form.area_coord_code} onChange={e => setForm({...form, area_coord_code: e.target.value})} placeholder="VD: A1" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">pH đất</label>
                    <input className="form-input" type="number" step="0.1" min="0" max="14" value={form.soil_ph} onChange={e => setForm({...form, soil_ph: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Loại đất</label>
                    <select className="form-select" value={form.soil_type} onChange={e => setForm({...form, soil_type: e.target.value})}>
                      <option value="">Chọn...</option>
                      <option>Thịt nhẹ</option>
                      <option>Thịt pha cát</option>
                      <option>Cát pha</option>
                      <option>Sét pha</option>
                      <option>Khác</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select className="form-select" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option>Đang canh tác</option>
                      <option>Chuẩn bị</option>
                      <option>Nghỉ</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Giai đoạn canh tác</label>
                    <select className="form-select" value={form.cultivation_stage} onChange={e => setForm({...form, cultivation_stage: e.target.value})}>
                      {STAGES.map(s => <option key={s} value={s}>{STAGE_ICONS[s]} {s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày bón vôi/cày phơi ải gần nhất</label>
                  <input className="form-input" type="date" value={form.last_soil_treatment_date} onChange={e => setForm({...form, last_soil_treatment_date: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Lịch sử canh tác</label>
                  <textarea className="form-textarea" value={form.cultivation_history} onChange={e => setForm({...form, cultivation_history: e.target.value})} placeholder="Ghi chú về lịch sử canh tác..." rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingPlot ? 'Cập nhật' : 'Thêm lô'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Crop Form Modal */}
      {showCropForm && (
        <div className="modal-overlay" onClick={() => setShowCropForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm cây trồng</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCropForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCrop}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Loại cây</label>
                  <input className="form-input" value={cropForm.plant_type} onChange={e => setCropForm({...cropForm, plant_type: e.target.value})} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày xuống giống</label>
                    <input className="form-input" type="date" value={cropForm.plant_date} onChange={e => setCropForm({...cropForm, plant_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mật độ</label>
                    <input className="form-input" value={cropForm.density} onChange={e => setCropForm({...cropForm, density: e.target.value})} />
                    <span className="form-hint">Mặc định theo SÁCH: 25cm x 30cm</span>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Giai đoạn</label>
                    <select className="form-select" value={cropForm.stage} onChange={e => setCropForm({...cropForm, stage: e.target.value})}>
                      <option>Kiến thiết cơ bản</option>
                      <option>Kinh doanh</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nguồn giống</label>
                    <input className="form-input" value={cropForm.seed_source} onChange={e => setCropForm({...cropForm, seed_source: e.target.value})} placeholder="VD: Ninh Thuận" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCropForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Thêm cây</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
