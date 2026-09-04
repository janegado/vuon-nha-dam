import { useState } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { usePlots } from '../../hooks/usePlots'
import {
  Plus, Check, Trash2, X, Calendar, Filter,
  Download, FileSpreadsheet, FileText, CheckCircle,
  Bell, Clock, Sparkles, ChevronRight, AlertCircle
} from 'lucide-react'
import * as XLSX from 'xlsx'

const today = new Date().toISOString().split('T')[0]
// Ngày đầu tháng hiện tại
const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

const TASK_TYPES = [
  'Tưới', 'Bón phân', 'Làm cỏ', 'Tỉa lá', 'Xịt thuốc', 'Thu hoạch',
  'Gieo giống', 'Làm đất & Lên luống', 'Bón lót & Tro trấu', 'Nhân vi sinh / IMO', 'Khác'
]

const TASK_TYPE_ICONS = {
  'Tưới': '💧',
  'Bón phân': '🌱',
  'Làm cỏ': '🌿',
  'Tỉa lá': '✂️',
  'Xịt thuốc': '🐛',
  'Thu hoạch': '📦',
  'Gieo giống': '🌾',
  'Làm đất & Lên luống': '🚜',
  'Bón lót & Tro trấu': '🪨',
  'Nhân vi sinh / IMO': '🧪',
  'Khác': '📋'
}

export default function TasksPage() {
  const [filterDate, setFilterDate] = useState(today)
  const [filterStatus, setFilterStatus] = useState('all')
  const { tasks, loading, addTask, addProcessTasks, snoozeTask, toggleTask, deleteTask } = useTasks()
  const { plots } = usePlots()
  const [showForm, setShowForm] = useState(false)
  const [showQuickProcessModal, setShowQuickProcessModal] = useState(false)

  // Modal Xuất Báo Cáo Excel
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportStartDate, setExportStartDate] = useState(firstDayOfMonth)
  const [exportEndDate, setExportEndDate] = useState(today)
  const [exportPlotId, setExportPlotId] = useState('all')
  const [exportTaskType, setExportTaskType] = useState('all')
  const [exportSuccessMsg, setExportSuccessMsg] = useState('')

  const [form, setForm] = useState({
    plot_id: '', task_name: '', task_type: 'Tưới', execute_date: today,
    notes: '', harvest_qty_kg: '', harvest_leaves: ''
  })

  const getPlotName = (plotId) => plots.find(p => p.plot_id === plotId)?.name || 'Toàn vườn / Khu ủ & chế biến'

  // Lấy các lời nhắc quy trình tự động chưa xong
  const pendingAutoReminders = tasks.filter(t => t.is_auto_reminder && t.status !== 'Đã hoàn thành')

  const filteredTasks = tasks.filter(t => {
    if (filterDate && t.execute_date !== filterDate) return false
    if (filterStatus === 'done' && t.status !== 'Đã hoàn thành') return false
    if (filterStatus === 'pending' && t.status !== 'Chờ làm') return false
    return true
  })

  const pendingCount = tasks.filter(t => t.execute_date === filterDate && t.status !== 'Đã hoàn thành').length
  const doneCount = tasks.filter(t => t.execute_date === filterDate && t.status === 'Đã hoàn thành').length

  // Danh sách công việc theo bộ lọc xuất báo cáo
  const tasksToExport = tasks.filter(t => {
    if (exportStartDate && t.execute_date < exportStartDate) return false
    if (exportEndDate && t.execute_date > exportEndDate) return false
    if (exportPlotId !== 'all' && t.plot_id !== exportPlotId) return false
    if (exportTaskType !== 'all' && t.task_type !== exportTaskType) return false
    return true
  }).sort((a, b) => (a.execute_date || '').localeCompare(b.execute_date || ''))

  // Khởi chạy nhanh chuỗi quy trình mẫu
  const handleTriggerQuickProcess = async (processType, label) => {
    await addProcessTasks(processType, label, today)
    setShowQuickProcessModal(false)
    alert(`✅ Đã lập thành công chuỗi lịch nhắc nhở tự động cho "${label}"!`)
  }

  // Xuất file Excel (.xlsx) chuẩn
  const handleExportExcel = () => {
    if (tasksToExport.length === 0) {
      alert('Không có dữ liệu công việc nào trong khoảng thời gian đã chọn!')
      return
    }

    const exportRows = tasksToExport.map((t, idx) => ({
      'STT': idx + 1,
      'Ngày thực hiện': t.execute_date || '',
      'Lô vườn': getPlotName(t.plot_id),
      'Loại công việc': t.task_type || '',
      'Tên công việc / Hoạt động': t.task_name || '',
      'Sản lượng thu hoạch (kg)': t.harvest_qty_kg || '',
      'Số lá thu hoạch': t.harvest_leaves || '',
      'Người thực hiện': t.worker_id || 'Thuý',
      'Trạng thái': t.status || 'Chờ làm',
      'Thời gian hoàn thành': t.completed_at ? new Date(t.completed_at).toLocaleString('vi-VN') : '',
      'Ghi chú': t.notes || ''
    }))

    const worksheet = XLSX.utils.json_to_sheet(exportRows)

    // Đặt độ rộng các cột cho đẹp
    worksheet['!cols'] = [
      { wch: 6 },  // STT
      { wch: 14 }, // Ngày thực hiện
      { wch: 20 }, // Lô vườn
      { wch: 16 }, // Loại công việc
      { wch: 32 }, // Tên công việc
      { wch: 22 }, // Sản lượng (kg)
      { wch: 16 }, // Số lá
      { wch: 16 }, // Người thực hiện
      { wch: 16 }, // Trạng thái
      { wch: 22 }, // Thời gian hoàn thành
      { wch: 30 }, // Ghi chú
    ]

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhat_Ky_Cong_Viec')

    const filename = `Nhat_Ky_Cong_Viec_Vuon_Nha_Dam_${exportStartDate}_den_${exportEndDate}.xlsx`
    XLSX.writeFile(workbook, filename)

    setExportSuccessMsg(`✅ Đã xuất thành công ${tasksToExport.length} dòng dữ liệu sang file Excel!`)
    setTimeout(() => setExportSuccessMsg(''), 4000)
  }

  // Xuất file CSV (UTF-8 có BOM)
  const handleExportCSV = () => {
    if (tasksToExport.length === 0) {
      alert('Không có dữ liệu công việc nào trong khoảng thời gian đã chọn!')
      return
    }

    const headers = ['STT', 'Ngay_thuc_hien', 'Lo_vuon', 'Loai_cong_viec', 'Ten_cong_viec', 'Thu_hoach_kg', 'So_la', 'Nguoi_lam', 'Trang_thai', 'Ghi_chu']
    const rows = tasksToExport.map((t, idx) => [
      idx + 1,
      `"${t.execute_date || ''}"`,
      `"${getPlotName(t.plot_id)}"`,
      `"${t.task_type || ''}"`,
      `"${(t.task_name || '').replace(/"/g, '""')}"`,
      `"${t.harvest_qty_kg || ''}"`,
      `"${t.harvest_leaves || ''}"`,
      `"${t.worker_id || 'Thuý'}"`,
      `"${t.status || ''}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Nhat_Ky_Cong_Viec_${exportStartDate}_den_${exportEndDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setExportSuccessMsg(`✅ Đã tải file CSV (${tasksToExport.length} dòng)!`)
    setTimeout(() => setExportSuccessMsg(''), 4000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const plotName = plots.find(p => p.plot_id === form.plot_id)?.name || ''
    const taskName = form.task_name || `${form.task_type} ${plotName}`
    await addTask({ ...form, task_name: taskName, worker_id: 'Thuý' })
    setForm({ plot_id: '', task_name: '', task_type: 'Tưới', execute_date: today, notes: '', harvest_qty_kg: '', harvest_leaves: '' })
    setShowForm(false)
  }

  if (loading) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Lịch Tác Nghiệp</h1>
          <p className="page-description">Quy trình vận hành thực địa, nhật ký canh tác & nhắc việc tự động</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setShowQuickProcessModal(true)} style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
            <Sparkles size={18} /> ✨ Lên lịch quy trình
          </button>
          <button className="btn btn-secondary" onClick={() => setShowExportModal(true)}>
            <Download size={18} /> 📥 Xuất báo cáo
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={18} /> + Thêm việc
          </button>
        </div>
      </div>

      {/* NHẮC VIỆC QUY TRÌNH TỰ ĐỘNG (IMO4, TRO TRẤU, LÀM ĐẤT) */}
      {pendingAutoReminders.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          border: '1px solid #86efac',
          borderRadius: 12,
          padding: '16px 20px',
          marginBottom: 20,
          boxShadow: '0 2px 8px rgba(22, 101, 52, 0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#166534', margin: 0 }}>
                Nhắc nhở công việc tiếp theo theo quy trình ({pendingAutoReminders.length} việc)
              </h3>
            </div>
            <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600, background: '#dcfce7', padding: '3px 10px', borderRadius: 20 }}>
              ⚡ Tự động sinh từ nhật ký kho & thao tác
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {pendingAutoReminders.map(rem => {
              const isToday = rem.execute_date === today
              const isOverdue = rem.execute_date < today
              return (
                <div key={rem.task_id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: isOverdue ? '1px solid #fca5a5' : isToday ? '1px solid #86efac' : '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '10px 14px',
                  gap: 12,
                  flexWrap: 'wrap'
                }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="badge" style={{
                        background: '#dbeafe',
                        color: '#1e40af',
                        fontSize: 11,
                        padding: '2px 8px'
                      }}>
                        {rem.reminder_tag || 'Quy trình'}
                      </span>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: isOverdue ? '#dc2626' : isToday ? '#16a34a' : '#64748b'
                      }}>
                        📅 {rem.execute_date} {isToday ? '(Hôm nay)' : isOverdue ? '(Quá hạn)' : ''}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14, marginTop: 4 }}>
                      {rem.task_name}
                    </div>
                    {rem.notes && (
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        💡 {rem.notes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => toggleTask(rem.task_id)}
                      style={{ background: '#16a34a', borderColor: '#16a34a', padding: '6px 12px', fontSize: 13 }}
                      title="Đánh dấu hoàn thành"
                    >
                      <Check size={14} /> Xong
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => snoozeTask(rem.task_id, 1)}
                      style={{ padding: '6px 10px', fontSize: 13 }}
                      title="Hoãn lại 1 ngày"
                    >
                      <Clock size={14} /> +1 ngày
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} style={{ color: 'var(--color-text-secondary)' }} />
          <input type="date" className="form-input" style={{ width: 'auto', minHeight: 40 }} value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatus('all')}>
            Tất cả ({filteredTasks.length})
          </button>
          <button className={`btn btn-sm ${filterStatus === 'pending' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatus('pending')}>
            Chờ làm ({pendingCount})
          </button>
          <button className={`btn btn-sm ${filterStatus === 'done' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilterStatus('done')}>
            Đã xong ({doneCount})
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {tasks.filter(t => t.execute_date === filterDate).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
            <span style={{ fontWeight: 600 }}>Tiến độ ngày {filterDate}</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>{doneCount}/{doneCount + pendingCount}</span>
          </div>
          <div style={{ height: 8, background: 'var(--color-border-light)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4, transition: 'width 0.5s ease',
              width: `${(doneCount + pendingCount) > 0 ? (doneCount / (doneCount + pendingCount)) * 100 : 0}%`,
              background: doneCount === doneCount + pendingCount ? 'var(--color-success)' : 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))'
            }} />
          </div>
        </div>
      )}

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Không có việc nào trong ngày {filterDate}</h3>
          <p>Thêm việc mới, kích hoạt chuỗi quy trình hoặc chọn ngày khác</p>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map(task => (
            <div key={task.task_id} className={`task-card ${task.status === 'Đã hoàn thành' ? 'completed' : ''}`}>
              <div className="task-check" onClick={() => toggleTask(task.task_id)}>
                {task.status === 'Đã hoàn thành' && <Check size={16} />}
              </div>
              <div className="task-info" onClick={() => toggleTask(task.task_id)}>
                <div className="task-name" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  {task.task_name}
                  {task.is_auto_reminder && (
                    <span className="badge" style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', fontWeight: 600 }}>
                      ⚡ Nhắc tự động
                    </span>
                  )}
                </div>
                <div className="task-meta">
                  {TASK_TYPE_ICONS[task.task_type] || '📋'} {task.task_type} · {getPlotName(task.plot_id)}
                  {task.harvest_qty_kg && ` · ${task.harvest_qty_kg} kg`}
                  {task.harvest_leaves && ` · ${task.harvest_leaves} lá`}
                  {task.notes && ` · 💡 ${task.notes}`}
                  {task.completed_at && ` · ✅ ${new Date(task.completed_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`}
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => { if(confirm('Xóa việc này?')) deleteTask(task.task_id) }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* === MODAL LÊN LỊCH QUY TRÌNH MẪU === */}
      {showQuickProcessModal && (
        <div className="modal-overlay" onClick={() => setShowQuickProcessModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h2>✨ Khởi Chạy Chuỗi Quy Trình Tác Nghiệp Tự Động</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowQuickProcessModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                Chọn một quy trình kỹ thuật để hệ thống tự động thiết lập các bước tác nghiệp và phát thông báo nhắc nhở chuẩn theo từng mốc thời gian:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #86efac',
                    borderRadius: 10,
                    background: '#f0fdf4',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleTriggerQuickProcess('IMO4', 'Quy trình nhân men IMO4 (5 ngày)')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#166534', fontSize: 15 }}>
                      🧪 Quy trình nhân vi sinh IMO4 (3 bước / 5 ngày)
                    </div>
                    <ChevronRight size={18} color="#166534" />
                  </div>
                  <div style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>
                    • N+1: Đo nhiệt độ & độ ẩm (50-60°C) <br />
                    • N+3: Đảo mẻ ủ & kiểm tra khuẩn ty men trắng <br />
                    • N+5: Thu hoạch sinh khối men IMO4
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #fed7aa',
                    borderRadius: 10,
                    background: '#fff7ed',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleTriggerQuickProcess('DOT_TRAU', 'Quy trình đốt tro trấu & chuẩn bị bón lót')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#9a3412', fontSize: 15 }}>
                      🔥 Đốt tro trấu & Chuẩn bị phối trộn bón lót
                    </div>
                    <ChevronRight size={18} color="#9a3412" />
                  </div>
                  <div style={{ fontSize: 12, color: '#c2410c', marginTop: 4 }}>
                    • N+1: Trộn Tro trấu hun với Phân trùn quế + Nấm đối kháng Trichoderma bón lót luống
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #bae6fd',
                    borderRadius: 10,
                    background: '#f0f9ff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleTriggerQuickProcess('LAM_DAT', 'Quy trình làm đất, lên luống & ủ đất')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#0369a1', fontSize: 15 }}>
                      🚜 Làm đất, lên luống & Ủ đất trước khi trồng
                    </div>
                    <ChevronRight size={18} color="#0369a1" />
                  </div>
                  <div style={{ fontSize: 12, color: '#0284c7', marginTop: 4 }}>
                    • N+2: Bón lót hữu cơ & tưới vi sinh IMO dưỡng luống 3 ngày trước khi hạ giống con
                  </div>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    border: '1px solid #e9d5ff',
                    borderRadius: 10,
                    background: '#faf5ff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleTriggerQuickProcess('EM_GOC', 'Quy trình ủ chế phẩm EM thứ cấp')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#6b21a8', fontSize: 15 }}>
                      🧫 Ủ thứ cấp EM gốc với Mật rỉ đường (7 ngày)
                    </div>
                    <ChevronRight size={18} color="#6b21a8" />
                  </div>
                  <div style={{ fontSize: 12, color: '#7e22ce', marginTop: 4 }}>
                    • N+7: Kiểm tra mùi men thơm, xả khí ga định kỳ và sang can bảo quản
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowQuickProcessModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* === MODAL XUẤT BÁO CÁO EXCEL === */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2>📥 Xuất Báo Cáo Nhật Ký Công Việc</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowExportModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
                Chọn khoảng ngày và lô vườn cần xuất file Excel để lưu trữ, theo dõi nội bộ hoặc đối chiếu hồ sơ canh tác.
              </p>

              {exportSuccessMsg && (
                <div className="alert alert-success" style={{ marginBottom: 12 }}>
                  <CheckCircle size={18} />
                  <div>{exportSuccessMsg}</div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Từ ngày:</label>
                  <input
                    className="form-input"
                    type="date"
                    value={exportStartDate}
                    onChange={e => setExportStartDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Đến ngày:</label>
                  <input
                    className="form-input"
                    type="date"
                    value={exportEndDate}
                    onChange={e => setExportEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Lọc theo Lô vườn:</label>
                  <select
                    className="form-select"
                    value={exportPlotId}
                    onChange={e => setExportPlotId(e.target.value)}
                  >
                    <option value="all">🌳 Tất cả các lô</option>
                    {plots.map(p => <option key={p.plot_id} value={p.plot_id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lọc theo Loại việc:</label>
                  <select
                    className="form-select"
                    value={exportTaskType}
                    onChange={e => setExportTaskType(e.target.value)}
                  >
                    <option value="all">📋 Tất cả công việc</option>
                    {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Thông tin kết quả tìm kiếm */}
              <div style={{
                background: 'var(--color-primary-50)',
                border: '1px solid var(--color-primary-200)',
                borderRadius: 10,
                padding: '12px 16px',
                marginTop: 8,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary-900)' }}>
                    Số lượng công việc phù hợp:
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-primary-700)' }}>
                    {tasksToExport.length} việc
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                  (Từ {exportStartDate} đến {exportEndDate})
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExportExcel}
                  style={{ width: '100%', padding: '12px', fontSize: 15, fontWeight: 700 }}
                >
                  <FileSpreadsheet size={18} /> 📥 Tải file Excel (.xlsx)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleExportCSV}
                  style={{ width: '100%', padding: '10px', fontSize: 14 }}
                >
                  <FileText size={16} /> Tải file CSV (Dự phòng điện thoại)
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setShowExportModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm việc tác nghiệp mới</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Lô vườn / Khu vực <span className="form-required">*</span></label>
                  <select className="form-select" value={form.plot_id} onChange={e => setForm({...form, plot_id: e.target.value})} required>
                    <option value="">Chọn khu vực...</option>
                    <option value="global">🏢 Toàn vườn / Nhà ủ phân & vi sinh</option>
                    {plots.map(p => <option key={p.plot_id} value={p.plot_id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Loại việc</label>
                  <div className="checkbox-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                    {TASK_TYPES.map(type => (
                      <label key={type} className={`checkbox-item ${form.task_type === type ? 'checked' : ''}`} style={{ margin: 0 }}>
                        <input type="radio" name="task_type" checked={form.task_type === type} onChange={() => setForm({...form, task_type: type})} style={{ display: 'none' }} />
                        {TASK_TYPE_ICONS[type]} {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ngày thực hiện</label>
                    <input className="form-input" type="date" value={form.execute_date} onChange={e => setForm({...form, execute_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tên việc (tùy chọn)</label>
                    <input className="form-input" value={form.task_name} onChange={e => setForm({...form, task_name: e.target.value})} placeholder="Để trống = tự tạo tên" />
                  </div>
                </div>

                {form.task_type === 'Thu hoạch' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Số kg</label>
                      <input className="form-input" type="number" step="0.1" value={form.harvest_qty_kg} onChange={e => setForm({...form, harvest_qty_kg: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số lá</label>
                      <input className="form-input" type="number" value={form.harvest_leaves} onChange={e => setForm({...form, harvest_leaves: e.target.value})} />
                      <span className="form-hint">Theo SÁCH: mỗi cây 1–2 lá/đợt</span>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Ghi chú & Hướng dẫn kỹ thuật</label>
                  <textarea className="form-textarea" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="Ví dụ: Rải đều 2 bao tro trấu + tưới ẩm nước vi sinh..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Thêm việc</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

