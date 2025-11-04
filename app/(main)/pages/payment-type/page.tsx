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
import {PaymentType } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { InputTextarea } from 'primereact/inputtextarea';
import { customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { _addPaymentType, _deletePaymentType, _editPaymentType, _fetchPaymentTypes } from '@/app/redux/actions/paymentTypeActions';

const PaymentTypePage = () => {



    let emptyPaymentType:PaymentType={
        id: 0,
        name: '',
        description: '',
        created_at: '',
        updated_at: '',
    }

    const [methodDialog, setTypeDialog] = useState(false);
    const [deleteTypeDialog, setDeleteTypeDialog] = useState(false);
    const [deleteTypesDialog, setDeleteTypesDialog] = useState(false);
    const [paymentType,setPaymentType]=useState<PaymentType>(emptyPaymentType)
    const [selectedCompanies, setSelectedCompanies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch=useDispatch<AppDispatch>()
    const {payment_types,loading}=useSelector((state:any)=>state.paymentTypesReducer)
    const {t}=useTranslation()

    useEffect(()=>{
        dispatch(_fetchPaymentTypes())
    },[dispatch])



    const openNew = () => {
        setPaymentType(emptyPaymentType)
        setSubmitted(false);
        setTypeDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setTypeDialog(false);
    };

    const hideDeleteTypeDialog = () => {
        setDeleteTypeDialog(false);
    };

    const hideDeleteTypesDialog = () => {
        setDeleteTypesDialog(false);
    };



    const saveType = () => {
        setSubmitted(true);
        if (!paymentType.name || !paymentType.description) {

            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000,
            });
        return;
    }
        if (paymentType.id && paymentType.id !== 0) {
            dispatch(_editPaymentType(paymentType.id,paymentType,toast,t));

        } else {
            dispatch(_addPaymentType(paymentType,toast,t));
        }

        setTypeDialog(false);
        setPaymentType(emptyPaymentType);
        setSubmitted(false)
    };

    const editType = (paymentType: PaymentType) => {
        setPaymentType({ ...paymentType});

        setTypeDialog(true);
    };

    const confirmDeleteType = (paymentType: PaymentType) => {
        setPaymentType(paymentType);
        setDeleteTypeDialog(true);
    };

    const deleteType = () => {
        if (!paymentType?.id) {
            console.error("Type ID is undefined.");
            return;
        }
        dispatch(_deletePaymentType(paymentType?.id,toast,t))
        setDeleteTypeDialog(false);

    };


    const confirmDeleteSelected = () => {
        setDeleteTypesDialog(true);
    };



    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button style={{ gap: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? '0.5rem' : '' }} label={t('CREATE_PAYMENT_TYPE')} icon="pi pi-plus" severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"} onClick={openNew} />
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


    const nameBodyTemplate = (rowData: PaymentType) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                {rowData.name}
            </>
        );
    };

    const descriptionBodyTemplate = (rowData: PaymentType) => {
        return (
            <>
                <span className="p-column-title">Description</span>
                {rowData.description}
            </>
        );
    };





    const actionBodyTemplate = (rowData: PaymentType) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"}  onClick={()=>editType(rowData)}/>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteType(rowData)} />
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
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''} onClick={saveType} />
        </>
    );
    const deleteTypeDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteTypeDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''} onClick={deleteType} />
        </>
    );
    const deleteTypesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteTypesDialog} />
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
                        value={payment_types}
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
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="name" header={t('NAME')}  body={nameBodyTemplate}></Column>
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="Account Details" header={t('DESCRIPTION')} body={descriptionBodyTemplate} ></Column>
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={methodDialog}  style={{ width: '700px',padding:'5px' }} header={t('PAYMENT.TYPE.DETAILS')} modal className="p-fluid" footer={methodDialogFooter} onHide={hideDialog}>
                        <div className='card' style={{padding:'40px'}}>


                            <div className="field">
                                <label htmlFor="name" style={{fontWeight:'bold'}}>{t('NAME')}</label>
                                <InputText
                                    id="name"
                                    value={paymentType?.name}
                                    onChange={(e) =>
                                        setPaymentType((prev) => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('PAYMENT_TYPE.PLACEHOLDER.NAME')}
                                    className={classNames({
                                        'p-invalid': submitted && !paymentType.name
                                    })}
                                />
                                {submitted && !paymentType.name && <small className="p-invalid" style={{ color: 'red' }}>{t('THIS_FIELD_IS_REQUIRED')}</small>}
                            </div>




                            <div className="field">
                                <label htmlFor="account_details" style={{fontWeight:'bold'}}>{t('PAYMENTMETHOD.FORM.INPUT.ACCOUNTDETAILS')}</label>
                                <InputTextarea
                                    id="description"
                                    value={paymentType.description || ''}
                                    onChange={(e) =>
                                        setPaymentType((prev) => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('PAYMENT_TYPE.PLACEHOLDER.DESCRIPTION')}
                                    className="w-full p-2 border rounded"
                                    rows={4} // Adjust the number of visible rows as needed
                                />
                                {submitted && !paymentType.description && <small className="p-invalid" style={{ color: 'red' }}>{t('THIS_FIELD_IS_REQUIRED')}</small>}

                            </div>
                        </div>

                    </Dialog>

                    <Dialog visible={deleteTypeDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteTypeDialogFooter} onHide={hideDeleteTypeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {paymentType && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{paymentType.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteTypesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteTypesDialogFooter} onHide={hideDeleteTypesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {paymentType && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(PaymentTypePage);
