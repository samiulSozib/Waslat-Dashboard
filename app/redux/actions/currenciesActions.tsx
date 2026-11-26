import { Dispatch } from "redux";
import axios from "axios";
import {
    FETCH_CURRENCIES_REQUEST,
    FETCH_CURRENCIES_SUCCESS,
    FETCH_CURRENCIES_FAILURE,
    ADD_CURRENCY_REQUEST,
    ADD_CURRENCY_SUCCESS,
    ADD_CURRENCY_FAIL,
    EDIT_CURRENCY_REQUEST,
    EDIT_CURRENCY_SUCCESS,
    EDIT_CURRENCY_FAIL,
    DELETE_CURRENCY_REQUEST,
    DELETE_CURRENCY_SUCCESS,
    DELETE_CURRENCY_FAIL,
} from "../constants/currenciesConstants";
import { Currency } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

const buildCurrencyFormData = (currencyData: Currency) => {
    const formData = new FormData();
    formData.append("name", currencyData.name ?? "");
    formData.append("code", currencyData.code ?? "");
    formData.append("symbol", currencyData.symbol ?? "");
    formData.append("exchange_rate_per_usd", String(currencyData.exchange_rate_per_usd ?? ""));
    formData.append("ignore_digits_count", currencyData.ignore_digits_count?.toString() ?? "");

    if (currencyData.flag_image_url && typeof currencyData.flag_image_url !== "string") {
        formData.append("flag_image", currencyData.flag_image_url);
    } else {
        formData.append("flag_image_url", typeof currencyData.flag_image_url === "string" ? currencyData.flag_image_url : "");
    }

    return formData;
};

// Fetch currencies
export const _fetchCurrencies = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_CURRENCIES_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/currencies`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: FETCH_CURRENCIES_SUCCESS, payload: response.data.data.currencies });
    } catch (error: any) {
        dispatch({ type: FETCH_CURRENCIES_FAILURE, payload: error.message });
    }
};

// Add a currency
export const _addCurrency = (currencyData: Currency, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_CURRENCY_REQUEST });

    try {
        const token = getAuthToken();
        const formData = buildCurrencyFormData(currencyData);
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/currencies`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        dispatch({ type: ADD_CURRENCY_SUCCESS, payload: response.data.data.currency });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("CURRENCY_ADDED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: ADD_CURRENCY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("CURRENCY_ADD_FAILED"),
            life: 3000,
        });
    }
};

// Edit a currency
export const _editCurrency = (currencyId: number, currencyData: Currency, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_CURRENCY_REQUEST });

    try {
        const token = getAuthToken();
        const formData = buildCurrencyFormData(currencyData);
        // POST for multipart (Laravel PUT + files is unreliable)
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/currencies/${currencyId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        dispatch({ type: EDIT_CURRENCY_SUCCESS, payload: response.data.data.currency });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("CURRENCY_UPDATED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: EDIT_CURRENCY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("CURRENCY_UPDATE_FAILED"),
            life: 3000,
        });
    }
};

// Delete a currency
export const _deleteCurrency = (currencyId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_CURRENCY_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/currencies/${currencyId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: DELETE_CURRENCY_SUCCESS, payload: currencyId });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("CURRENCY_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: DELETE_CURRENCY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("CURRENCY_DELETE_FAILED"),
            life: 3000,
        });
    }
};
