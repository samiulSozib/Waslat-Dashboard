import { Dispatch } from 'redux';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { SupportContacts } from '@/types/interface';

import {
  FETCH_SUPPORT_CONTACT_LIST_REQUEST,
  FETCH_SUPPORT_CONTACT_LIST_SUCCESS,
  FETCH_SUPPORT_CONTACT_LIST_FAIL,
  DELETE_SUPPORT_CONTACT_REQUEST,
  DELETE_SUPPORT_CONTACT_SUCCESS,
  DELETE_SUPPORT_CONTACT_FAIL,
  ADD_SUPPORT_CONTACT_REQUEST,
  ADD_SUPPORT_CONTACT_SUCCESS,
  ADD_SUPPORT_CONTACT_FAIL,
  EDIT_SUPPORT_CONTACT_REQUEST,
  EDIT_SUPPORT_CONTACT_SUCCESS,
  EDIT_SUPPORT_CONTACT_FAIL,
} from '../constants/supportContactConstants';

const getAuthToken = () => localStorage.getItem('api_token') || '';

// FETCH LIST
export const _fetchSupportContacts = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_SUPPORT_CONTACT_LIST_REQUEST });

  try {
    const token = getAuthToken();
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/contacts`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch({
      type: FETCH_SUPPORT_CONTACT_LIST_SUCCESS,
      payload: res.data.data.contacts,
    });
  } catch (error: any) {
    dispatch({
      type: FETCH_SUPPORT_CONTACT_LIST_FAIL,
      payload: error.message,
    });
  }
};

// DELETE
export const _deleteSupportContact = (
  id: number,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_SUPPORT_CONTACT_REQUEST });

  try {
    const token = getAuthToken();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/contacts/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch({ type: DELETE_SUPPORT_CONTACT_SUCCESS, payload: id });
    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('SUPPORT_CONTACT_DELETED'),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: DELETE_SUPPORT_CONTACT_FAIL,
      payload: error.message,
    });
  }
};

// ADD
export const _addSupportContact = (
  newContact: SupportContacts,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_SUPPORT_CONTACT_REQUEST });

  try {
    const token = getAuthToken();
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/contacts`,
      newContact,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    dispatch({
      type: ADD_SUPPORT_CONTACT_SUCCESS,
      payload: { ...newContact, id: res.data.data.contact.id },
    });

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('SUPPORT_CONTACT_ADDED'),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: ADD_SUPPORT_CONTACT_FAIL,
      payload: error.message,
    });
  }
};

// EDIT
export const _editSupportContact = (
  updatedContact: SupportContacts,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_SUPPORT_CONTACT_REQUEST });

  try {
    const token = getAuthToken();
    await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/contacts/${updatedContact.id}`,
      updatedContact,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    dispatch({
      type: EDIT_SUPPORT_CONTACT_SUCCESS,
      payload: updatedContact,
    });

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('SUPPORT_CONTACT_UPDATED'),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: EDIT_SUPPORT_CONTACT_FAIL,
      payload: error.message,
    });
  }
};
