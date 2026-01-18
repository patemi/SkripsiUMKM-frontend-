'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

interface ThemeToggleProps {
    showLabel?: boolean;
    className?: string;
}

export default function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const themes = [
        { value: 'light' as const, icon: <FiSun className="w-4 h-4" />, label: 'Terang' },
        { value: 'dark' as const, icon: <FiMoon className="w-4 h-4" />, label: 'Gelap' },
        { value: 'system' as const, icon: <FiMonitor className="w-4 h-4" />, label: 'Sistem' }
    ];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showLabel && (
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Tema:</span>
            )}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {themes.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${theme === t.value
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        title={t.label}
                    >
                        {t.icon}
                        {showLabel && <span className="text-sm">{t.label}</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Simple toggle button version
export function ThemeToggleButton({ className = '' }: { className?: string }) {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors ${className}`}
            title={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {resolvedTheme === 'dark' ? (
                <FiSun className="w-5 h-5 text-yellow-500" />
            ) : (
                <FiMoon className="w-5 h-5 text-gray-600" />
            )}
        </button>
    );
}
