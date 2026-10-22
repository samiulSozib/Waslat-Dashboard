'use client';

import React, {
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
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
import {
    BackupRecord,
    BackupRequest
} from '@/types/backupTypes';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ProgressBar } from 'primereact/progressbar';
import { TabView, TabPanel } from 'primereact/tabview';
import { Skeleton } from 'primereact/skeleton';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import withAuth from '../../authGuard';

type StatusSeverity =
    | 'success'
    | 'info'
    | 'warning'
    | 'danger';

const formatBytes = (value?: number | string | null) => {
    const bytes = Number(value);

    if (!Number.isFinite(bytes) || bytes < 0) return '-';
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(
        index === 0 ? 0 : 2
    )} ${units[index]}`;
};

const formatDate = (value?: string | null) => {
    if (!value) return '-';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString();
};

const statusSeverity = (value?: string | null): StatusSeverity => {
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
            return 'info';
        default:
            return 'info';
    }
};

const statusLabel = (value?: string | null) =>
    String(value || 'unknown')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());

const readMetric = (
    dashboard: Record<string, unknown> | null,
    keys: string[]
): number | string | null => {
    if (!dashboard) return null;

    const sources: any[] = [
        dashboard,
        dashboard.statistics,
        dashboard.stats,
        dashboard.summary,
        dashboard.storage
    ];

    for (const source of sources) {
        if (!source || typeof source !== 'object') continue;

        for (const key of keys) {
            const value = source[key];
            if (
                typeof value === 'number' ||
                typeof value === 'string'
            ) {
                return value;
            }
        }
    }

    return null;
};

const isDownloadable = (backup: BackupRecord) => {
    const status = String(backup.status || '').toLowerCase();

    return (
        ['completed', 'success'].includes(status) &&
        (backup.is_verified === true || backup.is_verified === 1)
    );
};

const BackupManagementPage = () => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const toast = useRef<Toast>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const backupState = useSelector(
        (state: RootState) => state.backupReducer
    );

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
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [detailsDialog, setDetailsDialog] = useState(false);
    const [importDialog, setImportDialog] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [verifyingId, setVerifyingId] = useState<number | null>(null);
    const verificationPollRef = useRef<number | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [retentionDays, setRetentionDays] = useState(30);
    const [compression, setCompression] = useState(true);
    const [notifySuccess, setNotifySuccess] = useState(false);
    const [notifyFailure, setNotifyFailure] = useState(true);
    const [savingBackupSettings, setSavingBackupSettings] = useState(false);

    const isSettingEnabled = (value: unknown): boolean =>
        value === true || value === 1 || value === '1';

    useEffect(() => {
        if (!settings) return;

        setRetentionDays(
            Number(settings.retention_days) || 30
        );
        setCompression(isSettingEnabled(settings.enable_compression));
        setNotifySuccess(isSettingEnabled(settings.notify_on_success));
        setNotifyFailure(isSettingEnabled(settings.notify_on_failure));
    }, [settings]);
    const [pollingRequestId, setPollingRequestId] =
        useState<number | null>(null);

    const [lastPollError, setLastPollError] = useState(false);
    const pollingStartedAt = useRef<number | null>(null);
    const pollingBusy = useRef(false);
    const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });
    const statusText = (value?: string | null) => tr(`BACKUP_STATUS_${String(value || 'unknown').toUpperCase()}`, statusLabel(value));
    const isRtl = ['ar', 'fa', 'ps', 'bn'].includes(i18n.language);

    const label = tr;

    const refreshData = useCallback(async () => {
        const jobs = [
            dispatch(fetchBackupDashboard()),
            dispatch(fetchBackups(currentPage, rows))
        ];

        await Promise.allSettled(jobs);
    }, [dispatch, currentPage, rows]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    useEffect(() => {
        if (activeTab === 1) {
            dispatch(fetchBackupSettings()).catch(() => undefined);
        }
    }, [activeTab, dispatch]);

    useEffect(() => {
        if (!error) return;

        toast.current?.show({
            severity: 'error',
            summary: label('ERROR', 'Error'),
            detail: error,
            life: 5000
        });

        dispatch(clearBackupError());
    }, [error, dispatch, t]);

    useEffect(() => {
        if (pollingRequestId === null) return;

        if (pollingStartedAt.current === null) {
            pollingStartedAt.current = Date.now();
        }

        let cancelled = false;

        const checkStatus = async () => {
            if (cancelled || pollingBusy.current) return;

            if (
                pollingStartedAt.current &&
                Date.now() - pollingStartedAt.current > 10 * 60 * 1000
            ) {
                setPollingRequestId(null);
                pollingStartedAt.current = null;
                toast.current?.show({
                    severity: 'warn',
                    summary: tr('BACKUP_STATUS_PAUSED_TITLE', 'Status check paused'),
                    detail: tr('BACKUP_STATUS_PAUSED', 'The backup may still be running. Refresh the history to check its result.'),
                    life: 6000
                });
                return;
            }

            pollingBusy.current = true;

            try {
                const request: BackupRequest =
                    await dispatch(
                        fetchBackupRequestStatus(pollingRequestId)
                    );

                if (cancelled) return;

                setLastPollError(false);

                const status = String(
                    request?.status || ''
                ).toLowerCase();

                if (['completed', 'success', 'failed', 'error'].includes(status)) {
                    setPollingRequestId(null);
                    pollingStartedAt.current = null;

                    toast.current?.show({
                        severity: ['completed', 'success'].includes(status)
                            ? 'success'
                            : 'error',
                        summary: ['completed', 'success'].includes(status)
                            ? tr('BACKUP_REQUEST_SUCCESS_TITLE', 'Backup completed')
                            : tr('BACKUP_REQUEST_FAILED_TITLE', 'Backup failed'),
                        detail: ['completed', 'success'].includes(status)
                            ? tr('BACKUP_REQUEST_SUCCESS', 'The backup request has finished.')
                            : tr('BACKUP_REQUEST_FAILED', 'The backup request did not complete successfully.'),
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

    const handleSaveBackupSettings = async () => {
        if (
            !Number.isInteger(retentionDays) ||
            retentionDays < 1 ||
            retentionDays > 365
        ) {
            toast.current?.show({
                severity: 'warn',
                summary: tr('BACKUP_INVALID_RETENTION', 'Invalid retention'),
                detail: tr('BACKUP_RETENTION_RULE', 'Retention days must be between 1 and 365.'),
                life: 4000
            });
            return;
        }

        setSavingBackupSettings(true);

        try {
            await dispatch(updateBackupSettings({
                retention_days: retentionDays,
                enable_compression: compression,
                notify_on_success: notifySuccess,
                notify_on_failure: notifyFailure
            }));

            toast.current?.show({
                severity: 'success',
                summary: tr('BACKUP_SETTINGS_SAVED', 'Settings saved'),
                detail: tr('BACKUP_SETTINGS_UPDATED', 'Backup settings updated successfully.'),
                life: 4000
            });

            await dispatch(fetchBackupSettings());
        } catch {
            // Error is already stored by the Redux action.
        } finally {
            setSavingBackupSettings(false);
        }
    };

    const handleCreateBackup = async () => {
        try {
            const request: BackupRequest = await dispatch(
                createBackup()
            );

            setConfirmDialog(false);

            toast.current?.show({
                severity: 'success',
                summary: tr('BACKUP_REQUESTED', 'Backup requested'),
                detail: tr('BACKUP_QUEUED', 'Your database backup has been queued.'),
                life: 4000
            });

            if (request?.id) {
                pollingStartedAt.current = Date.now();
                setPollingRequestId(Number(request.id));
                setLastPollError(false);
            }

            refreshData();
        } catch {
            // Redux action already handles the error message.
        }
    };

    useEffect(() => () => {
        if (verificationPollRef.current !== null) window.clearInterval(verificationPollRef.current);
    }, []);

    const archiveApiRoot = () =>
        `${(process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/+$/, '')}/backups`;

    const archiveHeaders = () => ({
        Authorization: `Bearer ${localStorage.getItem('api_token') || ''}`,
        Accept: 'application/json'
    });

    const apiMessage = (error: unknown, fallback: string) => {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message;
            if (typeof message === 'string' && message.trim()) return message;
            if (error.response?.status === 403) return tr('BACKUP_FORBIDDEN', 'SuperAdmin authorization required.');
            if (error.response?.status === 413) return tr('BACKUP_FILE_TOO_LARGE', 'The uploaded archive is too large.');
        }
        if (error instanceof Error && error.message) return error.message;
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
            const response = await axios.post(
                `${archiveApiRoot()}/${backup.id}/verify`,
                {},
                { headers: archiveHeaders(), timeout: 120000 }
            );
            if (response.data?.success === false) {
                throw new Error(response.data?.message || 'Verification failed');
            }
            if (response.status === 202 || response.data?.data?.verification_status === 'queued'
                || response.data?.payload?.verification_status === 'queued') {
                toast.current?.show({
                    severity: 'info',
                    summary: tr('BACKUP_VERIFY', 'Verify Backup'),
                    detail: tr('BACKUP_VERIFY_QUEUED', 'Verification queued on the secure backup worker.'),
                    life: 4000
                });
                // No verification success until the worker reports the result.
                const startedAt = Date.now();
                if (verificationPollRef.current !== null) window.clearInterval(verificationPollRef.current);
                verificationPollRef.current = window.setInterval(async () => {
                    try {
                        const detail = await axios.get(`${archiveApiRoot()}/${backup.id}`, {
                            headers: archiveHeaders(), timeout: 15000
                        });
                        const result = detail.data?.data?.backup ?? detail.data?.payload?.backup
                            ?? detail.data?.backup;
                        const state = String(result?.verification_status || '').toLowerCase();
                        if (state === 'verified' || result?.is_verified === true || result?.is_verified === 1) {
                            if (verificationPollRef.current !== null) window.clearInterval(verificationPollRef.current);
                            verificationPollRef.current = null;
                            setVerifyingId(null);
                            toast.current?.show({ severity: 'success',
                                summary: tr('BACKUP_VERIFY', 'Verify Backup'),
                                detail: tr('BACKUP_VERIFY_SUCCESS', 'Backup archive verified successfully.'), life: 4500 });
                            refreshData();
                            if (detailsDialog && selectedBackup?.id === backup.id) dispatch(fetchBackupDetails(backup.id));
                        } else if (state === 'failed' || state === 'queue_failed') {
                            if (verificationPollRef.current !== null) window.clearInterval(verificationPollRef.current);
                            verificationPollRef.current = null;
                            setVerifyingId(null);
                            toast.current?.show({ severity: 'error',
                                summary: tr('BACKUP_VERIFY_FAILED', 'Verification failed'),
                                detail: tr('BACKUP_VERIFY_FAILED_DETAIL', 'The backup worker could not verify archive integrity.'), life: 5500 });
                            refreshData();
                        } else if (Date.now() - startedAt > 120000) {
                            if (verificationPollRef.current !== null) window.clearInterval(verificationPollRef.current);
                            verificationPollRef.current = null;
                            setVerifyingId(null);
                            toast.current?.show({ severity: 'warn',
                                summary: tr('BACKUP_VERIFY_PENDING', 'Verification is still pending'),
                                detail: tr('BACKUP_VERIFY_REFRESH', 'Refresh backup history to see the worker result.'), life: 5000 });
                        }
                    } catch { /* Retain pending state and retry. */ }
                }, 3000);
                await refreshData();
                return;
            }
            toast.current?.show({ severity: 'success',
                summary: tr('BACKUP_VERIFY', 'Verify Backup'),
                detail: tr('BACKUP_VERIFY_SUCCESS', 'Backup archive verified successfully.'), life: 4500 });
            await refreshData();
            if (detailsDialog && selectedBackup?.id === backup.id) {
                await dispatch(fetchBackupDetails(backup.id));
            }
        } catch (error: unknown) {
            toast.current?.show({ severity: 'error',
                summary: tr('BACKUP_VERIFY_FAILED', 'Verification failed'),
                detail: apiMessage(error, tr('BACKUP_VERIFY_FAILED', 'Verification failed')), life: 5500 });
        } finally {
            // Queued jobs retain the loading indicator until polling finishes.
            if (verificationPollRef.current === null) setVerifyingId(null);
        }
    };

    const handleImport = async () => {
        if (!importFile || importing) return;
        if (!/\.sql\.gz$/i.test(importFile.name) ||
            importFile.size === 0 || importFile.size > 100 * 1024 * 1024) {
            toast.current?.show({
                severity: 'warn',
                summary: tr('BACKUP_INVALID_FILE', 'Invalid backup file'),
                detail: tr('BACKUP_IMPORT_FILE_ERROR', 'Select a .sql.gz archive up to 100 MB.'),
                life: 5000
            });
            return;
        }
        setImporting(true);
        try {
            const data = new FormData();
            data.append('file', importFile);
            const response = await axios.post(
                `${archiveApiRoot()}/import`,
                data,
                { headers: archiveHeaders(), timeout: 180000 }
            );
            if (response.data?.success === false) {
                throw new Error(response.data?.message || 'Import failed');
            }
            setImportDialog(false);
            setImportFile(null);
            if (importInputRef.current) importInputRef.current.value = '';
            setCurrentPage(1);
            await Promise.allSettled([
                dispatch(fetchBackups(1, rows)),
                dispatch(fetchBackupDashboard())
            ]);
            toast.current?.show({
                severity: 'success',
                summary: tr('BACKUP_IMPORT', 'Import Backup'),
                detail: tr('BACKUP_IMPORT_SUCCESS', 'Backup imported. Verify it before downloading.'),
                life: 5000
            });
        } catch (error: unknown) {
            toast.current?.show({
                severity: 'error',
                summary: tr('BACKUP_IMPORT_FAILED', 'Backup import failed'),
                detail: apiMessage(error, tr('BACKUP_IMPORT_FAILED', 'Backup import failed')),
                life: 6000
            });
        } finally {
            setImporting(false);
        }
    };

    const handleViewDetails = async (backup: BackupRecord) => {
        setDetailsDialog(true);

        try {
            await dispatch(fetchBackupDetails(backup.id));
        } catch {
            // Redux handles the error.
        }
    };

    const handleDownload = async (backup: BackupRecord) => {
        if (!isDownloadable(backup)) return;

        try {
            await dispatch(downloadBackup(backup));

            toast.current?.show({
                severity: 'success',
                summary: tr('BACKUP_DOWNLOAD_STARTED', 'Download started'),
                detail: tr('BACKUP_DOWNLOAD_SENT', 'The backup archive has been sent to your browser.'),
                life: 3000
            });
        } catch {
            // Redux handles the error.
        }
    };

    const badge = (value?: string | null) => (
        <Tag
            value={statusText(value)}
            severity={statusSeverity(value)}
        />
    );

    const verifiedBody = (backup: BackupRecord) => (
        <Tag
            value={
                backup.is_verified === true || backup.is_verified === 1
                    ? tr('BACKUP_VERIFIED', 'Verified')
                    : tr('BACKUP_NOT_VERIFIED', 'Not Verified')
            }
            severity={
                backup.is_verified === true || backup.is_verified === 1
                    ? 'success'
                    : 'warning'
            }
            icon={
                backup.is_verified === true || backup.is_verified === 1
                    ? 'pi pi-check-circle'
                    : 'pi pi-exclamation-circle'
            }
        />
    );

    const actionsBody = (backup: BackupRecord) => (
        <div className="flex align-items-center gap-2">
            <Button
                icon="pi pi-eye"
                rounded
                outlined
                severity="info"
                tooltip={tr('BACKUP_DETAILS', 'Backup Details')}
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleViewDetails(backup)}
            />
            {canVerify(backup) && (
                <Button
                    icon="pi pi-shield"
                    rounded
                    outlined
                    severity="warning"
                    tooltip={tr('BACKUP_VERIFY', 'Verify Backup')}
                    tooltipOptions={{ position: 'top' }}
                    loading={verifyingId === backup.id}
                    disabled={verifyingId !== null || importing}
                    onClick={() => handleVerify(backup)}
                />
            )}
            <Button
                icon="pi pi-download"
                rounded
                outlined
                severity="success"
                tooltip={
                    isDownloadable(backup)
                        ? tr('BACKUP_DOWNLOAD', 'Download Backup')
                        : tr('BACKUP_DOWNLOAD_UNAVAILABLE', 'Only completed, verified backups can be downloaded')
                }
                tooltipOptions={{ position: 'top' }}
                disabled={
                    !isDownloadable(backup) ||
                    downloadingId !== null
                }
                loading={downloadingId === backup.id}
                onClick={() => handleDownload(backup)}
            />
        </div>
    );

    const stats = [
        {
            title: tr('BACKUP_TOTAL', 'Total Backups'),
            value: readMetric(dashboard, [
                'total_backups',
                'total',
                'total_records'
            ]),
            icon: 'pi pi-database',
            color: 'var(--primary-color)'
        },
        {
            title: tr('BACKUP_COMPLETED', 'Completed'),
            value: readMetric(dashboard, [
                'completed_backups',
                'successful_backups',
                'completed',
                'success'
            ]),
            icon: 'pi pi-check-circle',
            color: 'var(--green-500)'
        },
        {
            title: tr('BACKUP_FAILED', 'Failed'),
            value: readMetric(dashboard, [
                'failed_backups',
                'failed'
            ]),
            icon: 'pi pi-times-circle',
            color: 'var(--red-500)'
        },
        {
            title: tr('BACKUP_VERIFIED', 'Verified'),
            value: readMetric(dashboard, [
                'verified_archives',
                'verified_backups',
                'verified'
            ]),
            icon: 'pi pi-verified',
            color: 'var(--teal-500)'
        },
        {
            title: tr('BACKUP_STORAGE', 'Backup Storage'),
            value: readMetric(dashboard, [
                'total_backup_bytes',
                'total_size_bytes',
                'storage_used_bytes',
                'total_backup_size',
                'total_storage_bytes'
            ]),
            icon: 'pi pi-server',
            color: 'var(--orange-500)',
            isBytes: true
        }
    ];

    const renderSettingValue = (value: unknown) => {
        if (value === null || value === undefined) return '-';

        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }

        if (typeof value === 'object') {
            return JSON.stringify(value);
        }

        return String(value);
    };

    const settingsEntries = settings &&
        typeof settings === 'object' &&
        !Array.isArray(settings)
        ? Object.entries(settings)
        : [];

    return (
        <div
            className="grid"
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <Toast ref={toast} />

            <div className="col-12">
                <div className="flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                    <div>
                        <h4 className="m-0 mb-2">
                            <i className="pi pi-database mr-2" />
                            {label(
                                'BACKUP_MANAGEMENT',
                                'Backup Management'
                            )}
                        </h4>
                        <span className="text-color-secondary text-sm">
                            {tr('BACKUP_DESCRIPTION', 'Manage and securely download your database backups')}
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            label={label('REFRESH', 'Refresh')}
                            icon="pi pi-refresh"
                            outlined
                            severity="secondary"
                            loading={listLoading || dashboardLoading}
                            onClick={() => {
                                refreshData();
                                if (activeTab === 1) {
                                    dispatch(fetchBackupSettings())
                                        .catch(() => undefined);
                                }
                            }}
                        />
                        <Button
                            label={tr('BACKUP_IMPORT', 'Import Backup')}
                            icon="pi pi-upload"
                            outlined
                            severity="info"
                            disabled={importing}
                            onClick={() => setImportDialog(true)}
                        />
                        <Button
                            label={tr('BACKUP_CREATE', 'Create Backup')}
                            icon="pi pi-plus"
                            severity="success"
                            disabled={creating || pollingRequestId !== null}
                            loading={creating}
                            onClick={() => setConfirmDialog(true)}
                        />
                    </div>
                </div>
            </div>

            {stats.map((stat) => (
                <div
                    className="col-12 sm:col-6 lg:col-4 xl:col"
                    key={stat.title}
                >
                    <div className="card h-full mb-0">
                        <div className="flex justify-content-between align-items-start gap-2">
                            <div>
                                <div className="text-color-secondary text-sm mb-2">
                                    {stat.title}
                                </div>
                                {dashboardLoading && !dashboard ? (
                                    <Skeleton width="6rem" height="2rem" />
                                ) : (
                                    <div className="text-2xl font-semibold">
                                        {stat.value === null
                                            ? '-'
                                            : stat.isBytes
                                                ? formatBytes(stat.value)
                                                : String(stat.value)}
                                    </div>
                                )}
                            </div>
                            <div
                                className="border-round p-3"
                                style={{
                                    background: 'var(--surface-ground)'
                                }}
                            >
                                <i
                                    className={stat.icon}
                                    style={{
                                        color: stat.color,
                                        fontSize: '1.3rem'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {activeRequest && (
                <div className="col-12">
                    <div className="card mb-0">
                        <div className="flex flex-wrap align-items-center justify-content-between gap-2">
                            <div>
                                <div className="font-semibold mb-2">
                                    {tr('BACKUP_REQUEST_STATUS', 'Latest Backup Request')}
                                </div>
                                <div className="flex flex-wrap align-items-center gap-3">
                                    <span className="text-sm">
                                        {tr('BACKUP_REQUEST_NUMBER', 'Request')} #{activeRequest.id}
                                    </span>
                                    {badge(activeRequest.status)}
                                    {activeRequest.created_at && (
                                        <span className="text-color-secondary text-sm">
                                            {formatDate(activeRequest.created_at)}
                                        </span>
                                    )}
                                </div>
                                {lastPollError && pollingRequestId !== null && (
                                    <div className="text-orange-500 text-sm mt-2">
                                        {tr('BACKUP_STATUS_RETRY', 'Could not check the latest status. Retrying...')}
                                    </div>
                                )}
                            </div>
                            <Button
                                icon="pi pi-times"
                                text
                                rounded
                                severity="secondary"
                                tooltip={tr('BACKUP_DISMISS', 'Dismiss')}
                                onClick={() => {
                                    setPollingRequestId(null);
                                    pollingStartedAt.current = null;
                                    dispatch(clearBackupRequest());
                                }}
                            />
                        </div>
                        {pollingRequestId !== null && (
                            <ProgressBar
                                mode="indeterminate"
                                style={{ height: '4px', marginTop: '12px' }}
                            />
                        )}
                    </div>
                </div>
            )}

            <div className="col-12">
                <div className="card">
                    <TabView
                        activeIndex={activeTab}
                        onTabChange={(event) =>
                            setActiveTab(event.index)
                        }
                    >
                        <TabPanel
                            header={tr('BACKUP_HISTORY', 'Backup History')}
                            leftIcon="pi pi-history mr-2"
                        >
                            {listLoading && (
                                <ProgressBar
                                    mode="indeterminate"
                                    style={{
                                        height: '4px',
                                        marginBottom: '12px'
                                    }}
                                />
                            )}

                            <Toolbar
                                className="mb-3"
                                left={
                                    <span className="font-semibold">
                                        {tr('BACKUP_DATABASE_BACKUPS', 'Database Backups')}
                                    </span>
                                }
                                right={
                                    <span className="text-color-secondary text-sm">
                                        {tr('BACKUP_TOTAL', 'Total Backups')}: {pagination.total}
                                    </span>
                                }
                            />

                            <DataTable
                                value={backups}
                                dataKey="id"
                                lazy
                                paginator
                                first={(currentPage - 1) * rows}
                                rows={rows}
                                totalRecords={pagination.total}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                onPage={(event) => {
                                    setCurrentPage((event.page ?? 0) + 1);
                                    setRows(event.rows);
                                }}
                                loading={listLoading}
                                stripedRows
                                responsiveLayout="scroll"
                                emptyMessage={tr('BACKUP_NO_RECORDS', 'No backups found')}
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} backups"
                            >
                                <Column
                                    field="id"
                                    header="ID"
                                    style={{ width: '5rem' }}
                                />
                                <Column
                                    header={tr('BACKUP_FILENAME', 'Backup')}
                                    body={(row: BackupRecord) => (
                                        <div>
                                            <div className="font-semibold">
                                                {row.filename || row.backup_uid || `Backup #${row.id}`}
                                            </div>
                                            {row.filename && row.backup_uid && (
                                                <small className="text-color-secondary">
                                                    {row.backup_uid}
                                                </small>
                                            )}
                                        </div>
                                    )}
                                    style={{ minWidth: '16rem' }}
                                />
                                <Column
                                    header={tr('BACKUP_TYPE', 'Type')}
                                    body={(row: BackupRecord) =>
                                        statusText(row.backup_type)
                                    }
                                />
                                <Column
                                    header={tr('BACKUP_STATUS', 'Status')}
                                    body={(row: BackupRecord) =>
                                        badge(row.status)
                                    }
                                />
                                <Column
                                    header={tr('BACKUP_VERIFIED', 'Verified')}
                                    body={verifiedBody}
                                />
                                <Column
                                    header={tr('BACKUP_SIZE', 'Size')}
                                    body={(row: BackupRecord) =>
                                        formatBytes(row.file_size)
                                    }
                                />
                                <Column
                                    header={tr('BACKUP_SOURCE', 'Source')}
                                    body={(row: BackupRecord) =>
                                        statusText(row.trigger_type)
                                    }
                                />
                                <Column
                                    header={tr('BACKUP_CREATED_AT', 'Created')}
                                    body={(row: BackupRecord) =>
                                        formatDate(row.created_at)
                                    }
                                    style={{ minWidth: '11rem' }}
                                />
                                <Column
                                    header={tr('BACKUP_ACTIONS', 'Actions')}
                                    body={actionsBody}
                                    style={{ minWidth: '8rem' }}
                                />
                            </DataTable>
                        </TabPanel>

                        <TabPanel
                            header={tr('BACKUP_SETTINGS', 'Settings')}
                            leftIcon="pi pi-cog mr-2"
                        >
                            {settingsLoading ? (
                                <div className="flex flex-column gap-3">
                                    <Skeleton height="3rem" />
                                    <Skeleton height="3rem" />
                                    <Skeleton height="3rem" />
                                </div>
                            ) : settings ? (
                                <div className="grid">
                                    <div className="col-12">
                                        <div className="flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                                            <div>
                                                <h5 className="m-0 mb-2">
                                                    {tr('BACKUP_CONFIGURATION', 'Backup Configuration')}
                                                </h5>
                                                <small className="text-color-secondary">
                                                    {tr('BACKUP_CONFIG_DESCRIPTION', 'Configure supported database backup options.')}
                                                </small>
                                            </div>
                                            <Button
                                                label={tr('BACKUP_REFRESH_SETTINGS', 'Refresh Settings')}
                                                icon="pi pi-refresh"
                                                outlined
                                                severity="secondary"
                                                disabled={savingBackupSettings}
                                                onClick={() =>
                                                    dispatch(fetchBackupSettings())
                                                        .catch(() => undefined)
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="col-12 md:col-6">
                                        <div className="field">
                                            <label
                                                htmlFor="backup_retention_days"
                                                className="font-semibold block mb-2"
                                            >
                                                {tr('BACKUP_RETENTION_DAYS', 'Retention Days')}
                                            </label>
                                            <InputNumber
                                                inputId="backup_retention_days"
                                                value={retentionDays}
                                                onValueChange={(e) =>
                                                    setRetentionDays(e.value ?? 30)
                                                }
                                                min={1}
                                                max={365}
                                                useGrouping={false}
                                                showButtons
                                                className="w-full"
                                                disabled={savingBackupSettings}
                                            />
                                            <small className="text-color-secondary block mt-2">
                                                {tr('BACKUP_RETENTION_HELP', 'Retention policy value (1–365 days). Automatic deletion is not enabled yet.')}
                                            </small>
                                        </div>
                                    </div>

                                    <div className="col-12 md:col-6">
                                        <div className="field">
                                            <label className="font-semibold block mb-3">
                                                {tr('BACKUP_COMPRESSION', 'Database Compression')}
                                            </label>
                                            <div className="flex align-items-center gap-3">
                                                <InputSwitch
                                                    inputId="backup_compression"
                                                    checked={compression}
                                                    onChange={(e) =>
                                                        setCompression(Boolean(e.value))
                                                    }
                                                    disabled={savingBackupSettings}
                                                />
                                                <label htmlFor="backup_compression">
                                                    {compression ? tr('BACKUP_ENABLED_GZIP', 'Enabled (GZIP)') : tr('BACKUP_DISABLED', 'Disabled')}
                                                </label>
                                            </div>
                                            <small className="text-color-secondary block mt-2">
                                                {tr('BACKUP_COMPRESSION_HELP', 'Applies to newly created backups.')}
                                            </small>
                                        </div>
                                    </div>

                                    <div className="col-12 md:col-6">
                                        <div className="field">
                                            <label className="font-semibold block mb-3">
                                                {tr('BACKUP_NOTIFY_SUCCESS', 'Success Notifications')}
                                            </label>
                                            <div className="flex align-items-center gap-3">
                                                <InputSwitch
                                                    inputId="backup_notify_success"
                                                    checked={notifySuccess}
                                                    onChange={(e) =>
                                                        setNotifySuccess(Boolean(e.value))
                                                    }
                                                    disabled={savingBackupSettings}
                                                />
                                                <label htmlFor="backup_notify_success">
                                                    {notifySuccess ? tr('BACKUP_ENABLED', 'Enabled') : tr('BACKUP_DISABLED', 'Disabled')}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 md:col-6">
                                        <div className="field">
                                            <label className="font-semibold block mb-3">
                                                {tr('BACKUP_NOTIFY_FAILURE', 'Failure Notifications')}
                                            </label>
                                            <div className="flex align-items-center gap-3">
                                                <InputSwitch
                                                    inputId="backup_notify_failure"
                                                    checked={notifyFailure}
                                                    onChange={(e) =>
                                                        setNotifyFailure(Boolean(e.value))
                                                    }
                                                    disabled={savingBackupSettings}
                                                />
                                                <label htmlFor="backup_notify_failure">
                                                    {notifyFailure ? tr('BACKUP_ENABLED', 'Enabled') : tr('BACKUP_DISABLED', 'Disabled')}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="surface-ground border-round p-3 mb-3">
                                            <div className="font-semibold mb-3">
                                                {tr('BACKUP_OTHER_CONFIGURATION', 'Other Configuration')}
                                            </div>

                                            <div className="grid text-sm">
                                                <div className="col-12 md:col-6">
                                                    <span className="text-color-secondary">
                                                        {tr('BACKUP_FREQUENCY', 'Frequency')}:
                                                    </span>
                                                    <span className="ml-2 font-medium">
                                                        {String(settings.backup_frequency ?? '-')}
                                                    </span>
                                                </div>
                                                <div className="col-12 md:col-6">
                                                    <span className="text-color-secondary">
                                                        {tr('BACKUP_TIME', 'Backup Time')}:
                                                    </span>
                                                    <span className="ml-2 font-medium">
                                                        {String(settings.backup_time ?? '-')}
                                                    </span>
                                                </div>
                                                <div className="col-12 md:col-6">
                                                    <span className="text-color-secondary">
                                                        {tr('BACKUP_DATABASE_BACKUP', 'Database Backup')}:
                                                    </span>
                                                    <span className="ml-2 font-medium">
                                                        {isSettingEnabled(settings.include_database)
                                                            ? tr('BACKUP_ENABLED', 'Enabled')
                                                            : tr('BACKUP_DISABLED', 'Disabled')}
                                                    </span>
                                                </div>
                                                <div className="col-12 md:col-6">
                                                    <span className="text-color-secondary">
                                                        {tr('BACKUP_AUTOMATIC_SCHEDULING', 'Automatic Scheduling')}:
                                                    </span>
                                                    <Tag value={tr('BACKUP_NOT_IMPLEMENTED', 'Not implemented')} severity="warning" />
                                                </div>
                                                <div className="col-12 md:col-6">
                                                    <span className="text-color-secondary">
                                                        {tr('BACKUP_FILE_BACKUP', 'File Backup')}:
                                                    </span>
                                                    <Tag value={tr('BACKUP_NOT_IMPLEMENTED', 'Not implemented')} severity="warning" />
                                                </div>
                                                <div className="col-12 md:col-6">
                                                    <span className="text-color-secondary">
                                                        {tr('BACKUP_ENCRYPTION_RECOVERY', 'Encryption / Recovery')}:
                                                    </span>
                                                    <Tag value={tr('BACKUP_NOT_IMPLEMENTED', 'Not implemented')} severity="warning" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <div className="flex justify-content-end">
                                            <Button
                                                label={tr('BACKUP_SAVE_SETTINGS', 'Save Settings')}
                                                icon="pi pi-save"
                                                severity="success"
                                                loading={savingBackupSettings}
                                                onClick={handleSaveBackupSettings}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-color-secondary">
                                    {tr('BACKUP_SETTINGS_LOAD_FAILED', 'Could not load backup settings.')}
                                    <Button
                                        className="ml-2"
                                        label={tr('BACKUP_RETRY', 'Retry')}
                                        icon="pi pi-refresh"
                                        text
                                        onClick={() =>
                                            dispatch(fetchBackupSettings())
                                                .catch(() => undefined)
                                        }
                                    />
                                </div>
                            )}
                        </TabPanel>
                    </TabView>
                </div>
            </div>

            <Dialog
                visible={importDialog}
                modal
                header={tr('BACKUP_IMPORT', 'Import Backup')}
                style={{ width: 'min(95vw, 500px)' }}
                closable={!importing}
                onHide={() => {
                    if (!importing) setImportDialog(false);
                }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label={tr('BACKUP_CANCEL', 'Cancel')}
                            outlined
                            severity="secondary"
                            disabled={importing}
                            onClick={() => setImportDialog(false)}
                        />
                        <Button
                            label={tr('BACKUP_IMPORT', 'Import Backup')}
                            icon="pi pi-upload"
                            severity="success"
                            loading={importing}
                            disabled={!importFile || importing}
                            onClick={handleImport}
                        />
                    </div>
                }
            >
                <p className="text-color-secondary mt-0">
                    {tr('BACKUP_IMPORT_HELP', 'Upload an existing .sql.gz database backup. Import only registers the archive; it does not restore or modify the live database.')}
                </p>
                <input
                    ref={importInputRef}
                    type="file"
                    accept=".gz,.sql.gz,application/gzip"
                    aria-label={tr('BACKUP_SELECT_FILE', 'Select backup archive')}
                    disabled={importing}
                    className="w-full"
                    onChange={(event) => setImportFile(event.target.files?.[0] || null)}
                />
                <small className="block text-color-secondary mt-2">
                    {tr('BACKUP_IMPORT_FILE_ERROR', 'Select a .sql.gz archive up to 100 MB.')}
                </small>
                {importFile && (
                    <div className="text-sm mt-3">
                        {importFile.name} ({formatBytes(importFile.size)})
                    </div>
                )}
                {importing && (
                    <ProgressBar mode="indeterminate" style={{ height: '4px', marginTop: '12px' }} />
                )}
            </Dialog>

            <Dialog
                visible={confirmDialog}
                modal
                header={tr('BACKUP_CREATE_TITLE', 'Create Database Backup')}
                style={{ width: 'min(95vw, 450px)' }}
                onHide={() => setConfirmDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label={tr('BACKUP_CANCEL', 'Cancel')}
                            severity="secondary"
                            outlined
                            onClick={() => setConfirmDialog(false)}
                            disabled={creating}
                        />
                        <Button
                            label={tr('BACKUP_CREATE', 'Create Backup')}
                            icon="pi pi-database"
                            severity="success"
                            loading={creating}
                            onClick={handleCreateBackup}
                        />
                    </div>
                }
            >
                <div className="flex gap-3 align-items-start">
                    <i
                        className="pi pi-info-circle text-primary"
                        style={{ fontSize: '1.5rem' }}
                    />
                    <div>
                        <p className="mt-0">
                            {tr('BACKUP_CREATE_CONFIRM', 'Do you want to create a new database backup?')}
                        </p>
                        <p className="text-color-secondary text-sm mb-0">
                            {tr('BACKUP_CREATE_INFO', 'The request will be sent to the dedicated backup worker. Existing telecom orders and services will not be modified.')}
                        </p>
                    </div>
                </div>
            </Dialog>

            <Dialog
                visible={detailsDialog}
                modal
                header={tr('BACKUP_DETAILS', 'Backup Details')}
                style={{ width: 'min(95vw, 650px)' }}
                onHide={() => setDetailsDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label={tr('BACKUP_CLOSE', 'Close')}
                            outlined
                            severity="secondary"
                            onClick={() => setDetailsDialog(false)}
                        />
                        {selectedBackup && canVerify(selectedBackup) && (
                            <Button
                                label={tr('BACKUP_VERIFY', 'Verify Backup')}
                                icon="pi pi-shield"
                                severity="warning"
                                outlined
                                loading={verifyingId === selectedBackup.id}
                                disabled={verifyingId !== null}
                                onClick={() => handleVerify(selectedBackup)}
                            />
                        )}
                        {selectedBackup &&
                            isDownloadable(selectedBackup) && (
                                <Button
                                    label={tr('BACKUP_DOWNLOAD', 'Download')}
                                    icon="pi pi-download"
                                    severity="success"
                                    loading={
                                        downloadingId === selectedBackup.id
                                    }
                                    disabled={downloadingId !== null}
                                    onClick={() =>
                                        handleDownload(selectedBackup)
                                    }
                                />
                            )}
                    </div>
                }
            >
                {detailsLoading ? (
                    <div className="flex flex-column gap-3">
                        <Skeleton height="2rem" />
                        <Skeleton height="2rem" />
                        <Skeleton height="2rem" />
                    </div>
                ) : selectedBackup ? (
                    <div className="flex flex-column gap-3">
                        {[
                            ['ID', selectedBackup.id],
                            [tr('BACKUP_UID', 'Backup UID'), selectedBackup.backup_uid],
                            [tr('BACKUP_FILENAME', 'Filename'), selectedBackup.filename],
                            [tr('BACKUP_TYPE', 'Type'), selectedBackup.backup_type],
                            [tr('BACKUP_STATUS', 'Status'), selectedBackup.status],
                            [tr('BACKUP_SOURCE', 'Trigger'), selectedBackup.trigger_type],
                            [tr('BACKUP_SIZE', 'Size'), formatBytes(selectedBackup.file_size)],
                            [
                                tr('BACKUP_VERIFIED', 'Verified'),
                                selectedBackup.is_verified === true ||
                                selectedBackup.is_verified === 1
                                    ? tr('BACKUP_YES', 'Yes')
                                    : tr('BACKUP_NO', 'No')
                            ],
                            [
                                tr('BACKUP_COMPRESSED', 'Compressed'),
                                selectedBackup.is_compressed === true ||
                                selectedBackup.is_compressed === 1
                                    ? tr('BACKUP_YES', 'Yes')
                                    : tr('BACKUP_NO', 'No')
                            ],
                            [
                                tr('BACKUP_ENCRYPTED', 'Encrypted'),
                                selectedBackup.is_encrypted === true ||
                                selectedBackup.is_encrypted === 1
                                    ? tr('BACKUP_YES', 'Yes')
                                    : tr('BACKUP_NO', 'No')
                            ],
                            [tr('BACKUP_CREATED_AT', 'Created'), formatDate(selectedBackup.created_at)],
                            [tr('BACKUP_COMPLETED_AT', 'Completed'), formatDate(selectedBackup.completed_at)],
                            ['SHA-256', selectedBackup.checksum_sha256]
                        ].map(([title, value]) => (
                            <div
                                key={String(title)}
                                className="flex flex-wrap justify-content-between gap-2 border-bottom-1 surface-border pb-2"
                            >
                                <span className="text-color-secondary">
                                    {title}
                                </span>
                                <span
                                    className="font-medium"
                                    style={{
                                        overflowWrap: 'anywhere',
                                        maxWidth: '100%'
                                    }}
                                >
                                    {String(value ?? '-')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <span className="text-color-secondary">
                        {tr('BACKUP_DETAILS_UNAVAILABLE', 'Backup details unavailable.')}
                    </span>
                )}
            </Dialog>
        </div>
    );
};

export default withAuth(BackupManagementPage);
