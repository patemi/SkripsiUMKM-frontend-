# ✅ TESTING AUTENTIKASI - Checklist

## Test 1: Akses /admin Tanpa Login
**Tujuan:** Pastikan redirect ke login otomatis

### Steps:
1. Buka browser dalam mode incognito/private
2. Akses: `http://localhost:3000/admin`
3. **Expected:** Otomatis redirect ke `http://localhost:3000/login?redirect=%2Fadmin`
4. **Status:** ✅ PASSED jika redirect, ❌ FAILED jika bisa akses

### Jika FAILED:
```bash
# Clear cache dan restart
cd "d:\ALL ABOUT SKRIPSI\web_umkm"
rm -rf .next
npm run dev
```

---

## Test 2: Login Admin
**Tujuan:** Pastikan login berhasil dan redirect ke dashboard

### Steps:
1. Di halaman login, masukkan credentials admin
2. Klik "Login"
3. **Expected:** 
   - Muncul notifikasi "Login Berhasil!"
   - Redirect ke `/admin` dalam 1 detik
   - Dashboard muncul dengan data
4. **Status:** ✅ PASSED jika berhasil

### Jika FAILED:
- Cek backend running: `http://localhost:5000`
- Cek credentials admin di database
- Lihat console error (F12)

---

## Test 3: Akses /admin Setelah Login
**Tujuan:** Pastikan bisa akses dashboard setelah login

### Steps:
1. Setelah login sukses
2. Cek URL: `http://localhost:3000/admin`
3. **Expected:**
   - Dashboard muncul
   - Data UMKM terlihat
   - Sidebar berfungsi
4. **Status:** ✅ PASSED jika dashboard muncul

---

## Test 4: Navigate Antar Halaman Admin
**Tujuan:** Pastikan navigasi lancar tanpa logout

### Steps:
1. Dari dashboard, klik menu:
   - Kelola UMKM
   - Aktivitas Terbaru
   - Daftar User
   - Log Aktivitas
   - Analisis Pertumbuhan
2. **Expected:** Semua halaman bisa diakses tanpa redirect ke login
3. **Status:** ✅ PASSED jika semua halaman bisa diakses

---

## Test 5: Logout
**Tujuan:** Pastikan logout menghapus semua session

### Steps:
1. Dari dashboard admin, klik tombol "Logout"
2. **Expected:**
   - Redirect ke `/login`
   - localStorage cleared (cek di DevTools: F12 → Application → Local Storage)
   - Cookie `auth_token` dihapus (cek di DevTools: F12 → Application → Cookies)
3. **Status:** ✅ PASSED jika semua data terhapus

### Verifikasi di DevTools:
```javascript
// Buka Console (F12) dan ketik:
localStorage.getItem('token')      // Harus: null
localStorage.getItem('admin')      // Harus: null
document.cookie                    // Harus: tidak ada auth_token
```

---

## Test 6: Akses /admin Setelah Logout
**Tujuan:** Pastikan tidak bisa akses setelah logout

### Steps:
1. Setelah logout, coba akses: `http://localhost:3000/admin`
2. **Expected:** Redirect otomatis ke `/login`
3. **Status:** ✅ PASSED jika redirect

---

## Test 7: Reload Page
**Tujuan:** Pastikan session persist setelah reload

### Steps:
1. Login sebagai admin
2. Masuk ke dashboard
3. Tekan `F5` atau `Ctrl+R` (reload page)
4. **Expected:** Tetap di dashboard, tidak redirect ke login
5. **Status:** ✅ PASSED jika tetap login

---

## Test 8: Close & Open Browser
**Tujuan:** Pastikan session persist (dalam 7 hari)

### Steps:
1. Login sebagai admin
2. Close browser
3. Buka browser lagi
4. Akses: `http://localhost:3000/admin`
5. **Expected:** Langsung masuk dashboard (tidak perlu login lagi)
6. **Status:** ✅ PASSED jika tetap login

### Note:
- Cookie `auth_token` valid selama 7 hari
- Setelah 7 hari, harus login ulang

---

## Test 9: Multiple Tabs
**Tujuan:** Pastikan logout di satu tab affect semua tab

### Steps:
1. Login di Tab 1
2. Buka Tab 2: `http://localhost:3000/admin`
3. Tab 2 harus bisa akses dashboard
4. Di Tab 1, klik Logout
5. Refresh Tab 2
6. **Expected:** Tab 2 redirect ke login
7. **Status:** ✅ PASSED jika Tab 2 redirect

---

## Test 10: Performance Check
**Tujuan:** Pastikan web cepat dan tidak lemot

### Metrics:
| Action | Max Time | Status |
|--------|----------|--------|
| Initial page load | < 2s | ⏱️ |
| Login process | < 2s | ⏱️ |
| Dashboard load | < 2s | ⏱️ |
| Navigation | < 1s | ⏱️ |
| Logout | < 500ms | ⏱️ |

### How to Check:
1. Buka DevTools (F12)
2. Tab Network
3. Check load times untuk setiap action

**Status:** ✅ PASSED jika semua < target time

---

## Test 11: Backend Down
**Tujuan:** Pastikan error handling bagus

### Steps:
1. Stop backend server
2. Coba login
3. **Expected:** Muncul error message yang jelas
4. **Status:** ✅ PASSED jika ada error message

---

## Test 12: Invalid Credentials
**Tujuan:** Pastikan validasi login

### Steps:
1. Masukkan username/password salah
2. Klik Login
3. **Expected:** Muncul error "Username atau password salah"
4. **Status:** ✅ PASSED jika ada error message

---

## Quick Test Script

```javascript
// Copy paste di Browser Console (F12)
// Test auth status
console.log('Token:', localStorage.getItem('token'));
console.log('Admin:', localStorage.getItem('admin'));
console.log('Cookie:', document.cookie);

// Expected setelah login:
// Token: "eyJhbGc..." (JWT token string)
// Admin: {"_id":"...","nama_admin":"...","username_admin":"..."} 
// Cookie: "auth_token=..."

// Expected setelah logout:
// Token: null
// Admin: null
// Cookie: "" (atau tidak ada auth_token)
```

---

## Final Checklist

✅ = Passed | ❌ = Failed | ⏳ = Not Tested

| # | Test | Status | Notes |
|---|------|--------|-------|
| 1 | Akses /admin tanpa login | ⏳ | Harus redirect |
| 2 | Login admin | ⏳ | Harus berhasil |
| 3 | Akses /admin setelah login | ⏳ | Harus bisa |
| 4 | Navigate antar halaman | ⏳ | Semua halaman |
| 5 | Logout | ⏳ | Clear semua data |
| 6 | Akses /admin setelah logout | ⏳ | Harus redirect |
| 7 | Reload page | ⏳ | Session persist |
| 8 | Close & open browser | ⏳ | Session persist |
| 9 | Multiple tabs | ⏳ | Sync logout |
| 10 | Performance | ⏳ | < 2s semua |
| 11 | Backend down | ⏳ | Error handling |
| 12 | Invalid credentials | ⏳ | Validasi |

---

## Common Issues & Solutions

### Issue: Redirect loop
**Solution:**
```bash
# Clear everything
localStorage.clear()
# Clear cookies di DevTools
# Restart server
```

### Issue: Tidak redirect ke login
**Solution:**
```bash
cd "d:\ALL ABOUT SKRIPSI\web_umkm"
rm -rf .next
npm run dev
```

### Issue: Lambat
**Solution:**
```bash
# Clear cache
clear-cache.bat
# Atau:
rm -rf .next
npm run dev
```

### Issue: Cookie tidak ter-set
**Solution:**
- Check domain di cookie settings
- Make sure SameSite=Lax (not Strict if testing)
- Check browser security settings

---

## Status: Ready for Testing

Silakan test satu per satu sesuai checklist di atas! 🧪
