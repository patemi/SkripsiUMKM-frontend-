@echo off
echo ========================================
echo   TESTING LOGIN FLOW
echo ========================================
echo.
echo Test 1: Akses /admin tanpa login
echo Expected: Redirect ke /login
echo.
echo Test 2: Login dengan credentials
echo Expected: Masuk ke dashboard dalam ^<1s
echo.
echo Test 3: Logout dari dashboard
echo Expected: Redirect ke /login
echo.
echo Test 4: Akses /admin setelah logout
echo Expected: Redirect ke /login
echo.
echo ========================================
echo   MANUAL TEST STEPS:
echo ========================================
echo.
echo 1. Buka browser Incognito/Private
echo 2. Clear browser cache (Ctrl+Shift+Delete)
echo 3. Akses: http://localhost:3000/admin
echo    ^> HARUS redirect ke /login
echo.
echo 4. Login dengan admin credentials
echo    ^> HARUS masuk dashboard ^<1 detik
echo.
echo 5. Klik Logout
echo    ^> HARUS redirect ke /login
echo.
echo 6. Coba akses /admin lagi
echo    ^> HARUS redirect ke /login
echo.
echo ========================================
echo   TROUBLESHOOTING
echo ========================================
echo.
echo Jika masih lambat/error:
echo 1. Stop server (Ctrl+C)
echo 2. Run: clear-cache.bat
echo 3. Run: npm run dev
echo 4. Clear browser cache
echo 5. Test lagi
echo.
pause
