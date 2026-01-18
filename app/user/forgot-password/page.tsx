'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { FiMail, FiCheckCircle, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [email, setEmail] = useState('');
    const [resetUrl, setResetUrl] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/user/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (data.success) {
                setShowSuccess(true);
                // Untuk development, tampilkan reset URL jika ada
                if (data.resetUrl) {
                    setResetUrl(data.resetUrl);
                }
            } else {
                setErrorMessage(data.message || 'Terjadi kesalahan');
                setShowError(true);
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setErrorMessage('Terjadi kesalahan. Silakan coba lagi nanti.');
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            {showSuccess && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-green-100">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6 shadow-lg">
                                <FiCheckCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Email Terkirim!
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Jika email terdaftar, kami telah mengirim link untuk reset password.
                                Silakan cek inbox atau folder spam Anda.
                            </p>

                            {/* Development only: Show reset URL */}
                            {resetUrl && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
                                    <p className="text-xs text-yellow-600 font-medium mb-2">🔧 Development Mode:</p>
                                    <a
                                        href={resetUrl}
                                        className="text-sm text-blue-600 hover:underline break-all"
                                    >
                                        {resetUrl}
                                    </a>
                                </div>
                            )}

                            <Link
                                href="/user/login"
                                className="w-full inline-block bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300"
                            >
                                Kembali ke Login
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {showError && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg min-h-screen w-screen animate-fadeIn">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10 transform animate-slideInUp border border-red-100">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 mb-6 shadow-lg">
                                <FiAlertCircle className="h-12 w-12 text-white" strokeWidth={2.5} />
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Gagal Mengirim
                            </h3>
                            <p className="text-gray-600 mb-6">{errorMessage}</p>

                            <button
                                onClick={() => setShowError(false)}
                                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300"
                            >
                                Coba Lagi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-10 px-4">
                <div className="max-w-md w-full">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center space-x-3 mb-4">
                            <img src="/img/logo.png" alt="SoraUMKM" className="h-12 w-12" />
                            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                SoraUMKM
                            </span>
                        </Link>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lupa Password?</h2>
                        <p className="text-gray-600">Masukkan email Anda untuk reset password</p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        disabled={loading}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href="/user/login"
                                className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                <FiArrowLeft className="w-4 h-4 mr-2" />
                                Kembali ke Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
