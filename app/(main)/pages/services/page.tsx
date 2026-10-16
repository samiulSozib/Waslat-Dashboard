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

import { Dropdown } from 'primereact/dropdown';

import { InputText } from 'primereact/inputtext';

import { InputNumber } from 'primereact/inputnumber';

import { ProgressBar } from 'primereact/progressbar';

import { InputSwitch } from 'primereact/inputswitch';

import { Password } from 'primereact/password';

import { Toast } from 'primereact/toast';

import { Toolbar } from 'primereact/toolbar';

import { classNames } from 'primereact/utils';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useDispatch, useSelector } from 'react-redux';

import withAuth from '../../authGuard';

import { CustomFields } from '../../components/CustomFields';

import { customCellStyleImage } from '../../utilities/customRow';

import { parseInputFormSchema, stringifyInputFormSchema } from '../../utilities/parseInputFormSchema';

import { isRTL } from '../../utilities/rtlUtil';

const Services = () => {

    let emptyService: Service = {

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

    };

    const [serviceDialog, setServiceDialog] = useState(false);

    const [deleteServiceDialog, setDeleteServiceDialog] = useState(false);

    const [deleteServicesDialog, setDeleteServicesDialog] = useState(false);

    const [service, setService] = useState<Service>(emptyService);

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

    const [localSearchTerm, setLocalSearchTerm] = useState('');

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

                <InputNumber

                    value={value}

                    min={0}

                    maxFractionDigits={0}

                    useGrouping={false}

                    disabled={saving}

                    inputStyle={{ width: '60px', textAlign: 'center' }}

                    onValueChange={e => setPriorityDrafts(prev => ({ ...prev, [rowData.id]: e.value ?? null }))}

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

        <InputSwitch checked={Boolean(rowData.is_robot_enabled)}

            disabled={Boolean(savingRows[rowData.id])}

            onChange={e => persistInlineSetting(rowData.id, 'is_robot_enabled', Boolean(e.value))} />

    );

    const apiBodyTemplate = (rowData: Service) => (

        <InputSwitch checked={Boolean(rowData.is_api_enabled)}

            disabled={Boolean(savingRows[rowData.id])}

            onChange={e => persistInlineSetting(rowData.id, 'is_api_enabled', Boolean(e.value))} />

    );

    const providerBodyTemplate = (rowData: Service) => {

        const provider = (providers || []).find((p: Provider) => p.id === Number(rowData.api_provider_id));

        return provider?.name || (rowData.api_provider_id ? `Provider #${rowData.api_provider_id}` : '—');

    };

    useEffect(() => {

        dispatch(_fetchServiceList(''));

        dispatch(_fetchCompanies());

        dispatch(_fetchServiceCategories());

        dispatch(_fetchTelegramList());

        dispatch(_fetchProviders());

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

    const saveService = () => {

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

        if (service.id && service.id !== 0) {

            dispatch(_editService(service.id, serviceData, toast, t));

        } else {

            dispatch(_addService(serviceData, toast, t));

        }

        setServiceDialog(false);

        setService(emptyService);

        setSubmitted(false);

    };

    const editService = (service: Service) => {

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

            display_order: Number(service.display_order ?? 0)

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

    const rightToolbarTemplate = () => {

        const hasSelectedServices = selectedServices && (selectedServices as any).length > 0;

        return (

            <React.Fragment>

                <div className="flex justify-end items-center space-x-2">

                    <Button

                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}

                        label={t('SERVICE.TABLE.CREATESERVICE')}

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

                        disabled={!selectedServices || !(selectedServices as any).length}

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

    //                 <InputText type="search" onInput={(e) => setSearchTag(e.currentTarget.value)} placeholder={t('ECOMMERCE.COMMON.SEARCH')} className="w-full md:w-auto" />

    //             </span>

    //         </div>

    //     );

    // };

    // Searches the currently loaded Redux services without another API call.

    const filteredServices = useMemo(() => {

        const query = localSearchTerm.trim().toLocaleLowerCase();

        const source: Service[] = Array.isArray(services) ? services : [];

        const filtered = !query ? source : source.filter(item => {

            const provider = (providers || []).find((p: Provider) => Number(p.id) === Number(item.api_provider_id));

            const text = [

                item.id, item.service_name, item.company?.company_name,

                item.company?.country?.country_name, item.service_category?.category_name,

                item.telegram_chat_id?.group_name, provider?.name, provider?.code,

                item.display_order, item.api_provider_id

            ].filter(v => v != null).join(' ').toLocaleLowerCase();

            return text.includes(query);

        });

        return [...filtered].sort((a, b) =>

            Number(a.display_order ?? 0) - Number(b.display_order ?? 0) || a.id - b.id

        );

    }, [services, providers, localSearchTerm]);

    const leftToolbarTemplate = () => (

        <div className="flex align-items-center gap-2">

            <span className="p-input-icon-left">

                <i className="pi pi-search" />

                <InputText

                    type="search"

                    value={localSearchTerm}

                    onChange={e => setLocalSearchTerm(e.target.value)}

                    placeholder="Search loaded services..."

                />

            </span>

            {localSearchTerm && (

                <Button

                    type="button" icon="pi pi-times" text severity="secondary"

                    aria-label="Clear search" tooltip="Clear search"

                    onClick={() => setLocalSearchTerm('')}

                />

            )}

        </div>

    );

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

    const actionBodyTemplate = (rowData: Service) => {

        return (

            <>

                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editService(rowData)} />

                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteService(rowData)} />

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

    const companyDialogFooter = (

        <>

            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />

            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveService} />

        </>

    );

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

        <div className="grid crud-demo -m-5">

            <div className="col-12">

                <div className="card p-2">

                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}

                    <Toast ref={toast} />

                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable

                        ref={dt}

                        value={filteredServices}

                        selection={selectedServices}

                        onSelectionChange={(e) => setSelectedServices(e.value as any)}

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

                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}

                        // header={header}

                        responsiveLayout="scroll"

                    >

                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}

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

                        <Column header="API Key" body={(rowData: Service) => rowData.has_api_key ? 'Configured' : '—'} style={{ minWidth: '85px' }} />

                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('TOTAL_CUSTOM_FIELD')} body={customFieldsBodyTemplate}></Column>

                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>

                    </DataTable>

                    <Dialog visible={serviceDialog} style={{ width: '700px', padding: '5px' }} header={t('SERVICE.DETAILS')} modal className="p-fluid" footer={companyDialogFooter} onHide={hideDialog}>

                        <div className="card" style={{ padding: '40px' }}>

                            <div className="field">

                                <label htmlFor="name" style={{ fontWeight: 'bold' }}>

                                    {t('SERVICE.FORM.INPUT.SERVICENAME')}

                                </label>

                                <InputText

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

                                    className={classNames({

                                        'p-invalid': submitted && !service.service_name

                                    })}

                                />

                                {submitted && !service.service_name && (

                                    <small className="p-invalid" style={{ color: 'red' }}>

                                        {t('THIS_FIELD_IS_REQUIRED')}

                                    </small>

                                )}

                            </div>

                            <div className="formgrid grid">

                                <div className="field col">

                                    <label htmlFor="country_id" style={{ fontWeight: 'bold' }}>

                                        {t('SERVICE.FORM.INPUT.COMPANY')}

                                    </label>

                                    <Dropdown

                                        id="company"

                                        value={service.company}

                                        options={companies}

                                        onChange={(e) =>

                                            setService((perv) => ({

                                                ...perv,

                                                company: e.value

                                            }))

                                        }

                                        optionLabel="company_name"

                                        // optionValue='id'

                                        placeholder={t('SERVICE.FORM.PLACEHOLDER.COMPANY')}

                                        className="w-full"

                                    />

                                    {submitted && !service.company && (

                                        <small className="p-invalid" style={{ color: 'red' }}>

                                            {t('THIS_FIELD_IS_REQUIRED')}

                                        </small>

                                    )}

                                </div>

                            </div>

                            <div className="formgrid grid">

                                <div className="field col">

                                    <label htmlFor="country_id" style={{ fontWeight: 'bold' }}>

                                        {t('SERVICE.FORM.INPUT.SERVICECATEGORY')}

                                    </label>

                                    <Dropdown

                                        id="service_category"

                                        value={service.service_category}

                                        options={serviceCategories}

                                        onChange={(e) =>

                                            setService((perv) => ({

                                                ...perv,

                                                service_category: e.value

                                            }))

                                        }

                                        optionLabel="category_name"

                                        // optionValue='id'

                                        placeholder={t('SERVICE.FORM.PLACEHOLDER.ServiceCategory')}

                                        className="w-full"

                                    />

                                    {submitted && !service.service_category && (

                                        <small className="p-invalid" style={{ color: 'red' }}>

                                            {t('THIS_FIELD_IS_REQUIRED')}

                                        </small>

                                    )}

                                </div>

                            </div>

                            <div className='formgrid grid'>

                                <div className="field col">

                                    <label htmlFor="telegram_chat_id" style={{ fontWeight: 'bold' }}>

                                        {t('COMPANY.FORM.INPUT.TELEGRAMID')}

                                    </label>

                                    <Dropdown

                                        id="telegram_chat_id"

                                        value={service.telegram_chat_id}

                                        options={telegramChatIds}

                                        onChange={(e) =>

                                            setService((prevService) => ({

                                                ...prevService,

                                                telegram_chat_id: e.value

                                            }))

                                        }

                                        optionLabel="group_name"

                                        placeholder={t('COMPANY.FORM.PLACEHOLDER.TELEGRAM_GROUP')}

                                        className="w-full"

                                    />

                                </div>

                            </div>

                        </div>

                        <div className="card" style={{ padding: '20px', marginTop: '12px' }}>

                        <h5>Automation & API Settings</h5>

                        <div className="field">

                            <label htmlFor="service_display_order" className="block font-bold mb-2">Display Order Priority</label>

                            <InputNumber inputId="service_display_order" value={service.display_order ?? 0}

                                min={0} useGrouping={false} showButtons className="w-full"

                                onValueChange={e => setService(prev => ({ ...prev, display_order: e.value ?? 0 }))} />

                            <small>Lower numbers appear first. Equal priorities use ID order.</small>

                        </div>

                        <div className="formgrid grid">

                            <div className="field col-12 md:col-6">

                                <label htmlFor="service_robot_enabled" className="block font-bold mb-2">Robot Enabled</label>

                                <InputSwitch

                                    inputId="service_robot_enabled"

                                    checked={Boolean(service.is_robot_enabled)}

                                    onChange={(e) => setService(prev => ({ ...prev, is_robot_enabled: Boolean(e.value) }))}

                                />

                            </div>

                            <div className="field col-12 md:col-6">

                                <label htmlFor="service_api_enabled" className="block font-bold mb-2">API Enabled</label>

                                <InputSwitch

                                    inputId="service_api_enabled"

                                    checked={Boolean(service.is_api_enabled)}

                                    onChange={(e) => setService(prev => ({ ...prev, is_api_enabled: Boolean(e.value) }))}

                                />

                            </div>

                            <div className="field col-12 md:col-6">

                                <label htmlFor="service_api_provider" className="block font-bold mb-2">API Provider (Optional)</label>

                                <Dropdown

                                    inputId="service_api_provider"

                                    value={service.api_provider_id ?? null}

                                    options={(providers || []).map((provider: Provider) => ({

                                        label: `${provider.name} (${provider.code})`,

                                        value: provider.id

                                    }))}

                                    onChange={(e) => setService(prev => ({ ...prev, api_provider_id: e.value ?? null }))}

                                    placeholder="Select API Provider"

                                    filter

                                    showClear

                                    className="w-full"

                                />

                            </div>

                            <div className="field col-12 md:col-6">

                                <label htmlFor="service_api_key" className="block font-bold mb-2">API Key (Optional)</label>

                                <Password

                                    inputId="service_api_key"

                                    value={service.api_key ?? ''}

                                    onChange={(e) => setService(prev => ({ ...prev, api_key: e.target.value }))}

                                    feedback={false}

                                    toggleMask

                                    placeholder={service.id ? 'Leave blank to keep existing key' : 'Enter API Key'}

                                    className="w-full"

                                    inputClassName="w-full"

                                    autoComplete="new-password"

                                />

                            </div>

                        </div>

                    </div>

                    <CustomFields

                            fields={parseInputFormSchema(service.input_form_schema)}

                            onFieldsChange={(updatedFields) =>

                                setService({

                                    ...service,

                                    input_form_schema: updatedFields // Keep as array for local state

                                })

                            }

                            submitted={submitted}

                        />{' '}

                    </Dialog>

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

                </div>

            </div>

        </div>

    );

};

export default withAuth(Services);
