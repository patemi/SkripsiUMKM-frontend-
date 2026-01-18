'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiMapPin, FiArrowUp, FiDownload } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { UMKM } from '@/types';
import { API_URL } from '@/lib/api';
import Pagination from '@/components/Pagination';

export default function UMKMManagementPage() {
  const [umkmList, setUmkmList] = useState<UMKM[]>([]);
  const [filteredUmkmList, setFilteredUmkmList] = useState<UMKM[]>([]);
  const [selectedUMKM, setSelectedUMKM] = useState<UMKM | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState<string>('Semua');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Daftar kategori yang tersedia (sesuai dengan dashboard)
  const kategoriList = ['Semua', 'Kuliner', 'Fashion', 'Kerajinan', 'Jasa', 'Agribisnis & Pertanian', 'Toko Kelontong'];

  useEffect(() => {
    fetchUMKM();
  }, []);

  useEffect(() => {
    // Filter UMKM berdasarkan kategori yang dipilih
    if (selectedKategori === 'Semua') {
      // Sort by views descending
      const sorted = [...umkmList].sort((a, b) => b.views - a.views);
      setFilteredUmkmList(sorted);
    } else {
      const filtered = umkmList.filter(umkm => umkm.kategori === selectedKategori);
      // Sort filtered results by views descending
      const sortedFiltered = filtered.sort((a, b) => b.views - a.views);
      setFilteredUmkmList(sortedFiltered);
    }
  }, [selectedKategori, umkmList]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedKategori]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUmkmList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredUmkmList.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    // Handle scroll event untuk show/hide scroll to top button
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          namaUser: item.nama_user || 'Admin',
        }));

        // Sort by views descending (tertinggi ke terendah)
        const sortedData = mappedData.sort((a: any, b: any) => b.views - a.views);

        setUmkmList(sortedData);
        setFilteredUmkmList(sortedData); // Set initial filtered list
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kelola UMKM</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manajemen data UMKM yang telah disetujui</p>
        </div>
        <Link href="/admin/umkm/create" className="w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full sm:w-auto">
            <FiPlus className="mr-2" size={18} />
            Tambah UMKM Baru
          </Button>
        </Link>
        <a
          href={`${API_URL}/export/umkm`}
          target="_blank"
          className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
        >
          <FiDownload className="mr-2" size={18} />
          Export Excel
        </a>
      </div>

      {/* Filter Section */}
      <Card>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Filter Berdasarkan Kategori</h3>
              <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">Pilih kategori untuk menampilkan UMKM tertentu</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3">{kategoriList.map((kategori) => {
            const count = kategori === 'Semua'
              ? umkmList.length
              : umkmList.filter(u => u.kategori === kategori).length;
            const isActive = selectedKategori === kategori;

            return (
              <button
                key={kategori}
                onClick={() => setSelectedKategori(kategori)}
                className={`relative px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 text-left ${isActive
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
                  }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-semibold truncate">{kategori}</span>
                  <span className={`text-lg sm:text-xl font-bold mt-0.5 sm:mt-1 ${isActive ? 'text-white' : 'text-blue-600'
                    }`}>
                    {count}
                  </span>
                  <span className={`text-[10px] sm:text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                    {count === 1 ? 'UMKM' : 'UMKM'}
                  </span>
                </div>
                {isActive && (
                  <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Daftar UMKM</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Menampilkan {filteredUmkmList.length} dari {umkmList.length} UMKM
            {selectedKategori !== 'Semua' && (
              <span className="ml-1 font-semibold text-blue-600">
                (Kategori: {selectedKategori})
              </span>
            )}
          </p>
        </div>

        {filteredUmkmList.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-lg">
            <FiMapPin className="mx-auto text-gray-300 mb-4" size={60} />
            <p className="text-lg sm:text-xl font-semibold text-gray-700">
              {umkmList.length === 0 ? 'Belum ada UMKM' : `Tidak ada UMKM dengan kategori "${selectedKategori}"`}
            </p>
            <p className="text-sm sm:text-base text-gray-500 mt-2 mb-6 px-4">
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
          <>
            <div className="hidden md:block overflow-x-auto">
              <Table headers={['Nama UMKM', 'Kategori', 'Ditambahkan Oleh', 'Alamat', 'Kontak', 'Views', 'Aksi']}>
                {paginatedItems.map((umkm) => (
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
                      <span className="text-sm text-blue-600 font-medium">{(umkm as any).namaUser}</span>
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {paginatedItems.map((umkm) => (
                <div key={umkm.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                      {umkm.nama.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{umkm.nama}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {umkm.kategori}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <FiEye size={12} />
                          <span className="text-xs font-semibold">{umkm.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 font-medium w-20 flex-shrink-0">Ditambah:</span>
                      <span className="text-blue-600 font-medium">{(umkm as any).namaUser}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 font-medium w-20 flex-shrink-0">Alamat:</span>
                      <span className="text-gray-900 line-clamp-2">{umkm.alamat}</span>
                    </div>
                    {(umkm.kontak.telepon || umkm.kontak.whatsapp) && (
                      <div className="flex items-start gap-2">
                        <span className="text-gray-500 font-medium w-20 flex-shrink-0">Kontak:</span>
                        <span className="text-gray-900">
                          {umkm.kontak.telepon ? `📞 ${umkm.kontak.telepon}` : `💬 ${umkm.kontak.whatsapp}`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <Link href={`/admin/umkm/${umkm.id}/edit`} className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full hover:bg-blue-50">
                        <FiEdit2 size={14} className="mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedUMKM(umkm);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FiTrash2 size={14} className="mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredUmkmList.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Konfirmasi Hapus"
      >
        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus UMKM <strong>{selectedUMKM?.nama}</strong>?
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Hapus
          </Button>
        </div>
      </Modal>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <FiArrowUp size={24} />
        </button>
      )}
    </div>
  );
}
