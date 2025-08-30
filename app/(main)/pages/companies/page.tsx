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
import { _fetchCompanies, _deleteCompany, _addCompany, _editCompany, _deleteSelectedCompanies } from '@/app/redux/actions/companyActions';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Company, Country, CustomField } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { useTranslation } from 'react-i18next';
import withAuth from '../../authGuard';
import { customCellStyle, customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { Badge } from 'primereact/badge';
import { CustomFields } from '../../components/CustomFields';
import { parseInputFormSchema, stringifyInputFormSchema } from '../../utilities/parseInputFormSchema';

const CompanyPage = () => {
    let emptyCompany: Company = {
        id: 0,
        company_name: '',
        company_logo: '',
        country_id: null,
        telegram_chat_id: null,
        deleted_at: '',
        created_at: '',
        updated_at: '',
        country: null,
        input_form_schema: []
    };

    const [companyDialog, setCompanyDialog] = useState(false);
    const [deleteCompanyDialog, setDeleteCompanyDialog] = useState(false);
    const [deleteCompaniesDialog, setDeleteCompaniesDialog] = useState(false);
    const [company, setCompany] = useState<Company>(emptyCompany);
    const [selectedCompanies, setSelectedCompanies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { companies, loading } = useSelector((state: any) => state.companyReducer);
    const { countries } = useSelector((state: any) => state.countriesReducer);
    const { telegramChatIds } = useSelector((state: any) => state.telegramReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');

    useEffect(() => {
        dispatch(_fetchCompanies(searchTag));
        dispatch(_fetchCountries());
        dispatch(_fetchTelegramList());
    }, [dispatch, searchTag]);

    const openNew = () => {
        setCompany(emptyCompany);
        setSubmitted(false);
        setCompanyDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCompanyDialog(false);
        setCompany(emptyCompany);
    };

    const hideDeleteCompanyDialog = () => {
        setDeleteCompanyDialog(false);
        setCompany(emptyCompany);
    };

    const hideDeleteCompaniesDialog = () => {
        setDeleteCompaniesDialog(false);
        setCompany(emptyCompany);
    };

    const saveCompany = () => {
        setSubmitted(true);

        if (!company.company_name || company.company_name.length === 0 || !company.country) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        // Validate custom fields
        const parsedFields = parseInputFormSchema(company.input_form_schema);
        if (parsedFields && parsedFields.length > 0) {
            for (let i = 0; i < parsedFields.length; i++) {
                const field = parsedFields[i];
                if (!field.name || field.name.trim() === '') {
                    toast.current?.show({
                        severity: 'error',
                        summary: t('VALIDATION_ERROR'),
                        detail: t('CUSTOM_FIELD_NAME_REQUIRED'),
                        life: 3000
                    });
                    return;
                }

                if (!field.label.en || field.label.en.trim() === '') {
                    toast.current?.show({
                        severity: 'error',
                        summary: t('VALIDATION_ERROR'),
                        detail: t('CUSTOM_FIELD_LABEL_REQUIRED'),
                        life: 3000
                    });
                    return;
                }
            }
        }

        // Prepare company data for API
        const companyData = {
            ...company,
            input_form_schema: stringifyInputFormSchema(parsedFields) // Stringify for API
        };

        if (company.id && company.id !== 0) {
            dispatch(_editCompany(companyData, toast, t));
        } else {
            dispatch(_addCompany(companyData, toast, t));
        }

        setCompanyDialog(false);
        setCompany(emptyCompany);
        setSubmitted(false);
    };

    const editCompany = (company: Company) => {
        const matching = countries.find((r: any) => r.id === company.country?.id);
        console.log(company)
        setCompany({
            ...company,
            country_id: company.country_id,
            country: matching,
            input_form_schema: parseInputFormSchema(company.input_form_schema)
        });
        setCompanyDialog(true);
    };

    const confirmDeleteCompany = (company: Company) => {
        setCompany(company);
        setDeleteCompanyDialog(true);
    };

    const deleteCompany = () => {
        if (!company?.id) {
            console.error('Company ID is undefined.');
            return;
        }
        dispatch(_deleteCompany(company?.id, toast, t));
        setDeleteCompanyDialog(false);
    };

    const confirmDeleteSelected = () => {
        if (!selectedCompanies || (selectedCompanies as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('VALIDATION_WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteCompaniesDialog(true);
    };

    const deleteSelectedCompanies = async () => {
        if (!selectedCompanies || (selectedCompanies as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        const selectedIds = (selectedCompanies as Company[]).map((company) => company.id);
        await _deleteSelectedCompanies(selectedIds, toast, t);
        dispatch(_fetchCompanies());

        setSelectedCompanies(null);
        setDeleteCompaniesDialog(false);
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex justify-end items-center space-x-2">
                <Button label={t('COMPANY.TABLE.CREATECOMPANY')} icon="pi pi-plus" severity="success" className={isRTL() ? 'ml-2' : 'mr-2'} onClick={openNew} style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }} />
            </div>
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

    const nameBodyTemplate = (rowData: Company) => {
        return (
            <>
                <span className="p-column-title">Company Name</span>
                {rowData.company_name}
            </>
        );
    };

    const imageBodyTemplate = (rowData: Company) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img
                    src={`${rowData.company_logo}`}
                    alt={rowData.company_name.toString()}
                    className="shadow-2"
                    style={{
                        padding: '2px',
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                    }}
                />
            </>
        );
    };

    const countryBodyTemplate = (rowData: Company) => {
        return (
            <>
                <span className="p-column-title">Country</span>
                {rowData.country?.country_name}
            </>
        );
    };

    const telegramGroupNameBodyTemplate = (rowData: Company) => {
        return (
            <>
                <span className="p-column-title">Telegram Group Name</span>
                {rowData.telegram_chat_id?.group_name}
            </>
        );
    };

    const customFieldsBodyTemplate = (rowData: Company) => {
        const fieldCount = parseInputFormSchema(rowData.input_form_schema).length;
        return (
            <>
                <span className="p-column-title">Custom Fields</span>
                {fieldCount > 0 ? <Badge value={fieldCount} severity="info" /> : <span className="text-color-secondary">{rowData.input_form_schema?.length.toString()}</span>}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Company) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editCompany(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteCompany(rowData)} />
            </>
        );
    };

    const companyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveCompany} />
        </>
    );
    const deleteCompanyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCompanyDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteCompany} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCompaniesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedCompanies} />
        </>
    );

    useEffect(() => {
        if (company.country_id) {
            const selectedCountry = countries.find((country: Country) => country.id === company.country_id);
            if (selectedCountry) {
                setCompany((prev) => ({
                    ...prev,
                    country: selectedCountry
                }));
            }
        }
    }, [company.country_id, countries]);

    return (
        <div className="grid -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4 flex flex-col md:flex-row justify-between items-center" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={companies}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedCompanies(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        className={`datatable-responsive`}
                        paginatorTemplate={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={isRTL() ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`}
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        responsiveLayout="scroll"
                    >
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="company_name"
                            header={t('COMPANY.TABLE.COLUMN.COMPANYNAME')}
                            sortable
                            body={nameBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('COMPANY.TABLE.COLUMN.LOGO')} body={imageBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="country_name"
                            header={t('COMPANY.TABLE.COLUMN.COUNTRYNAME')}
                            body={countryBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Group Name"
                            header={t('COMPANY.TABLE.COLUMN.CHATGROUPNAME')}
                            body={telegramGroupNameBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('TOTAL_CUSTOM_FIELD')} body={customFieldsBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={companyDialog} style={{ width: '90%', maxWidth: '800px' }} header={t('COMPANY.DETAILS')} modal className="p-fluid" footer={companyDialogFooter} onHide={hideDialog}>
                        <div className="card" style={{ padding: '20px' }}>
                            {company.company_logo && (
                                <img src={company.company_logo instanceof File ? URL.createObjectURL(company.company_logo) : company.company_logo} alt="Uploaded Preview" width="150" className="mt-0 mx-auto mb-5 block shadow-2" />
                            )}
                            <FileUpload
                                mode="basic"
                                accept="image/*"
                                onSelect={(e) =>
                                    setCompany((prevCompany) => ({
                                        ...prevCompany,
                                        company_logo: e.files[0]
                                    }))
                                }
                                style={{ textAlign: 'center', marginBottom: '10px' }}
                            />

                            <div className="field">
                                <label htmlFor="name" style={{ fontWeight: 'bold' }}>
                                    {t('COMPANY.FORM.INPUT.COMPANYNAME')}
                                </label>
                                <InputText
                                    id="company_name"
                                    value={company?.company_name}
                                    onChange={(e) =>
                                        setCompany((prevCompany) => ({
                                            ...prevCompany,
                                            company_name: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('COMPANY.FORM.PLACEHOLDER.COMPANYNAME')}
                                    className={classNames({
                                        'p-invalid': submitted && !company.company_name
                                    })}
                                />
                                {submitted && !company.company_name && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="formgrid grid">
                                <div className="field col">
                                    <label htmlFor="country" style={{ fontWeight: 'bold' }}>
                                        {t('COMPANY.FORM.INPUT.COUNTRYNAME')}
                                    </label>
                                    <Dropdown
                                        id="country"
                                        value={company.country}
                                        options={countries}
                                        onChange={(e) =>
                                            setCompany((prevCompany) => ({
                                                ...prevCompany,
                                                country: e.value
                                            }))
                                        }
                                        optionLabel="country_name"
                                        placeholder={t('COMPANY.FORM.PLACEHOLDER.COUNTRY')}
                                        className="w-full"
                                    />
                                    {submitted && !company.country && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col">
                                    <label htmlFor="telegram_chat_id" style={{ fontWeight: 'bold' }}>
                                        {t('COMPANY.FORM.INPUT.TELEGRAMID')}
                                    </label>
                                    <Dropdown
                                        id="telegram_chat_id"
                                        value={company.telegram_chat_id}
                                        options={telegramChatIds}
                                        onChange={(e) =>
                                            setCompany((prevCompany) => ({
                                                ...prevCompany,
                                                telegram_chat_id: e.value
                                            }))
                                        }
                                        optionLabel="group_name"
                                        placeholder={t('COMPANY.FORM.PLACEHOLDER.TELEGRAM_GROUP')}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                        <CustomFields
                            fields={parseInputFormSchema(company.input_form_schema)}
                            onFieldsChange={(updatedFields) =>
                                setCompany({
                                    ...company,
                                    input_form_schema: updatedFields // Keep as array for local state
                                })
                            }
                            submitted={submitted}
                        />{' '}
                    </Dialog>

                    <Dialog visible={deleteCompanyDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompanyDialogFooter} onHide={hideDeleteCompanyDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {company && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{company.company_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCompaniesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteCompaniesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {companies && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(CompanyPage);
