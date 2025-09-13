import axios from "axios";
import { Dispatch } from "redux";
import {
    FETCH_PROVIDERS_REQUEST,
    FETCH_PROVIDERS_SUCCESS,
    FETCH_PROVIDERS_FAIL,
    ADD_PROVIDER_REQUEST,
    ADD_PROVIDER_SUCCESS,
    ADD_PROVIDER_FAIL,
    EDIT_PROVIDER_REQUEST,
    EDIT_PROVIDER_SUCCESS,
    EDIT_PROVIDER_FAIL,
    DELETE_PROVIDER_REQUEST,
    DELETE_PROVIDER_SUCCESS,
    DELETE_PROVIDER_FAIL,
    TOGGLE_PROVIDER_REQUEST,
    TOGGLE_PROVIDER_SUCCESS,
    TOGGLE_PROVIDER_FAIL,
} from "../constants/providerConstants";
import { Provider } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

// Fetch Providers
export const _fetchProviders = (page: number = 1,search:string='',filters={}) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_PROVIDERS_REQUEST });
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

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api-providers?${queryString}`, {
            headers: { Authorization: `Bearer ${token}` },
        });


        dispatch({
              type: FETCH_PROVIDERS_SUCCESS,
              payload: {
                data: response.data.data.providers,
                pagination: response.data.payload.pagination,
              },
            });
        // Optional success toast for fetch operation
        // toast.current?.show({
        //     severity: "success",
        //     summary: t("SUCCESS"),
        //     detail: t("PROVIDERS_FETCHED"),
        //     life: 3000,
        // });
    } catch (error: any) {
        dispatch({ type: FETCH_PROVIDERS_FAIL, payload: error.message });
    }
};

// Add Provider
export const _addProvider = (provider: Provider, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_PROVIDER_REQUEST });
    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api-providers`,
            provider,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const newData = {...provider, id: response.data.data.provider.id};
        dispatch({ type: ADD_PROVIDER_SUCCESS, payload: newData });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("PROVIDER_ADDED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: ADD_PROVIDER_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("PROVIDER_ADD_FAILED"),
            life: 3000,
        });
    }
};

// Edit Provider
export const _editProvider = (id: number, updatedData: Provider, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_PROVIDER_REQUEST });
    try {
        const token = getAuthToken();
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api-providers/${id}`,
            updatedData,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const newData = {...updatedData, id: response.data.data.provider.id};
        dispatch({ type: EDIT_PROVIDER_SUCCESS, payload: newData });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("PROVIDER_UPDATED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: EDIT_PROVIDER_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("PROVIDER_UPDATE_FAILED"),
            life: 3000,
        });
    }
};

// Delete Provider
export const _deleteProvider = (id: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_PROVIDER_REQUEST });
    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api-providers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: DELETE_PROVIDER_SUCCESS, payload: id });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("PROVIDER_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: DELETE_PROVIDER_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("PROVIDER_DELETE_FAILED"),
            life: 3000,
        });
    }
};

// Delete Selected Providers
export const _deleteSelectedProviders = async (
  providerIds: number[],
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => {
  const token = getAuthToken();

  try {
    for (const id of providerIds) {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/api-providers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('PROVIDERS_DELETED'),
      life: 3000,
    });
  } catch (error: any) {
    toast.current?.show({
      severity: 'error',
      summary: t('ERROR'),
      detail: t('PROVIDERS_DELETE_FAILED'),
      life: 3000,
    });
  }
};



// Toggle Provider
export const _toggleProvider = (
  id: number,
  isActive: boolean,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: TOGGLE_PROVIDER_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api-providers/${id}/toggle`,
      { is_active: isActive },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updatedProvider = response.data.data.provider;

    dispatch({ type: TOGGLE_PROVIDER_SUCCESS, payload: updatedProvider });

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: updatedProvider.is_active
        ? t('PROVIDER_ACTIVATED')
        : t('PROVIDER_DEACTIVATED'),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: TOGGLE_PROVIDER_FAIL, payload: error.message });
    toast.current?.show({
      severity: 'error',
      summary: t('ERROR'),
      detail: t('PROVIDER_TOGGLE_FAILED'),
      life: 3000,
    });
  }
};
