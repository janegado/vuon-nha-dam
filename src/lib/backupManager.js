// Module Quản Lý Sao Lưu & Phục Hồi Dữ Liệu Toàn Diện (Backup & Restore System)
// Vườn Nha Đam Mỹ — Hỗ trợ xuất JSON, Excel và chụp Snapshot tự động theo ngày.

import * as XLSX from 'xlsx'

export const BACKUP_KEYS = [
  { key: 'app_plots_data', label: 'Lô đất' },
  { key: 'app_crops_data', label: 'Mùa vụ & Cây trồng' },
  { key: 'app_daily_logs_data', label: 'Nhật ký canh tác' },
  { key: 'app_treatments_data', label: 'Nhật ký xử lý đất / giá thể' },
  { key: 'app_harvest_history', label: 'Lịch sử thu hoạch' },
  { key: 'app_inventory_items', label: 'Danh mục kho & vật tư' },
  { key: 'app_purchase_receipts', label: 'Phiếu nhập kho' },
  { key: 'app_production_logs', label: 'Sổ nhật ký xuất / sản xuất' },
  { key: 'app_chemical_logs', label: 'Nhật ký BVTV & Phun xịt' },
  { key: 'app_field_tasks', label: 'Lịch tác nghiệp & Công việc' },
  { key: 'app_cultivation_stages', label: 'Tiến độ 6 giai đoạn canh tác' },
  { key: 'app_products_data', label: 'Danh mục sản phẩm bán' },
  { key: 'app_customers_data', label: 'Khách hàng' },
  { key: 'app_orders_data', label: 'Đơn hàng bán' },
]

const SNAPSHOTS_KEY = 'app_daily_snapshots'
const MAX_SNAPSHOTS = 30 // Lưu tối đa 30 ngày gần nhất

/**
 * Thu thập toàn bộ dữ liệu hiện tại từ localStorage
 */
export function getAllAppState() {
  const state = {}
  BACKUP_KEYS.forEach(({ key }) => {
    const raw = localStorage.getItem(key)
    try {
      state[key] = raw ? JSON.parse(raw) : null
    } catch {
      state[key] = raw
    }
  })
  return state
}

/**
 * Tạo gói sao lưu dạng JSON đầy đủ kèm metadata
 */
export function createBackupPayload() {
  const now = new Date()
  const dateStr = now.toISOString()
  const state = getAllAppState()

  // Đếm tổng số bản ghi
  let totalRecords = 0
  Object.values(state).forEach(val => {
    if (Array.isArray(val)) totalRecords += val.length
  })

  return {
    app: 'VuonNhaDamMy_Manager',
    version: '1.0',
    backup_time: dateStr,
    backup_date_formatted: now.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    }),
    total_records: totalRecords,
    data: state
  }
}

/**
 * Tải file sao lưu JSON về máy tính
 */
export function downloadJSONBackup() {
  const payload = createBackupPayload()
  const jsonStr = JSON.stringify(payload, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' })
  
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const hh = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const filename = `VuonNhaDam_Backup_${yyyy}-${mm}-${dd}_${hh}h${min}.json`

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  // Cập nhật mốc sao lưu gần nhất
  localStorage.setItem('app_last_manual_backup', now.toISOString())
  return filename
}

/**
 * Xuất toàn bộ dữ liệu ra file Excel (.xlsx) đa sheet
 */
export function exportAllDataAsExcel() {
  const state = getAllAppState()
  const wb = XLSX.utils.book_new()

  // 1. Sheet Lô đất
  if (Array.isArray(state.app_plots_data) && state.app_plots_data.length > 0) {
    const plotsSheet = XLSX.utils.json_to_sheet(state.app_plots_data)
    XLSX.utils.book_append_sheet(wb, plotsSheet, 'Lô Đất')
  }

  // 2. Sheet Mùa vụ / Cây trồng
  if (Array.isArray(state.app_crops_data) && state.app_crops_data.length > 0) {
    const cropsSheet = XLSX.utils.json_to_sheet(state.app_crops_data)
    XLSX.utils.book_append_sheet(wb, cropsSheet, 'Mùa Vụ - Cây Trồng')
  }

  // 3. Sheet Kho Vật Tư
  if (Array.isArray(state.app_inventory_items) && state.app_inventory_items.length > 0) {
    const invSheet = XLSX.utils.json_to_sheet(state.app_inventory_items)
    XLSX.utils.book_append_sheet(wb, invSheet, 'Kho Vật Tư')
  }

  // 4. Sheet Phiếu Nhập Kho
  if (Array.isArray(state.app_purchase_receipts) && state.app_purchase_receipts.length > 0) {
    const receiptsSheet = XLSX.utils.json_to_sheet(state.app_purchase_receipts)
    XLSX.utils.book_append_sheet(wb, receiptsSheet, 'Phiếu Nhập Kho')
  }

  // 5. Sheet Sổ Nhật Ký Xuất / Sản Xuất
  if (Array.isArray(state.app_production_logs) && state.app_production_logs.length > 0) {
    const prodSheet = XLSX.utils.json_to_sheet(state.app_production_logs)
    XLSX.utils.book_append_sheet(wb, prodSheet, 'Nhật Ký Xuất & Dùng')
  }

  // 6. Sheet Nhật Ký Canh Tác
  if (Array.isArray(state.app_daily_logs_data) && state.app_daily_logs_data.length > 0) {
    const logsSheet = XLSX.utils.json_to_sheet(state.app_daily_logs_data)
    XLSX.utils.book_append_sheet(wb, logsSheet, 'Nhật Ký Canh Tác')
  }

  // 7. Sheet BVTV & Dịch Hại
  if (Array.isArray(state.app_chemical_logs) && state.app_chemical_logs.length > 0) {
    const pestSheet = XLSX.utils.json_to_sheet(state.app_chemical_logs)
    XLSX.utils.book_append_sheet(wb, pestSheet, 'BVTV & Dịch Hại')
  }

  // 8. Sheet Lịch Tác Nghiệp
  if (Array.isArray(state.app_field_tasks) && state.app_field_tasks.length > 0) {
    const tasksSheet = XLSX.utils.json_to_sheet(state.app_field_tasks)
    XLSX.utils.book_append_sheet(wb, tasksSheet, 'Lịch Tác Nghiệp')
  }

  // 9. Sheet Đơn Hàng & Bán Hàng
  if (Array.isArray(state.app_orders_data) && state.app_orders_data.length > 0) {
    const ordersSheet = XLSX.utils.json_to_sheet(state.app_orders_data)
    XLSX.utils.book_append_sheet(wb, ordersSheet, 'Đơn Hàng')
  }

  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const filename = `SoLieu_VuonNhaDam_${yyyy}-${mm}-${dd}.xlsx`

  XLSX.writeFile(wb, filename)
  return filename
}

/**
 * Khôi phục toàn bộ dữ liệu từ file JSON hoặc payload
 */
export function restoreBackupData(payload) {
  if (!payload || !payload.data) {
    throw new Error('Dữ liệu file sao lưu không hợp lệ hoặc bị lỗi cấu trúc!')
  }

  const { data } = payload
  let restoredCount = 0

  BACKUP_KEYS.forEach(({ key }) => {
    if (data[key] !== undefined && data[key] !== null) {
      if (typeof data[key] === 'object') {
        localStorage.setItem(key, JSON.stringify(data[key]))
      } else {
        localStorage.setItem(key, String(data[key]))
      }
      restoredCount++
    }
  })

  // Đánh dấu thời gian khôi phục
  localStorage.setItem('app_last_restored_at', new Date().toISOString())
  return { success: true, restoredCount, backupTime: payload.backup_date_formatted || payload.backup_time }
}

/**
 * Tự động chụp Snapshot lưu trữ theo ngày (giữ 30 ngày gần nhất)
 */
export function saveDailySnapshot() {
  const todayKey = new Date().toISOString().split('T')[0] // 'YYYY-MM-DD'
  const state = getAllAppState()

  // Kiểm tra xem dữ liệu có giá trị thực tế không (tránh lưu snapshot rỗng)
  let totalItems = 0
  Object.values(state).forEach(v => {
    if (Array.isArray(v)) totalItems += v.length
  })

  if (totalItems === 0) return false // Không có dữ liệu để chụp

  let snapshots = {}
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    if (raw) snapshots = JSON.parse(raw)
  } catch {
    snapshots = {}
  }

  snapshots[todayKey] = {
    date: todayKey,
    updated_at: new Date().toISOString(),
    formatted_time: new Date().toLocaleTimeString('vi-VN'),
    total_records: totalItems,
    data: state
  }

  // Giữ lại tối đa MAX_SNAPSHOTS gần nhất
  const dateKeys = Object.keys(snapshots).sort().reverse()
  if (dateKeys.length > MAX_SNAPSHOTS) {
    const keysToRemove = dateKeys.slice(MAX_SNAPSHOTS)
    keysToRemove.forEach(k => delete snapshots[k])
  }

  try {
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(snapshots))
    return true
  } catch (e) {
    console.warn('Không thể lưu snapshot vào localStorage (dung lượng vượt giới hạn)', e)
    return false
  }
}

/**
 * Lấy danh sách các bản Snapshot tự động đã lưu
 */
export function getDailySnapshotsList() {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    if (!raw) return []
    const snapshots = JSON.parse(raw)
    return Object.values(snapshots).sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  } catch {
    return []
  }
}

/**
 * Khôi phục hệ thống về 1 bản Snapshot cụ thể theo ngày
 */
export function restoreFromSnapshot(dateKey) {
  try {
    const raw = localStorage.getItem(SNAPSHOTS_KEY)
    if (!raw) throw new Error('Không tìm thấy lịch sử Snapshot!')
    const snapshots = JSON.parse(raw)
    const target = snapshots[dateKey]
    if (!target || !target.data) throw new Error(`Không tìm thấy bản sao lưu của ngày ${dateKey}!`)

    return restoreBackupData(target)
  } catch (e) {
    throw e
  }
}
