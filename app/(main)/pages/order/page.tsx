'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Download, Eye, Loader2, RefreshCw, Settings2, X } from 'lucide-react';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button as PrimeButton } from 'primereact/button';
import { AppDispatch } from '@/app/redux/store';
import { _changeOrderStatus, _deleteOrder, _fetchOrders, _checkPaystoreStatus } from '@/app/redux/actions/orderActions';
import { _fetchCompanies } from '@/app/redux/actions/companyActions';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { Order } from '@/types/interface';
import withAuth from '../../authGuard';
import { generateOrderExcelFile } from '../../utilities/generateExcel';
import { PageHeader } from '@/components/admin/page-header';
import { FilterBar } from '@/components/admin/filter-bar';
import { FilterField, FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { cn } from '@/lib/utils';

type OrderFilters = {
    filter_status: number | null;
    filter_order_type: string | null;
    filter_service_category_type: string | null;
    filter_company_id: number | null;
    filter_service_id: number | null;
    filter_startdate: string | null;
    filter_enddate: string | null;
};

type StatusAction = {
    status: number;
    labelKey: string;
    tone: 'success' | 'danger' | 'warning';
    icon: 'check' | 'x' | 'loader';
};

const emptyFilters: OrderFilters = {
    filter_status: null,
    filter_order_type: null,
    filter_service_category_type: null,
    filter_company_id: null,
    filter_service_id: null,
    filter_startdate: null,
    filter_enddate: null
};

const orderTypeLabel = (t: any, orderType?: string | null, row?: any) => {
    const type = orderType || (row?.is_custom_recharge || row?.bundle?.is_custom_recharge ? 'custom_recharge' : 'bundle');
    if (type === 'custom_recharge') return t('ORDER.TYPE.CUSTOM_RECHARGE', { defaultValue: 'شارژ سفارشی' });
    if (type === 'mobile_topup') return t('ORDER.TYPE.MOBILE_TOPUP', { defaultValue: 'شارژ موبایل' });
    if (type === 'custom_topup') return t('ORDER.TYPE.CUSTOM_TOPUP', { defaultValue: 'شارژ سفارشی / موبایل' });
    return t('ORDER.TYPE.BUNDLE', { defaultValue: 'بسته' });
};

const isCustomTopupRow = (row: any) => {
    const type = row?.order_type;
    if (type === 'custom_recharge' || type === 'mobile_topup') return true;
    return !!(row?.is_custom_recharge || row?.bundle?.is_custom_recharge);
};

const orderPayableAmount = (row: any) => {
    const buying = row?.bundle?.buying_price ?? row?.payable_amount ?? row?.amount;
    if (buying === null || buying === undefined || buying === '') return '—';
    const currency = row?.bundle?.currency?.code || row?.bundle?.currency_code || '';
    const formatted = Number(buying).toLocaleString(undefined, { maximumFractionDigits: 4 });
    return currency ? `${formatted} ${currency}` : formatted;
};

const orderRequestedAmount = (row: any) => {
    if (!isCustomTopupRow(row)) return null;
    const amount = row?.bundle?.amount;
    if (amount === null || amount === undefined || amount === '') return null;
    return `${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} AFN`;
};

const statusLabel = (t: any, status?: number | string | null) => {
    const s = Number(status);
    if (s === 0) return t('ORDER.STATUS.PENDING');
    if (s === 1) return t('ORDER.STATUS.CONFIRMED');
    if (s === 2) return t('ORDER.STATUS.REJECTED');
    if (s === 3) return t('ORDER.STATUS.UNDER_PROCESS');
    return t('ORDER.STATUS.UNKNOWN', { defaultValue: '—' });
};

const statusVariant = (status?: number | string | null): 'warning' | 'success' | 'danger' | 'secondary' | 'muted' => {
    const s = Number(status);
    if (s === 0) return 'warning';
    if (s === 1) return 'success';
    if (s === 2) return 'danger';
    if (s === 3) return 'secondary';
    return 'muted';
};

/** Same rules as the old SplitButton on orders */
function getStatusActions(row: Order): StatusAction[] {
    const status = Number(row.status);
    const hasTxn = row.transaction_id !== null && row.transaction_id !== undefined;

    if (status === 0 || (!hasTxn && status === 1)) {
        return [
            { status: 1, labelKey: 'ORDER.STATUS.CONFIRMED', tone: 'success', icon: 'check' },
            { status: 3, labelKey: 'ORDER.STATUS.UNDER_PROCESS', tone: 'warning', icon: 'loader' },
            { status: 2, labelKey: 'ORDER.STATUS.REJECTED', tone: 'danger', icon: 'x' }
        ];
    }
    if (hasTxn && status === 1) {
        return [
            { status: 3, labelKey: 'ORDER.STATUS.UNDER_PROCESS', tone: 'warning', icon: 'loader' },
            { status: 2, labelKey: 'ORDER.STATUS.REJECTED', tone: 'danger', icon: 'x' }
        ];
    }
    if (status === 2) {
        return [
            { status: 1, labelKey: 'ORDER.STATUS.CONFIRMED', tone: 'success', icon: 'check' },
            { status: 3, labelKey: 'ORDER.STATUS.UNDER_PROCESS', tone: 'warning', icon: 'loader' }
        ];
    }
    if (status === 3) {
        return [
            { status: 1, labelKey: 'ORDER.STATUS.CONFIRMED', tone: 'success', icon: 'check' },
            { status: 2, labelKey: 'ORDER.STATUS.REJECTED', tone: 'danger', icon: 'x' }
        ];
    }
    return [];
}

function StatusActionIcon({ name }: { name: StatusAction['icon'] }) {
    if (name === 'check') return <Check className="waslat-nav-icon" />;
    if (name === 'x') return <X className="waslat-nav-icon" />;
    return <Loader2 className="waslat-nav-icon" />;
}

const OrderPage = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const toast = useRef<Toast>(null);

    const { orders, pagination, loading } = useSelector((state: any) => state.orderReducer);
    const { companies } = useSelector((state: any) => state.companyReducer);
    const { services } = useSelector((state: any) => state.serviceReducer);

    const [searchInput, setSearchInput] = useState('');
    const searchTag = useDebouncedValue(searchInput, 350);
    const [filterOpen, setFilterOpen] = useState(false);
    const [draftFilters, setDraftFilters] = useState<OrderFilters>(emptyFilters);
    const [activeFilters, setActiveFilters] = useState<OrderFilters>(emptyFilters);
    const [refreshing, setRefreshing] = useState(false);

    const [order, setOrder] = useState<Order>();
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [viewOrderDialog, setViewOrderDialog] = useState(false);
    const [deleteOrderDialog, setDeleteOrderDialog] = useState(false);
    const [statusChangeDialog, setStatusChangeDialog] = useState(false);
    const [rejectReasonDialog, setRejectReasonDialog] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // URL -> filters (status / order_type from dashboard cards)
    useEffect(() => {
        const statusParam = searchParams.get('status');
        const orderTypeParam = searchParams.get('order_type');
        let filter_status: number | null = null;
        if (statusParam === 'pending') filter_status = 0;
        if (statusParam === 'confirmed') filter_status = 1;
        if (statusParam === 'rejected') filter_status = 2;
        if (statusParam === 'under_process' || statusParam === 'processing') filter_status = 3;

        setActiveFilters((prev) => ({
            ...prev,
            filter_status: filter_status !== null ? filter_status : prev.filter_status,
            filter_order_type: orderTypeParam || prev.filter_order_type
        }));
        setDraftFilters((prev) => ({
            ...prev,
            ...(filter_status !== null ? { filter_status } : {}),
            ...(orderTypeParam ? { filter_order_type: orderTypeParam } : {})
        }));
    }, [searchParams]);

    useEffect(() => {
        dispatch(_fetchOrders(1, searchTag, compactFilters(activeFilters)));
    }, [activeFilters, searchTag, dispatch]);

    useEffect(() => {
        if (!filterOpen) return;
        if (!companies?.length) dispatch(_fetchCompanies());
        if (!services?.length) dispatch(_fetchServiceList());
    }, [filterOpen, companies?.length, services?.length, dispatch]);

    const chips = useMemo(() => {
        const list: { key: string; label: string }[] = [];
        if (activeFilters.filter_status !== null && activeFilters.filter_status !== undefined) {
            list.push({ key: 'filter_status', label: `وضعیت: ${statusLabel(t, activeFilters.filter_status)}` });
        }
        if (activeFilters.filter_order_type) {
            list.push({
                key: 'filter_order_type',
                label: `${t('ORDER.TABLE.COLUMN.ORDER_TYPE', { defaultValue: 'نوع سفارش' })}: ${orderTypeLabel(t, activeFilters.filter_order_type)}`
            });
        }
        if (activeFilters.filter_service_category_type) {
            list.push({
                key: 'filter_service_category_type',
                label: `نوع: ${activeFilters.filter_service_category_type === 'social' ? t('ORDER.FILTER.SOCIAL') : t('ORDER.FILTER.NONSOCIAL')}`
            });
        }
        if (activeFilters.filter_company_id) list.push({ key: 'filter_company_id', label: `شرکت: ${activeFilters.filter_company_id}` });
        if (activeFilters.filter_service_id) list.push({ key: 'filter_service_id', label: `سرویس: ${activeFilters.filter_service_id}` });
        if (activeFilters.filter_startdate) list.push({ key: 'filter_startdate', label: `از: ${activeFilters.filter_startdate}` });
        if (activeFilters.filter_enddate) list.push({ key: 'filter_enddate', label: `تا: ${activeFilters.filter_enddate}` });
        return list;
    }, [activeFilters, t]);

    const syncOrderUrl = (filters: OrderFilters) => {
        const params = new URLSearchParams();
        if (filters.filter_status === 0) params.set('status', 'pending');
        else if (filters.filter_status === 1) params.set('status', 'confirmed');
        else if (filters.filter_status === 2) params.set('status', 'rejected');
        else if (filters.filter_status === 3) params.set('status', 'under_process');
        if (filters.filter_order_type) params.set('order_type', filters.filter_order_type);
        const qs = params.toString();
        router.replace(qs ? `/pages/order?${qs}` : '/pages/order');
    };

    const applyFilters = () => {
        setActiveFilters(draftFilters);
        syncOrderUrl(draftFilters);
        setFilterOpen(false);
    };

    const clearFilters = () => {
        setDraftFilters(emptyFilters);
        setActiveFilters(emptyFilters);
        router.replace('/pages/order');
        setFilterOpen(false);
    };

    const removeChip = (key: string) => {
        const next = { ...activeFilters, [key]: null } as OrderFilters;
        setActiveFilters(next);
        setDraftFilters(next);
        syncOrderUrl(next);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(_fetchOrders(pagination?.page || 1, searchTag, compactFilters(activeFilters)) as any);
        setRefreshing(false);
    };

    const onPageChange = (page: number) => {
        dispatch(_fetchOrders(page, searchTag, compactFilters(activeFilters)));
    };

    const confirmChangeStatus = (row: Order, newStatus: number) => {
        setOrder(row);
        setSelectedStatus(newStatus);
        if (newStatus === 2) setRejectReasonDialog(true);
        else setStatusChangeDialog(true);
    };

    const changeOrderStatus = () => {
        if (!order?.id || selectedStatus === null) return;
        dispatch(_changeOrderStatus(order.id, selectedStatus as number, toast, t));
        setStatusChangeDialog(false);
    };

    const finalizeRejection = () => {
        if (!order?.id || selectedStatus === null) return;
        dispatch(_changeOrderStatus(order.id, selectedStatus as number, toast, t, rejectionReason));
        setRejectReasonDialog(false);
        setRejectionReason('');
    };

    const deleteOrder = () => {
        if (!order?.id) return;
        dispatch(_deleteOrder(order.id, toast, t));
        setDeleteOrderDialog(false);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.current?.show({ severity: 'success', summary: t('COPIED'), detail: t('TEXT_COPIED_TO_CLIPBOARD'), life: 2000 });
        });
    };

    const exportToExcel = async () => {
        await generateOrderExcelFile({ orders, t, toast, all: true, filters: compactFilters(activeFilters) });
    };

    const downloadOrderAsImage = () => {
        const modalElement = document.getElementById('order-view-modal');
        if (!modalElement || !selectedOrder) return;
        import('html2canvas').then((html2canvas) => {
            html2canvas
                .default(modalElement, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    useCORS: true,
                    logging: false
                })
                .then((canvas) => {
                    const link = document.createElement('a');
                    link.download = `order-${selectedOrder.id}-${new Date().toISOString().split('T')[0]}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                });
        });
    };

    const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 20)));

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <PageHeader
                title={t('MENU.ORDER', { defaultValue: 'سفارش‌ها' })}
                description="مدیریت، فیلتر و پیگیری سفارش‌ها"
                actions={
                    <>
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing || loading}>
                            <RefreshCw className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')} />
                            {t('REFRESH', { defaultValue: 'بروزرسانی' })}
                        </Button>
                        <Button variant="outline" size="sm" onClick={exportToExcel}>
                            <Download className="h-4 w-4" />
                            اکسل
                        </Button>
                    </>
                }
            />

            <FilterBar
                search={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder={t('ECOMMERCE.COMMON.SEARCH', { defaultValue: 'جستجو در سفارش‌ها...' })}
                chips={chips}
                onRemoveChip={removeChip}
                onClearAll={clearFilters}
                onOpenFilters={() => {
                    setDraftFilters(activeFilters);
                    setFilterOpen(true);
                }}
            />

            <Card className="overflow-hidden">
                <div className="waslat-table-scroll relative">
                    {loading ? <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-emerald-600" /> : null}
                    <table className="w-full min-w-[1400px] border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
                                <th className="w-[72px] px-3 py-2.5 text-xs font-semibold">عملیات</th>
                                <th className="w-[56px] px-2 py-2.5 text-xs font-semibold">{t('COPY', { defaultValue: 'کپی' })}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('ORDER.TABLE.COLUMN.STATUS')}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('ORDER.TABLE.COLUMN.ORDER_TYPE', { defaultValue: 'نوع سفارش' })}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('ORDER.TABLE.COLUMN.RESELLERNAME')}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('ORDER.TABLE.COLUMN.RECHARGEABLEACCOUNT')}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('ORDER.TABLE.COLUMN.PAYABLEAMOUNT')}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('TRANSACTION_STATUS', { defaultValue: 'وضعیت تراکنش' })}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('ORDER.TABLE.COLUMN.BUNDLETITLE')}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('ORDER.TABLE.COLUMN.REJECTREASON')}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('ORDER.TABLE.COLUMN.COMPANYNAME')}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('ORDER.TABLE.COLUMN.ORDEREDDATE')}</th>
                                <th className="px-3 py-2.5 text-xs font-semibold">{t('PERFORMED_BY', { defaultValue: 'انجام‌دهنده' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(orders || []).length === 0 ? (
                                <tr>
                                    <td colSpan={13} className="px-3 py-16 text-center text-muted-foreground">
                                        {t('DATA_TABLE.TABLE.NO_DATA', { defaultValue: 'داده‌ای یافت نشد' })}
                                    </td>
                                </tr>
                            ) : (
                                (orders || []).map((row: any) => {
                                    const isPaystore = !!row?.bundle?.service?.company?.uses_paystore || !!row?.uses_paystore;
                                    const statusActions = getStatusActions(row as Order);
                                    const hasTxn = row.transaction_id !== null && row.transaction_id !== undefined;
                                    return (
                                        <tr
                                            key={row.id}
                                            className="cursor-pointer border-b border-border/70 transition hover:bg-emerald-50/50"
                                            onClick={() => {
                                                setSelectedOrder(row);
                                                setViewOrderDialog(true);
                                            }}
                                        >
                                            <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-9 w-9 rounded-full border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                                                            disabled={statusActions.length === 0 && !isPaystore}
                                                            title={t('ACTIONS', { defaultValue: 'عملیات' })}
                                                        >
                                                            <Settings2 className="waslat-nav-icon" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start" className="min-w-[13rem]">
                                                        <DropdownMenuLabel>{t('ACTIONS', { defaultValue: 'عملیات' })}</DropdownMenuLabel>
                                                        {statusActions.map((action) => (
                                                            <DropdownMenuItem
                                                                key={action.status}
                                                                className={cn(
                                                                    'gap-2',
                                                                    action.tone === 'danger' && 'text-red-700 focus:text-red-700',
                                                                    action.tone === 'success' && 'text-emerald-700 focus:text-emerald-700'
                                                                )}
                                                                onClick={() => confirmChangeStatus(row, action.status)}
                                                            >
                                                                <StatusActionIcon name={action.icon} />
                                                                {t(action.labelKey)}
                                                            </DropdownMenuItem>
                                                        ))}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedOrder(row);
                                                                setViewOrderDialog(true);
                                                            }}
                                                        >
                                                            <Eye className="waslat-nav-icon" />
                                                            {t('ORDER_DETAILS', { defaultValue: 'مشاهده فیش' })}
                                                        </DropdownMenuItem>
                                                        {isPaystore ? (
                                                            <DropdownMenuItem onClick={() => dispatch(_checkPaystoreStatus(row.id, toast, t))}>
                                                                <RefreshCw className="waslat-nav-icon" />
                                                                {t('CHECK_PAYSTORE_STATUS')}
                                                            </DropdownMenuItem>
                                                        ) : null}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                            <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                                                    title={t('COPY_ALL_DETAILS', { defaultValue: 'کپی جزئیات' })}
                                                    onClick={() => copyOrderDetails(row, t, copyToClipboard)}
                                                >
                                                    <Copy className="waslat-nav-icon" />
                                                </Button>
                                            </td>
                                            <td className="px-3 py-2">
                                                <Badge variant={statusVariant(row.status)}>{statusLabel(t, row.status)}</Badge>
                                            </td>
                                            <td className="px-3 py-2">
                                                <Badge variant={isCustomTopupRow(row) ? 'warning' : 'secondary'}>
                                                    {orderTypeLabel(t, row.order_type, row)}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-2 text-start text-muted-foreground">{row.reseller?.reseller_name || row.reseller_name || '—'}</td>
                                            <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 shrink-0 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                                                        title={t('COPY_RECHARGEABLE_ACCOUNT', { defaultValue: 'کپی شماره حساب' })}
                                                        onClick={() => copyToClipboard(String(row.rechargeble_account || '').trim())}
                                                    >
                                                        <Copy className="waslat-nav-icon" />
                                                    </Button>
                                                    <span className="font-medium tabular-nums">{row.rechargeble_account || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="tabular-nums">{orderPayableAmount(row)}</div>
                                                {orderRequestedAmount(row) ? (
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {t('ORDER.REQUESTED_AFN', { defaultValue: 'مبلغ درخواستی' })}: {orderRequestedAmount(row)}
                                                    </div>
                                                ) : null}
                                            </td>
                                            <td className="px-3 py-2 text-xs">
                                                {hasTxn ? (
                                                    <span className="text-emerald-600">{t('TRANSACTION_HAS_BEEN_CREATED', { defaultValue: 'تراکنش ایجاد شده' })}</span>
                                                ) : (
                                                    <span className="italic text-red-500">{t('TRANSACTION_HAS_NOT_BEEN_CREATED', { defaultValue: 'تراکنش ایجاد نشده' })}</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-start">{row.bundle?.bundle_title || row.bundle_title || '—'}</td>
                                            <td className="max-w-[160px] truncate px-3 py-2 text-start text-xs text-red-600">
                                                {row.reject_reason || row.rejected_reason || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-start">{row.bundle?.service?.company?.company_name || row.company_name || '—'}</td>
                                            <td className="px-3 py-2 tabular-nums text-muted-foreground">{formatDate(row.created_at)}</td>
                                            <td className="px-3 py-2 text-start text-muted-foreground">{row.performed_by_name || '—'}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-muted-foreground">
                        صفحه {pagination?.page || 1} از {totalPages} · مجموع {pagination?.total || 0}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={(pagination?.page || 1) <= 1} onClick={() => onPageChange((pagination?.page || 1) - 1)}>
                            قبلی
                        </Button>
                        <Button variant="outline" size="sm" disabled={(pagination?.page || 1) >= totalPages} onClick={() => onPageChange((pagination?.page || 1) + 1)}>
                            بعدی
                        </Button>
                    </div>
                </div>
            </Card>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side="left" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{t('ORDER.FILTER.FILTER', { defaultValue: 'فیلتر سفارش‌ها' })}</SheetTitle>
                        <SheetDescription>فیلترها روی نتایج سرور اعمال می‌شوند.</SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <FilterField label={t('ORDER.FILTER.STATUS')}>
                            <Select
                                value={draftFilters.filter_status === null || draftFilters.filter_status === undefined ? undefined : String(draftFilters.filter_status)}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_status: Number(v) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ORDER.FILTER.SELECT_STATUS')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">{t('ORDER.STATUS.PENDING')}</SelectItem>
                                    <SelectItem value="1">{t('ORDER.STATUS.CONFIRMED')}</SelectItem>
                                    <SelectItem value="2">{t('ORDER.STATUS.REJECTED')}</SelectItem>
                                    <SelectItem value="3">{t('ORDER.STATUS.UNDER_PROCESS')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>

                        <FilterField label={t('ORDER.FILTER.ORDER_TYPE', { defaultValue: 'نوع سفارش' })}>
                            <Select
                                value={draftFilters.filter_order_type || undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_order_type: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ORDER.FILTER.SELECT_ORDER_TYPE', { defaultValue: 'انتخاب نوع سفارش' })} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="custom_topup">{t('ORDER.TYPE.CUSTOM_TOPUP', { defaultValue: 'شارژ سفارشی / موبایل' })}</SelectItem>
                                    <SelectItem value="custom_recharge">{t('ORDER.TYPE.CUSTOM_RECHARGE', { defaultValue: 'شارژ سفارشی' })}</SelectItem>
                                    <SelectItem value="mobile_topup">{t('ORDER.TYPE.MOBILE_TOPUP', { defaultValue: 'شارژ موبایل' })}</SelectItem>
                                    <SelectItem value="bundle">{t('ORDER.TYPE.BUNDLE', { defaultValue: 'بسته' })}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>

                        <FilterField label={t('ORDER.FILTER.BUNDLE_TYPE')}>
                            <Select
                                value={draftFilters.filter_service_category_type || undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_service_category_type: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ORDER.FILTER.SELECT_TYPE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="social">{t('ORDER.FILTER.SOCIAL')}</SelectItem>
                                    <SelectItem value="nonsocial">{t('ORDER.FILTER.NONSOCIAL')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FilterField>

                        <FilterField label={t('ORDER.FILTER.COMPANY')}>
                            <Select
                                value={draftFilters.filter_company_id ? String(draftFilters.filter_company_id) : undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_company_id: Number(v) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ORDER.FILTER.SELECT_COMPANY')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(companies || []).map((c: any) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FilterField>

                        <FilterField label={t('ORDER.FILTER.SERVICE')}>
                            <Select
                                value={draftFilters.filter_service_id ? String(draftFilters.filter_service_id) : undefined}
                                onValueChange={(v) => setDraftFilters((p) => ({ ...p, filter_service_id: Number(v) }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('ORDER.FILTER.SELECT_SERVICE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(services || []).map((s: any) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.service_name || `${s.service_category?.category_name || ''} - ${s.company?.company_name || ''}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FilterField>

                        <FilterField label={t('ORDER.FILTER.START_DATE')}>
                            <Input
                                type="date"
                                value={draftFilters.filter_startdate || ''}
                                onChange={(e) => setDraftFilters((p) => ({ ...p, filter_startdate: e.target.value || null }))}
                            />
                        </FilterField>
                        <FilterField label={t('ORDER.FILTER.END_DATE')}>
                            <Input
                                type="date"
                                value={draftFilters.filter_enddate || ''}
                                onChange={(e) => setDraftFilters((p) => ({ ...p, filter_enddate: e.target.value || null }))}
                            />
                        </FilterField>

                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1" onClick={applyFilters}>
                                اعمال فیلتر
                            </Button>
                            <Button className="flex-1" variant="secondary" onClick={clearFilters}>
                                بازنشانی
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Keep Prime dialogs for critical confirms (stable behavior) */}
            <Dialog
                visible={deleteOrderDialog}
                style={{ width: '450px' }}
                header={t('TABLE.GENERAL.CONFIRM')}
                modal
                footer={
                    <>
                        <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" text onClick={() => setDeleteOrderDialog(false)} />
                        <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" text onClick={deleteOrder} />
                    </>
                }
                onHide={() => setDeleteOrderDialog(false)}
            >
                <div className="flex items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-2xl text-red-500" />
                    <span>
                        {t('ARE_YOU_SURE_YOU_WANT_TO_DELETE')} <b>{order?.rechargeble_account}</b>
                    </span>
                </div>
            </Dialog>

            <Dialog
                visible={statusChangeDialog}
                style={{ width: '450px' }}
                header={t('TABLE.GENERAL.CONFIRM')}
                modal
                footer={
                    <>
                        <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" onClick={() => setStatusChangeDialog(false)} />
                        <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" onClick={changeOrderStatus} />
                    </>
                }
                onHide={() => setStatusChangeDialog(false)}
            >
                <div className="flex items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-2xl text-amber-500" />
                    <span>
                        {t('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_STATUS')} <b>{order?.rechargeble_account}</b> → {statusLabel(t, selectedStatus ?? undefined)}
                    </span>
                </div>
            </Dialog>

            <Dialog
                visible={rejectReasonDialog}
                style={{ width: '450px' }}
                header={t('ORDER.TABLE.COLUMN.REJECTREASON')}
                modal
                footer={
                    <>
                        <PrimeButton label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" text onClick={() => setRejectReasonDialog(false)} />
                        <PrimeButton label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" text onClick={finalizeRejection} />
                    </>
                }
                onHide={() => setRejectReasonDialog(false)}
            >
                <div className="space-y-3">
                    <label className="text-sm">{t('ORDER.TABLE.COLUMN.REJECTREASON')}</label>
                    <Textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="w-full" />
                </div>
            </Dialog>

            <Dialog
                visible={viewOrderDialog}
                header={null}
                modal
                closable={false}
                dismissableMask
                onHide={() => setViewOrderDialog(false)}
                contentClassName="p-0"
                className="waslat-order-slip-dialog"
            >
                {selectedOrder ? (
                    <OrderSlip
                        order={selectedOrder}
                        t={t}
                        onClose={() => setViewOrderDialog(false)}
                        onDownload={downloadOrderAsImage}
                    />
                ) : null}
            </Dialog>
        </div>
    );
};

function SlipRow({ label, value, strong }: { label: string; value: React.ReactNode; strong?: boolean }) {
    return (
        <div className="flex items-baseline justify-between gap-2 border-b border-dotted border-neutral-300 py-1">
            <span className="shrink-0 text-[10px] text-neutral-500">{label}</span>
            <span
                className={cn(
                    'min-w-0 text-end text-[11px] font-semibold leading-tight text-neutral-800',
                    strong && 'text-[13px] font-bold tabular-nums tracking-wide'
                )}
            >
                {value}
            </span>
        </div>
    );
}

function OrderSlip({
    order,
    t,
    onClose,
    onDownload
}: {
    order: Order;
    t: any;
    onClose: () => void;
    onDownload: () => void;
}) {
    const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'Waslat';
    const logo = process.env.NEXT_PUBLIC_PROJECT_LOGO;
    const status = Number(order.status);
    const statusTone =
        status === 1 ? 'bg-emerald-600' : status === 2 ? 'bg-red-500' : status === 3 ? 'bg-sky-600' : 'bg-amber-500';
    const validity =
        (order as any).bundle?.validity_type === 'weekly'
            ? t('WEEKLY')
            : (order as any).bundle?.validity_type === 'monthly'
              ? t('MONTHLY')
              : (order as any).bundle?.validity_type === 'daily'
                ? t('DAILY')
                : '—';
    const created = (order as any).created_at ? new Date((order as any).created_at) : null;
    const amount = orderPayableAmount(order);
    const requested = orderRequestedAmount(order);
    const rejectReason = (order as any).reject_reason || (order as any).rejected_reason;
    const dateStr = created ? created.toLocaleDateString('fa-IR') : '—';
    const timeStr = created
        ? created.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false })
        : '—';

    return (
        <div id="order-view-modal" className="flex h-full min-h-0 flex-col bg-white font-sans text-neutral-900">
            {/* Thermal-receipt header */}
            <div className="shrink-0 border-b border-dashed border-neutral-300 px-2.5 pb-2 pt-2.5 text-center">
                {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt={projectName} className="mx-auto mb-1 h-6 w-6 object-contain" />
                ) : null}
                <div className="text-[13px] font-bold leading-tight">{projectName}</div>
                <div className="text-[10px] text-neutral-500">{t('ORDER_DETAILS', { defaultValue: 'فیش سفارش' })}</div>
                <div className={cn('mt-1.5 inline-block rounded px-2 py-0.5 text-[9px] font-bold text-white', statusTone)}>
                    {statusLabel(t, status)}
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-between px-2.5 py-2">
                <div className="space-y-0">
                    <SlipRow label={t('ORDER_ID', { defaultValue: 'شماره' })} value={`#${order.id}`} />
                    <SlipRow
                        label={t('ORDER.TABLE.COLUMN.ORDER_TYPE', { defaultValue: 'نوع سفارش' })}
                        value={orderTypeLabel(t, (order as any).order_type, order)}
                    />
                    <SlipRow label={t('ORDER.TABLE.COLUMN.BUNDLETITLE')} value={(order as any).bundle?.bundle_title || '—'} />
                    <SlipRow label={t('ORDER.TABLE.COLUMN.RECHARGEABLEACCOUNT')} value={order.rechargeble_account || '—'} strong />
                    <SlipRow label={t('VALIDITY', { defaultValue: 'اعتبار' })} value={validity} />
                    <SlipRow
                        label={t('ORDER.TABLE.COLUMN.COMPANYNAME')}
                        value={(order as any).bundle?.service?.company?.company_name || (order as any).company_name || '—'}
                    />
                    <SlipRow label={t('ORDER.TABLE.COLUMN.ORDEREDDATE')} value={`${dateStr} · ${timeStr}`} />
                    {requested ? <SlipRow label={t('ORDER.REQUESTED_AFN', { defaultValue: 'مبلغ درخواستی' })} value={requested} /> : null}

                    <div className="mt-2 flex items-center justify-between border-y border-dashed border-neutral-400 py-2">
                        <span className="text-[11px] font-bold">{t('ORDER.TABLE.COLUMN.PAYABLEAMOUNT')}</span>
                        <span className="text-[15px] font-bold tabular-nums text-emerald-700">{amount}</span>
                    </div>

                    {status === 2 && rejectReason ? (
                        <div className="mt-1.5 text-start text-[10px] leading-snug text-red-600">
                            <span className="font-semibold">{t('ORDER.TABLE.COLUMN.REJECTREASON')}: </span>
                            {rejectReason}
                        </div>
                    ) : null}
                </div>

                <div className="pt-3 text-center text-[9px] text-neutral-400">*** {projectName} ***</div>
            </div>

            <div className="flex shrink-0 items-center justify-end gap-1 border-t border-dashed border-neutral-300 px-2 py-1.5">
                <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-[11px]" onClick={onClose}>
                    {t('APP.GENERAL.CANCEL', { defaultValue: 'بستن' })}
                </Button>
                <Button type="button" size="sm" className="h-7 gap-1 bg-emerald-600 px-2 text-[11px] hover:bg-emerald-700" onClick={onDownload}>
                    <Download className="waslat-nav-icon" />
                    {t('DOWNLOAD', { defaultValue: 'دانلود' })}
                </Button>
            </div>
        </div>
    );
}

function compactFilters(filters: OrderFilters) {
    const out: Record<string, string | number> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') out[key] = value as string | number;
    });
    return out;
}

function formatDate(value?: string) {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('fa-IR');
    } catch {
        return value;
    }
}

/** Old copy column — account + bundle + company details */
function copyOrderDetails(row: any, t: any, copyToClipboard: (text: string) => void) {
    const dataToCopy = `
📋 ${t('ORDER_DETAILS', { defaultValue: 'جزئیات سفارش' })}
----------------
🔹 ${t('ORDER.TABLE.COLUMN.RECHARGEABLEACCOUNT')}: ${row.rechargeble_account || '-'}
🔹 ${t('ORDER.TABLE.COLUMN.BUNDLETITLE')}: ${row.bundle?.bundle_title || row.bundle_title || '-'}
🔹 ${t('ORDER.TABLE.COLUMN.COMPANYNAME')}: ${row.bundle?.service?.company?.company_name || row.company_name || '-'}
        `.trim();
    copyToClipboard(dataToCopy);
}

export default withAuth(OrderPage);
