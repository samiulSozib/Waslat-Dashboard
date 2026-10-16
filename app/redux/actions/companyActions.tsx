import { Dispatch } from "redux";
import axios from "axios";
import {
  FETCH_COMPANY_LIST_REQUEST, FETCH_COMPANY_LIST_SUCCESS, FETCH_COMPANY_LIST_FAIL,
  DELETE_COMPANY_REQUEST, DELETE_COMPANY_SUCCESS, DELETE_COMPANY_FAIL,
  ADD_COMPANY_REQUEST, ADD_COMPANY_SUCCESS, ADD_COMPANY_FAIL,
  EDIT_COMPANY_REQUEST, EDIT_COMPANY_SUCCESS, EDIT_COMPANY_FAIL
} from '../constants/companyConstants';
import { Toast } from "primereact/toast";
import { Company } from "@/types/interface";

const getAuthToken = () => localStorage.getItem("api_token") || "";
const url = process.env.NEXT_PUBLIC_BASE_URL;

export const _fetchCompanies = (search: string = '') => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_COMPANY_LIST_REQUEST });
  try {
    const response = await axios.get(`${url}/companies`, {
      params: { search }, headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    dispatch({ type: FETCH_COMPANY_LIST_SUCCESS, payload: response.data.data.companies });
  } catch (error: any) {
    dispatch({ type: FETCH_COMPANY_LIST_FAIL, payload: error.message });
  }
};

export const _deleteCompany = (companyId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_COMPANY_REQUEST });
  try {
    await axios.delete(`${url}/companies/${companyId}`, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
    dispatch({ type: DELETE_COMPANY_SUCCESS, payload: companyId });
    toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: t('COMPANY_DELETED'), life: 3000 });
  } catch (error: any) {
    dispatch({ type: DELETE_COMPANY_FAIL, payload: error.message });
    toast.current?.show({ severity: 'error', summary: t('ERROR'), detail: t('COMPANY_DELETE_FAILED'), life: 3000 });
  }
};

// Preserve logo upload, Telegram chat, country, and JSON schema.
// Never resend an empty key when editing: backend omission preserves existing key.
const createCompanyFormData = (company: Company): FormData => {
  const formData = new FormData();
  formData.append('company_name', company.company_name);
  formData.append('company_code', company.company_code);
  if (company.company_logo && typeof company.company_logo !== 'string') {
    formData.append('company_logo', company.company_logo);
  }
  formData.append('input_form_schema', typeof company.input_form_schema === 'string'
    ? company.input_form_schema : JSON.stringify(company.input_form_schema || []));
  formData.append('country_id', String(company.country?.id ?? company.country_id ?? ''));
  formData.append('telegram_chat_id', String(company.telegram_chat_id?.id ?? ''));
  formData.append('display_order', String(company.display_order ?? 0));
  formData.append('is_robot_enabled', company.is_robot_enabled ? '1' : '0');
  formData.append('is_api_enabled', company.is_api_enabled ? '1' : '0');
  if (company.api_provider_id !== undefined) {
    formData.append('api_provider_id', company.api_provider_id == null ? '' : String(company.api_provider_id));
  }
  if (company.api_key?.trim()) {
    formData.append('api_key', company.api_key.trim());
  }
  return formData;
};

const extractApiError = (error: any, fallback: string) => {
  if (error.response?.status === 422 && error.response.data?.errors) {
    return Object.values(error.response.data.errors).flat().join(', ') || fallback;
  }
  return error.response?.data?.message || error.message || fallback;
};

export const _addCompany = (newCompany: Company, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_COMPANY_REQUEST });
  try {
    const response = await axios.post(`${url}/companies`, createCompanyFormData(newCompany), {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    dispatch({ type: ADD_COMPANY_SUCCESS, payload: { ...newCompany, ...response.data.data.company, api_key: null } });
    toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: t('COMPANY_ADDED'), life: 3000 });
  } catch (error: any) {
    const message = extractApiError(error, t('COMPANY_ADD_FAILED'));
    dispatch({ type: ADD_COMPANY_FAIL, payload: message });
    toast.current?.show({ severity: 'error', summary: t('ERROR'), detail: message, life: 3000 });
  }
};

export const _editCompany = (updatedCompany: Company, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_COMPANY_REQUEST });
  try {
    // Keep the existing POST endpoint for multipart logo upload.
    const response = await axios.post(`${url}/companies/${updatedCompany.id}`, createCompanyFormData(updatedCompany), {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    dispatch({ type: EDIT_COMPANY_SUCCESS, payload: { ...updatedCompany, ...response.data.data.company, api_key: null } });
    toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: t('COMPANY_UPDATED'), life: 3000 });
  } catch (error: any) {
    const message = extractApiError(error, t('COMPANY_UPDATE_FAILED'));
    dispatch({ type: EDIT_COMPANY_FAIL, payload: message });
    toast.current?.show({ severity: 'error', summary: t('ERROR'), detail: message, life: 3000 });
  }
};

export const _deleteSelectedCompanies = async (provinceIds: number[], toast: React.RefObject<Toast>, t: (key: string) => string) => {
  try {
    for (const id of provinceIds) {
      await axios.delete(`${url}/companies/${id}`, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
    }
    toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: t('COMPANIES_DELETED'), life: 3000 });
  } catch (error: any) {
    toast.current?.show({ severity: 'error', summary: t('ERROR'), detail: t('COMPANIES_DELETE_FAILED'), life: 3000 });
  }
};


// Partial update for inline controls; other company fields remain untouched.
export const _updateCompanySettings = (
  companyId: number,
  changes: Partial<Pick<Company, 'display_order' | 'is_robot_enabled' | 'is_api_enabled' | 'api_provider_id'>>
) => async (dispatch: Dispatch): Promise<void> => {
  dispatch({ type: EDIT_COMPANY_REQUEST });
  try {
    const response = await axios.post(`${url}/companies/${companyId}`, changes, {
      headers: { Authorization: `Bearer ${getAuthToken()}`, Accept: 'application/json' }
    });
    dispatch({ type: EDIT_COMPANY_SUCCESS, payload: response.data.data.company });
  } catch (error: any) {
    dispatch({ type: EDIT_COMPANY_FAIL, payload: error?.response?.data?.message || error.message });
    throw error;
  }
};
