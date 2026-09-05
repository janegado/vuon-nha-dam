// Hệ Thống Quản Trị Vườn Nha Đam Mỹ - Auto Sync Realtime Active
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { saveDailySnapshot } from './lib/backupManager'

// Tự động chụp Snapshot an toàn khi ứng dụng khởi chạy
try {
  saveDailySnapshot()
} catch (e) {
  console.warn('Lỗi khi tự động chụp snapshot:', e)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
