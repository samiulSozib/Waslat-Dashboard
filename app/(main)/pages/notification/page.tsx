/* eslint-disable @next/next/no-img-element */
'use client';
import { _createNotification, _deleteNotification, _fetchNotifications, _updateNotification } from '@/app/redux/actions/notificationActions';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { AppDispatch } from '@/app/redux/store';
import CustomDropdownWithSearch from '@/app/(main)/components/customDropDownWithSearch';
import { FilterBar } from '@/components/admin/filter-bar';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { ListPage } from '@/components/admin/list-page';
import { RowActions } from '@/components/admin/row-actions';
import { Badge } from '@/components/ui/badge';
import { Button as UiButton } from '@/components/ui/button';
import { FileDrop } from '@/components/ui/file-drop';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/interface';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '../../authGuard';
import { isRTL } from '../../utilities/rtlUtil';

const NotificationPage = () => {
    let emptyNotification: Notification = {
        id: 0,
        title: '',
        message: '',
        reseller_id: undefined,
        status: 0,
        target_type: '',
        media: null,
        created_at: '',
        is_read: false
    };

    const [notificationDialog, setNotificationDialog] = useState(false);
    const [deleteNotificationDialog, setDeleteNotificationDialog] = useState(false);
    const [deleteNotificationsDialog, setDeleteNotificationsDialog] = useState(false);
    const [notification, setNotification] = useState<Notification>(emptyNotification);
    const [selectedNotifications, setSelectedNotifications] = useState<Notification[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const searchTerm = useDebouncedValue(searchInput, 350);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { notifications, loading, unreadCount } = useSelector((state: any) => state.notificationReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');
    const [selectedReseller, setSelectedReseller] = useState<any>(null);

    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchNotifications());
        dispatch(_fetchResellers(1, '', '', 15));
    }, [dispatch]);

    // Debounced reseller search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (resellerSearchTerm) {
                dispatch(_fetchResellers(1, resellerSearchTerm));
            } else {
                dispatch(_fetchResellers(1, ''));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [resellerSearchTerm, dispatch]);

    const openNew = () => {
        setNotification(emptyNotification);
        setSelectedReseller(null);
        setSubmitted(false);
        setNotificationDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setNotificationDialog(false);
        setSelectedReseller(null);
    };

    const hideDeleteNotificationDialog = () => {
        setDeleteNotificationDialog(false);
    };

    const hideDeleteNotificationsDialog = () => {
        setDeleteNotificationsDialog(false);
    };

    const saveNotification = () => {
        setSubmitted(true);

        // Basic validation for all notification types
        if (!notification.title || !notification.message || !notification.target_type) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        // Additional validation for reseller target type
        if (notification.target_type === 'reseller' && !notification.reseller_id) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('PLEASE_SELECT_A_RESELLER_FOR_RESELLER_TARGET_TYPE'),
                life: 3000
            });
            return;
        }

        // For non-reseller target types, ensure reseller_id is cleared
        const notificationToSave = { ...notification };
        if (notification.target_type !== 'reseller') {
            notificationToSave.reseller_id = undefined;
        }

        if (notification.id && notification.id !== 0) {
            dispatch(_updateNotification(notificationToSave, toast, t));
        } else {
            dispatch(_createNotification(notificationToSave, toast, t));
        }

        setNotificationDialog(false);
        setNotification(emptyNotification);
        setSelectedReseller(null);
        setSubmitted(false);
    };

    const editNotification = (notification: Notification) => {
        setNotification({ ...notification });
        // Find the reseller object if reseller_id exists
        if (notification.reseller_id) {
            const foundReseller = resellers.find((r: any) => r.id === notification.reseller_id);
            setSelectedReseller(foundReseller || null);
        } else {
            setSelectedReseller(null);
        }
        setNotificationDialog(true);
    };

    const confirmDeleteNotification = (notification: Notification) => {
        setNotification(notification);
        setDeleteNotificationDialog(true);
    };

    const deleteNotification = () => {
        if (!notification?.id) {
            return;
        }
        dispatch(_deleteNotification(notification?.id, toast, t));
        setDeleteNotificationDialog(false);
    };

    const confirmDeleteSelected = () => {
        if (selectedNotifications.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('WARNING'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }
        setDeleteNotificationsDialog(true);
    };

    const deleteSelectedNotifications = async () => {
        if (selectedNotifications.length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        for (const notif of selectedNotifications) {
            if (notif.id) {
                await dispatch(_deleteNotification(notif.id, toast, t));
            }
        }

        setSelectedNotifications([]);
        setDeleteNotificationsDialog(false);
    };

    const filteredNotifications = useMemo(() => {
        const rows = notifications || [];
        const q = searchTerm.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((row: Notification) => {
            const reseller = resellers.find((r: any) => r.id === row.reseller_id);
            const haystack = [row.title, row.message, row.target_type, reseller?.reseller_name, reseller?.contact_name]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();
            return haystack.includes(q);
        });
    }, [notifications, resellers, searchTerm]);

    const isSelected = (row: Notification) => selectedNotifications.some((n) => n.id === row.id);

    const toggleRow = (row: Notification, checked: boolean) => {
        setSelectedNotifications((prev) => {
            if (checked) return [...prev.filter((n) => n.id !== row.id), row];
            return prev.filter((n) => n.id !== row.id);
        });
    };

    const toggleAllVisible = (checked: boolean) => {
        if (!checked) {
            const visibleIds = new Set(filteredNotifications.map((n: Notification) => n.id));
            setSelectedNotifications((prev) => prev.filter((n) => !visibleIds.has(n.id)));
            return;
        }
        const merged = [...selectedNotifications];
        filteredNotifications.forEach((row: Notification) => {
            if (!merged.some((n) => n.id === row.id)) merged.push(row);
        });
        setSelectedNotifications(merged);
    };

    const formatNotificationDate = (value?: string) => {
        if (!value) return { date: '—', time: '' };
        try {
            const date = new Date(value);
            return {
                date: date.toLocaleDateString('fa-IR', { dateStyle: 'short' }),
                time: date.toLocaleTimeString('fa-IR', { timeStyle: 'short' })
            };
        } catch {
            return { date: value, time: '' };
        }
    };

    const getRowActions = (row: Notification) => [
        { label: t('TABLE.GENERAL.EDIT'), icon: <Pencil className="h-4 w-4" />, onClick: () => editNotification(row) },
        {
            label: t('TABLE.GENERAL.DELETE'),
            icon: <Trash2 className="h-4 w-4" />,
            danger: true,
            separatorBefore: true,
            onClick: () => confirmDeleteNotification(row)
        }
    ];

    const deleteNotificationDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteNotificationDialog} />
            <Button label={t('DELETE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteNotification} />
        </>
    );

    const deleteNotificationsDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteNotificationsDialog} />
            <Button label={t('DELETE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteSelectedNotifications} />
        </>
    );

    const targetTypeOptions = [
        { label: t('ALL'), value: 'all' },
        { label: t('RESELLER'), value: 'reseller' },
        { label: t('RESELLER_GROUP'), value: 'reseller_group' }
    ];
    const statusOptions = [
        { label: t('TRUE'), value: '1' },
        { label: t('FALSE'), value: '0' }
    ];

    const mediaPreviewUrl =
        typeof notification.media === 'string' && notification.media
            ? notification.media
            : null;

    const allVisibleSelected =
        filteredNotifications.length > 0 && filteredNotifications.every((row: Notification) => isSelected(row));

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <ListPage
                title={t('MENU.NOTIFICATION', { defaultValue: 'اعلان‌ها' })}
                description={t('NOTIFICATION.PAGE.DESCRIPTION', { defaultValue: 'ارسال و مدیریت اعلان‌های نمایندگان' })}
                loading={loading}
                actions={
                    <>
                        <UiButton variant="default" size="sm" onClick={openNew}>
                            <Plus className="h-4 w-4" />
                            {t('NOTIFICATION.CREATE_NOTIFICATION')}
                        </UiButton>
                        <UiButton variant="destructive" size="sm" onClick={confirmDeleteSelected} disabled={selectedNotifications.length === 0}>
                            <Trash2 className="h-4 w-4" />
                            {t('DELETE')}
                        </UiButton>
                    </>
                }
                toolbar={
                    <FilterBar
                        search={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در اعلان‌ها...' })}
                    />
                }
            >
                <table className="w-full min-w-[960px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                            <th className="px-2 py-2 font-semibold text-emerald-950">
                                <input
                                    type="checkbox"
                                    checked={allVisibleSelected}
                                    onChange={(e) => toggleAllVisible(e.target.checked)}
                                    aria-label={t('SELECT_ALL', { defaultValue: 'انتخاب همه' })}
                                />
                            </th>
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('TABLE.GENERAL.ACTIONS', { defaultValue: 'عملیات' })}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('TITLE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('NOTIFICATION.MESSAGE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('NOTIFICATION.TARGET_TYPE')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('STATUS')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950">{t('NOTIFICATION.MEDIA')}</th>
                            <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('CREATED_AT')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNotifications.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-2 py-12 text-center text-muted-foreground">
                                    {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                </td>
                            </tr>
                        ) : (
                            filteredNotifications.map((row: Notification) => {
                                const { date, time } = formatNotificationDate(row.created_at ?? undefined);
                                const reseller = resellers.find((r: any) => r.id === row.reseller_id);
                                const isActive = row.status === 1;
                                const isImage =
                                    row.media &&
                                    (typeof row.media === 'string'
                                        ? row.media.match(/\.(jpeg|jpg|gif|png|webp)$/i)
                                        : row.media instanceof File);
                                return (
                                    <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                                        <td className="px-2 py-1.5 align-middle">
                                            <input type="checkbox" checked={isSelected(row)} onChange={(e) => toggleRow(row, e.target.checked)} />
                                        </td>
                                        <td className="px-2 py-1.5 align-middle">
                                            <RowActions items={getRowActions(row)} />
                                        </td>
                                        <td className="px-2 py-1.5 font-medium text-start">{row.title || '—'}</td>
                                        <td className="max-w-[16rem] truncate px-2 py-1.5 text-start text-muted-foreground" title={row.message || ''}>
                                            {row.message || '—'}
                                        </td>
                                        <td className="px-2 py-1.5 text-start">
                                            {row.target_type === 'reseller' && reseller ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-medium">{reseller.reseller_name}</span>
                                                    {reseller.contact_name ? (
                                                        <span className="text-[10px] text-muted-foreground">{reseller.contact_name}</span>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                row.target_type || '—'
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <Badge variant={isActive ? 'success' : 'danger'} className="text-[10px]">
                                                {isActive ? t('TRUE') : t('FALSE')}
                                            </Badge>
                                        </td>
                                        <td className="px-2 py-1.5">
                                            {!row.media ? (
                                                <span className="text-muted-foreground">{t('NO_MEDIA', { defaultValue: 'بدون رسانه' })}</span>
                                            ) : isImage ? (
                                                <img src={`${row.media}`} alt="" className="h-10 w-10 rounded object-cover shadow-sm" />
                                            ) : (
                                                <span className="text-muted-foreground">{t('FILE', { defaultValue: 'فایل' })}</span>
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5 whitespace-nowrap tabular-nums text-muted-foreground">
                                            <span className="block">{date}</span>
                                            {time ? <span className="text-[10px]">{time}</span> : null}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </ListPage>

            <FormSheet
                open={notificationDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                title={notification.id ? t('NOTIFICATION.EDIT_NOTIFICATION') : t('NOTIFICATION.CREATE_NOTIFICATION')}
                description={t('NOTIFICATION.FORM.HINT', { defaultValue: 'عنوان، متن و مخاطب اعلان را مشخص کنید.' })}
                size="xl"
                side="left"
                footer={
                    <FormActions onCancel={hideDialog} onSubmit={saveNotification} cancelLabel={t('CANCEL')} submitLabel={t('SAVE')} />
                }
            >
                <FormSection title={t('NOTIFICATION.FORM.SECTION.MAIN', { defaultValue: 'محتوای اعلان' })}>
                    <FormField
                        label={t('TITLE')}
                        required
                        fullWidth
                        error={submitted && !notification.title ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="title"
                            value={notification.title}
                            onChange={(e) =>
                                setNotification((prev) => ({
                                    ...prev,
                                    title: e.target.value
                                }))
                            }
                            required
                            autoFocus
                            placeholder={t('NOTIFICATION.ENTER_NOTIFICATION_TITLE')}
                            className={cn('w-full', submitted && !notification.title && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('NOTIFICATION.MESSAGE')}
                        required
                        fullWidth
                        error={submitted && !notification.message ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Textarea
                            id="message"
                            value={notification.message}
                            onChange={(e) =>
                                setNotification((prev) => ({
                                    ...prev,
                                    message: e.target.value
                                }))
                            }
                            required
                            rows={4}
                            placeholder={t('NOTIFICATION.ENTER_NOTIFICATION_MESSAGE')}
                            className={cn('w-full', submitted && !notification.message && 'border-rose-300')}
                        />
                    </FormField>
                    <FormField
                        label={t('NOTIFICATION.TARGET_TYPE')}
                        required
                        error={submitted && !notification.target_type ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Select
                            value={notification.target_type || undefined}
                            onValueChange={(v) => {
                                setNotification((prev) => {
                                    const next = { ...prev, target_type: v };
                                    if (v !== 'reseller') {
                                        next.reseller_id = undefined;
                                        setSelectedReseller(null);
                                    }
                                    return next;
                                });
                            }}
                        >
                            <SelectTrigger className={cn(submitted && !notification.target_type && 'border-rose-300')}>
                                <SelectValue placeholder={t('NOTIFICATION.SELECT_TARGET_TYPE')} />
                            </SelectTrigger>
                            <SelectContent>
                                {targetTypeOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField label={t('STATUS')}>
                        <Select
                            value={String(notification.status ?? 0)}
                            onValueChange={(v) =>
                                setNotification((prev) => ({
                                    ...prev,
                                    status: Number(v)
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('NOTIFICATION.SELECT_STATUS')} />
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
                    <FormField label={t('NOTIFICATION.MEDIA')} fullWidth hint={`${t('NOTIFICATION.SUPPORTED_FORMATS')}: JPG, PNG, PDF, DOC (Max: 5MB)`}>
                        <FileDrop
                            accept="image/*,.pdf,.doc,.docx"
                            value={notification.media instanceof File ? notification.media : null}
                            previewUrl={mediaPreviewUrl}
                            onChange={(file) =>
                                setNotification((prev) => ({
                                    ...prev,
                                    media: file
                                }))
                            }
                        />
                    </FormField>
                    {notification.target_type === 'reseller' ? (
                        <FormField
                            label={t('RESELLER')}
                            required
                            fullWidth
                            error={submitted && !notification.reseller_id ? t('THIS_FIELD_IS_REQUIRED') : null}
                        >
                            <CustomDropdownWithSearch
                                id="reseller"
                                value={selectedReseller}
                                options={resellers}
                                onChange={(selectedOption) => {
                                    setSelectedReseller(selectedOption);
                                    setNotification((prev) => ({
                                        ...prev,
                                        reseller_id: selectedOption?.id ?? undefined
                                    }));
                                }}
                                optionLabel="reseller_name"
                                filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                                placeholder={t('SELECT_RESELLER')}
                                className="w-full"
                                panelClassName="min-w-[20rem]"
                                searchButtonText={t('ECOMMERCE.COMMON.SEARCH')}
                                error={submitted && !notification.reseller_id}
                                errorMessage={t('THIS_FIELD_IS_REQUIRED')}
                                showClear={true}
                                emptyMessage={t('NO_RESULTS_FOUND')}
                                noResultsMessage={t('TRY_DIFFERENT_SEARCH_TERM')}
                                returnFullObject={true}
                                itemTemplate={(option) => {
                                    if (!option) return null;
                                    return (
                                        <div className="flex flex-column p-2 gap-1">
                                            <div className="font-semibold">
                                                {option.contact_name} || {option.reseller_name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {option.phone && <span className="ms-2 text-gray-500">{option.phone}</span>}
                                            </div>
                                        </div>
                                    );
                                }}
                                valueTemplate={(option) => {
                                    if (!option) return t('SELECT_RESELLER');
                                    return (
                                        <div className="flex flex-column">
                                            <span style={{ fontWeight: 'bold' }}>{option.reseller_name}</span>
                                            <small className="text-gray-500 text-xs">
                                                {option.contact_name} {option.phone && ` | ${option.phone}`}
                                            </small>
                                        </div>
                                    );
                                }}
                                onSearch={(searchTerm) => {
                                    setResellerSearchTerm(searchTerm);
                                }}
                            />
                        </FormField>
                    ) : null}
                </FormSection>
            </FormSheet>

            <Dialog
                visible={deleteNotificationDialog}
                style={{ width: '450px' }}
                header={t('CONFIRM')}
                modal
                footer={deleteNotificationDialogFooter}
                onHide={hideDeleteNotificationDialog}
            >
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                    {notification && (
                        <span>
                            {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{notification.title}</b>?
                        </span>
                    )}
                </div>
            </Dialog>

            <Dialog
                visible={deleteNotificationsDialog}
                style={{ width: '450px' }}
                header={t('CONFIRM')}
                modal
                footer={deleteNotificationsDialogFooter}
                onHide={hideDeleteNotificationsDialog}
            >
                <div className="flex align-items-center justify-content-center">
                    <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                    {selectedNotifications.length > 0 && (
                        <span>
                            {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')} ({selectedNotifications.length} {t('ITEMS')})?
                        </span>
                    )}
                </div>
            </Dialog>
        </div>
    );
};

export default withAuth(NotificationPage);