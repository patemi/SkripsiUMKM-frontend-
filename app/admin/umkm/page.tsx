'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMapPin } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { UMKM } from '@/types';
import { API_URL } from '@/lib/api';

export default function UMKMManagementPage() {
  const [umkmList, setUmkmList] = useState<UMKM[]>([]);
  const [filteredUmkmList, setFilteredUmkmList] = useState<UMKM[]>([]);
  const [selectedUMKM, setSelectedUMKM] = useState<UMKM | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  
  // Daftar kategori yang tersedia (sesuai dengan dashboard)
  const kategoriList = ['Semua', 'Kuliner', 'Fashion', 'Kerajinan', 'Jasa', 'Agribisnis & Pertanian', 'Toko Kelontong'];

  useEffect(() => {
    fetchUMKM();
  }, []);

  useEffect(() => {
    // Filter UMKM berdasarkan kategori yang dipilih
    if (selectedKategori === 'Semua') {
      setFilteredUmkmList(umkmList);
    } else {
      const filtered = umkmList.filter(umkm => umkm.kategori === selectedKategori);
      setFilteredUmkmList(filtered);
    }
  }, [selectedKategori, umkmList]);

  const fetchUMKM = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/umkm?status=approved`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      const response = await res.json();
      
      if (response.success) {
        // Map backend data to frontend format
        const mappedData = response.data.map((item: any) => ({
          id: item._id,
          nama: item.nama_umkm,
          kategori: item.kategori,
          deskripsi: item.deskripsi,
          alamat: item.alamat,
          linkMaps: item.maps || '',
          foto: item.foto_umkm || [],
          metodePembayaran: item.pembayaran || [],
          jamOperasional: item.jam_operasional || {},
          kontak: item.kontak || {},
          status: item.status,
          views: item.views || 0,
          userId: item.user_id,
        }));
        setUmkmList(mappedData);
        setFilteredUmkmList(mappedData); // Set initial filtered list
      }
    } catch (error) {
      console.error('Error fetching UMKM:', error);
      alert('Gagal memuat data UMKM');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUMKM) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Session expired. Silakan login kembali.');
        return;
      }

      const res = await fetch(`${API_URL}/umkm/${selectedUMKM.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      const data = await res.json();

      if (data.success) {
        alert('UMKM berhasil dihapus');
        setShowDeleteModal(false);
        fetchUMKM();
      } else {
        alert(data.message || 'Gagal menghapus UMKM');
      }
    } catch (error) {
      console.error('Error deleting UMKM:', error);
      alert('Gagal menghapus UMKM');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola UMKM</h1>
          <p className="text-gray-600 mt-1">Manajemen data UMKM yang telah disetujui</p>
        </div>
        <Link href="/admin/umkm/create">
          <Button variant="primary" size="md">
            <FiPlus className="mr-2" size={18} />
            Tambah UMKM Baru
          </Button>
        </Link>
      </div>

      {/* Filter Section */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Filter Berdasarkan Kategori</h3>
              <p className="text-sm text-gray-500">Pilih kategori untuk menampilkan UMKM tertentu</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {kategoriList.map((kategori) => {
              const count = kategori === 'Semua' 
                ? umkmList.length 
                : umkmList.filter(u => u.kategori === kategori).length;
              const isActive = selectedKategori === kategori;
              
              return (
                <button
                  key={kategori}
                  onClick={() => setSelectedKategori(kategori)}
                  className={`relative px-4 py-3 rounded-xl font-medium transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold truncate">{kategori}</span>
                    <span className={`text-xl font-bold mt-1 ${
                      isActive ? 'text-white' : 'text-blue-600'
                    }`}>
                      {count}
                    </span>
                    <span className={`text-xs ${
                      isActive ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {count === 1 ? 'UMKM' : 'UMKM'}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* UMKM List */}
      <Card>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Daftar UMKM</h2>
          <p className="text-sm text-gray-600 mt-1">
            Menampilkan {filteredUmkmList.length} dari {umkmList.length} UMKM
            {selectedKategori !== 'Semua' && (
              <span className="ml-1 font-semibold text-blue-600">
                (Kategori: {selectedKategori})
              </span>
            )}
          </p>
        </div>
        
        {filteredUmkmList.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <FiMapPin className="mx-auto text-gray-300 mb-4" size={80} />
            <p className="text-xl font-semibold text-gray-700">
              {umkmList.length === 0 ? 'Belum ada UMKM' : `Tidak ada UMKM dengan kategori "${selectedKategori}"`}
            </p>
            <p className="text-gray-500 mt-2 mb-6">
              {umkmList.length === 0 
                ? 'Mulai tambahkan UMKM baru untuk ditampilkan'
                : 'Coba pilih kategori lain atau tambahkan UMKM baru'
              }
            </p>
            {umkmList.length === 0 && (
              <Link href="/admin/umkm/create">
                <Button variant="primary">
                  <FiPlus className="mr-2" />
                  Tambah UMKM Pertama
                </Button>
              </Link>
            )}
            {umkmList.length > 0 && selectedKategori !== 'Semua' && (
              <Button variant="secondary" onClick={() => setSelectedKategori('Semua')}>
                Lihat Semua UMKM
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table headers={['Nama UMKM', 'Kategori', 'Alamat', 'Kontak', 'Views', 'Aksi']}>
              {filteredUmkmList.map((umkm) => (
                <tr key={umkm.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {umkm.nama.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{umkm.nama}</div>
                        <div className="text-xs text-gray-500">ID: {umkm.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 inline-block">
                      {umkm.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <p className="text-sm text-gray-900 truncate">{umkm.alamat}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex flex-col gap-1">
                      {umkm.kontak.telepon && (
                        <span className="text-xs">📞 {umkm.kontak.telepon}</span>
                      )}
                      {umkm.kontak.whatsapp && !umkm.kontak.telepon && (
                        <span className="text-xs">💬 {umkm.kontak.whatsapp}</span>
                      )}
                      {!umkm.kontak.telepon && !umkm.kontak.whatsapp && (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FiEye className="text-gray-500" size={16} />
                      <span className="font-semibold text-gray-700">{umkm.views}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link href={`/admin/umkm/${umkm.id}/edit`}>
                        <Button variant="secondary" size="sm" className="hover:bg-blue-50">
                          <FiEdit2 size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedUMKM(umkm);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FiTrash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus UMKM"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiTrash2 className="text-red-600" size={24} />
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Hapus UMKM</p>
              <p className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">UMKM yang akan dihapus:</p>
            <p className="text-lg font-bold text-gray-900">{selectedUMKM?.nama}</p>
            <p className="text-sm text-gray-600 mt-1">Kategori: {selectedUMKM?.kategori}</p>
          </div>
          
          <p className="text-sm text-gray-700">
            Apakah Anda yakin ingin menghapus UMKM ini? 
            Semua data terkait akan dihapus secara permanen.
          </p>
          
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              <FiTrash2 className="mr-2" size={16} />
              Ya, Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
