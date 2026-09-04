import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, Sprout, Recycle, ClipboardList, ShieldAlert,
  Package, ShoppingCart, Menu, X, ChevronRight,
  Cloud, RefreshCw, Download, Upload, CheckCircle2, AlertCircle
} from 'lucide-react'
import { isConnected } from '../lib/supabase'
import { pushLocalToCloud, pullCloudToLocal, exportBackupJSON, importBackupJSON } from '../lib/cloudSync'

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
  const [syncModalOpen, setSyncModalOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncStatusMsg, setSyncStatusMsg] = useState('')
  const fileInputRef = useRef(null)
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

  const handlePushToCloud = async () => {
    setSyncing(true)
    setSyncStatusMsg('Đang đẩy toàn bộ dữ liệu từ máy lên Cloud Supabase...')
    try {
      const res = await pushLocalToCloud()
      setSyncStatusMsg(`✅ Thành công! Đã đồng bộ ${res.plots} lô, ${res.inventory} vật tư, ${res.receipts} phiếu nhập, ${res.logs} nhật ký, ${res.tasks} việc.`)
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (err) {
      setSyncStatusMsg(`❌ Lỗi đồng bộ: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handlePullFromCloud = async () => {
    setSyncing(true)
    setSyncStatusMsg('Đang kéo dữ liệu mới nhất từ Cloud Supabase về máy...')
    try {
      const ok = await pullCloudToLocal()
      if (ok) {
        setSyncStatusMsg('✅ Đã tải dữ liệu từ Cloud về máy thành công!')
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        setSyncStatusMsg('❌ Không thể tải dữ liệu từ Cloud.')
      }
    } catch (err) {
      setSyncStatusMsg(`❌ Lỗi: ${err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const ok = importBackupJSON(event.target.result, true)
        if (ok) {
          alert('✅ Nạp dữ liệu sao lưu thành công!')
          window.location.reload()
        } else {
          alert('❌ File không đúng định dạng sao lưu!')
        }
      } catch (err) {
        alert('❌ Lỗi đọc file: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="app-layout">
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

        {/* Sync Panel in Sidebar bottom */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
          <button
            onClick={() => setSyncModalOpen(true)}
            className="btn btn-sm"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '8px',
              fontSize: '13px',
              padding: '8px 12px'
            }}
          >
            <Cloud size={16} color="#34d399" />
            <span>Đồng bộ & Sao lưu</span>
          </button>
        </div>
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
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Cloud Status Badge */}
            <button
              onClick={() => setSyncModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: isConnected() ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${isConnected() ? '#10b981' : '#f87171'}`,
                color: isConnected() ? '#047857' : '#b91c1c',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Bấm để mở Bảng điều khiển Đồng bộ & Sao lưu"
            >
              <span style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: isConnected() ? '#10b981' : '#f87171',
                display: 'inline-block'
              }}></span>
              <span>{isConnected() ? '☁️ Cloud Đã Kết Nối' : '💾 Lưu nội bộ'}</span>
            </button>

            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (confirm('🧹 Bạn có chắc muốn XÓA SẠCH TOÀN BỘ dữ liệu test để bắt đầu nhập dữ liệu mới từ đầu không?')) {
                  localStorage.clear()
                  window.location.reload()
                }
              }}
              style={{ fontSize: 12, color: 'var(--color-danger)', border: '1px dashed var(--color-danger)', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}
              title="Xóa toàn bộ dữ liệu mẫu/test và đưa ứng dụng về trạng thái mới tinh"
            >
              🧹 Xóa test
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

      {/* SYNC & BACKUP MODAL */}
      {syncModalOpen && (
        <div className="modal-overlay" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', position: 'fixed', inset: 0 }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '480px',
            width: '92%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cloud size={24} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>Đồng Bộ & Sao Lưu Dữ Liệu</h3>
              </div>
              <button
                className="btn-ghost btn-icon"
                onClick={() => setSyncModalOpen(false)}
                style={{ color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                <strong>Trạng thái:</strong> {isConnected() ? <span style={{ color: '#059669', fontWeight: 600 }}>☁️ Đã kết nối Supabase Cloud Singapore</span> : <span style={{ color: '#dc2626', fontWeight: 600 }}>Chưa kết nối Cloud</span>}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                Dữ liệu được bảo mật chuẩn doanh nghiệp và đồng bộ thời gian thực giữa Máy tính và iPhone.
              </div>
            </div>

            {syncStatusMsg && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '13px',
                background: syncStatusMsg.startsWith('❌') ? '#fef2f2' : '#f0fdf4',
                color: syncStatusMsg.startsWith('❌') ? '#991b1b' : '#166534',
                border: `1px solid ${syncStatusMsg.startsWith('❌') ? '#fca5a5' : '#86efac'}`
              }}>
                {syncStatusMsg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Nút 1: Đẩy dữ liệu hiện tại từ máy lên Cloud */}
              <button
                onClick={handlePushToCloud}
                disabled={syncing}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  fontWeight: 600,
                  fontSize: '14px',
                  borderRadius: '10px'
                }}
              >
                <RefreshCw size={18} className={syncing ? 'spin' : ''} />
                <span>⚡ Đẩy dữ liệu trên máy lên Cloud Supabase</span>
              </button>

              {/* Nút 2: Tải dữ liệu từ Cloud về máy */}
              <button
                onClick={handlePullFromCloud}
                disabled={syncing}
                className="btn btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  fontSize: '13px',
                  borderRadius: '10px',
                  borderColor: '#cbd5e1'
                }}
              >
                <Download size={16} />
                <span>📥 Kéo dữ liệu mới nhất từ Cloud về máy</span>
              </button>

              <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '8px 0' }} />

              {/* Nút 3: Tải file sao lưu JSON về máy tính */}
              <button
                onClick={exportBackupJSON}
                className="btn btn-ghost"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  fontSize: '13px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  color: '#334155'
                }}
              >
                <Download size={16} />
                <span>Tải file sao lưu về máy (.JSON)</span>
              </button>

              {/* Nút 4: Nạp file sao lưu */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-ghost"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  fontSize: '13px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  color: '#334155'
                }}
              >
                <Upload size={16} />
                <span>Phục hồi dữ liệu từ file (.JSON)</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ marginTop: '18px', textAlign: 'center' }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSyncModalOpen(false)}
                style={{ color: '#64748b' }}
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
