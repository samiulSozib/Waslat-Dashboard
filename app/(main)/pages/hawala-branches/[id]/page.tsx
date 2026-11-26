'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Database,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Wallet,
    XCircle
} from 'lucide-react';
import { AppDispatch } from '@/app/redux/store';
import { _fetchHawalaBranchById, type HawalaBranchStats } from '@/app/redux/actions/hawalaBranchActions';
import { _fetchHawalaList } from '@/app/redux/actions/hawalaActions';
import { PageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Hawala, HawalaBranch } from '@/types/interface';
import withAuth from '../../../authGuard';

function formatAmount(value: unknown) {
    const n = Number(value ?? 0);
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

function formatDate(value?: string | null) {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function statusVariant(status?: string): 'warning' | 'success' | 'danger' | 'muted' | 'secondary' {
    if (status === 'pending' || status === 'under_process') return 'warning';
    if (status === 'confirmed') return 'success';
    if (status === 'rejected') return 'danger';
    if (status === 'cancelled') return 'muted';
    return 'secondary';
}

function statusLabel(t: (key: string, options?: object) => string, status?: string) {
    if (status === 'pending') return t('ORDER.STATUS.PENDING');
    if (status === 'confirmed') return t('ORDER.STATUS.CONFIRMED');
    if (status === 'rejected') return t('ORDER.STATUS.REJECTED');
    if (status === 'under_process') return t('ORDER.STATUS.UNDER_PROCESS');
    if (status === 'cancelled') return t('ORDER.STATUS.CANCELLED');
    return status || t('ORDER.STATUS.UNKNOWN', { defaultValue: 'نامشخص' });
}

const HawalaBranchDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const branchId = Number(params?.id);

    const { hawalas, pagination, loading: ordersLoading } = useSelector((state: any) => state.hawalaReducer);

    const [branch, setBranch] = useState<(HawalaBranch & { number_series?: any[] }) | null>(null);
    const [stats, setStats] = useState<HawalaBranchStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [refreshing, setRefreshing] = useState(false);

    const loadBranch = async () => {
        if (!branchId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await dispatch(_fetchHawalaBranchById(branchId) as any);
            setBranch(result?.branch ?? null);
            setStats(result?.stats ?? null);
            if (!result?.branch) setError(t('HAWALA.BRANCH_NOT_FOUND', { defaultValue: 'شعبه یافت نشد' }));
        } catch {
            setError(t('HAWALA.BRANCH_LOAD_FAILED', { defaultValue: 'بارگذاری شعبه ناموفق بود' }));
            setBranch(null);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBranch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branchId]);

    useEffect(() => {
        if (!branchId) return;
        dispatch(_fetchHawalaList(page, '', statusFilter, branchId));
    }, [dispatch, branchId, page, statusFilter]);

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 10)));

    const sentLines = stats?.sent_by_currency || [];
    const debitLines = stats?.debited_by_wallet_currency || [];
    const counts = stats?.orders_count;

    const sentSummary = useMemo(() => {
        if (!sentLines.length) return t('HAWALA.BRANCH_NO_SENT', { defaultValue: 'هنوز حواله تأیید‌شده‌ای نیست' });
        return sentLines.map((row) => `${formatAmount(row.total_amount)} ${row.currency}`).join(' · ');
    }, [sentLines, t]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadBranch();
        await dispatch(_fetchHawalaList(page, '', statusFilter, branchId) as any);
        setRefreshing(false);
    };

    return (
        <div className="space-y-4">
            <PageHeader
                title={branch?.name || t('MENU.HAWALA_BRANCHES', { defaultValue: 'شعب حواله' })}
                description={t('HAWALA.BRANCH_DETAIL_DESC', {
                    defaultValue: 'مجموع حواله‌های ارسال‌شده از این شعبه و جزئیات سفارش‌ها'
                })}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => router.push('/pages/hawala-branches')}>
                            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                            {t('BACK', { defaultValue: 'بازگشت' })}
                        </Button>
                        <Button type="button" variant="outline" size="sm" disabled={refreshing || loading} onClick={handleRefresh}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'تازه‌سازی' })}
                        </Button>
                    </div>
                }
            />

            {loading && !branch ? (
                <div className="waslat-panel p-6 text-sm text-muted-foreground">{t('LOADING', { defaultValue: 'در حال بارگذاری…' })}</div>
            ) : error ? (
                <div className="waslat-panel p-6 text-sm text-destructive">{error}</div>
            ) : branch ? (
                <>
                    <div className="waslat-panel space-y-3 p-4 md:p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-semibold">{branch.name}</h2>
                                    <Badge variant={branch.status === 'active' ? 'success' : 'danger'}>
                                        {branch.status === 'active' ? t('APP.GENERAL.ACTIVE') : t('APP.GENERAL.INACTIVE')}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    {branch.phone_number ? (
                                        <span className="inline-flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5" />
                                            {branch.phone_number}
                                        </span>
                                    ) : null}
                                    {branch.email ? (
                                        <span className="inline-flex items-center gap-1">
                                            <Mail className="h-3.5 w-3.5" />
                                            {branch.email}
                                        </span>
                                    ) : null}
                                    {branch.address ? (
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {branch.address}
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                                <div className="text-[11px] text-muted-foreground">{t('HAWALA.TABLE.COMMISSION_TYPE')}</div>
                                <div className="font-medium">
                                    {branch.commission_type === 'percentage' ? t('HAWALA.FORM.PERCENTAGE') : t('HAWALA.FORM.FIXED')}
                                    {' · '}
                                    <span className="tabular-nums">{branch.amount}</span>
                                    {branch.commission_type === 'percentage' ? '%' : ''}
                                </div>
                            </div>
                        </div>

                        {(branch as any).number_series?.length ? (
                            <div className="border-t border-border pt-3">
                                <div className="mb-1 text-xs font-medium text-muted-foreground">
                                    {t('MENU.HAWALA_NUMBER_SERIES', { defaultValue: 'سری شماره حواله' })}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {((branch as any).number_series || []).map((series: any) => (
                                        <Badge key={series.id} variant={series.is_active ? 'success' : 'muted'}>
                                            {series.prefix || '—'} · #{series.current_number ?? 0}
                                            {series.reset_daily ? ` · ${t('HAWALA.SERIES_RESET_DAILY', { defaultValue: 'ریست روزانه' })}` : ''}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            label={t('HAWALA.BRANCH_TOTAL_ORDERS', { defaultValue: 'کل حواله‌ها' })}
                            value={counts?.all ?? 0}
                            icon={Database}
                            tone="slate"
                            className={statusFilter === '' ? 'ring-2 ring-slate-400' : undefined}
                            onClick={() => {
                                setStatusFilter('');
                                setPage(1);
                            }}
                        />
                        <StatCard
                            label={t('HAWALA.BRANCH_CONFIRMED', { defaultValue: 'تأیید‌شده' })}
                            value={counts?.confirmed ?? 0}
                            icon={CheckCircle2}
                            tone="primary"
                            className={statusFilter === 'confirmed' ? 'ring-2 ring-emerald-500' : undefined}
                            onClick={() => {
                                setStatusFilter('confirmed');
                                setPage(1);
                            }}
                        />
                        <StatCard
                            label={t('HAWALA.BRANCH_PENDING', { defaultValue: 'در انتظار' })}
                            value={counts?.pending ?? 0}
                            icon={Clock3}
                            tone="amber"
                            className={statusFilter === 'pending' ? 'ring-2 ring-amber-400' : undefined}
                            onClick={() => {
                                setStatusFilter('pending');
                                setPage(1);
                            }}
                        />
                        <StatCard
                            label={t('HAWALA.BRANCH_REJECTED', { defaultValue: 'رد‌شده' })}
                            value={(counts?.rejected ?? 0) + (counts?.cancelled ?? 0)}
                            icon={XCircle}
                            tone="rose"
                        />
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                        <div className="waslat-panel p-4">
                            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                                <Wallet className="h-4 w-4 text-emerald-700" />
                                {t('HAWALA.BRANCH_TOTAL_SENT', { defaultValue: 'مجموع ارسال‌شده (تأیید‌شده)' })}
                            </div>
                            <p className="mb-3 text-sm text-muted-foreground">{sentSummary}</p>
                            {sentLines.length ? (
                                <ul className="divide-y divide-border text-sm">
                                    {sentLines.map((row) => (
                                        <li key={row.currency} className="flex flex-wrap items-center justify-between gap-2 py-2">
                                            <span className="font-medium">{row.currency}</span>
                                            <span className="tabular-nums">
                                                {formatAmount(row.total_amount)} · {row.orders_count}{' '}
                                                {t('HAWALA.BRANCH_ORDERS_SHORT', { defaultValue: 'حواله' })}
                                            </span>
                                            {row.total_commission > 0 ? (
                                                <span className="w-full text-[11px] text-muted-foreground">
                                                    {t('COMMISSION', { defaultValue: 'کارمزد' })}: {formatAmount(row.total_commission)} {row.currency}
                                                </span>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                        <div className="waslat-panel p-4">
                            <div className="mb-2 text-sm font-semibold">
                                {t('HAWALA.BRANCH_TOTAL_DEBITED', { defaultValue: 'مجموع کسر از کیف فروشندگان' })}
                            </div>
                            {debitLines.length ? (
                                <ul className="divide-y divide-border text-sm">
                                    {debitLines.map((row) => (
                                        <li key={row.currency} className="flex items-center justify-between gap-2 py-2">
                                            <span className="font-medium">{row.currency}</span>
                                            <span className="tabular-nums">{formatAmount(row.total_debited)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground">—</p>
                            )}
                            {Number(stats?.total_branch_commission_share || 0) > 0 ? (
                                <p className="mt-3 text-xs text-muted-foreground">
                                    {t('HAWALA.BRANCH_COMMISSION_SHARE', { defaultValue: 'سهم کارمزد شعبه' })}:{' '}
                                    <span className="tabular-nums font-medium text-foreground">
                                        {formatAmount(stats?.total_branch_commission_share)}
                                    </span>
                                </p>
                            ) : null}
                        </div>
                    </div>

                    <div className="waslat-panel relative overflow-hidden">
                        {ordersLoading ? <div className="absolute inset-x-0 top-0 z-20 h-0.5 animate-pulse bg-emerald-600" /> : null}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
                            <h3 className="text-sm font-semibold">
                                {t('HAWALA.BRANCH_ORDERS', { defaultValue: 'حواله‌های این شعبه' })}
                                {statusFilter ? (
                                    <span className="ms-2 text-xs font-normal text-muted-foreground">({statusLabel(t, statusFilter)})</span>
                                ) : null}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                {pagination?.total ?? 0} {t('HAWALA.BRANCH_ORDERS_SHORT', { defaultValue: 'حواله' })}
                            </span>
                        </div>
                        <div className="waslat-table-scroll overflow-x-auto">
                            {(hawalas || []).length === 0 ? (
                                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </div>
                            ) : (
                                <table className="w-full min-w-[48rem] border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40 text-start text-xs text-muted-foreground">
                                            <th className="px-3 py-2 font-medium">{t('HAWALA.TABLE.COLUMN.NUMBER', { defaultValue: 'شماره' })}</th>
                                            <th className="px-3 py-2 font-medium">{t('SENDER_NAME', { defaultValue: 'فرستنده' })}</th>
                                            <th className="px-3 py-2 font-medium">{t('RECEIVER_NAME', { defaultValue: 'گیرنده' })}</th>
                                            <th className="px-3 py-2 font-medium">{t('HAWALA_AMOUNT', { defaultValue: 'مبلغ' })}</th>
                                            <th className="px-3 py-2 font-medium">{t('HAWALA.TABLE.COLUMN.COMMISSION', { defaultValue: 'کارمزد' })}</th>
                                            <th className="px-3 py-2 font-medium">{t('STATUS', { defaultValue: 'وضعیت' })}</th>
                                            <th className="px-3 py-2 font-medium">{t('TABLE.GENERAL.CREATEDAT', { defaultValue: 'تاریخ' })}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(hawalas || []).map((row: Hawala) => (
                                            <tr key={row.id} className="border-b border-border/70 hover:bg-muted/30">
                                                <td className="px-3 py-2">
                                                    <div className="font-medium tabular-nums">{row.hawala_custom_number || row.hawala_number || row.id}</div>
                                                    {row.hawala_custom_number && row.hawala_number ? (
                                                        <div className="text-[11px] text-muted-foreground">{row.hawala_number}</div>
                                                    ) : null}
                                                </td>
                                                <td className="px-3 py-2">{row.sender_name || '—'}</td>
                                                <td className="px-3 py-2">{row.receiver_name || '—'}</td>
                                                <td className="px-3 py-2 tabular-nums whitespace-nowrap">
                                                    {formatAmount(row.hawala_amount)} {row.hawala_amount_currency_code}
                                                </td>
                                                <td className="px-3 py-2 tabular-nums">{formatAmount(row.commission_amount)}</td>
                                                <td className="px-3 py-2">
                                                    <Badge variant={statusVariant(row.status)}>{statusLabel(t, row.status)}</Badge>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{formatDate(row.created_at)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
                            <span>
                                {page} / {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                    {t('PREV', { defaultValue: 'قبلی' })}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    {t('NEXT', { defaultValue: 'بعدی' })}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default withAuth(HawalaBranchDetailPage);
