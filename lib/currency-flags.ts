/** Built-in currency flags. Admin picks one; no file download required. */

export type CurrencyFlagOption = {
    code: string;
    name: string;
    flag: string;
};

export const CURRENCY_FLAG_OPTIONS: CurrencyFlagOption[] = [
    { code: 'AFN', name: 'افغانی', flag: 'https://flagcdn.com/w80/af.png' },
    { code: 'USD', name: 'دالر', flag: 'https://flagcdn.com/w80/us.png' },
    { code: 'EUR', name: 'یورو', flag: 'https://flagcdn.com/w80/eu.png' },
    { code: 'GBP', name: 'پوند', flag: 'https://flagcdn.com/w80/gb.png' },
    { code: 'PKR', name: 'روپیه پاکستان', flag: 'https://flagcdn.com/w80/pk.png' },
    { code: 'IRR', name: 'ریال ایران', flag: 'https://flagcdn.com/w80/ir.png' },
    { code: 'INR', name: 'روپیه هند', flag: 'https://flagcdn.com/w80/in.png' },
    { code: 'TRY', name: 'لیر ترکیه', flag: 'https://flagcdn.com/w80/tr.png' },
    { code: 'AED', name: 'درهم', flag: 'https://flagcdn.com/w80/ae.png' },
    { code: 'SAR', name: 'ریال سعودی', flag: 'https://flagcdn.com/w80/sa.png' },
    { code: 'CNY', name: 'یوان', flag: 'https://flagcdn.com/w80/cn.png' },
    { code: 'BDT', name: 'تاکا', flag: 'https://flagcdn.com/w80/bd.png' }
];

const PRESET_URLS = new Set(CURRENCY_FLAG_OPTIONS.map((item) => item.flag));

const CODE_ALIASES: Record<string, string> = {
    LIR: 'TRY',
    LIRA: 'TRY',
    TL: 'TRY',
    TMN: 'IRR',
    TOMAN: 'IRR'
};

function canonicalCurrencyCode(code?: string | null): string {
    const raw = (code || '').trim().toUpperCase();
    return CODE_ALIASES[raw] || raw;
}

export function currencyFaName(currency?: { code?: string | null; name?: string | null; symbol?: string | null } | null): string {
    const code = (currency?.code || '').trim().toUpperCase();
    const symbol = (currency?.symbol || '').trim().toUpperCase();
    const name = (currency?.name || '').toLowerCase();
    if (code === 'LIR' || symbol === 'LIR' || name.includes('lir')) return 'لیر ترکیه';
    if (symbol === 'TMN' || name.includes('toman')) return 'تومان';
    if (code === 'AFN' || name.includes('afghan')) return 'افغانی';
    const preset = CURRENCY_FLAG_OPTIONS.find((item) => item.code === canonicalCurrencyCode(code) || item.code === canonicalCurrencyCode(symbol));
    return preset?.name || currency?.name || currency?.code || '—';
}

export function resolveCurrencyFlag(row: {
    code?: string | null;
    flag_image_url?: string | File | null;
    country?: { country_flag_image_url?: string | null } | null;
}): string {
    if (typeof row.flag_image_url === 'string' && row.flag_image_url) return row.flag_image_url;
    const countryFlag = row.country?.country_flag_image_url;
    if (countryFlag) return countryFlag;
    return flagForCurrencyCode(row.code) || '';
}

export function flagForCurrencyCode(code?: string | null): string | null {
    if (!code) return null;
    const match = CURRENCY_FLAG_OPTIONS.find((item) => item.code === canonicalCurrencyCode(code));
    return match?.flag ?? null;
}

function formatRateAmount(value?: number | string | null): string {
    if (value == null || value === '') return '';
    const amount = Number(value);
    if (Number.isNaN(amount)) return String(value);
    return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/** Sentence written from the filled amount and buy/sell prices. */
export function defaultHawalaRateDescription(rate: {
    amount?: number | string | null;
    buy_rate?: number | string | null;
    sell_rate?: number | string | null;
    from_currency?: { code?: string | null; name?: string | null; symbol?: string | null } | null;
    to_currency?: { code?: string | null; name?: string | null; symbol?: string | null } | null;
}): string {
    const amount = Number(rate.amount);
    const buy = Number(rate.buy_rate);
    const sell = Number(rate.sell_rate);
    if (!rate.from_currency || !rate.to_currency || !amount || Number.isNaN(buy) || Number.isNaN(sell)) return '';
    const fromName = currencyFaName(rate.from_currency);
    const toName = currencyFaName(rate.to_currency);
    return `یعنی صراف از مشتریان ${formatRateAmount(amount)} ${fromName} را به قیمت ${formatRateAmount(buy)} ${toName} می‌خرد و ${formatRateAmount(sell)} ${toName} می‌فروشد.`;
}

export function isPresetFlag(url?: string | File | null): boolean {
    return typeof url === 'string' && PRESET_URLS.has(url);
}
