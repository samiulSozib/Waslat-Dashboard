/* eslint-disable @next/next/no-img-element */
'use client';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _addHawala, _changeHawalaStatus, _deleteHawala, _fetchHawalaList } from '@/app/redux/actions/hawalaActions';
import { _fetchHawalaBranchList } from '@/app/redux/actions/hawalaBranchActions';
import { _fetchHawalaCurrencies } from '@/app/redux/actions/hawalaCurrenciesActions';
import { _fetchHawalaNextNumber } from '@/app/redux/actions/hawalaSeriesActions';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { AppDispatch } from '@/app/redux/store';
import { Currency, Hawala, Order } from '@/types/interface';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button as PrimeButton } from 'primereact/button';
import { Card } from 'primereact/card';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Check, CheckCircle2, ChevronDown, Clock3, Info, List, Plus, RefreshCw, X } from 'lucide-react';
import axios from 'axios';
import { StatCard } from '@/components/admin/stat-card';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { FilterBar } from '@/components/admin/filter-bar';
import { ListPage } from '@/components/admin/list-page';
import { RowActions, type RowActionItem } from '@/components/admin/row-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { currencyFaName, defaultHawalaRateDescription, resolveCurrencyFlag } from '@/lib/currency-flags';
import { quoteHawalaDebit } from '@/lib/hawala-quote';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import withAuth from '../../authGuard';
import CustomDropdownWithSearch from '@/app/(main)/components/customDropDownWithSearch';

// Form Data Interface
interface HawalaFormData {
    reseller: any;
    senderName: string;
    receiverName: string;
    receiverFatherName: string;
    receiverIdCardNumber: string;
    hawalaAmount: string;
    currencyCodeId: string;
    branchId: string;
    commissionAmount: string;
    commissionPaidBy: string;
    customHawalaNumber: string;
    adminNote: string;
}

const HawalaPage = () => {
    // State Management
    const [orderDialog, setOrderDialog] = useState(false);
    const [deleteOrderDialog, setDeleteOrderDialog] = useState(false);
    const [deleteOrdersDialog, setDeleteOrdersDialog] = useState(false);
    const [selectedCompanies, setSelectedCompanyCode] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();

    // Redux Selectors
    const { hawalas, pagination, loading } = useSelector((state: any) => state.hawalaReducer);
    const { nextNumber } = useSelector((state: any) => state.hawalaNumberSeriesReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { hawala_currencies } = useSelector((state: any) => state.hawalaCurrenciesReducer);
    const { hawalaBranches } = useSelector((state: any) => state.hawalaBranchReducer);

    // Translation
    const { t } = useTranslation();

    // Search and Filter States
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [statusFilter, setStatusFilter] = useState('');
    const [summary, setSummary] = useState({ total: 0, pending: 0, confirmed: 0 });
    const [ratesOpen, setRatesOpen] = useState(true);
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');

    // Dialog States
    const [statusChangeDialog, setStatusChangeDialog] = useState(false);
    const [viewHawalaDialog, setViewHawalaDialog] = useState(false);
    const [addHawalaDialog, setAddHawalaDialog] = useState(false);
    const [confirmationDialog, setConfirmationDialog] = useState(false);
    const [showRatesModal, setShowRatesModal] = useState(false);

    // Data States
    const [order, setOrder] = useState<Order>();
    const [selectedHawala, setSelectedHawala] = useState<Hawala | null>(null);
    const [selectedHawalaForAction, setSelectedHawalaForAction] = useState<Hawala | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<number | null>();

    // Form States
    const [formData, setFormData] = useState<HawalaFormData>({
        reseller: null,
        senderName: "",
        receiverName: "",
        receiverFatherName: "",
        receiverIdCardNumber: "",
        hawalaAmount: "",
        currencyCodeId: "",
        branchId: "",
        commissionAmount: "",
        commissionPaidBy: "sender",
        customHawalaNumber: "",
        adminNote: ""
    });

    const [hawalaNumberInput, setHawalaNumberInput] = useState('');
    const [fetchingNextNumber, setFetchingNextNumber] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        dispatch(_fetchHawalaList(1, searchTag, statusFilter));
        dispatch(_fetchHawalaCurrencies());
        dispatch(_fetchHawalaBranchList());
        dispatch(_fetchResellers(1, '', '', 15));
        dispatch(_fetchCurrencies());
    }, [dispatch, searchTag, statusFilter]);

    useEffect(() => {
        const token = localStorage.getItem('api_token') || '';
        const headers = { Authorization: `Bearer ${token}` };
        const countFor = async (status?: string) => {
            const params = new URLSearchParams({ page: '1', items_per_page: '1' });
            if (status) params.set('status', status);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-orders?${params.toString()}`, { headers });
            return Number(response.data?.payload?.pagination?.total || 0);
        };
        Promise.all([countFor(), countFor('pending'), countFor('confirmed')])
            .then(([total, pending, confirmed]) => setSummary({ total, pending, confirmed }))
            .catch(() => setSummary({ total: 0, pending: 0, confirmed: 0 }));
    }, [hawalas]);

    // Reseller Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (resellerSearchTerm) {
                dispatch(_fetchResellers(1, resellerSearchTerm));
            } else {
                dispatch(_fetchResellers(1, ''));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [resellerSearchTerm, dispatch]);

    const walletCurrency = useMemo(() => {
        const code = String(formData.reseller?.code || '').trim().toUpperCase();
        if (!code) return null;
        return (currencies || []).find((currency: Currency) => String(currency.code || '').trim().toUpperCase() === code) || null;
    }, [formData.reseller, currencies]);

    const selectedPayoutCurrency = useMemo(() => {
        const id = Number(formData.currencyCodeId || 0);
        if (!id) return null;
        return (currencies || []).find((currency: Currency) => Number(currency.id) === id) || null;
    }, [formData.currencyCodeId, currencies]);

    const hawalaQuote = useMemo(
        () =>
            quoteHawalaDebit(
                Number(walletCurrency?.id || 0),
                Number(formData.currencyCodeId || 0),
                Number(formData.hawalaAmount || 0),
                hawala_currencies || [],
                walletCurrency?.code,
                Number(formData.commissionAmount || 0),
                selectedPayoutCurrency?.code,
                formData.commissionPaidBy === 'receiver' ? 'receiver' : 'sender'
            ),
        [
            walletCurrency,
            formData.currencyCodeId,
            formData.hawalaAmount,
            formData.commissionAmount,
            formData.commissionPaidBy,
            hawala_currencies,
            selectedPayoutCurrency?.code
        ]
    );
    const formatQuote = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 4 });

    // Auto-fill hawala number when nextNumber changes
    // Auto-fill hawala number when nextNumber changes
    useEffect(() => {
        if (nextNumber && confirmationDialog) {
            console.log('Auto-filling hawala number:', nextNumber);
            setHawalaNumberInput(nextNumber);
        }
    }, [nextNumber, confirmationDialog]);



    // Auto-fetch next hawala number when branch is selected in add dialog
    useEffect(() => {
        if (addHawalaDialog && formData.branchId) {
            const fetchBranchHawalaNumber = async () => {
                try {
                    setFetchingNextNumber(true);
                    await dispatch(_fetchHawalaNextNumber(formData.branchId, toast, t));
                } catch (error) {
                    console.error('Error fetching next hawala number for branch:', error);
                } finally {
                    setFetchingNextNumber(false);
                }
            };

            fetchBranchHawalaNumber();
        }
    }, [formData.branchId, addHawalaDialog, dispatch, t]);

    // Auto-fill custom hawala number when nextNumber changes and add dialog is open
    useEffect(() => {
        if (nextNumber && addHawalaDialog && formData.branchId) {
            console.log('Auto-filling custom hawala number in add dialog:', nextNumber);
            setFormData(prev => ({
                ...prev,
                customHawalaNumber: nextNumber
            }));
        }
    }, [nextNumber, addHawalaDialog, formData.branchId]);

    // Event Handlers
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Add this useEffect to handle auto-opening the dialog
    const searchParams = useSearchParams(); // Add this
    const router = useRouter()

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            // Small delay to ensure the page is fully loaded and Redux state is ready
            const timer = setTimeout(() => {
                openAddHawalaDialog();
                // Optional: Clean up the URL after opening the dialog
                router.replace('/pages/hawala');
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    const openAddHawalaDialog = () => {
        setAddHawalaDialog(true);
    };

    const emptyHawalaForm = (): HawalaFormData => ({
        reseller: null,
        senderName: "",
        receiverName: "",
        receiverFatherName: "",
        receiverIdCardNumber: "",
        hawalaAmount: "",
        currencyCodeId: "",
        branchId: "",
        commissionAmount: "",
        commissionPaidBy: "sender",
        customHawalaNumber: "",
        adminNote: ""
    });

    const closeAddHawalaDialog = () => {
        setAddHawalaDialog(false);
        setFormData(emptyHawalaForm());
        setSubmitted(false);
    };

    const handleAddHawalaSubmit = () => {
        setSubmitted(true);

        // Validation
        if (!formData.reseller || !formData.senderName || !formData.receiverName ||
            !formData.receiverFatherName || !formData.receiverIdCardNumber ||
            !formData.hawalaAmount || !formData.currencyCodeId || !formData.branchId ||
            hawalaQuote.missingRate || hawalaQuote.invalidCommission || hawalaQuote.debit == null) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: hawalaQuote.invalidCommission
                    ? t('HAWALA_COMMISSION_TOO_HIGH', { defaultValue: 'کارمزد باید کمتر از مبلغ حواله باشد' })
                    : hawalaQuote.missingRate
                      ? t('RESELLER.PROFILE.NO_BOARD_RATE', { defaultValue: 'نرخ این جفت ارز در تابلو ثبت نشده' })
                      : t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        const commissionAmount = Math.max(0, parseFloat(formData.commissionAmount || '0') || 0);

        // Prepare data according to API requirement
        const hawalaData = {
            reseller_id: formData.reseller.id,
            hawala_branch_id: parseInt(formData.branchId),
            sender_name: formData.senderName,
            receiver_name: formData.receiverName,
            receiver_father_name: formData.receiverFatherName,
            receiver_id_card_number: formData.receiverIdCardNumber,
            hawala_amount: parseFloat(formData.hawalaAmount),
            hawala_amount_currency_id: parseInt(formData.currencyCodeId),
            commission_amount: commissionAmount,
            commission_paid_by_sender: formData.commissionPaidBy === "sender",
            commission_paid_by_receiver: formData.commissionPaidBy === "receiver",
            custom_hawala_number: formData.customHawalaNumber || undefined,
            admin_note: formData.adminNote || undefined
        };

        // Dispatch action to add hawala
        dispatch(_addHawala(hawalaData, toast, t));

        // Close dialog and reset form
        setAddHawalaDialog(false);
        setFormData(emptyHawalaForm());
        setSubmitted(false);

        // Refresh the hawala list
        dispatch(_fetchHawalaList(1, searchTag, statusFilter));
    };

    const fetchNextHawalaNumber = async (branchId: number | string) => {
        console.log(branchId)
        if (!branchId) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('BRANCH_ID_REQUIRED'),
                life: 3000
            });
            return;
        }

        setFetchingNextNumber(true);
        try {
            await dispatch(_fetchHawalaNextNumber(branchId, toast, t));
        } catch (error) {
            console.error('Error fetching next hawala number:', error);
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('FAILED_TO_FETCH_NEXT_NUMBER'),
                life: 3000
            });
        } finally {
            setFetchingNextNumber(false);
        }
    };

    const confirmChangeStatus = (hawala: Hawala, newStatus: number) => {
        console.log(hawala)
        setSelectedHawalaForAction(hawala);
        setSelectedStatus(newStatus);

        if (newStatus === 1) { // Confirmed status
            setHawalaNumberInput('');
            if (hawala?.hawala_branch_id) {
                fetchNextHawalaNumber(hawala?.hawala_branch_id);
            }
            setConfirmationDialog(true);
        } else {
            setStatusChangeDialog(true);
        }
    };

    const changeOrderStatus = () => {
        if (!selectedHawalaForAction?.id || selectedStatus === null) {
            console.error('Hawala ID or status is undefined.');
            return;
        }

        dispatch(_changeHawalaStatus(selectedHawalaForAction.id as number, selectedStatus as number, '', toast, t));
        setStatusChangeDialog(false);
        setSelectedHawalaForAction(null);
    };

    const finalizeHawalaConfirmation = () => {
        if (!selectedHawalaForAction?.id || selectedStatus === null || !hawalaNumberInput.trim()) {
            console.error('Hawala ID, status, or hawala number is missing.');
            return;
        }

        dispatch(_changeHawalaStatus(
            selectedHawalaForAction.id as number,
            selectedStatus as number,
            hawalaNumberInput,
            toast,
            t
        ));

        setConfirmationDialog(false);
        setHawalaNumberInput('');
        setSelectedHawalaForAction(null);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setOrderDialog(false);
    };

    const hideDeleteOrderDialog = () => {
        setDeleteOrderDialog(false);
    };

    const hideDeleteOrdersDialog = () => {
        setDeleteOrdersDialog(false);
    };

    const confirmDeleteOrder = (order: Order) => {
        setOrder(order);
        setDeleteOrderDialog(true);
    };

    const deleteOrder = () => {
        if (!order?.id) {
            console.error('Order ID is undefined.');
            return;
        }
        dispatch(_deleteHawala(order?.id, toast, t));
        setDeleteOrderDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteOrdersDialog(true);
    };

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 20)));

    const formatHawalaRate = (value: unknown) => {
        if (value == null || value === '') return '—';
        const amount = Number(value);
        if (Number.isNaN(amount)) return String(value);
        return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };

    const onPageChange = (page: number) => {
        dispatch(_fetchHawalaList(page, searchTag, statusFilter));
    };

    const viewHawala = (hawala: Hawala) => {
        setSelectedHawala(hawala);
        setViewHawalaDialog(true);
    };

    const downloadHawalaAsImage = () => {
        const modalElement = document.getElementById('hawala-view-modal');
        if (!modalElement) return;

        import('html2canvas').then((html2canvas) => {
            html2canvas.default(modalElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                logging: false
            }).then((canvas) => {
                const link = document.createElement('a');
                link.download = `hawala-${selectedHawala?.hawala_number}-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    };

    const hawalaRowActions = (rowData: Hawala): RowActionItem[] => {
        const status = rowData.status;
        const items: RowActionItem[] = [];

        if (status === 'pending' || status === 'under_process') {
            items.push(
                {
                    label: t('ORDER.STATUS.CONFIRMED'),
                    icon: <Check className="h-3.5 w-3.5" />,
                    onClick: () => handleConfirmStatus(rowData, 1)
                },
                {
                    label: t('ORDER.STATUS.REJECTED'),
                    icon: <X className="h-3.5 w-3.5" />,
                    onClick: () => confirmChangeStatus(rowData, 2),
                    danger: true,
                    separatorBefore: true
                }
            );
        } else if (status === 'rejected') {
            items.push({
                label: t('ORDER.STATUS.CONFIRMED'),
                icon: <Check className="h-3.5 w-3.5" />,
                onClick: () => handleConfirmStatus(rowData, 1)
            });
        }

        return items;
    };

    const handleConfirmStatus = async (rowData: Hawala, statusCode: number) => {
        try {
            console.log('Starting confirmation process for hawala:', rowData);

            // First, fetch the next hawala number
            if (rowData?.hawala_branch_id) {

                // Dispatch the action to fetch next number and wait for it to complete
                await dispatch(_fetchHawalaNextNumber(rowData?.hawala_branch_id, toast, t));

                // Wait a moment for the state to update
                setTimeout(() => {
                    console.log('Next number fetched:', nextNumber);
                    // Then show the confirmation dialog
                    setSelectedHawalaForAction(rowData);
                    setSelectedStatus(statusCode);
                    setConfirmationDialog(true);
                }, 500);

            } else {
                console.error('No branch ID found');
                toast.current?.show({
                    severity: 'error',
                    summary: t('ERROR'),
                    detail: t('BRANCH_ID_REQUIRED'),
                    life: 3000
                });
            }
        } catch (error) {
            console.error('Error in handleConfirmStatus:', error);
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('FAILED_TO_PROCESS_CONFIRMATION'),
                life: 3000
            });
        }
    };

    // Dialog Footers
    const companyDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" text onClick={hideDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={() => { }} />
        </>
    );

    const deleteCompanyDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" text onClick={hideDeleteOrderDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={deleteOrder} />
        </>
    );

    return (
        <>
            <Toast ref={toast} />

            <ListPage
                title={t('MENU.HAWALAS', { defaultValue: 'حواله‌ها' })}
                description={t('HAWALA_LIST_DESCRIPTION', { defaultValue: 'مدیریت و پیگیری حواله‌ها' })}
                loading={loading}
                actions={
                    <Button size="sm" onClick={openAddHawalaDialog}>
                        <Plus className="h-4 w-4" />
                        {t('ADD_HAWALA', { defaultValue: 'افزودن حواله' })}
                    </Button>
                }
                toolbar={
                    <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-3">
                            <StatCard
                                label="کل حواله‌ها"
                                value={summary.total}
                                icon={List}
                                tone="slate"
                                className={statusFilter === '' ? 'ring-2 ring-slate-400' : undefined}
                                onClick={() => setStatusFilter('')}
                            />
                            <StatCard
                                label="در انتظار تأیید"
                                value={summary.pending}
                                hint="نیاز به اقدام ادمین"
                                icon={Clock3}
                                tone="amber"
                                className={statusFilter === 'pending' ? 'ring-2 ring-amber-400' : undefined}
                                onClick={() => setStatusFilter('pending')}
                            />
                            <StatCard
                                label="تأیید شده"
                                value={summary.confirmed}
                                icon={CheckCircle2}
                                tone="primary"
                                className={statusFilter === 'confirmed' ? 'ring-2 ring-emerald-500' : undefined}
                                onClick={() => setStatusFilter('confirmed')}
                            />
                        </div>
                        <div className="waslat-panel w-full max-w-xl overflow-hidden">
                            <button
                                type="button"
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-start text-xs font-semibold"
                                aria-expanded={ratesOpen}
                                onClick={() => setRatesOpen((open) => !open)}
                            >
                                <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', ratesOpen ? 'rotate-0' : '-rotate-90')} />
                                <span>{t('TODAYS_EXCHANGE_RATES', { defaultValue: 'نرخ‌های تبدیل امروز' })}</span>
                            </button>
                            {ratesOpen ? (
                                (hawala_currencies || []).length === 0 ? (
                                <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">نرخی ثبت نشده</div>
                            ) : (
                                <ul className="divide-y divide-border border-t border-border">
                                    {(hawala_currencies || []).map((rate: any) => {
                                        const fromCurrency = (currencies || []).find((item: Currency) => String(item.id) === String(rate.from_currency?.id)) || rate.from_currency;
                                        const toCurrency = (currencies || []).find((item: Currency) => String(item.id) === String(rate.to_currency?.id)) || rate.to_currency;
                                        const fromFlag = resolveCurrencyFlag(fromCurrency || {});
                                        const toFlag = resolveCurrencyFlag(toCurrency || {});
                                        const fromName = currencyFaName(fromCurrency);
                                        const toName = currencyFaName(toCurrency);
                                        const amountLabel = formatHawalaRate(rate.amount);
                                        const buyLabel = formatHawalaRate(rate.buy_rate);
                                        const sellLabel = formatHawalaRate(rate.sell_rate);
                                        const generated = defaultHawalaRateDescription({ ...rate, from_currency: fromCurrency, to_currency: toCurrency });
                                        const customDescription = rate.description?.trim();
                                        const flag = (src: string) =>
                                            src ? <img src={src} alt="" className="inline-block h-3.5 w-5 shrink-0 rounded-[2px] border border-border object-cover align-middle" /> : null;
                                        return (
                                            <li key={rate.id} className="space-y-1 px-3 py-1.5 text-xs">
                                                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 leading-5">
                                                    <span>هر</span>
                                                    <span className="font-semibold tabular-nums">{amountLabel}</span>
                                                    {flag(fromFlag)}
                                                    <span className="font-medium">{fromName}</span>
                                                    <span>به</span>
                                                    {flag(toFlag)}
                                                    <span className="font-medium">{toName}</span>
                                                    <span className="font-medium tabular-nums text-emerald-700">خرید {buyLabel}</span>
                                                    <span className="font-medium tabular-nums text-rose-600">فروش {sellLabel}</span>
                                                </p>
                                                <p className="flex flex-wrap items-center gap-x-1 gap-y-1 text-[11px] leading-5 text-muted-foreground">
                                                    {customDescription && customDescription !== generated ? (
                                                        customDescription
                                                    ) : (
                                                        <>
                                                            <span>یعنی صراف از مشتریان</span>
                                                            <span className="tabular-nums">{amountLabel}</span>
                                                            {flag(fromFlag)}
                                                            <span>{fromName} را به قیمت</span>
                                                            <span className="tabular-nums">{buyLabel}</span>
                                                            {flag(toFlag)}
                                                            <span>{toName} می‌خرد و</span>
                                                            <span className="tabular-nums">{sellLabel}</span>
                                                            {flag(toFlag)}
                                                            <span>{toName} می‌فروشد.</span>
                                                        </>
                                                    )}
                                                </p>
                                            </li>
                                        );
                                    })}
                                </ul>
                                )
                            ) : null}
                        </div>
                        <FilterBar
                            search={searchInput}
                            onSearchChange={setSearchInput}
                            searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در حواله‌ها...' })}
                        />
                    </div>
                }
                footer={
                    <div className="flex flex-col gap-2 border-t border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">
                            {t('DATA_TABLE.TABLE.PAGINATOR.SHOWING', { defaultValue: 'نمایش' })}{' '}
                            · {t('PAGE', { defaultValue: 'صفحه' })} {pagination?.page || 1} / {totalPages} ·{' '}
                            {t('TOTAL', { defaultValue: 'مجموع' })} {pagination?.total || 0}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" disabled={(pagination?.page || 1) <= 1} onClick={() => onPageChange((pagination?.page || 1) - 1)}>
                                {t('PREVIOUS', { defaultValue: 'قبلی' })}
                            </Button>
                            <Button variant="outline" size="sm" disabled={(pagination?.page || 1) >= totalPages} onClick={() => onPageChange((pagination?.page || 1) + 1)}>
                                {t('NEXT', { defaultValue: 'بعدی' })}
                            </Button>
                        </div>
                    </div>
                }
            >
                <table className="w-full min-w-[1280px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-border bg-muted/40 text-start">
                            <th className="sticky start-0 z-10 bg-muted/95 px-2 py-2 font-semibold whitespace-nowrap">
                                {t('ACTIONS', { defaultValue: 'عملیات' })}
                            </th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.HAWALA_NUMBER')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.HAWALA_CUSTOM_NUMBER')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.SENDER_NAME')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.RECEIVER_NAME')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.AMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.CURRENCY')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.CONVERTED_AMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.RESELLER_CURRENCY')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.COMMISSION')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.ADMIN_NOTE')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.RESELLER_NAME')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('ORDER.TABLE.COLUMN.ORDEREDDATE')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('HAWALA.TABLE.COLUMN.STATUS')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(hawalas || []).length === 0 ? (
                            <tr>
                                <td colSpan={14} className="px-3 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (hawalas || []).map((row: Hawala) => {
                                const { date: createdDate, time: createdTime } = formatHawalaDateTime(row.created_at?.toString());
                                return (
                                    <tr
                                        key={row.id}
                                        className="cursor-pointer border-b border-border/70 transition-colors hover:bg-emerald-50/50"
                                        onClick={() => viewHawala(row)}
                                    >
                                        <td className="sticky start-0 z-10 bg-white px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                                            <RowActions items={hawalaRowActions(row)} />
                                        </td>
                                        <td className="px-2 py-1.5 font-medium tabular-nums whitespace-nowrap">{row.hawala_number || '—'}</td>
                                        <td className="px-2 py-1.5 tabular-nums whitespace-nowrap">{row.hawala_custom_number || '—'}</td>
                                        <td className="px-2 py-1.5 whitespace-nowrap">{row.sender_name || '—'}</td>
                                        <td className="px-2 py-1.5 whitespace-nowrap">{row.receiver_name || '—'}</td>
                                        <td className="px-2 py-1.5">
                                            <span className="block font-semibold tabular-nums">{row.hawala_amount ?? '—'}</span>
                                            <span className="text-[10px] text-muted-foreground">{row.hawala_amount_currency_code}</span>
                                        </td>
                                        <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">{row.hawala_amount_currency_code || '—'}</td>
                                        <td className="px-2 py-1.5">
                                            <span className="block font-semibold tabular-nums">{row.converted_amount_taken_from_reseller ?? '—'}</span>
                                            <span className="text-[10px] text-muted-foreground">{row.reseller_prefered_currency_code}</span>
                                        </td>
                                        <td className="px-2 py-1.5 text-muted-foreground whitespace-nowrap">{row.reseller_prefered_currency_code || '—'}</td>
                                        <td className="px-2 py-1.5 font-semibold text-emerald-700 tabular-nums">{row.commission_amount ?? '—'}</td>
                                        <td className="max-w-[12rem] truncate px-2 py-1.5 text-muted-foreground" title={row.admin_note || undefined}>
                                            {row.admin_note || '—'}
                                        </td>
                                        <td className="px-2 py-1.5 whitespace-nowrap">{row.reseller?.reseller_name || '—'}</td>
                                        <td className="px-2 py-1.5 whitespace-nowrap">
                                            <span className="block tabular-nums">{createdDate}</span>
                                            <span className="text-[10px] text-muted-foreground tabular-nums">{createdTime}</span>
                                        </td>
                                        <td className="px-2 py-1.5 whitespace-nowrap">
                                            <Badge variant={hawalaStatusVariant(row.status)}>{hawalaStatusLabel(t, row.status)}</Badge>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </ListPage>

            {/* Exchange Rates Modal */}
                    <Dialog
                        visible={showRatesModal}
                        style={{ width: '500px' }}
                        header={t("TODAYS_EXCHANGE_RATES")}
                        modal
                        onHide={() => setShowRatesModal(false)}
                    >
                        <div className="grid">
                            {hawala_currencies?.map((rate: any) => (
                                <div key={rate.id} className="col-12">
                                    <Card className="mb-2">
                                        <div className="flex justify-content-between align-items-center">
                                            <div>
                                                <span className="font-semibold">
                                                    {rate.amount} {rate.from_currency?.code}
                                                </span>
                                                <span className="mx-2">→</span>
                                                <span className="font-semibold">
                                                    {rate.to_currency?.code}
                                                </span>
                                            </div>
                                            <div className="flex gap-3">
                                                <span className="text-green-600 font-medium">
                                                    {t('BUYING')}: {rate.buy_rate}
                                                </span>
                                                <span className="text-red-500 font-medium">
                                                    {t('SELLING')}: {rate.sell_rate}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-content-end mt-3">
                            <PrimeButton
                                label={t("CLOSE")}
                                icon="pi pi-times"
                                onClick={() => setShowRatesModal(false)}
                            />
                        </div>
                    </Dialog>

                    {/* Delete Order Dialog */}
                    <Dialog
                        visible={deleteOrderDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM')}
                        modal
                        footer={deleteCompanyDialogFooter}
                        onHide={hideDeleteOrderDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: '#e74c3c' }} />
                            {order && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{order.rechargeble_account}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* Status Change Dialog */}
                    <Dialog
                        visible={statusChangeDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM')}
                        modal
                        footer={
                            <>
                                <PrimeButton
                                    label={t('CANCEL')}
                                    icon="pi pi-times"
                                    severity="secondary"
                                    onClick={() => setStatusChangeDialog(false)}
                                />
                                <PrimeButton
                                    label={t('CONFIRM')}
                                    icon="pi pi-check"
                                    severity="success"
                                    onClick={changeOrderStatus}
                                />
                            </>
                        }
                        onHide={() => setStatusChangeDialog(false)}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: '#f39c12' }} />
                            {selectedHawalaForAction && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_STATUS')} <b>#{selectedHawalaForAction.hawala_number}</b> to{' '}
                                    {selectedStatus === 2 ? t('ORDER.STATUS.REJECTED') : t('ORDER.STATUS.CONFIRMED')}?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* Confirmation Dialog with Hawala Number Input */}
                    <Dialog
                        visible={confirmationDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM_HAWALA')}
                        modal
                        footer={
                            <>
                                <PrimeButton
                                    label={t('CANCEL')}
                                    icon="pi pi-times"
                                    severity="secondary"
                                    onClick={() => {
                                        setConfirmationDialog(false);
                                        setHawalaNumberInput('');
                                    }}
                                />
                                <PrimeButton
                                    label={t('CONFIRM')}
                                    icon="pi pi-check"
                                    severity="success"
                                    onClick={finalizeHawalaConfirmation}
                                    disabled={!hawalaNumberInput.trim() || fetchingNextNumber}
                                    loading={fetchingNextNumber}
                                />
                            </>
                        }
                        onHide={() => {
                            setConfirmationDialog(false);
                            setHawalaNumberInput('');
                        }}
                    >
                        <div className="field">
                            <label htmlFor="hawalaNumber" className="font-medium block mb-2">
                                {t('HAWALA_NUMBER')} *
                            </label>
                            <Input
                                id="hawalaNumber"
                                value={hawalaNumberInput}
                                onChange={(e) => setHawalaNumberInput(e.target.value)}
                                placeholder={t('ENTER_HAWALA_NUMBER')}
                                className="w-full"
                                autoFocus
                            />
                        </div>
                        {selectedHawalaForAction && (
                            <div className="flex align-items-center mt-3">
                                <i className="pi pi-info-circle mr-3" style={{ fontSize: '1.5rem', color: '#3498db' }} />
                                <span className="text-sm">
                                    {t('CONFIRM_HAWALA_NUMBER_FOR')} <b>#{selectedHawalaForAction.hawala_number}</b>
                                </span>
                            </div>
                        )}
                    </Dialog>

                    {/* View Hawala Dialog */}
                    <Dialog
                        visible={viewHawalaDialog}
                        style={{ width: '380px', maxWidth: '95vw', padding: 0 }}
                        header={null}
                        modal
                        onHide={() => setViewHawalaDialog(false)}
                        closable={false}
                    >
                        <div id="hawala-view-modal" style={{ backgroundColor: 'white', fontFamily: "'iranyekan', sans-serif,iranyekan" }}>
                            {selectedHawala && (
                                <div style={{ background: 'white' }}>
                                    {/* Header */}
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '0.5rem 0.5rem',
                                        borderBottom: '2px dashed #e5e7eb',
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                                    }}>
                                        <div>
                                            <img src={process.env.NEXT_PUBLIC_PROJECT_LOGO} alt="" className='h-2 w-2' />
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            color: '#1f2937',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {t('HAWALA_DETAILS')}
                                        </div>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 1rem',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            backgroundColor: selectedHawala.status === 'confirmed' ? '#10b981' :
                                                selectedHawala.status === 'rejected' ? '#ef4444' :
                                                    selectedHawala.status === 'cancelled' ? '#dc2626' :
                                                        selectedHawala.status === 'under_process' ? '#f59e0b' : '#6b7280',
                                            color: 'white'
                                        }}>
                                            {selectedHawala.status === 'pending' ? t('ORDER.STATUS.PENDING') :
                                                selectedHawala.status === 'confirmed' ? t('ORDER.STATUS.CONFIRMED') :
                                                    selectedHawala.status === 'rejected' ? t('ORDER.STATUS.REJECTED') :
                                                        selectedHawala.status === 'under_process' ? t('ORDER.STATUS.UNDER_PROCESS') :
                                                            selectedHawala.status === 'cancelled' ? t('ORDER.STATUS.CANCELLED') :
                                                                t('ORDER.STATUS.UNKNOWN')}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '1rem 0.75rem' }}>
                                        {/* Hawala Number */}
                                        {!selectedHawala?.hawala_custom_number && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.HAWALA_NUMBER')}</span>
                                                <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala.hawala_number}</span>
                                            </div>
                                        )}

                                        {/* Hawala Custom Number */}
                                        {selectedHawala?.hawala_custom_number && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.HAWALA_NUMBER')}</span>
                                                <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala?.hawala_custom_number || '...'}</span>
                                            </div>
                                        )}

                                        {/* Sender Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.SENDER_NAME')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala.sender_name}</span>
                                        </div>

                                        {/* Receiver Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.RECEIVER_NAME')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala.receiver_name}</span>
                                        </div>

                                        {/* Receiver fATHER */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('RECEIVER_FATHERS_NAME')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala?.receiver_father_name || '...'}</span>
                                        </div>

                                        {/* Receiver ID CARD NUMBER */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('RECEIVER_ID_CARD_NUMBER')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala?.receiver_id_card_number || '...'}</span>
                                        </div>

                                        {/* Hawala Amount */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('AMOUNT')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedHawala.hawala_amount} {selectedHawala.hawala_amount_currency_code}
                                            </span>
                                        </div>

                                        {/* Reseller Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('SERVICE_PROVIDER')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala.reseller?.reseller_name || '-'}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('ORDER.TABLE.COLUMN.ORDEREDDATE')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedHawala.created_at
                                                    ? new Date(selectedHawala.created_at).toLocaleString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true
                                                    })
                                                    : "-"}
                                            </span>
                                        </div>

                                        {/* Admin Note */}
                                        {selectedHawala.admin_note && (
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                backgroundColor: '#f0f9ff',
                                                border: '1px solid #bae6fd'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: '600' }}>{t('HAWALA.TABLE.COLUMN.ADMIN_NOTE')}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: '1rem' }}>
                                                        {selectedHawala.admin_note}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hawala branch */}
                                        {selectedHawala?.branch?.name && (
                                            <div className='bg-blue-100 p-2 mt-2 rounded-xl shadow-sm'>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('MENU.HAWALA_BRANCH')}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala?.branch?.name}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('ADDRESS')}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala?.branch?.address}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PHONE_NUMBER')}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala?.branch?.phone_number}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div style={{
                                        padding: '0.75rem',
                                        borderTop: '2px dashed #e5e7eb',
                                        display: 'flex',
                                        gap: '0.5rem',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <PrimeButton
                                            label={t('APP.GENERAL.CANCEL')}
                                            icon="pi pi-times"
                                            onClick={() => setViewHawalaDialog(false)}
                                            className="p-button-text p-button-sm"
                                            style={{ minWidth: '90px' }}
                                        />
                                        <PrimeButton
                                            label={t('DOWNLOAD')}
                                            icon="pi pi-download"
                                            onClick={downloadHawalaAsImage}
                                            className="p-button-success p-button-sm"
                                            style={{ minWidth: '90px' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Dialog>

            <FormSheet
                open={addHawalaDialog}
                onOpenChange={(open) => {
                    if (!open) closeAddHawalaDialog();
                }}
                title={t('ADD_HAWALA_ORDER', { defaultValue: 'ثبت حواله جدید' })}
                description={t('ADD_HAWALA_SHEET_DESC', { defaultValue: 'فرستنده، گیرنده، مبلغ و شعبه را تکمیل کنید' })}
                size="full"
                side="left"
                footer={
                    <FormActions
                        onCancel={closeAddHawalaDialog}
                        onSubmit={handleAddHawalaSubmit}
                        submitDisabled={Boolean(
                            formData.hawalaAmount &&
                                formData.currencyCodeId &&
                                (hawalaQuote.missingRate || hawalaQuote.invalidCommission)
                        )}
                        submitLabel={t('SAVE', { defaultValue: 'ذخیره' })}
                        cancelLabel={t('CANCEL', { defaultValue: 'انصراف' })}
                    />
                }
            >
                <div className="mb-1 flex justify-end">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowRatesModal(true)}>
                        <Info className="h-4 w-4" />
                        {t('TODAYS_RATE', { defaultValue: 'نرخ امروز' })}
                    </Button>
                </div>

                <FormSection className="gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        label={t('PAYMENT.FORM.INPUT.RESELLER', { defaultValue: 'نماینده' })}
                        required
                        error={submitted && !formData.reseller ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <CustomDropdownWithSearch
                            id="reseller"
                            value={formData.reseller}
                            options={resellers}
                            onChange={(selectedOption) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    reseller: selectedOption
                                }));
                            }}
                            optionLabel="reseller_name"
                            filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                            placeholder={t('PAYMENT.FORM.INPUT.RESELLER')}
                            className="w-full"
                            panelClassName="min-w-[15rem]"
                            searchButtonText={t('ECOMMERCE.COMMON.SEARCH')}
                            error={submitted && !formData.reseller}
                            errorMessage={t('THIS_FIELD_IS_REQUIRED')}
                            showClear={true}
                            emptyMessage={t('NO_RESULTS_FOUND')}
                            noResultsMessage={t('TRY_DIFFERENT_SEARCH_TERM')}
                            returnFullObject={true}
                            itemTemplate={(option) => {
                                if (!option) return null;
                                return (
                                    <div className="flex flex-col gap-1 p-2 text-sm">
                                        <div className="font-semibold">
                                            {option.contact_name} || {option.reseller_name}
                                        </div>
                                        {option.phone ? (
                                            <span className="text-muted-foreground">{option.phone}</span>
                                        ) : null}
                                    </div>
                                );
                            }}
                            valueTemplate={(option) => {
                                if (!option) return t('PAYMENT.FORM.INPUT.RESELLER');
                                return (
                                    <div className="flex flex-col text-sm">
                                        <span className="font-bold">{option.reseller_name}</span>
                                        <small className="text-xs text-muted-foreground">
                                            {option.contact_name}
                                            {option.phone ? ` | ${option.phone}` : ''}
                                        </small>
                                    </div>
                                );
                            }}
                            onSearch={(searchTerm) => {
                                setResellerSearchTerm(searchTerm);
                            }}
                        />
                    </FormField>

                    {formData.reseller ? (
                        <FormField label={t('RESELLER.PROFILE.WALLET_BALANCE', { defaultValue: 'موجودی کیف' })}>
                            <Input
                                value={`${formatQuote(Number(formData.reseller.balance || 0))} ${currencyFaName(walletCurrency || { code: formData.reseller.code })}`}
                                disabled
                            />
                        </FormField>
                    ) : null}

                    <FormField
                        label={t('SENDER_NAME', { defaultValue: 'نام فرستنده' })}
                        required
                        error={submitted && !formData.senderName ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="senderName"
                            name="senderName"
                            value={formData.senderName}
                            onChange={handleInputChange}
                            placeholder={t('SENDER_NAME')}
                            className={cn('w-full', submitted && !formData.senderName && 'border-rose-300')}
                        />
                    </FormField>

                    <FormField
                        label={t('RECEIVER_NAME', { defaultValue: 'نام گیرنده' })}
                        required
                        error={submitted && !formData.receiverName ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="receiverName"
                            name="receiverName"
                            value={formData.receiverName}
                            onChange={handleInputChange}
                            placeholder={t('RECEIVER_NAME')}
                            className={cn('w-full', submitted && !formData.receiverName && 'border-rose-300')}
                        />
                    </FormField>

                    <FormField
                        label={t('RECEIVER_FATHERS_NAME', { defaultValue: 'نام پدر گیرنده' })}
                        required
                        error={submitted && !formData.receiverFatherName ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="receiverFatherName"
                            name="receiverFatherName"
                            value={formData.receiverFatherName}
                            onChange={handleInputChange}
                            placeholder={t('RECEIVER_FATHERS_NAME')}
                            className={cn('w-full', submitted && !formData.receiverFatherName && 'border-rose-300')}
                        />
                    </FormField>

                    <FormField
                        label={t('RECEIVER_ID_CARD_NUMBER', { defaultValue: 'شماره تذکره گیرنده' })}
                        required
                        error={submitted && !formData.receiverIdCardNumber ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="receiverIdCardNumber"
                            name="receiverIdCardNumber"
                            value={formData.receiverIdCardNumber}
                            onChange={handleInputChange}
                            placeholder={t('RECEIVER_ID_CARD_NUMBER')}
                            inputMode="numeric"
                            className={cn('w-full', submitted && !formData.receiverIdCardNumber && 'border-rose-300')}
                        />
                    </FormField>

                    <FormField
                        label={t('HAWALA_AMOUNT', { defaultValue: 'مبلغ حواله' })}
                        required
                        error={submitted && !formData.hawalaAmount ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="hawalaAmount"
                            name="hawalaAmount"
                            value={formData.hawalaAmount}
                            onChange={handleInputChange}
                            placeholder={t('HAWALA_AMOUNT', { defaultValue: 'مبلغ حواله' })}
                            inputMode="decimal"
                            className={cn('w-full tabular-nums', submitted && !formData.hawalaAmount && 'border-rose-300')}
                        />
                    </FormField>

                    <FormField
                        label={t('CURRENCY', { defaultValue: 'ارز' })}
                        required
                        error={
                            submitted && !formData.currencyCodeId
                                ? t('THIS_FIELD_IS_REQUIRED')
                                : submitted && hawalaQuote.missingRate
                                  ? t('RESELLER.PROFILE.NO_BOARD_RATE', { defaultValue: 'نرخ این جفت ارز در تابلو ثبت نشده' })
                                  : null
                        }
                    >
                        <Select
                            value={formData.currencyCodeId ? String(formData.currencyCodeId) : ''}
                            onValueChange={(value) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    currencyCodeId: value
                                }))
                            }
                        >
                            <SelectTrigger
                                id="currencyCodeId"
                                className={cn('w-full', submitted && !formData.currencyCodeId && 'border-rose-300')}
                            >
                                <SelectValue placeholder={t('SELECT_CURRENCY')} />
                            </SelectTrigger>
                            <SelectContent>
                                {(currencies || []).map((currency: Currency) => (
                                    <SelectItem key={currency.id} value={String(currency.id)}>
                                        {currency.code}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label={t('COMMISSION_AMOUNT', { defaultValue: 'کارمزد' })}
                        error={
                            hawalaQuote.invalidCommission
                                ? t('HAWALA_COMMISSION_TOO_HIGH', { defaultValue: 'کارمزد باید کمتر از مبلغ حواله باشد' })
                                : null
                        }
                    >
                        <Input
                            id="commissionAmount"
                            name="commissionAmount"
                            value={formData.commissionAmount}
                            onChange={handleInputChange}
                            placeholder="0"
                            inputMode="decimal"
                            className="w-full tabular-nums"
                        />
                    </FormField>

                    <FormField label={t('COMMISSION_PAID_BY', { defaultValue: 'کارمزد توسط' })}>
                        <div className="flex flex-wrap items-center gap-3 pt-1.5">
                            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                                <input
                                    type="radio"
                                    id="commissionSender"
                                    name="commissionPaidBy"
                                    value="sender"
                                    checked={formData.commissionPaidBy === 'sender'}
                                    onChange={handleInputChange}
                                />
                                {t('SENDER', { defaultValue: 'فرستنده' })}
                            </label>
                            <label className="flex cursor-pointer items-center gap-1.5 text-sm">
                                <input
                                    type="radio"
                                    id="commissionReceiver"
                                    name="commissionPaidBy"
                                    value="receiver"
                                    checked={formData.commissionPaidBy === 'receiver'}
                                    onChange={handleInputChange}
                                />
                                {t('RECEIVER', { defaultValue: 'گیرنده' })}
                            </label>
                        </div>
                    </FormField>

                    <FormField
                        label={t('HAWALA_BRANCH', { defaultValue: 'شعبه حواله' })}
                        required
                        error={submitted && !formData.branchId ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Select
                            value={formData.branchId ? String(formData.branchId) : ''}
                            onValueChange={(value) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    branchId: value,
                                    customHawalaNumber: ''
                                }));
                            }}
                        >
                            <SelectTrigger
                                id="branchId"
                                className={cn('w-full', submitted && !formData.branchId && 'border-rose-300')}
                            >
                                <SelectValue placeholder={t('SELECT_BRANCH')} />
                            </SelectTrigger>
                            <SelectContent>
                                {(hawalaBranches || []).map((branch: { id: number; name: string }) => (
                                    <SelectItem key={branch.id} value={String(branch.id)}>
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label={t('CUSTOM_HAWALA_NUMBER', { defaultValue: 'شماره اختصاصی' })}>
                        <div className="flex gap-2">
                            <Input
                                id="customHawalaNumber"
                                name="customHawalaNumber"
                                value={formData.customHawalaNumber}
                                onChange={handleInputChange}
                                placeholder={fetchingNextNumber ? t('GENERATING_HAWALA_NUMBER') : t('CUSTOM_HAWALA_NUMBER')}
                                className={cn(
                                    'w-full flex-1 tabular-nums',
                                    !!formData.customHawalaNumber && !!formData.branchId && 'bg-emerald-50'
                                )}
                            />
                            {formData.customHawalaNumber && formData.branchId ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title={t('REGENERATE_NUMBER', { defaultValue: 'تولید مجدد شماره' })}
                                    onClick={() => {
                                        if (formData.branchId) {
                                            fetchNextHawalaNumber(formData.branchId);
                                        }
                                    }}
                                >
                                    <RefreshCw className={cn('h-4 w-4', fetchingNextNumber && 'animate-spin')} />
                                </Button>
                            ) : null}
                        </div>
                    </FormField>

                    {(hawalaQuote.debit != null || hawalaQuote.payout != null || hawalaQuote.missingRate || hawalaQuote.invalidCommission) && (
                        <div className="col-span-full rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2">
                            <div className="grid gap-2 sm:grid-cols-2">
                                {hawalaQuote.debit != null ? (
                                    <div className="text-sm">
                                        <div className="text-[11px] text-muted-foreground">
                                            {t('RESELLER.PROFILE.DEBIT_FROM_BALANCE', { defaultValue: 'از موجودی کم می‌شود' })}
                                        </div>
                                        <div className="font-semibold tabular-nums text-foreground">
                                            {formatQuote(hawalaQuote.debit)}{' '}
                                            {currencyFaName(walletCurrency || { code: formData.reseller?.code })}
                                        </div>
                                    </div>
                                ) : null}
                                {hawalaQuote.payout != null ? (
                                    <div className="text-sm">
                                        <div className="text-[11px] text-muted-foreground">
                                            {t('RESELLER.PROFILE.RECEIVER_GETS', { defaultValue: 'گیرنده می‌گیرد' })}
                                        </div>
                                        <div className="font-semibold tabular-nums text-emerald-800">
                                            {formatQuote(hawalaQuote.payout)} {currencyFaName({ code: hawalaQuote.payoutCurrencyCode })}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            {formData.commissionPaidBy === 'receiver' && Number(formData.commissionAmount || 0) > 0 && hawalaQuote.payout != null ? (
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                    {t('HAWALA_RECEIVER_PAYS_HINT', {
                                        defaultValue: 'کارمزد از مبلغ حواله کم می‌شود؛ گیرنده مبلغ خالص را می‌گیرد'
                                    })}
                                </p>
                            ) : null}
                            {hawalaQuote.missingRate ? (
                                <p className="mt-1 text-[11px] text-destructive">
                                    {t('RESELLER.PROFILE.NO_BOARD_RATE', { defaultValue: 'نرخ این جفت ارز در تابلو ثبت نشده' })}
                                </p>
                            ) : null}
                            {hawalaQuote.invalidCommission ? (
                                <p className="mt-1 text-[11px] text-destructive">
                                    {t('HAWALA_COMMISSION_TOO_HIGH', { defaultValue: 'کارمزد باید کمتر از مبلغ حواله باشد' })}
                                </p>
                            ) : null}
                        </div>
                    )}

                    <FormField label={t('ADMIN_NOTE', { defaultValue: 'یادداشت مدیر' })} fullWidth>
                        <Textarea
                            id="adminNote"
                            name="adminNote"
                            value={formData.adminNote}
                            onChange={handleInputChange}
                            placeholder={t('ADMIN_NOTE_PLACEHOLDER', { defaultValue: 'یادداشت اختیاری...' })}
                            rows={2}
                            className="w-full"
                        />
                    </FormField>
                </FormSection>
            </FormSheet>
        </>
    );
};

function hawalaStatusLabel(t: (key: string, options?: object) => string, status?: string) {
    if (status === 'pending') return t('ORDER.STATUS.PENDING');
    if (status === 'confirmed') return t('ORDER.STATUS.CONFIRMED');
    if (status === 'rejected') return t('ORDER.STATUS.REJECTED');
    if (status === 'under_process') return t('ORDER.STATUS.UNDER_PROCESS');
    if (status === 'cancelled') return t('ORDER.STATUS.CANCELLED');
    return t('ORDER.STATUS.UNKNOWN', { defaultValue: 'نامشخص' });
}

function hawalaStatusVariant(status?: string): 'warning' | 'success' | 'danger' | 'muted' | 'secondary' {
    if (status === 'pending' || status === 'under_process') return 'warning';
    if (status === 'confirmed') return 'success';
    if (status === 'rejected') return 'danger';
    if (status === 'cancelled') return 'muted';
    return 'secondary';
}

function formatHawalaDateTime(dateString?: string | null) {
    if (!dateString) return { date: '—', time: '—' };
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { date: '—', time: '—' };
    return {
        date: date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }),
        time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
    };
}

export default withAuth(HawalaPage);
