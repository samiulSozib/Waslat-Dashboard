// redux/actions/orderActions.ts

import axios from 'axios';
import { Dispatch } from 'redux';
import { Toast } from 'primereact/toast';
import {
    ADD_ORDER_FAIL,
    ADD_ORDER_REQUEST,
    ADD_ORDER_SUCCESS,
    CHANGE_ORDER_STATUS_FAIL,
    CHANGE_ORDER_STATUS_REQUEST,
    CHANGE_ORDER_STATUS_SUCCESS,
    DELETE_ORDER_FAIL,
    DELETE_ORDER_REQUEST,
    DELETE_ORDER_SUCCESS,
    EDIT_ORDER_FAIL,
    EDIT_ORDER_REQUEST,
    EDIT_ORDER_SUCCESS,
    FETCH_ORDERS_FAIL,
    FETCH_ORDERS_REQUEST,
    FETCH_ORDERS_SUCCESS,
    CHECK_PAYSTORE_STATUS_REQUEST,
    CHECK_PAYSTORE_STATUS_SUCCESS,
    CHECK_PAYSTORE_STATUS_FAIL,
    CLEAR_PAYSTORE_STATUS
} from '../constants/orderConstants';

const getAuthToken = () => {
    return localStorage.getItem('api_token') || '';
};

// Keep a reference to the last controller to cancel overlapping requests
let lastOrdersController: AbortController | null = null;

// Fetch orders
export const _fetchOrders = (page: number = 1, search: string = '', filters: any = {}) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_ORDERS_REQUEST });

    try {
        if (lastOrdersController) lastOrdersController.abort();
    } catch (err) {}
    lastOrdersController = new AbortController();

    try {
        const token = getAuthToken();
        const queryParams = new URLSearchParams();

        queryParams.append('page', String(page));
        queryParams.append('search', search);
        queryParams.append('items_per_page', '20');

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, String(value));
            }
        });

        const queryString = queryParams.toString();

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/orders?${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            signal: lastOrdersController.signal
        });

        dispatch({
            type: FETCH_ORDERS_SUCCESS, payload: {
                data: response.data.data.orders,
                pagination: response.data.payload.pagination,
            }
        });
    } catch (error: any) {
        const isCanceled = error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
        if (!isCanceled) {
            dispatch({ type: FETCH_ORDERS_FAIL, payload: error.message });
        }
    }
};

// Add an order
export const _addOrder = (orderData: any) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_ORDER_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/orders`,
            orderData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        dispatch({ type: ADD_ORDER_SUCCESS, payload: response.data.data });
    } catch (error: any) {
        dispatch({ type: ADD_ORDER_FAIL, payload: error.message });
    }
};

// Edit an order
export const _editOrder = (orderId: number, orderData: any) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_ORDER_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}`,
            orderData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        dispatch({ type: EDIT_ORDER_SUCCESS, payload: response.data.data });
    } catch (error: any) {
        dispatch({ type: EDIT_ORDER_FAIL, payload: error.message });
    }
};

// Delete an order
export const _deleteOrder = (orderId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_ORDER_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: DELETE_ORDER_SUCCESS, payload: orderId });
        toast.current?.show({
            severity: "success",
            summary: t('SUCCESS'),
            detail: t('ORDER_DELETED'),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: DELETE_ORDER_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t('ERROR'),
            detail: t('ORDER_DELETE_FAILED'),
            life: 3000,
        });
    }
};

export const _changeOrderStatus = (
    orderId: number,
    status: number,
    toast: React.RefObject<Toast>,
    t: (key: string) => string,
    rejectedReason?: string,
) => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: CHANGE_ORDER_STATUS_REQUEST });

        try {
            const token = localStorage.getItem('api_token') || '';
            const baseURL = `${process.env.NEXT_PUBLIC_BASE_URL}/orders`;
            let response;

            switch (status) {
                case 3:
                    response = await axios.get(`${baseURL}/underprocess-order/${orderId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    break;
                case 1:
                    response = await axios.get(`${baseURL}/confirm-order/${orderId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    break;
                case 2:
                    response = await axios.get(`${baseURL}/reject-order/${orderId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: { rejectReason: rejectedReason },
                    });
                    break;
                default:
                    throw new Error('Invalid order status');
            }

            if (response.data.success === true) {
                toast.current?.show({
                    severity: 'success',
                    summary: t('SUCCESS'),
                    detail: t('ORDER_STATUS_CHANGED'),
                    life: 3000,
                });

                dispatch({
                    type: CHANGE_ORDER_STATUS_SUCCESS,
                    payload: { orderId, status, message: response.data.message, ...(status === 2 && { rejectedReason }) },
                });
            } else {
                throw new Error(response.data.message || t('ORDER_STATUS_CHANGED_FAILED'));
            }
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: error.message || t('ORDER_STATUS_CHANGED_FAILED'),
                life: 3000,
            });

            dispatch({
                type: CHANGE_ORDER_STATUS_FAIL,
                payload: error.message,
            });
        }
    };
};

// ============ Check PayStore Status ============

export const _checkPaystoreStatus = (
    orderId: number,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => async (dispatch: Dispatch) => {
    dispatch({ type: CHECK_PAYSTORE_STATUS_REQUEST });

    try {
        const token = getAuthToken();
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/paystore/check-status`;

        console.log("🌐 Checking PayStore status for order:", orderId);
        console.log("🌐 URL:", url);

        const response = await axios.post(
            url,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("🔥 PayStore Status Response:", response.data);

        // Check if the response indicates provider not found
        if (response.data.success === false && response.data.errors === 'ProviderNotFound') {
            toast.current?.show({
                severity: 'error',
                summary: t('PAYSTORE_STATUS_CHECK_FAILED'),
                detail: t('PAYSTORE_PROVIDER_NOT_FOUND'),
                life: 5000,
            });

            dispatch({
                type: CHECK_PAYSTORE_STATUS_FAIL,
                payload: response.data.message || 'Provider not found',
            });
            return;
        }

        const statusData = response.data.data;

        dispatch({
            type: CHECK_PAYSTORE_STATUS_SUCCESS,
            payload: statusData,
        });

        // Build status message
        const providerMessage = statusData.provider_message || '';
        const status = statusData.provider_status?.toLowerCase() || '';
        const responseCode = statusData.provider_response_code || '';
        const transactionId = statusData.provider_transaction_id || '';
        const orderStatus = statusData.order_status === '1' ? '✅ Paid' : '⏳ Pending';
        const isPaid = statusData.is_paid === '1' ? '✅ Yes' : '❌ No';

        let severity: 'success' | 'info' | 'warn' | 'error' = 'info';
        let summary = t('PAYSTORE_STATUS_CHECK');
        let detail = '';
        let messageLines: string[] = [];

        // Status Message
        switch (status) {
            case 'success':
                severity = 'success';
                detail = `✅ ${t('PAYSTORE_STATUS_SUCCESS')}`;
                messageLines.push(`✅ ${t('PAYSTORE_STATUS_SUCCESS')}`);
                break;
            case 'pending':
                severity = 'info';
                detail = `⏳ ${t('PAYSTORE_STATUS_PENDING')}`;
                messageLines.push(`⏳ ${t('PAYSTORE_STATUS_PENDING')}`);
                break;
            case 'cancelled':
                severity = 'warn';
                detail = `⚠️ ${t('PAYSTORE_STATUS_CANCELLED')}`;
                messageLines.push(`⚠️ ${t('PAYSTORE_STATUS_CANCELLED')}`);
                break;
            default:
                severity = 'error';
                detail = `❌ ${t('PAYSTORE_STATUS_ERROR')}`;
                messageLines.push(`❌ ${t('PAYSTORE_STATUS_ERROR')}`);
                break;
        }

        // Add provider message
        if (providerMessage) {
            messageLines.push(`📝 ${t('PAYSTORE_PROVIDER_MESSAGE')}: ${providerMessage}`);
        }

        // Add response code
        if (responseCode) {
            messageLines.push(`🔢 ${t('PAYSTORE_STATUS_CODE')}: ${responseCode}`);
        }

        // Add transaction ID
        if (transactionId) {
            messageLines.push(`🆔 ${t('PAYSTORE_TRANSACTION_ID')}: ${transactionId}`);
        }

        // Add order status
        messageLines.push(`📊 ${t('PAYSTORE_ORDER_STATUS')}: ${orderStatus}`);

        // Add payment status
        if (statusData.payment) {
            const paymentStatus = statusData.payment.already_paid ? '✅ Already Paid' : '❌ Not Paid';
            messageLines.push(`💳 Payment: ${paymentStatus}`);
            if (statusData.payment.transaction_id) {
                messageLines.push(`🆔 Local TXN: ${statusData.payment.transaction_id}`);
            }
        }

        // Add refund info
        if (statusData.refund) {
            const refundStatus = statusData.refund.refunded ? '✅ Refunded' : 'ℹ️ Not Refunded';
            messageLines.push(`↩️ Refund: ${refundStatus}`);
            if (statusData.refund.message) {
                messageLines.push(`💬 ${statusData.refund.message}`);
            }
        }

        // Combine all messages
        const fullMessage = messageLines.join('\n');

        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: fullMessage,
            life: 8000,
            sticky: false,
        });

        // Refresh orders after status check
        //dispatch(_fetchOrders(1, '', {}));

        return response.data;

    } catch (error: any) {
        console.error("❌ Error checking PayStore status:", error);

        let errorMessage = error.response?.data?.message || error.message || "Failed to check PayStore status";

        // Handle specific error cases
        if (error.response?.data?.errors === 'ProviderNotFound') {
            errorMessage = t('PAYSTORE_PROVIDER_NOT_FOUND');
        } else if (error.response?.data?.errors) {
            errorMessage = error.response.data.errors;
        }

        dispatch({
            type: CHECK_PAYSTORE_STATUS_FAIL,
            payload: errorMessage,
        });

        toast.current?.show({
            severity: 'error',
            summary: t('PAYSTORE_STATUS_CHECK_FAILED'),
            detail: errorMessage,
            life: 5000,
        });

        throw error;
    }
};

// Clear PayStore status
export const clearPaystoreStatus = () => ({
    type: CLEAR_PAYSTORE_STATUS,
});
