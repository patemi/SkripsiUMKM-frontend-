'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiSave, FiX, FiUpload, FiImage, FiTrash2 } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Form';
import { KategoriUMKM, UMKM } from '@/types';
import { API_URL } from '@/lib/api';

const kategorOptions: { value: KategoriUMKM; label: string }[] = [
  { value: 'Kuliner', label: 'Kuliner' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Kerajinan', label: 'Kerajinan' },
  { value: 'Jasa', label: 'Jasa' },
  { value: 'Agribisnis & Pertanian', label: 'Agribisnis & Pertanian' },
  { value: 'Toko Kelontong', label: 'Toko Kelontong' },
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

export default function EditUMKMPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fotoUrls, setFotoUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nama: '',
    kategori: 'Kuliner' as KategoriUMKM,
    deskripsi: '',
    alamat: '',
    linkMaps: '',
    telepon: '',
    whatsapp: '',
    email: '',
    instagram: '',
    facebook: '',
  });
  
  const [metodePembayaran, setMetodePembayaran] = useState<string[]>([]);
  const [jamOperasional, setJamOperasional] = useState<{ [key: string]: string }>({});
  const [jamOperasionalBackup, setJamOperasionalBackup] = useState<{ [key: string]: string }>({});
  const [metodePembayaranError, setMetodePembayaranError] = useState<boolean>(false);

  useEffect(() => {
    fetchUMKM();
  }, []);

  const fetchUMKM = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/umkm/${params.id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      const response = await res.json();
      
      if (response.success) {
        const umkm = response.data;
        
        setFormData({
          nama: umkm.nama_umkm,
          kategori: umkm.kategori,
          deskripsi: umkm.deskripsi,
          alamat: umkm.alamat,
          linkMaps: umkm.maps || '',
          telepon: umkm.kontak?.telepon || '',
          whatsapp: umkm.kontak?.whatsapp || '',
          email: umkm.kontak?.email || '',
          instagram: umkm.kontak?.instagram || '',
          facebook: umkm.kontak?.facebook || '',
        });
        setMetodePembayaran(umkm.pembayaran || []);
        setFotoUrls(umkm.foto_umkm || []);
        setJamOperasional(umkm.jam_operasional || {});
        setJamOperasionalBackup(umkm.jam_operasional || {}); // Save backup
      }
    } catch (error) {
      console.error('Error fetching UMKM:', error);
      alert('Gagal memuat data UMKM');
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi metode pembayaran
    if (metodePembayaran.length === 0) {
      setMetodePembayaranError(true);
      alert('Pilih minimal 1 metode pembayaran!');
      // Scroll to metode pembayaran section
      document.getElementById('metode-pembayaran')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Session expired. Silakan login kembali.');
        router.push('/login');
        return;
      }

      const umkmData = {
        nama_umkm: formData.nama,
        kategori: formData.kategori,
        deskripsi: formData.deskripsi,
        pembayaran: metodePembayaran,
        alamat: formData.alamat,
        maps: formData.linkMaps,
        jam_operasional: jamOperasional,
        kontak: {
          telepon: formData.telepon,
          whatsapp: formData.whatsapp,
          email: formData.email,
          instagram: formData.instagram,
          facebook: formData.facebook,
        },
        foto_umkm: fotoUrls,
      };

      const res = await fetch(`${API_URL}/umkm/${params.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(umkmData),
      });

      const data = await res.json();

      if (data.success) {
        alert('UMKM berhasil diperbarui');
        router.push('/admin/umkm');
      } else {
        alert(data.message || 'Gagal memperbarui UMKM');
      }
    } catch (error) {
      console.error('Error updating UMKM:', error);
      alert('Terjadi kesalahan saat memperbarui UMKM');
    } finally {
      setLoading(false);
    }
  };

  const handleMetodePembayaranChange = (metode: string) => {
    setMetodePembayaran((prev) =>
      prev.includes(metode) ? prev.filter((m) => m !== metode) : [...prev, metode]
    );
    // Clear error when user selects a payment method
    setMetodePembayaranError(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFotoUrls((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFoto = (index: number) => {
    setFotoUrls((prev) => prev.filter((_, i) => i !== index));
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit UMKM</h1>
          <p className="text-gray-600 mt-1">Perbarui informasi UMKM</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <div className="space-y-6">
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
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        disabled={fotoUrls.length >= 5}
                      />
                      <span className="inline-flex items-center px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium">
                        <FiUpload className="mr-2" />
                        {fotoUrls.length >= 5 ? 'Maksimal 5 Foto' : 'Pilih Foto'}
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
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={() => removeFoto(index)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiTrash2 className="mr-2" />
                            Hapus
                          </Button>
                        </div>
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
                <Input
                  label="Nama UMKM *"
                  placeholder="Masukkan nama UMKM"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
                <Select
                  label="Kategori *"
                  options={kategorOptions}
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value as KategoriUMKM })
                  }
                  required
                />
              </div>
              <div className="mt-4">
                <Textarea
                  label="Deskripsi *"
                  placeholder="Deskripsi UMKM"
                  rows={4}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Lokasi */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lokasi</h2>
              <div className="space-y-4">
                <Textarea
                  label="Alamat *"
                  placeholder="Alamat lengkap UMKM"
                  rows={3}
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  required
                />
                <Input
                  label="Link Google Maps"
                  placeholder="https://maps.google.com/..."
                  value={formData.linkMaps}
                  onChange={(e) => setFormData({ ...formData, linkMaps: e.target.value })}
                />
              </div>
            </div>

            {/* Kontak */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Kontak</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Telepon"
                  placeholder="08xxxxxxxxxx"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                />
                <Input
                  label="WhatsApp"
                  placeholder="08xxxxxxxxxx"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Instagram"
                  placeholder="@username"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                />
                <Input
                  label="Facebook"
                  placeholder="Facebook page"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                />
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
                {['Tunai', 'QRIS', 'Debit'].map(
                  (metode) => (
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
                  )
                )}
              </div>
            </div>

            {/* Jam Operasional */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Jam Operasional</h2>
              <div className="space-y-3">
                {hariOptions.map((hari) => (
                  <div key={hari.key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex items-center gap-3 md:w-32">
                        <input
                          type="checkbox"
                          checked={jamOperasional[hari.key] !== undefined && jamOperasional[hari.key] !== 'Tutup'}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setJamOperasional({ ...jamOperasional, [hari.key]: '08:00 - 17:00' });
                            } else {
                              setJamOperasional({ ...jamOperasional, [hari.key]: 'Tutup' });
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
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Tutup Semua
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Apakah Anda yakin ingin mereset jam operasional ke data awal? Semua perubahan yang belum disimpan akan hilang.')) {
                      setJamOperasional({ ...jamOperasionalBackup });
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ml-auto flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset ke Data Awal
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={loading}
              >
                <FiX className="mr-2" />
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                <FiSave className="mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
