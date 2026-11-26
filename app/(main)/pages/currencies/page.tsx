/* eslint-disable @next/next/no-img-element */
'use client';
import { Button as PrimeButton } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileDrop } from '@/components/ui/file-drop';
import { cn } from '@/lib/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Currency } from '@/types/interface';
import { _addCurrency, _deleteCurrency, _editCurrency, _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { CURRENCY_FLAG_OPTIONS, flagForCurrencyCode, isPresetFlag, resolveCurrencyFlag } from '@/lib/currency-flags';

const CurrencyPage = () => {
    let emptyCurrency: Currency = {
        id: 0,
        name: '',
        code: '',
        symbol: '',
        flag_image_url: '',
        ignore_digits_count: '',
        exchange_rate_per_usd: '',
        deleted_at: '',
        created_at: '',
        updated_at: ''
    };

    const [currencyDialog, setCurrencyDialog] = useState(false);
    const [deleteCurrencyDialog, setDeleteCurrencyDialog] = useState(false);
    const [deleteCurrencysDialog, setDeleteCurrencysDialog] = useState(false);
    const [currency, setCurrency] = useState<Currency>(emptyCurrency);
    const [selectedCompanies, setSelectedCurrency] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { currencies, loading } = useSelector((state: any) => state.currenciesReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchCurrencies());
    }, [dispatch]);

    const openNew = () => {
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
        if (!currency.name || currency.name.length === 0 || !currency.code || currency.code.length === 0 || !currency.symbol || currency.symbol.length === 0 || !currency.exchange_rate_per_usd || currency.exchange_rate_per_usd.length === 0) {
            // Don't proceed if any field is invalid
            return;
        }
        if (currency.id && currency.id !== 0) {
            dispatch(_editCurrency(currency.id, currency, toast, t));
        } else {
            dispatch(_addCurrency(currency, toast, t));
        }

        setCurrencyDialog(false);
        setCurrency(emptyCurrency);
    };

    const editCurrency = (currency: Currency) => {
        setCurrency({ ...currency });

        setCurrencyDialog(true);
    };

    const confirmDeleteCurrency = (currency: Currency) => {
        setCurrency(currency);
        setDeleteCurrencyDialog(true);
    };

    const deleteCurrency = () => {
        if (!currency?.id) {
            console.error('Currency  ID is undefined.');
            return;
        }
        dispatch(_deleteCurrency(currency?.id, toast, t));
        setDeleteCurrencyDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteCurrencysDialog(true);
    };

    // const leftToolbarTemplate = () => {
    //     return (
    //         <div className="flex items-center">
    //             <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
    //                 <i className="pi pi-search" />
    //                 <InputText
    //                     type="search"
    //                     onInput={(e) => setGlobalFilter(e.currentTarget.value)}
    //                     placeholder={t('ECOMMERCE.COMMON.SEARCH')}
    //                     className="w-full md:w-auto"
    //                 />
    //             </span>
    //         </div>
    //     );
    // };

    const flagBodyTemplate = (rowData: Currency) => {
        const src = resolveCurrencyFlag(rowData);
        return (
            <>
                <span className="p-column-title">Flag</span>
                {src ? (
                    <img src={src} alt={rowData.name?.toString() || rowData.code} className="h-8 w-10 rounded-sm object-cover shadow-sm" />
                ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                )}
            </>
        );
    };

    const currencyCodeBodyTemplate = (rowData: Currency) => {
        return (
            <>
                <span className="p-column-title">Currency Code</span>
                {rowData.code}
            </>
        );
    };

    const currencyNameBodyTemplate = (rowData: Currency) => {
        return (
            <>
                <span className="p-column-title">Currency Name</span>
                {rowData.name}
            </>
        );
    };

    const exchangeRateBodyTemplate = (rowData: Currency) => {
        return (
            <>
                <span className="p-column-title">Exchange Rate</span>
                {rowData.exchange_rate_per_usd}
            </>
        );
    };

        const ignoreDigitsCountBodyTemplate = (rowData: Currency) => {
        return (
            <>
                <span className="p-column-title">Ignore Digits Count</span>
                {rowData.ignore_digits_count}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Currency) => (
        <RowActions
            items={[
                {
                    label: t('TABLE.GENERAL.EDIT'),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editCurrency(rowData)
                },
                {
                    label: t('TABLE.GENERAL.DELETE'),
                    icon: <Trash2 className="h-4 w-4" />,
                    danger: true,
                    separatorBefore: true,
                    onClick: () => confirmDeleteCurrency(rowData)
                }
            ]}
        />
    );

    // const header = (
    //     <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
    //         <h5 className="m-0">Manage Products</h5>
    //         <span className="block mt-2 md:mt-0 p-input-icon-left">
    //             <i className="pi pi-search" />
    //             <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
    //         </span>
    //     </div>
    // );

    const deleteCurrencyDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCurrencyDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteCurrency} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCurrencysDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.CURRENCY', { defaultValue: 'ارز' })}
                description="مدیریت ارزها و نرخ تبدیل"
                loading={loading}
                actions={
                    <Button type="button" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('CURRENCY.TABLE.CREATECURRENCY')}
                    </Button>
                }
                toolbar={
                    <FilterBar
                        search={globalFilter}
                        onSearchChange={setGlobalFilter}
                        searchPlaceholder={t('TABLE.GENERAL.SEARCH', { defaultValue: 'جستجو...' })}
                    />
                }
            >
                <DataTable
                    ref={dt}
                    value={currencies}
                    selection={selectedCompanies}
                    onSelectionChange={(e) => setSelectedCurrency(e.value as any)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    size="small"
                    className="datatable-responsive p-datatable-sm"
                    paginatorTemplate={
                        isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    }
                    currentPageReportTemplate={t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}
                    emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                    dir={isRTL() ? 'rtl' : 'ltr'}
                    style={{ direction: isRTL() ? 'rtl' : 'ltr',fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                    globalFilter={globalFilter}
                    responsiveLayout="scroll"
                >
                        <Column
                            header={t('TABLE.GENERAL.ACTION')}
                            body={actionBodyTemplate}
                            headerStyle={{ width: '4.5rem' }}
                            style={{ ...customCellStyle, textAlign: 'start' }}
                        />
                        <Column
                            header={t('CURRENCY.TABLE.COLUMN.FLAG', { defaultValue: 'پرچم' })}
                            body={flagBodyTemplate}
                            headerStyle={{ width: '5rem' }}
                            style={{ ...customCellStyle, textAlign: 'start' }}
                        />
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="name"
                            header={t('CURRENCY.TABLE.COLUMN.CURRENCYNAME')}
                            sortable
                            body={currencyNameBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="code"
                            header={t('CURRENCY.TABLE.COLUMN.CURRENCYCODE')}
                            sortable
                            body={currencyCodeBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="exchange_rate"
                            header={t('CURRENCY.TABLE.COLUMN.EXCHANGERATE')}
                            sortable
                            body={exchangeRateBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="exchange_rate"
                            header={t('CURRENCY.FORM.INPUT.IGNOREDIGITSCOUNT')}
                            sortable
                            body={ignoreDigitsCountBodyTemplate}
                        ></Column>
                    </DataTable>
            </ListPage>

            <FormSheet
                open={currencyDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('CURRENCY.DETAILS')}
                description={currency.id ? 'ویرایش ارز' : 'ثبت ارز جدید'}
                size="xl"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveCurrency}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection
                    title={t('CURRENCY.DETAILS')}
                    description="AFN, IRR, INR, PKR: ؋, ﷼, ₹, Rs — USD: $, EUR: €, JPY: ¥, GBP: £ و سایر نمادها"
                >
                    <FormField label={t('CURRENCY.FORM.FLAG_PICK', { defaultValue: 'انتخاب پرچم' })} fullWidth>
                        <div className="flex flex-wrap gap-2">
                            {CURRENCY_FLAG_OPTIONS.map((option) => {
                                const selected = currency.flag_image_url === option.flag;
                                return (
                                    <button
                                        key={option.code}
                                        type="button"
                                        title={option.name}
                                        onClick={() =>
                                            setCurrency((prev) => ({
                                                ...prev,
                                                flag_image_url: option.flag,
                                                code: prev.code?.trim() ? prev.code : option.code
                                            }))
                                        }
                                        className={cn(
                                            'flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs transition-colors',
                                            selected
                                                ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                                                : 'border-emerald-200 bg-white hover:bg-emerald-50'
                                        )}
                                    >
                                        <img src={option.flag} alt="" className="h-4 w-6 rounded-sm object-cover" />
                                        <span>{option.code}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </FormField>
                    <FormField label={t('CURRENCY.FORM.FLAG_UPLOAD', { defaultValue: 'آپلود پرچم ارز' })} fullWidth>
                        <FileDrop
                            value={currency.flag_image_url instanceof File ? currency.flag_image_url : null}
                            previewUrl={
                                typeof currency.flag_image_url === 'string' && currency.flag_image_url
                                    ? currency.flag_image_url
                                    : null
                            }
                            onChange={(file) =>
                                setCurrency((prev) => ({
                                    ...prev,
                                    flag_image_url:
                                        file ?? (prev.flag_image_url instanceof File ? '' : prev.flag_image_url)
                                }))
                            }
                            label={t('CURRENCY.FORM.FLAG_UPLOAD', { defaultValue: 'آپلود پرچم ارز' })}
                        />
                    </FormField>
                    <FormField
                        label={t('CURRENCY.FORM.INPUT.CURRENCYNAME')}
                        required
                        error={submitted && !currency.name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="name"
                            value={currency.name}
                            onChange={(e) =>
                                setCurrency((prevCurrency) => ({
                                    ...prevCurrency,
                                    name: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            placeholder={t('CURRENCY.FORM.PLACEHOLDER.CURRENCYNAME')}
                            className={cn('w-full', submitted && !currency.name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('CURRENCY.FORM.INPUT.CURRENCYCODE')}
                        required
                        error={submitted && !currency.code ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="code"
                            value={currency.code}
                            onChange={(e) => {
                                const nextCode = e.target.value;
                                setCurrency((prevCurrency) => {
                                    const suggested = flagForCurrencyCode(nextCode);
                                    const keepCustom =
                                        prevCurrency.flag_image_url instanceof File ||
                                        (typeof prevCurrency.flag_image_url === 'string' &&
                                            prevCurrency.flag_image_url &&
                                            !isPresetFlag(prevCurrency.flag_image_url));
                                    return {
                                        ...prevCurrency,
                                        code: nextCode,
                                        flag_image_url: !keepCustom && suggested ? suggested : prevCurrency.flag_image_url
                                    };
                                });
                            }}
                            required
                            placeholder={t('CURRENCY.FORM.PLACEHOLDER.CURRENCYCODE')}
                            className={cn('w-full', submitted && !currency.code && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('CURRENCY.FORM.INPUT.SYMBOL')}
                        required
                        error={submitted && !currency.symbol ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="symbol"
                            value={currency.symbol}
                            onChange={(e) =>
                                setCurrency((prevCurrency) => ({
                                    ...prevCurrency,
                                    symbol: e.target.value
                                }))
                            }
                            required
                            placeholder={t('CURRENCY.FORM.PLACEHOLDER.SYMBOL')}
                            className={cn('w-full', submitted && !currency.symbol && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('CURRENCY.FORM.INPUT.EXCHANGERATE')}
                        required
                        error={submitted && !currency.exchange_rate_per_usd ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="exchange_rate_per_usd"
                            value={currency.exchange_rate_per_usd}
                            onChange={(e) =>
                                setCurrency((prevCurrency) => ({
                                    ...prevCurrency,
                                    exchange_rate_per_usd: e.target.value
                                }))
                            }
                            required
                            placeholder={t('CURRENCY.FORM.PLACEHOLDER.EXCHANGERATE')}
                            className={cn('w-full', submitted && !currency.exchange_rate_per_usd && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField label={t('CURRENCY.FORM.INPUT.IGNOREDIGITSCOUNT')}>
                        <Input
                            id="ignore_digits_count"
                            value={currency.ignore_digits_count?.toString()}
                            onChange={(e) =>
                                setCurrency((prevCurrency) => ({
                                    ...prevCurrency,
                                    ignore_digits_count: e.target.value
                                }))
                            }
                            placeholder={t('CURRENCY.FORM.INPUT.IGNOREDIGITSCOUNT')}
                            className="w-full"
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteCurrencyDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCurrencyDialogFooter} onHide={hideDeleteCurrencyDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {currency && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{currency.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCurrencysDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteCurrencysDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {currency && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
        </>
    );
};

export default withAuth(CurrencyPage);
