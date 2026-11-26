/** Persian-first / RTL-first locale helpers for Waslat admin */

export const DEFAULT_LOCALE = 'fa';

export const RTL_LOCALES = ['fa', 'ar', 'ps', 'bn'] as const;

export type RtlLocale = (typeof RTL_LOCALES)[number];

export function isRtlLocale(locale?: string | null): boolean {
    if (!locale) return true; // Persian-first: assume RTL when unknown
    const base = locale.toLowerCase().split('-')[0];
    return (RTL_LOCALES as readonly string[]).includes(base);
}

export const LANGUAGE_OPTIONS = [
    { name: 'فارسی', language_code: 'fa', flag: 'https://flagcdn.com/w40/ir.png' },
    { name: 'پښتو', language_code: 'ps', flag: 'https://flagcdn.com/w40/af.png' },
    { name: 'العربية', language_code: 'ar', flag: 'https://flagcdn.com/w40/sa.png' },
    { name: 'English', language_code: 'en', flag: 'https://flagcdn.com/w40/us.png' },
    { name: 'Bangladesh', language_code: 'bn', flag: 'https://flagcdn.com/w40/bd.png' },
    { name: 'Türkçe', language_code: 'tr', flag: 'https://flagcdn.com/w40/tr.png' }
] as const;
