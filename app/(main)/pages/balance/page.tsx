/* eslint-disable @next/next/no-img-element */
'use client';
import { Button as PrimeButton } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Check, Download, Pencil, Plus, RefreshCw, RotateCcw, X } from 'lucide-react';
import { AppDispatch } from '@/app/redux/store';
import { Balance, Currency } from '@/types/interface';
import { _addBalance, _deleteBalance, _editBalance, _fetchBalances, _rejectBalance, _rollbackedBalance, _verifyBalance } from '@/app/redux/actions/balanceActions';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchPaymentMethods } from '@/app/redux/actions/paymentMethodActions';
import withAuth from '../../authGuard';
import { isRTL } from '../../utilities/rtlUtil';
import { generateBalanceExcelFile } from '../../utilities/generateExcel';
import CustomDropdownWithSearch from '@/app/(main)/components/customDropDownWithSearch';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FilterField, FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { RowActions } from '@/components/admin/row-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DateField } from '@/components/ui/date-field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';

type BalanceFilters = {
    filter_transaction_type: string | null;
    filter_startdate: string | null;
    filter_enddate: string | null;
};

const emptyFilters: BalanceFilters = {
    filter_transaction_type: null,
    filter_startdate: null,
    filter_enddate: null
};

const BalancePage = () => {
    let emptyBalance: Balance = {
        id: 0,
        reseller_id: 0,
        transaction_type: '',
        payment_id: null,
        amount: '',
        remaining_balance: '',
        currency_id: 0,
        description: '',
        created_at: '',
        updated_at: '',
        reseller: null,
        currency: null,
        payment_method_id: null,
        payment_amount: '',
        payment_currency_id: 0,
        payment_status: '',
        payment_notes: '',
        payment_date: ''
    };

    const [balanceDialog, setBalanceDialog] = useState(false);
    const [deleteBalanceDialog, setDeleteBalanceDialog] = useState(false);
    const [deleteBalancesDialog, setDeleteBalancesDialog] = useState(false);
    const [balance, setBalance] = useState<Balance>(emptyBalance);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { balances, loading, pagination } = useSelector((state: any) => state.balanceReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const { paymentMethods } = useSelector((state: any) => state.paymentMethodsReducer);
    const { t } = useTranslation();
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [filterOpen, setFilterOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState<BalanceFilters>(emptyFilters);
    const [activeFilters, setActiveFilters] = useState<BalanceFilters>(emptyFilters);
    const [refreshing, setRefreshing] = useState(false);
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');
    const [rollbackDialog, setRollbackDialog] = useState(false);
    const [verifyDialog, setVerifyDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);

    // useEffect(() => {
    //     dispatch(_fetchBalances(1, searchTag, activeFilters));
    //     dispatch(_fetchCurrencies());
    //     dispatch(_fetchResellers(1, '', '', 10000));
    //     dispatch(_fetchPaymentMethods());
    // }, [dispatch, searchTag, activeFilters]);

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         if (resellerSearchTerm) {
    //             dispatch(_fetchResellers(1, resellerSearchTerm));
    //         } else {
    //             dispatch(_fetchResellers(1, ''));
    //         }
    //     }, 300); // Debounce for 300ms

    //     return () => clearTimeout(timer);
    // }, [resellerSearchTerm, dispatch]);

    // Near your other useEffect hooks (around line 95-105)

    useEffect(() => {
        dispatch(_fetchBalances(1, searchTag, compactFilters(activeFilters)));
    }, [dispatch, searchTag, activeFilters]);

    // Fetch dropdown data when add/edit dialog opens
    useEffect(() => {
        if (balanceDialog) {
            // Fetch all required dropdown data
            if (currencies.length === 0) {
                dispatch(_fetchCurrencies());
            }
            if (resellers.length === 0) {
                dispatch(_fetchResellers(1, '', '', 15));
            }
            if (paymentMethods.length === 0) {
                dispatch(_fetchPaymentMethods());
            }
        }
    }, [balanceDialog, dispatch, currencies.length, resellers.length, paymentMethods.length]);

    useEffect(() => {
        if (filterOpen && currencies.length === 0) {
            dispatch(_fetchCurrencies());
        }
    }, [filterOpen, dispatch, currencies.length]);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (resellerSearchTerm) {
                dispatch(_fetchResellers(1, resellerSearchTerm));
            } else if (balanceDialog) {
                // Only fetch if dialog is open
                dispatch(_fetchResellers(1, ''));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [resellerSearchTerm, dispatch, balanceDialog]);

    // Auto-open add dialog from ?action=add
    const searchParams = useSearchParams(); // Add this
    const router = useRouter()

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            // Small delay to ensure the page is fully loaded and Redux state is ready
            const timer = setTimeout(() => {
                openNew();
                // Optional: Clean up the URL after opening the dialog
                router.replace('/pages/balance');
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    const openNew = () => {
        setBalance(emptyBalance);
        setSubmitted(false);
        setBalanceDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setBalanceDialog(false);
        setResellerBalance(null);
        setResellerPayment(null);
        setResellerLoan(null);
    };

    const hideDeleteBalanceDialog = () => {
        setDeleteBalanceDialog(false);
    };

    const hideDeleteBalancesDialog = () => {
        setDeleteBalancesDialog(false);
    };

    const saveBalance = () => {
        setSubmitted(true);
        if (!balance.reseller || !balance.amount || !balance.transaction_type || !balance.currency_id || !balance.description) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        if (balance.id && balance.id !== 0) {
            dispatch(_editBalance(balance.id, balance, toast, t));
        } else {
            dispatch(_addBalance(balance, toast, t));
        }

        setBalanceDialog(false);
        setBalance(emptyBalance);
        setSubmitted(false);
    };

    const editBalance = (balance: Balance) => {
        const matchingReseller = resellers.find((r: any) => r.id === balance.reseller?.id);

        setBalance({ ...balance, reseller: matchingReseller });
        setBalanceDialog(true);
    };

    useEffect(() => {
        //console.log(balance.reseller)
    }, [dispatch, balance]);

    const confirmDeleteBalance = (balance: Balance) => {
        setBalance(balance);
        setDeleteBalanceDialog(true);
    };

    const deleteBalance = () => {
        if (!balance?.id) {
            console.error('Balance  ID is undefined.');
            return;
        }
        dispatch(_deleteBalance(balance?.id, toast, t));
        setDeleteBalanceDialog(false);
    };

    const confirmRollbackBalance = (balance: Balance) => {
        setBalance(balance);
        setRollbackDialog(true);
    };

    const rollbackBalance = () => {
        if (!balance?.id) {
            console.error('Balance  ID is undefined.');
            return;
        }
        dispatch(_rollbackedBalance(balance?.id, toast, t));
        hideRollbackDialog();
    };

    const verifyBalance = () => {
        if (!balance?.id) {
            console.error('Balance ID is undefined.');
            return;
        }
        // Dispatch your verify action here
        dispatch(_verifyBalance(balance?.id, toast, t));
        hideVerifyDialog();
    };

    const rejectBalance = () => {
        if (!balance?.id) {
            console.error('Balance ID is undefined.');
            return;
        }
        // Dispatch your reject action here
        dispatch(_rejectBalance(balance?.id, toast, t));
        hideRejectDialog();
    };

    const confirmDeleteSelected = () => {
        setDeleteBalancesDialog(true);
    };

    const hideRollbackDialog = () => {
        setRollbackDialog(false);
    };

    const hideVerifyDialog = () => {
        setVerifyDialog(false);
    };

    const hideRejectDialog = () => {
        setRejectDialog(false);
    };

    const confirmVerifyBalance = (balance: Balance) => {
        setBalance(balance);
        setVerifyDialog(true);
    };

    const confirmRejectBalance = (balance: Balance) => {
        setBalance(balance);
        setRejectDialog(true);
    };

    const chips = useMemo(() => {
        const list: { key: string; label: string }[] = [];
        if (activeFilters.filter_transaction_type) {
            const typeLabel =
                activeFilters.filter_transaction_type === 'credit'
                    ? t('CREDIT', { defaultValue: 'واریز' })
                    : t('DEBIT', { defaultValue: 'برداشت' });
            list.push({ key: 'filter_transaction_type', label: `${t('BALANCE.FORM.INPUT.TRANSACTIONTYPE', { defaultValue: 'نوع تراکنش' })}: ${typeLabel}` });
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
        setDraftFilters(emptyFilters);
        setActiveFilters(emptyFilters);
        setFilterOpen(false);
    };

    const removeChip = (key: string) => {
        const next = { ...activeFilters, [key]: null } as BalanceFilters;
        setActiveFilters(next);
        setDraftFilters(next);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchBalances(pagination?.page || 1, searchTag, compactFilters(activeFilters)) as any);
        setRefreshing(false);
    };

    const getRowActions = (rowData: Balance) => {
        const items = [
            {
                label: t('VERIFY', { defaultValue: 'تأیید' }),
                icon: <Check className="h-4 w-4" />,
                onClick: () => confirmVerifyBalance(rowData)
            },
            {
                label: t('REJECT', { defaultValue: 'رد' }),
                icon: <X className="h-4 w-4" />,
                onClick: () => confirmRejectBalance(rowData),
                danger: true
            }
        ];

        if (rowData.status !== 'rollbacked') {
            items.push(
                {
                    label: t('ROLLBACK', { defaultValue: 'برگشت' }),
                    icon: <RotateCcw className="h-4 w-4" />,
                    onClick: () => confirmRollbackBalance(rowData),
                    separatorBefore: true
                },
                {
                    label: t('EDIT', { defaultValue: 'ویرایش' }),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editBalance(rowData)
                }
            );
        }

        return items;
    };

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 20)));

    const deleteBalanceDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteBalanceDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteBalance} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteBalancesDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    const rollbackDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideRollbackDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={rollbackBalance} />
        </>
    );

    const verifyDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideVerifyDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={verifyBalance} />
        </>
    );

    const rejectDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideRejectDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={rejectBalance} />
        </>
    );

    useEffect(() => {
        const currencyCode = balance?.reseller?.code || '';

        const selectedCurrency = currencies.find((currency: Currency) => currency.code === currencyCode);

        if (selectedCurrency) {
            setBalance((prev) => ({
                ...prev,
                currency_id: selectedCurrency.id,
                currency: selectedCurrency,
                payment_currency_id: selectedCurrency.id
            }));
        }
    }, [balance?.reseller?.code, currencies, balance]);

    const [resellerBalance, setResellerBalance] = useState<any>(null);
    const [resellerPayment, setResellerPayment] = useState<any>(null);
    const [resellerLoan, setResellerLoan] = useState<any>(null);
    useEffect(() => {
        if (balance.reseller) {
            const formattedCurrency = balance.currency?.code || '';

            const resellerBalanceValue = Number(balance.reseller?.balance ?? 0);
            const totalSent = Number(balance.reseller?.total_balance_sent ?? 0);
            const totalReceived = Number(balance.reseller?.total_payments_received ?? 0);
            const paymentDiff = totalSent - totalReceived;

            const totalPayments = Number(balance?.reseller?.total_payments_received) || 0;
            const totalBalance = Number(balance?.reseller?.total_balance_sent) || 0;
            const availablePaymentAmount = totalPayments - totalBalance;

            setResellerBalance(`${resellerBalanceValue} ${formattedCurrency}`);
            //setResellerPayment(`${paymentDiff > 0 ? paymentDiff : 0} ${formattedCurrency}`);
            setResellerPayment(`${availablePaymentAmount > 0 ? availablePaymentAmount : 0} ${formattedCurrency}`)
            setResellerLoan(`${paymentDiff > 0 ? paymentDiff : 0} ${formattedCurrency}`);
        }
    }, [balance.reseller, balance.currency?.code]);

    const onPageChange = (page: number) => {
        dispatch(_fetchBalances(page, searchTag, compactFilters(activeFilters)));
    };

    const exportToExcel = async () => {
        await generateBalanceExcelFile({
            balances,
            t,
            toast,
            all: true
        });
    };

    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.BALANCE', { defaultValue: 'موجودی' })}
                description={t('RESELLER.BALANCETRANSACTION.YOUCANCREDIT', { defaultValue: 'مدیریت تراکنش‌های موجودی فروشندگان' })}
                loading={loading}
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToExcel}>
                            <Download className="h-4 w-4" />
                            {t('EXPORT.EXPORT', { defaultValue: 'خروجی اکسل' })}
                        </Button>
                        <Button size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('RESELLER.BALANCETRANSACTION.ADDBALANCE', { defaultValue: 'افزایش موجودی' })}
                        </Button>
                    </>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو...' })}
                        chips={chips}
                        onRemoveChip={removeChip}
                        onClearAll={chips.length > 0 ? clearFilters : undefined}
                        onOpenFilters={() => {
                            setDraftFilters(activeFilters);
                            setFilterOpen(true);
                        }}
                    />
                }
                footer={
                    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">
                            {t('DATA_TABLE.TABLE.PAGINATOR.SHOWING', { defaultValue: 'نمایش' })} — {t('PAGE', { defaultValue: 'صفحه' })} {pagination?.page || 1}{' '}
                            {t('OF', { defaultValue: 'از' })} {totalPages} · {t('TOTAL', { defaultValue: 'مجموع' })} {pagination?.total || 0}
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
                <table className="w-full min-w-[1280px] border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/40 text-start">
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('OPERATIONS', { defaultValue: 'عملیات' })}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('BALANCE.TABLE.COLUMN.RESELLER')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('BALANCE.TABLE.COLUMN.AMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('BALANCE.TABLE.COLUMN.CURRENCY')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('BALANCE.TABLE.COLUMN.REMAINING_BALANCE')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('BALANCE.TABLE.COLUMN.STATUS')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('TYPE')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap min-w-[10rem]">{t('BALANCE.TABLE.COLUMN.DESCRIPTIONS')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('PERFORMED_BY')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('VERIFIED_OR_PERFORMED')}</th>
                            <th className="px-2 py-2 font-semibold whitespace-nowrap">{t('BALANCE.TABLE.COLUMN.BALANCEDATE')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(balances || []).length === 0 ? (
                            <tr>
                                <td colSpan={11} className="px-3 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (balances || []).map((row: Balance) => {
                                const isLoan = row.is_reseller_loan_request == '1';
                                return (
                                    <tr key={row.id} className="border-b border-border/70 transition hover:bg-emerald-50/40">
                                        <td className="px-2 py-2">
                                            <RowActions items={getRowActions(row)} />
                                        </td>
                                        <td className="px-2 py-2 text-start">{row.reseller?.reseller_name || '—'}</td>
                                        <td className="px-2 py-2 tabular-nums">{row.amount || '—'}</td>
                                        <td className="px-2 py-2">{row.currency?.code || '—'}</td>
                                        <td className="px-2 py-2 tabular-nums">{row.remaining_balance || '—'}</td>
                                        <td className="px-2 py-2">
                                            <Badge variant={statusBadgeVariant(row.status)}>{formatStatusLabel(row.status)}</Badge>
                                        </td>
                                        <td className="px-2 py-2">
                                            <Badge variant={typeBadgeVariant(row.transaction_type)}>{formatTypeLabel(row.transaction_type, t)}</Badge>
                                        </td>
                                        <td className="px-2 py-2 max-w-[14rem] truncate text-start" title={row.description || ''}>
                                            {row.description || '—'}
                                        </td>
                                        <td className="px-2 py-2 text-start">{row.performed_by_name || '—'}</td>
                                        <td className="px-2 py-2 text-start text-xs">
                                            {isLoan ? (
                                                <span className="text-blue-600">
                                                    {t('VERIFIED_BY')} {row.performed_by_name}
                                                </span>
                                            ) : (
                                                <span className="text-emerald-700">
                                                    {t('PERFORMED_BY')} {row.performed_by_name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-2 tabular-nums text-muted-foreground whitespace-nowrap">{formatBalanceDate(row.created_at)}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </ListPage>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side="left" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{t('FILTER', { defaultValue: 'فیلتر' })}</SheetTitle>
                        <SheetDescription>{t('FILTER_APPLY_SERVER', { defaultValue: 'فیلترها روی نتایج سرور اعمال می‌شوند.' })}</SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <FilterField label={t('BALANCE.FORM.INPUT.TRANSACTIONTYPE', { defaultValue: 'نوع تراکنش' })}>
                            <Select
                                value={draftFilters.filter_transaction_type || undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_transaction_type: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_TRANSACTION_TYPE', { defaultValue: 'انتخاب نوع' })} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit">{t('CREDIT', { defaultValue: 'واریز' })}</SelectItem>
                                    <SelectItem value="debit">{t('DEBIT', { defaultValue: 'برداشت' })}</SelectItem>
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
                            <Button className="flex-1" onClick={applyFilters}>
                                {t('APPLY', { defaultValue: 'اعمال' })}
                            </Button>
                            <Button className="flex-1" variant="secondary" onClick={clearFilters}>
                                {t('RESET', { defaultValue: 'بازنشانی' })}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <FormSheet
                open={balanceDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="xl"
                side="left"
                title={t('BALANCE.DETAILS.TITLE')}
                description={
                    balance.id && balance.id !== 0
                        ? t('BALANCE.FORM.EDIT_DESCRIPTION', { defaultValue: 'ویرایش تراکنش موجودی فروشنده' })
                        : t('RESELLER.BALANCETRANSACTION.YOUCANCREDIT', { defaultValue: 'ثبت تراکنش جدید موجودی' })
                }
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveBalance}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                {balance.reseller && resellerBalance !== null && resellerPayment !== null && (
                    <section className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
                        <div className="mb-4 border-b border-emerald-50 pb-3 text-start">
                            <h3 className="text-sm font-semibold text-emerald-950">
                                {t('BALANCE.FORM.RESELLER.SUMMARY', { defaultValue: 'خلاصه وضعیت فروشنده' })}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {balance.reseller.reseller_name}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-center">
                                <p className="text-sm font-medium text-muted-foreground">{t('BALANCE.FORM.RESELLER.BALANCE')}</p>
                                <p className="mt-2 text-xl font-bold tabular-nums text-emerald-700">{resellerBalance}</p>
                            </div>
                            <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4 text-center">
                                <p className="text-sm font-medium text-muted-foreground">{t('RESELLER.TABLE.COLUMN.AVAILABLEPAYMENT')}</p>
                                <p className="mt-2 text-xl font-bold tabular-nums text-rose-700">{resellerPayment}</p>
                            </div>
                            <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-center">
                                <p className="text-sm font-medium text-muted-foreground">{t('BALANCE.FORM.RESELLER.LOAN')}</p>
                                <p className="mt-2 text-xl font-bold tabular-nums text-violet-700">{resellerLoan}</p>
                            </div>
                        </div>
                    </section>
                )}

                <FormSection title={t('BALANCE.DETAILS.TITLE')} description={t('PAYMENT.DETAILS.TITLE')}>
                    <FormField
                        label={t('PAYMENT.FORM.INPUT.RESELLER')}
                        required
                        fullWidth
                        error={submitted && !balance.reseller ? t('THIS_FIELD_IS_REQUIRED') : false}
                    >
                        <CustomDropdownWithSearch
                            id="reseller"
                            value={balance.reseller}
                            options={resellers}
                            onChange={(selectedOption) => {
                                setBalance((prev) => ({
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
                            error={submitted && !balance.reseller}
                            errorMessage={t('THIS_FIELD_IS_REQUIRED')}
                            showClear={true}
                            emptyMessage={t('NO_RESULTS_FOUND')}
                            noResultsMessage={t('TRY_DIFFERENT_SEARCH_TERM')}
                            returnFullObject={true}
                            itemTemplate={(option) => {
                                if (!option) return null;
                                return (
                                    <div className="flex flex-column p-2 gap-1">
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
                                        <small className="text-gray-500 text-xs">
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
                        label={t('BALANCE.FORM.INPUT.TRANSACTIONTYPE')}
                        required
                        error={submitted && !balance.transaction_type ? t('REQUIRED') : false}
                    >
                        <Select
                            value={balance.transaction_type || undefined}
                            onValueChange={(v) =>
                                setBalance((prev) => ({
                                    ...prev,
                                    transaction_type: v
                                }))
                            }
                        >
                            <SelectTrigger className={cn(submitted && !balance.transaction_type && 'border-rose-300')}>
                                <SelectValue placeholder={t('BALANCE.FORM.TRANSACTIONTYPE.PLACEHOLDER')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="credit">{t('CREDIT', { defaultValue: 'واریز' })}</SelectItem>
                                <SelectItem value="debit">{t('DEBIT', { defaultValue: 'برداشت' })}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label={t('BALANCE.FORM.INPUT.BALANCEAMOUNT')}
                        required
                        error={submitted && !balance.amount ? t('REQUIRED') : false}
                    >
                        <Input
                            id="amount"
                            value={balance.amount || ''}
                            onChange={(e) =>
                                setBalance((prev) => ({
                                    ...prev,
                                    amount: e.target.value
                                }))
                            }
                            placeholder="0"
                            type="number"
                            className={cn('w-full', submitted && !balance.amount && 'border-rose-300')}
                        />
                    </FormField>

                    <FormField
                        label={t('BALANCE.FORM.INPUT.CURRENCY')}
                        required
                        error={submitted && !balance.currency_id ? t('REQUIRED') : false}
                    >
                        <Select
                            disabled
                            value={balance.currency_id != null ? String(balance.currency_id) : undefined}
                            onValueChange={(v) =>
                                setBalance((prev) => ({
                                    ...prev,
                                    currency_id: Number(v)
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('BALANCE.FORM.CURRENCY.PLACEHOLDER')} />
                            </SelectTrigger>
                            <SelectContent>
                                {(currencies as Currency[]).map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label={t('BALANCE.FORM.INPUT.PAYMENTMETHOD')}>
                        <Select
                            value={balance.payment_method_id != null ? String(balance.payment_method_id) : undefined}
                            onValueChange={(v) =>
                                setBalance((prev) => ({
                                    ...prev,
                                    payment_method_id: Number(v)
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('PAYMENT.FORM.METHOD.PLACEHOLDER')} />
                            </SelectTrigger>
                            <SelectContent>
                                {paymentMethods.map((m: { id: number; method_name: string }) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        {m.method_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label={t('BALANCE.FORM.INPUT.PAYMENTAMOUNT')}>
                        <Input
                            id="payment_amount"
                            value={balance.payment_amount || ''}
                            onChange={(e) =>
                                setBalance((prev) => ({
                                    ...prev,
                                    payment_amount: e.target.value
                                }))
                            }
                            placeholder="0"
                            type="number"
                            className="w-full"
                        />
                    </FormField>

                    <FormField label={t('BALANCE.FORM.INPUT.PAYMENTCURRENCY')}>
                        <Select
                            disabled
                            value={balance.payment_currency_id != null ? String(balance.payment_currency_id) : undefined}
                            onValueChange={(v) =>
                                setBalance((prev) => ({
                                    ...prev,
                                    payment_currency_id: Number(v)
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('PAYMENT.FORM.CURRENCY.PLACEHOLDER')} />
                            </SelectTrigger>
                            <SelectContent>
                                {(currencies as Currency[]).map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label={t('BALANCE.FORM.INPUT.PAYMENTDATE')}
                        error={submitted && !balance.payment_date ? t('REQUIRED') : false}
                    >
                        <DateField
                            id="payment_date"
                            value={balance.payment_date || ''}
                            onValueChange={(v) =>
                                setBalance((prev) => ({
                                    ...prev,
                                    payment_date: v
                                }))
                            }
                            className={cn(submitted && !balance.payment_date && 'border-rose-300')}
                        />
                    </FormField>
                </FormSection>

                <FormSection title={t('NOTES', { defaultValue: 'یادداشت‌ها' })} description={t('BALANCE.FORM.NOTES.HINT', { defaultValue: 'توضیحات تراکنش و یادداشت پرداخت' })}>
                    <FormField
                        label={t('BALANCE.FORM.INPUT.DESCRIPTION')}
                        required
                        fullWidth
                        error={submitted && !balance.description ? t('REQUIRED') : false}
                    >
                        <Textarea
                            id="description"
                            value={balance.description || ''}
                            onChange={(e) =>
                                setBalance((prev) => ({
                                    ...prev,
                                    description: e.target.value
                                }))
                            }
                            placeholder={t('BALANCE.FORM.DESCRIPTION.PLACEHOLDER')}
                            className={cn('w-full', submitted && !balance.description && 'border-rose-300')}
                            rows={3}
                        />
                    </FormField>

                    <FormField label={t('BALANCE.FORM.INPUT.PAYMENTNOTES')} fullWidth>
                        <Textarea
                            id="payment_notes"
                            value={balance.payment_notes || ''}
                            onChange={(e) =>
                                setBalance((prev) => ({
                                    ...prev,
                                    payment_notes: e.target.value
                                }))
                            }
                            placeholder={t('PAYMENT.FORM.NOTES.PLACEHOLDER')}
                            className="w-full"
                            rows={3}
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteBalanceDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteBalanceDialogFooter} onHide={hideDeleteBalanceDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {balance && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b></b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteBalancesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteBalancesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {balance && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>

                    {/* Rollback Confirmation Dialog */}
                    <Dialog visible={rollbackDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={rollbackDialogFooter} onHide={hideRollbackDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-refresh mr-3" style={{ fontSize: '2rem' }} />
                            {balance && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_ROLLBACK')}?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={verifyDialog} style={{ width: '450px' }} header={t('VERIFY_BALANCE')} modal footer={verifyDialogFooter} onHide={hideVerifyDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-check-circle mr-3" style={{ fontSize: '2rem', color: 'var(--green-500)' }} />
                            {balance && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_VERIFY_THIS_BALANCE')}?</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={rejectDialog} style={{ width: '450px' }} header={t('REJECT_BALANCE')} modal footer={rejectDialogFooter} onHide={hideRejectDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-times-circle mr-3" style={{ fontSize: '2rem', color: 'var(--red-500)' }} />
                            {balance && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_REJECT_THIS_BALANCE')}?</span>}
                        </div>
                    </Dialog>
        </>
    );
};


function compactFilters(filters: BalanceFilters) {
    const out: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') out[key] = value;
    });
    return out;
}

function statusBadgeVariant(status?: string): 'warning' | 'success' | 'danger' | 'muted' {
    const s = status?.toLowerCase();
    if (s === 'rollbacked') return 'warning';
    if (s === 'completed') return 'success';
    if (s === 'rejected') return 'danger';
    return 'muted';
}

function formatStatusLabel(status?: string) {
    const s = status?.toLowerCase() || 'unknown';
    if (s === 'unknown') return '—';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function typeBadgeVariant(type?: string): 'danger' | 'success' | 'muted' {
    const t = type?.toLowerCase();
    if (t === 'debit') return 'danger';
    if (t === 'credit') return 'success';
    return 'muted';
}

function formatTypeLabel(type: string | undefined, t: (key: string, opts?: object) => string) {
    const v = type?.toLowerCase();
    if (v === 'credit') return t('CREDIT', { defaultValue: 'واریز' });
    if (v === 'debit') return t('DEBIT', { defaultValue: 'برداشت' });
    return '—';
}

function formatBalanceDate(value?: string) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('fa-IR');
    } catch {
        return value;
    }
}

export default withAuth(BalancePage);
