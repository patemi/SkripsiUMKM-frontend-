'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiMapPin, FiPhone, FiMail, FiInstagram, FiFacebook, FiClock, FiEye, FiExternalLink } from 'react-icons/fi';
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
    email?: string;
    instagram?: string;
    facebook?: string;
  };
  views: number;
}

const hariIndonesia: { [key: string]: string } = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
  sabtu: 'Sabtu',
  minggu: 'Minggu',
};

export default function UMKMDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [umkm, setUmkm] = useState<UMKM | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchUMKMDetail();
    }
  }, [params.id]);

  const fetchUMKMDetail = async () => {
    try {
      // Fetch detail
      const res = await fetch(`${API_URL}/umkm/${params.id}`);
      const response = await res.json();

      if (response.success) {
        setUmkm(response.data);
        
        // Increment view count
        await fetch(`${API_URL}/umkm/${params.id}/view`, {
          method: 'POST',
        });
      } else {
        alert('UMKM tidak ditemukan');
        router.push('/user/home');
      }
    } catch (error) {
      console.error('Error fetching UMKM:', error);
      alert('Gagal memuat data UMKM');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat detail UMKM...</p>
        </div>
      </div>
    );
  }

  if (!umkm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">UMKM tidak ditemukan</p>
          <Link href="/user/home" className="text-blue-600 hover:text-blue-700">
            Kembali ke Beranda
          </Link>
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
            <Link href="/user/home" className="flex items-center text-gray-700 hover:text-blue-600 transition-colors">
              <FiArrowLeft className="mr-2" />
              Kembali
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-96 bg-gradient-to-br from-blue-400 to-indigo-500">
            {umkm.foto_umkm && umkm.foto_umkm.length > 0 ? (
              <>
                <img
                  src={umkm.foto_umkm[currentImageIndex]}
                  alt={umkm.nama_umkm}
                  className="w-full h-full object-cover"
                />
                {umkm.foto_umkm.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {umkm.foto_umkm.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-9xl font-bold text-white opacity-50">
                  {umkm.nama_umkm.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Category */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="px-4 py-2 bg-blue-100 text-blue-600 text-sm font-bold rounded-full">
                    {umkm.kategori}
                  </span>
                  <h1 className="text-4xl font-bold text-gray-900 mt-4">{umkm.nama_umkm}</h1>
                </div>
                <div className="flex items-center text-gray-500">
                  <FiEye className="mr-2" />
                  <span className="font-semibold">{umkm.views.toLocaleString()} views</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-lg leading-relaxed">{umkm.deskripsi}</p>
            </div>

            {/* Jam Operasional */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                <FiClock className="text-blue-600 text-2xl mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Jam Operasional</h2>
              </div>
              <div className="space-y-3">
                {Object.entries(umkm.jam_operasional).map(([hari, jam]) => (
                  <div key={hari} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                    <span className="font-semibold text-gray-700 capitalize">{hariIndonesia[hari] || hari}</span>
                    <span className={`font-medium ${jam.toLowerCase() === 'tutup' ? 'text-red-500' : 'text-green-600'}`}>
                      {jam}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Metode Pembayaran</h2>
              <div className="flex flex-wrap gap-3">
                {umkm.pembayaran.map((metode) => (
                  <span
                    key={metode}
                    className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-semibold rounded-xl border-2 border-blue-200"
                  >
                    {metode}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <FiMapPin className="text-blue-600 text-xl mr-2" />
                <h3 className="text-xl font-bold text-gray-900">Lokasi</h3>
              </div>
              <p className="text-gray-600 mb-4">{umkm.alamat}</p>
              {umkm.maps && (
                <a
                  href={umkm.maps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <FiExternalLink className="mr-2" />
                  Buka di Maps
                </a>
              )}
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Kontak</h3>
              <div className="space-y-3">
                {umkm.kontak.telepon && (
                  <a
                    href={`tel:${umkm.kontak.telepon}`}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
                  >
                    <FiPhone className="mr-3 text-blue-600" />
                    <span>{umkm.kontak.telepon}</span>
                  </a>
                )}
                {umkm.kontak.whatsapp && (
                  <a
                    href={`https://wa.me/${umkm.kontak.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-green-600 transition-colors py-2"
                  >
                    <FiPhone className="mr-3 text-green-600" />
                    <span>WhatsApp: {umkm.kontak.whatsapp}</span>
                  </a>
                )}
                {umkm.kontak.email && (
                  <a
                    href={`mailto:${umkm.kontak.email}`}
                    className="flex items-center text-gray-700 hover:text-blue-600 transition-colors py-2"
                  >
                    <FiMail className="mr-3 text-blue-600" />
                    <span>{umkm.kontak.email}</span>
                  </a>
                )}
                {umkm.kontak.instagram && (
                  <a
                    href={`https://instagram.com/${umkm.kontak.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-pink-600 transition-colors py-2"
                  >
                    <FiInstagram className="mr-3 text-pink-600" />
                    <span>{umkm.kontak.instagram}</span>
                  </a>
                )}
                {umkm.kontak.facebook && (
                  <a
                    href={`https://facebook.com/${umkm.kontak.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-blue-700 transition-colors py-2"
                  >
                    <FiFacebook className="mr-3 text-blue-700" />
                    <span>{umkm.kontak.facebook}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
