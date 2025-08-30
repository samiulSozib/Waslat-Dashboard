

import { Dispatch } from "redux";
import axios from "axios";
import {
  FETCH_PAYMENT_TYPE_LIST_REQUEST,
  FETCH_PAYMENT_TYPE_LIST_SUCCESS,
  FETCH_PAYMENT_TYPE_LIST_FAIL,
  DELETE_PAYMENT_TYPE_REQUEST,
  DELETE_PAYMENT_TYPE_SUCCESS,
  DELETE_PAYMENT_TYPE_FAIL,
  ADD_PAYMENT_TYPE_REQUEST,
  ADD_PAYMENT_TYPE_SUCCESS,
  ADD_PAYMENT_TYPE_FAIL,
  EDIT_PAYMENT_TYPE_REQUEST,
  EDIT_PAYMENT_TYPE_SUCCESS,
  EDIT_PAYMENT_TYPE_FAIL,
} from "../constants/paymentTypeConstants";
import { PaymentType } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = (): string => {
  return localStorage.getItem("api_token") || "";
};

// Fetch Payment TYPEs
export const _fetchPaymentTypes = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_PAYMENT_TYPE_LIST_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/paymenttypes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({
      type: FETCH_PAYMENT_TYPE_LIST_SUCCESS,
      payload: response.data.data.paymenttypes,
    });

  } catch (error: any) {
    dispatch({
      type: FETCH_PAYMENT_TYPE_LIST_FAIL,
      payload: error.message ,
    });

  }
};

// Add Payment TYPE
export const _addPaymentType = (
  paymentType: PaymentType,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_PAYMENT_TYPE_REQUEST });
  const formData = new FormData();
  formData.append('name', paymentType.name);
  formData.append('description', paymentType.description);


  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/paymenttypes`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    dispatch({
      type: ADD_PAYMENT_TYPE_SUCCESS,
      payload: response.data.data.payment_type,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("PAYMENT_TYPE_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: ADD_PAYMENT_TYPE_FAIL, payload: error.message });

    let errorMessage = t("PAYMENT_TYPE_ADD_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .flat()
        .join(', ');
      errorMessage = errorMessages || t("VALIDATION_FAILED");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage,
      life: 3000,
    });
  }
};

// Edit Payment TYPE
export const _editPaymentType = (
  paymentTypeId: number,
  paymentType: PaymentType,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_PAYMENT_TYPE_REQUEST });
  const formData = new FormData();
  formData.append('name', paymentType.name);
  formData.append('description', paymentType.description);


  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/paymenttypes/${paymentTypeId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    dispatch({
      type: EDIT_PAYMENT_TYPE_SUCCESS,
      payload: response.data.data.payment_type,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("PAYMENT_TYPE_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: EDIT_PAYMENT_TYPE_FAIL, payload: error.message });

    let errorMessage = t("PAYMENT_TYPE_UPDATE_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .flat()
        .join(', ');
      errorMessage = errorMessages || t("VALIDATION_FAILED");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage,
      life: 3000,
    });
  }
};

// Delete Payment TYPE
export const _deletePaymentType = (
  id: number,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_PAYMENT_TYPE_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/paymenttypes/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: DELETE_PAYMENT_TYPE_SUCCESS,
      payload: id,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("PAYMENT_TYPE_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: DELETE_PAYMENT_TYPE_FAIL, payload: error.message });

    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("PAYMENT_TYPE_DELETE_FAILED"),
      life: 3000,
    });
  }
};
