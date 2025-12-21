# 🔐 Sistem Keamanan Admin Dashboard

## Implementasi Fitur Keamanan

### 1. **Middleware Next.js** (`middleware.ts`)
- ✅ Otomatis redirect ke `/login` jika mencoba akses route admin tanpa autentikasi
- ✅ Validasi token di level middleware (sebelum halaman dimuat)
- ✅ Cookie-based authentication untuk keamanan ekstra
- ✅ Mencegah akses langsung ke route admin tanpa login

### 2. **Authentication Utilities** (`lib/auth.ts`)
Fitur-fitur keamanan:
- ✅ **Session Timeout**: Auto logout setelah 30 menit tidak aktif
- ✅ **Activity Tracking**: Monitor aktivitas user (klik, scroll, keyboard)
- ✅ **Auto Logout Timer**: Cek setiap 1 menit untuk session timeout
- ✅ **Token Verification**: Validasi token dengan backend
- ✅ **Secure Cookie Storage**: Token disimpan di cookie dengan flag Secure dan SameSite
- ✅ **Clear Session Management**: Hapus semua data saat logout

### 3. **Protected Admin Layout** (`app/admin/layout.tsx`)
- ✅ Validasi autentikasi saat layout dimuat
- ✅ Loading state saat verifikasi autentikasi
- ✅ Redirect otomatis ke login jika tidak terautentikasi
- ✅ Hanya admin yang bisa akses (bukan user biasa)

### 4. **Backend Security** (`backend/`)
- ✅ JWT Token dengan expiration
- ✅ Endpoint `/api/admin/verify` untuk validasi token
- ✅ Middleware `protect` untuk protected routes
- ✅ Middleware `adminOnly` untuk admin-only routes
- ✅ Password hashing dengan bcrypt

## Cara Kerja Sistem Keamanan

### Flow Autentikasi:
```
1. User akses /admin
   ↓
2. Middleware Next.js cek cookie 'admin_token'
   ↓ (tidak ada)
3. Redirect ke /login
   ↓
4. User input username & password
   ↓
5. POST ke /api/admin/login
   ↓
6. Backend validasi & generate JWT token
   ↓
7. Token disimpan di localStorage & cookie
   ↓
8. Init auto-logout timer & activity tracking
   ↓
9. Redirect ke /admin
   ↓
10. Middleware cek token → Izinkan akses
```

### Session Timeout:
```
1. User aktif di dashboard
   ↓
2. Setiap aktivitas update lastActivity timestamp
   ↓
3. Background timer cek setiap 1 menit
   ↓
4. Jika tidak aktif > 30 menit
   ↓
5. Auto logout & redirect ke /login?reason=timeout
```

## Penggunaan

### Login Admin:
```typescript
import { loginAdmin } from '@/lib/auth';

const result = await loginAdmin(username, password);
if (result.success) {
  // Token & session otomatis tersimpan
  // Auto-logout timer otomatis aktif
  router.push('/admin');
}
```

### Logout Admin:
```typescript
import { logoutAdmin } from '@/lib/auth';

logoutAdmin(); // Hapus semua session & timer
router.push('/login');
```

### Cek Autentikasi:
```typescript
import { isAdminAuthenticated } from '@/lib/auth';

if (!isAdminAuthenticated()) {
  router.push('/login');
}
```

## Konfigurasi

### Session Timeout (di `lib/auth.ts`):
```typescript
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 menit (bisa diubah)
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check setiap 1 menit
```

### JWT Expiration (di `backend/.env`):
```
JWT_EXPIRE=30d
JWT_SECRET=your_secret_key_here
```

## Keamanan yang Diimplementasikan

| Fitur | Status | Keterangan |
|-------|--------|------------|
| Middleware Protection | ✅ | Route admin dilindungi di level middleware |
| JWT Token | ✅ | Token dengan expiration & signature |
| Session Timeout | ✅ | Auto logout setelah 30 menit idle |
| Activity Tracking | ✅ | Monitor user activity untuk update session |
| Cookie Security | ✅ | SameSite=Strict, Secure flag |
| Password Hashing | ✅ | Bcrypt dengan salt rounds |
| Token Verification | ✅ | Validasi token dengan backend |
| Admin Role Check | ✅ | Hanya admin yang bisa akses |
| Clear Session | ✅ | Hapus semua data saat logout |
| Loading State | ✅ | Prevent flash of content |

## Testing

### Test Login:
1. Akses `http://localhost:3000/admin` (tanpa login)
2. Harus redirect ke `/login`
3. Login dengan credentials admin
4. Harus masuk ke dashboard admin

### Test Session Timeout:
1. Login sebagai admin
2. Biarkan idle selama 30 menit
3. Harus auto logout dan redirect ke login

### Test Activity Tracking:
1. Login sebagai admin
2. Lakukan aktivitas (klik, scroll) dalam 30 menit
3. Session harus tetap aktif

### Test Invalid Token:
1. Hapus/corrupt cookie 'admin_token' di DevTools
2. Refresh halaman atau akses route admin
3. Harus redirect ke login

## Environment Variables Required

Di `.env` (backend):
```env
JWT_SECRET=your_very_secure_secret_key_here
JWT_EXPIRE=30d
PORT=5000
```

Di `.env.local` (frontend):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Status: ✅ Siap Digunakan

Semua fitur keamanan telah diimplementasikan dan siap untuk production use.
