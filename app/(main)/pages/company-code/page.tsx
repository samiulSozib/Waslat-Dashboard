/* eslint-disable @next/next/no-img-element */
'use client';
import { _fetchCompanies } from '@/app/redux/actions/companyActions';
import { _addCompanyCode, _deleteCompanyCode, _editCompanyCode, _fetchCompanyCodes } from '@/app/redux/actions/companyCodeActions';
import { AppDispatch } from '@/app/redux/store';
import { FilterBar } from '@/components/admin/filter-bar';
import { ListPage } from '@/components/admin/list-page';
import { RowActions } from '@/components/admin/row-actions';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { Input } from '@/components/ui/input';
import { Button as UiButton } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Company, CompanyCode } from '@/types/interface';
import { cn } from '@/lib/utils';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
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
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { companyCodes, loading } = useSelector((state: any) => state.companyCodeReducer);
    const { companies } = useSelector((state: any) => state.companyReducer);
    const { t } = useTranslation();
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [refreshing, setRefreshing] = useState(false);

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

        setCompanyCode({ ...companyCode, company: matchingCompany });

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



    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchCompanyCodes(searchTag) as any);
        setRefreshing(false);
    };

    const getRowActions = (row: CompanyCode) => [
        { label: t('TABLE.GENERAL.EDIT'), icon: <Pencil className="h-4 w-4" />, onClick: () => editCompanyCode(row) },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            danger: true,
            separatorBefore: true,
            onClick: () => confirmDeleteCompany(row)
        }
    ];

    const deleteCompanyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCompanyCodeDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteCompanyCode} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteCompanyCodesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
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
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.COMPANYCODE', { defaultValue: 'کد شرکت' })}
                description={t('COMPANYCODE.PAGE.DESCRIPTION', { defaultValue: 'رقم رزرو شده برای هر شرکت' })}
                loading={loading}
                actions={
                    <>
                        <UiButton variant="default" size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('COMPANYCODE.TABLE.CREATECOMPANYCODE')}
                        </UiButton>
                        <UiButton variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </UiButton>
                    </>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو...' })}
                    />
                }
                footer={
                    <div className="border-t border-emerald-100 px-3 py-2 text-xs text-muted-foreground">
                        {t('TOTAL', { defaultValue: 'مجموع' })}: {(companyCodes || []).length}
                    </div>
                }
            >
                <table className="w-full min-w-[800px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('COMPANYCODE.TABLE.COLUMN.RESERVEDDIGIT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('COMPANYCODE.TABLE.COLUMN.COUNTRYNAME')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('COMPANYCODE.TABLE.COLUMN.COMPANYNAME')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('COMPANYCODE.TABLE.COLUMN.COUNTRYCODE')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(companyCodes || []).length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (companyCodes || []).map((row: CompanyCode) => (
                                <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                    <td className="px-2 py-1.5 align-middle">
                                        <RowActions items={getRowActions(row)} />
                                    </td>
                                    <td className="px-2 py-1.5 font-mono font-semibold tabular-nums">{row.reserved_digit || '—'}</td>
                                    <td className="px-2 py-1.5">{row.company?.country?.country_name || '—'}</td>
                                    <td className="px-2 py-1.5 font-medium">{row.company?.company_name || '—'}</td>
                                    <td className="px-2 py-1.5 tabular-nums text-muted-foreground">{row.company?.country?.country_telecom_code || '—'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </ListPage>

            <FormSheet
                open={companyCodeDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('MENU.COMPANYCODE')}
                description={companyCode.id ? 'ویرایش کد شرکت' : 'ثبت کد شرکت جدید'}
                size="xl"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveCompanyCode}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('MENU.COMPANYCODE', { defaultValue: 'کد شرکت' })} description="رقم رزرو و شرکت مرتبط">
                    <FormField
                        label={t('COMPANYCODE.FORM.INPUT.RESERVEDDIGIT')}
                        required
                        error={submitted && !companyCode?.reserved_digit ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
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
                            className={cn('w-full', submitted && !companyCode.reserved_digit && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('COMPANYCODE.FORM.INPUT.COMPANYNAME')}
                        required
                        error={submitted && !companyCode?.company_id ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={companyCode.company}
                            options={companies || []}
                            onChange={(selected) =>
                                setCompanyCode((prevCompanyCode) => ({
                                    ...prevCompanyCode,
                                    company: selected
                                }))
                            }
                            optionLabel="company_name"
                            placeholder={t('COMPANYCODE.FORM.PLACEHOLDER.COMPANYNAME')}
                            error={submitted && !companyCode?.company_id}
                            returnFullObject
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteCompanyCodeDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompanyDialogFooter} onHide={hideDeleteCompanyCodeDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {companyCode && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{companyCode.reserved_digit}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteCompanyCodesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteCompanyCodesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {companyCodes && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                        </div>
                    </Dialog>
        </div>
    );
};

export default withAuth(CompanyCodePage);
