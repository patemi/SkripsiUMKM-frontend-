// Data Types
export interface UMKM {
  id: string;
  nama: string;
  foto: string[];
  kategori: KategoriUMKM;
  deskripsi: string;
  metodePembayaran: string[];
  alamat: string;
  linkMaps: string;
  jamOperasional: JamOperasional;
  kontak: Kontak;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export type KategoriUMKM = 
  | 'Kuliner' 
  | 'Fashion' 
  | 'Kerajinan' 
  | 'Jasa' 
  | 'Agribisnis & Pertanian' 
  | 'Toko Kelontong';

export interface JamOperasional {
  senin?: string;
  selasa?: string;
  rabu?: string;
  kamis?: string;
  jumat?: string;
  sabtu?: string;
  minggu?: string;
  [key: string]: string | undefined;
}

export interface Kontak {
  telepon?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  umkmId: string;
  umkmNama: string;
  action: 'approved' | 'rejected';
  reason?: string;
  timestamp: Date;
}

export interface Statistics {
  totalUMKM: number;
  totalUser: number;
  umkmPerKategori: {
    [key in KategoriUMKM]: number;
  };
}

export interface GrowthData {
  month: string;
  umkm: number;
  users: number;
}
