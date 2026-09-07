import { useState, useEffect } from 'react';
import frTranslations from './fr.json';
import enTranslations from './en.json';

type Translations = Record<string, any>;
type TranslationKey = string;

const translations: Record<string, Translations> = {
  fr: frTranslations,
  en: enTranslations,
};

export const useTranslation = () => {
  const [currentLang, setCurrentLang] = useState<string>('fr');
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(frTranslations);

  useEffect(() => {
    const lang = localStorage.getItem('language') || document.documentElement.lang || 'fr';
    setCurrentLang(lang);
    setCurrentTranslations(translations[lang] || frTranslations);
  }, []);

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = currentTranslations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return { t, currentLang };
};
