'use client';

import Link from 'next/link';
import { FiCheckCircle, FiMapPin, FiTrendingUp } from 'react-icons/fi';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src="/img/logo.png" alt="SoraUMKM" className="h-8 w-8 sm:h-10 sm:w-10" />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                SoraUMKM
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/user/login"
                className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-700 font-medium hover:text-blue-600 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/user/register"
                className="px-3 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-block">
              <span className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold rounded-full">
                Platform UMKM Solo Raya
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              Temukan UMKM
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Terbaik
              </span>
              <br />
              di Solo Raya
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl">
              Jelajahi berbagai UMKM berkualitas di wilayah Solo, Sukoharjo, Karanganyar, Sragen, Wonogiri, Klaten, dan Boyolali. Dukung ekonomi lokal dengan mudah!
            </p>

            <div className="pt-2">
              <Link
                href="/user/login"
                className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
              >
                Mulai Sekarang
              </Link>
            </div>
          </div>

          {/* Right Image with Floating Cards */}
          <div className="relative">
            <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900">
              <img
                src="/img/foto1.png"
                alt="UMKM Solo Raya"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10"></div>

              {/* Floating Cards */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white rounded-2xl shadow-xl p-3 sm:p-4 flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">UMKM Terverifikasi</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">500+</div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 bg-white rounded-2xl shadow-xl p-3 sm:p-4 flex items-center space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">Pengguna Aktif</div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">1000+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 sm:p-8 rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <FiCheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">UMKM Terverifikasi</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Semua UMKM telah melalui proses verifikasi untuk memastikan kualitas dan kredibilitas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-6 sm:p-8 rounded-2xl border border-green-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <FiMapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Lokasi Lengkap</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Informasi alamat lengkap dan integrasi Google Maps untuk memudahkan Anda menemukan UMKM.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 sm:p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6">
                <FiTrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Mudah Digunakan</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Interface yang intuitif dan fitur pencarian yang canggih untuk pengalaman terbaik.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-10 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-5">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/img/logo.png" alt="SoraUMKM" className="h-10 w-10" />
                <span className="text-2xl font-bold text-white">SoraUMKM</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Platform terpercaya untuk menemukan dan mendukung UMKM di wilayah Solo Raya.
              </p>
            </div>

            {/* Navigation Column */}
            <div className="lg:col-span-3">
              <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Navigasi</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <Link href="/user/home" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Jelajahi UMKM
                  </Link>
                </li>
                <li>
                  <Link href="/user/help" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Bantuan
                  </Link>
                </li>
                <li>
                  <Link href="/user/register" className="text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors">
                    Daftar
                  </Link>
                </li>
              </ul>
            </div>

            {/* Region Column */}
            <div className="lg:col-span-4">
              <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Wilayah</h4>
              <ul className="space-y-2 sm:space-y-3">
                <li className="text-sm sm:text-base text-gray-400">Solo</li>
                <li className="text-sm sm:text-base text-gray-400">Sukoharjo</li>
                <li className="text-sm sm:text-base text-gray-400">Karanganyar</li>
                <li className="text-sm sm:text-base text-gray-400">Sragen</li>
                <li className="text-sm sm:text-base text-gray-400">Wonogiri</li>
                <li className="text-sm sm:text-base text-gray-400">Klaten</li>
                <li className="text-sm sm:text-base text-gray-400">Boyolali</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 sm:mt-10 pt-6 sm:pt-8">
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                © 2025 SoraUMKM - Platform UMKM Solo Raya. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
