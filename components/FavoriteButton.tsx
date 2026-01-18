'use client';

import { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { API_URL } from '@/lib/api';

interface FavoriteButtonProps {
    umkmId: string;
    className?: string;
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({
    umkmId,
    className = '',
    showText = false,
    size = 'md'
}: FavoriteButtonProps) {
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const buttonSizes = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5'
    };

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        setIsLoggedIn(!!token);

        if (token) {
            checkFavoriteStatus();
        }
    }, [umkmId]);

    const checkFavoriteStatus = async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) return;

            const res = await fetch(`${API_URL}/favorites/check/${umkmId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (data.success) {
                setIsFavorited(data.isFavorited);
            }
        } catch (err) {
            console.error('Error checking favorite status:', err);
        }
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn) {
            // Redirect to login or show message
            alert('Silakan login untuk menambahkan favorit');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('userToken');
            const method = isFavorited ? 'DELETE' : 'POST';

            const res = await fetch(`${API_URL}/favorites/${umkmId}`, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();

            if (data.success || res.ok) {
                setIsFavorited(!isFavorited);
            }
        } catch (err) {
            console.error('Error toggling favorite:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            disabled={loading}
            className={`
        ${buttonSizes[size]}
        rounded-full
        transition-all duration-200
        ${isFavorited
                    ? 'bg-red-50 text-red-500 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-400'
                }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${showText ? 'flex items-center gap-2 px-3' : ''}
        ${className}
      `}
            title={isFavorited ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        >
            <FiHeart
                className={`${sizeClasses[size]} ${isFavorited ? 'fill-current' : ''}`}
            />
            {showText && (
                <span className="text-sm font-medium">
                    {isFavorited ? 'Favorit' : 'Favorit'}
                </span>
            )}
        </button>
    );
}
