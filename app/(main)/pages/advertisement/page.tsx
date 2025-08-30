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
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Advertisement } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchLanguages } from '@/app/redux/actions/languageActions';
import { FileUpload } from 'primereact/fileupload';
import { _addAdvertisement, _deleteAdvertisement, _editAdvertisement, _fetchAdvertisements } from '@/app/redux/actions/advertisementActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const AdvertisementPage = () => {

    let emptyAdvertisement:Advertisement={
        id:0,
        advertisement_title:'',
        ad_slider_image_url:'',
        status:0,
        deleted_at:'',
        created_at:'',
        updated_at:''
    }



    const [advertisementDialog, setAdvertisementDialog] = useState(false);
    const [deleteAdvertisementDialog, setDeleteAdvertisementDialog] = useState(false);
    const [deleteAdvertisementsDialog, setDeleteAdvertisementsDialog] = useState(false);
    const [advertisement,setAdvertisement]=useState<Advertisement>(emptyAdvertisement)
    const [selectedCompanies, setSelectedAdvertisement] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch=useDispatch<AppDispatch>()
    const {advertisements,loading}=useSelector((state:any)=>state.advertisementsReducer)
    const {t}=useTranslation()
    const [searchTag,setSearchTag]=useState("")



    useEffect(()=>{
        dispatch(_fetchAdvertisements(searchTag))
    },[dispatch,searchTag])

    const openNew = () => {
        setAdvertisement(emptyAdvertisement)
        setSubmitted(false);
        setAdvertisementDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setAdvertisementDialog(false);
    };

    const hideDeleteAdvertisementDialog = () => {
        setDeleteAdvertisementDialog(false);
    };

    const hideDeleteAdvertisementsDialog = () => {
        setDeleteAdvertisementsDialog(false);
    };



    const saveAdvertisement = () => {
        setSubmitted(true);
        if (!advertisement.advertisement_title  ) {

            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000,
            });
        return;
    }
        if (advertisement.id && advertisement.id !== 0) {
            dispatch(_editAdvertisement(advertisement.id,advertisement,toast,t));

        } else {
            dispatch(_addAdvertisement(advertisement,toast,t));
        }

        setAdvertisementDialog(false);
        setAdvertisement(emptyAdvertisement);
        setSubmitted(false)
    };

    const editAdvertisement = (advertisement: Advertisement) => {
        setAdvertisement({ ...advertisement});

        setAdvertisementDialog(true);
    };

    const confirmDeleteAdvertisement = (advertisement: Advertisement) => {
        setAdvertisement(advertisement);
        setDeleteAdvertisementDialog(true);
    };

    const deleteAdvertisement = () => {
        if (!advertisement?.id) {
            console.error("Advertisement  ID is undefined.");
            return;
        }
        dispatch(_deleteAdvertisement(advertisement?.id,toast,t))
        setDeleteAdvertisementDialog(false);

    };


    const confirmDeleteSelected = () => {
        setDeleteAdvertisementsDialog(true);
    };



    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button style={{ gap: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? '0.5rem' : '' }} label={t('ADVERTISEMENT.TABLE.CREATEADVERTISEMENT')} icon="pi pi-plus" severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"} onClick={openNew} />
                    {/* <Button style={{ gap: ["ar", "fa", "ps", "bn"].includes(i18n.language) ? '0.5rem' : '' }} label={t("APP.GENERAL.DELETE")} icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedCompanies || !(selectedCompanies as any).length} /> */}
                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex items-center">
                <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setSearchTag(e.currentTarget.value)}
                        placeholder={t('ECOMMERCE.COMMON.SEARCH')}
                        className="w-full md:w-auto"
                    />
                </span>
            </div>
        );
    };

    const imageBodyTemplate = (rowData: Advertisement) => {
            return (
                <>
                    <span className="p-column-title">Image</span>
                    <img src={`${rowData.ad_slider_image_url}`} alt={rowData.ad_slider_image_url?.toString()} className="shadow-2" width="60" />
                </>
            );
        };


    const advertisementTitleBodyTemplate = (rowData: Advertisement) => {
        return (
            <>
                <span className="p-column-title">Advertisement Title</span>
                {rowData.advertisement_title}
            </>
        );
    };

    const statusBodyTemplate = (rowData: Advertisement) => {
            // Define the text and background color based on the status value
            const getStatusText = (status: string) => {
                return status == '1' ? 'Active' : 'Deactivated';
            };

            const getStatusClasses = (status: number) => {
                return status == 1
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
                        {getStatusText(rowData.status.toString())}
                    </span>
                </>
            );
        };







    const actionBodyTemplate = (rowData: Advertisement) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"}  onClick={()=>editAdvertisement(rowData)}/>
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteAdvertisement(rowData)} />
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

    const advertisementDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''} onClick={saveAdvertisement} />
        </>
    );
    const deleteAdvertisementDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteAdvertisementDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''} onClick={deleteAdvertisement} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteAdvertisementsDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success"  className={isRTL() ? 'rtl-button' : ''}  />
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
                        value={advertisements}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedAdvertisement(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className={`datatable-responsive`}
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
                        globalFilter={globalFilter}
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        // header={header}
                        responsiveLayout="scroll"
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr',fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="" header={t('ADVERTISEMENT.TABLE.COLUMN.ADVERTISEMENTIMAGE')} sortable body={imageBodyTemplate}></Column>
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="name" header={t('ADVERTISEMENT.TABLE.COLUMN.ADVERTISEMENTTITLE')}  sortable body={advertisementTitleBodyTemplate}></Column>
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} field="status" header={t('ADVERTISEMENT.TABLE.COLUMN.ADVERTISEMENTSTATUS')}  body={statusBodyTemplate} sortable></Column>
                        <Column style={{...customCellStyleImage,textAlign: ["ar", "fa", "ps","bn"].includes(i18n.language) ? "right" : "left" }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={advertisementDialog}  style={{ width: '700px',padding:'5px' }} header={t('ADVERTISEMENT.DETAILS')} modal className="p-fluid" footer={advertisementDialogFooter} onHide={hideDialog}>
                        <div className='card' style={{padding:'40px'}}></div>
                        {advertisement.ad_slider_image_url && (
                            <img
                                src={
                                    advertisement.ad_slider_image_url instanceof File
                                        ? URL.createObjectURL(advertisement.ad_slider_image_url) // Temporary preview for file
                                        : advertisement.ad_slider_image_url // Direct URL for existing logo
                                }
                                alt="Uploaded Preview"
                                width="150"
                                className="mt-0 mx-auto mb-5 block shadow-2"
                            />
                        )}
                        <FileUpload
                        mode='basic'
                            name="company_logo"
                            accept="image/*"
                            customUpload
                            onSelect={(e) => setAdvertisement((prev) => ({
                                ...prev,
                                ad_slider_image_url: e.files[0],
                            }))}
                            style={{textAlign:'center',marginBottom:'10px'}}
                        />
                        <div className="field">
                            <label htmlFor="advertisement_title" style={{fontWeight:'bold'}}>{t('ADVERTISEMENT.FORM.INPUT.ADVERTISEMENTTITLE')}</label>
                            <InputText
                                id="advertisement_title"
                                value={advertisement.advertisement_title}
                                onChange={(e) =>
                                    setAdvertisement((prevAdvertisement) => ({
                                        ...prevAdvertisement,
                                        advertisement_title: e.target.value,
                                    }))
                                }
                                required
                                autoFocus
                                placeholder={t('ADVERTISEMENT.FORM.PLACEHOLDER.ADVERTISEMENTTITLE')}
                                className={classNames({
                                    'p-invalid': submitted && !advertisement.advertisement_title
                                })}
                            />
                            {submitted && !advertisement.advertisement_title && <small className="p-invalid" style={{ color: 'red' }}>{t('REQUIRED')}</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="status" style={{fontWeight:'bold'}}>{t('ADVERTISEMENT.FORM.INPUT.ADVERTISEMENTSTATUS')}</label>
                            <Dropdown
                                id="status"
                                value={advertisement.status}
                                options={[
                                    { label: 'Active', value: 1 },
                                    { label: 'Inactive', value: 0 },
                                ]}
                                onChange={(e) =>
                                    setAdvertisement((prev) => ({
                                        ...prev,
                                        status: e.value,
                                    }))
                                }
                                optionLabel="label"
                                optionValue="value"
                                placeholder={t('ADVERTISEMENT.FORM.PLACEHOLDER.ADVERTISEMENTSTATUS')}
                                className="w-full"
                            />
                        </div>


                    </Dialog>

                    <Dialog visible={deleteAdvertisementDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteAdvertisementDialogFooter} onHide={hideDeleteAdvertisementDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {advertisement && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{advertisement.advertisement_title}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteAdvertisementsDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteAdvertisementsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {advertisement && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(AdvertisementPage);
