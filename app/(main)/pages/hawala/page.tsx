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
import { Paginator } from 'primereact/paginator';
import { AppDispatch } from '@/app/redux/store';
import { Currency, Hawala, HawalaBranch, Order } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { SplitButton } from 'primereact/splitbutton';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { _addHawala, _changeHawalaStatus, _deleteHawala, _fetchHawalaList } from '@/app/redux/actions/hawalaActions';
import { isRTL } from '../../utilities/rtlUtil';
import { _fetchHawalaNextNumber } from '@/app/redux/actions/hawalaSeriesActions';
import { _fetchHawalaCurrencies } from '@/app/redux/actions/hawalaCurrenciesActions';
import { _fetchHawalaBranchList } from '@/app/redux/actions/hawalaBranchActions';
import { Card } from 'primereact/card';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { Checkbox } from 'primereact/checkbox';
import { InputTextarea } from 'primereact/inputtextarea';
import { useRouter, useSearchParams } from 'next/navigation';

// Form Data Interface
interface HawalaFormData {
    reseller: any;
    senderName: string;
    receiverName: string;
    receiverFatherName: string;
    receiverIdCardNumber: string;
    hawalaAmount: string;
    currencyCodeId: string;
    branchId: string;
    commissionPaidBy: string;
    customHawalaNumber: string;
    adminNote: string;
}

const HawalaPage = () => {
    // State Management
    const [orderDialog, setOrderDialog] = useState(false);
    const [deleteOrderDialog, setDeleteOrderDialog] = useState(false);
    const [deleteOrdersDialog, setDeleteOrdersDialog] = useState(false);
    const [selectedCompanies, setSelectedCompanyCode] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();

    // Redux Selectors
    const { hawalas, pagination, loading } = useSelector((state: any) => state.hawalaReducer);
    const { nextNumber } = useSelector((state: any) => state.hawalaNumberSeriesReducer);
    const { resellers } = useSelector((state: any) => state.resellerReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { hawala_currencies } = useSelector((state: any) => state.hawalaCurrenciesReducer);
    const { hawalaBranches } = useSelector((state: any) => state.hawalaBranchReducer);

    // Translation
    const { t } = useTranslation();

    // Search and Filter States
    const [searchTag, setSearchTag] = useState('');
    const [resellerSearchTerm, setResellerSearchTerm] = useState('');

    // Dialog States
    const [statusChangeDialog, setStatusChangeDialog] = useState(false);
    const [viewHawalaDialog, setViewHawalaDialog] = useState(false);
    const [addHawalaDialog, setAddHawalaDialog] = useState(false);
    const [confirmationDialog, setConfirmationDialog] = useState(false);
    const [showRatesModal, setShowRatesModal] = useState(false);

    // Data States
    const [order, setOrder] = useState<Order>();
    const [selectedHawala, setSelectedHawala] = useState<Hawala | null>(null);
    const [selectedHawalaForAction, setSelectedHawalaForAction] = useState<Hawala | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<number | null>();

    // Form States
    const [formData, setFormData] = useState<HawalaFormData>({
        reseller: null,
        senderName: "",
        receiverName: "",
        receiverFatherName: "",
        receiverIdCardNumber: "",
        hawalaAmount: "",
        currencyCodeId: "",
        branchId: "",
        commissionPaidBy: "sender",
        customHawalaNumber: "",
        adminNote: ""
    });

    // Calculation States
    const [finalAmount, setFinalAmount] = useState(0);
    const [exchangeRate, setExchangeRate] = useState(0);
    const [resellerCurrencyPreferenceId, setResellerCurrencyPreferenceId] = useState<number | undefined>();
    const [resellerCurrencyPreferenceCode, setResellerCurrencyPreferenceCode] = useState<string | undefined>();
    const [hawalaNumberInput, setHawalaNumberInput] = useState('');
    const [fetchingNextNumber, setFetchingNextNumber] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        dispatch(_fetchHawalaList(1, searchTag));
        dispatch(_fetchHawalaCurrencies());
        dispatch(_fetchHawalaBranchList());
        dispatch(_fetchResellers(1, '', '', 10000));
        dispatch(_fetchCurrencies());
    }, [dispatch, searchTag]);

    // Reseller Search Debounce
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

    // Currency Calculation
    useEffect(() => {
        const currencyCode = formData?.reseller?.code || '';
        const selectedCurrency = currencies.find((currency: Currency) => currency.code === currencyCode);

        if (selectedCurrency) {
            setResellerCurrencyPreferenceId(selectedCurrency.id);
            setResellerCurrencyPreferenceCode(selectedCurrency.code);
        }
    }, [formData?.reseller, currencies]);

    // Filter currencies based on reseller's preference
    const filteredCurrencies = hawala_currencies?.filter(
        (rate: any) => rate.from_currency_id === resellerCurrencyPreferenceId?.toString()
    ) || [];

    // Final Amount Calculation
    useEffect(() => {
        if (formData.hawalaAmount && formData.currencyCodeId) {
            const selectedRate = filteredCurrencies.find(
                (rate: any) => rate.to_currency_id == formData.currencyCodeId
            );
            if (selectedRate) {
                const amount = parseFloat(formData.hawalaAmount);
                const rate = amount / parseFloat(selectedRate.amount);
                const final = selectedRate.sell_rate * rate;
                setFinalAmount(final);
                setExchangeRate(rate);
            }
        } else {
            setFinalAmount(0);
            setExchangeRate(0);
        }
    }, [formData.hawalaAmount, formData.currencyCodeId, filteredCurrencies]);

    // Auto-fill hawala number when nextNumber changes
    // Auto-fill hawala number when nextNumber changes
    useEffect(() => {
        if (nextNumber && confirmationDialog) {
            console.log('Auto-filling hawala number:', nextNumber);
            setHawalaNumberInput(nextNumber);
        }
    }, [nextNumber, confirmationDialog]);



    // Auto-fetch next hawala number when branch is selected in add dialog
    useEffect(() => {
        if (addHawalaDialog && formData.branchId) {
            const fetchBranchHawalaNumber = async () => {
                try {
                    setFetchingNextNumber(true);
                    await dispatch(_fetchHawalaNextNumber(formData.branchId, toast, t));
                } catch (error) {
                    console.error('Error fetching next hawala number for branch:', error);
                } finally {
                    setFetchingNextNumber(false);
                }
            };

            fetchBranchHawalaNumber();
        }
    }, [formData.branchId, addHawalaDialog, dispatch, t]);

    // Auto-fill custom hawala number when nextNumber changes and add dialog is open
    useEffect(() => {
        if (nextNumber && addHawalaDialog && formData.branchId) {
            console.log('Auto-filling custom hawala number in add dialog:', nextNumber);
            setFormData(prev => ({
                ...prev,
                customHawalaNumber: nextNumber
            }));
        }
    }, [nextNumber, addHawalaDialog, formData.branchId]);
    // Get unique to_currencies from filtered rates
    const availableToCurrencies = filteredCurrencies.reduce((acc: any, rate: any) => {
        if (!acc.some((currency: Currency) => currency.id === rate.to_currency.id)) {
            acc.push(rate.to_currency);
        }
        return acc;
    }, []);

    // Event Handlers
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Add this useEffect to handle auto-opening the dialog
    const searchParams = useSearchParams(); // Add this
    const router = useRouter()

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            // Small delay to ensure the page is fully loaded and Redux state is ready
            const timer = setTimeout(() => {
                openAddHawalaDialog();
                // Optional: Clean up the URL after opening the dialog
                router.replace('/pages/hawala');
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    const openAddHawalaDialog = () => {
        setAddHawalaDialog(true);
    };

    const closeAddHawalaDialog = () => {
        setAddHawalaDialog(false);
        setFormData({
            reseller: null,
            senderName: "",
            receiverName: "",
            receiverFatherName: "",
            receiverIdCardNumber: "",
            hawalaAmount: "",
            currencyCodeId: "",
            branchId: "",
            commissionPaidBy: "sender",
            customHawalaNumber: "",
            adminNote: ""
        });
        setSubmitted(false);
    };

    const handleAddHawalaSubmit = () => {
        setSubmitted(true);

        // Validation
        if (!formData.reseller || !formData.senderName || !formData.receiverName ||
            !formData.receiverFatherName || !formData.receiverIdCardNumber ||
            !formData.hawalaAmount || !formData.currencyCodeId || !formData.branchId) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        // Prepare data according to API requirement
        const hawalaData = {
            reseller_id: formData.reseller.id,
            hawala_branch_id: parseInt(formData.branchId),
            sender_name: formData.senderName,
            receiver_name: formData.receiverName,
            receiver_father_name: formData.receiverFatherName,
            receiver_id_card_number: formData.receiverIdCardNumber,
            hawala_amount: parseFloat(formData.hawalaAmount),
            hawala_amount_currency_id: parseInt(formData.currencyCodeId),
            commission_amount: 0, // You can calculate this if needed
            commission_paid_by_sender: formData.commissionPaidBy === "sender",
            commission_paid_by_receiver: formData.commissionPaidBy === "receiver",
            custom_hawala_number: formData.customHawalaNumber || undefined,
            admin_note: formData.adminNote || undefined
        };

        //console.log('Submitting Hawala Data:', hawalaData);

        // Dispatch action to add hawala
        dispatch(_addHawala(hawalaData, toast, t));

        // Close dialog and reset form
        setAddHawalaDialog(false);
        setFormData({
            reseller: null,
            senderName: "",
            receiverName: "",
            receiverFatherName: "",
            receiverIdCardNumber: "",
            hawalaAmount: "",
            currencyCodeId: "",
            branchId: "",
            commissionPaidBy: "sender",
            customHawalaNumber: "",
            adminNote: ""
        });
        setSubmitted(false);

        // Refresh the hawala list
        dispatch(_fetchHawalaList(1, searchTag));
    };

    const fetchNextHawalaNumber = async (branchId: number | string) => {
        console.log(branchId)
        if (!branchId) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('BRANCH_ID_REQUIRED'),
                life: 3000
            });
            return;
        }

        setFetchingNextNumber(true);
        try {
            await dispatch(_fetchHawalaNextNumber(branchId, toast, t));
        } catch (error) {
            console.error('Error fetching next hawala number:', error);
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('FAILED_TO_FETCH_NEXT_NUMBER'),
                life: 3000
            });
        } finally {
            setFetchingNextNumber(false);
        }
    };

    const confirmChangeStatus = (hawala: Hawala, newStatus: number) => {
        console.log(hawala)
        setSelectedHawalaForAction(hawala);
        setSelectedStatus(newStatus);

        if (newStatus === 1) { // Confirmed status
            setHawalaNumberInput('');
            if (hawala?.hawala_branch_id) {
                fetchNextHawalaNumber(hawala?.hawala_branch_id);
            }
            setConfirmationDialog(true);
        } else {
            setStatusChangeDialog(true);
        }
    };

    const changeOrderStatus = () => {
        if (!selectedHawalaForAction?.id || selectedStatus === null) {
            console.error('Hawala ID or status is undefined.');
            return;
        }

        dispatch(_changeHawalaStatus(selectedHawalaForAction.id as number, selectedStatus as number, '', toast, t));
        setStatusChangeDialog(false);
        setSelectedHawalaForAction(null);
    };

    const finalizeHawalaConfirmation = () => {
        if (!selectedHawalaForAction?.id || selectedStatus === null || !hawalaNumberInput.trim()) {
            console.error('Hawala ID, status, or hawala number is missing.');
            return;
        }

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

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(_fetchHawalaList(page, searchTag));
    };

    const viewHawala = (hawala: Hawala) => {
        setSelectedHawala(hawala);
        setViewHawalaDialog(true);
    };

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

    // Template Functions
    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button
                        label={t('ADD_HAWALA')}
                        icon="pi pi-plus"
                        severity="success"
                        className={["ar", "fa", "ps", "bn"].includes(i18n.language) ? "ml-2" : "mr-2"}
                        onClick={openAddHawalaDialog}
                    />
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

    // Column Templates (keep all your existing column templates as they are)
    const hawalaNumberBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Hawala Number</span>
                <span className="text-sm text-gray-700 font-medium">{rowData.hawala_number}</span>
            </>
        );
    };

    const hawalaCustomNumberBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Cusotm Number</span>
                <span className="text-sm text-gray-700 font-medium">{rowData.hawala_custom_number}</span>
            </>
        );
    };

    const senderNameBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Sender Name</span>
                <span className="text-sm text-gray-700">{rowData.sender_name}</span>
            </>
        );
    };

    const receiverNameBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Receiver Name</span>
                <span className="text-sm text-gray-700">{rowData.receiver_name}</span>
            </>
        );
    };

    const hawalaAmountBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Hawala Amount</span>
                <div className="flex flex-column">
                    <span className="text-sm font-semibold text-gray-800">{rowData.hawala_amount}</span>
                    <span className="text-xs text-gray-500">{rowData.hawala_amount_currency_code}</span>
                </div>
            </>
        );
    };

    const convertedAmountTakenResellerBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Converted Amount</span>
                <div className="flex flex-column">
                    <span className="text-sm font-semibold text-gray-800">{rowData.converted_amount_taken_from_reseller}</span>
                    <span className="text-xs text-gray-500">{rowData.reseller_prefered_currency_code}</span>
                </div>
            </>
        );
    };

    const commissionAmountBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Commission Amount</span>
                <span className="text-sm text-green-600 font-semibold">{rowData.commission_amount}</span>
            </>
        );
    };

    const adminNoteBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Admin Note</span>
                <span className="text-sm text-gray-600">{rowData.admin_note || '-'}</span>
            </>
        );
    };

    const resellerNameBodyTemplate = (rowData: Order) => {
        return (
            <>
                <span className="p-column-title">Reseller Name</span>
                <span className="text-sm text-gray-700">{rowData.reseller?.reseller_name}</span>
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

    const hawalaAmounCurrencyCodetBodyTemplate = (rowData: Hawala) => {
        return (
            <>
                <span className="p-column-title">Hawala Amount Currency Code</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{rowData.hawala_amount_currency_code}</span>
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
                month: 'short',
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
                <div className="flex flex-column">
                    <span className="text-sm text-gray-700">{formattedDate}</span>
                    <span className="text-xs text-gray-500">{formattedTime}</span>
                </div>
            </>
        );
    };

    const statusBodyTemplate = (rowData: Hawala) => {
        const status = rowData.status;

        let statusText = 'Unknown';
        let statusClass = '';

        if (status == 'pending') {
            statusText = t('ORDER.STATUS.PENDING');
            statusClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        } else if (status == 'confirmed') {
            statusText = t('ORDER.STATUS.CONFIRMED');
            statusClass = 'bg-green-100 text-green-800 border-green-200';
        } else if (status == 'rejected') {
            statusText = t('ORDER.STATUS.REJECTED');
            statusClass = 'bg-red-100 text-red-800 border-red-200';
        } else if (status == 'under_process') {
            statusText = t('ORDER.STATUS.UNDER_PROCESS');
            statusClass = 'bg-blue-100 text-blue-800 border-blue-200';
        } else if (status == 'cancelled') {
            statusText = t('ORDER.STATUS.CANCELLED');
            statusClass = 'bg-gray-100 text-gray-800 border-gray-200';
        }

        return (
            <>
                <span className="p-column-title">Status</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusClass}`}>
                    {statusText}
                </span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Hawala) => {
        const status = rowData.status;

        let items: any[] = [];

        if (status === 'pending' || status === 'under_process') {
            items = [
                {
                    label: t('ORDER.STATUS.CONFIRMED'),
                    icon: 'pi pi-check',
                    command: () => handleConfirmStatus(rowData, 1) // Use handleConfirmStatus instead of confirmChangeStatus
                },
                {
                    label: t('ORDER.STATUS.REJECTED'),
                    icon: 'pi pi-times',
                    command: () => confirmChangeStatus(rowData, 2)
                }
            ];
        } else if (status === 'rejected') {
            items = [
                {
                    label: t('ORDER.STATUS.CONFIRMED'),
                    icon: 'pi pi-check',
                    command: () => handleConfirmStatus(rowData, 1) // Use handleConfirmStatus here too
                }
            ];
        }

        if (items.length > 0) {
            return <SplitButton label="" icon="pi pi-cog" model={items} className="p-button-rounded" severity="info" dir="ltr" />;
        }

        if (status === 'confirmed') {
            return <SplitButton label="" icon="pi pi-cog" disabled className="p-button-rounded" severity="info" dir="ltr" />;
        }

        return null;
    };

    const handleConfirmStatus = async (rowData: Hawala, statusCode: number) => {
        try {
            console.log('Starting confirmation process for hawala:', rowData);

            // First, fetch the next hawala number
            if (rowData?.hawala_branch_id) {

                // Dispatch the action to fetch next number and wait for it to complete
                await dispatch(_fetchHawalaNextNumber(rowData?.hawala_branch_id, toast, t));

                // Wait a moment for the state to update
                setTimeout(() => {
                    console.log('Next number fetched:', nextNumber);
                    // Then show the confirmation dialog
                    setSelectedHawalaForAction(rowData);
                    setSelectedStatus(statusCode);
                    setConfirmationDialog(true);
                }, 500);

            } else {
                console.error('No branch ID found');
                toast.current?.show({
                    severity: 'error',
                    summary: t('ERROR'),
                    detail: t('BRANCH_ID_REQUIRED'),
                    life: 3000
                });
            }
        } catch (error) {
            console.error('Error in handleConfirmStatus:', error);
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('FAILED_TO_PROCESS_CONFIRMATION'),
                life: 3000
            });
        }
    };

    // Dialog Footers
    const companyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" text onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={() => { }} />
        </>
    );

    const deleteCompanyDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" text onClick={hideDeleteOrderDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={deleteOrder} />
        </>
    );

    return (
        <div className="grid crud-demo -m-5">
            <div className="col-12">
                <div className="card p-2">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />

                    <Toolbar
                        className="mb-4"
                        left={leftToolbarTemplate}
                        right={rightToolbarTemplate}
                    />

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
                        responsiveLayout="scroll"
                        paginator={false}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        currentPageReportTemplate={
                            isRTL()
                                ? `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                                : `${t('DATA_TABLE.TABLE.PAGINATOR.SHOWING')}`
                        }
                        rowClassName={() => 'cursor-pointer select-none'}
                        onRowClick={(e) => viewHawala(e.data as Hawala)}
                        selectionMode="single"
                    >
                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            body={actionBodyTemplate}
                            headerStyle={{ minWidth: '10rem' }}
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="hawala_number"
                            header={t('HAWALA.TABLE.COLUMN.HAWALA_NUMBER')}
                            body={hawalaNumberBodyTemplate}
                            sortable
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="hawala_number"
                            header={t('HAWALA.TABLE.COLUMN.HAWALA_CUSTOM_NUMBER')}
                            body={hawalaCustomNumberBodyTemplate}
                            sortable
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="sender_name"
                            header={t('HAWALA.TABLE.COLUMN.SENDER_NAME')}
                            body={senderNameBodyTemplate}
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="receiver_name"
                            header={t('HAWALA.TABLE.COLUMN.RECEIVER_NAME')}
                            body={receiverNameBodyTemplate}
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="hawala_amount"
                            header={t('HAWALA.TABLE.COLUMN.AMOUNT')}
                            body={hawalaAmountBodyTemplate}
                            sortable
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="hawala_amount_currency_code"
                            header={t('HAWALA.TABLE.COLUMN.CURRENCY')}
                            body={hawalaAmounCurrencyCodetBodyTemplate}
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="converted_amount_taken_from_reseller"
                            header={t('HAWALA.TABLE.COLUMN.CONVERTED_AMOUNT')}
                            body={convertedAmountTakenResellerBodyTemplate}
                            sortable
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="reseller_prefered_currency_code"
                            header={t('HAWALA.TABLE.COLUMN.RESELLER_CURRENCY')}
                            body={resellerPreferedCurrencyCodeBodyTemplate}
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="commission_amount"
                            header={t('HAWALA.TABLE.COLUMN.COMMISSION')}
                            body={commissionAmountBodyTemplate}
                            sortable
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="admin_note"
                            header={t('HAWALA.TABLE.COLUMN.ADMIN_NOTE')}
                            body={adminNoteBodyTemplate}
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field=""
                            header={t('HAWALA.TABLE.COLUMN.RESELLER_NAME')}
                            body={resellerNameBodyTemplate}
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="created_at"
                            header={t('ORDER.TABLE.COLUMN.ORDEREDDATE')}
                            body={createdAtBodyTemplate}
                        />

                        <Column
                            style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="status"
                            header={t('HAWALA.TABLE.COLUMN.STATUS')}
                            body={statusBodyTemplate}
                            sortable
                        />
                    </DataTable>

                    <Paginator
                        first={(pagination?.page - 1) * pagination?.items_per_page}
                        rows={pagination?.items_per_page}
                        totalRecords={pagination?.total}
                        onPageChange={onPageChange}
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

                    {/* Exchange Rates Modal */}
                    <Dialog
                        visible={showRatesModal}
                        style={{ width: '500px' }}
                        header={t("TODAYS_EXCHANGE_RATES")}
                        modal
                        onHide={() => setShowRatesModal(false)}
                    >
                        <div className="grid">
                            {hawala_currencies?.map((rate: any) => (
                                <div key={rate.id} className="col-12">
                                    <Card className="mb-2">
                                        <div className="flex justify-content-between align-items-center">
                                            <div>
                                                <span className="font-semibold">
                                                    {rate.amount} {rate.from_currency?.code}
                                                </span>
                                                <span className="mx-2">→</span>
                                                <span className="font-semibold">
                                                    {rate.to_currency?.code}
                                                </span>
                                            </div>
                                            <div className="flex gap-3">
                                                <span className="text-green-600 font-medium">
                                                    {t('BUYING')}: {rate.buy_rate}
                                                </span>
                                                <span className="text-red-500 font-medium">
                                                    {t('SELLING')}: {rate.sell_rate}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-content-end mt-3">
                            <Button
                                label={t("CLOSE")}
                                icon="pi pi-times"
                                onClick={() => setShowRatesModal(false)}
                            />
                        </div>
                    </Dialog>

                    {/* Delete Order Dialog */}
                    <Dialog
                        visible={deleteOrderDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM')}
                        modal
                        footer={deleteCompanyDialogFooter}
                        onHide={hideDeleteOrderDialog}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: '#e74c3c' }} />
                            {order && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{order.rechargeble_account}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    {/* Status Change Dialog */}
                    <Dialog
                        visible={statusChangeDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM')}
                        modal
                        footer={
                            <>
                                <Button
                                    label={t('CANCEL')}
                                    icon="pi pi-times"
                                    severity="secondary"
                                    onClick={() => setStatusChangeDialog(false)}
                                />
                                <Button
                                    label={t('CONFIRM')}
                                    icon="pi pi-check"
                                    severity="success"
                                    onClick={changeOrderStatus}
                                />
                            </>
                        }
                        onHide={() => setStatusChangeDialog(false)}
                    >
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem', color: '#f39c12' }} />
                            {selectedHawalaForAction && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_STATUS')} <b>#{selectedHawalaForAction.hawala_number}</b> to{' '}
                                    {selectedStatus === 2 ? t('ORDER.STATUS.REJECTED') : t('ORDER.STATUS.CONFIRMED')}?
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
                                    label={t('CANCEL')}
                                    icon="pi pi-times"
                                    severity="secondary"
                                    onClick={() => {
                                        setConfirmationDialog(false);
                                        setHawalaNumberInput('');
                                    }}
                                />
                                <Button
                                    label={t('CONFIRM')}
                                    icon="pi pi-check"
                                    severity="success"
                                    onClick={finalizeHawalaConfirmation}
                                    disabled={!hawalaNumberInput.trim() || fetchingNextNumber}
                                    loading={fetchingNextNumber}
                                />
                            </>
                        }
                        onHide={() => {
                            setConfirmationDialog(false);
                            setHawalaNumberInput('');
                        }}
                    >
                        <div className="field">
                            <label htmlFor="hawalaNumber" className="font-medium block mb-2">
                                {t('HAWALA_NUMBER')} *
                            </label>
                            <InputText
                                id="hawalaNumber"
                                value={hawalaNumberInput}
                                onChange={(e) => setHawalaNumberInput(e.target.value)}
                                placeholder={t('ENTER_HAWALA_NUMBER')}
                                className="w-full"
                                autoFocus
                            />
                        </div>
                        {selectedHawalaForAction && (
                            <div className="flex align-items-center mt-3">
                                <i className="pi pi-info-circle mr-3" style={{ fontSize: '1.5rem', color: '#3498db' }} />
                                <span className="text-sm">
                                    {t('CONFIRM_HAWALA_NUMBER_FOR')} <b>#{selectedHawalaForAction.hawala_number}</b>
                                </span>
                            </div>
                        )}
                    </Dialog>

                    {/* View Hawala Dialog */}
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
                                            {t('HAWALA_DETAILS')}
                                        </div>
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '0.25rem 1rem',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
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
                                    <div style={{ padding: '1rem 0.75rem' }}>
                                        {/* Hawala Number */}
                                        {!selectedHawala?.hawala_custom_number && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.HAWALA_NUMBER')}</span>
                                                <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala.hawala_number}</span>
                                            </div>
                                        )}

                                        {/* Hawala Custom Number */}
                                        {selectedHawala?.hawala_custom_number && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                                <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.HAWALA_NUMBER')}</span>
                                                <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala?.hawala_custom_number || '...'}</span>
                                            </div>
                                        )}

                                        {/* Sender Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.SENDER_NAME')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala.sender_name}</span>
                                        </div>

                                        {/* Receiver Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('HAWALA.TABLE.COLUMN.RECEIVER_NAME')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala.receiver_name}</span>
                                        </div>

                                        {/* Receiver fATHER */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('RECEIVER_FATHERS_NAME')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala?.receiver_father_name || '...'}</span>
                                        </div>

                                        {/* Receiver ID CARD NUMBER */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('RECEIVER_ID_CARD_NUMBER')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala?.receiver_id_card_number || '...'}</span>
                                        </div>

                                        {/* Hawala Amount */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('AMOUNT')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedHawala.hawala_amount} {selectedHawala.hawala_amount_currency_code}
                                            </span>
                                        </div>

                                        {/* Reseller Name */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('SERVICE_PROVIDER')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>{selectedHawala.reseller?.reseller_name || '-'}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('ORDER.TABLE.COLUMN.ORDEREDDATE')}</span>
                                            <span style={{ fontSize: '0.9rem', color: '#1f2937', fontWeight: '600' }}>
                                                {selectedHawala.created_at
                                                    ? new Date(selectedHawala.created_at).toLocaleString("en-GB", {
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

                                        {/* Admin Note */}
                                        {selectedHawala.admin_note && (
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.75rem',
                                                borderRadius: '6px',
                                                backgroundColor: '#f0f9ff',
                                                border: '1px solid #bae6fd'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: '600' }}>{t('HAWALA.TABLE.COLUMN.ADMIN_NOTE')}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#0369a1', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: '1rem' }}>
                                                        {selectedHawala.admin_note}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hawala branch */}
                                        {selectedHawala?.branch?.name && (
                                            <div className='bg-blue-100 p-2 mt-2 rounded-xl shadow-sm'>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('MENU.HAWALA_BRANCH')}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala?.branch?.name}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', borderBottom: '1px solid #f3f4f6' }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('ADDRESS')}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala?.branch?.address}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', paddingBottom: '1px', }}>
                                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>{t('PHONE_NUMBER')}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#1f2937', fontWeight: '700', letterSpacing: '1px' }}>{selectedHawala?.branch?.phone_number}</span>
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
                                            onClick={() => setViewHawalaDialog(false)}
                                            className="p-button-text p-button-sm"
                                            style={{ minWidth: '90px' }}
                                        />
                                        <Button
                                            label={t('DOWNLOAD')}
                                            icon="pi pi-download"
                                            onClick={downloadHawalaAsImage}
                                            className="p-button-success p-button-sm"
                                            style={{ minWidth: '90px' }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Dialog>

                    {/* Add Hawala Dialog */}
                    <Dialog
                        visible={addHawalaDialog}
                        style={{ width: '90vw', maxWidth: '1200px' }}
                        header={t("ADD_HAWALA_ORDER")}
                        modal
                        className="p-fluid"
                        footer={
                            <>
                                <Button
                                    label={t("CANCEL")}
                                    icon="pi pi-times"
                                    severity="danger"
                                    text
                                    onClick={closeAddHawalaDialog}
                                />
                                <Button
                                    label={t("SAVE")}
                                    icon="pi pi-check"
                                    severity="success"
                                    onClick={handleAddHawalaSubmit}
                                />
                            </>
                        }
                        onHide={closeAddHawalaDialog}
                    >
                        <div className="grid">
                            <div className="col-12">
                                <div className="flex justify-content-end mb-3">
                                    <Button
                                        icon="pi pi-info-circle"
                                        className="p-button-outlined p-button-sm"
                                        onClick={() => setShowRatesModal(true)}
                                        tooltip={t("TODAYS_RATE")}
                                        tooltipOptions={{ position: 'top' }}
                                    />
                                </div>

                                <div className="p-4 surface-50 border-round">
                                    <div className="grid formgrid p-fluid">
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="reseller" style={{ fontWeight: 'bold' }}>
                                                {t('PAYMENT.FORM.INPUT.RESELLER')} *
                                            </label>
                                            <Dropdown
                                                id="reseller"
                                                value={formData.reseller}
                                                options={resellers}
                                                onChange={(e) => {
                                                    setFormData((prev) => ({
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
                                                className={`w-full ${submitted && !formData.reseller ? 'p-invalid' : ''}`}
                                                panelClassName="min-w-[20rem]"
                                                onFilter={(e) => {
                                                    setResellerSearchTerm(e.filter);
                                                }}
                                            />
                                            {submitted && !formData.reseller && (
                                                <small className="p-invalid" style={{ color: 'red' }}>
                                                    {t('THIS_FIELD_IS_REQUIRED')}
                                                </small>
                                            )}
                                        </div>



                                        {/* Sender Information */}
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="senderName" className="font-medium block mb-2">
                                                {t("SENDER_NAME")} *
                                            </label>
                                            <InputText
                                                id="senderName"
                                                name="senderName"
                                                value={formData.senderName}
                                                onChange={handleInputChange}
                                                placeholder={t("SENDER_NAME")}
                                                required
                                                className={classNames({
                                                    'p-invalid': submitted && !formData.senderName
                                                })}
                                            />
                                            {submitted && !formData.senderName && (
                                                <small className="p-invalid" style={{ color: 'red' }}>
                                                    {t('THIS_FIELD_IS_REQUIRED')}
                                                </small>
                                            )}
                                        </div>

                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="receiverName" className="font-medium block mb-2">
                                                {t("RECEIVER_NAME")} *
                                            </label>
                                            <InputText
                                                id="receiverName"
                                                name="receiverName"
                                                value={formData.receiverName}
                                                onChange={handleInputChange}
                                                placeholder={t("RECEIVER_NAME")}
                                                required
                                                className={classNames({
                                                    'p-invalid': submitted && !formData.receiverName
                                                })}
                                            />
                                            {submitted && !formData.receiverName && (
                                                <small className="p-invalid" style={{ color: 'red' }}>
                                                    {t('THIS_FIELD_IS_REQUIRED')}
                                                </small>
                                            )}
                                        </div>

                                        {/* Receiver Details */}
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="receiverFatherName" className="font-medium block mb-2">
                                                {t("RECEIVER_FATHERS_NAME")} *
                                            </label>
                                            <InputText
                                                id="receiverFatherName"
                                                name="receiverFatherName"
                                                value={formData.receiverFatherName}
                                                onChange={handleInputChange}
                                                placeholder={t("RECEIVER_FATHERS_NAME")}
                                                required
                                                className={classNames({
                                                    'p-invalid': submitted && !formData.receiverFatherName
                                                })}
                                            />
                                            {submitted && !formData.receiverFatherName && (
                                                <small className="p-invalid" style={{ color: 'red' }}>
                                                    {t('THIS_FIELD_IS_REQUIRED')}
                                                </small>
                                            )}
                                        </div>

                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="receiverIdCardNumber" className="font-medium block mb-2">
                                                {t("RECEIVER_ID_CARD_NUMBER")} *
                                            </label>
                                            <InputText
                                                id="receiverIdCardNumber"
                                                name="receiverIdCardNumber"
                                                value={formData.receiverIdCardNumber}
                                                onChange={handleInputChange}
                                                placeholder={t("RECEIVER_ID_CARD_NUMBER")}
                                                required
                                                keyfilter="int"
                                                className={classNames({
                                                    'p-invalid': submitted && !formData.receiverIdCardNumber
                                                })}
                                            />
                                            {submitted && !formData.receiverIdCardNumber && (
                                                <small className="p-invalid" style={{ color: 'red' }}>
                                                    {t('THIS_FIELD_IS_REQUIRED')}
                                                </small>
                                            )}
                                        </div>

                                        {/* Amount and Currency */}
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="hawalaAmount" className="font-medium block mb-2">
                                                {t("HAWALA_AMOUNT")} *
                                            </label>
                                            <InputText
                                                id="hawalaAmount"
                                                name="hawalaAmount"
                                                value={formData.hawalaAmount}
                                                onChange={handleInputChange}
                                                placeholder={t("HAWALA_AMOUNT")}
                                                required
                                                keyfilter="money"
                                                className={classNames({
                                                    'p-invalid': submitted && !formData.hawalaAmount
                                                })}
                                            />
                                            {submitted && !formData.hawalaAmount && (
                                                <small className="p-invalid" style={{ color: 'red' }}>
                                                    {t('THIS_FIELD_IS_REQUIRED')}
                                                </small>
                                            )}
                                        </div>

                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="currencyCodeId" className="font-medium block mb-2">
                                                {t("DESTINATION_CURRENCY")} *
                                            </label>
                                            <Dropdown
                                                id="currencyCodeId"
                                                name="currencyCodeId"
                                                value={formData.currencyCodeId}
                                                onChange={handleInputChange}
                                                options={availableToCurrencies}
                                                optionLabel="name"
                                                optionValue="id"
                                                placeholder={t("SELECT_CURRENCY")}
                                                className={classNames('w-full', {
                                                    'p-invalid': submitted && !formData.currencyCodeId
                                                })}
                                            />
                                            {submitted && !formData.currencyCodeId && (
                                                <small className="p-invalid" style={{ color: 'red' }}>
                                                    {t('THIS_FIELD_IS_REQUIRED')}
                                                </small>
                                            )}
                                        </div>

                                        {/* COMMISSION PAID BY */}
                                        <div className="field col-12 md:col-6">
                                            <label className="font-medium block mb-2">
                                                {t("COMMISSION_PAID_BY")} *
                                            </label>
                                            <div className="flex gap-3">
                                                <div className="field-checkbox">
                                                    <input
                                                        type="radio"
                                                        id="commissionSender"
                                                        name="commissionPaidBy"
                                                        value="sender"
                                                        checked={formData.commissionPaidBy === "sender"}
                                                        onChange={handleInputChange}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor="commissionSender">{t("SENDER")}</label>
                                                </div>
                                                <div className="field-checkbox">
                                                    <input
                                                        type="radio"
                                                        id="commissionReceiver"
                                                        name="commissionPaidBy"
                                                        value="receiver"
                                                        checked={formData.commissionPaidBy === "receiver"}
                                                        onChange={handleInputChange}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor="commissionReceiver">{t("RECEIVER")}</label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Conversion Details */}
                                        <div className="col-12 mb-4">
                                            <Card className="bg-blue-50 border-1 border-blue-200">
                                                <div className="grid">
                                                    <div className="col-12 md:col-4 text-center">
                                                        <div className="text-sm text-blue-600 font-medium">{t("EXCHANGE_RATE")}</div>
                                                        <div className="text-lg font-bold text-blue-800">
                                                            {exchangeRate > 0 ? `1 ${resellerCurrencyPreferenceCode} = ${exchangeRate.toFixed(4)}` : t("N/A")}
                                                        </div>
                                                    </div>
                                                    <div className="col-12 md:col-4 text-center">
                                                        <div className="text-sm text-blue-600 font-medium">{t("FINAL_AMOUNT")}</div>
                                                        <div className="text-lg font-bold text-blue-800">
                                                            {finalAmount > 0 ? `${finalAmount.toFixed(2)} ${resellerCurrencyPreferenceCode}` : t("N/A")}
                                                        </div>
                                                    </div>
                                                    <div className="col-12 md:col-4 text-center">
                                                        <div className="text-sm text-blue-600 font-medium">{t("SOURCE_CURRENCY")}</div>
                                                        <div className="text-lg font-bold text-blue-800">{resellerCurrencyPreferenceCode}</div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>

                                        {/* Branch and Commission */}
                                        {/* Branch and Commission */}
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="branchId" className="font-medium block mb-2">
                                                {t("HAWALA_BRANCH")} *
                                                {fetchingNextNumber && formData.branchId && (
                                                    <i className="pi pi-spin pi-spinner ml-2" style={{ fontSize: '1rem' }} />
                                                )}
                                            </label>
                                            <Dropdown
                                                id="branchId"
                                                name="branchId"
                                                value={formData.branchId}
                                                onChange={(e) => {
                                                    handleInputChange(e);
                                                    // Reset custom hawala number when branch changes
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        customHawalaNumber: ""
                                                    }));
                                                }}
                                                options={hawalaBranches}
                                                optionLabel="name"
                                                optionValue="id"
                                                placeholder={t("SELECT_BRANCH")}
                                                className={classNames('w-full mb-2', {
                                                    'p-invalid': submitted && !formData.branchId
                                                })}
                                            />
                                            {submitted && !formData.branchId && (
                                                <small className="p-invalid" style={{ color: 'red' }}>
                                                    {t('THIS_FIELD_IS_REQUIRED')}
                                                </small>
                                            )}
                                            {formData.branchId && (
                                                <small className="text-blue-600">
                                                    {fetchingNextNumber ? t('FETCHING_HAWALA_NUMBER') : t('HAWALA_NUMBER_AUTO_GENERATED')}
                                                </small>
                                            )}
                                        </div>

                                        {/* Custom Hawala Number */}
                                        {/* Custom Hawala Number */}
                                        <div className="field col-12 md:col-6">
                                            <label htmlFor="customHawalaNumber" className="font-medium block mb-2">
                                                {t("CUSTOM_HAWALA_NUMBER")}
                                                {fetchingNextNumber && (
                                                    <i className="pi pi-spin pi-spinner ml-2" style={{ fontSize: '1rem' }} />
                                                )}
                                            </label>
                                            <div className="p-inputgroup mb-2">
                                                <InputText
                                                    id="customHawalaNumber"
                                                    name="customHawalaNumber"
                                                    value={formData.customHawalaNumber}
                                                    onChange={handleInputChange}
                                                    placeholder={fetchingNextNumber ? t('GENERATING_HAWALA_NUMBER') : t("CUSTOM_HAWALA_NUMBER")}
                                                    className={classNames({
                                                        'bg-blue-50 border-blue-200': !!formData.customHawalaNumber && !!formData.branchId
                                                    })}
                                                />
                                                {formData.customHawalaNumber && formData.branchId && (
                                                    <Button
                                                        icon="pi pi-refresh"
                                                        className="p-button-outlined p-button-secondary"
                                                        tooltip={t('REGENERATE_NUMBER')}
                                                        tooltipOptions={{ position: 'top' }}
                                                        onClick={() => {
                                                            // Manually refetch the next number
                                                            if (formData.branchId) {
                                                                fetchNextHawalaNumber(formData.branchId);
                                                            }
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            {formData.customHawalaNumber && formData.branchId && (
                                                <small className="text-green-600">
                                                    <i className="pi pi-check-circle mr-1"></i>
                                                    {t('HAWALA_NUMBER_AUTO_GENERATED')}
                                                </small>
                                            )}
                                        </div>



                                        {/* Admin Note */}
                                        <div className="field col-12">
                                            <label htmlFor="adminNote" className="font-medium block mb-2">
                                                {t("ADMIN_NOTE")}
                                            </label>
                                            <InputTextarea
                                                id="adminNote"
                                                name="adminNote"
                                                value={formData.adminNote}
                                                onChange={handleInputChange}
                                                placeholder={t("ADMIN_NOTE_PLACEHOLDER")}
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(HawalaPage);