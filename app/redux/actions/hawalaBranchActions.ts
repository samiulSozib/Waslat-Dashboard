import axios from "axios";
import {
  FETCH_HAWALA_BRANCH_LIST_REQUEST,
  FETCH_HAWALA_BRANCH_LIST_SUCCESS,
  FETCH_HAWALA_BRANCH_LIST_FAIL,
  ADD_HAWALA_BRANCH_REQUEST,
  ADD_HAWALA_BRANCH_SUCCESS,
  ADD_HAWALA_BRANCH_FAIL,
  EDIT_HAWALA_BRANCH_REQUEST,
  EDIT_HAWALA_BRANCH_SUCCESS,
  EDIT_HAWALA_BRANCH_FAIL,
  DELETE_HAWALA_BRANCH_REQUEST,
  DELETE_HAWALA_BRANCH_SUCCESS,
  DELETE_HAWALA_BRANCH_FAIL
} from '../constants/hawalaBranchConstants';
import { Toast } from "primereact/toast";
import { Dispatch } from "redux";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || "";
};

// Fetch Hawala Branch List
export const _fetchHawalaBranchList = (page: number = 1, search: string = '') => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_HAWALA_BRANCH_LIST_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-branches?search=${search}&page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({
      type: FETCH_HAWALA_BRANCH_LIST_SUCCESS,
      payload: {
        data: response.data.data.hawalabranches,
        pagination: response.data.payload.pagination,
      },
    });

    // Optional success toast
    // toast.current?.show({
    //   severity: "success",
    //   summary: t("SUCCESS"),
    //   detail: t("HAWALA_BRANCH_FETCHED"),
    //   life: 3000,
    // });
  } catch (error: any) {
    dispatch({ type: FETCH_HAWALA_BRANCH_LIST_FAIL, payload: error.message });

  }
};

// Add Hawala Branch
export const _addHawalaBranch = (newData: any, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_HAWALA_BRANCH_REQUEST });
  try {
    const formData = new FormData();
    formData.append("name", newData.name);
    formData.append("email", newData.email);
    formData.append("password", newData.password);
    formData.append("address", newData.address);
    formData.append("phone_number", newData.phone_number);
    formData.append("commission_type", newData.commission_type);
    formData.append("amount", newData.amount);
    formData.append("status", newData.status);

    const token = getAuthToken();
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-branches`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    dispatch({
      type: ADD_HAWALA_BRANCH_SUCCESS,
      payload: response.data.data.branch,
    });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("HAWALA_BRANCH_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: ADD_HAWALA_BRANCH_FAIL, payload: error.message });

    let errorMessage = t("HAWALA_BRANCH_ADD_FAILED");
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

// Edit Hawala Branch
export const _editHawalaBranch = (hawalaId: number, updatedData: any, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_HAWALA_BRANCH_REQUEST });
  try {
    const formData = new FormData();
    formData.append("name", updatedData.name);
    formData.append("email", updatedData.email);
    formData.append("password", updatedData.password);
    formData.append("address", updatedData.address);
    formData.append("phone_number", updatedData.phone_number);
    formData.append("commission_type", updatedData.commission_type);
    formData.append("amount", updatedData.amount);
    formData.append("status", updatedData.status);

    const token = getAuthToken();
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-branches/${hawalaId}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const newData = { ...updatedData, id: hawalaId };
    dispatch({ type: EDIT_HAWALA_BRANCH_SUCCESS, payload: newData });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("HAWALA_BRANCH_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: EDIT_HAWALA_BRANCH_FAIL, payload: error.message });

    let errorMessage = t("HAWALA_BRANCH_UPDATE_FAILED");
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

// Delete Hawala Branch
export const _deleteHawalaBranch = (hawalaId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_HAWALA_BRANCH_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-branches/${hawalaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({ type: DELETE_HAWALA_BRANCH_SUCCESS, payload: hawalaId });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("HAWALA_BRANCH_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: DELETE_HAWALA_BRANCH_FAIL, payload: error.message });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("HAWALA_BRANCH_DELETE_FAILED"),
      life: 3000,
    });
  }
};
