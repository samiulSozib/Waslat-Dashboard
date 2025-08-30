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
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { GroupDiscount, ResellerGroup } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addResellerGroup, _deleteResellerGroup, _editResellerGroup, _fetchResellerGroups } from '@/app/redux/actions/resellerGroupActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchLanguages } from '@/app/redux/actions/languageActions';
import { FileUpload } from 'primereact/fileupload';
import { resellerGroupReducer } from '../../../redux/reducers/resellerGroupReducer';
import { InputTextarea } from 'primereact/inputtextarea';
import { useTranslation } from 'react-i18next';
import { _addGroupDiscount, _deleteGroupDiscount, _editGroupDiscount, _fetchGroupDiscounts } from '@/app/redux/actions/groupDiscountActions';
import { groupDiscountReducer } from '../../../redux/reducers/groupDiscountReducer';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { _fetchBundleList } from '@/app/redux/actions/bundleActions';
import serviceReducer from '../../../redux/reducers/serviceReducer';
import bundleReducer from '../../../redux/reducers/bundleReducer';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const ResellerGroupPage = () => {
    let emptyGroupDiscount: GroupDiscount = {
        id: 0,
        reseller_group_id: 0,
        service_id: 0,
        bundle_id: 0,
        discount_type: '',
        discount_value: '',
        reseller_group: null,
        service: null,
        bundle: null,
        created_at: '',
        updated_at: ''
    };

    const [resellerGroupDialog, setResellerGroupDialog] = useState(false);
    const [deleteResellerGroupDialog, setDeleteResellerGroupDialog] = useState(false);
    const [deleteResellerGroupsDialog, setDeleteResellerGroupsDialog] = useState(false);
    const [groupDiscount, setGroupDiscount] = useState<GroupDiscount>(emptyGroupDiscount);
    const [selectedCompanies, setSelectedResellerGroup] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { countries, loading } = useSelector((state: any) => state.countriesReducer);
    const { bundles } = useSelector((state: any) => state.bundleReducer);
    const { services } = useSelector((state: any) => state.serviceReducer);
    const { reseller_groups } = useSelector((state: any) => state.resellerGroupReducer);
    const { group_discounts } = useSelector((state: any) => state.groupDiscountReducer);

    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchResellerGroups());
        dispatch(_fetchGroupDiscounts());
        dispatch(_fetchServiceList());
        dispatch(_fetchBundleList());
    }, [dispatch]);

    useEffect(() => {
        //console.log(group_discounts);
    }, [dispatch, group_discounts]);

    const openNew = () => {
        setGroupDiscount(emptyGroupDiscount);
        setSubmitted(false);
        setResellerGroupDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setResellerGroupDialog(false);
    };

    const hideDeleteResellerGroupDialog = () => {
        setDeleteResellerGroupDialog(false);
    };

    const hideDeleteResellerGroupsDialog = () => {
        setDeleteResellerGroupsDialog(false);
    };

    const saveResellerGroup = () => {
        setSubmitted(true);
        //console.log(groupDiscount)
        //return;
        if (!groupDiscount.reseller_group || !groupDiscount.service || !groupDiscount.bundle || !groupDiscount.discount_type || !groupDiscount.discount_value) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: 'Please Enter All Required Field',
                life: 3000
            });
            return;
        }

        // if (groupDiscount.id && groupDiscount.id !== 0) {
        //     dispatch(_editGroupDiscount(groupDiscount.id,groupDiscount,toast));

        // } else {
        //     dispatch(_addGroupDiscount(groupDiscount,toast));
        // }

        // setResellerGroupDialog(false);
        // setGroupDiscount(emptyGroupDiscount);

        //
        try {
            if (groupDiscount.id && groupDiscount.id !== 0) {
                dispatch(_editGroupDiscount(groupDiscount.id, groupDiscount, toast, t));
            } else {
                dispatch(_addGroupDiscount(groupDiscount, toast, t));
            }

            setResellerGroupDialog(false);
            setGroupDiscount(emptyGroupDiscount);
        } catch (error) {
            console.error('Error saving group discount:', error);
            // Error handling is done in the action, but we can add additional handling here if needed
        } finally {
            setSubmitted(false);
        }
        //
    };

    const editResellerGroup = (groupDiscount: GroupDiscount) => {
        setGroupDiscount({ ...groupDiscount });

        setResellerGroupDialog(true);
    };

    const confirmDeleteResellerGroup = (groupDiscount: GroupDiscount) => {
        setGroupDiscount(groupDiscount);
        setDeleteResellerGroupDialog(true);
    };

    const deleteResellerGroup = () => {
        if (!groupDiscount?.id) {
            console.error('ResellerGroup  ID is undefined.');
            return;
        }
        dispatch(_deleteGroupDiscount(groupDiscount?.id, toast, t));
        setDeleteResellerGroupDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteResellerGroupsDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('GROUP.DISCOUNT.CREATENEW')}
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
                        disabled={!selectedCompanies || !(selectedCompanies as any).length}
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

    const groupNameBodyTemplate = (rowData: GroupDiscount) => {
        return (
            <>
                <span className="p-column-title">Group Name</span>
                {rowData?.reseller_group?.name}
            </>
        );
    };

    const discount_typeBodyTemplate = (rowData: GroupDiscount) => {
        return (
            <>
                <span className="p-column-title">Discount Type</span>
                {rowData?.discount_type}
            </>
        );
    };

    const discount_valueBodyTemplate = (rowData: GroupDiscount) => {
        return (
            <>
                <span className="p-column-title">Discount Value</span>
                {rowData?.discount_value}
            </>
        );
    };

    const serviceBodyTemplate = (rowData: GroupDiscount) => {
        return (
            <>
                <span className="p-column-title">Service</span>
                {rowData?.service?.service_category?.category_name} {rowData?.service?.company?.company_name}
            </>
        );
    };

    const BundleBodyTemplate = (rowData: GroupDiscount) => {
        return (
            <>
                <span className="p-column-title">Bundle</span>
                {rowData?.bundle?.bundle_title}
            </>
        );
    };

    const statusBodyTemplate = (rowData: GroupDiscount) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span style={{ borderRadius: '10px', textAlign: 'center' }} className={`px-2 py-2  text-center text-white font-semibold inline-block w-24 ${rowData?.reseller_group?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {rowData?.reseller_group?.status}
                </span>
            </>
        );
    };

    const notesBodyTemplate = (rowData: GroupDiscount) => {
        return (
            <>
                <span className="p-column-title">Notes</span>
                {rowData?.reseller_group?.notes}
            </>
        );
    };

    const actionBodyTemplate = (rowData: GroupDiscount) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editResellerGroup(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteResellerGroup(rowData)} />
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

    const resellerGroupDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveResellerGroup} />
        </>
    );
    const deleteResellerGroupDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteResellerGroupDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteResellerGroup} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteResellerGroupsDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={group_discounts}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedResellerGroup(e.value as any)}
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
                        style={{ direction: isRTL() ? 'rtl' : 'ltr',fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        // header={header}
                        responsiveLayout="scroll"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="name" header={t('GROUP.DISCOUNT.TABLE.GROUPNAME')} body={groupNameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="service" header={t('GROUP.DISCOUNT.TABLE.SERVICE')} body={serviceBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="bundle" header={t('GROUP.DISCOUNT.TABLE.BUNDLE')} body={BundleBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="guard_name"
                            header={t('GROUP.DISCOUNT.TABLE.DISCOUNTTYPE')}
                            body={discount_typeBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="guard_name"
                            header={t('GROUP.DISCOUNT.TABLE.DISCOUNTVALUE')}
                            body={discount_valueBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="guard_name" header={t('GROUP.DISCOUNT.TABLE.STATUS')} body={statusBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="guard_name" header={t('GROUP.DISCOUNT.TABLE.NOTE')} body={notesBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                    </DataTable>

                    <Dialog visible={resellerGroupDialog} style={{ width: '900px', padding: '5px' }} header={t('GROUP.DISCOUNT.DETAILS')} modal className="p-fluid" footer={resellerGroupDialogFooter} onHide={hideDialog}>
                        <div className="card flex flex-wrap p-fluid mt-3 gap-4">
                            <div className="flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="supplier" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.DISCOUNT.LABEL.GROUPNAME')}
                                    </label>
                                    <Dropdown
                                        id=""
                                        value={groupDiscount.reseller_group}
                                        options={reseller_groups}
                                        onChange={(e) =>
                                            setGroupDiscount((prev) => ({
                                                ...prev,
                                                reseller_group: e.value
                                            }))
                                        }
                                        optionLabel="name"
                                        placeholder={t('GROUP.DISCOUNT.PLACEHOLDER.GROUPNAME')}
                                        className="w-full"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="service" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.DISCOUNT.LABEL.SERVICE')}
                                    </label>
                                    <Dropdown
                                        id=""
                                        value={groupDiscount.service}
                                        options={services}
                                        onChange={(e) =>
                                            setGroupDiscount((prev) => ({
                                                ...prev,
                                                service: e.value
                                            }))
                                        }
                                        optionLabel="service_category.category_name"
                                        placeholder={t('GROUP.DISCOUNT.PLACEHOLDER.SERVICE')}
                                        className="w-full"
                                        itemTemplate={(option) => (
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <div>{option.service_category?.category_name}</div>
                                                <div>{option.company?.company_name}</div>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="bundle" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.DISCOUNT.LABEL.BUNDLE')}
                                    </label>
                                    <Dropdown
                                        id=""
                                        value={groupDiscount.bundle}
                                        options={bundles}
                                        onChange={(e) =>
                                            setGroupDiscount((prev) => ({
                                                ...prev,
                                                bundle: e.value
                                            }))
                                        }
                                        optionLabel="bundle_title"
                                        placeholder={t('GROUP.DISCOUNT.PLACEHOLDER.BUNDLE')}
                                        className="w-full"
                                        itemTemplate={(option) => (
                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                <div>{option?.bundle_title}</div>
                                                <div>{option.service?.company?.company_name}</div>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="discount_type" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.DISCOUNT.LABEL.DISCOUNTTYPE')}
                                    </label>
                                    <Dropdown
                                        id="discount_type"
                                        value={groupDiscount.discount_type}
                                        options={[
                                            { label: 'Percentage', value: 'percentage' },
                                            { label: 'Fixed', value: 'fixed' }
                                        ]}
                                        onChange={(e) =>
                                            setGroupDiscount((prev) => ({
                                                ...prev,
                                                discount_type: e.value
                                            }))
                                        }
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder={t('GROUP.DISCOUNT.PLACEHOLDER.DISCOUNTTYPE')}
                                        className="w-full"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="discount_value" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.DISCOUNT.LABEL.DISCOUNTVALUE')}
                                    </label>
                                    <InputText
                                        id="discount_value"
                                        value={groupDiscount.discount_value}
                                        onChange={(e) =>
                                            setGroupDiscount((prev) => ({
                                                ...prev,
                                                discount_value: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('GROUP.DISCOUNT.PLACEHOLDER.DISCOUNTVALUE')}
                                        className={classNames({
                                            'p-invalid': submitted && !groupDiscount.discount_value
                                        })}
                                    />
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteResellerGroupDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResellerGroupDialogFooter} onHide={hideDeleteResellerGroupDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {groupDiscount && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{groupDiscount.reseller_group?.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteResellerGroupsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteResellerGroupsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {groupDiscount && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default ResellerGroupPage;
