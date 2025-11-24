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
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { _fetchCountries } from '@/app/redux/actions/countriesActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';
import { AppDispatch } from '@/app/redux/store';
import { Country, Currency, District, Province, Reseller, ResellerGroup } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addReseller, _changeResellerStatus, _deleteReseller, _editReseller, _fetchResellers, _getResellerById } from '@/app/redux/actions/resellerActions';
import { FileUpload } from 'primereact/fileupload';
import { Password } from 'primereact/password';
import { _fetchDistricts } from '@/app/redux/actions/districtActions';
import { _fetchProvinces } from '@/app/redux/actions/provinceActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { resellerGroupReducer } from '@/app/redux/reducers/resellerGroupReducer';
import { _fetchResellerGroups } from '@/app/redux/actions/resellerGroupActions';
import { InputSwitch } from 'primereact/inputswitch';
import { SplitButton } from 'primereact/splitbutton';
import { useRouter, useSearchParams } from 'next/navigation';
import { Paginator } from 'primereact/paginator';
import { customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { generateSubResellerExcelFile } from '../../utilities/generateExcel';

const ResellerPage = () => {
    const emptyReseller: Reseller = {
        id: 0,
        user_id: 0,
        parent_id: null,
        uuid: '',
        reseller_name: '',
        contact_name: '',
        reseller_type: '',
        email_verified_at: null,
        account_password: '',
        personal_pin: '',
        remember_token: null,
        profile_image_url: '',
        email: '',
        phone: '',
        country_id: 0,
        province_id: 0,
        districts_id: 0,
        is_reseller_verified: 0,
        status: 0,
        payment: '0.00000',
        balance: 0,
        loan_balance: '0.00000',
        total_payments_received: '0.00000',
        total_balance_sent: '0.00000',
        net_payment_balance: '0.00000',
        fcm_token: null,
        created_at: '',
        updated_at: '',
        deleted_at: null,
        user: null,
        code: null,
        country: '',
        province: '',
        district: '',
        reseller_group_id: 0,
        can_create_sub_resellers: 0,
        sub_reseller_limit: 0,
        sub_resellers_can_create_sub_resellers: 0,
        can_set_commission_group: false,
        can_set_selling_price_group: false,
        can_send_payment_request: false,
        can_ask_loan_balance: false,
        can_see_our_contact: false,
        can_see_parent_contact: false,
        can_send_hawala: false,
        max_loan_balance_request_amount: 0,
        min_loan_balance_request_amount: 0,
        reseller_identity_attachment: '',
        extra_optional_proof: ''
    };

    const [resellerDialog, setResellerDialog] = useState(false);
    const [deleteResellerDialog, setDeleteResellerDialog] = useState(false);
    const [deleteResellersDialog, setDeleteResellersDialog] = useState(false);
    const [statusResellerDialog, setStatusResellerDialog] = useState(false);
    const [reseller, setReseller] = useState<Reseller>(emptyReseller);
    const [selectedCompanies, setSelectedCompanies] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<any>>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { resellers, loading, pagination, singleReseller } = useSelector((state: any) => state.resellerReducer);
    const { countries } = useSelector((state: any) => state.countriesReducer);
    const { districts } = useSelector((state: any) => state.districtReducer);
    const { provinces } = useSelector((state: any) => state.provinceReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { reseller_groups } = useSelector((state: any) => state.resellerGroupReducer);
    const { t } = useTranslation();
    const router = useRouter();
    const [searchTag, setSearchTag] = useState('');
    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
    const [filters, setFilters] = useState({
        filter_status: null as string | null,
        filter_startdate: null as string | null,
        filter_enddate: null as string | null
    });
    const [activeFilters, setActiveFilters] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch(_fetchResellers(1, searchTag, activeFilters));
        dispatch(_fetchCountries());
        dispatch(_fetchDistricts());
        dispatch(_fetchProvinces());
        dispatch(_fetchCurrencies());
        dispatch(_fetchResellerGroups());
    }, [dispatch, searchTag, activeFilters]);

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

    useEffect(() => {
        //console.log(resellers)
    }, [dispatch, resellers]);

    // Add this useEffect to handle auto-opening the dialog
    const searchParams = useSearchParams(); // Add this

    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            // Small delay to ensure the page is fully loaded and Redux state is ready
            const timer = setTimeout(() => {
                openNew();
                // Optional: Clean up the URL after opening the dialog
                router.replace('/pages/reseller');
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);



    const openNew = () => {
        setReseller(emptyReseller);
        setSubmitted(false);
        setResellerDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setResellerDialog(false);
    };

    const hideDeleteResellerDialog = () => {
        setDeleteResellerDialog(false);
    };

    const hideStatusResellerDialog = () => {
        setStatusResellerDialog(false);
    };

    const hideDeleteResellersDialog = () => {
        setDeleteResellersDialog(false);
    };

    const saveReseller = () => {
        setSubmitted(true);
        //console.log(reseller);
        //return;
        if (
            !reseller.reseller_name ||
            !reseller.contact_name ||
            !reseller.email ||
            !reseller.phone ||
            !reseller.account_password ||
            !reseller.country_id ||
            !reseller.province_id ||
            !reseller.districts_id ||
            !reseller.code ||
            !reseller.sub_reseller_limit
        ) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        if (reseller.id && reseller.id !== 0) {
            dispatch(_editReseller(reseller.id, reseller, toast, t));
        } else {
            dispatch(_addReseller(reseller, toast, t));
        }

        setResellerDialog(false);
        setReseller(emptyReseller);
        setSubmitted(false);
    };

    const editReseller = (reseller: Reseller) => {
        const matchingProvince = provinces.find((r: any) => r.id == reseller.province_id);

        // Type-safe boolean conversion function
        const toBoolean = (value: boolean | string | number | undefined): boolean => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') return value === '1';
            if (typeof value === 'number') return value === 1;
            return false; // default for undefined
        };

        // Type-safe number conversion function (for 1/0 fields)
        const toBinaryNumber = (value: number | string | undefined): number => {
            if (typeof value === 'number') return value;
            if (typeof value === 'string') return value === '1' ? 1 : 0;
            return 0; // default for undefined
        };

        setReseller({
            ...reseller,
            country_id: parseInt(reseller.country_id?.toString() || '0'),
            province: matchingProvince,
            province_id: parseInt(reseller.province_id?.toString() || '0'),
            districts_id: parseInt(reseller.districts_id?.toString() || '0'),
            reseller_group_id: parseInt(reseller.reseller_group_id?.toString() || '0'),

            // Boolean fields
            can_set_commission_group: toBoolean(reseller.can_set_commission_group),
            can_set_selling_price_group: toBoolean(reseller.can_set_selling_price_group),
            can_send_payment_request: toBoolean(reseller.can_send_payment_request),
            can_ask_loan_balance: toBoolean(reseller.can_ask_loan_balance),
            can_see_our_contact: toBoolean(reseller.can_see_our_contact),
            can_see_parent_contact: toBoolean(reseller.can_see_parent_contact),
            can_send_hawala: toBoolean(reseller.can_send_hawala),

            // Number fields (1/0)
            can_create_sub_resellers: toBinaryNumber(reseller.can_create_sub_resellers),
            sub_resellers_can_create_sub_resellers: toBinaryNumber(reseller.sub_resellers_can_create_sub_resellers)
        });

        setResellerDialog(true);
    };

    const confirmDeleteReseller = (reseller: Reseller) => {
        setReseller(reseller);
        setDeleteResellerDialog(true);
    };

    const deleteReseller = () => {
        if (!reseller?.id) {
            console.error('Reseller ID is undefined.');
            return;
        }
        dispatch(_deleteReseller(reseller?.id, toast, t));
        setDeleteResellerDialog(false);
    };

    const confirmDeleteSelected = () => {
        setDeleteResellersDialog(true);
    };

    const confirmChangeStatus = (reseller: Reseller) => {
        setReseller(reseller);
        setStatusResellerDialog(true);
    };

    const changeResellerStatus = () => {
        if (!reseller?.id) {
            console.error('Reseller ID is undefined.');
            return;
        }
        dispatch(_changeResellerStatus(reseller?.id, reseller.status, toast, t));
        setStatusResellerDialog(false);
    };

    const viewResellerDetails = (resellerId: string | number) => {
        //dispatch(_getResellerById(reseller.id))
        router.push(`/pages/reseller/${resellerId}`);
    };

    useEffect(() => {
        //console.log(singleReseller)
    }, [dispatch, singleReseller]);

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-col sm:flex-row gap-2 w-full">
                {/* Search Input - Full width on mobile, auto on desktop */}
                <div className="flex-grow flex-1">
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-search" />
                        <InputText
                            type="search"
                            onInput={(e) => setSearchTag(e.currentTarget.value)}
                            placeholder={t('ECOMMERCE.COMMON.SEARCH')}
                            className="w-full"
                        />
                    </span>
                </div>

                {/* Export Button - Full width on mobile, auto on desktop */}
                <Button
                    label={window.innerWidth >= 640 ? t('EXPORT.EXPORT') : t('EXPORT.EXPORT')}

                    icon="pi pi-file-excel"
                    severity="success"
                    onClick={exportToExcel}
                    className="flex-1 w-full sm:w-auto"
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Filter Button with Dropdown */}
                <div className="flex-1 w-full sm:w-auto" ref={filterRef} style={{ position: 'relative' }}>
                    <Button
                        className={`p-button-info w-full sm:w-auto ${isRTL() ? 'rtl-button' : ''}`}
                        label={window.innerWidth >= 640 ? t('FILTER') : t('FILTER')}

                        icon="pi pi-filter"
                        onClick={() => setFilterDialogVisible(!filterDialogVisible)}
                    />
                    {filterDialogVisible && (
                        <div
                            className="p-card p-fluid"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: isRTL() ? 'auto' : 0,  // Changed this line
                                right: isRTL() ? 0 : 'auto', // Changed this line
                                width: '250px',
                                zIndex: 1000,
                                marginTop: '0.5rem',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            <div className="p-card-body" style={{ padding: '1rem' }}>
                                {/* Filter dialog content remains the same */}
                                <div className="grid">
                                    <div className="col-12">
                                        <label htmlFor="statusFilter" style={{ fontSize: '0.875rem' }}>
                                            {t('PAYMENT.TABLE.COLUMN.STATUS')}
                                        </label>
                                        <Dropdown
                                            id="statusFilter"
                                            options={[
                                                { label: t('TABLE.GENERAL.ACTIVATE'), value: '1' },
                                                { label: t('TABLE.GENERAL.DEACTIVATE'), value: '0' }
                                            ]}
                                            value={filters.filter_status}
                                            onChange={(e) => setFilters({ ...filters, filter_status: e.value })}
                                            placeholder={t('SELECT_STATUS')}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
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
                                    <div className="col-12 mt-3 flex justify-content-between gap-2">
                                        <Button
                                            label={t('RESET')}
                                            icon="pi pi-times"
                                            className="p-button-secondary p-button-sm"
                                            onClick={() => {
                                                setFilters({
                                                    filter_status: null,
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

                {/* Create Reseller Button */}
                <Button
                    className={`flex-1 w-full sm:w-auto ${isRTL() ? 'rtl-button' : ''}`}
                    label={window.innerWidth >= 640 ? t('ADD') : t('ADD')}

                    icon="pi pi-plus"
                    severity="success"
                    onClick={openNew}
                />
            </div>
        );
    };

    const nameBodyTemplate = (rowData: Reseller) => {
        return (
            <>
                <span className="p-column-title">Name</span>
                <div className="" style={{ display: 'flex', textAlign: 'center', alignItems: 'center', gap: '10px' }}>
                    <img
                        src={`${rowData.profile_image_url}`}
                        alt={rowData.reseller_name}
                        className="shadow-2"
                        style={{
                            padding: '2px',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%', // Makes the image circular
                            objectFit: 'cover' // Ensures the image is cropped correctly within the circle
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'start' }}>
                        <span style={{ fontWeight: 'bold' }}>{rowData.email}</span>
                        {rowData.reseller_name}
                    </div>
                </div>
            </>
        );
    };

    const parentNameBodyTemplate = (rowData: Reseller) => {
        if (!rowData.parent_reseller_name && !rowData.parent_reseller_profile_image_url) {
            return null; // or return <></> if you prefer
        }

        return (
            <>
                <span className="p-column-title">Name</span>
                <div
                    style={{
                        display: 'flex',
                        textAlign: 'center',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    <img
                        src={`${rowData.parent_reseller_profile_image_url}`}
                        alt={rowData.parent_reseller_name || ''}
                        className="shadow-2"
                        style={{
                            padding: '2px',
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            objectFit: 'cover'
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            textAlign: 'start'
                        }}
                    >
                        <span style={{ fontWeight: 'bold' }}>{rowData.parent_reseller_name}</span>
                    </div>
                </div>
            </>
        );
    };

    const phoneBodyTemplate = (rowData: Reseller) => {
        return (
            <>
                <span className="p-column-title">Phone</span>
                {rowData.phone}
            </>
        );
    };

    const balanceBodyTemplate = (rowData: Reseller) => {
        return (
            <>
                <span className="p-column-title">Balance</span>
                <span style={{ color: 'green' }}>{rowData.balance}</span>
            </>
        );
    };

    const totalPaymentBodyTemplate = (rowData: Reseller) => {
        return (
            <>
                <span className="p-column-title">Total Payment</span>
                {rowData.total_payments_received}
            </>
        );
    };

    const totalBalanceSentBodyTemplate = (rowData: Reseller) => {
        return (
            <>
                <span className="p-column-title">Total Balance Sent</span>
                {rowData.total_balance_sent}
            </>
        );
    };

    const totalEarningBalanceBodyTemplate = (rowData: Reseller) => {
        return (
            <>
                <span className="p-column-title">Total Earning Balance</span>
                {rowData.total_earning_balance}
            </>
        );
    };

    const availablePaymentBodyTemplate = (rowData: Reseller) => {
        const totalPayments = Number(rowData?.total_payments_received) || 0;
        const totalBalance = Number(rowData?.total_balance_sent) || 0;
        const availablePaymentAmount = totalPayments - totalBalance;

        return (
            <>
                <span className="p-column-title">Available Payment</span>
                {availablePaymentAmount > 0 ? availablePaymentAmount : 0}
            </>
        );
    };

    const loanAmountBodyTemplate = (rowData: Reseller) => {
        const total_payments_received = Number(rowData.total_payments_received);
        const total_balance_sent = Number(rowData.total_balance_sent);
        const loanAmount = total_balance_sent - total_payments_received;
        return (
            <>
                <span className="p-column-title">Loan Amount</span>
                <span style={{ color: 'red' }}>{loanAmount}</span>
            </>
        );
    };

    const preferredCurrencyBodyTemplate = (rowData: Reseller) => {
        const currency = typeof rowData.code === 'object' && rowData.code !== null ? rowData.code.code : rowData.code;

        return (
            <>
                <span className="p-column-title">Preferred Currency</span>
                {currency || '-'}
            </>
        );
    };

    const countryBodyTemplate = (rowData: Reseller) => {
        return (
            <>
                <span className="p-column-title">Country</span>
                {rowData.country}
            </>
        );
    };

    const statusBodyTemplate = (rowData: Reseller) => {
        // Define the text and background color based on the status value
        const getStatusText = (status: string) => {
            return status == '1' ? 'Active' : 'Deactivated';
        };

        const getStatusClasses = (status: number) => {
            return status == 1 ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
        };

        return (
            <>
                <span className="p-column-title">Status</span>
                <span style={{ borderRadius: '5px' }} className={`inline-block px-2 py-1 rounded text-sm font-semibold ${getStatusClasses(rowData.status)}`}>
                    {getStatusText(rowData.status.toString())}
                </span>
            </>
        );
    };

    const actionBodyTemplate = (rowData: Reseller) => {
        // Define the dropdown actions
        const items = [
            {
                label: t('TABLE.GENERAL.EDIT'),
                icon: 'pi pi-pencil',
                command: () => editReseller(rowData)
                //disabled: menuType === 'guest', // Example condition
            },
            {
                label: t('TABLE.GENERAL.DELETE'),
                icon: 'pi pi-trash',
                command: () => confirmDeleteReseller(rowData)
                //disabled: menuType !== 'admin', // Example condition
            },
            {
                label: t('ACTIVATE'),
                icon: 'pi pi-check',
                command: () => confirmChangeStatus(rowData),
                visible: rowData.status == 0 // Disable if already active
            },
            {
                label: t('DEACTIVATE'),
                icon: 'pi pi-times',
                command: () => confirmChangeStatus(rowData),
                visible: rowData.status == 1 // Disable if already inactive
            },
            {
                label: t('VIEW_DETAILS'),
                icon: 'pi pi-info-circle',
                command: () => viewResellerDetails(rowData.id)
            }
        ];

        return (
            <SplitButton
                style={{ fontSize: '8px' }}
                label=""
                icon="pi pi-cog"
                model={items}
                className="p-button-rounded"
                severity="info" // Optional: change severity or style
                dir="ltr"
            />
        );
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

    const resellerDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveReseller} />
        </>
    );
    const deleteResellerDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteResellerDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={deleteReseller} />
        </>
    );

    const statusResellerDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideStatusResellerDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={changeResellerStatus} />
        </>
    );
    const deleteResellersDialogFooter = (
        <>
            <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDeleteResellersDialog} />
            <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} />
        </>
    );

    const onPageChange = (event: any) => {
        const page = event.page + 1;
        dispatch(_fetchResellers(page, searchTag, activeFilters));
    };

    useEffect(() => {
        if (resellerDialog) {
            const selectedCode = currencies.find((currency: Currency) => currency.code == reseller?.code);

            if (selectedCode) {
                setReseller((prev) => ({
                    ...prev,
                    code: selectedCode // Update with the selected company object
                }));
            }
        }
    }, [reseller.code, currencies, resellerDialog]);

    const [filteredProvinces, setFilteredProvinces] = useState<Province[]>([]);

    useEffect(() => {
        if (reseller?.country_id && provinces.length > 0) {
            const filtered = provinces.filter((province: Province) => province.country_id == reseller.country_id);
            setFilteredProvinces(filtered);
        } else {
            setFilteredProvinces([]); // Optional: Clear when no country selected
        }
    }, [reseller?.country_id, provinces]);

    const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);

    useEffect(() => {
        if (reseller?.province_id && districts.length > 0) {
            const filtered = districts.filter((district: District) => district.province_id == reseller.province_id);
            setFilteredDistricts(filtered);
        } else {
            setFilteredDistricts([]); // Optional: Clear when no country selected
        }
    }, [reseller?.province_id, districts]);



    const handleSubmitFilter = (filters: any) => {
        const cleanedFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== null && value !== ''));
        setActiveFilters(cleanedFilters);
    };

    const exportToExcel = async () => {
        await generateSubResellerExcelFile({
            t,
            toast,
            all: true
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
                        value={resellers}
                        selection={selectedCompanies}
                        onRowClick={(e) => viewResellerDetails(e.data.id)}
                        dataKey="id"
                        paginator={false} // Disable PrimeReact's built-in paginator
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
                        globalFilter={globalFilter}
                        emptyMessage={t('DATA_TABLE.TABLE.NO_DATA')}
                        dir={isRTL() ? 'rtl' : 'ltr'}
                        style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
                        // header={header}

                        responsiveLayout="scroll"
                    >
                        {/* <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column> */}
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} body={actionBodyTemplate} headerStyle={{ width: '5rem' }}></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="name"
                            header={t('RESELLER.TABLE.COLUMN.RESELLERNAME')}

                            body={nameBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="phone" header={t('RESELLER.TABLE.COLUMN.PHONE')} body={phoneBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="total_earning_balance"
                            header={t('TOTAL_EARNING_BALANCE')}
                            body={totalEarningBalanceBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap' }}
                        ></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="balance" header={t('MENU.BALANCE')} body={balanceBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="available_payment"
                            header={t('RESELLER.TABLE.COLUMN.AVAILABLEPAYMENT')}
                            body={availablePaymentBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap' }}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="total_payment"
                            header={t('RESELLER.TABLE.COLUMN.PAYMENT')}
                            body={totalPaymentBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap' }}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="total_balance"
                            header={t('RESELLER.TABLE.COLUMN.TOTAL_BALANCE')}
                            body={totalBalanceSentBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap' }}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="loan_amount"
                            header={t('RESELLER.TABLE.COLUMN.LOANAMOUNT')}
                            body={loanAmountBodyTemplate}
                            headerStyle={{ whiteSpace: 'nowrap' }}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="preferred_currency"
                            header={t('MENU.CURRENCY')}
                            body={preferredCurrencyBodyTemplate}

                        ></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="name" header={t('PARENT_RESELLER_NAME')} body={parentNameBodyTemplate} headerStyle={{ whiteSpace: 'nowrap' }}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="country" header={t('RESELLER.TABLE.COLUMN.COUNTRY')} body={countryBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="status" header={t('BUNDLE.TABLE.FILTER.STATUS')} body={statusBodyTemplate}></Column>
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

                    <Dialog
                        visible={resellerDialog}
                        style={{
                            width: '95vw', // Responsive width
                            maxWidth: '900px' // Max desktop size
                        }}
                        header={t('RESELLER.DETAILS')}
                        modal
                        className="p-fluid"
                        footer={resellerDialogFooter}
                        onHide={hideDialog}
                    >
                        <div className="card" style={{ padding: '5px' }}>
                            {reseller.profile_image_url && (
                                <img
                                    src={
                                        reseller.profile_image_url instanceof File
                                            ? URL.createObjectURL(reseller.profile_image_url) // Temporary preview for file
                                            : reseller.profile_image_url // Direct URL for existing logo
                                    }
                                    alt="Uploaded Preview"
                                    width="150"
                                    className="mt-0 mx-auto mb-5 block shadow-2"
                                />
                            )}
                            <FileUpload
                                mode="basic"
                                name="company_logo"
                                accept="image/*"
                                customUpload
                                onSelect={(e) =>
                                    setReseller((prev: Reseller) => ({
                                        ...prev,
                                        profile_image_url: e.files[0]
                                    }))
                                }
                                style={{ textAlign: 'center', marginBottom: '10px' }}
                            />
                            <div className="formgrid grid">
                                <div className="field col">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.INPUT.RESELLERNAME')}
                                    </label>
                                    <InputText
                                        id="reseller_name"
                                        value={reseller?.reseller_name}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                reseller_name: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('RESELLER.FORM.PLACEHOLDER.RESELLERNAME')}
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                        className={classNames({
                                            'p-invalid': submitted && !reseller.reseller_name
                                        })}
                                    />
                                    {submitted && !reseller.reseller_name && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.INPUT.CONTACTNAME')}
                                    </label>
                                    <InputText
                                        id="contact_name"
                                        value={reseller.contact_name || ''}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                contact_name: e.target.value
                                            }))
                                        }
                                        placeholder={t('RESELLER.FORM.PLACEHOLDER.CONTACTNAME')}
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                        className={classNames({
                                            'p-invalid': submitted && !reseller.contact_name
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.INPUT.EMAIL')}
                                    </label>
                                    <InputText
                                        id="email"
                                        value={reseller?.email}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                email: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('RESELLER.FORM.PLACEHOLDER.EMAIL')}
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                        className={classNames({
                                            'p-invalid': submitted && !reseller.email
                                        })}
                                    />
                                    {submitted && !reseller.email && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>

                                <div className="field col">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.INPUT.PHONE')}
                                    </label>
                                    <InputText
                                        id="phone"
                                        value={reseller.phone || ''}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                phone: e.target.value
                                            }))
                                        }
                                        placeholder={t('RESELLER.FORM.PLACEHOLDER.PHONE')}
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                        className={classNames({
                                            'p-invalid': submitted && !reseller.phone
                                        })}
                                    />
                                    {submitted && !reseller.phone && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col-6 md:col-6">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.INPUT.COUNTRY')}
                                    </label>
                                    <Dropdown
                                        id="country_id"
                                        value={reseller.country_id}
                                        options={countries}
                                        onChange={(e: DropdownChangeEvent) => {
                                            const selectedCountry = countries.find((country: Country) => country.id === e.value);

                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                country_id: e.value,
                                                country: selectedCountry?.country_name || ''
                                            }));
                                        }}
                                        optionLabel="country_name"
                                        optionValue="id"
                                        placeholder="Choose a country"
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                    />

                                    {submitted && !reseller.country_id && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field col-6 md:col-6">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.INPUT.PROVINCE')}
                                    </label>
                                    <Dropdown
                                        id="province_id"
                                        value={reseller.province_id}
                                        options={provinces}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                province_id: e.value
                                            }))
                                        }
                                        filter
                                        filterBy="province_name"
                                        optionLabel="province_name"
                                        filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                                        optionValue="id"
                                        placeholder="Choose a province"
                                        style={{
                                            fontSize: '0.8rem',
                                            padding: '0.4rem 0.6rem', // Horizontal padding for better text display
                                            height: '40px',
                                            lineHeight: '1.5', // Ensures text is vertically centered
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    />
                                    {submitted && !reseller.province_id && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="formgrid grid ">
                                <div className="field col-6 md:col-6">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.INPUT.DISTRICT')}
                                    </label>
                                    <Dropdown
                                        id="districts_id"
                                        value={reseller.districts_id}
                                        options={districts}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                districts_id: e.value
                                            }))
                                        }
                                        filter
                                        filterBy="district_name"
                                        optionLabel="district_name"
                                        filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                                        optionValue="id"
                                        placeholder="Choose a district"
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                    />
                                    {submitted && !reseller.districts_id && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field col-6 md:col-6">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.INPUT.CURRENCYPREFERENCE')}
                                    </label>
                                    <Dropdown
                                        id="code"
                                        value={reseller.code}
                                        options={currencies}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                code: e.value
                                            }))
                                        }
                                        optionLabel="code"
                                        placeholder={t('RESELLER.FORM.PLACEHOLDER.CURRENCY')}
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                        disabled={!!reseller.id && reseller.id !== 0}
                                    />
                                    {submitted && !reseller.code && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col-6 md:col-6">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.LABEL.RESELLERGROUP')}
                                    </label>
                                    <Dropdown
                                        id="reseller_group_id"
                                        value={reseller.reseller_group_id}
                                        options={reseller_groups}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                reseller_group_id: e.value
                                            }))
                                        }
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder="Choose a group"
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                        className="w-full"
                                    />
                                    {/* {submitted && !reseller.reseller_group_id && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )} */}
                                </div>
                                <div className="field col-6 md:col-6">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.LABEL.SUBRESELLERLIMIT')}
                                    </label>
                                    <InputText
                                        id="sub_reseller_limit"
                                        value={reseller.sub_reseller_limit.toString()}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                sub_reseller_limit: e.target.value
                                            }))
                                        }
                                        placeholder="Sub Reseller limit"
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                        className={classNames({
                                            'p-invalid': submitted && !reseller.phone
                                        })}
                                    />
                                    {submitted && !reseller.sub_reseller_limit && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            {reseller.id === 0 && (
                                <div className="formgrid grid">
                                    <div className="field col-6 md:col-12">
                                        <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="password">
                                            Password
                                        </label>
                                        <Password
                                            id="account_password"
                                            value={reseller?.account_password}
                                            onChange={(e) =>
                                                setReseller((prev: Reseller) => ({
                                                    ...prev,
                                                    account_password: e.target.value
                                                }))
                                            }
                                            required
                                            autoFocus
                                            className={classNames({
                                                'p-invalid': submitted && !reseller.account_password
                                            })}
                                        />
                                        {submitted && !reseller.account_password && (
                                            <small className="p-invalid" style={{ color: 'red' }}>
                                                {t('THIS_FIELD_IS_REQUIRED')}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="formgrid grid">
                                <div className="field col">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.PLACEHOLDER.MAX_LOAN_BALANCE_REQUEST_AMOUNT')}
                                    </label>
                                    <InputText
                                        id="max_loan_balance_request_amount"
                                        value={reseller?.max_loan_balance_request_amount?.toString()}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                max_loan_balance_request_amount: e.target.value
                                            }))
                                        }
                                        required
                                        autoFocus
                                        placeholder={t('RESELLER.FORM.PLACEHOLDER.MAX_LOAN_BALANCE_REQUEST_AMOUNT')}
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                        className={classNames({
                                            'p-invalid': submitted && !reseller.max_loan_balance_request_amount
                                        })}
                                    />
                                </div>

                                <div className="field col">
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem' }} htmlFor="name">
                                        {t('RESELLER.FORM.PLACEHOLDER.MIN_LOAN_BALANCE_REQUEST_AMOUNT')}
                                    </label>
                                    <InputText
                                        id="min_loan_balance_request_amount"
                                        value={reseller.min_loan_balance_request_amount?.toString()}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                min_loan_balance_request_amount: e.target.value
                                            }))
                                        }
                                        placeholder={t('RESELLER.FORM.PLACEHOLDER.MIN_LOAN_BALANCE_REQUEST_AMOUNT')}
                                        style={{ fontSize: '0.8rem', height: '40px' }}
                                        className={classNames({
                                            'p-invalid': submitted && !reseller.min_loan_balance_request_amount
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6 flex align-items-center gap-2">
                                    <InputSwitch
                                        id="can_create_sub_resellers"
                                        checked={reseller.can_create_sub_resellers === 1} // Replace logic as needed
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                can_create_sub_resellers: e.value ? 1 : 0 // Adjust values based on your requirements
                                            }))
                                        }
                                        className="w-small"
                                        style={{
                                            transform: 'scale(0.8)', // Scales down the switch
                                            marginLeft: '-4px' // Adjust alignment if needed
                                        }}
                                    />
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '5px' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.CANCREATESUBRESELLER')}
                                    </label>
                                </div>

                                <div className="field col-12 md:col-6 flex align-items-center gap-2">
                                    <InputSwitch
                                        id="sub_resellers_can_create_sub_resellers"
                                        checked={reseller.sub_resellers_can_create_sub_resellers === 1} // Replace logic as needed
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                sub_resellers_can_create_sub_resellers: e.value ? 1 : 0 // Adjust values based on your requirements
                                            }))
                                        }
                                        className="w-small"
                                        style={{
                                            transform: 'scale(0.8)', // Scales down the switch
                                            marginLeft: '-4px' // Adjust alignment if needed
                                        }}
                                    />
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '5px' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.SUBRESELLERCANCREATESUBRESELLER')}
                                    </label>
                                </div>
                            </div>

                            {/* new fields */}
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6 flex align-items-center gap-2">
                                    <InputSwitch
                                        id="can_set_commission_group"
                                        checked={reseller.can_set_commission_group === true} // Replace logic as needed
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                can_set_commission_group: e.value ? true : false // Adjust values based on your requirements
                                            }))
                                        }
                                        className="w-small"
                                        style={{
                                            transform: 'scale(0.8)', // Scales down the switch
                                            marginLeft: '-4px' // Adjust alignment if needed
                                        }}
                                    />
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '5px' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.CAN_SET_COMMISSION_GROUP')}
                                    </label>
                                </div>

                                <div className="field col-12 md:col-6 flex align-items-center gap-2">
                                    <InputSwitch
                                        id="can_set_selling_price_group"
                                        checked={reseller.can_set_selling_price_group === true} // Replace logic as needed
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                can_set_selling_price_group: e.value ? true : false // Adjust values based on your requirements
                                            }))
                                        }
                                        className="w-small"
                                        style={{
                                            transform: 'scale(0.8)', // Scales down the switch
                                            marginLeft: '-4px' // Adjust alignment if needed
                                        }}
                                    />
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '5px' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.CAN_SET_SELLING_PRICE_GROUP')}
                                    </label>
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6 flex align-items-center gap-2">
                                    <InputSwitch
                                        id="can_send_payment_request"
                                        checked={reseller.can_send_payment_request === true} // Replace logic as needed
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                can_send_payment_request: e.value ? true : false // Adjust values based on your requirements
                                            }))
                                        }
                                        className="w-small"
                                        style={{
                                            transform: 'scale(0.8)', // Scales down the switch
                                            marginLeft: '-4px' // Adjust alignment if needed
                                        }}
                                    />
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '5px' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.CAN_SEND_PAYMENT_REQUEST')}
                                    </label>
                                </div>

                                <div className="field col-12 md:col-6 flex align-items-center gap-2">
                                    <InputSwitch
                                        id="can_ask_loan_balance"
                                        checked={reseller.can_ask_loan_balance === true} // Replace logic as needed
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                can_ask_loan_balance: e.value ? true : false // Adjust values based on your requirements
                                            }))
                                        }
                                        className="w-small"
                                        style={{
                                            transform: 'scale(0.8)', // Scales down the switch
                                            marginLeft: '-4px' // Adjust alignment if needed
                                        }}
                                    />
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '5px' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.CAN_ASK_LOAN_BALANCE')}
                                    </label>
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6 flex align-items-center gap-2">
                                    <InputSwitch
                                        id="can_see_our_contact"
                                        checked={reseller.can_see_our_contact === true} // Replace logic as needed
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                can_see_our_contact: e.value ? true : false // Adjust values based on your requirements
                                            }))
                                        }
                                        className="w-small"
                                        style={{
                                            transform: 'scale(0.8)', // Scales down the switch
                                            marginLeft: '-4px' // Adjust alignment if needed
                                        }}
                                    />
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '5px' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.CAN_SEE_OUR_CONTACT')}
                                    </label>
                                </div>

                                <div className="field col-12 md:col-6 flex align-items-center gap-2">
                                    <InputSwitch
                                        id="can_see_parent_contact"
                                        checked={reseller.can_see_parent_contact === true} // Replace logic as needed
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                can_see_parent_contact: e.value ? true : false // Adjust values based on your requirements
                                            }))
                                        }
                                        className="w-small"
                                        style={{
                                            transform: 'scale(0.8)', // Scales down the switch
                                            marginLeft: '-4px' // Adjust alignment if needed
                                        }}
                                    />
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '5px' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.CAN_SEE_PARENT_CONTACT')}
                                    </label>
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6 flex align-items-center gap-2">
                                    <InputSwitch
                                        id="can_send_hawala"
                                        checked={reseller.can_send_hawala === true} // Replace logic as needed
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                can_send_hawala: e.value ? true : false // Adjust values based on your requirements
                                            }))
                                        }
                                        className="w-small"
                                        style={{
                                            transform: 'scale(0.8)', // Scales down the switch
                                            marginLeft: '-4px' // Adjust alignment if needed
                                        }}
                                    />
                                    <label style={{ fontWeight: 'bold', fontSize: '0.8rem', marginTop: '5px' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.CAN_SEND_HAWALA')}
                                    </label>
                                </div>

                                {/* <div className="field col-12 md:col-6 flex align-items-center gap-2">
                                    <InputSwitch
                                        id="sub_resellers_can_create_sub_resellers"
                                        checked={reseller.sub_resellers_can_create_sub_resellers === 1} // Replace logic as needed
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                sub_resellers_can_create_sub_resellers: e.value ? 1 : 0 // Adjust values based on your requirements
                                            }))
                                        }
                                        className="w-small"
                                        style={{
                                            transform: 'scale(0.8)', // Scales down the switch
                                            marginLeft: '-4px' // Adjust alignment if needed
                                        }}
                                    />
                                    <label style={{ fontWeight: 'bold',fontSize: '0.8rem', fontSize: '12px',marginTop:'5px' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.SUBRESELLERCANCREATESUBRESELLER')}
                                    </label>
                                </div> */}
                            </div>

                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <div className="file-upload-card flex flex-column align-items-start p-3 border-round" style={{ border: '1px dashed #ccc' }}>
                                        <label className="font-bold mb-2" style={{ fontSize: '0.8rem' }}>
                                            {t('RESELLER.FORM.LABEL.IDENTITY_PROOF')}
                                        </label>
                                        {reseller.reseller_identity_attachment ? (
                                            <div className="preview-container relative">
                                                <img
                                                    src={reseller.reseller_identity_attachment instanceof File ? URL.createObjectURL(reseller.reseller_identity_attachment) : reseller.reseller_identity_attachment}
                                                    alt="Identity Proof Preview"
                                                    className="border-round shadow-2"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '150px',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                                <Button
                                                    icon="pi pi-times"
                                                    className="p-button-rounded p-button-danger p-button-sm absolute"
                                                    style={{ top: '-10px', right: '-10px' }}
                                                    onClick={() => setReseller((prev) => ({ ...prev, reseller_identity_attachment: null }))}
                                                />
                                            </div>
                                        ) : (
                                            <FileUpload
                                                mode="basic"
                                                name="reseller_identity_attachment"
                                                accept="image/*,.pdf"
                                                maxFileSize={1000000}
                                                customUpload
                                                onSelect={(e) => {
                                                    setReseller((prev) => ({ ...prev, reseller_identity_attachment: e.files[0] }));
                                                }}
                                                chooseLabel={t('UPLOAD')}
                                                className="w-full"
                                                style={{
                                                    width: '100%',
                                                    fontSize: '0.8rem'
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="field col-12 md:col-6 mt-3 md:mt-0">
                                    <div className="file-upload-card flex flex-column align-items-start p-3 border-round" style={{ border: '1px dashed #ccc' }}>
                                        <label className="font-bold mb-2" style={{ fontSize: '0.8rem' }}>
                                            {t('RESELLER.FORM.LABEL.OPTIONAL_PROOF')}
                                        </label>
                                        {reseller.extra_optional_proof ? (
                                            <div className="preview-container relative">
                                                <img
                                                    src={reseller.extra_optional_proof instanceof File ? URL.createObjectURL(reseller.extra_optional_proof) : reseller.extra_optional_proof}
                                                    alt="Optional Proof Preview"
                                                    className="border-round shadow-2"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '150px',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                                <Button
                                                    icon="pi pi-times"
                                                    className="p-button-rounded p-button-danger p-button-sm absolute"
                                                    style={{ top: '-10px', right: '-10px' }}
                                                    onClick={() => setReseller((prev) => ({ ...prev, extra_optional_proof: null }))}
                                                />
                                            </div>
                                        ) : (
                                            <FileUpload
                                                mode="basic"
                                                name="extra_optional_proof"
                                                accept="image/*,.pdf"
                                                maxFileSize={1000000}
                                                customUpload
                                                onSelect={(e) => {
                                                    setReseller((prev) => ({ ...prev, extra_optional_proof: e.files[0] }));
                                                }}
                                                chooseLabel={t('UPLOAD')}
                                                className="w-full"
                                                style={{
                                                    width: '100%',
                                                    fontSize: '0.8rem'
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteResellerDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResellerDialogFooter} onHide={hideDeleteResellerDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {reseller && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{reseller.reseller_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={statusResellerDialog} style={{ width: '450px' }} header="Confirm" modal footer={statusResellerDialogFooter} onHide={hideStatusResellerDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {reseller && (
                                <span>
                                    Are you sure you want to change status <b>{reseller.reseller_name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteResellersDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResellersDialogFooter} onHide={hideDeleteResellersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mx-3" style={{ fontSize: '2rem', color: 'red' }} />
                            {reseller && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default withAuth(ResellerPage);
