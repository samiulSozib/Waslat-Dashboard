/* eslint-disable @next/next/no-img-element */
'use client';
import { _fetchCompanies } from '@/app/redux/actions/companyActions';
import { _fetchProviders } from '@/app/redux/actions/providerActions';
import { _addService, _deleteSelectedServices, _deleteService, _editService, _fetchServiceList, _updateServiceSettings } from '@/app/redux/actions/serviceActions';
import { _fetchServiceCategories } from '@/app/redux/actions/serviceCategoryActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import i18n from '@/i18n';
import { Company, Service, Provider } from '@/types/interface';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { PasswordInput } from '@/components/ui/password-input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button as UiButton } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { CustomFields } from '../../components/CustomFields';
import { customCellStyleImage } from '../../utilities/customRow';
import { parseInputFormSchema, stringifyInputFormSchema } from '../../utilities/parseInputFormSchema';
import { isRTL } from '../../utilities/rtlUtil';
// This page can use the inquiry fields without changing unrelated global types.
// They should also be added to '@/types/interface' when that file is available.
type PackageInquiryMode = 'disabled' | 'inherit' | 'provider';
type ServiceWithInquiry = Service & {
    package_inquiry_mode?: PackageInquiryMode;
    package_inquiry_provider_id?: number | null;
};
const isActiveInquiryProvider = (provider: Provider): boolean => {
    const code = String(provider.code ?? '').trim().toLowerCase();
    const active = String(provider.is_active ?? '').trim().toLowerCase();
    return ['paystore', 'manshorpay'].includes(code)
        && (active === 'true' || active === '1');
};
const Services = () => {
    let emptyService: ServiceWithInquiry = {
        id: 0,
        service_category_id: 0,
        service_name: '',
        company_id: 0,
        deleted_at: '',
        created_at: '',
        updated_at: '',
        service_category: null,
        company: null,
        input_form_schema: [],
        telegram_chat_id: null,
        is_robot_enabled: false,
        is_api_enabled: false,
        api_provider_id: null,
        api_key: null,
        display_order: 0,
        package_inquiry_mode: 'disabled',
        package_inquiry_provider_id: null,
    };
    const [serviceDialog, setServiceDialog] = useState(false);
    const [deleteServiceDialog, setDeleteServiceDialog] = useState(false);
    const [deleteServicesDialog, setDeleteServicesDialog] = useState(false);
    const [service, setService] = useState<ServiceWithInquiry>(emptyService);
    const [selectedServices, setSelectedServices] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { companies } = useSelector((state: any) => state.companyReducer);
    const { services, loading } = useSelector((state: any) => state.serviceReducer);
    const { serviceCategories } = useSelector((state: any) => state.serviceCategoryReducer);
    const { telegramChatIds } = useSelector((state: any) => state.telegramReducer);
    const { providers } = useSelector((state: any) => state.providerReducer);
    const { t } = useTranslation();
    const inquiryProviderOptions = useMemo(() =>
        (Array.isArray(providers) ? providers : [])
            .filter((provider: Provider) => isActiveInquiryProvider(provider))
            .map((provider: Provider) => ({
                label: `${provider.name} (${provider.code})`,
                value: Number(provider.id)
            })),
        [providers]
    );
    const [searchInput, setSearchInput] = useState('');
    const localSearchTerm = useDebouncedValue(searchInput, 350);
    const [savingRows, setSavingRows] = useState<Record<number, boolean>>({});
    // Save only the changed setting. No unrelated secrets or fields are sent.
    const persistInlineSetting = async (
        id: number,
        field: 'display_order' | 'is_robot_enabled' | 'is_api_enabled',
        value: number | boolean
    ): Promise<boolean> => {
        if (savingRows[id]) return false;
        if (field === 'display_order' && (!Number.isInteger(value) || Number(value) < 0)) {
            toast.current?.show({ severity: 'error', summary: 'Invalid priority', detail: 'Enter a non-negative whole number.', life: 3500 });
            return false;
        }
        setSavingRows(prev => ({ ...prev, [id]: true }));
        try {
            await dispatch(_updateServiceSettings(id, { [field]: value }));
            // Update the list with backend-confirmed priority and ordering.
            await dispatch(_fetchServiceList(''));
            toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: 'Service setting saved', life: 2500 });
            return true;
        } catch (error: any) {
            toast.current?.show({
                severity: 'error', summary: t('ERROR'),
                detail: error?.response?.data?.message || error?.message || 'Unable to save setting', life: 3500
            });
            return false;
        } finally {
            setSavingRows(prev => ({ ...prev, [id]: false }));
        }
    };
    const [priorityDrafts, setPriorityDrafts] = useState<Record<number, number | null>>({});
    const priorityEditorBodyTemplate = (rowData: Service) => {
        const current = Number(rowData.display_order ?? 0);
        const value = Object.prototype.hasOwnProperty.call(priorityDrafts, rowData.id)
            ? priorityDrafts[rowData.id]
            : current;
        const saving = Boolean(savingRows[rowData.id]);
        const invalid = value === null || !Number.isInteger(value) || value < 0;
        const changed = !invalid && value !== current;
        return (
            <div className="flex align-items-center gap-2" style={{ minWidth: 125 }}>
                <NumberInput
                    value={value ?? 0}
                    min={0}
                    allowNull={false}
                    disabled={saving}
                    className="w-[3.75rem] text-center"
                    onValueChange={(v) => setPriorityDrafts((prev) => ({ ...prev, [rowData.id]: v ?? 0 }))}
                />
                <Button
                    type="button"
                    icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                    rounded text severity="success"
                    disabled={saving || invalid || !changed}
                    tooltip="Save priority"
                    onClick={async () => {
                        if (invalid || value === null) return;
                        const success = await persistInlineSetting(rowData.id, 'display_order', value);
                        if (success) {
                            setPriorityDrafts(prev => {
                                const next = { ...prev };
                                delete next[rowData.id];
                                return next;
                            });
                        }
                    }}
                />
            </div>
        );
    };
    const robotBodyTemplate = (rowData: Service) => (
        <Switch
            checked={Boolean(rowData.is_robot_enabled)}
            disabled={Boolean(savingRows[rowData.id])}
            onCheckedChange={(v) => void persistInlineSetting(rowData.id, 'is_robot_enabled', v)}
        />
    );
    const apiBodyTemplate = (rowData: Service) => (
        <Switch
            checked={Boolean(rowData.is_api_enabled)}
            disabled={Boolean(savingRows[rowData.id])}
            onCheckedChange={(v) => void persistInlineSetting(rowData.id, 'is_api_enabled', v)}
        />
    );
    const providerBodyTemplate = (rowData: Service) => {
        const provider = (providers || []).find((p: Provider) => p.id === Number(rowData.api_provider_id));
        return provider?.name || (rowData.api_provider_id ? `Provider #${rowData.api_provider_id}` : '—');
    };
    const inquiryModeBodyTemplate = (rowData: ServiceWithInquiry) => {
        const mode = rowData.package_inquiry_mode ?? 'disabled';
        if (mode === 'provider') return <Badge value="Provider" severity="success" />;
        if (mode === 'inherit') return <Badge value="Inherit" severity="info" />;
        return <span className="text-500">Disabled</span>;
    };
    const inquiryProviderBodyTemplate = (rowData: ServiceWithInquiry) => {
        const mode = rowData.package_inquiry_mode ?? 'disabled';
        if (mode === 'disabled') return <span className="text-500">—</span>;
        if (mode === 'inherit') return <span className="text-500">App Settings Default</span>;
        const providerId = rowData.package_inquiry_provider_id;
        if (providerId === null || providerId === undefined) return <span className="text-500">Not selected</span>;
        const provider = (Array.isArray(providers) ? providers : []).find(
            (p: Provider) => Number(p.id) === Number(providerId)
        );
        return provider ? `${provider.name} (#${provider.id})` : `Provider #${providerId}`;
    };
    useEffect(() => {
        dispatch(_fetchServiceList(''));
        dispatch(_fetchCompanies());
        dispatch(_fetchServiceCategories());
        dispatch(_fetchTelegramList());
        // Get up to 100 providers so the selection is not restricted to page one.
        dispatch(_fetchProviders(1, '', { per_page: 100 }));
    }, [dispatch]);
    const openNew = () => {
        setService(emptyService);
        setSubmitted(false);
        setServiceDialog(true);
    };
    const hideDialog = () => {
        setSubmitted(false);
        setServiceDialog(false);
        setService(emptyService);
    };
    const hideDeleteServiceDialog = () => {
        setDeleteServiceDialog(false);
        setService(emptyService);
    };
    const hideDeleteServicesDialog = () => {
        setDeleteServicesDialog(false);
        setService(emptyService);
    };
    const saveService = async () => {
        setSubmitted(true);
        if (!service.service_name || !service.company || !service.service_category) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        // Only an explicitly configured service can use a supplier inquiry.
        // Backend must independently validate provider status, code and country.
        if (service.package_inquiry_mode === 'provider'
            && (!service.package_inquiry_provider_id || !Number.isInteger(Number(service.package_inquiry_provider_id)))) {
            toast.current?.show({
                severity: 'error',
                summary: 'Package Inquiry',
                detail: 'Select an active package inquiry provider.',
                life: 3500
            });
            return;
        }
        // Validate custom fields
        const parsedFields = parseInputFormSchema(service.input_form_schema);
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
        const serviceData = {
            ...service,
            input_form_schema: stringifyInputFormSchema(parsedFields) // Stringify for API
        };
        const saved = service.id && service.id !== 0
            ? await dispatch(_editService(service.id, serviceData, toast, t))
            : await dispatch(_addService(serviceData, toast, t));
        // Keep the dialog open on validation errors and unsuccessful requests.
        if (!saved) return;
        await dispatch(_fetchServiceList(''));
        setServiceDialog(false);
        setService(emptyService);
        setSubmitted(false);
    };
    const editService = (service: ServiceWithInquiry) => {
        //console.log(service)
        const matchingCompany = companies.find((r: any) => r.id === service.company?.id);
        setService({
            ...service,
            company: matchingCompany,
            input_form_schema: parseInputFormSchema(service.input_form_schema),
            is_robot_enabled: Boolean(service.is_robot_enabled),
            is_api_enabled: Boolean(service.is_api_enabled),
            api_provider_id: service.api_provider_id == null ? null : Number(service.api_provider_id),
            api_key: null, // Existing secret is intentionally never loaded into the form.
            display_order: Number(service.display_order ?? 0),
            package_inquiry_mode: (['disabled', 'inherit', 'provider'] as string[]).includes(
                String(service.package_inquiry_mode ?? 'disabled')
            ) ? (service.package_inquiry_mode ?? 'disabled') : 'disabled',
            package_inquiry_provider_id: service.package_inquiry_provider_id == null
                ? null : Number(service.package_inquiry_provider_id)
        });
        setServiceDialog(true);
    };
    const confirmDeleteService = (service: Service) => {
        setService(service);
        setDeleteServiceDialog(true);
    };
    const deleteService = () => {
        if (!service?.id) {
            console.error('Service ID is undefined.');
            return;
        }
        dispatch(_deleteService(service?.id, toast, t));
        setDeleteServiceDialog(false);
    };
    const confirmDeleteSelected = () => {
        if (!selectedServices || (selectedServices as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('VALIDATION_WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteServicesDialog(true);
    };
    const deleteSelectedServices = async () => {
        if (!selectedServices || (selectedServices as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        const selectedIds = (selectedServices as Service[]).map((service) => service.id);
        await _deleteSelectedServices(selectedIds, toast, t);
        dispatch(_fetchServiceList());
        setSelectedServices(null);
        setDeleteServicesDialog(false);
    };
    // Searches the currently loaded Redux services without another API call.
    const filteredServices = useMemo(() => {
        const query = localSearchTerm.trim().toLocaleLowerCase();
        const source: ServiceWithInquiry[] = Array.isArray(services) ? services : [];
        const filtered = !query ? source : source.filter(item => {
            const provider = (providers || []).find((p: Provider) => Number(p.id) === Number(item.api_provider_id));
            const inquiryProvider = (providers || []).find((p: Provider) => Number(p.id) === Number(item.package_inquiry_provider_id));
            const inquiryMode = item.package_inquiry_mode ?? 'disabled';
            const text = [
                item.id, item.service_name, item.company?.company_name,
                item.company?.country?.country_name, item.service_category?.category_name,
                item.telegram_chat_id?.group_name, provider?.name, provider?.code,
                item.display_order, item.api_provider_id,
                inquiryMode, item.package_inquiry_provider_id,
                inquiryProvider?.name, inquiryProvider?.code,
                inquiryMode === 'inherit' ? 'App Settings Default' : null
            ].filter(v => v != null).join(' ').toLocaleLowerCase();
            return text.includes(query);
        });
        return [...filtered].sort((a, b) =>
            Number(a.display_order ?? 0) - Number(b.display_order ?? 0) || a.id - b.id
        );
    }, [services, providers, localSearchTerm]);
    const countryNameBodyTemplate = (rowData: Service) => {
        return (
            <>
                <span className="p-column-title">Country</span>
                {rowData.company?.country?.country_name}
            </>
        );
    };
    const companyInfoBodyTemplate = (rowData: Service) => {
        return (
            <>
                <span className="p-column-title">Company Info</span>
                <div className="" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', gap: '10px' }}>
                    <img
                        src={`${rowData.company?.company_logo}`}
                        alt={rowData.company?.company_logo.toString()}
                        className="shadow-2"
                        style={{
                            padding: '2px',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%', // Makes the image circular
                            objectFit: 'cover' // Ensures the image is cropped correctly within the circle
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'start' }}>
                        <span style={{ fontWeight: 'bold' }}>{rowData.company?.company_name}</span>
                        {rowData.company?.country?.country_name}
                    </div>
                </div>
            </>
        );
    };
    const serviceCategoryNameBodyTemplate = (rowData: Service) => {
        return (
            <>
                <span className="p-column-title">Service Category</span>
                {rowData.service_category?.category_name}
            </>
        );
    };
    const telegramGroupNameBodyTemplate = (rowData: Service) => {
        return (
            <>
                <span className="p-column-title">Telegram Group Name</span>
                {rowData.telegram_chat_id?.group_name}
            </>
        );
    };
    const customFieldsBodyTemplate = (rowData: Service) => {
        const fieldCount = parseInputFormSchema(rowData.input_form_schema).length;
        return (
            <>
                <span className="p-column-title">Custom Fields</span>
                {fieldCount > 0 ? <Badge value={fieldCount} severity="info" /> : <span className="text-color-secondary">{rowData.input_form_schema?.length.toString()}</span>}
            </>
        );
    };
    const actionBodyTemplate = (rowData: Service) => (
        <RowActions
            items={[
                {
                    label: t('TABLE.GENERAL.EDIT'),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editService(rowData)
                },
                {
                    label: t('APP.GENERAL.DELETE'),
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => confirmDeleteService(rowData),
                    danger: true,
                    separatorBefore: true
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
    const deleteCompanyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteServiceDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteService} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteServicesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedServices} />
        </>
    );
    useEffect(() => {
        if (service.company_id) {
            const selectedCompany = companies.find((company: Company) => company.id === service.company_id);
            if (selectedCompany) {
                setService((prev) => ({
                    ...prev,
                    company: selectedCompany // Update with the selected company object
                }));
            }
        }
    }, [service.company_id, companies]);
    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.SERVICE')}
                description="مدیریت خدمات، اولویت نمایش و تنظیمات بسته"
                loading={loading}
                actions={
                    <UiButton type="button" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('SERVICE.TABLE.CREATESERVICE')}
                    </UiButton>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('SERVICE.TABLE.SEARCHSERVICE')}
                    />
                }
            >
                    <DataTable
                        ref={dt}
                        value={filteredServices}
                        selection={selectedServices}
                        onSelectionChange={(e) => setSelectedServices(e.value as any)}
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
                            field="Company Name"
                            header={t('SERVICE.TABLE.COLUMN.COMPANYNAME')}
                            body={companyInfoBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Country"
                            header={t('SERVICE.TABLE.COLUMN.COUNTRY')}
                            body={countryNameBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Service Category"
                            header={t('SERVICE.TABLE.COLUMN.SERVICECATEGORY')}
                            body={serviceCategoryNameBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Group Name"
                            header={t('COMPANY.TABLE.COLUMN.CHATGROUPNAME')}
                            body={telegramGroupNameBodyTemplate}
                        ></Column>
                        <Column header="Priority" body={priorityEditorBodyTemplate} style={{ minWidth: '135px' }} />
                        <Column header="Robot" body={robotBodyTemplate} style={{ minWidth: '85px' }} />
                        <Column header="API" body={apiBodyTemplate} style={{ minWidth: '85px' }} />
                        <Column header="API Provider" body={providerBodyTemplate} style={{ minWidth: '135px' }} />
                        <Column header="Inquiry Mode" body={inquiryModeBodyTemplate} style={{ minWidth: '120px' }} />
                        <Column header="Inquiry Provider" body={inquiryProviderBodyTemplate} style={{ minWidth: '180px' }} />
                        <Column header="API Key" body={(rowData: Service) => rowData.has_api_key ? 'Configured' : '—'} style={{ minWidth: '85px' }} />
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('TOTAL_CUSTOM_FIELD')} body={customFieldsBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('TABLE.GENERAL.ACTION')}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '5rem' }}
                            bodyStyle={{ width: '5rem' }}
                        ></Column>
                    </DataTable>
            </ListPage>
            <FormSheet
                open={serviceDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('SERVICE.DETAILS')}
                description={service.id ? 'ویرایش خدمت' : 'ثبت خدمت جدید'}
                size="xl"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveService}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title="اطلاعات پایه" description="نام، شرکت و دسته‌بندی خدمت">
                    <FormField
                        label={t('SERVICE.FORM.INPUT.SERVICENAME')}
                        required
                        fullWidth
                        error={submitted && !service.service_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="service"
                            value={service.service_name}
                            onChange={(e) =>
                                setService((perv) => ({
                                    ...perv,
                                    service_name: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            placeholder={t('SERVICE.FORM.PLACEHOLDER.SERVICENAME')}
                            className={classNames('w-full', {
                                'p-invalid': submitted && !service.service_name
                            })}
                        />
                    </FormField>
                    <FormField
                        label={t('SERVICE.FORM.INPUT.COMPANY')}
                        required
                        error={submitted && !service.company ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={service.company}
                            options={companies || []}
                            onChange={(selected) =>
                                setService((perv) => ({
                                    ...perv,
                                    company: selected
                                }))
                            }
                            optionLabel="company_name"
                            placeholder={t('SERVICE.FORM.PLACEHOLDER.COMPANY')}
                            error={submitted && !service.company}
                            returnFullObject
                        />
                    </FormField>
                    <FormField
                        label={t('SERVICE.FORM.INPUT.SERVICECATEGORY')}
                        required
                        error={submitted && !service.service_category ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={service.service_category}
                            options={serviceCategories || []}
                            onChange={(selected) =>
                                setService((perv) => ({
                                    ...perv,
                                    service_category: selected
                                }))
                            }
                            optionLabel="category_name"
                            placeholder={t('SERVICE.FORM.PLACEHOLDER.ServiceCategory')}
                            error={submitted && !service.service_category}
                            returnFullObject
                        />
                    </FormField>
                    <FormField label={t('COMPANY.FORM.INPUT.TELEGRAMID')}>
                        <SearchSelect
                            value={service.telegram_chat_id}
                            options={telegramChatIds || []}
                            onChange={(selected) =>
                                setService((prevService) => ({
                                    ...prevService,
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

                <FormSection title="Automation & API Settings" description="اولویت نمایش، ربات و API">
                    <FormField
                        label="Display Order Priority"
                        hint="Lower numbers appear first. Equal priorities use ID order."
                        fullWidth
                    >
                        <NumberInput
                            id="service_display_order"
                            min={0}
                            step={1}
                            allowNull={false}
                            value={service.display_order ?? 0}
                            className="w-full"
                            onValueChange={(v) =>
                                setService((prev) => ({
                                    ...prev,
                                    display_order: Math.max(0, v ?? 0)
                                }))
                            }
                        />
                    </FormField>
                    <FormField label="Robot Enabled">
                        <Switch
                            id="service_robot_enabled"
                            checked={Boolean(service.is_robot_enabled)}
                            onCheckedChange={(v) => setService((prev) => ({ ...prev, is_robot_enabled: v }))}
                        />
                    </FormField>
                    <FormField label="API Enabled">
                        <Switch
                            id="service_api_enabled"
                            checked={Boolean(service.is_api_enabled)}
                            onCheckedChange={(v) => setService((prev) => ({ ...prev, is_api_enabled: v }))}
                        />
                    </FormField>
                    <FormField label="API Provider (Optional)">
                        <SearchSelect
                            value={
                                (providers || []).find((provider: Provider) => provider.id === service.api_provider_id) ||
                                null
                            }
                            options={providers || []}
                            onChange={(selected) =>
                                setService((prev) => ({
                                    ...prev,
                                    api_provider_id: selected?.id ?? null
                                }))
                            }
                            optionLabel="name"
                            placeholder="Select API Provider"
                            searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو…' })}
                            returnFullObject
                            showClear
                            itemTemplate={(provider: Provider) => (
                                <div>
                                    <div className="text-sm font-semibold">{provider.name}</div>
                                    <div className="text-xs text-muted-foreground">{provider.code}</div>
                                </div>
                            )}
                        />
                    </FormField>
                    <FormField
                        label="API Key (Optional)"
                        hint={service.id ? 'برای حفظ کلید فعلی خالی بگذارید.' : undefined}
                    >
                        <PasswordInput
                            id="service_api_key"
                            value={service.api_key ?? ''}
                            onChange={(e) => setService((prev) => ({ ...prev, api_key: e.target.value }))}
                            placeholder={service.id ? 'Leave blank to keep existing key' : 'Enter API Key'}
                            className="w-full"
                            autoComplete="new-password"
                        />
                    </FormField>
                </FormSection>

                <FormSection
                    title="Package Inquiry Settings"
                    description="Number-specific Turkish package discovery. Configure this only on Turkish Internet services."
                >
                    <FormField label="Package Inquiry Mode" fullWidth>
                        <Select
                            value={service.package_inquiry_mode ?? 'disabled'}
                            onValueChange={(v) =>
                                setService((prev) => ({
                                    ...prev,
                                    package_inquiry_mode: v as PackageInquiryMode,
                                    package_inquiry_provider_id: v === 'provider' ? (prev.package_inquiry_provider_id ?? null) : null
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Package inquiry mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="disabled">Disabled — normal bundles only</SelectItem>
                                <SelectItem value="inherit">Inherit — default provider from App Settings</SelectItem>
                                <SelectItem value="provider">Provider — select a specific provider</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    {service.package_inquiry_mode === 'provider' ? (
                        <FormField label="Package Inquiry Provider" required fullWidth>
                            <Select
                                value={
                                    service.package_inquiry_provider_id != null
                                        ? String(service.package_inquiry_provider_id)
                                        : undefined
                                }
                                onValueChange={(v) =>
                                    setService((prev) => ({
                                        ...prev,
                                        package_inquiry_provider_id: v ? Number(v) : null
                                    }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an active inquiry provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    {inquiryProviderOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={String(opt.value)}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {inquiryProviderOptions.length === 0 ? (
                                <p className="mt-1 text-xs text-orange-500">
                                    No active PayStore/ManshorPay provider is loaded. Check Providers and API pagination.
                                </p>
                            ) : null}
                        </FormField>
                    ) : null}
                    {service.package_inquiry_mode === 'inherit' ? (
                        <p className="sm:col-span-2 text-xs text-muted-foreground">
                            This service uses App Settings → Package Inquiry → Default Provider.
                        </p>
                    ) : null}
                    {(service.package_inquiry_mode ?? 'disabled') === 'disabled' ? (
                        <p className="sm:col-span-2 text-xs text-muted-foreground">
                            Existing normal bundles are listed without a number-specific inquiry.
                        </p>
                    ) : null}
                </FormSection>

                <div className="sm:col-span-2">
                    <CustomFields
                        fields={parseInputFormSchema(service.input_form_schema)}
                        onFieldsChange={(updatedFields) =>
                            setService({
                                ...service,
                                input_form_schema: updatedFields
                            })
                        }
                        submitted={submitted}
                    />
                </div>
            </FormSheet>
                    <Dialog visible={deleteServiceDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompanyDialogFooter} onHide={hideDeleteServiceDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {service && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{service.service_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>
                    <Dialog visible={deleteServicesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteServicesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {service && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                        </div>
                    </Dialog>
        </>
    );
};
export default withAuth(Services);
