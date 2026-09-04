import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isConnected } from '../lib/supabase'
import { usePlots } from '../hooks/usePlots'
import { useTasks } from '../hooks/useTasks'
import { useProducts, useOrders } from '../hooks/useSales'
import { useCompostBatches, useChemicalLogs } from '../hooks/useInventory'
import {
  Sprout, ClipboardList, ShoppingCart, Droplets, Scissors,
  Bug, Package, Recycle, AlertTriangle, Check, TrendingUp,
  Calendar, Leaf
} from 'lucide-react'

const today = new Date().toISOString().split('T')[0]
const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })

export default function Dashboard() {
  const navigate = useNavigate()
  const { plots } = usePlots()
  const { tasks, toggleTask } = useTasks(today)
  const { products } = useProducts()
  const { orders } = useOrders()
  const { batches } = useCompostBatches()
  const { logs } = useChemicalLogs()

  const todayTasks = tasks.filter(t => t.execute_date === today)
  const doneTasks = todayTasks.filter(t => t.status === 'Đã hoàn thành')
  const pendingTasks = todayTasks.filter(t => t.status !== 'Đã hoàn thành')

  const lowStockProducts = products.filter(p => p.qty_in_stock <= 5)
  const activeBatches = batches.filter(b => b.status === 'Đang ủ')
  const todayOrders = orders.filter(o => o.order_date === today)
  const debtOrders = orders.filter(o => o.payment_status === 'Còn nợ')

  // PHI warnings
  const phiWarnings = logs.filter(l => l.harvest_allowed_date > today)

  // Batches needing check today
  const batchesNeedCheck = activeBatches.filter(b => b.next_check_date && b.next_check_date <= today)

  // Process reminders due today or overdue
  const processRemindersToday = tasks.filter(t => t.is_auto_reminder && t.status !== 'Đã hoàn thành')

  const taskTypeIcon = (type) => {
    const icons = {
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
    return icons[type] || '📋'
  }

  return (
    <div>
      {/* Connection Warning */}
      {!isConnected() && (
        <div className="connection-warning">
          <h3>⚡ Chế độ Demo</h3>
          <p>Chưa kết nối Supabase. Dữ liệu hiển thị là dữ liệu mẫu.</p>
          <p style={{ marginTop: 8 }}>Tạo file <code>.env</code> với <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code></p>
        </div>
      )}

      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>🌿</span> Xin chào, chị Thuý!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Alerts */}
      {processRemindersToday.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: 16, background: '#f0fdf4', borderColor: '#86efac', color: '#166534', cursor: 'pointer' }} onClick={() => navigate('/tasks')}>
          <Sprout size={20} color="#16a34a" />
          <div style={{ flex: 1 }}>
            <strong>🔔 Nhắc việc quy trình tự động:</strong> Có <strong>{processRemindersToday.length} công việc</strong> cần thực hiện theo quy trình canh tác / ủ vi sinh IMO ({processRemindersToday[0]?.task_name}).
          </div>
          <button className="btn btn-sm btn-primary" style={{ background: '#16a34a', borderColor: '#16a34a' }}>Xem ngay</button>
        </div>
      )}

      {phiWarnings.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 16 }}>
          <AlertTriangle size={20} />
          <div>
            <strong>⚠️ Cảnh báo PHI:</strong> {phiWarnings.length} lô đang trong thời gian cách ly sau phun thuốc.
            Chưa được thu hoạch/xuất bán.
          </div>
        </div>
      )}

      {batchesNeedCheck.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          <Recycle size={20} />
          <div>
            <strong>🔄 Kiểm tra mẻ ủ:</strong> {batchesNeedCheck.length} mẻ ủ cần kiểm tra nhiệt độ hôm nay.
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/plots')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon green"><Sprout size={24} /></div>
          <div className="stat-info">
            <h3>{plots.length}</h3>
            <p>Lô vườn</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon blue"><ClipboardList size={24} /></div>
          <div className="stat-info">
            <h3>{doneTasks.length}/{todayTasks.length}</h3>
            <p>Việc hôm nay</p>
            {todayTasks.length > 0 && (
              <div className={`stat-trend ${doneTasks.length === todayTasks.length ? 'up' : ''}`}>
                {doneTasks.length === todayTasks.length ? '✅ Hoàn thành' : `${pendingTasks.length} việc chờ`}
              </div>
            )}
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/sales')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon yellow"><ShoppingCart size={24} /></div>
          <div className="stat-info">
            <h3>{todayOrders.length}</h3>
            <p>Đơn hôm nay</p>
            {debtOrders.length > 0 && (
              <div className="stat-trend down">{debtOrders.length} đơn còn nợ</div>
            )}
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/inventory')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon purple"><Package size={24} /></div>
          <div className="stat-info">
            <h3>{products.length}</h3>
            <p>Sản phẩm</p>
            {lowStockProducts.length > 0 && (
              <div className="stat-trend down">{lowStockProducts.length} sắp hết</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Thao tác nhanh</h2>
          <p className="section-subtitle">Các việc thường làm hàng ngày</p>
        </div>
      </div>
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/tasks')}>
          <div className="icon">📋</div>
          Ghi việc
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/tasks?type=harvest')}>
          <div className="icon">📦</div>
          Thu hoạch
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/pest')}>
          <div className="icon">🐛</div>
          Phun thuốc
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/sales?tab=orders&new=1')}>
          <div className="icon">🛒</div>
          Tạo đơn bán
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/circular')}>
          <div className="icon">♻️</div>
          Ghi mẻ ủ
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/inventory')}>
          <div className="icon">📊</div>
          Báo cáo
        </button>
      </div>

      {/* Today's Tasks */}
      <div className="section-header">
        <div>
          <h2 className="section-title">📋 Việc hôm nay</h2>
          <p className="section-subtitle">{formatDate(today)} — {pendingTasks.length} việc cần làm</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/tasks')}>
          Xem tất cả
        </button>
      </div>

      {todayTasks.length === 0 ? (
        <div className="empty-state" style={{ padding: 32 }}>
          <div className="empty-state-icon">🎉</div>
          <h3>Không có việc nào hôm nay</h3>
          <p>Tạo lịch tác nghiệp mới tại mục "Lịch tác nghiệp"</p>
        </div>
      ) : (
        <div className="task-list" style={{ marginBottom: 32 }}>
          {todayTasks.map(task => (
            <div
              key={task.task_id}
              className={`task-card ${task.status === 'Đã hoàn thành' ? 'completed' : ''}`}
              onClick={() => toggleTask(task.task_id)}
            >
              <div className="task-check">
                {task.status === 'Đã hoàn thành' && <Check size={16} />}
              </div>
              <div className="task-info">
                <div className="task-name">{task.task_name}</div>
                <div className="task-meta">{taskTypeIcon(task.task_type)} {task.task_type}</div>
              </div>
              <span className={`badge ${task.status === 'Đã hoàn thành' ? 'badge-success' : 'badge-warning'}`}>
                {task.status === 'Đã hoàn thành' ? 'Xong' : 'Chờ'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Active Compost Batches */}
      {activeBatches.length > 0 && (
        <>
          <div className="section-header">
            <div>
              <h2 className="section-title">♻️ Mẻ ủ đang hoạt động</h2>
              <p className="section-subtitle">{activeBatches.length} mẻ ủ</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/circular')}>
              Chi tiết
            </button>
          </div>
          <div className="grid-2" style={{ marginBottom: 32 }}>
            {activeBatches.map(batch => {
              const daysLeft = Math.max(0, Math.ceil((new Date(batch.cover_removal_date) - new Date()) / 86400000))
              const needsCheck = batch.next_check_date && batch.next_check_date <= today
              return (
                <div key={batch.batch_id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/circular')}>
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{batch.compost_type}</div>
                        <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{batch.input_mass_kg} kg</div>
                      </div>
                      {needsCheck ? (
                        <span className="badge badge-danger">⚠️ Cần kiểm tra</span>
                      ) : (
                        <span className="badge badge-success">Đang ủ</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      📅 Còn {daysLeft} ngày → dỡ bạt {formatDate(batch.cover_removal_date)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Recent Orders with Debt */}
      {debtOrders.length > 0 && (
        <>
          <div className="section-header">
            <div>
              <h2 className="section-title">💰 Công nợ cần thu</h2>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/sales?tab=debt')}>
              Xem tất cả
            </button>
          </div>
          <div className="task-list">
            {debtOrders.slice(0, 3).map(order => (
              <div key={order.order_id} className="task-card" onClick={() => navigate('/sales?tab=debt')} style={{ cursor: 'pointer' }}>
                <div className="task-info">
                  <div className="task-name">{order.customer?.name || 'Khách lẻ'}</div>
                  <div className="task-meta">
                    {formatDate(order.order_date)} · {order.channel} · Còn nợ: {(order.total_amount - order.amount_paid).toLocaleString('vi-VN')}đ
                  </div>
                </div>
                <span className="badge badge-danger">Còn nợ</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
