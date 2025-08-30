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
import { Balance, Currency } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addBalance, _deleteBalance, _editBalance, _fetchBalances } from '@/app/redux/actions/balanceActions';
import { useTranslation } from 'react-i18next';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchPaymentMethods } from '@/app/redux/actions/paymentMethodActions';
import { Calendar } from 'primereact/calendar';
import i18n from '@/i18n';
import { isRTL } from '../utilities/rtlUtil';
import { customCellStyle } from '../utilities/customRow';
import { fetchResellerBalances } from '@/app/redux/actions/resellerInformationActions';
import { Paginator } from 'primereact/paginator';
import { generateBalanceExcelFile } from '../utilities/generateExcel';

interface ResellerBalancesProps {
    resellerId: number;
}

const ResellerBalances = ({ resellerId }: ResellerBalancesProps) => {
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
    const [selectedCompanies, setSelectedBalance] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { balances, balances_pagination, loading } = useSelector((state: any) => state.resellerInformationReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const { paymentMethods } = useSelector((state: any) => state.paymentMethodsReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');
    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
    const [filters, setFilters] = useState({
        filter_transaction_type: null as string | null,
        filter_startdate: null as string | null,
        filter_enddate: null as string | null
    });
    const [activeFilters, setActiveFilters] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchResellerBalances(resellerId, 1, searchTag,activeFilters));
        dispatch(_fetchCurrencies());
        dispatch(_fetchResellers());
        dispatch(_fetchPaymentMethods());
    }, [dispatch, searchTag, resellerId,activeFilters]);

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
        setBalance({ ...balance });

        setBalanceDialog(true);
    };

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

    const confirmDeleteSelected = () => {
        setDeleteBalancesDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="-m-1 my-2 flex flex-wrap gap-1 w-full">

                    <div className="flex-1 min-w-[100px]" ref={filterRef} style={{ position: 'relative' }}>
                    <Button
                        className="p-button-info w-full"
                        label={t('FILTER')}
                        icon="pi pi-filter"
                        onClick={() => setFilterDialogVisible(!filterDialogVisible)}
                    />
                    {filterDialogVisible && (
                        <div
                            className="p-card p-fluid"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: isRTL() ? 0 : '',
                                right: isRTL() ? '' : 0,
                                width: '300px',
                                zIndex: 1000,
                                marginTop: '0.5rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div className="p-card-body" style={{ padding: '1rem' }}>
                                <div className="grid">
                                    {/* Transaction Type Filter */}
                                    <div className="col-12">
                                        <label htmlFor="transactionTypeFilter" style={{ fontSize: '0.875rem' }}>
                                            {t('BALANCE.FORM.INPUT.TRANSACTIONTYPE')}
                                        </label>
                                        <Dropdown
                                            id="transactionTypeFilter"
                                            options={[
                                                { label: t('CREDIT'), value: 'credit' },
                                                { label: t('DEBIT'), value: 'debit' }
                                            ]}
                                            value={filters.filter_transaction_type}
                                            onChange={(e) => setFilters({ ...filters, filter_transaction_type: e.value })}
                                            placeholder={t('SELECT_TRANSACTION_TYPE')}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    {/* Date Range Filters */}
                                    <div className="col-12">
                                        <label htmlFor="startDateFilter" style={{ fontSize: '0.875rem' }}>
                                            {t('START_DATE')}
                                        </label>
                                        <InputText
                                            type="date"
                                            id="startDateFilter"
                                            value={filters.filter_startdate || ''}
                                            onChange={(e) => setFilters({ ...filters, filter_startdate: e.target.value })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="endDateFilter" style={{ fontSize: '0.875rem' }}>
                                            {t('END_DATE')}
                                        </label>
                                        <InputText
                                            type="date"
                                            id="endDateFilter"
                                            value={filters.filter_enddate || ''}
                                            onChange={(e) => setFilters({ ...filters, filter_enddate: e.target.value })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="col-12 mt-3 flex justify-content-between gap-2">
                                        <Button
                                            label={t('RESET')}
                                            icon="pi pi-times"
                                            className="p-button-secondary p-button-sm"
                                            onClick={() => {
                                                setFilters({
                                                    filter_transaction_type: null,
                                                    filter_startdate: null,
                                                    filter_enddate: null
                                                });
                                            }}
                                        />
                                        <Button
                                            label={t('APPLY')}
                                            icon="pi pi-check"
                                            className="p-button-sm"
                                            onClick={() => {
                                                handleSubmitFilter(filters);
                                                setFilterDialogVisible(false);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <Button className="flex-1 min-w-[100px]" label={t('EXPORT.EXPORT')} icon={`pi pi-file-excel`} severity="success" onClick={exportToExcel} />

                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <span className="block mt-2 md:mt-0 p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setSearchTag(e.currentTarget.value)} placeholder={t('ECOMMERCE.COMMON.SEARCH')} />
                </span>
            </React.Fragment>
        );
    };

    const resellerNameBodyTemplate = (rowData: Balance) => {
        return (
            <>
                <span className="p-column-title">Reseller</span>
                {rowData.reseller?.reseller_name}
            </>
        );
    };

    const amountBodyTemplate = (rowData: Balance) => {
        return (
            <>
                <span className="p-column-title">Amount</span>
                {rowData.amount}
            </>
        );
    };

    const currencyBodyTemplate = (rowData: Balance) => {
        return (
            <>
                <span className="p-column-title">Currency</span>
                {rowData.currency?.code}
            </>
        );
    };

    const remainingBalanceBodyTemplate = (rowData: Balance) => {
        return (
            <>
                <span className="p-column-title">Remaining Balance</span>
                {rowData.remaining_balance}
            </>
        );
    };

    const statusBodyTemplate = (rowData: Balance) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                {rowData.transaction_type}
            </>
        );
    };

    const descriptionBodyTemplate = (rowData: Balance) => {
        return (
            <>
                <span className="p-column-title">Description</span>
                {rowData.description}
            </>
        );
    };

    const createdAtBodyTemplate = (rowData: Balance) => {
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const optionsDate: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const optionsTime: Intl.DateTimeFormatOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            const formattedDate = date.toLocaleDateString('en-US', optionsDate);
            const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

            return { formattedDate, formattedTime };
        };

        const { formattedDate, formattedTime } = formatDate(rowData.created_at);

        return (
            <>
                <span className="p-column-title">Created At</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Balance) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editBalance(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteBalance(rowData)} />
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

    const balanceDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveBalance} />
        </>
    );
    const deleteBalanceDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteBalanceDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteBalance} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteBalancesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
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
    }, [balance?.reseller?.code, currencies]);

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

            setResellerBalance(`${resellerBalanceValue} ${formattedCurrency}`);
            setResellerPayment(`${paymentDiff > 0 ? paymentDiff : 0} ${formattedCurrency}`);
            setResellerLoan(`${paymentDiff} ${formattedCurrency}`);
        }
    }, [balance.reseller, balance.currency?.code]);

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(fetchResellerBalances(resellerId, page, searchTag));
    };



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


// Add these helper functions
const handleSubmitFilter = (filters: any) => {
    const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== null && value !== '')
    );
    setActiveFilters(cleanedFilters);
};


    const exportToExcel = async () => {
        await generateBalanceExcelFile({
            balances,
            resellerId,
            t,
            toast,
            all: true
        });
    };

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={balances}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedBalance(e.value as any)}
                        dataKey="id"
                        rows={balances_pagination?.items_per_page}
                        totalRecords={balances_pagination?.total}
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
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        // header={header}
                        responsiveLayout="scroll"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('BALANCE.TABLE.COLUMN.RESELLER')} body={resellerNameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('BALANCE.TABLE.COLUMN.AMOUNT')} body={amountBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('BALANCE.TABLE.COLUMN.CURRENCY')} body={currencyBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('BALANCE.TABLE.COLUMN.REMAINING_BALANCE')} body={remainingBalanceBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('BALANCE.TABLE.COLUMN.STATUS')} body={statusBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('BALANCE.TABLE.COLUMN.DESCRIPTIONS')} body={descriptionBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('BALANCE.TABLE.COLUMN.BALANCEDATE')} body={createdAtBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Paginator
                        first={(balances_pagination?.page - 1) * balances_pagination?.items_per_page}
                        rows={balances_pagination?.items_per_page}
                        totalRecords={balances_pagination?.total}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                    />

                    <Dialog visible={balanceDialog} style={{ width: '900px', padding: '5px' }} header={t('BALANCE.DETAILS.TITLE')} modal className="p-fluid" footer={balanceDialogFooter} onHide={hideDialog}>
                        {resellerBalance !== null && resellerPayment !== null && (
                            <div
                                className="flex flex-wrap justify-between items-center"
                                style={{
                                    borderRadius: '10px',
                                    background: '#ffffff',
                                    border: '1px solid #e5e7eb', // Tailwind gray-200
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                                }}
                            >
                                {/* Reseller Balance */}
                                <div className="flex-1 col-12 lg:col-4 text-center p-4 bg-green-50 rounded-xl shadow-sm">
                                    <p className="text-gray-600 font-medium">{t('BALANCE.FORM.RESELLER.BALANCE')}</p>
                                    <p className="text-xl font-bold text-green-600 mt-2">{resellerBalance}</p>
                                </div>

                                {/* Reseller Payment */}
                                <div className="flex-1 col-12 lg:col-4 text-center p-4 bg-red-50 rounded-xl shadow-sm">
                                    <p className="text-gray-600 font-medium">{t('BALANCE.FORM.RESELLER.PAYMENT')}</p>
                                    <p className="text-xl font-bold text-red-600 mt-2">{resellerPayment}</p>
                                </div>

                                {/* Reseller Loan */}
                                <div className="flex-1 col-12 lg:col-4 text-center p-4 bg-purple-50 rounded-xl shadow-sm">
                                    <p className="text-gray-600 font-medium">{t('BALANCE.FORM.RESELLER.LOAN')}</p>
                                    <p className="text-xl font-bold text-purple-600 mt-2">{resellerLoan}</p>
                                </div>
                            </div>
                        )}
                        {/* Balance Details */}

                        <div className="card flex flex-wrap p-fluid mt-3 gap-4">
                            <div className="flex-1 col-12 lg:col-6">
                                <div className="">
                                    <h5 className="mb-4">{t('BALANCE.DETAILS.TITLE')}</h5>

                                    {/* Reseller */}
                                    <div className="field">
                                        <label htmlFor="reseller">{t('BALANCE.FORM.INPUT.RESELLER')} *</label>
                                        <Dropdown
                                            id="reseller"
                                            value={balance.reseller}
                                            options={resellers}
                                            onChange={(e) =>
                                                setBalance((prev) => ({
                                                    ...prev,
                                                    reseller: e.value
                                                }))
                                            }
                                            optionLabel="reseller_name"
                                            //optionValue="id"
                                            placeholder={t('BALANCE.FORM.RESELLER.PLACEHOLDER')}
                                            className="w-full"
                                        />
                                        {submitted && !balance.reseller && (
                                            <small className="p-invalid" style={{ color: 'red' }}>
                                                {t('REQUIRED')}
                                            </small>
                                        )}
                                    </div>

                                    {/* Transaction Type */}
                                    <div className="field">
                                        <label htmlFor="transaction_type">{t('BALANCE.FORM.INPUT.TRANSACTIONTYPE')} *</label>
                                        <Dropdown
                                            id="transaction_type"
                                            value={balance.transaction_type}
                                            options={[
                                                { label: 'Credit', value: 'credit' },
                                                { label: 'Debit', value: 'debit' }
                                            ]}
                                            onChange={(e) =>
                                                setBalance((prev) => ({
                                                    ...prev,
                                                    transaction_type: e.value
                                                }))
                                            }
                                            placeholder={t('BALANCE.FORM.TRANSACTIONTYPE.PLACEHOLDER')}
                                            className="w-full"
                                        />
                                        {submitted && !balance.transaction_type && (
                                            <small className="p-invalid" style={{ color: 'red' }}>
                                                {t('REQUIRED')}
                                            </small>
                                        )}
                                    </div>

                                    <div className="field">
                                        <label htmlFor="amount">{t('BALANCE.FORM.INPUT.BALANCEAMOUNT')} *</label>
                                        <InputText
                                            id="amount"
                                            value={balance.amount}
                                            onChange={(e) =>
                                                setBalance((prev) => ({
                                                    ...prev,
                                                    amount: e.target.value
                                                }))
                                            }
                                            placeholder="0"
                                            type="number"
                                            className="w-full"
                                        />
                                        {submitted && !balance.amount && (
                                            <small className="p-invalid" style={{ color: 'red' }}>
                                                {t('REQUIRED')}
                                            </small>
                                        )}
                                    </div>

                                    {/* Currency */}
                                    <div className="field">
                                        <label htmlFor="currency_id">{t('BALANCE.FORM.INPUT.CURRENCY')} *</label>
                                        <Dropdown
                                            disabled
                                            id="currency_id"
                                            value={balance.currency_id}
                                            options={currencies}
                                            onChange={(e) =>
                                                setBalance((prev) => ({
                                                    ...prev,
                                                    currency_id: e.value
                                                }))
                                            }
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder={t('BALANCE.FORM.CURRENCY.PLACEHOLDER')}
                                            className="w-full"
                                        />
                                        {submitted && !balance.currency_id && (
                                            <small className="p-invalid" style={{ color: 'red' }}>
                                                {t('REQUIRED')}
                                            </small>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="field">
                                        <label htmlFor="description">{t('BALANCE.FORM.INPUT.DESCRIPTION')} *</label>
                                        <InputText
                                            id="description"
                                            value={balance.description}
                                            onChange={(e) =>
                                                setBalance((prev) => ({
                                                    ...prev,
                                                    description: e.target.value
                                                }))
                                            }
                                            placeholder={t('BALANCE.FORM.DESCRIPTION.PLACEHOLDER')}
                                            className="w-full"
                                        />
                                        {submitted && !balance.description && (
                                            <small className="p-invalid" style={{ color: 'red' }}>
                                                {t('REQUIRED')}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="flex-1 col-12 lg:col-6">
                                <div className="">
                                    <h5 className="mb-4">{t('PAYMENT.DETAILS.TITLE')}</h5>

                                    {/* Payment Method */}
                                    <div className="field">
                                        <label htmlFor="payment_method_id">{t('BALANCE.FORM.INPUT.PAYMENTMETHOD')}</label>
                                        <Dropdown
                                            id="payment_method_id"
                                            value={balance.payment_method_id}
                                            options={paymentMethods}
                                            onChange={(e) =>
                                                setBalance((prev) => ({
                                                    ...prev,
                                                    payment_method_id: e.value
                                                }))
                                            }
                                            optionLabel="method_name"
                                            optionValue="id"
                                            placeholder={t('PAYMENT.FORM.METHOD.PLACEHOLDER')}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Payment Amount */}
                                    <div className="field">
                                        <label htmlFor="payment_amount">{t('BALANCE.FORM.INPUT.PAYMENTAMOUNT')}</label>
                                        <InputText
                                            id="payment_amount"
                                            value={balance.payment_amount}
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
                                    </div>

                                    {/* Payment Currency */}
                                    <div className="field">
                                        <label htmlFor="payment_currency_id">{t('BALANCE.FORM.INPUT.PAYMENTCURRENCY')}</label>
                                        <Dropdown
                                            disabled
                                            id="payment_currency_id"
                                            value={balance.payment_currency_id}
                                            options={currencies}
                                            onChange={(e) =>
                                                setBalance((prev) => ({
                                                    ...prev,
                                                    payment_currency_id: e.value
                                                }))
                                            }
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder={t('PAYMENT.FORM.CURRENCY.PLACEHOLDER')}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Payment Notes */}
                                    <div className="field">
                                        <label htmlFor="payment_notes">{t('BALANCE.FORM.INPUT.PAYMENTNOTES')}</label>
                                        <InputText
                                            id="payment_notes"
                                            value={balance.payment_notes}
                                            onChange={(e) =>
                                                setBalance((prev) => ({
                                                    ...prev,
                                                    payment_notes: e.target.value
                                                }))
                                            }
                                            placeholder={t('PAYMENT.FORM.NOTES.PLACEHOLDER')}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Payment Date */}
                                    <div className="field">
                                        <label htmlFor="payment_date">{t('BALANCE.FORM.INPUT.PAYMENTDATE')}</label>
                                        <InputText
                                            id="payment_date"
                                            value={balance.payment_date}
                                            onChange={(e) =>
                                                setBalance((prev) => ({
                                                    ...prev,
                                                    payment_date: e.target.value
                                                }))
                                            }
                                            type="date"
                                            required
                                            autoFocus
                                            placeholder={t('PAYMENT.FORM.INPUT.PAYMENTDATE')}
                                            className={classNames({
                                                'p-invalid': submitted && !balance.payment_date
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteBalanceDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteBalanceDialogFooter} onHide={hideDeleteBalanceDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {balance && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b></b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteBalancesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteBalancesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {balance && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default ResellerBalances;
