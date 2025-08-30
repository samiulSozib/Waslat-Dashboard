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
import { District, Province } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addDistrict, _deleteDistrict, _deleteSelectedDistricts, _editDistrict, _fetchDistricts } from '@/app/redux/actions/districtActions';
import { provinceReducer } from '../../../redux/reducers/provinceReducer';
import { _fetchProvinces } from '@/app/redux/actions/provinceActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const DistrictPage = () => {
    let emptyDistrict: District = {
        id: 0,
        district_name: '',
        province_id: 0,
        delete_at: '',
        created_at: '',
        updated_at: '',
        province: null
    };

    const [districtDialog, setDistrictDialog] = useState(false);
    const [deleteDistrictDialog, setDeleteDistrictDialog] = useState(false);
    const [deleteDistrictsDialog, setDeleteDistrictsDialog] = useState(false);
    const [district, setDistrict] = useState<District>(emptyDistrict);
    const [selectedDistricts, setSelectedDistricts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { districts, loading } = useSelector((state: any) => state.districtReducer);
    const { provinces } = useSelector((state: any) => state.provinceReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchDistricts());
        dispatch(_fetchProvinces());
    }, [dispatch]);

    const openNew = () => {
        setDistrict(emptyDistrict);
        setSubmitted(false);
        setDistrictDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setDistrictDialog(false);
        setDistrict(emptyDistrict);
    };

    const hideDeleteDistrictDialog = () => {
        setDeleteDistrictDialog(false);
        setDistrict(emptyDistrict);
    };

    const hideDeleteDistrictsDialog = () => {
        setDeleteDistrictsDialog(false);
        setDistrict(emptyDistrict);
    };

    const saveDistrict = () => {
        setSubmitted(true);
        if (!district.district_name || !district.province) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (district.id && district.id !== 0) {
            dispatch(_editDistrict(district.id, district, toast, t));
        } else {
            dispatch(_addDistrict(district, toast, t));
        }

        setDistrictDialog(false);
        setDistrict(emptyDistrict);
        setSubmitted(false);
    };

    const editDistrict = (district: District) => {
        setDistrict({ ...district });

        setDistrictDialog(true);
    };

    const confirmDeleteDistrict = (district: District) => {
        setDistrict(district);
        setDeleteDistrictDialog(true);
    };

    const deleteDistrict = () => {
        if (!district?.id) {
            console.error('District  ID is undefined.');
            return;
        }
        dispatch(_deleteDistrict(district?.id, toast, t));
        setDeleteDistrictDialog(false);
    };

            const confirmDeleteSelected = () => {
        if (!selectedDistricts || (selectedDistricts as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('VALIDATION_WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteDistrictsDialog(true);
    };

        const deleteSelectedDistricts = async() => {
            if (!selectedDistricts || (selectedDistricts as any).length === 0) {
                toast.current?.show({
                    severity: 'error',
                    summary: t('VALIDATION_ERROR'),
                    detail: t('NO_SELECTED_ITEMS_FOUND'),
                    life: 3000
                });
                return;
            }

            const selectedIds = (selectedDistricts as District[]).map((district) => district.id);


            await _deleteSelectedDistricts(selectedIds,toast,t)
            dispatch(_fetchDistricts())




            setSelectedDistricts(null)
            setDeleteDistrictsDialog(false)
        };



    const rightToolbarTemplate = () => {
        const hasSelectedDistricts = selectedDistricts && (selectedDistricts as any).length > 0;

        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('DISTRICT.TABLE.CREATEDISTRICT')}
                        icon="pi pi-plus"
                        severity="success"
                        className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
                        onClick={openNew}
                    />


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

    const districtNameBodyTemplate = (rowData: District) => {
        return (
            <>
                <span className="p-column-title">District Name</span>
                {rowData.district_name}
            </>
        );
    };

    const provinceNameBodyTemplate = (rowData: District) => {
        return (
            <>
                <span className="p-column-title">Province Name</span>
                {rowData.province?.province_name}
            </>
        );
    };

    const actionBodyTemplate = (rowData: District) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editDistrict(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteDistrict(rowData)} />
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

    const districtDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveDistrict} />
        </>
    );
    const deleteDistrictDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteDistrictDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteDistrict} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteDistrictsDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedDistricts}/>
        </>
    );

    useEffect(() => {
        if (district.province_id) {
            const selectedProvince = provinces.find((province: Province) => province.id === district.province_id);

            if (selectedProvince) {
                setDistrict((prev) => ({
                    ...prev,
                    province: selectedProvince // Update with the selected company object
                }));
            }
        }
    }, [district.province_id, provinces]);






    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={districts}
                        selection={selectedDistricts}
                        onSelectionChange={(e) => setSelectedDistricts(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
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
                            field="district_name"
                            header={t('DISTRICT.TABLE.COLUMN.DISTRICTNAME')}
                            body={districtNameBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="province_name"
                            header={t('DISTRICT.TABLE.COLUMN.PROVINCE')}
                            body={provinceNameBodyTemplate}
                            sortable
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={districtDialog} style={{ width: '700px', padding: '5px' }} header={t('DISTRICT.DETAILS')} modal className="p-fluid" footer={districtDialogFooter} onHide={hideDialog}>
                        <div className="card" style={{ padding: '40px' }}>
                            <div className="field col">
                                <label htmlFor="district_name" style={{ fontWeight: 'bold' }}>
                                    {t('DISTRICT.TABLE.COLUMN.DISTRICTNAME')}
                                </label>
                                <InputText
                                    id="district_name"
                                    value={district.district_name}
                                    onChange={(e) =>
                                        setDistrict((prevDistrict) => ({
                                            ...prevDistrict,
                                            district_name: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('DISTRICT.FORM.PLACEHOLDER.DISTRICTNAME')}
                                    className={classNames({
                                        'p-invalid': submitted && !district.district_name
                                    })}
                                />
                                {submitted && !district.district_name && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                       {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field col">
                                <label htmlFor="province_id" style={{ fontWeight: 'bold' }}>
                                    {t('DISTRICT.FORM.INPUT.PROVINCE')}
                                </label>
                                <Dropdown
                                    id="province"
                                    value={district.province}
                                    options={provinces}
                                    onChange={(e) =>
                                        setDistrict((prev) => ({
                                            ...prev,
                                            province: e.value
                                        }))
                                    }
                                    optionLabel="province_name"
                                    // optionValue='id'
                                    filter
                                    filterBy='province_name'
                                    filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                                    placeholder={t('DISTRICT.FORM.PLACEHOLDER.PROVINCE')}
                                    className="w-full"
                                />
                                {submitted && !district.province && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteDistrictDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteDistrictDialogFooter} onHide={hideDeleteDistrictDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {district && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{district.district_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteDistrictsDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteDistrictsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {districts && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(DistrictPage);
