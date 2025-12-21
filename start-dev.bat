@echo off
echo ================================
echo   PLATFORM UMKM - QUICK START
echo ================================
echo.

echo [1/3] Clearing cache...
if exist .next (
    rmdir /s /q .next
    echo ✓ Cache cleared
) else (
    echo ✓ No cache to clear
)
echo.

echo [2/3] Installing dependencies...
call npm install --silent
echo ✓ Dependencies ready
echo.

echo [3/3] Starting development server...
echo.
echo ================================
echo   Server starting...
echo   URL: http://localhost:3000
echo ================================
echo.

call npm run dev
