/* eslint-disable @next/next/no-img-element */
'use client';
import { _addProvider, _deleteProvider, _deleteSelectedProviders, _editProvider, _fetchProviders, _toggleProvider } from '@/app/redux/actions/providerActions';
import { AppDispatch } from '@/app/redux/store';
import { Provider } from '@/types/interface';
import { useRouter } from 'next/navigation';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { RowActions } from '@/components/admin/row-actions';
import { Button as UiButton } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { Button as PrimeButton } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { TagInput } from '@/components/ui/tag-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { isRTL } from '../../utilities/rtlUtil';

const ProviderPage = () => {
    let emptyProvider: Provider = {
        id: 0,
        code: '',
        name: '',
        base_url: '',
        is_active: true,
        failover_priority: null,
        timeout_seconds: null,
        capabilities: [],
        endpoints: {},
        method_names: {},
        ip_whitelist: [],
        metadata: {
            notes: null,
            headers: null,
            credentials: null,
            callback_url: null,
            test_mode_supported: null,
            products_require_params: null
        },
        created_at: null,
        updated_at: null,
        deleted_at: null
    };

    const [providerDialog, setProviderDialog] = useState(false);
    const [deleteProviderDialog, setDeleteProviderDialog] = useState(false);
    const [deleteProvidersDialog, setDeleteProvidersDialog] = useState(false);
    const [provider, setProvider] = useState<Provider>(emptyProvider);
    const [selectedProviders, setSelectedProviders] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { providers, pagination, loading } = useSelector((state: any) => state.providerReducer);

    const { t } = useTranslation();
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [filterOpen, setFilterOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({
        filter_status: null as boolean | null,
        filter_capability: null as string | null
    });

    const [activeFilters, setActiveFilters] = useState({});
    const [endpointInputs, setEndpointInputs] = useState<{ key: string; value: string }[]>([]);
    const [methodInputs, setMethodInputs] = useState<{ key: string; value: string }[]>([]);
    const [headerInputs, setHeaderInputs] = useState<{ key: string; value: string }[]>([]);
    const [credentialInputs, setCredentialInputs] = useState<{ key: string; value: string }[]>([]);
    const [newEndpointKey, setNewEndpointKey] = useState('');
    const [newEndpointValue, setNewEndpointValue] = useState('');
    const [newMethodKey, setNewMethodKey] = useState('');
    const [newMethodValue, setNewMethodValue] = useState('');
    const [newHeaderKey, setNewHeaderKey] = useState('');
    const [newHeaderValue, setNewHeaderValue] = useState('');
    const [newCredentialKey, setNewCredentialKey] = useState('');
    const [newCredentialValue, setNewCredentialValue] = useState('');

    const router = useRouter();


    const capabilityOptions = [
        { label: t('PROVIDER.CAPABILITIES.TOPUP'), value: 'topup' },
        { label: t('PROVIDER.CAPABILITIES.INTERNET'), value: 'internet' },
        { label: t('PROVIDER.CAPABILITIES.BILL'), value: 'bill' },
        { label: t('PROVIDER.CAPABILITIES.CREDIT'), value: 'credit' },
        { label: t('PROVIDER.CAPABILITIES.PRODUCTS'), value: 'products' },
        { label: t('PROVIDER.CAPABILITIES.VOICE_BUNDLES'), value: 'voice' },
        { label: t('PROVIDER.CAPABILITIES.SMS_BUNDLES'), value: 'sms' }

    ];



    useEffect(() => {
        setCurrentPage(1);
    }, [searchTag, activeFilters]);

    useEffect(() => {
        dispatch(_fetchProviders(currentPage, searchTag, activeFilters));
    }, [dispatch, currentPage, searchTag, activeFilters]);

    useEffect(() => {
        // Initialize endpoint and method inputs when provider changes
        if (providerDialog && provider.endpoints) {
            const endpointEntries = Object.entries(provider.endpoints).map(([key, value]) => ({
                key,
                value: value || ''
            }));
            setEndpointInputs(endpointEntries);
        }

        if (providerDialog && provider.method_names) {
            const methodEntries = Object.entries(provider.method_names).map(([key, value]) => ({
                key,
                value: value || ''
            }));
            setMethodInputs(methodEntries);
        }

        if (providerDialog && provider.metadata?.headers) {
            const headerEntries = Object.entries(provider.metadata.headers).map(([key, value]) => ({
                key,
                value: value || ''
            }));
            setHeaderInputs(headerEntries);
        }

        if (providerDialog && provider.metadata?.credentials) {
            const credentialEntries = Object.entries(provider.metadata.credentials).map(([key, value]) => ({
                key,
                value: value || ''
            }));
            setCredentialInputs(credentialEntries);
        }
    }, [providerDialog, provider]);

    const openNew = () => {
        setProvider(emptyProvider);
        setSubmitted(false);
        setEndpointInputs([]);
        setMethodInputs([]);
        setHeaderInputs([]);
        setCredentialInputs([]);
        setProviderDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProviderDialog(false);
        setProvider(emptyProvider);
        setEndpointInputs([]);
        setMethodInputs([]);
        setHeaderInputs([]);
        setCredentialInputs([]);
        setNewEndpointKey('');
        setNewEndpointValue('');
        setNewMethodKey('');
        setNewMethodValue('');
        setNewHeaderKey('');
        setNewHeaderValue('');
        setNewCredentialKey('');
        setNewCredentialValue('');
    };

    const hideDeleteProviderDialog = () => {
        setDeleteProviderDialog(false);
        setProvider(emptyProvider);
    };

    const hideDeleteProvidersDialog = () => {
        setDeleteProvidersDialog(false);
        setProvider(emptyProvider);
    };

    const saveProvider = () => {
        setSubmitted(true);

        // Convert endpoint inputs to object
        const endpointsObj: Record<string, string> = {};
        endpointInputs.forEach((input) => {
            if (input.key && input.value) {
                endpointsObj[input.key] = input.value;
            }
        });

        // Convert method inputs to object
        const methodsObj: Record<string, string> = {};
        methodInputs.forEach((input) => {
            if (input.key && input.value) {
                methodsObj[input.key] = input.value;
            }
        });

        // Convert header inputs to object
        const headersObj: Record<string, string> = {};
        headerInputs.forEach((input) => {
            if (input.key && input.value) {
                headersObj[input.key] = input.value;
            }
        });

        // Convert credential inputs to object
        const credentialsObj: Record<string, string> = {};
        credentialInputs.forEach((input) => {
            if (input.key && input.value) {
                credentialsObj[input.key] = input.value;
            }
        });

        // Update provider with endpoints and methods
        const updatedProvider = {
            ...provider,
            endpoints: endpointsObj,
            method_names: methodsObj,
            metadata: {
                ...provider.metadata,
                headers: headersObj,
                credentials: credentialsObj
            }
        };

        if (!updatedProvider.code || !updatedProvider.name || !updatedProvider.base_url) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        if (updatedProvider.id && updatedProvider.id !== 0) {
            dispatch(_editProvider(updatedProvider.id, updatedProvider, toast, t));
        } else {
            dispatch(_addProvider(updatedProvider, toast, t));
        }

        setProviderDialog(false);
        setProvider(emptyProvider);
        setSubmitted(false);
    };

    const editProvider = (provider: Provider) => {
        setProvider({ ...provider });
        setProviderDialog(true);
    };

    const confirmDeleteProvider = (provider: Provider) => {
        setProvider(provider);
        setDeleteProviderDialog(true);
    };

    const deleteProvider = () => {
        if (!provider?.id) {
            console.error('Provider ID is undefined.');
            return;
        }
        dispatch(_deleteProvider(provider?.id, toast, t));
        setDeleteProviderDialog(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchProviders(1, searchTag, activeFilters) as any);
        setRefreshing(false);
    };

    const handleSubmitFilter = (nextFilters: typeof filters) => {
        const cleaned: Record<string, boolean | string> = {};
        if (nextFilters.filter_status !== null && nextFilters.filter_status !== undefined) {
            cleaned.filter_status = nextFilters.filter_status;
        }
        if (nextFilters.filter_capability) cleaned.filter_capability = nextFilters.filter_capability;
        setActiveFilters(cleaned);
    };

    const filterChips = useMemo(() => {
        const chips: { key: string; label: string }[] = [];
        const af = activeFilters as { filter_status?: boolean; filter_capability?: string };
        if (af.filter_status !== null && af.filter_status !== undefined) {
            chips.push({
                key: 'filter_status',
                label: `${t('PROVIDER.STATUS')}: ${af.filter_status ? t('APP.GENERAL.ACTIVE') : t('APP.GENERAL.INACTIVE')}`
            });
        }
        if (af.filter_capability) {
            const cap = capabilityOptions.find((c) => c.value === af.filter_capability);
            chips.push({
                key: 'filter_capability',
                label: `${t('PROVIDER.CAPABILITIES.TITLE')}: ${cap?.label || af.filter_capability}`
            });
        }
        return chips;
    }, [activeFilters, capabilityOptions, t]);

    const removeFilterChip = (key: string) => {
        const next = { ...(activeFilters as object) } as Record<string, boolean | string>;
        delete next[key];
        setActiveFilters(next);
        if (key === 'filter_status') setFilters((f) => ({ ...f, filter_status: null }));
        if (key === 'filter_capability') setFilters((f) => ({ ...f, filter_capability: null }));
    };

    const clearAllFilters = () => {
        setActiveFilters({});
        setFilters({ filter_status: null, filter_capability: null });
    };

    const confirmDeleteSelected = () => {
        if (!selectedProviders || (selectedProviders as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('VALIDATION_WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteProvidersDialog(true);
    };

    const deleteSelectedProviders = async () => {
        if (!selectedProviders || (selectedProviders as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        const selectedIds = (selectedProviders as Provider[]).map((provider) => provider.id);

        await _deleteSelectedProviders(selectedIds, toast, t);
        dispatch(_fetchProviders());

        setSelectedProviders(null);
        setDeleteProvidersDialog(false);
    };

    const addEndpoint = () => {
        if (newEndpointKey && newEndpointValue) {
            setEndpointInputs([...endpointInputs, { key: newEndpointKey, value: newEndpointValue }]);
            setNewEndpointKey('');
            setNewEndpointValue('');
        }
    };

    const removeEndpoint = (index: number) => {
        const newInputs = [...endpointInputs];
        newInputs.splice(index, 1);
        setEndpointInputs(newInputs);
    };

    const updateEndpoint = (index: number, field: 'key' | 'value', newValue: string) => {
        const newInputs = [...endpointInputs];
        newInputs[index][field] = newValue;
        setEndpointInputs(newInputs);
    };

    const addMethod = () => {
        if (newMethodKey && newMethodValue) {
            setMethodInputs([...methodInputs, { key: newMethodKey, value: newMethodValue }]);
            setNewMethodKey('');
            setNewMethodValue('');
        }
    };

    const removeMethod = (index: number) => {
        const newInputs = [...methodInputs];
        newInputs.splice(index, 1);
        setMethodInputs(newInputs);
    };

    const updateMethod = (index: number, field: 'key' | 'value', newValue: string) => {
        const newInputs = [...methodInputs];
        newInputs[index][field] = newValue;
        setMethodInputs(newInputs);
    };

    const addHeader = () => {
        if (newHeaderKey && newHeaderValue) {
            setHeaderInputs([...headerInputs, { key: newHeaderKey, value: newHeaderValue }]);
            setNewHeaderKey('');
            setNewHeaderValue('');
        }
    };

    const removeHeader = (index: number) => {
        const newInputs = [...headerInputs];
        newInputs.splice(index, 1);
        setHeaderInputs(newInputs);
    };

    const updateHeader = (index: number, field: 'key' | 'value', newValue: string) => {
        const newInputs = [...headerInputs];
        newInputs[index][field] = newValue;
        setHeaderInputs(newInputs);
    };

    const addCredential = () => {
        if (newCredentialKey && newCredentialValue) {
            setCredentialInputs([...credentialInputs, { key: newCredentialKey, value: newCredentialValue }]);
            setNewCredentialKey('');
            setNewCredentialValue('');
        }
    };

    const removeCredential = (index: number) => {
        const newInputs = [...credentialInputs];
        newInputs.splice(index, 1);
        setCredentialInputs(newInputs);
    };

    const updateCredential = (index: number, field: 'key' | 'value', newValue: string) => {
        const newInputs = [...credentialInputs];
        newInputs[index][field] = newValue;
        setCredentialInputs(newInputs);
    };

    const providerRowActions = (rowData: Provider) => [
        {
            label: t('TABLE.GENERAL.VIEW', { defaultValue: 'مشاهده' }),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => router.push(`/pages/app-providers/view/${rowData.id}`)
        },
        {
            label: t('TABLE.GENERAL.EDIT'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => editProvider(rowData)
        },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDeleteProvider(rowData),
            danger: true,
            separatorBefore: true
        }
    ];

    const formatProviderDate = (dateString: string | null) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleString();
    };

    const perPage = pagination?.items_per_page || 10;
    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / perPage));

    const deleteProviderDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteProviderDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteProvider} />
        </>
    );
    const deleteProvidersDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteProvidersDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedProviders} />
        </>
    );

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.APP_PROVIDERS', { defaultValue: 'تأمین‌کنندگان API' })}
                description={t('PROVIDERS_LIST_DESCRIPTION', { defaultValue: 'پیکربندی و مدیریت درگاه‌های تأمین‌کننده' })}
                loading={loading}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <UiButton variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </UiButton>
                        <UiButton size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('PROVIDER.TABLE.CREATEPROVIDER')}
                        </UiButton>
                    </div>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در تأمین‌کنندگان...' })}
                        chips={filterChips}
                        onRemoveChip={removeFilterChip}
                        onClearAll={clearAllFilters}
                        onOpenFilters={() => setFilterOpen(true)}
                    />
                }
                footer={
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
                        <span>
                            {t('DATA_TABLE.TABLE.PAGINATOR.SHOWING', { defaultValue: 'نمایش' })} — {pagination?.total || 0}
                        </span>
                        <div className="flex items-center gap-2">
                            <UiButton type="button" variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                                {t('PREV', { defaultValue: 'قبلی' })}
                            </UiButton>
                            <span className="tabular-nums">
                                {currentPage} / {totalPages}
                            </span>
                            <UiButton
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            >
                                {t('NEXT', { defaultValue: 'بعدی' })}
                            </UiButton>
                        </div>
                    </div>
                }
            >
                {(providers || []).length === 0 ? (
                    <div className="px-4 py-10 text-center text-sm text-muted-foreground">{t('DATA_TABLE.TABLE.NO_DATA')}</div>
                ) : (
                    <table className="w-full min-w-[52rem] border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40 text-start text-xs text-muted-foreground">
                                <th className="px-3 py-2 font-medium">{t('PROVIDER.TABLE.COLUMN.CODE')}</th>
                                <th className="px-3 py-2 font-medium">{t('PROVIDER.TABLE.COLUMN.NAME')}</th>
                                <th className="px-3 py-2 font-medium">{t('PROVIDER.TABLE.COLUMN.BASEURL')}</th>
                                <th className="px-3 py-2 font-medium">{t('PROVIDER.TABLE.COLUMN.CAPABILITIES')}</th>
                                <th className="px-3 py-2 font-medium">{t('PROVIDER.TABLE.COLUMN.STATUS')}</th>
                                <th className="px-3 py-2 font-medium">{t('TABLE.GENERAL.CREATEDAT')}</th>
                                <th className="px-3 py-2 font-medium">{t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(providers || []).map((row: Provider) => (
                                <tr key={row.id} className="border-b border-border/70 hover:bg-muted/30">
                                    <td className="px-3 py-2 font-medium tabular-nums">{row.code || '—'}</td>
                                    <td className="px-3 py-2">{row.name || '—'}</td>
                                    <td className="max-w-[14rem] truncate px-3 py-2 text-muted-foreground" title={row.base_url || ''}>
                                        {row.base_url || '—'}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap gap-1">
                                            {(row.capabilities || []).map((capability) => (
                                                <Badge key={capability} variant="secondary">
                                                    {capability}
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2">
                                        <Switch
                                            checked={Boolean(row.is_active)}
                                            onCheckedChange={(checked) => dispatch(_toggleProvider(row.id, checked, toast, t))}
                                        />
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{formatProviderDate(row.created_at)}</td>
                                    <td className="px-3 py-2">
                                        <RowActions items={providerRowActions(row)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </ListPage>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side={isRTL() ? 'right' : 'left'} className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{t('ORDER.FILTER.FILTER', { defaultValue: 'فیلتر' })}</SheetTitle>
                        <SheetDescription>فیلترها روی نتایج سرور اعمال می‌شوند.</SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('PROVIDER.STATUS')}</label>
                            <Select
                                value={filters.filter_status === null ? '' : String(filters.filter_status)}
                                onValueChange={(v) =>
                                    setFilters({
                                        ...filters,
                                        filter_status: v === '' ? null : v === 'true'
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ORDER.FILTER.SELECT_STATUS')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">{t('APP.GENERAL.ACTIVE')}</SelectItem>
                                    <SelectItem value="false">{t('APP.GENERAL.INACTIVE')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('PROVIDER.CAPABILITIES.TITLE')}</label>
                            <Select
                                value={filters.filter_capability || ''}
                                onValueChange={(v) => setFilters({ ...filters, filter_capability: v || null })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('PROVIDER.FILTER.SELECT_CAPABILITY')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {capabilityOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <UiButton
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setFilters({ filter_status: null, filter_capability: null })}
                            >
                                {t('RESET')}
                            </UiButton>
                            <UiButton
                                type="button"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => {
                                    handleSubmitFilter(filters);
                                    setFilterOpen(false);
                                }}
                            >
                                {t('APPLY')}
                            </UiButton>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <FormSheet
                open={providerDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('PROVIDER.DETAILS')}
                description={
                    provider.id && provider.id !== 0
                        ? t('PROVIDER.FORM.EDIT_HINT', { defaultValue: 'ویرایش تنظیمات، متادیتا و اندپوینت‌های سرویس‌دهنده' })
                        : t('PROVIDER.FORM.CREATE_HINT', { defaultValue: 'ثبت سرویس‌دهنده جدید' })
                }
                size="full"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveProvider}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title="اطلاعات پایه" description="کد، نام و آدرس API">
                    <FormField
                        label={t('PROVIDER.FORM.INPUT.CODE')}
                        required
                        error={submitted && !provider.code ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="code"
                            value={provider.code}
                            onChange={(e) =>
                                setProvider((prev) => ({
                                    ...prev,
                                    code: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            placeholder={t('PROVIDER.FORM.PLACEHOLDER.CODE')}
                            className={classNames('w-full', {
                                'p-invalid': submitted && !provider.code
                            })}
                        />
                    </FormField>
                    <FormField
                        label={t('PROVIDER.FORM.INPUT.NAME')}
                        required
                        error={submitted && !provider.name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="name"
                            value={provider.name}
                            onChange={(e) =>
                                setProvider((prev) => ({
                                    ...prev,
                                    name: e.target.value
                                }))
                            }
                            required
                            placeholder={t('PROVIDER.FORM.PLACEHOLDER.NAME')}
                            className={classNames('w-full', {
                                'p-invalid': submitted && !provider.name
                            })}
                        />
                    </FormField>
                    <FormField
                        label={t('PROVIDER.FORM.INPUT.BASEURL')}
                        required
                        error={submitted && !provider.base_url ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="base_url"
                            value={provider.base_url}
                            onChange={(e) =>
                                setProvider((prev) => ({
                                    ...prev,
                                    base_url: e.target.value
                                }))
                            }
                            required
                            placeholder={t('PROVIDER.FORM.PLACEHOLDER.BASEURL')}
                            className={classNames('w-full', {
                                'p-invalid': submitted && !provider.base_url
                            })}
                        />
                    </FormField>
                    <FormField label={t('PROVIDER.FORM.INPUT.FAILOVERPRIORITY')}>
                        <Input
                            id="failover_priority"
                            value={provider.failover_priority || ''}
                            onChange={(e) =>
                                setProvider((prev) => ({
                                    ...prev,
                                    failover_priority: e.target.value
                                }))
                            }
                            placeholder={t('PROVIDER.FORM.PLACEHOLDER.FAILOVERPRIORITY')}
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('PROVIDER.FORM.INPUT.TIMEOUT')}>
                        <Input
                            id="timeout_seconds"
                            value={provider.timeout_seconds || ''}
                            onChange={(e) =>
                                setProvider((prev) => ({
                                    ...prev,
                                    timeout_seconds: e.target.value
                                }))
                            }
                            placeholder={t('PROVIDER.FORM.PLACEHOLDER.TIMEOUT')}
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('PROVIDER.FORM.INPUT.CAPABILITIES')} fullWidth>
                        <div className="flex flex-wrap gap-3">
                            {capabilityOptions.map((cap) => (
                                <div key={cap.value} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`capability-${cap.value}`}
                                        checked={(provider.capabilities || []).includes(cap.value)}
                                        onCheckedChange={(checked) => {
                                            setProvider((prev) => {
                                                const caps = [...(prev.capabilities || [])];
                                                if (checked === true) {
                                                    if (!caps.includes(cap.value)) caps.push(cap.value);
                                                } else {
                                                    return { ...prev, capabilities: caps.filter((c) => c !== cap.value) };
                                                }
                                                return { ...prev, capabilities: caps };
                                            });
                                        }}
                                    />
                                    <label htmlFor={`capability-${cap.value}`} className="text-sm">
                                        {cap.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </FormField>
                    <FormField label={t('PROVIDER.FORM.INPUT.IPWHITELIST')} hint={t('PROVIDER.FORM.HELP.IPWHITELIST')} fullWidth>
                        <TagInput
                            value={(provider.ip_whitelist || []).filter(Boolean)}
                            onChange={(tags) =>
                                setProvider((prev) => ({
                                    ...prev,
                                    ip_whitelist: tags
                                }))
                            }
                            placeholder={t('PROVIDER.FORM.PLACEHOLDER.IPWHITELIST')}
                        />
                    </FormField>
                    <FormField label={t('PROVIDER.FORM.INPUT.STATUS')}>
                        <Switch
                            id="is_active"
                            checked={Boolean(provider.is_active)}
                            onCheckedChange={(v) =>
                                setProvider((prev) => ({
                                    ...prev,
                                    is_active: v
                                }))
                            }
                        />
                    </FormField>
                </FormSection>

                <FormSection title="پیکربندی پیشرفته" description="متادیتا، endpoint و method">
                    <div className="sm:col-span-2 w-full [&>div]:col-span-2">
                                <Accordion multiple className="sm:col-span-2 w-full">
                                    <AccordionTab header={t('PROVIDER.FORM.SECTION.METADATA')}>
                                        <div className="formgrid grid">
                                            <div className="field col-12 md:col-6">
                                                <label htmlFor="callback_url" className="font-bold block mb-2">
                                                    {t('PROVIDER.FORM.INPUT.CALLBACK_URL')}
                                                </label>
                                                <Input
                                                    id="callback_url"
                                                    value={provider.metadata?.callback_url || ''}
                                                    onChange={(e) =>
                                                        setProvider((prev) => ({
                                                            ...prev,
                                                            metadata: {
                                                                ...prev.metadata,
                                                                callback_url: e.target.value
                                                            }
                                                        }))
                                                    }
                                                    placeholder={t('PROVIDER.FORM.PLACEHOLDER.CALLBACK_URL')}
                                                    className="w-full"
                                                />
                                            </div>

                                            <div className="field col-12 md:col-6">
                                                <label htmlFor="notes" className="font-bold block mb-2">
                                                    {t('PROVIDER.FORM.INPUT.NOTES')}
                                                </label>
                                                <Input
                                                    id="notes"
                                                    value={provider.metadata?.notes || ''}
                                                    onChange={(e) =>
                                                        setProvider((prev) => ({
                                                            ...prev,
                                                            metadata: {
                                                                ...prev.metadata,
                                                                notes: e.target.value
                                                            }
                                                        }))
                                                    }
                                                    placeholder={t('PROVIDER.FORM.PLACEHOLDER.NOTES')}
                                                    className="w-full"
                                                />
                                            </div>

                                            <div className="field col-12 md:col-6 flex items-center mt-3">
                                                <label htmlFor="test_mode_supported" className="font-bold me-3">
                                                    {t('PROVIDER.FORM.INPUT.TEST_MODE_SUPPORTED')}
                                                </label>
                                                <Switch
                                                    id="test_mode_supported"
                                                    checked={Boolean(provider.metadata?.test_mode_supported)}
                                                    onCheckedChange={(v) =>
                                                        setProvider((prev) => ({
                                                            ...prev,
                                                            metadata: {
                                                                ...prev.metadata,
                                                                test_mode_supported: v
                                                            }
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className="field col-12 md:col-6 flex items-center mt-3">
                                                <label htmlFor="products_require_params" className="font-bold me-3">
                                                    {t('PROVIDER.FORM.INPUT.PRODUCTS_REQUIRE_PARAMS')}
                                                </label>
                                                <Switch
                                                    id="products_require_params"
                                                    checked={Boolean(provider.metadata?.products_require_params)}
                                                    onCheckedChange={(v) =>
                                                        setProvider((prev) => ({
                                                            ...prev,
                                                            metadata: {
                                                                ...prev.metadata,
                                                                products_require_params: v
                                                            }
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>

                                        {/* Headers Section */}
                                        <Accordion className="mt-3">
                                            <AccordionTab header={t('PROVIDER.FORM.SECTION.HEADERS')}>
                                                <div className="space-y-2">
                                                    {headerInputs.map((input, index) => (
                                                        <div key={index} className="flex flex-col md:flex-row gap-2 items-center">
                                                            <Input value={input.key} onChange={(e) => updateHeader(index, 'key', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.HEADER_KEY')} className="flex-1" />
                                                            <Input value={input.value} onChange={(e) => updateHeader(index, 'value', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.HEADER_VALUE')} className="flex-1" />
                                                            <PrimeButton icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => removeHeader(index)} />
                                                        </div>
                                                    ))}
                                                    <div className="flex flex-col md:flex-row gap-2 items-center mt-3">
                                                        <Input value={newHeaderKey} onChange={(e) => setNewHeaderKey(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.HEADER_KEY')} className="flex-1" />
                                                        <Input value={newHeaderValue} onChange={(e) => setNewHeaderValue(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.HEADER_VALUE')} className="flex-1" />
                                                        <PrimeButton icon="pi pi-plus" className="p-button-success p-button-outlined" onClick={addHeader} />
                                                    </div>
                                                </div>
                                            </AccordionTab>

                                            {/* Credentials Section */}
                                            <AccordionTab header={t('PROVIDER.FORM.SECTION.CREDENTIALS')}>
                                                <div className="space-y-2">
                                                    {credentialInputs.map((input, index) => (
                                                        <div key={index} className="flex flex-col md:flex-row gap-2 items-center">
                                                            <Input value={input.key} onChange={(e) => updateCredential(index, 'key', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.CREDENTIAL_KEY')} className="flex-1" />
                                                            <Input value={input.value} onChange={(e) => updateCredential(index, 'value', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.CREDENTIAL_VALUE')} className="flex-1" />
                                                            <PrimeButton icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => removeCredential(index)} />
                                                        </div>
                                                    ))}
                                                    <div className="flex flex-col md:flex-row gap-2 items-center mt-3">
                                                        <Input value={newCredentialKey} onChange={(e) => setNewCredentialKey(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.CREDENTIAL_KEY')} className="flex-1" />
                                                        <Input value={newCredentialValue} onChange={(e) => setNewCredentialValue(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.CREDENTIAL_VALUE')} className="flex-1" />
                                                        <PrimeButton icon="pi pi-plus" className="p-button-success p-button-outlined" onClick={addCredential} />
                                                    </div>
                                                </div>
                                            </AccordionTab>
                                        </Accordion>
                                    </AccordionTab>

                                    {/* Endpoints Section */}
                                    <AccordionTab header={t('PROVIDER.FORM.SECTION.ENDPOINTS')}>
                                        <div className="space-y-2">
                                            {endpointInputs.map((input, index) => (
                                                <div key={index} className="flex flex-col md:flex-row gap-2 items-center">
                                                    <Input value={input.key} onChange={(e) => updateEndpoint(index, 'key', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.ENDPOINT_KEY')} className="flex-1" />
                                                    <Input value={input.value} onChange={(e) => updateEndpoint(index, 'value', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.ENDPOINT_VALUE')} className="flex-1" />
                                                    <PrimeButton icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => removeEndpoint(index)} />
                                                </div>
                                            ))}
                                            <div className="flex flex-col md:flex-row gap-2 items-center mt-3">
                                                <Input value={newEndpointKey} onChange={(e) => setNewEndpointKey(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.ENDPOINT_KEY')} className="flex-1" />
                                                <Input value={newEndpointValue} onChange={(e) => setNewEndpointValue(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.ENDPOINT_VALUE')} className="flex-1" />
                                                <PrimeButton icon="pi pi-plus" className="p-button-success p-button-outlined" onClick={addEndpoint} />
                                            </div>
                                        </div>
                                    </AccordionTab>

                                    {/* Method Names Section */}
                                    <AccordionTab header={t('PROVIDER.FORM.SECTION.METHOD_NAMES')}>
                                        <div className="space-y-2">
                                            {methodInputs.map((input, index) => (
                                                <div key={index} className="flex flex-col md:flex-row gap-2 items-center">
                                                    <Input value={input.key} onChange={(e) => updateMethod(index, 'key', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.METHOD_KEY')} className="flex-1" />
                                                    <Input value={input.value} onChange={(e) => updateMethod(index, 'value', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.METHOD_VALUE')} className="flex-1" />
                                                    <PrimeButton icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => removeMethod(index)} />
                                                </div>
                                            ))}
                                            <div className="flex flex-col md:flex-row gap-2 items-center mt-3">
                                                <Input value={newMethodKey} onChange={(e) => setNewMethodKey(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.METHOD_KEY')} className="flex-1" />
                                                <Input value={newMethodValue} onChange={(e) => setNewMethodValue(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.METHOD_VALUE')} className="flex-1" />
                                                <PrimeButton icon="pi pi-plus" className="p-button-success p-button-outlined" onClick={addMethod} />
                                            </div>
                                        </div>
                                    </AccordionTab>
                                </Accordion>
                    </div>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteProviderDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteProviderDialogFooter} onHide={hideDeleteProviderDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {provider && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{provider.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProvidersDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteProvidersDialogFooter} onHide={hideDeleteProvidersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {selectedProviders && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')} </span>}
                        </div>
                    </Dialog>
        </div>
    );
};

export default withAuth(ProviderPage);
