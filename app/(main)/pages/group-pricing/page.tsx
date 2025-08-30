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
import { GroupPricing, ResellerGroup } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addResellerGroup, _deleteResellerGroup, _editResellerGroup, _fetchResellerGroups } from '@/app/redux/actions/resellerGroupActions';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { useTranslation } from 'react-i18next';
import { _addGroupPricing, _deleteGroupPricing, _editGroupPricing, _fetchGroupPricingList } from '@/app/redux/actions/groupPricingActions';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const GroupPricingPage = () => {
    let emptyGroupPricing: GroupPricing = {
        id: 0,
        reseller_group_id: 0,
        service_id: 0,
        reseller_group: null,
        service: null,
        status: '',
        fixed_fee: 0,
        markup_percentage: 0,
        use_fixed_fee: true,
        use_markup: true,
        created_at: '',
        updated_at: ''
    };

    const [groupPricingDialog, setGroupPricingDialog] = useState(false);
    const [deleteGroupPricingDialog, setDeleteGroupPricingDialog] = useState(false);
    const [deleteGroupPricingsDialog, setDeleteGroupPricingsDialog] = useState(false);
    const [groupPricing, setGroupPricing] = useState<GroupPricing>(emptyGroupPricing);
    const [selectedGroupPricings, setSelectedGroupPricings] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { services } = useSelector((state: any) => state.serviceReducer);
    const { reseller_groups } = useSelector((state: any) => state.resellerGroupReducer);
    const { groupPricings, loading } = useSelector((state: any) => state.groupPricingReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchResellerGroups());
        dispatch(_fetchServiceList());
        dispatch(_fetchGroupPricingList());
    }, [dispatch]);

    const openNew = () => {
        setGroupPricing(emptyGroupPricing);
        setSubmitted(false);
        setGroupPricingDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setGroupPricingDialog(false);
    };

    const hideDeleteGroupPricingDialog = () => {
        setDeleteGroupPricingDialog(false);
    };

    const hideDeleteGroupPricingsDialog = () => {
        setDeleteGroupPricingsDialog(false);
    };

    const saveGroupPricing = async () => {
        setSubmitted(true);

        // Form validation
        if (!groupPricing.reseller_group_id || !groupPricing.service_id) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('group_pricing.missing_group_or_service'),
                life: 3000
            });
            return;
        }

        if (groupPricing.use_fixed_fee && !groupPricing.fixed_fee) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('group_pricing.fixed_fee_required'),
                life: 3000
            });
            return;
        }

        if (groupPricing.use_markup && !groupPricing.markup_percentage) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('group_pricing.markup_required'),
                life: 3000
            });
            return;
        }

        try {
            if (groupPricing.id && groupPricing.id !== 0) {
                await dispatch(_editGroupPricing(groupPricing.id, groupPricing, toast, t));
            } else {
                await dispatch(_addGroupPricing(groupPricing, toast, t));
            }

            setGroupPricingDialog(false);
            setGroupPricing(emptyGroupPricing);
        } catch (error) {
            console.error('Error saving group pricing:', error);
            // Error handling is done in the action, but we can add additional handling here if needed
        } finally {
            setSubmitted(false);
        }
    };

    const editGroupPricing = (groupPricing: GroupPricing) => {
        //console.log(groupPricing);
        setGroupPricing({ ...groupPricing });
        setGroupPricingDialog(true);
    };

    const confirmDeleteGroupPricing = (groupPricing: GroupPricing) => {
        setGroupPricing(groupPricing);
        setDeleteGroupPricingDialog(true);
    };

    const deleteGroupPricing = () => {
        //console.log(groupPricing);
        if (!groupPricing?.id) {
            console.error('Group Pricing ID is undefined.');
            return;
        }
        dispatch(_deleteGroupPricing(groupPricing?.id, toast, t));
        setDeleteGroupPricingDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteGroupPricingsDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('GROUP.PRICING.CREATENEW')}
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
                        disabled={!selectedGroupPricings || !(selectedGroupPricings as any).length}
                    /> */}
                </div>
            </React.Fragment>
        );
    };

    const ResellerGroupBodyTemplate = (rowData: GroupPricing) => {
        return (
            <>
                <span className="p-column-title">Reseller Group</span>
                {rowData?.reseller_group?.name}
            </>
        );
    };

    const ServiceBodyTemplate = (rowData: GroupPricing) => {
        return (
            <>
                <span className="p-column-title">Service</span>
                {rowData?.service?.service_category?.category_name}
            </>
        );
    };

    const FixedFeeBodyTemplate = (rowData: GroupPricing) => {
        return (
            <>
                <span className="p-column-title">Fixed Fee</span>
                {rowData?.fixed_fee}
            </>
        );
    };

    const MarkUpPercentageBodyTemplate = (rowData: GroupPricing) => {
        return (
            <>
                <span className="p-column-title">Markup Percentage</span>
                {rowData?.markup_percentage}
            </>
        );
    };

    const useFixedFeeBodyTemplate = (rowData: GroupPricing) => {
        return (
            <>
                <span className="p-column-title">Use Fixed Fee</span>
                {rowData?.use_fixed_fee ? 'Yes' : 'No'}
            </>
        );
    };

    const useMarkupBodyTemplate = (rowData: GroupPricing) => {
        return (
            <>
                <span className="p-column-title">Use Markup</span>
                {rowData?.use_markup ? 'Yes' : 'No'}
            </>
        );
    };

    const statusBodyTemplate = (rowData: GroupPricing) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span style={{ borderRadius: '10px', textAlign: 'center' }} className={`px-2 py-2 text-center text-white font-semibold inline-block w-24 ${rowData?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {rowData?.status}
                </span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: GroupPricing) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={() => editGroupPricing(rowData)} />
                <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteGroupPricing(rowData)} />
            </>
        );
    };

    const groupPricingDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveGroupPricing} />
        </>
    );

    const deleteGroupPricingDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteGroupPricingDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteGroupPricing} />
        </>
    );

    const deleteGroupPricingsDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteGroupPricingsDialog} />
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
                        value={groupPricings}
                        selection={selectedGroupPricings}
                        onSelectionChange={(e) => setSelectedGroupPricings(e.value as any)}
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
                        responsiveLayout="scroll"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="reseller_group" header={t('GROUP.PRICING.TABLE.RESELLER_GROUP')} body={ResellerGroupBodyTemplate} />
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="service" header={t('GROUP.PRICING.TABLE.SERVICE')} body={ServiceBodyTemplate} />
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="use_fixed_fee" header={t('GROUP.PRICING.TABLE.USE_FIXED_FEE')} body={useFixedFeeBodyTemplate} />
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="fixed_fee" header={t('GROUP.PRICING.TABLE.FIXED_FEE')} body={FixedFeeBodyTemplate} />
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="use_markup" header={t('GROUP.PRICING.TABLE.USE_MARKUP')} body={useMarkupBodyTemplate} />
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="markup_percentage"
                            header={t('GROUP.PRICING.TABLE.MARKUP_PERCENTAGE')}
                            body={MarkUpPercentageBodyTemplate}
                        />
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="status" header={t('GROUP.PRICING.TABLE.STATUS')} body={statusBodyTemplate} />
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }} />
                    </DataTable>

                    <Dialog visible={groupPricingDialog} style={{ width: '900px', padding: '5px' }} header={t('GROUP.PRICING.DETAILS')} modal className="p-fluid" footer={groupPricingDialogFooter} onHide={hideDialog}>
                        <div className="card flex flex-wrap p-fluid mt-3 gap-4">
                            <div className="flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="reseller_group" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.PRICING.LABEL.RESELLER_GROUP')}
                                    </label>
                                    <Dropdown
                                        id="reseller_group"
                                        value={groupPricing.reseller_group}
                                        options={reseller_groups}
                                        onChange={(e) =>
                                            setGroupPricing((prev) => ({
                                                ...prev,
                                                reseller_group: e.value,
                                                reseller_group_id: e.value?.id || 0
                                            }))
                                        }
                                        optionLabel="name"
                                        placeholder={t('GROUP.PRICING.PLACEHOLDER.RESELLER_GROUP')}
                                        className="w-full"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="fixed_fee" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.PRICING.LABEL.FIXED_FEE')}
                                    </label>
                                    <InputText
                                        id="fixed_fee"
                                        type="number"
                                        value={groupPricing.fixed_fee?.toString()}
                                        onChange={(e) =>
                                            setGroupPricing((prev) => ({
                                                ...prev,
                                                fixed_fee: parseFloat(e.target.value) || 0
                                            }))
                                        }
                                        required
                                        placeholder={t('GROUP.PRICING.PLACEHOLDER.FIXED_FEE')}
                                    />
                                </div>

                                <div className="field-checkbox">
                                    <label htmlFor="use_fixed_fee" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.PRICING.LABEL.USE_FIXED_FEE')}
                                    </label>
                                    <input
                                        id="use_fixed_fee"
                                        type="checkbox"
                                        checked={groupPricing.use_fixed_fee ?? false}
                                        onChange={(e) =>
                                            setGroupPricing((prev) => ({
                                                ...prev,
                                                use_fixed_fee: e.target.checked
                                            }))
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="service" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.PRICING.LABEL.SERVICE')}
                                    </label>
                                    <Dropdown
                                        id="service"
                                        value={groupPricing.service}
                                        options={services}
                                        onChange={(e) =>
                                            setGroupPricing((prev) => ({
                                                ...prev,
                                                service: e.value,
                                                service_id: e.value?.id || 0
                                            }))
                                        }
                                        optionLabel="service_category.category_name"
                                        placeholder={t('GROUP.PRICING.PLACEHOLDER.SERVICE')}
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
                                    <label htmlFor="markup_percentage" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.PRICING.LABEL.MARKUP_PERCENTAGE')}
                                    </label>
                                    <InputText
                                        id="markup_percentage"
                                        type="number"
                                        value={groupPricing.markup_percentage?.toString()}
                                        onChange={(e) =>
                                            setGroupPricing((prev) => ({
                                                ...prev,
                                                markup_percentage: parseFloat(e.target.value) || 0
                                            }))
                                        }
                                        required
                                        placeholder={t('GROUP.PRICING.PLACEHOLDER.MARKUP_PERCENTAGE')}
                                    />
                                </div>

                                <div className="field-checkbox">
                                    <label htmlFor="use_markup" style={{ fontWeight: 'bold' }}>
                                        {t('GROUP.PRICING.LABEL.USE_MARKUP')}
                                    </label>
                                    <input
                                        id="use_markup"
                                        type="checkbox"
                                        checked={groupPricing.use_markup ?? false}
                                        onChange={(e) =>
                                            setGroupPricing((prev) => ({
                                                ...prev,
                                                use_markup: e.target.checked
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteGroupPricingDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteGroupPricingDialogFooter} onHide={hideDeleteGroupPricingDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {groupPricing && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{groupPricing.reseller_group?.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteGroupPricingsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteGroupPricingsDialogFooter} onHide={hideDeleteGroupPricingsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {groupPricing && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected group pricings?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default GroupPricingPage;
