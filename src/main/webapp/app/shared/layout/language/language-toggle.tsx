import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from 'app/config/store';
import axios from 'axios';

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const account = useAppSelector(state => state.authentication.account);
  const [showDropdown, setShowDropdown] = useState(false);

  const currentLang = i18n.language as 'fr' | 'en';

  const changeLanguage = async (lang: 'fr' | 'en') => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;

    // Update user preference if logged in
    if (account?.login) {
      try {
        await axios.post('/api/account', {
          ...account,
          langKey: lang,
        });
      } catch (error) {
        console.error('Failed to update language preference:', error);
      }
    }
  };

  const languages = {
    fr: { label: 'Français', flag: '🇫🇷' },
    en: { label: 'English', flag: '🇬🇧' },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
        aria-label={currentLang === 'fr' ? 'Changer la langue' : 'Change language'}
        title={languages[currentLang].label}
      >
        <FontAwesomeIcon icon={faGlobe} className="text-xl" />
        <span className="text-sm font-medium hidden md:inline">{currentLang.toUpperCase()}</span>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            {Object.entries(languages).map(([code, { label, flag }]) => (
              <button
                key={code}
                onClick={() => {
                  changeLanguage(code as 'fr' | 'en');
                  setShowDropdown(false);
                }}
                className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                  currentLang === code
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-2xl">{flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{code.toUpperCase()}</div>
                </div>
                {currentLang === code && (
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageToggle;
