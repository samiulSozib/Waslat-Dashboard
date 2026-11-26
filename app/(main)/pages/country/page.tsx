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
import { FileDrop } from '@/components/ui/file-drop';
import { SearchSelect } from '@/components/admin/search-select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Country, Currency } from '@/types/interface';
import { _addCountry, _deleteCountry, _editCountry, _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchLanguages } from '@/app/redux/actions/languageActions';
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

    const actionBodyTemplate = (rowData: Country) => (
        <RowActions
            items={[
                {
                    label: t('TABLE.GENERAL.EDIT'),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editCountry(rowData)
                },
                {
                    label: t('TABLE.GENERAL.DELETE'),
                    icon: <Trash2 className="h-4 w-4" />,
                    danger: true,
                    separatorBefore: true,
                    onClick: () => confirmDeleteCountry(rowData)
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

    const deleteCountryDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCountryDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteCountry} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCountrysDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
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
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.COUNTRY', { defaultValue: 'کشور' })}
                description="مدیریت کشورها، ارز و زبان پیش‌فرض"
                loading={loading}
                actions={
                    <Button type="button" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('COUNTRY.TABLE.CREATECOUNTRY')}
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
                    value={countries}
                    selection={selectedCountries}
                    onSelectionChange={(e) => setSelectedCountry(e.value as any)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    size="small"
                    className="datatable-responsive p-datatable-sm"
                    paginatorTemplate={
                        isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
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
                    </DataTable>
            </ListPage>

            <FormSheet
                open={countryDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('COUNTRY.DETAILS')}
                description={country.id && country.id !== 0 ? 'ویرایش کشور' : 'ثبت کشور جدید'}
                size="lg"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveCountry}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('COUNTRY.DETAILS')} description="پرچم و مشخصات کشور">
                    <FormField label="پرچم کشور" fullWidth>
                        <FileDrop
                            value={country.country_flag_image_url instanceof File ? country.country_flag_image_url : null}
                            previewUrl={
                                typeof country.country_flag_image_url === 'string' && country.country_flag_image_url
                                    ? country.country_flag_image_url
                                    : null
                            }
                            onChange={(file) =>
                                setCountry((prev) => ({
                                    ...prev,
                                    country_flag_image_url:
                                        file ??
                                        (prev.country_flag_image_url instanceof File ? '' : prev.country_flag_image_url)
                                }))
                            }
                            label={t('COUNTRY.FORM.FLAG_UPLOAD', { defaultValue: 'آپلود پرچم' })}
                        />
                    </FormField>
                    <FormField
                        label={t('COUNTRY.FORM.INPUT.COUNTRYNAME')}
                        required
                        error={submitted && !country.country_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
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
                            className={cn('w-full', submitted && !country.country_name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('COUNTRY.FORM.INPUT.COUNTRYTELECOMCODE')}
                        required
                        error={submitted && !country.country_telecom_code ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="country_telecom_code"
                            value={country.country_telecom_code}
                            onChange={(e) =>
                                setCountry((prevCountry) => ({
                                    ...prevCountry,
                                    country_telecom_code: e.target.value
                                }))
                            }
                            required
                            placeholder={t('COUNTRY.FORM.PLACEHOLDER.COUNTRYTELECOMCODE')}
                            className={cn('w-full', submitted && !country.country_telecom_code && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('COUNTRY.FORM.INPUT.PHONENUMBERLENGTH')}
                        required
                        error={submitted && !country.phone_number_length ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="phone_number_length"
                            value={country.phone_number_length}
                            onChange={(e) =>
                                setCountry((prevCountry) => ({
                                    ...prevCountry,
                                    phone_number_length: e.target.value
                                }))
                            }
                            required
                            placeholder={t('COUNTRY.FORM.PLACEHOLDER.PHONENUMBERLENGTH')}
                            className={cn('w-full', submitted && !country.phone_number_length && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('COUNTRY.FORM.INPUT.CURRENCY')}
                        required
                        error={submitted && !country.currency ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={country.currency}
                            options={currencies || []}
                            onChange={(selected) =>
                                setCountry((perv) => ({
                                    ...perv,
                                    currency: selected
                                }))
                            }
                            optionLabel="name"
                            placeholder={t('COUNTRY.FORM.INPUT.CURRENCY')}
                            error={submitted && !country.currency}
                            returnFullObject
                        />
                    </FormField>
                    <FormField
                        label={t('COUNTRY.FORM.INPUT.LANGUAGE')}
                        required
                        error={submitted && !country.language ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={country.language}
                            options={languages || []}
                            onChange={(selected) =>
                                setCountry((perv) => ({
                                    ...perv,
                                    language: selected
                                }))
                            }
                            optionLabel="language_name"
                            placeholder={t('COUNTRY.FORM.INPUT.LANGUAGE')}
                            error={submitted && !country.language}
                            returnFullObject
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

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
        </>
    );
};

export default withAuth(CountryPage);
