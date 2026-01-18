'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { FiArrowLeft, FiHeart, FiMapPin, FiClock, FiTrash2, FiSearch, FiExternalLink } from 'react-icons/fi';
import ShareButton from '@/components/ShareButton';

interface UMKM {
    _id: string;
    nama_umkm: string;
    kategori: string;
    deskripsi: string;
    alamat: string;
    foto_umkm: string[];
    jam_operasional: Record<string, string>;
    views: number;
}

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<UMKM[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) {
                setError('Silakan login terlebih dahulu');
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/favorites`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (data.success) {
                setFavorites(data.data);
            } else {
                setError(data.message || 'Gagal mengambil data favorit');
            }
        } catch (err) {
            setError('Terjadi kesalahan saat mengambil data');
        } finally {
            setLoading(false);
        }
    };

    const removeFavorite = async (umkmId: string) => {
        try {
            const token = localStorage.getItem('userToken');
            const res = await fetch(`${API_URL}/favorites/${umkmId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setFavorites(prev => prev.filter(f => f._id !== umkmId));
            }
        } catch (err) {
            console.error('Error removing favorite:', err);
        }
    };

    const filteredFavorites = favorites.filter(fav =>
        fav.nama_umkm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.kategori.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryColor = (kategori: string) => {
        const colors: Record<string, string> = {
            'Kuliner': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            'Fashion': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
            'Kerajinan': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            'Jasa': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'Agribisnis & Pertanian': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            'Toko Kelontong': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        };
        return colors[kategori] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/user/home" className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            <FiArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Kembali</span>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <FiHeart className="w-6 h-6 text-red-500" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                UMKM Favorit
                            </span>
                        </div>
                        <div className="w-20"></div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari favorit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <FiHeart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <Link href="/user/login" className="text-blue-600 hover:underline">
                            Login untuk melihat favorit
                        </Link>
                    </div>
                ) : filteredFavorites.length === 0 ? (
                    <div className="text-center py-20">
                        <FiHeart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {searchQuery ? 'Tidak ada hasil' : 'Belum ada favorit'}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {searchQuery ? 'Coba kata kunci lain' : 'Tambahkan UMKM ke favorit untuk melihatnya di sini'}
                        </p>
                        <Link
                            href="/user/home"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Jelajahi UMKM
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredFavorites.map((umkm) => (
                            <div
                                key={umkm._id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
                            >
                                {/* Image */}
                                <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                                    {umkm.foto_umkm?.[0] ? (
                                        <img
                                            src={`${API_URL.replace('/api', '')}${umkm.foto_umkm[0]}`}
                                            alt={umkm.nama_umkm}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(umkm.kategori)}`}>
                                        {umkm.kategori}
                                    </span>
                                    <button
                                        onClick={() => removeFavorite(umkm._id)}
                                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                                        title="Hapus dari favorit"
                                    >
                                        <FiTrash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
                                        {umkm.nama_umkm}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                                        {umkm.deskripsi || 'Tidak ada deskripsi'}
                                    </p>

                                    {umkm.alamat && (
                                        <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                            <FiMapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-1">{umkm.alamat}</span>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <Link
                                            href={`/user/umkm/${umkm._id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <FiExternalLink className="w-4 h-4" />
                                            Lihat Detail
                                        </Link>
                                        <ShareButton
                                            title={umkm.nama_umkm}
                                            description={umkm.deskripsi}
                                            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/user/umkm/${umkm._id}`}
                                            className="!px-3 !py-2 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
