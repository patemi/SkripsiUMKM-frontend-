'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Form';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username_admin: formData.username,
          password_admin: formData.password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Simpan token dan data admin
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify(data.data));
        
        alert(`Selamat datang, ${data.data.nama_admin}!`);
        router.push('/admin');
      } else {
        alert(data.message || 'Login gagal. Periksa username dan password Anda.');
      }
    } catch (error) {
      console.error('Error login:', error);
      alert('Terjadi kesalahan saat login. Pastikan backend berjalan di http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <FiUser className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Sistem Manajemen UMKM</p>
        </div>

        {/* Login Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Login Admin</h2>
              <p className="text-sm text-gray-600">Masukkan kredensial Anda untuk melanjutkan</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-2" />
                  Username
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
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                />
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

        {/* Default Credentials Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">📝 Kredensial Default:</p>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> admin123</p>
          </div>
        </div>

        {/* Backend Info */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Pastikan backend berjalan di:</p>
          <code className="text-blue-600 font-mono">http://localhost:5000</code>
        </div>
      </div>
    </div>
  );
}
