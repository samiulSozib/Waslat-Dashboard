/* eslint-disable @next/next/no-img-element */
'use client';
import { _addBundle, _deleteBundle, _editBundle, _fetchBundleList } from '@/app/redux/actions/bundleActions';
import { _fetchCompanies } from '@/app/redux/actions/companyActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _deleteSelectedTransactions, _fetchMoneyTransactionsList } from '@/app/redux/actions/moneyTransactionsActions';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { _fetchServiceCategories } from '@/app/redux/actions/serviceCategoryActions';
import { AppDispatch } from '@/app/redux/store';
import { Bundle, MoneyTransaction } from '@/types/interface';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { generateTransactionExcelFile } from '../../utilities/generateExcel';
import { isRTL } from '../../utilities/rtlUtil';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FilterField, FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { Button as UiButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

type TransactionFilters = {
    filter_transactiontype: string | null;
    filter_transactioncategory: string | null;
    filter_transactionpurpose: string | null;
    filter_startdate: string | null;
    filter_enddate: string | null;
};

const emptyTransactionFilters: TransactionFilters = {
    filter_transactiontype: null,
    filter_transactioncategory: null,
    filter_transactionpurpose: null,
    filter_startdate: null,
    filter_enddate: null
};

function compactTransactionFilters(filters: TransactionFilters) {
    const out: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') out[key] = value as string;
    });
    return out;
}

const TransactionPage = () => {
    let emptyBundle: Bundle = {
        id: 0,
        bundle_code: '',
        service_id: 0,
        bundle_title: '',
        bundle_description: '',
        bundle_type: '',
        validity_type: '',
        admin_buying_price: '',
        buying_price: '',
        selling_price: '',
        amount: '',
        bundle_image_url: '',
        currency_id: 0,
        expired_date: '',
        deleted_at: '',
        created_at: '',
        updated_at: '',
        service: null,
        currency: null
    };

    const [serviceDialog, setServiceDialog] = useState(false);
    const [deleteServiceDialog, setDeleteServiceDialog] = useState(false);
    const [deleteServicesDialog, setDeleteServicesDialog] = useState(false);
    const [bundle, setBundle] = useState<Bundle>(emptyBundle);
    const [selectedTransactions, setSelectedTransactions] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { transactions, loading, pagination } = useSelector((state: any) => state.moneyTransactionReducer);
    const { t } = useTranslation();
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [filterOpen, setFilterOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState<TransactionFilters>(emptyTransactionFilters);

    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
    const [filters, setFilters] = useState({
        filter_transactiontype: null as string | null,
        filter_transactioncategory: null as string | null,
        filter_transactionpurpose: null as string | null,
        filter_startdate: null as string | null,
        filter_enddate: null as string | null
    });
    const [activeFilters, setActiveFilters] = useState<TransactionFilters>(emptyTransactionFilters);
    const [refreshing, setRefreshing] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(_fetchMoneyTransactionsList(1, searchTag, activeFilters));
        dispatch(_fetchBundleList());
        dispatch(_fetchCurrencies());
        dispatch(_fetchServiceList());
        dispatch(_fetchCompanies());
        dispatch(_fetchServiceCategories());
    }, [dispatch, searchTag, activeFilters]);

    // Add this useEffect for click outside detection
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('.p-dropdown-panel')) return;
            if (filterDialogVisible && filterRef.current && !filterRef.current.contains(target)) {
                setFilterDialogVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [filterDialogVisible]);

    useEffect(() => {
        //console.log(transactions)
    }, [dispatch, transactions]);

    const openNew = () => {
        setBundle(emptyBundle);
        setSubmitted(false);
        setServiceDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setServiceDialog(false);
    };

    const hideDeleteServiceDialog = () => {
        setDeleteServiceDialog(false);
    };

    const hideDeleteServicesDialog = () => {
        setDeleteServicesDialog(false);
    };

    const saveService = () => {
        setSubmitted(true);
        if (bundle.id && bundle.id !== 0) {
            dispatch(_editBundle(bundle.id, bundle, toast, t));
        } else {
            dispatch(_addBundle(bundle, toast, t));
        }

        setServiceDialog(false);
        setBundle(emptyBundle);
    };

    const editService = (bundle: Bundle) => {
        setBundle({ ...bundle });

        setServiceDialog(true);
    };

    const confirmDeleteService = (bundle: Bundle) => {
        setBundle(bundle);
        setDeleteServiceDialog(true);
    };

    const deleteService = () => {
        if (!bundle?.id) {
            console.error('Service ID is undefined.');
            return;
        }
        dispatch(_deleteBundle(bundle?.id, toast, t));
        setDeleteServiceDialog(false);
    };

    const confirmDeleteSelected = () => {
        if (!selectedTransactions || (selectedTransactions as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('VALIDATION_WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteServicesDialog(true);
    };

    const deleteSelectedTransactions = async () => {
        if (!selectedTransactions || (selectedTransactions as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        const selectedIds = (selectedTransactions as MoneyTransaction[]).map((transaction) => transaction.id);

        await _deleteSelectedTransactions(selectedIds, toast, t);
        dispatch(_fetchMoneyTransactionsList());

        setSelectedTransactions(null);
        setDeleteServicesDialog(false);
    };

    const chips = useMemo(() => {
        const list: { key: string; label: string }[] = [];
        if (activeFilters.filter_transactiontype) {
            list.push({
                key: 'filter_transactiontype',
                label: `${t('TRANSACTION.TABLE.COLUMN.TYPE')}: ${activeFilters.filter_transactiontype === 'credit' ? t('CREDIT') : t('DEBIT')}`
            });
        }
        if (activeFilters.filter_transactioncategory) {
            list.push({ key: 'filter_transactioncategory', label: `${t('TRANSACTION.TABLE.COLUMN.CATEGORY')}: ${activeFilters.filter_transactioncategory}` });
        }
        if (activeFilters.filter_transactionpurpose) {
            list.push({ key: 'filter_transactionpurpose', label: `${t('TRANSACTION.TABLE.COLUMN.PURPOSE')}: ${activeFilters.filter_transactionpurpose}` });
        }
        if (activeFilters.filter_startdate) {
            list.push({ key: 'filter_startdate', label: `${t('START_DATE', { defaultValue: 'از تاریخ' })}: ${activeFilters.filter_startdate}` });
        }
        if (activeFilters.filter_enddate) {
            list.push({ key: 'filter_enddate', label: `${t('END_DATE', { defaultValue: 'تا تاریخ' })}: ${activeFilters.filter_enddate}` });
        }
        return list;
    }, [activeFilters, t]);

    const applyFilters = () => {
        setActiveFilters(draftFilters);
        setFilterOpen(false);
    };

    const clearFilters = () => {
        setDraftFilters(emptyTransactionFilters);
        setActiveFilters(emptyTransactionFilters);
        setFilterOpen(false);
    };

    const removeChip = (key: string) => {
        const next = { ...activeFilters, [key]: null } as TransactionFilters;
        setActiveFilters(next);
        setDraftFilters(next);
    };

    const isOrderStatusValid = (row: MoneyTransaction) => row.order?.status === 1 || row.order?.status === '1';

    const transactionStatusVariant = (status?: string | null): 'success' | 'danger' | 'muted' => {
        if (status === 'credit') return 'success';
        if (status === 'debit') return 'danger';
        return 'muted';
    };

    const transactionStatusLabel = (row: MoneyTransaction) => {
        if (row.status === 'credit') return `${t('CREDIT', { defaultValue: 'واریز' })} → ${row.initiator_type || ''}`;
        if (row.status === 'debit') return `${t('DEBIT', { defaultValue: 'برداشت' })} ← ${row.initiator_type || ''}`;
        return t('UNKNOWN', { defaultValue: 'نامشخص' });
    };

    const formatTransactionDate = (value?: string) => {
        if (!value) return '—';
        try {
            return new Date(value).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
        } catch {
            return value;
        }
    };

    const capitalizeInitiator = (text: string | null) => {
        if (!text) return '—';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 20)));

    const onPageChange = (page: number) => {
        dispatch(_fetchMoneyTransactionsList(page, searchTag, compactTransactionFilters(activeFilters)));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchMoneyTransactionsList(pagination?.page || 1, searchTag, compactTransactionFilters(activeFilters)) as any);
        setRefreshing(false);
    };

    const exportToExcel = async () => {
        await generateTransactionExcelFile({
            transactions,
            t,
            toast,
            all: true
        });
    };

    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteServicesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedTransactions} />
        </>
    );

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.MONEYTRANSACTIONS', { defaultValue: 'تراکنش‌های مالی' })}
                description={t('TRANSACTION.PAGE.DESCRIPTION', { defaultValue: 'گزارش تراکنش‌های اعتبار و بدهی نمایندگان' })}
                loading={loading}
                actions={
                    <>
                        <UiButton variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </UiButton>
                        <UiButton variant="outline" size="sm" onClick={exportToExcel}>
                            <Download className="h-4 w-4" />
                            {t('EXPORT.EXPORT', { defaultValue: 'خروجی اکسل' })}
                        </UiButton>
                    </>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در تراکنش‌ها...' })}
                        chips={chips}
                        onRemoveChip={removeChip}
                        onClearAll={clearFilters}
                        onOpenFilters={() => {
                            setDraftFilters(activeFilters);
                            setFilterOpen(true);
                        }}
                    />
                }
                footer={
                    <div className="flex flex-col gap-2 border-t border-emerald-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">
                            {t('DATA_TABLE.TABLE.PAGINATOR.SHOWING', { defaultValue: 'صفحه' })}{' '}
                            {pagination?.page || 1} / {totalPages} · {pagination?.total || 0}
                        </div>
                        <div className="flex items-center gap-2">
                            <UiButton variant="outline" size="sm" disabled={(pagination?.page || 1) <= 1} onClick={() => onPageChange((pagination?.page || 1) - 1)}>
                                قبلی
                            </UiButton>
                            <UiButton variant="outline" size="sm" disabled={(pagination?.page || 1) >= totalPages} onClick={() => onPageChange((pagination?.page || 1) + 1)}>
                                بعدی
                            </UiButton>
                        </div>
                    </div>
                }
            >
                <table className="w-full min-w-[1400px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('TRANSACTION.TABLE.COLUMN.RESELLERNAME')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('TRANSACTION.TABLE.COLUMN.AMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('TRANSACTION.TABLE.COLUMN.CURRENCY')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('TRANSACTION.TABLE.COLUMN.REMAININGBALANCE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('TRANSACTION.TABLE.COLUMN.BUNDLETITLE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('RECHARGEABLE_ACCOUNT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('TRANSACTION.TABLE.COLUMN.TRANSACTIONEDDATE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('TRANSACTION.TABLE.COLUMN.STATUS')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('TRANSACTION.TABLE.COLUMN.INITIATORTYPE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950 max-w-[12rem]">{t('TRANSACTION.TABLE.COLUMN.DESCRIPTION')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(transactions || []).length === 0 ? (
                            <tr>
                                <td colSpan={10} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (transactions || []).map((row: MoneyTransaction) => (
                                <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                    <td className="px-2 py-1.5 text-start">{row.reseller?.reseller_name || '—'}</td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.amount ?? '—'}</td>
                                    <td className="px-2 py-1.5">{row?.reseller?.user?.currency?.code || '—'}</td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.remaining_balance ?? '—'}</td>
                                    <td className="px-2 py-1.5 text-start">{isOrderStatusValid(row) ? row.order?.bundle?.bundle_title || '—' : 'X'}</td>
                                    <td className="px-2 py-1.5">{isOrderStatusValid(row) ? row.order?.rechargeble_account || '—' : 'X'}</td>
                                    <td className="px-2 py-1.5 whitespace-nowrap tabular-nums text-muted-foreground">{formatTransactionDate(row.created_at)}</td>
                                    <td className="px-2 py-1.5">
                                        <Badge variant={transactionStatusVariant(row.status)} className="text-[10px]">
                                            {transactionStatusLabel(row)}
                                        </Badge>
                                    </td>
                                    <td className="px-2 py-1.5 text-start">{capitalizeInitiator(row.initiator_type)}</td>
                                    <td className="max-w-[12rem] truncate px-2 py-1.5 text-start text-muted-foreground" title={row.transaction_reason || ''}>
                                        {row.transaction_reason || '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </ListPage>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side="left" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{t('FILTER', { defaultValue: 'فیلتر تراکنش‌ها' })}</SheetTitle>
                        <SheetDescription>{t('TRANSACTION.FILTER.HINT', { defaultValue: 'فیلترها روی نتایج سرور اعمال می‌شوند.' })}</SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <FilterField label={t('TRANSACTION.TABLE.COLUMN.TYPE')}>
                            <Select
                                value={draftFilters.filter_transactiontype || undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_transactiontype: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_TYPE', { defaultValue: 'نوع تراکنش' })} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit">{t('CREDIT')}</SelectItem>
                                    <SelectItem value="debit">{t('DEBIT')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>
                        <FilterField label={t('TRANSACTION.TABLE.COLUMN.CATEGORY')}>
                            <Select
                                value={draftFilters.filter_transactioncategory || undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_transactioncategory: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_CATEGORY', { defaultValue: 'دسته' })} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin-reseller">{t('ADMIN_TO_RESELLER')}</SelectItem>
                                    <SelectItem value="reseller-subreseller">{t('RESELLER_TO_SUBRESELLER')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>
                        <FilterField label={t('TRANSACTION.TABLE.COLUMN.PURPOSE')}>
                            <Select
                                value={draftFilters.filter_transactionpurpose || undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_transactionpurpose: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_PURPOSE', { defaultValue: 'هدف' })} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="order">{t('FILTER.ORDER')}</SelectItem>
                                    <SelectItem value="money">{t('MONEY_TRANSFER')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>
                        <FilterField label={t('START_DATE', { defaultValue: 'از تاریخ' })}>
                            <Input
                                type="date"
                                value={draftFilters.filter_startdate || ''}
                                onChange={(e) => setDraftFilters((p) => ({ ...p, filter_startdate: e.target.value || null }))}
                            />
                        </FilterField>
                        <FilterField label={t('END_DATE', { defaultValue: 'تا تاریخ' })}>
                            <Input
                                type="date"
                                value={draftFilters.filter_enddate || ''}
                                onChange={(e) => setDraftFilters((p) => ({ ...p, filter_enddate: e.target.value || null }))}
                            />
                        </FilterField>
                        <div className="flex gap-2 pt-2">
                            <UiButton className="flex-1" onClick={applyFilters}>
                                {t('APPLY', { defaultValue: 'اعمال' })}
                            </UiButton>
                            <UiButton className="flex-1" variant="secondary" onClick={clearFilters}>
                                {t('RESET', { defaultValue: 'بازنشانی' })}
                            </UiButton>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <Dialog visible={deleteServicesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteServicesDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                    {<span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                </div>
            </Dialog>
        </div>
    );
};


export default withAuth(TransactionPage);
