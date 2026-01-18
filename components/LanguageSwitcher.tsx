'use client';

import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSwitcherProps {
    showLabel?: boolean;
    className?: string;
}

export default function LanguageSwitcher({ showLabel = false, className = '' }: LanguageSwitcherProps) {
    const { language, setLanguage } = useLanguage();

    const languages = [
        { value: 'id' as const, label: '🇮🇩 ID', fullName: 'Indonesia' },
        { value: 'en' as const, label: '🇬🇧 EN', fullName: 'English' }
    ];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showLabel && (
                <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Bahasa:</span>
            )}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {languages.map((lang) => (
                    <button
                        key={lang.value}
                        onClick={() => setLanguage(lang.value)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${language === lang.value
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        title={lang.fullName}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Dropdown version
export function LanguageDropdown({ className = '' }: { className?: string }) {
    const { language, setLanguage } = useLanguage();

    return (
        <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
            className={`px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 ${className}`}
        >
            <option value="id">🇮🇩 Indonesia</option>
            <option value="en">🇬🇧 English</option>
        </select>
    );
}
