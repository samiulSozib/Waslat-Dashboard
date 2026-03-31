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
import { AppDispatch } from '@/app/redux/store';
import { ApiKey } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import {
    _fetchApiKeys,
    _createApiKey,
    _updateApiKey,
    _deleteApiKey,
    _regenerateApiKey
} from '@/app/redux/actions/apiKeyActions';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { Tag } from 'primereact/tag';
import { Chip } from 'primereact/chip';
import { Calendar } from 'primereact/calendar';
import { useRouter, useSearchParams } from 'next/navigation';

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
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { apiKeys, loading, pagination } = useSelector((state: any) => state.apiKeyReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');
    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
    const [filters, setFilters] = useState({
        filter_status: null as string | null,
        filter_expired: null as boolean | null,
        filter_reseller_id: null as number | null
    });
    const [activeFilters, setActiveFilters] = useState({});
    const filterRef = useRef<HTMLDivElement>(null);
    const [showKey, setShowKey] = useState<{ [key: number]: boolean }>({});
    const [newIp, setNewIp] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const searchParams = useSearchParams();
    const router = useRouter();

    // Fetch API keys and resellers
    useEffect(() => {
        dispatch(_fetchApiKeys(currentPage, searchTag, activeFilters));
        dispatch(_fetchResellers(1, '', '', 10000));
    }, [dispatch, searchTag, activeFilters, currentPage]);

    // Debounced search for resellers
    useEffect(() => {
        const timer = setTimeout(() => {
            if (resellerSearchTerm) {
                dispatch(_fetchResellers(1, resellerSearchTerm, '', 10000));
            } else {
                dispatch(_fetchResellers(1, '', '', 10000));
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
        setNewIp('');
    };

    const hideDialog = () => {
        setSubmitted(false);
        setApiKeyDialog(false);
        setNewIp('');
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

    const addIpAddress = () => {
        if (!newIp) return;

        const ipPattern = /^(\*|(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?)$/;
        if (!ipPattern.test(newIp) && newIp !== '*') {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('INVALID_IP'),
                life: 3000
            });
            return;
        }

        const currentIps = apiKey.allowed_ips || [];
        if (!currentIps.includes(newIp)) {
            setApiKey({
                ...apiKey,
                allowed_ips: [...currentIps, newIp]
            });
            setNewIp('');
        }
    };

    const removeIpAddress = (ipToRemove: string) => {
        setApiKey({
            ...apiKey,
            allowed_ips: (apiKey.allowed_ips || []).filter(ip => ip !== ipToRemove)
        });
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex flex-wrap gap-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('CREATE_API_KEY')}
                        icon="pi pi-plus"
                        severity="success"
                        className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
                        onClick={openNew}
                    />
                    <div className="relative" ref={filterRef}>
                        {/* <Button
                            label={t('FILTER')}
                            icon="pi pi-filter"
                            className="p-button-info"
                            onClick={() => setFilterDialogVisible(!filterDialogVisible)}
                        /> */}
                        {filterDialogVisible && (
                            <div
                                className="p-card p-fluid absolute top-full right-0 mt-2 z-10"
                                style={{ width: '300px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                            >
                                <div className="p-card-body p-3">
                                    <div className="grid">
                                        {/* Reseller Filter */}
                                        <div className="col-12">
                                            <label className="text-sm">{t('RESELLER')}</label>
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

                                        {/* Status Filter */}
                                        <div className="col-12">
                                            <label className="text-sm">{t('STATUS')}</label>
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

                                        {/* Expired Filter */}
                                        <div className="col-12">
                                            <label className="text-sm">{t('EXPIRATION')}</label>
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

                                        {/* Action Buttons */}
                                        <div className="col-12 flex justify-content-between gap-2 mt-3">
                                            <Button
                                                label={t('RESET')}
                                                icon="pi pi-times"
                                                className="p-button-secondary p-button-sm"
                                                onClick={() => {
                                                    setFilters({
                                                        filter_status: null,
                                                        filter_expired: null,
                                                        filter_reseller_id: null
                                                    });
                                                }}
                                            />
                                            <Button
                                                label={t('APPLY')}
                                                icon="pi pi-check"
                                                className="p-button-sm"
                                                onClick={() => {
                                                    handleSubmitFilter(filters);
                                                    setFilterDialogVisible(false);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="p-input-icon-left w-full sm:w-auto">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e) => setSearchTag(e.currentTarget.value)}
                    placeholder={t('SEARCH_API_KEYS')}
                    className="w-full"
                />
            </div>
        );
    };

    const handleSubmitFilter = (filters: any) => {
        const cleanedFilters: any = {};
        if (filters.filter_status) cleanedFilters.status = filters.filter_status;
        if (filters.filter_expired !== null && filters.filter_expired !== undefined) {
            cleanedFilters.expired = filters.filter_expired;
        }
        if (filters.filter_reseller_id) cleanedFilters.reseller_id = filters.filter_reseller_id;
        setActiveFilters(cleanedFilters);
        setCurrentPage(1);
    };

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
                        <Button
                            icon={showKey[rowData.id] ? "pi pi-eye-slash" : "pi pi-eye"}
                            rounded
                            text
                            severity="secondary"
                            onClick={() => toggleShowKey(rowData.id)}
                            tooltip={showKey[rowData.id] ? t('HIDE_KEY') : t('SHOW_KEY')}
                            className="p-button-sm"
                        />
                        <Button
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

        const statusConfig: Record<string, { severity: string,  label: string }> = {
            'active': { severity: 'success', label: t('ACTIVE') },
            'inactive': { severity: 'danger',  label: t('INACTIVE') },
            'expired': { severity: 'warning',  label: t('EXPIRED') }
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
                        <Chip key={index} label={ip} className="text-xs" />
                    ))}
                    {remainingCount > 0 && (
                        <Chip label={`+${remainingCount}`} className="text-xs" />
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

    const actionBodyTemplate = (rowData: ApiKey) => {
        return (
            <div className="flex gap-1">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    severity="info"
                    className="p-button-sm"
                    onClick={() => editApiKey(rowData)}
                    tooltip={t('EDIT')}
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-refresh"
                    rounded
                    severity="warning"
                    className="p-button-sm"
                    onClick={() => confirmRegenerateApiKey(rowData)}
                    tooltip={t('REGENERATE')}
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    severity="danger"
                    className="p-button-sm"
                    onClick={() => confirmDeleteApiKey(rowData)}
                    tooltip={t('DELETE')}
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        setCurrentPage(page);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('.p-dropdown-panel')) return;
            if (filterDialogVisible && filterRef.current && !filterRef.current.contains(target)) {
                setFilterDialogVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [filterDialogVisible]);

    const apiKeyDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('SAVE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveApiKey} />
        </>
    );

    const deleteApiKeyDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="secondary" onClick={hideDeleteApiKeyDialog} />
            <Button label={t('DELETE')} icon="pi pi-trash" severity="danger" onClick={deleteApiKey} />
        </>
    );

    const regenerateDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="secondary" onClick={() => setRegenerateDialog(false)} />
            <Button label={t('REGENERATE')} icon="pi pi-refresh" severity="warning" onClick={regenerateApiKey} />
        </>
    );

    return (
        <div className="grid -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />

                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

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
                        globalFilter={globalFilter}
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
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '8rem' }}
                            header={t('COMMON.ACTIONS')}
                        ></Column>
                    </DataTable>

                    {/* Create/Edit API Key Dialog */}
                    <Dialog
                        visible={apiKeyDialog}
                        style={{ width: '700px', padding: '5px' }}
                        header={apiKey.id ? t('EDIT_API_KEY') : t('CREATE_API_KEY')}
                        modal
                        className="p-fluid"
                        footer={apiKeyDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="card" style={{ padding: '20px' }}>
                            {/* Reseller Selection */}
                            <div className="field mb-4">
                                <label htmlFor="reseller" style={{ fontWeight: 'bold' }}>
                                    {t('RESELLER')} *
                                </label>
                                <Dropdown
                                    id="reseller"
                                    value={apiKey.reseller}
                                    options={resellers}
                                    onChange={(e) => setApiKey({ ...apiKey, reseller: e.value })}
                                    optionLabel="reseller_name"
                                    filter
                                    filterBy="reseller_name"
                                    filterPlaceholder={t('SEARCH')}
                                    showFilterClear
                                    placeholder={t('SELECT_RESELLER')}
                                    className={classNames('w-full', { 'p-invalid': submitted && !apiKey.reseller })}
                                    onFilter={(e) => setResellerSearchTerm(e.filter)}
                                />
                                {submitted && !apiKey.reseller && (
                                    <small className="p-error">{t('REQUIRED')}</small>
                                )}
                            </div>

                            {/* API Key Name */}
                            <div className="field mb-4">
                                <label htmlFor="name" style={{ fontWeight: 'bold' }}>
                                    {t('API_KEY_NAME')} *
                                </label>
                                <InputText
                                    id="name"
                                    value={apiKey.name}
                                    onChange={(e) => setApiKey({ ...apiKey, name: e.target.value })}
                                    placeholder={t('ENTER_API_KEY_NAME')}
                                    className={classNames('w-full', { 'p-invalid': submitted && !apiKey.name })}
                                />
                                {submitted && !apiKey.name && (
                                    <small className="p-error">{t('REQUIRED')}</small>
                                )}
                            </div>

                            {/* Rate Limit */}
                            <div className="field mb-4">
                                <label htmlFor="rate_limit" style={{ fontWeight: 'bold' }}>
                                    {t('RATE_LIMIT')}
                                </label>
                                <InputText
                                    id="rate_limit"
                                    type="number"
                                    value={apiKey.rate_limit?.toString()}
                                    onChange={(e) => setApiKey({ ...apiKey, rate_limit: parseInt(e.target.value) || 1000 })}
                                    placeholder="1000"
                                    className="w-full"
                                />
                                <small className="text-gray-400">{t('RATE_LIMIT_HELP')}</small>
                            </div>

                            {/* Expiration Date */}
                            <div className="field mb-4">
                                <label htmlFor="expires_at" style={{ fontWeight: 'bold' }}>
                                    {t('EXPIRES_AT')}
                                </label>
                                <Calendar
                                    id="expires_at"
                                    value={apiKey.expires_at ? new Date(apiKey.expires_at) : null}
                                    onChange={(e) => setApiKey({ ...apiKey, expires_at: e.value?.toISOString() || '' })}
                                    showIcon
                                    dateFormat="yy-mm-dd"
                                    placeholder={t('SELECT_EXPIRATION_DATE')}
                                    className="w-full"
                                />
                                <small className="text-gray-400">{t('EXPIRES_AT_HELP')}</small>
                            </div>

                            {/* Allowed IPs */}
                            <div className="field mb-4">
                                <label htmlFor="allowed_ips" style={{ fontWeight: 'bold' }}>
                                    {t('ALLOWED_IPS')}
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    <InputText
                                        id="allowed_ips"
                                        value={newIp}
                                        onChange={(e) => setNewIp(e.target.value)}
                                        placeholder={t('IP_ADDRESS_PLACEHOLDER')}
                                        className="flex-1"
                                        onKeyPress={(e) => e.key === 'Enter' && addIpAddress()}
                                    />
                                    <Button icon="pi pi-plus" severity="info" onClick={addIpAddress} tooltip={t('ADD_IP')} />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {(apiKey.allowed_ips || []).map((ip, index) => (
                                        <Chip key={index} label={ip} removable onRemove={() => removeIpAddress(ip)} />
                                    ))}
                                </div>
                                <small className="text-gray-400">{t('ALLOWED_IPS_HELP')}</small>
                            </div>

                            {/* Warning for new API keys */}
                            {!apiKey.id && (
                                <div className="bg-yellow-50 border-round p-3 mt-3">
                                    <div className="flex gap-2 align-items-center">
                                        <i className="pi pi-exclamation-triangle text-yellow-600"></i>
                                        <span className="text-sm text-yellow-700">{t('WARNING_KEY_SHOWN')}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Dialog>

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
            </div>
        </div>
    );
};

export default withAuth(ApiKeysPage);
