import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Tự động xóa sạch 100% toàn bộ dữ liệu test cũ khi tải trang
const CLEAN_VERSION = 'v4_clean_all_test_data'
if (localStorage.getItem('app_data_version') !== CLEAN_VERSION) {
  localStorage.clear()
  localStorage.setItem('app_data_version', CLEAN_VERSION)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
