/* eslint-disable @next/next/no-img-element */
'use client';
import { Button as PrimeButton } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { SearchSelect } from '@/components/admin/search-select';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Country, Province } from '@/types/interface';
import { _addProvince, _deleteProvince, _deleteSelectedProvinces, _editProvince, _fetchProvinces } from '@/app/redux/actions/provinceActions';
import { countriesReducer } from '../../../redux/reducers/countriesReducer';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const ProvincePage = () => {
    let emptyProvince: Province = {
        id: 0,
        province_name: '',
        country_id: 0,
        deleted_at: '',
        created_at: '',
        updated_at: '',
        country: null
    };

    const [provinceDialog, setProvinceDialog] = useState(false);
    const [deleteProvinceDialog, setDeleteProvinceDialog] = useState(false);
    const [deleteProvincesDialog, setDeleteProvincesDialog] = useState(false);
    const [province, setProvince] = useState<Province>(emptyProvince);
    const [selectedProvinces, setSelectedProvinces] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { provinces, loading } = useSelector((state: any) => state.provinceReducer);
    const { countries } = useSelector((state: any) => state.countriesReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchProvinces());
        dispatch(_fetchCountries());
    }, [dispatch]);

    const openNew = () => {
        setProvince(emptyProvince);
        setSubmitted(false);
        setProvinceDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setProvinceDialog(false);
        setProvince(emptyProvince);
    };

    const hideDeleteProvinceDialog = () => {
        setDeleteProvinceDialog(false);
        setProvince(emptyProvince);
    };

    const hideDeleteProvincesDialog = () => {
        setDeleteProvincesDialog(false);
        setProvince(emptyProvince);
    };

    const saveProvince = () => {
        setSubmitted(true);
        if (!province.province_name || !province.country) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (province.id && province.id !== 0) {
            dispatch(_editProvince(province.id, province, toast, t));
        } else {
            dispatch(_addProvince(province, toast, t));
        }

        setProvinceDialog(false);
        setProvince(emptyProvince);
        setSubmitted(false);
    };

    const editProvince = (province: Province) => {
        setProvince({ ...province });

        setProvinceDialog(true);
    };

    const confirmDeleteProvince = (province: Province) => {
        setProvince(province);
        setDeleteProvinceDialog(true);
    };

    const deleteProvince = () => {
        if (!province?.id) {
            console.error('Province  ID is undefined.');
            return;
        }
        dispatch(_deleteProvince(province?.id, toast, t));
        setDeleteProvinceDialog(false);
    };



    const confirmDeleteSelected = () => {
    if (!selectedProvinces || (selectedProvinces as any).length === 0) {
        toast.current?.show({
            severity: 'warn',
            summary: t('VALIDATION_WARNING'),
            detail: t('NO_SELECTED_ITEMS_FOUND'),
            life: 3000
        });
        return;
    }
    setDeleteProvincesDialog(true);
};

    const deleteSelectedProvinces = async() => {
        if (!selectedProvinces || (selectedProvinces as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        const selectedIds = (selectedProvinces as Province[]).map((province) => province.id);


        await _deleteSelectedProvinces(selectedIds,toast,t)
        dispatch(_fetchProvinces())


        setSelectedProvinces(null)
        setDeleteProvincesDialog(false)
    };



    // const leftToolbarTemplate = () => {
    //     return (
    //         <div className="flex items-center">
    //             <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
    //                 <i className="pi pi-search" />
    //                 <InputText
    //                     type="search"
    //                     onInput={(e) => setGlobalFilter(e.currentTarget.value)}
    //                     placeholder={t('ECOMMERCE.COMMON.SEARCH')}
    //                     className="w-full md:w-auto"
    //                 />
    //             </span>
    //         </div>
    //     );
    // };

    const provinceNameBodyTemplate = (rowData: Province) => {
        return (
            <>
                <span className="p-column-title">Province Name</span>
                {rowData.province_name}
            </>
        );
    };

    const countryNameBodyTemplate = (rowData: Province) => {
        return (
            <>
                <span className="p-column-title">Country Name</span>
                {rowData.country?.country_name}
            </>
        );
    };

    const actionBodyTemplate = (rowData: Province) => (
        <RowActions
            items={[
                {
                    label: t('TABLE.GENERAL.EDIT'),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editProvince(rowData)
                },
                {
                    label: t('TABLE.GENERAL.DELETE'),
                    icon: <Trash2 className="h-4 w-4" />,
                    danger: true,
                    separatorBefore: true,
                    onClick: () => confirmDeleteProvince(rowData)
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

    const deleteProvinceDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteProvinceDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteProvince} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteProvincesDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedProvinces} />
        </>
    );

    useEffect(() => {
        if (province.country_id) {
            const selectedCountry = countries.find((country: Country) => country.id === province.country_id);

            if (selectedCountry) {
                setProvince((prev) => ({
                    ...prev,
                    country: selectedCountry // Update with the selected company object
                }));
            }
        }
    }, [province.country_id, countries]);



    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.PROVINCE', { defaultValue: 'استان' })}
                description="مدیریت استان‌ها و تخصیص کشور"
                loading={loading}
                actions={
                    <Button type="button" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('CREATE_PROVINCE')}
                    </Button>
                }
                toolbar={
                    <FilterBar
                        search={globalFilter}
                        onSearchChange={setGlobalFilter}
                        searchPlaceholder={t('TABLE.GENERAL.SEARCH', { defaultValue: 'جستجو...' })}
                    />
                }
            >
                <DataTable
                    ref={dt}
                    value={provinces}
                    selection={selectedProvinces}
                    onSelectionChange={(e) => setSelectedProvinces(e.value as any)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    size="small"
                    className="datatable-responsive p-datatable-sm"
                    paginatorTemplate={
                        isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                    }
                    currentPageReportTemplate={t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}
                    emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                    dir={isRTL() ? 'rtl' : 'ltr'}
                    style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                    globalFilter={globalFilter}
                    responsiveLayout="scroll"
                >
                        <Column
                            header={t('TABLE.GENERAL.ACTION')}
                            body={actionBodyTemplate}
                            headerStyle={{ width: '4.5rem' }}
                            style={{ ...customCellStyle, textAlign: 'start' }}
                        />
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="province_name"
                            header={t('PROVINCE.TABLE.COLUMN.PROVINCENAME')}
                            body={provinceNameBodyTemplate}
                            
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="country_name"
                            header={t('PROVINCE.TABLE.COLUMN.COUNTRY')}
                            body={countryNameBodyTemplate}
                            
                        ></Column>
                    </DataTable>
            </ListPage>

            <FormSheet
                open={provinceDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('PROVINCE.DETAILS')}
                description={province.id ? 'ویرایش استان' : 'ثبت استان جدید'}
                size="lg"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveProvince}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('PROVINCE.DETAILS')} description="نام استان و کشور مرتبط">
                    <FormField
                        label={t('PROVINCE.FORM.INPUT.PROVINCENAME')}
                        required
                        error={submitted && !province.province_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="province_name"
                            value={province.province_name}
                            onChange={(e) =>
                                setProvince((prevProvince) => ({
                                    ...prevProvince,
                                    province_name: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            placeholder={t('PROVINCE.FORM.PLACEHOLDER.PROVINCENAME')}
                            className={cn('w-full', submitted && !province.province_name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('PROVINCE.FORM.INPUT.COUNTRY')}
                        required
                        error={submitted && !province.country ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={province.country}
                            options={countries || []}
                            onChange={(selected) =>
                                setProvince((prev) => ({
                                    ...prev,
                                    country: selected
                                }))
                            }
                            optionLabel="country_name"
                            placeholder={t('PROVINCE.FORM.PLACEHOLDER.COUNTRY')}
                            error={submitted && !province.country}
                            returnFullObject
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteProvinceDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteProvinceDialogFooter} onHide={hideDeleteProvinceDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {province && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{province.province_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteProvincesDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteProvincesDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {selectedProvinces && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                        </div>
                    </Dialog>
        </>
    );
};

export default withAuth(ProvincePage);
