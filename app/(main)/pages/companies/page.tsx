/* eslint-disable @next/next/no-img-element */
'use client';

import { _addCompany, _deleteCompany, _deleteSelectedCompanies, _editCompany, _fetchCompanies, _updateCompanySettings } from '@/app/redux/actions/companyActions';
import { _fetchProviders } from '@/app/redux/actions/providerActions';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import i18n from '@/i18n';
import { Company, Country, Provider } from '@/types/interface';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { Button as UiButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileDrop } from '@/components/ui/file-drop';
import { NumberInput } from '@/components/ui/number-input';
import { PasswordInput } from '@/components/ui/password-input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { CustomFields } from '../../components/CustomFields';
import { customCellStyleImage } from '../../utilities/customRow';
import { parseInputFormSchema, stringifyInputFormSchema } from '../../utilities/parseInputFormSchema';
import { isRTL } from '../../utilities/rtlUtil';
const CompanyPage = () => {
    let emptyCompany: Company = {
        id: 0,
        company_name: '',
        company_code: '',
        company_logo: '',
        country_id: null,
        telegram_chat_id: null,
        deleted_at: '',
        created_at: '',
        updated_at: '',
        country: null,
        input_form_schema: [],
        is_robot_enabled: false,
        is_api_enabled: false,
        api_provider_id: null,
        api_key: null,
        display_order: 0
    };
    const [companyDialog, setCompanyDialog] = useState(false);
    const [deleteCompanyDialog, setDeleteCompanyDialog] = useState(false);
    const [deleteCompaniesDialog, setDeleteCompaniesDialog] = useState(false);
    const [company, setCompany] = useState<Company>(emptyCompany);
    const [selectedCompanies, setSelectedCompanies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const localSearchTerm = useDebouncedValue(searchInput, 350);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { companies, loading } = useSelector((state: any) => state.companyReducer);
    const { providers } = useSelector((state: any) => state.providerReducer);
    const { countries } = useSelector((state: any) => state.countriesReducer);
    const { telegramChatIds } = useSelector((state: any) => state.telegramReducer);
    const { t } = useTranslation();
    useEffect(() => {
        dispatch(_fetchCompanies());
        dispatch(_fetchCountries());
        dispatch(_fetchTelegramList());
        dispatch(_fetchProviders(1, ''));
    }, [dispatch]);
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
    const saveCompany = async () => {
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
            try { await dispatch(_editCompany(companyData, toast, t)); } catch { return; }
        } else {
            try { await dispatch(_addCompany(companyData, toast, t)); } catch { return; }
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
            input_form_schema: parseInputFormSchema(company.input_form_schema),
            is_robot_enabled: Boolean(company.is_robot_enabled),
            is_api_enabled: Boolean(company.is_api_enabled),
            api_provider_id: company.api_provider_id == null ? null : Number(company.api_provider_id),
            api_key: null, // Credential is hidden by Laravel; never prefill a secret.
            display_order: Number(company.display_order ?? 0)
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
    // Client-side filtering of records already fetched, no request per keystroke.
    const filteredCompanies = useMemo(() => {
        const search = localSearchTerm.trim().toLocaleLowerCase();
        const list: Company[] = Array.isArray(companies) ? companies : [];
        const sorted = [...list].sort((a, b) =>
            Number(a.display_order ?? 0) - Number(b.display_order ?? 0) || a.id - b.id
        );
        if (!search) return sorted;
        return sorted.filter(item => {
            const provider = (providers || []).find((p: Provider) => p.id === Number(item.api_provider_id));
            return [
                item.id, item.company_name, item.company_code,
                item.country?.country_name, item.telegram_chat_id?.group_name,
                item.display_order, provider?.name, provider?.code
            ].filter(value => value !== null && value !== undefined)
             .join(' ').toLocaleLowerCase().includes(search);
        });
    }, [companies, localSearchTerm, providers]);

    const [companyPriorityDrafts, setCompanyPriorityDrafts] = useState<Record<number, number>>({});
    const [companySavingRows, setCompanySavingRows] = useState<Record<number, boolean>>({});

    // Keep data intact; re-fetch after verified successful partial update.
    const updateInlineCompany = async (
        rowId: number,
        updates: Partial<Pick<Company, 'display_order' | 'is_robot_enabled' | 'is_api_enabled'>>
    ): Promise<boolean> => {
        if (companySavingRows[rowId]) return false;
        if (updates.display_order !== undefined &&
            (!Number.isInteger(updates.display_order) || updates.display_order < 0)) {
            toast.current?.show({ severity: 'error', summary: 'Invalid priority', detail: 'Enter a non-negative integer.', life: 3000 });
            return false;
        }
        setCompanySavingRows(prev => ({ ...prev, [rowId]: true }));
        try {
            await dispatch(_updateCompanySettings(rowId, updates));
            await dispatch(_fetchCompanies());
            toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Company setting updated.', life: 2500 });
            return true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Company update failed.';
            toast.current?.show({ severity: 'error', summary: 'Update failed', detail: message, life: 4000 });
            return false;
        } finally {
            setCompanySavingRows(prev => ({ ...prev, [rowId]: false }));
        }
    };

    const companyPriorityBody = (row: Company) => {
        const original = Number(row.display_order ?? 0);
        const edited = companyPriorityDrafts[row.id] ?? original;
        const saving = Boolean(companySavingRows[row.id]);
        return <div className="flex align-items-center gap-2" style={{ minWidth: 130 }}>
            <NumberInput
                value={edited}
                min={0}
                allowNull={false}
                disabled={saving}
                className="w-[4.5rem] text-center"
                onValueChange={(v) => setCompanyPriorityDrafts((prev) => ({ ...prev, [row.id]: v ?? 0 }))}
            />
            <Button
                type="button"
                icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                text
                rounded
                severity="success"
                tooltip="Save priority"
                disabled={saving || edited === original}
                onClick={async () => {
                    const ok = await updateInlineCompany(row.id, { display_order: edited });
                    if (ok) setCompanyPriorityDrafts(prev => {
                        const next = { ...prev };
                        delete next[row.id];
                        return next;
                    });
                }}
            />
        </div>;
    };

    const companyRobotBody = (row: Company) => (
        <Switch
            checked={Boolean(row.is_robot_enabled)}
            disabled={Boolean(companySavingRows[row.id])}
            onCheckedChange={(v) => void updateInlineCompany(row.id, { is_robot_enabled: v })}
        />
    );

    const companyApiBody = (row: Company) => (
        <Switch
            checked={Boolean(row.is_api_enabled)}
            disabled={Boolean(companySavingRows[row.id])}
            onCheckedChange={(v) => void updateInlineCompany(row.id, { is_api_enabled: v })}
        />
    );

    const companyProviderBody = (row: Company) => {
        const provider = (providers || []).find((p: Provider) => p.id === Number(row.api_provider_id));
        return provider?.name || (row.api_provider_id ? `Provider #${row.api_provider_id}` : '—');
    };

    const nameBodyTemplate = (rowData: Company) => {
        return (
            <>
                <span className="p-column-title">Company Name</span>
                {rowData.company_name}
            </>
        );
    };
    const codeBodyTemplate = (rowData: Company) => {
        return (
            <>
                <span className="p-column-title">Company Code</span>
                {rowData.company_code}
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
    const actionBodyTemplate = (rowData: Company) => (
        <RowActions
            items={[
                {
                    label: t('TABLE.GENERAL.EDIT'),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editCompany(rowData)
                },
                {
                    label: t('APP.GENERAL.DELETE'),
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => confirmDeleteCompany(rowData),
                    danger: true,
                    separatorBefore: true
                }
            ]}
        />
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
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.COMPANY')}
                description="مدیریت شرکت‌ها، لوگو، کشور و تنظیمات API"
                loading={loading}
                actions={
                    <UiButton type="button" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('COMPANY.TABLE.CREATECOMPANY')}
                    </UiButton>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('COMPANY.TABLE.SEARCHCOMPANY')}
                    />
                }
            >
                    <DataTable
                        ref={dt}
                        value={filteredCompanies}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedCompanies(e.value as any)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        size="small"
                        className="datatable-responsive"
                        paginatorTemplate={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        responsiveLayout="scroll"
                    >
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="company_name"
                            header={t('COMPANY.TABLE.COLUMN.COMPANYNAME')}
                            body={nameBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="company_code"
                            header={t('COMPANY_CODE')}
                            body={codeBodyTemplate}
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
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('TABLE.GENERAL.ACTION')}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '5rem' }}
                            bodyStyle={{ width: '5rem' }}
                        ></Column>
                                            <Column header="Priority" body={companyPriorityBody} style={{ minWidth: '135px' }} />
                        <Column header="Robot" body={companyRobotBody} style={{ minWidth: '80px' }} />
                        <Column header="API" body={companyApiBody} style={{ minWidth: '80px' }} />
                        <Column header="API Provider" body={companyProviderBody} style={{ minWidth: '130px' }} />
                        <Column header="API Key" body={(row: Company) => row.has_api_key ? 'Configured' : '—'} />
</DataTable>
            </ListPage>
                    <FormSheet
                        open={companyDialog}
                        onOpenChange={(open) => {
                            if (!open) hideDialog();
                        }}
                        title={t('COMPANY.DETAILS')}
                        description={company.id ? 'ویرایش اطلاعات شرکت' : 'ثبت شرکت جدید'}
                        size="xl"
                        side="left"
                        footer={
                            <FormActions
                                onCancel={hideDialog}
                                onSubmit={saveCompany}
                                cancelLabel={t('APP.GENERAL.CANCEL')}
                                submitLabel={t('FORM.GENERAL.SUBMIT')}
                            />
                        }
                    >
                        <FormSection title="اطلاعات پایه" description="نام، کد و لوگوی شرکت">
                            <FormField label={t('COMPANY.TABLE.COLUMN.LOGO')} fullWidth>
                                <FileDrop
                                    value={company.company_logo instanceof File ? company.company_logo : null}
                                    previewUrl={
                                        typeof company.company_logo === 'string' && company.company_logo
                                            ? company.company_logo
                                            : null
                                    }
                                    onChange={(file) =>
                                        setCompany((prevCompany) => ({
                                            ...prevCompany,
                                            company_logo: file ?? (prevCompany.company_logo instanceof File ? '' : prevCompany.company_logo)
                                        }))
                                    }
                                />
                            </FormField>
                            <FormField
                                label={t('COMPANY.FORM.INPUT.COMPANYNAME')}
                                required
                                error={submitted && !company.company_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Input
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
                                    className={cn('w-full', submitted && !company.company_name && 'border-rose-300')}
                                />
                            </FormField>
                            <FormField
                                label={t('COMPANY_CODE')}
                                required
                                error={submitted && !company.company_code ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Input
                                    id="company_code"
                                    value={company?.company_code}
                                    onChange={(e) =>
                                        setCompany((prevCompany) => ({
                                            ...prevCompany,
                                            company_code: e.target.value
                                        }))
                                    }
                                    required
                                    placeholder={t('COMPANY_CODE_PLACEHOLDER')}
                                    className={cn('w-full', submitted && !company.company_code && 'border-rose-300')}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection title="کشور و تلگرام" description="کشور و گروه اطلاع‌رسانی">
                            <FormField
                                label={t('COMPANY.FORM.INPUT.COUNTRYNAME')}
                                required
                                error={submitted && !company.country ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <SearchSelect
                                    value={company.country}
                                    options={countries || []}
                                    onChange={(selected) =>
                                        setCompany((prevCompany) => ({
                                            ...prevCompany,
                                            country: selected
                                        }))
                                    }
                                    optionLabel="country_name"
                                    placeholder={t('COMPANY.FORM.PLACEHOLDER.COUNTRY')}
                                    error={submitted && !company.country}
                                    returnFullObject
                                />
                            </FormField>
                            <FormField label={t('COMPANY.FORM.INPUT.TELEGRAMID')}>
                                <SearchSelect
                                    value={company.telegram_chat_id}
                                    options={telegramChatIds || []}
                                    onChange={(selected) =>
                                        setCompany((prevCompany) => ({
                                            ...prevCompany,
                                            telegram_chat_id: selected
                                        }))
                                    }
                                    optionLabel="group_name"
                                    placeholder={t('COMPANY.FORM.PLACEHOLDER.TELEGRAM_GROUP')}
                                    returnFullObject
                                    showClear
                                />
                            </FormField>
                        </FormSection>

                        <FormSection title="تنظیمات API" description="ربات، API و ارائه‌دهنده">
                            <FormField label="ربات فعال">
                                <Switch
                                    id="company_robot_enabled"
                                    checked={Boolean(company.is_robot_enabled)}
                                    onCheckedChange={(v) => setCompany((prev) => ({ ...prev, is_robot_enabled: v }))}
                                />
                            </FormField>
                            <FormField label="API فعال">
                                <Switch
                                    id="company_api_enabled"
                                    checked={Boolean(company.is_api_enabled)}
                                    onCheckedChange={(v) => setCompany((prev) => ({ ...prev, is_api_enabled: v }))}
                                />
                            </FormField>
                            <FormField label="ارائه‌دهنده API (اختیاری)">
                                <SearchSelect
                                    value={
                                        (providers || []).find(
                                            (provider: Provider) => provider.id === company.api_provider_id
                                        ) || null
                                    }
                                    options={providers || []}
                                    onChange={(selected) =>
                                        setCompany((prev) => ({ ...prev, api_provider_id: selected?.id ?? null }))
                                    }
                                    optionLabel="name"
                                    placeholder="انتخاب ارائه‌دهنده"
                                    showClear
                                    returnFullObject
                                    itemTemplate={(provider: Provider) => (
                                        <div>
                                            <div className="text-sm font-semibold">{provider.name}</div>
                                            <div className="text-xs text-muted-foreground">{provider.code}</div>
                                        </div>
                                    )}
                                />
                            </FormField>
                            <FormField
                                label="کلید API (اختیاری)"
                                hint={company.id !== 0 ? 'برای حفظ کلید فعلی خالی بگذارید.' : undefined}
                            >
                                <PasswordInput
                                    id="company_api_key"
                                    value={company.api_key ?? ''}
                                    onChange={(e) => setCompany((prev) => ({ ...prev, api_key: e.target.value }))}
                                    placeholder={company.id ? 'خالی = بدون تغییر' : 'کلید API را وارد کنید'}
                                    className="w-full"
                                    autoComplete="new-password"
                                />
                            </FormField>
                        </FormSection>

                        {parseInputFormSchema(company.input_form_schema).length > 0 ? (
                            <FormSection title="فیلدهای سفارشی" description="فیلدهای فرم ورودی شرکت">
                                <div className="sm:col-span-2">
                                    <CustomFields
                                        fields={parseInputFormSchema(company.input_form_schema)}
                                        onFieldsChange={(updatedFields) =>
                                            setCompany({
                                                ...company,
                                                input_form_schema: updatedFields
                                            })
                                        }
                                        submitted={submitted}
                                    />
                                </div>
                            </FormSection>
                        ) : (
                            <div className="sm:col-span-2">
                                <CustomFields
                                    fields={parseInputFormSchema(company.input_form_schema)}
                                    onFieldsChange={(updatedFields) =>
                                        setCompany({
                                            ...company,
                                            input_form_schema: updatedFields
                                        })
                                    }
                                    submitted={submitted}
                                />
                            </div>
                        )}
                    </FormSheet>
                    <Dialog visible={deleteCompanyDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompanyDialogFooter} onHide={hideDeleteCompanyDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {company && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{company.company_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>
                    <Dialog visible={deleteCompaniesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteCompaniesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {companies && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                        </div>
                    </Dialog>
        </>
    );
};
export default withAuth(CompanyPage);
