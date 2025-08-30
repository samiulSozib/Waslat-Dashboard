/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Currency } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addCurrency, _deleteCurrency, _editCurrency, _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const CurrencyPage = () => {
    let emptyCurrency: Currency = {
        id: 0,
        name: '',
        code: '',
        symbol: '',
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

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('CURRENCY.TABLE.CREATECURRENCY')}
                        icon="pi pi-plus"
                        severity="success"
                        className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
                        onClick={openNew}
                    />
                    {/* <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('APP.GENERAL.DELETE')}
                        icon="pi pi-trash"
                        severity="danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedCompanies || !(selectedCompanies as any).length}
                    /> */}
                </div>
            </React.Fragment>
        );
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

    const actionBodyTemplate = (rowData: Currency) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editCurrency(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteCurrency(rowData)} />
            </>
        );
    };

    // const header = (
    //     <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
    //         <h5 className="m-0">Manage Products</h5>
    //         <span className="block mt-2 md:mt-0 p-input-icon-left">
    //             <i className="pi pi-search" />
    //             <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
    //         </span>
    //     </div>
    // );

    const currencyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveCurrency} />
        </>
    );
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
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={currencies}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedCurrency(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                        paginatorTemplate={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr',fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        // header={header}
                        responsiveLayout="scroll"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
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
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={currencyDialog} style={{ width: '900px', padding: '5px' }} header={t('CURRENCY.DETAILS')} modal className="p-fluid" footer={currencyDialogFooter} onHide={hideDialog}>
                        <div className="card" style={{ padding: '40px' }}>
                            <div className="field">
                                <small className="p-text-muted" style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                                    <b>Hints:</b>
                                    <br />
                                    <hr />
                                    AFN, IRR, INR, PKR: ؋, ﷼, ₹, Rs USD: $, EUR: €, JPY: ¥, GBP: £ AUD, CAD: $, CHF: Fr, CNY: ¥ SEK: kr, NZD: $, MXN: $, SGD, HKD: $, NOK: kr KRW: ₩, TRY: ₺, BRL: R$, ZAR: R
                                </small>
                            </div>
                            <div className="field">
                                <label htmlFor="name" style={{ fontWeight: 'bold' }}>
                                    {t('CURRENCY.FORM.INPUT.CURRENCYNAME')}
                                </label>
                                <InputText
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
                                    className={classNames({
                                        'p-invalid': submitted && !currency.name
                                    })}
                                />
                                {submitted && !currency.name && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="code" style={{ fontWeight: 'bold' }}>
                                    {t('CURRENCY.FORM.INPUT.CURRENCYCODE')}
                                </label>
                                <InputText
                                    id="code"
                                    value={currency.code}
                                    onChange={(e) =>
                                        setCurrency((prevCurrency) => ({
                                            ...prevCurrency,
                                            code: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('CURRENCY.FORM.PLACEHOLDER.CURRENCYCODE')}
                                    className={classNames({
                                        'p-invalid': submitted && !currency.code
                                    })}
                                />
                                {submitted && !currency.code && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="symbol" style={{ fontWeight: 'bold' }}>
                                    {t('CURRENCY.FORM.INPUT.SYMBOL')}
                                </label>
                                <InputText
                                    id="symbol"
                                    value={currency.symbol}
                                    onChange={(e) =>
                                        setCurrency((prevCurrency) => ({
                                            ...prevCurrency,
                                            symbol: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('CURRENCY.FORM.PLACEHOLDER.SYMBOL')}
                                    className={classNames({
                                        'p-invalid': submitted && !currency.symbol
                                    })}
                                />
                                {submitted && !currency.symbol && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="exchange_rate_per_usd" style={{ fontWeight: 'bold' }}>
                                    {t('CURRENCY.FORM.INPUT.EXCHANGERATE')}
                                </label>
                                <InputText
                                    id="exchange_rate_per_usd"
                                    value={currency.exchange_rate_per_usd}
                                    onChange={(e) =>
                                        setCurrency((prevCurrency) => ({
                                            ...prevCurrency,
                                            exchange_rate_per_usd: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('CURRENCY.FORM.PLACEHOLDER.EXCHANGERATE')}
                                    className={classNames({
                                        'p-invalid': submitted && !currency.exchange_rate_per_usd
                                    })}
                                />
                                {submitted && !currency.exchange_rate_per_usd && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCurrencyDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCurrencyDialogFooter} onHide={hideDeleteCurrencyDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {currency && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{currency.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCurrencysDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteCurrencysDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {currency && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(CurrencyPage);
