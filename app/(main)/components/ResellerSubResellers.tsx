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
import { Country, Currency, District, Province, Reseller } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import { _addReseller, _changeResellerStatus, _deleteReseller, _editReseller, _fetchResellers, _getResellerById } from '@/app/redux/actions/resellerActions';
import { FileUpload } from 'primereact/fileupload';
import { Password } from 'primereact/password';
import { _fetchDistricts } from '@/app/redux/actions/districtActions';
import { _fetchProvinces } from '@/app/redux/actions/provinceActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { useTranslation } from 'react-i18next';
import { resellerGroupReducer } from '@/app/redux/reducers/resellerGroupReducer';
import { _fetchResellerGroups } from '@/app/redux/actions/resellerGroupActions';
import { InputSwitch } from 'primereact/inputswitch';
import { SplitButton } from 'primereact/splitbutton';
import { useRouter } from 'next/navigation';
import { Paginator } from 'primereact/paginator';
import i18n from '@/i18n';
import { isRTL } from '../utilities/rtlUtil';
import { customCellStyleImage } from '../utilities/customRow';
import { resellerInformationReducer } from '../../redux/reducers/resellerInformationReducer';
import { fetchResellerSubResellers } from '@/app/redux/actions/resellerInformationActions';
import { generateSubResellerExcelFile } from '../utilities/generateExcel';

interface ResellerBalancesProps {
    resellerId: number;
}

const ResellerSubResellers = ({ resellerId }: ResellerBalancesProps) => {
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
        sub_resellers_can_create_sub_resellers: 0
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
    const { sub_resellers, loading, sub_resellers_pagination, singleReseller } = useSelector((state: any) => state.resellerInformationReducer);
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
        dispatch(fetchResellerSubResellers(resellerId,1, searchTag,activeFilters));
        dispatch(_fetchCountries());
        dispatch(_fetchDistricts());
        dispatch(_fetchProvinces());
        dispatch(_fetchCurrencies());
        dispatch(_fetchResellerGroups());
    }, [dispatch, searchTag,activeFilters,resellerId]);

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
    }, [dispatch, sub_resellers]);

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
        //console.log(reseller.code)
        //return
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
            !reseller.reseller_group_id ||
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
        //console.log(reseller)
        setReseller({ ...reseller, country_id: parseInt(reseller.country_id?.toString()), province_id: parseInt(reseller.province_id?.toString()), districts_id: parseInt(reseller.districts_id?.toString()) });

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

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="flex justify-end items-center gap-2">
                    <div className="flex-1 min-w-[100px]" ref={filterRef} style={{ position: 'relative' }}>
                        <Button className="p-button-info" label={t('FILTER')} icon="pi pi-filter" onClick={() => setFilterDialogVisible(!filterDialogVisible)} />
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
                                                    { label: t('TABLE.GENERAL.ACTIVATE'), value: '1' },
                                                    { label: t('TABLE.GENERAL.DEACTIVATE'), value: '0' },
                                                ]}
                                                value={filters.filter_status}
                                                onChange={(e) => setFilters({ ...filters, filter_status: e.value })}
                                                placeholder={t('SELECT_STATUS')}
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
                    {/* <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('RESELLER.TABLE.CREATERESELLER')}
                        icon="pi pi-plus"
                        severity="success"
                        className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '' : ''}
                        onClick={openNew}
                    /> */}
                    {/* <Button
                        style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
                        label={t('APP.GENERAL.DELETE')}
                        icon="pi pi-trash"
                        severity="danger"
                        onClick={confirmDeleteSelected}
                        disabled={!selectedCompanies || !(selectedCompanies as any).length}
                    /> */}
                <Button className="flex-1 min-w-[100px]" label={t('EXPORT.EXPORT')} icon={`pi pi-file-excel`} severity="success" onClick={exportToExcel} />

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
                {rowData.user?.currency_preference_code || '-'}
            </>
        );
    };

    const countryBodyTemplate = (rowData: Reseller) => {
        return (
            <>
                <span className="p-column-title">Country</span>
                {(rowData.country as Country)?.country_name || '-'}

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
        dispatch(fetchResellerSubResellers(resellerId,page, searchTag,activeFilters));
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
                    sub_resellers,
                    resellerId,
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
                        value={sub_resellers}
                        selection={selectedCompanies}
                        onRowClick={(e) => viewResellerDetails(e.data.id)}
                        dataKey="id"
                        paginator={false} // Disable PrimeReact's built-in paginator
                        rows={sub_resellers_pagination?.items_per_page}
                        totalRecords={sub_resellers_pagination?.total}
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
                            sortable
                            body={nameBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="phone" header={t('RESELLER.TABLE.COLUMN.PHONE')} body={phoneBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="total_earning_balance"
                            header={t('TOTAL_EARNING_BALANCE')}
                            body={totalEarningBalanceBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="balance" header={t('MENU.BALANCE')} body={balanceBodyTemplate}></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="available_payment"
                            header={t('RESELLER.TABLE.COLUMN.AVAILABLEPAYMENT')}
                            body={availablePaymentBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="total_payment"
                            header={t('RESELLER.TABLE.COLUMN.PAYMENT')}
                            body={totalPaymentBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="total_balance"
                            header={t('RESELLER.TABLE.COLUMN.TOTAL_BALANCE')}
                            body={totalBalanceSentBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="loan_amount"
                            header={t('RESELLER.TABLE.COLUMN.LOANAMOUNT')}
                            body={loanAmountBodyTemplate}
                        ></Column>
                        <Column
                            style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
                            field="preferred_currency"
                            header={t('RESELLER.TABLE.COLUMN.CURRENCYPREFERENCE')}
                            body={preferredCurrencyBodyTemplate}
                        ></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="country" header={t('RESELLER.TABLE.COLUMN.COUNTRY')} body={countryBodyTemplate}></Column>
                        <Column style={{ ...customCellStyleImage, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }} field="status" header={t('BUNDLE.TABLE.FILTER.STATUS')} sortable body={statusBodyTemplate}></Column>
                    </DataTable>
                    <Paginator
                        first={(sub_resellers_pagination?.page - 1) * sub_resellers_pagination?.items_per_page}
                        rows={sub_resellers_pagination?.items_per_page}
                        totalRecords={sub_resellers_pagination?.total}
                        onPageChange={(e) => onPageChange(e)}
                        template={
                            isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                        }
                    />

                    <Dialog visible={resellerDialog} style={{ width: '900px', padding: '5px' }} header={t('RESELLER.DETAILS')} modal className="p-fluid" footer={resellerDialogFooter} onHide={hideDialog}>
                        <div className="card" style={{ padding: '10px' }}>
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
                                    <label style={{ fontWeight: 'bold' }} htmlFor="name">
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
                                    <label style={{ fontWeight: 'bold' }} htmlFor="name">
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
                                        className={classNames({
                                            'p-invalid': submitted && !reseller.contact_name
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col">
                                    <label style={{ fontWeight: 'bold' }} htmlFor="name">
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
                                    <label style={{ fontWeight: 'bold' }} htmlFor="name">
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
                            {reseller.id === 0 && (
                                <div className="formgrid grid">
                                    <div className="field col">
                                        <label style={{ fontWeight: 'bold' }} htmlFor="password">
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
                                    <label style={{ fontWeight: 'bold' }} htmlFor="name">
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
                                        className="w-full"
                                    />

                                    {submitted && !reseller.country_id && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field col">
                                    <label style={{ fontWeight: 'bold' }} htmlFor="name">
                                        {t('RESELLER.FORM.INPUT.PROVINCE')}
                                    </label>
                                    <Dropdown
                                        id="province_id"
                                        value={reseller.province_id}
                                        options={filteredProvinces}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                province_id: e.value
                                            }))
                                        }
                                        optionLabel="province_name"
                                        optionValue="id"
                                        placeholder="Choose a province"
                                        className="w-full"
                                    />
                                    {submitted && !reseller.province_id && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="formgrid grid">
                                <div className="field col">
                                    <label style={{ fontWeight: 'bold' }} htmlFor="name">
                                        {t('RESELLER.FORM.INPUT.DISTRICT')}
                                    </label>
                                    <Dropdown
                                        id="districts_id"
                                        value={reseller.districts_id}
                                        options={filteredDistricts}
                                        onChange={(e) =>
                                            setReseller((prev: Reseller) => ({
                                                ...prev,
                                                districts_id: e.value
                                            }))
                                        }
                                        optionLabel="district_name"
                                        optionValue="id"
                                        placeholder="Choose a district"
                                        className="w-full"
                                    />
                                    {submitted && !reseller.districts_id && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field col">
                                    <label style={{ fontWeight: 'bold' }} htmlFor="name">
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
                                        className="w-full"
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
                                <div className="field col">
                                    <label style={{ fontWeight: 'bold' }} htmlFor="name">
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
                                        className="w-full"
                                    />
                                    {submitted && !reseller.reseller_group_id && (
                                        <small className="p-invalid" style={{ color: 'red' }}>
                                            {t('THIS_FIELD_IS_REQUIRED')}
                                        </small>
                                    )}
                                </div>
                                <div className="field col">
                                    <label style={{ fontWeight: 'bold' }} htmlFor="name">
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

                            <div className="formgrid grid">
                                <div className="field col flex align-items-center gap-2">
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
                                    />
                                    <label style={{ fontWeight: 'bold' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.CANCREATESUBRESELLER')}
                                    </label>
                                </div>

                                <div className="field col flex align-items-center gap-2">
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
                                    />
                                    <label style={{ fontWeight: 'bold' }} htmlFor="inputSwitch1">
                                        {t('RESELLER.FORM.LABEL.SUBRESELLERCANCREATESUBRESELLER')}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Dialog>

                    <Dialog visible={deleteResellerDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResellerDialogFooter} onHide={hideDeleteResellerDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {reseller && (
                                <span>
                                    {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{reseller.reseller_name}</b>
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={statusResellerDialog} style={{ width: '450px' }} header="Confirm" modal footer={statusResellerDialogFooter} onHide={hideStatusResellerDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {reseller && (
                                <span>
                                    Are you sure you want to change status <b>{reseller.reseller_name}</b>?
                                </span>
                            )}
                        </div>
                    </Dialog>

                    <Dialog visible={deleteResellersDialog} style={{ width: '450px' }} header="Confirm" modal footer={deleteResellersDialogFooter} onHide={hideDeleteResellersDialog}>
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            {reseller && <span>{t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} the selected companies?</span>}
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default ResellerSubResellers;
