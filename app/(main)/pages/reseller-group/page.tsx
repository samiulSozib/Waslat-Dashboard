/* eslint-disable @next/next/no-img-element */
'use client';
import { Button as PrimeButton } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { ResellerGroup } from '@/types/interface';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RowActions } from '@/components/admin/row-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { _addResellerGroup, _deleteResellerGroup, _editResellerGroup, _fetchResellerGroups } from '@/app/redux/actions/resellerGroupActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchLanguages } from '@/app/redux/actions/languageActions';
import { resellerGroupReducer } from '../../../redux/reducers/resellerGroupReducer';
import { useTranslation } from 'react-i18next';
import { customCellStyle, customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

const ResellerGroupPage = () => {
    let emptyResellerGroup: ResellerGroup = {
        id: 0,
        name: '',
        discount_type: '',
        discount_value: '',
        can_create_sub_resellers: 0,
        can_sub_reseller_create_subs: 0,
        sub_reseller_limit: 0,
        status: '',
        notes: '',
        created_at: '',
        updated_at: '',
        afg_custom_recharge_adjust_type: 'decrease',
        afg_custom_recharge_adjust_mode: 'fixed',
        afg_custom_recharge_adjust_value: 0
    };

    const [resellerGroupDialog, setResellerGroupDialog] = useState(false);
    const [deleteResellerGroupDialog, setDeleteResellerGroupDialog] = useState(false);
    const [deleteResellerGroupsDialog, setDeleteResellerGroupsDialog] = useState(false);
    const [resellerGroup, setResellerGroup] = useState<ResellerGroup>(emptyResellerGroup);
    const [selectedCompanies, setSelectedResellerGroup] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const globalFilter = useDebouncedValue(searchInput, 350);
    const [refreshing, setRefreshing] = useState(false);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { countries, loading } = useSelector((state: any) => state.countriesReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { languages } = useSelector((state: any) => state.languageReducer);
    const { reseller_groups } = useSelector((state: any) => state.resellerGroupReducer);
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchResellerGroups());
    }, [dispatch]);

    const openNew = () => {
        setResellerGroup(emptyResellerGroup);
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
        if (resellerGroup.id && resellerGroup.id !== 0) {
            dispatch(_editResellerGroup(resellerGroup.id, resellerGroup, toast, t));
        } else {
            dispatch(_addResellerGroup(resellerGroup, toast, t));
        }

        setResellerGroupDialog(false);
        setResellerGroup(emptyResellerGroup);
    };

    const editResellerGroup = (resellerGroup: ResellerGroup) => {
        setResellerGroup({ ...resellerGroup });
        setResellerGroupDialog(true);
    };

    const confirmDeleteResellerGroup = (resellerGroup: ResellerGroup) => {
        setResellerGroup(resellerGroup);
        setDeleteResellerGroupDialog(true);
    };

    const deleteResellerGroup = () => {
        if (!resellerGroup?.id) {
            console.error('ResellerGroup  ID is undefined.');
            return;
        }
        dispatch(_deleteResellerGroup(resellerGroup?.id, toast, t));
        setDeleteResellerGroupDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteResellerGroupsDialog(true);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchResellerGroups() as any);
        setRefreshing(false);
    };

    const resellerGroupRowActions = (rowData: ResellerGroup) => [
        {
            label: t('TABLE.GENERAL.EDIT'),
            icon: <Pencil className="h-4 w-4" />,
            onClick: () => editResellerGroup(rowData)
        },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => confirmDeleteResellerGroup(rowData),
            danger: true,
            separatorBefore: true
        }
    ];

    const resellerGroupNameBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">ResellerGroup</span>
                {rowData.name}
            </>
        );
    };

    const discount_typeBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Discount Type</span>
                {rowData.discount_type}
            </>
        );
    };

    const discount_valueBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Discount Value</span>
                {rowData.discount_value}
            </>
        );
    };

    const subresellerLimitBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Sub reseller Limit</span>
                {rowData.sub_reseller_limit}
            </>
        );
    };

    const canAddSubResellerBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Can Add Sub-reseller</span>
                <span style={{ borderRadius: '10px' }} className={`px-3 py-1 text-center font-semibold inline-block w-16 ${rowData.can_create_sub_resellers ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {rowData.can_create_sub_resellers ? 'Yes' : 'No'}
                </span>
            </>
        );
    };

    const canSubResellerCreateSubsBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Can Sub-reseller Add Sub</span>
                <span style={{ borderRadius: '10px' }} className={`px-3 py-1 text-center font-semibold inline-block w-16 ${rowData.can_sub_reseller_create_subs ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {rowData.can_sub_reseller_create_subs ? 'Yes' : 'No'}
                </span>
            </>
        );
    };

    const statusBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Status</span>
                <span style={{ borderRadius: '10px', textAlign: 'center' }} className={`px-2 py-2  text-center text-white font-semibold inline-block w-24 ${rowData.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {rowData.status}
                </span>
            </>
        );
    };

    const notesBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Notes</span>
                {rowData.notes}
            </>
        );
    };

    // New field body templates
    const rechargeAdjustTypeBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Recharge Adjust Type</span>
                {rowData.afg_custom_recharge_adjust_type}
            </>
        );
    };

    const rechargeAdjustModeBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Recharge Adjust Mode</span>
                {rowData.afg_custom_recharge_adjust_mode}
            </>
        );
    };

    const rechargeAdjustValueBodyTemplate = (rowData: ResellerGroup) => {
        return (
            <>
                <span className="p-column-title">Recharge Adjust Value</span>
                {rowData.afg_custom_recharge_adjust_value}
            </>
        );
    };

    const actionBodyTemplate = (rowData: ResellerGroup) => <RowActions items={resellerGroupRowActions(rowData)} />;

    const deleteResellerGroupDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteResellerGroupDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteResellerGroup} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteResellerGroupsDialog} />
            <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.RESELLERGROUP', { defaultValue: 'گروه فروشندگان' })}
                description="تعریف گروه‌ها، تخفیف و محدودیت زیرفروشنده"
                loading={loading}
                actions={
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </Button>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('RESELLER.GROUP.CREATENEW')}
                        </Button>
                    </div>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در گروه‌ها...' })}
                    />
                }
            >
                    <DataTable
                        ref={dt}
                        value={reseller_groups}
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
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        responsiveLayout="scroll"
                    >
                        <Column
                            style={{ ...customCellStyle, textAlign: 'start' }}
                            header={t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '4.5rem' }}
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="name" header={t('RESELLER.GROUP.TABLE.RESELLEGROUP')} body={resellerGroupNameBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="discount_type"
                            header={t('RESELLER.GROUP.TABLE.DISCOUNTTYPE')}
                            body={discount_typeBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="discount_value"
                            header={t('RESELLER.GROUP.TABLE.DISCOUNTVALUE')}
                            body={discount_valueBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="sub_reseller_limit"
                            header={t('RESELLER.GROUP.TABLE.SUBRESELLERLIMIT')}
                            body={subresellerLimitBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="can_create_sub_resellers"
                            header={t('RESELLER.GROUP.TABLE.CANADDSUBRESELLER')}
                            body={canAddSubResellerBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="can_sub_reseller_create_subs"
                            header={t('RESELLER.GROUP.TABLE.CANSUBRESLLERADDSUB')}
                            body={canSubResellerCreateSubsBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="afg_custom_recharge_adjust_type"
                            header={t('RECHARGE_ADJUST_TYPE')}
                            body={rechargeAdjustTypeBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="afg_custom_recharge_adjust_mode"
                            header={t('RECHARGE_ADJUST_MODE')}
                            body={rechargeAdjustModeBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="afg_custom_recharge_adjust_value"
                            header={t('RECHARGE_ADJUST_VALUE')}
                            body={rechargeAdjustValueBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="status" header={t('RESELLER.GROUP.TABLE.STATUS')} body={statusBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="notes" header={t('RESELLER.GROUP.TABLE.NOTES')} body={notesBodyTemplate}></Column>
                    </DataTable>
            </ListPage>

            <FormSheet
                open={resellerGroupDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="xl"
                side="left"
                title={t('RESELLER.GROUP.DETAILS')}
                description={
                    resellerGroup.id
                        ? t('RESELLER.GROUP.FORM.EDIT_HINT', { defaultValue: 'ویرایش گروه فروشنده' })
                        : t('RESELLER.GROUP.FORM.CREATE_HINT', { defaultValue: 'تعریف گروه فروشنده جدید' })
                }
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveResellerGroup}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('RESELLER.GROUP.FORM.SECTION.CORE', { defaultValue: 'اطلاعات اصلی' })}>
                    <FormField
                        label={t('RESELLER.GROUP.LABEL.GROUPNAME')}
                        required
                        error={submitted && !resellerGroup.name ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="name"
                            value={resellerGroup.name}
                            onChange={(e) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    name: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            className={cn('w-full', submitted && !resellerGroup.name && 'border-rose-300')}
                            placeholder={t('RESELLER.GROUP.PLACEHOLDER.GROUPNAME')}
                        />
                    </FormField>
                    <FormField label={t('RESELLER.GROUP.LABEL.DISCOUNTTYPE')}>
                        <Select
                            value={resellerGroup.discount_type || undefined}
                            onValueChange={(v) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    discount_type: v
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('RESELLER.GROUP.PLACEHOLDER.DISCOUNTTYPE')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Percentage">Percentage</SelectItem>
                                <SelectItem value="Fixed">Fixed</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField
                        label={t('RESELLER.GROUP.LABEL.DISCOUNTVALUE')}
                        required
                        error={submitted && !resellerGroup.discount_value ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="discount_value"
                            value={resellerGroup.discount_value}
                            onChange={(e) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    discount_value: e.target.value
                                }))
                            }
                            required
                            className={cn('w-full', submitted && !resellerGroup.discount_value && 'border-rose-300')}
                            placeholder={t('RESELLER.GROUP.PLACEHOLDER.DISCOUNTVALUE')}
                        />
                    </FormField>
                    <FormField
                        label={t('RESELLER.GROUP.LABEL.SUBRESELLERLIMIT')}
                        required
                        error={submitted && !resellerGroup.sub_reseller_limit ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="sub_reseller_limit"
                            value={resellerGroup.sub_reseller_limit.toString()}
                            onChange={(e) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    sub_reseller_limit: e.target.value
                                }))
                            }
                            required
                            className={cn('w-full', submitted && !resellerGroup.sub_reseller_limit && 'border-rose-300')}
                            placeholder={t('RESELLER.GROUP.PLACEHOLDER.SUBRESELLERLIMIT')}
                        />
                    </FormField>
                    <FormField label={t('RESELLER.GROUP.LABEL.STATUS')}>
                        <Select
                            value={resellerGroup.status || undefined}
                            onValueChange={(v) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    status: v
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('RESELLER.GROUP.PLACEHOLDER.STATUS')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('RESELLER.GROUP.LABEL.NOTES')} fullWidth>
                        <Textarea
                            value={resellerGroup.notes}
                            onChange={(e) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    notes: e.target.value
                                }))
                            }
                            rows={3}
                            placeholder={t('RESELLER.GROUP.PLACEHOLDER.NOTES')}
                            className="w-full"
                        />
                    </FormField>
                </FormSection>
                <FormSection title={t('RESELLER.GROUP.FORM.SECTION.SUBS', { defaultValue: 'زیرفروشنده و شارژ' })}>
                    <FormField label={t('RESELLER.GROUP.LABEL.CANADDSUBRESELLER')}>
                        <Select
                            value={
                                resellerGroup.can_create_sub_resellers != null
                                    ? String(resellerGroup.can_create_sub_resellers)
                                    : undefined
                            }
                            onValueChange={(v) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    can_create_sub_resellers: Number(v)
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('RESELLER.GROUP.PLACEHOLDER.CANADDSUBRESELLER')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Yes</SelectItem>
                                <SelectItem value="0">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('RESELLER.GROUP.LABEL.CANSUBRESELLERADDSUBS')}>
                        <Select
                            value={
                                resellerGroup.can_sub_reseller_create_subs != null
                                    ? String(resellerGroup.can_sub_reseller_create_subs)
                                    : undefined
                            }
                            onValueChange={(v) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    can_sub_reseller_create_subs: Number(v)
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('RESELLER.GROUP.PLACEHOLDER.CANSUBRESELLERADDSUBS')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Yes</SelectItem>
                                <SelectItem value="0">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('RECHARGE_ADJUST_TYPE')}>
                        <Select
                            value={resellerGroup.afg_custom_recharge_adjust_type || undefined}
                            onValueChange={(v) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    afg_custom_recharge_adjust_type: v
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('SELECT_ADJUST_TYPE')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="decrease">{t('DECREASE')}</SelectItem>
                                <SelectItem value="increase">{t('INCREASE')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('RECHARGE_ADJUST_MODE')}>
                        <Select
                            value={resellerGroup.afg_custom_recharge_adjust_mode || undefined}
                            onValueChange={(v) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    afg_custom_recharge_adjust_mode: v
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('SELECT_ADJUST_MODE')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">{t('PERCENTAGE')}</SelectItem>
                                <SelectItem value="fixed">{t('FIXED')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('RECHARGE_ADJUST_VALUE')} fullWidth>
                        <Input
                            id="afg_custom_recharge_adjust_value"
                            value={resellerGroup.afg_custom_recharge_adjust_value?.toString() || ''}
                            onChange={(e) =>
                                setResellerGroup((prev) => ({
                                    ...prev,
                                    afg_custom_recharge_adjust_value: parseFloat(e.target.value) || 0
                                }))
                            }
                            placeholder={t('ENTER_ADJUST_VALUE')}
                            className="w-full"
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    <Dialog visible={deleteResellerGroupDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResellerGroupDialogFooter} onHide={hideDeleteResellerGroupDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {resellerGroup && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{resellerGroup.name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteResellerGroupsDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteResellerGroupsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {resellerGroup && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
        </div>
    );
};

export default ResellerGroupPage;