export type HawalaBoardRate = {
    id?: number;
    from_currency_id?: number | string;
    to_currency_id?: number | string;
    amount?: number | string | null;
    buy_rate?: number | string | null;
    sell_rate?: number | string | null;
    updated_at?: string | null;
    from_currency?: { id?: number; code?: string | null } | null;
    to_currency?: { id?: number; code?: string | null } | null;
};

export type HawalaCommissionPaidBy = 'sender' | 'receiver';

export type HawalaQuote = {
    debit: number | null;
    payout: number | null;
    amountConverted: number | null;
    payoutCurrencyCode: string | null;
    sameCurrency: boolean;
    missingRate: boolean;
    invalidCommission: boolean;
    rate: number | null;
    unit: number | null;
    rateSide: 'buy' | 'sell' | 'same' | null;
};

function num(value: unknown) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function sideId(rate: HawalaBoardRate, side: 'from' | 'to') {
    const nested = side === 'from' ? rate.from_currency?.id : rate.to_currency?.id;
    const raw = nested ?? (side === 'from' ? rate.from_currency_id : rate.to_currency_id);
    const id = Number(raw);
    return Number.isFinite(id) ? id : 0;
}

function latest(rows: HawalaBoardRate[]) {
    return [...rows].sort((a, b) => {
        const ta = Date.parse(a.updated_at || '') || 0;
        const tb = Date.parse(b.updated_at || '') || 0;
        if (tb !== ta) return tb - ta;
        return num(b.id) - num(a.id);
    })[0];
}

function money(value: number) {
    return Math.round(value * 10000) / 10000;
}

/**
 * Debit in the wallet currency using the saraf board.
 * typedAmount = hawala principal.
 * Sender pays: debit convert(typed+fee), payout = typed.
 * Receiver pays: debit convert(typed), payout = typed-fee.
 */
export function quoteHawalaDebit(
    walletCurrencyId: number,
    amountCurrencyId: number,
    typedAmount: number,
    rates: HawalaBoardRate[],
    walletCode?: string | null,
    commission: number = 0,
    amountCurrencyCode?: string | null,
    paidBy: HawalaCommissionPaidBy = 'sender'
): HawalaQuote {
    const empty: HawalaQuote = {
        debit: null,
        payout: null,
        amountConverted: null,
        payoutCurrencyCode: null,
        sameCurrency: false,
        missingRate: false,
        invalidCommission: false,
        rate: null,
        unit: null,
        rateSide: null
    };

    if (!walletCurrencyId || !amountCurrencyId || !(typedAmount > 0)) return empty;

    const commissionSafe = Math.max(0, num(commission));
    const receiverPays = paidBy === 'receiver';

    if (receiverPays && commissionSafe > 0 && commissionSafe >= typedAmount) {
        return {
            ...empty,
            payoutCurrencyCode: (amountCurrencyCode || '').trim() || null,
            invalidCommission: true
        };
    }

    const amountConverted = receiverPays ? typedAmount : typedAmount + commissionSafe;
    const payout = receiverPays ? typedAmount - commissionSafe : typedAmount;
    const payoutCode = (amountCurrencyCode || '').trim() || null;

    const sameCurrency = walletCurrencyId === amountCurrencyId;
    if (sameCurrency) {
        return {
            debit: money(amountConverted),
            payout: money(payout),
            amountConverted: money(amountConverted),
            payoutCurrencyCode: payoutCode || (walletCode || '').trim() || null,
            sameCurrency: true,
            missingRate: false,
            invalidCommission: false,
            rate: 1,
            unit: 1,
            rateSide: 'same'
        };
    }

    const forward = latest((rates || []).filter((rate) => sideId(rate, 'from') === walletCurrencyId && sideId(rate, 'to') === amountCurrencyId));
    const reverse = latest((rates || []).filter((rate) => sideId(rate, 'from') === amountCurrencyId && sideId(rate, 'to') === walletCurrencyId));
    const toAfn = (rate?: HawalaBoardRate) => (rate?.to_currency?.code || '').toUpperCase() === 'AFN';
    const pair = forward && reverse && toAfn(reverse) && !toAfn(forward) ? reverse : forward || reverse;

    const unit = num(pair?.amount);
    if (!pair || unit <= 0) {
        return {
            ...empty,
            payout: money(payout),
            amountConverted: money(amountConverted),
            payoutCurrencyCode: payoutCode,
            missingRate: true
        };
    }

    if (sideId(pair, 'from') === walletCurrencyId) {
        const buy = num(pair.buy_rate);
        if (buy <= 0) {
            return {
                ...empty,
                payout: money(payout),
                amountConverted: money(amountConverted),
                payoutCurrencyCode: payoutCode || pair.to_currency?.code || null,
                missingRate: true
            };
        }
        return {
            debit: money((amountConverted / buy) * unit),
            payout: money(payout),
            amountConverted: money(amountConverted),
            payoutCurrencyCode: payoutCode || pair.to_currency?.code || null,
            sameCurrency: false,
            missingRate: false,
            invalidCommission: false,
            rate: buy,
            unit,
            rateSide: 'buy'
        };
    }

    const sell = num(pair.sell_rate);
    if (sell <= 0) {
        return {
            ...empty,
            payout: money(payout),
            amountConverted: money(amountConverted),
            payoutCurrencyCode: payoutCode || pair.from_currency?.code || null,
            missingRate: true
        };
    }

    return {
        debit: money((amountConverted / unit) * sell),
        payout: money(payout),
        amountConverted: money(amountConverted),
        payoutCurrencyCode: payoutCode || pair.from_currency?.code || null,
        sameCurrency: false,
        missingRate: false,
        invalidCommission: false,
        rate: sell,
        unit,
        rateSide: 'sell'
    };
}
