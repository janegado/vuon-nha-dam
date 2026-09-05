import { useState, useEffect, useRef } from 'react'
import {
  Download, Upload, History, FileSpreadsheet, FileJson,
  CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, X, HardDrive
} from 'lucide-react'
import {
  downloadJSONBackup,
  exportAllDataAsExcel,
  restoreBackupData,
  getDailySnapshotsList,
  restoreFromSnapshot,
  saveDailySnapshot
} from '../lib/backupManager'

export default function BackupModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('backup') // 'backup' | 'restore' | 'history'
  const [snapshots, setSnapshots] = useState([])
  const [importStatus, setImportStatus] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      // Chụp snapshot ngay khi mở modal để đảm bảo số liệu mới nhất
      saveDailySnapshot()
      setSnapshots(getDailySnapshotsList())
      setSuccessMsg('')
      setImportStatus(null)
      setSelectedFile(null)
      setFilePreview(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleDownloadJSON = () => {
    try {
      const filename = downloadJSONBackup()
      setSuccessMsg(`✅ Đã tải file sao lưu: ${filename}`)
      setSnapshots(getDailySnapshotsList())
    } catch (e) {
      alert('Có lỗi khi tải file sao lưu: ' + e.message)
    }
  }

  const handleExportExcel = () => {
    try {
      const filename = exportAllDataAsExcel()
      setSuccessMsg(`📊 Đã xuất file Excel: ${filename}`)
    } catch (e) {
      alert('Có lỗi khi xuất Excel: ' + e.message)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setImportStatus(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (!parsed.data) {
          throw new Error('File không chứa cấu trúc dữ liệu hợp lệ của Vườn Nha Đam')
        }
        setFilePreview(parsed)
      } catch (err) {
        setImportStatus({ type: 'error', message: 'File không đúng định dạng JSON chuẩn của App!' })
        setFilePreview(null)
      }
    }
    reader.readAsText(file)
  }

  const handleExecuteRestore = () => {
    if (!filePreview) return
    if (!window.confirm('⚠️ CẢNH BÁO: Thao tác này sẽ ghi đè dữ liệu hiện tại bằng dữ liệu trong file sao lưu. Bạn có chắc muốn tiếp tục không?')) {
      return
    }

    try {
      setLoading(true)
      // Chụp snapshot bản hiện tại đề phòng hối hận
      saveDailySnapshot()

      const result = restoreBackupData(filePreview)
      setImportStatus({
        type: 'success',
        message: `🎉 Khôi phục thành công! Đã nạp lại ${result.restoredCount} danh mục dữ liệu (Bản sao lưu ngày ${result.backupTime}).`
      })

      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (err) {
      setImportStatus({ type: 'error', message: 'Lỗi khôi phục: ' + err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleRestoreSnapshot = (dateKey) => {
    if (!window.confirm(`⚠️ Bạn có chắc muốn khôi phục dữ liệu hệ thống về bản sao lưu ngày [${dateKey}] không?`)) {
      return
    }

    try {
      setLoading(true)
      saveDailySnapshot() // Lưu lại bản hiện tại trước khi rollback
      const result = restoreFromSnapshot(dateKey)
      setSuccessMsg(`🎉 Đã khôi phục về ngày ${dateKey}! Hệ thống đang tải lại...`)
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (err) {
      alert('Lỗi khôi phục snapshot: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-card" style={{ maxWidth: 640, width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', borderRadius: 16, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        
        {/* Header Modal */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <HardDrive size={22} color="white" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>Trung Tâm Sao Lưu & Khôi Phục</h3>
              <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>Bảo vệ an toàn 100% dữ liệu vườn và tài chính</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost btn-icon"
            style={{ color: '#94a3b8', hover: { color: 'white' } }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: '#f8fafc' }}>
          <button
            onClick={() => setActiveTab('backup')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'backup' ? 'white' : 'transparent',
              borderBottom: activeTab === 'backup' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: activeTab === 'backup' ? 700 : 500,
              color: activeTab === 'backup' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 14
            }}
          >
            <Download size={16} /> Sao Lưu Dữ Liệu
          </button>
          <button
            onClick={() => setActiveTab('restore')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'restore' ? 'white' : 'transparent',
              borderBottom: activeTab === 'restore' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: activeTab === 'restore' ? 700 : 500,
              color: activeTab === 'restore' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 14
            }}
          >
            <Upload size={16} /> Khôi Phục File
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: 'none',
              background: activeTab === 'history' ? 'white' : 'transparent',
              borderBottom: activeTab === 'history' ? '2px solid var(--color-primary)' : 'none',
              fontWeight: activeTab === 'history' ? 700 : 500,
              color: activeTab === 'history' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: 14
            }}
          >
            <History size={16} /> Lịch Sử Snapshot ({snapshots.length})
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          
          {successMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: '#ecfdf5',
              border: '1px solid #10b981',
              color: '#065f46',
              marginBottom: 16,
              fontSize: 13,
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: SAO LƯU */}
          {activeTab === 'backup' && (
            <div>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                padding: 16,
                borderRadius: 12,
                border: '1px solid #86efac',
                marginBottom: 20,
                display: 'flex', alignItems: 'flex-start', gap: 12
              }}>
                <ShieldCheck size={24} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#166534', fontSize: 14, fontWeight: 700 }}>
                    Hệ Thống Tự Động Lưu Trữ (Auto-Snapshot) Đang Bật
                  </h4>
                  <p style={{ margin: 0, fontSize: 12, color: '#15803d', lineHeight: 1.5 }}>
                    Mỗi ngày khi anh nhập dữ liệu, App sẽ tự động ghi nhớ 1 bản snapshot vào bộ nhớ máy (lưu tối đa 30 ngày). Ngoài ra, anh có thể tải file về máy để lưu trữ an toàn tuyệt đối.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Nút tải JSON */}
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                  background: '#ffffff',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FileJson size={20} color="#2563eb" />
                      <strong style={{ fontSize: 14, color: '#1e293b' }}>File Sao Lưu Chuẩn (.JSON)</strong>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                      Chứa toàn bộ 14 phân hệ: Lô đất, Cây giống, Kho vật tư, Phiếu nhập, Nhật ký, Bán hàng... Dùng để khôi phục hoặc chuyển máy.
                    </p>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={handleDownloadJSON}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', fontSize: 13 }}
                  >
                    <Download size={16} /> Tải File Backup (.json)
                  </button>
                </div>

                {/* Nút xuất Excel */}
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 16,
                  background: '#ffffff',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <FileSpreadsheet size={20} color="#16a34a" />
                      <strong style={{ fontSize: 14, color: '#1e293b' }}>Báo Cáo Toàn Diện (.XLSX)</strong>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                      File Excel gồm nhiều Sheet riêng biệt (Lô đất, Kho, Phiếu nhập, Nhật ký, BVTV, Đơn hàng) để mở xem trực quan trên Excel.
                    </p>
                  </div>
                  <button
                    className="btn"
                    onClick={handleExportExcel}
                    style={{
                      background: '#16a34a', color: 'white', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', fontSize: 13
                    }}
                  >
                    <FileSpreadsheet size={16} /> Xuất File Excel (.xlsx)
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 20, padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1', fontSize: 12, color: '#64748b' }}>
                💡 <strong>Lời khuyên:</strong> Cuối mỗi ngày sau khi nhập xong số liệu, anh chỉ cần bấm <strong>"Tải File Backup (.json)"</strong> và lưu vào thư mục máy tính hoặc Google Drive để yên tâm 100%.
              </div>
            </div>
          )}

          {/* TAB 2: KHÔI PHỤC TỪ FILE */}
          {activeTab === 'restore' && (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #94a3b8',
                  borderRadius: 12,
                  padding: '28px 20px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  marginBottom: 16
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <Upload size={32} color="#64748b" style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ margin: '0 0 4px 0', fontSize: 14, color: '#1e293b' }}>
                  {selectedFile ? selectedFile.name : 'Nhấp vào đây để chọn File Sao Lưu (.json)'}
                </h4>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                  Chỉ chọn file định dạng .json đã tải từ chức năng Sao Lưu của App
                </p>
              </div>

              {filePreview && (
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 16
                }}>
                  <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 8, fontSize: 13 }}>
                    📄 Thông Tin Bản Sao Lưu:
                  </div>
                  <div style={{ fontSize: 12, color: '#1e3a8a', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div>🕒 <strong>Thời gian:</strong> {filePreview.backup_date_formatted || filePreview.backup_time}</div>
                    <div>📊 <strong>Tổng bản ghi:</strong> {filePreview.total_records || 'Không rõ'}</div>
                    <div>🌱 <strong>Lô đất:</strong> {filePreview.data?.app_plots_data?.length || 0} lô</div>
                    <div>📦 <strong>Mặt hàng kho:</strong> {filePreview.data?.app_inventory_items?.length || 0} món</div>
                    <div>📝 <strong>Phiếu nhập:</strong> {filePreview.data?.app_purchase_receipts?.length || 0} phiếu</div>
                    <div>🛒 <strong>Đơn hàng:</strong> {filePreview.data?.app_orders_data?.length || 0} đơn</div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleExecuteRestore}
                    disabled={loading}
                    style={{ marginTop: 16, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                    {loading ? 'Đang nạp dữ liệu...' : '🚀 Xác Nhận Khôi Phục Toàn Bộ Dữ Liệu'}
                  </button>
                </div>
              )}

              {importStatus && (
                <div style={{
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  background: importStatus.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  border: `1px solid ${importStatus.type === 'success' ? '#10b981' : '#ef4444'}`,
                  color: importStatus.type === 'success' ? '#065f46' : '#991b1b'
                }}>
                  {importStatus.message}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LỊCH SỬ SNAPSHOT */}
          {activeTab === 'history' && (
            <div>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px 0' }}>
                Dưới đây là các bản chụp dữ liệu tự động hằng ngày được lưu trên trình duyệt này. Nếu hôm nay có sai lệch, anh có thể bấm <strong>"Khôi phục"</strong> để quay về dữ liệu của ngày trước đó.
              </p>

              {snapshots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: '#94a3b8', fontSize: 13 }}>
                  Chưa có bản Snapshot tự động nào được lưu.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                  {snapshots.map((snap) => (
                    <div
                      key={snap.date}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: 14, color: '#1e293b' }}>📅 Ngày {snap.date}</strong>
                          <span className="badge" style={{ fontSize: 11, background: '#f1f5f9', color: '#475569' }}>
                            {snap.formatted_time || 'Tự động'}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                          Chứa {snap.total_records || 0} bản ghi dữ liệu (Lô, Kho, Nhật ký, Bán hàng...)
                        </div>
                      </div>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRestoreSnapshot(snap.date)}
                        disabled={loading}
                        style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <RefreshCw size={14} /> Khôi phục
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          background: '#f8fafc',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ fontSize: 13 }}>
            Đóng
          </button>
        </div>

      </div>
    </div>
  )
}
