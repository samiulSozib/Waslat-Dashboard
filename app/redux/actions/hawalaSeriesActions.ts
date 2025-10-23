import axios from "axios";
import {
  FETCH_HAWALA_NUMBER_SERIES_LIST_REQUEST,
  FETCH_HAWALA_NUMBER_SERIES_LIST_SUCCESS,
  FETCH_HAWALA_NUMBER_SERIES_LIST_FAIL,
  FETCH_HAWALA_NUMBER_SERIES_NEXT_REQUEST,
  FETCH_HAWALA_NUMBER_SERIES_NEXT_SUCCESS,
  FETCH_HAWALA_NUMBER_SERIES_NEXT_FAIL,
  HAWALA_NUMBER_SERIES_STATUS_CHANGE_REQUEST,
  HAWALA_NUMBER_SERIES_STATUS_CHANGE_SUCCESS,
  HAWALA_NUMBER_SERIES_STATUS_CHANGE_FAIL,
  DELETE_HAWALA_NUMBER_SERIES_REQUEST,
  DELETE_HAWALA_NUMBER_SERIES_SUCCESS,
  DELETE_HAWALA_NUMBER_SERIES_FAIL,
  ADD_HAWALA_NUMBER_SERIES_REQUEST,
  ADD_HAWALA_NUMBER_SERIES_SUCCESS,
  ADD_HAWALA_NUMBER_SERIES_FAIL,
  EDIT_HAWALA_NUMBER_SERIES_REQUEST,
  EDIT_HAWALA_NUMBER_SERIES_SUCCESS,
  EDIT_HAWALA_NUMBER_SERIES_FAIL,
} from "../constants/hawalaSeriesConstants";
import { Dispatch } from "redux";
import { Toast } from "primereact/toast";

const getAuthToken = () => localStorage.getItem("api_token") || "";

// ✅ Fetch Hawala Number Series List
export const _fetchHawalaNumberSeriesList =
  (page: number = 1, search: string = "") =>
  async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_HAWALA_NUMBER_SERIES_LIST_REQUEST });
    try {
      const token = getAuthToken();
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/hawala-number-series?search=${search}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch({
        type: FETCH_HAWALA_NUMBER_SERIES_LIST_SUCCESS,
        payload: {
          data: response.data.data.series,
          pagination: response.data.payload.pagination,
        },
      });
    } catch (error: any) {
      dispatch({
        type: FETCH_HAWALA_NUMBER_SERIES_LIST_FAIL,
        payload: error.message,
      });
    }
  };

  // ✅ Fetch Next Hawala Number for a Branch
export const _fetchHawalaNextNumber =
  (branchId: number|string|null|undefined, toast: React.RefObject<Toast>, t: (key: string) => string) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_HAWALA_NUMBER_SERIES_NEXT_REQUEST });
    try {
      const token = localStorage.getItem("api_token") || "";

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/hawala-number-series/branch/${branchId}/next-number`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Assuming API response looks like: { success: true, data: { next_number: "DXB0012" } }
      if (response.data.success) {
        dispatch({
          type: FETCH_HAWALA_NUMBER_SERIES_NEXT_SUCCESS,
          payload: response.data.data,
        });

        toast.current?.show({
          severity: "success",
          summary: t("SUCCESS"),
          detail: t("NEXT_HAWALA_NUMBER_FETCHED"),
          life: 3000,
        });
                return response.data.data; // Return the data for await

      } else {
        throw new Error(response.data.message || "Failed to fetch next number");
      }
    } catch (error: any) {
      dispatch({
        type: FETCH_HAWALA_NUMBER_SERIES_NEXT_FAIL,
        payload: error.message,
      });

      toast.current?.show({
        severity: "error",
        summary: t("ERROR"),
        detail: t("NEXT_HAWALA_NUMBER_FETCH_FAILED"),
        life: 3000,
      });
    }
  };


// ✅ Add Hawala Number Series
export const _addHawalaNumberSeries =
  (data: any, toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_HAWALA_NUMBER_SERIES_REQUEST });
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/hawala-number-series`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch({
        type: ADD_HAWALA_NUMBER_SERIES_SUCCESS,
        payload: response.data.data.series,
      });

      toast.current?.show({
        severity: "success",
        summary: t("SUCCESS"),
        detail: t('HAWALA_NUMBER_SERIES_ADDED'),
        life: 3000,
      });
    } catch (error: any) {
      dispatch({
        type: ADD_HAWALA_NUMBER_SERIES_FAIL,
        payload: error.message,
      });

      let errorMessage = t('HAWALA_NUMBER_SERIES_ADD_FAILED');
      if (error.response?.status === 422 && error.response.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors)
          .flat()
          .join(", ");
        errorMessage = errorMessages || "Validation failed";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: 3000,
      });
    }
  };

// ✅ Edit Hawala Number Series
export const _editHawalaNumberSeries =
  (id: number, data: any, toast: React.RefObject<Toast>,t: (key: string) => string) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_HAWALA_NUMBER_SERIES_REQUEST });
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/hawala-number-series/${id}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch({
        type: EDIT_HAWALA_NUMBER_SERIES_SUCCESS,
        payload: { ...data, id },
      });

      toast.current?.show({
        severity: "success",
        summary: t('SUCCESS'),
        detail: t("HAWALA_NUMBER_SERIES_UPDATED"),
        life: 3000,
      });
    } catch (error: any) {
      dispatch({
        type: EDIT_HAWALA_NUMBER_SERIES_FAIL,
        payload: error.message,
      });

      toast.current?.show({
        severity: "error",
        summary: t("ERROR"),
        detail: t("HAWALA_NUMBER_SERIES_UPDATE_FAILED"),
        life: 3000,
      });
    }
  };

// ✅ Delete Hawala Number Series
export const _deleteHawalaNumberSeries =
  (id: number, toast: React.RefObject<Toast>, t: (key: string) => string) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_HAWALA_NUMBER_SERIES_REQUEST });
    try {
      const token = getAuthToken();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/hawala-number-series/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch({
        type: DELETE_HAWALA_NUMBER_SERIES_SUCCESS,
        payload: id,
      });

      toast.current?.show({
        severity: "success",
        summary: t("SUCCESS"),
        detail: t("HAWALA_NUMBER_SERIES_DELETED"),
        life: 3000,
      });
    } catch (error: any) {
      dispatch({
        type: DELETE_HAWALA_NUMBER_SERIES_FAIL,
        payload: error.message,
      });

      toast.current?.show({
        severity: "error",
        summary: t("ERROR"),
        detail: t("HAWALA_NUMBER_SERIES_DELETE_FAILED"),
        life: 3000,
      });
    }
  };

// ✅ Change Status of Hawala Number Series (Active / Inactive)
export const _changeHawalaNumberSeriesStatus =
  (id: number, is_active: boolean, toast: React.RefObject<Toast>, t: (key: string) => string) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: HAWALA_NUMBER_SERIES_STATUS_CHANGE_REQUEST });
    try {
      const token = getAuthToken();
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/hawala-number-series/change-status/${id}`,
        { is_active },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      dispatch({
        type: HAWALA_NUMBER_SERIES_STATUS_CHANGE_SUCCESS,
        payload: { id, is_active },
      });

      toast.current?.show({
        severity: "success",
        summary: t("SUCCESS"),
        detail: t("HAWALA_NUMBER_SERIES_STATUS_CHANGED"),
        life: 3000,
      });
    } catch (error: any) {
      dispatch({
        type: HAWALA_NUMBER_SERIES_STATUS_CHANGE_FAIL,
        payload: error.message,
      });

      toast.current?.show({
        severity: "error",
        summary: t("ERROR"),
        detail: t("HAWALA_NUMBER_SERIES_STATUS_CHANGE_FAILED"),
        life: 3000,
      });
    }
  };
