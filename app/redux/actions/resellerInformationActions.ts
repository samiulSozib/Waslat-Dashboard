import axios from 'axios';
import { Dispatch } from 'redux';

import { FETCH_RESELLER_BALANCES_FAIL, FETCH_RESELLER_BALANCES_REQUEST, FETCH_RESELLER_BALANCES_SUCCESS, FETCH_RESELLER_ORDERS_FAIL, FETCH_RESELLER_ORDERS_REQUEST, FETCH_RESELLER_ORDERS_SUCCESS, FETCH_RESELLER_PAYMENTS_FAIL, FETCH_RESELLER_PAYMENTS_REQUEST, FETCH_RESELLER_PAYMENTS_SUCCESS, FETCH_RESELLER_SUB_RESELLERS_FAIL, FETCH_RESELLER_SUB_RESELLERS_REQUEST, FETCH_RESELLER_SUB_RESELLERS_SUCCESS, FETCH_RESELLER_TRANSACTIONS_FAIL, FETCH_RESELLER_TRANSACTIONS_REQUEST, FETCH_RESELLER_TRANSACTIONS_SUCCESS } from '../constants/resellerInfomationConstants';

const getAuthToken = () => {
    return localStorage.getItem('api_token') || ''; // Retrieve the token from localStorage
};

let lastResellerOrdersController: AbortController | null = null;

// Fetch orders
export const fetchResellerOrders = (resellerId:number,page: number = 1, search: string = '', filters: any = {}) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_RESELLER_ORDERS_REQUEST });

    try {
        try { if (lastResellerOrdersController) lastResellerOrdersController.abort(); } catch (err) {}
        lastResellerOrdersController = new AbortController();

        const token = getAuthToken();
        //console.log(filters)
        const queryParams = new URLSearchParams();

        queryParams.append('page', String(page));
        queryParams.append('search', search);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, String(value));
            }
        });


        const queryString = queryParams.toString();

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${resellerId}/orders?${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            signal: lastResellerOrdersController.signal
        });

        dispatch({
            type: FETCH_RESELLER_ORDERS_SUCCESS, payload: {
                data: response.data.data.orders,
                pagination: response.data.payload.pagination,
            }
        });
    } catch (error: any) {
        const isCanceled = error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
        if (!isCanceled) dispatch({ type: FETCH_RESELLER_ORDERS_FAIL, payload: error.message });
    }
};


// Fetch balances
let lastResellerBalancesController: AbortController | null = null;

export const fetchResellerBalances = (resellerId:number,page: number = 1, search: string = '', filters: any = {}) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_RESELLER_BALANCES_REQUEST });

    try {
        try { if (lastResellerBalancesController) lastResellerBalancesController.abort(); } catch (err) {}
        lastResellerBalancesController = new AbortController();

        const token = getAuthToken();
        //console.log(filters)
        const queryParams = new URLSearchParams();

        queryParams.append('page', String(page));
        queryParams.append('search', search);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, String(value));
            }
        });


        const queryString = queryParams.toString();

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${resellerId}/balances?${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            signal: lastResellerBalancesController.signal
        });

        dispatch({
            type: FETCH_RESELLER_BALANCES_SUCCESS, payload: {
                data: response.data.data.balances,
                pagination: response.data.payload.pagination,
            }
        });
    } catch (error: any) {
        const isCanceled = error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
        if (!isCanceled) dispatch({ type: FETCH_RESELLER_BALANCES_FAIL, payload: error.message });
    }
};


// Fetch payments
let lastResellerPaymentsController: AbortController | null = null;

export const fetchResellerPayments = (resellerId:number,page: number = 1, search: string = '', filters: any = {}) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_RESELLER_PAYMENTS_REQUEST });

    try {
        try { if (lastResellerPaymentsController) lastResellerPaymentsController.abort(); } catch (err) {}
        lastResellerPaymentsController = new AbortController();

        const token = getAuthToken();
        //console.log(filters)
        const queryParams = new URLSearchParams();

        queryParams.append('page', String(page));
        queryParams.append('search', search);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, String(value));
            }
        });


        const queryString = queryParams.toString();

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${resellerId}/payments?${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            signal: lastResellerPaymentsController.signal
        });

        dispatch({
            type: FETCH_RESELLER_PAYMENTS_SUCCESS, payload: {
                data: response.data.data.payments,
                pagination: response.data.payload.pagination,
            }
        });
    } catch (error: any) {
        const isCanceled = error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
        if (!isCanceled) dispatch({ type: FETCH_RESELLER_PAYMENTS_FAIL, payload: error.message });
    }
};


// Fetch transactions
let lastResellerTransactionsController: AbortController | null = null;

export const fetchResellerTransactions = (resellerId:number,page: number = 1, search: string = '', filters: any = {}) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_RESELLER_TRANSACTIONS_REQUEST });

    try {
        try { if (lastResellerTransactionsController) lastResellerTransactionsController.abort(); } catch (err) {}
        lastResellerTransactionsController = new AbortController();

        const token = getAuthToken();
        //console.log(filters)
        const queryParams = new URLSearchParams();

        queryParams.append('page', String(page));
        queryParams.append('search', search);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, String(value));
            }
        });


        const queryString = queryParams.toString();

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${resellerId}/transactions?${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            signal: lastResellerTransactionsController.signal
        });

        dispatch({
            type: FETCH_RESELLER_TRANSACTIONS_SUCCESS, payload: {
                data: response.data.data.transactions,
                pagination: response.data.payload.pagination,
            }
        });
    } catch (error: any) {
        const isCanceled = error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
        if (!isCanceled) dispatch({ type: FETCH_RESELLER_TRANSACTIONS_FAIL, payload: error.message });
    }
};


// Fetch SUB RESELLERS
let lastResellerSubResellersController: AbortController | null = null;

export const fetchResellerSubResellers = (resellerId:number,page: number = 1, search: string = '', filters: any = {}) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_RESELLER_SUB_RESELLERS_REQUEST });

    try {
        try { if (lastResellerSubResellersController) lastResellerSubResellersController.abort(); } catch (err) {}
        lastResellerSubResellersController = new AbortController();

        const token = getAuthToken();
        //console.log(filters)
        const queryParams = new URLSearchParams();

        queryParams.append('page', String(page));
        queryParams.append('search', search);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, String(value));
            }
        });


        const queryString = queryParams.toString();

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/resellers/${resellerId}/sub-resellers?${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            signal: lastResellerSubResellersController.signal
        });

        dispatch({
            type: FETCH_RESELLER_SUB_RESELLERS_SUCCESS, payload: {
                data: response.data.data.sub_resellers,
                pagination: response.data.payload.pagination,
            }
        });
    } catch (error: any) {
        const isCanceled = error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
        if (!isCanceled) dispatch({ type: FETCH_RESELLER_SUB_RESELLERS_FAIL, payload: error.message });
    }
};
