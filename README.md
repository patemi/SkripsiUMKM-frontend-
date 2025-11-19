# Dashboard Admin UMKM

Dashboard admin lengkap untuk manajemen sistem UMKM menggunakan Next.js 14 dengan App Router.

## Fitur Utama

### 📊 Dashboard
- Statistik total UMKM dan total user
- Breakdown UMKM per kategori (Kuliner, Fashion, Kerajinan, Jasa, Agribisnis & Pertanian, Toko Kelontong)
- Top 5 UMKM favorit berdasarkan jumlah views
- Quick actions untuk akses cepat

### ✅ Aktivitas Terbaru (Verifikasi)
- Verifikasi data UMKM yang dikirim user
- Approve atau reject pengajuan UMKM
- Form alasan penolakan

### 📝 Log Aktivitas
- Riwayat lengkap verifikasi admin
- Detail tanggal, waktu, dan aksi yang dilakukan
- Informasi admin dan UMKM yang diverifikasi

### 📈 Analisis Pertumbuhan
- Grafik pertumbuhan UMKM dan user per bulan (Line Chart)
- Grafik pertumbuhan dalam bentuk Bar Chart
- Tabel data dengan perhitungan persentase pertumbuhan

### 🏪 Kelola UMKM (CRUD)
- List semua UMKM yang sudah disetujui
- Tambah UMKM baru dengan form lengkap
- Edit data UMKM
- Hapus UMKM dengan konfirmasi
- Form lengkap mencakup:
  - Nama UMKM
  - Foto/gambar UMKM
  - Kategori
  - Deskripsi
  - Metode pembayaran (multiple selection)
  - Alamat lengkap
  - Link Google Maps
  - Jam operasional (per hari)
  - Kontak (telepon, WhatsApp, email, Instagram, Facebook)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: React Icons
- **Date Handling**: date-fns

## Struktur Project

```
web_umkm/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Layout dengan sidebar
│   │   ├── page.tsx             # Dashboard utama
│   │   ├── verification/        # Halaman verifikasi UMKM
│   │   ├── activity-logs/       # Halaman log aktivitas
│   │   ├── analytics/           # Halaman analisis pertumbuhan
│   │   └── umkm/               # Halaman CRUD UMKM
│   │       ├── page.tsx         # List UMKM
│   │       ├── create/          # Form tambah UMKM
│   │       └── [id]/edit/       # Form edit UMKM
│   ├── api/                     # API routes
│   │   ├── statistics/
│   │   ├── umkm/
│   │   ├── activity-logs/
│   │   └── growth/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                      # Komponen UI reusable
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Table.tsx
│       ├── Modal.tsx
│       └── Form.tsx
├── lib/
│   └── mockData.ts              # Mock data untuk development
├── types/
│   └── index.ts                 # TypeScript types
└── package.json
```

## Instalasi

1. Install dependencies:
```bash
npm install
```

2. Jalankan development server:
```bash
npm run dev
```

3. Buka browser di [http://localhost:3000](http://localhost:3000)

## API Routes

- `GET /api/statistics` - Ambil statistik dashboard
- `GET /api/umkm` - Ambil semua UMKM
- `POST /api/umkm` - Tambah UMKM baru
- `GET /api/umkm/[id]` - Ambil detail UMKM
- `PUT /api/umkm/[id]` - Update UMKM
- `DELETE /api/umkm/[id]` - Hapus UMKM
- `POST /api/umkm/[id]/verify` - Verifikasi UMKM
- `GET /api/umkm/top` - Ambil top UMKM favorit
- `GET /api/umkm/pending` - Ambil UMKM pending verifikasi
- `GET /api/activity-logs` - Ambil log aktivitas
- `GET /api/growth` - Ambil data pertumbuhan

## Kategori UMKM

1. Kuliner
2. Fashion
3. Kerajinan
4. Jasa
5. Agribisnis & Pertanian
6. Toko Kelontong

## Metode Pembayaran yang Didukung

- Tunai
- QRIS
- Debit Card

## Development Notes

Saat ini aplikasi menggunakan mock data yang disimpan di `lib/mockData.ts`. Untuk production:
1. Integrasikan dengan database (PostgreSQL, MongoDB, dll)
2. Implementasi authentication dan authorization
3. Tambahkan upload foto untuk UMKM
4. Implementasi pagination untuk list data
5. Tambahkan filter dan search functionality

## Scripts

- `npm run dev` - Jalankan development server
- `npm run build` - Build aplikasi untuk production
- `npm start` - Jalankan production server
- `npm run lint` - Jalankan linter

## License

MIT
