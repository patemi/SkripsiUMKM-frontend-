'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiMapPin, FiClock, FiPhone, FiInstagram, FiEye, FiFilter, FiSearch } from 'react-icons/fi';
import { API_URL } from '@/lib/api';

interface UMKM {
  _id: string;
  nama_umkm: string;
  kategori: string;
  deskripsi: string;
  alamat: string;
  maps?: string;
  foto_umkm: string[];
  pembayaran: string[];
  jam_operasional: { [key: string]: string };
  kontak: {
    telepon?: string;
    whatsapp?: string;
    instagram?: string;
  };
  views: number;
  status: string;
}

const kategoriList = ['Semua', 'Kuliner', 'Fashion', 'Kerajinan', 'Jasa', 'Agribisnis & Pertanian', 'Toko Kelontong'];

export default function UserHomePage() {
  const [umkmList, setUmkmList] = useState<UMKM[]>([]);
  const [filteredUMKM, setFilteredUMKM] = useState<UMKM[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Intersection Observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all elements with data-animate attribute
    const animateElements = document.querySelectorAll('[data-animate]');
    animateElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredUMKM]);

  useEffect(() => {
    fetchUMKM();
  }, []);

  useEffect(() => {
    // Filter UMKM based on category and search
    let filtered = umkmList;

    if (selectedKategori !== 'Semua') {
      filtered = filtered.filter(umkm => umkm.kategori === selectedKategori);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(umkm =>
        umkm.nama_umkm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        umkm.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        umkm.alamat.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUMKM(filtered);
  }, [selectedKategori, searchQuery, umkmList]);

  const fetchUMKM = async () => {
    try {
      const res = await fetch(`${API_URL}/umkm?status=approved`);
      const response = await res.json();

      if (response.success) {
        setUmkmList(response.data);
        setFilteredUMKM(response.data);
      }
    } catch (error) {
      console.error('Error fetching UMKM:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOpen = (jamOperasional: { [key: string]: string }) => {
    const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
    const today = days[new Date().getDay()];
    const jadwal = jamOperasional[today];

    if (!jadwal || jadwal.toLowerCase() === 'tutup') return false;
    if (jadwal.toLowerCase() === 'buka 24 jam') return true;

    // Parse jam operasional (format: "08:00 - 22:00")
    const [start, end] = jadwal.split('-').map(t => t.trim());
    if (!start || !end) return false;

    const now = new Date();
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat UMKM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <img src="/img/logo.png" alt="SoraUMKM" className="h-10 w-10" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SoraUMKM
              </span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link href="/user/home" className="text-blue-600 font-semibold">Jelajah</Link>
              <Link href="/user/register" className="text-gray-700 hover:text-blue-600 transition-colors">Daftar UMKM</Link>
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Login Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12" data-animate>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 opacity-0 translate-y-10">
            Temukan UMKM Terbaik di Solo Raya
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto opacity-0 translate-y-10">
            Dukung ekonomi lokal dengan menemukan produk dan jasa dari UMKM terpercaya di sekitar Anda
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8" data-animate>
          <div className="relative opacity-0 translate-y-10">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Cari nama UMKM, kategori, atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg shadow-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center justify-center mb-12 flex-wrap gap-3" data-animate>
          <div className="flex items-center mr-4 opacity-0 translate-y-10">
            <FiFilter className="text-gray-600 mr-2" />
            <span className="text-gray-700 font-semibold">Filter:</span>
          </div>
          {kategoriList.map((kategori, index) => (
            <button
              key={kategori}
              onClick={() => setSelectedKategori(kategori)}
              className={`px-6 py-2 rounded-full font-medium transition-all opacity-0 translate-y-10 ${
                selectedKategori === kategori
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {kategori}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-center mb-8" data-animate>
          <p className="text-gray-600 opacity-0 translate-y-10">
            Menampilkan <span className="font-bold text-blue-600">{filteredUMKM.length}</span> UMKM
            {selectedKategori !== 'Semua' && <span className="font-semibold"> - Kategori: {selectedKategori}</span>}
            {searchQuery && <span className="font-semibold"> - Pencarian: "{searchQuery}"</span>}
          </p>
        </div>

        {/* UMKM Grid */}
        {filteredUMKM.length === 0 ? (
          <div className="text-center py-20" data-animate>
            <div className="opacity-0 translate-y-10">
              <FiMapPin className="mx-auto text-gray-300 mb-4" size={80} />
              <h3 className="text-2xl font-semibold text-gray-700 mb-2">Tidak ada UMKM ditemukan</h3>
              <p className="text-gray-500">
                {searchQuery ? 'Coba ubah kata kunci pencarian Anda' : 'Coba pilih kategori lain'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredUMKM.map((umkm, index) => (
              <Link
                key={umkm._id}
                href={`/user/umkm/${umkm._id}`}
                data-animate
              >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full opacity-0 translate-y-10">
                  {/* Image */}
                  <div className="relative h-56 bg-gradient-to-br from-blue-400 to-indigo-500 overflow-hidden">
                    {umkm.foto_umkm && umkm.foto_umkm.length > 0 ? (
                      <img
                        src={umkm.foto_umkm[0]}
                        alt={umkm.nama_umkm}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-8xl font-bold text-white opacity-50">
                          {umkm.nama_umkm.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {isOpen(umkm.jam_operasional) ? (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center">
                          <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                          BUKA SEKARANG
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full shadow-lg">
                          TUTUP
                        </span>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4">
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-blue-600 text-sm font-bold rounded-full shadow-lg">
                        {umkm.kategori}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                      {umkm.nama_umkm}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                      {umkm.deskripsi}
                    </p>

                    {/* Location */}
                    <div className="flex items-start text-sm text-gray-500 mb-3">
                      <FiMapPin className="mr-2 mt-1 flex-shrink-0 text-blue-500" />
                      <span className="line-clamp-2">{umkm.alamat}</span>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center space-x-4 mb-4 text-sm">
                      {umkm.kontak.telepon && (
                        <div className="flex items-center text-gray-500">
                          <FiPhone className="mr-1 text-blue-500" />
                          <span>Telepon</span>
                        </div>
                      )}
                      {umkm.kontak.instagram && (
                        <div className="flex items-center text-gray-500">
                          <FiInstagram className="mr-1 text-pink-500" />
                          <span>Instagram</span>
                        </div>
                      )}
                    </div>

                    {/* Payment Methods */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {umkm.pembayaran.slice(0, 3).map((metode) => (
                        <span
                          key={metode}
                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded"
                        >
                          {metode}
                        </span>
                      ))}
                      {umkm.pembayaran.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          +{umkm.pembayaran.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Views */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center text-gray-500 text-sm">
                        <FiEye className="mr-2" />
                        <span>{umkm.views.toLocaleString()} views</span>
                      </div>
                      <span className="text-blue-600 font-semibold text-sm">
                        Lihat Detail →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/img/logo.png" alt="SoraUMKM" className="h-10 w-10" />
                <span className="text-2xl font-bold">SoraUMKM</span>
              </div>
              <p className="text-gray-400 text-sm">
                Platform terpercaya untuk menemukan dan mendukung UMKM lokal di kawasan Solo Raya.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Navigasi</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/user/home" className="hover:text-white transition-colors">Jelajah UMKM</Link></li>
                <li><Link href="/user/register" className="hover:text-white transition-colors">Daftar UMKM</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login Admin</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Kategori</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Kuliner</li>
                <li>Fashion</li>
                <li>Kerajinan</li>
                <li>Jasa</li>
                <li>Agribisnis & Pertanian</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Wilayah Solo Raya</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Surakarta</li>
                <li>Sukoharjo</li>
                <li>Karanganyar</li>
                <li>Boyolali</li>
                <li>Sragen</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 SoraUMKM. Platform UMKM Solo Raya - Mendukung Ekonomi Lokal.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
