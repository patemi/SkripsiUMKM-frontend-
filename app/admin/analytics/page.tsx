'use client';

import { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Card } from '@/components/ui/Card';
import { GrowthData } from '@/types';
import { API_URL } from '@/lib/api';
import { FiTrendingUp, FiTrendingDown, FiUsers, FiShoppingBag, FiActivity, FiRefreshCw, FiBarChart2 } from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsPage() {
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowsToShow, setRowsToShow] = useState(6);

  useEffect(() => {
    fetchGrowthData();
  }, []);

  const fetchGrowthData = async () => {
    try {
      setLoading(true);
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
          setError('Belum ada data pertumbuhan.');
        } else {
          setGrowthData(response.data);
          setError(null);
        }
      } else {
        setError(response.message || 'Gagal mengambil data pertumbuhan');
      }
    } catch (error) {
      console.error('Error fetching growth data:', error);
      setError('Terjadi kesalahan saat mengambil data.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const latestData = growthData[growthData.length - 1];
  const previousData = growthData.length > 1 ? growthData[growthData.length - 2] : null;

  const umkmGrowth = previousData ? latestData?.umkm - previousData.umkm : 0;
  const usersGrowth = previousData ? latestData?.users - previousData.users : 0;
  const umkmGrowthPercent = previousData && previousData.umkm > 0
    ? ((umkmGrowth / previousData.umkm) * 100).toFixed(1)
    : '0';
  const usersGrowthPercent = previousData && previousData.users > 0
    ? ((usersGrowth / previousData.users) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data analitik...</p>
        </div>
      </div>
    );
  }

  if (error || growthData.length === 0) {
    return (
      <div className="space-y-6 p-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analisis Pertumbuhan</h1>
          <p className="text-gray-600 mt-1">Dashboard analitik UMKM dan User</p>
        </div>
        <Card>
          <div className="text-center py-16">
            <FiBarChart2 className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-xl font-semibold text-gray-700 mb-2">{error || 'Belum Ada Data'}</p>
            <p className="text-gray-500 mb-6">Tambahkan UMKM dan User untuk melihat analitik</p>
            <button
              onClick={fetchGrowthData}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all inline-flex items-center gap-2 font-medium"
            >
              <FiRefreshCw size={18} />
              Refresh Data
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Chart configurations
  const lineChartData = {
    labels: growthData.map((d) => d.month),
    datasets: [
      {
        label: 'UMKM Terdaftar',
        data: growthData.map((d) => d.umkm),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
      {
        label: 'Pengguna Aktif',
        data: growthData.map((d) => d.users),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const barChartData = {
    labels: growthData.slice(-6).map((d) => d.month.split(' ')[0].slice(0, 3)),
    datasets: [
      {
        label: 'UMKM',
        data: growthData.slice(-6).map((d) => d.umkm),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Users',
        data: growthData.slice(-6).map((d) => d.users),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Calculate ratio for doughnut chart
  const totalUMKM = latestData?.umkm || 0;
  const totalUsers = latestData?.users || 0;
  const doughnutData = {
    labels: ['UMKM', 'Users'],
    datasets: [
      {
        data: [totalUMKM, totalUsers],
        backgroundColor: [
          'rgba(59, 130, 246, 0.9)',
          'rgba(16, 185, 129, 0.9)',
        ],
        borderColor: ['#fff', '#fff'],
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 13, weight: 500 as const },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleFont: { size: 14, weight: 600 as const },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          font: { size: 12 },
          callback: function (value: any) {
            return value.toLocaleString();
          }
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 13 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        padding: 12,
        cornerRadius: 8,
      },
    },
    cutout: '65%',
  };

  return (
    <div className="space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiActivity className="text-blue-600" />
            Analisis Pertumbuhan
          </h1>
          <p className="text-gray-500 mt-1">Dashboard analitik UMKM dan User per bulan</p>
        </div>
        <button
          onClick={fetchGrowthData}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
        >
          <FiRefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total UMKM */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total UMKM</p>
              <p className="text-3xl font-bold mt-1">{totalUMKM.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <FiShoppingBag size={24} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm">
            {umkmGrowth >= 0 ? (
              <FiTrendingUp className="text-green-300" />
            ) : (
              <FiTrendingDown className="text-red-300" />
            )}
            <span className={umkmGrowth >= 0 ? 'text-green-300' : 'text-red-300'}>
              {umkmGrowth >= 0 ? '+' : ''}{umkmGrowth}
            </span>
            <span className="text-blue-200">dari bulan lalu</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Total Pengguna</p>
              <p className="text-3xl font-bold mt-1">{totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <FiUsers size={24} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-sm">
            {usersGrowth >= 0 ? (
              <FiTrendingUp className="text-green-300" />
            ) : (
              <FiTrendingDown className="text-red-300" />
            )}
            <span className={usersGrowth >= 0 ? 'text-green-300' : 'text-red-300'}>
              {usersGrowth >= 0 ? '+' : ''}{usersGrowth}
            </span>
            <span className="text-emerald-200">dari bulan lalu</span>
          </div>
        </div>

        {/* Growth Rate UMKM */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pertumbuhan UMKM</p>
              <p className="text-3xl font-bold mt-1 text-gray-900">{umkmGrowthPercent}%</p>
            </div>
            <div className={`p-3 rounded-xl ${Number(umkmGrowthPercent) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {Number(umkmGrowthPercent) >= 0 ? (
                <FiTrendingUp size={24} className="text-green-600" />
              ) : (
                <FiTrendingDown size={24} className="text-red-600" />
              )}
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">Dibanding bulan sebelumnya</p>
        </div>

        {/* Growth Rate Users */}
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pertumbuhan User</p>
              <p className="text-3xl font-bold mt-1 text-gray-900">{usersGrowthPercent}%</p>
            </div>
            <div className={`p-3 rounded-xl ${Number(usersGrowthPercent) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {Number(usersGrowthPercent) >= 0 ? (
                <FiTrendingUp size={24} className="text-green-600" />
              ) : (
                <FiTrendingDown size={24} className="text-red-600" />
              )}
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">Dibanding bulan sebelumnya</p>
        </div>
      </div>

      {/* Main Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">📈 Tren Pertumbuhan</h2>
            <p className="text-sm text-gray-500 mt-1">Visualisasi perkembangan UMKM dan User dari waktu ke waktu</p>
          </div>
        </div>
        <div className="h-80 sm:h-96">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </Card>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📊 Perbandingan 6 Bulan Terakhir</h2>
          <div className="h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </Card>

        {/* Doughnut Chart */}
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-4">🎯 Rasio UMKM vs Users</h2>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Rasio: <span className="font-semibold text-gray-900">1 UMKM : {totalUsers > 0 ? (totalUsers / Math.max(totalUMKM, 1)).toFixed(1) : 0} User</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">📋 Detail Data Bulanan</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {growthData.length} bulan data
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Periode</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">UMKM</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Users</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Δ UMKM</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Δ Users</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {growthData.slice(0, rowsToShow).map((data, index) => {
                const prev = index > 0 ? growthData[index - 1] : null;
                const dUMKM = prev ? data.umkm - prev.umkm : null;
                const dUsers = prev ? data.users - prev.users : null;

                return (
                  <tr key={data.month} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{data.month}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-blue-600">{data.umkm.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-emerald-600">{data.users.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dUMKM !== null ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${dUMKM >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {dUMKM >= 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                          {dUMKM >= 0 ? '+' : ''}{dUMKM}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {dUsers !== null ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${dUsers >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {dUsers >= 0 ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
                          {dUsers >= 0 ? '+' : ''}{dUsers}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {growthData.length > 6 && (
          <div className="mt-4 flex justify-center gap-3">
            {rowsToShow < growthData.length && (
              <button
                onClick={() => setRowsToShow(growthData.length)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Tampilkan Semua ({growthData.length})
              </button>
            )}
            {rowsToShow > 6 && (
              <button
                onClick={() => setRowsToShow(6)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Tampilkan Lebih Sedikit
              </button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
