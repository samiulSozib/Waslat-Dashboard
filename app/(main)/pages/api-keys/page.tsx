/* eslint-disable @next/next/no-img-element */
'use client';
import {
    _createApiKey,
    _deleteApiKey,
    _fetchApiKeys,
    _regenerateApiKey,
    _updateApiKey
} from '@/app/redux/actions/apiKeyActions';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { AppDispatch } from '@/app/redux/store';
import i18n from '@/i18n';
import { ApiKey } from '@/types/interface';
import { useRouter, useSearchParams } from 'next/navigation';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RowActions } from '@/components/admin/row-actions';
import { Button as UiButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { DateField } from '@/components/ui/date-field';
import { TagInput } from '@/components/ui/tag-input';
import { Button as PrimeButton } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { customCellStyle } from '../../utilities/customRow';
import { isRTL } from '../../utilities/rtlUtil';

const ApiKeysPage = () => {
    let emptyApiKey: Partial<ApiKey> = {
        id: 0,
        key: '',
        name: '',
        is_active: true,
        expires_at: '',
        allowed_ips: [],
        rate_limit: 1000,
        created_at: '',
        updated_at: '',
        reseller: null
    };

    const [apiKeyDialog, setApiKeyDialog] = useState(false);
    const [deleteApiKeyDialog, setDeleteApiKeyDialog] = useState(false);
    const [regenerateDialog, setRegenerateDialog] = useState(false);
    const [apiKey, setApiKey] = useState<Partial<ApiKey>>(emptyApiKey);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { apiKeys, loading, pagination } = useSelector((state: any) => state.apiKeyReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const { t } = useTranslation();
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState({
        filter_status: null as string | null,
        filter_expired: null as boolean | null,
        filter_reseller_id: null as number | null
    });
    const [activeFilters, setActiveFilters] = useState<Record<string, string | number | boolean>>({});
    const [showKey, setShowKey] = useState<{ [key: number]: boolean }>({});
    const [currentPage, setCurrentPage] = useState(1);

    const searchParams = useSearchParams();
    const router = useRouter();

    // Fetch API keys and resellers
    useEffect(() => {
        dispatch(_fetchApiKeys(currentPage, searchTag, activeFilters));
        dispatch(_fetchResellers(1, '', '', 15));
    }, [dispatch, searchTag, activeFilters, currentPage]);

    // Debounced search for resellers
    useEffect(() => {
        const timer = setTimeout(() => {
            if (resellerSearchTerm) {
                dispatch(_fetchResellers(1, resellerSearchTerm, '', 15));
            } else {
                dispatch(_fetchResellers(1, '', '', 15));
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [resellerSearchTerm, dispatch]);

    // Auto-open add dialog from URL param
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            const timer = setTimeout(() => {
                openNew();
                router.replace('/pages/api-keys');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    const openNew = () => {
        setApiKey(emptyApiKey);
        setSubmitted(false);
        setApiKeyDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setApiKeyDialog(false);
        setResellerSearchTerm('');
    };

    const hideDeleteApiKeyDialog = () => {
        setDeleteApiKeyDialog(false);
    };

    const saveApiKey = () => {
        setSubmitted(true);

        if (!apiKey.name) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_ENTER_API_KEY_NAME'),
                life: 3000
            });
            return;
        }

        if (!apiKey.reseller) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_SELECT_RESELLER'),
                life: 3000
            });
            return;
        }

        const saveAction = apiKey.id && apiKey.id !== 0
            ? _updateApiKey(apiKey.id, apiKey, toast, t)
            : _createApiKey(apiKey, toast, t);

        dispatch(saveAction).then(() => {
            setCurrentPage(1);
            dispatch(_fetchApiKeys(1, searchTag, activeFilters));
            setApiKeyDialog(false);
            setApiKey(emptyApiKey);
            setSubmitted(false);
        });
    };

    const editApiKey = (apiKeyData: ApiKey) => {
        setApiKey({ ...apiKeyData });
        setApiKeyDialog(true);
    };

    const confirmDeleteApiKey = (apiKeyData: ApiKey) => {
        setApiKey(apiKeyData);
        setDeleteApiKeyDialog(true);
    };

    const deleteApiKey = () => {
        if (!apiKey?.id) {
            console.error('API Key ID is undefined.');
            return;
        }
        dispatch(_deleteApiKey(apiKey?.id, toast, t)).then(() => {
            dispatch(_fetchApiKeys(currentPage, searchTag, activeFilters));
            setDeleteApiKeyDialog(false);
        });
    };

    const confirmRegenerateApiKey = (apiKeyData: ApiKey) => {
        setApiKey(apiKeyData);
        setRegenerateDialog(true);
    };

    const regenerateApiKey = () => {
        if (!apiKey?.id) {
            console.error('API Key ID is undefined.');
            return;
        }
        dispatch(_regenerateApiKey(apiKey?.id, toast, t)).then(() => {
            dispatch(_fetchApiKeys(currentPage, searchTag, activeFilters));
            setRegenerateDialog(false);
        });
    };

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key);
        toast.current?.show({
            severity: 'success',
            summary: t('SUCCESS'),
            detail: t('API_KEY_COPIED'),
            life: 3000
        });
    };

    const toggleShowKey = (id: number) => {
        setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchApiKeys(currentPage, searchTag, activeFilters) as any);
        setRefreshing(false);
    };

    const handleSubmitFilter = (nextFilters: typeof filters) => {
        const cleanedFilters: any = {};
        if (nextFilters.filter_status) cleanedFilters.status = nextFilters.filter_status;
        if (nextFilters.filter_expired !== null && nextFilters.filter_expired !== undefined) {
            cleanedFilters.expired = nextFilters.filter_expired;
        }
        if (nextFilters.filter_reseller_id) cleanedFilters.reseller_id = nextFilters.filter_reseller_id;
        setActiveFilters(cleanedFilters);
        setCurrentPage(1);
    };

    const filterChips = useMemo(() => {
        const chips: { key: string; label: string }[] = [];
        if (activeFilters.status) {
            chips.push({
                key: 'status',
                label: `${t('STATUS')}: ${activeFilters.status === 'active' ? t('ACTIVE') : t('INACTIVE')}`
            });
        }
        if (activeFilters.expired !== undefined && activeFilters.expired !== null) {
            chips.push({
                key: 'expired',
                label: `${t('EXPIRATION')}: ${activeFilters.expired ? t('EXPIRED') : t('NOT_EXPIRED')}`
            });
        }
        if (activeFilters.reseller_id) {
            const reseller = resellers.find((r: { id: number }) => r.id === activeFilters.reseller_id);
            chips.push({
                key: 'reseller_id',
                label: `${t('RESELLER')}: ${reseller?.reseller_name || activeFilters.reseller_id}`
            });
        }
        return chips;
    }, [activeFilters, resellers, t]);

    const removeFilterChip = (key: string) => {
        const nextActive = { ...activeFilters };
        delete nextActive[key];
        setActiveFilters(nextActive);
        if (key === 'status') setFilters((f) => ({ ...f, filter_status: null }));
        if (key === 'expired') setFilters((f) => ({ ...f, filter_expired: null }));
        if (key === 'reseller_id') setFilters((f) => ({ ...f, filter_reseller_id: null }));
        setCurrentPage(1);
    };

    const clearAllFilters = () => {
        setActiveFilters({});
        setFilters({
            filter_status: null,
            filter_expired: null,
            filter_reseller_id: null
        });
        setCurrentPage(1);
    };

    const apiKeyRowActions = (rowData: ApiKey) => [
        {
            label: t('EDIT'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => editApiKey(rowData)
        },
        {
            label: t('REGENERATE'),
            icon: <RefreshCw className="h-4 w-4" />,
            onClick: () => confirmRegenerateApiKey(rowData)
        },
        {
            label: t('DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDeleteApiKey(rowData),
            danger: true,
            separatorBefore: true
        }
    ];

    const resellerBodyTemplate = (rowData: ApiKey) => {
        return (
            <>
                <span className="p-column-title">{t('RESELLER')}</span>
                <div className="flex align-items-center gap-2">
                    <div>
                        <div className="font-bold">{rowData.reseller?.reseller_name || '-'}</div>
                        <small className="text-500">{rowData.reseller?.user?.email || '-'}</small>
                    </div>
                </div>
            </>
        );
    };

    const nameBodyTemplate = (rowData: ApiKey) => {
        return (
            <>
                <span className="p-column-title">{t('API_KEY_NAME')}</span>
                <div className="font-bold">{rowData.name}</div>
            </>
        );
    };

    const keyBodyTemplate = (rowData: ApiKey) => {
        const maskedKey = rowData.key ? `${rowData.key.substring(0, 8)}...${rowData.key.substring(rowData.key.length - 4)}` : '';
        return (
            <>
                <span className="p-column-title">{t('API_KEY_VALUE')}</span>
                <div className="flex flex-wrap items-center gap-2">
                    <code className="bg-gray-100 p-2 rounded text-xs sm:text-sm break-all">
                        {showKey[rowData.id] ? rowData.key : maskedKey}
                    </code>
                    <div className="flex gap-1">
                        <PrimeButton
                            icon={showKey[rowData.id] ? "pi pi-eye-slash" : "pi pi-eye"}
                            rounded
                            text
                            severity="secondary"
                            onClick={() => toggleShowKey(rowData.id)}
                            tooltip={showKey[rowData.id] ? t('HIDE_KEY') : t('SHOW_KEY')}
                            className="p-button-sm"
                        />
                        <PrimeButton
                            icon="pi pi-copy"
                            rounded
                            text
                            severity="info"
                            onClick={() => copyToClipboard(rowData.key)}
                            tooltip={t('COPY_KEY')}
                            className="p-button-sm"
                        />
                    </div>
                </div>
            </>
        );
    };

    const statusBodyTemplate = (rowData: ApiKey) => {
        const isExpired = rowData.expires_at && new Date(rowData.expires_at) < new Date();
        const status = rowData.is_active ? (isExpired ? 'expired' : 'active') : 'inactive';

        const statusConfig: Record<string, { severity: string, label: string }> = {
            'active': { severity: 'success', label: t('ACTIVE') },
            'inactive': { severity: 'danger', label: t('INACTIVE') },
            'expired': { severity: 'warning', label: t('EXPIRED') }
        };

        const config = statusConfig[status] || statusConfig['inactive'];

        return (
            <>
                <span className="p-column-title">{t('STATUS')}</span>
                <Tag
                    value={config.label}
                    severity={config.severity as any}
                />
            </>
        );
    };

    const allowedIpsBodyTemplate = (rowData: ApiKey) => {
        const ips = rowData.allowed_ips || [];
        const displayIps = ips.slice(0, 2);
        const remainingCount = ips.length - 2;

        return (
            <>
                <span className="p-column-title">{t('ALLOWED_IPS')}</span>
                <div className="flex flex-wrap gap-1">
                    {displayIps.map((ip, index) => (
                        <Badge key={index} variant="secondary" className="text-[10px] font-normal">
                            {ip}
                        </Badge>
                    ))}
                    {remainingCount > 0 && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                            +{remainingCount}
                        </Badge>
                    )}
                    {ips.length === 0 && (
                        <span className="text-gray-400 text-sm">*</span>
                    )}
                </div>
            </>
        );
    };

    const rateLimitBodyTemplate = (rowData: ApiKey) => {
        return (
            <>
                <span className="p-column-title">{t('RATE_LIMIT')}</span>
                <span className="font-bold">{rowData.rate_limit} {t('REQUESTS_PER_MINUTE')}</span>
            </>
        );
    };

    const expiresAtBodyTemplate = (rowData: ApiKey) => {
        if (!rowData.expires_at) {
            return (
                <>
                    <span className="p-column-title">{t('EXPIRES_AT')}</span>
                    <span className="text-gray-400 text-sm">{t('NEVER')}</span>
                </>
            );
        }

        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        return (
            <>
                <span className="p-column-title">{t('EXPIRES_AT')}</span>
                <span>{formatDate(rowData.expires_at)}</span>
            </>
        );
    };

    const lastUsedAtBodyTemplate = (rowData: ApiKey) => {
        if (!rowData.last_used_at) {
            return (
                <>
                    <span className="p-column-title">{t('LAST_USED')}</span>
                    <span className="text-gray-400 text-sm">{t('NEVER_USED')}</span>
                </>
            );
        }

        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        return (
            <>
                <span className="p-column-title">{t('LAST_USED')}</span>
                <span>{formatDate(rowData.last_used_at)}</span>
            </>
        );
    };

    const createdAtBodyTemplate = (rowData: ApiKey) => {
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return (
                <div>
                    <div><small>{date.toLocaleDateString()}</small></div>
                    <div><small>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div>
                </div>
            );
        };

        return (
            <>
                <span className="p-column-title">{t('CREATED_AT')}</span>
                {formatDate(rowData.created_at)}
            </>
        );
    };

    const actionBodyTemplate = (rowData: ApiKey) => <RowActions items={apiKeyRowActions(rowData)} />;

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        setCurrentPage(page);
    };

    const deleteApiKeyDialogFooter = (
        <>
            <PrimeButton label={t('CANCEL')} icon="pi pi-times" severity="secondary" onClick={hideDeleteApiKeyDialog} />
            <PrimeButton label={t('DELETE')} icon="pi pi-trash" severity="danger" onClick={deleteApiKey} />
        </>
    );

    const regenerateDialogFooter = (
        <>
            <PrimeButton label={t('CANCEL')} icon="pi pi-times" severity="secondary" onClick={() => setRegenerateDialog(false)} />
            <PrimeButton label={t('REGENERATE')} icon="pi pi-refresh" severity="warning" onClick={regenerateApiKey} />
        </>
    );

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.API_KEYS', { defaultValue: 'کلیدهای API' })}
                description="مدیریت کلیدهای دسترسی نمایندگان"
                loading={loading}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <UiButton variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </UiButton>
                        <UiButton size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('CREATE_API_KEY')}
                        </UiButton>
                    </div>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('SEARCH_API_KEYS', { defaultValue: 'جستجو در کلیدهای API...' })}
                        chips={filterChips}
                        onRemoveChip={removeFilterChip}
                        onClearAll={clearAllFilters}
                        onOpenFilters={() => setFilterOpen(true)}
                    />
                }
                footer={
                    pagination?.total ? (
                        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
                            {t('TOTAL', { defaultValue: 'مجموع' })}: {pagination.total}
                        </div>
                    ) : null
                }
            >
                    <DataTable
                        ref={dt}
                        value={apiKeys}
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
                                ? `Showing {first} to {last} of {totalRecords} entries`
                                : `Showing {first} to {last} of {totalRecords} entries`
                        }
                        emptyMessage={t('NO_API_KEYS')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        responsiveLayout="scroll"
                        totalRecords={pagination?.total}
                        lazy
                        onPage={onPageChange}
                        first={(currentPage - 1) * 10}
                    >
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('RESELLER')}
                            body={resellerBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('API_KEY_NAME')}
                            body={nameBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('API_KEY_VALUE')}
                            body={keyBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('STATUS')}
                            body={statusBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('ALLOWED_IPS')}
                            body={allowedIpsBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('RATE_LIMIT')}
                            body={rateLimitBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('EXPIRES_AT')}
                            body={expiresAtBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('LAST_USED')}
                            body={lastUsedAtBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('CREATED_AT')}
                            body={createdAtBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: 'start' }}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '4.5rem' }}
                            header={t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                        ></Column>
                    </DataTable>
            </ListPage>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side={isRTL() ? 'right' : 'left'} className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{t('FILTER', { defaultValue: 'فیلتر' })}</SheetTitle>
                        <SheetDescription>فیلترها روی نتایج سرور اعمال می‌شوند.</SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('RESELLER')}</label>
                            <Dropdown
                                options={resellers}
                                value={filters.filter_reseller_id}
                                onChange={(e) => setFilters({ ...filters, filter_reseller_id: e.value })}
                                optionLabel="reseller_name"
                                optionValue="id"
                                filter
                                filterBy="reseller_name"
                                filterPlaceholder={t('SEARCH')}
                                showFilterClear
                                placeholder={t('SELECT_RESELLER')}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('STATUS')}</label>
                            <Dropdown
                                options={[
                                    { label: t('ACTIVE'), value: 'active' },
                                    { label: t('INACTIVE'), value: 'inactive' }
                                ]}
                                value={filters.filter_status}
                                onChange={(e) => setFilters({ ...filters, filter_status: e.value })}
                                placeholder={t('SELECT_STATUS')}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{t('EXPIRATION')}</label>
                            <Dropdown
                                options={[
                                    { label: t('EXPIRED'), value: true },
                                    { label: t('NOT_EXPIRED'), value: false }
                                ]}
                                value={filters.filter_expired}
                                onChange={(e) => setFilters({ ...filters, filter_expired: e.value })}
                                placeholder={t('SELECT_EXPIRATION')}
                                className="w-full"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <UiButton
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                    setFilters({
                                        filter_status: null,
                                        filter_expired: null,
                                        filter_reseller_id: null
                                    })
                                }
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
                open={apiKeyDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="xl"
                side="left"
                title={apiKey.id ? t('EDIT_API_KEY') : t('CREATE_API_KEY')}
                description={t('API_KEY.FORM.SHEET_HINT', { defaultValue: 'اطلاعات کلید API را تکمیل کنید.' })}
                footer={
                    <FormActions onCancel={hideDialog} onSubmit={saveApiKey} cancelLabel={t('CANCEL')} submitLabel={t('SAVE')} />
                }
            >
                <FormSection title={t('API_KEY.FORM.SECTION.MAIN', { defaultValue: 'اطلاعات اصلی' })}>
                    <FormField label={t('RESELLER')} required error={submitted && !apiKey.reseller ? t('REQUIRED') : null} fullWidth>
                        <SearchSelect
                            value={apiKey.reseller}
                            options={resellers || []}
                            onChange={(selected) => setApiKey({ ...apiKey, reseller: selected })}
                            optionLabel="reseller_name"
                            searchPlaceholder={t('SEARCH')}
                            placeholder={t('SELECT_RESELLER')}
                            error={submitted && !apiKey.reseller}
                            returnFullObject
                            onSearch={(term) => setResellerSearchTerm(term)}
                        />
                    </FormField>
                    <FormField label={t('API_KEY_NAME')} required error={submitted && !apiKey.name ? t('REQUIRED') : null}>
                        <Input
                            id="name"
                            value={apiKey.name}
                            onChange={(e) => setApiKey({ ...apiKey, name: e.target.value })}
                            placeholder={t('ENTER_API_KEY_NAME')}
                            className={classNames('w-full', { 'p-invalid': submitted && !apiKey.name })}
                        />
                    </FormField>
                    <FormField label={t('RATE_LIMIT')} hint={t('RATE_LIMIT_HELP')}>
                        <Input
                            id="rate_limit"
                            type="number"
                            value={apiKey.rate_limit?.toString()}
                            onChange={(e) => setApiKey({ ...apiKey, rate_limit: parseInt(e.target.value) || 1000 })}
                            placeholder="1000"
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('EXPIRES_AT')} hint={t('EXPIRES_AT_HELP')}>
                        <DateField
                            id="expires_at"
                            value={apiKey.expires_at ? apiKey.expires_at.slice(0, 10) : ''}
                            onValueChange={(v) =>
                                setApiKey({
                                    ...apiKey,
                                    expires_at: v ? new Date(`${v}T00:00:00`).toISOString() : ''
                                })
                            }
                            className="w-full"
                        />
                    </FormField>
                </FormSection>
                <FormSection title={t('API_KEY.FORM.SECTION.ACCESS', { defaultValue: 'دسترسی IP' })}>
                    <FormField label={t('ALLOWED_IPS')} fullWidth hint={t('ALLOWED_IPS_HELP')}>
                        <TagInput
                            value={apiKey.allowed_ips || []}
                            onChange={(ips) => setApiKey({ ...apiKey, allowed_ips: ips })}
                            placeholder={t('IP_ADDRESS_PLACEHOLDER')}
                            addLabel={t('ADD_IP')}
                        />
                    </FormField>
                </FormSection>
                {!apiKey.id && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <div className="flex items-center gap-2">
                            <i className="pi pi-exclamation-triangle text-amber-600" />
                            <span>{t('WARNING_KEY_SHOWN')}</span>
                        </div>
                    </div>
                )}
            </FormSheet>

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        visible={deleteApiKeyDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM_DELETE')}
                        modal
                        footer={deleteApiKeyDialogFooter}
                        onHide={hideDeleteApiKeyDialog}
                    >
                        <div className="flex align-items-center justify-content-center p-3">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: 'red' }} />
                            <span>{t('API_KEY_DELETE_CONFIRM')}</span>
                        </div>
                    </Dialog>

                    {/* Regenerate Confirmation Dialog */}
                    <Dialog
                        visible={regenerateDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM_REGENERATE')}
                        modal
                        footer={regenerateDialogFooter}
                        onHide={() => setRegenerateDialog(false)}
                    >
                        <div className="flex align-items-center justify-content-center p-3">
                            <i className="pi pi-refresh mr-3" style={{ fontSize: '2rem', color: 'var(--orange-500)' }} />
                            <span>{t('API_KEY_REGENERATE_CONFIRM')}</span>
                        </div>
                    </Dialog>
        </div>
    );
};

export default withAuth(ApiKeysPage);
