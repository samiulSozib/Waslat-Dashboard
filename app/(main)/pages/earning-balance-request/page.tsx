/* eslint-disable @next/next/no-img-element */
'use client';
import { _addEarningBalanceRequest, _changeEarningBalanceStatus, _fetchEarningBalanceRequestList } from '@/app/redux/actions/earningBalanceActions';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { AppDispatch } from '@/app/redux/store';
import { EarningBalance, Reseller } from '@/types/interface';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { isRTL } from '../../utilities/rtlUtil';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { NumberInput } from '@/components/ui/number-input';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { RowActions } from '@/components/admin/row-actions';
import { Button as UiButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { CheckCircle, Plus, Trash2, XCircle } from 'lucide-react';

const EarningBalanceRequest = () => {
    // State management
    const [addDialogVisible, setAddDialogVisible] = useState(false);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [statusChangeDialog, setStatusChangeDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { earningBalances, loading } = useSelector((state: any) => state.earningBalanceReducer);
    const { resellers, loading: resellersLoading } = useSelector((state: any) => state.resellerReducer);
    const [selectedRequest, setSelectedRequest] = useState<EarningBalance | null>(null);
    const { t } = useTranslation();
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        reseller_id: '',
        amount: 0
    });

    // Fetch data on component mount and when search term changes
    useEffect(() => {
        dispatch(_fetchResellers());
        dispatch(_fetchEarningBalanceRequestList(1, searchTag));
    }, [dispatch, searchTag]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (resellerSearchTerm) {
                dispatch(_fetchResellers(1, resellerSearchTerm));
            } else {
                dispatch(_fetchResellers(1, ''));
            }
        }, 300); // Debounce for 300ms

        return () => clearTimeout(timer);
    }, [resellerSearchTerm, dispatch]);

    // Dialog handlers
    const openNew = () => {
        setFormData({
            reseller_id: '',
            amount: 0
        });
        setSubmitted(false);
        setAddDialogVisible(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setAddDialogVisible(false);
    };

    const hideDeleteDialog = () => {
        setDeleteDialogVisible(false);
    };

    const confirmDeleteRequest = (request: EarningBalance) => {
        setSelectedRequest(request);
        setDeleteDialogVisible(true);
    };

    const confirmStatusChange = (request: EarningBalance, status: string) => {
        setSelectedRequest(request);
        setSelectedStatus(status);
        setStatusChangeDialog(true);
    };

    const changeStatus = () => {
        if (!selectedRequest?.id || !selectedStatus) return;

        dispatch(_changeEarningBalanceStatus(selectedRequest.id, selectedStatus, toast, t));

        setStatusChangeDialog(false);
    };

    const submitRequest = () => {
        setSubmitted(true);

        if (!formData.reseller_id || formData.amount <= 0) return;

        dispatch(_addEarningBalanceRequest(formData, toast, t));
        dispatch(_fetchEarningBalanceRequestList());
        setAddDialogVisible(false);
    };

    const earningStatusVariant = (status: string | null): 'success' | 'warning' | 'danger' | 'muted' => {
        if (status === 'approved') return 'success';
        if (status === 'pending') return 'warning';
        if (status === 'rejected') return 'danger';
        return 'muted';
    };

    const earningStatusLabel = (status: string | null) => {
        if (status === 'pending') return t('ORDER.STATUS.PENDING');
        if (status === 'approved') return t('ORDER.STATUS.CONFIRMED');
        if (status === 'rejected') return t('ORDER.STATUS.REJECTED');
        return t('ORDER.STATUS.UNKNOWN', { defaultValue: 'نامشخص' });
    };

    const getEarningRowActions = (row: EarningBalance) => [
        { label: t('ORDER.STATUS.APPROVE'), icon: <CheckCircle className="h-4 w-4" />, onClick: () => confirmStatusChange(row, 'approved') },
        { label: t('ORDER.STATUS.REJECT'), icon: <XCircle className="h-4 w-4" />, onClick: () => confirmStatusChange(row, 'rejected') },
        { label: t('APP.GENERAL.DELETE', { defaultValue: 'حذف' }), icon: <Trash2 className="h-4 w-4" />, onClick: () => confirmDeleteRequest(row), danger: true, separatorBefore: true }
    ];

    const statusChangeDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={() => setStatusChangeDialog(false)} className={isRTL() ? 'rtl-button' : ''} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={changeStatus} loading={loading} className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            {loading ? <ProgressBar mode="indeterminate" style={{ height: '4px' }} className="rounded" /> : null}
            <ListPage
                title={t('MENU.EARNING_BALANCE_REQUEST', { defaultValue: 'درخواست انتقال درآمد' })}
                description={t('EARNING_BALANCE_REQUEST.PAGE.DESCRIPTION', { defaultValue: 'بررسی و ثبت درخواست‌های انتقال موجودی درآمدی' })}
                loading={loading}
                actions={
                    <UiButton size="sm" onClick={openNew}>
                        <Plus className="h-4 w-4" />
                        {t('APP.GENERAL.NEW', { defaultValue: 'جدید' })}
                    </UiButton>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو...' })}
                    />
                }
            >
                <table className="w-full min-w-[1100px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">
                                {t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}
                            </th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.RESELLER')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.AMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.REVIEWED_BY')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.REVIEWED_AT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950 max-w-[12rem]">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.NOTES')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('EARNING_BALANCE_REQUEST.TABLE.COLUMN.STATUS')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(earningBalances || []).length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (earningBalances || []).map((row: EarningBalance) => (
                                <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                    <td className="px-2 py-1.5 align-middle">
                                        <RowActions items={getEarningRowActions(row)} />
                                    </td>
                                    <td className="px-2 py-1.5 text-start">{row.reseller?.reseller_name || '—'}</td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.amount ?? '—'}</td>
                                    <td className="px-2 py-1.5 text-start text-muted-foreground">{row.reviewed_by || '—'}</td>
                                    <td className="px-2 py-1.5 whitespace-nowrap text-muted-foreground">{row.reviewed_at || '—'}</td>
                                    <td className="max-w-[12rem] truncate px-2 py-1.5 text-start text-muted-foreground" title={row.admin_note || ''}>
                                        {row.admin_note || '—'}
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <Badge variant={earningStatusVariant(row.status)} className="text-[10px]">
                                            {earningStatusLabel(row.status)}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </ListPage>

            <FormSheet
                open={addDialogVisible}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={t('EARNING_BALANCE_REQUEST.ADD_DIALOG.TITLE')}
                description="ثبت درخواست انتقال موجودی درآمدی"
                size="lg"
                side="left"
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={submitRequest}
                        loading={loading}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title="جزئیات درخواست">
                    <FormField
                        label={t('EARNING_BALANCE_REQUEST.ADD_DIALOG.RESELLER')}
                        required
                        fullWidth
                        error={submitted && !formData.reseller_id ? t('FORM.VALIDATION.REQUIRED') : null}
                    >
                        <SearchSelect
                            value={
                                (resellers || []).find(
                                    (r: Reseller) => String(r.id) === String(formData.reseller_id)
                                ) || null
                            }
                            options={resellers || []}
                            onChange={(selectedOption: Reseller | null) => {
                                setFormData((prev) => ({
                                    ...prev,
                                    reseller_id: selectedOption?.id != null ? String(selectedOption.id) : ''
                                }));
                            }}
                            optionLabel="reseller_name"
                            searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                            placeholder={t('PAYMENT.FORM.INPUT.RESELLER')}
                            error={submitted && !formData.reseller_id}
                            showClear
                            returnFullObject
                            emptyMessage={t('NO_RESULTS_FOUND')}
                            noResultsMessage={t('TRY_DIFFERENT_SEARCH_TERM')}
                            onSearch={(searchTerm) => setResellerSearchTerm(searchTerm)}
                            itemTemplate={(option) => (
                                <div>
                                    <div className="text-sm font-semibold text-foreground">
                                        {[option.contact_name, option.reseller_name].filter(Boolean).join(' · ')}
                                    </div>
                                    {option.phone ? <div className="mt-0.5 text-xs text-muted-foreground">{option.phone}</div> : null}
                                </div>
                            )}
                            valueTemplate={(option) => (
                                <div>
                                    <div className="text-sm font-semibold">{option.reseller_name}</div>
                                    <div className="mt-0.5 text-xs text-muted-foreground">
                                        {[option.contact_name, option.phone].filter(Boolean).join(' · ')}
                                    </div>
                                </div>
                            )}
                        />
                    </FormField>
                    <FormField
                        label={t('EARNING_BALANCE_REQUEST.ADD_DIALOG.AMOUNT')}
                        required
                        fullWidth
                        error={submitted && formData.amount <= 0 ? t('FORM.VALIDATION.AMOUNT_POSITIVE') : null}
                    >
                        <NumberInput
                            id="amount"
                            min={0}
                            step={0.01}
                            value={formData.amount || null}
                            onValueChange={(v) =>
                                setFormData({
                                    ...formData,
                                    amount: v ?? 0
                                })
                            }
                            allowNull={false}
                            className={cn('w-full', submitted && formData.amount <= 0 && 'border-rose-300')}
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    {/* Status Change Dialog */}
                    <Dialog visible={statusChangeDialog} style={{ width: '450px' }} header={t('EARNING_BALANCE_REQUEST.STATUS_DIALOG.TITLE')} modal footer={statusChangeDialogFooter} onHide={() => setStatusChangeDialog(false)}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {selectedRequest && (
                                <span>
                                    {t('EARNING_BALANCE_REQUEST.STATUS_DIALOG.CONFIRMATION')}
                                    <b>{selectedRequest.amount}</b> {t('FOR')} {selectedRequest.reseller?.reseller_name}?
                                    <br />
                                    {t('NEW_STATUS')}: {selectedStatus === 'approved' && t('ORDER.STATUS.CONFIRMED')}
                                    {selectedStatus === 'rejected' && t('ORDER.STATUS.REJECTED')}
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        visible={deleteDialogVisible}
                        style={{ width: '450px' }}
                        header={t('TABLE.GENERAL.CONFIRM')}
                        modal
                        footer={
                            <>
                                <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideDeleteDialog} />
                                <Button
                                    label={t('FORM.GENERAL.SUBMIT')}
                                    icon="pi pi-check"
                                    severity="success"
                                    onClick={() => { }} // Implement delete functionality
                                    loading={loading}
                                />
                            </>
                        }
                        onHide={hideDeleteDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {selectedRequest && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the request for <b>{selectedRequest.amount}</b> {t('FOR')} {selectedRequest.reseller?.reseller_name}?
                                </span>
                            )}
                        </div>
                    </Dialog>
        </div>
    );
};

export default withAuth(EarningBalanceRequest);
