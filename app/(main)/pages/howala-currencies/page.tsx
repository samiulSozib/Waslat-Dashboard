/* eslint-disable @next/next/no-img-element */
'use client';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _addHawalaCurrency, _deleteHawalaCurrency, _editHawalaCurrency, _fetchHawalaCurrencies } from '@/app/redux/actions/hawalaCurrenciesActions';
import { AppDispatch } from '@/app/redux/store';
import { FilterBar } from '@/components/admin/filter-bar';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ListPage } from '@/components/admin/list-page';
import { RowActions } from '@/components/admin/row-actions';
import { Button as UiButton } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Currency, HawalaCurrency } from '@/types/interface';
import { defaultHawalaRateDescription, resolveCurrencyFlag } from '@/lib/currency-flags';
import { cn } from '@/lib/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { isRTL } from '../../utilities/rtlUtil';

const CurrencyPage = () => {
    let emptyCurrency: HawalaCurrency = {
        id: 0,
        from_currency: null,
        from_currency_id: 0,
        to_currency: null,
        to_currency_id: 0,
        amount: 0,
        amount_in_letter:'',
        sell_rate: '',
        buy_rate: '',
        description: '',
        deleted_at: '',
        created_at: '',
        updated_at: ''
    };

    const [currencyDialog, setCurrencyDialog] = useState(false);
    const [deleteCurrencyDialog, setDeleteCurrencyDialog] = useState(false);
    const [deleteCurrencysDialog, setDeleteCurrencysDialog] = useState(false);
    const [currency, setCurrency] = useState<HawalaCurrency>(emptyCurrency);
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const searchTerm = useDebouncedValue(searchInput, 350);
    const toast = useRef<Toast>(null);
    const descriptionTouched = useRef(false);
    const dispatch = useDispatch<AppDispatch>();
    const { hawala_currencies, loading } = useSelector((state: any) => state.hawalaCurrenciesReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchCurrencies());
        dispatch(_fetchHawalaCurrencies());
    }, [dispatch]);



    const openNew = () => {
        descriptionTouched.current = false;
        setCurrency(emptyCurrency);
        setSubmitted(false);
        setCurrencyDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCurrencyDialog(false);
    };

    const hideDeleteCurrencyDialog = () => {
        setDeleteCurrencyDialog(false);
    };

    const hideDeleteCurrencysDialog = () => {
        setDeleteCurrencysDialog(false);
    };

    const saveCurrency = () => {
        setSubmitted(true);

        // Validate all required fields
        if (!currency.from_currency || !currency.to_currency || !currency.amount || !currency.sell_rate || !currency.buy_rate) {
            // Don't proceed if any required field is invalid
            return;
        }

        // Validate same currency
        // if (currency.from_currency.id === currency.to_currency.id) {
        //     toast.current?.show({
        //         severity: 'error',
        //         summary: t('ERROR'),
        //         detail: t('HAWALA.CURRENCY.ERROR.SAME_CURRENCY'),
        //         life: 3000
        //     });
        //     return;
        // }

        if (currency.id && currency.id !== 0) {
            dispatch(_editHawalaCurrency(currency.id, currency, toast, t));
        } else {
            dispatch(_addHawalaCurrency(currency, toast, t));
        }

        setCurrencyDialog(false);
        setCurrency(emptyCurrency);
        setSubmitted(false);
    };
    const editCurrency = (row: HawalaCurrency) => {
        const suggested = defaultHawalaRateDescription(row);
        const saved = (row.description || '').trim();
        descriptionTouched.current = Boolean(saved) && saved !== suggested;
        setCurrency({ ...row, description: saved || suggested });
        setCurrencyDialog(true);
    };

    const confirmDeleteCurrency = (currency: HawalaCurrency) => {
        setCurrency(currency);
        setDeleteCurrencyDialog(true);
    };

    const deleteCurrency = () => {
        if (!currency?.id) {
            console.error('Currency  ID is undefined.');
            return;
        }
        dispatch(_deleteHawalaCurrency(currency?.id, toast, t));
        setDeleteCurrencyDialog(false);
    };

    const filteredCurrencies = useMemo(() => {
        const rows = hawala_currencies || [];
        const q = searchTerm.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((row: HawalaCurrency) => {
            const haystack = [
                row.from_currency?.code,
                row.to_currency?.code,
                row.amount?.toString(),
                row.amount_in_letter,
                row.sell_rate,
                row.buy_rate,
                row.description,
                defaultHawalaRateDescription(row)
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [hawala_currencies, searchTerm]);

    const suggestedDescription = useMemo(
        () => defaultHawalaRateDescription(currency),
        [currency.from_currency, currency.to_currency, currency.amount, currency.buy_rate, currency.sell_rate]
    );

    useEffect(() => {
        if (!currencyDialog || descriptionTouched.current || !suggestedDescription) return;
        setCurrency((prev) => (prev.description === suggestedDescription ? prev : { ...prev, description: suggestedDescription }));
    }, [currencyDialog, suggestedDescription]);

    const currencyFlagSrc = (currency?: { id?: number; code?: string | null; flag_image_url?: string | null } | null) => {
        const full = (currencies || []).find((item: Currency) => String(item.id) === String(currency?.id)) || currency;
        return resolveCurrencyFlag(full || {});
    };

    const getRowActions = (row: HawalaCurrency) => [
        { label: t('TABLE.GENERAL.EDIT'), icon: <Pencil className="h-4 w-4" />, onClick: () => editCurrency(row) },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            danger: true,
            separatorBefore: true,
            onClick: () => confirmDeleteCurrency(row)
        }
    ];

    const deleteCurrencyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCurrencyDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteCurrency} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCurrencysDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.HAWALA_CURRENCIES', { defaultValue: 'نرخ ارز حواله' })}
                description={t('HAWALA.CURRENCY.PAGE.DESCRIPTION', { defaultValue: 'تنظیم جفت ارز و نرخ خرید/فروش حواله' })}
                loading={loading}
                actions={
                    <UiButton variant="default" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('CURRENCY.TABLE.CREATECURRENCY')}
                    </UiButton>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('TABLE.GENERAL.SEARCH', { defaultValue: 'جستجو...' })}
                    />
                }
                footer={
                    <div className="border-t border-emerald-100 px-3 py-2 text-xs text-muted-foreground">
                        {t('TOTAL', { defaultValue: 'مجموع' })}: {filteredCurrencies.length}
                    </div>
                }
            >
                <table className="w-full min-w-[960px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.CURRENCY.TABLE.COLUMN.FROM_CURRENCY')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.CURRENCY.TABLE.COLUMN.TO_CURRENCY')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.CURRENCY.TABLE.COLUMN.AMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.CURRENCY.TABLE.COLUMN.AMOUNT_IN_LETTER')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.CURRENCY.TABLE.COLUMN.SELL_RATE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.CURRENCY.TABLE.COLUMN.BUY_RATE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">توضیح</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCurrencies.length === 0 ? (
                            <tr>
                                    <td colSpan={8} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            filteredCurrencies.map((row: HawalaCurrency) => {
                                const fromFlag = currencyFlagSrc(row.from_currency);
                                const toFlag = currencyFlagSrc(row.to_currency);
                                return (
                                <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                    <td className="px-2 py-1.5 align-middle">
                                        <RowActions items={getRowActions(row)} />
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <span className="inline-flex items-center gap-1.5 font-medium">
                                            {fromFlag ? <img src={fromFlag} alt="" className="h-3.5 w-5 shrink-0 rounded-[2px] border border-border object-cover" /> : null}
                                            {row.from_currency?.code || '—'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <span className="inline-flex items-center gap-1.5 font-medium">
                                            {toFlag ? <img src={toFlag} alt="" className="h-3.5 w-5 shrink-0 rounded-[2px] border border-border object-cover" /> : null}
                                            {row.to_currency?.code || '—'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.amount ?? '—'}</td>
                                    <td className="px-2 py-1.5 max-w-[14rem] truncate text-muted-foreground" title={row.amount_in_letter || ''}>
                                        {row.amount_in_letter || '—'}
                                    </td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.sell_rate ?? '—'}</td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.buy_rate ?? '—'}</td>
                                    <td className="max-w-[22rem] px-2 py-1.5 text-muted-foreground" title={row.description || defaultHawalaRateDescription(row)}>
                                        {row.description?.trim() || defaultHawalaRateDescription(row) || '—'}
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </ListPage>

            <FormSheet
                open={currencyDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="xl"
                side="left"
                title={t('CURRENCY.DETAILS')}
                description={
                    currency.id
                        ? t('HAWALA.CURRENCY.FORM.EDIT_HINT', { defaultValue: 'ویرایش نرخ جفت ارز' })
                        : t('HAWALA.CURRENCY.FORM.CREATE_HINT', { defaultValue: 'تعریف جفت ارز و نرخ جدید' })
                }
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveCurrency}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('HAWALA.CURRENCY.FORM.SECTION.PAIR', { defaultValue: 'جفت ارز' })}>
                    <FormField
                        label={t('HAWALA.CURRENCY.TABLE.COLUMN.FROM_CURRENCY')}
                        required
                        error={submitted && !currency.from_currency ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={currency.from_currency}
                            options={currencies || []}
                            onChange={(selected) =>
                                setCurrency((prev) => ({
                                    ...prev,
                                    from_currency: selected
                                }))
                            }
                            optionLabel="name"
                            placeholder={t('HAWALA.CURRENCY.SELECT.FROM_CURRENCY')}
                            error={submitted && !currency.from_currency}
                            returnFullObject
                        />
                    </FormField>
                    <FormField
                        label={t('HAWALA.CURRENCY.TABLE.COLUMN.TO_CURRENCY')}
                        required
                        error={submitted && !currency.to_currency ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={currency.to_currency}
                            options={currencies || []}
                            onChange={(selected) =>
                                setCurrency((prev) => ({
                                    ...prev,
                                    to_currency: selected
                                }))
                            }
                            optionLabel="name"
                            placeholder={t('HAWALA.CURRENCY.SELECT.TO_CURRENCY')}
                            error={submitted && !currency.to_currency}
                            returnFullObject
                        />
                    </FormField>
                    <FormField
                        label={t('HAWALA.CURRENCY.TABLE.COLUMN.AMOUNT')}
                        required
                        error={submitted && !currency.amount ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="amount"
                            value={currency.amount?.toString() ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setCurrency((prevCurrency) => ({
                                    ...prevCurrency,
                                    amount: value === '' ? 0 : parseInt(value) || 0
                                }));
                            }}
                            required
                            autoFocus
                            placeholder={t('HAWALA.CURRENCY.TABLE.COLUMN.AMOUNT')}
                            className={cn('w-full', submitted && (!currency.amount || isNaN(currency.amount)) && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('HAWALA.CURRENCY.TABLE.COLUMN.AMOUNT_IN_LETTER')}
                        fullWidth
                        error={submitted && !currency.amount_in_letter ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="amount_in_letter"
                            value={currency.amount_in_letter?.toString() ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                setCurrency((prevCurrency) => ({
                                    ...prevCurrency,
                                    amount_in_letter: value
                                }));
                            }}
                            placeholder={t('HAWALA.CURRENCY.TABLE.COLUMN.AMOUNT_IN_LETTER')}
                            className={cn('w-full', submitted && !currency.amount_in_letter && 'border-rose-300')}
                        />
                    </FormField>
                </FormSection>
                <FormSection title={t('HAWALA.CURRENCY.FORM.SECTION.RATES', { defaultValue: 'نرخ خرید و فروش' })}>
                    <FormField
                        label={t('HAWALA.CURRENCY.TABLE.COLUMN.SELL_RATE')}
                        required
                        error={submitted && !currency.sell_rate ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="sell_rate"
                            value={currency.sell_rate?.toString()}
                            onChange={(e) =>
                                setCurrency((prevCurrency) => ({
                                    ...prevCurrency,
                                    sell_rate: e.target.value
                                }))
                            }
                            required
                            placeholder={t('HAWALA.CURRENCY.TABLE.COLUMN.SELL_RATE')}
                            className={cn('w-full', submitted && !currency.sell_rate && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('HAWALA.CURRENCY.TABLE.COLUMN.BUY_RATE')}
                        required
                        error={submitted && !currency.buy_rate ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="buy_rate"
                            value={currency.buy_rate?.toString()}
                            onChange={(e) =>
                                setCurrency((prevCurrency) => ({
                                    ...prevCurrency,
                                    buy_rate: e.target.value
                                }))
                            }
                            required
                            placeholder={t('HAWALA.CURRENCY.TABLE.COLUMN.BUY_RATE')}
                            className={cn('w-full', submitted && !currency.buy_rate && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label="توضیح"
                        fullWidth
                        hint="مثال: یعنی صراف از مشتریان ۱ میلیون تومان را به قیمت ۲۵۰ افغانی می‌خرد و ۲۶۰ افغانی می‌فروشد."
                    >
                        <Textarea
                            id="description"
                            value={currency.description || ''}
                            onChange={(e) => {
                                descriptionTouched.current = true;
                                setCurrency((prev) => ({
                                    ...prev,
                                    description: e.target.value
                                }));
                            }}
                            rows={3}
                            placeholder="یعنی صراف از مشتریان ۱ میلیون تومان را به قیمت ۲۵۰ افغانی می‌خرد و ۲۶۰ افغانی می‌فروشد."
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteCurrencyDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCurrencyDialogFooter} onHide={hideDeleteCurrencyDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {currency && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')}</span>}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCurrencysDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteCurrencysDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {currency && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
        </div>
    );
};

export default withAuth(CurrencyPage);
