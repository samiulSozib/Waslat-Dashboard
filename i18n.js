import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpApi) // Load translations from backend
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass the instance to react-i18next
    .init({
        lng:'fa',
        fallbackLng: 'fa', // Default language
        debug: process.env.NODE_ENV === 'development', // Debug in development mode
        interpolation: {
            escapeValue: false, // React already escapes values
        },
        backend: {
            loadPath: '/locales/{{lng}}.json', // Path to your JSON translation files
            //loadPath:`./public/locales/{{lng}}.json`
        },

    });

export default i18n;
