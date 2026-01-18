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
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Payment, Currency } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addPayment, _deletePayment, _editPayment, _fetchPayments, _invalidatePayment, _rollbackedPayment, _verifyAndSendPayment, _verifyPayment } from '@/app/redux/actions/paymentActions';
import { paymentReducer } from '../../../redux/reducers/paymentReducer';
import { resellerReducer } from '../../../redux/reducers/resellerReducer';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { InputTextarea } from 'primereact/inputtextarea';
import { paymentMethodsReducer } from '../../../redux/reducers/paymentMethodReducer';
import { currenciesReducer } from '../../../redux/reducers/currenciesReducer';
import { _fetchPaymentMethods } from '@/app/redux/actions/paymentMethodActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { Calendar } from 'primereact/calendar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { Reseller } from '../../../../types/interface';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { Paginator } from 'primereact/paginator';
import { generatePaymentExcelFile } from '../../utilities/generateExcel';
import { SplitButton } from 'primereact/splitbutton';
import { Checkbox } from 'primereact/checkbox';
import { useRouter, useSearchParams } from 'next/navigation';

const PaymentPage = () => {
    let emptyPayment: Payment = {
        id: 0,
        reseller_id: 0,
        payment_method_id: 0,
        amount: '',
        remaining_payment_amount: '',
        currency_id: 0,
        transaction_id: 0,
        status: '',
        notes: '',
        payment_date: '',
        created_at: '',
        updated_date: '',
        reseller: null,
        payment_method: null,
        currency: null,
        operation_type: 'credit'
    };

    const [paymentDialog, setPaymentDialog] = useState(false);
    const [deletePaymentDialog, setDeletePaymentDialog] = useState(false);
    const [deletePaymentsDialog, setDeletePaymentsDialog] = useState(false);
    const [payment, setPayment] = useState<Payment>(emptyPayment);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { payments, loading, pagination } = useSelector((state: any) => state.paymentReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const { paymentMethods } = useSelector((state: any) => state.paymentMethodsReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { t } = useTranslation();
    const [searchTag, setSearchTag] = useState('');
    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
    const [filters, setFilters] = useState({
        filter_status: null as string | null,
        filter_payment_method: null as number | null,
        filter_startdate: null as string | null,
        filter_enddate: null as string | null
    });
    const [activeFilters, setActiveFilters] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');
    const [rollbackDialog, setRollbackDialog] = useState(false);
    const [invalidateDialog, setInvalidateDialog] = useState(false);
    const [invalidateNotes, setInvalidateNotes] = useState('');
    const [verifyDialog, setVerifyDialog] = useState(false);
    const [verifyAndSendDialog, setVerifyAndSendDialog] = useState(false);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [showVerifyNotes, setShowVerifyNotes] = useState(false);
    const [showVerifyAndSendNotes, setShowVerifyAndSendNotes] = useState(false);
    const [viewPaymentDialog, setViewPaymentDialog] = useState(false);
    const [rollbackType, setRollbackType] = useState<'rollback' | 'rollback_full'>('rollback');



    useEffect(() => {
        dispatch(_fetchPayments(1, searchTag, activeFilters));
        dispatch(_fetchResellers(1, '', '', 10000));
        dispatch(_fetchPaymentMethods());
        dispatch(_fetchCurrencies());
    }, [dispatch, searchTag, activeFilters]);

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

    // Add this useEffect for click outside detection
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('.p-dropdown-panel')) return;
            if (filterDialogVisible && filterRef.current && !filterRef.current.contains(target)) {
                setFilterDialogVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [filterDialogVisible]);

    // Add this useEffect to handle auto-opening the dialog
    const searchParams = useSearchParams(); // Add this
    const router = useRouter()

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            // Small delay to ensure the page is fully loaded and Redux state is ready
            const timer = setTimeout(() => {
                openNew();
                // Optional: Clean up the URL after opening the dialog
                router.replace('/pages/payment');
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    const openNew = () => {
        setPayment(emptyPayment);
        setSubmitted(false);
        setPaymentDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setPaymentDialog(false);
        setResellerBalance(null);
        setResellerPayment(null);
        setResellerLoan(null);
    };

    const hideDeletePaymentDialog = () => {
        setDeletePaymentDialog(false);
    };

    const hideDeletePaymentsDialog = () => {
        setDeletePaymentsDialog(false);
    };

    const viewPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setViewPaymentDialog(true);
    };

    const downloadPaymentAsImage = () => {
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
                link.download = `hawala-${selectedPayment?.id}-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });
    };

    const savePayment = () => {
        setSubmitted(true);
        if (!payment.reseller || !payment.amount || !payment.payment_method || !payment.currency || !payment.payment_date) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (payment.id && payment.id !== 0) {
            dispatch(_editPayment(payment.id, payment, toast, t));
        } else {
            dispatch(_addPayment(payment, toast, t));
        }

        setPaymentDialog(false);
        setPayment(emptyPayment);
        setSubmitted(false);
    };

    const editPayment = (payment: Payment) => {
        const matchingReseller = resellers.find((r: any) => r.id === payment.reseller?.id);

        setPayment({ ...payment, reseller: matchingReseller });
        console.log(payment.reseller);
        setPaymentDialog(true);
    };

    const confirmDeletePayment = (payment: Payment) => {
        setPayment(payment);
        setDeletePaymentDialog(true);
    };

    const deletePayment = () => {
        if (!payment?.id) {
            console.error('Payment  ID is undefined.');
            return;
        }
        dispatch(_deletePayment(payment?.id, toast, t));
        setDeletePaymentDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeletePaymentsDialog(true);
    };

    const confirmRollbackPayment = (payment: Payment) => {
        setPayment(payment);
        setRollbackDialog(true);
        setRollbackType("rollback")
    };

    const rollbackPayment = () => {
        if (!payment?.id) {
            console.error('Payment  ID is undefined.');
            return;
        }
        dispatch(_rollbackedPayment(payment?.id, toast, t,rollbackType));
        hideRollbackDialog();
    };

    const confirmInvalidatePayment = (payment: Payment) => {
        setPayment(payment);
        setInvalidateNotes('');
        setInvalidateDialog(true);
    };

    const handleInvalidatePayment = () => {
        if (!payment?.id) {
            console.error('Payment ID is undefined.');
            return;
        }

        dispatch(_invalidatePayment(payment?.id, invalidateNotes, toast, t));

        setInvalidateDialog(false);
    };

    const hideInvalidateDialog = () => {
        setInvalidateDialog(false);
    };

    const hideRollbackDialog = () => {
        setRollbackDialog(false);
        setRollbackType("rollback")
    };

    const handleVerifyPayment = () => {
        if (!payment?.id) {
            console.error('Payment ID is undefined.');
            return;
        }

        const notes = showVerifyNotes ? verificationNotes : '';
        dispatch(_verifyPayment(payment?.id, notes, toast, t));
        hideVerifyDialog();
    };

    const handleVerifyAndSendPayment = () => {
        if (!payment?.id) {
            console.error('Payment ID is undefined.');
            return;
        }

        const notes = showVerifyAndSendNotes ? verificationNotes : '';
        dispatch(_verifyAndSendPayment(payment?.id, notes, toast, t));
        hideVerifyAndSendDialog();
    };

    const hideVerifyDialog = () => {
        setVerifyDialog(false);
        setShowVerifyNotes(false);
        setVerificationNotes('');
    };

    const hideVerifyAndSendDialog = () => {
        setVerifyAndSendDialog(false);
        setShowVerifyAndSendNotes(false);
        setVerificationNotes('');
    };

    const confirmVerifyPayment = (payment: Payment) => {
        setPayment(payment);
        setVerificationNotes('');
        setShowVerifyNotes(false);
        setVerifyDialog(true);
    };

    const confirmVerifyAndSendPayment = (payment: Payment) => {
        setPayment(payment);
        setVerificationNotes('');
        setShowVerifyAndSendNotes(false);
        setVerifyAndSendDialog(true);
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center gap-2">
                    <Button label={t('ADD_PAYMENT')} icon="pi pi-plus" severity="success" className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'} onClick={openNew} />
                    {' '}
                    {/* Added gap-2 here */}
                    <div className="flex-1 min-w-[100px]" ref={filterRef} style={{ position: 'relative' }}>
                        <Button className="p-button-info" label={t('FILTER')} style={{ gap: '8px' }} icon="pi pi-filter" onClick={() => setFilterDialogVisible(!filterDialogVisible)} />
                        {filterDialogVisible && (
                            <div
                                className="p-card p-fluid"
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: isRTL() ? 0 : '',
                                    right: isRTL() ? '' : 0,
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
                                                {t('PAYMENT.TABLE.COLUMN.STATUS')}
                                            </label>
                                            <Dropdown
                                                id="statusFilter"
                                                options={[
                                                    { label: t('COMPLETED'), value: 'completed' },
                                                    { label: t('PENDING'), value: 'pending' },
                                                    { label: t('FAILED'), value: 'failed' }
                                                ]}
                                                value={filters.filter_status}
                                                onChange={(e) => setFilters({ ...filters, filter_status: e.value })}
                                                placeholder={t('SELECT_STATUS')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Payment Method Filter */}
                                        <div className="col-12">
                                            <label htmlFor="paymentMethodFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')}
                                            </label>
                                            <Dropdown
                                                id="paymentMethodFilter"
                                                options={paymentMethods}
                                                value={filters.filter_payment_method}
                                                onChange={(e) => setFilters({ ...filters, filter_payment_method: e.value })}
                                                optionLabel="method_name"
                                                optionValue="id"
                                                placeholder={t('SELECT_PAYMENT_METHOD')}
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        {/* Date Range Filters */}
                                        <div className="col-12">
                                            <label htmlFor="startDateFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('START_DATE')}
                                            </label>
                                            <InputText type="date" id="startDateFilter" value={filters.filter_startdate || ''} onChange={(e) => setFilters({ ...filters, filter_startdate: e.target.value })} style={{ width: '100%' }} />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="endDateFilter" style={{ fontSize: '0.875rem' }}>
                                                {t('END_DATE')}
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
                                                        filter_payment_method: null,
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

                    <Button className="flex-1 min-w-[100px]" label={t('EXPORT.EXPORT')} style={{ gap: '8px' }} icon={`pi pi-file-excel`} severity="success" onClick={exportToExcel} />
                </div>
            </React.Fragment>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex items-center">
                <span className="block mt-2 md:mt-0 p-input-icon-left w-full md:w-auto">
                    <i className="pi pi-search" />
                    <InputText type="search" onInput={(e) => setSearchTag(e.currentTarget.value)} placeholder={t('ECOMMERCE.COMMON.SEARCH')} className="w-full md:w-auto" />
                </span>
            </div>
        );
    };

    const resellerNameBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Reseller</span>
                {rowData.reseller?.reseller_name}
            </>
        );
    };

    const paymentMethodBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Payment Method</span>
                {rowData.payment_method?.method_name}
            </>
        );
    };

    const amountBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Amount</span>
                {rowData.amount}
            </>
        );
    };

    const currencyBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Currency</span>
                {rowData.currency?.code}
            </>
        );
    };

    const remainingPaymentBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Remaining Payment</span>
                {rowData.remaining_payment_amount}
            </>
        );
    };

    const statusBodyTemplate = (rowData: Payment) => {
        const status = rowData.status?.toLowerCase() || 'unknown';

        const getStatusClass = (status: string) => {
            switch (status.toLowerCase()) {
                case 'rollback':
                    return 'bg-yellow-100 text-yellow-800';
                case 'completed':
                    return 'bg-green-100 text-green-800';
                case 'rejected':
                    return 'bg-red-100 text-red-800';
                case 'failed':
                    return 'bg-red-100 text-red-800';
                case 'pending':
                    return 'bg-yellow-100 text-red-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        };

        const displayStatus = status !== 'unknown' ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';

        return (
            <>
                <span className="p-column-title">Status</span>
                <span className={`px-2 py-1 border-round-xl text-xs font-semibold ${getStatusClass(rowData.status)} w-5rem inline-block text-center`}>{displayStatus}</span>
            </>
        );
    };

    const noteBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Note</span>
                {rowData.notes}
            </>
        );
    };

    const operationTypeBodyTemplate = (rowData: Payment) => {
        const type = rowData.operation_type?.toLowerCase() || 'unknown';

        const getTypeClass = (type: string) => {
            switch (type) {
                case 'debit':
                    return 'bg-red-100 text-red-800';
                case 'debit_full':
                    return 'bg-red-200 text-red-800';
                case 'credit':
                    return 'bg-blue-100 text-blue-800';
                case 'credit_full':
                    return 'bg-blue-200 text-blue-800';
                default:

                    return 'bg-gray-100 text-gray-800';
            }
        };

        const displayType = type !== 'unknown' ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown';

        return (
            <>
                <span className="p-column-title">Type</span>
                <span className={`px-2 py-1 text-xs font-semibold border-round-xl ${getTypeClass(type)} w-5rem inline-block text-center`}>{displayType}</span>
            </>
        );
    };



    const performedByBodyTemplate = (rowData: Payment) => {
        return (
            <>
                <span className="p-column-title">Performed By</span>
                {rowData.performed_by_name}
            </>
        );
    };

    const paymentDateBodyTemplate = (rowData: Payment) => {
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

        const { formattedDate, formattedTime } = formatDate(rowData.payment_date);

        return (
            <>
                <span className="p-column-title">Created At</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedDate}</span>
                <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{formattedTime}</span>
            </>
        );
    };

    // const actionBodyTemplate = (rowData: Payment) => {
    //     return (
    //         <>
    //             <div className="flex flex-row">
    //                 <Button icon="pi pi-pencil" rounded severity="success" className="mr-2" onClick={() => editPayment(rowData)} />
    //                 <Button icon="pi pi-trash" rounded severity="warning" onClick={() => confirmDeletePayment(rowData)} />
    //             </div>
    //         </>
    //     );
    // };

    const actionBodyTemplate = (rowData: Payment) => {
        const isRollbacked = rowData.status === 'rollbacked';
        const isCompleted = rowData.status === 'completed';
        const isPending = rowData.status === 'pending';

        const items: any = [];

        // Always include Delete
        // items.push({
        //     label: t('DELETE'),
        //     icon: 'pi pi-trash',
        //     command: () => confirmDeletePayment(rowData),
        //     disabled: isRollbacked // Disabled only if rollbacked
        // });

        if (isRollbacked) {
            // All other actions are disabled (only Delete is shown but disabled above)
            return <SplitButton label="" model={items} className="p-button-rounded" severity="info" dir="ltr" icon="pi pi-cog" />;
        }

        if (isCompleted) {
            items.push({
                label: t('ROLLBACK'),
                icon: 'pi pi-replay',
                command: () => confirmRollbackPayment(rowData)
            });
        } else if (isPending) {
            // Only show full set if not done/rollbacked/confirmed
            items.push(
                {
                    label: t('Invalidate'),
                    icon: 'pi pi-times-circle',
                    command: () => confirmInvalidatePayment(rowData)
                },
                {
                    label: t('Verify'),
                    icon: 'pi pi-check-circle',
                    command: () => confirmVerifyPayment(rowData)
                },
                {
                    label: t('Verify_and_send'),
                    icon: 'pi pi-check-square',
                    command: () => confirmVerifyAndSendPayment(rowData)
                },
                {
                    label: t('ROLLBACK'),
                    icon: 'pi pi-replay',
                    command: () => confirmRollbackPayment(rowData)
                },
                {
                    label: t('EDIT'),
                    icon: 'pi pi-pencil',
                    command: () => editPayment(rowData)
                }
            );
        } else {
            return <SplitButton label="" model={items} className="p-button-rounded" severity="info" dir="ltr" icon="pi pi-cog" />;
        }

        return <SplitButton label="" model={items} className="p-button-rounded" severity="info" dir="ltr" icon="pi pi-cog" />;
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

    const paymentDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={savePayment} />
        </>
    );
    const deletePaymentDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeletePaymentDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={deletePayment} />
        </>
    );
    const deleteCompaniesDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeletePaymentsDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );
    const rollbackDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideRollbackDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={rollbackPayment} />
        </>
    );

    useEffect(() => {
        const currencyCode = payment?.reseller?.code || '';

        const selectedCurrency = currencies.find((currency: Currency) => currency.code === currencyCode);

        if (selectedCurrency) {
            setPayment((prev) => ({
                ...prev,
                currency_id: selectedCurrency.id,
                currency: selectedCurrency
            }));
        }
    }, [payment?.reseller?.code, currencies]);

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(_fetchPayments(page, searchTag));
    };

    // Add these helper functions
    const handleSubmitFilter = (filters: any) => {
        const cleanedFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== null && value !== ''));
        setActiveFilters(cleanedFilters);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await new Promise((res) => setTimeout(res, 1000));
        dispatch(_fetchPayments(1, searchTag, activeFilters));
        setRefreshing(false);
    };

    const exportToExcel = async () => {
        await generatePaymentExcelFile({
            t,
            toast,
            all: true
        });
    };

    
        const [resellerBalance, setResellerBalance] = useState<any>(null);
        const [resellerPayment, setResellerPayment] = useState<any>(null);
        const [resellerLoan, setResellerLoan] = useState<any>(null);

        useEffect(() => {
            if (payment.reseller) {
                const formattedCurrency = payment.currency?.code || '';
    
                const resellerBalanceValue = Number(payment.reseller?.balance ?? 0);
                const totalSent = Number(payment.reseller?.total_balance_sent ?? 0);
                const totalReceived = Number(payment.reseller?.total_payments_received ?? 0);
                const paymentDiff = totalSent - totalReceived;
    
                const totalPayments = Number(payment?.reseller?.total_payments_received) || 0;
                const totalBalance = Number(payment?.reseller?.total_balance_sent) || 0;
                const availablePaymentAmount = totalPayments - totalBalance;
    
                setResellerBalance(`${resellerBalanceValue} ${formattedCurrency}`);
                //setResellerPayment(`${paymentDiff > 0 ? paymentDiff : 0} ${formattedCurrency}`);
                setResellerPayment(`${availablePaymentAmount > 0 ? availablePaymentAmount : 0} ${formattedCurrency}`)
                setResellerLoan(`${paymentDiff > 0 ? paymentDiff : 0} ${formattedCurrency}`);
            }
        }, [payment.reseller, payment.currency?.code]);

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                    <DataTable
                        ref={dt}
                        value={payments}
                        selection={selectedPayment}
                        onSelectionChange={(e) => setSelectedPayment(e.value as any)}
                        dataKey="id"
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
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
                        // header={header}
                        responsiveLayout="scroll"
                        onRowClick={(e) => viewPayment(e.data as Payment)}
                        rowClassName={() => 'cursor-pointer select-none'}
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.RESELLER')} body={resellerNameBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')} body={paymentMethodBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.AMOUNT')} body={amountBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.CURRENCY')} body={currencyBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.FORM.INPUT.OPRATIONTYPE')} body={operationTypeBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.REMAININGPAYMENTAMOUNT')} body={remainingPaymentBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.STATUS')} body={statusBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.NOTES')} body={noteBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PERFORMED_BY')} body={performedByBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} header={t('PAYMENT.TABLE.COLUMN.PAYMENTDATE')} body={paymentDateBodyTemplate}></Column>
                        <Column style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate}></Column>
                    </DataTable>

                    <Paginator
                        first={(pagination?.page - 1) * pagination?.items_per_page}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL() ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}` // localized RTL string
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        firstPageLinkIcon={
                            isRTL()
                                ? "pi pi-angle-double-right"
                                : "pi pi-angle-double-left"
                        }
                        lastPageLinkIcon={
                            isRTL()
                                ? "pi pi-angle-double-left"
                                : "pi pi-angle-double-right"
                        }
                    />

                    <Dialog visible={paymentDialog} style={{ width: '900px', padding: '5px' }} header={t('PAYMENT.DETAILS.TITLE')} modal className="p-fluid" footer={paymentDialogFooter} onHide={hideDialog}>
                        
                        {resellerBalance !== null && resellerPayment !== null && (
                            <div
                                className="flex flex-wrap justify-between items-center"
                                style={{
                                    borderRadius: '10px',
                                    background: '#ffffff',
                                    border: '1px solid #e5e7eb', // Tailwind gray-200
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                                }}
                            >
                                {/* Reseller Balance */}
                                <div className="flex-1 col-12 lg:col-4 text-center p-4 bg-green-50 rounded-xl shadow-sm">
                                    <p className="text-gray-600 font-medium">{t('BALANCE.FORM.RESELLER.BALANCE')}</p>
                                    <p className="text-xl font-bold text-green-600 mt-2">{resellerBalance}</p>
                                </div>

                                {/* Reseller Payment */}
                                <div className="flex-1 col-12 lg:col-4 text-center p-4 bg-red-50 rounded-xl shadow-sm">
                                    <p className="text-gray-600 font-medium">{t('RESELLER.TABLE.COLUMN.AVAILABLEPAYMENT')}</p>
                                    <p className="text-xl font-bold text-red-600 mt-2">{resellerPayment}</p>
                                </div>

                                {/* Reseller Loan */}
                                <div className="flex-1 col-12 lg:col-4 text-center p-4 bg-purple-50 rounded-xl shadow-sm">
                                    <p className="text-gray-600 font-medium">{t('BALANCE.FORM.RESELLER.LOAN')}</p>
                                    <p className="text-xl font-bold text-purple-600 mt-2">{resellerLoan}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="card flex  flex-wrap p-fluid mt-3 gap-4">
                            <div className=" flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="reseller" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.RESELLER')}
                                    </label>
                                    <Dropdown
                                        id="reseller"
                                        value={payment.reseller}
                                        options={resellers}
                                        onChange={(e) => {
                                            setPayment((prev) => ({
                                                ...prev,
                                                reseller: e.value
                                            }));
                                        }}
                                        optionLabel="reseller_name"
                                        filter
                                        filterBy="reseller_name"
                                        filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                                        showFilterClear
                                        placeholder={t('PAYMENT.FORM.INPUT.RESELLER')}
                                        className="w-full"
                                        panelClassName="min-w-[20rem]"
                                        onFilter={(e) => {
                                            setResellerSearchTerm(e.filter);
                                        }}
                                    />

                                    {submitted && !payment.reseller && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="email" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.AMOUNT')}
                                    </label>
                                    <InputText
                                        id="amount"
                                        value={payment.amount}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                amount: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('PAYMENT.FORM.INPUT.AMOUNT')}
                                        className={classNames({
                                            'p-invalid': submitted && !payment.amount
                                        })}
                                    />
                                    {submitted && !payment.amount && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                {/* operation type type */}
                                <div className="field">
                                    <label htmlFor="operation_type" style={{ fontWeight: 'bold' }}>{t('PAYMENT.FORM.INPUT.OPRATIONTYPE')} *</label>
                                    <Dropdown
                                        id="operation_type"
                                        value={payment.operation_type}
                                        options={[
                                            { label: 'Credit', value: 'credit' },
                                            { label: 'Debit', value: 'debit' },
                                            { label: 'Credit Full', value: 'credit_full' },
                                            { label: 'Debit Full', value: 'debit_full' }

                                        ]}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                operation_type: e.value
                                            }))
                                        }
                                        placeholder={t('PAYMENT.FORM.OPRATIONTYPE.PLACEHOLDER')}
                                        className="w-full"
                                    />
                                    {submitted && !payment.operation_type && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                {/* operation type type */}

                                <div className="field">
                                    <label htmlFor="notes" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.NOTES')}
                                    </label>
                                    <InputTextarea
                                        value={payment.notes}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                notes: e.target.value
                                            }))
                                        }
                                        rows={3}
                                        cols={30}
                                        placeholder={t('PAYMENT.FORM.INPUT.NOTES')}
                                    />
                                    {/* {submitted && !payment.notes && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )} */}
                                </div>


                            </div>

                            <div className=" flex-1 col-12 lg:col-6">
                                <div className="field">
                                    <label htmlFor="payment_method" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.PAYMENTMETHOD')}
                                    </label>
                                    <Dropdown
                                        id="payment_method"
                                        value={payment.payment_method}
                                        options={paymentMethods}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                payment_method: e.value
                                            }))
                                        }
                                        optionLabel="method_name"
                                        // optionValue='id'
                                        placeholder={t('PAYMENT.FORM.INPUT.PAYMENTMETHOD')}
                                        className="w-full"
                                    />
                                    {submitted && !payment.payment_method && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field">
                                    <label htmlFor="currency" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.CURRENCY')}
                                    </label>
                                    <Dropdown
                                        disabled
                                        id="currency"
                                        value={payment.currency}
                                        options={currencies}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                currency: e.value
                                            }))
                                        }
                                        optionLabel="name"
                                        // optionValue='id'
                                        placeholder={t('PAYMENT.FORM.INPUT.CURRENCY')}
                                        className="w-full"
                                    />
                                    {submitted && !payment.currency && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field">
                                    <label htmlFor="payment_date" style={{ fontWeight: 'bold' }}>
                                        {t('PAYMENT.FORM.INPUT.PAYMENTDATE')}
                                    </label>
                                    <InputText
                                        id="payment_date"
                                        value={payment.payment_date}
                                        onChange={(e) =>
                                            setPayment((prev) => ({
                                                ...prev,
                                                payment_date: e.target.value
                                            }))
                                        }
                                        type="date"
                                        required
                                        autoFocus
                                        placeholder={t('PAYMENT.FORM.INPUT.PAYMENTDATE')}
                                        className={classNames({
                                            'p-invalid': submitted && !payment.payment_date
                                        })}
                                    />

                                    {submitted && !payment.payment_date && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deletePaymentDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deletePaymentDialogFooter} onHide={hideDeletePaymentDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {payment && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b></b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deletePaymentsDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={deleteCompaniesDialogFooter} onHide={hideDeletePaymentsDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {payment && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>

                    {/* Rollback Confirmation Dialog */}
                    <Dialog visible={rollbackDialog} style={{ width: '450px' }} header={t('TABLE.GENERAL.CONFIRM')} modal footer={rollbackDialogFooter} onHide={hideRollbackDialog}>
                        <div className="flex flex-column">
                            {payment && <span className="mb-3">{t('ARE_YOU_SURE_YOU_WANT_TO_ROLLBACK')}?</span>}

                            {(payment?.operation_type === 'credit_full' || payment?.operation_type === 'debit_full') && (
                                <div className="field-checkbox w-full">
                                    <Checkbox
                                        inputId="rollbackFull"
                                        checked={rollbackType === 'rollback_full'}
                                        onChange={(e) => setRollbackType(e.checked ? 'rollback_full' : 'rollback')}
                                    />
                                    <label htmlFor="rollbackFull" className="ml-2">
                                        {t('ROLLBACK_FULL')}
                                    </label>
                                </div>
                            )}
                        </div>
                    </Dialog>

                    {/* invalidate dialog */}
                    <Dialog
                        visible={invalidateDialog}
                        style={{ width: '450px' }}
                        header={t('INVALIDATE_PAYMENT')}
                        modal
                        onHide={hideInvalidateDialog}
                        footer={
                            <>
                                <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideInvalidateDialog} />
                                <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={handleInvalidatePayment} />
                            </>
                        }
                    >
                        <div className="p-fluid">
                            <div className="field">
                                <label htmlFor="invalidateNotes">{t('NOTES')}</label>
                                <InputTextarea id="invalidateNotes" value={invalidateNotes} onChange={(e) => setInvalidateNotes(e.target.value)} rows={3} placeholder={t('ENTER_INVALIDATION_REASON')} autoFocus />
                            </div>
                        </div>
                    </Dialog>
                    {/* Verify Payment Dialog */}
                    <Dialog
                        visible={verifyDialog}
                        style={{ width: '450px' }}
                        header={t('VERIFY_PAYMENT')}
                        modal
                        onHide={hideVerifyDialog}
                        footer={
                            <>
                                <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideVerifyDialog} />
                                <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={handleVerifyPayment} />
                            </>
                        }
                    >
                        <div className="p-fluid">
                            <div className="field-checkbox mb-3">
                                <Checkbox inputId="showVerifyNotes" checked={showVerifyNotes} onChange={(e) => setShowVerifyNotes(e.checked ?? false)} />
                                <label htmlFor="showVerifyNotes">{t('ADD_NOTES')}</label>
                            </div>

                            {showVerifyNotes && (
                                <div className="field">
                                    <label htmlFor="verificationNotes">{t('NOTES')}</label>
                                    <InputTextarea id="verificationNotes" value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} rows={3} placeholder={t('ENTER_VERIFICATION_NOTES')} />
                                </div>
                            )}
                        </div>
                    </Dialog>

                    {/* Verify and Send Payment Dialog */}
                    <Dialog
                        visible={verifyAndSendDialog}
                        style={{ width: '450px' }}
                        header={t('VERIFY_AND_SEND_PAYMENT')}
                        modal
                        onHide={hideVerifyAndSendDialog}
                        footer={
                            <>
                                <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={hideVerifyAndSendDialog} />
                                <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={handleVerifyAndSendPayment} />
                            </>
                        }
                    >
                        <div className="p-fluid">
                            <div className="field-checkbox mb-3">
                                <Checkbox inputId="showVerifyAndSendNotes" checked={showVerifyAndSendNotes} onChange={(e) => setShowVerifyAndSendNotes(e.checked ?? false)} />
                                <label htmlFor="showVerifyAndSendNotes">{t('ADD_NOTES')}</label>
                            </div>

                            {showVerifyAndSendNotes && (
                                <div className="field">
                                    <label htmlFor="verificationNotes">{t('NOTES')}</label>
                                    <InputTextarea id="verificationNotes" value={verificationNotes} onChange={(e) => setVerificationNotes(e.target.value)} rows={3} placeholder={t('ENTER_VERIFICATION_NOTES')} />
                                </div>
                            )}
                        </div>
                    </Dialog>


                    {/* View payment Dialog */}
                    <Dialog
                        visible={viewPaymentDialog}
                        style={{ width: '380px', maxWidth: '95vw', padding: 0 }}
                        header={null}
                        modal
                        onHide={() => setViewPaymentDialog(false)}
                        closable={false}
                    >
                        <div id="hawala-view-modal" style={{ backgroundColor: 'white', fontFamily: "'iranyekan', sans-serif,iranyekan" }}>
                            {selectedPayment && (
                                <div style={{ background: 'white' }}>
                                    {/* Header */}
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '0.5rem 0.5rem',
                                        borderBottom: '2px dashed #e5e7eb',
                                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                                    }}>
                                        <div>
                                            <img src={process.env.NEXT_PUBLIC_PROJECT_LOGO} alt="" className='h-2 w-2' />
                                        </div>
                                        <div style={{
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            color: '#1f2937',
                                            marginBottom: '0.5rem'
                                        }}>
                                            {t('PAYMENT_DETAILS')}
                                        </div>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 1rem',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            backgroundColor: selectedPayment.status === 'completed' ? '#10b981' :
                                                selectedPayment.status === 'pending' ? '#f59e0b' :
                                                    selectedPayment.status === 'failed' ? '#ef4444' :
                                                        selectedPayment.status === 'rollbacked' ? '#dc2626' : '#6b7280',
                                            color: 'white'
                                        }}>
                                            {selectedPayment.status === 'completed' ? t('COMPLETED') :
                                                selectedPayment.status === 'pending' ? t('PENDING') :
                                                    selectedPayment.status === 'failed' ? t('FAILED') :
                                                        selectedPayment.status === 'rollbacked' ? t('ROLLBACKED') : t('UNKNOWN')}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '1rem 0.75rem' }}>
                                        {/* Reseller Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PAYMENT.TABLE.COLUMN.RESELLER')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedPayment?.reseller?.reseller_name || '...'}</span>
                                        </div>

                                        {/* Payment Method */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '4px',
                                            paddingBottom: '6px',
                                            borderBottom: '1px solid #f3f4f6',
                                            gap: '10px'
                                        }}>
                                            {/* Label */}
                                            <span style={{
                                                fontSize: '0.8rem',
                                                color: '#6b7280',
                                                fontWeight: '500',
                                                minWidth: '120px',      // FIXED LABEL WIDTH
                                                flexShrink: 0
                                            }}>
                                                {t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')}
                                            </span>

                                            {/* Value */}
                                            <span style={{
                                                fontSize: '0.9rem',
                                                color: '#1f2937',
                                                fontWeight: '600',
                                                wordWrap: 'break-word',
                                                whiteSpace: 'normal',
                                                flex: 1,                // WRAPS TEXT WITHOUT BREAKING LAYOUT
                                                textAlign: 'right'
                                            }}>
                                                {selectedPayment?.payment_method?.method_name || '...'}
                                            </span>
                                        </div>


                                        {/* Amount */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PAYMENT.TABLE.COLUMN.AMOUNT')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedPayment.amount} {selectedPayment?.currency?.code}</span>
                                        </div>

                                        {/* Operation Type */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PAYMENT.FORM.INPUT.OPRATIONTYPE')}</span>
                                            <span style={{
                                                fontSize: '0.8rem',
                                                fontWeight: 'bold',
                                                padding: '0.2rem 0.5rem',
                                                borderRadius: '12px',
                                                backgroundColor: selectedPayment.operation_type === 'credit' ? '#dbeafe' :
                                                    selectedPayment.operation_type === 'debit' ? '#fee2e2' :
                                                        selectedPayment.operation_type === 'credit_full' ? '#bfdbfe' :
                                                            selectedPayment.operation_type === 'debit_full' ? '#fecaca' : '#f3f4f6',
                                                color: selectedPayment.operation_type === 'credit' ? '#1e40af' :
                                                    selectedPayment.operation_type === 'debit' ? '#dc2626' :
                                                        selectedPayment.operation_type === 'credit_full' ? '#1e3a8a' :
                                                            selectedPayment.operation_type === 'debit_full' ? '#b91c1c' : '#6b7280'
                                            }}>
                                                {selectedPayment.operation_type?.toUpperCase() || '...'}
                                            </span>
                                        </div>

                                        {/* Remaining Payment Amount */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PAYMENT.TABLE.COLUMN.REMAININGPAYMENTAMOUNT')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedPayment.remaining_payment_amount} {selectedPayment?.currency?.code}</span>
                                        </div>

                                        {/* Payment Date */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PAYMENT.TABLE.COLUMN.PAYMENTDATE')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedPayment.payment_date
                                                    ? new Date(selectedPayment.payment_date).toLocaleString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true
                                                    })
                                                    : "-"}
                                            </span>
                                        </div>

                                        {/* Created Date */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('CREATED_AT')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedPayment.created_at
                                                    ? new Date(selectedPayment.created_at).toLocaleString("en-GB", {
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true
                                                    })
                                                    : "-"}
                                            </span>
                                        </div>

                                        {/* Notes */}
                                        {selectedPayment.notes && (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                marginBottom: '4px',
                                                paddingBottom: '6px',
                                                borderBottom: '1px solid #f3f4f6',
                                                gap: '10px'
                                            }}>
                                                {/* Label */}
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    color: '#6b7280',
                                                    fontWeight: '500',
                                                    minWidth: '120px',      // FIXED LABEL WIDTH
                                                    flexShrink: 0
                                                }}>
                                                    {t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')}
                                                </span>

                                                {/* Value */}
                                                <span style={{
                                                    fontSize: '0.9rem',
                                                    color: '#1f2937',
                                                    fontWeight: '600',
                                                    wordWrap: 'break-word',
                                                    whiteSpace: 'normal',
                                                    flex: 1,                // WRAPS TEXT WITHOUT BREAKING LAYOUT
                                                    textAlign: 'right'
                                                }}>
                                                    {selectedPayment?.notes || '...'}
                                                </span>
                                            </div>

                                        )}

                                        {/* Performed By */}
                                        {selectedPayment.performed_by_name && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PERFORMED_BY')}</span>
                                                <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedPayment.performed_by_name}</span>
                                            </div>
                                        )}
                                        {/* Images Section */}
                                        {(selectedPayment.payment_image || selectedPayment.extra_image_1 || selectedPayment.extra_image_2) && (
                                            <div style={{
                                                marginBottom: '4px',
                                                paddingBottom: '6px',
                                                borderBottom: '1px solid #f3f4f6'
                                            }}>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: '#6b7280',
                                                    fontWeight: '500',
                                                    marginBottom: '8px'
                                                }}>
                                                    {t('IMAGES')}
                                                </div>
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                                    gap: '8px'
                                                }}>
                                                    {/* Payment Image */}
                                                    {selectedPayment.payment_image && (
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                aspectRatio: '1',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                                border: '1px solid #e5e7eb'
                                                            }}
                                                            onClick={() => {
                                                                //window.open(selectedPayment.payment_image, '_blank');
                                                            }}
                                                        >
                                                            <img
                                                                src={selectedPayment.payment_image}
                                                                alt="Payment image"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    transition: 'transform 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Extra Image 1 */}
                                                    {selectedPayment.extra_image_1 && (
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                aspectRatio: '1',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                                border: '1px solid #e5e7eb'
                                                            }}
                                                            onClick={() => {
                                                                //window.open(selectedPayment.extra_image_1, '_blank');
                                                            }}
                                                        >
                                                            <img
                                                                src={selectedPayment.extra_image_1}
                                                                alt="Extra image 1"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    transition: 'transform 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                }}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Extra Image 2 */}
                                                    {selectedPayment.extra_image_2 && (
                                                        <div
                                                            style={{
                                                                width: '100%',
                                                                aspectRatio: '1',
                                                                borderRadius: '8px',
                                                                overflow: 'hidden',
                                                                cursor: 'pointer',
                                                                border: '1px solid #e5e7eb'
                                                            }}
                                                            onClick={() => {
                                                                //window.open(selectedPayment.extra_image_2, '_blank');
                                                            }}
                                                        >
                                                            <img
                                                                src={selectedPayment.extra_image_2}
                                                                alt="Extra image 2"
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: 'cover',
                                                                    transition: 'transform 0.2s'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.05)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    {/* Footer */}
                                    <div style={{
                                        padding: '0.75rem',
                                        borderTop: '2px dashed #e5e7eb',
                                        display: 'flex',
                                        gap: '0.5rem',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button
                                            label={t('APP.GENERAL.CANCEL')}
                                            icon="pi pi-times"
                                            onClick={() => setViewPaymentDialog(false)}
                                            className="p-button-text p-button-sm"
                                            style={{ minWidth: '90px' }}
                                        />
                                        <Button
                                            label={t('DOWNLOAD')}
                                            icon="pi pi-download"
                                            onClick={downloadPaymentAsImage}
                                            className="p-button-success p-button-sm"
                                            style={{ minWidth: '90px' }}
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

export default withAuth(PaymentPage);
