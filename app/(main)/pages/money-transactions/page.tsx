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
import { _fetchCompanies, _deleteCompany, _addCompany, _editCompany } from '@/app/redux/actions/companyActions';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { _addService, _deleteService, _editService, _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { _fetchServiceCategories } from '@/app/redux/actions/serviceCategoryActions';
import { _addBundle, _deleteBundle, _editBundle, _fetchBundleList } from '@/app/redux/actions/bundleActions';
import { Paginator } from 'primereact/paginator';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { currenciesReducer } from '../../../redux/reducers/currenciesReducer';
import { AppDispatch } from '@/app/redux/store';
import { Bundle, MoneyTransaction } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _deleteSelectedTransactions, _fetchMoneyTransactionsList } from '@/app/redux/actions/moneyTransactionsActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { generateTransactionExcelFile } from '../../utilities/generateExcel';

const TransactionPage = () => {
    let emptyBundle: Bundle = {
        id: 0,
        bundle_code: '',
        service_id: 0,
        bundle_title: '',
        bundle_description: '',
        bundle_type: '',
        validity_type: '',
        admin_buying_price: '',
        buying_price: '',
        selling_price: '',
        amount: '',
        bundle_image_url: '',
        currency_id: 0,
        expired_date: '',
        deleted_at: '',
        created_at: '',
        updated_at: '',
        service: null,
        currency: null
    };

    const [serviceDialog, setServiceDialog] = useState(false);
    const [deleteServiceDialog, setDeleteServiceDialog] = useState(false);
    const [deleteServicesDialog, setDeleteServicesDialog] = useState(false);
    const [bundle, setBundle] = useState<Bundle>(emptyBundle);
    const [selectedTransactions, setSelectedTransactions] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { transactions, loading, pagination } = useSelector((state: any) => state.moneyTransactionReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');

    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
    const [filters, setFilters] = useState({
        filter_transactiontype: null as string | null,
        filter_transactioncategory: null as string | null,
        filter_transactionpurpose: null as string | null,
        filter_startdate: null as string | null,
        filter_enddate: null as string | null
    });
    const [activeFilters, setActiveFilters] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(_fetchMoneyTransactionsList(1, searchTag, activeFilters));
        dispatch(_fetchBundleList());
        dispatch(_fetchCurrencies());
        dispatch(_fetchServiceList());
        dispatch(_fetchCompanies());
        dispatch(_fetchServiceCategories());
    }, [dispatch, searchTag, activeFilters]);

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

    useEffect(() => {
        //console.log(transactions)
    }, [dispatch, transactions]);

    const openNew = () => {
        setBundle(emptyBundle);
        setSubmitted(false);
        setServiceDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setServiceDialog(false);
    };

    const hideDeleteServiceDialog = () => {
        setDeleteServiceDialog(false);
    };

    const hideDeleteServicesDialog = () => {
        setDeleteServicesDialog(false);
    };

    const saveService = () => {
        setSubmitted(true);
        if (bundle.id && bundle.id !== 0) {
            dispatch(_editBundle(bundle.id, bundle, toast, t));
        } else {
            dispatch(_addBundle(bundle, toast, t));
        }

        setServiceDialog(false);
        setBundle(emptyBundle);
    };

    const editService = (bundle: Bundle) => {
        setBundle({ ...bundle });

        setServiceDialog(true);
    };

    const confirmDeleteService = (bundle: Bundle) => {
        setBundle(bundle);
        setDeleteServiceDialog(true);
    };

    const deleteService = () => {
        if (!bundle?.id) {
            console.error('Service ID is undefined.');
            return;
        }
        dispatch(_deleteBundle(bundle?.id, toast, t));
        setDeleteServiceDialog(false);
    };

    const confirmDeleteSelected = () => {
        if (!selectedTransactions || (selectedTransactions as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('VALIDATION_WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteServicesDialog(true);
    };

    const deleteSelectedTransactions = async () => {
        if (!selectedTransactions || (selectedTransactions as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        const selectedIds = (selectedTransactions as MoneyTransaction[]).map((transaction) => transaction.id);

        await _deleteSelectedTransactions(selectedIds, toast, t);
        dispatch(_fetchMoneyTransactionsList());

        setSelectedTransactions(null);
        setDeleteServicesDialog(false);
    };

    const rightToolbarTemplate = () => {
        const hasSelectedTransactions = selectedTransactions && (selectedTransactions as any).length > 0;
        return (
            <React.Fragment>
                <div className="my-2 flex items-center gap-2">
                    <div className="flex-1 min-w-[100px]" ref={filterRef} style={{ position: 'relative' }}>
                        <Button className="p-button-info" label={t('FILTER')} icon="pi pi-filter" onClick={() => setFilterDialogVisible(!filterDialogVisible)} />
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
                                                {t('TRANSACTION.TABLE.COLUMN.TYPE')}
                                            </label>
                                            <Dropdown
                                                id="transactionTypeFilter"
                                                options={[
                                                    { label: t('CREDIT'), value: 'credit' },
                                                    { label: t('DEBIT'), value: 'debit' }
                                                ]}
                                                value={filters.filter_transactiontype}
                                                onChange={(e) => setFilters({ ...filters, filter_transactiontype: e.value })}
                                                placeholder={t('SELECT_TYPE')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Transaction Category Filter */}
                                        <div className="col-12">
                                            <label htmlFor="transactionCategoryFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('TRANSACTION.TABLE.COLUMN.CATEGORY')}
                                            </label>
                                            <Dropdown
                                                id="transactionCategoryFilter"
                                                options={[
                                                    { label: t('ADMIN_TO_RESELLER'), value: 'admin-reseller' },
                                                    { label: t('RESELLER_TO_SUBRESELLER'), value: 'reseller-subreseller' }
                                                ]}
                                                value={filters.filter_transactioncategory}
                                                onChange={(e) => setFilters({ ...filters, filter_transactioncategory: e.value })}
                                                placeholder={t('SELECT_CATEGORY')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Transaction Purpose Filter */}
                                        <div className="col-12">
                                            <label htmlFor="transactionPurposeFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('TRANSACTION.TABLE.COLUMN.PURPOSE')}
                                            </label>
                                            <Dropdown
                                                id="transactionPurposeFilter"
                                                options={[
                                                    { label: t('FILTER.ORDER'), value: 'order' },
                                                    { label: t('MONEY_TRANSFER'), value: 'money' }
                                                ]}
                                                value={filters.filter_transactionpurpose}
                                                onChange={(e) => setFilters({ ...filters, filter_transactionpurpose: e.value })}
                                                placeholder={t('SELECT_PURPOSE')}
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
                                                        filter_transactiontype: null,
                                                        filter_transactioncategory: null,
                                                        filter_transactionpurpose: null,
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
                    {/* <Button
                    style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                    label={t('APP.GENERAL.DELETE')}
                    icon="pi pi-trash"
                    severity="danger"
                    onClick={confirmDeleteSelected}
                    disabled={!selectedTransactions || !(selectedTransactions as any).length}
                /> */}
                    <Button className="flex-1 min-w-[100px]" label={t('EXPORT.EXPORT')} icon={`pi pi-file-excel`} severity="success" onClick={exportToExcel} />
                        {/* <Button
                            style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                            label={t('APP.GENERAL.DELETE')}
                            icon="pi pi-trash"
                            severity="danger"
                            onClick={confirmDeleteSelected}
                            disabled={!selectedTransactions || !(selectedTransactions as any).length}
                        /> */}

                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <span className="block mt-2 md:mt-0 p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder={t('ECOMMERCE.COMMON.SEARCH')} />
                </span>
            </React.Fragment>
        );
    };

    const resellerBodyTemplate = (rowData: MoneyTransaction) => {
        return (
            <>
                <span className="p-column-title">Reseller</span>
                <span style={{ fontSize: '0.9rem' }}>{rowData.reseller?.reseller_name}</span>
            </>
        );
    };

    const amountBodyTemplate = (rowData: MoneyTransaction) => {
        return (
            <>
                <span className="p-column-title">Amount</span>
                <span style={{ fontSize: '0.9rem' }}>{parseInt(rowData.amount).toFixed(2)}</span>
            </>
        );
    };

    const currencyBodyTemplate = (rowData: MoneyTransaction) => {
        return (
            <>
                <span className="p-column-title">Currency</span>
                <span style={{ fontSize: '0.9rem' }}>{rowData?.reseller?.user?.currency?.code}</span>
            </>
        );
    };

    const remainingBalanceBodyTemplate = (rowData: MoneyTransaction) => {
        return (
            <>
                <span className="p-column-title">Remaining Balance</span>
                <span style={{ fontSize: '0.9rem' }}>{rowData.remaining_balance}</span>
            </>
        );
    };

    const bundleTitleBodyTemplate = (rowData: MoneyTransaction) => {
        return (
            <>
                <span className="p-column-title">Bundle Title</span>
                <span style={{ fontSize: '0.9rem' }}>{'X'}</span>
            </>
        );
    };

    const transactionDateBodyTemplate = (rowData: MoneyTransaction) => {
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

    const statusBodyTemplate = (rowData: MoneyTransaction) => {
        // Define background color based on transaction type
        const getBackgroundColor = (type: string | null) => {
            switch (type) {
                case 'credit':
                    return 'bg-green-500'; // Tailwind CSS class for green background
                case 'debit':
                    return 'bg-red-500'; // Tailwind CSS class for red background
                default:
                    return 'bg-gray-500'; // Default gray background for other or null types
            }
        };

        // Define message based on transaction type
        const getTransactionMessage = (type: string | null) => {
            switch (type) {
                case 'credit':
                    return 'Amount Credited To Reseller';
                case 'debit':
                    return 'Amount Debited From Reseller';
                default:
                    return 'Unknown Transaction';
            }
        };

        return (
            <>
                <span className="p-column-title">Status (Type)</span>
                <span style={{ fontSize: '0.7rem', borderRadius: '5px' }} className={`inline-block p-1 text-white ${getBackgroundColor(rowData.status)}`}>
                    {getTransactionMessage(rowData.status)}
                </span>
            </>
        );
    };

    const initiatorTypeBodyTemplate = (rowData: MoneyTransaction) => {
        // Function to capitalize the first letter
        const capitalizeFirstLetter = (text: string | null) => {
            if (!text) return ''; // Handle null or empty string
            if (text == 'App\\Models\\User') return 'Reseller';
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        };

        return (
            <>
                <span className="p-column-title">Initiator Type</span>
                <span style={{ fontSize: '0.9rem' }}>{capitalizeFirstLetter(rowData.initiator_type)}</span>
            </>
        );
    };

    const descriptionBodyTemplate = (rowData: MoneyTransaction) => {
        return (
            <>
                <span className="p-column-title">Description</span>
                <span style={{ fontSize: '0.9rem' }}>{rowData.transaction_reason}</span>
            </>
        );
    };

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(_fetchMoneyTransactionsList(page, searchTag));
    };

    const handleSubmitFilter = (filters: any) => {
        const cleanedFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== null && value !== ''));
        setActiveFilters(cleanedFilters);
    };

    const exportToExcel = async () => {
        await generateTransactionExcelFile({
            transactions,
            t,
            toast,
            all: true
        });
    };

    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteServicesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedTransactions} />
        </>
    );

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={transactions}
                        selection={selectedTransactions}
                        onSelectionChange={(e) => setSelectedTransactions(e.value as any)}
                        dataKey="id"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
                        // header={header}
                        responsiveLayout="scroll"
                        paginator={false} // Disable PrimeReact's built-in paginator
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Reseller" header={t('TRANSACTION.TABLE.COLUMN.RESELLERNAME')} body={resellerBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Amount" header={t('TRANSACTION.TABLE.COLUMN.AMOUNT')} body={amountBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Currency" header={t('TRANSACTION.TABLE.COLUMN.CURRENCY')} body={currencyBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Remaining Balance"
                            header={t('TRANSACTION.TABLE.COLUMN.REMAININGBALANCE')}
                            body={remainingBalanceBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Bundle Title"
                            header={t('TRANSACTION.TABLE.COLUMN.BUNDLETITLE')}
                            body={bundleTitleBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Transaction Date"
                            header={t('TRANSACTION.TABLE.COLUMN.TRANSACTIONEDDATE')}
                            body={transactionDateBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Status" header={t('TRANSACTION.TABLE.COLUMN.STATUS')} body={statusBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Initiator"
                            header={t('TRANSACTION.TABLE.COLUMN.INITIATORTYPE')}
                            body={initiatorTypeBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Description"
                            header={t('TRANSACTION.TABLE.COLUMN.DESCRIPTION')}
                            body={descriptionBodyTemplate}
                        ></Column>
                        {/* <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column> */}
                    </DataTable>
                    <Paginator
                        first={(pagination?.page - 1) * pagination?.items_per_page}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                    />
                    <Dialog visible={deleteServicesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteServicesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {<span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(TransactionPage);
