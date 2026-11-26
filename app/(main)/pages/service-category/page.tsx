/* eslint-disable @next/next/no-img-element */

'use client';

import { Button as PrimeButton } from 'primereact/button';

import { Column } from 'primereact/column';

import { DataTable } from 'primereact/datatable';

import { Dialog } from 'primereact/dialog';

import axios from 'axios';

import { Toast } from 'primereact/toast';

import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { Button } from '@/components/ui/button';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { FileDrop } from '@/components/ui/file-drop';
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useDispatch } from 'react-redux';

import { useSelector } from 'react-redux';


import { _fetchCountries } from '@/app/redux/actions/countriesActions';

import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';

import { _addServiceCategory, _deleteSelectedServiceCategories, _deleteServiceCategory, _editServiceCategory, _fetchServiceCategories, _updateServiceCategoryPriority } from '@/app/redux/actions/serviceCategoryActions';

import { AppDispatch } from '@/app/redux/store';

import { ServiceCategory as BaseServiceCategory } from '@/types/interface';

type ServiceCategory = BaseServiceCategory & { requires_country_selection?: boolean | number | null; display_order?: number };


import withAuth from '../../authGuard';

import { useTranslation } from 'react-i18next';

import { customCellStyle, customCellStyleImage } from '../../utilities/customRow';

import i18n from '@/i18n';

import { isRTL } from '../../utilities/rtlUtil';


import { parseInputFormSchema, stringifyInputFormSchema } from '../../utilities/parseInputFormSchema';

import { Badge } from 'primereact/badge';

import { CustomFields } from '../../components/CustomFields';

const Category = () => {

    let emptyServiceCategory: ServiceCategory = {

        id: 0,

        category_name: '',

        type: '',

        service_category_sub_type_id: 0,

        category_image_url: '',

        deleted_at: '',

        created_at: '',

        updated_at: '',

        input_form_schema: [],

        display_order: 0,

        requires_country_selection: true

    };

    const [serviceCategoryDialog, setServiceCategoryDialog] = useState(false);

    const [deleteServiceCategoryDialog, setDeleteServiceCategoryDialog] = useState(false);

    const [deleteServiceCategoriesDialog, setDeleteServiceCategoriesDialog] = useState(false);

    const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(emptyServiceCategory);

    const [selectedServiceCategories, setSelectedServiceCategories] = useState(null);

    const [submitted, setSubmitted] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const localSearch = useDebouncedValue(searchInput, 350);
    const [refreshing, setRefreshing] = useState(false);

    const [priorityDrafts, setPriorityDrafts] = useState<Record<number, number>>({});

    const [savingPriority, setSavingPriority] = useState<Record<number, boolean>>({});

    const [savingCountrySelection, setSavingCountrySelection] = useState<Record<number, boolean>>({});

    const toast = useRef<Toast>(null);

    const dt = useRef<DataTable<any>>(null);

    const dispatch = useDispatch<AppDispatch>();

    const { serviceCategories, loading } = useSelector((state: any) => state.serviceCategoryReducer);

    const { t } = useTranslation();

    useEffect(() => {

        dispatch(_fetchServiceCategories());

    }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchServiceCategories() as any);
        setRefreshing(false);
    };

    // Search only loaded Redux records. Lower priority values appear first.

    const filteredCategories = useMemo(() => {

        const list: ServiceCategory[] = Array.isArray(serviceCategories) ? serviceCategories : [];

        const sorted = [...list].sort((a, b) =>

            Number(a.display_order ?? 0) - Number(b.display_order ?? 0) || a.id - b.id

        );

        const query = localSearch.trim().toLocaleLowerCase();

        if (!query) return sorted;

        return sorted.filter(item => [

            item.id, item.category_name, item.type,

            item.service_category_sub_type_id, item.display_order

        ].filter(value => value !== null && value !== undefined)

         .join(' ').toLocaleLowerCase().includes(query));

    }, [serviceCategories, localSearch]);

    const savePriority = async (item: ServiceCategory) => {

        if (savingPriority[item.id]) return;

        const value = priorityDrafts[item.id] ?? Number(item.display_order ?? 0);

        if (!Number.isSafeInteger(value) || value < 0) {

            toast.current?.show({severity: 'error', summary: 'Invalid priority', detail: 'Use a non-negative whole number.', life: 3000});

            return;

        }

        setSavingPriority(previous => ({ ...previous, [item.id]: true }));

        try {

            await dispatch(_updateServiceCategoryPriority(item.id, value));

            // Retain draft until save succeeds; refresh server-authoritative order.

            setPriorityDrafts(previous => { const next = {...previous}; delete next[item.id]; return next; });

            await dispatch(_fetchServiceCategories());

            toast.current?.show({severity: 'success', summary: 'Saved', detail: 'Category priority updated.', life: 3000});

        } catch (error: unknown) {

            const message = error instanceof Error ? error.message : 'Unable to save priority';

            toast.current?.show({severity: 'error', summary: 'Update failed', detail: message, life: 4000});

        } finally {

            setSavingPriority(previous => ({...previous, [item.id]: false}));

        }

    };

    // Partial update: preserve every other category field, image and custom schema.

    const updateCountrySelection = async (item: ServiceCategory, checked: boolean) => {

        if (savingCountrySelection[item.id]) return;

        setSavingCountrySelection(previous => ({ ...previous, [item.id]: true }));

        try {

            const token = localStorage.getItem('api_token') || '';

            const formData = new FormData();

            formData.append('requires_country_selection', checked ? '1' : '0');

            // Match the existing admin update route's POST convention.

            await axios.post(

                `${process.env.NEXT_PUBLIC_BASE_URL}/service_categories/${item.id}`,

                formData,

                { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }

            );

            await dispatch(_fetchServiceCategories());

            toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Country selection setting updated.', life: 2500 });

        } catch (error: any) {

            toast.current?.show({

                severity: 'error', summary: 'Update failed',

                detail: error?.response?.data?.message || error?.message || 'Failed to update country selection', life: 4000

            });

        } finally {

            setSavingCountrySelection(previous => ({ ...previous, [item.id]: false }));

        }

    };

    const countrySelectionBody = (item: ServiceCategory) => (

        <div className="flex align-items-center gap-2">

            <Switch

                checked={item.requires_country_selection !== false && item.requires_country_selection !== 0}

                disabled={Boolean(savingCountrySelection[item.id])}

                onCheckedChange={(v) => void updateCountrySelection(item, v)}

            />

            <small>{item.requires_country_selection !== false && item.requires_country_selection !== 0 ? 'Required' : 'Skipped'}</small>

        </div>

    );

    const priorityBody = (item: ServiceCategory) => (

        <div className="flex align-items-center gap-2" style={{minWidth: 135}}>

            <NumberInput

                value={priorityDrafts[item.id] ?? Number(item.display_order ?? 0)}

                min={0}

                allowNull={false}

                disabled={Boolean(savingPriority[item.id])}

                className="w-[4.5rem] text-center"

                onValueChange={(v) => setPriorityDrafts((previous) => ({ ...previous, [item.id]: v ?? 0 }))}

            />

            <PrimeButton

                type="button"

                icon={savingPriority[item.id] ? 'pi pi-spin pi-spinner' : 'pi pi-check'}

                text rounded severity="success"

                tooltip="Save priority"

                aria-label="Save category priority"

                disabled={Boolean(savingPriority[item.id]) ||

                    (priorityDrafts[item.id] ?? Number(item.display_order ?? 0)) === Number(item.display_order ?? 0)}

                onClick={() => void savePriority(item)}

            />

        </div>

    );

    const categoryRowActions = (rowData: ServiceCategory) => [
        {
            label: t('TABLE.GENERAL.EDIT'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => editServiceCategory(rowData)
        },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDeleteServiceCategory(rowData),
            danger: true,
            separatorBefore: true
        }
    ];

    const openNew = () => {

        setServiceCategory(emptyServiceCategory);

        setSubmitted(false);

        setServiceCategoryDialog(true);

    };

    const hideDialog = () => {

        setSubmitted(false);

        setServiceCategoryDialog(false);

    };

    const hideDeleteServiceCategoryDialog = () => {

        setDeleteServiceCategoryDialog(false);

    };

    const hideDeleteServiceCategoriesDialog = () => {

        setDeleteServiceCategoriesDialog(false);

    };

    const saveServiceCategory = () => {

        setSubmitted(true);

        if (!serviceCategory.category_name || !serviceCategory.type) {

            toast.current?.show({

                severity: 'error',

                summary: t('VALIDATION_ERROR'),

                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),

                life: 3000

            });

            return;

        }

        const parsedFields = parseInputFormSchema(serviceCategory.input_form_schema);

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

        const serviceCategoryData = {

            ...serviceCategory,

            input_form_schema: stringifyInputFormSchema(parsedFields) // Stringify for API

        };

        if (serviceCategory.id && serviceCategory.id !== 0) {

            dispatch(_editServiceCategory(serviceCategoryData, toast, t));

        } else {

            dispatch(_addServiceCategory(serviceCategoryData, toast, t));

        }

        setServiceCategoryDialog(false);

        setServiceCategory(emptyServiceCategory);

        setSubmitted(false);

    };

    const editServiceCategory = (serviceCategory: ServiceCategory) => {

        setServiceCategory({ ...serviceCategory, input_form_schema: parseInputFormSchema(serviceCategory.input_form_schema) });

        setServiceCategoryDialog(true);

    };

    const confirmDeleteServiceCategory = (serviceCategory: ServiceCategory) => {

        setServiceCategory(serviceCategory);

        setDeleteServiceCategoryDialog(true);

    };

    const deleteServiceCategory = () => {

        if (!serviceCategory?.id) {

            //console.error("Service Category ID is undefined.");

            return;

        }

        dispatch(_deleteServiceCategory(serviceCategory?.id, toast, t));

        setDeleteServiceCategoryDialog(false);

    };

    const confirmDeleteSelected = () => {

        if (!selectedServiceCategories || (selectedServiceCategories as any).length === 0) {

            toast.current?.show({

                severity: 'warn',

                summary: t('VALIDATION_WARNING'),

                detail: t('NO_SELECTED_ITEMS_FOUND'),

                life: 3000

            });

            return;

        }

        setDeleteServiceCategoriesDialog(true);

    };

    const deleteSelectedServiceCategories = async () => {

        if (!selectedServiceCategories || (selectedServiceCategories as any).length === 0) {

            toast.current?.show({

                severity: 'error',

                summary: t('VALIDATION_ERROR'),

                detail: t('NO_SELECTED_ITEMS_FOUND'),

                life: 3000

            });

            return;

        }

        const selectedIds = (selectedServiceCategories as ServiceCategory[]).map((category) => category.id);

        await _deleteSelectedServiceCategories(selectedIds, toast, t);

        dispatch(_fetchServiceCategories());

        setSelectedServiceCategories(null);

        setDeleteServiceCategoriesDialog(false);

    };

    const serviceCategoryNameBodyTemplate = (rowData: ServiceCategory) => {

        return (

            <>

                <span className="p-column-title">Service Category Name</span>

                {rowData.category_name}

            </>

        );

    };

    const serviceCategoryTypeBodyTemplate = (rowData: ServiceCategory) => {

        return (

            <>

                <span className="p-column-title">Service Category Type</span>

                {rowData.type}

            </>

        );

    };

    const customFieldsBodyTemplate = (rowData: ServiceCategory) => {

        const fieldCount = parseInputFormSchema(rowData.input_form_schema).length;

        return (

            <>

                <span className="p-column-title">Custom Fields</span>

                {fieldCount > 0 ? <Badge value={fieldCount} severity="info" /> : <span className="text-color-secondary">{rowData.input_form_schema?.length.toString()}</span>}

            </>

        );

    };

    const imageBodyTemplate = (rowData: ServiceCategory) => {

        return (

            <>

                <span className="p-column-title">Image</span>

                <img

                    src={`${rowData?.category_image_url}`}

                    alt=""

                    className="shadow-2"

                    style={{

                        padding: '2px',

                        width: '45px',

                        height: '45px',

                        borderRadius: '50%', // Makes the image circular

                        objectFit: 'cover' // Ensures the image is cropped correctly within the circle

                    }}

                />

            </>

        );

    };

    const actionBodyTemplate = (rowData: ServiceCategory) => <RowActions items={categoryRowActions(rowData)} />;

    // const header = (

    //     <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">

    //         <h5 className="m-0">Manage Products</h5>

    //         <span className="block mt-2 md:mt-0 p-input-icon-left">

    //             <i className="pi pi-search" />

    //             <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />

    //         </span>

    //     </div>

    // );

    const deleteServiceCategoryDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteServiceCategoryDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteServiceCategory} />
        </>
    );

    const deleteServiceCategoriesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteServiceCategoriesDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedServiceCategories} />
        </>
    );

    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.SERVICECATEGORY', { defaultValue: 'دسته‌بندی خدمات' })}
                description="مدیریت دسته‌بندی‌ها، اولویت نمایش و فیلدهای سفارشی"
                loading={loading}
                actions={
                    <>
                        <Button type="button" size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('SERVICECATEGORY.TABLE.CREATESERVICECATEGORY')}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </Button>
                    </>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('SERVICECATEGORY.TABLE.SEARCHSERVICECATEGORY', { defaultValue: 'جستجو...' })}
                    />
                }
            >
                    <DataTable

                        ref={dt}

                        value={filteredCategories}

                        selection={selectedServiceCategories}

                        onSelectionChange={(e) => setSelectedServiceCategories(e.value as any)}

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

                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('SERVICECATEGORY.TABLE.COLUMN.IMAGE')} body={imageBodyTemplate}></Column>

                        <Column

                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}

                            field="category_name"

                            header={t('SERVICECATEGORY.TABLE.COLUMN.SERVICECATEGORYNAME')}

                            body={serviceCategoryNameBodyTemplate}

                        ></Column>

                        <Column

                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}

                            field="type"

                            header={t('SERVICECATEGORY.TABLE.COLUMN.SERVICECATEGORYTYPE')}

                            body={serviceCategoryTypeBodyTemplate}

                        ></Column>

                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('TOTAL_CUSTOM_FIELD')} body={customFieldsBodyTemplate}></Column>

                        <Column header="Priority" body={priorityBody} style={{minWidth: "145px"}} />

                        <Column header="Country Selection" body={countrySelectionBody} style={{minWidth: "155px"}} />

                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>

                    </DataTable>
            </ListPage>

            <FormSheet
                        open={serviceCategoryDialog}
                        onOpenChange={(open) => {
                            if (!open) hideDialog();
                        }}
                        title={t('SERVICE.CATEGORY.DETAILS')}
                        description={
                            serviceCategory.id ? 'ویرایش دسته‌بندی خدمت' : 'ثبت دسته‌بندی خدمت جدید'
                        }
                        size="xl"
                        side="left"
                        footer={
                            <FormActions
                                onCancel={hideDialog}
                                onSubmit={saveServiceCategory}
                                cancelLabel={t('APP.GENERAL.CANCEL')}
                                submitLabel={t('FORM.GENERAL.SUBMIT')}
                            />
                        }
                    >
                        <FormSection title="اطلاعات پایه" description="نام، نوع و تصویر دسته‌بندی">
                            <FormField label={t('SERVICECATEGORY.TABLE.COLUMN.IMAGE')} fullWidth>
                                <FileDrop
                                    value={
                                        serviceCategory.category_image_url instanceof File
                                            ? serviceCategory.category_image_url
                                            : null
                                    }
                                    previewUrl={
                                        typeof serviceCategory.category_image_url === 'string' &&
                                        serviceCategory.category_image_url
                                            ? serviceCategory.category_image_url
                                            : null
                                    }
                                    onChange={(file) =>
                                        setServiceCategory((prev) => ({
                                            ...prev,
                                            category_image_url: file ?? ''
                                        }))
                                    }
                                />
                            </FormField>
                            <FormField
                                label={t('SERVICECATEGORY.FORM.INPUT.SERVICECATEGORYNAME')}
                                required
                                fullWidth
                                error={submitted && !serviceCategory.category_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Input
                                    id="category_name"
                                    value={serviceCategory.category_name}
                                    onChange={(e) =>
                                        setServiceCategory((prev) => ({
                                            ...prev,
                                            category_name: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('SERVICE.FORM.PLACEHOLDER.CATEGORY_NAME')}
                                    className={cn(
                                        'w-full',
                                        submitted && !serviceCategory.category_name && 'border-rose-300'
                                    )}
                                />
                            </FormField>
                            <FormField
                                label={t('SERVICECATEGORY.FORM.INPUT.SERVICECATEGORYTYPE')}
                                required
                                error={submitted && !serviceCategory.type ? t('THIS_FIELD_IS_REQUIRED') : null}
                            >
                                <Select
                                    value={serviceCategory.type || undefined}
                                    onValueChange={(v) =>
                                        setServiceCategory((prev) => ({
                                            ...prev,
                                            type: v
                                        }))
                                    }
                                >
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder={t('SERVICE.FORM.PLACEHOLDER.CHOOSE_A_TYPE')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="social">Social</SelectItem>
                                        <SelectItem value="nonsocial">Non-Social</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection title="تنظیمات نمایش" description="اولویت و انتخاب کشور">
                            <FormField
                                label="Display Order Priority"
                                hint="Lower numbers appear first; equal priorities use category ID order."
                                fullWidth
                            >
                                <NumberInput
                                    id="service_category_display_order"
                                    value={Number(serviceCategory.display_order ?? 0)}
                                    min={0}
                                    allowNull={false}
                                    className="w-full"
                                    onValueChange={(v) =>
                                        setServiceCategory((previous) => ({
                                            ...previous,
                                            display_order: v ?? 0
                                        }))
                                    }
                                />
                            </FormField>
                            <FormField
                                label="Requires Country Selection"
                                hint="Disable for categories that should open services without choosing a country."
                                fullWidth
                            >
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="category_requires_country"
                                        checked={
                                            serviceCategory.requires_country_selection !== false &&
                                            serviceCategory.requires_country_selection !== 0
                                        }
                                        onCheckedChange={(v) =>
                                            setServiceCategory((previous) => ({
                                                ...previous,
                                                requires_country_selection: v
                                            }))
                                        }
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        {serviceCategory.requires_country_selection !== false &&
                                        serviceCategory.requires_country_selection !== 0
                                            ? 'Required'
                                            : 'Skip country selection'}
                                    </span>
                                </div>
                            </FormField>
                        </FormSection>

                        <div className="sm:col-span-2">
                            <CustomFields
                                fields={parseInputFormSchema(serviceCategory.input_form_schema)}
                                onFieldsChange={(updatedFields) =>
                                    setServiceCategory({
                                        ...serviceCategory,
                                        input_form_schema: updatedFields
                                    })
                                }
                                submitted={submitted}
                            />
                        </div>
                    </FormSheet>

                    <Dialog visible={deleteServiceCategoryDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteServiceCategoryDialogFooter} onHide={hideDeleteServiceCategoryDialog}>

                        <div className="flex align-items-center justify-content-center">

                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />

                            {serviceCategory && (

                                <span>

                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{serviceCategory.category_name}</b>

                                </span>

                            )}

                        </div>

                    </Dialog>

                    <Dialog visible={deleteServiceCategoriesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteServiceCategoriesDialogFooter} onHide={hideDeleteServiceCategoriesDialog}>

                        <div className="flex align-items-center justify-content-center">

                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />

                            {serviceCategory && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}

                        </div>

                    </Dialog>
        </>
    );

};

export default withAuth(Category);
