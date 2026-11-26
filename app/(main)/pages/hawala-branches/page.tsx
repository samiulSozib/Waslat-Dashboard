/* eslint-disable @next/next/no-img-element */
'use client';
import { _addHawalaBranch, _deleteHawalaBranch, _editHawalaBranch, _fetchHawalaBranchList } from '@/app/redux/actions/hawalaBranchActions';
import { AppDispatch } from '@/app/redux/store';
import { FilterBar } from '@/components/admin/filter-bar';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListPage } from '@/components/admin/list-page';
import { RowActions } from '@/components/admin/row-actions';
import { Badge } from '@/components/ui/badge';
import { Button as UiButton } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { HawalaBranch } from '@/types/interface';
import { cn } from '@/lib/utils';
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import withAuth from '../../authGuard';
import { isRTL } from '../../utilities/rtlUtil';

const HawalaBranchPage = () => {
    let emptyHawalaBranch: HawalaBranch = {
        id: 0,
        name: '',
        email: '',
        password: '',
        address: '',
        phone_number: '',
        commission_type: 'percentage',
        amount: 0,
        status: 'active'
    };

    const [hawalaBranchDialog, setHawalaBranchDialog] = useState(false);
    const [deleteHawalaBranchDialog, setDeleteHawalaBranchDialog] = useState(false);
    const [deleteHawalaBranchesDialog, setDeleteHawalaBranchesDialog] = useState(false);
    const [hawalaBranch, setHawalaBranch] = useState<HawalaBranch>(emptyHawalaBranch);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const { hawalaBranches, loading, pagination } = useSelector((state: any) => state.hawalaBranchReducer);
    const { t } = useTranslation();
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [refreshing, setRefreshing] = useState(false);

    const commissionTypes = [
        { label: t('HAWALA.FORM.PERCENTAGE'), value: 'percentage' },
        { label: t('HAWALA.FORM.FIXED'), value: 'fixed' }
    ];

    const statusOptions = [
        { label: t('APP.GENERAL.ACTIVE'), value: 'active' },
        { label: t('APP.GENERAL.INACTIVE'), value: 'inactive' }
    ];

    useEffect(() => {
        dispatch(_fetchHawalaBranchList(1, searchTag));
    }, [dispatch, searchTag]);

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 20)));

    const openNew = () => {
        setHawalaBranch(emptyHawalaBranch);
        setSubmitted(false);
        setHawalaBranchDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setHawalaBranchDialog(false);
    };

    const hideDeleteHawalaBranchDialog = () => {
        setDeleteHawalaBranchDialog(false);
    };

    const hideDeleteHawalaBranchesDialog = () => {
        setDeleteHawalaBranchesDialog(false);
    };

    const saveHawalaBranch = () => {
        setSubmitted(true);

        if (!hawalaBranch.name || !hawalaBranch.email || !hawalaBranch.phone_number || !hawalaBranch.address || !hawalaBranch.commission_type || !hawalaBranch.amount) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        if (hawalaBranch.id && hawalaBranch.id !== 0) {
            dispatch(_editHawalaBranch(hawalaBranch.id, hawalaBranch, toast, t));
        } else {
            dispatch(_addHawalaBranch(hawalaBranch, toast, t));
        }

        setHawalaBranchDialog(false);
        setHawalaBranch(emptyHawalaBranch);
        setSubmitted(false);
    };

    const editHawalaBranch = (branch: HawalaBranch) => {
        setHawalaBranch({ ...branch });
        setHawalaBranchDialog(true);
    };

    const confirmDeleteHawalaBranch = (branch: HawalaBranch) => {
        setHawalaBranch(branch);
        setDeleteHawalaBranchDialog(true);
    };

    const deleteHawalaBranch = () => {
        if (!hawalaBranch?.id) {
            console.error('Hawala Branch ID is undefined.');
            return;
        }
        dispatch(_deleteHawalaBranch(hawalaBranch?.id, toast, t));
        setDeleteHawalaBranchDialog(false);
    };

    const onPageChange = (page: number) => {
        dispatch(_fetchHawalaBranchList(page, searchTag));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchHawalaBranchList(pagination?.page || 1, searchTag) as any);
        setRefreshing(false);
    };

    const commissionLabel = (type?: string) => (type === 'percentage' ? t('HAWALA.FORM.PERCENTAGE') : t('HAWALA.FORM.FIXED'));

    const getRowActions = (row: HawalaBranch) => [
        {
            label: t('TABLE.GENERAL.VIEW', { defaultValue: 'مشاهده' }),
            icon: <Eye className="h-4 w-4" />,
            onClick: () => router.push(`/pages/hawala-branches/${row.id}`)
        },
        { label: t('TABLE.GENERAL.EDIT'), icon: <Pencil className="h-4 w-4" />, onClick: () => editHawalaBranch(row) },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            danger: true,
            separatorBefore: true,
            onClick: () => confirmDeleteHawalaBranch(row)
        }
    ];

    const deleteHawalaBranchDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteHawalaBranchDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteHawalaBranch} />
        </>
    );

    const deleteHawalaBranchesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteHawalaBranchesDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.HAWALA_BRANCHES', { defaultValue: 'شعب حواله' })}
                description={t('HAWALA.BRANCHES.DESCRIPTION', { defaultValue: 'مدیریت شعب و کارمزد حواله' })}
                loading={loading}
                actions={
                    <>
                        <UiButton variant="default" size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('HAWALA.CREATE_NEW')}
                        </UiButton>
                        <UiButton variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </UiButton>
                    </>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در شعب...' })}
                    />
                }
                footer={
                    <div className="flex flex-col gap-2 border-t border-emerald-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground">
                            {t('DATA_TABLE.TABLE.PAGINATOR.SHOWING', { defaultValue: 'صفحه' })}{' '}
                            {pagination?.page || 1} / {totalPages} · {pagination?.total || 0}
                        </div>
                        <div className="flex items-center gap-2">
                            <UiButton variant="outline" size="sm" disabled={(pagination?.page || 1) <= 1} onClick={() => onPageChange((pagination?.page || 1) - 1)}>
                                {t('PREVIOUS', { defaultValue: 'قبلی' })}
                            </UiButton>
                            <UiButton variant="outline" size="sm" disabled={(pagination?.page || 1) >= totalPages} onClick={() => onPageChange((pagination?.page || 1) + 1)}>
                                {t('NEXT', { defaultValue: 'بعدی' })}
                            </UiButton>
                        </div>
                    </div>
                }
            >
                <table className="w-full min-w-[960px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.TABLE.NAME')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.TABLE.EMAIL')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.TABLE.PHONE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.TABLE.COMMISSION_TYPE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.TABLE.AMOUNT')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA.TABLE.STATUS')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(hawalaBranches || []).length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (hawalaBranches || []).map((row: HawalaBranch) => (
                                <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                    <td className="px-2 py-1.5 align-middle">
                                        <RowActions items={getRowActions(row)} />
                                    </td>
                                    <td className="px-2 py-1.5 text-start font-medium">
                                        <button
                                            type="button"
                                            className="text-start font-medium text-emerald-800 hover:underline"
                                            onClick={() => router.push(`/pages/hawala-branches/${row.id}`)}
                                        >
                                            {row.name || '—'}
                                        </button>
                                    </td>
                                    <td className="px-2 py-1.5 text-start text-muted-foreground">{row.email || '—'}</td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.phone_number || '—'}</td>
                                    <td className="px-2 py-1.5">{commissionLabel(row.commission_type)}</td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.amount ?? '—'}</td>
                                    <td className="px-2 py-1.5">
                                        <Badge variant={row.status === 'active' ? 'success' : 'danger'} className="text-[10px]">
                                            {row.status === 'active' ? t('APP.GENERAL.ACTIVE') : t('APP.GENERAL.INACTIVE')}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </ListPage>

            <FormSheet
                open={hawalaBranchDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="xl"
                side="left"
                title={t('HAWALA.DETAILS')}
                description={
                    hawalaBranch.id
                        ? t('HAWALA.FORM.EDIT_HINT', { defaultValue: 'ویرایش اطلاعات شعبه حواله' })
                        : t('HAWALA.FORM.CREATE_HINT', { defaultValue: 'ثبت شعبه حواله جدید' })
                }
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveHawalaBranch}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('HAWALA.FORM.SECTION.IDENTITY', { defaultValue: 'هویت و تماس' })}>
                    <FormField
                        label={t('HAWALA.FORM.NAME')}
                        required
                        error={submitted && !hawalaBranch.name ? t('APP.VALIDATION.REQUIRED_NAME') : null}
                    >
                        <Input
                            id="name"
                            value={hawalaBranch.name}
                            onChange={(e) =>
                                setHawalaBranch((prev: any) => ({
                                    ...prev,
                                    name: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            placeholder={t('HAWALA.FORM.NAME_PLACEHOLDER')}
                            className={cn('w-full', submitted && !hawalaBranch.name && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('HAWALA.FORM.EMAIL')}
                        required
                        error={submitted && !hawalaBranch.email ? t('APP.VALIDATION.REQUIRED_EMAIL') : null}
                    >
                        <Input
                            id="email"
                            value={hawalaBranch.email}
                            onChange={(e) =>
                                setHawalaBranch((prev: any) => ({
                                    ...prev,
                                    email: e.target.value
                                }))
                            }
                            required
                            placeholder={t('HAWALA.FORM.EMAIL_PLACEHOLDER')}
                            className={cn('w-full', submitted && !hawalaBranch.email && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('HAWALA.FORM.PHONE')}
                        required
                        error={submitted && !hawalaBranch.phone_number ? t('APP.VALIDATION.REQUIRED_PHONE') : null}
                    >
                        <Input
                            id="phone_number"
                            value={hawalaBranch.phone_number}
                            onChange={(e) =>
                                setHawalaBranch((prev: any) => ({
                                    ...prev,
                                    phone_number: e.target.value
                                }))
                            }
                            required
                            placeholder={t('HAWALA.FORM.PHONE_PLACEHOLDER')}
                            className={cn('w-full', submitted && !hawalaBranch.phone_number && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('HAWALA.FORM.PASSWORD')}
                        required={!hawalaBranch.id}
                        error={submitted && !hawalaBranch.password && !hawalaBranch.id ? t('APP.VALIDATION.REQUIRED_PASSWORD') : null}
                    >
                        <Input
                            id="password"
                            type="password"
                            value={hawalaBranch.password}
                            onChange={(e) =>
                                setHawalaBranch((prev: any) => ({
                                    ...prev,
                                    password: e.target.value
                                }))
                            }
                            required={!hawalaBranch.id}
                            placeholder={t('HAWALA.FORM.PASSWORD_PLACEHOLDER')}
                            className={cn('w-full', submitted && !hawalaBranch.password && !hawalaBranch.id && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('HAWALA.FORM.ADDRESS')}
                        required
                        fullWidth
                        error={submitted && !hawalaBranch.address ? t('APP.VALIDATION.REQUIRED_ADDRESS') : null}
                    >
                        <Textarea
                            id="address"
                            value={hawalaBranch.address}
                            onChange={(e) =>
                                setHawalaBranch((prev: any) => ({
                                    ...prev,
                                    address: e.target.value
                                }))
                            }
                            required
                            rows={3}
                            placeholder={t('HAWALA.FORM.ADDRESS_PLACEHOLDER')}
                            className={cn('w-full', submitted && !hawalaBranch.address && 'border-rose-300')}
                        />
                    </FormField>
                </FormSection>
                <FormSection title={t('HAWALA.FORM.SECTION.COMMISSION', { defaultValue: 'کارمزد و وضعیت' })}>
                    <FormField label={t('HAWALA.FORM.COMMISSION_TYPE')} required>
                        <Select
                            value={hawalaBranch.commission_type || undefined}
                            onValueChange={(v) =>
                                setHawalaBranch((prev: any) => ({
                                    ...prev,
                                    commission_type: v
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('HAWALA.FORM.SELECT_COMMISSION_TYPE')} />
                            </SelectTrigger>
                            <SelectContent>
                                {commissionTypes.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField
                        label={hawalaBranch.commission_type === 'percentage' ? t('HAWALA.FORM.COMMISSION_PERCENTAGE') : t('HAWALA.FORM.COMMISSION_AMOUNT')}
                        required
                        error={submitted && !hawalaBranch.amount ? t('APP.VALIDATION.REQUIRED_AMOUNT') : null}
                    >
                        <Input
                            id="amount"
                            value={hawalaBranch.amount?.toString()}
                            onChange={(e) =>
                                setHawalaBranch((prev: any) => ({
                                    ...prev,
                                    amount: Number(e.target.value)
                                }))
                            }
                            required
                            type="number"
                            inputMode="decimal"
                            placeholder={hawalaBranch.commission_type === 'percentage' ? t('HAWALA.FORM.PERCENTAGE_PLACEHOLDER') : t('HAWALA.FORM.AMOUNT_PLACEHOLDER')}
                            className={cn('w-full', submitted && !hawalaBranch.amount && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField label={t('HAWALA.FORM.STATUS')}>
                        <Select
                            value={hawalaBranch.status || undefined}
                            onValueChange={(v) =>
                                setHawalaBranch((prev: any) => ({
                                    ...prev,
                                    status: v
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('HAWALA.FORM.SELECT_STATUS')} />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                </FormSection>
            </FormSheet>

            <Dialog visible={deleteHawalaBranchDialog} style={{ width: '450px' }} header={t('APP.GENERAL.CONFIRM')} modal footer={deleteHawalaBranchDialogFooter} onHide={hideDeleteHawalaBranchDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                    {hawalaBranch && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE', { name: hawalaBranch.name })}</span>}
                </div>
            </Dialog>

            <Dialog visible={deleteHawalaBranchesDialog} style={{ width: '450px' }} header={t('APP.GENERAL.CONFIRM')} modal footer={deleteHawalaBranchesDialogFooter} onHide={hideDeleteHawalaBranchesDialog}>
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                    {hawalaBranch && <span>{t('APP.DELETE_SELECTED_CONFIRMATION')}</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default withAuth(HawalaBranchPage);