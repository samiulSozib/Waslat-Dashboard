/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import { Payment, Currency } from '@/types/interface';
import {
    _addPayment,
    _deletePayment,
    _editPayment,
    _fetchPayments,
    _invalidatePayment,
    _rollbackedPayment,
    _verifyAndSendPayment,
    _verifyPayment
} from '@/app/redux/actions/paymentActions';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { _fetchPaymentMethods } from '@/app/redux/actions/paymentMethodActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../utilities/rtlUtil';
import { generatePaymentExcelFile } from '../../utilities/generateExcel';
import { useRouter, useSearchParams } from 'next/navigation';
import CustomDropdownWithSearch from '@/app/(main)/components/customDropDownWithSearch';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FilterField, FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { RowActions } from '@/components/admin/row-actions';
import { FormSheet, FormSection, FormField, FormActions } from '@/components/admin/form-sheet';
import { Button as UiButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DateField } from '@/components/ui/date-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { CheckCircle, CheckSquare, Download, Pencil, Plus, RefreshCw, RotateCcw, XCircle } from 'lucide-react';

type PaymentFilters = {
    filter_status: string | null;
    filter_payment_method: number | null;
    filter_startdate: string | null;
    filter_enddate: string | null;
};

const emptyPaymentFilters: PaymentFilters = {
    filter_status: null,
    filter_payment_method: null,
    filter_startdate: null,
    filter_enddate: null
};

function compactFilters(filters: PaymentFilters) {
    const out: Record<string, string | number> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') out[key] = value as string | number;
    });
    return out;
}

function paymentStatusVariant(status?: string): 'success' | 'warning' | 'danger' | 'muted' {
    const s = status?.toLowerCase();
    if (s === 'completed') return 'success';
    if (s === 'pending' || s === 'rollback' || s === 'rollbacked') return 'warning';
    if (s === 'failed' || s === 'rejected') return 'danger';
    return 'muted';
}

function formatPaymentDate(value?: string) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
        return value;
    }
}

const PaymentPage = () => {
    let emptyPayment: Payment = {
        id: 0,
        reseller_id: 0,
        payment_method_id: 0,
        amount: '',
        remaining_payment_amount: '',
        currency_id: 0,
        transaction_id: 0,
        status: '',
        notes: '',
        payment_date: '',
        created_at: '',
        updated_date: '',
        reseller: null,
        payment_method: null,
        currency: null,
        operation_type: 'credit'
    };

    const [paymentDialog, setPaymentDialog] = useState(false);
    const [deletePaymentDialog, setDeletePaymentDialog] = useState(false);
    const [deletePaymentsDialog, setDeletePaymentsDialog] = useState(false);
    const [payment, setPayment] = useState<Payment>(emptyPayment);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { payments, loading, pagination } = useSelector((state: any) => state.paymentReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const { paymentMethods } = useSelector((state: any) => state.paymentMethodsReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { t } = useTranslation();
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [filterOpen, setFilterOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState<PaymentFilters>(emptyPaymentFilters);
    const [activeFilters, setActiveFilters] = useState<PaymentFilters>(emptyPaymentFilters);
    const [refreshing, setRefreshing] = useState(false);
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');
    const [rollbackDialog, setRollbackDialog] = useState(false);
    const [invalidateDialog, setInvalidateDialog] = useState(false);
    const [invalidateNotes, setInvalidateNotes] = useState('');
    const [verifyDialog, setVerifyDialog] = useState(false);
    const [verifyAndSendDialog, setVerifyAndSendDialog] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [showVerifyNotes, setShowVerifyNotes] = useState(false);
    const [showVerifyAndSendNotes, setShowVerifyAndSendNotes] = useState(false);
    const [viewPaymentDialog, setViewPaymentDialog] = useState(false);
    const [rollbackType, setRollbackType] = useState<'rollback' | 'rollback_full'>('rollback');
    const isEditPayment = Boolean(payment.id && payment.id !== 0);

    // useEffect(() => {
    //     dispatch(_fetchPayments(1, searchTag, activeFilters));
    //     dispatch(_fetchResellers(1, '', '', 10000));
    //     dispatch(_fetchPaymentMethods());
    //     dispatch(_fetchCurrencies());
    // }, [dispatch, searchTag, activeFilters]);

    // Near your other useEffect hooks (around line 97-103)

    // 1. Always fetch payments when search or filters change
    useEffect(() => {
        dispatch(_fetchPayments(1, searchTag, compactFilters(activeFilters)));
    }, [dispatch, searchTag, activeFilters]);

    // 2. Fetch dropdown data when add/edit dialog opens
    useEffect(() => {
        if (paymentDialog) {
            // Fetch all required dropdown data
            if (resellers.length === 0) {
                dispatch(_fetchResellers(1, '', '', 15));
            }
            if (paymentMethods.length === 0) {
                dispatch(_fetchPaymentMethods());
            }
            if (currencies.length === 0) {
                dispatch(_fetchCurrencies());
            }
        }
    }, [paymentDialog, dispatch, resellers.length, paymentMethods.length, currencies.length]);

    useEffect(() => {
        if (!filterOpen) return;
        if (paymentMethods.length === 0) dispatch(_fetchPaymentMethods());
        if (currencies.length === 0) dispatch(_fetchCurrencies());
    }, [filterOpen, dispatch, paymentMethods.length, currencies.length]);

    // Keep the existing reseller search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (resellerSearchTerm) {
                dispatch(_fetchResellers(1, resellerSearchTerm));
            } else if (paymentDialog) {
                // Only fetch if dialog is open
                dispatch(_fetchResellers(1, ''));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [resellerSearchTerm, dispatch, paymentDialog]);

    // Add this useEffect to handle auto-opening the dialog
    const searchParams = useSearchParams(); // Add this
    const router = useRouter()

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            // Small delay to ensure the page is fully loaded and Redux state is ready
            const timer = setTimeout(() => {
                openNew();
                // Optional: Clean up the URL after opening the dialog
                router.replace('/pages/payment');
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    const openNew = () => {
        setPayment(emptyPayment);
        setSubmitted(false);
        setPaymentDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPaymentDialog(false);
        setResellerBalance(null);
        setResellerPayment(null);
        setResellerLoan(null);
    };

    const hideDeletePaymentDialog = () => {
        setDeletePaymentDialog(false);
    };

    const hideDeletePaymentsDialog = () => {
        setDeletePaymentsDialog(false);
    };

    const viewPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setViewPaymentDialog(true);
    };

    const downloadPaymentAsImage = () => {
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
                link.download = `hawala-${selectedPayment?.id}-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    };

    const savePayment = () => {
        setSubmitted(true);
        if (!payment.reseller || !payment.amount || !payment.payment_method || !payment.currency || !payment.payment_date) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (payment.id && payment.id !== 0) {
            dispatch(_editPayment(payment.id, payment, toast, t));
        } else {
            dispatch(_addPayment(payment, toast, t));
        }

        setPaymentDialog(false);
        setPayment(emptyPayment);
        setSubmitted(false);
    };

    const editPayment = (payment: Payment) => {
        const matchingReseller = resellers.find((r: any) => r.id === payment.reseller?.id);

        setPayment({ ...payment, reseller: matchingReseller });
        console.log(payment.reseller);
        setPaymentDialog(true);
    };

    const confirmDeletePayment = (payment: Payment) => {
        setPayment(payment);
        setDeletePaymentDialog(true);
    };

    const deletePayment = () => {
        if (!payment?.id) {
            console.error('Payment  ID is undefined.');
            return;
        }
        dispatch(_deletePayment(payment?.id, toast, t));
        setDeletePaymentDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeletePaymentsDialog(true);
    };

    const confirmRollbackPayment = (payment: Payment) => {
        setPayment(payment);
        setRollbackDialog(true);
        setRollbackType("rollback")
    };

    const rollbackPayment = () => {
        if (!payment?.id) {
            console.error('Payment  ID is undefined.');
            return;
        }
        dispatch(_rollbackedPayment(payment?.id, toast, t, rollbackType));
        hideRollbackDialog();
    };

    const confirmInvalidatePayment = (payment: Payment) => {
        setPayment(payment);
        setInvalidateNotes('');
        setInvalidateDialog(true);
    };

    const handleInvalidatePayment = () => {
        if (!payment?.id) {
            console.error('Payment ID is undefined.');
            return;
        }

        dispatch(_invalidatePayment(payment?.id, invalidateNotes, toast, t));

        setInvalidateDialog(false);
    };

    const hideInvalidateDialog = () => {
        setInvalidateDialog(false);
    };

    const hideRollbackDialog = () => {
        setRollbackDialog(false);
        setRollbackType("rollback")
    };

    const handleVerifyPayment = () => {
        if (!payment?.id) {
            console.error('Payment ID is undefined.');
            return;
        }

        const notes = showVerifyNotes ? verificationNotes : '';
        dispatch(_verifyPayment(payment?.id, notes, toast, t));
        hideVerifyDialog();
    };

    const handleVerifyAndSendPayment = () => {
        if (!payment?.id) {
            console.error('Payment ID is undefined.');
            return;
        }

        const notes = showVerifyAndSendNotes ? verificationNotes : '';
        dispatch(_verifyAndSendPayment(payment?.id, notes, toast, t));
        hideVerifyAndSendDialog();
    };

    const hideVerifyDialog = () => {
        setVerifyDialog(false);
        setShowVerifyNotes(false);
        setVerificationNotes('');
    };

    const hideVerifyAndSendDialog = () => {
        setVerifyAndSendDialog(false);
        setShowVerifyAndSendNotes(false);
        setVerificationNotes('');
    };

    const confirmVerifyPayment = (payment: Payment) => {
        setPayment(payment);
        setVerificationNotes('');
        setShowVerifyNotes(false);
        setVerifyDialog(true);
    };

    const confirmVerifyAndSendPayment = (payment: Payment) => {
        setPayment(payment);
        setVerificationNotes('');
        setShowVerifyAndSendNotes(false);
        setVerifyAndSendDialog(true);
    };

    const statusLabel = (status?: string) => {
        const s = status?.toLowerCase();
        if (s === 'completed') return t('COMPLETED');
        if (s === 'pending') return t('PENDING');
        if (s === 'failed') return t('FAILED');
        if (s === 'rollbacked') return t('ROLLBACKED', { defaultValue: 'برگشت‌خورده' });
        return status || '—';
    };

    const operationTypeLabel = (type?: string | null) => {
        const v = type?.toLowerCase();
        if (v === 'credit') return 'Credit';
        if (v === 'debit') return 'Debit';
        if (v === 'credit_full') return 'Credit Full';
        if (v === 'debit_full') return 'Debit Full';
        return type || '—';
    };

    const chips = useMemo(() => {
        const list: { key: string; label: string }[] = [];
        if (activeFilters.filter_status) {
            list.push({
                key: 'filter_status',
                label: `${t('PAYMENT.TABLE.COLUMN.STATUS', { defaultValue: 'وضعیت' })}: ${statusLabel(activeFilters.filter_status)}`
            });
        }
        if (activeFilters.filter_payment_method) {
            const method = paymentMethods.find((m: { id: number }) => m.id === activeFilters.filter_payment_method);
            list.push({
                key: 'filter_payment_method',
                label: `${t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD', { defaultValue: 'روش پرداخت' })}: ${method?.method_name || activeFilters.filter_payment_method}`
            });
        }
        if (activeFilters.filter_startdate) {
            list.push({ key: 'filter_startdate', label: `${t('START_DATE', { defaultValue: 'از تاریخ' })}: ${activeFilters.filter_startdate}` });
        }
        if (activeFilters.filter_enddate) {
            list.push({ key: 'filter_enddate', label: `${t('END_DATE', { defaultValue: 'تا تاریخ' })}: ${activeFilters.filter_enddate}` });
        }
        return list;
    }, [activeFilters, paymentMethods, t]);

    const applyFilters = () => {
        setActiveFilters(draftFilters);
        setFilterOpen(false);
    };

    const clearFilters = () => {
        setDraftFilters(emptyPaymentFilters);
        setActiveFilters(emptyPaymentFilters);
        setFilterOpen(false);
    };

    const removeChip = (key: string) => {
        const next = { ...activeFilters, [key]: null } as PaymentFilters;
        setActiveFilters(next);
        setDraftFilters(next);
    };

    const getPaymentRowActions = (rowData: Payment) => {
        const isRollbacked = rowData.status === 'rollbacked';
        const isCompleted = rowData.status === 'completed';
        const isPending = rowData.status === 'pending';

        if (isRollbacked) return [];

        if (isCompleted) {
            return [
                {
                    label: t('ROLLBACK'),
                    icon: <RotateCcw className="h-4 w-4" />,
                    onClick: () => confirmRollbackPayment(rowData)
                }
            ];
        }

        if (isPending) {
            return [
                {
                    label: t('Invalidate'),
                    icon: <XCircle className="h-4 w-4" />,
                    onClick: () => confirmInvalidatePayment(rowData)
                },
                {
                    label: t('Verify'),
                    icon: <CheckCircle className="h-4 w-4" />,
                    onClick: () => confirmVerifyPayment(rowData)
                },
                {
                    label: t('Verify_and_send'),
                    icon: <CheckSquare className="h-4 w-4" />,
                    onClick: () => confirmVerifyAndSendPayment(rowData)
                },
                { label: t('ROLLBACK'), icon: <RotateCcw className="h-4 w-4" />, onClick: () => confirmRollbackPayment(rowData), separatorBefore: true },
                { label: t('EDIT'), icon: <Pencil className="h-4 w-4" />, onClick: () => editPayment(rowData) }
            ];
        }

        return [];
    };

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 20)));

    const paymentDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={savePayment} />
        </>
    );
    const deletePaymentDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeletePaymentDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deletePayment} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeletePaymentsDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );
    const rollbackDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideRollbackDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={rollbackPayment} />
        </>
    );

    useEffect(() => {
        const currencyCode = payment?.reseller?.code || '';

        const selectedCurrency = currencies.find((currency: Currency) => currency.code === currencyCode);

        if (selectedCurrency) {
            setPayment((prev) => ({
                ...prev,
                currency_id: selectedCurrency.id,
                currency: selectedCurrency
            }));
        }
    }, [payment?.reseller?.code, currencies]);

    const onPageChange = (page: number) => {
        dispatch(_fetchPayments(page, searchTag, compactFilters(activeFilters)));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchPayments(pagination?.page || 1, searchTag, compactFilters(activeFilters)) as any);
        setRefreshing(false);
    };

    const exportToExcel = async () => {
        await generatePaymentExcelFile({
            t,
            toast,
            all: true
        });
    };


    const [resellerBalance, setResellerBalance] = useState<any>(null);
    const [resellerPayment, setResellerPayment] = useState<any>(null);
    const [resellerLoan, setResellerLoan] = useState<any>(null);

    useEffect(() => {
        if (payment.reseller) {
            const formattedCurrency = payment.currency?.code || '';

            const resellerBalanceValue = Number(payment.reseller?.balance ?? 0);
            const totalSent = Number(payment.reseller?.total_balance_sent ?? 0);
            const totalReceived = Number(payment.reseller?.total_payments_received ?? 0);
            const paymentDiff = totalSent - totalReceived;

            const totalPayments = Number(payment?.reseller?.total_payments_received) || 0;
            const totalBalance = Number(payment?.reseller?.total_balance_sent) || 0;
            const availablePaymentAmount = totalPayments - totalBalance;

            setResellerBalance(`${resellerBalanceValue} ${formattedCurrency}`);
            //setResellerPayment(`${paymentDiff > 0 ? paymentDiff : 0} ${formattedCurrency}`);
            setResellerPayment(`${availablePaymentAmount > 0 ? availablePaymentAmount : 0} ${formattedCurrency}`)
            setResellerLoan(`${paymentDiff > 0 ? paymentDiff : 0} ${formattedCurrency}`);
        }
    }, [payment.reseller, payment.currency?.code]);

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.PAYMENTS', { defaultValue: 'پرداخت‌ها' })}
                description={t('PAYMENT.PAGE.DESCRIPTION', { defaultValue: 'مدیریت، تایید و ثبت پرداخت‌های نمایندگان' })}
                loading={loading}
                actions={
                    <>
                        <UiButton variant="default" size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('ADD_PAYMENT', { defaultValue: 'افزودن پرداخت' })}
                        </UiButton>
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
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در پرداخت‌ها...' })}
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
                            <UiButton
                                variant="outline"
                                size="sm"
                                disabled={(pagination?.page || 1) <= 1}
                                onClick={() => onPageChange((pagination?.page || 1) - 1)}
                            >
                                قبلی
                            </UiButton>
                            <UiButton
                                variant="outline"
                                size="sm"
                                disabled={(pagination?.page || 1) >= totalPages}
                                onClick={() => onPageChange((pagination?.page || 1) + 1)}
                            >
                                بعدی
                            </UiButton>
                        </div>
                    </div>
                }
            >
                <table className="w-full min-w-[1280px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">
                                {t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                            </th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PAYMENT.TABLE.COLUMN.RESELLER')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PAYMENT.TABLE.COLUMN.AMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PAYMENT.TABLE.COLUMN.CURRENCY')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PAYMENT.FORM.INPUT.OPRATIONTYPE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PAYMENT.TABLE.COLUMN.REMAININGPAYMENTAMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PAYMENT.TABLE.COLUMN.STATUS')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950 max-w-[12rem]">{t('PAYMENT.TABLE.COLUMN.NOTES')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('PERFORMED_BY')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('PAYMENT.TABLE.COLUMN.PAYMENTDATE')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(payments || []).length === 0 ? (
                            <tr>
                                <td colSpan={11} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (payments || []).map((row: Payment) => (
                                <tr
                                    key={row.id}
                                    className="cursor-pointer border-b border-emerald-50 transition hover:bg-emerald-50/50"
                                    onClick={() => viewPayment(row)}
                                >
                                    <td className="px-2 py-1.5 align-middle" onClick={(e) => e.stopPropagation()}>
                                        <RowActions items={getPaymentRowActions(row)} />
                                    </td>
                                    <td className="px-2 py-1.5 text-start">{row.reseller?.reseller_name || '—'}</td>
                                    <td className="px-2 py-1.5 text-start">{row.payment_method?.method_name || '—'}</td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.amount ?? '—'}</td>
                                    <td className="px-2 py-1.5">{row.currency?.code || '—'}</td>
                                    <td className="px-2 py-1.5">
                                        <Badge variant="secondary" className="text-[10px] font-medium">
                                            {operationTypeLabel(row.operation_type)}
                                        </Badge>
                                    </td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.remaining_payment_amount ?? '—'}</td>
                                    <td className="px-2 py-1.5">
                                        <Badge variant={paymentStatusVariant(row.status)} className="text-[10px]">
                                            {statusLabel(row.status)}
                                        </Badge>
                                    </td>
                                    <td className="max-w-[12rem] truncate px-2 py-1.5 text-start text-muted-foreground" title={row.notes || ''}>
                                        {row.notes || '—'}
                                    </td>
                                    <td className="px-2 py-1.5 text-start">{row.performed_by_name || '—'}</td>
                                    <td className="px-2 py-1.5 whitespace-nowrap tabular-nums text-muted-foreground">{formatPaymentDate(row.payment_date)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </ListPage>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side="left" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{t('FILTER', { defaultValue: 'فیلتر پرداخت‌ها' })}</SheetTitle>
                        <SheetDescription>{t('PAYMENT.FILTER.HINT', { defaultValue: 'فیلترها روی نتایج سرور اعمال می‌شوند.' })}</SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <FilterField label={t('PAYMENT.TABLE.COLUMN.STATUS')}>
                            <Select
                                value={draftFilters.filter_status || undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_status: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_STATUS', { defaultValue: 'انتخاب وضعیت' })} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="completed">{t('COMPLETED')}</SelectItem>
                                    <SelectItem value="pending">{t('PENDING')}</SelectItem>
                                    <SelectItem value="failed">{t('FAILED')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>

                        <FilterField label={t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')}>
                            <Select
                                value={draftFilters.filter_payment_method ? String(draftFilters.filter_payment_method) : undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_payment_method: Number(v) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_PAYMENT_METHOD', { defaultValue: 'روش پرداخت' })} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(paymentMethods || []).map((m: { id: number; method_name: string }) => (
                                        <SelectItem key={m.id} value={String(m.id)}>
                                            {m.method_name}
                                        </SelectItem>
                                    ))}
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

            <FormSheet
                open={paymentDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="xl"
                side="left"
                title={
                    isEditPayment
                        ? t('PAYMENT.FORM.EDIT_TITLE', { defaultValue: 'ویرایش پرداخت' })
                        : t('PAYMENT.FORM.CREATE_TITLE', { defaultValue: 'افزودن پرداخت' })
                }
                description={t('PAYMENT.FORM.SHEET_HINT', {
                    defaultValue: 'اطلاعات پرداخت را تکمیل کنید. فیلدهای ستاره‌دار الزامی هستند.'
                })}
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={savePayment}
                        cancelLabel={t('APP.GENERAL.CANCEL', { defaultValue: 'انصراف' })}
                        submitLabel={t('FORM.GENERAL.SUBMIT', { defaultValue: 'ذخیره' })}
                    />
                }
            >
                {resellerBalance !== null && resellerPayment !== null && (
                    <FormSection
                        title={t('PAYMENT.FORM.SECTION.RESELLER_SUMMARY', { defaultValue: 'خلاصه نماینده' })}
                        description={t('PAYMENT.FORM.SECTION.RESELLER_SUMMARY_HINT', {
                            defaultValue: 'پس از انتخاب نماینده، وضعیت مالی او نمایش داده می‌شود.'
                        })}
                    >
                        <div className="sm:col-span-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl bg-emerald-50 p-4 text-center shadow-sm ring-1 ring-emerald-100">
                                <p className="text-sm font-medium text-muted-foreground">{t('BALANCE.FORM.RESELLER.BALANCE')}</p>
                                <p className="mt-2 text-xl font-bold text-emerald-700">{resellerBalance}</p>
                            </div>
                            <div className="rounded-xl bg-rose-50 p-4 text-center shadow-sm ring-1 ring-rose-100">
                                <p className="text-sm font-medium text-muted-foreground">{t('RESELLER.TABLE.COLUMN.AVAILABLEPAYMENT')}</p>
                                <p className="mt-2 text-xl font-bold text-rose-700">{resellerPayment}</p>
                            </div>
                            <div className="rounded-xl bg-violet-50 p-4 text-center shadow-sm ring-1 ring-violet-100">
                                <p className="text-sm font-medium text-muted-foreground">{t('BALANCE.FORM.RESELLER.LOAN')}</p>
                                <p className="mt-2 text-xl font-bold text-violet-700">{resellerLoan}</p>
                            </div>
                        </div>
                    </FormSection>
                )}

                <FormSection
                    title={t('PAYMENT.FORM.SECTION.MAIN', { defaultValue: 'اطلاعات اصلی' })}
                >
                    <FormField
                        label={t('PAYMENT.FORM.INPUT.RESELLER')}
                        required
                        fullWidth
                        error={submitted && !payment.reseller ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <CustomDropdownWithSearch
                            id="reseller"
                            value={payment.reseller}
                            options={resellers}
                            onChange={(selectedOption) => {
                                setPayment((prev) => ({
                                    ...prev,
                                    reseller: selectedOption
                                }));
                            }}
                            optionLabel="reseller_name"
                            filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                            placeholder={t('PAYMENT.FORM.INPUT.RESELLER')}
                            className="w-full"
                            panelClassName="min-w-[20rem]"
                            searchButtonText={t('ECOMMERCE.COMMON.SEARCH')}
                            error={submitted && !payment.reseller}
                            showClear={true}
                            emptyMessage={t('NO_RESULTS_FOUND')}
                            noResultsMessage={t('TRY_DIFFERENT_SEARCH_TERM')}
                            returnFullObject={true}
                            itemTemplate={(option) => {
                                if (!option) return null;
                                return (
                                    <div className="flex flex-column gap-1 p-2">
                                        <div className="font-semibold">
                                            {option.contact_name} || {option.reseller_name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {option.phone && <span className="ms-2 text-gray-500">{option.phone}</span>}
                                        </div>
                                    </div>
                                );
                            }}
                            valueTemplate={(option) => {
                                if (!option) return t('PAYMENT.FORM.INPUT.RESELLER');
                                return (
                                    <div className="flex flex-column">
                                        <span className="font-bold">{option.reseller_name}</span>
                                        <small className="text-xs text-gray-500">
                                            {option.contact_name} {option.phone && `${option.phone}`}
                                        </small>
                                    </div>
                                );
                            }}
                            onSearch={(searchTerm) => {
                                setResellerSearchTerm(searchTerm);
                            }}
                        />
                    </FormField>

                    <FormField
                        label={t('PAYMENT.FORM.INPUT.AMOUNT')}
                        required
                        error={submitted && !payment.amount ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="amount"
                            value={payment.amount || ''}
                            onChange={(e) =>
                                setPayment((prev) => ({
                                    ...prev,
                                    amount: e.target.value
                                }))
                            }
                            required
                            autoFocus={!isEditPayment}
                            placeholder={t('PAYMENT.FORM.INPUT.AMOUNT')}
                            className={cn(submitted && !payment.amount && 'border-rose-400 ring-rose-200')}
                        />
                    </FormField>

                    <FormField
                        label={t('PAYMENT.FORM.INPUT.OPRATIONTYPE')}
                        required
                        error={submitted && !payment.operation_type ? t('REQUIRED') : null}
                    >
                        <Select
                            value={payment.operation_type || undefined}
                            onValueChange={(v) =>
                                setPayment((prev) => ({
                                    ...prev,
                                    operation_type: v
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('PAYMENT.FORM.OPRATIONTYPE.PLACEHOLDER')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="credit">{t('CREDIT', { defaultValue: 'بستانکار' })}</SelectItem>
                                <SelectItem value="debit">{t('DEBIT', { defaultValue: 'بدهکار' })}</SelectItem>
                                <SelectItem value="credit_full">{t('CREDIT_FULL', { defaultValue: 'بستانکار کامل' })}</SelectItem>
                                <SelectItem value="debit_full">{t('DEBIT_FULL', { defaultValue: 'بدهکار کامل' })}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                </FormSection>

                <FormSection
                    title={t('PAYMENT.FORM.SECTION.DETAILS', { defaultValue: 'جزئیات پرداخت' })}
                >
                    <FormField
                        label={t('PAYMENT.FORM.INPUT.PAYMENTMETHOD')}
                        required
                        error={submitted && !payment.payment_method ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <CustomDropdownWithSearch
                            value={payment.payment_method}
                            options={paymentMethods || []}
                            onChange={(selected) =>
                                setPayment((prev) => ({
                                    ...prev,
                                    payment_method: selected
                                }))
                            }
                            optionLabel="method_name"
                            placeholder={t('PAYMENT.FORM.INPUT.PAYMENTMETHOD')}
                            returnFullObject
                            error={submitted && !payment.payment_method}
                        />
                    </FormField>

                    <FormField
                        label={t('PAYMENT.FORM.INPUT.CURRENCY')}
                        required
                        error={submitted && !payment.currency ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <CustomDropdownWithSearch
                            value={payment.currency}
                            options={currencies || []}
                            onChange={(selected) =>
                                setPayment((prev) => ({
                                    ...prev,
                                    currency: selected
                                }))
                            }
                            optionLabel="name"
                            placeholder={t('PAYMENT.FORM.INPUT.CURRENCY')}
                            returnFullObject
                            disabled
                            error={submitted && !payment.currency}
                        />
                    </FormField>

                    <FormField
                        label={t('PAYMENT.FORM.INPUT.PAYMENTDATE')}
                        required
                        error={submitted && !payment.payment_date ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <DateField
                            id="payment_date"
                            value={payment.payment_date || ''}
                            onValueChange={(v) =>
                                setPayment((prev) => ({
                                    ...prev,
                                    payment_date: v
                                }))
                            }
                            required
                            className={cn(submitted && !payment.payment_date && 'border-rose-400 ring-rose-200')}
                        />
                    </FormField>
                </FormSection>

                <FormSection title={t('PAYMENT.FORM.SECTION.NOTES', { defaultValue: 'یادداشت' })}>
                    <FormField label={t('PAYMENT.FORM.INPUT.NOTES')} fullWidth>
                        <Textarea
                            id="notes"
                            value={payment.notes || ''}
                            onChange={(e) =>
                                setPayment((prev) => ({
                                    ...prev,
                                    notes: e.target.value
                                }))
                            }
                            rows={4}
                            placeholder={t('PAYMENT.FORM.INPUT.NOTES')}
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deletePaymentDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deletePaymentDialogFooter} onHide={hideDeletePaymentDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {payment && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b></b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePaymentsDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeletePaymentsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {payment && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>

                    {/* Rollback Confirmation Dialog */}
                    <Dialog visible={rollbackDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={rollbackDialogFooter} onHide={hideRollbackDialog}>
                        <div className="flex flex-column">
                            {payment && <span className="mb-3">{t('ARE_YOU_SURE_YOU_WANT_TO_ROLLBACK')}?</span>}

                            {(payment?.operation_type === 'credit_full' || payment?.operation_type === 'debit_full') && (
                                <div className="field-checkbox w-full">
                                    <Checkbox
                                        id="rollbackFull"
                                        checked={rollbackType === 'rollback_full'}
                                        onCheckedChange={(checked) => setRollbackType(checked ? 'rollback_full' : 'rollback')}
                                    />
                                    <label htmlFor="rollbackFull" className="ms-2">
                                        {t('ROLLBACK_FULL')}
                                    </label>
                                </div>
                            )}
                        </div>
                    </Dialog>

                    {/* invalidate dialog */}
                    <Dialog
                        visible={invalidateDialog}
                        style={{ width: '450px' }}
                        header={t('INVALIDATE_PAYMENT')}
                        modal
                        onHide={hideInvalidateDialog}
                        footer={
                            <>
                                <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideInvalidateDialog} />
                                <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={handleInvalidatePayment} />
                            </>
                        }
                    >
                        <div className="p-fluid">
                            <div className="field">
                                <label htmlFor="invalidateNotes">{t('NOTES')}</label>
                                <Textarea id="invalidateNotes" value={invalidateNotes} onChange={(e) => setInvalidateNotes(e.target.value)} rows={3} placeholder={t('ENTER_INVALIDATION_REASON')} autoFocus />
                            </div>
                        </div>
                    </Dialog>
                    {/* Verify Payment Dialog */}
                    <Dialog
                        visible={verifyDialog}
                        style={{ width: '450px' }}
                        header={t('VERIFY_PAYMENT')}
                        modal
                        onHide={hideVerifyDialog}
                        footer={
                            <>
                                <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideVerifyDialog} />
                                <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={handleVerifyPayment} />
                            </>
                        }
                    >
                        <div className="p-fluid">
                            <div className="field-checkbox mb-3">
                                <Checkbox id="showVerifyNotes" checked={showVerifyNotes} onCheckedChange={(checked) => setShowVerifyNotes(!!checked)} />
                                <label htmlFor="showVerifyNotes">{t('ADD_NOTES')}</label>
                            </div>

                            {showVerifyNotes && (
                                <div className="field">
                                    <label htmlFor="verificationNotes">{t('NOTES')}</label>
                                    <Textarea id="verificationNotes" value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} rows={3} placeholder={t('ENTER_VERIFICATION_NOTES')} />
                                </div>
                            )}
                        </div>
                    </Dialog>

                    {/* Verify and Send Payment Dialog */}
                    <Dialog
                        visible={verifyAndSendDialog}
                        style={{ width: '450px' }}
                        header={t('VERIFY_AND_SEND_PAYMENT')}
                        modal
                        onHide={hideVerifyAndSendDialog}
                        footer={
                            <>
                                <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideVerifyAndSendDialog} />
                                <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={handleVerifyAndSendPayment} />
                            </>
                        }
                    >
                        <div className="p-fluid">
                            <div className="field-checkbox mb-3">
                                <Checkbox id="showVerifyAndSendNotes" checked={showVerifyAndSendNotes} onCheckedChange={(checked) => setShowVerifyAndSendNotes(!!checked)} />
                                <label htmlFor="showVerifyAndSendNotes">{t('ADD_NOTES')}</label>
                            </div>

                            {showVerifyAndSendNotes && (
                                <div className="field">
                                    <label htmlFor="verificationNotes">{t('NOTES')}</label>
                                    <Textarea id="verificationNotes" value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} rows={3} placeholder={t('ENTER_VERIFICATION_NOTES')} />
                                </div>
                            )}
                        </div>
                    </Dialog>


                    {/* View payment Dialog */}
                    <Dialog
                        visible={viewPaymentDialog}
                        style={{ width: '380px', maxWidth: '95vw', padding: 0 }}
                        header={null}
                        modal
                        onHide={() => setViewPaymentDialog(false)}
                        closable={false}
                    >
                        <div id="hawala-view-modal" style={{ backgroundColor: 'white', fontFamily: "'iranyekan', sans-serif,iranyekan" }}>
                            {selectedPayment && (
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
                                            {t('PAYMENT_DETAILS')}
                                        </div>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 1rem',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            backgroundColor: selectedPayment.status === 'completed' ? '#10b981' :
                                                selectedPayment.status === 'pending' ? '#f59e0b' :
                                                    selectedPayment.status === 'failed' ? '#ef4444' :
                                                        selectedPayment.status === 'rollbacked' ? '#dc2626' : '#6b7280',
                                            color: 'white'
                                        }}>
                                            {selectedPayment.status === 'completed' ? t('COMPLETED') :
                                                selectedPayment.status === 'pending' ? t('PENDING') :
                                                    selectedPayment.status === 'failed' ? t('FAILED') :
                                                        selectedPayment.status === 'rollbacked' ? t('ROLLBACKED') : t('UNKNOWN')}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '1rem 0.75rem' }}>
                                        {/* Reseller Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PAYMENT.TABLE.COLUMN.RESELLER')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedPayment?.reseller?.reseller_name || '...'}</span>
                                        </div>

                                        {/* Payment Method */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '4px',
                                            paddingBottom: '6px',
                                            borderBottom: '1px solid #f3f4f6',
                                            gap: '10px'
                                        }}>
                                            {/* Label */}
                                            <span style={{
                                                fontSize: '0.8rem',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                minWidth: '120px',      // FIXED LABEL WIDTH
                                                flexShrink: 0
                                            }}>
                                                {t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')}
                                            </span>

                                            {/* Value */}
                                            <span style={{
                                                fontSize: '0.9rem',
                                                color: '#1f2937',
                                                fontWeight: '600',
                                                wordWrap: 'break-word',
                                                whiteSpace: 'normal',
                                                flex: 1,                // WRAPS TEXT WITHOUT BREAKING LAYOUT
                                                textAlign: 'right'
                                            }}>
                                                {selectedPayment?.payment_method?.method_name || '...'}
                                            </span>
                                        </div>


                                        {/* Amount */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PAYMENT.TABLE.COLUMN.AMOUNT')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedPayment.amount} {selectedPayment?.currency?.code}</span>
                                        </div>

                                        {/* Operation Type */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PAYMENT.FORM.INPUT.OPRATIONTYPE')}</span>
                                            <span style={{
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '12px',
                                                backgroundColor: selectedPayment.operation_type === 'credit' ? '#dbeafe' :
                                                    selectedPayment.operation_type === 'debit' ? '#fee2e2' :
                                                        selectedPayment.operation_type === 'credit_full' ? '#bfdbfe' :
                                                            selectedPayment.operation_type === 'debit_full' ? '#fecaca' : '#f3f4f6',
                                                color: selectedPayment.operation_type === 'credit' ? '#1e40af' :
                                                    selectedPayment.operation_type === 'debit' ? '#dc2626' :
                                                        selectedPayment.operation_type === 'credit_full' ? '#1e3a8a' :
                                                            selectedPayment.operation_type === 'debit_full' ? '#b91c1c' : '#6b7280'
                                            }}>
                                                {selectedPayment.operation_type?.toUpperCase() || '...'}
                                            </span>
                                        </div>

                                        {/* Remaining Payment Amount */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PAYMENT.TABLE.COLUMN.REMAININGPAYMENTAMOUNT')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedPayment.remaining_payment_amount} {selectedPayment?.currency?.code}</span>
                                        </div>

                                        {/* Payment Date */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PAYMENT.TABLE.COLUMN.PAYMENTDATE')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedPayment.payment_date
                                                    ? new Date(selectedPayment.payment_date).toLocaleString("en-GB", {
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

                                        {/* Created Date */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('CREATED_AT')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedPayment.created_at
                                                    ? new Date(selectedPayment.created_at).toLocaleString("en-GB", {
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

                                        {/* Notes */}
                                        {selectedPayment.notes && (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '4px',
                                                paddingBottom: '6px',
                                                borderBottom: '1px solid #f3f4f6',
                                                gap: '10px'
                                            }}>
                                                {/* Label */}
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    color: '#6b7280',
                                                    fontWeight: '500',
                                                    minWidth: '120px',      // FIXED LABEL WIDTH
                                                    flexShrink: 0
                                                }}>
                                                    {t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')}
                                                </span>

                                                {/* Value */}
                                                <span style={{
                                                    fontSize: '0.9rem',
                                                    color: '#1f2937',
                                                    fontWeight: '600',
                                                    wordWrap: 'break-word',
                                                    whiteSpace: 'normal',
                                                    flex: 1,                // WRAPS TEXT WITHOUT BREAKING LAYOUT
                                                    textAlign: 'right'
                                                }}>
                                                    {selectedPayment?.notes || '...'}
                                                </span>
                                            </div>

                                        )}

                                        {/* Performed By */}
                                        {selectedPayment.performed_by_name && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PERFORMED_BY')}</span>
                                                <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedPayment.performed_by_name}</span>
                                            </div>
                                        )}
                                        {/* Images Section */}
                                        {(selectedPayment.payment_image || selectedPayment.extra_image_1 || selectedPayment.extra_image_2) && (
                                            <div style={{
                                                marginBottom: '4px',
                                                paddingBottom: '6px',
                                                borderBottom: '1px solid #f3f4f6'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: '#6b7280',
                                                    fontWeight: '500',
                                                    marginBottom: '8px'
                                                }}>
                                                    {t('IMAGES')}
                                                </div>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                                    gap: '8px'
                                                }}>
                                                    {/* Payment Image */}
                                                    {selectedPayment.payment_image && (
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                aspectRatio: '1',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                                border: '1px solid #e5e7eb'
                                                            }}
                                                            onClick={() => {
                                                                //window.open(selectedPayment.payment_image, '_blank');
                                                            }}
                                                        >
                                                            <img
                                                                src={selectedPayment.payment_image}
                                                                alt="Payment image"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    transition: 'transform 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Extra Image 1 */}
                                                    {selectedPayment.extra_image_1 && (
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                aspectRatio: '1',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                                border: '1px solid #e5e7eb'
                                                            }}
                                                            onClick={() => {
                                                                //window.open(selectedPayment.extra_image_1, '_blank');
                                                            }}
                                                        >
                                                            <img
                                                                src={selectedPayment.extra_image_1}
                                                                alt="Extra image 1"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    transition: 'transform 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Extra Image 2 */}
                                                    {selectedPayment.extra_image_2 && (
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                aspectRatio: '1',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                                border: '1px solid #e5e7eb'
                                                            }}
                                                            onClick={() => {
                                                                //window.open(selectedPayment.extra_image_2, '_blank');
                                                            }}
                                                        >
                                                            <img
                                                                src={selectedPayment.extra_image_2}
                                                                alt="Extra image 2"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    transition: 'transform 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
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
                                        <Button
                                            label={t('APP.GENERAL.CANCEL')}
                                            icon="pi pi-times"
                                            onClick={() => setViewPaymentDialog(false)}
                                            className="p-button-text p-button-sm"
                                            style={{ minWidth: '90px' }}
                                        />
                                        <Button
                                            label={t('DOWNLOAD')}
                                            icon="pi pi-download"
                                            onClick={downloadPaymentAsImage}
                                            className="p-button-success p-button-sm"
                                            style={{ minWidth: '90px' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Dialog>
        </div>
    );
};


export default withAuth(PaymentPage);
