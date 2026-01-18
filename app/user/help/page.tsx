'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiHelpCircle, FiChevronDown, FiChevronUp, FiArrowLeft, FiSearch, FiShoppingBag, FiCheckCircle, FiUser, FiEdit, FiMapPin, FiClock } from 'react-icons/fi';

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: { category: string; icon: React.ReactNode; items: FAQItem[] }[] = [
    {
        category: 'Tentang SoraUMKM',
        icon: <FiHelpCircle className="w-5 h-5" />,
        items: [
            {
                question: 'Apa itu SoraUMKM?',
                answer: 'SoraUMKM adalah platform digital untuk menampilkan dan menemukan UMKM (Usaha Mikro Kecil Menengah) di wilayah Solo Raya. Platform ini membantu pelaku UMKM mempromosikan usaha mereka dan memudahkan masyarakat menemukan UMKM terdekat.'
            },
            {
                question: 'Wilayah mana saja yang tercakup?',
                answer: 'SoraUMKM mencakup 7 kabupaten/kota di Solo Raya: Kota Surakarta (Solo), Kabupaten Sukoharjo, Kabupaten Karanganyar, Kabupaten Sragen, Kabupaten Wonogiri, Kabupaten Klaten, dan Kabupaten Boyolali.'
            },
            {
                question: 'Apakah layanan ini gratis?',
                answer: 'Ya, pendaftaran dan penggunaan SoraUMKM sepenuhnya gratis. Anda dapat mendaftar, menambahkan UMKM, dan menjelajahi UMKM lainnya tanpa biaya apapun.'
            }
        ]
    },
    {
        category: 'Akun & Pendaftaran',
        icon: <FiUser className="w-5 h-5" />,
        items: [
            {
                question: 'Bagaimana cara mendaftar?',
                answer: 'Klik tombol "Daftar" di halaman utama, isi formulir dengan nama lengkap, email, username, dan password minimal 8 karakter. Anda juga bisa mendaftar langsung menggunakan akun Google untuk proses yang lebih cepat.'
            },
            {
                question: 'Saya lupa password, bagaimana cara reset?',
                answer: 'Klik link "Lupa Password?" di halaman login, masukkan email yang terdaftar, lalu ikuti instruksi yang dikirim ke email Anda untuk membuat password baru.'
            },
            {
                question: 'Bisakah saya login dengan Google?',
                answer: 'Ya, SoraUMKM mendukung login dengan akun Google. Cukup klik tombol "Login dengan Google" dan pilih akun Google Anda. Email Anda akan otomatis terverifikasi.'
            }
        ]
    },
    {
        category: 'Menambahkan UMKM',
        icon: <FiShoppingBag className="w-5 h-5" />,
        items: [
            {
                question: 'Bagaimana cara menambahkan UMKM saya?',
                answer: 'Setelah login, klik "UMKM Saya" lalu pilih "Tambah UMKM Baru". Isi semua informasi yang diperlukan seperti nama usaha, kategori, deskripsi, alamat, jam operasional, kontak, dan upload foto (maksimal 5 foto).'
            },
            {
                question: 'Kategori apa saja yang tersedia?',
                answer: 'Tersedia 6 kategori: Kuliner, Fashion, Kerajinan, Jasa, Agribisnis & Pertanian, dan Toko Kelontong. Pilih kategori yang paling sesuai dengan usaha Anda.'
            },
            {
                question: 'Berapa lama proses verifikasi UMKM?',
                answer: 'Setelah Anda mengajukan UMKM, tim admin akan melakukan verifikasi dalam 1-3 hari kerja. Anda akan menerima notifikasi jika UMKM Anda sudah disetujui atau memerlukan perbaikan.'
            },
            {
                question: 'UMKM saya ditolak, apa yang harus dilakukan?',
                answer: 'Jika ditolak, Anda akan melihat alasan penolakan di halaman "UMKM Saya". Perbaiki data sesuai masukan dari admin, lalu ajukan kembali.'
            }
        ]
    },
    {
        category: 'Fitur Pencarian',
        icon: <FiSearch className="w-5 h-5" />,
        items: [
            {
                question: 'Bagaimana cara mencari UMKM?',
                answer: 'Gunakan kolom pencarian di halaman utama untuk mencari berdasarkan nama atau deskripsi. Anda juga bisa memfilter berdasarkan kategori atau lokasi terdekat.'
            },
            {
                question: 'Apa itu fitur "Terdekat dari Lokasi Saya"?',
                answer: 'Fitur ini menggunakan GPS untuk menampilkan UMKM dalam radius 20km dari lokasi Anda. Aktifkan izin lokasi di browser, lalu klik tombol "Lokasi Saya" untuk menggunakan fitur ini.'
            },
            {
                question: 'Bisakah saya melihat UMKM yang sedang buka?',
                answer: 'Ya, gunakan filter "Buka Sekarang" untuk hanya menampilkan UMKM yang sedang beroperasi berdasarkan jam operasional yang mereka cantumkan.'
            }
        ]
    },
    {
        category: 'Lokasi & Peta',
        icon: <FiMapPin className="w-5 h-5" />,
        items: [
            {
                question: 'Bagaimana cara menambahkan lokasi di Google Maps?',
                answer: 'Buka Google Maps, cari lokasi usaha Anda, klik kanan dan pilih "Bagikan" atau "Share", lalu salin link-nya. Tempelkan link tersebut di kolom "Link Google Maps" saat menambahkan UMKM.'
            },
            {
                question: 'Mengapa lokasi UMKM saya tidak muncul di peta?',
                answer: 'Pastikan Anda sudah memasukkan link Google Maps yang valid. Link harus mengandung koordinat lokasi. Jika masih bermasalah, coba gunakan link dengan format maps.google.com yang mengandung latitude dan longitude.'
            }
        ]
    },
    {
        category: 'Jam Operasional',
        icon: <FiClock className="w-5 h-5" />,
        items: [
            {
                question: 'Bagaimana cara mengisi jam operasional?',
                answer: 'Pada form UMKM, isi jam buka dan tutup untuk setiap hari. Format: "08:00 - 17:00". Jika tutup di hari tertentu, isi dengan "Tutup". Untuk buka 24 jam, isi "24 Jam".'
            },
            {
                question: 'Apakah jam operasional bisa berbeda setiap hari?',
                answer: 'Ya, Anda dapat mengatur jam operasional berbeda untuk setiap hari dalam seminggu sesuai dengan jadwal usaha Anda.'
            }
        ]
    }
];

export default function HelpPage() {
    const [openIndex, setOpenIndex] = useState<{ [key: string]: number | null }>({});
    const [searchQuery, setSearchQuery] = useState('');

    const toggleFAQ = (category: string, index: number) => {
        setOpenIndex(prev => ({
            ...prev,
            [category]: prev[category] === index ? null : index
        }));
    };

    // Filter FAQ based on search query
    const filteredFAQ = faqData.map(category => ({
        ...category,
        items: category.items.filter(
            item =>
                item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.items.length > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/user/home" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                            <FiArrowLeft className="w-5 h-5 mr-2" />
                            <span className="font-medium">Kembali</span>
                        </Link>
                        <div className="flex items-center space-x-2">
                            <img src="/img/logo.png" alt="SoraUMKM" className="h-8 w-8" />
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                SoraUMKM
                            </span>
                        </div>
                        <div className="w-20"></div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 sm:py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <FiHelpCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4">Pusat Bantuan</h1>
                    <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8">
                        Temukan jawaban untuk pertanyaan Anda tentang SoraUMKM
                    </p>

                    {/* Search Box */}
                    <div className="max-w-xl mx-auto relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cari pertanyaan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    </div>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-4xl mx-auto">
                    {filteredFAQ.length === 0 ? (
                        <div className="text-center py-12">
                            <FiSearch className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada hasil ditemukan</h3>
                            <p className="text-gray-500">Coba kata kunci yang berbeda</p>
                        </div>
                    ) : (
                        filteredFAQ.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="mb-8">
                                {/* Category Header */}
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-3">
                                        {category.icon}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{category.category}</h2>
                                </div>

                                {/* FAQ Items */}
                                <div className="space-y-3">
                                    {category.items.map((item, itemIndex) => (
                                        <div
                                            key={itemIndex}
                                            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <button
                                                onClick={() => toggleFAQ(category.category, itemIndex)}
                                                className="w-full px-5 py-4 flex items-center justify-between text-left"
                                            >
                                                <span className="font-medium text-gray-900 pr-4">{item.question}</span>
                                                {openIndex[category.category] === itemIndex ? (
                                                    <FiChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                                ) : (
                                                    <FiChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                )}
                                            </button>
                                            {openIndex[category.category] === itemIndex && (
                                                <div className="px-5 pb-4">
                                                    <div className="pt-2 border-t border-gray-100">
                                                        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Contact Section */}
                <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Masih butuh bantuan?</h3>
                    <p className="text-gray-600 mb-4">Tim kami siap membantu Anda</p>
                    <a
                        href="mailto:support@soraumkm.id"
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <FiEdit className="w-5 h-5 mr-2" />
                        Hubungi Kami
                    </a>
                </div>
            </div>
        </div>
    );
}
