// utils/rtlUtils.ts
import i18n from 'i18next';

export const isRTL = () => {
    return ["ar", "fa", "ps", "ar"].includes(i18n.language);
};

