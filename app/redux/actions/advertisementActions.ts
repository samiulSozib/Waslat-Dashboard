import { Dispatch } from 'redux';
import axios from 'axios';

import {
    FETCH_ADVERTISEMENTS_REQUEST,
    FETCH_ADVERTISEMENTS_SUCCESS,
    FETCH_ADVERTISEMENTS_FAIL,
    ADD_ADVERTISEMENT_REQUEST,
    ADD_ADVERTISEMENT_SUCCESS,
    ADD_ADVERTISEMENT_FAIL,
    EDIT_ADVERTISEMENT_REQUEST,
    EDIT_ADVERTISEMENT_SUCCESS,
    EDIT_ADVERTISEMENT_FAIL,
    DELETE_ADVERTISEMENT_REQUEST,
    DELETE_ADVERTISEMENT_SUCCESS,
    DELETE_ADVERTISEMENT_FAIL,
} from '../constants/advertisementConstants';
import { Toast } from 'primereact/toast';
import { Advertisement } from '@/types/interface';
import { useTranslation } from 'react-i18next';

// Get Auth Token from Local Storage
const getAuthToken = () => {
    return localStorage.getItem('api_token') || ''; // Get the token or return an empty string if not found
};



// Fetch advertisements
export const _fetchAdvertisements = (search:string='') => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_ADVERTISEMENTS_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/advertisements?search=${search}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        //console.log(response)
        dispatch({ type: FETCH_ADVERTISEMENTS_SUCCESS, payload: response.data.data.advertisements });
    } catch (error: any) {
        dispatch({ type: FETCH_ADVERTISEMENTS_FAIL, payload: error.message });
    }
};

// Add an advertisement
export const _addAdvertisement = (advertisementData: Advertisement,toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_ADVERTISEMENT_REQUEST });

    try {
        const token = getAuthToken();
        const formData=new FormData()
        formData.append('advertisement_title',advertisementData.advertisement_title)
        formData.append('status',advertisementData.status.toString())
        if (advertisementData.ad_slider_image_url && typeof advertisementData.ad_slider_image_url !== 'string') {
            formData.append('ad_slider_image_url', advertisementData.ad_slider_image_url);
        }
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/advertisements`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        //console.log(response)
        dispatch({ type: ADD_ADVERTISEMENT_SUCCESS, payload: response.data.data.advertisement });

        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("ADVERTISEMENT_ADDED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: ADD_ADVERTISEMENT_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("ADVERTISEMENT_ADD_FAILED"),
            life: 3000,
        });
    }
};

// Edit an advertisement
export const _editAdvertisement = (advertisementId: number, advertisementData: Advertisement,toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_ADVERTISEMENT_REQUEST });

    try {
        const token = getAuthToken();
        const formData=new FormData()
        formData.append('advertisement_title',advertisementData.advertisement_title)
        formData.append('status',advertisementData.status.toString())
        if (advertisementData.ad_slider_image_url && typeof advertisementData.ad_slider_image_url !== 'string') {
            formData.append('ad_slider_image_url', advertisementData.ad_slider_image_url);
        }
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/advertisements/${advertisementId}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        dispatch({ type: EDIT_ADVERTISEMENT_SUCCESS, payload: response.data.data.advertisement });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("ADVERTISEMENT_EDITED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: EDIT_ADVERTISEMENT_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("ADVERTISEMENT_EDIT_FAILED"),
            life: 3000,
        });
    }
};

// Delete an advertisement
export const _deleteAdvertisement = (advertisementId: number,toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_ADVERTISEMENT_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/advertisements/${advertisementId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: DELETE_ADVERTISEMENT_SUCCESS, payload: advertisementId });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("ADVERTISEMENT_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: DELETE_ADVERTISEMENT_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("ADVERTISEMENT_DELETE_FAILED"),
            life: 3000,
        });
    }
};
