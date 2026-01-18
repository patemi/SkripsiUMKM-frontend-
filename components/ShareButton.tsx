'use client';

import { useState } from 'react';
import { FiShare2, FiX, FiCopy, FiCheck } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaTwitter } from 'react-icons/fa';

interface ShareButtonProps {
    title: string;
    description?: string;
    url?: string;
    className?: string;
}

export default function ShareButton({ title, description, url, className = '' }: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareText = description || title;

    const shareLinks = [
        {
            name: 'WhatsApp',
            icon: <FaWhatsapp className="w-6 h-6" />,
            color: 'bg-green-500 hover:bg-green-600',
            href: `https://wa.me/?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`
        },
        {
            name: 'Facebook',
            icon: <FaFacebook className="w-6 h-6" />,
            color: 'bg-blue-600 hover:bg-blue-700',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`
        },
        {
            name: 'Twitter',
            icon: <FaTwitter className="w-6 h-6" />,
            color: 'bg-sky-500 hover:bg-sky-600',
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
        }
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <>
            {/* Share Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors ${className}`}
            >
                <FiShare2 className="w-4 h-4" />
                <span>Bagikan</span>
            </button>

            {/* Share Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-slideInUp">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bagikan UMKM</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Title Preview */}
                        <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{shareUrl}</p>
                        </div>

                        {/* Share Options */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {shareLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex flex-col items-center gap-2 p-4 ${link.color} text-white rounded-xl transition-transform hover:scale-105`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.icon}
                                    <span className="text-xs font-medium">{link.name}</span>
                                </a>
                            ))}
                        </div>

                        {/* Copy Link */}
                        <button
                            onClick={copyToClipboard}
                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${copied
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
                                }`}
                        >
                            {copied ? (
                                <>
                                    <FiCheck className="w-5 h-5" />
                                    <span className="font-medium">Link Tersalin!</span>
                                </>
                            ) : (
                                <>
                                    <FiCopy className="w-5 h-5" />
                                    <span className="font-medium">Salin Link</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
