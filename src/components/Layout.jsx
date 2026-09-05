import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, Sprout, Recycle, ClipboardList, ShieldAlert,
  Package, ShoppingCart, Menu, X, ChevronRight, HardDrive
} from 'lucide-react'
import { resetAllInventoryAndCloud } from '../hooks/useInventory'
import BackupModal from './BackupModal'
import { saveDailySnapshot } from '../lib/backupManager'

const navItems = [
  { to: '/', label: 'Trang chủ', icon: Home, section: null },
  { to: '/plots', label: 'Lô & Cây trồng', icon: Sprout, section: 'Quản lý vườn' },
  { to: '/circular', label: 'Tuần hoàn', icon: Recycle, section: 'Quản lý vườn' },
  { to: '/tasks', label: 'Lịch tác nghiệp', icon: ClipboardList, section: 'Vận hành' },
  { to: '/pest', label: 'BVTV & Dịch hại', icon: ShieldAlert, section: 'Vận hành' },
  { to: '/inventory', label: 'Kho & Tài chính', icon: Package, section: 'Vận hành' },
  { to: '/sales', label: 'Bán hàng', icon: ShoppingCart, section: 'Kinh doanh' },
]

const bottomNavItems = [
  { to: '/', label: 'Trang chủ', icon: Home },
  { to: '/plots', label: 'Vườn', icon: Sprout },
  { to: '/tasks', label: 'Việc', icon: ClipboardList },
  { to: '/sales', label: 'Bán hàng', icon: ShoppingCart },
  { to: '/inventory', label: 'Kho', icon: Package },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  const location = useLocation()

  // Group nav items by section
  let lastSection = null

  const getPageTitle = () => {
    const item = navItems.find(n => {
      if (n.to === '/') return location.pathname === '/'
      return location.pathname.startsWith(n.to)
    })
    return item?.label || 'Vườn Nha Đam'
  }

  return (
    <div className="app-layout">
      {/* Backup & Restore Center Modal */}
      <BackupModal isOpen={backupOpen} onClose={() => setBackupOpen(false)} />

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="modal-overlay"
          style={{ zIndex: 99, background: 'rgba(0,0,0,0.3)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <div>
            <h1>Vườn Nha Đam</h1>
            <p>Quản trị tuần hoàn</p>
          </div>
          <button
            className="btn-ghost btn-icon"
            style={{ marginLeft: 'auto', color: 'white', display: sidebarOpen ? 'flex' : 'none' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const showSection = item.section && item.section !== lastSection
            if (item.section) lastSection = item.section

            return (
              <div key={item.to}>
                {showSection && (
                  <div className="sidebar-section-label">{item.section}</div>
                )}
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                  <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.3 }} />
                </NavLink>
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="menu-toggle btn-ghost btn-icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div>
              <div className="header-title">{getPageTitle()}</div>
            </div>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="btn btn-sm"
              onClick={() => setBackupOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #059669, #10b981)',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
              }}
              title="Mở Trung Tâm Sao Lưu & Phục Hồi Dữ Liệu"
            >
              <HardDrive size={14} />
              <span>💾 Sao lưu / Phục hồi</span>
            </button>

            <span className="badge badge-primary" style={{ fontSize: 11, padding: '3px 8px', background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }} title="Phiên bản dữ liệu thực tế mới nhất">
              ✨ v5.0 (Dữ liệu thực tế)
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: '#ecfdf5',
              border: '1px solid #10b981',
              color: '#047857',
              fontSize: '12px',
              fontWeight: 600
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span>☁️ Cloud Đã Kết Nối</span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={async () => {
                if (confirm('🧹 Bạn có chắc muốn XÓA SẠCH TOÀN BỘ dữ liệu test để bắt đầu nhập dữ liệu mới từ đầu không?')) {
                  saveDailySnapshot()
                  await resetAllInventoryAndCloud()
                }
              }}
              style={{ fontSize: 12, color: 'var(--color-danger)', border: '1px dashed var(--color-danger)', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}
              title="Xóa toàn bộ dữ liệu mẫu/test và đưa ứng dụng về trạng thái mới tinh (Đã tự động snapshot bảo vệ)"
            >
              🧹 Xóa sạch test
            </button>
            <div style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '14px'
            }}>
              T
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content fade-in">
          {children}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {bottomNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `bottom-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={24} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
