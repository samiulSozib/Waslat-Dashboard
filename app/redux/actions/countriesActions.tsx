import { Dispatch } from "redux";
import axios from "axios";
import {
    FETCH_COUNTRIES_REQUEST,
    FETCH_COUNTRIES_SUCCESS,
    FETCH_COUNTRIES_FAIL,
    ADD_COUNTRY_REQUEST,
    ADD_COUNTRY_SUCCESS,
    ADD_COUNTRY_FAIL,
    EDIT_COUNTRY_REQUEST,
    EDIT_COUNTRY_SUCCESS,
    EDIT_COUNTRY_FAIL,
    DELETE_COUNTRY_REQUEST,
    DELETE_COUNTRY_SUCCESS,
    DELETE_COUNTRY_FAIL,
} from '../constants/countriesConstants';
import { Country } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

// Fetch Countries
export const _fetchCountries = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_COUNTRIES_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/countries`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({
            type: FETCH_COUNTRIES_SUCCESS,
            payload: response.data.data.countries,
        });

        // Optional: Show success toast if needed
        // toast.current?.show({
        //     severity: "success",
        //     summary: t("SUCCESS"),
        //     detail: t("COUNTRIES_FETCHED"),
        //     life: 3000,
        // });
    } catch (error: any) {
        dispatch({
            type: FETCH_COUNTRIES_FAIL,
            payload: error.message,
        });

    }
};

// Add Country
export const _addCountry = (countryData: Country, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_COUNTRY_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('country_name', countryData.country_name);
        formData.append('country_telecom_code', countryData.country_telecom_code);
        formData.append('phone_number_length', countryData.phone_number_length);
        formData.append('currency_id', String(countryData.currency?.id));
        formData.append('language_id', String(countryData.language?.id));

        if (countryData.country_flag_image_url && typeof countryData.country_flag_image_url !== 'string') {
            formData.append('country_flag_image', countryData.country_flag_image_url);
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/countries`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        const newData = {...countryData, id: response.data.data.country.id};
        dispatch({
            type: ADD_COUNTRY_SUCCESS,
            payload: newData,
        });

        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("COUNTRY_ADDED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({
            type: ADD_COUNTRY_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("COUNTRY_ADD_FAILED"),
            life: 3000,
        });
    }
};

// Edit Country
export const _editCountry = (countryId: number, updatedData: Country, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_COUNTRY_REQUEST });

    try {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('country_name', updatedData.country_name);
        formData.append('country_telecom_code', updatedData.country_telecom_code);
        formData.append('phone_number_length', updatedData.phone_number_length);
        formData.append('currency_id', String(updatedData.currency?.id));
        formData.append('language_id', String(updatedData.language?.id));

        if (updatedData.country_flag_image_url && typeof updatedData.country_flag_image_url !== 'string') {
            formData.append('country_flag_image', updatedData.country_flag_image_url);
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/countries/${countryId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        const newData = {...updatedData, id: response.data.data.country.id};
        dispatch({
            type: EDIT_COUNTRY_SUCCESS,
            payload: newData,
        });

        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("COUNTRY_UPDATED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({
            type: EDIT_COUNTRY_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("COUNTRY_UPDATE_FAILED"),
            life: 3000,
        });
    }
};

// Delete Country
export const _deleteCountry = (countryId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_COUNTRY_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/countries/${countryId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({
            type: DELETE_COUNTRY_SUCCESS,
            payload: countryId,
        });

        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("COUNTRY_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({
            type: DELETE_COUNTRY_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("COUNTRY_DELETE_FAILED"),
            life: 3000,
        });
    }
};
