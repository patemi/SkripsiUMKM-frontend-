'use client';

import { useEffect, useState, Fragment } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Form';
import { UMKM } from '@/types';
import { API_URL } from '@/lib/api';

export default function VerificationPage() {
  const [pendingUMKM, setPendingUMKM] = useState<UMKM[]>([]);
  const [selectedUMKM, setSelectedUMKM] = useState<UMKM | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUMKM();
  }, []);

  const fetchPendingUMKM = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/umkm?status=pending`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      const response = await res.json();
      
      if (response.success) {
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
          namaUser: item.nama_user || 'Unknown',
          createdAt: item.createdAt,
        }));
        setPendingUMKM(mappedData);
      }
    } catch (error) {
      console.error('Error fetching pending UMKM:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (umkm: UMKM, actionType: 'approve' | 'reject') => {
    setSelectedUMKM(umkm);
    setAction(actionType);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedUMKM) return;

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrorMessage('Session expired. Silakan login kembali.');
        setShowError(true);
        return;
      }

      const res = await fetch(`${API_URL}/umkm/${selectedUMKM.id}/verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          action: action, 
          reason: action === 'reject' ? reason : '' 
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(`UMKM berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`);
        setShowSuccess(true);
        setShowModal(false);
        setReason('');
        fetchPendingUMKM();
      } else {
        setErrorMessage(data.message || 'Gagal memproses verifikasi');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error verifying UMKM:', error);
      setErrorMessage('Gagal memproses verifikasi');
      setShowError(true);
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
    <Fragment>
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-green-100">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6 shadow-lg">
                <FiCheckCircle className="h-12 w-12 text-white animate-scaleIn" strokeWidth={2.5} />
              </div>
              
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3">
                Berhasil!
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {successMessage}
              </p>
              
              <button
                onClick={() => setShowSuccess(false)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                OK
              </button>
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
                Terjadi Kesalahan
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

      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Aktivitas Terbaru</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Verifikasi data UMKM yang dikirim user</p>
        </div>

      {pendingUMKM.length === 0 ? (
        <Card>
          <div className="text-center py-8 sm:py-12">
            <FiCheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <p className="text-lg sm:text-xl font-semibold text-gray-700">Tidak ada UMKM yang perlu diverifikasi</p>
            <p className="text-sm sm:text-base text-gray-500 mt-2">Semua pengajuan sudah diproses</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-6">
          {pendingUMKM.map((umkm) => (
            <Card key={umkm.id}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-2">
                    <FiClock className="text-yellow-500 mr-2" size={16} />
                    <span className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-800 text-xs sm:text-sm font-medium rounded-full">
                      Menunggu Verifikasi
                    </span>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">{umkm.nama}</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Kategori</p>
                      <p className="font-medium text-sm sm:text-base">{umkm.kategori}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Ditambahkan oleh</p>
                      <p className="font-medium text-blue-600 text-sm sm:text-base truncate">{(umkm as any).namaUser}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Alamat</p>
                      <p className="font-medium text-sm sm:text-base line-clamp-2">{umkm.alamat}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Kontak</p>
                      <p className="font-medium text-sm sm:text-base">{umkm.kontak.telepon || umkm.kontak.whatsapp || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">Tanggal Pengajuan</p>
                      <p className="font-medium text-sm sm:text-base">
                        {new Date((umkm as any).createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Deskripsi</p>
                    <p className="text-gray-800 text-sm sm:text-base line-clamp-3">{umkm.deskripsi}</p>
                  </div>

                  <div className="mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Metode Pembayaran</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {umkm.metodePembayaran.map((metode) => (
                        <span
                          key={metode}
                          className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full"
                        >
                          {metode}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:ml-4 w-full sm:w-auto">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAction(umkm, 'approve')}
                    className="flex-1 sm:flex-none"
                  >
                    <FiCheckCircle className="mr-2" size={16} />
                    Setujui
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleAction(umkm, 'reject')}
                    className="flex-1 sm:flex-none"
                  >
                    <FiXCircle className="mr-2" size={16} />
                    Tolak
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for confirmation */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setReason('');
        }}
        title={action === 'approve' ? 'Setujui UMKM' : 'Tolak UMKM'}
        size="md"
      >
        <div className="space-y-4">
          <p>
            Apakah Anda yakin ingin {action === 'approve' ? 'menyetujui' : 'menolak'} UMKM{' '}
            <strong>{selectedUMKM?.nama}</strong>?
          </p>

          {action === 'reject' && (
            <Textarea
              label="Alasan Penolakan"
              placeholder="Masukkan alasan penolakan..."
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowModal(false);
                setReason('');
              }}
            >
              Batal
            </Button>
            <Button
              variant={action === 'approve' ? 'success' : 'danger'}
              onClick={handleSubmit}
            >
              {action === 'approve' ? 'Setujui' : 'Tolak'}
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </Fragment>
  );
}
