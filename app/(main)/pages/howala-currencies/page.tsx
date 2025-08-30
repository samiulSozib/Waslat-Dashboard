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
import { Currency, HawalaCurrency } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addCurrency, _deleteCurrency, _editCurrency, _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { _addHawalaCurrency, _deleteHawalaCurrency, _editHawalaCurrency, _fetchHawalaCurrencies } from '@/app/redux/actions/hawalaCurrenciesActions';
import { hawalaCurrenciesReducer } from '../../../redux/reducers/hawalaCurrenciesReducer';
import { currenciesReducer } from '../../../redux/reducers/currenciesReducer';
import { _fetchCustomerPricing } from '@/app/redux/actions/customerPricingActions';

const CurrencyPage = () => {
    let emptyCurrency: HawalaCurrency = {
        id: 0,
        from_currency: null,
        from_currency_id: 0,
        to_currency: null,
        to_currency_id: 0,
        amount: 0,
        sell_rate: '',
        buy_rate: '',
        deleted_at: '',
        created_at: '',
        updated_at: ''
    };

    const [currencyDialog, setCurrencyDialog] = useState(false);
    const [deleteCurrencyDialog, setDeleteCurrencyDialog] = useState(false);
    const [deleteCurrencysDialog, setDeleteCurrencysDialog] = useState(false);
    const [currency, setCurrency] = useState<HawalaCurrency>(emptyCurrency);
    const [selectedCompanies, setSelectedCurrency] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { hawala_currencies, loading } = useSelector((state: any) => state.hawalaCurrenciesReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchCurrencies());
        dispatch(_fetchHawalaCurrencies());
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

        // Validate all required fields
        if (!currency.from_currency || !currency.to_currency || !currency.amount || !currency.sell_rate || !currency.buy_rate) {
            // Don't proceed if any required field is invalid
            return;
        }

        // Validate same currency
        if (currency.from_currency.id === currency.to_currency.id) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('HAWALA.CURRENCY.ERROR.SAME_CURRENCY'),
                life: 3000
            });
            return;
        }

        if (currency.id && currency.id !== 0) {
            dispatch(_editHawalaCurrency(currency.id, currency, toast, t));
        } else {
            dispatch(_addHawalaCurrency(currency, toast, t));
        }

        setCurrencyDialog(false);
        setCurrency(emptyCurrency);
        setSubmitted(false);
    };
    const editCurrency = (currency: HawalaCurrency) => {
        setCurrency({ ...currency });

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

    const fromCurrencyCodeBodyTemplate = (rowData: HawalaCurrency) => {
        return (
            <>
                <span className="p-column-title">From Code</span>
                {rowData.from_currency?.code}
            </>
        );
    };

    const toCurrencyCodeBodyTemplate = (rowData: HawalaCurrency) => {
        return (
            <>
                <span className="p-column-title">To Code</span>
                {rowData.to_currency?.code}
            </>
        );
    };

    const amountBodyTemplate = (rowData: HawalaCurrency) => {
        return (
            <>
                <span className="p-column-title">Amount</span>
                {rowData.amount}
            </>
        );
    };

    const sellRateBodyTemplate = (rowData: HawalaCurrency) => {
        return (
            <>
                <span className="p-column-title">Sell Rate</span>
                {rowData.sell_rate}
            </>
        );
    };

    const buyRateBodyTemplate = (rowData: HawalaCurrency) => {
        return (
            <>
                <span className="p-column-title">Buy Rate</span>
                {rowData.buy_rate}
            </>
        );
    };

    const actionBodyTemplate = (rowData: HawalaCurrency) => {
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
                        value={hawala_currencies}
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
                            field="from_currency"
                            header={t('HAWALA.CURRENCY.TABLE.COLUMN.FROM_CURRENCY')}
                            sortable
                            body={fromCurrencyCodeBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="to_currency"
                            header={t('HAWALA.CURRENCY.TABLE.COLUMN.TO_CURRENCY')}
                            sortable
                            body={toCurrencyCodeBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="amount"
                            header={t('HAWALA.CURRENCY.TABLE.COLUMN.AMOUNT')}
                            sortable
                            body={amountBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="sell_rate"
                            header={t('HAWALA.CURRENCY.TABLE.COLUMN.SELL_RATE')}
                            sortable
                            body={sellRateBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="buy_rate"
                            header={t('HAWALA.CURRENCY.TABLE.COLUMN.BUY_RATE')}
                            sortable
                            body={buyRateBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={currencyDialog} style={{ width: '900px', padding: '5px' }} header={t('CURRENCY.DETAILS')} modal className="p-fluid" footer={currencyDialogFooter} onHide={hideDialog}>
                        <div className="card flex flex-wrap p-fluid mt-3 gap-4">
                            <div className="flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="from_currency" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.CURRENCY.TABLE.COLUMN.FROM_CURRENCY')}
                                    </label>
                                    <Dropdown
                                        id="from_currency"
                                        options={currencies}
                                        optionLabel="name"
                                        value={currency.from_currency}
                                        onChange={(e) =>
                                            setCurrency((prev) => ({
                                                ...prev,
                                                from_currency: e.value
                                            }))
                                        }
                                        placeholder={t('HAWALA.CURRENCY.SELECT.FROM_CURRENCY')}
                                        className="w-full"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="to_currency" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.CURRENCY.TABLE.COLUMN.TO_CURRENCY')}
                                    </label>
                                    <Dropdown
                                        id="to_currency"
                                        options={currencies}
                                        optionLabel="name"
                                        value={currency.to_currency}
                                        onChange={(e) =>
                                            setCurrency((prev) => ({
                                                ...prev,
                                                to_currency: e.value
                                            }))
                                        }
                                        placeholder={t('HAWALA.CURRENCY.SELECT.TO_CURRENCY')}
                                        className="w-full"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="symbol" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.CURRENCY.TABLE.COLUMN.AMOUNT')}
                                    </label>
                                    <InputText
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
                                        className={classNames({
                                            'p-invalid': submitted && (!currency.amount || isNaN(currency.amount))
                                        })}
                                    />

                                    {submitted && !currency.amount && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="exchange_rate_per_usd" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.CURRENCY.TABLE.COLUMN.SELL_RATE')}
                                    </label>
                                    <InputText
                                        id="exchange_rate_per_usd"
                                        value={currency.sell_rate?.toString()}
                                        onChange={(e) =>
                                            setCurrency((prevCurrency) => ({
                                                ...prevCurrency,
                                                sell_rate: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('HAWALA.CURRENCY.TABLE.COLUMN.SELL_RATE')}
                                        className={classNames({
                                            'p-invalid': submitted && !currency.sell_rate
                                        })}
                                    />
                                    {submitted && !currency.sell_rate && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="exchange_rate_per_usd" style={{ fontWeight: 'bold' }}>
                                        {t('HAWALA.CURRENCY.TABLE.COLUMN.BUY_RATE')}
                                    </label>
                                    <InputText
                                        id="exchange_rate_per_usd"
                                        value={currency.buy_rate?.toString()}
                                        onChange={(e) =>
                                            setCurrency((prevCurrency) => ({
                                                ...prevCurrency,
                                                buy_rate: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('HAWALA.CURRENCY.TABLE.COLUMN.BUY_RATE')}
                                        className={classNames({
                                            'p-invalid': submitted && !currency.buy_rate
                                        })}
                                    />
                                    {submitted && !currency.buy_rate && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCurrencyDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCurrencyDialogFooter} onHide={hideDeleteCurrencyDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {currency && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')}</span>}
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
