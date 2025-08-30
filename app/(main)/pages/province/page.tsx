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
import { Country, Province } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addProvince, _deleteProvince, _deleteSelectedProvinces, _editProvince, _fetchProvinces } from '@/app/redux/actions/provinceActions';
import { countriesReducer } from '../../../redux/reducers/countriesReducer';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const ProvincePage = () => {
    let emptyProvince: Province = {
        id: 0,
        province_name: '',
        country_id: 0,
        deleted_at: '',
        created_at: '',
        updated_at: '',
        country: null
    };

    const [provinceDialog, setProvinceDialog] = useState(false);
    const [deleteProvinceDialog, setDeleteProvinceDialog] = useState(false);
    const [deleteProvincesDialog, setDeleteProvincesDialog] = useState(false);
    const [province, setProvince] = useState<Province>(emptyProvince);
    const [selectedProvinces, setSelectedProvinces] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { provinces, loading } = useSelector((state: any) => state.provinceReducer);
    const { countries } = useSelector((state: any) => state.countriesReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchProvinces());
        dispatch(_fetchCountries());
    }, [dispatch]);

    const openNew = () => {
        setProvince(emptyProvince);
        setSubmitted(false);
        setProvinceDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProvinceDialog(false);
        setProvince(emptyProvince);
    };

    const hideDeleteProvinceDialog = () => {
        setDeleteProvinceDialog(false);
        setProvince(emptyProvince);
    };

    const hideDeleteProvincesDialog = () => {
        setDeleteProvincesDialog(false);
        setProvince(emptyProvince);
    };

    const saveProvince = () => {
        setSubmitted(true);
        if (!province.province_name || !province.country) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (province.id && province.id !== 0) {
            dispatch(_editProvince(province.id, province, toast, t));
        } else {
            dispatch(_addProvince(province, toast, t));
        }

        setProvinceDialog(false);
        setProvince(emptyProvince);
        setSubmitted(false);
    };

    const editProvince = (province: Province) => {
        setProvince({ ...province });

        setProvinceDialog(true);
    };

    const confirmDeleteProvince = (province: Province) => {
        setProvince(province);
        setDeleteProvinceDialog(true);
    };

    const deleteProvince = () => {
        if (!province?.id) {
            console.error('Province  ID is undefined.');
            return;
        }
        dispatch(_deleteProvince(province?.id, toast, t));
        setDeleteProvinceDialog(false);
    };



    const confirmDeleteSelected = () => {
    if (!selectedProvinces || (selectedProvinces as any).length === 0) {
        toast.current?.show({
            severity: 'warn',
            summary: t('VALIDATION_WARNING'),
            detail: t('NO_SELECTED_ITEMS_FOUND'),
            life: 3000
        });
        return;
    }
    setDeleteProvincesDialog(true);
};

    const deleteSelectedProvinces = async() => {
        if (!selectedProvinces || (selectedProvinces as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        const selectedIds = (selectedProvinces as Province[]).map((province) => province.id);


        await _deleteSelectedProvinces(selectedIds,toast,t)
        dispatch(_fetchProvinces())


        setSelectedProvinces(null)
        setDeleteProvincesDialog(false)
    };



    const rightToolbarTemplate = () => {
        const hasSelectedProvinces = selectedProvinces && (selectedProvinces as any).length > 0;

        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                        <Button
                            style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                            label={t('CREATE_PROVINCE')}
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

    const provinceNameBodyTemplate = (rowData: Province) => {
        return (
            <>
                <span className="p-column-title">Province Name</span>
                {rowData.province_name}
            </>
        );
    };

    const countryNameBodyTemplate = (rowData: Province) => {
        return (
            <>
                <span className="p-column-title">Country Name</span>
                {rowData.country?.country_name}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Province) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editProvince(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProvince(rowData)} />
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

    const provinceDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveProvince} />
        </>
    );
    const deleteProvinceDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteProvinceDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteProvince} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteProvincesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedProvinces} />
        </>
    );

    useEffect(() => {
        if (province.country_id) {
            const selectedCountry = countries.find((country: Country) => country.id === province.country_id);

            if (selectedCountry) {
                setProvince((prev) => ({
                    ...prev,
                    country: selectedCountry // Update with the selected company object
                }));
            }
        }
    }, [province.country_id, countries]);



    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={provinces}
                        selection={selectedProvinces}
                        onSelectionChange={(e) => setSelectedProvinces(e.value as any)}
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
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        // header={header}
                        responsiveLayout="scroll"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="province_name"
                            header={t('PROVINCE.TABLE.COLUMN.PROVINCENAME')}
                            body={provinceNameBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="country_name"
                            header={t('PROVINCE.TABLE.COLUMN.COUNTRY')}
                            body={countryNameBodyTemplate}
                            sortable
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Dialog visible={provinceDialog} style={{ width: '700px', padding: '5px' }} header={t('PROVINCE.DETAILS')} modal className="p-fluid" footer={provinceDialogFooter} onHide={hideDialog}>
                        <div className="card" style={{ padding: '40px' }}>
                            <div className="field">
                                <label htmlFor="province_name" style={{ fontWeight: 'bold' }}>
                                    {t('PROVINCE.FORM.INPUT.PROVINCENAME')}
                                </label>
                                <InputText
                                    id="province_name"
                                    value={province.province_name}
                                    onChange={(e) =>
                                        setProvince((prevProvince) => ({
                                            ...prevProvince,
                                            province_name: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('PROVINCE.FORM.PLACEHOLDER.PROVINCENAME')}
                                    className={classNames({
                                        'p-invalid': submitted && !province.province_name
                                    })}
                                />
                                {submitted && !province.province_name && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field col">
                                <label htmlFor="country_id" style={{ fontWeight: 'bold' }}>
                                    {t('PROVINCE.FORM.INPUT.COUNTRY')}
                                </label>
                                <Dropdown
                                    id="country"
                                    value={province.country}
                                    options={countries}
                                    onChange={(e) =>
                                        setProvince((prev) => ({
                                            ...prev,
                                            country: e.value
                                        }))
                                    }
                                    optionLabel="country_name"
                                    // optionValue='id'
                                    placeholder={t('PROVINCE.FORM.PLACEHOLDER.COUNTRY')}
                                    className="w-full"
                                />
                                {submitted && !province.country && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProvinceDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteProvinceDialogFooter} onHide={hideDeleteProvinceDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {province && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{province.province_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProvincesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteProvincesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedProvinces && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(ProvincePage);
