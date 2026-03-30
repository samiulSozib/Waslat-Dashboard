import { Dispatch } from "redux";
import axios from "axios";
import {
    FETCH_API_KEYS_REQUEST,
    FETCH_API_KEYS_SUCCESS,
    FETCH_API_KEYS_FAIL,
    FETCH_API_KEY_REQUEST,
    FETCH_API_KEY_SUCCESS,
    FETCH_API_KEY_FAIL,
    CREATE_API_KEY_REQUEST,
    CREATE_API_KEY_SUCCESS,
    CREATE_API_KEY_FAIL,
    UPDATE_API_KEY_REQUEST,
    UPDATE_API_KEY_SUCCESS,
    UPDATE_API_KEY_FAIL,
    DELETE_API_KEY_REQUEST,
    DELETE_API_KEY_SUCCESS,
    DELETE_API_KEY_FAIL,
    TOGGLE_API_KEY_REQUEST,
    TOGGLE_API_KEY_SUCCESS,
    TOGGLE_API_KEY_FAIL,
    REGENERATE_API_KEY_REQUEST,
    REGENERATE_API_KEY_SUCCESS,
    REGENERATE_API_KEY_FAIL,
} from '../constants/apiKeyConstants';
import { ApiKey } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

// Fetch all API keys
export const _fetchApiKeys = (page: number = 1, search: string = '', filters: any = {}) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_API_KEYS_REQUEST });

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

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api-keys?items_per_page=${20}&${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({
            type: FETCH_API_KEYS_SUCCESS,
            payload: {
                data: response.data.data.api_keys,
                pagination: response.data.data.pagination,
            }
        });
    } catch (error: any) {
        dispatch({ type: FETCH_API_KEYS_FAIL, payload: error.message });
    }
};

// Fetch single API key by ID
export const _fetchApiKeyById = (apiKeyId: number, toast?: React.RefObject<Toast>, t?: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_API_KEY_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api-keys/${apiKeyId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({
            type: FETCH_API_KEY_SUCCESS,
            payload: response.data.data.api_key
        });
    } catch (error: any) {
        dispatch({ type: FETCH_API_KEY_FAIL, payload: error.message });
        if (toast && t) {
            toast.current?.show({
                severity: "error",
                summary: t("ERROR"),
                detail: t("FETCH_API_KEY_FAILED"),
                life: 3000,
            });
        }
    }
};

// Create API key
export const _createApiKey = (apiKeyData: Partial<ApiKey>, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: CREATE_API_KEY_REQUEST });

    try {
        const token = getAuthToken();

        // Prepare data for API - using regular object instead of FormData
        const requestData: any = {
            name: apiKeyData.name || '',
            rate_limit: apiKeyData.rate_limit || 1000,
        };

        // Add reseller_id if present
        if (apiKeyData.reseller?.id) {
            requestData.reseller_id = apiKeyData.reseller.id;
        }

        // Add allowed_ips as array (not stringified)
        if (apiKeyData.allowed_ips && apiKeyData.allowed_ips.length > 0) {
            requestData.allowed_ips = apiKeyData.allowed_ips;
        }

        // Add expires_at if present (format: YYYY-MM-DD HH:MM:SS)
        if (apiKeyData.expires_at) {
            // If expires_at is a Date object or ISO string, format it properly
            let formattedDate = apiKeyData.expires_at;
            if (typeof formattedDate === 'string' && formattedDate.includes('T')) {
                // Convert ISO format to YYYY-MM-DD HH:MM:SS
                const date = new Date(formattedDate);
                formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
            }
            requestData.expires_at = formattedDate;
        }

        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api-keys`, requestData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        dispatch({ type: CREATE_API_KEY_SUCCESS, payload: response.data.data.api_key });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("API_KEY_CREATED"),
            life: 3000,
        });
    } catch (error: any) {
        console.error('Create API Key Error:', error.response?.data || error.message);
        dispatch({ type: CREATE_API_KEY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: error.response?.data?.message || t("API_KEY_CREATE_FAILED"),
            life: 3000,
        });
    }
};

// Update API key
export const _updateApiKey = (apiKeyId: number, apiKeyData: Partial<ApiKey>, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: UPDATE_API_KEY_REQUEST });

    try {
        const token = getAuthToken();

        // Prepare data for API - using regular object instead of FormData
        const requestData: any = {
            name: apiKeyData.name || '',
            rate_limit: apiKeyData.rate_limit || 1000,
            is_active: apiKeyData.is_active !== undefined ? apiKeyData.is_active : true,
        };

        // Add allowed_ips as array (not stringified)
        if (apiKeyData.allowed_ips && apiKeyData.allowed_ips.length > 0) {
            requestData.allowed_ips = apiKeyData.allowed_ips;
        }

        // Add expires_at if present (format: YYYY-MM-DD HH:MM:SS)
        if (apiKeyData.expires_at) {
            // If expires_at is a Date object or ISO string, format it properly
            let formattedDate = apiKeyData.expires_at;
            if (typeof formattedDate === 'string' && formattedDate.includes('T')) {
                // Convert ISO format to YYYY-MM-DD HH:MM:SS
                const date = new Date(formattedDate);
                formattedDate = date.toISOString().slice(0, 19).replace('T', ' ');
            }
            requestData.expires_at = formattedDate;
        } else if (apiKeyData.expires_at === null || apiKeyData.expires_at === '') {
            // If expires_at is explicitly set to null or empty, send null to remove expiration
            requestData.expires_at = null;
        }

        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api-keys/${apiKeyId}`,
            requestData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        dispatch({ type: UPDATE_API_KEY_SUCCESS, payload: response.data.data.api_key });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("API_KEY_UPDATED"),
            life: 3000,
        });
    } catch (error: any) {
        console.error('Update API Key Error:', error.response?.data || error.message);
        dispatch({ type: UPDATE_API_KEY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: error.response?.data?.message || t("API_KEY_UPDATE_FAILED"),
            life: 3000,
        });
    }
};

// Delete API key
export const _deleteApiKey = (apiKeyId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_API_KEY_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api-keys/${apiKeyId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: DELETE_API_KEY_SUCCESS, payload: apiKeyId });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("API_KEY_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        console.error('Delete API Key Error:', error.response?.data || error.message);
        dispatch({ type: DELETE_API_KEY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: error.response?.data?.message || t("API_KEY_DELETE_FAILED"),
            life: 3000,
        });
    }
};

// Toggle API key status (activate/deactivate)
export const _toggleApiKeyStatus = (apiKeyId: number, isActive: boolean, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: TOGGLE_API_KEY_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api-keys/${apiKeyId}/toggle-status`,
            { is_active: isActive },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        dispatch({ type: TOGGLE_API_KEY_SUCCESS, payload: response.data.data.api_key });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: isActive ? t("API_KEY_ACTIVATED") : t("API_KEY_DEACTIVATED"),
            life: 3000,
        });
    } catch (error: any) {
        console.error('Toggle API Key Status Error:', error.response?.data || error.message);
        dispatch({ type: TOGGLE_API_KEY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: error.response?.data?.message || t("API_KEY_STATUS_TOGGLE_FAILED"),
            life: 3000,
        });
    }
};

// Regenerate API key
export const _regenerateApiKey = (apiKeyId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: REGENERATE_API_KEY_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api-keys/${apiKeyId}/regenerate`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        dispatch({ type: REGENERATE_API_KEY_SUCCESS, payload: response.data.data.api_key });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("API_KEY_REGENERATED"),
            life: 3000,
        });
    } catch (error: any) {
        console.error('Regenerate API Key Error:', error.response?.data || error.message);
        dispatch({ type: REGENERATE_API_KEY_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: error.response?.data?.message || t("API_KEY_REGENERATE_FAILED"),
            life: 3000,
        });
    }
};
