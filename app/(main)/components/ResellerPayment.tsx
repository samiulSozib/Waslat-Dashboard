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
import { Payment, Currency } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addPayment, _deletePayment, _editPayment, _fetchPayments } from '@/app/redux/actions/paymentActions';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { InputTextarea } from 'primereact/inputtextarea';
import { _fetchPaymentMethods } from '@/app/redux/actions/paymentMethodActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { Calendar } from 'primereact/calendar';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { Paginator } from 'primereact/paginator';
import { isRTL } from '../utilities/rtlUtil';
import { customCellStyle } from '../utilities/customRow';
import { fetchResellerPayments } from '@/app/redux/actions/resellerInformationActions';
import { resellerInformationReducer } from '../../redux/reducers/resellerInformationReducer';
import { generateBalanceExcelFile, generatePaymentExcelFile } from '../utilities/generateExcel';

interface ResellerBalancesProps {
    resellerId: number;
}

const ResellerPayments = ({ resellerId }: ResellerBalancesProps) => {
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
        currency: null
    };

    const [paymentDialog, setPaymentDialog] = useState(false);
    const [deletePaymentDialog, setDeletePaymentDialog] = useState(false);
    const [deletePaymentsDialog, setDeletePaymentsDialog] = useState(false);
    const [payment, setPayment] = useState<Payment>(emptyPayment);
    const [selectedCompanies, setSelectedPayment] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { payments, loading, payments_pagination } = useSelector((state: any) => state.resellerInformationReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const { paymentMethods } = useSelector((state: any) => state.paymentMethodsReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');
    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
    const [filters, setFilters] = useState({
        filter_status: null as string | null,
        filter_payment_method: null as number | null,
        filter_startdate: null as string | null,
        filter_enddate: null as string | null
    });
    const [activeFilters, setActiveFilters] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(fetchResellerPayments(resellerId, 1, searchTag, activeFilters));
        dispatch(_fetchResellers());
        dispatch(_fetchPaymentMethods());
        dispatch(_fetchCurrencies());
    }, [dispatch, searchTag, activeFilters, resellerId]);

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

    const openNew = () => {
        setPayment(emptyPayment);
        setSubmitted(false);
        setPaymentDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPaymentDialog(false);
    };

    const hideDeletePaymentDialog = () => {
        setDeletePaymentDialog(false);
    };

    const hideDeletePaymentsDialog = () => {
        setDeletePaymentsDialog(false);
    };

    const savePayment = () => {
        setSubmitted(true);
        if (!payment.reseller || !payment.amount || !payment.notes || !payment.payment_method || !payment.currency || !payment.payment_date) {
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
        setPayment({ ...payment });

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

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center gap-2">
                    {' '}
                    {/* Added gap-2 here */}
                    <div className="flex-1 min-w-[100px]" ref={filterRef} style={{ position: 'relative' }}>
                        <Button className="p-button-info" label={t('FILTER')} style={{ gap: '8px' }} icon="pi pi-filter" onClick={() => setFilterDialogVisible(!filterDialogVisible)} />
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
                                        {/* Status Filter */}
                                        <div className="col-12">
                                            <label htmlFor="statusFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('PAYMENT.TABLE.COLUMN.STATUS')}
                                            </label>
                                            <Dropdown
                                                id="statusFilter"
                                                options={[
                                                    { label: t('COMPLETED'), value: 'completed' },
                                                    { label: t('PENDING'), value: 'pending' },
                                                    { label: t('FAILED'), value: 'failed' }
                                                ]}
                                                value={filters.filter_status}
                                                onChange={(e) => setFilters({ ...filters, filter_status: e.value })}
                                                placeholder={t('SELECT_STATUS')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Payment Method Filter */}
                                        <div className="col-12">
                                            <label htmlFor="paymentMethodFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')}
                                            </label>
                                            <Dropdown
                                                id="paymentMethodFilter"
                                                options={paymentMethods}
                                                value={filters.filter_payment_method}
                                                onChange={(e) => setFilters({ ...filters, filter_payment_method: e.value })}
                                                optionLabel="method_name"
                                                optionValue="id"
                                                placeholder={t('SELECT_PAYMENT_METHOD')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Date Range Filters */}
                                        <div className="col-12">
                                            <label htmlFor="startDateFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('START_DATE')}
                                            </label>
                                            <InputText type="date" id="startDateFilter" value={filters.filter_startdate || ''} onChange={(e) => setFilters({ ...filters, filter_startdate: e.target.value })} style={{ width: '100%' }} />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="endDateFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('END_DATE')}
                                            </label>
                                            <InputText type="date" id="endDateFilter" value={filters.filter_enddate || ''} onChange={(e) => setFilters({ ...filters, filter_enddate: e.target.value })} style={{ width: '100%' }} />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="col-12 mt-3 flex justify-content-between gap-2">
                                            <Button
                                                label={t('RESET')}
                                                icon="pi pi-times"
                                                className="p-button-secondary p-button-sm"
                                                onClick={() => {
                                                    setFilters({
                                                        filter_status: null,
                                                        filter_payment_method: null,
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
                    {/* <Button label="Add Payment" icon="pi pi-plus" severity="success" onClick={openNew} /> */}
                    <Button className="flex-1 min-w-[100px]" label={t('EXPORT.EXPORT')} style={{ gap: '8px' }} icon={`pi pi-file-excel`} severity="success" onClick={exportToExcel} />
                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex items-center">
                <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setSearchTag(e.currentTarget.value)} placeholder={t('ECOMMERCE.COMMON.SEARCH')} className="w-full md:w-auto" />
                </span>
            </div>
        );
    };

    const resellerNameBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Reseller</span>
                {rowData.reseller?.reseller_name}
            </>
        );
    };

    const paymentMethodBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Payment Method</span>
                {rowData.payment_method?.method_name}
            </>
        );
    };

    const amountBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Amount</span>
                {rowData.amount}
            </>
        );
    };

    const currencyBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Currency</span>
                {rowData.currency?.code}
            </>
        );
    };

    const remainingPaymentBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Remaining Payment</span>
                {rowData.remaining_payment_amount}
            </>
        );
    };

    const statusBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                {rowData.status}
            </>
        );
    };

    const noteBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Note</span>
                {rowData.notes}
            </>
        );
    };

    const paymentDateBodyTemplate = (rowData: Payment) => {
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

        const { formattedDate, formattedTime } = formatDate(rowData.payment_date);

        return (
            <>
                <span className="p-column-title">Created At</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editPayment(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeletePayment(rowData)} />
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

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(fetchResellerPayments(resellerId, page, searchTag));
    };

    // Add these helper functions
    const handleSubmitFilter = (filters: any) => {
        const cleanedFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== null && value !== ''));
        setActiveFilters(cleanedFilters);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await new Promise((res) => setTimeout(res, 1000));
        dispatch(fetchResellerPayments(resellerId, 1, searchTag, activeFilters));
        setRefreshing(false);
    };

    const exportToExcel = async () => {
        await generatePaymentExcelFile({
            payments,
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
                        value={payments}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedPayment(e.value as any)}
                        dataKey="id"
                        rows={payments_pagination?.items_per_page}
                        totalRecords={payments_pagination?.total}
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
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.RESELLER')} body={resellerNameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')} body={paymentMethodBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.AMOUNT')} body={amountBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.CURRENCY')} body={currencyBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.REMAININGPAYMENTAMOUNT')} body={remainingPaymentBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.STATUS')} body={statusBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.NOTES')} body={noteBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.PAYMENTDATE')} body={paymentDateBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Paginator
                        first={(payments_pagination?.page - 1) * payments_pagination?.items_per_page}
                        rows={payments_pagination?.items_per_page}
                        totalRecords={payments_pagination?.total}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL() ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        firstPageLinkIcon={
                            isRTL()
                                ? "pi pi-angle-double-right"
                                : "pi pi-angle-double-left"
                        }
                        lastPageLinkIcon={
                            isRTL()
                                ? "pi pi-angle-double-left"
                                : "pi pi-angle-double-right"
                        }
                    />

                    <Dialog visible={paymentDialog} style={{ width: '900px', padding: '5px' }} header={t('PAYMENT.DETAILS.TITLE')} modal className="p-fluid" footer={paymentDialogFooter} onHide={hideDialog}>
                        <div className="card flex  flex-wrap p-fluid mt-3 gap-4">
                            <div className=" flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="reseller" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.RESELLER')}
                                    </label>
                                    <Dropdown
                                        id="reseller"
                                        value={payment.reseller}
                                        options={resellers}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                reseller: e.value
                                            }))
                                        }
                                        optionLabel="reseller_name"
                                        //optionValue='id'
                                        placeholder={t('PAYMENT.FORM.INPUT.RESELLER')}
                                        className="w-full"
                                    />
                                    {submitted && !payment.reseller && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="email" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.AMOUNT')}
                                    </label>
                                    <InputText
                                        id="amount"
                                        value={payment.amount}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                amount: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('PAYMENT.FORM.INPUT.AMOUNT')}
                                        className={classNames({
                                            'p-invalid': submitted && !payment.amount
                                        })}
                                    />
                                    {submitted && !payment.amount && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field">
                                    <label htmlFor="notes" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.NOTES')}
                                    </label>
                                    <InputTextarea
                                        value={payment.notes}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                notes: e.target.value
                                            }))
                                        }
                                        rows={3}
                                        cols={30}
                                        placeholder={t('PAYMENT.FORM.INPUT.NOTES')}
                                    />
                                    {submitted && !payment.notes && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className=" flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="payment_method" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.PAYMENTMETHOD')}
                                    </label>
                                    <Dropdown
                                        id="payment_method"
                                        value={payment.payment_method}
                                        options={paymentMethods}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                payment_method: e.value
                                            }))
                                        }
                                        optionLabel="method_name"
                                        // optionValue='id'
                                        placeholder={t('PAYMENT.FORM.INPUT.PAYMENTMETHOD')}
                                        className="w-full"
                                    />
                                    {submitted && !payment.payment_method && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="currency" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.CURRENCY')}
                                    </label>
                                    <Dropdown
                                        disabled
                                        id="currency"
                                        value={payment.currency}
                                        options={currencies}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                currency: e.value
                                            }))
                                        }
                                        optionLabel="name"
                                        // optionValue='id'
                                        placeholder={t('PAYMENT.FORM.INPUT.CURRENCY')}
                                        className="w-full"
                                    />
                                    {submitted && !payment.currency && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field">
                                    <label htmlFor="payment_date" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.PAYMENTDATE')}
                                    </label>
                                    <InputText
                                        id="payment_date"
                                        value={payment.payment_date}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                payment_date: e.target.value
                                            }))
                                        }
                                        type="date"
                                        required
                                        autoFocus
                                        placeholder={t('PAYMENT.FORM.INPUT.PAYMENTDATE')}
                                        className={classNames({
                                            'p-invalid': submitted && !payment.payment_date
                                        })}
                                    />

                                    {submitted && !payment.payment_date && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Dialog>

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
                </div>
            </div>
        </div>
    );
};

export default ResellerPayments;
