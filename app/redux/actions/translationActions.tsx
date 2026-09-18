// actions/translationActions.tsx

import { Dispatch } from 'redux';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import {
  FETCH_TRANSLATION_LANGUAGES_REQUEST,
  FETCH_TRANSLATION_LANGUAGES_SUCCESS,
  FETCH_TRANSLATION_LANGUAGES_FAIL,
  FETCH_TRANSLATION_TYPES_REQUEST,
  FETCH_TRANSLATION_TYPES_SUCCESS,
  FETCH_TRANSLATION_TYPES_FAIL,
  FETCH_TRANSLATION_WORKSPACE_REQUEST,
  FETCH_TRANSLATION_WORKSPACE_SUCCESS,
  FETCH_TRANSLATION_WORKSPACE_FAIL,
  BULK_SAVE_TRANSLATIONS_REQUEST,
  BULK_SAVE_TRANSLATIONS_SUCCESS,
  BULK_SAVE_TRANSLATIONS_FAIL,
  MARK_TRANSLATION_DIRTY,
  CLEAR_TRANSLATION_DIRTY,
  RESET_TRANSLATION_DIRTY,
} from '../constants/translationConstants';

const getAuthToken = () => localStorage.getItem('api_token') || '';

const BASE = process.env.NEXT_PUBLIC_BASE_URL;

/* ------------------------------------------------------------------ */
/* Fetch Languages                                                     */
/* ------------------------------------------------------------------ */
export const _fetchTranslationLanguages = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_TRANSLATION_LANGUAGES_REQUEST });
  try {
    const token = getAuthToken();
    const res = await axios.get(`${BASE}/translations/languages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({
      type: FETCH_TRANSLATION_LANGUAGES_SUCCESS,
      payload: res.data.data.languages,
    });
  } catch (error: any) {
    dispatch({
      type: FETCH_TRANSLATION_LANGUAGES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

/* ------------------------------------------------------------------ */
/* Fetch Types (modules)                                               */
/* ------------------------------------------------------------------ */
export const _fetchTranslationTypes = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_TRANSLATION_TYPES_REQUEST });
  try {
    const token = getAuthToken();
    const res = await axios.get(`${BASE}/translations/types`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch({
      type: FETCH_TRANSLATION_TYPES_SUCCESS,
      payload: res.data.data.types,
    });
  } catch (error: any) {
    dispatch({
      type: FETCH_TRANSLATION_TYPES_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

/* ------------------------------------------------------------------ */
/* Fetch Workspace                                                     */
/* ------------------------------------------------------------------ */
export const _fetchTranslationWorkspace =
  (
    type: string,
    language: string,
    page: number = 1,
    perPage: number = 10,
    filters: Record<string, any> = {}
  ) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_TRANSLATION_WORKSPACE_REQUEST });
    try {
      const token = getAuthToken();
      const query = new URLSearchParams();

      query.append('language', language);
      query.append('page', String(page));
      query.append('per_page', String(perPage));

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          query.append(key, String(value));
        }
      });

      const res = await axios.get(
        `${BASE}/translations/${type}?${query.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({
        type: FETCH_TRANSLATION_WORKSPACE_SUCCESS,
        payload: {
          ...res.data.data,
          pagination: res.data.payload?.pagination || null,
        },
      });
    } catch (error: any) {
      dispatch({
        type: FETCH_TRANSLATION_WORKSPACE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

/* ------------------------------------------------------------------ */
/* Dirty Row Helpers (local, no API)                                   */
/* ------------------------------------------------------------------ */
export const _markTranslationDirty =
  (id: number, field: string, value: string) => (dispatch: Dispatch) => {
    dispatch({
      type: MARK_TRANSLATION_DIRTY,
      payload: { id, field, value },
    });
  };

export const _clearTranslationDirty = (id: number) => (dispatch: Dispatch) => {
  dispatch({ type: CLEAR_TRANSLATION_DIRTY, payload: { id } });
};

export const _resetTranslationDirty = () => (dispatch: Dispatch) => {
  dispatch({ type: RESET_TRANSLATION_DIRTY });
};

/* ------------------------------------------------------------------ */
/* Bulk Save                                                           */
/* ------------------------------------------------------------------ */
export const _bulkSaveTranslations =
  (
    type: string,
    language: string,
    items: Array<Record<string, any>>,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
  ) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: BULK_SAVE_TRANSLATIONS_REQUEST });
    try {
      const token = getAuthToken();
      const res = await axios.put(
        `${BASE}/translations/${type}/bulk/${language}`,
        { items },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      dispatch({
        type: BULK_SAVE_TRANSLATIONS_SUCCESS,
        payload: res.data,
      });

      toast.current?.show({
        severity: 'success',
        summary: t('SUCCESS'),
        detail: t('TRANSLATIONS_SAVED_SUCCESSFULLY'),
        life: 3000,
      });

      return res.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message;
      dispatch({ type: BULK_SAVE_TRANSLATIONS_FAIL, payload: msg });

      toast.current?.show({
        severity: 'error',
        summary: t('ERROR'),
        detail: msg || t('TRANSLATIONS_SAVE_FAILED'),
        life: 3000,
      });
    }
  };
