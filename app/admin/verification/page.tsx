'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
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
        alert('Session expired. Silakan login kembali.');
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
        alert(`UMKM berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}`);
        setShowModal(false);
        setReason('');
        fetchPendingUMKM();
      } else {
        alert(data.message || 'Gagal memproses verifikasi');
      }
    } catch (error) {
      console.error('Error verifying UMKM:', error);
      alert('Gagal memproses verifikasi');
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Aktivitas Terbaru</h1>
        <p className="text-gray-600 mt-1">Verifikasi data UMKM yang dikirim user</p>
      </div>

      {pendingUMKM.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FiCheckCircle className="mx-auto text-green-500 mb-4" size={64} />
            <p className="text-xl font-semibold text-gray-700">Tidak ada UMKM yang perlu diverifikasi</p>
            <p className="text-gray-500 mt-2">Semua pengajuan sudah diproses</p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingUMKM.map((umkm) => (
            <Card key={umkm.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FiClock className="text-yellow-500 mr-2" />
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      Menunggu Verifikasi
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{umkm.nama}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Kategori</p>
                      <p className="font-medium">{umkm.kategori}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Alamat</p>
                      <p className="font-medium">{umkm.alamat}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Kontak</p>
                      <p className="font-medium">{umkm.kontak.telepon || umkm.kontak.whatsapp || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Pengajuan</p>
                      <p className="font-medium">
                        {new Date(umkm.createdAt).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Deskripsi</p>
                    <p className="text-gray-800">{umkm.deskripsi}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Metode Pembayaran</p>
                    <div className="flex flex-wrap gap-2">
                      {umkm.metodePembayaran.map((metode) => (
                        <span
                          key={metode}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {metode}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleAction(umkm, 'approve')}
                  >
                    <FiCheckCircle className="mr-2" />
                    Setujui
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleAction(umkm, 'reject')}
                  >
                    <FiXCircle className="mr-2" />
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
  );
}
