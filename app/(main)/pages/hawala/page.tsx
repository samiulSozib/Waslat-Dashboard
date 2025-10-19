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
import { _fetchCompanies, _deleteCompany, _addCompany, _editCompany } from '@/app/redux/actions/companyActions';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { Paginator } from 'primereact/paginator';
import { AppDispatch } from '@/app/redux/store';
import { Hawala, Order } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _deleteOrder, _fetchOrders } from '@/app/redux/actions/orderActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { SplitButton } from 'primereact/splitbutton';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { _changeHawalaStatus, _deleteHawala, _fetchHawalaList } from '@/app/redux/actions/hawalaActions';
import { hawalaReducer } from '../../../redux/reducers/hawalaReducer';
import { isRTL } from '../../utilities/rtlUtil';

const HawalaPage = () => {
    const [orderDialog, setOrderDialog] = useState(false);
    const [deleteOrderDialog, setDeleteOrderDialog] = useState(false);
    const [deleteOrdersDialog, setDeleteOrdersDialog] = useState(false);
    const [selectedCompanies, setSelectedCompanyCode] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { hawalas, pagination, loading } = useSelector((state: any) => state.hawalaReducer);
    const [order, setOrder] = useState<Order>();
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');
    const [statusChangeDialog, setStatusChangeDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<number | null>();
    const [viewHawalaDialog, setViewHawalaDialog] = useState(false);
    const [selectedHawala, setSelectedHawala] = useState<Hawala | null>(null);

    // New state variables for confirmation dialog
    const [confirmationDialog, setConfirmationDialog] = useState(false);
    const [hawalaNumberInput, setHawalaNumberInput] = useState('');
    const [selectedHawalaForAction, setSelectedHawalaForAction] = useState<Hawala | null>(null);

    useEffect(() => {
        dispatch(_fetchHawalaList(1, searchTag));
    }, [dispatch, searchTag]);

    useEffect(() => {
        //console.log(hawalas);
    }, [dispatch, hawalas]);

    const hideDialog = () => {
        setSubmitted(false);
        setOrderDialog(false);
    };

    const hideDeleteOrderDialog = () => {
        setDeleteOrderDialog(false);
    };

    const hideDeleteOrdersDialog = () => {
        setDeleteOrdersDialog(false);
    };

    const confirmDeleteOrder = (order: Order) => {
        setOrder(order);
        setDeleteOrderDialog(true);
    };

    const deleteOrder = () => {
        if (!order?.id) {
            console.error('Order ID is undefined.');
            return;
        }
        dispatch(_deleteHawala(order?.id, toast, t));
        setDeleteOrderDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteOrdersDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    {/* <Button label="New" icon="pi pi-plus" severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"} onClick={openNew} /> */}
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

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <span className="block mt-2 md:mt-0 p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setSearchTag(e.currentTarget.value)} placeholder={t('ECOMMERCE.COMMON.SEARCH')} />
                </span>
            </React.Fragment>
        );
    };

    const hawalaNumberBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Hawala Number</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.hawala_number}</span>
            </>
        );
    };

    const senderNameBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Sender Name</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.sender_name}</span>
            </>
        );
    };

    const receiverNameBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Receiver Name</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.receiver_name}</span>
            </>
        );
    };

    const hawalaAmountBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Hawala Amount</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.hawala_amount}</span>
            </>
        );
    };

    const hawalaAmounCurrencyCodetBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Hawala Amount Currency Code</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.hawala_amount_currency_code}</span>
            </>
        );
    };

    const convertedAmountTakenResellerBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Converted Amount Taken Reseller</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.converted_amount_taken_from_reseller}</span>
            </>
        );
    };

    const resellerPreferedCurrencyCodeBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Reseller Prefered Currency Code</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.reseller_prefered_currency_code}</span>
            </>
        );
    };

    const commissionAmountBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Commission Amount</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.commission_amount}</span>
            </>
        );
    };

    const adminNoteBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Admin Node</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.admin_note}</span>
            </>
        );
    };

    const resellerNameBodyTemplate = (rowData: Order) => {
        return (
            <>
                <span className="p-column-title">Reseller Name</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.reseller?.reseller_name}</span>
            </>
        );
    };

    const createdAtBodyTemplate = (rowData: Hawala) => {
        const formatDate = (dateString: string | null | undefined) => {
            if (!dateString) {
                return { formattedDate: '-', formattedTime: '-' };
            }

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return { formattedDate: '-', formattedTime: '-' };
            }

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

        const { formattedDate, formattedTime } = formatDate(rowData?.created_at?.toString());

        return (
            <>
                <span className="p-column-title">Created At</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
            </>
        );
    };

    const statusBodyTemplate = (rowData: Hawala) => {
        const status = rowData.status;

        let statusText = 'Unknown';
        let statusClass = 'bg-gray-500';

        if (status == 'pending') {
            statusText = t('ORDER.STATUS.PENDING');
            statusClass = 'bg-yellow-500 text-white';
        } else if (status == 'confirmed') {
            statusText = t('ORDER.STATUS.CONFIRMED');
            statusClass = 'bg-green-500 text-white';
        } else if (status == 'rejected') {
            statusText = t('ORDER.STATUS.REJECTED');
            statusClass = 'bg-red-500 text-white';
        } else if (status == 'under_process') {
            statusText = t('ORDER.STATUS.UNDER_PROCESS');
            statusClass = 'bg-gray-500 text-white';
        } else if (status == 'cancelled') {
            statusText = t('ORDER.STATUS.CANCELLED');
            statusClass = 'bg-red-500 text-white';
        }

        return (
            <>
                <span className="p-column-title">Status</span>
                <span style={{ borderRadius: '5px' }} className={`inline-block px-2 py-1 rounded text-sm font-semibold ${statusClass}}`}>
                    {statusText}
                </span>
            </>
        );
    };

    const confirmChangeStatus = (hawala: Hawala, newStatus: number) => {
        setSelectedHawalaForAction(hawala);
        setSelectedStatus(newStatus);

        if (newStatus === 1) { // Confirmed status
            setConfirmationDialog(true); // Show confirmation with hawala number input
        } else {
            setStatusChangeDialog(true); // Show normal confirmation for other statuses
        }
    };

    const changeOrderStatus = () => {
        if (!selectedHawalaForAction?.id || selectedStatus === null) {
            console.error('Hawala ID or status is undefined.');
            return;
        }

        // Dispatch action without hawala number (for non-confirmed statuses)
        dispatch(_changeHawalaStatus(selectedHawalaForAction.id as number, selectedStatus as number, '', toast, t));
        setStatusChangeDialog(false);
        setSelectedHawalaForAction(null);
    };

    const finalizeHawalaConfirmation = () => {
        if (!selectedHawalaForAction?.id || selectedStatus === null || !hawalaNumberInput.trim()) {
            console.error('Hawala ID, status, or hawala number is missing.');
            return;
        }

        console.log(selectedHawalaForAction.id)
        console.log(selectedStatus)
        console.log(hawalaNumberInput)
        //return

        // Dispatch action with hawala number
        dispatch(_changeHawalaStatus(
            selectedHawalaForAction.id as number,
            selectedStatus as number,
            hawalaNumberInput,
            toast,
            t
        ));

        setConfirmationDialog(false);
        setHawalaNumberInput('');
        setSelectedHawalaForAction(null);
    };

    const actionBodyTemplate = (rowData: Hawala) => {
        const status = rowData.status;

        let items: any[] = [];

        if (status === 'pending' || status === 'under_process') {
            items = [
                {
                    label: t('ORDER.STATUS.CONFIRMED'),
                    icon: 'pi pi-check',
                    command: () => confirmChangeStatus(rowData, 1) // 1 for confirmed
                },
                {
                    label: t('ORDER.STATUS.REJECTED'),
                    icon: 'pi pi-times',
                    command: () => confirmChangeStatus(rowData, 2) // 2 for rejected
                }
            ];
        } else if (status === 'rejected') {
            items = [
                {
                    label: t('ORDER.STATUS.CONFIRMED'),
                    icon: 'pi pi-check',
                    command: () => confirmChangeStatus(rowData, 1)
                }
            ];
        }

        if (items.length > 0) {
            return <SplitButton label="" icon="pi pi-cog" model={items} className="p-button-rounded" severity="info" dir="ltr" />;
        }

        // If status is Confirmed, show a placeholder button
        if (status === 'confirmed') {
            return <SplitButton label="" icon="pi pi-cog" disabled className="p-button-rounded" severity="info" dir="ltr" />;
        }

        return null;
    };

    const companyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={() => { }} />
        </>
    );
    const deleteCompanyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteOrderDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deleteOrder} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" text onClick={hideDeleteOrdersDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" text />
        </>
    );

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(_fetchHawalaList(page, searchTag));
    };

    const viewHawala = (hawala: Hawala) => {
        setSelectedHawala(hawala);
        setViewHawalaDialog(true);
    };

    // Add this function to download hawala modal as PNG
    const downloadHawalaAsImage = () => {
        const modalElement = document.getElementById('hawala-view-modal');
        if (!modalElement) return;

        import('html2canvas').then((html2canvas) => {
            html2canvas.default(modalElement, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                logging: false
            }).then((canvas) => {
                const link = document.createElement('a');
                link.download = `hawala-${selectedHawala?.hawala_number}-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    };

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={hawalas}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedCompanyCode(e.value as any)}
                        dataKey="id"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        // header={header}
                        responsiveLayout="scroll"
                        paginator={false} // Disable PrimeReact's built-in paginator
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        rowClassName={() => 'cursor-pointer select-none'}
                        onRowClick={(e) => viewHawala(e.data as Hawala)}
                        selectionMode="single"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="hawala_number"
                            header={t('HAWALA.TABLE.COLUMN.HAWALA_NUMBER')}
                            body={hawalaNumberBodyTemplate}
                            sortable
                        ></Column>

                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="sender_name" header={t('HAWALA.TABLE.COLUMN.SENDER_NAME')} body={senderNameBodyTemplate}></Column>

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="receiver_name"
                            header={t('HAWALA.TABLE.COLUMN.RECEIVER_NAME')}
                            body={receiverNameBodyTemplate}
                        ></Column>

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="hawala_amount"
                            header={t('HAWALA.TABLE.COLUMN.AMOUNT')}
                            body={hawalaAmountBodyTemplate}
                            sortable
                        ></Column>

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="hawala_amount_currency_code"
                            header={t('HAWALA.TABLE.COLUMN.CURRENCY')}
                            body={hawalaAmounCurrencyCodetBodyTemplate}
                        ></Column>

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="converted_amount_taken_from_reseller"
                            header={t('HAWALA.TABLE.COLUMN.CONVERTED_AMOUNT')}
                            body={convertedAmountTakenResellerBodyTemplate}
                            sortable
                        ></Column>

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="reseller_prefered_currency_code"
                            header={t('HAWALA.TABLE.COLUMN.RESELLER_CURRENCY')}
                            body={resellerPreferedCurrencyCodeBodyTemplate}
                        ></Column>

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="commission_amount"
                            header={t('HAWALA.TABLE.COLUMN.COMMISSION')}
                            body={commissionAmountBodyTemplate}
                            sortable
                        ></Column>

                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="admin_note" header={t('HAWALA.TABLE.COLUMN.ADMIN_NOTE')} body={adminNoteBodyTemplate}></Column>

                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="" header={t('HAWALA.TABLE.COLUMN.RESELLER_NAME')} body={resellerNameBodyTemplate}></Column>

                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="created_at" header={t('ORDER.TABLE.COLUMN.ORDEREDDATE')} body={createdAtBodyTemplate}></Column>

                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="status" header={t('HAWALA.TABLE.COLUMN.STATUS')} body={statusBodyTemplate} sortable></Column>
                    </DataTable>
                    <Paginator
                        first={(pagination?.page - 1) * pagination?.items_per_page}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                    />

                    <Dialog visible={orderDialog} style={{ width: '700px' }} header="Bundle Details" modal className="p-fluid" footer={companyDialogFooter} onHide={hideDialog}>
                        {/* <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="name">Bundle Title</label>
                                <InputText
                                    id="bundle_title"
                                    value={bundle.bundle_title}
                                    onChange={(e) =>
                                        setBundle((perv) => ({
                                            ...perv,
                                            bundle_title: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !bundle.bundle_title
                                    })}
                                />
                                {submitted && !bundle.bundle_title && <small className="p-invalid">Bundle Title is required.</small>}
                            </div>

                            <div className="field col">
                                <label htmlFor="name">Bundle Description</label>
                                <InputText
                                    id="bundle_description"
                                    value={bundle.bundle_description}
                                    onChange={(e) =>
                                        setBundle((perv) => ({
                                            ...perv,
                                            bundle_description: e.target.value,
                                        }))
                                    }
                                    required
                                    autoFocus
                                    className={classNames({
                                        'p-invalid': submitted && !bundle.bundle_description
                                    })}
                                />
                                {submitted && !bundle.bundle_description && <small className="p-invalid">Bundle Description is required.</small>}
                            </div>
                        </div> */}
                    </Dialog>

                    <Dialog visible={deleteOrderDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompanyDialogFooter} onHide={hideDeleteOrderDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {order && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{order.rechargeble_account}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteOrdersDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeleteOrdersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {order && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>

                    {/* Status Change Dialog for non-confirmed statuses */}
                    <Dialog
                        visible={statusChangeDialog}
                        style={{ width: '450px' }}
                        header={t('TABLE.GENERAL.CONFIRM')}
                        modal
                        footer={
                            <>
                                <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={() => setStatusChangeDialog(false)} />
                                <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={changeOrderStatus} />
                            </>
                        }
                        onHide={() => setStatusChangeDialog(false)}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {selectedHawalaForAction && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_STATUS')} <b>#{selectedHawalaForAction.hawala_number}</b> to
                                    {selectedStatus === 2 && t('ORDER.STATUS.REJECTED')}?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* Confirmation Dialog with Hawala Number Input */}
                    <Dialog
                        visible={confirmationDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM_HAWALA')}
                        modal
                        footer={
                            <>
                                <Button
                                    label={t('APP.GENERAL.CANCEL')}
                                    icon="pi pi-times"
                                    severity="danger"
                                    className={isRTL() ? 'rtl-button' : ''}
                                    onClick={() => {
                                        setConfirmationDialog(false);
                                        setHawalaNumberInput('');
                                    }}
                                />
                                <Button
                                    label={t('FORM.GENERAL.SUBMIT')}
                                    icon="pi pi-check"
                                    severity="success"
                                    className={isRTL() ? 'rtl-button' : ''}
                                    onClick={finalizeHawalaConfirmation}
                                    disabled={!hawalaNumberInput.trim()}
                                />
                            </>
                        }
                        onHide={() => {
                            setConfirmationDialog(false);
                            setHawalaNumberInput('');
                        }}
                    >
                        <div className="p-fluid">
                            <div className="field">
                                <label htmlFor="hawalaNumber">{t('HAWALA_NUMBER')}</label>
                                <InputText
                                    id="hawalaNumber"
                                    value={hawalaNumberInput}
                                    onChange={(e) => setHawalaNumberInput(e.target.value)}
                                    placeholder={t('ENTER_HAWALA_NUMBER')}
                                    autoFocus
                                />
                            </div>
                            {selectedHawalaForAction && (
                                <div className="flex align-items-center justify-content-center mt-3">
                                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: '#f59e0b' }} />
                                    <span>
                                        {t('ARE_YOU_SURE_YOU_WANT_TO_CONFIRM_HAWALA')} <b>#{selectedHawalaForAction.hawala_number}</b>?
                                    </span>
                                </div>
                            )}
                        </div>
                    </Dialog>

                    <Dialog
                        visible={viewHawalaDialog}
                        style={{ width: '380px', maxWidth: '95vw', padding: 0 }}
                        header={null}
                        modal
                        onHide={() => setViewHawalaDialog(false)}
                        closable={false}
                    >
                        <div id="hawala-view-modal" style={{ backgroundColor: 'white', fontFamily: "'iranyekan', sans-serif,iranyekan" }}>
                            {selectedHawala && (
                                <div style={{ background: 'white' }}>
                                    {/* Header */}
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '1rem 0.5rem',
                                        borderBottom: '2px dashed #e5e7eb',
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                                    }}>
                                        <div>
                                            <img src={process.env.NEXT_PUBLIC_PROJECT_LOGO} alt="" className='h-4 w-4' />
                                        </div>
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 'bold',
                                            color: '#1f2937',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {t('HAWALA_DETAILS')}
                                        </div>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 1rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            backgroundColor: selectedHawala.status === 'confirmed' ? '#10b981' :
                                                selectedHawala.status === 'rejected' ? '#ef4444' :
                                                    selectedHawala.status === 'cancelled' ? '#dc2626' :
                                                        selectedHawala.status === 'under_process' ? '#f59e0b' : '#6b7280',
                                            color: 'white'
                                        }}>
                                            {selectedHawala.status === 'pending' ? t('ORDER.STATUS.PENDING') :
                                                selectedHawala.status === 'confirmed' ? t('ORDER.STATUS.CONFIRMED') :
                                                    selectedHawala.status === 'rejected' ? t('ORDER.STATUS.REJECTED') :
                                                        selectedHawala.status === 'under_process' ? t('ORDER.STATUS.UNDER_PROCESS') :
                                                            selectedHawala.status === 'cancelled' ? t('ORDER.STATUS.CANCELLED') :
                                                                t('ORDER.STATUS.UNKNOWN')}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '1.5rem 1rem' }}>

                                        {/* Hawala branch */}
                                        {selectedHawala?.branch?.name && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('MENU.HAWALA_BRANCH')}</span>
                                                <span style={{ fontSize: '1.125rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala?.branch?.name}</span>
                                            </div>
                                        )}


                                        {/* Hawala Number */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.HAWALA_NUMBER')}</span>
                                            <span style={{ fontSize: '1.125rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala.hawala_number}</span>
                                        </div>

                                        {/* Hawala Number */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.HAWALA_CUSTOM_NUMBER')}</span>
                                            <span style={{ fontSize: '1.125rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala?.hawala_custom_number}</span>
                                        </div>

                                        {/* Sender Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.SENDER_NAME')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala.sender_name}</span>
                                        </div>

                                        {/* Receiver Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.RECEIVER_NAME')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala.receiver_name}</span>
                                        </div>

                                        {/* Hawala Amount */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.AMOUNT')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedHawala.hawala_amount} {selectedHawala.hawala_amount_currency_code}
                                            </span>
                                        </div>

                                        {/* Converted Amount */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.CONVERTED_AMOUNT')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedHawala.converted_amount_taken_from_reseller} {selectedHawala.reseller_prefered_currency_code}
                                            </span>
                                        </div>

                                        {/* Commission Amount */}
                                        {selectedHawala.commission_amount && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                                <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.COMMISSION')}</span>
                                                <span style={{ fontSize: '1rem', color: '#059669', fontWeight: '600' }}>
                                                    {selectedHawala.commission_amount} {selectedHawala.reseller_prefered_currency_code}
                                                </span>
                                            </div>
                                        )}

                                        {/* Reseller Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.RESELLER_NAME')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala.reseller?.reseller_name || '-'}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('ORDER.TABLE.COLUMN.ORDEREDDATE')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedHawala.created_at ? new Date(selectedHawala.created_at).toLocaleDateString('en-GB') : '-'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px dashed #e5e7eb' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('ORDER_TIME')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedHawala.created_at ? new Date(selectedHawala.created_at).toLocaleTimeString('en-GB', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false
                                                }) : '-'}
                                            </span>
                                        </div>

                                        {/* Admin Note */}
                                        {selectedHawala.admin_note && (
                                            <div style={{
                                                marginTop: '1rem',
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                backgroundColor: '#f0f9ff',
                                                border: '1px solid #bae6fd'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: '600' }}>{t('HAWALA.TABLE.COLUMN.ADMIN_NOTE')}</span>
                                                    <span style={{ fontSize: '0.875rem', color: '#0369a1', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: '1rem' }}>
                                                        {selectedHawala.admin_note}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div style={{
                                        padding: '1rem',
                                        borderTop: '2px dashed #e5e7eb',
                                        display: 'flex',
                                        gap: '0.5rem',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button
                                            label={t('APP.GENERAL.CANCEL')}
                                            icon="pi pi-times"
                                            onClick={() => setViewHawalaDialog(false)}
                                            className="p-button-text p-button-sm"
                                            style={{ minWidth: '100px' }}
                                        />
                                        <Button
                                            label={t('DOWNLOAD')}
                                            icon="pi pi-download"
                                            onClick={downloadHawalaAsImage}
                                            className="p-button-success p-button-sm"
                                            style={{ minWidth: '100px' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(HawalaPage);