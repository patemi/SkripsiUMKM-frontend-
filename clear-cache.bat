@echo off
echo ================================
echo   CLEARING ALL CACHES
echo ================================
echo.

echo [1/2] Removing .next folder...
if exist .next (
    rmdir /s /q .next
    echo ✓ .next cleared
)

echo.
echo [2/2] Removing node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ node_modules cache cleared
)

echo.
echo ================================
echo   ✓ All caches cleared!
echo   Now run: npm run dev
echo ================================
pause
