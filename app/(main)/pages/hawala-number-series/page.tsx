/* eslint-disable @next/next/no-img-element */
'use client';
import { _fetchHawalaBranchList } from '@/app/redux/actions/hawalaBranchActions';
import {
    _addHawalaNumberSeries,
    _changeHawalaNumberSeriesStatus,
    _deleteHawalaNumberSeries,
    _editHawalaNumberSeries,
    _fetchHawalaNumberSeriesList
} from '@/app/redux/actions/hawalaSeriesActions';
import { AppDispatch } from '@/app/redux/store';
import { FilterBar } from '@/components/admin/filter-bar';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { SearchSelect } from '@/components/admin/search-select';
import { ListPage } from '@/components/admin/list-page';
import { RowActions } from '@/components/admin/row-actions';
import { Badge } from '@/components/ui/badge';
import { Button as UiButton } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { HawalaBranch, HawalaNumberSeries } from '@/types/interface';
import { cn } from '@/lib/utils';
import { Check, Eye, EyeOff, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { isRTL } from '../../utilities/rtlUtil';

const HawalaNumberSeriesPage = () => {
    let emptyHawalaSeries: HawalaNumberSeries = {
        id: 0,
        branch_id: 0,
        prefix: '',
        current_number: 0,
        reset_daily: false,
        is_active: true
    };

    const [hawalaSeriesDialog, setHawalaSeriesDialog] = useState(false);
    const [deleteHawalaSeriesDialog, setDeleteHawalaSeriesDialog] = useState(false);
    const [deleteHawalaSeriesBulkDialog, setDeleteHawalaSeriesBulkDialog] = useState(false);
    const [hawalaSeries, setHawalaSeries] = useState<HawalaNumberSeries>(emptyHawalaSeries);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { series, loading, pagination } = useSelector((state: any) => state.hawalaNumberSeriesReducer);
    const { hawalaBranches } = useSelector((state: any) => state.hawalaBranchReducer);

    const { t } = useTranslation();
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [branchSearchTerm, setBranchSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 20)));

    useEffect(() => {
        dispatch(_fetchHawalaNumberSeriesList(1, searchTag));
        dispatch(_fetchHawalaBranchList(1, ''));
    }, [dispatch, searchTag]);

    // Debounced branch search
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(_fetchHawalaBranchList(1, branchSearchTerm));
        }, 300); // Debounce for 300ms

        return () => clearTimeout(timer);
    }, [branchSearchTerm, dispatch]);

    const openNew = () => {
        setHawalaSeries(emptyHawalaSeries);
        setSubmitted(false);
        setHawalaSeriesDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setHawalaSeriesDialog(false);
    };

    const hideDeleteHawalaSeriesDialog = () => {
        setDeleteHawalaSeriesDialog(false);
    };

    const hideDeleteHawalaSeriesBulkDialog = () => {
        setDeleteHawalaSeriesBulkDialog(false);
    };

    const saveHawalaSeries = () => {
        setSubmitted(true);

        if (!hawalaSeries.branch_id || !hawalaSeries.prefix || hawalaSeries.current_number === undefined) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        if (hawalaSeries.id && hawalaSeries.id !== 0) {
            dispatch(_editHawalaNumberSeries(hawalaSeries.id, hawalaSeries, toast, t));
        } else {
            dispatch(_addHawalaNumberSeries(hawalaSeries, toast, t));
        }

        setHawalaSeriesDialog(false);
        setHawalaSeries(emptyHawalaSeries);
        setSubmitted(false);
    };

    const editHawalaSeries = (series: HawalaNumberSeries) => {
        // Find the matching branch object from hawalaBranches
        const matchingBranch = hawalaBranches.find((branch: HawalaBranch) => branch.id === series.branch_id);

        setHawalaSeries({
            ...series,
            branch: matchingBranch
        });
        setHawalaSeriesDialog(true);
    };

    const confirmDeleteHawalaSeries = (series: HawalaNumberSeries) => {
        setHawalaSeries(series);
        setDeleteHawalaSeriesDialog(true);
    };

    const deleteHawalaSeries = () => {
        if (!hawalaSeries?.id) {
            console.error('Hawala Series ID is undefined.');
            return;
        }
        dispatch(_deleteHawalaNumberSeries(hawalaSeries?.id, toast, t));
        setDeleteHawalaSeriesDialog(false);
    };

    const handleStatusChange = (id: number, is_active: boolean) => {
        dispatch(_changeHawalaNumberSeriesStatus(id, is_active, toast, t));
    };

    const onPageChange = (page: number) => {
        dispatch(_fetchHawalaNumberSeriesList(page, searchTag));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchHawalaNumberSeriesList(pagination?.page || 1, searchTag) as any);
        setRefreshing(false);
    };

    const getRowActions = (row: HawalaNumberSeries) => [
        { label: t('TABLE.GENERAL.EDIT'), icon: <Pencil className="h-4 w-4" />, onClick: () => editHawalaSeries(row) },
        {
            label: row.is_active ? t('DEACTIVATE') : t('ACTIVATE'),
            icon: row.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />,
            onClick: () => handleStatusChange(row.id, !row.is_active)
        },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            danger: true,
            separatorBefore: true,
            onClick: () => confirmDeleteHawalaSeries(row)
        }
    ];

    const deleteHawalaSeriesDialogFooter = (
        <>
            <Button
                label={t('APP.GENERAL.CANCEL')}
                icon="pi pi-times"
                severity="danger"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={hideDeleteHawalaSeriesDialog}
            />
            <Button
                label={t('FORM.GENERAL.SUBMIT')}
                icon="pi pi-check"
                severity="success"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={deleteHawalaSeries}
            />
        </>
    );

    const deleteHawalaSeriesBulkDialogFooter = (
        <>
            <Button
                label={t('APP.GENERAL.CANCEL')}
                icon="pi pi-times"
                severity="danger"
                className={isRTL() ? 'rtl-button' : ''}
                onClick={hideDeleteHawalaSeriesBulkDialog}
            />
            <Button
                label={t('FORM.GENERAL.SUBMIT')}
                icon="pi pi-check"
                severity="success"
                className={isRTL() ? 'rtl-button' : ''}
            />
        </>
    );

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.HAWALA_NUMBER_SERIES', { defaultValue: 'سری شماره حواله' })}
                description={t('HAWALA_SERIES.PAGE.DESCRIPTION', { defaultValue: 'پیشوند و شماره‌گذاری حواله به تفکیک شعبه' })}
                loading={loading}
                actions={
                    <>
                        <UiButton variant="default" size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('HAWALA_SERIES.CREATE_NEW')}
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
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در سری‌ها...' })}
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
                <table className="w-full min-w-[880px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA_SERIES.TABLE.BRANCH')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA_SERIES.TABLE.PREFIX')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA_SERIES.TABLE.CURRENT_NUMBER')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA_SERIES.TABLE.RESET_DAILY')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('HAWALA_SERIES.TABLE.STATUS')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(series || []).length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (series || []).map((row: HawalaNumberSeries) => (
                                <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                    <td className="px-2 py-1.5 align-middle">
                                        <RowActions items={getRowActions(row)} />
                                    </td>
                                    <td className="px-2 py-1.5 text-start">{row?.branch?.name || '—'}</td>
                                    <td className="px-2 py-1.5 font-mono font-medium">{row.prefix || '—'}</td>
                                    <td className="px-2 py-1.5 tabular-nums">{row.current_number ?? '—'}</td>
                                    <td className="px-2 py-1.5">
                                        {row.reset_daily ? (
                                            <Check className="h-4 w-4 text-emerald-600" aria-hidden />
                                        ) : (
                                            <X className="h-4 w-4 text-muted-foreground" aria-hidden />
                                        )}
                                    </td>
                                    <td className="px-2 py-1.5">
                                        <Badge variant={row.is_active ? 'success' : 'muted'} className="text-[10px]">
                                            {row.is_active ? t('APP.GENERAL.ACTIVE') : t('APP.GENERAL.INACTIVE')}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </ListPage>

            <FormSheet
                open={hawalaSeriesDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="lg"
                side="left"
                title={t('HAWALA_SERIES.DETAILS')}
                description={
                    hawalaSeries.id
                        ? t('HAWALA_SERIES.FORM.EDIT_HINT', { defaultValue: 'ویرایش سری شماره حواله' })
                        : t('HAWALA_SERIES.FORM.CREATE_HINT', { defaultValue: 'تعریف سری شماره جدید' })
                }
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveHawalaSeries}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('HAWALA_SERIES.FORM.SECTION.MAIN', { defaultValue: 'اطلاعات سری' })}>
                    <FormField
                        label={t('HAWALA_SERIES.FORM.BRANCH')}
                        required
                        fullWidth
                        error={submitted && !hawalaSeries.branch_id ? t('APP.VALIDATION.REQUIRED_BRANCH') : null}
                    >
                        <SearchSelect
                            value={hawalaSeries.branch}
                            options={hawalaBranches || []}
                            onChange={(selected) => {
                                setHawalaSeries((prev) => ({
                                    ...prev,
                                    branch: selected,
                                    branch_id: selected?.id || 0
                                }));
                            }}
                            optionLabel="name"
                            searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                            placeholder={t('HAWALA_SERIES.FORM.SELECT_BRANCH')}
                            error={submitted && !hawalaSeries.branch_id}
                            returnFullObject
                            onSearch={(term) => setBranchSearchTerm(term)}
                        />
                    </FormField>
                    <FormField
                        label={t('HAWALA_SERIES.FORM.PREFIX')}
                        required
                        error={submitted && !hawalaSeries.prefix ? t('APP.VALIDATION.REQUIRED_PREFIX') : null}
                    >
                        <Input
                            id="prefix"
                            value={hawalaSeries.prefix}
                            onChange={(e) =>
                                setHawalaSeries((prev: any) => ({
                                    ...prev,
                                    prefix: e.target.value.toUpperCase()
                                }))
                            }
                            required
                            placeholder={t('HAWALA_SERIES.FORM.PREFIX_PLACEHOLDER')}
                            className={cn('w-full', submitted && !hawalaSeries.prefix && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('HAWALA_SERIES.FORM.CURRENT_NUMBER')}
                        required
                        error={submitted && hawalaSeries.current_number === undefined ? t('APP.VALIDATION.REQUIRED_CURRENT_NUMBER') : null}
                    >
                        <Input
                            id="current_number"
                            value={hawalaSeries.current_number?.toString()}
                            onChange={(e) =>
                                setHawalaSeries((prev: any) => ({
                                    ...prev,
                                    current_number: Number(e.target.value)
                                }))
                            }
                            required
                            inputMode="numeric"
                            placeholder={t('HAWALA_SERIES.FORM.CURRENT_NUMBER_PLACEHOLDER')}
                            className={cn('w-full', submitted && hawalaSeries.current_number === undefined && 'border-rose-300')}
                        />
                    </FormField>
                </FormSection>
                <FormSection title={t('HAWALA_SERIES.FORM.SECTION.OPTIONS', { defaultValue: 'تنظیمات' })}>
                    <FormField label={t('HAWALA_SERIES.FORM.RESET_DAILY')} fullWidth>
                        <Switch
                            id="reset_daily"
                            checked={Boolean(hawalaSeries.reset_daily)}
                            onCheckedChange={(checked) =>
                                setHawalaSeries((prev: any) => ({
                                    ...prev,
                                    reset_daily: checked
                                }))
                            }
                        />
                    </FormField>
                    <FormField label={t('HAWALA_SERIES.FORM.ACTIVE')} fullWidth>
                        <Switch
                            id="is_active"
                            checked={Boolean(hawalaSeries.is_active)}
                            onCheckedChange={(checked) =>
                                setHawalaSeries((prev: any) => ({
                                    ...prev,
                                    is_active: checked
                                }))
                            }
                        />
                    </FormField>
                </FormSection>
            </FormSheet>

                    {/* Delete Confirmation Dialog */}
                    <Dialog
                        visible={deleteHawalaSeriesDialog}
                        style={{ width: '450px' }}
                        header={t('APP.GENERAL.CONFIRM')}
                        modal
                        footer={deleteHawalaSeriesDialogFooter}
                        onHide={hideDeleteHawalaSeriesDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {hawalaSeries && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE', {
                                        name: `${hawalaSeries.prefix} series`
                                    })}
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* Bulk Delete Confirmation Dialog */}
                    <Dialog
                        visible={deleteHawalaSeriesBulkDialog}
                        style={{ width: '450px' }}
                        header={t('APP.GENERAL.CONFIRM')}
                        modal
                        footer={deleteHawalaSeriesBulkDialogFooter}
                        onHide={hideDeleteHawalaSeriesBulkDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            <span>{t('APP.DELETE_SELECTED_CONFIRMATION')}</span>
                        </div>
                    </Dialog>
        </div>
    );
};

export default withAuth(HawalaNumberSeriesPage);
