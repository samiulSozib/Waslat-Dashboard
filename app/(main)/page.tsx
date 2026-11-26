'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
    Building2,
    CheckCircle2,
    Clock3,
    Filter,
    HandCoins,
    Package,
    Plus,
    RefreshCw,
    Smartphone,
    ShoppingBag,
    Users,
    Wallet,
    XCircle
} from 'lucide-react';
import { AppDispatch } from '../redux/store';
import { fetchDashboardData } from '../redux/actions/dashboardActions';
import { _fetchServiceList } from '../redux/actions/serviceActions';
import withAuth from './authGuard';
import { PageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { getUserInfo } from '@/lib/utils';

interface CurrencyBreakdown {
    [currency: string]: {
        total_sale: number;
        total_profit: number;
        today_sale: number;
        today_profit: number;
    };
}

interface FilterParams {
    filter_service_id?: string | null;
    from_date?: string | null;
    to_date?: string | null;
}

const Dashboard = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading } = useSelector((state: any) => state.dashboardDataReducer);
    const { services } = useSelector((state: any) => state.serviceReducer);
    const [userInfo, setUserInfo] = useState<{ currency?: { symbol?: string } }>({});
    const [filterOpen, setFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        filter_service_id: null as string | null,
        from_date: null as string | null,
        to_date: null as string | null
    });

    useEffect(() => {
        setUserInfo(getUserInfo());
    }, []);

    const activeFilters: FilterParams = useMemo(() => {
        const next: FilterParams = {};
        const serviceId = searchParams.get('filter_service_id');
        const fromDate = searchParams.get('from_date');
        const toDate = searchParams.get('to_date');
        if (serviceId) next.filter_service_id = serviceId;
        if (fromDate) next.from_date = fromDate;
        if (toDate) next.to_date = toDate;
        return next;
    }, [searchParams]);

    useEffect(() => {
        setFilters({
            filter_service_id: activeFilters.filter_service_id || null,
            from_date: activeFilters.from_date || null,
            to_date: activeFilters.to_date || null
        });
    }, [activeFilters]);

    useEffect(() => {
        dispatch(_fetchServiceList());
    }, [dispatch]);

    useEffect(() => {
        dispatch(fetchDashboardData(activeFilters));
    }, [activeFilters, dispatch]);

    const hasActiveFilters = Object.keys(activeFilters).length > 0;
    const currencySymbol = userInfo?.currency?.symbol || '';

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filters.filter_service_id) params.set('filter_service_id', filters.filter_service_id);
        if (filters.from_date) params.set('from_date', filters.from_date);
        if (filters.to_date) params.set('to_date', filters.to_date);
        router.push(params.toString() ? `/?${params.toString()}` : '/');
        setFilterOpen(false);
    };

    const resetFilters = () => {
        router.push('/');
        setFilterOpen(false);
    };

    const refresh = () => dispatch(fetchDashboardData(activeFilters));

    const money = (n?: number) => {
        if (n === undefined || n === null || Number.isNaN(n)) return '—';
        return `${currencySymbol} ${Number(n).toFixed(2)}`;
    };

    const CurrencyRows = ({
        breakdown,
        field
    }: {
        breakdown?: CurrencyBreakdown;
        field: 'today_sale' | 'today_profit' | 'total_sale' | 'total_profit';
    }) => {
        if (!breakdown) return null;
        const entries = Object.entries(breakdown).slice(0, 6);
        if (!entries.length) return null;
        return (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/70 pt-3 sm:grid-cols-3">
                {entries.map(([currency, values]) => (
                    <div key={currency} className="rounded-lg bg-muted/60 px-2 py-1.5 text-start">
                        <div className="text-[10px] font-semibold uppercase text-primary">{currency}</div>
                        <div className="text-xs tabular-nums text-foreground">{Number(values[field] || 0).toFixed(2)}</div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-5">
            <PageHeader
                title={t('MENU.DASHBOARD', { defaultValue: 'داشبورد' })}
                description="نمای کلی سفارش‌ها، فروش و موجودی‌ها"
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            بروزرسانی
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setFilterOpen(true)}>
                            <Filter className="h-4 w-4" />
                            فیلترها
                            {hasActiveFilters ? <Badge className="ms-1">{Object.keys(activeFilters).length}</Badge> : null}
                        </Button>
                    </>
                }
            />

            {hasActiveFilters ? (
                <div className="flex flex-wrap items-center gap-2">
                    {activeFilters.filter_service_id ? <Badge variant="secondary">سرویس: {activeFilters.filter_service_id}</Badge> : null}
                    {activeFilters.from_date ? <Badge variant="secondary">از: {activeFilters.from_date}</Badge> : null}
                    {activeFilters.to_date ? <Badge variant="secondary">تا: {activeFilters.to_date}</Badge> : null}
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                        پاک کردن فیلترها
                    </Button>
                </div>
            ) : null}

            <Card className="overflow-hidden">
                <CardHeader className="flex flex-col gap-3 border-b border-border/70 bg-gradient-to-l from-emerald-50 to-transparent sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-start">
                        <CardTitle className="text-base">اقدامات سریع</CardTitle>
                        <p className="text-sm text-muted-foreground">ثبت سریع عملیات پرتکرار</p>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => router.push('/pages/hawala?action=add')}>
                            <Plus className="h-4 w-4" />
                            {t('ADD_HAWALA', { defaultValue: 'حواله' })}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => router.push('/pages/payment?action=add')}>
                            <Plus className="h-4 w-4" />
                            {t('ADD_PAYMENT', { defaultValue: 'پرداخت' })}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => router.push('/pages/balance?action=add')}>
                            <Plus className="h-4 w-4" />
                            {t('ADD_BALANCE', { defaultValue: 'موجودی' })}
                        </Button>
                        <Button size="sm" onClick={() => router.push('/pages/reseller?action=add')}>
                            <Plus className="h-4 w-4" />
                            {t('ADD_RESELLER', { defaultValue: 'نماینده' })}
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard
                    label={t('DASHBOARD.TODAYORDER')}
                    value={data?.today_orders ?? '—'}
                    icon={ShoppingBag}
                    onClick={() => router.push('/pages/order')}
                />
                <StatCard
                    label={t('DASHBOARD.TOTALORDER')}
                    value={data?.total_orders ?? '—'}
                    icon={Package}
                    tone="sky"
                    onClick={() => router.push('/pages/order')}
                />
                <StatCard
                    label={t('DASHBOARD.PENDINGORDERS')}
                    value={data?.pending_orders ?? 0}
                    hint={`${t('DASHBOARD.TODAY')}: ${data?.today_pending_orders ?? 0}`}
                    icon={Clock3}
                    tone="amber"
                    onClick={() => router.push('/pages/order?status=pending')}
                />
                <StatCard
                    label={t('DASHBOARD.SUCCESSORDERS')}
                    value={data?.successful_orders ?? 0}
                    hint={`${t('DASHBOARD.TODAY')}: ${data?.today_successful_orders ?? 0}`}
                    icon={CheckCircle2}
                    onClick={() => router.push('/pages/order?status=confirmed')}
                />
                <StatCard
                    label={t('DASHBOARD.REJECTEDORDERS')}
                    value={data?.rejected_orders ?? 0}
                    hint={`${t('DASHBOARD.TODAY')}: ${data?.today_rejected_orders ?? 0}`}
                    icon={XCircle}
                    tone="rose"
                    onClick={() => router.push('/pages/order?status=rejected')}
                />
                <StatCard
                    label={t('DASHBOARD.UNDER_PROCESS_ORDERS', { defaultValue: 'در حال پردازش' })}
                    value={data?.under_process_orders ?? 0}
                    hint={`${t('DASHBOARD.TODAY')}: ${data?.today_under_process_orders ?? 0}`}
                    icon={Clock3}
                    tone="sky"
                    onClick={() => router.push('/pages/order?status=under_process')}
                />
                <StatCard
                    label={t('DASHBOARD.CUSTOM_TOPUP_ORDERS', { defaultValue: 'شارژ سفارشی / موبایل' })}
                    value={data?.custom_topup_orders ?? 0}
                    hint={`${t('DASHBOARD.TODAY')}: ${data?.today_custom_topup_orders ?? 0}`}
                    icon={Smartphone}
                    tone="amber"
                    onClick={() => router.push('/pages/order?order_type=custom_topup')}
                />
                <StatCard label={t('DASHBOARD.TOTALRESELLER')} value={data?.total_resellers ?? '—'} icon={Users} tone="slate" onClick={() => router.push('/pages/reseller')} />
                <StatCard label={t('DASHBOARD.TOTALCOMPANY')} value={data?.total_companies ?? '—'} icon={Building2} tone="sky" onClick={() => router.push('/pages/companies')} />
                <StatCard label={t('DASHBOARD.TOTALSERVICE')} value={data?.total_services ?? '—'} icon={Package} onClick={() => router.push('/pages/services')} />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('DASHBOARD.TODAYSALE')}</CardTitle>
                        <div className="text-xl font-semibold tabular-nums">{money(data?.today_sale)}</div>
                    </CardHeader>
                    <CardContent>
                        <CurrencyRows breakdown={data?.currency_breakdown} field="today_sale" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('DASHBOARD.TODAYPROFIT')}</CardTitle>
                        <div className="text-xl font-semibold tabular-nums text-primary">{money(data?.today_profit)}</div>
                    </CardHeader>
                    <CardContent>
                        <CurrencyRows breakdown={data?.currency_breakdown} field="today_profit" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('DASHBOARD.TOTALSALE')}</CardTitle>
                        <div className="text-xl font-semibold tabular-nums">{money(data?.total_sale)}</div>
                    </CardHeader>
                    <CardContent>
                        <CurrencyRows breakdown={data?.currency_breakdown} field="total_sale" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{t('DASHBOARD.TOTALPROFIT')}</CardTitle>
                        <div className="text-xl font-semibold tabular-nums text-primary">{money(data?.total_profit)}</div>
                    </CardHeader>
                    <CardContent>
                        <CurrencyRows breakdown={data?.currency_breakdown} field="total_profit" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Card className="border-rose-200/80 bg-rose-50/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm text-rose-800">
                            <HandCoins className="h-4 w-4" />
                            {t('DASHBOARD.UNPAID')}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">{t('DASHBOARD.UNPAID.HINT')}</p>
                        <div className="pt-1 text-xl font-semibold tabular-nums text-rose-800">{money(data?.total_unpaid_amount)}</div>
                    </CardHeader>
                </Card>
                <Card className="border-amber-200/80 bg-amber-50/40">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm text-amber-900">
                            <HandCoins className="h-4 w-4" />
                            {t('DASHBOARD.OVERPAID', { defaultValue: 'بدهی شما به نمایندگان' })}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {t('DASHBOARD.OVERPAID.HINT', {
                                defaultValue: 'پرداخت ثبت‌شده بیشتر از موجودی ارسال‌شده — مبلغی که به نمایندگان بدهکارید'
                            })}
                        </p>
                        <div className="pt-1 text-xl font-semibold tabular-nums text-amber-900">{money(data?.total_overpaid_amount)}</div>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                <CurrencyList title={t('DASHBOARD.BALANCES')} hint={t('DASHBOARD.BALANCES.HINT')} items={data?.balances_by_currency} valueKey="total_balance" />
                <CurrencyList title={t('DASHBOARD.PAYMENT')} hint={t('DASHBOARD.PAYMENT.HINT')} items={data?.payments_by_currency} valueKey="total_payment" tone="sky" />
                <CurrencyList title={t('DASHBOARD.UNPAID')} hint={t('DASHBOARD.UNPAID.HINT')} items={data?.unpaid_amounts_by_currency} valueKey="total_unpaid" tone="rose" />
                <CurrencyList
                    title={t('DASHBOARD.OVERPAID', { defaultValue: 'بدهی شما به نمایندگان' })}
                    hint={t('DASHBOARD.OVERPAID.HINT', {
                        defaultValue: 'پرداخت ثبت‌شده بیشتر از موجودی ارسال‌شده — مبلغی که به نمایندگان بدهکارید'
                    })}
                    items={data?.overpaid_amounts_by_currency}
                    valueKey="total_overpaid"
                    tone="amber"
                />
            </div>

            {(data?.top_creditor_resellers || []).length > 0 || (data?.top_debt_resellers || []).length > 0 ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    <PeopleDebtList
                        title={t('DASHBOARD.TOP_CREDITORS', { defaultValue: 'نمایندگانی که به آن‌ها بدهکارید' })}
                        items={data?.top_creditor_resellers}
                        amountKey="overpaid_amount"
                        tone="amber"
                        onOpen={(id) => router.push(`/pages/reseller/${id}`)}
                    />
                    <PeopleDebtList
                        title={t('DASHBOARD.TOP_DEBTORS', { defaultValue: 'نمایندگان بدهکار به شما' })}
                        items={data?.top_debt_resellers}
                        amountKey="unpaid_amount"
                        tone="rose"
                        onOpen={(id) => router.push(`/pages/reseller/${id}`)}
                    />
                </div>
            ) : null}

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side="left" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>فیلتر داشبورد</SheetTitle>
                        <SheetDescription>نتایج بر اساس سرویس و بازه زمانی به‌روز می‌شوند.</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                        <div className="space-y-2 text-start">
                            <label className="text-sm font-medium">{t('SERVICE', { defaultValue: 'سرویس' })}</label>
                            <Select
                                value={filters.filter_service_id || undefined}
                                onValueChange={(v) => setFilters((prev) => ({ ...prev, filter_service_id: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_SERVICE', { defaultValue: 'انتخاب سرویس' })} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(services || []).map((service: any) => (
                                        <SelectItem key={service.id} value={String(service.id)}>
                                            {service.service_name || `${service.service_category?.category_name || ''} - ${service.company?.company_name || ''}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 text-start">
                            <label className="text-sm font-medium">{t('FROM_DATE', { defaultValue: 'از تاریخ' })}</label>
                            <Input type="date" value={filters.from_date || ''} onChange={(e) => setFilters((p) => ({ ...p, from_date: e.target.value || null }))} />
                        </div>
                        <div className="space-y-2 text-start">
                            <label className="text-sm font-medium">{t('TO_DATE', { defaultValue: 'تا تاریخ' })}</label>
                            <Input type="date" value={filters.to_date || ''} onChange={(e) => setFilters((p) => ({ ...p, to_date: e.target.value || null }))} />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1" onClick={applyFilters}>
                                اعمال فیلتر
                            </Button>
                            <Button className="flex-1" variant="secondary" onClick={resetFilters}>
                                بازنشانی
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
};

function PeopleDebtList({
    title,
    items,
    amountKey,
    tone = 'rose',
    onOpen
}: {
    title: string;
    items?: any[];
    amountKey: string;
    tone?: 'rose' | 'amber';
    onOpen: (id: number | string) => void;
}) {
    const toneClass = tone === 'amber' ? 'from-amber-50' : 'from-rose-50';
    return (
        <Card>
            <CardHeader className={`border-b border-border/60 bg-gradient-to-l ${toneClass} to-transparent`}>
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
                {(items || []).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">داده‌ای نیست</div>
                ) : (
                    (items || []).slice(0, 8).map((row: any) => (
                        <button
                            key={`${row.id || row.reseller_name}-${row.currency_code}`}
                            type="button"
                            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-start transition hover:bg-muted/40"
                            onClick={() => row.id && onOpen(row.id)}
                        >
                            <div className="min-w-0">
                                <div className="truncate text-sm font-medium">{row.reseller_name || '—'}</div>
                                <div className="text-[11px] text-muted-foreground">{row.phone || row.currency_code}</div>
                            </div>
                            <div className="shrink-0 text-sm font-semibold tabular-nums">
                                {Number(row[amountKey] || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                                <span className="text-xs font-normal text-muted-foreground">{row.currency_code}</span>
                            </div>
                        </button>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

function CurrencyList({
    title,
    hint,
    items,
    valueKey,
    tone = 'primary'
}: {
    title: string;
    hint: string;
    items?: any[];
    valueKey: string;
    tone?: 'primary' | 'sky' | 'rose' | 'amber';
}) {
    const toneClass =
        tone === 'sky' ? 'from-sky-50' : tone === 'rose' ? 'from-rose-50' : tone === 'amber' ? 'from-amber-50' : 'from-emerald-50';

    return (
        <Card>
            <CardHeader className={`border-b border-border/60 bg-gradient-to-l ${toneClass} to-transparent`}>
                <CardTitle className="text-base">{title}</CardTitle>
                <p className="text-xs text-muted-foreground">{hint}</p>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
                {(items || []).length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">داده‌ای نیست</div>
                ) : (
                    (items || []).map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-3 py-2.5">
                            <div className="flex items-center gap-2 text-start">
                                <Wallet className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">{item.currency_code}</span>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">{item[valueKey]}</span>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

export default withAuth(Dashboard);
