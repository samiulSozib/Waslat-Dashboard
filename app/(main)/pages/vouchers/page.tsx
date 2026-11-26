/* eslint-disable @next/next/no-img-element */
'use client';
import { Button as PrimeButton } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { Paginator } from 'primereact/paginator';
import { AppDispatch } from '@/app/redux/store';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { Chip } from 'primereact/chip';
import { Tag } from 'primereact/tag';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { RowActions } from '@/components/admin/row-actions';
import { Button as UiButton } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Pencil, Plus, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Import voucher actions
import {
    _fetchVoucherList,
    _addVoucher,
    _editVoucher,
    _deleteVoucher,
    _deleteSelectedVouchers,
    _bulkImportVouchers,
    _fetchSocialCompanies,
    _fetchBundleStats,
    _clearBulkImportState,
} from '@/app/redux/actions/voucherActions';

// Import interfaces
import {
    Voucher,
    VoucherQueryParams,
    CreateVoucherPayload,
    UpdateVoucherPayload,
    BulkImportPayload,
    BulkImportVoucher,
    BundleStat,
} from '@/types/interface';

const formatExpiresAtForInput = (value: string): string => {
    if (!value) return '';
    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatExpiresAtFromInput = (local: string): string => {
    if (!local) return '';
    const d = new Date(local);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().replace('T', ' ').slice(0, 19);
};

const dateToDatetimeLocal = (d: Date): string => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const VoucherPage = () => {
    // ============================
    // State Definitions
    // ============================

    const emptyVoucher: Voucher = {
        id: undefined,
        company_name: '',
        bundle_title: '',
        bundle: {
            service: {
                id: 0,
                service_category_id: '',
                company_id: '',
                service_category: {
                    id: 0,
                    category_name: '',
                    type: '',
                },
                company: [],
            },
        },
        voucher_code: '',
        provider: '',
        expires_at: '',
        notes: '',
        metadata: {},
        status: '',
        created_at: '',
        updated_at: '',
    };

    // Voucher form state
    const [voucherDialog, setVoucherDialog] = useState(false);
    const [deleteVoucherDialog, setDeleteVoucherDialog] = useState(false);
    const [deleteVouchersDialog, setDeleteVouchersDialog] = useState(false);
    const [bulkImportDialog, setBulkImportDialog] = useState(false);
    const [voucher, setVoucher] = useState<Voucher>(emptyVoucher);
    const [selectedVouchers, setSelectedVouchers] = useState<Voucher[] | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [filterOpen, setFilterOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();

    // Redux state
    const { vouchers, statistics, pagination, loading, bundleStats, bulkImport } = useSelector(
        (state: any) => state.voucherReducer
    );

    // Filter state
    const [filters, setFilters] = useState<VoucherQueryParams>({
        page: 1,
        items_per_page: 20,
        status: 'available',
        bundle_id: undefined,
        search: '',
        provider: '',
    });

    const [activeFilters, setActiveFilters] = useState<VoucherQueryParams>({});

    // Bulk import state
    const [bulkImportData, setBulkImportData] = useState<BulkImportPayload>({
        bundle_id: 0,
        provider: 'midasbuy',
        vouchers: [],
    });

    const [bulkVoucherCode, setBulkVoucherCode] = useState('');
    const [bulkVoucherExpiry, setBulkVoucherExpiry] = useState<Date | null>(null);
    const [bulkVoucherNotes, setBulkVoucherNotes] = useState('');
    const [bulkVoucherMetadata, setBulkVoucherMetadata] = useState('');

    // ============================
    // Data Fetching
    // ============================

    useEffect(() => {
        dispatch(_fetchVoucherList({ page: 1, items_per_page: 20 }));
        dispatch(_fetchSocialCompanies());
        dispatch(_fetchBundleStats());
    }, [dispatch]);

    useEffect(() => {
        dispatch(_fetchVoucherList({ ...filters, ...activeFilters, search: searchTag }));
    }, [searchTag, filters, activeFilters, dispatch]);


    // ============================
    // CRUD Operations
    // ============================

    const openNew = () => {
        setVoucher({ ...emptyVoucher });
        setSubmitted(false);
        setVoucherDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setVoucherDialog(false);
        setVoucher({ ...emptyVoucher });
    };

    const hideDeleteVoucherDialog = () => {
        setDeleteVoucherDialog(false);
        setVoucher({ ...emptyVoucher });
    };

    const hideDeleteVouchersDialog = () => {
        setDeleteVouchersDialog(false);
        setSelectedVouchers(null);
    };

    const hideBulkImportDialog = () => {
        setBulkImportDialog(false);
        setBulkImportData({
            bundle_id: 0,
            provider: 'midasbuy',
            vouchers: [],
        });
        setBulkVoucherCode('');
        setBulkVoucherExpiry(null);
        setBulkVoucherNotes('');
        setBulkVoucherMetadata('');
        dispatch(_clearBulkImportState());
    };

    const saveVoucher = () => {
        setSubmitted(true);

        if (!voucher.voucher_code || !voucher.expires_at || !voucher.bundle?.service?.id) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000,
            });
            return;
        }

        const payload: CreateVoucherPayload = {
            bundle_id: voucher.bundle?.service?.id || 0,
            voucher_code: voucher.voucher_code,
            provider: voucher.provider || 'midasbuy',
            expires_at: voucher.expires_at,
            notes: voucher.notes,
            metadata: voucher.metadata,
        };

        if (voucher.id) {
            // Edit existing voucher
            const updatePayload: UpdateVoucherPayload = {
                voucher_code: voucher.voucher_code,
                notes: voucher.notes,
                expires_at: voucher.expires_at,
                metadata: voucher.metadata,
                status: voucher.status,
            };
            dispatch(_editVoucher(voucher.id, updatePayload, toast, t));
        } else {
            // Create new voucher
            dispatch(_addVoucher(payload, toast, t));
        }

        setVoucherDialog(false);
        setVoucher({ ...emptyVoucher });
        setSubmitted(false);
    };

    const editVoucher = (voucherData: Voucher) => {
        setVoucher({ ...voucherData });
        setVoucherDialog(true);
    };

    const confirmDeleteVoucher = (voucherData: Voucher) => {
        setVoucher({ ...voucherData });
        setDeleteVoucherDialog(true);
    };

    const deleteVoucher = () => {
        if (voucher.id) {
            dispatch(_deleteVoucher(voucher.id, toast, t));
        }
        setDeleteVoucherDialog(false);
        setVoucher({ ...emptyVoucher });
    };

    const confirmDeleteSelected = () => {
        if (!selectedVouchers || selectedVouchers.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('VALIDATION_WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000,
            });
            return;
        }
        setDeleteVouchersDialog(true);
    };

    const deleteSelectedVouchers = async () => {
        if (!selectedVouchers || selectedVouchers.length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000,
            });
            return;
        }

        const selectedIds = selectedVouchers
            .map((v) => v.id)
            .filter((id): id is number => id !== undefined);

        await _deleteSelectedVouchers(selectedIds, toast, t);
        dispatch(_fetchVoucherList(filters));

        setSelectedVouchers(null);
        setDeleteVouchersDialog(false);
    };

    // ============================
    // Bulk Import Functions
    // ============================

    const openBulkImport = () => {
        setBulkImportDialog(true);
        setBulkImportData({
            bundle_id: 0,
            provider: 'midasbuy',
            vouchers: [],
        });
        setBulkVoucherCode('');
        setBulkVoucherExpiry(null);
        setBulkVoucherNotes('');
        setBulkVoucherMetadata('');
        dispatch(_clearBulkImportState());
    };

    const addBulkVoucher = () => {
        if (!bulkVoucherCode) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_ENTER_VOUCHER_CODE'),
                life: 3000,
            });
            return;
        }

        if (!bulkVoucherExpiry) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_SELECT_EXPIRY_DATE'),
                life: 3000,
            });
            return;
        }

        let metadata = {};
        if (bulkVoucherMetadata) {
            try {
                metadata = JSON.parse(bulkVoucherMetadata);
            } catch (e) {
                toast.current?.show({
                    severity: 'error',
                    summary: t('VALIDATION_ERROR'),
                    detail: t('INVALID_JSON_FORMAT'),
                    life: 3000,
                });
                return;
            }
        }

        const newVoucher: BulkImportVoucher = {
            code: bulkVoucherCode,
            expires_at: bulkVoucherExpiry.toISOString().replace('T', ' ').slice(0, 19),
            notes: bulkVoucherNotes || undefined,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        };

        setBulkImportData((prev) => ({
            ...prev,
            vouchers: [...prev.vouchers, newVoucher],
        }));

        // Clear fields
        setBulkVoucherCode('');
        setBulkVoucherExpiry(null);
        setBulkVoucherNotes('');
        setBulkVoucherMetadata('');

        toast.current?.show({
            severity: 'success',
            summary: t('SUCCESS'),
            detail: t('VOUCHER_ADDED_TO_BULK_LIST'),
            life: 2000,
        });
    };

    const removeBulkVoucher = (index: number) => {
        setBulkImportData((prev) => ({
            ...prev,
            vouchers: prev.vouchers.filter((_, i) => i !== index),
        }));
    };

    const submitBulkImport = () => {
        if (bulkImportData.vouchers.length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('NO_VOUCHERS_TO_IMPORT'),
                life: 3000,
            });
            return;
        }

        if (!bulkImportData.bundle_id) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_SELECT_BUNDLE'),
                life: 3000,
            });
            return;
        }

        dispatch(_bulkImportVouchers(bulkImportData, toast, t));
    };

    // ============================
    // Filter Functions
    // ============================



    // ============================
    // Table Templates
    // ============================

    const statusBodyTemplate = (rowData: Voucher) => {
        const statusMap: Record<
            string,
            { severity: 'success' | 'warning' | 'danger' | 'info' | 'secondary'; label: string }
        > = {
            available: { severity: 'success', label: t('VOUCHER.STATUS.AVAILABLE') },
            used: { severity: 'warning', label: t('VOUCHER.STATUS.USED') },
            reserved: { severity: 'info', label: t('VOUCHER.STATUS.RESERVED') },
            expired: { severity: 'danger', label: t('VOUCHER.STATUS.EXPIRED') },
        };

        const status = rowData.status || 'available';
        const statusInfo = statusMap[status] || statusMap.available;

        return (
            <>
                <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.STATUS')}</span>
                <Tag severity={statusInfo.severity} value={statusInfo.label} />
            </>
        );
    };

    const voucherCodeBodyTemplate = (rowData: Voucher) => {
        return (
            <>
                <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.CODE')}</span>
                <span className="font-bold text-primary" style={{ fontSize: '0.85rem' }}>
                    {rowData.voucher_code}
                </span>
            </>
        );
    };

    const bundleTitleBodyTemplate = (rowData: Voucher) => {
        return (
            <>
                <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.BUNDLE')}</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.bundle_title}</span>
            </>
        );
    };

    const companyNameBodyTemplate = (rowData: Voucher) => {
        return (
            <>
                <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.COMPANY')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.company_name}</span>
                </div>
            </>
        );
    };

    const providerBodyTemplate = (rowData: Voucher) => {
        return (
            <>
                <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.PROVIDER')}</span>
                <Chip label={rowData.provider || 'N/A'} className="text-sm" />
            </>
        );
    };

    const expiryDateBodyTemplate = (rowData: Voucher) => {
        const formatDate = (dateString: string) => {
            if (!dateString) return { formattedDate: 'N/A', formattedTime: '' };
            const date = new Date(dateString);
            const optionsDate: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            const optionsTime: Intl.DateTimeFormatOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };
            const formattedDate = date.toLocaleDateString('en-US', optionsDate);
            const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

            return { formattedDate, formattedTime };
        };

        const { formattedDate, formattedTime } = formatDate(rowData.expires_at || '');

        return (
            <>
                <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.EXPIRES')}</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate || 'N/A'}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime || ''}</span>
            </>
        );
    };

    const notesBodyTemplate = (rowData: Voucher) => {
        return (
            <>
                <span className="p-column-title">{t('VOUCHER.TABLE.COLUMN.NOTES')}</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.notes || '-'}</span>
            </>
        );
    };

    const createdAtBodyTemplate = (rowData: Voucher) => {
        const formatDate = (dateString: string) => {
            if (!dateString) return { formattedDate: 'N/A', formattedTime: '' };
            const date = new Date(dateString);
            const optionsDate: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            const optionsTime: Intl.DateTimeFormatOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };
            const formattedDate = date.toLocaleDateString('en-US', optionsDate);
            const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

            return { formattedDate, formattedTime };
        };

        const { formattedDate, formattedTime } = formatDate(rowData.created_at || '');

        return (
            <>
                <span className="p-column-title">{t('TABLE.GENERAL.CREATEDAT')}</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
            </>
        );
    };


    const voucherRowActions = (rowData: Voucher) => [
        {
            label: t('TABLE.GENERAL.EDIT'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => editVoucher(rowData),
        },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDeleteVoucher(rowData),
            danger: true,
            separatorBefore: true,
        },
    ];

    const actionBodyTemplate = (rowData: Voucher) => <RowActions items={voucherRowActions(rowData)} />;

    // ============================
    // Statistics Summary
    // ============================

    const statisticsSummary = () => {
        if (!statistics) return null;

        const statItems = [
            { label: t('VOUCHER.STATS.TOTAL'), value: statistics.total, color: 'text-blue-500' },
            { label: t('VOUCHER.STATS.AVAILABLE'), value: statistics.available, color: 'text-green-500' },
            { label: t('VOUCHER.STATS.USED'), value: statistics.used, color: 'text-yellow-500' },
            { label: t('VOUCHER.STATS.RESERVED'), value: statistics.reserved, color: 'text-purple-500' },
            { label: t('VOUCHER.STATS.EXPIRED'), value: statistics.expired, color: 'text-red-500' },
        ];

        return (
            <div className="grid mb-4">
                {statItems.map((item) => (
                    <div key={item.label} className="col-12 sm:col-6 md:col-2 lg:col-2">
                        <div className="p-3 shadow-1 border-round bg-white">
                            <div className="text-sm text-500">{item.label}</div>
                            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleSubmitFilter = (filterData: VoucherQueryParams) => {
        const cleaned = { ...filterData };
        delete (cleaned as VoucherQueryParams & { page?: number }).page;
        delete (cleaned as VoucherQueryParams & { items_per_page?: number }).items_per_page;
        setActiveFilters(cleaned);
        setFilters((prev) => ({ ...prev, page: 1, ...filterData }));
    };

    const filterChips = useMemo(() => {
        const chips: { key: string; label: string }[] = [];
        const af = { ...filters, ...activeFilters } as VoucherQueryParams;
        if (af.status && af.status !== 'available') {
            chips.push({ key: 'status', label: `${t('VOUCHER.FILTER.STATUS')}: ${t('VOUCHER.STATUS.' + af.status.toUpperCase(), { defaultValue: af.status })}` });
        }
        if (af.bundle_id) {
            const b = bundleStats.find((x: BundleStat) => x.id === af.bundle_id);
            chips.push({ key: 'bundle_id', label: `${t('VOUCHER.FILTER.BUNDLE')}: ${b?.bundle_title || af.bundle_id}` });
        }
        if (af.provider) {
            chips.push({ key: 'provider', label: `${t('VOUCHER.FILTER.PROVIDER')}: ${af.provider}` });
        }
        return chips;
    }, [activeFilters, filters, bundleStats, t]);

    const removeFilterChip = (key: string) => {
        if (key === 'status') {
            setFilters((prev) => ({ ...prev, status: 'available' }));
            setActiveFilters((prev) => {
                const next = { ...prev } as VoucherQueryParams;
                delete next.status;
                return next;
            });
        } else if (key === 'bundle_id') {
            setFilters((prev) => ({ ...prev, bundle_id: undefined }));
            setActiveFilters((prev) => {
                const next = { ...prev } as VoucherQueryParams;
                delete next.bundle_id;
                return next;
            });
        } else if (key === 'provider') {
            setFilters((prev) => ({ ...prev, provider: '' }));
            setActiveFilters((prev) => {
                const next = { ...prev } as VoucherQueryParams;
                delete next.provider;
                return next;
            });
        }
    };

    const clearAllFilters = () => {
        setFilters({
            page: 1,
            items_per_page: 20,
            status: 'available',
            bundle_id: undefined,
            search: '',
            provider: '',
        });
        setActiveFilters({});
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchVoucherList({ ...filters, ...activeFilters, search: searchTag }) as any);
        dispatch(_fetchBundleStats());
        setRefreshing(false);
    };

    // ============================
    // Dialog Footers
    // ============================

    const deleteVoucherDialogFooter = (
        <>
            <PrimeButton
                label={t('APP.GENERAL.CANCEL')}
                icon="pi pi-times"
                severity="danger"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={hideDeleteVoucherDialog}
            />
            <PrimeButton
                label={t('FORM.GENERAL.SUBMIT')}
                icon="pi pi-check"
                severity="success"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={deleteVoucher}
            />
        </>
    );

    const deleteVouchersDialogFooter = (
        <>
            <PrimeButton
                label={t('APP.GENERAL.CANCEL')}
                icon="pi pi-times"
                severity="danger"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={hideDeleteVouchersDialog}
            />
            <PrimeButton
                label={t('FORM.GENERAL.SUBMIT')}
                icon="pi pi-check"
                severity="success"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={deleteSelectedVouchers}
            />
        </>
    );

    // ============================
    // Pagination
    // ============================

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        const itemsPerPage = event.rows;
        dispatch(_fetchVoucherList({ ...filters, page, items_per_page: itemsPerPage }));
    };

    // ============================
    // Helper Functions
    // ============================

    const getSelectedBundleStat = (bundleId: number | undefined): BundleStat | null => {
        if (!bundleId) return null;
        return bundleStats.find((b: BundleStat) => b.id === bundleId) || null;
    };

    // ============================
    // Render
    // ============================

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            {statisticsSummary()}
            <ListPage
                title={t('VOUCHER.TITLE', { defaultValue: 'ووچرها' })}
                description={t('VOUCHER.DESCRIPTION', { defaultValue: 'مدیریت کدهای ووچر و موجودی باندل' })}
                loading={loading}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <UiButton variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </UiButton>
                        <UiButton variant="outline" size="sm" onClick={openBulkImport}>
                            <Upload className="h-4 w-4" />
                            {t('VOUCHER.BULK_IMPORT')}
                        </UiButton>
                        {selectedVouchers && selectedVouchers.length > 0 ? (
                            <UiButton variant="destructive" size="sm" onClick={confirmDeleteSelected}>
                                <Trash2 className="h-4 w-4" />
                                {t('VOUCHER.TABLE.DELETE_SELECTED')}
                            </UiButton>
                        ) : null}
                        <UiButton size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('VOUCHER.TABLE.CREATEVOUCHER')}
                        </UiButton>
                    </div>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در ووچرها...' })}
                        chips={filterChips}
                        onRemoveChip={removeFilterChip}
                        onClearAll={clearAllFilters}
                        onOpenFilters={() => setFilterOpen(true)}
                    />
                }
                footer={
                    <Paginator
                        first={((pagination?.current_page || 1) - 1) * (pagination?.per_page || 20)}
                        rows={pagination?.per_page || 20}
                        totalRecords={pagination?.total || 0}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL()
                                ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                                : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}
                        firstPageLinkIcon={isRTL() ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'}
                        lastPageLinkIcon={isRTL() ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right'}
                    />
                }
            >
                    <DataTable
                        ref={dt}
                        value={vouchers}
                        selection={selectedVouchers}
                        onSelectionChange={(e) => setSelectedVouchers(e.value as any)}
                        dataKey="id"
                        className="datatable-responsive"
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        responsiveLayout="scroll"
                        paginator={false}
                        rows={pagination?.per_page || 20}
                        totalRecords={pagination?.total || 0}
                    >
                        <Column
                            selectionMode="multiple"
                            headerStyle={{ minWidth: '3rem' }}
                            style={{ ...customCellStyle, maxWidth: '3rem' }}
                        />
                        <Column
                            style={{
                                ...customCellStyle,
                                textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
                            }}
                            body={actionBodyTemplate}
                            header={t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                            headerStyle={{ minWidth: '4.5rem' }}
                        />
                        <Column
                            style={{
                                ...customCellStyle,
                                textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
                            }}
                            field="voucher_code"
                            header={t('VOUCHER.TABLE.COLUMN.CODE')}
                            body={voucherCodeBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}
                        />
                        <Column
                            style={{
                                ...customCellStyle,
                                textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
                            }}
                            field="bundle_title"
                            header={t('VOUCHER.TABLE.COLUMN.BUNDLE')}
                            body={bundleTitleBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}
                        />
                        <Column
                            style={{
                                ...customCellStyle,
                                textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
                            }}
                            field="company_name"
                            header={t('VOUCHER.TABLE.COLUMN.COMPANY')}
                            body={companyNameBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}
                        />
                        <Column
                            style={{
                                ...customCellStyle,
                                textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
                            }}
                            field="provider"
                            header={t('VOUCHER.TABLE.COLUMN.PROVIDER')}
                            body={providerBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}
                        />
                        <Column
                            style={{
                                ...customCellStyle,
                                textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
                            }}
                            field="status"
                            header={t('VOUCHER.TABLE.COLUMN.STATUS')}
                            body={statusBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}
                        />
                        <Column
                            style={{
                                ...customCellStyle,
                                textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
                            }}
                            field="expires_at"
                            header={t('VOUCHER.TABLE.COLUMN.EXPIRES')}
                            body={expiryDateBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}
                        />
                        <Column
                            style={{
                                ...customCellStyle,
                                textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
                            }}
                            field="notes"
                            header={t('VOUCHER.TABLE.COLUMN.NOTES')}
                            body={notesBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}
                        />
                        <Column
                            style={{
                                ...customCellStyle,
                                textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left',
                            }}
                            field="created_at"
                            header={t('TABLE.GENERAL.CREATEDAT')}
                            body={createdAtBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap', minWidth: '120px' }}
                        />
                    </DataTable>
            </ListPage>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side={isRTL() ? 'right' : 'left'} className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{t('ORDER.FILTER.FILTER', { defaultValue: 'فیلتر' })}</SheetTitle>
                        <SheetDescription>فیلترها روی نتایج سرور اعمال می‌شوند.</SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('VOUCHER.FILTER.STATUS')}</label>
                            <Dropdown
                                options={[
                                    { label: t('VOUCHER.STATUS.ALL'), value: 'all' },
                                    { label: t('VOUCHER.STATUS.AVAILABLE'), value: 'available' },
                                    { label: t('VOUCHER.STATUS.USED'), value: 'used' },
                                    { label: t('VOUCHER.STATUS.RESERVED'), value: 'reserved' },
                                    { label: t('VOUCHER.STATUS.EXPIRED'), value: 'expired' },
                                ]}
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.value })}
                                placeholder={t('VOUCHER.FILTER.SELECT_STATUS')}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('VOUCHER.FILTER.BUNDLE')}</label>
                            <Dropdown
                                options={bundleStats}
                                value={bundleStats.find((b: BundleStat) => b.id === filters.bundle_id) || null}
                                onChange={(e) => setFilters({ ...filters, bundle_id: e.value?.id })}
                                optionLabel="bundle_title"
                                placeholder={t('VOUCHER.FILTER.SELECT_BUNDLE')}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('VOUCHER.FILTER.PROVIDER')}</label>
                            <Input
                                value={filters.provider || ''}
                                onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
                                placeholder={t('VOUCHER.FILTER.ENTER_PROVIDER')}
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <UiButton type="button" variant="outline" onClick={clearAllFilters}>
                                {t('RESET')}
                            </UiButton>
                            <UiButton
                                type="button"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => {
                                    handleSubmitFilter(filters);
                                    setFilterOpen(false);
                                }}
                            >
                                {t('APPLY')}
                            </UiButton>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <FormSheet
                open={voucherDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="xl"
                side="left"
                title={voucher.id ? t('VOUCHER.EDIT') : t('VOUCHER.CREATE')}
                description={t('VOUCHER.FORM.SHEET_HINT', { defaultValue: 'کد، باندل و تاریخ انقضا را تکمیل کنید.' })}
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveVoucher}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('VOUCHER.FORM.CODE', { defaultValue: 'اطلاعات ووچر' })} description="کد و باندل">
                    <FormField
                        label={t('VOUCHER.FORM.CODE')}
                        required
                        fullWidth
                        error={submitted && !voucher.voucher_code ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="voucher_code"
                            value={voucher.voucher_code || ''}
                            onChange={(e) =>
                                setVoucher((prev) => ({
                                    ...prev,
                                    voucher_code: e.target.value
                                }))
                            }
                            autoFocus
                            placeholder={t('VOUCHER.FORM.ENTER_CODE')}
                            className={cn('w-full', submitted && !voucher.voucher_code && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('VOUCHER.FORM.BUNDLE')}
                        required
                        error={submitted && !voucher.bundle?.service?.id ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={getSelectedBundleStat(voucher.bundle?.service?.id)}
                            options={bundleStats}
                            onChange={(selectedBundle: BundleStat | null) => {
                                if (selectedBundle) {
                                    setVoucher((prev) => ({
                                        ...prev,
                                        bundle: {
                                            ...prev.bundle,
                                            service: {
                                                ...prev.bundle.service,
                                                id: selectedBundle.id,
                                                service_category_id: selectedBundle.service?.service_category_id || '',
                                                company_id: selectedBundle.service?.company_id || ''
                                            }
                                        },
                                        bundle_title: selectedBundle.bundle_title || '',
                                        company_name: selectedBundle.company_name || ''
                                    }));
                                }
                            }}
                            optionLabel="bundle_title"
                            placeholder={t('VOUCHER.FORM.SELECT_BUNDLE')}
                            error={submitted && !voucher.bundle?.service?.id}
                            returnFullObject
                            itemTemplate={(option) => (
                                <div className="flex flex-col gap-0.5 text-start">
                                    <span className="font-semibold">{option.bundle_title}</span>
                                    <div className="text-xs text-muted-foreground">
                                        {option.company_name} — {option.category_type}
                                    </div>
                                </div>
                            )}
                            valueTemplate={(option) => (
                                <div className="text-start">
                                    <span className="text-sm font-semibold">{option.bundle_title}</span>
                                    <div className="text-xs text-muted-foreground">{option.company_name}</div>
                                </div>
                            )}
                        />
                    </FormField>
                    <FormField label={t('VOUCHER.FORM.PROVIDER')}>
                        <Input
                            id="provider"
                            value={voucher.provider || ''}
                            onChange={(e) =>
                                setVoucher((prev) => ({
                                    ...prev,
                                    provider: e.target.value
                                }))
                            }
                            placeholder={t('VOUCHER.FORM.ENTER_PROVIDER')}
                            className="w-full"
                        />
                    </FormField>
                    <FormField
                        label={t('VOUCHER.FORM.EXPIRES_AT')}
                        required
                        fullWidth
                        error={submitted && !voucher.expires_at ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="expires_at"
                            type="datetime-local"
                            value={formatExpiresAtForInput(voucher.expires_at)}
                            onChange={(e) =>
                                setVoucher((prev) => ({
                                    ...prev,
                                    expires_at: formatExpiresAtFromInput(e.target.value)
                                }))
                            }
                            className={cn('w-full', submitted && !voucher.expires_at && 'border-rose-300')}
                        />
                    </FormField>
                </FormSection>
                <FormSection title={t('VOUCHER.FORM.NOTES', { defaultValue: 'یادداشت و متاداده' })}>
                    <FormField label={t('VOUCHER.FORM.NOTES')} fullWidth>
                        <Textarea
                            id="notes"
                            value={voucher.notes || ''}
                            onChange={(e) =>
                                setVoucher((prev) => ({
                                    ...prev,
                                    notes: e.target.value
                                }))
                            }
                            rows={3}
                            placeholder={t('VOUCHER.FORM.ENTER_NOTES')}
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('VOUCHER.FORM.METADATA')} fullWidth hint={t('VOUCHER.FORM.METADATA_HELP')}>
                        <Textarea
                            id="metadata"
                            value={voucher.metadata ? JSON.stringify(voucher.metadata, null, 2) : ''}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    setVoucher((prev) => ({
                                        ...prev,
                                        metadata: parsed
                                    }));
                                } catch {
                                    setVoucher((prev) => ({
                                        ...prev,
                                        metadata: e.target.value
                                    }));
                                }
                            }}
                            rows={3}
                            placeholder={t('VOUCHER.FORM.ENTER_METADATA_JSON')}
                            className="w-full font-mono text-xs"
                        />
                    </FormField>
                </FormSection>
                {voucher.id ? (
                    <FormSection title={t('VOUCHER.TABLE.COLUMN.STATUS')}>
                        <FormField label={t('VOUCHER.TABLE.COLUMN.STATUS')} fullWidth>
                            <Select
                                value={voucher.status || undefined}
                                onValueChange={(v) =>
                                    setVoucher((prev) => ({
                                        ...prev,
                                        status: v
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('VOUCHER.FORM.SELECT_STATUS')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">{t('VOUCHER.STATUS.AVAILABLE')}</SelectItem>
                                    <SelectItem value="used">{t('VOUCHER.STATUS.USED')}</SelectItem>
                                    <SelectItem value="reserved">{t('VOUCHER.STATUS.RESERVED')}</SelectItem>
                                    <SelectItem value="expired">{t('VOUCHER.STATUS.EXPIRED')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </FormSection>
                ) : null}
            </FormSheet>

            <FormSheet
                open={bulkImportDialog}
                onOpenChange={(open) => {
                    if (!open) hideBulkImportDialog();
                }}
                size="full"
                side="left"
                title={t('VOUCHER.BULK_IMPORT')}
                description={t('VOUCHER.BULK_IMPORT_HINT', { defaultValue: 'چند ووچر را با باندل مشترک به لیست اضافه و وارد کنید.' })}
                footer={
                    <FormActions
                        onCancel={hideBulkImportDialog}
                        onSubmit={submitBulkImport}
                        loading={bulkImport.loading}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('VOUCHER.IMPORT')}
                    />
                }
            >
                <FormSection title={t('VOUCHER.FORM.BUNDLE')} description="تنظیمات پیش‌فرض واردات">
                    <FormField label={t('VOUCHER.FORM.BUNDLE')} required error={!bulkImportData.bundle_id ? t('THIS_FIELD_IS_REQUIRED') : null}>
                        <SearchSelect
                            value={bundleStats.find((b: BundleStat) => b.id === bulkImportData.bundle_id) || null}
                            options={bundleStats}
                            onChange={(selectedBundle: BundleStat | null) => {
                                setBulkImportData((prev) => ({
                                    ...prev,
                                    bundle_id: selectedBundle?.id || 0
                                }));
                            }}
                            optionLabel="bundle_title"
                            placeholder={t('VOUCHER.FORM.SELECT_BUNDLE')}
                            returnFullObject
                            itemTemplate={(option) => (
                                <div className="flex flex-col gap-0.5 text-start">
                                    <span className="font-semibold">{option.bundle_title}</span>
                                    <div className="text-xs text-muted-foreground">
                                        {option.company_name} — {t('VOUCHER.AVAILABLE', { defaultValue: 'موجود' })}: {option.available}
                                    </div>
                                </div>
                            )}
                        />
                    </FormField>
                    <FormField label={t('VOUCHER.FORM.PROVIDER')}>
                        <Input
                            id="bulk_provider"
                            value={bulkImportData.provider}
                            onChange={(e) =>
                                setBulkImportData((prev) => ({
                                    ...prev,
                                    provider: e.target.value
                                }))
                            }
                            placeholder={t('VOUCHER.FORM.ENTER_PROVIDER')}
                            className="w-full"
                        />
                    </FormField>
                </FormSection>
                <FormSection title={t('VOUCHER.ADD_TO_LIST')} description="افزودن ردیف به لیست واردات">
                    <FormField label={t('VOUCHER.FORM.CODE')} required>
                        <Input
                            id="bulk_voucher_code"
                            value={bulkVoucherCode}
                            onChange={(e) => setBulkVoucherCode(e.target.value)}
                            placeholder={t('VOUCHER.FORM.ENTER_CODE')}
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('VOUCHER.FORM.EXPIRES_AT')} required>
                        <Input
                            id="bulk_expiry"
                            type="datetime-local"
                            value={bulkVoucherExpiry ? dateToDatetimeLocal(bulkVoucherExpiry) : ''}
                            onChange={(e) => setBulkVoucherExpiry(e.target.value ? new Date(e.target.value) : null)}
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('VOUCHER.FORM.NOTES')}>
                        <Input
                            id="bulk_notes"
                            value={bulkVoucherNotes}
                            onChange={(e) => setBulkVoucherNotes(e.target.value)}
                            placeholder={t('VOUCHER.FORM.ENTER_NOTES')}
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('VOUCHER.FORM.METADATA')}>
                        <Input
                            id="bulk_metadata"
                            value={bulkVoucherMetadata}
                            onChange={(e) => setBulkVoucherMetadata(e.target.value)}
                            placeholder={'{"region": "US"}'}
                            className="w-full"
                        />
                    </FormField>
                    <div className="sm:col-span-2 flex justify-end">
                        <UiButton type="button" variant="secondary" onClick={addBulkVoucher} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            {t('VOUCHER.ADD_TO_LIST')}
                        </UiButton>
                    </div>
                </FormSection>
                <FormSection title={`${t('VOUCHER.VOUCHERS_LIST')} (${bulkImportData.vouchers.length})`} className="sm:col-span-2">
                    <div className="sm:col-span-2">
                        {bulkImportData.vouchers.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-6 text-center text-sm text-muted-foreground">
                                {t('VOUCHER.NO_VOUCHERS_ADDED')}
                            </p>
                        ) : (
                            <div className="max-h-[300px] space-y-2 overflow-y-auto rounded-xl border border-emerald-100 bg-emerald-50/30 p-2">
                                {bulkImportData.vouchers.map((v, index) => (
                                    <div
                                        key={index}
                                        className="flex items-start justify-between gap-2 border-b border-emerald-100 pb-2 last:border-0"
                                    >
                                        <div className="min-w-0 text-start">
                                            <div className="text-sm font-semibold">{v.code}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {new Date(v.expires_at).toLocaleDateString('fa-IR')} —{' '}
                                                {v.notes || t('VOUCHER.NO_NOTES')}
                                            </div>
                                            {v.metadata ? (
                                                <div className="text-xs text-muted-foreground">{JSON.stringify(v.metadata)}</div>
                                            ) : null}
                                        </div>
                                        <UiButton
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            className="shrink-0 text-rose-600 hover:text-rose-700"
                                            onClick={() => removeBulkVoucher(index)}
                                            aria-label={t('APP.GENERAL.DELETE', { defaultValue: 'حذف' })}
                                        >
                                            <X className="h-4 w-4" />
                                        </UiButton>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </FormSection>
                {bulkImport.summary ? (
                    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-start">
                        <h3 className="text-sm font-semibold text-emerald-950">{t('VOUCHER.IMPORT_SUMMARY')}</h3>
                        <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                            <div>
                                <div className="text-muted-foreground">{t('VOUCHER.TOTAL')}</div>
                                <div className="font-bold tabular-nums">{bulkImport.summary.total}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">{t('VOUCHER.IMPORTED')}</div>
                                <div className="font-bold text-emerald-700 tabular-nums">{bulkImport.summary.imported}</div>
                            </div>
                            <div>
                                <div className="text-muted-foreground">{t('VOUCHER.FAILED')}</div>
                                <div className="font-bold text-rose-600 tabular-nums">{bulkImport.summary.failed}</div>
                            </div>
                        </div>
                        {bulkImport.summary.errors?.length ? (
                            <div className="mt-3 space-y-1">
                                <div className="text-xs font-semibold text-rose-600">{t('VOUCHER.ERRORS')}</div>
                                {bulkImport.summary.errors.map((err: { index: number; code: string; error: string }, idx: number) => (
                                    <div key={idx} className="text-xs text-rose-500">
                                        #{err.index + 1}: {err.code} — {err.error}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </section>
                ) : null}
            </FormSheet>

                    {/* ============================
                        Delete Confirmation Dialogs
                        ============================ */}
                    <Dialog
                        visible={deleteVoucherDialog}
                        style={{ width: '450px' }}
                        header={t('TABLE.GENERAL.CONFIRM')}
                        modal
                        footer={deleteVoucherDialogFooter}
                        onHide={hideDeleteVoucherDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mx-3"
                                style={{ fontSize: '2rem', color: 'red' }}
                            />
                            {voucher && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')}{' '}
                                    <b>{voucher.voucher_code}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteVouchersDialog}
                        style={{ width: '450px' }}
                        header={t('TABLE.GENERAL.CONFIRM')}
                        modal
                        footer={deleteVouchersDialogFooter}
                        onHide={hideDeleteVouchersDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i
                                className="pi pi-exclamation-triangle mx-3"
                                style={{ fontSize: '2rem', color: 'red' }}
                            />
                            {selectedVouchers && (
                                <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>
                            )}
                        </div>
                    </Dialog>
        </div>
    );
};

export default withAuth(VoucherPage);
