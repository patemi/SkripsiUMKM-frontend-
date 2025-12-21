'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock, FiLogIn, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { loginAdmin, isAdminAuthenticated } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [adminName, setAdminName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Check if admin is already logged in
  useEffect(() => {
    // Gunakan utility function untuk cek autentikasi
    if (isAdminAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gunakan loginAdmin utility yang sudah handle cookies dan session
      const data = await loginAdmin(formData.username, formData.password);

      if (data.success && data.data) {
        setAdminName(data.data.nama_admin);
        setShowSuccess(true);
        // Redirect langsung tanpa delay - gunakan window.location untuk force redirect
        setTimeout(() => {
          window.location.href = '/admin';
        }, 500);
      } else {
        setErrorMessage(data.message || 'Login gagal. Periksa username dan password Anda.');
        setShowError(true);
      }
    } catch (error) {
      console.error('Error login:', error);
      setErrorMessage('Terjadi kesalahan saat login. Pastikan backend berjalan di http://localhost:5000');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      {/* Success Notification Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-green-100">
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6 shadow-lg">
                <FiCheckCircle className="h-12 w-12 text-white animate-scaleIn" strokeWidth={2.5} />
              </div>
              
              {/* Success Message */}
              <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3">
                Login Berhasil!
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Selamat datang, {adminName}! ✨
              </p>
              
              {/* Loading Indicator */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-center space-x-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600 absolute top-0 left-0"></div>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-blue-700 block">Mengalihkan ke dashboard</span>
                    <span className="text-xs text-blue-500">Mohon tunggu sebentar...</span>
                  </div>
                </div>
                
                <div className="mt-4 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-progressBar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification Modal */}
      {showError && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-red-100">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 mb-6 shadow-lg">
                <FiAlertCircle className="h-12 w-12 text-white animate-scaleIn" strokeWidth={2.5} />
              </div>
              
              {/* Error Message */}
              <h3 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-3">
                Login Gagal
              </h3>
              <p className="text-gray-600 mb-8 text-base leading-relaxed">
                {errorMessage}
              </p>
              
              {/* Close Button */}
              <button
                onClick={() => setShowError(false)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full mb-3 sm:mb-4">
            <FiUser className="text-white" size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Sistem Manajemen UMKM</p>
        </div>

        {/* Login Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Login Admin</h2>
              <p className="text-xs sm:text-sm text-gray-600">Masukkan kredensial Anda untuk melanjutkan</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-2" />
                  Username <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Masukkan username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiLock className="inline mr-2" />
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              <FiLogIn className="mr-2" />
              {loading ? 'Memproses...' : 'Login'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
