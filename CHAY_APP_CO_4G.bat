@echo off
title VUON NHA DAM - CHE DO CO DUONG LINK 4G CHO IPHONE
chcp 65001 > nul
echo ======================================================================
echo    🌿 HỆ THỐNG QUẢN TRỊ VƯỜN NHA ĐAM ĐANG CHẠY (KÈM ĐƯỜNG LINK 4G)
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/2] Đang khởi động máy chủ Web nội bộ...
start "Vite Dev Server" cmd /c "npm run dev"

timeout /t 3 > nul

echo [2/2] Đang kết nối đường truyền Cloudflare Tunnel bảo mật 4G...
echo.
echo ======================================================================
echo  👉 HƯỚNG DẪN MỞ TRÊN IPHONE BẰNG 4G/5G:
echo  1. Mở Safari trên iPhone gõ đường link HTTPS hiển thị bên dưới.
echo  2. Bấm nút Chia sẻ (hình vuông mũi tên lên) -> Chọn "Thêm vào MH chính".
echo ======================================================================
echo.

"..\cloudflared.exe" tunnel --url http://localhost:5173

pause
