'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FiHome,
  FiShoppingBag,
  FiCheckCircle,
  FiFileText,
  FiTrendingUp,
  FiMenu,
  FiX,
  FiLogOut,
  FiUsers,
  FiUser
} from 'react-icons/fi';
import { isAdminAuthenticated, getAdminData, logoutAdmin, clearAdminSession } from '@/lib/auth';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: FiHome },
  { href: '/admin/umkm', label: 'Kelola UMKM', icon: FiShoppingBag },
  { href: '/admin/verification', label: 'Aktivitas Terbaru', icon: FiCheckCircle },
  { href: '/admin/users', label: 'Daftar User', icon: FiUsers },
  { href: '/admin/activity-logs', label: 'Log Aktivitas', icon: FiFileText },
  { href: '/admin/analytics', label: 'Analisis Pertumbuhan', icon: FiTrendingUp },
  { href: '/admin/profile', label: 'Profil Admin', icon: FiUser },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState('Admin User');

  useEffect(() => {
    // Function to load admin data
    const loadAdminData = () => {
      const token = localStorage.getItem('token');
      const adminData = localStorage.getItem('admin');

      // Quick check - jika tidak ada token, langsung redirect
      if (!token || !adminData) {
        clearAdminSession();
        window.location.replace('/login');
        return;
      }

      // Parse admin data
      try {
        const admin = JSON.parse(adminData);
        setAdminName(admin.nama_admin || 'Admin User');
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        clearAdminSession();
        window.location.replace('/login');
      }
    };

    // Initial load
    loadAdminData();

    // Listen for storage changes (when profile is updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin' && e.newValue) {
        try {
          const admin = JSON.parse(e.newValue);
          setAdminName(admin.nama_admin || 'Admin User');
        } catch (error) {
          console.error('Error parsing admin data:', error);
        }
      }
    };

    // Custom event listener for same-tab updates
    const handleAdminUpdate = () => {
      const adminData = localStorage.getItem('admin');
      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          setAdminName(admin.nama_admin || 'Admin User');
        } catch (error) {
          console.error('Error parsing admin data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminProfileUpdated', handleAdminUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminProfileUpdated', handleAdminUpdate);
    };
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    // Force redirect dan reload untuk clear state
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Menu Button - Only visible on mobile */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">UMKM Admin</h1>
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-white shadow-lg ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        <div className="h-full px-3 py-4 overflow-y-auto">
          <div className="mb-8 px-4 pt-4">
            <h1 className="text-2xl font-bold text-blue-600">UMKM Admin</h1>
            <p className="text-sm text-gray-600 mt-1">Dashboard Panel</p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="mr-3" size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-4 left-0 right-0 px-7 space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <FiLogOut className="mr-2" size={18} />
              Logout
            </button>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Logged in as:</p>
              <p className="font-semibold text-gray-800">{adminName}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64 p-3 sm:p-4 lg:p-8 pt-20 sm:pt-20 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
