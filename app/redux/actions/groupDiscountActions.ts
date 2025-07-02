// store/actions/GroupDiscountActions.ts
import { Dispatch } from "redux";
import axios from "axios";

import {
  FETCH_GROUP_DISCOUNTS_REQUEST,
  FETCH_GROUP_DISCOUNTS_SUCCESS,
  FETCH_GROUP_DISCOUNTS_FAIL,
  ADD_GROUP_DISCOUNT_REQUEST,
  ADD_GROUP_DISCOUNT_SUCCESS,
  ADD_GROUP_DISCOUNT_FAIL,
  EDIT_GROUP_DISCOUNT_REQUEST,
  EDIT_GROUP_DISCOUNT_SUCCESS,
  EDIT_GROUP_DISCOUNT_FAIL,
  DELETE_GROUP_DISCOUNT_REQUEST,
  DELETE_GROUP_DISCOUNT_SUCCESS,
  DELETE_GROUP_DISCOUNT_FAIL,
} from "../constants/groupDiscountConstants";
import { GroupDiscount } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || ""; // Retrieve the token from localStorage
};

// Fetch group discount
export const _fetchGroupDiscounts = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_GROUP_DISCOUNTS_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/group-discounts`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: FETCH_GROUP_DISCOUNTS_SUCCESS, payload: response.data.data.group_discounts });
  } catch (error: any) {
    dispatch({ type: FETCH_GROUP_DISCOUNTS_FAIL, payload: error.message });
  }
};

// Add a Group Discount
export const _addGroupDiscount = (groupDiscountData: GroupDiscount, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_GROUP_DISCOUNT_REQUEST });

  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('reseller_group_id', groupDiscountData.reseller_group?.id ? groupDiscountData.reseller_group?.id.toString() : '');
    formData.append('service_id', groupDiscountData.service?.id ? groupDiscountData.service.id.toString() : '');
    formData.append('bundle_id', groupDiscountData.bundle?.id ? groupDiscountData.bundle.id.toString() : '');
    formData.append('discount_type', groupDiscountData.discount_type);
    formData.append('discount_value', groupDiscountData.discount_value);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/group-discounts`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const newData = { ...groupDiscountData, id: response.data.data.id };

    dispatch({ type: ADD_GROUP_DISCOUNT_SUCCESS, payload: newData });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("GROUP_DISCOUNT_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: ADD_GROUP_DISCOUNT_FAIL, payload: error.message });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("GROUP_DISCOUNT_ADD_FAILED"),
      life: 3000,
    });
  }
};

// Edit a Group Discount
export const _editGroupDiscount = (groupDiscountId: number, groupDiscountData: GroupDiscount, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_GROUP_DISCOUNT_REQUEST });

  try {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('reseller_group_id', groupDiscountData.reseller_group?.id ? groupDiscountData.reseller_group?.id.toString() : '');
    formData.append('service_id', groupDiscountData.service?.id ? groupDiscountData.service.id.toString() : '');
    formData.append('bundle_id', groupDiscountData.bundle?.id ? groupDiscountData.bundle.id.toString() : '');
    formData.append('discount_type', groupDiscountData.discount_type);
    formData.append('discount_value', groupDiscountData.discount_value);

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/group-discounts/${groupDiscountId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const newData = { ...groupDiscountData, id: response.data.data.groupDiscountId };

    dispatch({ type: EDIT_GROUP_DISCOUNT_SUCCESS, payload: newData });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("GROUP_DISCOUNT_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: EDIT_GROUP_DISCOUNT_FAIL, payload: error.message });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("GROUP_DISCOUNT_UPDATE_FAILED"),
      life: 3000,
    });
  }
};

// Delete a Group Discount
export const _deleteGroupDiscount = (groupDiscountID: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_GROUP_DISCOUNT_REQUEST });

  try {
    const token = getAuthToken();
    await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/group-discounts/${groupDiscountID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: DELETE_GROUP_DISCOUNT_SUCCESS, payload: groupDiscountID });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("GROUP_DISCOUNT_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: DELETE_GROUP_DISCOUNT_FAIL, payload: error.message });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("GROUP_DISCOUNT_DELETE_FAILED"),
      life: 3000,
    });
  }
};
