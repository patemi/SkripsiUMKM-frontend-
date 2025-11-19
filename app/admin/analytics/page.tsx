'use client';

import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card } from '@/components/ui/Card';
import { GrowthData } from '@/types';
import { API_URL } from '@/lib/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGrowthData();
  }, []);

  const fetchGrowthData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }

      console.log('Fetching growth data from:', `${API_URL}/growth`);

      const res = await fetch(`${API_URL}/growth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      const response = await res.json();
      console.log('Growth data response:', response);
      
      if (response.success && response.data) {
        if (response.data.length === 0) {
          setError('Belum ada data pertumbuhan. Tambahkan UMKM dan User terlebih dahulu.');
        } else {
          setGrowthData(response.data);
          setError(null);
        }
      } else {
        setError(response.message || 'Gagal mengambil data pertumbuhan');
      }
    } catch (error) {
      console.error('Error fetching growth data:', error);
      setError('Terjadi kesalahan saat mengambil data. Pastikan backend berjalan di http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pertumbuhan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analisis Pertumbuhan</h1>
          <p className="text-gray-600 mt-1">Pertumbuhan UMKM dan User per bulan</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">Error: {error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchGrowthData();
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (growthData.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analisis Pertumbuhan</h1>
          <p className="text-gray-600 mt-1">Pertumbuhan UMKM dan User per bulan</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Data Pertumbuhan</p>
            <p className="text-gray-600">Tambahkan UMKM dan User untuk melihat grafik pertumbuhan</p>
          </div>
        </Card>
      </div>
    );
  }

  const lineChartData = {
    labels: growthData.map((d) => d.month),
    datasets: [
      {
        label: 'UMKM',
        data: growthData.map((d) => d.umkm),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Users',
        data: growthData.map((d) => d.users),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: growthData.map((d) => d.month),
    datasets: [
      {
        label: 'UMKM',
        data: growthData.map((d) => d.umkm),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Users',
        data: growthData.map((d) => d.users),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analisis Pertumbuhan</h1>
          <p className="text-gray-600 mt-1">Pertumbuhan UMKM dan User per bulan</p>
        </div>
        <button
          onClick={fetchGrowthData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Info Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Data Points</p>
            <p className="text-2xl font-bold text-gray-900">{growthData.length} Bulan</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">UMKM Terbaru</p>
            <p className="text-2xl font-bold text-blue-600">
              {growthData[growthData.length - 1]?.umkm || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">User Terbaru</p>
            <p className="text-2xl font-bold text-green-600">
              {growthData[growthData.length - 1]?.users || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Line Chart */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Grafik Pertumbuhan (Line Chart)
        </h2>
        <div className="h-96">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </Card>

      {/* Bar Chart */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Grafik Pertumbuhan (Bar Chart)
        </h2>
        <div className="h-96">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </Card>

      {/* Statistics Table */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Data Pertumbuhan</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bulan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total UMKM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pertumbuhan UMKM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pertumbuhan Users
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {growthData.map((data, index) => {
                const prevData = index > 0 ? growthData[index - 1] : null;
                const umkmGrowth = prevData
                  ? ((data.umkm - prevData.umkm) / prevData.umkm * 100).toFixed(1)
                  : '-';
                const usersGrowth = prevData
                  ? ((data.users - prevData.users) / prevData.users * 100).toFixed(1)
                  : '-';

                return (
                  <tr key={data.month} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {data.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {data.umkm}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {data.users}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {umkmGrowth !== '-' && (
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            parseFloat(umkmGrowth) >= 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {parseFloat(umkmGrowth) >= 0 ? '+' : ''}
                          {umkmGrowth}%
                        </span>
                      )}
                      {umkmGrowth === '-' && <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {usersGrowth !== '-' && (
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            parseFloat(usersGrowth) >= 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {parseFloat(usersGrowth) >= 0 ? '+' : ''}
                          {usersGrowth}%
                        </span>
                      )}
                      {usersGrowth === '-' && <span className="text-gray-400">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
