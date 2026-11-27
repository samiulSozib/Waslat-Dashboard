'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Database,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Wallet,
  XCircle,
} from 'lucide-react';
import { AppDispatch } from '@/app/redux/store';
import { fetchProviderInfo } from '@/app/redux/actions/providerInfoActions';
import { PageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isRTL } from '../../utilities/rtlUtil';

interface ProviderViewPageProps {
  providerId: number;
}
type AnyRow = Record<string, any>;

const parseDate = (value: any) => {
  if (!value) return null;
  const d = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (value: any) => {
  const d = parseDate(value);
  if (!d) return '—';
  return d.toLocaleString(isRTL() ? 'fa-IR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** PayStore may return TR/EU money strings like "1.234,56". */
const parseAmount = (amount: any): number | null => {
  if (amount === null || amount === undefined || amount === '') return null;
  if (typeof amount === 'number') return Number.isFinite(amount) ? amount : null;
  let raw = String(amount).trim();
  if (!raw) return null;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(raw) || (raw.includes(',') && raw.includes('.') && raw.lastIndexOf(',') > raw.lastIndexOf('.'))) {
    raw = raw.replace(/\./g, '').replace(',', '.');
  } else if (raw.includes(',') && !raw.includes('.')) {
    raw = raw.replace(',', '.');
  }
  raw = raw.replace(/[^\d.-]/g, '');
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const formatCurrency = (amount: any, currency = 'AFN') => {
  const n = parseAmount(amount);
  if (n === null) return '—';
  return `${new Intl.NumberFormat(isRTL() ? 'fa-IR' : 'en-US', { maximumFractionDigits: 5 }).format(n)} ${currency}`;
};

const orderStatusMeta = (status: any, t: (k: string, o?: object) => string) => {
  switch (Number(status)) {
    case 1:
      return { label: t('ORDER.STATUS.CONFIRMED', { defaultValue: 'تأیید‌شده' }), variant: 'success' as const };
    case 2:
      return { label: t('ORDER.STATUS.REJECTED', { defaultValue: 'رد‌شده' }), variant: 'danger' as const };
    case 3:
      return { label: t('ORDER.STATUS.UNDER_PROCESS', { defaultValue: 'در حال پردازش' }), variant: 'secondary' as const };
    default:
      return { label: t('ORDER.STATUS.PENDING', { defaultValue: 'در انتظار' }), variant: 'warning' as const };
  }
};

const zoodPaySeverity = (row: AnyRow): 'success' | 'danger' | 'warning' | 'secondary' | 'muted' => {
  const state = String(row.zoodpay_status || row.supplier_status || row.supplier_state || '')
    .trim()
    .toLowerCase();
  if (['success', 'successful', 'completed', 'supplier_success'].includes(state)) return 'success';
  if (['rejected', 'failed', 'failure', 'supplier_rejected', 'supplier_failed'].includes(state)) return 'danger';
  if (['processing', 'in progress', 'in_process', 'pending', 'supplier_processing'].includes(state)) return 'secondary';
  return 'warning';
};

const ProviderViewPage: React.FC<ProviderViewPageProps> = ({ providerId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useTranslation();
  const { loading, accountData, error } = useSelector((state: any) => state.providerInfoReducer);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<number | null>(null);
  const [supplierLive, setSupplierLive] = useState(false);

  const providerCode = String(accountData?.provider?.code || '').toLowerCase();
  const isZoodPay = providerCode === 'zoodpay';

  useEffect(() => {
    setPage(1);
    setRows(10);
    setSearch('');
    setStatus(null);
    setSupplierLive(false);
  }, [providerId]);

  useEffect(() => {
    if (providerId) dispatch(fetchProviderInfo(providerId, page, rows, supplierLive));
  }, [dispatch, providerId, page, rows, supplierLive]);

  const refresh = () => dispatch(fetchProviderInfo(providerId, page, rows, supplierLive));

  const checkSupplierStatus = () => {
    if (supplierLive) dispatch(fetchProviderInfo(providerId, page, rows, true));
    else setSupplierLive(true);
  };

  const transactions: AnyRow[] = Array.isArray(accountData?.recent_transactions)
    ? accountData.recent_transactions
    : [];

  const visible = useMemo(
    () =>
      transactions.filter((row) => {
        if (!isZoodPay) return true;
        const s = search.trim().toLowerCase();
        const matchesSearch =
          !s ||
          [row.order_id, row.reference, row.phone_number, row.provider_transaction_id, row.description].some((value) =>
            String(value ?? '')
              .toLowerCase()
              .includes(s)
          );
        return matchesSearch && (status === null || Number(row.status) === status);
      }),
    [transactions, isZoodPay, search, status]
  );

  const downloadCsv = () => {
    const columns = [
      'order_id',
      'reference',
      'provider_transaction_id',
      'phone_number',
      'amount',
      'currency',
      'description',
      'status',
      'waslat_status',
      'zoodpay_status',
      'zoodpay_status_source',
      'live_check_result',
      'supplier_state',
      'local_settlement',
      'created_at',
    ];
    const quote = (value: any) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [columns.join(','), ...visible.map((row) => columns.map((key) => quote(row[key])).join(','))].join(
      '\r\n'
    );
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = `zoodpay-orders-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(href);
  };

  const currency = accountData?.account_info?.currency || 'AFN';
  const provider = accountData?.provider || {};
  const balance = accountData?.account_info?.balance;
  const balanceAvailable =
    accountData?.account_info?.balance_available ??
    (balance !== null && balance !== undefined && balance !== '');
  const connectionOk = Boolean(accountData?.supplier_connection?.balance_success ?? balanceAvailable);
  const totalPages = Math.max(
    1,
    Math.ceil((accountData?.pagination?.total_items ?? transactions.length) / rows) || 1
  );

  const statusFilterOptions = [
    { label: t('ALL_STATUSES', { defaultValue: 'همه وضعیت‌ها' }), value: null as number | null },
    { label: t('ORDER.STATUS.PENDING', { defaultValue: 'در انتظار' }), value: 0 },
    { label: t('ORDER.STATUS.CONFIRMED', { defaultValue: 'تأیید‌شده' }), value: 1 },
    { label: t('ORDER.STATUS.REJECTED', { defaultValue: 'رد‌شده' }), value: 2 },
    { label: t('ORDER.STATUS.UNDER_PROCESS', { defaultValue: 'در حال پردازش' }), value: 3 },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={provider.name || t('PROVIDERS.ACCOUNT_INFO', { defaultValue: 'اطلاعات حساب ارائه‌دهنده' })}
        description={t('PROVIDERS.VIEW_DESC', {
          defaultValue: 'موجودی، وضعیت اتصال و جزئیات حساب ارائه‌دهنده',
        })}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => router.push('/pages/app-providers')}>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              {t('GO_BACK', { defaultValue: 'بازگشت' })}
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={loading} onClick={refresh}>
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
              {t('REFRESH', { defaultValue: 'تازه‌سازی' })}
            </Button>
          </div>
        }
      />

      {loading && !accountData ? (
        <div className="waslat-panel p-6 text-sm text-muted-foreground">
          {t('LOADING', { defaultValue: 'در حال بارگذاری…' })}
        </div>
      ) : error && !accountData ? (
        <div className="waslat-panel space-y-3 p-6">
          <p className="text-sm text-destructive">{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => router.push('/pages/app-providers')}>
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            {t('GO_BACK', { defaultValue: 'بازگشت' })}
          </Button>
        </div>
      ) : !accountData ? (
        <div className="waslat-panel p-6 text-sm text-muted-foreground">
          {t('NO_DATA_FOUND', { defaultValue: 'داده‌ای یافت نشد' })}
        </div>
      ) : (
        <>
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          {/* Identity */}
          <div className="waslat-panel space-y-3 p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2 text-start">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">{provider.name}</h2>
                  {provider.is_active != null ? (
                    <Badge variant={provider.is_active ? 'success' : 'danger'}>
                      {provider.is_active
                        ? t('APP.GENERAL.ACTIVE', { defaultValue: 'فعال' })
                        : t('APP.GENERAL.INACTIVE', { defaultValue: 'غیرفعال' })}
                    </Badge>
                  ) : null}
                  <Badge variant="secondary">{provider.code || '—'}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>
                    {t('PROVIDERS.ID', { defaultValue: 'شناسه' })}: <span className="tabular-nums text-foreground">{provider.id}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <KeyRound className="h-3.5 w-3.5" />
                    {t('PROVIDERS.HAS_CREDENTIALS', { defaultValue: 'دارای اعتبارنامه' })}:{' '}
                    <Badge variant={provider.has_credentials ? 'success' : 'danger'} className="ms-1">
                      {provider.has_credentials ? t('YES', { defaultValue: 'بله' }) : t('NO', { defaultValue: 'خیر' })}
                    </Badge>
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-start">
                <div className="text-[11px] text-muted-foreground">
                  {t('LAST_UPDATED', { defaultValue: 'آخرین بروزرسانی' })}
                </div>
                <div className="font-medium tabular-nums">
                  {formatDate(accountData.account_info?.last_updated)}
                </div>
              </div>
            </div>
          </div>

          {/* KPI */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label={t('ACCOUNT_INFO.BALANCE', { defaultValue: 'موجودی حساب' })}
              value={formatCurrency(balance, currency)}
              hint={
                !balanceAvailable
                  ? t('PROVIDERS.BALANCE_UNAVAILABLE', { defaultValue: 'موجودی در دسترس نیست' })
                  : currency
              }
              icon={Wallet}
              tone="primary"
            />
            <StatCard
              label={t('PROVIDERS.CONNECTION', { defaultValue: 'وضعیت اتصال' })}
              value={
                connectionOk
                  ? t('PROVIDERS.CONNECTED', { defaultValue: 'متصل' })
                  : t('PROVIDERS.DISCONNECTED', { defaultValue: 'قطع / نامشخص' })
              }
              hint={t('ACCOUNT_INFO.CURRENCY', { defaultValue: 'واحد پول' }) + `: ${currency}`}
              icon={ShieldCheck}
              tone={connectionOk ? 'sky' : 'amber'}
            />
            <StatCard
              label={t('PROVIDER_INFO', { defaultValue: 'اطلاعات ارائه‌دهنده' })}
              value={provider.code || '—'}
              hint={
                provider.has_credentials
                  ? t('PROVIDERS.CREDENTIALS_OK', { defaultValue: 'اعتبارنامه پیکربندی شده' })
                  : t('PROVIDERS.CREDENTIALS_MISSING', { defaultValue: 'اعتبارنامه ناقص' })
              }
              icon={KeyRound}
              tone={provider.has_credentials ? 'slate' : 'rose'}
            />
          </div>

          {/* Account / user details */}
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="waslat-panel p-4 text-start">
              <div className="mb-3 border-b border-border pb-2 text-sm font-semibold">
                {t('USER_INFO', { defaultValue: 'اطلاعات کاربر' })}
              </div>
              {isZoodPay ? (
                <ul className="divide-y divide-border text-sm">
                  <li className="flex items-center justify-between gap-2 py-2">
                    <span className="text-muted-foreground">{t('PROVIDERS.USER_CODE', { defaultValue: 'کد کاربر' })}</span>
                    <span className="font-medium tabular-nums">{accountData.user?.user_code || '—'}</span>
                  </li>
                  <li className="flex items-center justify-between gap-2 py-2">
                    <span className="text-muted-foreground">{t('ACCOUNT_INFO.CURRENCY', { defaultValue: 'واحد پول' })}</span>
                    <span className="font-medium">{currency}</span>
                  </li>
                  <li className="flex items-center justify-between gap-2 py-2">
                    <span className="text-muted-foreground">{t('PROVIDERS.BALANCE_API', { defaultValue: 'API موجودی' })}</span>
                    <Badge variant={connectionOk ? 'success' : 'warning'}>
                      {connectionOk
                        ? t('PROVIDERS.CONNECTED', { defaultValue: 'متصل' })
                        : t('PROVIDERS.DISCONNECTED', { defaultValue: 'قطع / نامشخص' })}
                    </Badge>
                  </li>
                </ul>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  <li className="flex items-center justify-between gap-2 py-2">
                    <span className="text-muted-foreground">{t('USER.UID', { defaultValue: 'شناسه کاربری' })}</span>
                    <span className="font-medium tabular-nums">{accountData.user?.uid ?? '—'}</span>
                  </li>
                  <li className="flex items-center justify-between gap-2 py-2">
                    <span className="text-muted-foreground">{t('USER.NAME', { defaultValue: 'نام' })}</span>
                    <span className="font-medium">{accountData.user?.name ?? '—'}</span>
                  </li>
                  <li className="flex items-center justify-between gap-2 py-2">
                    <span className="text-muted-foreground">{t('USER.BALANCE', { defaultValue: 'موجودی کاربر' })}</span>
                    <span className="font-medium tabular-nums">
                      {formatCurrency(accountData.user?.balance, currency)}
                    </span>
                  </li>
                  <li className="flex items-center justify-between gap-2 py-2">
                    <span className="text-muted-foreground">{t('USER.LANGUAGE', { defaultValue: 'زبان' })}</span>
                    <span className="font-medium">{accountData.user?.lang ?? '—'}</span>
                  </li>
                </ul>
              )}
            </div>

            <div className="waslat-panel p-4 text-start">
              <div className="mb-3 border-b border-border pb-2 text-sm font-semibold">
                {t('PROVIDER_INFO', { defaultValue: 'اطلاعات ارائه‌دهنده' })}
              </div>
              <ul className="divide-y divide-border text-sm">
                <li className="flex items-center justify-between gap-2 py-2">
                  <span className="text-muted-foreground">{t('PROVIDERS.ID', { defaultValue: 'شناسه' })}</span>
                  <span className="font-medium tabular-nums">{provider.id}</span>
                </li>
                <li className="flex items-center justify-between gap-2 py-2">
                  <span className="text-muted-foreground">{t('PROVIDERS.CODE', { defaultValue: 'کد' })}</span>
                  <Badge variant="secondary">{provider.code}</Badge>
                </li>
                <li className="flex items-center justify-between gap-2 py-2">
                  <span className="text-muted-foreground">
                    {t('PROVIDERS.HAS_CREDENTIALS', { defaultValue: 'دارای اعتبارنامه' })}
                  </span>
                  <Badge variant={provider.has_credentials ? 'success' : 'danger'}>
                    {provider.has_credentials ? t('YES', { defaultValue: 'بله' }) : t('NO', { defaultValue: 'خیر' })}
                  </Badge>
                </li>
              </ul>
            </div>
          </div>

          {isZoodPay ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard
                  label={t('TOTAL_TRANSACTIONS', { defaultValue: 'کل سفارش‌ها' })}
                  value={accountData.statistics?.total ?? 0}
                  icon={Database}
                  tone="slate"
                />
                <StatCard
                  label={t('ORDER.STATUS.CONFIRMED', { defaultValue: 'تأیید‌شده' })}
                  value={accountData.statistics?.confirmed ?? 0}
                  icon={CheckCircle2}
                  tone="primary"
                />
                <StatCard
                  label={t('ORDER.STATUS.PENDING', { defaultValue: 'در انتظار' })}
                  value={accountData.statistics?.pending ?? 0}
                  icon={Clock3}
                  tone="amber"
                />
                <StatCard
                  label={t('ORDER.STATUS.UNDER_PROCESS', { defaultValue: 'در حال پردازش' })}
                  value={accountData.statistics?.processing ?? 0}
                  icon={RefreshCw}
                  tone="sky"
                />
                <StatCard
                  label={t('ORDER.STATUS.REJECTED', { defaultValue: 'رد‌شده' })}
                  value={accountData.statistics?.rejected ?? 0}
                  icon={XCircle}
                  tone="rose"
                />
              </div>

              <div className="waslat-panel overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
                  <div className="text-sm font-semibold text-start">
                    {t('PROVIDERS.ZOODPAY_REPORT', { defaultValue: 'گزارش فروش شارژ' })}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      onClick={checkSupplierStatus}
                      title={t('PROVIDERS.ZOODPAY_CHECK_HINT', {
                        defaultValue: 'فقط وضعیت را از API بررسی می‌کند؛ شارژ مجدد ارسال نمی‌شود.',
                      })}
                    >
                      <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                      {t('PROVIDERS.CHECK_ZOODPAY', { defaultValue: 'بررسی وضعیت ZoodPay' })}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!visible.length}
                      onClick={downloadCsv}
                    >
                      {t('EXPORT_DATA', { defaultValue: 'خروجی داده' })}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 border-b border-border px-4 py-3">
                  <input
                    className="h-9 min-w-[12rem] flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('PROVIDERS.SEARCH_PHONE_REF', {
                      defaultValue: 'جستجوی تلفن یا مرجع…',
                    })}
                  />
                  <select
                    className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
                    value={status === null ? '' : String(status)}
                    onChange={(e) => setStatus(e.target.value === '' ? null : Number(e.target.value))}
                  >
                    {statusFilterOptions.map((opt) => (
                      <option key={String(opt.value)} value={opt.value === null ? '' : opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-start text-xs text-muted-foreground">
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.ID', { defaultValue: 'شناسه' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.PHONE', { defaultValue: 'تلفن' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.AMOUNT', { defaultValue: 'مبلغ' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('PROVIDERS.WASLAT_REF', { defaultValue: 'مرجع وصلات' })}</th>
                        <th className="px-4 py-2.5 font-medium">ZoodPay</th>
                        <th className="px-4 py-2.5 font-medium">{t('PROVIDERS.WASLAT_STATUS', { defaultValue: 'وضعیت وصلات' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.DATE', { defaultValue: 'تاریخ' })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                            {t('NO_TRANSACTIONS_FOUND', { defaultValue: 'تراکنشی یافت نشد' })}
                          </td>
                        </tr>
                      ) : (
                        visible.map((row, idx) => {
                          const waslat = orderStatusMeta(row.status, t);
                          const zpLabel =
                            String(row.zoodpay_status || row.supplier_status || row.supplier_state || '').trim() ||
                            t('PROVIDERS.NOT_VERIFIED', { defaultValue: 'تأیید نشده' });
                          return (
                            <tr key={row.id ?? idx} className="border-b border-border/70 last:border-0">
                              <td className="px-4 py-2.5 tabular-nums">{row.order_id ?? '—'}</td>
                              <td className="px-4 py-2.5 tabular-nums">{row.phone_number ?? '—'}</td>
                              <td className="px-4 py-2.5 tabular-nums font-medium">
                                {formatCurrency(row.amount, row.currency || 'AFN')}
                              </td>
                              <td className="px-4 py-2.5">{row.reference ?? '—'}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex flex-col items-start gap-1">
                                  <Badge variant={zoodPaySeverity(row)}>{zpLabel}</Badge>
                                  <span className="text-[11px] text-muted-foreground">
                                    {row.zoodpay_status_source === 'live_supplier_api'
                                      ? t('PROVIDERS.LIVE_ZOODPAY', { defaultValue: 'زنده از ZoodPay' })
                                      : t('PROVIDERS.SAVED_STATUS', { defaultValue: 'وضعیت ذخیره‌شده' })}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5">
                                <Badge variant={waslat.variant}>{waslat.label}</Badge>
                              </td>
                              <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                                {formatDate(row.created_at)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-sm">
                  <span className="text-muted-foreground">
                    {t('PROVIDERS.PAGE_OF', {
                      defaultValue: 'صفحه {{page}} از {{total}}',
                      page,
                      total: totalPages,
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
                      value={rows}
                      onChange={(e) => {
                        setSupplierLive(false);
                        setRows(Number(e.target.value));
                        setPage(1);
                      }}
                    >
                      {[5, 10, 25, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || loading}
                      onClick={() => {
                        setSupplierLive(false);
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    >
                      {t('PREV', { defaultValue: 'قبلی' })}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages || loading}
                      onClick={() => {
                        setSupplierLive(false);
                        setPage((p) => p + 1);
                      }}
                    >
                      {t('NEXT', { defaultValue: 'بعدی' })}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="waslat-panel overflow-hidden">
                <div className="border-b border-border bg-muted/30 px-4 py-3 text-sm font-semibold text-start">
                  {t('PROVIDERS.SUPPORTED_OPERATORS', { defaultValue: 'اپراتورهای پشتیبانی‌شده' })}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-start text-xs text-muted-foreground">
                        <th className="px-4 py-2.5 font-medium">{t('OPERATOR', { defaultValue: 'اپراتور' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('PROVIDERS.MIN_RECHARGE', { defaultValue: 'حداقل شارژ' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('PROVIDERS.MAX_RECHARGE', { defaultValue: 'حداکثر شارژ' })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(accountData.operators) ? accountData.operators : []).length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                            {t('NO_DATA_FOUND', { defaultValue: 'داده‌ای یافت نشد' })}
                          </td>
                        </tr>
                      ) : (
                        accountData.operators.map((row: AnyRow) => (
                          <tr key={row.id ?? row.name} className="border-b border-border/70 last:border-0">
                            <td className="px-4 py-2.5 font-medium">{row.name}</td>
                            <td className="px-4 py-2.5 tabular-nums">
                              {formatCurrency(row.min_recharge_amount, 'AFN')}
                            </td>
                            <td className="px-4 py-2.5 tabular-nums">
                              {formatCurrency(row.max_recharge_amount, 'AFN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              {accountData.statistics ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <StatCard label={t('TOTAL_TRANSACTIONS', { defaultValue: 'کل سفارش‌ها' })} value={accountData.statistics?.total ?? 0} icon={Database} tone="slate" />
                  <StatCard label={t('ORDER.STATUS.CONFIRMED', { defaultValue: 'تأیید‌شده' })} value={accountData.statistics?.confirmed ?? 0} icon={CheckCircle2} tone="primary" />
                  <StatCard label={t('ORDER.STATUS.PENDING', { defaultValue: 'در انتظار' })} value={accountData.statistics?.pending ?? 0} icon={Clock3} tone="amber" />
                  <StatCard label={t('ORDER.STATUS.UNDER_PROCESS', { defaultValue: 'در حال پردازش' })} value={accountData.statistics?.processing ?? 0} icon={RefreshCw} tone="sky" />
                  <StatCard label={t('ORDER.STATUS.REJECTED', { defaultValue: 'رد‌شده' })} value={accountData.statistics?.rejected ?? 0} icon={XCircle} tone="rose" />
                </div>
              ) : null}

              <div className="waslat-panel overflow-hidden">
                <div className="border-b border-border bg-muted/30 px-4 py-3 text-sm font-semibold text-start">
                  {t('RECENT_TRANSACTIONS', { defaultValue: 'تراکنش‌های اخیر' })}
                  <span className="ms-2 text-xs font-normal text-muted-foreground">
                    {t('PROVIDERS.LOCAL_ORDERS_HINT', {
                      defaultValue: 'سفارش‌های ثبت‌شده در وصلات برای این تأمین‌کننده',
                    })}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-start text-xs text-muted-foreground">
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.ID', { defaultValue: 'شناسه' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.DESCRIPTION', { defaultValue: 'توضیحات' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.PHONE', { defaultValue: 'تلفن' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.TYPE', { defaultValue: 'نوع' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.AMOUNT', { defaultValue: 'مبلغ' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.STATUS', { defaultValue: 'وضعیت' })}</th>
                        <th className="px-4 py-2.5 font-medium">{t('TRANSACTION.DATE', { defaultValue: 'تاریخ' })}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                            {t('NO_TRANSACTIONS_FOUND', { defaultValue: 'تراکنشی یافت نشد' })}
                          </td>
                        </tr>
                      ) : (
                        transactions.map((row, idx) => {
                          const waslat = orderStatusMeta(row.status, t);
                          return (
                            <tr key={row.id ?? idx} className="border-b border-border/70 last:border-0">
                              <td className="px-4 py-2.5 tabular-nums">{row.id ?? '—'}</td>
                              <td className="px-4 py-2.5">{row.b_name ?? row.description ?? '—'}</td>
                              <td className="px-4 py-2.5 tabular-nums">{row.phone ?? row.phone_number ?? '—'}</td>
                              <td className="px-4 py-2.5">
                                {row.type === 'recharge' || row.type === 'balance' ? (
                                  <Badge variant={row.type === 'recharge' ? 'success' : 'secondary'}>
                                    {t(`TRANSACTION.TYPES.${String(row.type).toUpperCase()}`, {
                                      defaultValue: row.type === 'recharge' ? 'شارژ' : 'موجودی',
                                    })}
                                  </Badge>
                                ) : (
                                  row.type ?? '—'
                                )}
                              </td>
                              <td className="px-4 py-2.5 tabular-nums font-medium">
                                {formatCurrency(row.finalAmount ?? row.amount, row.currency || currency)}
                              </td>
                              <td className="px-4 py-2.5">
                                {row.status === undefined || row.status === null ? (
                                  '—'
                                ) : (
                                  <Badge variant={waslat.variant}>{waslat.label}</Badge>
                                )}
                              </td>
                              <td className="px-4 py-2.5 tabular-nums text-muted-foreground">
                                {formatDate(row.created_at)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProviderViewPage;
