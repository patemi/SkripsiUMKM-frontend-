'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiClock, FiArrowUp, FiUser } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { ActivityLog } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { API_URL } from '@/lib/api';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  useEffect(() => {
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

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/activity-logs`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      const response = await res.json();
      
      if (response.success) {
        const mappedLogs = response.data.map((item: any) => ({
          id: item._id,
          timestamp: item.createdAt,
          adminName: item.admin_name,
          umkmNama: item.umkm_nama,
          userName: item.user_name || 'Unknown',
          action: item.action,
          reason: item.reason || '',
        }));
        setLogs(mappedLogs);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Log Aktivitas</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Riwayat verifikasi UMKM oleh admin</p>
      </div>

      <Card>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FiClock className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl font-semibold text-gray-700">Belum ada log aktivitas</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table headers={['Tanggal & Waktu', 'Admin', 'UMKM', 'Pengirim', 'Aksi', 'Alasan']}>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(log.timestamp), 'dd MMMM yyyy', { locale: id })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{log.adminName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{log.umkmNama}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{log.userName || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.action === 'approved' ? (
                        <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          <FiCheckCircle className="mr-1" />
                          Disetujui
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          <FiXCircle className="mr-1" />
                          Ditolak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {log.reason || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Timestamp */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {format(new Date(log.timestamp), 'dd MMMM yyyy', { locale: id })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </div>
                    </div>
                    {log.action === 'approved' ? (
                      <span className="px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        <FiCheckCircle className="mr-1" size={12} />
                        Disetujui
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        <FiXCircle className="mr-1" size={12} />
                        Ditolak
                      </span>
                    )}
                  </div>

                  {/* Admin */}
                  <div className="mb-2">
                    <div className="flex items-center text-gray-500 text-xs mb-1">
                      <FiUser className="mr-1" size={12} />
                      <span>Admin</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">{log.adminName}</div>
                  </div>

                  {/* UMKM Name */}
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">UMKM</div>
                    <div className="text-sm font-medium text-blue-600">{log.umkmNama}</div>
                  </div>

                  {/* Pengirim/User */}
                  <div className="mb-2">
                    <div className="text-xs text-gray-500 mb-1">Pengirim</div>
                    <div className="text-sm text-gray-700">{log.userName || 'Unknown'}</div>
                  </div>

                  {/* Reason */}
                  {log.reason && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Alasan</div>
                      <div className="text-sm text-gray-700">{log.reason}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

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
