import { Dispatch } from "redux";
import axios from "axios";
import {
    FETCH_BALANCES_REQUEST,
    FETCH_BALANCES_SUCCESS,
    FETCH_BALANCES_FAIL,
    ADD_BALANCE_REQUEST,
    ADD_BALANCE_SUCCESS,
    ADD_BALANCE_FAIL,
    EDIT_BALANCE_REQUEST,
    EDIT_BALANCE_SUCCESS,
    EDIT_BALANCE_FAIL,
    DELETE_BALANCE_REQUEST,
    DELETE_BALANCE_SUCCESS,
    DELETE_BALANCE_FAIL,
    ROLLBACK_BALANCE_REQUEST,
    ROLLBACK_BALANCE_SUCCESS,
    ROLLBACK_BALANCE_FAIL,
    VERIFY_BALANCE_REQUEST,
    VERIFY_BALANCE_SUCCESS,
    VERIFY_BALANCE_FAIL,
    REJECT_BALANCE_REQUEST,
    REJECT_BALANCE_SUCCESS,
    REJECT_BALANCE_FAIL,
} from '../constants/balanceConstants';
import { Balance } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || ""; // Retrieve the token from localStorage
};

// Fetch balances
export const _fetchBalances = (page: number = 1, search: string = '', filters: any = {}) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_BALANCES_REQUEST });

    try {
        const token = getAuthToken();
        const queryParams = new URLSearchParams();

        queryParams.append('page', String(page));
        queryParams.append('search', search);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, String(value));
            }
        });


        const queryString = queryParams.toString();

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/balances?items_per_page=${20}&${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({
            type: FETCH_BALANCES_SUCCESS, payload: {
                data: response.data.data.balances,
                pagination: response.data.payload.pagination,
            }
        });
    } catch (error: any) {
        dispatch({ type: FETCH_BALANCES_FAIL, payload: error.message });
    }
};

// Add a balance
export const _addBalance = (balanceData: Balance, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_BALANCE_REQUEST });

    try {
        //console.log(balanceData)
        const token = getAuthToken();
        const formData = new FormData()
        formData.append("reseller_id", balanceData.reseller?.id?.toString() || '0');
        formData.append("transaction_type", balanceData.transaction_type);
        formData.append("balance_amount", balanceData.amount);
        formData.append("currency_id", balanceData.currency_id?.toString());
        formData.append("description", balanceData.description);
        formData.append("payment_method_id", balanceData.payment_method_id ? balanceData.payment_method_id.toString() : ''); // Empty string for no value
        formData.append("payment_amount", balanceData.payment_amount ? balanceData.payment_amount : '');
        formData.append("payment_currency_id", balanceData.payment_currency_id ? balanceData.payment_currency_id.toString() : '');
        formData.append("payment_status", "completed");
        formData.append("payment_notes", balanceData.payment_notes ? balanceData.payment_notes : ''); // Empty string for no value
        formData.append("payment_date", balanceData.payment_date ? balanceData.payment_date.toString() : '');

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/balances`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        const newData = { ...balanceData, id: response.data.data.balance.id }

        dispatch({ type: ADD_BALANCE_SUCCESS, payload: newData });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("BALANCE_ADDED"),
            life: 3000,
        });
    } catch (error: any) {
        //console.log(error)
        dispatch({ type: ADD_BALANCE_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("BALANCE_ADD_FAILED"),
            life: 3000,
        });
    }
};

// Edit a balance
export const _editBalance = (balanceId: number, balanceData: Balance, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_BALANCE_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData()
        formData.append("reseller_id", balanceData.reseller?.id?.toString() || '0');
        formData.append("transaction_type", balanceData.transaction_type);
        formData.append("balance_amount", balanceData.amount);
        formData.append("currency_id", balanceData.currency_id?.toString());
        formData.append("description", balanceData.description);
        formData.append("payment_method_id", balanceData.payment_method_id ? balanceData.payment_method_id.toString() : ''); // Empty string for no value
        formData.append("payment_amount", balanceData.payment_amount ? balanceData.payment_amount : '');
        formData.append("payment_currency_id", balanceData.payment_currency_id ? balanceData.payment_currency_id.toString() : '');
        formData.append("payment_status", "completed");
        formData.append("payment_notes", balanceData.payment_notes ? balanceData.payment_notes : ''); // Empty string for no value
        formData.append("payment_date", balanceData.payment_date ? balanceData.payment_date.toString() : '');

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/balances/${balanceId}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        const newData = { ...balanceData, id: response.data.data.balance.id }
        dispatch({ type: EDIT_BALANCE_SUCCESS, payload: newData });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("BALANCE_EDITED"),
            life: 3000,
        });
    } catch (error: any) {
        //console.log(error)
        dispatch({ type: EDIT_BALANCE_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("BALANCE_EDIT_FAILED"),
            life: 3000,
        });
    }
};

// Delete a balance
export const _deleteBalance = (balanceId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_BALANCE_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/balances/${balanceId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: DELETE_BALANCE_SUCCESS, payload: balanceId });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("BALANCE_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: DELETE_BALANCE_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("BALANCE_DELETE_FAILED"),
            life: 3000,
        });

    }
};


// ROLLBACK a balance
export const _rollbackedBalance = (balanceId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ROLLBACK_BALANCE_REQUEST });

    try {
        const token = getAuthToken();
        const response=await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/balances/rollback/${balanceId}`, {},{

            headers: {
                Authorization: `Bearer ${token}`,

            },
        });
        console.log(response)
        dispatch({ type: ROLLBACK_BALANCE_SUCCESS, payload: balanceId });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("BALANCE_ROLLBACKED"),
            life: 3000,
        });
    } catch (error: any) {
        console.log(error)
        dispatch({ type: ROLLBACK_BALANCE_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("BALANCE_ROLLBACKED_FAILED"),
            life: 3000,
        });

    }
};

// VERIFY a balance
export const _verifyBalance = (balanceId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: VERIFY_BALANCE_REQUEST });

    try {
        const token = getAuthToken();
        const response=await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/balances/${balanceId}/verify`, {},{

            headers: {
                Authorization: `Bearer ${token}`,

            },
        });
        console.log(response)
        dispatch({ type: VERIFY_BALANCE_SUCCESS, payload: balanceId });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("BALANCE_VERIFIED"),
            life: 3000,
        });
    } catch (error: any) {
        console.log(error)
        dispatch({ type: VERIFY_BALANCE_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("BALANCE_VERIFICATION_FAILED"),
            life: 3000,
        });

    }
};


// REJECT a balance
export const _rejectBalance = (balanceId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: REJECT_BALANCE_REQUEST });

    try {
        const token = getAuthToken();
        const response=await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/balances/${balanceId}/reject`, {},{

            headers: {
                Authorization: `Bearer ${token}`,

            },
        });
        console.log(response)
        dispatch({ type: REJECT_BALANCE_SUCCESS, payload: balanceId });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("BALANCE_REJECTED"),
            life: 3000,
        });
    } catch (error: any) {
        console.log(error)
        dispatch({ type: REJECT_BALANCE_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("BALANCE_REJECTION_FAILED"),
            life: 3000,
        });

    }
};


