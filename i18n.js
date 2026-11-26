import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpApi) // Load translations from backend
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass the instance to react-i18next
    .init({
        // Persian-first admin panel
        lng: 'fa',
        fallbackLng: 'fa',
        supportedLngs: ['fa', 'en', 'ar', 'ps', 'bn', 'tr', 'de', 'es', 'fr', 'ja', 'zh'],
        nonExplicitSupportedLngs: true,
        load: 'languageOnly',
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
            escapeValue: false
        },
        detection: {
            // Prefer saved choice, otherwise stay on Persian (do not force browser EN)
            order: ['localStorage', 'cookie'],
            caches: ['localStorage', 'cookie'],
            lookupLocalStorage: 'i18nextLng'
        },
        backend: {
            loadPath: '/locales/{{lng}}.json'
        }
    });

export default i18n;
