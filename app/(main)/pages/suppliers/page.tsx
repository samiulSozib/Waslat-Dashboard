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
import { Supplier } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addSupplier, _deleteSupplier, _editSupplier, _fetchSuppliers } from '@/app/redux/actions/supplierActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const SupplierPage = () => {
    let emptySupplier: Supplier = {
        id: 0,
        supplier_name: '',
        contact_details: '',
        address: '',
        status: 1,
        created_at: '',
        updated_at: ''
    };

    const [supplierDialog, setSupplierDialog] = useState(false);
    const [deleteSupplierDialog, setDeleteSupplierDialog] = useState(false);
    const [deleteSuppliersDialog, setDeleteSuppliersDialog] = useState(false);
    const [supplier, setSupplier] = useState<Supplier>(emptySupplier);
    const [selectedCompanies, setSelectedCompanies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { suppliers, loading } = useSelector((state: any) => state.suppliersReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');

    useEffect(() => {
        dispatch(_fetchSuppliers(searchTag));
    }, [dispatch, searchTag]);

    const openNew = () => {
        setSupplier(emptySupplier);
        setSubmitted(false);
        setSupplierDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSupplierDialog(false);
    };

    const hideDeleteSupplierDialog = () => {
        setDeleteSupplierDialog(false);
    };

    const hideDeleteSuppliersDialog = () => {
        setDeleteSuppliersDialog(false);
    };

    const saveSupplier = () => {
        setSubmitted(true);
        if (!supplier.supplier_name || !supplier.contact_details || !supplier.address) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (supplier.id && supplier.id !== 0) {
            dispatch(_editSupplier(supplier.id, supplier, toast, t));
        } else {
            dispatch(_addSupplier(supplier, toast, t));
        }

        setSupplierDialog(false);
        setSupplier(emptySupplier);
        setSubmitted(false);
    };

    const editSupplier = (supplier: Supplier) => {
        setSupplier({ ...supplier });

        setSupplierDialog(true);
    };

    const confirmDeleteSupplier = (supplier: Supplier) => {
        setSupplier(supplier);
        setDeleteSupplierDialog(true);
    };

    const deleteSupplier = () => {
        if (!supplier?.id) {
            console.error('Supplier ID is undefined.');
            return;
        }
        dispatch(_deleteSupplier(supplier?.id, toast, t));
        setDeleteSupplierDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteSuppliersDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2  ">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('SUPPLIER.TABLE.CREATESUPPLIER')}
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

    const nameBodyTemplate = (rowData: Supplier) => {
        return (
            <>
                <span className="p-column-title">Supplier Name</span>
                {rowData.supplier_name}
            </>
        );
    };

    const contactDetailsBodyTemplate = (rowData: Supplier) => {
        return (
            <>
                <span className="p-column-title">Contact Details</span>
                {rowData.contact_details}
            </>
        );
    };

    const addressBodyTemplate = (rowData: Supplier) => {
        return (
            <>
                <span className="p-column-title">Address</span>
                {rowData.address}
            </>
        );
    };

    const statusBodyTemplate = (rowData: Supplier) => {
        // Define the text and background color based on the status value
        const getStatusText = (status: number) => {
            return status === 1 ? 'Active' : 'Deactivated';
        };

        const getStatusClasses = (status: number) => {
            return status === 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
        };

        return (
            <>
                <span className="p-column-title">Status</span>
                <span style={{ borderRadius: '5px' }} className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getStatusClasses(rowData.status)}`}>
                    {getStatusText(rowData.status)}
                </span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Supplier) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editSupplier(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteSupplier(rowData)} />
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

    const supplierDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveSupplier} />
        </>
    );
    const deleteSupplierDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteSupplierDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSupplier} />
        </>
    );
    const deleteSuppliersDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteSuppliersDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
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
                        value={suppliers}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedCompanies(e.value as any)}
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
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="name" header={t('SUPPLIER.TABLE.COLUMN.SUPPLIERNAME')} sortable body={nameBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Contact Details"
                            header={t('SUPPLIER.TABLE.COLUMN.CONTACTDETAILS')}
                            body={contactDetailsBodyTemplate}
                            sortable
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Address" header={t('SUPPLIER.TABLE.COLUMN.ADDRESS')} body={addressBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('SUPPLIER.TABLE.COLUMN.STATUS')} body={statusBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={supplierDialog} style={{ width: '700px', padding: '5px' }} header={t('SUPPLIER.DETAILS')} modal className="p-fluid" footer={supplierDialogFooter} onHide={hideDialog}>
                        <div className="card" style={{ padding: '40px' }}>
                            <div className="field">
                                <label htmlFor="name" style={{ fontWeight: 'bold' }}>
                                    {t('SUPPLIER.FORM.INPUT.SUPPLIERNAME')}
                                </label>
                                <InputText
                                    id="supplier_name"
                                    value={supplier?.supplier_name}
                                    onChange={(e) =>
                                        setSupplier((prev) => ({
                                            ...prev,
                                            supplier_name: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('SUPPLIER.FORM.PLACEHOLDER.SUPPLIERNAME')}
                                    className={classNames({
                                        'p-invalid': submitted && !supplier.supplier_name
                                    })}
                                />
                                {submitted && !supplier.supplier_name && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="telegram_chat_id" style={{ fontWeight: 'bold' }}>
                                    {t('SUPPLIER.FORM.INPUT.CONTACTDETAILS')}
                                </label>
                                <InputText
                                    id="contact_details"
                                    value={supplier.contact_details || ''}
                                    onChange={(e) =>
                                        setSupplier((prev) => ({
                                            ...prev,
                                            contact_details: e.target.value
                                        }))
                                    }
                                    placeholder={t('SUPPLIER.FORM.PLACEHOLDER.CONTACTDETAILS')}
                                    className="w-full p-2 border rounded"
                                />
                                {submitted && !supplier.contact_details && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="address" style={{ fontWeight: 'bold' }}>
                                    {t('SUPPLIER.FORM.INPUT.ADDRESS')}
                                </label>
                                <InputText
                                    id="address"
                                    value={supplier.address || ''}
                                    onChange={(e) =>
                                        setSupplier((prev) => ({
                                            ...prev,
                                            address: e.target.value
                                        }))
                                    }
                                    placeholder={t('SUPPLIER.FORM.PLACEHOLDER.ADDRESS')}
                                    className="w-full p-2 border rounded"
                                />
                                {submitted && !supplier.address && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="status" style={{ fontWeight: 'bold' }}>
                                    {t('SUPPLIER.FORM.INPUT.STATUS')}
                                </label>
                                <Dropdown
                                    id="status"
                                    value={supplier.status}
                                    options={[
                                        { label: 'Active', value: 1 },
                                        { label: 'Inactive', value: 0 }
                                    ]}
                                    onChange={(e) =>
                                        setSupplier((prev) => ({
                                            ...prev,
                                            status: e.value
                                        }))
                                    }
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder={t('SUPPLIER.FORM.PLACEHOLDER.STATUS')}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteSupplierDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteSupplierDialogFooter} onHide={hideDeleteSupplierDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {supplier && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{supplier.supplier_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteSuppliersDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteSuppliersDialogFooter} onHide={hideDeleteSuppliersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {supplier && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(SupplierPage);
