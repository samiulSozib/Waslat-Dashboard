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
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { _addCompanyCode, _deleteCompanyCode, _deleteSelectedCompanyCodes, _editCompanyCode, _fetchCompanyCodes } from '@/app/redux/actions/companyCodeActions';
import { AppDispatch } from '@/app/redux/store';
import { Company, CompanyCode } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const CompanyCodePage = () => {
    let emptyCompanyCode: CompanyCode = {
        id: 0,
        company_id: 0,
        reserved_digit: '',
        deleted_at: '',
        created_at: '',
        updated_at: '',
        company: null
    };

    const [companyCodeDialog, setCompanyCodeDialog] = useState(false);
    const [deleteCompanyCodeDialog, setDeleteCompanyCodeDialog] = useState(false);
    const [deleteCompanyCodesDialog, setDeleteCompanyCodesDialog] = useState(false);
    const [companyCode, setCompanyCode] = useState<CompanyCode>(emptyCompanyCode);
    const [selectedCompanyCodes, setSelectedCompanyCodes] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { companyCodes, loading } = useSelector((state: any) => state.companyCodeReducer);
    const { companies } = useSelector((state: any) => state.companyReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');

    useEffect(() => {
        dispatch(_fetchCompanyCodes(searchTag));
        dispatch(_fetchCompanies());
    }, [dispatch, searchTag]);

    const openNew = () => {
        setCompanyCode(emptyCompanyCode);
        setSubmitted(false);
        setCompanyCodeDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCompanyCodeDialog(false);
        setCompanyCode(emptyCompanyCode);
    };

    const hideDeleteCompanyCodeDialog = () => {
        setDeleteCompanyCodeDialog(false);
        setCompanyCode(emptyCompanyCode);
    };

    const hideDeleteCompanyCodesDialog = () => {
        setDeleteCompanyCodesDialog(false);
        setCompanyCode(emptyCompanyCode);
    };

    const saveCompanyCode = () => {
        setSubmitted(true);
        if (!companyCode.reserved_digit || !companyCode.company) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return; // Prevent saving if validation fails
        }
        if (companyCode.id && companyCode.id !== 0) {
            dispatch(_editCompanyCode(companyCode, toast, t));
        } else {
            dispatch(_addCompanyCode(companyCode, toast, t));
        }

        setCompanyCodeDialog(false);
        setCompanyCode(emptyCompanyCode);
        setSubmitted(false);
    };

    const editCompanyCode = (companyCode: CompanyCode) => {
        //console.log(companyCode.company)
                const matchingCompany = companies.find((r: any) => r.id === companyCode.company?.id);

        setCompanyCode({ ...companyCode,company:matchingCompany });

        setCompanyCodeDialog(true);
    };

    const confirmDeleteCompany = (companyCode: CompanyCode) => {
        setCompanyCode(companyCode);
        setDeleteCompanyCodeDialog(true);
    };

    const deleteCompanyCode = () => {
        if (!companyCode?.id) {
            console.error('Company Code ID is undefined.');
            return;
        }
        dispatch(_deleteCompanyCode(companyCode?.id, toast, t));
        setDeleteCompanyCodeDialog(false);
    };



        const confirmDeleteSelected = () => {
        if (!selectedCompanyCodes || (selectedCompanyCodes as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('VALIDATION_WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteCompanyCodesDialog(true);
    };

        const deleteSelectedCompanyCodes = async() => {
            if (!selectedCompanyCodes || (selectedCompanyCodes as any).length === 0) {
                toast.current?.show({
                    severity: 'error',
                    summary: t('VALIDATION_ERROR'),
                    detail: t('NO_SELECTED_ITEMS_FOUND'),
                    life: 3000
                });
                return;
            }

            const selectedIds = (selectedCompanyCodes as CompanyCode[]).map((companyCode) => companyCode.id);


            await _deleteSelectedCompanyCodes(selectedIds,toast,t)
            dispatch(_fetchCompanyCodes())



            setSelectedCompanyCodes(null)
            setDeleteCompanyCodesDialog(false)
        };


    const rightToolbarTemplate = () => {
        const hasSelectedCompanyCodes = selectedCompanyCodes && (selectedCompanyCodes as any).length > 0;
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2    ">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('COMPANYCODE.TABLE.CREATECOMPANYCODE')}
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
                        disabled={!selectedCompanyCodes || !(selectedCompanyCodes as any).length}
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

    const reservedDigitBodyTemplate = (rowData: CompanyCode) => {
        return (
            <>
                <span className="p-column-title">Reserved Digit</span>
                {rowData.reserved_digit}
            </>
        );
    };

    const countryNameBodyTemplate = (rowData: CompanyCode) => {
        return (
            <>
                <span className="p-column-title">Country</span>
                {rowData.company?.country?.country_name}
            </>
        );
    };

    const companyNameBodyTemplate = (rowData: CompanyCode) => {
        return (
            <>
                <span className="p-column-title">Company</span>
                {rowData.company?.company_name}
            </>
        );
    };

    const countryCodeBodyTemplate = (rowData: CompanyCode) => {
        return (
            <>
                <span className="p-column-title">Country Code</span>
                {rowData.company?.country?.country_telecom_code}
            </>
        );
    };

    const actionBodyTemplate = (rowData: CompanyCode) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editCompanyCode(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteCompany(rowData)} />
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

    const companyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveCompanyCode} />
        </>
    );
    const deleteCompanyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCompanyCodeDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteCompanyCode} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCompanyCodesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedCompanyCodes}/>
        </>
    );

    useEffect(() => {
        if (companyCode.company_id) {
            const selectedCompany = companies.find((company: Company) => company.id === companyCode.company_id);

            if (selectedCompany) {
                setCompanyCode((prev) => ({
                    ...prev,
                    company: selectedCompany // Update with the selected company object
                }));
            }
        }
    }, [companyCode.company_id, companies]);

    return (
        <div className="grid -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={companyCodes}
                        selection={selectedCompanyCodes}
                        onSelectionChange={(e) => setSelectedCompanyCodes(e.value as any)}
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
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="reserved_digit"
                            header={t('COMPANYCODE.TABLE.COLUMN.RESERVEDDIGIT')}
                            sortable
                            body={reservedDigitBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="company.country.country_name"
                            header={t('COMPANYCODE.TABLE.COLUMN.COUNTRYNAME')}
                            body={countryNameBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="company.company_name"
                            header={t('COMPANYCODE.TABLE.COLUMN.COMPANYNAME')}
                            sortable
                            body={companyNameBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="company.country.country_telecom_code"
                            header={t('COMPANYCODE.TABLE.COLUMN.COUNTRYCODE')}
                            sortable
                            body={countryCodeBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={companyCodeDialog} style={{ width: '700px', padding: '5px' }} header={t('MENU.COMPANYCODE')} modal className="p-fluid" footer={companyDialogFooter} onHide={hideDialog}>
                        <div className="card" style={{ padding: '40px' }}>
                            <div className="field">
                                <label htmlFor="name" style={{ fontWeight: 'bold' }}>
                                    {t('COMPANYCODE.FORM.INPUT.RESERVEDDIGIT')}
                                </label>
                                <InputText
                                    id="reserved_digit"
                                    value={companyCode?.reserved_digit}
                                    onChange={(e) =>
                                        setCompanyCode((prevCompanyCode) => ({
                                            ...prevCompanyCode,
                                            reserved_digit: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('COMPANYCODE.FORM.PLACEHOLDER.RESERVEDDIGIT')}
                                    className={classNames({
                                        'p-invalid': submitted && !companyCode.reserved_digit
                                    })}
                                />
                                {submitted && !companyCode?.reserved_digit && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="formgrid grid">
                                <div className="field col">
                                    <label htmlFor="company" style={{ fontWeight: 'bold' }}>
                                        {t('COMPANYCODE.FORM.INPUT.COMPANYNAME')}
                                    </label>
                                    <Dropdown
                                        id="company"
                                        value={companyCode.company}
                                        options={companies}
                                        onChange={(e) =>
                                            setCompanyCode((prevCompanyCode) => ({
                                                ...prevCompanyCode,
                                                company: e.value
                                            }))
                                        }
                                        optionLabel="company_name"
                                        placeholder={t('COMPANYCODE.FORM.PLACEHOLDER.COMPANYNAME')}
                                        className="w-full"
                                    />
                                    {submitted && !companyCode?.company_id && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCompanyCodeDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompanyDialogFooter} onHide={hideDeleteCompanyCodeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {companyCode && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{companyCode.reserved_digit}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCompanyCodesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteCompanyCodesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {companyCodes && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(CompanyCodePage);
