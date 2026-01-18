import { Dispatch } from "redux";
import axios from "axios";
import {
  FETCH_NOTIFICATIONS_REQUEST,
  FETCH_NOTIFICATIONS_SUCCESS,
  FETCH_NOTIFICATIONS_FAIL,

  CREATE_NOTIFICATION_REQUEST,
  CREATE_NOTIFICATION_SUCCESS,
  CREATE_NOTIFICATION_FAIL,
  UPDATE_NOTIFICATION_REQUEST,
  UPDATE_NOTIFICATION_SUCCESS,
  UPDATE_NOTIFICATION_FAIL,
  DELETE_NOTIFICATION_REQUEST,
  DELETE_NOTIFICATION_SUCCESS,
  DELETE_NOTIFICATION_FAIL,

} from "../constants/notificationConstants";
import { Toast } from "primereact/toast";
import { Notification } from "@/types/interface";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || "";
};

// Fetch Notifications with pagination
export const _fetchNotifications = (
  page?: number,
  limit?: number,
  search?: string
) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_NOTIFICATIONS_REQUEST });

  try {
    const token = getAuthToken();
    let url = `${process.env.NEXT_PUBLIC_BASE_URL}/notifications`;
    
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: FETCH_NOTIFICATIONS_SUCCESS,
      payload: response.data.data.notifications,
    });

  } catch (error: any) {
    dispatch({
      type: FETCH_NOTIFICATIONS_FAIL,
      payload: error.message,
    });
  }
};



// Create Notification
export const _createNotification = (
  newNotification: Partial<Notification>,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: CREATE_NOTIFICATION_REQUEST });

  try {
    const formData = new FormData();
    
    if (newNotification.title) formData.append('title', newNotification.title);
    if (newNotification.message) formData.append('message', newNotification.message);
    if (newNotification.reseller_id) formData.append('reseller_id', newNotification.reseller_id.toString());
    if (newNotification.target_type) formData.append('target_type', newNotification.target_type);


    formData.append('status', newNotification.status?.toString() || '0');

    
    if (newNotification.media && typeof newNotification.media !== 'string') {
      formData.append('media', newNotification.media);
    }

    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/notifications`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    dispatch({
      type: CREATE_NOTIFICATION_SUCCESS,
      payload: response.data.data.notification,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("NOTIFICATION.NOTIFICATION_CREATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: CREATE_NOTIFICATION_FAIL,
      payload: error.message,
    });

    let errorMessage = t("NOTIFICATION.NOTIFICATION_CREATE_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .flat()
        .join(', ');
      errorMessage = errorMessages || t("VALIDATION.VALIDATION_FAILED");
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

// Update Notification
export const _updateNotification = (
  updatedNotification: Notification,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: UPDATE_NOTIFICATION_REQUEST });

  try {
    const formData = new FormData();
    
    if (updatedNotification.title) formData.append('title', updatedNotification.title);
    if (updatedNotification.message) formData.append('message', updatedNotification.message);
    if (updatedNotification.reseller_id) formData.append('reseller_id', updatedNotification.reseller_id.toString());
    if (updatedNotification.target_type) formData.append('target_type', updatedNotification.target_type);


    formData.append('status', updatedNotification.status?.toString() || '0');

    
    if (updatedNotification.media && typeof updatedNotification.media !== 'string') {
      formData.append('media', updatedNotification.media);
    }

    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/${updatedNotification.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    dispatch({
      type: UPDATE_NOTIFICATION_SUCCESS,
      payload: response.data.data.notification,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("NOTIFICATION.NOTIFICATION_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: UPDATE_NOTIFICATION_FAIL,
      payload: error.message,
    });

    let errorMessage = t("NOTIFICATION.NOTIFICATION_UPDATE_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .flat()
        .join(', ');
      errorMessage = errorMessages || t("VALIDATION.VALIDATION_FAILED");
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

// Delete Notification
export const _deleteNotification = (
  notificationId: number,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_NOTIFICATION_REQUEST });

  try {
    const token = getAuthToken();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/notifications/${notificationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: DELETE_NOTIFICATION_SUCCESS,
      payload: notificationId,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("NOTIFICATION.NOTIFICATION_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: DELETE_NOTIFICATION_FAIL,
      payload: error.message,
    });

    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("NOTIFICATION.NOTIFICATION_DELETE_FAILED"),
      life: 3000,
    });
  }
};


