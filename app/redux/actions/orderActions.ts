// store/actions/orderActions.ts
import { Dispatch } from 'redux';
import axios from 'axios';

import {
    FETCH_ORDERS_REQUEST,
    FETCH_ORDERS_SUCCESS,
    FETCH_ORDERS_FAIL,
    ADD_ORDER_REQUEST,
    ADD_ORDER_SUCCESS,
    ADD_ORDER_FAIL,
    EDIT_ORDER_REQUEST,
    EDIT_ORDER_SUCCESS,
    EDIT_ORDER_FAIL,
    DELETE_ORDER_REQUEST,
    DELETE_ORDER_SUCCESS,
    DELETE_ORDER_FAIL,
    CHANGE_ORDER_STATUS_REQUEST,
  CHANGE_ORDER_STATUS_SUCCESS,
  CHANGE_ORDER_STATUS_FAIL,
} from '../constants/orderConstants';
import { Toast } from 'primereact/toast';

const getAuthToken = () => {
    return localStorage.getItem('api_token') || ''; // Retrieve the token from localStorage
};

// Fetch orders
export const _fetchOrders = (page: number = 1, search: string = '', filters: any = {}) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_ORDERS_REQUEST });

    try {
        const token = getAuthToken();
        //console.log(filters)
        const queryParams = new URLSearchParams();

        queryParams.append('page', String(page));
        queryParams.append('search', search);
        queryParams.append('items_per_page','15');

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
        });

        dispatch({
            type: FETCH_ORDERS_SUCCESS, payload: {
                data: response.data.data.orders,
                pagination: response.data.payload.pagination,
            }
        });
    } catch (error: any) {
        dispatch({ type: FETCH_ORDERS_FAIL, payload: error.message });
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
export const _deleteOrder = (orderId: number, toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
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
            params: { rejectReason:rejectedReason },
          });
          break;
        default:
          throw new Error('Invalid order status');
      }
      //console.log(response)
      if (response.data.success === true) {
        toast.current?.show({
          severity: 'success',
          summary: t('SUCCESS'),
          detail: t('ORDER_STATUS_CHANGED'),
          life: 3000,
        });

        dispatch({
          type: CHANGE_ORDER_STATUS_SUCCESS,
          payload: { orderId, status, message: response.data.message,...(status === 2 && { rejectedReason }) },
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
