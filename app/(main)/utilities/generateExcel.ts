import { Country, Reseller } from '@/types/interface';
import axios from 'axios';
import * as XLSX from 'xlsx';

const getAuthToken = () => {
    return localStorage.getItem('api_token') || '';
};

// Helper function to fetch paginated orders
const fetchOrdersWithPagination = async (
    page: number,
    itemsPerPage: number,
    token: string,
    resellerId?: number,
    filters?: Record<string, any>
) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    queryParams.append('page', String(page));
    queryParams.append('items_per_page', String(itemsPerPage));
    
    // Add filters
    Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            queryParams.append(key, String(value));
        }
    });

    const endpoint = resellerId 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${resellerId}/orders?${queryParams.toString()}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/orders?${queryParams.toString()}`;

    const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return {
        orders: response.data?.data?.orders || [],
        pagination: response.data?.payload?.pagination || { total: 0 }
    };
};

export const generateOrderExcelFile = async ({
    orders,
    resellerId,
    t,
    toast,
    all = false,
    filters = {},
}: {
    orders?: any[];
    resellerId?: number;
    t: any;
    toast: any;
    all?: boolean;
    filters?: Record<string, any>;
}) => {
    try {
        let exportOrders: any[] = orders || [];
        
        // If "all" flag is set, fetch ALL orders with pagination
        if (all) {
            const token = getAuthToken();
            if (!token) {
                toast.current?.show({
                    severity: 'error',
                    summary: t('EXPORTS.ERROR'),
                    detail: t('AUTH_TOKEN_MISSING'),
                    life: 3000,
                });
                return;
            }

            // First, fetch first page to get total count
            const firstBatch = await fetchOrdersWithPagination(
                1,
                1, // Just need pagination info
                token,
                resellerId,
                filters
            );
            
            const totalOrders = firstBatch.pagination.total;
            
            if (totalOrders === 0) {
                toast.current?.show({
                    severity: 'warn',
                    summary: t('EXPORTS.WARNING'),
                    detail: t('EXPORTS.NO_DATA'),
                    life: 3000,
                });
                return;
            }

            // Show progress notification
            toast.current?.show({
                severity: 'info',
                summary: t('EXPORTS.PROCESSING'),
                detail: `${t('EXPORTS.FOUND')} ${totalOrders} ${t('EXPORTS.ORDERS')}. ${t('EXPORTS.STARTING')}...`,
                life: 5000,
            });

            // Calculate number of batches (1000 records per batch)
            const itemsPerPage = 1000;
            const totalPages = Math.ceil(totalOrders / itemsPerPage);
            
            // Initialize array for all orders
            exportOrders = [];
            
            // Show progress indicator
            let progressToast: any = null;
            if (totalPages > 1) {
                progressToast = toast.current?.show({
                    severity: 'info',
                    summary: t('EXPORTS.PROCESSING'),
                    detail: `0/${totalPages} ${t('EXPORTS.PAGES')} ${t('EXPORTS.FETCHED')}`,
                    sticky: true,
                });
            }

            // Fetch all batches
            for (let page = 1; page <= totalPages; page++) {
                try {
                    // Update progress
                    if (progressToast && totalPages > 1) {
                        progressToast.update({
                            detail: `${page}/${totalPages} ${t('EXPORTS.PAGES')} ${t('EXPORTS.FETCHED')}`,
                        });
                    }

                    // Fetch batch
                    const batch = await fetchOrdersWithPagination(
                        page,
                        itemsPerPage,
                        token,
                        resellerId,
                        filters
                    );

                    exportOrders = [...exportOrders, ...batch.orders];
                    
                    // Optional: Add small delay to prevent rate limiting
                    if (page < totalPages) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                } catch (error) {
                    console.error(`Error fetching page ${page}:`, error);
                    // Continue with next page if one fails
                    continue;
                }
            }

            // Close progress toast
            if (progressToast) {
                toast.current?.remove(progressToast);
            }

            if (exportOrders.length === 0) {
                toast.current?.show({
                    severity: 'warn',
                    summary: t('EXPORTS.WARNING'),
                    detail: t('EXPORTS.NO_DATA'),
                    life: 3000,
                });
                return;
            }

            // Show success message for fetching
            toast.current?.show({
                severity: 'success',
                summary: t('EXPORTS.FETCH_COMPLETE'),
                detail: `${t('EXPORTS.SUCCESSFULLY_FETCHED')} ${exportOrders.length} ${t('EXPORTS.ORDERS')}`,
                life: 3000,
            });
        }

        // If no orders to export
        if (!exportOrders || exportOrders.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('EXPORTS.WARNING'),
                detail: t('EXPORTS.NO_DATA'),
                life: 3000,
            });
            return;
        }

        // Show processing message for Excel generation
        const processingToast = toast.current?.show({
            severity: 'info',
            summary: t('EXPORTS.PROCESSING'),
            detail: `${t('EXPORTS.GENERATING_EXCEL')} ${exportOrders.length} ${t('EXPORTS.RECORDS')}...`,
            sticky: true,
        });

        // Transform data for Excel
        const exportData = exportOrders.map((order: any) => ({
            [t('ORDER.TABLE.COLUMN.ID')]: order.id,
            [t('ORDER.TABLE.COLUMN.RESELLERNAME')]: order.reseller?.reseller_name || '',
            [t('ORDER.TABLE.COLUMN.RECHARGEABLEACCOUNT')]: order.rechargeble_account || '',
            [t('ORDER.TABLE.COLUMN.BUNDLEID')]: order.bundle?.id || '',
            [t('ORDER.TABLE.COLUMN.PAYABLEAMOUNT')]: order.bundle?.buying_price || '',
            [t('ORDER.TABLE.COLUMN.BUNDLETITLE')]: order.bundle?.bundle_title || '',
            [t('ORDER.TABLE.COLUMN.REJECTREASON')]: order.reject_reason || '',
            [t('ORDER.TABLE.COLUMN.COMPANYNAME')]: order.bundle?.service?.company?.company_name || '',
            [t('ORDER.TABLE.COLUMN.CATEGORYNAME')]: order.bundle?.service?.service_category?.category_name || '',
            [t('ORDER.TABLE.COLUMN.ORDEREDDATE')]: new Date(order.created_at).toLocaleString(),
            [t('ORDER.TABLE.COLUMN.STATUS')]:
                order.status === '0'
                    ? t('ORDER.STATUS.PENDING')
                    : order.status === '1'
                    ? t('ORDER.STATUS.CONFIRMED')
                    : order.status === '2'
                    ? t('ORDER.STATUS.REJECTED')
                    : order.status === '3'
                    ? t('ORDER.STATUS.UNDER_PROCESS')
                    : '',
            [t('TRANSACTION_ID')]: order.transaction_id || '',
            [t('PERFORMED_BY')]: order.performed_by_name || '',
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 8 },    // ID
            { wch: 20 },   // Reseller Name
            { wch: 25 },   // Rechargeable Account
            { wch: 10 },   // Bundle ID
            { wch: 15 },   // Payable Amount
            { wch: 30 },   // Bundle Title
            { wch: 30 },   // Reject Reason
            { wch: 20 },   // Company Name
            { wch: 20 },   // Category Name
            { wch: 20 },   // Ordered Date
            { wch: 15 },   // Status
            { wch: 20 },   // Transaction ID
            { wch: 20 },   // Performed By
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, t('ORDERS'));

        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        const fileName = `${resellerId ? `Reseller_${resellerId}_` : 'All_'}Orders_${timestamp}.xlsx`;
        
        // Save file
        XLSX.writeFile(wb, fileName);

        // Close processing toast
        if (processingToast) {
            toast.current?.remove(processingToast);
        }

        // Show success message
        toast.current?.show({
            severity: 'success',
            summary: t('EXPORTS.SUCCESS'),
            detail: `${t('EXPORTS.SUCCESS_DETAIL')} ${exportOrders.length} ${t('EXPORTS.RECORDS')}`,
            life: 5000,
        });

    } catch (error) {
        console.error('Export error:', error);
        toast.current?.show({
            severity: 'error',
            summary: t('EXPORTS.ERROR'),
            detail: t('EXPORTS.ERROR_DETAIL'),
            life: 3000,
        });
    }
};




export const generateBalanceExcelFile = async ({
    balances,
    resellerId,
    t,
    toast,
    all = false,
    filters = {},
}: {
    balances?: any[];
    resellerId?: number;
    t: any;
    toast: any;
    all?: boolean;
    filters?: Record<string, any>;
}) => {
    try {
        let exportBalances = balances || [];

        // Fetch all balances if "all" flag is set
        if (all) {
            const token = getAuthToken();
            const queryParams = new URLSearchParams();

            Object.entries(filters || {}).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    queryParams.append(key, String(value));
                }
            });

            if (!resellerId) {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/balances?${queryParams.toString()}&filter_isexport=${all}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!balances || balances.length === 0) {
                    exportBalances = response.data?.data?.balances || [];
                }

            } else {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${resellerId}/balances?${queryParams.toString()}&filter_isexport=${all}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                exportBalances = response.data?.data?.balances || [];
            }
        }

        if (!exportBalances || exportBalances.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('EXPORTS.WARNING'),
                detail: t('EXPORTS.NO_DATA'),
                life: 3000,
            });
            return;
        }

        // Transform data
        const exportData = exportBalances.map((balance: any) => {
            const formattedDate = new Date(balance.created_at);
            const date = formattedDate.toLocaleDateString();
            const time = formattedDate.toLocaleTimeString();

            return {
                [t('BALANCE.TABLE.COLUMN.ID')]: balance.id,
                [t('BALANCE.TABLE.COLUMN.RESELLER')]: balance.reseller?.reseller_name || '',
                [t('BALANCE.TABLE.COLUMN.AMOUNT')]: balance.amount,
                [t('BALANCE.TABLE.COLUMN.CURRENCY')]: balance.currency?.code || '',
                [t('BALANCE.TABLE.COLUMN.REMAINING_BALANCE')]: balance.remaining_balance,
                [t('BALANCE.TABLE.COLUMN.STATUS')]: balance.transaction_type === 'credit'
                    ? t('CREDIT')
                    : t('DEBIT'),
                [t('BALANCE.TABLE.COLUMN.DESCRIPTIONS')]: balance.description || '',
                [t('BALANCE.TABLE.COLUMN.BALANCEDATE')]: `${date} ${time}`,

            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [
            { wch: 8 },  // ID
            { wch: 20 }, // Reseller
            { wch: 15 }, // Amount
            { wch: 10 }, // Currency
            { wch: 20 }, // Remaining Balance
            { wch: 15 }, // Status
            { wch: 30 }, // Description
            { wch: 20 }, // Date

        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, t('BALANCES'));

        const fileName = `${resellerId ? `Reseller_${resellerId}_` : 'All_'}Balances_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast.current?.show({
            severity: 'success',
            summary: t('EXPORTS.SUCCESS'),
            detail: t('EXPORTS.SUCCESS_DETAIL'),
            life: 3000,
        });
    } catch (error) {
        console.error('Export error:', error);
        toast.current?.show({
            severity: 'error',
            summary: t('EXPORTS.ERROR'),
            detail: t('EXPORTS.ERROR_DETAIL'),
            life: 3000,
        });
    }
};


export const generatePaymentExcelFile = async ({
    payments,
    resellerId,
    t,
    toast,
    all = false,
    filters = {},
}: {
    payments?: any[];
    resellerId?: number;
    t: any;
    toast: any;
    all?: boolean;
    filters?: Record<string, any>;
}) => {
    try {
        let exportPayments = payments || [];

        // Fetch all payments if "all" flag is set
        if (all) {
            const token = getAuthToken();
            const queryParams = new URLSearchParams();

            Object.entries(filters || {}).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    queryParams.append(key, String(value));
                }
            });

            if (!resellerId) {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/payments?${queryParams.toString()}&filter_isexport=${all}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!payments || payments.length === 0) {
                    exportPayments = response.data?.data?.payments || [];
                }

            } else {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${resellerId}/payments?${queryParams.toString()}&filter_isexport=${all}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                exportPayments = response.data?.data?.payments || [];
            }
        }

        if (!exportPayments || exportPayments.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('EXPORTS.WARNING'),
                detail: t('EXPORTS.NO_DATA'),
                life: 3000,
            });
            return;
        }

        // Transform data
        const exportData = exportPayments.map((payment: any) => {
            const paymentDate = new Date(payment.payment_date);
            const formattedDate = paymentDate.toLocaleDateString();
            const formattedTime = paymentDate.toLocaleTimeString();

            return {
                [t('PAYMENT.TABLE.COLUMN.ID')]: payment.id,
                [t('PAYMENT.TABLE.COLUMN.RESELLER')]: payment.reseller?.reseller_name || '',
                [t('PAYMENT.TABLE.COLUMN.PAYMENTMETHOD')]: payment.payment_method?.method_name || '',
                [t('PAYMENT.TABLE.COLUMN.AMOUNT')]: payment.amount,
                [t('PAYMENT.TABLE.COLUMN.CURRENCY')]: payment.currency?.code || '',
                [t('PAYMENT.TABLE.COLUMN.REMAININGPAYMENTAMOUNT')]: payment.remaining_payment_amount,
                [t('PAYMENT.TABLE.COLUMN.STATUS')]: payment.status,
                [t('PAYMENT.TABLE.COLUMN.NOTES')]: payment.notes || '',
                [t('PAYMENT.TABLE.COLUMN.PAYMENTDATE')]: `${formattedDate} ${formattedTime}`,
                [t('TRANSACTION_ID')]: payment.transaction_id || '',
                [t('CREATED_AT')]: new Date(payment.created_at).toLocaleString()
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [
            { wch: 8 },   // ID
            { wch: 20 },  // Reseller
            { wch: 20 },  // Payment Method
            { wch: 15 },  // Amount
            { wch: 10 },  // Currency
            { wch: 20 },  // Remaining Payment
            { wch: 15 },  // Status
            { wch: 30 },  // Notes
            { wch: 20 },  // Payment Date
            { wch: 20 },  // Transaction ID
            { wch: 20 }   // Created At
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, t('PAYMENTS'));

        const fileName = `${resellerId ? `Reseller_${resellerId}_` : 'All_'}Payments_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast.current?.show({
            severity: 'success',
            summary: t('EXPORTS.SUCCESS'),
            detail: t('EXPORTS.SUCCESS_DETAIL'),
            life: 3000,
        });
    } catch (error) {
        console.error('Export error:', error);
        toast.current?.show({
            severity: 'error',
            summary: t('EXPORTS.ERROR'),
            detail: t('EXPORTS.ERROR_DETAIL'),
            life: 3000,
        });
    }
};





export const generateTransactionExcelFile = async ({
    transactions,
    resellerId,
    t,
    toast,
    all = false,
    filters = {},
}: {
    transactions?: any[];
    resellerId?: number;
    t: any;
    toast: any;
    all?: boolean;
    filters?: Record<string, any>;
}) => {
    try {
        let exportTransactions = transactions || [];

        // Fetch all transactions if "all" flag is set
        if (all) {
            const token = getAuthToken();
            const queryParams = new URLSearchParams();

            Object.entries(filters || {}).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    queryParams.append(key, String(value));
                }
            });

            if (!resellerId) {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/transactions?${queryParams.toString()}&filter_isexport=${all}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!transactions || transactions.length === 0) {
                    exportTransactions = response.data?.data?.reseller_balance_transactions || [];
                }

            } else {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${resellerId}/transactions?${queryParams.toString()}&filter_isexport=${all}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                exportTransactions = response.data?.data?.transactions || [];
            }
        }

        if (!exportTransactions || exportTransactions.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('EXPORTS.WARNING'),
                detail: t('EXPORTS.NO_DATA'),
                life: 3000,
            });
            return;
        }

        // Transform data
        const exportData = exportTransactions.map((transaction: any) => {
            const transactionDate = new Date(transaction.created_at);
            const formattedDate = transactionDate.toLocaleDateString();
            const formattedTime = transactionDate.toLocaleTimeString();

            // Define transaction type message
            const getTransactionType = (type: string | null) => {
                switch (type) {
                    case 'credit':
                        return t('CREDIT');
                    case 'debit':
                        return t('DEBIT');
                    default:
                        return t('UNKNOWN');
                }
            };

            return {
                [t('TRANSACTION.TABLE.COLUMN.ID')]: transaction.id,
                [t('TRANSACTION.TABLE.COLUMN.RESELLERNAME')]: transaction.reseller?.reseller_name || '',
                [t('TRANSACTION.TABLE.COLUMN.AMOUNT')]: parseFloat(transaction.amount).toFixed(2),
                [t('TRANSACTION.TABLE.COLUMN.CURRENCY')]: transaction.currency?.name || '',
                [t('TRANSACTION.TABLE.COLUMN.REMAININGBALANCE')]: transaction.remaining_balance,
                [t('TRANSACTION.TABLE.COLUMN.STATUS')]: getTransactionType(transaction.status),
                [t('TRANSACTION.TABLE.COLUMN.INITIATORTYPE')]:
                    transaction.initiator_type === 'App\\Models\\User'
                        ? t('RESELLER')
                        : transaction.initiator_type || '',
                [t('TRANSACTION.TABLE.COLUMN.DESCRIPTION')]: transaction.transaction_reason || '',
                [t('TRANSACTION.TABLE.COLUMN.TRANSACTIONEDDATE')]: `${formattedDate} ${formattedTime}`,
                [t('TRANSACTION_TYPE')]: transaction.status || '',

            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [
            { wch: 8 },   // ID
            { wch: 20 },  // Reseller Name
            { wch: 15 },  // Amount
            { wch: 10 },  // Currency
            { wch: 20 },  // Remaining Balance
            { wch: 15 },  // Status
            { wch: 20 },  // Initiator Type
            { wch: 30 },  // Description
            { wch: 20 },  // Transaction Date
            { wch: 15 },  // Transaction Type (raw)

        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, t('TRANSACTIONS'));

        const fileName = `${resellerId ? `Reseller_${resellerId}_` : 'All_'}Transactions_${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast.current?.show({
            severity: 'success',
            summary: t('EXPORTS.SUCCESS'),
            detail: t('EXPORTS.SUCCESS_DETAIL'),
            life: 3000,
        });
    } catch (error) {
        console.error('Export error:', error);
        toast.current?.show({
            severity: 'error',
            summary: t('EXPORTS.ERROR'),
            detail: t('EXPORTS.ERROR_DETAIL'),
            life: 3000,
        });
    }
};


export const generateSubResellerExcelFile = async ({
    sub_resellers,
    resellerId,
    t,
    toast,
    all = false,
    filters = {},
}: {
    sub_resellers?: Reseller[];
    resellerId?: number;
    t: any;
    toast: any;
    all?: boolean;
    filters?: Record<string, any>;
}) => {
    try {
        let exportSubResellers = sub_resellers || [];

        // Fetch all sub-resellers if "all" flag is set
        if (all) {
            const token = getAuthToken();
            const queryParams = new URLSearchParams();

            Object.entries(filters || {}).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    queryParams.append(key, String(value));
                }
            });

            if (resellerId) {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${resellerId}/sub-resellers?${queryParams.toString()}&filter_isexport=${all}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (!sub_resellers || sub_resellers.length === 0) {
                    exportSubResellers = response.data?.data?.sub_resellers || [];
                }

            } else {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/resellers?${queryParams.toString()}&filter_isexport=${all}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                exportSubResellers = response.data?.data?.resellers || [];
            }


        }

        if (!exportSubResellers || exportSubResellers.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: t('EXPORTS.WARNING'),
                detail: t('EXPORTS.NO_DATA'),
                life: 3000,
            });
            return;
        }

        // Transform data
        const exportData = exportSubResellers.map((reseller: Reseller) => {
            const createdDate = new Date(reseller.created_at);
            const formattedDate = createdDate.toLocaleDateString();
            const formattedTime = createdDate.toLocaleTimeString();

            // Define status message
            const getStatusText = (status: number) => {
                return status === 1 ? t('ACTIVE') : t('DEACTIVATED');
            };

            // Calculate available payment
            const totalPayments = Number(reseller?.total_payments_received) || 0;
            const totalBalance = Number(reseller?.total_balance_sent) || 0;
            const availablePaymentAmount = totalPayments - totalBalance;

            // Calculate loan amount
            const loanAmount = totalBalance - totalPayments;

            return {
                [t('RESELLER.TABLE.COLUMN.ID')]: reseller.id,
                [t('RESELLER.TABLE.COLUMN.RESELLERNAME')]: reseller.reseller_name,
                [t('RESELLER.TABLE.COLUMN.EMAIL')]: reseller.email,
                [t('RESELLER.TABLE.COLUMN.PHONE')]: reseller.phone,
                [t('RESELLER.TABLE.COLUMN.COUNTRY')]: (reseller.country as Country)?.country_name || reseller.country || '-',
                [t('MENU.BALANCE')]: reseller.balance,
                [t('TOTAL_EARNING_BALANCE')]: reseller.total_earning_balance || '0',
                [t('RESELLER.TABLE.COLUMN.AVAILABLEPAYMENT')]: availablePaymentAmount > 0 ? availablePaymentAmount : 0,
                [t('RESELLER.TABLE.COLUMN.PAYMENT')]: reseller.total_payments_received,
                [t('RESELLER.TABLE.COLUMN.TOTAL_BALANCE')]: reseller.total_balance_sent,
                [t('RESELLER.TABLE.COLUMN.LOANAMOUNT')]: loanAmount,
                [t('RESELLER.TABLE.COLUMN.CURRENCYPREFERENCE')]: reseller.user?.currency_preference_code || '-',
                [t('BUNDLE.TABLE.FILTER.STATUS')]: getStatusText(reseller.status),
                [t('CREATED_AT')]: `${formattedDate} ${formattedTime}`,
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [
            { wch: 8 },   // ID
            { wch: 25 },  // Reseller Name
            { wch: 25 },  // Email
            { wch: 15 },  // Phone
            { wch: 15 },  // Country
            { wch: 12 },  // Balance
            { wch: 18 },  // Total Earning Balance
            { wch: 18 },  // Available Payment
            { wch: 15 },  // Total Payments
            { wch: 18 },  // Total Balance Sent
            { wch: 15 },  // Loan Amount
            { wch: 15 },  // Currency Preference
            { wch: 15 },  // Status
            { wch: 20 },  // Created At
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, t('SUB_RESELLERS'));

        const fileName = `Sub_Resellers_${resellerId ? `of_${resellerId}_` : ''}${new Date().toISOString().slice(0, 10)}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast.current?.show({
            severity: 'success',
            summary: t('EXPORTS.SUCCESS'),
            detail: t('EXPORTS.SUCCESS_DETAIL'),
            life: 3000,
        });
    } catch (error) {
        console.error('Export error:', error);
        toast.current?.show({
            severity: 'error',
            summary: t('EXPORTS.ERROR'),
            detail: t('EXPORTS.ERROR_DETAIL'),
            life: 3000,
        });
    }
};
