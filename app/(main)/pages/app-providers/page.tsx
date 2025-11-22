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
import { Paginator } from 'primereact/paginator';
import { AppDispatch } from '@/app/redux/store';
import { ProgressBar } from 'primereact/progressbar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { _fetchProviders, _addProvider, _editProvider, _deleteProvider, _deleteSelectedProviders, _toggleProvider } from '@/app/redux/actions/providerActions';
import { Provider } from '@/types/interface';
import { InputSwitch } from 'primereact/inputswitch';
import { MultiSelect } from 'primereact/multiselect';
import { Accordion, AccordionTab } from 'primereact/accordion';

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
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { providers, pagination, loading } = useSelector((state: any) => state.providerReducer);
    const { internets, rawInternets } = useSelector((state: any) => state.singleProviderReducer);

    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');
    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
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

    const capabilityOptions = [
        { label: t('PROVIDER.CAPABILITIES.TOPUP'), value: 'topup' },
        { label: t('PROVIDER.CAPABILITIES.INTERNET'), value: 'internet' },
        { label: t('PROVIDER.CAPABILITIES.BILL'), value: 'bill' },
        { label: t('PROVIDER.CAPABILITIES.CREDIT'), value: 'credit' },
        { label: t('PROVIDER.CAPABILITIES.PRODUCTS'), value: 'products' }
    ];



    useEffect(() => {
        dispatch(_fetchProviders(1, searchTag));
    }, [dispatch, searchTag]);



    useEffect(() => {
        if (Object.keys(activeFilters).length > 0) {
            dispatch(_fetchProviders(1, searchTag, activeFilters));
        }
    }, [dispatch, activeFilters, searchTag]);

    const [ipWhitelistText, setIpWhitelistText] = useState(provider.ip_whitelist.join(', '));

    useEffect(() => {
        setIpWhitelistText(provider.ip_whitelist.join(', '));
    }, [provider.ip_whitelist]);

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

    const filterRef = useRef<HTMLDivElement>(null);

    const handleSubmitFilter = (filters: any) => {
        setActiveFilters(filters);
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

    const rightToolbarTemplate = () => {
        const hasSelectedProviders = selectedProviders && (selectedProviders as any).length > 0;
        return (
            <React.Fragment>
                <div className="my-2" style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                    <div ref={filterRef} style={{ position: 'relative' }}>
                        <Button label={t('ORDER.FILTER.FILTER')} icon="pi pi-filter" className="p-button-info" onClick={() => setFilterDialogVisible(!filterDialogVisible)} />
                        {filterDialogVisible && (
                            <div
                                className="p-card p-fluid"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: isRTL() ? 0 : '',
                                    right: isRTL() ? '' : 0,
                                    width: '300px',
                                    zIndex: 1000,
                                    marginTop: '0.5rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div className="p-card-body" style={{ padding: '1rem' }}>
                                    <div className="grid">
                                        {/* Status Filter */}
                                        <div className="col-12">
                                            <label htmlFor="statusFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('PROVIDER.STATUS')}
                                            </label>
                                            <Dropdown
                                                id="statusFilter"
                                                options={[
                                                    { label: t('APP.GENERAL.ACTIVE'), value: true },
                                                    { label: t('APP.GENERAL.INACTIVE'), value: false }
                                                ]}
                                                value={filters.filter_status}
                                                onChange={(e) => setFilters({ ...filters, filter_status: e.value })}
                                                placeholder={t('ORDER.FILTER.SELECT_STATUS')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Capability Filter */}
                                        <div className="col-12">
                                            <label htmlFor="capabilityFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('PROVIDER.CAPABILITIES.TITLE')}
                                            </label>
                                            <Dropdown
                                                id="capabilityFilter"
                                                options={capabilityOptions}
                                                value={filters.filter_capability}
                                                onChange={(e) => setFilters({ ...filters, filter_capability: e.value })}
                                                placeholder={t('PROVIDER.FILTER.SELECT_CAPABILITY')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="col-12 mt-3 flex justify-content-between gap-2">
                                            <Button
                                                label={t('RESET')}
                                                icon="pi pi-times"
                                                className="p-button-secondary p-button-sm"
                                                onClick={() => {
                                                    setFilters({
                                                        filter_status: null,
                                                        filter_capability: null
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
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('PROVIDER.TABLE.CREATEPROVIDER')}
                        icon="pi pi-plus"
                        severity="success"
                        className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
                        onClick={openNew}
                    />
                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex items-center">
                <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setSearchTag(e.currentTarget.value)} placeholder={t('ECOMMERCE.COMMON.SEARCH')} className="w-full md:w-auto" />
                </span>
            </div>
        );
    };

    const codeBodyTemplate = (rowData: Provider) => {
        return (
            <>
                <span className="p-column-title">Code</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.code}</span>
            </>
        );
    };

    const nameBodyTemplate = (rowData: Provider) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.name}</span>
            </>
        );
    };

    const baseUrlBodyTemplate = (rowData: Provider) => {
        return (
            <>
                <span className="p-column-title">Base URL</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.base_url}</span>
            </>
        );
    };

    const capabilitiesBodyTemplate = (rowData: Provider) => {
        return (
            <>
                <span className="p-column-title">Capabilities</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {rowData.capabilities &&
                        rowData.capabilities.map((capability, index) => (
                            <span key={index} className="p-tag p-tag-rounded" style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                                {capability}
                            </span>
                        ))}
                </div>
            </>
        );
    };

    const statusBodyTemplate = (rowData: Provider) => {

        const handleToggle = (checked: boolean) => {
            dispatch(_toggleProvider(rowData.id, checked, toast, t));
        };

        return (
            <>
                <span className="p-column-title">{t("APP.GENERAL.STATUS")}</span>
                <InputSwitch
                    checked={rowData.is_active}
                    onChange={(e) => handleToggle(e.value)}
                />
            </>
        );
    };

    const createdAtBodyTemplate = (rowData: Provider) => {
        const formatDate = (dateString: string | null) => {
            if (!dateString) return { formattedDate: '-', formattedTime: '-' };

            const date = new Date(dateString);
            const optionsDate: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const optionsTime: Intl.DateTimeFormatOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            const formattedDate = date.toLocaleDateString('en-US', optionsDate);
            const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

            return { formattedDate, formattedTime };
        };

        const { formattedDate, formattedTime } = formatDate(rowData.created_at);

        return (
            <>
                <span className="p-column-title">Created At</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Provider) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editProvider(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteProvider(rowData)} />
            </>
        );
    };

    const providerDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveProvider} />
        </>
    );
    const deleteProviderDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteProviderDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteProvider} />
        </>
    );
    const deleteProvidersDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteProvidersDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedProviders} />
        </>
    );

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        // Implement pagination if needed
        dispatch(_fetchProviders(page, searchTag, activeFilters));
    };

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={providers}
                        selection={selectedProviders}
                        onSelectionChange={(e) => setSelectedProviders(e.value as any)}
                        dataKey="id"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        responsiveLayout="scroll"
                        paginator={false}
                        rows={pagination?.items_per_page || 10}
                        totalRecords={pagination?.total || providers.length}
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                    >
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="code" header={t('PROVIDER.TABLE.COLUMN.CODE')} body={codeBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="name" header={t('PROVIDER.TABLE.COLUMN.NAME')} body={nameBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="base_url" header={t('PROVIDER.TABLE.COLUMN.BASEURL')} body={baseUrlBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="capabilities"
                            header={t('PROVIDER.TABLE.COLUMN.CAPABILITIES')}
                            body={capabilitiesBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="is_active" header={t('PROVIDER.TABLE.COLUMN.STATUS')} body={statusBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="created_at" header={t('TABLE.GENERAL.CREATEDAT')} body={createdAtBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>
                    <Paginator
                        first={0}
                        rows={pagination?.items_per_page || 10}
                        totalRecords={pagination?.total || providers.length}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL() ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        firstPageLinkIcon={
                            isRTL()
                                ? "pi pi-angle-double-right"
                                : "pi pi-angle-double-left"
                        }
                        lastPageLinkIcon={
                            isRTL()
                                ? "pi pi-angle-double-left"
                                : "pi pi-angle-double-right"
                        }
                    />

                    <Dialog
                        visible={providerDialog}
                        style={{ width: '95%', maxWidth: '900px' }}
                        header={t('PROVIDER.DETAILS')}
                        modal
                        className="p-fluid"
                        footer={providerDialogFooter}
                        onHide={hideDialog}
                        breakpoints={{ '960px': '75vw', '640px': '90vw' }}
                    >
                        <div className="card p-2 md:p-4">
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="code" className="font-bold block mb-2">
                                        {t('PROVIDER.FORM.INPUT.CODE')} *
                                    </label>
                                    <InputText
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
                                    {submitted && !provider.code && (
                                        <small className="p-invalid block mt-1" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label htmlFor="name" className="font-bold block mb-2">
                                        {t('PROVIDER.FORM.INPUT.NAME')} *
                                    </label>
                                    <InputText
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
                                    {submitted && !provider.name && (
                                        <small className="p-invalid block mt-1" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="formgrid grid mt-3">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="base_url" className="font-bold block mb-2">
                                        {t('PROVIDER.FORM.INPUT.BASEURL')} *
                                    </label>
                                    <InputText
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
                                    {submitted && !provider.base_url && (
                                        <small className="p-invalid block mt-1" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label htmlFor="failover_priority" className="font-bold block mb-2">
                                        {t('PROVIDER.FORM.INPUT.FAILOVERPRIORITY')}
                                    </label>
                                    <InputText
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
                                </div>
                            </div>

                            <div className="formgrid grid mt-3">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="timeout_seconds" className="font-bold block mb-2">
                                        {t('PROVIDER.FORM.INPUT.TIMEOUT')}
                                    </label>
                                    <InputText
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
                                </div>

                                <div className="field col-12 md:col-6">
                                    <label htmlFor="capabilities" className="font-bold block mb-2">
                                        {t('PROVIDER.FORM.INPUT.CAPABILITIES')}
                                    </label>
                                    <MultiSelect
                                        id="capabilities"
                                        value={provider.capabilities}
                                        options={capabilityOptions}
                                        onChange={(e) =>
                                            setProvider((prev) => ({
                                                ...prev,
                                                capabilities: e.value
                                            }))
                                        }
                                        placeholder={t('PROVIDER.FORM.PLACEHOLDER.CAPABILITIES')}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="formgrid grid mt-3">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="ip_whitelist" className="font-bold block mb-2">
                                        {t('PROVIDER.FORM.INPUT.IPWHITELIST')}
                                    </label>
                                    <InputText
                                        id="ip_whitelist"
                                        value={ipWhitelistText}
                                        onChange={(e) => {
                                            const text = e.target.value;
                                            setIpWhitelistText(text);
                                            setProvider((prev) => ({
                                                ...prev,
                                                ip_whitelist: text.split(',').map((ip) => ip.trim())
                                            }));
                                        }}
                                        onBlur={() => {
                                            setProvider((prev) => ({
                                                ...prev,
                                                ip_whitelist: ipWhitelistText
                                                    .split(',')
                                                    .map((ip) => ip.trim())
                                                    .filter((ip) => ip !== '')
                                            }));
                                        }}
                                        placeholder={t('PROVIDER.FORM.PLACEHOLDER.IPWHITELIST')}
                                        className="w-full"
                                    />
                                    <small className="text-gray-600 block mt-1">{t('PROVIDER.FORM.HELP.IPWHITELIST')}</small>
                                </div>

                                <div className="field col-12 md:col-6 flex items-center">
                                    <label htmlFor="is_active" className="font-bold mr-3">
                                        {t('PROVIDER.FORM.INPUT.STATUS')}
                                    </label>
                                    <InputSwitch
                                        id="is_active"
                                        checked={provider.is_active}
                                        onChange={(e) =>
                                            setProvider((prev) => ({
                                                ...prev,
                                                is_active: e.value
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* Metadata Section */}
                            <div className="mt-4">
                                <Accordion multiple>
                                    <AccordionTab header={t('PROVIDER.FORM.SECTION.METADATA')}>
                                        <div className="formgrid grid">
                                            <div className="field col-12 md:col-6">
                                                <label htmlFor="callback_url" className="font-bold block mb-2">
                                                    {t('PROVIDER.FORM.INPUT.CALLBACK_URL')}
                                                </label>
                                                <InputText
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
                                                <InputText
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
                                                <label htmlFor="test_mode_supported" className="font-bold mr-3">
                                                    {t('PROVIDER.FORM.INPUT.TEST_MODE_SUPPORTED')}
                                                </label>
                                                <InputSwitch
                                                    id="test_mode_supported"
                                                    checked={provider.metadata?.test_mode_supported || false}
                                                    onChange={(e) =>
                                                        setProvider((prev) => ({
                                                            ...prev,
                                                            metadata: {
                                                                ...prev.metadata,
                                                                test_mode_supported: e.value
                                                            }
                                                        }))
                                                    }
                                                />
                                            </div>

                                            <div className="field col-12 md:col-6 flex items-center mt-3">
                                                <label htmlFor="products_require_params" className="font-bold mr-3">
                                                    {t('PROVIDER.FORM.INPUT.PRODUCTS_REQUIRE_PARAMS')}
                                                </label>
                                                <InputSwitch
                                                    id="products_require_params"
                                                    checked={provider.metadata?.products_require_params || false}
                                                    onChange={(e) =>
                                                        setProvider((prev) => ({
                                                            ...prev,
                                                            metadata: {
                                                                ...prev.metadata,
                                                                products_require_params: e.value
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
                                                            <InputText value={input.key} onChange={(e) => updateHeader(index, 'key', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.HEADER_KEY')} className="flex-1" />
                                                            <InputText value={input.value} onChange={(e) => updateHeader(index, 'value', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.HEADER_VALUE')} className="flex-1" />
                                                            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => removeHeader(index)} />
                                                        </div>
                                                    ))}
                                                    <div className="flex flex-col md:flex-row gap-2 items-center mt-3">
                                                        <InputText value={newHeaderKey} onChange={(e) => setNewHeaderKey(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.HEADER_KEY')} className="flex-1" />
                                                        <InputText value={newHeaderValue} onChange={(e) => setNewHeaderValue(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.HEADER_VALUE')} className="flex-1" />
                                                        <Button icon="pi pi-plus" className="p-button-success p-button-outlined" onClick={addHeader} />
                                                    </div>
                                                </div>
                                            </AccordionTab>

                                            {/* Credentials Section */}
                                            <AccordionTab header={t('PROVIDER.FORM.SECTION.CREDENTIALS')}>
                                                <div className="space-y-2">
                                                    {credentialInputs.map((input, index) => (
                                                        <div key={index} className="flex flex-col md:flex-row gap-2 items-center">
                                                            <InputText value={input.key} onChange={(e) => updateCredential(index, 'key', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.CREDENTIAL_KEY')} className="flex-1" />
                                                            <InputText value={input.value} onChange={(e) => updateCredential(index, 'value', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.CREDENTIAL_VALUE')} className="flex-1" />
                                                            <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => removeCredential(index)} />
                                                        </div>
                                                    ))}
                                                    <div className="flex flex-col md:flex-row gap-2 items-center mt-3">
                                                        <InputText value={newCredentialKey} onChange={(e) => setNewCredentialKey(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.CREDENTIAL_KEY')} className="flex-1" />
                                                        <InputText value={newCredentialValue} onChange={(e) => setNewCredentialValue(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.CREDENTIAL_VALUE')} className="flex-1" />
                                                        <Button icon="pi pi-plus" className="p-button-success p-button-outlined" onClick={addCredential} />
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
                                                    <InputText value={input.key} onChange={(e) => updateEndpoint(index, 'key', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.ENDPOINT_KEY')} className="flex-1" />
                                                    <InputText value={input.value} onChange={(e) => updateEndpoint(index, 'value', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.ENDPOINT_VALUE')} className="flex-1" />
                                                    <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => removeEndpoint(index)} />
                                                </div>
                                            ))}
                                            <div className="flex flex-col md:flex-row gap-2 items-center mt-3">
                                                <InputText value={newEndpointKey} onChange={(e) => setNewEndpointKey(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.ENDPOINT_KEY')} className="flex-1" />
                                                <InputText value={newEndpointValue} onChange={(e) => setNewEndpointValue(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.ENDPOINT_VALUE')} className="flex-1" />
                                                <Button icon="pi pi-plus" className="p-button-success p-button-outlined" onClick={addEndpoint} />
                                            </div>
                                        </div>
                                    </AccordionTab>

                                    {/* Method Names Section */}
                                    <AccordionTab header={t('PROVIDER.FORM.SECTION.METHOD_NAMES')}>
                                        <div className="space-y-2">
                                            {methodInputs.map((input, index) => (
                                                <div key={index} className="flex flex-col md:flex-row gap-2 items-center">
                                                    <InputText value={input.key} onChange={(e) => updateMethod(index, 'key', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.METHOD_KEY')} className="flex-1" />
                                                    <InputText value={input.value} onChange={(e) => updateMethod(index, 'value', e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.METHOD_VALUE')} className="flex-1" />
                                                    <Button icon="pi pi-times" className="p-button-danger p-button-outlined" onClick={() => removeMethod(index)} />
                                                </div>
                                            ))}
                                            <div className="flex flex-col md:flex-row gap-2 items-center mt-3">
                                                <InputText value={newMethodKey} onChange={(e) => setNewMethodKey(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.METHOD_KEY')} className="flex-1" />
                                                <InputText value={newMethodValue} onChange={(e) => setNewMethodValue(e.target.value)} placeholder={t('PROVIDER.FORM.PLACEHOLDER.METHOD_VALUE')} className="flex-1" />
                                                <Button icon="pi pi-plus" className="p-button-success p-button-outlined" onClick={addMethod} />
                                            </div>
                                        </div>
                                    </AccordionTab>
                                </Accordion>
                            </div>
                        </div>
                    </Dialog>

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
            </div>
        </div>
    );
};

export default withAuth(ProviderPage);
