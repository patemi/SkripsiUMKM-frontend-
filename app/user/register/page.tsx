'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';

export default function UserRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    telepon: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Password dan konfirmasi password tidak cocok!');
      setShowError(true);
      return;
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password minimal 8 karakter!');
      setShowError(true);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nama_user: formData.nama,
          username: formData.username,
          email_user: formData.email,
          password_user: formData.password,
          telepon: formData.telepon,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/user/login');
        }, 2500);
      } else {
        setErrorMessage(data.message || 'Registrasi gagal');
        setShowError(true);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage('Terjadi kesalahan saat registrasi');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
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
                Registrasi Berhasil!
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Akun Anda berhasil dibuat ✨
              </p>
              
              {/* Loading Indicator */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-center space-x-3">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-200"></div>
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-600 absolute top-0 left-0"></div>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-blue-700 block">Mengalihkan ke halaman login</span>
                    <span className="text-xs text-blue-500">Silakan login dengan akun baru Anda...</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
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
                Registrasi Gagal
              </h3>
              <p className="text-gray-600 mb-8 text-base leading-relaxed">
                {errorMessage}
              </p>
              
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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-6 sm:py-10 lg:py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6 sm:mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 sm:space-x-3 mb-4">
            <img src="/img/logo.png" alt="SoraUMKM" className="h-10 w-10 sm:h-12 sm:w-12" />
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SoraUMKM
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Daftar Akun Baru</h2>
          <p className="text-sm sm:text-base text-gray-600">Bergabung dengan komunitas UMKM Solo Raya</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Nama */}
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                required
                value={formData.nama}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Masukkan nama lengkap"
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Username unik (tanpa spasi)"
                pattern="[a-zA-Z0-9_]+"
                title="Username hanya boleh berisi huruf, angka, dan underscore"
              />
              <p className="text-xs text-gray-500 mt-1">Username harus unik dan tidak boleh sama dengan pengguna lain</p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="contoh@email.com"
              />
            </div>

            {/* Telepon */}
            <div>
              <label htmlFor="telepon" className="block text-sm font-medium text-gray-700 mb-2">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="telepon"
                name="telepon"
                required
                value={formData.telepon}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="08xxxxxxxxxx"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Minimal 8 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ulangi password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/user/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Login di sini
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-3 sm:mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
