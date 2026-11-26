/* eslint-disable @next/next/no-img-element */
'use client';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { addWithdrawPolicy, deleteWithdrawPolicy, editWithdrawPolicy, fetchWithdrawPolicies } from '@/app/redux/actions/withdrawPolicyActions';
import { AppDispatch } from '@/app/redux/store';
import { Currency, WithdrawalPolicy } from '@/types/interface';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { isRTL } from '../../utilities/rtlUtil';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FilterField, FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RowActions } from '@/components/admin/row-actions';
import { Button as UiButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Pencil, Plus, Trash2 } from 'lucide-react';

const WithdrawalPolicyPage = () => {
    let emptyWithdrawalPolicy: WithdrawalPolicy = {
        id: 0,
        currency_id: 0,
        commission_type: 'percentage',
        commission_value: 0,
        min_withdraw_amount: 0,
        max_withdraw_amount: 0,
        status: true
    };

    const [withdrawalPolicyDialog, setWithdrawalPolicyDialog] = useState(false);
    const [deleteWithdrawalPolicyDialog, setDeleteWithdrawalPolicyDialog] = useState(false);
    const [deleteWithdrawalPoliciesDialog, setDeleteWithdrawalPoliciesDialog] = useState(false);
    const [withdrawalPolicy, setWithdrawalPolicy] = useState<WithdrawalPolicy>(emptyWithdrawalPolicy);
    const [selectedWithdrawalPolicies, setSelectedWithdrawalPolicies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [filterOpen, setFilterOpen] = useState(false);
    const [draftCurrencyFilter, setDraftCurrencyFilter] = useState<string>('');
    const [currencyFilter, setCurrencyFilter] = useState<number | undefined>(undefined);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { withdrawPolicies, loading, pagination } = useSelector((state: any) => state.withdrawPoliciesReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(fetchWithdrawPolicies(1, currencyFilter));
        dispatch(_fetchCurrencies());
    }, [dispatch, currencyFilter]);

    const openNew = () => {
        setWithdrawalPolicy(emptyWithdrawalPolicy);
        setSubmitted(false);
        setWithdrawalPolicyDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setWithdrawalPolicyDialog(false);
    };

    const hideDeleteWithdrawalPolicyDialog = () => {
        setDeleteWithdrawalPolicyDialog(false);
    };

    const hideDeleteWithdrawalPoliciesDialog = () => {
        setDeleteWithdrawalPoliciesDialog(false);
    };

    const saveWithdrawalPolicy = () => {
        setSubmitted(true);

        // Validation
        if (!withdrawalPolicy.currency_id ||
            !withdrawalPolicy.commission_type ||
            withdrawalPolicy.commission_value === undefined ||
            withdrawalPolicy.min_withdraw_amount === undefined ||
            withdrawalPolicy.max_withdraw_amount === undefined) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('PLEASE_FILL_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        // Validate min amount < max amount
        if (withdrawalPolicy.min_withdraw_amount >= withdrawalPolicy.max_withdraw_amount) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('MIN_AMOUNT_MUST_BE_LESS_THAN_MAX_AMOUNT'),
                life: 3000
            });
            return;
        }

        // Validate commission value
        if (withdrawalPolicy.commission_type === 'percentage' &&
            (withdrawalPolicy.commission_value < 0 || withdrawalPolicy.commission_value > 100)) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('PERCENTAGE_MUST_BE_BETWEEN_0_AND_100'),
                life: 3000
            });
            return;
        }

        if (withdrawalPolicy.commission_type === 'fixed' && withdrawalPolicy.commission_value < 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('FIXED_COMMISSION_MUST_BE_POSITIVE'),
                life: 3000
            });
            return;
        }

        if (withdrawalPolicy.id && withdrawalPolicy.id !== 0) {
            // Convert string values to numbers for API
            const policyToUpdate = {
                currency_id: Number(withdrawalPolicy.currency_id),
                commission_value: Number(withdrawalPolicy.commission_value),
                commission_type: withdrawalPolicy.commission_type,
                min_withdraw_amount: Number(withdrawalPolicy.min_withdraw_amount),
                max_withdraw_amount: Number(withdrawalPolicy.max_withdraw_amount),
                status: withdrawalPolicy.status,
            };
            dispatch(editWithdrawPolicy(withdrawalPolicy.id, policyToUpdate, toast, t));
        } else {
            // Convert values to numbers for API
            const { id, currency, ...policyData } = withdrawalPolicy;
            const policyToAdd = {
                ...policyData,
                currency_id: Number(policyData.currency_id),
                commission_value: Number(policyData.commission_value),
                min_withdraw_amount: Number(policyData.min_withdraw_amount),
                max_withdraw_amount: Number(policyData.max_withdraw_amount),

            };
            dispatch(addWithdrawPolicy(policyToAdd, toast, t));
        }

        setWithdrawalPolicyDialog(false);
        setWithdrawalPolicy(emptyWithdrawalPolicy);
        setSubmitted(false);
    };

    const editWithdrawalPolicy = (policy: WithdrawalPolicy) => {
        // Convert string values to numbers for the form
        const policyToEdit = {
            ...policy,
            currency_id: Number(policy.currency_id),
            commission_value: Number(policy.commission_value),
            min_withdraw_amount: Number(policy.min_withdraw_amount),
            max_withdraw_amount: Number(policy.max_withdraw_amount),
            status: policy.status === true
        };
        setWithdrawalPolicy(policyToEdit);
        setWithdrawalPolicyDialog(true);
    };

    const confirmDeleteWithdrawalPolicy = (policy: WithdrawalPolicy) => {
        setWithdrawalPolicy(policy);
        setDeleteWithdrawalPolicyDialog(true);
    };

    const deleteWithdrawalPolicy = () => {
        if (!withdrawalPolicy?.id) {
            return;
        }
        dispatch(deleteWithdrawPolicy(withdrawalPolicy?.id, toast, t));
        setDeleteWithdrawalPolicyDialog(false);
    };

    const confirmDeleteSelected = () => {
        if (!selectedWithdrawalPolicies || (selectedWithdrawalPolicies as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteWithdrawalPoliciesDialog(true);
    };

    const deleteSelectedWithdrawalPolicies = async () => {
        if (!selectedWithdrawalPolicies || (selectedWithdrawalPolicies as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        // Delete selected policies one by one
        const selectedPoliciesArray = selectedWithdrawalPolicies as WithdrawalPolicy[];
        for (const policy of selectedPoliciesArray) {
            if (policy.id) {
                await dispatch(deleteWithdrawPolicy(policy.id, toast, t));
            }
        }

        setSelectedWithdrawalPolicies(null);
        setDeleteWithdrawalPoliciesDialog(false);
    };

    const filteredPolicies = useMemo(() => {
        const search = searchTag.trim().toLocaleLowerCase();
        const list: WithdrawalPolicy[] = Array.isArray(withdrawPolicies) ? withdrawPolicies : [];
        if (!search) return list;
        return list.filter((row) =>
            [row.currency?.code, row.currency?.name, row.commission_type, row.commission_value]
                .filter((v) => v !== null && v !== undefined)
                .join(' ')
                .toLocaleLowerCase()
                .includes(search)
        );
    }, [withdrawPolicies, searchTag]);

    const chips = useMemo(() => {
        if (!currencyFilter) return [];
        const currency = currencies.find((c: Currency) => c.id === currencyFilter);
        return [{ key: 'currency', label: `${t('MENU.CURRENCY')}: ${currency?.code || currencyFilter}` }];
    }, [currencyFilter, currencies, t]);

    const applyCurrencyFilter = () => {
        setCurrencyFilter(draftCurrencyFilter ? Number(draftCurrencyFilter) : undefined);
        setFilterOpen(false);
    };

    const clearCurrencyFilter = () => {
        setDraftCurrencyFilter('');
        setCurrencyFilter(undefined);
        setFilterOpen(false);
    };

    const removeChip = () => clearCurrencyFilter();

    const totalPages = Math.max(1, Math.ceil((pagination?.total || filteredPolicies.length) / (pagination?.items_per_page || 10)));

    const onPageChange = (page: number) => {
        dispatch(fetchWithdrawPolicies(page, currencyFilter));
    };

    const getPolicyRowActions = (row: WithdrawalPolicy) => [
        { label: t('EDIT', { defaultValue: 'ویرایش' }), icon: <Pencil className="h-4 w-4" />, onClick: () => editWithdrawalPolicy(row) },
        { label: t('DELETE', { defaultValue: 'حذف' }), icon: <Trash2 className="h-4 w-4" />, onClick: () => confirmDeleteWithdrawalPolicy(row), danger: true }
    ];

    const withdrawalPolicyDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('SAVE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveWithdrawalPolicy} />
        </>
    );

    const deleteWithdrawalPolicyDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteWithdrawalPolicyDialog} />
            <Button label={t('DELETE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteWithdrawalPolicy} />
        </>
    );

    const deleteWithdrawalPoliciesDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteWithdrawalPoliciesDialog} />
            <Button label={t('DELETE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedWithdrawalPolicies} />
        </>
    );

    const commissionTypeOptions = [
        { label: t('PERCENTAGE'), value: 'percentage' },
        { label: t('FIXED'), value: 'fixed' }
    ];

    const statusOptions = [
        { label: t('ACTIVE'), value: true },
        { label: t('INACTIVE'), value: false }
    ];

    // Filter currencies to only show active ones if needed
    const availableCurrencies = currencies.filter((currency: Currency) => currency.deleted_at === null);

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.WITHDRAWAL_POLICY', { defaultValue: 'سیاست برداشت' })}
                description={t('WITHDRAWAL_POLICY.PAGE.DESCRIPTION', { defaultValue: 'تعیین کارمزد و محدودیت برداشت به تفکیک ارز' })}
                loading={loading}
                actions={
                    <>
                        <UiButton size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('CREATE_WITHDRAWAL_POLICY', { defaultValue: 'سیاست جدید' })}
                        </UiButton>
                        <UiButton
                            size="sm"
                            variant="destructive"
                            onClick={confirmDeleteSelected}
                            disabled={!selectedWithdrawalPolicies || !(selectedWithdrawalPolicies as WithdrawalPolicy[]).length}
                        >
                            <Trash2 className="h-4 w-4" />
                            {t('DELETE', { defaultValue: 'حذف' })}
                        </UiButton>
                    </>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو...' })}
                        chips={chips}
                        onRemoveChip={removeChip}
                        onClearAll={chips.length ? clearCurrencyFilter : undefined}
                        onOpenFilters={() => {
                            setDraftCurrencyFilter(currencyFilter ? String(currencyFilter) : '');
                            setFilterOpen(true);
                        }}
                    />
                }
                footer={
                    <div className="flex flex-col gap-2 border-t border-emerald-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">
                            {t('DATA_TABLE.TABLE.PAGINATOR.SHOWING', { defaultValue: 'صفحه' })}{' '}
                            {pagination?.page || 1} / {totalPages} · {pagination?.total ?? filteredPolicies.length}
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
                <table className="w-full min-w-[1100px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 w-10">
                                <input
                                    type="checkbox"
                                    aria-label={t('SELECT_ALL', { defaultValue: 'انتخاب همه' })}
                                    checked={
                                        filteredPolicies.length > 0 &&
                                        ((selectedWithdrawalPolicies as WithdrawalPolicy[] | null) ?? []).length === filteredPolicies.length &&
                                        filteredPolicies.length > 0
                                    }
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedWithdrawalPolicies(filteredPolicies as any);
                                        else setSelectedWithdrawalPolicies(null);
                                    }}
                                />
                            </th>
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('COMMON.ACTIONS', { defaultValue: 'عملیات' })}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('MENU.CURRENCY')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('COMMISSION_TYPE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('COMMISSION_VALUE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('MIN_WITHDRAW_AMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('MAX_WITHDRAW_AMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('STATUS')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPolicies.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('NO_DATA_AVAILABLE', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            filteredPolicies.map((row) => {
                                const selected = (selectedWithdrawalPolicies as WithdrawalPolicy[] | null)?.some((p) => p.id === row.id);
                                const sym = row.currency?.symbol || '';
                                return (
                                    <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                        <td className="px-2 py-1.5">
                                            <input
                                                type="checkbox"
                                                checked={!!selected}
                                                onChange={(e) => {
                                                    const current = [...((selectedWithdrawalPolicies as WithdrawalPolicy[] | null) ?? [])];
                                                    if (e.target.checked) setSelectedWithdrawalPolicies([...current, row] as any);
                                                    else setSelectedWithdrawalPolicies(current.filter((p) => p.id !== row.id).length ? (current.filter((p) => p.id !== row.id) as any) : null);
                                                }}
                                            />
                                        </td>
                                        <td className="px-2 py-1.5 align-middle">
                                            <RowActions items={getPolicyRowActions(row)} />
                                        </td>
                                        <td className="px-2 py-1.5 text-start">
                                            <span className={`fi fi-${row.currency?.code?.toLowerCase()?.substring(0, 2) || 'us'} fis me-1`} />
                                            {row.currency?.code} — {row.currency?.name}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <Badge variant="secondary" className="text-[10px]">
                                                {row.commission_type === 'percentage' ? t('PERCENTAGE') : t('FIXED')}
                                            </Badge>
                                        </td>
                                        <td className="px-2 py-1.5 tabular-nums">
                                            {Number(row.commission_value).toFixed(2)}
                                            {row.commission_type === 'percentage' ? '%' : ` ${sym}`}
                                        </td>
                                        <td className="px-2 py-1.5 tabular-nums">
                                            {Number(row.min_withdraw_amount).toFixed(2)} {sym}
                                        </td>
                                        <td className="px-2 py-1.5 tabular-nums">
                                            {Number(row.max_withdraw_amount).toFixed(2)} {sym}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <Badge variant={row.status === true ? 'success' : 'danger'} className="text-[10px]">
                                                {row.status === true ? t('ACTIVE') : t('INACTIVE')}
                                            </Badge>
                                        </td>
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
                        <SheetDescription>{t('WITHDRAWAL_POLICY.FILTER.HINT', { defaultValue: 'فیلتر ارز روی نتایج سرور اعمال می‌شود.' })}</SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <FilterField label={t('MENU.CURRENCY')}>
                            <Select value={draftCurrencyFilter || undefined} onValueChange={setDraftCurrencyFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_CURRENCY', { defaultValue: 'انتخاب ارز' })} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCurrencies.map((c: Currency) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.code} — {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FilterField>
                        <div className="flex gap-2 pt-2">
                            <UiButton className="flex-1" onClick={applyCurrencyFilter}>
                                {t('APPLY', { defaultValue: 'اعمال' })}
                            </UiButton>
                            <UiButton className="flex-1" variant="secondary" onClick={clearCurrencyFilter}>
                                {t('RESET', { defaultValue: 'بازنشانی' })}
                            </UiButton>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <FormSheet
                open={withdrawalPolicyDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="xl"
                side="left"
                title={withdrawalPolicy.id ? t('EDIT_WITHDRAWAL_POLICY') : t('CREATE_WITHDRAWAL_POLICY')}
                description={t('WITHDRAWAL_POLICY.FORM.SHEET_HINT', { defaultValue: 'کارمزد و محدودیت برداشت را برای ارز انتخاب‌شده تنظیم کنید.' })}
                footer={
                    <FormActions onCancel={hideDialog} onSubmit={saveWithdrawalPolicy} cancelLabel={t('CANCEL')} submitLabel={t('SAVE')} />
                }
            >
                <FormSection title={t('WITHDRAWAL_POLICY.FORM.SECTION.CURRENCY', { defaultValue: 'ارز و وضعیت' })}>
                    <FormField
                        label={t('MENU.CURRENCY')}
                        required
                        fullWidth
                        error={submitted && !withdrawalPolicy.currency_id ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Select
                            value={
                                withdrawalPolicy.currency_id
                                    ? String(withdrawalPolicy.currency_id)
                                    : undefined
                            }
                            onValueChange={(v) =>
                                setWithdrawalPolicy((prev) => ({
                                    ...prev,
                                    currency_id: Number(v)
                                }))
                            }
                        >
                            <SelectTrigger className={classNames(submitted && !withdrawalPolicy.currency_id && 'border-rose-300')}>
                                <SelectValue placeholder={t('SELECT_CURRENCY')} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableCurrencies.map((c: Currency) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.code} — {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField
                        label={t('COMMISSION_TYPE')}
                        required
                        error={submitted && !withdrawalPolicy.commission_type ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Select
                            value={withdrawalPolicy.commission_type || undefined}
                            onValueChange={(v) =>
                                setWithdrawalPolicy((prev) => ({
                                    ...prev,
                                    commission_type: v as WithdrawalPolicy['commission_type']
                                }))
                            }
                        >
                            <SelectTrigger className={classNames(submitted && !withdrawalPolicy.commission_type && 'border-rose-300')}>
                                <SelectValue placeholder={t('SELECT_COMMISSION_TYPE')} />
                            </SelectTrigger>
                            <SelectContent>
                                {commissionTypeOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('STATUS')}>
                        <Select
                            value={String(Boolean(withdrawalPolicy.status))}
                            onValueChange={(v) =>
                                setWithdrawalPolicy((prev) => ({
                                    ...prev,
                                    status: v === 'true'
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('SELECT_STATUS')} />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </FormSection>
                <FormSection title={t('WITHDRAWAL_POLICY.FORM.SECTION.LIMITS', { defaultValue: 'کارمزد و محدودیت' })}>
                    <FormField
                        label={
                            withdrawalPolicy.commission_type === 'percentage'
                                ? `${t('COMMISSION_VALUE')} (0-100%)`
                                : t('COMMISSION_VALUE')
                        }
                        required
                        fullWidth
                        error={submitted && withdrawalPolicy.commission_value === undefined ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <div className="flex w-full items-center gap-2">
                            <NumberInput
                                id="commission_value"
                                value={Number(withdrawalPolicy.commission_value)}
                                onValueChange={(v) =>
                                    setWithdrawalPolicy((prev) => ({
                                        ...prev,
                                        commission_value: v ?? 0
                                    }))
                                }
                                min={0}
                                max={withdrawalPolicy.commission_type === 'percentage' ? 100 : undefined}
                                step={0.01}
                                allowNull={false}
                                className={classNames('w-full flex-1', {
                                    'border-rose-300': submitted && withdrawalPolicy.commission_value === undefined
                                })}
                                placeholder={
                                    withdrawalPolicy.commission_type === 'percentage' ? t('ENTER_PERCENTAGE') : t('ENTER_FIXED_AMOUNT')
                                }
                            />
                            <span className="shrink-0 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-2 text-sm text-muted-foreground">
                                {withdrawalPolicy.commission_type === 'percentage'
                                    ? '%'
                                    : availableCurrencies.find((c: Currency) => Number(c.id) === Number(withdrawalPolicy.currency_id))?.symbol || '$'}
                            </span>
                        </div>
                    </FormField>
                    <FormField
                        label={t('MIN_WITHDRAW_AMOUNT')}
                        required
                        error={submitted && withdrawalPolicy.min_withdraw_amount === undefined ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <NumberInput
                            id="min_withdraw_amount"
                            value={Number(withdrawalPolicy.min_withdraw_amount)}
                            onValueChange={(v) =>
                                setWithdrawalPolicy((prev) => ({
                                    ...prev,
                                    min_withdraw_amount: v ?? 0
                                }))
                            }
                            min={0}
                            step={0.01}
                            allowNull={false}
                            className={classNames('w-full', {
                                'border-rose-300': submitted && withdrawalPolicy.min_withdraw_amount === undefined
                            })}
                            placeholder={t('ENTER_MIN_AMOUNT')}
                        />
                    </FormField>
                    <FormField
                        label={t('MAX_WITHDRAW_AMOUNT')}
                        required
                        error={submitted && withdrawalPolicy.max_withdraw_amount === undefined ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <NumberInput
                            id="max_withdraw_amount"
                            value={Number(withdrawalPolicy.max_withdraw_amount)}
                            onValueChange={(v) =>
                                setWithdrawalPolicy((prev) => ({
                                    ...prev,
                                    max_withdraw_amount: v ?? 0
                                }))
                            }
                            min={0}
                            step={0.01}
                            allowNull={false}
                            className={classNames('w-full', {
                                'border-rose-300': submitted && withdrawalPolicy.max_withdraw_amount === undefined
                            })}
                            placeholder={t('ENTER_MAX_AMOUNT')}
                        />
                    </FormField>
                    {withdrawalPolicy.min_withdraw_amount >= withdrawalPolicy.max_withdraw_amount &&
                        withdrawalPolicy.min_withdraw_amount > 0 &&
                        withdrawalPolicy.max_withdraw_amount > 0 && (
                            <p className="sm:col-span-2 text-xs font-medium text-rose-600">{t('MIN_AMOUNT_MUST_BE_LESS_THAN_MAX_AMOUNT')}</p>
                        )}
                </FormSection>
            </FormSheet>

                    <Dialog
                        visible={deleteWithdrawalPolicyDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM')}
                        modal
                        footer={deleteWithdrawalPolicyDialogFooter}
                        onHide={hideDeleteWithdrawalPolicyDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {withdrawalPolicy && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>
                                        {withdrawalPolicy.currency?.code} {t('WITHDRAWAL_POLICY')}
                                    </b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={deleteWithdrawalPoliciesDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM')}
                        modal
                        footer={deleteWithdrawalPoliciesDialogFooter}
                        onHide={hideDeleteWithdrawalPoliciesDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {selectedWithdrawalPolicies && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}
                                    ({(selectedWithdrawalPolicies as any).length} {t('ITEMS')})?
                                </span>
                            )}
                        </div>
                    </Dialog>
        </div>
    );
};


export default withAuth(WithdrawalPolicyPage);
