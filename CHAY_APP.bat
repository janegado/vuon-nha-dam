@echo off
title VUON NHA DAM - HE THONG DANG CHAY
echo =======================================================
echo    HE THONG QUAN TRI VUON NHA DAM DANG KHOI DONG...
echo =======================================================
echo.
cd /d "%~dp0"
npm run dev
if %errorlevel% neq 0 (
    echo.
    echo [!] He thong gap su co. Vui long kiem tra lai.
    pause
)
