'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiShoppingBag, FiTrendingUp, FiEye, FiCheckCircle } from 'react-icons/fi';
import { StatCard, Card } from '@/components/ui/Card';
import { Statistics, UMKM } from '@/types';
import { API_URL } from '@/lib/api';

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [topUMKM, setTopUMKM] = useState<UMKM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch UMKM statistics
      const statsRes = await fetch(`${API_URL}/umkm/stats/overview`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      const statsData = await statsRes.json();
      
      // Fetch top UMKM
      const topRes = await fetch(`${API_URL}/umkm/top?limit=5`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      const topData = await topRes.json();
      
      // Fetch user stats
      const userRes = await fetch(`${API_URL}/user/stats`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      const userData = await userRes.json();
      
      if (statsData.success) {
        setStatistics({
          totalUMKM: statsData.data.totalUMKM,
          totalUser: userData.success ? userData.data.totalUsers : 0,
          umkmPerKategori: statsData.data.umkmPerKategori,
        });
      }
      
      if (topData.success) {
        const mappedTop = topData.data.map((item: any) => ({
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
        setTopUMKM(mappedTop);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const totalUMKM = Object.values(statistics?.umkmPerKategori || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang di panel admin UMKM</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total UMKM"
          value={statistics?.totalUMKM || 0}
          icon={<FiShoppingBag size={24} />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total User"
          value={statistics?.totalUser || 0}
          icon={<FiUsers size={24} />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Views"
          value={topUMKM.reduce((sum, umkm) => sum + umkm.views, 0)}
          icon={<FiEye size={24} />}
          color="bg-purple-500"
        />
      </div>

      {/* UMKM per Kategori */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">UMKM per Kategori</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {statistics && Object.entries(statistics.umkmPerKategori).map(([kategori, count]) => (
            <div
              key={kategori}
              className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200"
            >
              <p className="text-sm text-gray-600 font-medium">{kategori}</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{count}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Favorite UMKM */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Top 5 UMKM Favorit</h2>
          <FiTrendingUp className="text-orange-500" size={24} />
        </div>
        
        <div className="space-y-3">
          {topUMKM.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data UMKM</p>
          ) : (
            topUMKM.map((umkm, index) => (
              <div
                key={umkm.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{umkm.nama}</h3>
                    <p className="text-sm text-gray-600">{umkm.kategori}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-gray-700">
                    <FiEye className="mr-1" />
                    <span className="font-semibold">{umkm.views}</span>
                  </div>
                  <p className="text-xs text-gray-500">views</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/umkm/create"
            className="p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
          >
            <FiShoppingBag className="mx-auto mb-2" size={32} />
            <p className="font-semibold">Tambah UMKM Baru</p>
          </a>
          <a
            href="/admin/verification"
            className="p-6 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center transition-colors"
          >
            <FiCheckCircle className="mx-auto mb-2" size={32} />
            <p className="font-semibold">Verifikasi UMKM</p>
          </a>
          <a
            href="/admin/analytics"
            className="p-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center transition-colors"
          >
            <FiTrendingUp className="mx-auto mb-2" size={32} />
            <p className="font-semibold">Lihat Analisis</p>
          </a>
        </div>
      </Card>
    </div>
  );
}
