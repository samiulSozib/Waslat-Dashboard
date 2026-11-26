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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { District, Province } from '@/types/interface';
import { _addDistrict, _deleteDistrict, _deleteSelectedDistricts, _editDistrict, _fetchDistricts } from '@/app/redux/actions/districtActions';
import { provinceReducer } from '../../../redux/reducers/provinceReducer';
import { _fetchProvinces } from '@/app/redux/actions/provinceActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const DistrictPage = () => {
    let emptyDistrict: District = {
        id: 0,
        district_name: '',
        province_id: 0,
        delete_at: '',
        created_at: '',
        updated_at: '',
        province: null
    };

    const [districtDialog, setDistrictDialog] = useState(false);
    const [deleteDistrictDialog, setDeleteDistrictDialog] = useState(false);
    const [deleteDistrictsDialog, setDeleteDistrictsDialog] = useState(false);
    const [district, setDistrict] = useState<District>(emptyDistrict);
    const [selectedDistricts, setSelectedDistricts] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { districts, loading } = useSelector((state: any) => state.districtReducer);
    const { provinces } = useSelector((state: any) => state.provinceReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchDistricts());
        dispatch(_fetchProvinces());
    }, [dispatch]);

    const openNew = () => {
        setDistrict(emptyDistrict);
        setSubmitted(false);
        setDistrictDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setDistrictDialog(false);
        setDistrict(emptyDistrict);
    };

    const hideDeleteDistrictDialog = () => {
        setDeleteDistrictDialog(false);
        setDistrict(emptyDistrict);
    };

    const hideDeleteDistrictsDialog = () => {
        setDeleteDistrictsDialog(false);
        setDistrict(emptyDistrict);
    };

    const saveDistrict = () => {
        setSubmitted(true);
        if (!district.district_name || !district.province) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (district.id && district.id !== 0) {
            dispatch(_editDistrict(district.id, district, toast, t));
        } else {
            dispatch(_addDistrict(district, toast, t));
        }

        setDistrictDialog(false);
        setDistrict(emptyDistrict);
        setSubmitted(false);
    };

    const editDistrict = (district: District) => {
        setDistrict({ ...district });

        setDistrictDialog(true);
    };

    const confirmDeleteDistrict = (district: District) => {
        setDistrict(district);
        setDeleteDistrictDialog(true);
    };

    const deleteDistrict = () => {
        if (!district?.id) {
            console.error('District  ID is undefined.');
            return;
        }
        dispatch(_deleteDistrict(district?.id, toast, t));
        setDeleteDistrictDialog(false);
    };

            const confirmDeleteSelected = () => {
        if (!selectedDistricts || (selectedDistricts as any).length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('VALIDATION_WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteDistrictsDialog(true);
    };

        const deleteSelectedDistricts = async() => {
            if (!selectedDistricts || (selectedDistricts as any).length === 0) {
                toast.current?.show({
                    severity: 'error',
                    summary: t('VALIDATION_ERROR'),
                    detail: t('NO_SELECTED_ITEMS_FOUND'),
                    life: 3000
                });
                return;
            }

            const selectedIds = (selectedDistricts as District[]).map((district) => district.id);


            await _deleteSelectedDistricts(selectedIds,toast,t)
            dispatch(_fetchDistricts())




            setSelectedDistricts(null)
            setDeleteDistrictsDialog(false)
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

    const districtNameBodyTemplate = (rowData: District) => {
        return (
            <>
                <span className="p-column-title">District Name</span>
                {rowData.district_name}
            </>
        );
    };

    const provinceNameBodyTemplate = (rowData: District) => {
        return (
            <>
                <span className="p-column-title">Province Name</span>
                {rowData.province?.province_name}
            </>
        );
    };

    const actionBodyTemplate = (rowData: District) => (
        <RowActions
            items={[
                {
                    label: t('TABLE.GENERAL.EDIT'),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editDistrict(rowData)
                },
                {
                    label: t('TABLE.GENERAL.DELETE'),
                    icon: <Trash2 className="h-4 w-4" />,
                    danger: true,
                    separatorBefore: true,
                    onClick: () => confirmDeleteDistrict(rowData)
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

    const deleteDistrictDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteDistrictDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteDistrict} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteDistrictsDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedDistricts}/>
        </>
    );

    useEffect(() => {
        if (district.province_id) {
            const selectedProvince = provinces.find((province: Province) => province.id === district.province_id);

            if (selectedProvince) {
                setDistrict((prev) => ({
                    ...prev,
                    province: selectedProvince // Update with the selected company object
                }));
            }
        }
    }, [district.province_id, provinces]);






    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.DISTRICT', { defaultValue: 'منطقه' })}
                description="مدیریت مناطق و تخصیص استان"
                loading={loading}
                actions={
                    <Button type="button" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('DISTRICT.TABLE.CREATEDISTRICT')}
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
                    value={districts}
                    selection={selectedDistricts}
                    onSelectionChange={(e) => setSelectedDistricts(e.value as any)}
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
                    style={{ direction: isRTL() ? 'rtl' : 'ltr',fontFamily: "'iranyekan', sans-serif,iranyekan" }}
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
                            field="district_name"
                            header={t('DISTRICT.TABLE.COLUMN.DISTRICTNAME')}
                            body={districtNameBodyTemplate}
                            
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="province_name"
                            header={t('DISTRICT.TABLE.COLUMN.PROVINCE')}
                            body={provinceNameBodyTemplate}
                            
                        ></Column>
                    </DataTable>
            </ListPage>

            <FormSheet
                open={districtDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('DISTRICT.DETAILS')}
                description={district.id ? 'ویرایش منطقه' : 'ثبت منطقه جدید'}
                size="lg"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveDistrict}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('DISTRICT.DETAILS')} description="نام منطقه و استان مرتبط">
                    <FormField
                        label={t('DISTRICT.TABLE.COLUMN.DISTRICTNAME')}
                        required
                        error={submitted && !district.district_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="district_name"
                            value={district.district_name}
                            onChange={(e) =>
                                setDistrict((prevDistrict) => ({
                                    ...prevDistrict,
                                    district_name: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            placeholder={t('DISTRICT.FORM.PLACEHOLDER.DISTRICTNAME')}
                            className={cn('w-full', submitted && !district.district_name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('DISTRICT.FORM.INPUT.PROVINCE')}
                        required
                        error={submitted && !district.province ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={district.province}
                            options={provinces || []}
                            onChange={(selected) =>
                                setDistrict((prev) => ({
                                    ...prev,
                                    province: selected
                                }))
                            }
                            optionLabel="province_name"
                            searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                            placeholder={t('DISTRICT.FORM.PLACEHOLDER.PROVINCE')}
                            error={submitted && !district.province}
                            returnFullObject
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteDistrictDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteDistrictDialogFooter} onHide={hideDeleteDistrictDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {district && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{district.district_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteDistrictsDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteDistrictsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {districts && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}</span>}
                        </div>
                    </Dialog>
        </>
    );
};

export default withAuth(DistrictPage);
