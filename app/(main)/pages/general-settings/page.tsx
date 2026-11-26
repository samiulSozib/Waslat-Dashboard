'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { BarChart3, Database, MessageCircle, RefreshCw } from 'lucide-react';
import { Toast } from 'primereact/toast';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import withAuth from '../../authGuard';

type StatsMode = 'daily_stats' | 'live_orders';

const GeneralSettingsPage = () => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);
    const [backfillLoading, setBackfillLoading] = useState(false);
    const [rebuildLoading, setRebuildLoading] = useState(false);
    const [statsMode, setStatsMode] = useState<StatsMode>('daily_stats');
    const [statsModeLoading, setStatsModeLoading] = useState(false);
    const [statsModeSaving, setStatsModeSaving] = useState(false);

    const authHeaders = () => {
        const token = localStorage.getItem('api_token') || '';
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setStatsModeLoading(true);
            try {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/app-settings`, {
                    headers: authHeaders()
                });
                const mode = data?.data?.settings?.dashboard_stats_mode;
                if (!cancelled && (mode === 'daily_stats' || mode === 'live_orders')) {
                    setStatsMode(mode);
                }
            } catch {
                // Keep default daily_stats
            } finally {
                if (!cancelled) setStatsModeLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const saveStatsMode = async (mode: StatsMode) => {
        setStatsMode(mode);
        setStatsModeSaving(true);
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_BASE_URL}/app-settings`,
                { dashboard_stats_mode: mode },
                { headers: authHeaders() }
            );
            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESSFUL', { defaultValue: 'موفق' }),
                detail: t('DASHBOARD_STATS_MODE_SAVED', { defaultValue: 'حالت محاسبه داشبورد ذخیره شد.' }),
                life: 4000
            });
        } catch (err: any) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR', { defaultValue: 'خطا' }),
                detail:
                    err?.response?.data?.message ||
                    t('DASHBOARD_STATS_MODE_SAVE_FAILED', { defaultValue: 'ذخیره حالت محاسبه ناموفق بود.' }),
                life: 5000
            });
        } finally {
            setStatsModeSaving(false);
        }
    };

    const syncTelegramGroups = async () => {
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/telegram-chat-ids/fetch`, {}, { headers: authHeaders() });
            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESSFUL', { defaultValue: 'موفق' }),
                detail: t('TELEGRAM_SYNC_SUCCESS', { defaultValue: 'گروه‌های تلگرام با موفقیت همگام شدند.' }),
                life: 4000
            });
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR', { defaultValue: 'خطا' }),
                detail: t('TELEGRAM_SYNC_FAILED', { defaultValue: 'همگام‌سازی گروه‌های تلگرام ناموفق بود.' }),
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const runBackfillDenorm = async () => {
        setBackfillLoading(true);
        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard-stats/backfill-denorm`,
                {},
                { headers: authHeaders(), timeout: 0 }
            );
            const updated = data?.data?.updated ?? data?.updated;
            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESSFUL', { defaultValue: 'موفق' }),
                detail: t('DASHBOARD_BACKFILL_SUCCESS', {
                    defaultValue: 'پرکردن فیلدهای داشبورد انجام شد.{{count}}',
                    count: updated != null ? ` (${updated})` : ''
                }),
                life: 6000
            });
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                t('DASHBOARD_BACKFILL_FAILED', { defaultValue: 'پرکردن فیلدهای داشبورد ناموفق بود.' });
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR', { defaultValue: 'خطا' }),
                detail: message,
                life: 6000
            });
        } finally {
            setBackfillLoading(false);
        }
    };

    const runRebuildDailyStats = async () => {
        setRebuildLoading(true);
        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard-stats/rebuild-daily-stats`,
                {},
                { headers: authHeaders(), timeout: 0 }
            );
            const processed = data?.data?.processed ?? data?.processed;
            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESSFUL', { defaultValue: 'موفق' }),
                detail: t('DASHBOARD_REBUILD_SUCCESS', {
                    defaultValue: 'بازسازی آمار روزانه انجام شد.{{count}}',
                    count: processed != null ? ` (${processed})` : ''
                }),
                life: 6000
            });
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                t('DASHBOARD_REBUILD_FAILED', { defaultValue: 'بازسازی آمار روزانه ناموفق بود.' });
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR', { defaultValue: 'خطا' }),
                detail: message,
                life: 6000
            });
        } finally {
            setRebuildLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <PageHeader
                title={t('MENU.APPSETTING', { defaultValue: 'تنظیمات عمومی' })}
                description={t('GENERAL_SETTINGS_DESCRIPTION', {
                    defaultValue: 'ابزارهای عمومی سامانه؛ همگام‌سازی کانال‌ها و نگهداری آمار داشبورد'
                })}
            />

            <div className="waslat-panel overflow-hidden">
                <div className="flex flex-wrap items-start gap-4 border-b border-border bg-muted/30 p-4 sm:p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                        <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                        <h2 className="text-base font-semibold text-foreground">{t('TELEGRAM_GROUP', { defaultValue: 'گروه تلگرام' })}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t('TELEGRAM_GROUP_TEXT', {
                                defaultValue: 'لیست شناسه چت‌های تلگرام را از ربات واکشی و در سامانه به‌روز کنید.'
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                    <p className="text-xs text-muted-foreground">
                        {t('TELEGRAM_SYNC_HINT', {
                            defaultValue: 'پس از همگام‌سازی، شناسه‌ها در تنظیمات اعلان‌های تلگرام قابل انتخاب هستند.'
                        })}
                    </p>
                    <Button type="button" size="sm" disabled={loading} onClick={syncTelegramGroups}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {t('SYNC_TELEGRAM_GROUP', { defaultValue: 'همگام‌سازی گروه‌های تلگرام' })}
                    </Button>
                </div>
            </div>

            <div className="waslat-panel overflow-hidden">
                <div className="flex flex-wrap items-start gap-4 border-b border-border bg-muted/30 p-4 sm:p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <BarChart3 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                        <h2 className="text-base font-semibold text-foreground">
                            {t('DASHBOARD_STATS_MAINTENANCE', { defaultValue: 'نگهداری آمار داشبورد' })}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {t('DASHBOARD_STATS_MAINTENANCE_TEXT', {
                                defaultValue:
                                    'پس از استقرار اولیه یا اگر آمار داشبورد نادرست به نظر می‌رسد، این دو عملیات را یک‌بار اجرا کنید. migrate را فقط از سرور اجرا کنید.'
                            })}
                        </p>
                    </div>
                </div>
                <div className="space-y-3 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 p-3 sm:p-4">
                        <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                {t('DASHBOARD_STATS_MODE_TITLE', { defaultValue: 'حالت محاسبه داشبورد ادمین' })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('DASHBOARD_STATS_MODE_HINT', {
                                    defaultValue:
                                        'پیش‌فرض «آمار روزانه» است (سریع). «محاسبه از سفارش‌ها» فقط برای بررسی اعداد است و روی داده‌های زیاد کند می‌شود.'
                                })}
                            </p>
                        </div>
                        <Select
                            value={statsMode}
                            disabled={statsModeLoading || statsModeSaving}
                            onValueChange={(value) => {
                                if (value === 'daily_stats' || value === 'live_orders') {
                                    saveStatsMode(value);
                                }
                            }}
                        >
                            <SelectTrigger className="w-full min-w-[14rem] sm:w-64">
                                <SelectValue
                                    placeholder={
                                        statsModeLoading
                                            ? t('PLEASE_WAIT', { defaultValue: 'لطفاً صبر کنید…' })
                                            : t('DASHBOARD_STATS_MODE_TITLE', { defaultValue: 'حالت محاسبه' })
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily_stats">
                                    {t('DASHBOARD_STATS_MODE_DAILY', { defaultValue: 'آمار روزانه (سریع)' })}
                                </SelectItem>
                                <SelectItem value="live_orders">
                                    {t('DASHBOARD_STATS_MODE_LIVE', {
                                        defaultValue: 'محاسبه از سفارش‌ها (دقیق‌تر، کند)'
                                    })}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 p-3 sm:p-4">
                        <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                {t('DASHBOARD_BACKFILL_TITLE', { defaultValue: 'پرکردن فیلدهای سفارش' })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('DASHBOARD_BACKFILL_HINT', {
                                    defaultValue: 'معادل orders:backfill-denorm — فیلدهای قیمت/ارز را روی سفارش‌های قدیمی پر می‌کند.'
                                })}
                            </p>
                        </div>
                        <Button type="button" size="sm" variant="outline" disabled={backfillLoading || rebuildLoading} onClick={runBackfillDenorm}>
                            <Database className={`h-4 w-4 ${backfillLoading ? 'animate-pulse' : ''}`} />
                            {backfillLoading
                                ? t('PLEASE_WAIT', { defaultValue: 'لطفاً صبر کنید…' })
                                : t('DASHBOARD_BACKFILL_RUN', { defaultValue: 'اجرای پرکردن' })}
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-background/60 p-3 sm:p-4">
                        <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-medium text-foreground">
                                {t('DASHBOARD_REBUILD_TITLE', { defaultValue: 'بازسازی آمار روزانه' })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('DASHBOARD_REBUILD_HINT', {
                                    defaultValue: 'معادل orders:rebuild-daily-stats — جداول خلاصه روزانه را از روی سفارش‌ها می‌سازد.'
                                })}
                            </p>
                        </div>
                        <Button type="button" size="sm" disabled={backfillLoading || rebuildLoading} onClick={runRebuildDailyStats}>
                            <RefreshCw className={`h-4 w-4 ${rebuildLoading ? 'animate-spin' : ''}`} />
                            {rebuildLoading
                                ? t('PLEASE_WAIT', { defaultValue: 'لطفاً صبر کنید…' })
                                : t('DASHBOARD_REBUILD_RUN', { defaultValue: 'اجرای بازسازی' })}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuth(GeneralSettingsPage);
