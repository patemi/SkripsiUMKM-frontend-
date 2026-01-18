'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'id' | 'en';

interface Translations {
    [key: string]: string | Translations;
}

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations
const translations: Record<Language, Translations> = {
    id: {
        // Common
        'common.loading': 'Memuat...',
        'common.error': 'Terjadi kesalahan',
        'common.success': 'Berhasil',
        'common.save': 'Simpan',
        'common.cancel': 'Batal',
        'common.delete': 'Hapus',
        'common.edit': 'Edit',
        'common.search': 'Cari',
        'common.filter': 'Filter',
        'common.all': 'Semua',
        'common.back': 'Kembali',
        'common.next': 'Selanjutnya',
        'common.previous': 'Sebelumnya',

        // Auth
        'auth.login': 'Masuk',
        'auth.logout': 'Keluar',
        'auth.register': 'Daftar',
        'auth.forgotPassword': 'Lupa Password?',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.username': 'Username',
        'auth.name': 'Nama Lengkap',
        'auth.loginWithGoogle': 'Masuk dengan Google',
        'auth.noAccount': 'Belum punya akun?',
        'auth.hasAccount': 'Sudah punya akun?',

        // Navigation
        'nav.home': 'Beranda',
        'nav.umkm': 'UMKM',
        'nav.favorites': 'Favorit',
        'nav.profile': 'Profil',
        'nav.help': 'Bantuan',
        'nav.settings': 'Pengaturan',

        // UMKM
        'umkm.add': 'Tambah UMKM',
        'umkm.name': 'Nama UMKM',
        'umkm.category': 'Kategori',
        'umkm.description': 'Deskripsi',
        'umkm.address': 'Alamat',
        'umkm.phone': 'Telepon',
        'umkm.operatingHours': 'Jam Operasional',
        'umkm.views': 'Dilihat',
        'umkm.approved': 'Disetujui',
        'umkm.pending': 'Menunggu',
        'umkm.rejected': 'Ditolak',
        'umkm.share': 'Bagikan',
        'umkm.addFavorite': 'Tambah ke Favorit',
        'umkm.removeFavorite': 'Hapus dari Favorit',

        // Categories
        'category.culinary': 'Kuliner',
        'category.fashion': 'Fashion',
        'category.crafts': 'Kerajinan',
        'category.services': 'Jasa',
        'category.agriculture': 'Agribisnis',
        'category.retail': 'Toko Kelontong',

        // Admin
        'admin.dashboard': 'Dashboard',
        'admin.analytics': 'Analitik',
        'admin.users': 'Pengguna',
        'admin.verification': 'Verifikasi',
        'admin.export': 'Export Data',
        'admin.activityLogs': 'Log Aktivitas',

        // Theme
        'theme.light': 'Terang',
        'theme.dark': 'Gelap',
        'theme.system': 'Sistem',

        // Settings
        'settings.language': 'Bahasa',
        'settings.theme': 'Tema',
        'settings.notifications': 'Notifikasi'
    },
    en: {
        // Common
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        'common.success': 'Success',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.all': 'All',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',

        // Auth
        'auth.login': 'Login',
        'auth.logout': 'Logout',
        'auth.register': 'Register',
        'auth.forgotPassword': 'Forgot Password?',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.username': 'Username',
        'auth.name': 'Full Name',
        'auth.loginWithGoogle': 'Login with Google',
        'auth.noAccount': "Don't have an account?",
        'auth.hasAccount': 'Already have an account?',

        // Navigation
        'nav.home': 'Home',
        'nav.umkm': 'UMKM',
        'nav.favorites': 'Favorites',
        'nav.profile': 'Profile',
        'nav.help': 'Help',
        'nav.settings': 'Settings',

        // UMKM
        'umkm.add': 'Add UMKM',
        'umkm.name': 'UMKM Name',
        'umkm.category': 'Category',
        'umkm.description': 'Description',
        'umkm.address': 'Address',
        'umkm.phone': 'Phone',
        'umkm.operatingHours': 'Operating Hours',
        'umkm.views': 'Views',
        'umkm.approved': 'Approved',
        'umkm.pending': 'Pending',
        'umkm.rejected': 'Rejected',
        'umkm.share': 'Share',
        'umkm.addFavorite': 'Add to Favorites',
        'umkm.removeFavorite': 'Remove from Favorites',

        // Categories
        'category.culinary': 'Culinary',
        'category.fashion': 'Fashion',
        'category.crafts': 'Crafts',
        'category.services': 'Services',
        'category.agriculture': 'Agriculture',
        'category.retail': 'Retail',

        // Admin
        'admin.dashboard': 'Dashboard',
        'admin.analytics': 'Analytics',
        'admin.users': 'Users',
        'admin.verification': 'Verification',
        'admin.export': 'Export Data',
        'admin.activityLogs': 'Activity Logs',

        // Theme
        'theme.light': 'Light',
        'theme.dark': 'Dark',
        'theme.system': 'System',

        // Settings
        'settings.language': 'Language',
        'settings.theme': 'Theme',
        'settings.notifications': 'Notifications'
    }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('id');

    // Load language from localStorage on mount
    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && ['id', 'en'].includes(savedLang)) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
        // Update html lang attribute
        document.documentElement.lang = lang;
    };

    // Translation function
    const t = (key: string): string => {
        const keys = key.split('.');
        let value: string | Translations = translations[language];

        for (const k of keys) {
            if (typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }

        return typeof value === 'string' ? value : key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
}
