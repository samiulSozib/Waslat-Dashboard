/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
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
import {PaymentMethod } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addPaymentMethod, _deletePaymentMethod, _editPaymentMethod, _fetchPaymentMethods } from '@/app/redux/actions/paymentMethodActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { InputTextarea } from 'primereact/inputtextarea';
import { customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const PaymentMethodPage = () => {



    let emptyPaymentMethod:PaymentMethod={
        id: 0,
        method_name: '',
        account_details: '',
        account_image: '',
        status: 1,
        created_at: '',
        updated_at: '',
    }

    const [methodDialog, setMethodDialog] = useState(false);
    const [deleteMethodDialog, setDeleteMethodDialog] = useState(false);
    const [deleteMethodsDialog, setDeleteMethodsDialog] = useState(false);
    const [paymentMethod,setPaymentMethod]=useState<PaymentMethod>(emptyPaymentMethod)
    const [selectedCompanies, setSelectedCompanies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch=useDispatch<AppDispatch>()
    const {paymentMethods,loading}=useSelector((state:any)=>state.paymentMethodsReducer)
    const {t}=useTranslation()

    useEffect(()=>{
        dispatch(_fetchPaymentMethods())
    },[dispatch])



    const openNew = () => {
        setPaymentMethod(emptyPaymentMethod)
        setSubmitted(false);
        setMethodDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setMethodDialog(false);
    };

    const hideDeleteMethodDialog = () => {
        setDeleteMethodDialog(false);
    };

    const hideDeleteMethodsDialog = () => {
        setDeleteMethodsDialog(false);
    };



    const saveMethod = () => {
        setSubmitted(true);
        if (!paymentMethod.method_name || !paymentMethod.status || !paymentMethod.account_details) {

            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000,
            });
        return;
    }
        if (paymentMethod.id && paymentMethod.id !== 0) {
            dispatch(_editPaymentMethod(paymentMethod.id,paymentMethod,toast,t));

        } else {
            dispatch(_addPaymentMethod(paymentMethod,toast,t));
        }

        setMethodDialog(false);
        setPaymentMethod(emptyPaymentMethod);
        setSubmitted(false)
    };

    const editMethod = (paymentMethod: PaymentMethod) => {
        setPaymentMethod({ ...paymentMethod});

        setMethodDialog(true);
    };

    const confirmDeleteMethod = (paymentMethod: PaymentMethod) => {
        setPaymentMethod(paymentMethod);
        setDeleteMethodDialog(true);
    };

    const deleteMethod = () => {
        if (!paymentMethod?.id) {
            console.error("Method ID is undefined.");
            return;
        }
        dispatch(_deletePaymentMethod(paymentMethod?.id,toast,t))
        setDeleteMethodDialog(false);

    };


    const confirmDeleteSelected = () => {
        setDeleteMethodsDialog(true);
    };



    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button style={{ gap: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? '0.5rem' : '' }} label={t('PAYMENTMETHOD.TABLE.CREATEPAYMENTMETHOD')} icon="pi pi-plus" severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"} onClick={openNew} />
                    {/* <Button style={{ gap: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? '0.5rem' : '' }} label={t("APP.GENERAL.DELETE")} icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedCompanies || !(selectedCompanies as any).length} /> */}
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


    const nameBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Method Name</span>
                {rowData.method_name}
            </>
        );
    };

    const accountDetailsBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Account Details</span>
                {rowData.account_details}
            </>
        );
    };

    const imageBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img src={`${rowData.account_image}`} alt={rowData.method_name.toString()} className="shadow-2" width="60" />
            </>
        );
    };


    const statusBodyTemplate = (rowData: PaymentMethod) => {
        // Define the text and background color based on the status value
        const getStatusText = (status: number) => {
            return status === 1 ? 'Active' : 'Deactivated';
        };

        const getStatusClasses = (status: number) => {
            return status === 1
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white';
        };

        return (
            <>
                <span className="p-column-title">Status</span>
                <span style={{borderRadius:"5px"}}
                    className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getStatusClasses(
                        rowData.status
                    )}`}
                >
                    {getStatusText(rowData.status)}
                </span>
            </>
        );
    };







    const actionBodyTemplate = (rowData: PaymentMethod) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"}  onClick={()=>editMethod(rowData)}/>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteMethod(rowData)} />
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

    const methodDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''} onClick={saveMethod} />
        </>
    );
    const deleteMethodDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteMethodDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''} onClick={deleteMethod} />
        </>
    );
    const deleteMethodsDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteMethodsDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''}  />
        </>
    );




    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4"  right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={paymentMethods}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedCompanies(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className="datatable-responsive"
                       paginatorTemplate={
                            isRTL()
                            ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink'
                            : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={
                            isRTL()
                            ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`  // localized RTL string
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
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="name" header={t('PAYMENTMETHOD.TABLE.COLUMN.METHODNAME')} sortable body={nameBodyTemplate}></Column>
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="Account Details" header={t('PAYMENTMETHOD.TABLE.COLUMN.ACCOUNTDETAILS')} body={accountDetailsBodyTemplate} sortable></Column>
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} header={t('PAYMENTMETHOD.TABLE.COLUMN.IMAGE')} body={imageBodyTemplate}></Column>
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} header={t('PAYMENTMETHOD.TABLE.COLUMN.STATUS')} body={statusBodyTemplate}></Column>
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={methodDialog}  style={{ width: '700px',padding:'5px' }} header={t('PAYMENT.METHOD.DETAILS')} modal className="p-fluid" footer={methodDialogFooter} onHide={hideDialog}>
                        <div className='card' style={{padding:'40px'}}>
                            {paymentMethod.account_image && (
                                <img
                                    src={
                                        paymentMethod.account_image instanceof File
                                            ? URL.createObjectURL(paymentMethod.account_image) // Temporary preview for file
                                            : paymentMethod.account_image // Direct URL for existing logo
                                    }
                                    alt="Uploaded Preview"
                                    width="150"
                                    className="mt-0 mx-auto mb-5 block shadow-2"
                                />
                            )}
                            <FileUpload
                            mode='basic'
                                name="account_image"
                                accept="image/*"
                                customUpload
                                onSelect={(e) => setPaymentMethod((prev) => ({
                                    ...prev,
                                    account_image: e.files[0],
                                }))}
                                style={{textAlign:'center',marginBottom:'10px'}}
                            />
                            <div className="field">
                                <label htmlFor="name" style={{fontWeight:'bold'}}>{t('PAYMENTMETHOD.FORM.INPUT.METHODNAME')}</label>
                                <InputText
                                    id="method_name"
                                    value={paymentMethod?.method_name}
                                    onChange={(e) =>
                                        setPaymentMethod((prev) => ({
                                            ...prev,
                                            method_name: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('PAYMENTMETHOD.FORM.INPUT.METHODNAME')}
                                    className={classNames({
                                        'p-invalid': submitted && !paymentMethod.method_name
                                    })}
                                />
                                {submitted && !paymentMethod.method_name && <small className="p-invalid" style={{ color: 'red' }}>{t('THIS_FIELD_IS_REQUIRED')}</small>}
                            </div>

                            <div className="field">
                                <label htmlFor="status" style={{fontWeight:'bold'}}>{t('PAYMENTMETHOD.FORM.INPUT.STATUS')}</label>
                                <Dropdown
                                    id="status"
                                    value={paymentMethod.status}
                                    options={[
                                        { label: 'Active', value: 1 },
                                        { label: 'Inactive', value: 0 },
                                    ]}
                                    onChange={(e) =>
                                        setPaymentMethod((prev) => ({
                                            ...prev,
                                            status: e.value,
                                        }))
                                    }
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Choose a status"
                                    className="w-full"
                                />
                                {submitted && !paymentMethod.status && <small className="p-invalid" style={{ color: 'red' }}>{t('THIS_FIELD_IS_REQUIRED')}</small>}

                            </div>


                            <div className="field">
                                <label htmlFor="account_details" style={{fontWeight:'bold'}}>{t('PAYMENTMETHOD.FORM.INPUT.ACCOUNTDETAILS')}</label>
                                <InputTextarea
                                    id="account_details"
                                    value={paymentMethod.account_details || ''}
                                    onChange={(e) =>
                                        setPaymentMethod((prev) => ({
                                            ...prev,
                                            account_details: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('PAYMENTMETHOD.FORM.INPUT.ACCOUNTDETAILS')}
                                    className="w-full p-2 border rounded"
                                    rows={4} // Adjust the number of visible rows as needed
                                />
                                {submitted && !paymentMethod.account_details && <small className="p-invalid" style={{ color: 'red' }}>{t('THIS_FIELD_IS_REQUIRED')}</small>}

                            </div>
                        </div>

                    </Dialog>

                    <Dialog visible={deleteMethodDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteMethodDialogFooter} onHide={hideDeleteMethodDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {paymentMethod && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{paymentMethod.method_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteMethodsDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteMethodsDialogFooter} onHide={hideDeleteMethodsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {paymentMethod && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(PaymentMethodPage);
