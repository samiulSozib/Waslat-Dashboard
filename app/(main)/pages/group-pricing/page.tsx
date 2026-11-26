/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { Switch } from '@/components/ui/switch';
import { Button as UiButton } from '@/components/ui/button';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { SearchSelect } from '@/components/admin/search-select';
import { AppDispatch } from '@/app/redux/store';
import { GroupPricing, ResellerGroup } from '@/types/interface';
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

    const actionBodyTemplate = (rowData: GroupPricing) => (
        <RowActions
            items={[
                {
                    label: t('TABLE.GENERAL.EDIT', { defaultValue: 'ویرایش' }),
                    icon: <Pencil className="h-4 w-4" />,
                    onClick: () => editGroupPricing(rowData)
                },
                {
                    label: t('TABLE.GENERAL.DELETE', { defaultValue: 'حذف' }),
                    icon: <Trash2 className="h-4 w-4" />,
                    danger: true,
                    separatorBefore: true,
                    onClick: () => confirmDeleteGroupPricing(rowData)
                }
            ]}
        />
    );

    const isEditGroupPricing = Boolean(groupPricing.id && groupPricing.id !== 0);

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
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.GROUP_PRICING', { defaultValue: 'قیمت‌گذاری گروه' })}
                description={t('GROUP.PRICING.PAGE.DESCRIPTION', { defaultValue: 'تعریف نرخ و مارکاپ برای گروه‌های نمایندگان' })}
                loading={loading}
                actions={
                    <UiButton type="button" size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('GROUP.PRICING.CREATENEW')}
                    </UiButton>
                }
                toolbar={
                    <FilterBar
                        search={globalFilter}
                        onSearchChange={setGlobalFilter}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو...' })}
                    />
                }
            >
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
                        <Column
                            header={t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                            style={{ ...customCellStyle, textAlign: 'start' }}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '5rem' }}
                        />
                    </DataTable>
            </ListPage>

            <FormSheet
                open={groupPricingDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="xl"
                side="left"
                title={t('GROUP.PRICING.DETAILS')}
                description={
                    isEditGroupPricing
                        ? t('GROUP.PRICING.FORM.EDIT_HINT', { defaultValue: 'ویرایش قوانین قیمت‌گذاری گروه' })
                        : t('GROUP.PRICING.FORM.CREATE_HINT', { defaultValue: 'تعریف قیمت‌گذاری جدید برای گروه و خدمت' })
                }
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveGroupPricing}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('GROUP.PRICING.FORM.SECTION.MAIN', { defaultValue: 'گروه و خدمت' })}>
                    <FormField
                        label={t('GROUP.PRICING.LABEL.RESELLER_GROUP')}
                        required
                        error={submitted && !groupPricing.reseller_group_id ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={groupPricing.reseller_group}
                            options={reseller_groups || []}
                            onChange={(selected) =>
                                setGroupPricing((prev) => ({
                                    ...prev,
                                    reseller_group: selected,
                                    reseller_group_id: selected?.id || 0
                                }))
                            }
                            optionLabel="name"
                            placeholder={t('GROUP.PRICING.PLACEHOLDER.RESELLER_GROUP')}
                            error={submitted && !groupPricing.reseller_group_id}
                            returnFullObject
                        />
                    </FormField>
                    <FormField
                        label={t('GROUP.PRICING.LABEL.SERVICE')}
                        required
                        error={submitted && !groupPricing.service_id ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <SearchSelect
                            value={groupPricing.service}
                            options={services || []}
                            onChange={(selected) =>
                                setGroupPricing((prev) => ({
                                    ...prev,
                                    service: selected,
                                    service_id: selected?.id || 0
                                }))
                            }
                            optionLabel="service_category.category_name"
                            placeholder={t('GROUP.PRICING.PLACEHOLDER.SERVICE')}
                            error={submitted && !groupPricing.service_id}
                            returnFullObject
                            itemTemplate={(option) => (
                                <div className="flex gap-2">
                                    <div>{option.service_category?.category_name}</div>
                                    <div>{option.company?.company_name}</div>
                                </div>
                            )}
                            valueTemplate={(option) => (
                                <div className="flex gap-2 text-sm">
                                    <span>{option.service_category?.category_name}</span>
                                    <span className="text-muted-foreground">{option.company?.company_name}</span>
                                </div>
                            )}
                        />
                    </FormField>
                </FormSection>

                <FormSection title={t('GROUP.PRICING.FORM.SECTION.FEES', { defaultValue: 'کارمزد و مارکاپ' })}>
                    <FormField label={t('GROUP.PRICING.LABEL.FIXED_FEE')}>
                        <Input
                            id="fixed_fee"
                            type="number"
                            value={groupPricing.fixed_fee?.toString()}
                            onChange={(e) =>
                                setGroupPricing((prev) => ({
                                    ...prev,
                                    fixed_fee: parseFloat(e.target.value) || 0
                                }))
                            }
                            placeholder={t('GROUP.PRICING.PLACEHOLDER.FIXED_FEE')}
                            className="w-full"
                            disabled={!groupPricing.use_fixed_fee}
                        />
                    </FormField>
                    <FormField label={t('GROUP.PRICING.LABEL.MARKUP_PERCENTAGE')}>
                        <Input
                            id="markup_percentage"
                            type="number"
                            value={groupPricing.markup_percentage?.toString()}
                            onChange={(e) =>
                                setGroupPricing((prev) => ({
                                    ...prev,
                                    markup_percentage: parseFloat(e.target.value) || 0
                                }))
                            }
                            placeholder={t('GROUP.PRICING.PLACEHOLDER.MARKUP_PERCENTAGE')}
                            className="w-full"
                            disabled={!groupPricing.use_markup}
                        />
                    </FormField>
                    <FormField label={t('GROUP.PRICING.LABEL.USE_FIXED_FEE')}>
                        <Switch
                            id="use_fixed_fee"
                            checked={groupPricing.use_fixed_fee ?? false}
                            onCheckedChange={(v) =>
                                setGroupPricing((prev) => ({
                                    ...prev,
                                    use_fixed_fee: v
                                }))
                            }
                        />
                    </FormField>
                    <FormField label={t('GROUP.PRICING.LABEL.USE_MARKUP')}>
                        <Switch
                            id="use_markup"
                            checked={groupPricing.use_markup ?? false}
                            onCheckedChange={(v) =>
                                setGroupPricing((prev) => ({
                                    ...prev,
                                    use_markup: v
                                }))
                            }
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteGroupPricingDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteGroupPricingDialogFooter} onHide={hideDeleteGroupPricingDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {groupPricing && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{groupPricing.reseller_group?.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteGroupPricingsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteGroupPricingsDialogFooter} onHide={hideDeleteGroupPricingsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color:'red' }} />
                            {groupPricing && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected group pricings?</span>}
                        </div>
                    </Dialog>
        </div>
    );
};

export default GroupPricingPage;
