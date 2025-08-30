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
import { Language } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addLanguage, _deleteLanguage, _editLanguage, _fetchLanguages } from '@/app/redux/actions/languageActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const LanguagePage = () => {
    let emptyLanguage: Language = {
        id: 0,
        language_name: '',
        language_code: '',
        direction: 'ltr',
        deleted_at: '',
        created_at: '',
        updated_at: ''
    };

    const [languageDialog, setLanguageDialog] = useState(false);
    const [deleteLanguageDialog, setDeleteLanguageDialog] = useState(false);
    const [deleteLanguagesDialog, setDeleteLanguagesDialog] = useState(false);
    const [language, setLanguage] = useState<Language>(emptyLanguage);
    const [selectedCompanies, setSelectedLanguage] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { languages, loading } = useSelector((state: any) => state.languageReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchLanguages());
    }, [dispatch]);

    const openNew = () => {
        setLanguage(emptyLanguage);
        setSubmitted(false);
        setLanguageDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setLanguageDialog(false);
    };

    const hideDeleteLanguageDialog = () => {
        setDeleteLanguageDialog(false);
    };

    const hideDeleteLanguagesDialog = () => {
        setDeleteLanguagesDialog(false);
    };

    const saveLanguage = () => {
        setSubmitted(true);

        if (!language.language_name || !language.language_code) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        if (language.id && language.id !== 0) {
            dispatch(_editLanguage(language.id, language, toast, t));
        } else {
            dispatch(_addLanguage(language, toast, t));
        }

        setLanguageDialog(false);
        setLanguage(emptyLanguage);
        setSubmitted(false);
    };

    const editLanguage = (language: Language) => {
        setLanguage({ ...language });

        setLanguageDialog(true);
    };

    const confirmDeleteLanguage = (language: Language) => {
        setLanguage(language);
        setDeleteLanguageDialog(true);
    };

    const deleteLanguage = () => {
        if (!language?.id) {
            console.error('Language  ID is undefined.');
            return;
        }
        dispatch(_deleteLanguage(language?.id, toast, t));
        setDeleteLanguageDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteLanguagesDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('LANGUAGE.TABLE.CREATELANGUAGE')}
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
                        disabled={!selectedCompanies || !(selectedCompanies as any).length}
                    /> */}
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

    const languageCodeBodyTemplate = (rowData: Language) => {
        return (
            <>
                <span className="p-column-title">Language Code</span>
                {rowData.language_code}
            </>
        );
    };

    const languageNameBodyTemplate = (rowData: Language) => {
        return (
            <>
                <span className="p-column-title">Language Name</span>
                {rowData.language_name}
            </>
        );
    };

    const directionBodyTemplate = (rowData: Language) => {
        return (
            <>
                <span className="p-column-title">Direction</span>
                {rowData.direction}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Language) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editLanguage(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteLanguage(rowData)} />
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

    const languageDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveLanguage} />
        </>
    );
    const deleteLanguageDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideDeleteLanguageDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteLanguage} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteLanguagesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={languages}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedLanguage(e.value as any)}
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
                            field="name"
                            header={t('LANGUAGE.TABLE.COLUMN.LANGUAGENAME')}
                            sortable
                            body={languageNameBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="language_code"
                            header={t('LANGUAGE.TABLE.COLUMN.LANGUAGECODE')}
                            body={languageCodeBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="direction"
                            header={t('LANGUAGE.TABLE.COLUMN.DIRECTION')}
                            sortable
                            body={directionBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={languageDialog} style={{ width: '700px', padding: '5px' }} header={t('LANGUAGE.DETAILS')} modal className="p-fluid" footer={languageDialogFooter} onHide={hideDialog}>
                        <div className="card" style={{ padding: '40px' }}>
                            <div className="field">
                                <label htmlFor="language_name" style={{ fontWeight: 'bold' }}>
                                    {t('LANGUAGE.FORM.INPUT.LANGUAGENAME')}
                                </label>
                                <InputText
                                    id="language_name"
                                    value={language.language_name}
                                    onChange={(e) =>
                                        setLanguage((prevLanguage) => ({
                                            ...prevLanguage,
                                            language_name: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('LANGUAGE.FORM.PLACEHOLDER.LANGUAGENAME')}
                                    className={classNames({
                                        'p-invalid': submitted && !language.language_name
                                    })}
                                />
                                {submitted && !language.language_name && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="language_code" style={{ fontWeight: 'bold' }}>
                                    {t('LANGUAGE.FORM.INPUT.LANGUAGECODE')}
                                </label>
                                <InputText
                                    id="language_code"
                                    value={language.language_code}
                                    onChange={(e) =>
                                        setLanguage((prevLanguage) => ({
                                            ...prevLanguage,
                                            language_code: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('LANGUAGE.FORM.PLACEHOLDER.LANGUAGECODE')}
                                    className={classNames({
                                        'p-invalid': submitted && !language.language_code
                                    })}
                                />
                                {submitted && !language.language_code && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="status" style={{ fontWeight: 'bold' }}>
                                    {t('LANGUAGE.TABLE.COLUMN.DIRECTION')}
                                </label>
                                <Dropdown
                                    id="direction"
                                    value={language.direction}
                                    options={[
                                        { label: 'Left to Right(ltr)', value: 'ltr' },
                                        { label: 'Right to Left(rtl)', value: 'rtl' }
                                    ]}
                                    onChange={(e) =>
                                        setLanguage((prev) => ({
                                            ...prev,
                                            direction: e.value
                                        }))
                                    }
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder={t('LANGUAGE.TABLE.COLUMN.DIRECTION')}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteLanguageDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteLanguageDialogFooter} onHide={hideDeleteLanguageDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {language && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{language.language_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteLanguagesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteLanguagesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {language && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(LanguagePage);
