import axios from "axios";
import { Dispatch } from "redux";
import {
    FETCH_DISTRICTS_REQUEST,
    FETCH_DISTRICTS_SUCCESS,
    FETCH_DISTRICTS_FAIL,
    ADD_DISTRICT_REQUEST,
    ADD_DISTRICT_SUCCESS,
    ADD_DISTRICT_FAIL,
    EDIT_DISTRICT_REQUEST,
    EDIT_DISTRICT_SUCCESS,
    EDIT_DISTRICT_FAIL,
    DELETE_DISTRICT_REQUEST,
    DELETE_DISTRICT_SUCCESS,
    DELETE_DISTRICT_FAIL,
} from "../constants/districtsConstants";
import { District } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

// Fetch Districts
export const _fetchDistricts = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_DISTRICTS_REQUEST });
    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/districts`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: FETCH_DISTRICTS_SUCCESS, payload: response.data.data.districts });

        // Optional success toast for fetch operation
        // toast.current?.show({
        //     severity: "success",
        //     summary: t("SUCCESS"),
        //     detail: t("DISTRICTS_FETCHED"),
        //     life: 3000,
        // });
    } catch (error: any) {
        dispatch({ type: FETCH_DISTRICTS_FAIL, payload: error.message });

    }
};

// Add District
export const _addDistrict = (district: District, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_DISTRICT_REQUEST });
    try {
        const token = getAuthToken();
        const body = {...district, province_id: district.province?.id};
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/districts`,
            body,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const newData = {...district, id: response.data.data.district.id};
        dispatch({ type: ADD_DISTRICT_SUCCESS, payload: newData });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("DISTRICT_ADDED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: ADD_DISTRICT_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("DISTRICT_ADD_FAILED"),
            life: 3000,
        });
    }
};

// Edit District
export const _editDistrict = (id: number, updatedData: District, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_DISTRICT_REQUEST });
    try {
        const token = getAuthToken();
        const body = {...updatedData, province_id: updatedData.province?.id};
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}/districts/${id}`,
            body,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const newData = {...updatedData, id: response.data.data.district.id};
        dispatch({ type: EDIT_DISTRICT_SUCCESS, payload: newData });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("DISTRICT_UPDATED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: EDIT_DISTRICT_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("DISTRICT_UPDATE_FAILED"),
            life: 3000,
        });
    }
};

// Delete District
export const _deleteDistrict = (id: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_DISTRICT_REQUEST });
    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/districts/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        dispatch({ type: DELETE_DISTRICT_SUCCESS, payload: id });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("DISTRICT_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: DELETE_DISTRICT_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("DISTRICT_DELETE_FAILED"),
            life: 3000,
        });
    }
};



export const _deleteSelectedDistricts = async (
  provinceIds: number[],
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => {
  const token = getAuthToken();

  try {
    for (const id of provinceIds) {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/districts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('DISTRICTS_DELETED'),
      life: 3000,
    });
  } catch (error: any) {
    toast.current?.show({
      severity: 'error',
      summary: t('ERROR'),
      detail: t('DISTRICTS_DELETE_FAILED'),
      life: 3000,
    });
  }
};
