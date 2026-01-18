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
import { _fetchNotifications, _createNotification, _updateNotification, _deleteNotification } from '@/app/redux/actions/notificationActions';
import { AppDispatch } from '@/app/redux/store';
import { Notification } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle, customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { FileUpload } from 'primereact/fileupload';
import { Badge } from 'primereact/badge';
import { Calendar } from 'primereact/calendar';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';

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
    const [selectedNotifications, setSelectedNotifications] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { notifications, loading, unreadCount } = useSelector((state: any) => state.notificationReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');


    const { t } = useTranslation();

    useEffect(() => {
        dispatch(_fetchNotifications());
        dispatch(_fetchResellers(1, '', '', 10000));
    }, [dispatch]);

    // Debounced reseller search
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

    const openNew = () => {
        setNotification(emptyNotification);
        setSubmitted(false);
        setNotificationDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setNotificationDialog(false);
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
        setSubmitted(false);
    };

    const editNotification = (notification: Notification) => {
        setNotification({ ...notification });
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
        if (!selectedNotifications || (selectedNotifications as any).length === 0) {
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
        if (!selectedNotifications || (selectedNotifications as any).length === 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('NO_SELECTED_ITEMS_FOUND'),
                life: 3000
            });
            return;
        }

        // Delete selected notifications one by one
        const selectedNotificationArray = selectedNotifications as Notification[];
        for (const notif of selectedNotificationArray) {
            if (notif.id) {
                await dispatch(_deleteNotification(notif.id, toast, t));
            }
        }

        setSelectedNotifications(null);
        setDeleteNotificationsDialog(false);
    };

    const rightToolbarTemplate = () => {
        const hasSelectedNotifications = selectedNotifications && (selectedNotifications as any).length > 0;
        return (
            <React.Fragment>
                <div className="flex justify-end items-center space-x-2">
                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('NOTIFICATION.CREATE_NOTIFICATION')}
                        icon="pi pi-plus"
                        severity="success"
                        className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
                        onClick={openNew}
                    />

                    <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('DELETE')}
                        icon="pi pi-trash"
                        severity="danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedNotifications || !(selectedNotifications as any).length}
                    />
                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex items-center">
                <Badge value={unreadCount} severity="danger" className="mr-2"></Badge>
                <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                        placeholder={t('SEARCH')}
                        className="w-full md:w-auto"
                    />
                </span>
            </div>
        );
    };

    const notificationTitleBodyTemplate = (rowData: Notification) => {
        return (
            <>
                <span className="p-column-title">Title</span>
                <div className="flex align-items-center gap-2">
                    {!rowData.is_read && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                    <span className={!rowData.is_read ? 'font-semibold' : ''}>{rowData.title}</span>
                </div>
            </>
        );
    };

    const notificationMessageBodyTemplate = (rowData: Notification) => {
        return (
            <>
                <span className="p-column-title">Message</span>
                <span className="line-clamp-2">{rowData.message}</span>
            </>
        );
    };

    const targetTypeBodyTemplate = (rowData: Notification) => {
        return (
            <>
                <span className="p-column-title">Target Type</span>
                <Badge value={rowData.target_type} severity="info" />
            </>
        );
    };

    const statusBodyTemplate = (rowData: Notification) => {
        const isActive = rowData.status == 1 || rowData.status == true;
        return (
            <>
                <span className="p-column-title">Status</span>
                <Badge
                    value={isActive ? t('TRUE') : t('FALSE')}
                    severity={isActive ? 'success' : 'danger'}
                />
            </>
        );
    };

    // const readStatusBodyTemplate = (rowData: Notification) => {
    //     return (
    //         <>
    //             <span className="p-column-title">Read Status</span>
    //             <Badge
    //                 value={rowData.is_read ? t('READ') : t('UNREAD')}
    //                 severity={rowData.is_read ? 'success' : 'danger'}
    //             />
    //         </>
    //     );
    // };

    const dateBodyTemplate = (rowData: Notification) => {
        const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            const optionsDate: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            const optionsTime: Intl.DateTimeFormatOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };
            const formattedDate = date.toLocaleDateString('en-US', optionsDate);
            const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

            return { formattedDate, formattedTime };
        };
        const { formattedDate, formattedTime } = formatDate(String(rowData.created_at))
        return (
            <>
                <span className="p-column-title">Created At</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
            </>
        );
    };

    const mediaBodyTemplate = (rowData: Notification) => {
        if (!rowData.media) {
            return (
                <>
                    <span className="p-column-title">Media</span>
                    <span className="text-color-secondary">No media</span>
                </>
            );
        }

        const isImage = typeof rowData.media === 'string' &&
            (rowData.media.match(/\.(jpeg|jpg|gif|png)$/) ||
                rowData.media.startsWith('data:image'));

        if (isImage) {
            return (
                <>
                    <span className="p-column-title">Media</span>
                    <img
                        src={`${rowData.media}`}
                        alt="Notification media"
                        className="shadow-2"
                        style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                        }}
                    />
                </>
            );
        }

        return (
            <>
                <span className="p-column-title">Media</span>
                <i className="pi pi-file" style={{ fontSize: '1.5rem' }}></i>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Notification) => {
        return (
            <>
                <Button
                    icon="pi pi-pencil"
                    rounded
                    severity="success"
                    className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
                    onClick={() => editNotification(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    severity="warning"
                    onClick={() => confirmDeleteNotification(rowData)}
                />
            </>
        );
    };

    const notificationDialogFooter = (
        <>
            <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('SAVE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveNotification} />
        </>
    );

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
        { label: t('TRUE'), value: 1 },
        { label: t('FALSE'), value: 0 }
    ];
    return (
        <div className="grid -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={notifications}
                        selection={selectedNotifications}
                        onSelectionChange={(e) => setSelectedNotifications(e.value as any)}
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
                                ? `Showing {first} to {last} of {totalRecords} entries`
                                : `Showing {first} to {last} of {totalRecords} entries`
                        }
                        emptyMessage={t('NO_DATA_AVAILABLE')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        globalFilter={globalFilter}
                        responsiveLayout="scroll"
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="title"
                            header={t('TITLE')}
                            body={notificationTitleBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('NOTIFICATION.MESSAGE')}
                            body={notificationMessageBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('NOTIFICATION.TARGET_TYPE')}
                            body={targetTypeBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('STATUS')}
                            body={statusBodyTemplate}
                            sortable
                        ></Column>
                        {/* <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('READ_STATUS')}
                            body={readStatusBodyTemplate}
                            sortable
                        ></Column> */}
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('NOTIFICATION.MEDIA')}
                            body={mediaBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            header={t('NOTIFICATION.CREATED_AT')}
                            body={dateBodyTemplate}
                            sortable
                        ></Column>
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '10rem' }}
                            header={t('COMMON.ACTIONS')}
                        ></Column>
                    </DataTable>

                    <Dialog
                        visible={notificationDialog}
                        style={{ width: '700px', padding: '5px' }}
                        header={notification.id ? t('EDIT_NOTIFICATION') : t('CREATE_NOTIFICATION')}
                        modal
                        className="p-fluid"
                        footer={notificationDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="card" style={{ padding: '40px' }}>
                            {/* Media Preview */}
                            {notification.media && (
                                <div className="mb-4 text-center">
                                    {typeof notification.media === 'string' &&
                                        notification.media.match(/\.(jpeg|jpg|gif|png)$/) ? (
                                        <img
                                            src={notification.media}
                                            alt="Media preview"
                                            width="200"
                                            className="mt-0 mx-auto mb-2 block shadow-2"
                                            style={{ borderRadius: '4px' }}
                                        />
                                    ) : notification.media instanceof File ? (
                                        <img
                                            src={URL.createObjectURL(notification.media)}
                                            alt="Uploaded preview"
                                            width="200"
                                            className="mt-0 mx-auto mb-2 block shadow-2"
                                            style={{ borderRadius: '4px' }}
                                        />
                                    ) : null}
                                </div>
                            )}

                            {/* Title Field */}
                            <div className="field mb-4">
                                <label htmlFor="title" style={{ fontWeight: 'bold' }}>
                                    {t('TITLE')} *
                                </label>
                                <InputText
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
                                    className={classNames({
                                        'p-invalid': submitted && !notification.title
                                    })}
                                />
                                {submitted && !notification.title && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            {/* Message Field */}
                            <div className="field mb-4">
                                <label htmlFor="message" style={{ fontWeight: 'bold' }}>
                                    {t('MESSAGE')} *
                                </label>
                                <textarea
                                    id="message"
                                    value={notification.message}
                                    onChange={(e: any) =>
                                        setNotification((prev) => ({
                                            ...prev,
                                            message: e.target.value
                                        }))
                                    }
                                    required
                                    rows={4}
                                    placeholder={t('NOTIFICATION.ENTER_NOTIFICATION_MESSAGE')}
                                    className={classNames('w-full', {
                                        'p-invalid': submitted && !notification.message
                                    })}
                                />
                                {submitted && !notification.message && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            {/* Target Type and Status Fields */}
                            <div className="formgrid grid mb-4">
                                <div className="field col">
                                    <label htmlFor="target_type" style={{ fontWeight: 'bold' }}>
                                        {t('NOTIFICATION.TARGET_TYPE')} *
                                    </label>
                                    <Dropdown
                                        id="target_type"
                                        value={notification.target_type}
                                        options={targetTypeOptions}
                                        onChange={(e) => {
                                            const newNotification = {
                                                ...notification,
                                                target_type: e.value
                                            };
                                            // Clear reseller_id if not "reseller" target type
                                            if (e.value !== 'reseller') {
                                                newNotification.reseller_id = undefined;
                                            }
                                            setNotification(newNotification);
                                        }}
                                        placeholder={t('NOTIFICATION.SELECT_TARGET_TYPE')}
                                        className="w-full"
                                    />
                                    {submitted && !notification.target_type && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field col">
                                    <label htmlFor="status" style={{ fontWeight: 'bold' }}>
                                        {t('STATUS')}
                                    </label>
                                    <Dropdown
                                        id="status"
                                        value={notification.status || 0}
                                        options={statusOptions}
                                        onChange={(e) =>
                                            setNotification((prev) => ({
                                                ...prev,
                                                status: e.value
                                            }))
                                        }
                                        placeholder={t('NOTIFICATION.SELECT_STATUS')}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Media Upload */}
                            <div className="field mb-4">
                                <label htmlFor="media" style={{ fontWeight: 'bold' }}>
                                    {t('MEDIA')}
                                </label>
                                <FileUpload
                                    mode="basic"
                                    accept="image/*,.pdf,.doc,.docx"
                                    onSelect={(e) =>
                                        setNotification((prev) => ({
                                            ...prev,
                                            media: e.files[0]
                                        }))
                                    }
                                    onClear={() =>
                                        setNotification((prev) => ({
                                            ...prev,
                                            media: null
                                        }))
                                    }
                                    chooseLabel={t('NOTIFICATION.UPLOAD_MEDIA')}
                                    className="w-full"
                                />
                                <small className="text-color-secondary">
                                    {t('NOTIFICATION.SUPPORTED_FORMATS')}: JPG, PNG, PDF, DOC (Max: 5MB)
                                </small>
                            </div>

                            {/* Reseller ID */}
                            {notification.target_type === 'reseller' && (
                                <div className="field mb-4">
                                    <label htmlFor="reseller" style={{ fontWeight: 'bold' }}>
                                        {t('NOTIFICATION.RESELLER')} *
                                    </label>
                                    <Dropdown
                                        id="reseller"
                                        value={notification.reseller_id}
                                        options={resellers}
                                        onChange={(e) =>
                                            setNotification((prev) => ({
                                                ...prev,
                                                reseller_id: e.value
                                            }))
                                        }
                                        optionLabel="reseller_name"
                                        optionValue="id"
                                        filter
                                        filterBy="reseller_name"
                                        filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                                        showFilterClear
                                        placeholder={t('NOTIFICATION.SELECT_RESELLER')}
                                        className="w-full"
                                        panelClassName="min-w-[20rem]"
                                        onFilter={(e) => {
                                            setResellerSearchTerm(e.filter);
                                        }}
                                        required={notification.target_type === 'reseller'}
                                    />
                                    {submitted && notification.target_type === 'reseller' && !notification.reseller_id && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            )}
                        </div>
                    </Dialog>

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
                            {selectedNotifications && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE_SELECTED_ITEMS')}
                                    ({(selectedNotifications as any).length} {t('ITEMS')})?
                                </span>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(NotificationPage);