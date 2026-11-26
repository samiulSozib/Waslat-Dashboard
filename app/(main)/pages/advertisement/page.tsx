/* eslint-disable @next/next/no-img-element */
'use client';
import { _addAdvertisement, _deleteAdvertisement, _editAdvertisement, _fetchAdvertisements } from '@/app/redux/actions/advertisementActions';
import { AppDispatch } from '@/app/redux/store';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterBar } from '@/components/admin/filter-bar';
import { ListPage } from '@/components/admin/list-page';
import { RowActions } from '@/components/admin/row-actions';
import { Badge } from '@/components/ui/badge';
import { Button as UiButton } from '@/components/ui/button';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Advertisement } from '@/types/interface';
import { cn } from '@/lib/utils';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { FileDrop } from '@/components/ui/file-drop';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { isRTL } from '../../utilities/rtlUtil';

const AdvertisementPage = () => {

    let emptyAdvertisement: Advertisement = {
        id: 0,
        advertisement_title: '',
        ad_slider_image_url: '',
        status: 0,
        deleted_at: '',
        created_at: '',
        updated_at: ''
    }



    const [advertisementDialog, setAdvertisementDialog] = useState(false);
    const [deleteAdvertisementDialog, setDeleteAdvertisementDialog] = useState(false);
    const [deleteAdvertisementsDialog, setDeleteAdvertisementsDialog] = useState(false);
    const [advertisement, setAdvertisement] = useState<Advertisement>(emptyAdvertisement)
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>()
    const { advertisements, loading } = useSelector((state: any) => state.advertisementsReducer)
    const { t } = useTranslation()
    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [refreshing, setRefreshing] = useState(false);



    useEffect(() => {
        dispatch(_fetchAdvertisements(searchTag))
    }, [dispatch, searchTag])

    const openNew = () => {
        setAdvertisement(emptyAdvertisement)
        setSubmitted(false);
        setAdvertisementDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setAdvertisementDialog(false);
    };

    const hideDeleteAdvertisementDialog = () => {
        setDeleteAdvertisementDialog(false);
    };

    const hideDeleteAdvertisementsDialog = () => {
        setDeleteAdvertisementsDialog(false);
    };



    const saveAdvertisement = () => {
        setSubmitted(true);
        if (!advertisement.advertisement_title) {

            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000,
            });
            return;
        }
        if (advertisement.id && advertisement.id !== 0) {
            dispatch(_editAdvertisement(advertisement.id, advertisement, toast, t));

        } else {
            dispatch(_addAdvertisement(advertisement, toast, t));
        }

        setAdvertisementDialog(false);
        setAdvertisement(emptyAdvertisement);
        setSubmitted(false)
    };

    const editAdvertisement = (advertisement: Advertisement) => {
        setAdvertisement({ ...advertisement });

        setAdvertisementDialog(true);
    };

    const confirmDeleteAdvertisement = (advertisement: Advertisement) => {
        setAdvertisement(advertisement);
        setDeleteAdvertisementDialog(true);
    };

    const deleteAdvertisement = () => {
        if (!advertisement?.id) {
            console.error("Advertisement  ID is undefined.");
            return;
        }
        dispatch(_deleteAdvertisement(advertisement?.id, toast, t))
        setDeleteAdvertisementDialog(false);

    };


    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchAdvertisements(searchTag) as any);
        setRefreshing(false);
    };

    const getRowActions = (row: Advertisement) => [
        { label: t('TABLE.GENERAL.EDIT'), icon: <Pencil className="h-4 w-4" />, onClick: () => editAdvertisement(row) },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            danger: true,
            separatorBefore: true,
            onClick: () => confirmDeleteAdvertisement(row)
        }
    ];

    const deleteAdvertisementDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteAdvertisementDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteAdvertisement} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteAdvertisementsDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );




    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.ADVERTISEMENT', { defaultValue: 'تبلیغات' })}
                description={t('ADVERTISEMENT.PAGE.DESCRIPTION', { defaultValue: 'مدیریت اسلایدر و بنرهای تبلیغاتی' })}
                loading={loading}
                actions={
                    <>
                        <UiButton variant="default" size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('ADVERTISEMENT.TABLE.CREATEADVERTISEMENT')}
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
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو...' })}
                    />
                }
                footer={
                    <div className="border-t border-emerald-100 px-3 py-2 text-xs text-muted-foreground">
                        {t('TOTAL', { defaultValue: 'مجموع' })}: {(advertisements || []).length}
                    </div>
                }
            >
                <table className="w-full min-w-[640px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('ADVERTISEMENT.TABLE.COLUMN.ADVERTISEMENTIMAGE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('ADVERTISEMENT.TABLE.COLUMN.ADVERTISEMENTTITLE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('ADVERTISEMENT.TABLE.COLUMN.ADVERTISEMENTSTATUS')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(advertisements || []).length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            (advertisements || []).map((row: Advertisement) => (
                                <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                    <td className="px-2 py-1.5 align-middle">
                                        <RowActions items={getRowActions(row)} />
                                    </td>
                                    <td className="px-2 py-1.5">
                                        {row.ad_slider_image_url ? (
                                            <img src={`${row.ad_slider_image_url}`} alt="" className="h-10 w-16 rounded object-cover shadow-sm" />
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td className="px-2 py-1.5 font-medium text-start">{row.advertisement_title || '—'}</td>
                                    <td className="px-2 py-1.5">
                                        <Badge variant={row.status == 1 ? 'success' : 'danger'} className="text-[10px]">
                                            {row.status == 1 ? t('APP.GENERAL.ACTIVE', { defaultValue: 'فعال' }) : t('APP.GENERAL.INACTIVE', { defaultValue: 'غیرفعال' })}
                                        </Badge>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </ListPage>

                    <FormSheet
                        open={advertisementDialog}
                        onOpenChange={(open) => {
                            if (!open) hideDialog();
                        }}
                        title={t('ADVERTISEMENT.DETAILS')}
                        description={advertisement.id ? 'ویرایش تبلیغ' : 'ثبت تبلیغ جدید'}
                        size="xl"
                        side="left"
                        footer={
                            <FormActions
                                onCancel={hideDialog}
                                onSubmit={saveAdvertisement}
                                cancelLabel={t('APP.GENERAL.CANCEL')}
                                submitLabel={t('FORM.GENERAL.SUBMIT')}
                            />
                        }
                    >
                        <FormSection title="جزئیات تبلیغ" description="تصویر، عنوان و وضعیت">
                            <FormField label={t('ADVERTISEMENT.FORM.INPUT.ADVERTISEMENTIMAGE')} fullWidth>
                                <FileDrop
                                    accept="image/*"
                                    value={
                                        advertisement.ad_slider_image_url instanceof File
                                            ? advertisement.ad_slider_image_url
                                            : null
                                    }
                                    previewUrl={
                                        typeof advertisement.ad_slider_image_url === 'string' && advertisement.ad_slider_image_url
                                            ? advertisement.ad_slider_image_url
                                            : null
                                    }
                                    onChange={(file) =>
                                        setAdvertisement((prev) => ({
                                            ...prev,
                                            ad_slider_image_url: file ?? (typeof prev.ad_slider_image_url === 'string' ? prev.ad_slider_image_url : '')
                                        }))
                                    }
                                />
                            </FormField>
                            <FormField
                                label={t('ADVERTISEMENT.FORM.INPUT.ADVERTISEMENTTITLE')}
                                required
                                error={submitted && !advertisement.advertisement_title ? t('REQUIRED') : null}
                            >
                                <Input
                                    id="advertisement_title"
                                    value={advertisement.advertisement_title}
                                    onChange={(e) =>
                                        setAdvertisement((prevAdvertisement) => ({
                                            ...prevAdvertisement,
                                            advertisement_title: e.target.value
                                        }))
                                    }
                                    required
                                    autoFocus
                                    placeholder={t('ADVERTISEMENT.FORM.PLACEHOLDER.ADVERTISEMENTTITLE')}
                                    className={classNames('w-full', {
                                        'p-invalid': submitted && !advertisement.advertisement_title
                                    })}
                                />
                            </FormField>
                            <FormField label={t('ADVERTISEMENT.FORM.INPUT.ADVERTISEMENTSTATUS')}>
                                <Select
                                    value={advertisement.status != null ? String(advertisement.status) : undefined}
                                    onValueChange={(v) =>
                                        setAdvertisement((prev) => ({
                                            ...prev,
                                            status: Number(v)
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('ADVERTISEMENT.FORM.PLACEHOLDER.ADVERTISEMENTSTATUS')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Active</SelectItem>
                                        <SelectItem value="0">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormField>
                        </FormSection>
                    </FormSheet>

                    <Dialog visible={deleteAdvertisementDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteAdvertisementDialogFooter} onHide={hideDeleteAdvertisementDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {advertisement && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{advertisement.advertisement_title}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteAdvertisementsDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteAdvertisementsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {advertisement && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
        </div>
    );
};

export default withAuth(AdvertisementPage);
