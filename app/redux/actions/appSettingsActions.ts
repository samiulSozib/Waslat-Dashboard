// app/redux/actions/appSettingsActions.ts
import { Dispatch } from "redux";
import axios from "axios";
import { Toast } from "primereact/toast";
import {
  FETCH_APP_SETTINGS_REQUEST,
  FETCH_APP_SETTINGS_SUCCESS,
  FETCH_APP_SETTINGS_FAIL,
  UPDATE_APP_SETTINGS_REQUEST,
  UPDATE_APP_SETTINGS_SUCCESS,
  UPDATE_APP_SETTINGS_FAIL,
  RESET_APP_SETTINGS_REQUEST,
  RESET_APP_SETTINGS_SUCCESS,
  RESET_APP_SETTINGS_FAIL
} from '../constants/appSettingsConstants';
import { AppSettings } from '@/types/interface';
const getAuthToken = () => localStorage.getItem('api_token') || '';
export const fetchAppSettings = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_APP_SETTINGS_REQUEST });
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/app-settings`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    });
    dispatch({ type: FETCH_APP_SETTINGS_SUCCESS, payload: response.data.data.settings });
  } catch (error: any) {
    dispatch({ type: FETCH_APP_SETTINGS_FAIL, payload: error?.response?.data?.message || error.message });
  }
};
export const updateAppSettings = (
  settings: Partial<AppSettings>,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch): Promise<boolean> => {
  dispatch({ type: UPDATE_APP_SETTINGS_REQUEST });
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URL}/app-settings`,
      settings,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.data?.success === false) {
      throw new Error(response.data?.message || 'Settings update failed');
    }
    dispatch({ type: UPDATE_APP_SETTINGS_SUCCESS, payload: response.data.data.settings });
    toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: t('SETTINGS_UPDATED'), life: 3000 });
    return true;
  } catch (error: any) {
    dispatch({ type: UPDATE_APP_SETTINGS_FAIL, payload: error?.response?.data?.message || error.message });
    toast.current?.show({ severity: 'error', summary: t('ERROR'), detail: t('SETTINGS_UPDATE_FAILED'), life: 3000 });
    return false;
  }
};
export const resetAppSettings = (
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: RESET_APP_SETTINGS_REQUEST });
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/app-settings/reset`,
      {},
      { headers: { Authorization: `Bearer ${getAuthToken()}` } }
    );
    dispatch({ type: RESET_APP_SETTINGS_SUCCESS, payload: response.data.data.settings });
    toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: t('SETTINGS_RESET'), life: 3000 });
  } catch (error: any) {
    dispatch({ type: RESET_APP_SETTINGS_FAIL, payload: error?.response?.data?.message || error.message });
    toast.current?.show({ severity: 'error', summary: t('ERROR'), detail: t('SETTINGS_RESET_FAILED'), life: 3000 });
  }
};
