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
import { Order } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _changeOrderStatus, _deleteOrder, _fetchOrders } from '@/app/redux/actions/orderActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { SplitButton } from 'primereact/splitbutton';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { Calendar } from 'primereact/calendar';
import { companyReducer } from '../../../redux/reducers/companyReducer';
import serviceReducer from '../../../redux/reducers/serviceReducer';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { generateOrderExcelFile } from '../../utilities/generateExcel';
import { InputTextarea } from 'primereact/inputtextarea';
import { useSearchParams } from 'next/navigation';

const OrderPage = () => {
    const [orderDialog, setOrderDialog] = useState(false);
    const [deleteOrderDialog, setDeleteOrderDialog] = useState(false);
    const [deleteOrdersDialog, setDeleteOrdersDialog] = useState(false);
    const [selectedCompanies, setSelectedCompanyCode] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { orders, pagination, loading } = useSelector((state: any) => state.orderReducer);
    const { companies } = useSelector((state: any) => state.companyReducer);
    const { services } = useSelector((state: any) => state.serviceReducer);
    const [order, setOrder] = useState<Order>();
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');
    const [statusChangeDialog, setStatusChangeDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<number | null>();
    const [refreshing, setRefreshing] = useState(false);
    const [rejectReasonDialog, setRejectReasonDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const [viewOrderDialog, setViewOrderDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Get search params from URL
    const searchParams = useSearchParams();
    const statusParam = searchParams.get('status');

    // Add these state variables near your other state declarations
    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
    const [filters, setFilters] = useState({
        filter_status: null as number | null,
        filter_service_category_type: null as string | null,
        filter_company_id: null as number | null,
        filter_service_id: null as number | null,
        filter_startdate: null as string | null,
        filter_enddate: null as string | null
    });

    const [activeFilters, setActiveFilters] = useState({});

    useEffect(() => {
        // Map URL status parameter to filter value
        let statusFilterValue = null;

        if (statusParam) {
            switch (statusParam) {
                case 'pending':
                    statusFilterValue = 0; // Assuming 0 is the value for pending status
                    break;
                case 'confirmed':
                    statusFilterValue = 1; // Assuming 1 is the value for successful status
                    break;
                case 'rejected':
                    statusFilterValue = 2; // Assuming 2 is the value for rejected status
                    break;
                default:
                    statusFilterValue = null;
            }

            if (statusFilterValue !== null) {
                setActiveFilters({
                    ...activeFilters,
                    filter_status: statusFilterValue
                });
            }
        } else {
            // If no status param, fetch all orders without status filter
            dispatch(_fetchOrders(1, searchTag));
        }
    }, [dispatch, statusParam, searchTag]);

    // useEffect(() => {
    //     dispatch(_fetchOrders(1, searchTag)); // No filters initially
    // }, [dispatch, searchTag]);

    useEffect(() => {
        if (Object.keys(activeFilters).length > 0) {
            dispatch(_fetchOrders(1, searchTag, activeFilters));
        }
    }, [dispatch, activeFilters, searchTag]);

    useEffect(() => {
        dispatch(_fetchCompanies());
        dispatch(_fetchServiceList());
    }, [dispatch, filterDialogVisible]);

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
        dispatch(_deleteOrder(order?.id, toast, t));
        setDeleteOrderDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteOrdersDialog(true);
    };

    // Add this useEffect hook to your component
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            // Ignore clicks on dropdown panels (they have .p-dropdown-panel class)
            if (target.closest('.p-dropdown-panel')) {
                return;
            }

            // Normal check for clicking outside the filter dialog
            if (filterDialogVisible && filterRef.current && !filterRef.current.contains(target)) {
                setFilterDialogVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [filterDialogVisible]);

    const filterRef = useRef<HTMLDivElement>(null);

    const handleSubmitFilter = (filters: any) => {
        setActiveFilters(filters);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await new Promise((res) => setTimeout(res, 1000));
        dispatch(_fetchOrders(1, searchTag));
        setRefreshing(false);
    };

    const viewOrder = (order: Order) => {
        setSelectedOrder(order);
        setViewOrderDialog(true);
    };

    // Add this function to download the modal as PNG
    const downloadOrderAsImage = () => {
        const modalElement = document.getElementById('order-view-modal');
        if (!modalElement) return;

        // Use html2canvas to capture the modal as image
        import('html2canvas').then((html2canvas) => {
            html2canvas.default(modalElement, {
                backgroundColor: '#ffffff',
                scale: 2, // Higher quality
                useCORS: true,
                logging: false
            }).then((canvas) => {
                const link = document.createElement('a');
                link.download = `order-${selectedOrder?.id}-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="-m-1 my-2 flex flex-wrap gap-1 w-full">
                    <Button className="flex-1  h-10" label={t('REFRESH')} icon={`pi pi-refresh ${refreshing ? 'pi-spin' : ''}`} severity="secondary" onClick={handleRefresh} disabled={refreshing} />
                    <div className="flex-1  h-10" ref={filterRef} style={{ position: 'relative' }}>
                        <Button className="p-button-info w-full" label={t('ORDER.FILTER.FILTER')} icon="pi pi-filter" onClick={() => setFilterDialogVisible(!filterDialogVisible)} />
                        {filterDialogVisible && (
                            <div
                                className="p-card p-fluid"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: isRTL() ? '-100%' : '',
                                    right: isRTL() ? '' : '-100%',
                                    width: '300px',
                                    zIndex: 1000,
                                    marginTop: '0.5rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                <div className="p-card-body" style={{ padding: '1rem' }}>
                                    <div className="grid">
                                        {/* Status Filter */}
                                        <div className="col-12">
                                            <label htmlFor="statusFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('ORDER.FILTER.STATUS')}
                                            </label>
                                            <Dropdown
                                                id="statusFilter"
                                                options={[
                                                    { label: t('ORDER.STATUS.PENDING'), value: 0 },
                                                    { label: t('ORDER.STATUS.CONFIRMED'), value: 1 },
                                                    { label: t('ORDER.STATUS.REJECTED'), value: 2 }
                                                ]}
                                                value={filters.filter_status}
                                                onChange={(e) => setFilters({ ...filters, filter_status: e.value })}
                                                placeholder={t('ORDER.FILTER.SELECT_STATUS')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Bundle Type Filter */}
                                        <div className="col-12">
                                            <label htmlFor="bundleTypeFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('ORDER.FILTER.BUNDLE_TYPE')}
                                            </label>
                                            <Dropdown
                                                id="bundleTypeFilter"
                                                options={[
                                                    { label: t('ORDER.FILTER.SOCIAL'), value: 'social' },
                                                    { label: t('ORDER.FILTER.NONSOCIAL'), value: 'nonsocial' }
                                                ]}
                                                value={filters.filter_service_category_type}
                                                onChange={(e) => setFilters({ ...filters, filter_service_category_type: e.value })}
                                                placeholder={t('ORDER.FILTER.SELECT_TYPE')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Company Filter */}
                                        <div className="col-12">
                                            <label htmlFor="companyFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('ORDER.FILTER.COMPANY')}
                                            </label>
                                            <Dropdown
                                                id="companyFilter"
                                                options={companies}
                                                value={filters.filter_company_id}
                                                onChange={(e) => setFilters({ ...filters, filter_company_id: e.value })}
                                                optionLabel="company_name"
                                                optionValue="id"
                                                placeholder={t('ORDER.FILTER.SELECT_COMPANY')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Service Filter */}
                                        <div className="col-12">
                                            <label htmlFor="serviceFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('ORDER.FILTER.SERVICE')}
                                            </label>
                                            <Dropdown
                                                id="serviceFilter"
                                                options={services}
                                                value={filters.filter_service_id}
                                                onChange={(e) => setFilters({ ...filters, filter_service_id: e.value })}
                                                optionLabel="service_name" // Adjust based on your service object structure
                                                optionValue="id"
                                                placeholder={t('ORDER.FILTER.SELECT_SERVICE')}
                                                style={{ width: '100%' }}
                                                itemTemplate={(option) => (
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <div>{option.service_category?.category_name}</div>
                                                        <div>- {option.company?.company_name}</div>
                                                    </div>
                                                )}
                                                valueTemplate={(option) => {
                                                    if (!option) return t('BUNDLE.FORM.PLACEHOLDER.SERVICENAME');
                                                    return (
                                                        <div style={{ display: 'flex', gap: '5px' }}>
                                                            <div>{option.service_category?.category_name}</div>
                                                            <div>- {option.company?.company_name}</div>
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </div>

                                        {/* Date Range Filters */}
                                        <div className="col-12">
                                            <label htmlFor="startDateFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('ORDER.FILTER.START_DATE')}
                                            </label>
                                            <InputText type="date" id="startDateFilter" value={filters.filter_startdate || ''} onChange={(e) => setFilters({ ...filters, filter_startdate: e.target.value })} style={{ width: '100%' }} />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="endDateFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('ORDER.FILTER.END_DATE')}
                                            </label>
                                            <InputText type="date" id="endDateFilter" value={filters.filter_enddate || ''} onChange={(e) => setFilters({ ...filters, filter_enddate: e.target.value })} style={{ width: '100%' }} />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="col-12 mt-3 flex justify-content-between gap-2">
                                            <Button
                                                label={t('RESET')}
                                                icon="pi pi-times"
                                                className="p-button-secondary p-button-sm"
                                                onClick={() => {
                                                    setFilters({
                                                        filter_status: null,
                                                        filter_service_category_type: null,
                                                        filter_service_id: null,
                                                        filter_company_id: null,
                                                        filter_startdate: null,
                                                        filter_enddate: null
                                                    });
                                                }}
                                            />
                                            <Button
                                                label={t('APPLY')}
                                                icon="pi pi-check"
                                                className="p-button-sm"
                                                onClick={() => {
                                                    // Apply filters here
                                                    // You might want to dispatch an action to fetch filtered orders
                                                    //dispatch(_fetchOrders(1, searchTag, filters));
                                                    //console.log(filters)
                                                    handleSubmitFilter(filters);
                                                    setFilterDialogVisible(false);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Button className="flex-1  h-10" label={t('EXPORT.EXPORT')} icon={`pi pi-file-excel`} severity="success" onClick={exportToExcel} />
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

    const resellerNameBodyTemplate = (rowData: Order) => {
        return (
            <>
                <span className="p-column-title">Reseller Name</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.reseller?.reseller_name}</span>
            </>
        );
    };

    const rechargeableAccountBodyTemplate = (rowData: Order) => {
        const copyOrderDetails = () => {
            const dataToCopy = `${rowData.rechargeble_account || '-'}`.trim();
            copyToClipboard(dataToCopy);
        };

        return (
            <>
                <span className="p-column-title">{t('ORDER.TABLE.COLUMN.RECHARGEABLEACCOUNT')}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '' }}>
                    <Button
                        icon="pi pi-copy"
                        rounded
                        severity="info"
                        tooltip={t('COPY_RECHARGEABLE_ACCOUNT')}
                        tooltipOptions={{
                            position: 'top',
                            className: 'custom-tooltip'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            copyOrderDetails();
                        }}
                        className="p-button-sm p-button-text"
                        pt={{
                            icon: { className: 'text-sm' }
                        }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.rechargeble_account}</span>
                </div>
            </>
        );
    };

    const bundleIdBodyTemplate = (rowData: Order) => {
        return (
            <>
                <span className="p-column-title">Bundle ID</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.bundle?.id}</span>
            </>
        );
    };

    const payableAmountBodyTemplate = (rowData: Order) => {
        return (
            <>
                <span className="p-column-title">Payable Amount</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.bundle?.buying_price}</span>
            </>
        );
    };

    const bundleTitleBodyTemplate = (rowData: Order) => {
        return (
            <>
                <span className="p-column-title">Bundle Title</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.bundle?.bundle_title}</span>
            </>
        );
    };

    const rejectedReasonBodyTemplate = (rowData: Order) => {
        return (
            <>
                <span className="p-column-title">Reject Reason</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.reject_reason}</span>
            </>
        );
    };

    const companyNameBodyTemplate = (rowData: Order) => {
        return (
            <>
                <span className="p-column-title">Company Name</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.bundle?.service?.company?.company_name}</span>
            </>
        );
    };

    const categoryNameNameBodyTemplate = (rowData: Order) => {
        return (
            <>
                <span className="p-column-title">Category Name</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.bundle?.service?.service_category?.category_name}</span>
            </>
        );
    };

    const createdAtBodyTemplate = (rowData: Order) => {
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

        const { formattedDate, formattedTime } = formatDate(rowData.created_at);

        return (
            <>
                <span className="p-column-title">Created At</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
            </>
        );
    };

    const statusBodyTemplate = (rowData: Order) => {
        const status = rowData.status;

        let statusText = 'Unknown';
        let statusClass = 'bg-gray-500';

        if (status == '0') {
            statusText = t('ORDER.STATUS.PENDING');
            statusClass = 'bg-yellow-500 text-white';
        } else if (status == '1') {
            statusText = t('ORDER.STATUS.CONFIRMED');
            statusClass = 'bg-green-500 text-white';
        } else if (status == '2') {
            statusText = t('ORDER.STATUS.REJECTED');
            statusClass = 'bg-red-500 text-white';
        } else if (status == '3') {
            statusText = t('ORDER.STATUS.UNDER_PROCESS');
            statusClass = 'bg-gray-500 text-white';
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

    const copyButtonBodyTemplate = (rowData: Order) => {
        const copyOrderDetails = () => {
            const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                return date.toLocaleString();
            };

            const statusText = rowData.status == 0 ? t('ORDER.STATUS.PENDING') : rowData.status == 1 ? t('ORDER.STATUS.CONFIRMED') : rowData.status == 2 ? t('ORDER.STATUS.REJECTED') : t('ORDER.STATUS.UNKNOWN');

            const dataToCopy = `
📋 ${t('ORDER_DETAILS')}
----------------
🔹 ${t('ORDER.TABLE.COLUMN.RECHARGEABLEACCOUNT')}: ${rowData.rechargeble_account || '-'}
🔹 ${t('ORDER.TABLE.COLUMN.BUNDLETITLE')}: ${rowData.bundle?.bundle_title || '-'}
🔹 ${t('ORDER.TABLE.COLUMN.COMPANYNAME')}: ${rowData.bundle?.service?.company?.company_name || '-'}
        `.trim();

            copyToClipboard(dataToCopy);
        };

        return (
            <>
                <span className="p-column-title">Copy</span>
                <Button
                    icon="pi pi-copy"
                    rounded
                    severity="info"
                    tooltip={t('COPY_ALL_DETAILS')}
                    tooltipOptions={{
                        position: 'top',
                        className: 'custom-tooltip'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        copyOrderDetails();
                    }}
                    className="p-button-sm p-button-text"
                    pt={{
                        icon: { className: 'text-sm' }
                    }}
                />
            </>
        );
    };

    const performedByBodyTemplate = (rowData: Order) => {
        return (
            <>
                <span className="p-column-title">Performed By</span>
                {rowData.performed_by_name}
            </>
        );
    };

    // const actionBodyTemplate = (rowData: Order) => {
    //     return (
    //         <>
    //             {/* <Button icon="pi pi-pencil" rounded severity="success" className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"}  onClick={()=>editOrder(rowData)}/> */}
    //             <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeleteOrder(rowData)} />
    //         </>
    //     );
    // };

    const actionBodyTemplate = (rowData: Order) => {
        const status = Number(rowData.status); // in case it's a string

        let items: any[] = [];

        if (status === 0 || (rowData.transaction_id === null && status === 1)) {
            // Pending
            items = [
                {
                    label: t('ORDER.STATUS.CONFIRMED'),
                    icon: 'pi pi-check',
                    command: () => confirmChangeStatus(rowData, 1)
                },
                {
                    label: t('ORDER.STATUS.UNDER_PROCESS'),
                    icon: 'pi pi-spinner',
                    command: () => confirmChangeStatus(rowData, 3)
                },
                {
                    label: t('ORDER.STATUS.REJECTED'),
                    icon: 'pi pi-times',
                    command: () => confirmChangeStatus(rowData, 2)
                }
            ];
        } else if (status === 2) {
            // Rejected
            items = [
                {
                    label: t('ORDER.STATUS.CONFIRMED'),
                    icon: 'pi pi-check',
                    command: () => confirmChangeStatus(rowData, 1)
                }
            ];
        }
        else if (status === 3) {
            items = [
                {
                    label: t('ORDER.STATUS.CONFIRMED'),
                    icon: 'pi pi-check',
                    command: () => confirmChangeStatus(rowData, 1)
                },

                {
                    label: t('ORDER.STATUS.REJECTED'),
                    icon: 'pi pi-times',
                    command: () => confirmChangeStatus(rowData, 2)
                }
            ];
        }

        if (items.length > 0) {
            return <SplitButton label="" icon="pi pi-cog" model={items} className="p-button-rounded" severity="info" dir="ltr" />;
        }

        // If status is Confirmed (1), show a placeholder button
        if (status === 1) {
            return <SplitButton label="" icon="pi pi-cog" disabled className="p-button-rounded" severity="info" dir="ltr" />;
        }

        return null;
    };

    const confirmChangeStatus = (order: Order, newStatus: number) => {
        // setOrder(order);
        // setSelectedStatus(newStatus);
        // setStatusChangeDialog(true);
        setOrder(order);
        setSelectedStatus(newStatus);

        if (newStatus === 2) {
            // If status is rejected (2)
            setRejectReasonDialog(true); // Show reject reason dialog first
        } else {
            setStatusChangeDialog(true); // For other status changes, show normal confirmation
        }
    };

    const finalizeRejection = () => {
        if (!order?.id || selectedStatus === null) {
            console.error('Order ID or status is undefined.');
            return;
        }

        // Dispatch action with rejection reason
        dispatch(_changeOrderStatus(order.id, selectedStatus as number, toast, t, rejectionReason));
        setRejectReasonDialog(false);
        setStatusChangeDialog(false);
        setRejectionReason(''); // Reset rejection reason
    };

    const changeOrderStatus = () => {
        if (!order?.id || selectedStatus === null) {
            console.error('Order ID or status is undefined.');
            return;
        }

        // Dispatch an action to update the order status
        // You'll need to implement this action in your orderActions.ts
        dispatch(_changeOrderStatus(order.id, selectedStatus as number, toast, t));
        setStatusChangeDialog(false);
    };

    // const header = (
    //     <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
    //         <h5 className="m-0">Manage Products</h5>
    //         <span className="block mt-2 md:mt-0 p-input-icon-left">
    //             <i className="pi pi-search" />
    //             <InputText type="search" onInput={(e) => setGlobalFilter(e.currentTarget.value)} placeholder="Search..." />
    //         </span>
    //     </div>
    // );

    const companyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" text onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" text onClick={() => { }} />
        </>
    );
    const deleteCompanyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" text onClick={hideDeleteOrderDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" text onClick={deleteOrder} />
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
        dispatch(_fetchOrders(page, searchTag, activeFilters));
    };

    const exportToExcel = async () => {
        await generateOrderExcelFile({
            orders,
            t,
            toast,
            all: true
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                toast.current?.show({
                    severity: 'success',
                    summary: t('COPIED'),
                    detail: t('TEXT_COPIED_TO_CLIPBOARD'),
                    life: 2000
                });
            })
            .catch((err) => {
                console.error('Failed to copy text: ', err);
                toast.current?.show({
                    severity: 'error',
                    summary: t('ERROR'),
                    detail: t('FAILED_TO_COPY_TEXT'),
                    life: 2000
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
                        value={orders}
                        selection={selectedCompanies}
                        onSelectionChange={(e) => setSelectedCompanyCode(e.value as any)}
                        dataKey="id"
                        className="datatable-responsive"
                        globalFilter={globalFilter}
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
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        rowClassName={() => 'cursor-pointer select-none'}
                        onRowClick={(e) => viewOrder(e.data as Order)}
                        selectionMode="single"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={copyButtonBodyTemplate} headerStyle={{ width: '5rem' }}></Column>

                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="" header={t('ORDER.TABLE.COLUMN.RESELLERNAME')} body={resellerNameBodyTemplate}></Column>

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="rechargeble_account"
                            header={t('ORDER.TABLE.COLUMN.RECHARGEABLEACCOUNT')}
                            body={rechargeableAccountBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="bundle.id" header={t('ORDER.TABLE.COLUMN.BUNDLEID')} body={bundleIdBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="" header={t('ORDER.TABLE.COLUMN.PAYABLEAMOUNT')} body={payableAmountBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="" header={t('ORDER.TABLE.COLUMN.BUNDLETITLE')} body={bundleTitleBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="" header={t('ORDER.TABLE.COLUMN.REJECTREASON')} body={rejectedReasonBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="" header={t('ORDER.TABLE.COLUMN.COMPANYNAME')} body={companyNameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="" header={t('ORDER.TABLE.COLUMN.CATEGORYNAME')} body={categoryNameNameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="" header={t('ORDER.TABLE.COLUMN.ORDEREDDATE')} body={createdAtBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="" header={t('PERFORMED_BY')} body={performedByBodyTemplate}></Column>

                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="status" header={t('ORDER.TABLE.COLUMN.STATUS')} body={statusBodyTemplate}></Column>
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
                            {order && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_STATUS')} <b>{order.rechargeble_account}</b> to {selectedStatus === 0 && t('ORDER.STATUS.PENDING')}
                                    {selectedStatus === 1 && t('ORDER.STATUS.CONFIRMED')}
                                    {selectedStatus === 2 && t('ORDER.STATUS.REJECTED')}?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* reject dialog */}
                    <Dialog
                        visible={rejectReasonDialog}
                        style={{ width: '450px' }}
                        header={t('ORDER.REJECTION_REASON')}
                        modal
                        footer={
                            <>
                                <Button
                                    label={t('APP.GENERAL.CANCEL')}
                                    icon="pi pi-times"
                                    severity="danger"
                                    className={isRTL() ? 'rtl-button' : ''}
                                    onClick={() => {
                                        setRejectReasonDialog(false);
                                        setRejectionReason('');
                                    }}
                                />
                                <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={finalizeRejection} disabled={!rejectionReason.trim()} />
                            </>
                        }
                        onHide={() => {
                            setRejectReasonDialog(false);
                            setRejectionReason('');
                        }}
                    >
                        <div className="p-fluid">
                            <div className="field">
                                <label htmlFor="rejectionReason">{t('ORDER.REJECTION_REASON')}</label>
                                <InputTextarea id="rejectionReason" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} autoFocus placeholder={t('ORDER.ENTER_REJECTION_REASON')} />
                            </div>
                        </div>
                    </Dialog>


                    <Dialog
                        visible={viewOrderDialog}
                        style={{ width: '380px', maxWidth: '95vw', padding: 0 }}
                        header={null}
                        modal
                        onHide={() => setViewOrderDialog(false)}
                        closable={false}
                    >
                        <div id="order-view-modal" style={{ backgroundColor: 'white', fontFamily: "'iranyekan', sans-serif,iranyekan" }}>
                            {selectedOrder && (
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
                                            {t('ORDER_DETAILS')}
                                        </div>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 1rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            backgroundColor: selectedOrder.status == '1' ? '#10b981' :
                                                selectedOrder.status == '2' ? '#ef4444' : '#f59e0b',
                                            color: 'white'
                                        }}>
                                            {selectedOrder.status == '0' ? t('ORDER.STATUS.PENDING') :
                                                selectedOrder.status == '1' ? t('ORDER.STATUS.CONFIRMED') :
                                                    selectedOrder.status == '2' ? t('ORDER.STATUS.REJECTED') :
                                                        t('ORDER.STATUS.UNKNOWN')}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '1.5rem 1rem' }}>
                                        {/* Key-Value Rows */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('ORDER.TABLE.COLUMN.BUNDLETITLE')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600', textAlign: 'right' }}>{selectedOrder.bundle?.bundle_title || '-'}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('ORDER.TABLE.COLUMN.RECHARGEABLEACCOUNT')}</span>
                                            <span style={{ fontSize: '1.125rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedOrder.rechargeble_account}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('VALIDITY')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600', textTransform: 'uppercase' }}>
                                                {selectedOrder.bundle?.validity_type === 'weekly' ? t('WEEKLY') :
                                                    selectedOrder.bundle?.validity_type === 'monthly' ? t('MONTHLY') :
                                                        selectedOrder.bundle?.validity_type === 'daily' ? t('DAILY') :
                                                            'N/A'}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('ORDER.TABLE.COLUMN.COMPANYNAME')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>{selectedOrder.bundle?.service?.company?.company_name || '-'}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('ORDER_ID')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>#{selectedOrder.id}</span>
                                        </div>

                                        {/* Date and Time Row */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('ORDER.TABLE.COLUMN.ORDEREDDATE')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                                                {new Date(selectedOrder.created_at).toLocaleDateString('en-GB')}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px dashed #e5e7eb' }}>
                                            <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>{t('ORDER_TIME')}</span>
                                            <span style={{ fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                                                {new Date(selectedOrder.created_at).toLocaleTimeString('en-GB', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: false
                                                })}
                                            </span>
                                        </div>

                                        {/* Amount */}
                                        {selectedOrder.bundle?.buying_price && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: '600' }}>{t('ORDER.TABLE.COLUMN.PAYABLEAMOUNT')}</span>
                                                <span style={{ fontSize: '1.25rem', color: '#059669', fontWeight: '700' }}>
                                                    {selectedOrder.bundle.buying_price}
                                                </span>
                                            </div>
                                        )}

                                        {/* Rejection Reason */}
                                        {selectedOrder.status == '2' && selectedOrder.reject_reason && (
                                            <div style={{
                                                marginTop: '1rem',
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                backgroundColor: '#fef2f2',
                                                border: '1px solid #fecaca'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: '600' }}>{t('ORDER.TABLE.COLUMN.REJECTREASON')}</span>
                                                    <span style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: '1rem' }}>
                                                        {selectedOrder.reject_reason}
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
                                            onClick={() => setViewOrderDialog(false)}
                                            className="p-button-text p-button-sm"
                                            style={{ minWidth: '80px' }}
                                        />
                                        <Button
                                            label={t('DOWNLOAD')}
                                            icon="pi pi-download"
                                            onClick={downloadOrderAsImage}
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

export default withAuth(OrderPage);
