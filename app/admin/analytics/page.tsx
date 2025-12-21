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
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [rowsToShow, setRowsToShow] = useState(5);

  useEffect(() => {
    const loadData = async () => {
      await fetchGrowthData();
    };
    loadData();

    // Scroll to top button handler
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchGrowthData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/growth`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      const response = await res.json();
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
        label: 'Pertumbuhan UMKM',
        data: growthData.map((data, index) => {
          const prevData = index > 0 ? growthData[index - 1] : null;
          return prevData ? data.umkm - prevData.umkm : 0;
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Pertumbuhan Users',
        data: growthData.map((data, index) => {
          const prevData = index > 0 ? growthData[index - 1] : null;
          return prevData ? data.users - prevData.users : 0;
        }),
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
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analisis Pertumbuhan</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Pertumbuhan UMKM dan User per bulan</p>
        </div>
        <button
          onClick={fetchGrowthData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm lg:text-base"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Info Card */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">Total Data Points</p>
            <p className="text-2xl font-bold text-gray-900">{growthData.length} Bulan</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">UMKM Terbaru</p>
            <p className="text-2xl font-bold text-blue-600">
              {growthData[growthData.length - 1]?.umkm || 0}
            </p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">User Terbaru</p>
            <p className="text-2xl font-bold text-green-600">
              {growthData[growthData.length - 1]?.users || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Statistics Table */}
      <Card>
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">Data Pertumbuhan</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bulan
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="hidden sm:inline">Total </span>UMKM
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="hidden sm:inline">Total </span>Users
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="hidden sm:inline">Pertumbuhan </span>↑ UMKM
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <span className="hidden sm:inline">Pertumbuhan </span>↑ Users
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {growthData.slice(0, rowsToShow).map((data, index) => {
                const prevData = index > 0 ? growthData[index - 1] : null;
                const umkmGrowth = prevData
                  ? data.umkm - prevData.umkm
                  : null;
                const usersGrowth = prevData
                  ? data.users - prevData.users
                  : null;

                return (
                  <tr key={data.month} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap font-medium text-gray-900">
                      <span className="hidden sm:inline">{data.month}</span>
                      <span className="sm:hidden">{data.month.split(' ')[0].slice(0, 3)} {data.month.split(' ')[1]}</span>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-gray-900 font-semibold">
                      {data.umkm}
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap text-gray-900 font-semibold">
                      {data.users}
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                      {umkmGrowth !== null && (
                        <span
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                            umkmGrowth >= 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {umkmGrowth >= 0 ? '+' : ''}
                          {umkmGrowth}
                        </span>
                      )}
                      {umkmGrowth === null && <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 whitespace-nowrap">
                      {usersGrowth !== null && (
                        <span
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                            usersGrowth >= 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {usersGrowth >= 0 ? '+' : ''}
                          {usersGrowth}
                        </span>
                      )}
                      {usersGrowth === null && <span className="text-gray-400">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Show More/Less Controls */}
        {growthData.length > 5 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Menampilkan {Math.min(rowsToShow, growthData.length)} dari {growthData.length} bulan
            </p>
            <div className="flex gap-2">
              {rowsToShow < growthData.length && (
                <button
                  onClick={() => setRowsToShow(prev => Math.min(prev + 5, growthData.length))}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Tampilkan Lebih Banyak
                </button>
              )}
              {rowsToShow < growthData.length && (
                <button
                  onClick={() => setRowsToShow(growthData.length)}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Tampilkan Semua
                </button>
              )}
              {rowsToShow > 5 && (
                <button
                  onClick={() => setRowsToShow(5)}
                  className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Tampilkan Lebih Sedikit
                </button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Line Chart */}
      <Card>
        <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-4">
          Grafik Pertumbuhan
        </h2>
        <div className="h-64 sm:h-80 lg:h-96">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </Card>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 hover:scale-110"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
