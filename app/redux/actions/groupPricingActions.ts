import axios from "axios";
import { Toast } from "primereact/toast";
import { Dispatch } from "redux";
import { ADD_GROUP_PRICING_FAIL, ADD_GROUP_PRICING_REQUEST, ADD_GROUP_PRICING_SUCCESS, DELETE_GROUP_PRICING_FAIL, DELETE_GROUP_PRICING_REQUEST, DELETE_GROUP_PRICING_SUCCESS, EDIT_GROUP_PRICING_FAIL, EDIT_GROUP_PRICING_REQUEST, EDIT_GROUP_PRICING_SUCCESS, FETCH_GROUP_PRICING_LIST_FAIL, FETCH_GROUP_PRICING_LIST_REQUEST, FETCH_GROUP_PRICING_LIST_SUCCESS } from "../constants/groupPricing";
import { GroupPricing } from "@/types/interface";
import { useTranslation } from "react-i18next";


const getAuthToken = () => {
  return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
};

// Fetch hawala List
export const _fetchGroupPricingList = (search:string='') => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_GROUP_PRICING_LIST_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/group-pricings?search=${search}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    //console.log(response)
    dispatch({
      type: FETCH_GROUP_PRICING_LIST_SUCCESS,
      payload: {
        data:response.data.data.group_pricings,
    },
    });
    //console.log(response)
  } catch (error: any) {
    //console.log(error)
    dispatch({
      type: FETCH_GROUP_PRICING_LIST_FAIL,
      payload: error.message,
    });

  }
};

// Add Group Pricing
export const _addGroupPricing = (newData: GroupPricing, toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_GROUP_PRICING_REQUEST });
  try {
    const formData = new FormData();

    // Required fields
    formData.append("reseller_group_id", newData.reseller_group_id.toString());
    formData.append("service_id", newData.service_id.toString());

    // Optional fields with null checks
    if (newData.fixed_fee !== null) {
      formData.append("fixed_fee", newData.fixed_fee.toString());
    }
    if (newData.markup_percentage !== null) {
      formData.append("markup_percentage", newData.markup_percentage.toString());
    }
    formData.append("use_fixed_fee", newData.use_fixed_fee ? "1" : "0");
    formData.append("use_markup", newData.use_markup ? "1" : "0");
    formData.append("status", newData.status.toString());

    const token = getAuthToken();
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/group-pricings`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    //console.log(response)
    const _newData={...newData,id:response.data.data.group_pricing.id}
    dispatch({
      type: ADD_GROUP_PRICING_SUCCESS,
      payload: _newData,
    });

   toast.current?.show({
      severity: "success",
      summary: t("SUCCESSFUL"),
      detail: t("GROUP_PRICE_ADDED_SUCCESSFULLY"),
      life: 3000,
    });

  } catch (error: any) {
    dispatch({
      type: ADD_GROUP_PRICING_FAIL,
      payload: error.message,
    });

    let errorMessage = t("FAILED_TO_ADD_GROUP_PRICE");
    if (error.response?.status === 422 && error.response.data?.errors) {
      errorMessage = Object.values(error.response.data.errors)
        .flat()
        .join(', ');
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: errorMessage,
      life: 3000,
    });

    throw error;
  }
};

// Edit Group Pricing
export const _editGroupPricing = (groupPriceId: number, updatedData: Partial<GroupPricing>, toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_GROUP_PRICING_REQUEST });
  try {
    const formData = new FormData();

    // Only append fields that are being updated
    if (updatedData.reseller_group_id !== undefined) {
      formData.append("reseller_group_id", updatedData.reseller_group_id.toString());
    }
    if (updatedData.service_id !== undefined) {
      formData.append("service_id", updatedData.service_id.toString());
    }
    if (updatedData.fixed_fee !== undefined && updatedData.fixed_fee !== null) {
      formData.append("fixed_fee", updatedData.fixed_fee.toString());
    }
    if (updatedData.markup_percentage !== undefined && updatedData.markup_percentage !== null) {
      formData.append("markup_percentage", updatedData.markup_percentage.toString());
    }
    if (updatedData.use_fixed_fee !== undefined) {
      formData.append("use_fixed_fee", updatedData.use_fixed_fee ? "1" : "0");
    }
    if (updatedData.use_markup !== undefined) {
      formData.append("use_markup", updatedData.use_markup ? "1" : "0");
    }
    if (updatedData.status !== undefined) {
      formData.append("status", updatedData.status.toString());
    }

    const token = getAuthToken();
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/group-pricings/${groupPriceId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    const newData={...updatedData,id:groupPriceId}
    dispatch({
      type: EDIT_GROUP_PRICING_SUCCESS,
      payload: newData,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESSFUL"),
      detail: t("GROUP_PRICE_UPDATED_SUCCESSFULLY"),
      life: 3000,
    });

  } catch (error: any) {
    dispatch({
      type: EDIT_GROUP_PRICING_FAIL,
      payload: error.message,
    });

    let errorMessage = t("FAILED_TO_UPDATE_GROUP_PRICE");
    if (error.response?.status === 422 && error.response.data?.errors) {
      errorMessage = Object.values(error.response.data.errors)
        .flat()
        .join(', ');
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: errorMessage,
      life: 3000,
    });

    throw error;
  }
};

// Delete Hawala Branch
export const _deleteGroupPricing = (groupPriceId: number, toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_GROUP_PRICING_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/group-pricings/${groupPriceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: DELETE_GROUP_PRICING_SUCCESS,
      payload: groupPriceId,
    });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESSFUL"),
      detail: t("GROUP_PRICE_DELETED_SUCCESSFULLY"),
      life: 3000,
    });
  } catch (error: any) {
    //console.log(error)
    dispatch({
      type: DELETE_GROUP_PRICING_FAIL,
      payload: error.message,
    });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("FAILED_TO_DELETE_GROUP_PRICE"),
      life: 3000,
    });
  }
};
