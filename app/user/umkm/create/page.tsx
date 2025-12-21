'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiSave, FiX, FiUpload, FiImage, FiTrash2, FiArrowLeft, FiCheckCircle, FiAlertCircle, FiAlertTriangle } from 'react-icons/fi';
import { API_URL } from '@/lib/api';

const kategoriOptions = [
  'Kuliner',
  'Fashion',
  'Kerajinan',
  'Jasa',
  'Agribisnis & Pertanian',
  'Toko Kelontong',
];

const hariOptions = [
  { key: 'senin', label: 'Senin' },
  { key: 'selasa', label: 'Selasa' },
  { key: 'rabu', label: 'Rabu' },
  { key: 'kamis', label: 'Kamis' },
  { key: 'jumat', label: 'Jumat' },
  { key: 'sabtu', label: 'Sabtu' },
  { key: 'minggu', label: 'Minggu' },
];

export default function CreateUMKMUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [fotoUrls, setFotoUrls] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [userData, setUserData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'Kuliner',
    deskripsi: '',
    alamat: '',
    linkMaps: '',
    telepon: '',
    whatsapp: '',
    instagram: '',
  });
  
  const [metodePembayaran, setMetodePembayaran] = useState<string[]>([]);
  const [jamOperasional, setJamOperasional] = useState<{ [key: string]: string }>({});
  const [jamOperasionalBackup, setJamOperasionalBackup] = useState<{ [key: string]: string }>({});
  const [metodePembayaranError, setMetodePembayaranError] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is logged in
    const userToken = localStorage.getItem('userToken');
    const userDataStr = localStorage.getItem('userData');
    
    if (!userToken) {
      setErrorMessage('Anda harus login terlebih dahulu');
      setShowError(true);
      setTimeout(() => {
        router.push('/user/login');
      }, 2000);
      return;
    }

    if (userDataStr) {
      try {
        setUserData(JSON.parse(userDataStr));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [router]);

  // Fungsi untuk compress gambar dengan kompresi sangat agresif
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Kompresi sangat agresif untuk semua ukuran file
          const fileSizeInMB = file.size / (1024 * 1024);
          let maxDimension = 1200; // Max dimension
          let quality = 0.7; // Quality awal

          // Strategi kompresi berdasarkan ukuran file - lebih agresif
          if (fileSizeInMB > 10) {
            maxDimension = 700;
            quality = 0.35;
          } else if (fileSizeInMB > 5) {
            maxDimension = 800;
            quality = 0.45;
          } else if (fileSizeInMB > 3) {
            maxDimension = 900;
            quality = 0.55;
          } else if (fileSizeInMB > 1) {
            maxDimension = 1000;
            quality = 0.6;
          }

          console.log(`📸 Original: ${fileSizeInMB.toFixed(2)}MB, ${img.width}x${img.height}px`);
          console.log(`🎯 Target: max ${maxDimension}px, quality ${quality}`);

          // Resize proporsional
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Improve image quality saat resize
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);
            
            // Fungsi rekursif untuk compress sampai ukuran < 1MB
            const compressRecursive = (currentQuality: number, attempt: number = 1) => {
              if (attempt > 5) {
                // Sudah 5 kali coba, gunakan hasil terakhir
                canvas.toBlob(
                  (finalBlob) => {
                    if (finalBlob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const finalSize = finalBlob.size / (1024 * 1024);
                        console.log(`✅ Final (attempt ${attempt}): ${finalSize.toFixed(2)}MB, quality ${currentQuality}`);
                        resolve(reader.result as string);
                      };
                      reader.readAsDataURL(finalBlob);
                    } else {
                      reject(new Error('Gagal compress gambar'));
                    }
                  },
                  'image/jpeg',
                  0.25 // Minimum quality
                );
                return;
              }

              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    const compressedSizeInMB = blob.size / (1024 * 1024);
                    console.log(`🔄 Attempt ${attempt}: ${compressedSizeInMB.toFixed(2)}MB, quality ${currentQuality}`);
                    
                    // Target: < 600KB per foto untuk 5 foto = 3MB total (aman)
                    if (compressedSizeInMB <= 0.6) {
                      // Size OK, gunakan hasil ini
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        console.log(`✅ Success! Final: ${compressedSizeInMB.toFixed(2)}MB`);
                        resolve(reader.result as string);
                      };
                      reader.readAsDataURL(blob);
                    } else {
                      // Masih terlalu besar, compress lagi dengan quality lebih rendah
                      const newQuality = Math.max(currentQuality - 0.1, 0.25);
                      console.log(`⚠️ Too large, trying quality ${newQuality}...`);
                      compressRecursive(newQuality, attempt + 1);
                    }
                  } else {
                    reject(new Error('Gagal compress gambar'));
                  }
                },
                'image/jpeg',
                currentQuality
              );
            };

            // Mulai kompresi rekursif
            compressRecursive(quality);
          } else {
            reject(new Error('Canvas context tidak tersedia'));
          }
        };
        img.onerror = () => reject(new Error('Gagal load gambar'));
      };
      reader.onerror = () => reject(new Error('Gagal read file'));
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      
      // Cek total foto tidak lebih dari 5
      if (fotoUrls.length + fileArray.length > 5) {
        setWarningMessage('Maksimal 5 foto. Anda sudah memiliki ' + fotoUrls.length + ' foto.');
        setShowWarning(true);
        return;
      }

      setUploadingImages(true);

      // Compress setiap gambar
      const compressPromises = fileArray.map(async (file) => {
        try {
          // Cek ukuran file
          const fileSizeInMB = file.size / (1024 * 1024);
          console.log(`📸 ${file.name} - Original: ${fileSizeInMB.toFixed(2)} MB`);

          // Compress gambar dengan parameter baru (tanpa parameter)
          const compressedImage = await compressImage(file);
          
          // Hitung ukuran setelah compress (estimasi dari base64)
          const base64Length = compressedImage.length;
          const compressedSizeInMB = (base64Length * 0.75) / (1024 * 1024);
          console.log(`✅ ${file.name} - Compressed: ${compressedSizeInMB.toFixed(2)} MB (${((1 - compressedSizeInMB/fileSizeInMB) * 100).toFixed(1)}% reduction)`);
          
          return compressedImage;
        } catch (error) {
          console.error('Error compressing image:', error);
          setErrorMessage('Gagal mengkompresi gambar: ' + file.name);
          setShowError(true);
          return null;
        }
      });

      const compressedImages = await Promise.all(compressPromises);
      const validImages = compressedImages.filter((img) => img !== null) as string[];
      
      if (validImages.length > 0) {
        setFotoUrls((prev) => [...prev, ...validImages]);
        console.log(`✅ Total ${validImages.length} gambar berhasil dikompres dan ditambahkan`);
      }
      
      setUploadingImages(false);
    }
    
    // Reset input
    e.target.value = '';
  };

  const removeFoto = (index: number) => {
    setFotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi
    if (metodePembayaran.length === 0) {
      setMetodePembayaranError(true);
      setWarningMessage('Pilih minimal 1 metode pembayaran!');
      setShowWarning(true);
      document.getElementById('metode-pembayaran')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Validasi jam operasional - minimal 1 hari harus diisi
    const hasJamOperasional = Object.values(jamOperasional).some(
      (jam) => jam && jam !== 'Tutup'
    );
    if (!hasJamOperasional) {
      setWarningMessage('Pilih minimal 1 hari operasional!');
      setShowWarning(true);
      document.getElementById('jam-operasional')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (fotoUrls.length === 0) {
      setWarningMessage('Upload minimal 1 foto UMKM!');
      setShowWarning(true);
      return;
    }
    
    setLoading(true);

    try {
      const userToken = localStorage.getItem('userToken');
      
      if (!userToken) {
        setErrorMessage('Session expired. Silakan login kembali.');
        setShowError(true);
        setTimeout(() => {
          router.push('/user/login');
        }, 2000);
        return;
      }

      // Prepare data
      const umkmData = {
        nama_umkm: formData.nama,
        kategori: formData.kategori,
        deskripsi: formData.deskripsi,
        pembayaran: metodePembayaran,
        alamat: formData.alamat,
        maps: formData.linkMaps,
        foto_umkm: fotoUrls,
        jam_operasional: jamOperasional,
        kontak: {
          telepon: formData.telepon,
          whatsapp: formData.whatsapp,
          instagram: formData.instagram,
        },
        status: 'pending', // Status pending untuk verifikasi admin
        user_id: userData?._id || userData?.id, // ID user yang menambahkan (support both _id and id)
        nama_user: userData?.nama_user, // Nama user yang menambahkan
      };

      console.log('📤 Sending UMKM data with user_id:', umkmData.user_id);
      console.log('📤 User name:', umkmData.nama_user);

      const response = await fetch(`${API_URL}/umkm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify(umkmData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal menambahkan UMKM');
      }

      // Show success modal
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/user/home');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating UMKM:', error);
      setErrorMessage(error.message || 'Terjadi kesalahan saat menambahkan UMKM');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleMetodePembayaran = (metode: string) => {
    setMetodePembayaranError(false);
    if (metodePembayaran.includes(metode)) {
      setMetodePembayaran(metodePembayaran.filter((m) => m !== metode));
    } else {
      setMetodePembayaran([...metodePembayaran, metode]);
    }
  };

  const handleMetodePembayaranChange = (metode: string) => {
    setMetodePembayaranError(false);
    if (metodePembayaran.includes(metode)) {
      setMetodePembayaran(metodePembayaran.filter((m) => m !== metode));
    } else {
      setMetodePembayaran([...metodePembayaran, metode]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-green-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6 shadow-lg">
                <FiCheckCircle className="h-12 w-12 text-white animate-scaleIn" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3">
                UMKM Berhasil Ditambahkan!
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Data UMKM Anda sedang menunggu verifikasi admin ✨
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-center space-x-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600 absolute top-0 left-0"></div>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-blue-700 block">Kembali ke halaman utama</span>
                    <span className="text-xs text-blue-500">Mohon tunggu sebentar...</span>
                  </div>
                </div>
                
                <div className="mt-4 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-progressBar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-red-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 mb-6 shadow-lg">
                <FiAlertCircle className="h-12 w-12 text-white animate-scaleIn" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-3">
                Oops! Ada Masalah
              </h3>
              <p className="text-gray-600 mb-8 text-base leading-relaxed">
                {errorMessage}
              </p>
              
              <button
                onClick={() => setShowError(false)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-yellow-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 shadow-lg">
                <FiAlertTriangle className="h-12 w-12 text-white animate-pulse" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
                Perhatian!
              </h3>
              <p className="text-gray-600 mb-8 text-base leading-relaxed">
                {warningMessage}
              </p>
              
              <button
                onClick={() => setShowWarning(false)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                OK, Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/user/home" className="flex items-center space-x-2 sm:space-x-3">
              <img src="/img/logo.png" alt="SoraUMKM" className="h-8 w-8 sm:h-10 sm:w-10" />
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SoraUMKM
              </span>
            </Link>
            <Link
              href="/user/home"
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
            >
              <FiArrowLeft size={18} />
              <span className="hidden sm:inline">Kembali</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between border-b pb-4 sm:pb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tambah UMKM Baru</h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Lengkapi formulir di bawah untuk menambahkan UMKM Anda. Data akan diverifikasi oleh admin sebelum ditampilkan.</p>
                </div>
              </div>

              {/* Upload Foto */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Foto UMKM</h2>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors">
                    <div className="text-center">
                      <FiImage className="mx-auto text-gray-400 mb-4" size={48} />
                      <div className="mt-2 block text-sm font-medium text-gray-900">
                        Upload Foto UMKM
                      </div>
                      <div className="mt-1 block text-xs text-gray-500 mb-4">
                        PNG, JPG, JPEG hingga 10MB (Max 5 foto)
                        <br />
                        <span className="text-green-600 font-medium">✓ Gambar akan dikompres otomatis</span>
                      </div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleFileUpload}
                          disabled={fotoUrls.length >= 5 || uploadingImages}
                        />
                        <span className={`inline-flex items-center px-4 py-2 border-2 rounded-lg transition-colors text-sm font-medium ${
                          uploadingImages 
                            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : fotoUrls.length >= 5
                            ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                            : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                        }`}>
                          {uploadingImages ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                              Mengkompresi...
                            </>
                          ) : (
                            <>
                              <FiUpload className="mr-2" />
                              {fotoUrls.length >= 5 ? 'Maksimal 5 Foto' : 'Pilih Foto'}
                            </>
                          )}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Preview Foto */}
                  {fotoUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {fotoUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-40 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeFoto(index)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <FiTrash2 size={16} />
                          </button>
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Foto {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
                {/* Informasi Dasar */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama UMKM <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Masukkan nama UMKM"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      {kategoriOptions.map((kat) => (
                        <option key={kat} value={kat}>{kat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Deskripsikan UMKM Anda"
                  />
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lokasi</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alamat <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.alamat}
                      onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Link Google Maps <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.linkMaps}
                      onChange={(e) => setFormData({ ...formData, linkMaps: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="https://maps.google.com/..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Membantu pelanggan menemukan lokasi Anda
                    </p>
                  </div>
                </div>
              </div>

              {/* Kontak */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontak</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telepon
                    </label>
                    <input
                      type="tel"
                      value={formData.telepon}
                      onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="08123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="08123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      placeholder="@username"
                    />
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div id="metode-pembayaran">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Metode Pembayaran <span className="text-red-600">*</span>
                  </h2>
                  {metodePembayaranError && (
                    <span className="text-sm text-red-600 font-medium animate-pulse">
                      Pilih minimal 1 metode!
                    </span>
                  )}
                </div>
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-lg border-2 transition-colors ${
                  metodePembayaranError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  {['Tunai', 'QRIS', 'Debit'].map((metode) => (
                    <label 
                      key={metode} 
                      className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                        metodePembayaran.includes(metode)
                          ? 'bg-blue-50 border-blue-500'
                          : metodePembayaranError
                          ? 'bg-white border-red-200 hover:border-red-300'
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={metodePembayaran.includes(metode)}
                        onChange={() => handleMetodePembayaranChange(metode)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${
                        metodePembayaran.includes(metode) ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                        {metode}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Jam Operasional */}
              <div id="jam-operasional">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Jam Operasional <span className="text-red-500">*</span>
                </h2>
                <div className="space-y-3">
                  {hariOptions.map((hari) => (
                    <div key={hari.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-3 md:w-32">
                          <input
                            type="checkbox"
                            checked={jamOperasional[hari.key] !== undefined && jamOperasional[hari.key] !== 'Tutup'}
                            onChange={(e) => {
                              const newValue = e.target.checked ? '08:00 - 17:00' : 'Tutup';
                              const newJam = { ...jamOperasional, [hari.key]: newValue };
                              setJamOperasional(newJam);
                              // Auto-save backup on first interaction
                              if (Object.keys(jamOperasionalBackup).length === 0) {
                                setJamOperasionalBackup(jamOperasional);
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label className="text-sm font-semibold text-gray-700">
                            {hari.label}
                          </label>
                        </div>
                        
                        {jamOperasional[hari.key] !== 'Tutup' && jamOperasional[hari.key] !== undefined ? (
                          <div className="flex-1 flex items-center gap-3">
                            {jamOperasional[hari.key] === '24 Jam' ? (
                              <div className="flex-1 flex items-center justify-between">
                                <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg">
                                  ⏰ Buka 24 Jam
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setJamOperasional({ ...jamOperasional, [hari.key]: '08:00 - 17:00' })}
                                  className="px-3 py-2 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                  Ubah Jam
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="time"
                                      value={jamOperasional[hari.key]?.split(' - ')[0] || '08:00'}
                                      onChange={(e) => {
                                        const endTime = jamOperasional[hari.key]?.split(' - ')[1] || '17:00';
                                        setJamOperasional({ ...jamOperasional, [hari.key]: `${e.target.value} - ${endTime}` });
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <span className="text-gray-500 font-medium">-</span>
                                    <input
                                      type="time"
                                      value={jamOperasional[hari.key]?.split(' - ')[1] || '17:00'}
                                      onChange={(e) => {
                                        const startTime = jamOperasional[hari.key]?.split(' - ')[0] || '08:00';
                                        setJamOperasional({ ...jamOperasional, [hari.key]: `${startTime} - ${e.target.value}` });
                                      }}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setJamOperasional({ ...jamOperasional, [hari.key]: '24 Jam' })}
                                  className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
                                >
                                  24 Jam
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1">
                            <span className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg">
                              🔒 Tutup
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const newJam: { [key: string]: string } = {};
                      hariOptions.forEach(h => {
                        newJam[h.key] = '08:00 - 17:00';
                      });
                      setJamOperasional(newJam);
                      setJamOperasionalBackup(newJam);
                    }}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Buka Semua (08:00 - 17:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newJam: { [key: string]: string } = {};
                      hariOptions.slice(0, 5).forEach(h => {
                        newJam[h.key] = '08:00 - 17:00';
                      });
                      hariOptions.slice(5).forEach(h => {
                        newJam[h.key] = 'Tutup';
                      });
                      setJamOperasional(newJam);
                      setJamOperasionalBackup(newJam);
                    }}
                    className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    Senin - Jumat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newJam: { [key: string]: string } = {};
                      hariOptions.forEach(h => {
                        newJam[h.key] = 'Tutup';
                      });
                      setJamOperasional(newJam);
                      setJamOperasionalBackup(newJam);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Tutup Semua
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  💡 Tips: Centang hari untuk membuka, lalu atur jam buka atau pilih "24 Jam"
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <Link
                  href="/user/home"
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors flex items-center space-x-2"
                >
                  <FiX />
                  <span>Batal</span>
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <FiSave />
                      <span>Simpan UMKM</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
