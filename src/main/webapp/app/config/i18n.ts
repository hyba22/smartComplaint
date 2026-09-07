import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import frTranslations from 'app/i18n/fr.json';
import enTranslations from 'app/i18n/en.json';

const resources = {
  fr: {
    translation: frTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

const savedLanguage = localStorage.getItem('language') || 'fr';

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'fr',
  debug: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
