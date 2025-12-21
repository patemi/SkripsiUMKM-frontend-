'use client';

import { useEffect, useState } from 'react';
import { FiUser, FiMail, FiClock, FiArrowUp, FiCalendar, FiRefreshCw } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { API_URL } from '@/lib/api';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface User {
  _id: string;
  nama_user: string;
  email_user: string;
  username: string;
  lastLogin: string | null;
  lastActivity: string | null;
  createdAt: string;
  umkmContribution?: {
    approved: number;
    rejected: number;
    total: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [filterOnline, setFilterOnline] = useState(false);
  const [sortByContribution, setSortByContribution] = useState(false);

  useEffect(() => {
    fetchUsers();
    
    // Auto-refresh setiap 30 detik
    const interval = setInterval(() => {
      fetchUsers(true);
    }, 30000);
    
    return () => clearInterval(interval);
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

  const fetchUsers = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const token = localStorage.getItem('token');
      
      const res = await fetch(`${API_URL}/user`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      });
      
      const response = await res.json();
      
      if (response.success) {
        setUsers(response.data);
        setLastRefresh(new Date());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (!isAutoRefresh) {
        alert('Gagal memuat data user');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchUsers();
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const isUserOnline = (lastActivity: string | null) => {
    if (!lastActivity) return false;
    const activityDate = new Date(lastActivity);
    const now = new Date();
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins < 3; // Consider online if activity within last 3 minutes
  };

  const formatLastLogin = (lastLogin: string | null, lastActivity: string | null) => {
    // Check if user is currently online
    if (isUserOnline(lastActivity)) {
      return (
        <div className="inline-flex items-center gap-2">
          <span className="relative inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-md">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              ONLINE
            </span>
          </span>
        </div>
      );
    }

    if (!lastLogin) {
      return <span className="text-gray-400 text-xs">Belum pernah login</span>;
    }
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffMs = now.getTime() - loginDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
      return <span className="text-green-600 font-semibold text-xs">Baru saja</span>;
    } else if (diffMins < 60) {
      return <span className="text-green-600 font-semibold text-xs">{diffMins} menit lalu</span>;
    } else if (diffHours < 24) {
      return <span className="text-blue-600 font-semibold text-xs">{diffHours} jam lalu</span>;
    } else if (diffDays < 7) {
      return <span className="text-orange-600 font-semibold text-xs">{diffDays} hari lalu</span>;
    } else {
      return (
        <span className="text-gray-600 text-xs">
          {format(loginDate, 'dd MMM yyyy, HH:mm', { locale: id })}
        </span>
      );
    }
  };

  // Filter dan sort users
  const getFilteredUsers = () => {
    let filtered = [...users];
    
    // Filter online
    if (filterOnline) {
      filtered = filtered.filter(user => isUserOnline(user.lastActivity));
    }
    
    // Sort by contribution
    if (sortByContribution) {
      filtered.sort((a, b) => {
        const aTotal = a.umkmContribution?.total || 0;
        const bTotal = b.umkmContribution?.total || 0;
        return bTotal - aTotal;
      });
    }
    
    return filtered;
  };

  const filteredUsers = getFilteredUsers();
  const onlineCount = users.filter(user => isUserOnline(user.lastActivity)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Info:</strong> User harus <strong>logout dan login kembali</strong> untuk data lastLogin ter-update. 
              Status "ONLINE" akan muncul untuk user yang aktif dalam 3 menit terakhir.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Daftar User</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Total {users.length} user terdaftar • {onlineCount} user online • Menampilkan {filteredUsers.length} user
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            Update: {format(lastRefresh, 'HH:mm:ss')}
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiRefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
            <span className="text-sm font-medium">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setFilterOnline(!filterOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              filterOnline
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filterOnline ? 'bg-white' : 'bg-green-500'}`}></span>
            {filterOnline ? 'Tampilkan Semua User' : 'Filter User Online'}
          </button>
          
          <button
            onClick={() => setSortByContribution(!sortByContribution)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              sortByContribution
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiArrowUp className={sortByContribution ? 'transform rotate-180' : ''} />
            {sortByContribution ? 'Urutkan Standar' : 'Urutkan: Kontribusi Tertinggi'}
          </button>
        </div>
      </Card>

      <Card>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <FiUser className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-xl font-semibold text-gray-700">
              {filterOnline ? 'Tidak ada user yang sedang online' : 'Belum ada user terdaftar'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table headers={['User', 'Username', 'Email', 'Kontribusi UMKM', 'Terdaftar', 'Status']}>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.nama_user.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-gray-900">{user.nama_user}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">@{user.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMail className="mr-2 text-gray-400" size={14} />
                        {user.email_user}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">Total:</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                            {user.umkmContribution?.total || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="text-green-600">✓ {user.umkmContribution?.approved || 0}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-red-600">✗ {user.umkmContribution?.rejected || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-600">
                        {format(new Date(user.createdAt), 'dd MMM yyyy', { locale: id })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {formatLastLogin(user.lastLogin, user.lastActivity)}
                    </td>
                  </tr>
                ))}
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredUsers.map((user) => (
                <div key={user._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* User Header */}
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {user.nama_user.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="text-sm font-bold text-gray-900">{user.nama_user}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-2">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <FiMail className="mr-1" size={12} />
                      <span>Email</span>
                    </div>
                    <div className="text-sm text-gray-700">{user.email_user}</div>
                  </div>

                  {/* Registered Date */}
                  <div className="mb-2">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <FiCalendar className="mr-1" size={12} />
                      <span>Terdaftar</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {format(new Date(user.createdAt), 'dd MMMM yyyy', { locale: id })}
                    </div>
                  </div>

                  {/* Kontribusi UMKM */}
                  <div className="mb-2">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <span>Kontribusi UMKM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                        Total: {user.umkmContribution?.total || 0}
                      </span>
                      <span className="text-xs text-green-600">✓ {user.umkmContribution?.approved || 0}</span>
                      <span className="text-xs text-red-600">✗ {user.umkmContribution?.rejected || 0}</span>
                    </div>
                  </div>

                  {/* Last Login */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <FiClock className="mr-1" size={12} />
                        <span>Last Login</span>
                      </div>
                      <div>{formatLastLogin(user.lastLogin, user.lastActivity)}</div>
                    </div>
                  </div>
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
