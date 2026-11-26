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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import {PaymentType } from '@/types/interface';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
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





    const actionBodyTemplate = (rowData: PaymentType) => (
        <RowActions
            items={[
                {
                    label: t('TABLE.GENERAL.EDIT'),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editType(rowData)
                },
                {
                    label: t('TABLE.GENERAL.DELETE'),
                    icon: <Trash2 className="h-4 w-4" />,
                    danger: true,
                    separatorBefore: true,
                    onClick: () => confirmDeleteType(rowData)
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

    const deleteTypeDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteTypeDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''} onClick={deleteType} />
        </>
    );
    const deleteTypesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteTypesDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''}  />
        </>
    );




    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.PAYMENTTYPE', { defaultValue: 'انواع پرداخت' })}
                description="مدیریت و تعریف انواع پرداخت"
                loading={loading}
                actions={
                    <Button type="button" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('CREATE_PAYMENT_TYPE')}
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
                    value={payment_types}
                    selection={selectedCompanies}
                    onSelectionChange={(e) => setSelectedCompanies(e.value as any)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    size="small"
                    className="datatable-responsive p-datatable-sm"
                    paginatorTemplate={
                        isRTL()
                            ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink'
                            : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    }
                    currentPageReportTemplate={t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}
                    emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                    dir={isRTL() ? 'rtl' : 'ltr'}
                    style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                    globalFilter={globalFilter}
                    responsiveLayout="scroll"
                >
                    <Column
                        header={t('TABLE.GENERAL.ACTION')}
                        body={actionBodyTemplate}
                        headerStyle={{ width: '4.5rem' }}
                        style={{ ...customCellStyleImage, textAlign: 'start' }}
                    />
                    <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="name" header={t('NAME')}  body={nameBodyTemplate}></Column>
                    <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="Account Details" header={t('DESCRIPTION')} body={descriptionBodyTemplate} ></Column>
                </DataTable>
            </ListPage>

            <FormSheet
                open={methodDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('PAYMENT.TYPE.DETAILS')}
                description={paymentType.id ? 'ویرایش نوع پرداخت' : 'ثبت نوع پرداخت جدید'}
                size="xl"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveType}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('PAYMENT.TYPE.DETAILS')} description="نام و توضیحات نوع پرداخت">
                    <FormField
                        label={t('NAME')}
                        required
                        error={submitted && !paymentType.name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="name"
                            value={paymentType?.name}
                            onChange={(e) =>
                                setPaymentType((prev) => ({
                                    ...prev,
                                    name: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            placeholder={t('PAYMENT_TYPE.PLACEHOLDER.NAME')}
                            className={cn('w-full', submitted && !paymentType.name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('PAYMENTMETHOD.FORM.INPUT.ACCOUNTDETAILS')}
                        required
                        fullWidth
                        error={submitted && !paymentType.description ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Textarea
                            id="description"
                            value={paymentType.description || ''}
                            onChange={(e) =>
                                setPaymentType((prev) => ({
                                    ...prev,
                                    description: e.target.value
                                }))
                            }
                            required
                            placeholder={t('PAYMENT_TYPE.PLACEHOLDER.DESCRIPTION')}
                            className={cn('w-full', submitted && !paymentType.description && 'border-rose-300')}
                            rows={4}
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

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
        </>
    );
};

export default withAuth(PaymentTypePage);
