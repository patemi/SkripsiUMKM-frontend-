'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { API_URL } from '@/lib/api';

interface AdminProfile {
  _id: string;
  nama_admin: string;
  username_admin: string;
  role: string;
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [namaAdmin, setNamaAdmin] = useState('');
  const [usernameAdmin, setUsernameAdmin] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Small delay to ensure token is available
    const timer = setTimeout(() => {
      fetchProfile();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.data);
        setNamaAdmin(data.data.nama_admin);
        setUsernameAdmin(data.data.username_admin);
        setError(null); // Clear any previous errors
      } else {
        // If profile load fails, try to get from localStorage as fallback
        const adminData = localStorage.getItem('admin');
        if (adminData) {
          try {
            const admin = JSON.parse(adminData);
            setProfile({
              _id: admin.id || '',
              nama_admin: admin.nama_admin || '',
              username_admin: admin.username_admin || '',
              role: admin.role || 'admin'
            });
            setNamaAdmin(admin.nama_admin || '');
            setUsernameAdmin(admin.username_admin || '');
            setError(null); // Don't show error if we have fallback data
          } catch (e) {
            setError(data.message || 'Gagal mengambil profil');
          }
        } else {
          setError(data.message || 'Gagal mengambil profil');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Try localStorage fallback
      const adminData = localStorage.getItem('admin');
      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          setProfile({
            _id: admin.id || '',
            nama_admin: admin.nama_admin || '',
            username_admin: admin.username_admin || '',
            role: admin.role || 'admin'
          });
          setNamaAdmin(admin.nama_admin || '');
          setUsernameAdmin(admin.username_admin || '');
          setError(null); // Use fallback without showing error
        } catch (e) {
          setError('Terjadi kesalahan saat mengambil profil. Pastikan backend berjalan di http://localhost:5000');
        }
      } else {
        setError('Terjadi kesalahan saat mengambil profil. Pastikan backend berjalan di http://localhost:5000');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('token');
      
      console.log('Updating profile with:', { namaAdmin, usernameAdmin });
      console.log('Token:', token ? 'exists' : 'not found');
      
      const response = await fetch(`${API_URL}/admin/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_admin: namaAdmin,
          username_admin: usernameAdmin
        })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (response.ok && data.success) {
        setProfile(data.data);
        setSuccessMessage('Profil berhasil diperbarui');
        setIsEditingProfile(false);
        
        // Update localStorage if username changed
        const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
        adminData.nama_admin = data.data.nama_admin;
        adminData.username_admin = data.data.username_admin;
        localStorage.setItem('admin', JSON.stringify(adminData));
        
        // Auto hide success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Terjadi kesalahan saat memperbarui profil');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok');
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/admin/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Password berhasil diperbarui');
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.message || 'Gagal memperbarui password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Terjadi kesalahan saat memperbarui password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="space-y-6 p-4 lg:p-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Profil Admin</h1>
          <p className="text-gray-600 mt-1 text-sm lg:text-base">Kelola informasi profil dan keamanan akun Anda</p>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
        <button
          onClick={fetchProfile}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Profil Admin</h1>
        <p className="text-gray-600 mt-1 text-sm lg:text-base">Kelola informasi profil dan keamanan akun Anda</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Error Message - Only show if profile exists (not initial load error) */}
      {error && profile && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Profile Information */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Informasi Profil</h2>
          {!isEditingProfile && (
            <button
              onClick={() => {
                setIsEditingProfile(true);
                setError(null);
              }}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profil
            </button>
          )}
        </div>

        {!isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nama Admin</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{profile?.nama_admin}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Username</label>
              <p className="text-lg font-semibold text-gray-900 mt-1">{profile?.username_admin}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Role</label>
              <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                {profile?.role}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Admin
              </label>
              <input
                type="text"
                value={namaAdmin}
                onChange={(e) => setNamaAdmin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={usernameAdmin}
                onChange={(e) => setUsernameAdmin(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingProfile(false);
                  setNamaAdmin(profile?.nama_admin || '');
                  setUsernameAdmin(profile?.username_admin || '');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </Card>

      {/* Change Password */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Keamanan Akun</h2>
          {!isChangingPassword && (
            <button
              onClick={() => {
                setIsChangingPassword(true);
                setError(null);
              }}
              className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
            >
              Ganti Password
            </button>
          )}
        </div>

        {!isChangingPassword ? (
          <div>
            <label className="text-sm font-medium text-gray-500">Password</label>
            <p className="text-lg text-gray-900 mt-1">••••••••</p>
            <p className="text-sm text-gray-500 mt-2">
              Untuk keamanan akun, sebaiknya gunakan password yang kuat dan unik
            </p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Lama
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-orange-400"
              >
                {passwordLoading ? 'Menyimpan...' : 'Ubah Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
