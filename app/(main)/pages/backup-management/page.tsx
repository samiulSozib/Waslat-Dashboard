'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {
    CheckCircle2,
    Database,
    Download,
    Eye,
    HardDrive,
    Plus,
    RefreshCw,
    Settings2,
    ShieldCheck,
    Upload,
    XCircle
} from 'lucide-react';
import { Toast } from 'primereact/toast';
import { AppDispatch, RootState } from '@/app/redux/store';
import {
    fetchBackupDashboard,
    fetchBackups,
    fetchBackupDetails,
    fetchBackupSettings,
    updateBackupSettings,
    createBackup,
    fetchBackupRequestStatus,
    downloadBackup,
    clearBackupError,
    clearBackupRequest
} from '@/app/redux/actions/backupActions';
import { BackupRecord, BackupRequest } from '@/types/backupTypes';
import { ListPage } from '@/components/admin/list-page';
import { StatCard } from '@/components/admin/stat-card';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { RowActions, type RowActionItem } from '@/components/admin/row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import withAuth from '../../authGuard';

type StatusTone = 'success' | 'warning' | 'danger' | 'muted' | 'secondary';

const formatBytes = (value?: number | string | null) => {
    const bytes = Number(value);
    if (!Number.isFinite(bytes) || bytes < 0) return '—';
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const statusTone = (value?: string | null): StatusTone => {
    switch (String(value || '').toLowerCase()) {
        case 'completed':
        case 'success':
        case 'verified':
            return 'success';
        case 'failed':
        case 'error':
        case 'rejected':
            return 'danger';
        case 'pending':
        case 'queued':
            return 'warning';
        case 'running':
        case 'processing':
        case 'in_progress':
        case 'under_process':
            return 'secondary';
        default:
            return 'muted';
    }
};

const statusLabel = (value?: string | null) =>
    String(value || 'unknown')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());

const readMetric = (dashboard: Record<string, unknown> | null, keys: string[]): number | string | null => {
    if (!dashboard) return null;
    const sources: any[] = [dashboard, dashboard.statistics, dashboard.stats, dashboard.summary, dashboard.storage];
    for (const source of sources) {
        if (!source || typeof source !== 'object') continue;
        for (const key of keys) {
            const value = source[key];
            if (typeof value === 'number' || typeof value === 'string') return value;
        }
    }
    return null;
};

const isDownloadable = (backup: BackupRecord) => {
    const status = String(backup.status || '').toLowerCase();
    return ['completed', 'success'].includes(status) && (backup.is_verified === true || backup.is_verified === 1);
};

const BackupManagementPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const toast = useRef<Toast>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const backupState = useSelector((state: RootState) => state.backupReducer);
    const {
        dashboard,
        backups,
        selectedBackup,
        settings,
        activeRequest,
        pagination,
        dashboardLoading,
        listLoading,
        detailsLoading,
        settingsLoading,
        creating,
        downloadingId,
        error
    } = backupState;

    const [currentPage, setCurrentPage] = useState(1);
    const [rows, setRows] = useState(10);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [verifyingId, setVerifyingId] = useState<number | null>(null);
    const verificationPollRef = useRef<number | null>(null);
    const [retentionDays, setRetentionDays] = useState(30);
    const [compression, setCompression] = useState(true);
    const [notifySuccess, setNotifySuccess] = useState(false);
    const [notifyFailure, setNotifyFailure] = useState(true);
    const [savingBackupSettings, setSavingBackupSettings] = useState(false);
    const [pollingRequestId, setPollingRequestId] = useState<number | null>(null);
    const [lastPollError, setLastPollError] = useState(false);
    const pollingStartedAt = useRef<number | null>(null);
    const pollingBusy = useRef(false);

    const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });
    const statusText = (value?: string | null) => tr(`BACKUP_STATUS_${String(value || 'unknown').toUpperCase()}`, statusLabel(value));

    const isSettingEnabled = (value: unknown): boolean => value === true || value === 1 || value === '1';

    useEffect(() => {
        if (!settings) return;
        setRetentionDays(Number(settings.retention_days) || 30);
        setCompression(isSettingEnabled(settings.enable_compression));
        setNotifySuccess(isSettingEnabled(settings.notify_on_success));
        setNotifyFailure(isSettingEnabled(settings.notify_on_failure));
    }, [settings]);

    const refreshData = useCallback(async () => {
        await Promise.allSettled([dispatch(fetchBackupDashboard()), dispatch(fetchBackups(currentPage, rows))]);
    }, [dispatch, currentPage, rows]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    useEffect(() => {
        if (!error) return;
        toast.current?.show({ severity: 'error', summary: tr('ERROR', 'خطا'), detail: error, life: 5000 });
        dispatch(clearBackupError());
    }, [error, dispatch]);

    useEffect(() => {
        if (pollingRequestId === null) return;
        if (pollingStartedAt.current === null) pollingStartedAt.current = Date.now();

        let cancelled = false;
        const checkStatus = async () => {
            if (cancelled || pollingBusy.current) return;
            if (pollingStartedAt.current && Date.now() - pollingStartedAt.current > 10 * 60 * 1000) {
                setPollingRequestId(null);
                pollingStartedAt.current = null;
                toast.current?.show({
                    severity: 'warn',
                    summary: tr('BACKUP_STATUS_PAUSED_TITLE', 'بررسی وضعیت متوقف شد'),
                    detail: tr('BACKUP_STATUS_PAUSED', 'پشتیبان ممکن است هنوز در حال اجرا باشد. تاریخچه را تازه کنید.'),
                    life: 6000
                });
                return;
            }

            pollingBusy.current = true;
            try {
                const request: BackupRequest = await dispatch(fetchBackupRequestStatus(pollingRequestId));
                if (cancelled) return;
                setLastPollError(false);
                const status = String(request?.status || '').toLowerCase();
                if (['completed', 'success', 'failed', 'error'].includes(status)) {
                    setPollingRequestId(null);
                    pollingStartedAt.current = null;
                    toast.current?.show({
                        severity: ['completed', 'success'].includes(status) ? 'success' : 'error',
                        summary: ['completed', 'success'].includes(status)
                            ? tr('BACKUP_REQUEST_SUCCESS_TITLE', 'پشتیبان کامل شد')
                            : tr('BACKUP_REQUEST_FAILED_TITLE', 'پشتیبان ناموفق'),
                        detail: ['completed', 'success'].includes(status)
                            ? tr('BACKUP_REQUEST_SUCCESS', 'درخواست پشتیبان با موفقیت تمام شد.')
                            : tr('BACKUP_REQUEST_FAILED', 'درخواست پشتیبان کامل نشد.'),
                        life: 5000
                    });
                    refreshData();
                }
            } catch {
                if (!cancelled) setLastPollError(true);
            } finally {
                pollingBusy.current = false;
            }
        };

        checkStatus();
        const interval = window.setInterval(checkStatus, 5000);
        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [pollingRequestId, dispatch, refreshData]);

    useEffect(
        () => () => {
            if (verificationPollRef.current !== null) window.clearInterval(verificationPollRef.current);
        },
        []
    );

    const openSettings = async () => {
        setSettingsOpen(true);
        try {
            await dispatch(fetchBackupSettings());
        } catch {
            /* redux stores error */
        }
    };

    const handleSaveBackupSettings = async () => {
        if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 365) {
            toast.current?.show({
                severity: 'warn',
                summary: tr('BACKUP_INVALID_RETENTION', 'مدت نگهداری نامعتبر'),
                detail: tr('BACKUP_RETENTION_RULE', 'مدت نگهداری باید بین ۱ تا ۳۶۵ روز باشد.'),
                life: 4000
            });
            return;
        }
        setSavingBackupSettings(true);
        try {
            await dispatch(
                updateBackupSettings({
                    retention_days: retentionDays,
                    enable_compression: compression,
                    notify_on_success: notifySuccess,
                    notify_on_failure: notifyFailure
                })
            );
            toast.current?.show({
                severity: 'success',
                summary: tr('BACKUP_SETTINGS_SAVED', 'تنظیمات ذخیره شد'),
                detail: tr('BACKUP_SETTINGS_UPDATED', 'تنظیمات پشتیبان به‌روز شد.'),
                life: 4000
            });
            await dispatch(fetchBackupSettings());
            setSettingsOpen(false);
        } catch {
            /* redux */
        } finally {
            setSavingBackupSettings(false);
        }
    };

    const handleCreateBackup = async () => {
        try {
            const request: BackupRequest = await dispatch(createBackup());
            setConfirmOpen(false);
            toast.current?.show({
                severity: 'success',
                summary: tr('BACKUP_REQUESTED', 'درخواست ثبت شد'),
                detail: tr('BACKUP_QUEUED', 'پشتیبان پایگاه‌داده در صف قرار گرفت.'),
                life: 4000
            });
            if (request?.id) {
                pollingStartedAt.current = Date.now();
                setPollingRequestId(Number(request.id));
                setLastPollError(false);
            }
            refreshData();
        } catch {
            /* redux */
        }
    };

    const archiveApiRoot = () => `${(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/+$/, '')}/backups`;
    const archiveHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('api_token') || ''}`,
        Accept: 'application/json'
    });

    const apiMessage = (err: unknown, fallback: string) => {
        if (axios.isAxiosError(err)) {
            const message = err.response?.data?.message;
            if (typeof message === 'string' && message.trim()) return message;
            if (err.response?.status === 403) return tr('BACKUP_FORBIDDEN', 'دسترسی SuperAdmin لازم است.');
            if (err.response?.status === 413) return tr('BACKUP_FILE_TOO_LARGE', 'فایل آرشیو خیلی بزرگ است.');
        }
        if (err instanceof Error && err.message) return err.message;
        return fallback;
    };

    const canVerify = (backup: BackupRecord) =>
        String(backup.status || '').toLowerCase() === 'completed' &&
        backup.backup_type === 'database' &&
        backup.is_verified !== true &&
        backup.is_verified !== 1;

    const handleVerify = async (backup: BackupRecord) => {
        if (!canVerify(backup) || verifyingId !== null) return;
        setVerifyingId(backup.id);
        try {
            const response = await axios.post(`${archiveApiRoot()}/${backup.id}/verify`, {}, { headers: archiveHeaders(), timeout: 120000 });
            if (response.data?.success === false) {
                throw new Error(response.data?.message || 'Verification failed');
            }
            if (
                response.status === 202 ||
                response.data?.data?.verification_status === 'queued' ||
                response.data?.payload?.verification_status === 'queued'
            ) {
                toast.current?.show({
                    severity: 'info',
                    summary: tr('BACKUP_VERIFY', 'تأیید صحت'),
                    detail: tr('BACKUP_VERIFY_QUEUED', 'تأیید صحت در صف کارگر امن قرار گرفت.'),
                    life: 4000
                });
                const startedAt = Date.now();
                if (verificationPollRef.current !== null) window.clearInterval(verificationPollRef.current);
                verificationPollRef.current = window.setInterval(async () => {
                    try {
                        const detail = await axios.get(`${archiveApiRoot()}/${backup.id}`, { headers: archiveHeaders(), timeout: 15000 });
                        const result = detail.data?.data?.backup ?? detail.data?.payload?.backup ?? detail.data?.backup;
                        const state = String(result?.verification_status || '').toLowerCase();
                        if (state === 'verified' || result?.is_verified === true || result?.is_verified === 1) {
                            if (verificationPollRef.current !== null) window.clearInterval(verificationPollRef.current);
                            verificationPollRef.current = null;
                            setVerifyingId(null);
                            toast.current?.show({
                                severity: 'success',
                                summary: tr('BACKUP_VERIFY', 'تأیید صحت'),
                                detail: tr('BACKUP_VERIFY_SUCCESS', 'آرشیو پشتیبان با موفقیت تأیید شد.'),
                                life: 4500
                            });
                            refreshData();
                            if (detailsOpen && selectedBackup?.id === backup.id) dispatch(fetchBackupDetails(backup.id));
                        } else if (state === 'failed' || state === 'queue_failed') {
                            if (verificationPollRef.current !== null) window.clearInterval(verificationPollRef.current);
                            verificationPollRef.current = null;
                            setVerifyingId(null);
                            toast.current?.show({
                                severity: 'error',
                                summary: tr('BACKUP_VERIFY_FAILED', 'تأیید ناموفق'),
                                detail: tr('BACKUP_VERIFY_FAILED_DETAIL', 'کارگر پشتیبان نتوانست صحت آرشیو را تأیید کند.'),
                                life: 5500
                            });
                            refreshData();
                        } else if (Date.now() - startedAt > 120000) {
                            if (verificationPollRef.current !== null) window.clearInterval(verificationPollRef.current);
                            verificationPollRef.current = null;
                            setVerifyingId(null);
                            toast.current?.show({
                                severity: 'warn',
                                summary: tr('BACKUP_VERIFY_PENDING', 'تأیید هنوز در انتظار است'),
                                detail: tr('BACKUP_VERIFY_REFRESH', 'تاریخچه را تازه کنید تا نتیجه کارگر را ببینید.'),
                                life: 5000
                            });
                        }
                    } catch {
                        /* retry */
                    }
                }, 3000);
                await refreshData();
                return;
            }
            toast.current?.show({
                severity: 'success',
                summary: tr('BACKUP_VERIFY', 'تأیید صحت'),
                detail: tr('BACKUP_VERIFY_SUCCESS', 'آرشیو پشتیبان با موفقیت تأیید شد.'),
                life: 4500
            });
            await refreshData();
            if (detailsOpen && selectedBackup?.id === backup.id) await dispatch(fetchBackupDetails(backup.id));
        } catch (err: unknown) {
            toast.current?.show({
                severity: 'error',
                summary: tr('BACKUP_VERIFY_FAILED', 'تأیید ناموفق'),
                detail: apiMessage(err, tr('BACKUP_VERIFY_FAILED', 'تأیید ناموفق')),
                life: 5500
            });
        } finally {
            if (verificationPollRef.current === null) setVerifyingId(null);
        }
    };

    const handleImport = async () => {
        if (!importFile || importing) return;
        if (!/\.sql\.gz$/i.test(importFile.name) || importFile.size === 0 || importFile.size > 100 * 1024 * 1024) {
            toast.current?.show({
                severity: 'warn',
                summary: tr('BACKUP_INVALID_FILE', 'فایل نامعتبر'),
                detail: tr('BACKUP_IMPORT_FILE_ERROR', 'یک آرشیو .sql.gz تا ۱۰۰ مگابایت انتخاب کنید.'),
                life: 5000
            });
            return;
        }
        setImporting(true);
        try {
            const data = new FormData();
            data.append('file', importFile);
            const response = await axios.post(`${archiveApiRoot()}/import`, data, { headers: archiveHeaders(), timeout: 180000 });
            if (response.data?.success === false) throw new Error(response.data?.message || 'Import failed');
            setImportOpen(false);
            setImportFile(null);
            if (importInputRef.current) importInputRef.current.value = '';
            setCurrentPage(1);
            await Promise.allSettled([dispatch(fetchBackups(1, rows)), dispatch(fetchBackupDashboard())]);
            toast.current?.show({
                severity: 'success',
                summary: tr('BACKUP_IMPORT', 'ورود پشتیبان'),
                detail: tr('BACKUP_IMPORT_SUCCESS', 'پشتیبان وارد شد. قبل از دانلود آن را تأیید کنید.'),
                life: 5000
            });
        } catch (err: unknown) {
            toast.current?.show({
                severity: 'error',
                summary: tr('BACKUP_IMPORT_FAILED', 'ورود ناموفق'),
                detail: apiMessage(err, tr('BACKUP_IMPORT_FAILED', 'ورود ناموفق')),
                life: 6000
            });
        } finally {
            setImporting(false);
        }
    };

    const handleViewDetails = async (backup: BackupRecord) => {
        setDetailsOpen(true);
        try {
            await dispatch(fetchBackupDetails(backup.id));
        } catch {
            /* redux */
        }
    };

    const handleDownload = async (backup: BackupRecord) => {
        if (!isDownloadable(backup)) return;
        try {
            await dispatch(downloadBackup(backup));
            toast.current?.show({
                severity: 'success',
                summary: tr('BACKUP_DOWNLOAD_STARTED', 'دانلود شروع شد'),
                detail: tr('BACKUP_DOWNLOAD_SENT', 'آرشیو پشتیبان برای مرورگر ارسال شد.'),
                life: 3000
            });
        } catch {
            /* redux */
        }
    };

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / rows));

    const metric = (keys: string[]) => {
        const value = readMetric(dashboard, keys);
        return value === null ? '—' : String(value);
    };

    const rowActions = (backup: BackupRecord): RowActionItem[] => [
        {
            label: tr('BACKUP_DETAILS', 'جزئیات'),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => handleViewDetails(backup)
        },
        {
            label: tr('BACKUP_VERIFY', 'تأیید صحت'),
            icon: <ShieldCheck className="h-4 w-4" />,
            hidden: !canVerify(backup),
            onClick: () => handleVerify(backup)
        },
        {
            label: tr('BACKUP_DOWNLOAD', 'دانلود'),
            icon: <Download className="h-4 w-4" />,
            hidden: !isDownloadable(backup),
            onClick: () => handleDownload(backup)
        }
    ];

    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={tr('BACKUP_MANAGEMENT', 'مدیریت نسخه‌های پشتیبان')}
                description={tr('BACKUP_DESCRIPTION', 'ایجاد، تأیید و دانلود امن پشتیبان‌های پایگاه‌داده')}
                loading={listLoading || dashboardLoading}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={listLoading || dashboardLoading}
                            onClick={() => refreshData()}
                        >
                            <RefreshCw className={cn('h-4 w-4', (listLoading || dashboardLoading) && 'animate-spin')} />
                            {tr('REFRESH', 'تازه‌سازی')}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={openSettings}>
                            <Settings2 className="h-4 w-4" />
                            {tr('BACKUP_SETTINGS', 'تنظیمات')}
                        </Button>
                        <Button type="button" variant="outline" size="sm" disabled={importing} onClick={() => setImportOpen(true)}>
                            <Upload className="h-4 w-4" />
                            {tr('BACKUP_IMPORT', 'ورود پشتیبان')}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={creating || pollingRequestId !== null}
                            onClick={() => setConfirmOpen(true)}
                        >
                            <Plus className="h-4 w-4" />
                            {tr('BACKUP_CREATE', 'ایجاد پشتیبان')}
                        </Button>
                    </div>
                }
                toolbar={
                    <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <StatCard
                                label={tr('BACKUP_TOTAL', 'کل پشتیبان‌ها')}
                                value={dashboardLoading && !dashboard ? '…' : metric(['total_backups', 'total', 'total_records'])}
                                icon={Database}
                                tone="slate"
                            />
                            <StatCard
                                label={tr('BACKUP_COMPLETED', 'کامل‌شده')}
                                value={dashboardLoading && !dashboard ? '…' : metric(['completed_backups', 'successful_backups', 'completed', 'success'])}
                                icon={CheckCircle2}
                                tone="primary"
                            />
                            <StatCard
                                label={tr('BACKUP_FAILED', 'ناموفق')}
                                value={dashboardLoading && !dashboard ? '…' : metric(['failed_backups', 'failed'])}
                                icon={XCircle}
                                tone="rose"
                            />
                            <StatCard
                                label={tr('BACKUP_VERIFIED', 'تأیید‌شده')}
                                value={dashboardLoading && !dashboard ? '…' : metric(['verified_archives', 'verified_backups', 'verified'])}
                                icon={ShieldCheck}
                                tone="sky"
                            />
                            <StatCard
                                label={tr('BACKUP_STORAGE', 'فضای ذخیره‌سازی')}
                                value={
                                    dashboardLoading && !dashboard
                                        ? '…'
                                        : formatBytes(
                                              readMetric(dashboard, [
                                                  'total_backup_bytes',
                                                  'total_size_bytes',
                                                  'storage_used_bytes',
                                                  'total_backup_size',
                                                  'total_storage_bytes'
                                              ])
                                          )
                                }
                                icon={HardDrive}
                                tone="amber"
                            />
                        </div>

                        {activeRequest ? (
                            <div className="waslat-panel flex flex-wrap items-center justify-between gap-3 p-4">
                                <div className="space-y-1">
                                    <div className="text-sm font-semibold">{tr('BACKUP_REQUEST_STATUS', 'آخرین درخواست پشتیبان')}</div>
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">
                                            {tr('BACKUP_REQUEST_NUMBER', 'درخواست')} #{activeRequest.id}
                                        </span>
                                        <Badge variant={statusTone(activeRequest.status)}>{statusText(activeRequest.status)}</Badge>
                                        {activeRequest.created_at ? (
                                            <span className="text-xs text-muted-foreground">{formatDate(activeRequest.created_at)}</span>
                                        ) : null}
                                    </div>
                                    {lastPollError && pollingRequestId !== null ? (
                                        <p className="text-xs text-amber-600">{tr('BACKUP_STATUS_RETRY', 'وضعیت دریافت نشد؛ در حال تلاش مجدد…')}</p>
                                    ) : null}
                                    {pollingRequestId !== null ? <div className="mt-2 h-0.5 w-48 animate-pulse rounded bg-emerald-600" /> : null}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setPollingRequestId(null);
                                        pollingStartedAt.current = null;
                                        dispatch(clearBackupRequest());
                                    }}
                                >
                                    {tr('BACKUP_DISMISS', 'بستن')}
                                </Button>
                            </div>
                        ) : null}
                    </div>
                }
                footer={
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
                        <span>
                            {tr('BACKUP_TOTAL', 'کل')}: {pagination.total}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            >
                                {tr('PREV', 'قبلی')}
                            </Button>
                            <span className="tabular-nums">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                                {tr('NEXT', 'بعدی')}
                            </Button>
                            <select
                                className="h-8 rounded-md border border-border bg-background px-2 text-xs"
                                value={rows}
                                onChange={(e) => {
                                    setRows(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                {[5, 10, 25, 50].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                }
            >
                {(backups || []).length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-muted-foreground">{tr('BACKUP_NO_RECORDS', 'پشتیبان‌ای یافت نشد')}</div>
                ) : (
                    <table className="w-full min-w-[56rem] border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40 text-start text-xs text-muted-foreground">
                                <th className="px-3 py-2 font-medium">ID</th>
                                <th className="px-3 py-2 font-medium">{tr('BACKUP_FILENAME', 'پشتیبان')}</th>
                                <th className="px-3 py-2 font-medium">{tr('BACKUP_TYPE', 'نوع')}</th>
                                <th className="px-3 py-2 font-medium">{tr('BACKUP_STATUS', 'وضعیت')}</th>
                                <th className="px-3 py-2 font-medium">{tr('BACKUP_VERIFIED', 'تأیید')}</th>
                                <th className="px-3 py-2 font-medium">{tr('BACKUP_SIZE', 'حجم')}</th>
                                <th className="px-3 py-2 font-medium">{tr('BACKUP_SOURCE', 'منبع')}</th>
                                <th className="px-3 py-2 font-medium">{tr('BACKUP_CREATED_AT', 'ایجاد')}</th>
                                <th className="px-3 py-2 font-medium">{tr('BACKUP_ACTIONS', 'عملیات')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(backups || []).map((row) => {
                                const verified = row.is_verified === true || row.is_verified === 1;
                                return (
                                    <tr key={row.id} className="border-b border-border/70 hover:bg-muted/30">
                                        <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.id}</td>
                                        <td className="px-3 py-2">
                                            <div className="font-medium">{row.filename || row.backup_uid || `Backup #${row.id}`}</div>
                                            {row.filename && row.backup_uid ? (
                                                <div className="text-[11px] text-muted-foreground">{row.backup_uid}</div>
                                            ) : null}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">{statusText(row.backup_type)}</td>
                                        <td className="px-3 py-2">
                                            <Badge variant={statusTone(row.status)}>{statusText(row.status)}</Badge>
                                        </td>
                                        <td className="px-3 py-2">
                                            <Badge variant={verified ? 'success' : 'warning'}>
                                                {verified ? tr('BACKUP_VERIFIED', 'تأیید‌شده') : tr('BACKUP_NOT_VERIFIED', 'تأیید نشده')}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 tabular-nums whitespace-nowrap">{formatBytes(row.file_size)}</td>
                                        <td className="px-3 py-2 whitespace-nowrap">{statusText(row.trigger_type)}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{formatDate(row.created_at)}</td>
                                        <td className="px-3 py-2">
                                            <RowActions items={rowActions(row)} />
                                            {verifyingId === row.id ? (
                                                <span className="ms-2 text-[11px] text-amber-600">{tr('BACKUP_VERIFY', 'در حال تأیید…')}</span>
                                            ) : null}
                                            {downloadingId === row.id ? (
                                                <span className="ms-2 text-[11px] text-emerald-700">{tr('BACKUP_DOWNLOAD', 'دانلود…')}</span>
                                            ) : null}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </ListPage>

            <FormSheet
                open={settingsOpen}
                onOpenChange={(open) => !savingBackupSettings && setSettingsOpen(open)}
                title={tr('BACKUP_SETTINGS', 'تنظیمات پشتیبان')}
                description={tr('BACKUP_CONFIG_DESCRIPTION', 'گزینه‌های پشتیبانی‌شده برای پشتیبان پایگاه‌داده')}
                size="md"
                footer={
                    <FormActions
                        onCancel={() => setSettingsOpen(false)}
                        onSubmit={handleSaveBackupSettings}
                        loading={savingBackupSettings}
                        submitLabel={tr('BACKUP_SAVE_SETTINGS', 'ذخیره تنظیمات')}
                    />
                }
            >
                {settingsLoading && !settings ? (
                    <p className="text-sm text-muted-foreground">{tr('LOADING', 'در حال بارگذاری…')}</p>
                ) : settings ? (
                    <FormSection>
                        <FormField
                            label={tr('BACKUP_RETENTION_DAYS', 'مدت نگهداری (روز)')}
                            hint={tr('BACKUP_RETENTION_HELP', 'بین ۱ تا ۳۶۵ روز. حذف خودکار هنوز فعال نیست.')}
                        >
                            <NumberInput value={retentionDays} onValueChange={(v) => setRetentionDays(v ?? 30)} min={1} max={365} />
                        </FormField>
                        <FormField label={tr('BACKUP_COMPRESSION', 'فشرده‌سازی')} hint={tr('BACKUP_COMPRESSION_HELP', 'روی پشتیبان‌های جدید اعمال می‌شود.')}>
                            <div className="flex items-center gap-3 pt-1">
                                <Switch checked={compression} onCheckedChange={setCompression} disabled={savingBackupSettings} />
                                <span className="text-sm">{compression ? tr('BACKUP_ENABLED_GZIP', 'فعال (GZIP)') : tr('BACKUP_DISABLED', 'غیرفعال')}</span>
                            </div>
                        </FormField>
                        <FormField label={tr('BACKUP_NOTIFY_SUCCESS', 'اعلان موفقیت')}>
                            <div className="flex items-center gap-3 pt-1">
                                <Switch checked={notifySuccess} onCheckedChange={setNotifySuccess} disabled={savingBackupSettings} />
                                <span className="text-sm">{notifySuccess ? tr('BACKUP_ENABLED', 'فعال') : tr('BACKUP_DISABLED', 'غیرفعال')}</span>
                            </div>
                        </FormField>
                        <FormField label={tr('BACKUP_NOTIFY_FAILURE', 'اعلان خطا')}>
                            <div className="flex items-center gap-3 pt-1">
                                <Switch checked={notifyFailure} onCheckedChange={setNotifyFailure} disabled={savingBackupSettings} />
                                <span className="text-sm">{notifyFailure ? tr('BACKUP_ENABLED', 'فعال') : tr('BACKUP_DISABLED', 'غیرفعال')}</span>
                            </div>
                        </FormField>
                        <div className="col-span-full rounded-lg border border-border bg-muted/30 p-3 text-sm">
                            <div className="mb-2 font-semibold">{tr('BACKUP_OTHER_CONFIGURATION', 'سایر پیکربندی')}</div>
                            <div className="grid gap-2 sm:grid-cols-2">
                                <div>
                                    <span className="text-muted-foreground">{tr('BACKUP_FREQUENCY', 'تناوب')}: </span>
                                    <span className="font-medium">{String(settings.backup_frequency ?? '—')}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{tr('BACKUP_TIME', 'زمان')}: </span>
                                    <span className="font-medium">{String(settings.backup_time ?? '—')}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">{tr('BACKUP_DATABASE_BACKUP', 'پشتیبان DB')}: </span>
                                    <span className="font-medium">
                                        {isSettingEnabled(settings.include_database) ? tr('BACKUP_ENABLED', 'فعال') : tr('BACKUP_DISABLED', 'غیرفعال')}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-muted-foreground">{tr('BACKUP_AUTOMATIC_SCHEDULING', 'زمان‌بندی خودکار')}</span>
                                    <Badge variant="warning">{tr('BACKUP_NOT_IMPLEMENTED', 'هنوز پیاده‌سازی نشده')}</Badge>
                                </div>
                            </div>
                        </div>
                    </FormSection>
                ) : (
                    <div className="space-y-3 text-sm text-muted-foreground">
                        <p>{tr('BACKUP_SETTINGS_LOAD_FAILED', 'بارگذاری تنظیمات ناموفق بود.')}</p>
                        <Button type="button" variant="outline" size="sm" onClick={() => dispatch(fetchBackupSettings()).catch(() => undefined)}>
                            <RefreshCw className="h-4 w-4" />
                            {tr('BACKUP_RETRY', 'تلاش مجدد')}
                        </Button>
                    </div>
                )}
            </FormSheet>

            <FormSheet
                open={importOpen}
                onOpenChange={(open) => {
                    if (!importing) {
                        setImportOpen(open);
                        if (!open) setImportFile(null);
                    }
                }}
                title={tr('BACKUP_IMPORT', 'ورود پشتیبان')}
                description={tr('BACKUP_IMPORT_HELP', 'آرشیو .sql.gz موجود را ثبت کنید؛ دیتابیس زنده تغییر نمی‌کند.')}
                size="sm"
                footer={
                    <FormActions
                        onCancel={() => setImportOpen(false)}
                        onSubmit={handleImport}
                        loading={importing}
                        submitDisabled={!importFile}
                        submitLabel={tr('BACKUP_IMPORT', 'ورود پشتیبان')}
                    />
                }
            >
                <FormSection>
                    <FormField label={tr('BACKUP_SELECT_FILE', 'انتخاب آرشیو')} hint={tr('BACKUP_IMPORT_FILE_ERROR', 'آرشیو .sql.gz تا ۱۰۰ مگابایت')} fullWidth>
                        <Input
                            ref={importInputRef}
                            type="file"
                            accept=".gz,.sql.gz,application/gzip"
                            disabled={importing}
                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                        />
                    </FormField>
                    {importFile ? (
                        <p className="col-span-full text-sm text-muted-foreground">
                            {importFile.name} ({formatBytes(importFile.size)})
                        </p>
                    ) : null}
                </FormSection>
            </FormSheet>

            <FormSheet
                open={confirmOpen}
                onOpenChange={(open) => !creating && setConfirmOpen(open)}
                title={tr('BACKUP_CREATE_TITLE', 'ایجاد پشتیبان پایگاه‌داده')}
                description={tr('BACKUP_CREATE_INFO', 'درخواست به کارگر پشتیبان ارسال می‌شود؛ سفارش‌ها و سرویس‌ها تغییر نمی‌کنند.')}
                size="sm"
                footer={
                    <FormActions
                        onCancel={() => setConfirmOpen(false)}
                        onSubmit={handleCreateBackup}
                        loading={creating}
                        submitLabel={tr('BACKUP_CREATE', 'ایجاد پشتیبان')}
                    />
                }
            >
                <p className="text-sm text-foreground">{tr('BACKUP_CREATE_CONFIRM', 'آیا می‌خواهید پشتیبان جدید ایجاد شود؟')}</p>
            </FormSheet>

            <FormSheet
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                title={tr('BACKUP_DETAILS', 'جزئیات پشتیبان')}
                size="md"
                footer={
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setDetailsOpen(false)}>
                            {tr('BACKUP_CLOSE', 'بستن')}
                        </Button>
                        {selectedBackup && canVerify(selectedBackup) ? (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={verifyingId !== null}
                                onClick={() => handleVerify(selectedBackup)}
                            >
                                <ShieldCheck className="h-4 w-4" />
                                {tr('BACKUP_VERIFY', 'تأیید صحت')}
                            </Button>
                        ) : null}
                        {selectedBackup && isDownloadable(selectedBackup) ? (
                            <Button type="button" disabled={downloadingId !== null} onClick={() => handleDownload(selectedBackup)}>
                                <Download className="h-4 w-4" />
                                {tr('BACKUP_DOWNLOAD', 'دانلود')}
                            </Button>
                        ) : null}
                    </div>
                }
            >
                {detailsLoading ? (
                    <p className="text-sm text-muted-foreground">{tr('LOADING', 'در حال بارگذاری…')}</p>
                ) : selectedBackup ? (
                    <dl className="divide-y divide-border text-sm">
                        {[
                            ['ID', selectedBackup.id],
                            [tr('BACKUP_UID', 'شناسه پشتیبان'), selectedBackup.backup_uid],
                            [tr('BACKUP_FILENAME', 'نام فایل'), selectedBackup.filename],
                            [tr('BACKUP_TYPE', 'نوع'), selectedBackup.backup_type],
                            [tr('BACKUP_STATUS', 'وضعیت'), selectedBackup.status],
                            [tr('BACKUP_SOURCE', 'منبع'), selectedBackup.trigger_type],
                            [tr('BACKUP_SIZE', 'حجم'), formatBytes(selectedBackup.file_size)],
                            [
                                tr('BACKUP_VERIFIED', 'تأیید'),
                                selectedBackup.is_verified === true || selectedBackup.is_verified === 1
                                    ? tr('BACKUP_YES', 'بله')
                                    : tr('BACKUP_NO', 'خیر')
                            ],
                            [
                                tr('BACKUP_COMPRESSED', 'فشرده'),
                                selectedBackup.is_compressed === true || selectedBackup.is_compressed === 1
                                    ? tr('BACKUP_YES', 'بله')
                                    : tr('BACKUP_NO', 'خیر')
                            ],
                            [
                                tr('BACKUP_ENCRYPTED', 'رمزنگاری'),
                                selectedBackup.is_encrypted === true || selectedBackup.is_encrypted === 1
                                    ? tr('BACKUP_YES', 'بله')
                                    : tr('BACKUP_NO', 'خیر')
                            ],
                            [tr('BACKUP_CREATED_AT', 'ایجاد'), formatDate(selectedBackup.created_at)],
                            [tr('BACKUP_COMPLETED_AT', 'اتمام'), formatDate(selectedBackup.completed_at)],
                            ['SHA-256', selectedBackup.checksum_sha256]
                        ].map(([title, value]) => (
                            <div key={String(title)} className="flex flex-wrap items-start justify-between gap-2 py-2">
                                <dt className="text-muted-foreground">{title}</dt>
                                <dd className="max-w-full break-all font-medium text-foreground">{String(value ?? '—')}</dd>
                            </div>
                        ))}
                    </dl>
                ) : (
                    <p className="text-sm text-muted-foreground">{tr('BACKUP_DETAILS_UNAVAILABLE', 'جزئیات در دسترس نیست.')}</p>
                )}
            </FormSheet>
        </>
    );
};

export default withAuth(BackupManagementPage);
