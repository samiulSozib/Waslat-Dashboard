import i18n from 'i18next';
import { DEFAULT_LOCALE, isRtlLocale } from '@/lib/locale';

/** Persian-first: unknown/empty language is treated as RTL */
export const isRTL = () => {
    return isRtlLocale(i18n.language || DEFAULT_LOCALE);
};
