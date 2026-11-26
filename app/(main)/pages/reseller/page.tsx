/* eslint-disable @next/next/no-img-element */
'use client';
import { Button as PrimeButton } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Country, Currency, District, Province, Reseller, ResellerGroup } from '@/types/interface';
import { _addReseller, _changeResellerStatus, _deleteReseller, _editReseller, _fetchResellers, _getResellerById } from '@/app/redux/actions/resellerActions';
import { _fetchDistricts } from '@/app/redux/actions/districtActions';
import { _fetchProvinces } from '@/app/redux/actions/provinceActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { resellerGroupReducer } from '@/app/redux/reducers/resellerGroupReducer';
import { _fetchResellerGroups } from '@/app/redux/actions/resellerGroupActions';
import { useRouter, useSearchParams } from 'next/navigation';
import { isRTL } from '../../utilities/rtlUtil';
import { generateSubResellerExcelFile } from '../../utilities/generateExcel';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FilterField, FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { RowActions } from '@/components/admin/row-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchSelect } from '@/components/admin/search-select';
import { FileDrop } from '@/components/ui/file-drop';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { PasswordInput } from '@/components/ui/password-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { Check, Download, Eye, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';

type ResellerFilters = {
    filter_status: string | null;
    filter_startdate: string | null;
    filter_enddate: string | null;
    filter_has_loan: string | null;
};

const emptyResellerFilters: ResellerFilters = {
    filter_status: null,
    filter_startdate: null,
    filter_enddate: null,
    filter_has_loan: null
};

const ResellerPage = () => {
    const emptyReseller: Reseller = {
        id: 0,
        user_id: 0,
        parent_id: null,
        uuid: '',
        reseller_name: '',
        contact_name: '',
        reseller_type: '',
        email_verified_at: null,
        account_password: '',
        personal_pin: '',
        remember_token: null,
        profile_image_url: '',
        email: '',
        phone: '',
        country_id: 0,
        province_id: 0,
        districts_id: 0,
        is_reseller_verified: 0,
        status: 0,
        payment: '0.00000',
        balance: 0,
        loan_balance: '0.00000',
        total_payments_received: '0.00000',
        total_balance_sent: '0.00000',
        net_payment_balance: '0.00000',
        fcm_token: null,
        created_at: '',
        updated_at: '',
        deleted_at: null,
        user: null,
        code: null,
        country: '',
        province: '',
        district: '',
        reseller_group_id: 0,
        can_create_sub_resellers: 0,
        sub_reseller_limit: 0,
        sub_resellers_can_create_sub_resellers: 0,
        can_set_commission_group: false,
        can_set_selling_price_group: false,
        can_send_payment_request: false,
        can_ask_loan_balance: false,
        can_see_our_contact: false,
        can_see_parent_contact: false,
        can_send_hawala: false,
        max_loan_balance_request_amount: 0,
        min_loan_balance_request_amount: 0,
        reseller_identity_attachment: '',
        extra_optional_proof: '',
        afg_custom_recharge_adjust_type: 'decrease',
        afg_custom_recharge_adjust_mode: 'fixed',
        afg_custom_recharge_adjust_value: 0
    };

    const [resellerDialog, setResellerDialog] = useState(false);
    const [deleteResellerDialog, setDeleteResellerDialog] = useState(false);
    const [deleteResellersDialog, setDeleteResellersDialog] = useState(false);
    const [statusResellerDialog, setStatusResellerDialog] = useState(false);
    const [reseller, setReseller] = useState<Reseller>(emptyReseller);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { resellers, loading, pagination, singleReseller } = useSelector((state: any) => state.resellerReducer);
    const { countries } = useSelector((state: any) => state.countriesReducer);
    const { districts } = useSelector((state: any) => state.districtReducer);
    const { provinces } = useSelector((state: any) => state.provinceReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { reseller_groups } = useSelector((state: any) => state.resellerGroupReducer);
    const { t } = useTranslation();
    const router = useRouter();
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [filterOpen, setFilterOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState<ResellerFilters>(emptyResellerFilters);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(_fetchResellers(1, searchTag, activeFilters));
        // dispatch(_fetchCountries());
        // dispatch(_fetchDistricts());
        // dispatch(_fetchProvinces());
        // dispatch(_fetchCurrencies());
        // dispatch(_fetchResellerGroups());
    }, [dispatch, searchTag, activeFilters]);

useEffect(() => {
    if (resellerDialog) {
        // Fetch all required data for dropdowns
        dispatch(_fetchCountries());
        dispatch(_fetchDistricts());
        dispatch(_fetchProvinces());
        dispatch(_fetchCurrencies());
        dispatch(_fetchResellerGroups());
    }
}, [resellerDialog, dispatch]);

    useEffect(() => {
        //console.log(resellers)
    }, [dispatch, resellers]);

    // Add this useEffect to handle auto-opening the dialog
    const searchParams = useSearchParams(); // Add this

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            // Small delay to ensure the page is fully loaded and Redux state is ready
            const timer = setTimeout(() => {
                openNew();
                // Optional: Clean up the URL after opening the dialog
                router.replace('/pages/reseller');
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);



    const openNew = () => {
        setReseller(emptyReseller);
        setSubmitted(false);
        setResellerDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setResellerDialog(false);
    };

    const hideDeleteResellerDialog = () => {
        setDeleteResellerDialog(false);
    };

    const hideStatusResellerDialog = () => {
        setStatusResellerDialog(false);
    };

    const hideDeleteResellersDialog = () => {
        setDeleteResellersDialog(false);
    };

    const saveReseller = () => {
        setSubmitted(true);
        //console.log(reseller);
        //return;
        if (
            !reseller.reseller_name ||
            !reseller.contact_name ||
            !reseller.email ||
            !reseller.phone ||
            !reseller.account_password ||
            !reseller.country_id ||
            !reseller.province_id ||
            !reseller.districts_id ||
            !reseller.code ||
            !reseller.sub_reseller_limit
        ) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (reseller.id && reseller.id !== 0) {
            dispatch(_editReseller(reseller.id, reseller, toast, t));
        } else {
            dispatch(_addReseller(reseller, toast, t));
        }

        setResellerDialog(false);
        setReseller(emptyReseller);
        setSubmitted(false);
    };

    const editReseller = (reseller: Reseller) => {
        const matchingProvince = provinces.find((r: any) => r.id == reseller.province_id);

        // Type-safe boolean conversion function
        const toBoolean = (value: boolean | string | number | undefined): boolean => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') return value === '1';
            if (typeof value === 'number') return value === 1;
            return false; // default for undefined
        };

        // Type-safe number conversion function (for 1/0 fields)
        const toBinaryNumber = (value: number | string | undefined): number => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return value === '1' ? 1 : 0;
            return 0; // default for undefined
        };

        setReseller({
            ...reseller,
            country_id: parseInt(reseller.country_id?.toString() || '0'),
            province: matchingProvince,
            province_id: parseInt(reseller.province_id?.toString() || '0'),
            districts_id: parseInt(reseller.districts_id?.toString() || '0'),
            reseller_group_id: parseInt(reseller.reseller_group_id?.toString() || '0'),

            // Boolean fields
            can_set_commission_group: toBoolean(reseller.can_set_commission_group),
            can_set_selling_price_group: toBoolean(reseller.can_set_selling_price_group),
            can_send_payment_request: toBoolean(reseller.can_send_payment_request),
            can_ask_loan_balance: toBoolean(reseller.can_ask_loan_balance),
            can_see_our_contact: toBoolean(reseller.can_see_our_contact),
            can_see_parent_contact: toBoolean(reseller.can_see_parent_contact),
            can_send_hawala: toBoolean(reseller.can_send_hawala),

            // Number fields (1/0)
            can_create_sub_resellers: toBinaryNumber(reseller.can_create_sub_resellers),
            sub_resellers_can_create_sub_resellers: toBinaryNumber(reseller.sub_resellers_can_create_sub_resellers)
        });

        setResellerDialog(true);
    };

    const confirmDeleteReseller = (reseller: Reseller) => {
        setReseller(reseller);
        setDeleteResellerDialog(true);
    };

    const deleteReseller = () => {
        if (!reseller?.id) {
            console.error('Reseller ID is undefined.');
            return;
        }
        dispatch(_deleteReseller(reseller?.id, toast, t));
        setDeleteResellerDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteResellersDialog(true);
    };

    const confirmChangeStatus = (reseller: Reseller) => {
        setReseller(reseller);
        setStatusResellerDialog(true);
    };

    const changeResellerStatus = () => {
        if (!reseller?.id) {
            console.error('Reseller ID is undefined.');
            return;
        }
        dispatch(_changeResellerStatus(reseller?.id, reseller.status, toast, t));
        setStatusResellerDialog(false);
    };

    const viewResellerDetails = (resellerId: string | number) => {
        //dispatch(_getResellerById(reseller.id))
        router.push(`/pages/reseller/${resellerId}`);
    };

    useEffect(() => {
        //console.log(singleReseller)
    }, [dispatch, singleReseller]);

    const resellerStatusLabel = (status: number) =>
        status === 1 ? t('TABLE.GENERAL.ACTIVATE', { defaultValue: 'فعال' }) : t('TABLE.GENERAL.DEACTIVATE', { defaultValue: 'غیرفعال' });

    const getAvailablePayment = (rowData: Reseller) => {
        const totalPayments = Number(rowData?.total_payments_received) || 0;
        const totalBalance = Number(rowData?.total_balance_sent) || 0;
        const amount = totalPayments - totalBalance;
        return amount > 0 ? amount : 0;
    };

    const getLoanAmount = (rowData: Reseller) => {
        const total_payments_received = Number(rowData.total_payments_received);
        const total_balance_sent = Number(rowData.total_balance_sent);
        const loanAmount = total_balance_sent - total_payments_received;
        return loanAmount > 0 ? loanAmount : 0;
    };

    const getPreferredCurrency = (rowData: Reseller) => {
        const currency = typeof rowData.code === 'object' && rowData.code !== null ? rowData.code.code : rowData.code;
        return currency || '—';
    };

    const resellerRowActions = (rowData: Reseller) => [
        {
            label: t('TABLE.GENERAL.EDIT'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => editReseller(rowData)
        },
        {
            label: t('VIEW_DETAILS'),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => viewResellerDetails(rowData.id)
        },
        {
            label: t('ACTIVATE'),
            icon: <Check className="h-4 w-4" />,
            onClick: () => confirmChangeStatus(rowData),
            hidden: rowData.status !== 0
        },
        {
            label: t('DEACTIVATE'),
            icon: <X className="h-4 w-4" />,
            onClick: () => confirmChangeStatus(rowData),
            hidden: rowData.status !== 1
        },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDeleteReseller(rowData),
            danger: true,
            separatorBefore: true
        }
    ];

    const handleSubmitFilter = (filters: ResellerFilters | Record<string, string | null>) => {
        const cleanedFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== null && value !== '')
        ) as Record<string, string>;
        setActiveFilters(cleanedFilters);
    };

    const filterChips = useMemo(() => {
        const list: { key: string; label: string }[] = [];
        if (activeFilters.filter_status) {
            list.push({
                key: 'filter_status',
                label: `وضعیت: ${activeFilters.filter_status === '1' ? t('TABLE.GENERAL.ACTIVATE', { defaultValue: 'فعال' }) : t('TABLE.GENERAL.DEACTIVATE', { defaultValue: 'غیرفعال' })}`
            });
        }
        if (activeFilters.filter_startdate) list.push({ key: 'filter_startdate', label: `از: ${activeFilters.filter_startdate}` });
        if (activeFilters.filter_enddate) list.push({ key: 'filter_enddate', label: `تا: ${activeFilters.filter_enddate}` });
        if (activeFilters.filter_has_loan) {
            list.push({ key: 'filter_has_loan', label: `وام: ${activeFilters.filter_has_loan}` });
        }
        return list;
    }, [activeFilters, t]);

    const applyFilters = () => {
        handleSubmitFilter(draftFilters);
        setFilterOpen(false);
    };

    const clearAllFilters = () => {
        setDraftFilters(emptyResellerFilters);
        setActiveFilters({});
        setFilterOpen(false);
    };

    const removeFilterChip = (key: string) => {
        const nextDraft = { ...draftFilters, [key]: null } as ResellerFilters;
        setDraftFilters(nextDraft);
        handleSubmitFilter(nextDraft);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchResellers(pagination?.page || 1, searchTag, activeFilters) as any);
        setRefreshing(false);
    };

    const isResellerEdit = Boolean(reseller.id && reseller.id !== 0);

    const deleteResellerDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteResellerDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={deleteReseller} />
        </>
    );

    const statusResellerDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideStatusResellerDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={changeResellerStatus} />
        </>
    );
    const deleteResellersDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteResellersDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    const onPageChange = (page: number) => {
        dispatch(_fetchResellers(page, searchTag, activeFilters));
    };

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 20)));

    useEffect(() => {
        if (resellerDialog) {
            const selectedCode = currencies.find((currency: Currency) => currency.code == reseller?.code);

            if (selectedCode) {
                setReseller((prev) => ({
                    ...prev,
                    code: selectedCode // Update with the selected company object
                }));
            }
        }
    }, [reseller.code, currencies, resellerDialog]);

    const [filteredProvinces, setFilteredProvinces] = useState<Province[]>([]);

    useEffect(() => {
        if (reseller?.country_id && provinces.length > 0) {
            const filtered = provinces.filter((province: Province) => province.country_id == reseller.country_id);
            setFilteredProvinces(filtered);
        } else {
            setFilteredProvinces([]); // Optional: Clear when no country selected
        }
    }, [reseller?.country_id, provinces]);

    const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);

    useEffect(() => {
        if (reseller?.province_id && districts.length > 0) {
            const filtered = districts.filter((district: District) => district.province_id == reseller.province_id);
            setFilteredDistricts(filtered);
        } else {
            setFilteredDistricts([]); // Optional: Clear when no country selected
        }
    }, [reseller?.province_id, districts]);



    const exportToExcel = async () => {
        await generateSubResellerExcelFile({
            t,
            toast,
            all: true
        });
    };

    return (
        <div className="space-y-4">
            <Toast ref={toast} />

            <ListPage
                title={t('MENU.RESELLER', { defaultValue: 'فروشندگان' })}
                description="مدیریت فروشندگان، موجودی و دسترسی‌ها"
                loading={loading}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToExcel}>
                            <Download className="h-4 w-4" />
                            {t('EXPORT.EXPORT', { defaultValue: 'خروجی اکسل' })}
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('ADD', { defaultValue: 'افزودن' })}
                        </Button>
                    </div>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در فروشندگان...' })}
                        chips={filterChips}
                        onRemoveChip={removeFilterChip}
                        onClearAll={clearAllFilters}
                        onOpenFilters={() => {
                            setDraftFilters({
                                filter_status: activeFilters.filter_status ?? null,
                                filter_startdate: activeFilters.filter_startdate ?? null,
                                filter_enddate: activeFilters.filter_enddate ?? null,
                                filter_has_loan: activeFilters.filter_has_loan ?? null
                            });
                            setFilterOpen(true);
                        }}
                    />
                }
                footer={
                    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">
                            صفحه {pagination?.page || 1} از {totalPages} · مجموع {pagination?.total || 0}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={(pagination?.page || 1) <= 1} onClick={() => onPageChange((pagination?.page || 1) - 1)}>
                                قبلی
                            </Button>
                            <Button variant="outline" size="sm" disabled={(pagination?.page || 1) >= totalPages} onClick={() => onPageChange((pagination?.page || 1) + 1)}>
                                بعدی
                            </Button>
                        </div>
                    </div>
                }
            >
                <table className="w-full min-w-[1200px] border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/40 text-start">
                            <th className="w-12 whitespace-nowrap px-2 py-2 font-semibold">عملیات</th>
                            <th className="min-w-[14rem] whitespace-nowrap px-2 py-2 font-semibold">{t('RESELLER.TABLE.COLUMN.RESELLERNAME')}</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">{t('RESELLER.TABLE.COLUMN.PHONE')}</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">{t('TOTAL_EARNING_BALANCE')}</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">{t('MENU.BALANCE')}</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">{t('RESELLER.TABLE.COLUMN.AVAILABLEPAYMENT')}</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">{t('RESELLER.TABLE.COLUMN.PAYMENT')}</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">{t('RESELLER.TABLE.COLUMN.TOTAL_BALANCE')}</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">{t('RESELLER.TABLE.COLUMN.LOANAMOUNT')}</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">{t('MENU.CURRENCY')}</th>
                            <th className="min-w-[10rem] whitespace-nowrap px-2 py-2 font-semibold">{t('PARENT_RESELLER_NAME')}</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">{t('RESELLER.TABLE.COLUMN.COUNTRY')}</th>
                            <th className="whitespace-nowrap px-2 py-2 font-semibold">{t('BUNDLE.TABLE.FILTER.STATUS')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(resellers || []).length === 0 ? (
                            <tr>
                                <td colSpan={13} className="px-3 py-16 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (resellers || []).map((row: Reseller) => (
                                <tr
                                    key={row.id}
                                    className="cursor-pointer border-b border-border/70 transition-colors hover:bg-emerald-50/50"
                                    onClick={() => viewResellerDetails(row.id)}
                                >
                                    <td className="px-2 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
                                        <RowActions items={resellerRowActions(row)} />
                                    </td>
                                    <td className="px-2 py-1.5 align-middle">
                                        <div className="flex items-center gap-2 text-start">
                                            <img
                                                src={`${row.profile_image_url}`}
                                                alt={row.reseller_name}
                                                className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border"
                                            />
                                            <div className="min-w-0">
                                                <div className="truncate text-xs font-semibold text-foreground">{row.email}</div>
                                                <div className="truncate text-muted-foreground">{row.reseller_name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-1.5 align-middle tabular-nums">{row.phone}</td>
                                    <td className="px-2 py-1.5 align-middle tabular-nums">{row.total_earning_balance}</td>
                                    <td className="px-2 py-1.5 align-middle tabular-nums text-emerald-700">{row.balance}</td>
                                    <td className="px-2 py-1.5 align-middle tabular-nums">{getAvailablePayment(row)}</td>
                                    <td className="px-2 py-1.5 align-middle tabular-nums">{row.total_payments_received}</td>
                                    <td className="px-2 py-1.5 align-middle tabular-nums">{row.total_balance_sent}</td>
                                    <td className="px-2 py-1.5 align-middle tabular-nums text-destructive">{getLoanAmount(row)}</td>
                                    <td className="px-2 py-1.5 align-middle">{getPreferredCurrency(row)}</td>
                                    <td className="px-2 py-1.5 align-middle">
                                        {row.parent_reseller_name || row.parent_reseller_profile_image_url ? (
                                            <div className="flex items-center gap-2 text-start">
                                                {row.parent_reseller_profile_image_url ? (
                                                    <img
                                                        src={`${row.parent_reseller_profile_image_url}`}
                                                        alt={row.parent_reseller_name || ''}
                                                        className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-border"
                                                    />
                                                ) : null}
                                                <span className="truncate text-xs font-medium">{row.parent_reseller_name}</span>
                                            </div>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td className="px-2 py-1.5 align-middle text-start">{row.country}</td>
                                    <td className="px-2 py-1.5 align-middle">
                                        <Badge variant={row.status === 1 ? 'success' : 'danger'}>{resellerStatusLabel(row.status)}</Badge>
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
                        <SheetTitle>{t('FILTER', { defaultValue: 'فیلتر فروشندگان' })}</SheetTitle>
                        <SheetDescription>فیلترها روی نتایج سرور اعمال می‌شوند.</SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <FilterField label={t('PAYMENT.TABLE.COLUMN.STATUS', { defaultValue: 'وضعیت' })}>
                            <Select
                                value={draftFilters.filter_status ?? undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_status: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_STATUS', { defaultValue: 'انتخاب وضعیت' })} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">{t('TABLE.GENERAL.ACTIVATE', { defaultValue: 'فعال' })}</SelectItem>
                                    <SelectItem value="0">{t('TABLE.GENERAL.DEACTIVATE', { defaultValue: 'غیرفعال' })}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>
                        <FilterField label={t('START_DATE', { defaultValue: 'تاریخ شروع' })}>
                            <Input
                                type="date"
                                value={draftFilters.filter_startdate || ''}
                                onChange={(e) => setDraftFilters((p) => ({ ...p, filter_startdate: e.target.value || null }))}
                            />
                        </FilterField>
                        <FilterField label={t('END_DATE', { defaultValue: 'تاریخ پایان' })}>
                            <Input
                                type="date"
                                value={draftFilters.filter_enddate || ''}
                                onChange={(e) => setDraftFilters((p) => ({ ...p, filter_enddate: e.target.value || null }))}
                            />
                        </FilterField>
                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => setDraftFilters(emptyResellerFilters)}>
                                {t('RESET', { defaultValue: 'بازنشانی' })}
                            </Button>
                            <Button type="button" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={applyFilters}>
                                {t('APPLY', { defaultValue: 'اعمال' })}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <FormSheet
                open={resellerDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="full"
                side="left"
                title={isResellerEdit ? 'ویرایش نماینده' : 'افزودن نماینده'}
                description={
                    isResellerEdit
                        ? 'ویرایش هویت، حساب، موقعیت، تنظیمات مالی و دسترسی‌ها'
                        : 'ثبت فروشنده جدید — تمام فیلدهای الزامی را تکمیل کنید'
                }
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveReseller}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title="تصویر و هویت" description="تصویر پروفایل و نام‌های نمایشی">
                    <FormField label={t('RESELLER.FORM.INPUT.RESELLERNAME')} required error={submitted && !reseller.reseller_name ? t('THIS_FIELD_IS_REQUIRED') : null}>
                        <Input
                            id="reseller_name"
                            value={reseller?.reseller_name}
                            onChange={(e) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    reseller_name: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.RESELLERNAME')}
                            className={cn('w-full', submitted && !reseller.reseller_name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('RESELLER.FORM.INPUT.CONTACTNAME')}
                        required
                        error={submitted && !reseller.contact_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="contact_name"
                            value={reseller.contact_name || ''}
                            onChange={(e) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    contact_name: e.target.value
                                }))
                            }
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.CONTACTNAME')}
                            className={cn('w-full', submitted && !reseller.contact_name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField label="تصویر پروفایل" fullWidth>
                        <FileDrop
                            value={reseller.profile_image_url instanceof File ? reseller.profile_image_url : null}
                            previewUrl={
                                typeof reseller.profile_image_url === 'string' && reseller.profile_image_url
                                    ? reseller.profile_image_url
                                    : null
                            }
                            onChange={(file) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    profile_image_url:
                                        file ?? (prev.profile_image_url instanceof File ? '' : prev.profile_image_url)
                                }))
                            }
                            accept="image/*"
                            label="تصویر پروفایل"
                        />
                    </FormField>
                </FormSection>

                <FormSection title="حساب کاربری" description="ایمیل، تلفن و رمز عبور (فقط هنگام ایجاد)">
                    <FormField label={t('RESELLER.FORM.INPUT.EMAIL')} required error={submitted && !reseller.email ? t('THIS_FIELD_IS_REQUIRED') : null}>
                        <Input
                            id="email"
                            type="email"
                            value={reseller?.email}
                            onChange={(e) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    email: e.target.value
                                }))
                            }
                            required
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.EMAIL')}
                            className={cn('w-full', submitted && !reseller.email && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField label={t('RESELLER.FORM.INPUT.PHONE')} required error={submitted && !reseller.phone ? t('THIS_FIELD_IS_REQUIRED') : null}>
                        <Input
                            id="phone"
                            value={reseller.phone || ''}
                            onChange={(e) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    phone: e.target.value
                                }))
                            }
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.PHONE')}
                            className={cn('w-full', submitted && !reseller.phone && 'border-rose-300')}
                        />
                    </FormField>
                    {reseller.id === 0 ? (
                        <FormField
                            label={t('PASSWORD', { defaultValue: 'رمز عبور' })}
                            required
                            fullWidth
                            error={submitted && !reseller.account_password ? t('THIS_FIELD_IS_REQUIRED') : null}
                        >
                            <PasswordInput
                                id="account_password"
                                value={reseller?.account_password}
                                onChange={(e) =>
                                    setReseller((prev: Reseller) => ({
                                        ...prev,
                                        account_password: e.target.value
                                    }))
                                }
                                required
                                autoComplete="new-password"
                                className={cn('w-full', submitted && !reseller.account_password && 'border-rose-300')}
                            />
                        </FormField>
                    ) : null}
                </FormSection>

                <FormSection title="موقعیت" description="کشور، ولایت و ناحیه">
                    <FormField label={t('RESELLER.FORM.INPUT.COUNTRY')} required error={submitted && !reseller.country_id ? t('THIS_FIELD_IS_REQUIRED') : null}>
                        <SearchSelect
                            value={(countries || []).find((country: Country) => country.id === reseller.country_id) || null}
                            options={countries || []}
                            onChange={(selected: Country | null) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    country_id: selected?.id ?? 0,
                                    country: selected?.country_name || ''
                                }))
                            }
                            optionLabel="country_name"
                            optionValue="id"
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.COUNTRY', { defaultValue: 'انتخاب کشور' })}
                            error={submitted && !reseller.country_id}
                            returnFullObject
                        />
                    </FormField>
                    <FormField label={t('RESELLER.FORM.INPUT.PROVINCE')} required error={submitted && !reseller.province_id ? t('THIS_FIELD_IS_REQUIRED') : null}>
                        <SearchSelect
                            value={(provinces || []).find((province: Province) => province.id === reseller.province_id) || null}
                            options={provinces || []}
                            onChange={(selected: Province | null) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    province_id: selected?.id ?? 0
                                }))
                            }
                            optionLabel="province_name"
                            optionValue="id"
                            searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.PROVINCE', { defaultValue: 'انتخاب ولایت' })}
                            error={submitted && !reseller.province_id}
                            returnFullObject
                        />
                    </FormField>
                    <FormField label={t('RESELLER.FORM.INPUT.DISTRICT')} required error={submitted && !reseller.districts_id ? t('THIS_FIELD_IS_REQUIRED') : null}>
                        <SearchSelect
                            value={(districts || []).find((district: District) => district.id === reseller.districts_id) || null}
                            options={districts || []}
                            onChange={(selected: District | null) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    districts_id: selected?.id ?? 0
                                }))
                            }
                            optionLabel="district_name"
                            optionValue="id"
                            searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.DISTRICT', { defaultValue: 'انتخاب ناحیه' })}
                            error={submitted && !reseller.districts_id}
                            returnFullObject
                        />
                    </FormField>
                </FormSection>

                <FormSection title="تنظیمات مالی" description="ارز، گروه، سقف زیرفروشنده و وام">
                    <FormField label={t('RESELLER.FORM.INPUT.CURRENCYPREFERENCE')} required error={submitted && !reseller.code ? t('THIS_FIELD_IS_REQUIRED') : null}>
                        <SearchSelect
                            value={(currencies || []).find((currency: Currency) => currency.code === reseller.code) || null}
                            options={currencies || []}
                            onChange={(selected: Currency | null) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    code: selected?.code ?? null
                                }))
                            }
                            optionLabel="code"
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.CURRENCY')}
                            disabled={!!reseller.id && reseller.id !== 0}
                            error={submitted && !reseller.code}
                            returnFullObject
                        />
                    </FormField>
                    <FormField label={t('RESELLER.FORM.LABEL.RESELLERGROUP')}>
                        <SearchSelect
                            value={
                                (reseller_groups || []).find((group: ResellerGroup) => group.id === reseller.reseller_group_id) ||
                                null
                            }
                            options={reseller_groups || []}
                            onChange={(selected: ResellerGroup | null) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    reseller_group_id: selected?.id ?? 0
                                }))
                            }
                            optionLabel="name"
                            optionValue="id"
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.RESELLERGROUP', { defaultValue: 'انتخاب گروه' })}
                            returnFullObject
                        />
                    </FormField>
                    <FormField
                        label={t('RESELLER.FORM.LABEL.SUBRESELLERLIMIT')}
                        required
                        error={submitted && !reseller.sub_reseller_limit ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <NumberInput
                            id="sub_reseller_limit"
                            value={
                                typeof reseller.sub_reseller_limit === 'number'
                                    ? reseller.sub_reseller_limit
                                    : Number(reseller.sub_reseller_limit) || null
                            }
                            onValueChange={(v) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    sub_reseller_limit: v ?? 0
                                }))
                            }
                            min={0}
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.SUBRESELLERLIMIT', { defaultValue: 'سقف زیرفروشنده' })}
                            className={cn('w-full', submitted && !reseller.sub_reseller_limit && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField label={t('RESELLER.FORM.PLACEHOLDER.MAX_LOAN_BALANCE_REQUEST_AMOUNT')}>
                        <NumberInput
                            id="max_loan_balance_request_amount"
                            value={
                                typeof reseller.max_loan_balance_request_amount === 'number'
                                    ? reseller.max_loan_balance_request_amount
                                    : Number(reseller.max_loan_balance_request_amount) || null
                            }
                            onValueChange={(v) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    max_loan_balance_request_amount: v ?? 0
                                }))
                            }
                            min={0}
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.MAX_LOAN_BALANCE_REQUEST_AMOUNT')}
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('RESELLER.FORM.PLACEHOLDER.MIN_LOAN_BALANCE_REQUEST_AMOUNT')}>
                        <NumberInput
                            id="min_loan_balance_request_amount"
                            value={
                                typeof reseller.min_loan_balance_request_amount === 'number'
                                    ? reseller.min_loan_balance_request_amount
                                    : Number(reseller.min_loan_balance_request_amount) || null
                            }
                            onValueChange={(v) =>
                                setReseller((prev: Reseller) => ({
                                    ...prev,
                                    min_loan_balance_request_amount: v ?? 0
                                }))
                            }
                            min={0}
                            placeholder={t('RESELLER.FORM.PLACEHOLDER.MIN_LOAN_BALANCE_REQUEST_AMOUNT')}
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('RECHARGE_ADJUST_TYPE')}>
                        <Select
                            value={reseller.afg_custom_recharge_adjust_type}
                            onValueChange={(v) =>
                                setReseller((prev) => ({
                                    ...prev,
                                    afg_custom_recharge_adjust_type: v as Reseller['afg_custom_recharge_adjust_type']
                                }))
                            }
                        >
                            <SelectTrigger id="afg_custom_recharge_adjust_type" className="w-full">
                                <SelectValue placeholder={t('SELECT_ADJUST_TYPE')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="decrease">{t('DECREASE')}</SelectItem>
                                <SelectItem value="increase">{t('INCREASE')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('RECHARGE_ADJUST_MODE')}>
                        <Select
                            value={reseller.afg_custom_recharge_adjust_mode}
                            onValueChange={(v) =>
                                setReseller((prev) => ({
                                    ...prev,
                                    afg_custom_recharge_adjust_mode: v as Reseller['afg_custom_recharge_adjust_mode']
                                }))
                            }
                        >
                            <SelectTrigger id="afg_custom_recharge_adjust_mode" className="w-full">
                                <SelectValue placeholder={t('SELECT_ADJUST_MODE')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">{t('PERCENTAGE')}</SelectItem>
                                <SelectItem value="fixed">{t('FIXED')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('RECHARGE_ADJUST_VALUE')}>
                        <NumberInput
                            id="afg_custom_recharge_adjust_value"
                            value={reseller.afg_custom_recharge_adjust_value ?? null}
                            onValueChange={(v) =>
                                setReseller((prev) => ({
                                    ...prev,
                                    afg_custom_recharge_adjust_value: v ?? 0
                                }))
                            }
                            placeholder={t('ENTER_ADJUST_VALUE')}
                            className="w-full"
                        />
                    </FormField>
                </FormSection>

                <FormSection title="دسترسی‌ها" description="مجوزهای عملیاتی و سلسله‌مراتب زیرفروشنده">
                    <PermissionSwitch
                        id="can_create_sub_resellers"
                        label={t('RESELLER.FORM.LABEL.CANCREATESUBRESELLER')}
                        checked={reseller.can_create_sub_resellers === 1}
                        onChange={(value) =>
                            setReseller((prev: Reseller) => ({
                                ...prev,
                                can_create_sub_resellers: value ? 1 : 0
                            }))
                        }
                    />
                    <PermissionSwitch
                        id="sub_resellers_can_create_sub_resellers"
                        label={t('RESELLER.FORM.LABEL.SUBRESELLERCANCREATESUBRESELLER')}
                        checked={reseller.sub_resellers_can_create_sub_resellers === 1}
                        onChange={(value) =>
                            setReseller((prev: Reseller) => ({
                                ...prev,
                                sub_resellers_can_create_sub_resellers: value ? 1 : 0
                            }))
                        }
                    />
                    <PermissionSwitch
                        id="can_set_commission_group"
                        label={t('RESELLER.FORM.LABEL.CAN_SET_COMMISSION_GROUP')}
                        checked={reseller.can_set_commission_group === true}
                        onChange={(value) =>
                            setReseller((prev: Reseller) => ({
                                ...prev,
                                can_set_commission_group: value
                            }))
                        }
                    />
                    <PermissionSwitch
                        id="can_set_selling_price_group"
                        label={t('RESELLER.FORM.LABEL.CAN_SET_SELLING_PRICE_GROUP')}
                        checked={reseller.can_set_selling_price_group === true}
                        onChange={(value) =>
                            setReseller((prev: Reseller) => ({
                                ...prev,
                                can_set_selling_price_group: value
                            }))
                        }
                    />
                    <PermissionSwitch
                        id="can_send_payment_request"
                        label={t('RESELLER.FORM.LABEL.CAN_SEND_PAYMENT_REQUEST')}
                        checked={reseller.can_send_payment_request === true}
                        onChange={(value) =>
                            setReseller((prev: Reseller) => ({
                                ...prev,
                                can_send_payment_request: value
                            }))
                        }
                    />
                    <PermissionSwitch
                        id="can_ask_loan_balance"
                        label={t('RESELLER.FORM.LABEL.CAN_ASK_LOAN_BALANCE')}
                        checked={reseller.can_ask_loan_balance === true}
                        onChange={(value) =>
                            setReseller((prev: Reseller) => ({
                                ...prev,
                                can_ask_loan_balance: value
                            }))
                        }
                    />
                    <PermissionSwitch
                        id="can_see_our_contact"
                        label={t('RESELLER.FORM.LABEL.CAN_SEE_OUR_CONTACT')}
                        checked={reseller.can_see_our_contact === true}
                        onChange={(value) =>
                            setReseller((prev: Reseller) => ({
                                ...prev,
                                can_see_our_contact: value
                            }))
                        }
                    />
                    <PermissionSwitch
                        id="can_see_parent_contact"
                        label={t('RESELLER.FORM.LABEL.CAN_SEE_PARENT_CONTACT')}
                        checked={reseller.can_see_parent_contact === true}
                        onChange={(value) =>
                            setReseller((prev: Reseller) => ({
                                ...prev,
                                can_see_parent_contact: value
                            }))
                        }
                    />
                    <PermissionSwitch
                        id="can_send_hawala"
                        label={t('RESELLER.FORM.LABEL.CAN_SEND_HAWALA')}
                        checked={reseller.can_send_hawala === true}
                        onChange={(value) =>
                            setReseller((prev: Reseller) => ({
                                ...prev,
                                can_send_hawala: value
                            }))
                        }
                    />
                </FormSection>

                <FormSection title="مدارک" description="مدرک هویتی و مدرک اختیاری">
                    <FormField label={t('RESELLER.FORM.LABEL.IDENTITY_PROOF')}>
                        <FileDrop
                            value={reseller.reseller_identity_attachment instanceof File ? reseller.reseller_identity_attachment : null}
                            previewUrl={
                                typeof reseller.reseller_identity_attachment === 'string' && reseller.reseller_identity_attachment
                                    ? reseller.reseller_identity_attachment
                                    : null
                            }
                            onChange={(file) =>
                                setReseller((prev) => ({
                                    ...prev,
                                    reseller_identity_attachment:
                                        file ??
                                        (prev.reseller_identity_attachment instanceof File
                                            ? ''
                                            : prev.reseller_identity_attachment)
                                }))
                            }
                            accept="image/*,.pdf"
                            label={t('UPLOAD')}
                        />
                    </FormField>
                    <FormField label={t('RESELLER.FORM.LABEL.OPTIONAL_PROOF')}>
                        <FileDrop
                            value={reseller.extra_optional_proof instanceof File ? reseller.extra_optional_proof : null}
                            previewUrl={
                                typeof reseller.extra_optional_proof === 'string' && reseller.extra_optional_proof
                                    ? reseller.extra_optional_proof
                                    : null
                            }
                            onChange={(file) =>
                                setReseller((prev) => ({
                                    ...prev,
                                    extra_optional_proof:
                                        file ?? (prev.extra_optional_proof instanceof File ? '' : prev.extra_optional_proof)
                                }))
                            }
                            accept="image/*,.pdf"
                            label={t('UPLOAD')}
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

            <Dialog visible={deleteResellerDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResellerDialogFooter} onHide={hideDeleteResellerDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {reseller && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{reseller.reseller_name}</b>
                                </span>
                            )}
                        </div>
            </Dialog>

            <Dialog visible={statusResellerDialog} style={{ width: '450px' }} header="Confirm" modal footer={statusResellerDialogFooter} onHide={hideStatusResellerDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {reseller && (
                                <span>
                                    Are you sure you want to change status <b>{reseller.reseller_name}</b>?
                                </span>
                            )}
                        </div>
            </Dialog>

            <Dialog visible={deleteResellersDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResellersDialogFooter} onHide={hideDeleteResellersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {reseller && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
            </Dialog>
        </div>
    );
};

function PermissionSwitch({
    id,
    label,
    checked,
    onChange
}: {
    id: string;
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2.5">
            <label htmlFor={id} className="text-sm font-medium leading-snug text-foreground">
                {label}
            </label>
            <Switch id={id} checked={checked} onCheckedChange={onChange} />
        </div>
    );
}


export default withAuth(ResellerPage);
