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
import { Country, Currency } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addCountry, _deleteCountry, _editCountry, _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchLanguages } from '@/app/redux/actions/languageActions';
import { FileUpload } from 'primereact/fileupload';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const CountryPage = () => {
    let emptyCountry: Country = {
        id: 0,
        country_name: '',
        country_flag_image_url: '',
        language_id: 0,
        country_telecom_code: '',
        phone_number_length: '',
        deleted_at: '',
        created_at: '',
        updated_at: '',
        currency: null,
        language: null,
        currency_id: 0
    };

    const [countryDialog, setCountryDialog] = useState(false);
    const [deleteCountryDialog, setDeleteCountryDialog] = useState(false);
    const [deleteCountrysDialog, setDeleteCountrysDialog] = useState(false);
    const [country, setCountry] = useState<Country>(emptyCountry);
    const [selectedCountries, setSelectedCountry] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { countries, loading } = useSelector((state: any) => state.countriesReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { languages } = useSelector((state: any) => state.languageReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchCountries());
        dispatch(_fetchCurrencies());
        dispatch(_fetchLanguages());
    }, [dispatch]);

    const openNew = () => {
        setCountry(emptyCountry);
        setSubmitted(false);
        setCountryDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setCountryDialog(false);
        setCountry(emptyCountry);
    };

    const hideDeleteCountryDialog = () => {
        setDeleteCountryDialog(false);
        setCountry(emptyCountry);
    };

    const hideDeleteCountrysDialog = () => {
        setDeleteCountrysDialog(false);
        setCountry(emptyCountry);
    };

    const saveCountry = () => {
        setSubmitted(true);
        if (!country.country_name || !country.country_telecom_code || !country.phone_number_length || !country.currency || !country.language) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (country.id && country.id !== 0) {
            dispatch(_editCountry(country.id, country, toast, t));
        } else {
            dispatch(_addCountry(country, toast, t));
        }

        setCountryDialog(false);
        setCountry(emptyCountry);
        setSubmitted(false);
    };

    const editCountry = (country: Country) => {
        setCountry({ ...country });

        setCountryDialog(true);
    };

    const confirmDeleteCountry = (country: Country) => {
        setCountry(country);
        setDeleteCountryDialog(true);
    };

    const deleteCountry = () => {
        if (!country?.id) {
            console.error('Country  ID is undefined.');
            return;
        }
        dispatch(_deleteCountry(country?.id, toast, t));
        setDeleteCountryDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteCountrysDialog(true);
    };

    const rightToolbarTemplate = () => {
        const hasSelectedCountries = selectedCountries && (selectedCountries as any).length > 0;

        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                        <Button
                            style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                            label={t('COUNTRY.TABLE.CREATECOUNTRY')}
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

    const imageBodyTemplate = (rowData: Country) => {
        return (
            <>
                <span className="p-column-title">Image</span>
                <img src={`${rowData.country_flag_image_url}`} alt={rowData.country_name?.toString()} className="shadow-2" width="60" />
            </>
        );
    };

    const countryNameBodyTemplate = (rowData: Country) => {
        return (
            <>
                <span className="p-column-title">Country</span>
                {rowData.country_name}
            </>
        );
    };

    const countryCodeBodyTemplate = (rowData: Country) => {
        return (
            <>
                <span className="p-column-title">Country Code</span>
                {rowData.country_telecom_code}
            </>
        );
    };

    const currencyBodyTemplate = (rowData: Country) => {
        return (
            <>
                <span className="p-column-title">Currency</span>
                {rowData.currency?.name}
            </>
        );
    };

    const languageBodyTemplate = (rowData: Country) => {
        return (
            <>
                <span className="p-column-title">Language</span>
                {rowData.language?.language_name}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Country) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editCountry(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteCountry(rowData)} />
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

    const countryDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveCountry} />
        </>
    );
    const deleteCountryDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCountryDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteCountry} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCountrysDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    useEffect(() => {
        if (country.currency_id) {
            const selectedCurrency = currencies.find((currency: Currency) => currency.id === country.currency_id);

            if (selectedCurrency) {
                setCountry((prev) => ({
                    ...prev,
                    currency: selectedCurrency // Update with the selected company object
                }));
            }
        }
    }, [country.currency_id, currencies]);

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={countries}
                        selection={selectedCountries}
                        onSelectionChange={(e) => setSelectedCountry(e.value as any)}
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
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="" header=""  body={imageBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="name"
                            header={t('COUNTRY.TABLE.COLUMN.COUNTRYTELECOMCODE')}
                            
                            body={countryNameBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="country_code"
                            header={t('COUNTRY.TABLE.COLUMN.COUNTRYTELECOMCODE')}
                            body={countryCodeBodyTemplate}
                            
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="currency"
                            header={t('COUNTRY.TABLE.COLUMN.CURRENCY')}
                            body={currencyBodyTemplate}
                            
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="language"
                            header={t('COUNTRY.TABLE.COLUMN.LANGUAGE')}
                            body={languageBodyTemplate}
                            
                        ></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={countryDialog} style={{ width: '700px', padding: '5px' }} header={t('COUNTRY.DETAILS')} modal className="p-fluid" footer={countryDialogFooter} onHide={hideDialog}>
                        <div className="card" style={{ padding: '40px' }}>
                            {country.country_flag_image_url && (
                                <img
                                    src={
                                        country.country_flag_image_url instanceof File
                                            ? URL.createObjectURL(country.country_flag_image_url) // Temporary preview for file
                                            : country.country_flag_image_url // Direct URL for existing logo
                                    }
                                    alt="Uploaded Preview"
                                    width="150"
                                    className="mt-0 mx-auto mb-5 block shadow-2"
                                />
                            )}
                            <FileUpload
                                mode="basic"
                                name="company_logo"
                                accept="image/*"
                                customUpload
                                onSelect={(e) =>
                                    setCountry((prev) => ({
                                        ...prev,
                                        country_flag_image_url: e.files[0]
                                    }))
                                }
                                style={{ textAlign: 'center', marginBottom: '10px' }}
                            />
                            <div className="field">
                                <label htmlFor="country_name" style={{ fontWeight: 'bold' }}>
                                    {t('COUNTRY.FORM.INPUT.COUNTRYNAME')}
                                </label>
                                <InputText
                                    id="country_name"
                                    value={country.country_name}
                                    onChange={(e) =>
                                        setCountry((prevCountry) => ({
                                            ...prevCountry,
                                            country_name: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('COUNTRY.FORM.PLACEHOLDER.COUNTRYNAME')}
                                    className={classNames({
                                        'p-invalid': submitted && !country.country_name
                                    })}
                                />
                                {submitted && !country.country_name && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="country_telecom_code" style={{ fontWeight: 'bold' }}>
                                    {t('COUNTRY.FORM.INPUT.COUNTRYTELECOMCODE')}
                                </label>
                                <InputText
                                    id="country_telecom_code"
                                    value={country.country_telecom_code}
                                    onChange={(e) =>
                                        setCountry((prevCountry) => ({
                                            ...prevCountry,
                                            country_telecom_code: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('COUNTRY.FORM.PLACEHOLDER.COUNTRYTELECOMCODE')}
                                    className={classNames({
                                        'p-invalid': submitted && !country.country_telecom_code
                                    })}
                                />
                                {submitted && !country.country_telecom_code && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="phone_number_length" style={{ fontWeight: 'bold' }}>
                                    {t('COUNTRY.FORM.INPUT.PHONENUMBERLENGTH')}
                                </label>
                                <InputText
                                    id="phone_number_length"
                                    value={country.phone_number_length}
                                    onChange={(e) =>
                                        setCountry((prevCountry) => ({
                                            ...prevCountry,
                                            phone_number_length: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('COUNTRY.FORM.PLACEHOLDER.PHONENUMBERLENGTH')}
                                    className={classNames({
                                        'p-invalid': submitted && !country.phone_number_length
                                    })}
                                />
                                {submitted && !country.phone_number_length && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field col">
                                <label htmlFor="currency" style={{ fontWeight: 'bold' }}>
                                    {t('COUNTRY.FORM.INPUT.CURRENCY')}
                                </label>
                                <Dropdown
                                    id="currency"
                                    value={country.currency}
                                    options={currencies}
                                    onChange={(e) =>
                                        setCountry((perv) => ({
                                            ...perv,
                                            currency: e.value
                                        }))
                                    }
                                    optionLabel="name"
                                    // optionValue='id'
                                    placeholder={t('COUNTRY.FORM.INPUT.CURRENCY')}
                                    className="w-full"
                                />
                                {submitted && !country.currency && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field col">
                                <label htmlFor="language" style={{ fontWeight: 'bold' }}>
                                    {t('COUNTRY.FORM.INPUT.LANGUAGE')}
                                </label>
                                <Dropdown
                                    id="language"
                                    value={country.language}
                                    options={languages}
                                    onChange={(e) =>
                                        setCountry((perv) => ({
                                            ...perv,
                                            language: e.value
                                        }))
                                    }
                                    optionLabel="language_name"
                                    // optionValue='id'
                                    placeholder={t('COUNTRY.FORM.INPUT.LANGUAGE')}
                                    className="w-full"
                                />
                                {submitted && !country.language && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCountryDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCountryDialogFooter} onHide={hideDeleteCountryDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {country && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{country.country_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCountrysDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteCountrysDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {country && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected countries?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(CountryPage);
