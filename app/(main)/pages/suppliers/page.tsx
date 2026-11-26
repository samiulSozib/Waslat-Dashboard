/* eslint-disable @next/next/no-img-element */
'use client';
import { _addSupplier, _deleteSupplier, _editSupplier, _fetchSuppliers } from '@/app/redux/actions/supplierActions';
import { AppDispatch } from '@/app/redux/store';
import i18n from '@/i18n';
import { Supplier } from '@/types/interface';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { customCellStyle } from '../../utilities/customRow';
import { isRTL } from '../../utilities/rtlUtil';

const SupplierPage = () => {
    let emptySupplier: Supplier = {
        id: 0,
        supplier_name: '',
        contact_details: '',
        address: '',
        status: 1,
        created_at: '',
        updated_at: ''
    };

    const [supplierDialog, setSupplierDialog] = useState(false);
    const [deleteSupplierDialog, setDeleteSupplierDialog] = useState(false);
    const [deleteSuppliersDialog, setDeleteSuppliersDialog] = useState(false);
    const [supplier, setSupplier] = useState<Supplier>(emptySupplier);
    const [selectedCompanies, setSelectedCompanies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [refreshing, setRefreshing] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { suppliers, loading } = useSelector((state: any) => state.suppliersReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchSuppliers(searchTag));
    }, [dispatch, searchTag]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchSuppliers(searchTag) as any);
        setRefreshing(false);
    };

    const openNew = () => {
        setSupplier(emptySupplier);
        setSubmitted(false);
        setSupplierDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSupplierDialog(false);
    };

    const hideDeleteSupplierDialog = () => {
        setDeleteSupplierDialog(false);
    };

    const hideDeleteSuppliersDialog = () => {
        setDeleteSuppliersDialog(false);
    };

    const saveSupplier = () => {
        setSubmitted(true);
        if (!supplier.supplier_name || !supplier.contact_details || !supplier.address) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (supplier.id && supplier.id !== 0) {
            dispatch(_editSupplier(supplier.id, supplier, toast, t));
        } else {
            dispatch(_addSupplier(supplier, toast, t));
        }

        setSupplierDialog(false);
        setSupplier(emptySupplier);
        setSubmitted(false);
    };

    const editSupplier = (supplier: Supplier) => {
        setSupplier({ ...supplier });

        setSupplierDialog(true);
    };

    const confirmDeleteSupplier = (supplier: Supplier) => {
        setSupplier(supplier);
        setDeleteSupplierDialog(true);
    };

    const deleteSupplier = () => {
        if (!supplier?.id) {
            console.error('Supplier ID is undefined.');
            return;
        }
        dispatch(_deleteSupplier(supplier?.id, toast, t));
        setDeleteSupplierDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteSuppliersDialog(true);
    };

    const supplierRowActions = (rowData: Supplier) => [
        {
            label: t('TABLE.GENERAL.EDIT'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => editSupplier(rowData)
        },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDeleteSupplier(rowData),
            danger: true,
            separatorBefore: true
        }
    ];

    const nameBodyTemplate = (rowData: Supplier) => {
        return (
            <>
                <span className="p-column-title">Supplier Name</span>
                {rowData.supplier_name}
            </>
        );
    };

    const contactDetailsBodyTemplate = (rowData: Supplier) => {
        return (
            <>
                <span className="p-column-title">Contact Details</span>
                {rowData.contact_details}
            </>
        );
    };

    const addressBodyTemplate = (rowData: Supplier) => {
        return (
            <>
                <span className="p-column-title">Address</span>
                {rowData.address}
            </>
        );
    };

    const statusBodyTemplate = (rowData: Supplier) => (
        <Badge variant={rowData.status === 1 ? 'success' : 'danger'}>
            {rowData.status === 1 ? t('TABLE.GENERAL.ACTIVATE', { defaultValue: 'فعال' }) : t('TABLE.GENERAL.DEACTIVATE', { defaultValue: 'غیرفعال' })}
        </Badge>
    );

    const actionBodyTemplate = (rowData: Supplier) => <RowActions items={supplierRowActions(rowData)} />;

    // const header = (
    //     <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
    //         <h5 className="m-0">Manage Products</h5>
    //         <span className="block mt-2 md:mt-0 p-input-icon-left">
    //             <i className="pi pi-search" />
    //             <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
    //         </span>
    //     </div>
    // );

    const deleteSupplierDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteSupplierDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSupplier} />
        </>
    );
    const deleteSuppliersDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteSuppliersDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.SUPPLIERS', { defaultValue: 'تأمین‌کنندگان' })}
                description="مدیریت تأمین‌کنندگان و اطلاعات تماس"
                loading={loading}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('SUPPLIER.TABLE.CREATESUPPLIER')}
                        </Button>
                    </div>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در تأمین‌کنندگان...' })}
                    />
                }
            >
                    <DataTable
                        ref={dt}
                        value={suppliers}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedCompanies(e.value as any)}
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
                        responsiveLayout="scroll"
                    >
                        <Column
                            style={{ ...customCellStyle, textAlign: 'start' }}
                            header={t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '4.5rem' }}
                        />
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="name" header={t('SUPPLIER.TABLE.COLUMN.SUPPLIERNAME')} sortable body={nameBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="Contact Details"
                            header={t('SUPPLIER.TABLE.COLUMN.CONTACTDETAILS')}
                            body={contactDetailsBodyTemplate}
                            sortable
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="Address" header={t('SUPPLIER.TABLE.COLUMN.ADDRESS')} body={addressBodyTemplate} sortable></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('SUPPLIER.TABLE.COLUMN.STATUS')} body={statusBodyTemplate}></Column>
                    </DataTable>
            </ListPage>

            <FormSheet
                open={supplierDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('SUPPLIER.DETAILS')}
                description={supplier.id ? 'ویرایش تأمین‌کننده' : 'ثبت تأمین‌کننده جدید'}
                size="lg"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveSupplier}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('SUPPLIER.DETAILS')} description="نام، تماس، آدرس و وضعیت">
                    <FormField
                        label={t('SUPPLIER.FORM.INPUT.SUPPLIERNAME')}
                        required
                        fullWidth
                        error={submitted && !supplier.supplier_name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="supplier_name"
                            value={supplier?.supplier_name}
                            onChange={(e) =>
                                setSupplier((prev) => ({
                                    ...prev,
                                    supplier_name: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            placeholder={t('SUPPLIER.FORM.PLACEHOLDER.SUPPLIERNAME')}
                            className={cn('w-full', submitted && !supplier.supplier_name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('SUPPLIER.FORM.INPUT.CONTACTDETAILS')}
                        required
                        error={submitted && !supplier.contact_details ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="contact_details"
                            value={supplier.contact_details || ''}
                            onChange={(e) =>
                                setSupplier((prev) => ({
                                    ...prev,
                                    contact_details: e.target.value
                                }))
                            }
                            placeholder={t('SUPPLIER.FORM.PLACEHOLDER.CONTACTDETAILS')}
                            className="w-full"
                        />
                    </FormField>
                    <FormField
                        label={t('SUPPLIER.FORM.INPUT.ADDRESS')}
                        required
                        fullWidth
                        error={submitted && !supplier.address ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="address"
                            value={supplier.address || ''}
                            onChange={(e) =>
                                setSupplier((prev) => ({
                                    ...prev,
                                    address: e.target.value
                                }))
                            }
                            placeholder={t('SUPPLIER.FORM.PLACEHOLDER.ADDRESS')}
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('SUPPLIER.FORM.INPUT.STATUS')}>
                        <Select
                            value={supplier.status != null ? String(supplier.status) : undefined}
                            onValueChange={(v) =>
                                setSupplier((prev) => ({
                                    ...prev,
                                    status: Number(v)
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('SUPPLIER.FORM.PLACEHOLDER.STATUS')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Active</SelectItem>
                                <SelectItem value="0">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteSupplierDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteSupplierDialogFooter} onHide={hideDeleteSupplierDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {supplier && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{supplier.supplier_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteSuppliersDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteSuppliersDialogFooter} onHide={hideDeleteSuppliersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {supplier && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
        </div>
    );
};

export default withAuth(SupplierPage);
