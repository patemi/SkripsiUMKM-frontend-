'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiMapPin, FiPhone, FiMail, FiInstagram, FiFacebook, FiClock, FiEye, FiExternalLink, FiChevronLeft, FiChevronRight, FiX, FiMaximize2 } from 'react-icons/fi';
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
  nama_user?: string;
  createdAt?: string;
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
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const viewCountedRef = useRef(false);

  useEffect(() => {
    if (params.id) {
      fetchUMKMDetail();
    }

    // Increment view count ONLY when user leaves the page (unmount)
    return () => {
      if (params.id && !viewCountedRef.current) {
        viewCountedRef.current = true;
        
        // Use sendBeacon for reliable execution on page unload
        if (navigator.sendBeacon) {
          navigator.sendBeacon(`${API_URL}/umkm/${params.id}/view`, '');
        } else {
          // Fallback for browsers that don't support sendBeacon
          fetch(`${API_URL}/umkm/${params.id}/view`, {
            method: 'POST',
            keepalive: true
          }).catch(() => {});
        }
      }
    };
  }, [params.id]);

  const fetchUMKMDetail = async () => {
    try {
      // Fetch detail ONLY - do NOT increment view here
      const res = await fetch(`${API_URL}/umkm/${params.id}`);
      const response = await res.json();

      if (response.success) {
        setUmkm(response.data);
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

  const nextImage = () => {
    if (umkm?.foto_umkm) {
      setCurrentImageIndex((prev) => (prev + 1) % umkm.foto_umkm.length);
    }
  };

  const prevImage = () => {
    if (umkm?.foto_umkm) {
      setCurrentImageIndex((prev) => (prev - 1 + umkm.foto_umkm.length) % umkm.foto_umkm.length);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setShowLightbox(true);
    // Disable scrolling on body
    document.body.style.overflow = 'hidden';
  };

  const nextLightboxImage = () => {
    if (umkm?.foto_umkm) {
      setLightboxIndex((prev) => (prev + 1) % umkm.foto_umkm.length);
    }
  };

  const prevLightboxImage = () => {
    if (umkm?.foto_umkm) {
      setLightboxIndex((prev) => (prev - 1 + umkm.foto_umkm.length) % umkm.foto_umkm.length);
    }
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    // Re-enable scrolling on body
    document.body.style.overflow = 'auto';
  };

  const toggleZoom = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsZoomed((prev) => {
      if (!prev) {
        // Reset pan position saat zoom in
        setPanPosition({ x: 0, y: 0 });
      }
      return !prev;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isZoomed) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isZoomed) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!showLightbox) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        nextLightboxImage();
      } else if (e.key === 'ArrowLeft') {
        prevLightboxImage();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, umkm?.foto_umkm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
      {/* Lightbox Modal - WhatsApp Style Fullscreen */}
      {showLightbox && umkm?.foto_umkm && (
        <div className="fixed inset-0 z-[9999] bg-black">
          {/* Main Image - Full Screen dengan Zoom & Pan */}
          <div 
            className="w-screen h-screen flex items-center justify-center overflow-hidden"
            onClick={(e) => {
              if (!isDragging) {
                toggleZoom(e);
              }
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={umkm.foto_umkm[lightboxIndex]}
              alt={`${umkm.nama_umkm} - Foto ${lightboxIndex + 1}`}
              className={`select-none ${
                isZoomed 
                  ? 'cursor-grab active:cursor-grabbing' 
                  : 'w-full h-full object-contain cursor-zoom-in'
              }`}
              style={{
                transform: isZoomed 
                  ? `scale(2.5) translate(${panPosition.x / 2.5}px, ${panPosition.y / 2.5}px)` 
                  : 'none',
                transition: isDragging ? 'none' : 'transform 0.3s ease'
              }}
              draggable={false}
            />
          </div>

          {/* Top Bar Overlay - Minimal (Hidden saat zoom) */}
          {!isZoomed && (
            <div className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-b from-black/80 to-transparent z-50 flex items-center justify-between px-4">
              <div className="text-white text-sm font-medium">
                {lightboxIndex + 1} / {umkm.foto_umkm.length}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
                className="p-2 text-white hover:bg-white/20 rounded-lg transition-all"
                title="Tutup (ESC)"
              >
                <FiX size={24} />
              </button>
            </div>
          )}

          {/* Navigation Arrows Overlay (Hidden saat zoom) */}
          {!isZoomed && umkm.foto_umkm.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightboxImage();
                }}
                className="fixed left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-lg z-50"
                title="Foto sebelumnya (←)"
              >
                <FiChevronLeft size={36} strokeWidth={2.5} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightboxImage();
                }}
                className="fixed right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-lg z-50"
                title="Foto berikutnya (→)"
              >
                <FiChevronRight size={36} strokeWidth={2.5} />
              </button>
            </>
          )}

          {/* Bottom Thumbnail Overlay (Hidden saat zoom) */}
          {!isZoomed && umkm.foto_umkm.length > 1 && (
            <div 
              className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent z-50 flex items-center justify-center"
              style={{ display: isZoomed ? 'none' : 'flex' }}
            >
              <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide max-w-full">
                {umkm.foto_umkm.map((foto, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(index);
                    }}
                    className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden transition-all ${
                      index === lightboxIndex 
                        ? 'ring-2 ring-green-400 opacity-100' 
                        : 'ring-1 ring-white/30 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <img
                      src={foto}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
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
            <button 
              onClick={() => {
                // Check if user came from UMKM Saya modal via URL
                const urlParams = new URLSearchParams(window.location.search);
                const fromMyUMKM = urlParams.get('from');
                
                if (fromMyUMKM === 'myumkm') {
                  // Navigate back with parameter to open modal
                  router.push('/user/home?openMyUMKM=true');
                } else {
                  // Normal back navigation
                  router.back();
                }
              }} 
              className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Kembali
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Image Gallery */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="relative h-[500px] bg-gradient-to-br from-blue-400 to-indigo-500">
            {umkm.foto_umkm && umkm.foto_umkm.length > 0 ? (
              <>
                {/* Main Image */}
                <div 
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => openLightbox(currentImageIndex)}
                >
                  <img
                    src={umkm.foto_umkm[currentImageIndex]}
                    alt={`${umkm.nama_umkm} - Foto ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain bg-gray-900"
                  />
                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100">
                      <div className="bg-white/90 rounded-full p-4 shadow-xl">
                        <FiMaximize2 size={32} className="text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Arrows */}
                {umkm.foto_umkm.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-xl transition-all hover:scale-110 z-10"
                    >
                      <FiChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white text-gray-800 rounded-full shadow-xl transition-all hover:scale-110 z-10"
                    >
                      <FiChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  {currentImageIndex + 1} / {umkm.foto_umkm.length}
                </div>

                {/* Dot Indicators */}
                {umkm.foto_umkm.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {umkm.foto_umkm.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-8 h-3 rounded-full' 
                            : 'bg-white/50 w-3 h-3 rounded-full hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Thumbnail Strip */}
                {umkm.foto_umkm.length > 1 && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 scrollbar-hide">
                    {umkm.foto_umkm.map((foto, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                        }}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          index === currentImageIndex 
                            ? 'border-blue-500 scale-110 shadow-lg' 
                            : 'border-white/50 hover:border-white hover:scale-105'
                        }`}
                      >
                        <img
                          src={foto}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
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
                  {umkm.nama_user && (
                    <div className="mt-3 flex items-center text-gray-600">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm">Ditambahkan oleh: <span className="font-semibold text-blue-600">{umkm.nama_user}</span></span>
                    </div>
                  )}
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
