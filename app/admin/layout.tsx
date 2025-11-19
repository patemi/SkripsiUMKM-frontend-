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
  FiLogOut
} from 'react-icons/fi';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: FiHome },
  { href: '/admin/umkm', label: 'Kelola UMKM', icon: FiShoppingBag },
  { href: '/admin/verification', label: 'Aktivitas Terbaru', icon: FiCheckCircle },
  { href: '/admin/activity-logs', label: 'Log Aktivitas', icon: FiFileText },
  { href: '/admin/analytics', label: 'Analisis Pertumbuhan', icon: FiTrendingUp },
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
    // Check authentication
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Redirect to login if no token
      router.push('/login');
      return;
    }

    // Get admin info from localStorage
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        setAdminName(admin.nama_admin || 'Admin User');
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-white shadow-md text-gray-700 hover:bg-gray-100"
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-white shadow-lg ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
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
      <div className="lg:ml-64 p-4 lg:p-8">
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
