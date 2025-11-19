'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function UserRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    confirmPassword: '',
    telepon: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Password dan konfirmasi password tidak cocok!');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password minimal 6 karakter!');
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
          nama: formData.nama,
          email: formData.email,
          password: formData.password,
          telepon: formData.telepon,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Registrasi berhasil! Silakan login.');
        router.push('/user/login');
      } else {
        alert(data.message || 'Registrasi gagal');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Terjadi kesalahan saat registrasi');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-4">
            <img src="/img/logo.png" alt="SoraUMKM" className="h-12 w-12" />
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              SoraUMKM
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Daftar Akun Baru</h2>
          <p className="text-gray-600">Bergabung dengan komunitas UMKM Solo Raya</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama */}
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap
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

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
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
                Nomor Telepon
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
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Minimal 6 karakter"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Ulangi password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/user/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Login di sini
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
