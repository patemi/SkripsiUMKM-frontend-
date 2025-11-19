// Mock data untuk development
import { UMKM, User, ActivityLog, Statistics, GrowthData, KategoriUMKM } from '@/types';

// Mock UMKM data
export const mockUMKM: UMKM[] = [
  {
    id: '1',
    nama: 'Warung Bu Siti',
    foto: ['/images/umkm1.jpg'],
    kategori: 'Kuliner',
    deskripsi: 'Warung makan tradisional dengan menu nusantara',
    metodePembayaran: ['Tunai', 'QRIS'],
    alamat: 'Jl. Raya No. 123, Jakarta',
    linkMaps: 'https://maps.google.com',
    jamOperasional: {
      senin: '08:00 - 22:00',
      selasa: '08:00 - 22:00',
      rabu: '08:00 - 22:00',
      kamis: '08:00 - 22:00',
      jumat: '08:00 - 22:00',
      sabtu: '08:00 - 23:00',
      minggu: '08:00 - 23:00',
    },
    kontak: {
      telepon: '08123456789',
      whatsapp: '08123456789',
      email: 'warungbusiti@email.com',
      instagram: '@warungbusiti',
    },
    status: 'approved',
    views: 150,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    userId: 'user1',
  },
  {
    id: '2',
    nama: 'Butik Cantik',
    foto: ['/images/umkm2.jpg'],
    kategori: 'Fashion',
    deskripsi: 'Butik fashion wanita dengan koleksi terkini',
    metodePembayaran: ['Tunai', 'Debit', 'QRIS'],
    alamat: 'Jl. Sudirman No. 45, Jakarta',
    linkMaps: 'https://maps.google.com',
    jamOperasional: {
      senin: '09:00 - 21:00',
      selasa: '09:00 - 21:00',
      rabu: '09:00 - 21:00',
      kamis: '09:00 - 21:00',
      jumat: '09:00 - 21:00',
      sabtu: '09:00 - 22:00',
      minggu: 'Tutup',
    },
    kontak: {
      telepon: '08198765432',
      whatsapp: '08198765432',
      instagram: '@butikcantik',
    },
    status: 'approved',
    views: 120,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    userId: 'user2',
  },
  {
    id: '3',
    nama: 'Kerajinan Tangan Manis',
    foto: ['/images/umkm3.jpg'],
    kategori: 'Kerajinan',
    deskripsi: 'Berbagai kerajinan tangan unik dan menarik',
    metodePembayaran: ['Tunai', 'QRIS'],
    alamat: 'Jl. Kerajinan No. 78, Bandung',
    linkMaps: 'https://maps.google.com',
    jamOperasional: {
      senin: '08:00 - 17:00',
      selasa: '08:00 - 17:00',
      rabu: '08:00 - 17:00',
      kamis: '08:00 - 17:00',
      jumat: '08:00 - 17:00',
      sabtu: '08:00 - 15:00',
      minggu: 'Tutup',
    },
    kontak: {
      whatsapp: '08567891234',
      instagram: '@kerajinantanganmanis',
    },
    status: 'pending',
    views: 45,
    createdAt: new Date('2024-11-10'),
    updatedAt: new Date('2024-11-10'),
    userId: 'user3',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date('2023-12-01'),
  },
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'log1',
    adminId: 'admin1',
    adminName: 'Admin User',
    umkmId: '1',
    umkmNama: 'Warung Bu Siti',
    action: 'approved',
    timestamp: new Date('2024-01-15T10:30:00'),
  },
  {
    id: 'log2',
    adminId: 'admin1',
    adminName: 'Admin User',
    umkmId: '2',
    umkmNama: 'Butik Cantik',
    action: 'approved',
    timestamp: new Date('2024-02-10T14:20:00'),
  },
];

export function getStatistics(): Statistics {
  const umkmPerKategori: { [key in KategoriUMKM]: number } = {
    'Kuliner': 0,
    'Fashion': 0,
    'Kerajinan': 0,
    'Jasa': 0,
    'Agribisnis & Pertanian': 0,
    'Toko Kelontong': 0,
  };

  mockUMKM.forEach((umkm) => {
    if (umkm.status === 'approved') {
      umkmPerKategori[umkm.kategori]++;
    }
  });

  return {
    totalUMKM: mockUMKM.filter(u => u.status === 'approved').length,
    totalUser: mockUsers.filter(u => u.role === 'user').length,
    umkmPerKategori,
  };
}

export function getGrowthData(): GrowthData[] {
  return [
    { month: 'Jan', umkm: 5, users: 10 },
    { month: 'Feb', umkm: 8, users: 15 },
    { month: 'Mar', umkm: 12, users: 22 },
    { month: 'Apr', umkm: 15, users: 28 },
    { month: 'May', umkm: 20, users: 35 },
    { month: 'Jun', umkm: 25, users: 42 },
    { month: 'Jul', umkm: 30, users: 50 },
    { month: 'Aug', umkm: 35, users: 58 },
    { month: 'Sep', umkm: 42, users: 65 },
    { month: 'Oct', umkm: 48, users: 72 },
    { month: 'Nov', umkm: 52, users: 80 },
  ];
}

export function getTopFavoriteUMKM(limit: number = 5): UMKM[] {
  return [...mockUMKM]
    .filter(u => u.status === 'approved')
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export function getPendingUMKM(): UMKM[] {
  return mockUMKM.filter(u => u.status === 'pending');
}
