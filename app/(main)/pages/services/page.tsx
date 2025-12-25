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
import { _fetchCompanies, _deleteCompany, _addCompany, _editCompany } from '@/app/redux/actions/companyActions';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { _addService, _deleteSelectedServices, _deleteService, _editService, _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { _fetchServiceCategories } from '@/app/redux/actions/serviceCategoryActions';
import { AppDispatch } from '@/app/redux/store';
import { Company, Service } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { parseInputFormSchema, stringifyInputFormSchema } from '../../utilities/parseInputFormSchema';
import { Badge } from 'primereact/badge';
import { CustomFields } from '../../components/CustomFields';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';

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
    };

    const [serviceDialog, setServiceDialog] = useState(false);
    const [deleteServiceDialog, setDeleteServiceDialog] = useState(false);
    const [deleteServicesDialog, setDeleteServicesDialog] = useState(false);
    const [service, setService] = useState<Service>(emptyService);
    const [selectedServices, setSelectedServices] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { companies } = useSelector((state: any) => state.companyReducer);
    const { services, loading } = useSelector((state: any) => state.serviceReducer);
    const { serviceCategories } = useSelector((state: any) => state.serviceCategoryReducer);
    const { telegramChatIds } = useSelector((state: any) => state.telegramReducer);

    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');

    useEffect(() => {
        dispatch(_fetchServiceList(searchTag));
        dispatch(_fetchCompanies());
        dispatch(_fetchServiceCategories());
        dispatch(_fetchTelegramList());

    }, [dispatch, searchTag]);

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

        setService({ ...service, company: matchingCompany, input_form_schema: parseInputFormSchema(service.input_form_schema) });

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
                        value={services}
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
                        globalFilter={globalFilter}
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
