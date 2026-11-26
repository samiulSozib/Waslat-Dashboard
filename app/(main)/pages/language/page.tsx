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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Language } from '@/types/interface';
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

    const actionBodyTemplate = (rowData: Language) => (
        <RowActions
            items={[
                {
                    label: t('TABLE.GENERAL.EDIT'),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editLanguage(rowData)
                },
                {
                    label: t('TABLE.GENERAL.DELETE'),
                    icon: <Trash2 className="h-4 w-4" />,
                    danger: true,
                    separatorBefore: true,
                    onClick: () => confirmDeleteLanguage(rowData)
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

    const deleteLanguageDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideDeleteLanguageDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteLanguage} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteLanguagesDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.LANGUAGE', { defaultValue: 'زبان' })}
                description="مدیریت زبان‌ها و جهت نوشتار"
                loading={loading}
                actions={
                    <Button type="button" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('LANGUAGE.TABLE.CREATELANGUAGE')}
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
                    value={languages}
                    selection={selectedCompanies}
                    onSelectionChange={(e) => setSelectedLanguage(e.value as any)}
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
                    style={{ direction: isRTL() ? 'rtl' : 'ltr',fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                    globalFilter={globalFilter}
                    responsiveLayout="scroll"
                >
                        <Column
                            header={t('TABLE.GENERAL.ACTION')}
                            body={actionBodyTemplate}
                            headerStyle={{ width: '4.5rem' }}
                            style={{ ...customCellStyle, textAlign: 'start' }}
                        />
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
                    </DataTable>
            </ListPage>

            <FormSheet
                open={languageDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('LANGUAGE.DETAILS')}
                description={language.id ? 'ویرایش زبان' : 'ثبت زبان جدید'}
                size="lg"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveLanguage}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('LANGUAGE.DETAILS')} description="نام، کد و جهت نوشتار">
                    <FormField
                        label={t('LANGUAGE.FORM.INPUT.LANGUAGENAME')}
                        required
                        error={submitted && !language.language_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
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
                            className={cn('w-full', submitted && !language.language_name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('LANGUAGE.FORM.INPUT.LANGUAGECODE')}
                        required
                        error={submitted && !language.language_code ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="language_code"
                            value={language.language_code}
                            onChange={(e) =>
                                setLanguage((prevLanguage) => ({
                                    ...prevLanguage,
                                    language_code: e.target.value
                                }))
                            }
                            required
                            placeholder={t('LANGUAGE.FORM.PLACEHOLDER.LANGUAGECODE')}
                            className={cn('w-full', submitted && !language.language_code && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField label={t('LANGUAGE.TABLE.COLUMN.DIRECTION')}>
                        <Select
                            value={language.direction || undefined}
                            onValueChange={(v) =>
                                setLanguage((prev) => ({
                                    ...prev,
                                    direction: v as 'ltr' | 'rtl'
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('LANGUAGE.TABLE.COLUMN.DIRECTION')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ltr">Left to Right (ltr)</SelectItem>
                                <SelectItem value="rtl">Right to Left (rtl)</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteLanguageDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteLanguageDialogFooter} onHide={hideDeleteLanguageDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {language && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{language.language_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteLanguagesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteLanguagesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {language && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
        </>
    );
};

export default withAuth(LanguagePage);
