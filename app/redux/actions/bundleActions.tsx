import { Dispatch } from "redux";
import axios from "axios";
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
} from "../constants/bundleConstants";
import { Toast } from "primereact/toast";
import { Bundle } from "@/types/interface";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
  };

// Fetch Bundle List
export const _fetchBundleList = (page: number = 1,search:string='',filters={}) => async (dispatch: Dispatch) => {
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
        Authorization: `Bearer ${token}`,
      },
    });
    //console.log(response)
    dispatch({
      type: FETCH_BUNDLE_LIST_SUCCESS,
      payload: {
        data: response.data.data.bundles,
        pagination: response.data.payload.pagination,
      },
    });
  } catch (error: any) {
    dispatch({
      type: FETCH_BUNDLE_LIST_FAIL,
      payload: error.message,
    });
  }
};

// Add Bundle
export const _addBundle = (newBundleData: Bundle, toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
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
        amount:newBundleData.amount
    };
    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/bundles`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const newData={...newBundleData,id:response.data.data.bundle.id}
    dispatch({
      type: ADD_BUNDLE_SUCCESS,
      payload: newData,
    });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("BUNDLE_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: ADD_BUNDLE_FAIL,
      payload: error.message,
    });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("BUNDLE_ADD_FAILED"),
      life: 3000,
    });
  }
};

// Edit Bundle
export const _editBundle = (bundleId: number, updatedBundleData: Bundle, toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_BUNDLE_REQUEST });
  try {

    const body = {
        bundle_code:updatedBundleData.bundle_code,
        service_id: updatedBundleData.service?.id,
        bundle_title: updatedBundleData.bundle_title,
        bundle_description: updatedBundleData.bundle_description,
        bundle_type: updatedBundleData.bundle_type,
        validity_type: updatedBundleData.validity_type,
        admin_buying_price: updatedBundleData.admin_buying_price,
        buying_price: updatedBundleData.buying_price,
        selling_price: updatedBundleData.selling_price,
        currency_id: updatedBundleData.currency?.id,
        amount:updatedBundleData.amount
    };
    const token = getAuthToken();
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URL}/bundles/${bundleId}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const newData={...updatedBundleData,id:response.data.data.bundle.id}
    dispatch({
      type: EDIT_BUNDLE_SUCCESS,
      payload: newData,
    });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("BUNDLE_EDITED"),
      life: 3000,
    });
  } catch (error: any) {
    //console.log(error)
    dispatch({
      type: EDIT_BUNDLE_FAIL,
      payload: error.message,
    });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("BUNDLE_EDIT_FAILED"),
      life: 3000,
    });
  }
};

// Delete Bundle
export const _deleteBundle = (bundleId: number, toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_BUNDLE_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/bundles/${bundleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: DELETE_BUNDLE_SUCCESS,
      payload: bundleId,
    });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("BUNDLE_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: DELETE_BUNDLE_FAIL,
      payload: error.message,
    });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("BUNDLE_DELETE_FAILED"),
      life: 3000,
    });
  }
};



export const _deleteSelectedBundles = async (
  bundleIds: number[],
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => {
  const token = getAuthToken();

  try {
    for (const id of bundleIds) {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/bundles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('BUNDLES_DELETED'),
      life: 3000,
    });
  } catch (error: any) {
    toast.current?.show({
      severity: 'error',
      summary: t('ERROR'),
      detail: t('BUNDLES_DELETE_FAILED'),
      life: 3000,
    });
  }
};
