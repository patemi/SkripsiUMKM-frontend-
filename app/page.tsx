'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { FiCheckCircle, FiUsers, FiTrendingUp, FiMapPin } from 'react-icons/fi';

export default function LandingPage() {
  useEffect(() => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';

    // Intersection Observer for fade-in animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all elements with data-animate
    const animateElements = document.querySelectorAll('[data-animate]');
    animateElements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image src="/img/logo.png" alt="SoraUMKM" width={40} height={40} className="rounded-lg" />
              <span className="text-2xl font-bold text-gray-900">SoraUMKM</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/user/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/user/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Daftar
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 opacity-0 translate-y-10" data-animate>
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                Platform UMKM Solo Raya
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Temukan UMKM
                <span className="text-blue-600"> Terbaik</span>
                <br />di Solo Raya
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Jelajahi berbagai UMKM berkualitas di wilayah Solo, Sukoharjo, Karanganyar, Sragen, Wonogiri, Klaten, dan Boyolali. Dukung ekonomi lokal dengan mudah!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/user/home"
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  Jelajahi UMKM
                </Link>
                <Link
                  href="/user/register"
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-colors font-semibold text-lg"
                >
                  Daftar Sekarang
                </Link>
              </div>
            </div>

            {/* Right Content - Image */}
            <div className="relative opacity-0 translate-y-10" data-animate>
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/img/foto1.png"
                  alt="UMKM Solo Raya"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Floating Cards */}
              <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">UMKM Terverifikasi</p>
                    <p className="text-2xl font-bold text-gray-900">500+</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiUsers className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pengguna Aktif</p>
                    <p className="text-2xl font-bold text-gray-900">1000+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 opacity-0 translate-y-10" data-animate>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Mengapa SoraUMKM?</h2>
            <p className="text-xl text-gray-600">Platform terpercaya untuk menemukan dan mendukung UMKM lokal</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 opacity-0 translate-y-10" data-animate>
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <FiCheckCircle className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">UMKM Terverifikasi</h3>
              <p className="text-gray-600 leading-relaxed">
                Semua UMKM telah melalui proses verifikasi untuk memastikan kualitas dan kredibilitas.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 opacity-0 translate-y-10" data-animate>
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
                <FiMapPin className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Lokasi Lengkap</h3>
              <p className="text-gray-600 leading-relaxed">
                Informasi alamat lengkap dan integrasi Google Maps untuk memudahkan Anda menemukan UMKM.
              </p>
            </div>

            <div className="p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 opacity-0 translate-y-10" data-animate>
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <FiTrendingUp className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mudah Digunakan</h3>
              <p className="text-gray-600 leading-relaxed">
                Interface yang intuitif dan fitur pencarian yang canggih untuk pengalaman terbaik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center opacity-0 translate-y-10" data-animate>
          <h2 className="text-4xl font-bold text-white mb-6">
            Siap Menjelajahi UMKM Solo Raya?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pengguna lainnya yang telah menemukan UMKM favorit mereka
          </p>
          <Link
            href="/user/home"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            Mulai Sekarang
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/img/logo.png" alt="SoraUMKM" width={40} height={40} className="rounded-lg" />
                <span className="text-2xl font-bold">SoraUMKM</span>
              </div>
              <p className="text-gray-400 mb-4">
                Platform terpercaya untuk menemukan dan mendukung UMKM di wilayah Solo Raya.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Navigasi</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/user/home" className="hover:text-white">Jelajahi UMKM</Link></li>
                <li><Link href="/user/help" className="hover:text-white">Bantuan</Link></li>
                <li><Link href="/user/register" className="hover:text-white">Daftar</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Wilayah</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Solo</li>
                <li>Sukoharjo</li>
                <li>Karanganyar</li>
                <li>Sragen</li>
                <li>Wonogiri</li>
                <li>Klaten</li>
                <li>Boyolali</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SoraUMKM - Platform UMKM Solo Raya. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
