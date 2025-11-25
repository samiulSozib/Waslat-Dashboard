/* eslint-disable @next/next/no-img-element */
'use client';
import { Menu } from 'primereact/menu';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { ProductService } from '../../demo/service/ProductService';
import { LayoutContext } from '../../layout/context/layoutcontext';
import { Demo } from '@/types';
import { ChartData, ChartOptions } from 'chart.js';
import { useDispatch } from 'react-redux';
import { fetchDashboardData } from '../redux/actions/dashboardActions';
import { useSelector } from 'react-redux';
import { Divider } from 'primereact/divider';
import { _fetchCountries } from '../redux/actions/countriesActions';
import { _fetchTelegramList } from '../redux/actions/telegramActions';
import { _fetchCompanies } from '../redux/actions/companyActions';
import { AppDispatch } from '../redux/store';
import { _fetchPurchasedProducts } from '../redux/actions/purchasedProductsActions';
import withAuth from './authGuard';
import { useTranslation } from 'react-i18next';
import { _fetchPaymentTypes } from '../redux/actions/paymentTypeActions';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { _fetchServiceList } from '../redux/actions/serviceActions';

interface CurrencyBreakdown {
    [currency: string]: {
        total_sale: number;
        total_profit: number;
        today_sale: number;
        today_profit: number;
    };
}

interface FilterParams {
    filter_service_id?: string | null;
    from_date?: string | null;
    to_date?: string | null;
}

const Dashboard = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const { data } = useSelector((state: any) => state.dashboardDataReducer);
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();

    // Filter states
    const [filterDialogVisible, setFilterDialogVisible] = useState(false);
    const [filters, setFilters] = useState({
        filter_service_id: null as number | null,
        from_date: null as string | null,
        to_date: null as string | null
    });
    const [activeFilters, setActiveFilters] = useState<FilterParams>({});
    const [showFilters, setShowFilters] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
    const [showQuickActions, setShowQuickActions] = useState(false);


    const { services } = useSelector((state: any) => state.serviceReducer);

    // Initialize filters from URL parameters on component mount
    useEffect(() => {
        const urlFilters: FilterParams = {};

        const serviceId = searchParams.get('filter_service_id');
        const fromDate = searchParams.get('from_date');
        const toDate = searchParams.get('to_date');

        if (serviceId) {
            urlFilters.filter_service_id = serviceId;
            setFilters(prev => ({ ...prev, filter_service_id: parseInt(serviceId) }));
        }
        if (fromDate) {
            urlFilters.from_date = fromDate;
            setFilters(prev => ({ ...prev, from_date: fromDate }));
        }
        if (toDate) {
            urlFilters.to_date = toDate;
            setFilters(prev => ({ ...prev, to_date: toDate }));
        }

        setActiveFilters(urlFilters);
    }, [searchParams]);

    useEffect(() => {
        dispatch(fetchDashboardData());
        dispatch(_fetchPurchasedProducts());
        dispatch(_fetchServiceList()); // Fetch services for dropdown
    }, [dispatch]);

    useEffect(() => {
        // Fetch data with active filters (which now come from URL)
        //if (Object.keys(activeFilters).length > 0) {
            dispatch(fetchDashboardData(activeFilters));
        //} else {
            // If no active filters, fetch default data
            //dispatch(fetchDashboardData());
        //}
    }, [activeFilters, dispatch]);

    useEffect(() => {
        // Handle click outside filter dialog
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (filterDialogVisible && filterRef.current && !filterRef.current.contains(target)) {
                setFilterDialogVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [filterDialogVisible]);

    const applyLightTheme = () => {
        const lineOptions: ChartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color: '#ebedef'
                    }
                }
            }
        };
        setLineOptions(lineOptions);
    };

    const applyDarkTheme = () => {
        const lineOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color: 'rgba(160, 167, 181, .3)'
                    }
                }
            }
        };
        setLineOptions(lineOptions);
    };

    useEffect(() => {
        if (layoutConfig.colorScheme === 'light') {
            applyLightTheme();
        } else {
            applyDarkTheme();
        }
    }, [layoutConfig.colorScheme]);

    const formatCurrency = (value: number) => {
        return value?.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
        });
    };

    const handleSubmitFilter = (filters: any) => {
        // Build URL parameters
        const params = new URLSearchParams();

        if (filters.filter_service_id) {
            params.append('filter_service_id', filters.filter_service_id.toString());
        }
        if (filters.from_date) {
            params.append('from_date', filters.from_date);
        }
        if (filters.to_date) {
            params.append('to_date', filters.to_date);
        }

        // Update URL with parameters
        const newUrl = params.toString() ? `/?${params.toString()}` : '/';
        router.push(newUrl);

        // Close filters on mobile after applying
        setShowFilters(false);
    };

    const resetFilters = () => {
        // Clear URL parameters
        router.push('/');

        // Reset local filter state
        setFilters({
            filter_service_id: null,
            from_date: null,
            to_date: null
        });

        // Close filters on mobile after resetting
        setShowFilters(false);
    };

    // Navigation handlers
    const navigateToOrders = (status: string) => {
        router.push(`/pages/order?status=${status}`);
    };

    const navigateToPage = (path: string) => {
        router.push(path);
    };

    // Check if any filters are active
    const hasActiveFilters = Object.keys(activeFilters).length > 0;

    // Filter toggle handler
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    return (
        <div className="grid -m-5">
            {/* Filter Header - Always Visible */}
            <div className="col-12 lg:col-12 xl:col-12 lg:hidden xl:hidden">
                <div className="card mb-0 p-1" style={{ backgroundImage: 'linear-gradient(to right, #dbeafe, #c7d2fe)' }}>
                    <div className="flex justify-content-between align-items-center">
                        <div className="flex align-items-center">
                            <h3 className="text-sm font-semibold m-0 mr-2">{t('FILTERS')}</h3>
                            {hasActiveFilters && (
                                <span className="bg-primary border-circle w-2 h-2"></span>
                            )}
                        </div>
                        <Button
                            icon="pi pi-filter"
                            className="p-button-text lg:hidden xl:hidden"
                            onClick={toggleFilters}
                            tooltipOptions={{ position: 'bottom' }}
                        />
                    </div>
                </div>
            </div>

            

            {/* Rest of your dashboard content remains the same */}
            {/* Quick Actions Header - Always Visible */}
            <div className="col-12 lg:col-12 xl:col-12 lg:hidden xl:hidden">
                <div className="card mb-0 p-1" style={{ backgroundImage: 'linear-gradient(to right, #dbeafe, #c7d2fe)' }}>
                    <div className="flex justify-content-between align-items-center">
                        <div className="flex align-items-center">
                            <h3 className="text-sm font-semibold m-0 mr-2">{t('QUICK_ACTIONS')}</h3>
                        </div>
                        <Button
                            icon="pi pi-bolt"
                            className="p-button-text lg:hidden xl:hidden"
                            onClick={() => setShowQuickActions(!showQuickActions)}
                            tooltipOptions={{ position: 'bottom' }}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Actions Section - Collapsible on Mobile */}
            {/* Quick Actions Section - Collapsible on Mobile */}
            <div className={`col-12 lg:col-12 xl:col-12 transition-all transition-duration-300 ${showQuickActions ? 'block' : 'hidden lg:block xl:block'}`}>
                <div className="card p-2" style={{ backgroundImage: 'linear-gradient(to right, #dbeafe, #c7d2fe)' }}>
                    <div className="flex flex-column lg:flex-row xl:flex-row justify-content-between align-items-center">
                        {/* Title - Hidden on mobile, visible on desktop */}
                        <div className="hidden lg:flex xl:flex align-items-center">
                            <span className="text-sm font-semibold text-gray-800">{t('QUICK_ACTIONS')}</span>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-wrap justify-content-center lg:justify-content-end xl:justify-content-end gap-1 w-full lg:w-auto xl:w-auto">
                            {/* Mobile Layout - Stacked buttons */}
                            <div className="lg:hidden xl:hidden w-full">
                                <div className="grid">
                                    <div className="col-6">
                                        <Button
                                            label={t('ADD_HAWALA')}
                                            icon="pi pi-money-bill"
                                            className="p-button-sm p-button-outlined w-full"
                                            onClick={() => navigateToPage('/pages/hawala?action=add')}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <Button
                                            label={t('ADD_PAYMENT')}
                                            icon="pi pi-credit-card"
                                            className="p-button-sm p-button-outlined w-full"
                                            onClick={() => navigateToPage('/pages/payment?action=add')}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <Button
                                            label={t('ADD_BALANCE')}
                                            icon="pi pi-wallet"
                                            className="p-button-sm p-button-outlined w-full"
                                            onClick={() => navigateToPage('/pages/balance?action=add')}
                                        />
                                    </div>
                                    <div className="col-6">
                                        <Button
                                            label={t('ADD_RESELLER')}
                                            icon="pi pi-user-plus"
                                            className="p-button-sm p-button-outlined w-full"
                                            onClick={() => navigateToPage('/pages/reseller?action=add')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Layout - Horizontal buttons */}
                            <div className="hidden lg:flex xl:flex gap-1">
                                <Button
                                    label={t('ADD_HAWALA')}
                                    icon="pi pi-money-bill"
                                    className="p-button-sm p-button-outlined"
                                    onClick={() => navigateToPage('/pages/hawala?action=add')}
                                />
                                <Button
                                    label={t('ADD_PAYMENT')}
                                    icon="pi pi-credit-card"
                                    className="p-button-sm p-button-outlined"
                                    onClick={() => navigateToPage('/pages/payment?action=add')}
                                />
                                <Button
                                    label={t('ADD_BALANCE')}
                                    icon="pi pi-wallet"
                                    className="p-button-sm p-button-outlined"
                                    onClick={() => navigateToPage('/pages/balance?action=add')}
                                />
                                <Button
                                    label={t('ADD_RESELLER')}
                                    icon="pi pi-user-plus"
                                    className="p-button-sm p-button-outlined"
                                    onClick={() => navigateToPage('/pages/reseller?action=add')}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Filter Section - Collapsible on Mobile */}
            <div className={`col-12 lg:col-12 xl:col-12 transition-all transition-duration-300 ${showFilters ? 'block' : 'hidden lg:block xl:block'}`}>
                <div className="card mb-0 p-2" style={{ backgroundImage: 'linear-gradient(to right, #dbeafe, #c7d2fe)' }}>
                    <div className="grid align-items-center">
                        {/* Service ID Filter */}
                        <div className="col-12 md:col-3 mb-2 md:mb-0">
                            <div className="field mb-0">
                                <label htmlFor="serviceFilter" className="block text-xs font-medium mb-1">
                                    {t('SERVICE')}
                                </label>
                                <Dropdown
                                    id="serviceFilter"
                                    options={services}
                                    value={filters.filter_service_id}
                                    onChange={(e) => setFilters({ ...filters, filter_service_id: e.value })}
                                    optionLabel="service_name"
                                    optionValue="id"
                                    placeholder={t('SELECT_SERVICE')}
                                    style={{ width: '100%' }}
                                    itemTemplate={(option) => (
                                        <div style={{ display: 'flex', gap: '3px', flexDirection: 'column' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{option.service_name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                                {option.service_category?.category_name} - {option.company?.company_name}
                                            </div>
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
                        </div>

                        {/* From Date Filter */}
                        <div className="col-12 md:col-3 mb-2 md:mb-0">
                            <div className="field mb-0">
                                <label htmlFor="fromDate" className="block text-xs font-medium mb-1">
                                    {t('FROM_DATE')}
                                </label>
                                <InputText
                                    type="date"
                                    id="fromDate"
                                    value={filters.from_date || ''}
                                    onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        {/* To Date Filter */}
                        <div className="col-12 md:col-3 mb-2 md:mb-0">
                            <div className="field mb-0">
                                <label htmlFor="toDate" className="block text-xs font-medium mb-1">
                                    {t('TO_DATE')}
                                </label>
                                <InputText
                                    type="date"
                                    id="toDate"
                                    value={filters.to_date || ''}
                                    onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        {/* Apply Filter Button */}
                        <div className="col-12 md:col-3">
                            <div className="field mb-0" style={{ paddingTop: '1.4rem' }}>
                                <div className="flex align-items-center gap-1 flex-wrap">
                                    <Button
                                        label={t('APPLY')}
                                        icon="pi pi-filter"
                                        className="p-button-primary flex-1 p-button-sm"
                                        onClick={() => handleSubmitFilter(filters)}
                                        style={{ height: '40px', minWidth: '120px' }}
                                    />
                                    <Button
                                        label={t('RESET')}
                                        icon="pi pi-refresh"
                                        className="p-button-secondary flex-1 p-button-sm"
                                        onClick={resetFilters}
                                        style={{ height: '40px', minWidth: '120px' }}
                                        disabled={!hasActiveFilters}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today Orders */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div onClick={() => navigateToPage('/pages/order')} className="cursor-pointer card mb-0 bg-gradient-to-r from-indigo-100 to-purple-200" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #dbeafe, #c7d2fe)' }}>
                    <div className="flex justify-content-between mb-3 -mx-4 md:mx-0">
                        <div>
                            <span className="block text-500 text-xs font-medium mb-2">{t('DASHBOARD.TODAYORDER')}</span>
                            <div className="text-900 font-medium text-lg">{data?.today_orders}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-shopping-cart text-blue-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Orders */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div onClick={() => navigateToPage("/pages/order")} className="cursor-pointer card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #f3e8ff, #fbcfe8)' }}>
                    <div className="flex justify-content-between mb-3 -mx-4 md:mx-0">
                        <div>
                            <span className="block text-500 text-xs font-medium mb-2">{t('DASHBOARD.TOTALORDER')}</span>
                            <div className="text-900 font-medium text-lg">{data?.total_orders}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-list text-orange-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Pending Orders */}
            <div className="col-6 lg:col-6 xl:col-2">
                <div onClick={() => navigateToOrders('pending')} className="cursor-pointer card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #d1fae5, #99f6e4)' }}>
                    <div className="flex justify-content-between mb-3 -mx-4 md:mx-0" style={{ fontSize: '12px' }}>
                        <div>
                            <div className="text-900 font-medium text-lg">{data?.pending_orders ?? 0}</div>
                            <span className="block text-500 text-xm font-medium mb-2">{t('DASHBOARD.PENDINGORDERS')}</span>
                            <div className="text-900 font-medium text-lg flex items-center">
                                <span className="text-xs mt-1 mr-1">{t('DASHBOARD.TODAY')} :</span>
                                <span>{data?.today_pending_orders ?? 0}</span>
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '2rem', height: '2rem' }}>
                            <i className="pi pi-clock text-cyan-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Successful Orders */}
            <div className="col-6 lg:col-6 xl:col-2">
                <div onClick={() => navigateToOrders('confirmed')} className="cursor-pointer card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #fef9c3, #fed7aa)' }}>
                    <div className="flex justify-content-between mb-3 -mx-4 md:mx-0" style={{ fontSize: '12px' }}>
                        <div>
                            <div className="text-900 font-medium text-lg">{data?.successful_orders ?? 0}</div>
                            <span className="block text-500 text-xm font-medium mb-2">{t('DASHBOARD.SUCCESSORDERS')}</span>
                            <div className="text-900 font-medium text-lg flex items-center">
                                <span className="text-xs mt-1 mr-1">{t('DASHBOARD.TODAY')} :</span>
                                <span>{data?.today_successful_orders ?? 0}</span>
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '2rem', height: '2rem' }}>
                            <i className="pi pi-check-circle text-green-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Rejected Orders */}
            <div className="col-6 lg:col-6 xl:col-2">
                <div onClick={() => navigateToOrders('rejected')} className="cursor-pointer card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #fae8ff, #e9d5ff)' }}>
                    <div className="flex justify-content-between mb-3 -mx-4 md:mx-0" style={{ fontSize: '12px' }}>
                        <div>
                            <div className="text-900 font-medium text-lg">{data?.rejected_orders ?? 0}</div>
                            <span className="block text-500 text-xm font-medium mb-2">{t('DASHBOARD.REJECTEDORDERS')}</span>
                            <div className="text-900 font-medium text-lg flex items-center">
                                <span className="text-xs mt-1 mr-1">{t('DASHBOARD.TODAY')} :</span>
                                <span>{data?.today_rejected_orders ?? 0}</span>
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '2rem', height: '2rem' }}>
                            <i className="pi pi-times text-red-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Today Sale - Updated with currency breakdown */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #cffafe, #bfdbfe)' }}>
                    <div className="flex justify-content-between mb-1 -mx-4 -mt-4 md:mt-0 md:mx-0">
                        <div>
                            <span className="block text-500 text-xs font-medium mb-2">{t('DASHBOARD.TODAYSALE')}</span>
                            <div className="text-900 font-medium text-md">
                                {userInfo?.currency?.symbol} {data?.today_sale.toFixed(2)}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-yellow-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-dollar text-yellow-500 text-xl" />
                        </div>
                    </div>
                    <hr className="my-1 border-t border-purple-400" />

                    {data?.currency_breakdown && (
                        <div className="-mr-4 -ml-4">
                            {/* First row: 3 columns */}
                            <div className="flex justify-content-between mb-1">
                                {Object.entries(data.currency_breakdown as CurrencyBreakdown)
                                    .slice(0, 3)
                                    .map(([currency, values]) => (
                                        <div key={currency}>
                                            <span className="block text-500 text-xs font-medium">
                                                <span className="inline-block text-indigo-800 font-semibold">{currency.toUpperCase()}</span> {values.today_sale.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </div>

                            {/* Second row: next 3 columns */}
                            <div className="flex justify-content-between">
                                {Object.entries(data.currency_breakdown as CurrencyBreakdown)
                                    .slice(3, 6)
                                    .map(([currency, values]) => (
                                        <div key={currency}>
                                            <span className="block text-500 text-xs font-medium">
                                                <span className="inline-block text-indigo-800 font-semibold">{currency.toUpperCase()}</span> {values.today_sale.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Today Profit - Updated with currency breakdown */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #e0e7ff, #e9d5ff)' }}>
                    <div className="flex justify-content-between mb-1 -mx-4 -mt-4 md:mt-0 md:mx-0">
                        <div>
                            <span className="block text-500 text-xs font-medium mb-2">{t('DASHBOARD.TODAYPROFIT')}</span>
                            <div className="text-900 font-medium text-md">
                                {userInfo?.currency?.symbol} {data?.today_profit.toFixed(2)}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-cyan-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-chart-line text-cyan-500 text-xl" />
                        </div>
                    </div>
                    <hr className="my-1 border-t border-purple-400" />

                    {data?.currency_breakdown && (
                        <div className="-mr-4 -ml-4">
                            {/* First row: 3 columns */}
                            <div className="flex justify-content-between mb-1">
                                {Object.entries(data.currency_breakdown as CurrencyBreakdown)
                                    .slice(0, 3)
                                    .map(([currency, values]) => (
                                        <div key={currency}>
                                            <span className="block text-500 text-xs font-medium">
                                                <span className="inline-block text-indigo-800 font-semibold">{currency.toUpperCase()}</span> {values.today_profit.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </div>

                            {/* Second row: next 3 columns */}
                            <div className="flex justify-content-between">
                                {Object.entries(data.currency_breakdown as CurrencyBreakdown)
                                    .slice(3, 6)
                                    .map(([currency, values]) => (
                                        <div key={currency}>
                                            <span className="block text-500 text-xs font-medium">
                                                <span className="inline-block text-indigo-800 font-semibold">{currency.toUpperCase()}</span> {values.today_profit.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Total Sale - Updated with currency breakdown */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #ffedd5, #fde68a)' }}>
                    <div className="flex justify-content-between mb-1 -mx-4 -mt-4 md:mt-0 md:mx-0">
                        <div>
                            <span className="block text-500 text-xs font-medium mb-2">{t('DASHBOARD.TOTALSALE')}</span>
                            <div className="text-900 font-medium text-md">
                                {userInfo?.currency?.symbol} {data?.total_sale.toFixed(2)}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-wallet text-blue-500 text-xl" />
                        </div>
                    </div>
                    <hr className="my-1 border-t border-purple-400" />

                    {data?.currency_breakdown && (
                        <div className="-mr-4 -ml-4">
                            {/* First row: 3 columns */}
                            <div className="flex justify-content-between mb-1">
                                {Object.entries(data.currency_breakdown as CurrencyBreakdown)
                                    .slice(0, 3)
                                    .map(([currency, values]) => (
                                        <div key={currency}>
                                            <span className="block text-500 text-xs font-medium">
                                                <span className="inline-block text-indigo-800 font-semibold">{currency.toUpperCase()}</span> {values.total_sale.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </div>

                            {/* Second row: next 3 columns */}
                            <div className="flex justify-content-between">
                                {Object.entries(data.currency_breakdown as CurrencyBreakdown)
                                    .slice(3, 6)
                                    .map(([currency, values]) => (
                                        <div key={currency}>
                                            <span className="block text-500 text-xs font-medium">
                                                <span className="inline-block text-indigo-800 font-semibold">{currency.toUpperCase()}</span> {values.total_sale.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Total Profit - Updated with currency breakdown */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #d1fae5, #a7f3d0)' }}>
                    <div className="flex justify-content-between mb-1 -mx-4 -mt-4 md:mt-0 md:mx-0">
                        <div>
                            <span className="block text-500 text-xs font-medium mb-1">{t('DASHBOARD.TOTALPROFIT')}</span>
                            <div className="text-900 font-medium text-md">
                                {userInfo?.currency?.symbol} {data?.total_profit.toFixed(2)}
                            </div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-thumbs-up text-green-500 text-xl" />
                        </div>
                    </div>
                    <hr className="my-1 border-t border-purple-400" />


                    {data?.currency_breakdown && (
                        <div className="-mr-4 -ml-4">
                            {/* First row: 3 columns */}
                            <div className="flex justify-content-between mb-1">
                                {Object.entries(data.currency_breakdown as CurrencyBreakdown)
                                    .slice(0, 3)
                                    .map(([currency, values]) => (
                                        <div key={currency}>
                                            <span className="block text-500 text-xs font-medium">
                                                <span className="inline-block text-indigo-800 font-semibold">{currency.toUpperCase()}</span> {values.total_profit.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </div>

                            {/* Second row: next 3 columns */}
                            <div className="flex justify-content-between">
                                {Object.entries(data.currency_breakdown as CurrencyBreakdown)
                                    .slice(3, 6)
                                    .map(([currency, values]) => (
                                        <div key={currency}>
                                            <span className="block text-500 text-xs font-medium">
                                                <span className="inline-block text-indigo-800 font-semibold">{currency.toUpperCase()}</span> {values.total_profit.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Total Reseller */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div onClick={() => navigateToPage('/pages/reseller')} className="cursor-pointer card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #fef9c3, #fef08a)' }}>
                    <div className="flex justify-content-between mb-3 -mx-4 md:mx-0">
                        <div>
                            <span className="block text-500 text-xs font-medium mb-2">{t('DASHBOARD.TOTALRESELLER')}</span>
                            <div className="text-900 font-medium text-lg">{data?.total_resellers}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-users text-purple-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Company */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div onClick={() => navigateToPage('/pages/companies')} className="cursor-pointer card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #fee2e2, #fbcfe8)' }}>
                    <div className="flex justify-content-between mb-3 -mx-4 md:mx-0">
                        <div>
                            <span className="block text-500 text-xs font-medium mb-2">{t('DASHBOARD.TOTALCOMPANY')}</span>
                            <div className="text-900 font-medium text-lg">{data?.total_companies}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-building text-orange-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Service */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div onClick={() => navigateToPage('/pages/services')} className="cursor-pointer card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #cffafe, #99f6e4)' }}>
                    <div className="flex justify-content-between mb-3 -mx-4 md:mx-0">
                        <div>
                            <span className="block text-500 text-xs font-medium mb-2">{t('DASHBOARD.TOTALSERVICE')}</span>
                            <div className="text-900 font-medium text-lg">{data?.total_services}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-yellow-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-briefcase text-yellow-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Total Bundle */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div onClick={() => navigateToPage('/pages/bundle')} className="cursor-pointer card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #e0f2fe, #bfdbfe)' }}>
                    <div className="flex justify-content-between mb-3 -mx-4 md:mx-0">
                        <div>
                            <span className="block text-500 text-xs font-medium mb-2">{t('DASHBOARD.TOTALBUNDLE')}</span>
                            <div className="text-900 font-medium text-lg">{data?.total_bundles}</div>
                        </div>
                        <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                            <i className="pi pi-comment text-purple-500 text-xl" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <Divider />
                <span className="block text-900 text-lg mb-2">{t('DASHBOARD.BALANCES')}</span>
                <span className="block text-700 text-sm mb-1">{t('DASHBOARD.BALANCES.HINT')}</span>
                <Divider />
            </div>

            {data?.balances_by_currency?.map((balance: any, index: number) => (
                <div key={index} className="col-6 lg:col-4 xl:col-3">
                    <div
                        className="card mb-2 p-3"
                        style={{
                            height: "100px",
                            backgroundImage: "linear-gradient(to right, #ecfccb, #bbf7d0)",
                        }}
                    >
                        <div className="flex justify-content-between items-center h-full">
                            <div>
                                <span className="block text-500 text-xs font-medium mb-1">
                                    {balance.currency_code}
                                </span>
                                <div className="text-900 font-semibold text-base">
                                    {balance.total_balance}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="col-12">
                <Divider />
                <span className="block text-900 text-lg mb-2">{t('DASHBOARD.PAYMENT')}</span>
                <span className="block text-700 text-sm mb-1">{t('DASHBOARD.PAYMENT.HINT')}</span>
                <Divider />
            </div>

            {data?.payments_by_currency?.map((payment: any, index: number) => (
                <div key={index} className="col-6 lg:col-4 xl:col-3">
                    <div
                        className="card mb-2 p-3"
                        style={{
                            height: "100px",
                            backgroundImage: "linear-gradient(to right, #e0f2fe, #bae6fd)",
                        }}
                    >
                        <div className="flex justify-content-between items-center h-full">
                            <div>
                                <span className="block text-500 text-xs font-medium mb-1">
                                    {payment.currency_code}
                                </span>
                                <div className="text-900 font-semibold text-base">
                                    {payment.total_payment}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="col-12">
                <Divider />
                <span className="block text-900 text-lg mb-2">{t('DASHBOARD.UNPAID')}</span>
                <span className="block text-700 text-sm mb-1">{t('DASHBOARD.UNPAID.HINT')}</span>
                <Divider />
            </div>

            {data?.unpaid_amounts_by_currency?.map((unpaid: any, index: number) => (
                <div key={index} className="col-6 lg:col-4 xl:col-3">
                    <div
                        className="card mb-2 p-3"
                        style={{
                            height: "100px",
                            backgroundImage: "linear-gradient(to right, #fee2e2, #fecaca)",
                        }}
                    >
                        <div className="flex justify-content-between items-center h-full">
                            <div>
                                <span className="block text-500 text-xs font-medium mb-1">
                                    {unpaid.currency_code}
                                </span>
                                <div className="text-900 font-semibold text-base">
                                    {unpaid.total_unpaid}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}


        </div>
    );
};

export default withAuth(Dashboard);