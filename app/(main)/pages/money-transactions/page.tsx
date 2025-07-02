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
import { _fetchMoneyTransactionsList } from '@/app/redux/actions/moneyTransactionsActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

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
    const [selectedCompanies, setSelectedCompanyCode] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { transactions, loading, pagination } = useSelector((state: any) => state.moneyTransactionReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');

    useEffect(() => {
        dispatch(_fetchMoneyTransactionsList(1, searchTag));
        dispatch(_fetchBundleList());
        dispatch(_fetchCurrencies());
        dispatch(_fetchServiceList());
        dispatch(_fetchCompanies());
        dispatch(_fetchServiceCategories());
    }, [dispatch, searchTag]);

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
        setDeleteServicesDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {/* <Button label="New" icon="pi pi-plus" severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"} onClick={openNew} /> */}
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('APP.GENERAL.DELETE')}
                        icon="pi pi-trash"
                        severity="danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedCompanies || !(selectedCompanies as any).length}
                    />
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
                <span style={{ fontSize: '0.9rem' }}>{rowData.currency?.name}</span>
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

    // const actionBodyTemplate = (rowData: Bundle) => {
    //     return (
    //         <>
    //             <Button icon="pi pi-pencil" rounded severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"}  onClick={()=>editService(rowData)}/>
    //             <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteService(rowData)} />
    //         </>
    //     );
    // };

    // const header = (
    //     <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
    //         <h5 className="m-0">Manage Products</h5>
    //         <span className="block mt-2 md:mt-0 p-input-icon-left">
    //             <i className="pi pi-search" />
    //             <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
    //         </span>
    //     </div>
    // );

    // const companyDialogFooter = (
    //     <>
    //         <Button label="Cancel" icon="pi pi-times" text onClick={hideDialog} />
    //         <Button label="Save" icon="pi pi-check" text onClick={saveService} />
    //     </>
    // );
    // const deleteCompanyDialogFooter = (
    //     <>
    //         <Button label="No" icon="pi pi-times" text onClick={hideDeleteServiceDialog} />
    //         <Button label="Yes" icon="pi pi-check" text onClick={deleteService} />
    //     </>
    // );
    // const deleteCompaniesDialogFooter = (
    //     <>
    //         <Button label="No" icon="pi pi-times" text onClick={hideDeleteServicesDialog} />
    //         <Button label="Yes" icon="pi pi-check" text  />
    //     </>
    // );

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(_fetchMoneyTransactionsList(page, searchTag));
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
                        value={transactions}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedCompanyCode(e.value as any)}
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
                        style={{ direction: isRTL() ? 'rtl' : 'ltr',fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
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

                    {/* <Dialog visible={serviceDialog}  style={{ width: '700px' }} header="Bundle Details" modal className="p-fluid" footer={companyDialogFooter} onHide={hideDialog}>
                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="name">Bundle Title</label>
                                <InputText
                                    id="bundle_title"
                                    value={bundle.bundle_title}
                                    onChange={(e) =>
                                        setBundle((perv) => ({
                                            ...perv,
                                            bundle_title: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !bundle.bundle_title
                                    })}
                                />
                                {submitted && !bundle.bundle_title && <small className="p-invalid">Bundle Title is required.</small>}
                            </div>

                            <div className="field col">
                                <label htmlFor="name">Bundle Description</label>
                                <InputText
                                    id="bundle_description"
                                    value={bundle.bundle_description}
                                    onChange={(e) =>
                                        setBundle((perv) => ({
                                            ...perv,
                                            bundle_description: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !bundle.bundle_description
                                    })}
                                />
                                {submitted && !bundle.bundle_description && <small className="p-invalid">Bundle Description is required.</small>}
                            </div>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="name">Admin Buying Price</label>
                                <InputText
                                    id="admin_buying_price"
                                    value={bundle.admin_buying_price}
                                    onChange={(e) =>
                                        setBundle((perv) => ({
                                            ...perv,
                                            admin_buying_price: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !bundle.admin_buying_price
                                    })}
                                />
                                {submitted && !bundle.admin_buying_price && <small className="p-invalid">Admin Buying Price is required.</small>}
                            </div>

                            <div className="field col">
                                <label htmlFor="name">Buying Price</label>
                                <InputText
                                    id="buying_price"
                                    value={bundle.buying_price}
                                    onChange={(e) =>
                                        setBundle((perv) => ({
                                            ...perv,
                                            buying_price: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !bundle.buying_price
                                    })}
                                />
                                {submitted && !bundle.buying_price && <small className="p-invalid">Buying Price is required.</small>}
                            </div>
                        </div>


                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="name">Selling Price</label>
                                <InputText
                                    id="buying_price"
                                    value={bundle.selling_price}
                                    onChange={(e) =>
                                        setBundle((perv) => ({
                                            ...perv,
                                            selling_price: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !bundle.selling_price
                                    })}
                                />
                                {submitted && !bundle.selling_price && <small className="p-invalid">Selling Price is required.</small>}
                            </div>
                            <div className="field col">
                                <label htmlFor="country_id">Validity Type</label>
                                <Dropdown
                                    id="validity_type"
                                    value={bundle.validity_type}
                                    options={[
                                        { label: "Unlimited", value: "unlimited" },
                                        { label: "Daily", value: "daily" },
                                        { label: "Nightly", value: "nightly" },
                                        { label: "Weekly", value: "weekly" },
                                        { label: "Monthly", value: "monthly" },
                                        { label: "Yearly", value: "yearly" }
                                    ]}
                                    onChange={(e) =>
                                        setBundle((prev) => ({
                                            ...prev,
                                            validity_type: e.value,
                                        }))
                                    }
                                    placeholder="Choose a Type"
                                    className="w-full"
                                />

                            </div>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="name">Service</label>
                                <Dropdown
                                    id="service_id"
                                    value={bundle.service_id}
                                    options={services}
                                    onChange={(e) =>
                                        setBundle((prev) => ({
                                            ...prev,
                                            service_id: e.value,
                                        }))
                                    }
                                    optionLabel='company.company_name'
                                    optionValue='id'
                                    placeholder="Choose a Type"
                                    className="w-full"
                                    itemTemplate={(option) => (
                                        <div style={{display:'flex', gap:"5px"}}>
                                            <div>{option.service_category?.category_name}</div>
                                            <div>{option.company?.company_name}</div>
                                        </div>
                                    )}
                                />
                            </div>
                            <div className="field col">
                                <label htmlFor="country_id">Currency</label>
                                <Dropdown
                                    id="currency_id"
                                    value={bundle.currency_id}
                                    options={currencies}
                                    onChange={(e) =>
                                        setBundle((prev) => ({
                                            ...prev,
                                            currency_id: e.value,
                                        }))
                                    }
                                    optionLabel='name'
                                    optionValue='id'
                                    placeholder="Choose a Type"
                                    className="w-full"
                                />

                            </div>
                        </div>

                    </Dialog>

                    <Dialog visible={deleteServiceDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompanyDialogFooter} onHide={hideDeleteServiceDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {bundle && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{bundle.bundle_title}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteServicesDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteServicesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {bundle && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog> */}
                </div>
            </div>
        </div>
    );
};

export default withAuth(TransactionPage);
