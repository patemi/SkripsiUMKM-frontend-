'use client';

import { useEffect, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { ActivityLog } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { API_URL } from '@/lib/api';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityLogs();
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
        <h1 className="text-3xl font-bold text-gray-900">Log Aktivitas</h1>
        <p className="text-gray-600 mt-1">Riwayat verifikasi UMKM oleh admin</p>
      </div>

      <Card>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <FiClock className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl font-semibold text-gray-700">Belum ada log aktivitas</p>
          </div>
        ) : (
          <Table headers={['Tanggal & Waktu', 'Admin', 'UMKM', 'Aksi', 'Alasan']}>
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
        )}
      </Card>
    </div>
  );
}
