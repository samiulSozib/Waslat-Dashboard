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

interface CurrencyBreakdown {
    [currency: string]: {
        total_sale: number;
        total_profit: number;
        today_sale: number;
        today_profit: number;
    };
}

const Dashboard = () => {
    const { layoutConfig } = useContext(LayoutContext);
    const { data } = useSelector((state: any) => state.dashboardDataReducer);
    //const {userInfo}=useSelector((state:any)=>state.authReducer)
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}'); // Default to empty object
    const [lineOptions, setLineOptions] = useState<ChartOptions>({});
    const { t } = useTranslation();

    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        dispatch(fetchDashboardData());
        dispatch(_fetchPurchasedProducts());
    }, [dispatch]);

    useEffect(() => {
        //console.log(data);
    }, [dispatch, data]);

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

    return (
        <div className="grid -m-5">
            {/* Today Orders */}
            <div className="col-6 lg:col-6 xl:col-3">
                <div className="card mb-0 bg-gradient-to-r from-indigo-100 to-purple-200" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #dbeafe, #c7d2fe)' }}>
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
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #f3e8ff, #fbcfe8)' }}>
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
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #d1fae5, #99f6e4)' }}>
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
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #fef9c3, #fed7aa)' }}>
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
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #fae8ff, #e9d5ff)' }}>
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
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #fef9c3, #fef08a)' }}>
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
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #fee2e2, #fbcfe8)' }}>
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
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #cffafe, #99f6e4)' }}>
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
                <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #e0f2fe, #bfdbfe)' }}>
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
                <span className="block text-900 text-xl mb-3">{t('DASHBOARD.BALANCES')}</span>
                <span className="block text-700 text-medium">{t('DASHBOARD.BALANCES.HINT')}</span>
                <Divider />
            </div>

            {data?.balances_by_currency?.map((balance: any, index: number) => (
                <div key={index} className="col-6 lg:col-6 xl:col-4">
                    <div className="card mb-0" style={{ height: '140px', backgroundImage: 'linear-gradient(to right, #ecfccb, #bbf7d0)' }}>
                        <div className="flex justify-content-between mb-1">
                            <div>
                                <span className="block text-500 text-xs font-medium mb-2">{balance.currency_code}</span>
                                <div className="text-900 font-medium text-lg">{balance.total_balance}</div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default withAuth(Dashboard);
