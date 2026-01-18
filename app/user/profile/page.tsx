'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle, FiCalendar, FiKey } from 'react-icons/fi';
import { API_URL } from '@/lib/api';
import { Card } from '@/components/ui/Card';

interface UserProfile {
  _id: string;
  nama_user: string;
  email_user: string;
  username: string;
  createdAt: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [namaUser, setNamaUser] = useState('');
  const [emailUser, setEmailUser] = useState('');
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
    const loadProfile = async () => {
      const token = localStorage.getItem('userToken');

      if (!token) {
        router.push('/user/login');
        return;
      }

      await fetchProfile();
    };

    loadProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('userToken');

      if (!token) {
        router.push('/user/login');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.data);
        setNamaUser(data.data.nama_user);
        setEmailUser(data.data.email_user);
        setError(null);
      } else {
        if (response.status === 401) {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userData');
          router.push('/user/login');
          return;
        }
        setError(data.message || 'Gagal mengambil profil');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Terjadi kesalahan saat mengambil profil');
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
      const token = localStorage.getItem('userToken');

      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama_user: namaUser,
          email_user: emailUser
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfile(data.data);
        setSuccessMessage('Profil berhasil diperbarui');
        setIsEditingProfile(false);

        // Update localStorage agar halaman lain juga terupdate
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            userData.nama_user = data.data.nama_user;
            userData.email_user = data.data.email_user;
            localStorage.setItem('userData', JSON.stringify(userData));

            // Dispatch custom event untuk refresh halaman lain (home, navbar, dll)
            window.dispatchEvent(new Event('userProfileUpdated'));
          } catch (e) {
            console.error('Error updating localStorage:', e);
          }
        }

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

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter');
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok');
      setPasswordLoading(false);
      return;
    }

    if (currentPassword === newPassword) {
      setError('Password baru harus berbeda dengan password saat ini');
      setPasswordLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('userToken');

      const response = await fetch(`${API_URL}/user/password`, {
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
        setSuccessMessage('Password berhasil diubah');
        setIsChangingPassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(data.message || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError('Terjadi kesalahan saat mengubah password');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 space-y-6">
          <Link
            href="/user/home"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <FiArrowLeft size={20} />
            Kembali
          </Link>

          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Profil Saya</h1>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 lg:py-12">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 space-y-6">
        <Link
          href="/user/home"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <FiArrowLeft size={20} />
          Kembali
        </Link>

        <div className="text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-600 mt-2 text-base lg:text-lg">Kelola informasi profil dan keamanan akun Anda</p>
        </div>

        {successMessage && (
          <div className="bg-green-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm">
            <FiCheckCircle size={24} className="flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {error && profile && (
          <div className="bg-red-50 border-2 border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <FiAlertCircle size={24} className="flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 font-bold text-xl"
            >
              ✕
            </button>
          </div>
        )}

        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl lg:text-4xl font-bold text-white">
                  {profile?.nama_user.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{profile?.nama_user}</h2>
                <p className="text-gray-600 text-base lg:text-lg mt-1">@{profile?.username}</p>
              </div>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => {
                  setIsEditingProfile(true);
                  setError(null);
                }}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Edit Profil
              </button>
            )}
          </div>

          {!isEditingProfile ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nama Lengkap</label>
                <p className="text-lg lg:text-xl font-semibold text-gray-900 mt-2">{profile?.nama_user}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Username</label>
                <p className="text-lg lg:text-xl font-semibold text-gray-900 mt-2">@{profile?.username}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
                <p className="text-lg lg:text-xl font-semibold text-gray-900 mt-2 break-all">{profile?.email_user}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Terdaftar Sejak</label>
                <p className="text-lg lg:text-xl font-semibold text-gray-900 mt-2">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-'}
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={namaUser}
                      onChange={(e) => setNamaUser(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={emailUser}
                      onChange={(e) => setEmailUser(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors shadow-md hover:shadow-lg"
                >
                  {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setNamaUser(profile?.nama_user || '');
                    setEmailUser(profile?.email_user || '');
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </Card>

        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FiLock className="text-red-600" size={28} />
              Keamanan Akun
            </h2>
            {!isChangingPassword && (
              <button
                onClick={() => {
                  setIsChangingPassword(true);
                  setError(null);
                }}
                className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-md hover:shadow-lg"
              >
                Ganti Password
              </button>
            )}
          </div>

          {!isChangingPassword ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-6 rounded-xl">
                <p className="text-sm lg:text-base text-blue-800 leading-relaxed">
                  <strong>💡 Tips Keamanan:</strong> Gunakan password yang kuat dengan kombinasi huruf besar, huruf kecil, angka, dan simbol. Jangan bagikan password Anda kepada siapa pun.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status Password</label>
                <p className="text-lg lg:text-xl font-semibold text-gray-900 mt-2 flex items-center gap-3">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Aman
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Saat Ini
                  </label>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showCurrentPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru
                  </label>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Minimal 8 karakter</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors shadow-md hover:shadow-lg"
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
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Akun</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-600">Username</p>
                <p className="text-lg font-semibold text-gray-900">@{profile?.username}</p>
              </div>
              <span className="text-xs font-medium text-gray-500">Tidak dapat diubah</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <FiCalendar size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Terdaftar Sejak</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
