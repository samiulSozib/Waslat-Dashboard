import { Dispatch } from "redux";
import axios from "axios";
import { Toast } from "primereact/toast";
import {
    FETCH_HAWALA_CURRENCIES_REQUEST,
    FETCH_HAWALA_CURRENCIES_SUCCESS,
    FETCH_HAWALA_CURRENCIES_FAILURE,
    ADD_HAWALA_CURRENCY_REQUEST,
    ADD_HAWALA_CURRENCY_SUCCESS,
    ADD_HAWALA_CURRENCY_FAIL,
    EDIT_HAWALA_CURRENCY_REQUEST,
    EDIT_HAWALA_CURRENCY_SUCCESS,
    EDIT_HAWALA_CURRENCY_FAIL,
    DELETE_HAWALA_CURRENCY_REQUEST,
    DELETE_HAWALA_CURRENCY_SUCCESS,
    DELETE_HAWALA_CURRENCY_FAIL,
} from "../constants/hawalaCurrenciesConstants";
import { HawalaCurrency } from "@/types/interface";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

// Fetch Hawala currencies
export const _fetchHawalaCurrencies = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_HAWALA_CURRENCIES_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-currencies`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });



        dispatch({ type: FETCH_HAWALA_CURRENCIES_SUCCESS, payload: response.data.data.rates });
        //console.log(response.data.data.rates)
    } catch (error: any) {
        dispatch({ type: FETCH_HAWALA_CURRENCIES_FAILURE, payload: error.message });
    }
};

// Add a Hawala currency
export const _addHawalaCurrency = (currencyData: HawalaCurrency, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_HAWALA_CURRENCY_REQUEST });

    try {
        const token = getAuthToken();
        //console.log(currencyData)
        const formData = new FormData()
        if (currencyData.from_currency?.id !== undefined && currencyData.from_currency?.id !== null) {
            formData.append('from_currency_id', currencyData.from_currency.id.toString());
        }

        if (currencyData.to_currency?.id !== undefined && currencyData.to_currency?.id !== null) {
            formData.append('to_currency_id', currencyData.to_currency.id.toString());
        }

        formData.append('amount',currencyData.amount.toString())
        formData.append('sell_rate', parseInt(currencyData.sell_rate || '0').toString());
        formData.append('buy_rate', parseInt(currencyData.buy_rate || '0').toString());



        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/hawala-currencies`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        //console.log(response)
        const newData = { ...currencyData, id: response.data.data.rate.id };

        dispatch({ type: ADD_HAWALA_CURRENCY_SUCCESS, payload: newData });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("HAWALA_CURRENCY_ADDED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: ADD_HAWALA_CURRENCY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("HAWALA_CURRENCY_ADD_FAILED"),
            life: 3000,
        });
    }
};

// Edit a Hawala currency
export const _editHawalaCurrency = (currencyId: number, currencyData: HawalaCurrency, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_HAWALA_CURRENCY_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData()
        formData.append('id',currencyId.toString())
        if (currencyData.from_currency?.id !== undefined && currencyData.from_currency?.id !== null) {
            formData.append('from_currency_id', currencyData.from_currency.id.toString());
        }

        if (currencyData.to_currency?.id !== undefined && currencyData.to_currency?.id !== null) {
            formData.append('to_currency_id', currencyData.to_currency.id.toString());
        }

        formData.append('amount',currencyData.amount.toString())
        formData.append('sell_rate', parseInt(currencyData.sell_rate || '0').toString());
        formData.append('buy_rate', parseInt(currencyData.buy_rate || '0').toString());
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/hawala-currencies/${currencyId}`,
            currencyData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const newData = { ...currencyData, id: currencyId };
        dispatch({ type: EDIT_HAWALA_CURRENCY_SUCCESS, payload: newData });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("HAWALA_CURRENCY_UPDATED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: EDIT_HAWALA_CURRENCY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("HAWALA_CURRENCY_UPDATE_FAILED"),
            life: 3000,
        });
    }
};

// Delete a Hawala currency
export const _deleteHawalaCurrency = (currencyId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_HAWALA_CURRENCY_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-currencies/${currencyId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: DELETE_HAWALA_CURRENCY_SUCCESS, payload: currencyId });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("HAWALA_CURRENCY_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: DELETE_HAWALA_CURRENCY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("HAWALA_CURRENCY_DELETE_FAILED"),
            life: 3000,
        });
    }
};
