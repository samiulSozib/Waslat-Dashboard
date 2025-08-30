import { Dispatch } from "redux";
import axios from "axios";

import {
  FETCH_COMPANY_CODE_LIST_REQUEST,
  FETCH_COMPANY_CODE_LIST_SUCCESS,
  FETCH_COMPANY_CODE_LIST_FAIL,
  DELETE_COMPANY_CODE_REQUEST,
  DELETE_COMPANY_CODE_SUCCESS,
  DELETE_COMPANY_CODE_FAIL,
  ADD_COMPANY_CODE_REQUEST,
  ADD_COMPANY_CODE_SUCCESS,
  ADD_COMPANY_CODE_FAIL,
  EDIT_COMPANY_CODE_REQUEST,
  EDIT_COMPANY_CODE_SUCCESS,
  EDIT_COMPANY_CODE_FAIL,
} from '../constants/companyCodeConstants';
import { Toast } from "primereact/toast";
import { CompanyCode } from "@/types/interface";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
  };

// FETCH COMPANY CODE LIST ACTION
export const _fetchCompanyCodes = (search:string='') => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_COMPANY_CODE_LIST_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/companycodes?search=${search}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    //console.log(response)
    dispatch({ type: FETCH_COMPANY_CODE_LIST_SUCCESS, payload: response.data.data.company_codes });
  } catch (error: any) {
    dispatch({ type: FETCH_COMPANY_CODE_LIST_FAIL, payload: error.message });

  }
};

// DELETE COMPANY CODE ACTION
export const _deleteCompanyCode = (codeId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_COMPANY_CODE_REQUEST });

  try {
    const token = getAuthToken();
    await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/companycodes/${codeId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: DELETE_COMPANY_CODE_SUCCESS, payload: codeId });
    toast.current?.show({
      severity: 'success',
      summary: t("SUCCESS"),
      detail: t("COMPANY_CODE_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: DELETE_COMPANY_CODE_FAIL, payload: error.message });
    toast.current?.show({
      severity: 'error',
      summary: t("ERROR"),
      detail: t("COMPANY_CODE_DELETE_FAILED"),
      life: 3000,
    });
  }
};

// ADD COMPANY CODE ACTION
export const _addCompanyCode = (newCode: CompanyCode, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_COMPANY_CODE_REQUEST });

  const body = {
    reserved_digit: newCode.reserved_digit,
    company_id: newCode.company?.id,
  };

  try {
    const token = getAuthToken();
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/companycodes`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const newData = {...newCode, id: response.data.data.company_code.id};
    dispatch({ type: ADD_COMPANY_CODE_SUCCESS, payload: newData });
    toast.current?.show({
      severity: 'success',
      summary: t("SUCCESS"),
      detail: t("COMPANY_CODE_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: ADD_COMPANY_CODE_FAIL, payload: error.message });
    toast.current?.show({
      severity: 'error',
      summary: t("ERROR"),
      detail: t("COMPANY_CODE_ADD_FAILED"),
      life: 3000,
    });
  }
};

// EDIT COMPANY CODE ACTION
export const _editCompanyCode = (updatedCode: CompanyCode, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_COMPANY_CODE_REQUEST });

  const body = {
    reserved_digit: updatedCode.reserved_digit,
    company_id: updatedCode.company?.id,
  };

  try {
    const token = getAuthToken();
    const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/companycodes/${updatedCode.id}`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const newData = {...updatedCode, id: response.data.data.company_code.id};
    dispatch({ type: EDIT_COMPANY_CODE_SUCCESS, payload: newData });
    toast.current?.show({
      severity: 'success',
      summary: t("SUCCESS"),
      detail: t("COMPANY_CODE_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: EDIT_COMPANY_CODE_FAIL, payload: error.message });
    toast.current?.show({
      severity: 'error',
      summary: t("ERROR"),
      detail: t("COMPANY_CODE_UPDATE_FAILED"),
      life: 3000,
    });
  }
};


export const _deleteSelectedCompanyCodes = async (
  companyIds: number[],
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => {
  const token = getAuthToken();

  try {
    for (const id of companyIds) {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/companycodes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('COMPANY_CODES_DELETED'),
      life: 3000,
    });
  } catch (error: any) {
    toast.current?.show({
      severity: 'error',
      summary: t('ERROR'),
      detail: t('COMPANY_CODES_DELETE_FAILED'),
      life: 3000,
    });
  }
};
