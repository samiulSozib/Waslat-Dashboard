import { Dispatch } from 'redux';
import axios from 'axios';
import {
    FETCH_BUNDLE_LIST_REQUEST,
    FETCH_BUNDLE_LIST_SUCCESS,
    FETCH_BUNDLE_LIST_FAIL,
    DELETE_BUNDLE_REQUEST,
    DELETE_BUNDLE_SUCCESS,
    DELETE_BUNDLE_FAIL,
    ADD_BUNDLE_REQUEST,
    ADD_BUNDLE_SUCCESS,
    ADD_BUNDLE_FAIL,
    EDIT_BUNDLE_REQUEST,
    EDIT_BUNDLE_SUCCESS,
    EDIT_BUNDLE_FAIL,
    SET_PROVIDER_REQUEST,
    SET_PROVIDER_SUCCESS,
    SET_PROVIDER_FAIL,
    UNSET_PROVIDER_REQUEST,
    UNSET_PROVIDER_SUCCESS,
    UNSET_PROVIDER_FAIL,
    BUNDLE_PRICE_ADJUSTMENT_PREVIEW_REQUEST,
    BUNDLE_PRICE_ADJUSTMENT_PREVIEW_SUCCESS,
    BUNDLE_PRICE_ADJUSTMENT_PREVIEW_FAIL,
    BUNDLE_PRICE_ADJUSTMENT_UPDATE_REQUEST,
    BUNDLE_PRICE_ADJUSTMENT_UPDATE_SUCCESS,
    BUNDLE_PRICE_ADJUSTMENT_UPDATE_FAIL,
    CLEAR_PRICE_ADJUSTMENT_PREVIEW,
    BULK_BUNDLE_PRICE_UPDATE_REQUEST,
    BULK_BUNDLE_PRICE_UPDATE_SUCCESS,
    BULK_BUNDLE_PRICE_UPDATE_FAIL
} from '../constants/bundleConstants';
import { Toast } from 'primereact/toast';
import { ApiBinding, BulkBundlePricePayload, Bundle, PriceAdjustmentPayload } from '@/types/interface';

const getAuthToken = () => {
    return localStorage.getItem('api_token') || ''; // Get the token or return an empty string if not found
};

// Fetch Bundle List
export const _fetchBundleList =
    (page: number = 1, search: string = '', filters = {}) =>
    async (dispatch: Dispatch) => {
        dispatch({ type: FETCH_BUNDLE_LIST_REQUEST });
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

            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/bundles?${queryString}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            //console.log(response)
            dispatch({
                type: FETCH_BUNDLE_LIST_SUCCESS,
                payload: {
                    data: response.data.data.bundles,
                    pagination: response.data.payload.pagination
                }
            });
        } catch (error: any) {
            dispatch({
                type: FETCH_BUNDLE_LIST_FAIL,
                payload: error.message
            });
        }
    };

// Add Bundle
export const _addBundle = (newBundleData: Bundle, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_BUNDLE_REQUEST });
    try {
        const body = {
            service_id: newBundleData.service?.id,
            bundle_title: newBundleData.bundle_title,
            bundle_description: newBundleData.bundle_description,
            bundle_type: newBundleData.bundle_type,
            validity_type: newBundleData.validity_type,
            admin_buying_price: newBundleData.admin_buying_price,
            buying_price: newBundleData.buying_price,
            selling_price: newBundleData.selling_price,
            currency_id: newBundleData.currency?.id,
            amount: newBundleData.amount
        };
        const token = getAuthToken();
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/bundles`, body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const newData = { ...newBundleData, id: response.data.data.bundle.id };
        dispatch({
            type: ADD_BUNDLE_SUCCESS,
            payload: newData
        });
        toast.current?.show({
            severity: 'success',
            summary: t('SUCCESS'),
            detail: t('BUNDLE_ADDED'),
            life: 3000
        });
        return newData
    } catch (error: any) {
        dispatch({
            type: ADD_BUNDLE_FAIL,
            payload: error.message
        });
        toast.current?.show({
            severity: 'error',
            summary: t('ERROR'),
            detail: t('BUNDLE_ADD_FAILED'),
            life: 3000
        });
    }
};

// Edit Bundle
export const _editBundle = (bundleId: number, updatedBundleData: Bundle, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_BUNDLE_REQUEST });
    try {
        const body = {
            bundle_code: updatedBundleData.bundle_code,
            service_id: updatedBundleData.service?.id,
            bundle_title: updatedBundleData.bundle_title,
            bundle_description: updatedBundleData.bundle_description,
            bundle_type: updatedBundleData.bundle_type,
            validity_type: updatedBundleData.validity_type,
            admin_buying_price: updatedBundleData.admin_buying_price,
            buying_price: updatedBundleData.buying_price,
            selling_price: updatedBundleData.selling_price,
            currency_id: updatedBundleData.currency?.id,
            amount: updatedBundleData.amount
        };
        const token = getAuthToken();
        const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/bundles/${bundleId}`, body, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const newData = { ...updatedBundleData, id: response.data.data.bundle.id };
        dispatch({
            type: EDIT_BUNDLE_SUCCESS,
            payload: newData
        });
        toast.current?.show({
            severity: 'success',
            summary: t('SUCCESS'),
            detail: t('BUNDLE_EDITED'),
            life: 3000
        });
        return newData
    } catch (error: any) {
        //console.log(error)
        dispatch({
            type: EDIT_BUNDLE_FAIL,
            payload: error.message
        });
        toast.current?.show({
            severity: 'error',
            summary: t('ERROR'),
            detail: t('BUNDLE_EDIT_FAILED'),
            life: 3000
        });
    }
};

// Delete Bundle
export const _deleteBundle = (bundleId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_BUNDLE_REQUEST });
    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/bundles/${bundleId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        dispatch({
            type: DELETE_BUNDLE_SUCCESS,
            payload: bundleId
        });
        toast.current?.show({
            severity: 'success',
            summary: t('SUCCESS'),
            detail: t('BUNDLE_DELETED'),
            life: 3000
        });
    } catch (error: any) {
        dispatch({
            type: DELETE_BUNDLE_FAIL,
            payload: error.message
        });
        toast.current?.show({
            severity: 'error',
            summary: t('ERROR'),
            detail: t('BUNDLE_DELETE_FAILED'),
            life: 3000
        });
    }
};

export const _deleteSelectedBundles = async (bundleIds: number[], toast: React.RefObject<Toast>, t: (key: string) => string) => {
    const token = getAuthToken();

    try {
        for (const id of bundleIds) {
            await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/bundles/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        toast.current?.show({
            severity: 'success',
            summary: t('SUCCESS'),
            detail: t('BUNDLES_DELETED'),
            life: 3000
        });
    } catch (error: any) {
        toast.current?.show({
            severity: 'error',
            summary: t('ERROR'),
            detail: t('BUNDLES_DELETE_FAILED'),
            life: 3000
        });
    }
};

// Set Provider
export const _setProvider =
    (
        bundleId: number,
        providerData: {
            api_provider_id: number;
            api_provider_bundle_id: string | number;
            api_binding: ApiBinding;
        },
        toast: React.RefObject<Toast>,
        t: (key: string) => string
    ) =>
    async (dispatch: Dispatch) => {
        dispatch({ type: SET_PROVIDER_REQUEST });
        try {
            const token = getAuthToken();
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/bundles/${bundleId}/set-provider`, providerData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            dispatch({
                type: SET_PROVIDER_SUCCESS,
                payload: { id: bundleId, ...response.data.data.bundle }
            });

            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESS'),
                detail: t('PROVIDER_SET_SUCCESS'),
                life: 3000
            });
        } catch (error: any) {
            dispatch({
                type: SET_PROVIDER_FAIL,
                payload: error.message
            });
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('PROVIDER_SET_FAILED'),
                life: 3000
            });
        }
    };

// Unset Provider
export const _unsetProvider = (bundleId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: UNSET_PROVIDER_REQUEST });
    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/bundles/${bundleId}/unset-provider`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        dispatch({
            type: UNSET_PROVIDER_SUCCESS,
            payload: { id: bundleId, ...response.data.data.bundle }
        });

        toast.current?.show({
            severity: 'success',
            summary: t('SUCCESS'),
            detail: t('PROVIDER_UNSET_SUCCESS'),
            life: 3000
        });
    } catch (error: any) {
        dispatch({
            type: UNSET_PROVIDER_FAIL,
            payload: error.message
        });
        toast.current?.show({
            severity: 'error',
            summary: t('ERROR'),
            detail: t('PROVIDER_UNSET_FAILED'),
            life: 3000
        });
    }
};



// Bundle Price Adjustment Preview
export const _bundlePriceAdjustmentPreview = 
    (payload: PriceAdjustmentPayload, toast: React.RefObject<Toast>, t: (key: string) => string) => 
    async (dispatch: Dispatch) => {
        dispatch({ type: BUNDLE_PRICE_ADJUSTMENT_PREVIEW_REQUEST });
        try {
            const token = getAuthToken();
            
            // Remove confirmation for preview
            const previewPayload = { ...payload };
            delete previewPayload.confirmation;

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/bundles/bulk-update-prices`,
                previewPayload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            dispatch({
                type: BUNDLE_PRICE_ADJUSTMENT_PREVIEW_SUCCESS,
                payload: response.data.data.preview
            });

            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESS'),
                detail: t('PREVIEW_GENERATED_SUCCESSFULLY'),
                life: 3000
            });

            return response.data.data.preview;
        } catch (error: any) {
            dispatch({
                type: BUNDLE_PRICE_ADJUSTMENT_PREVIEW_FAIL,
                payload: error.response?.data?.message || error.message
            });

            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: error.response?.data?.message || t('PREVIEW_GENERATION_FAILED'),
                life: 3000
            });
        }
    };

// Bundle Price Adjustment Update
export const _bundlePriceAdjustmentUpdate = 
    (payload: PriceAdjustmentPayload, toast: React.RefObject<Toast>, t: (key: string) => string) => 
    async (dispatch: Dispatch) => {
        dispatch({ type: BUNDLE_PRICE_ADJUSTMENT_UPDATE_REQUEST });
        try {
            const token = getAuthToken();

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/bundles/bulk-update-prices`,
                {
                    ...payload,
                    confirmation: true
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            dispatch({
                type: BUNDLE_PRICE_ADJUSTMENT_UPDATE_SUCCESS,
                payload: response.data.data.updated_bundles
            });

            // Refresh the bundle list to get updated prices
            //dispatch(_fetchBundleList(1, ''));

            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESS'),
                detail: t('PRICES_UPDATED_SUCCESSFULLY'),
                life: 5000
            });

            return response.data.data.updated_bundles;
        } catch (error: any) {
            dispatch({
                type: BUNDLE_PRICE_ADJUSTMENT_UPDATE_FAIL,
                payload: error.response?.data?.message || error.message
            });

            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: error.response?.data?.message || t('PRICE_UPDATE_FAILED'),
                life: 3000
            });
        }
    };


    // bulk Bundle Price Update
export const _blukbundlePriceUpdate = 
    (payload: BulkBundlePricePayload, toast: React.RefObject<Toast>, t: (key: string) => string) => 
    async (dispatch: Dispatch) => {
        dispatch({ type: BULK_BUNDLE_PRICE_UPDATE_REQUEST });
        try {
            const token = getAuthToken();
            //console.log(payload)
            //return

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/bundles/bulk-update-selling-prices`,
                {
                    ...payload,
                    confirmation: true
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            dispatch({
                type: BULK_BUNDLE_PRICE_UPDATE_SUCCESS,
                payload: response.data.data
            });

            // Refresh the bundle list to get updated prices
            //dispatch(_fetchBundleList(1, ''));

            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESS'),
                detail: t('PRICES_UPDATED_SUCCESSFULLY'),
                life: 5000
            });

            return response.data.data.updated_bundles;
        } catch (error: any) {
            dispatch({
                type: BULK_BUNDLE_PRICE_UPDATE_FAIL,
                payload: error.response?.data?.message || error.message
            });

            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: error.response?.data?.message || t('PRICE_UPDATE_FAILED'),
                life: 3000
            });
        }
    };

// Clear Price Adjustment Preview
export const _clearPriceAdjustmentPreview = () => (dispatch: Dispatch) => {
    dispatch({ type: CLEAR_PRICE_ADJUSTMENT_PREVIEW });
};