'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiShoppingBag, FiTrendingUp, FiEye, FiCheckCircle, FiMapPin } from 'react-icons/fi';
import { StatCard, Card } from '@/components/ui/Card';
import { Statistics, UMKM } from '@/types';
import { API_URL } from '@/lib/api';
import Map from '@/components/ui/Map';

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [topUMKM, setTopUMKM] = useState<UMKM[]>([]);
  const [allUMKM, setAllUMKM] = useState<UMKM[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract coordinates from Google Maps URL
  const extractCoordinates = (mapsUrl: string): { lat: number; lng: number } | null => {
    if (!mapsUrl) return null;

    const patterns = [
      /@(-?\d+\.\d+),(-?\d+\.\d+)/, // @lat,lng format
      /q=(-?\d+\.\d+),(-?\d+\.\d+)/, // q=lat,lng format
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/, // ll=lat,lng format
    ];

    for (const pattern of patterns) {
      const match = mapsUrl.match(pattern);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          return { lat, lng };
        }
      }
    }
    return null;
  };

  useEffect(() => {
    // Langsung load data - auth sudah dicek di layout
    const loadData = async () => {
      await fetchDashboardData();
    };
    loadData();
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
      
      // Fetch top UMKM - hanya yang approved
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
      
      if (topData.success && topData.data) {
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

      // Fetch all UMKM for map
      const allRes = await fetch(`${API_URL}/umkm?status=approved`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      const allData = await allRes.json();
      
      if (allData.success && allData.data) {
        const mappedAll = allData.data.map((item: any) => ({
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
        setAllUMKM(mappedAll);
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
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Selamat datang di panel admin UMKM</p>
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
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">UMKM per Kategori</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
          {statistics && Object.entries(statistics.umkmPerKategori).map(([kategori, count]) => (
            <div
              key={kategori}
              className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200"
            >
              <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">{kategori}</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-1">{count}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Top Favorite UMKM */}
      <Card>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Top 3 UMKM Paling Banyak Dilihat</h2>
          <FiTrendingUp className="text-orange-500" size={20} />
        </div>
        
        <div className="space-y-2 sm:space-y-3">
          {topUMKM.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data UMKM</p>
          ) : (
            topUMKM.map((umkm, index) => (
              <div
                key={umkm.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
              >
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{umkm.nama}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{umkm.kategori}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center text-gray-700 gap-1">
                    <FiEye size={14} />
                    <span className="font-semibold text-sm sm:text-base">{umkm.views}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500">views</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* UMKM Distribution Map */}
      <Card>
        <div className="flex items-center mb-4">
          <FiMapPin className="text-blue-600 text-xl mr-2" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Sebaran Lokasi UMKM</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Visualisasi lokasi {allUMKM.filter(u => u.linkMaps).length} UMKM yang memiliki data lokasi
        </p>
        {allUMKM.filter(u => u.linkMaps).length > 0 ? (
          <Map
            markers={allUMKM
              .map((umkm) => {
                const coords = extractCoordinates(umkm.linkMaps || '');
                if (!coords) return null;
                return {
                  id: umkm.id,
                  nama: umkm.nama,
                  lat: coords.lat,
                  lng: coords.lng,
                  kategori: umkm.kategori,
                  alamat: umkm.alamat,
                };
              })
              .filter((marker): marker is NonNullable<typeof marker> => marker !== null)}
            center={{ lat: -7.5598, lng: 110.8290 }} // Default to Solo
            zoom={12}
            height="500px"
          />
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FiMapPin className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Belum ada UMKM dengan data lokasi</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <a
            href="/admin/umkm/create"
            className="p-4 sm:p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors"
          >
            <FiShoppingBag className="mx-auto mb-2" size={24} />
            <p className="font-semibold text-sm sm:text-base">Tambah UMKM Baru</p>
          </a>
          <a
            href="/admin/verification"
            className="p-4 sm:p-6 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center transition-colors"
          >
            <FiCheckCircle className="mx-auto mb-2" size={24} />
            <p className="font-semibold text-sm sm:text-base">Verifikasi UMKM</p>
          </a>
          <a
            href="/admin/analytics"
            className="p-4 sm:p-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center transition-colors"
          >
            <FiTrendingUp className="mx-auto mb-2" size={24} />
            <p className="font-semibold text-sm sm:text-base">Lihat Analisis</p>
          </a>
        </div>
      </Card>
    </div>
  );
}
