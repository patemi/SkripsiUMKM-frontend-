# 🚀 Quick Start Guide

## Jika Web Terasa Lambat

### Cara 1: Clear Cache & Restart (Recommended)
```bash
# Double-click file ini:
clear-cache.bat

# Atau jalankan di terminal:
npm run dev
```

### Cara 2: Manual Restart
```bash
# 1. Stop server (Ctrl + C)
# 2. Clear cache
rm -rf .next

# 3. Start server
npm run dev
```

### Cara 3: Full Restart
```bash
# Double-click file ini:
start-dev.bat
```

## Tips Performa

### ✅ DO:
- Clear browser cache (Ctrl + Shift + Delete)
- Restart development server jika lambat
- Pastikan backend running di http://localhost:5000
- Gunakan production build untuk speed maksimal: `npm run build && npm start`

### ❌ DON'T:
- Buka terlalu banyak tab browser
- Jalankan aplikasi berat lain bersamaan
- Lupa restart setelah perubahan besar

## Production Mode (Fastest!)

```bash
# Build untuk production
npm run build

# Run production server
npm start
```

Production mode **10x lebih cepat** dari development!

## Troubleshooting

### Login lambat?
1. Check backend running: http://localhost:5000
2. Clear browser cache
3. Restart development server

### Dashboard tidak muncul?
1. Clear Next.js cache: `rm -rf .next`
2. Restart server: `npm run dev`
3. Check console untuk errors (F12)

### Masih lambat?
1. Restart komputer
2. Close aplikasi lain yang berat
3. Gunakan production mode

## Server URLs

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Admin Dashboard:** http://localhost:3000/admin
- **Login:** http://localhost:3000/login

## Performance Metrics

**Development Mode:**
- Initial Load: ~1-2s
- Navigation: <1s
- Login: ~1s

**Production Mode:**
- Initial Load: <500ms
- Navigation: <200ms
- Login: <500ms

---

**Dokumentasi lengkap:** Lihat [PERFORMANCE_OPTIMIZATION.md](PERFORMANCE_OPTIMIZATION.md)
