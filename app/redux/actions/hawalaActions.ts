import axios from "axios";
import { FETCH_HAWALA_LIST_REQUEST, FETCH_HAWALA_LIST_SUCCESS, FETCH_HAWALA_LIST_FAIL, ADD_HAWALA_REQUEST, ADD_HAWALA_SUCCESS, ADD_HAWALA_FAIL, EDIT_HAWALA_REQUEST, EDIT_HAWALA_SUCCESS, EDIT_HAWALA_FAIL, DELETE_HAWALA_REQUEST, DELETE_HAWALA_SUCCESS, DELETE_HAWALA_FAIL, CHANGE_HAWALA_STATUS_REQUEST, CHANGE_HAWALA_STATUS_SUCCESS, CHANGE_HAWALA_STATUS_FAIL } from '../constants/hawalaConstants';
import { Toast } from "primereact/toast";
import { HawalaBranch } from "@/types/interface";
import { Dispatch } from "redux";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
};

// Fetch hawala List
export const _fetchHawalaList = (page: number = 1,search:string='') => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_HAWALA_LIST_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-orders?search=${search}&page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    //console.log(response)
    dispatch({
      type: FETCH_HAWALA_LIST_SUCCESS,
      payload: {
        data:response.data.data.hawalas,
        pagination: response.data.payload.pagination,
    },
    });
    //console.log(response)
  } catch (error: any) {
    //console.log(error)
    dispatch({
      type: FETCH_HAWALA_LIST_FAIL,
      payload: error.message,
    });

  }
};

// Add hawala
export const _addHawala = (newData: any, toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_HAWALA_REQUEST });
  try {
        const formData = new FormData();

        // Append each property of the `body` object to the `FormData` instance
        formData.append("name", newData.name);
        formData.append("email", newData.email);
        formData.append("password", newData.password);
        formData.append("address", newData.address);
        formData.append("phone_number", newData.phone_number);
        formData.append("commission_type", newData.commission_type);
        formData.append("amount", newData.amount);
        formData.append("status", newData.status);
    const token = getAuthToken();
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-orders`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    //console.log(response)
    //const newData = { ...newUserData, id: response.data.data.user.id };
    dispatch({
      type: ADD_HAWALA_SUCCESS,
      payload: response.data.data.hawala,
    });
    toast.current?.show({
      severity: "success",
      summary: "Successful",
      detail: "Hawala added successfully",
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
        type: ADD_HAWALA_FAIL,
        payload: error.message,
    });

    let errorMessage = "Failed to update Hawala"; // Default message

    // Check if it's a validation error (422 status)
    if (error.response?.status === 422 && error.response.data?.errors) {
        // Get all error messages and join them
        const errorMessages = Object.values(error.response.data.errors)
            .flat() // Flatten array of arrays
            .join(', '); // Join with commas

        errorMessage = errorMessages || "Validation failed";
    }
    // Check for other API error formats
    else if (error.response?.data?.message) {
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

// Edit hawala
export const _editHawala = (hawalaId: number, updatedData: any, toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_HAWALA_REQUEST });
  try {

    const token = getAuthToken();
        const formData = new FormData();

        // Append each property of the `body` object to the `FormData` instance
        formData.append("name", updatedData.name);
        formData.append("email", updatedData.email);
        formData.append("password", updatedData.password);
        formData.append("address", updatedData.address);
        formData.append("phone_number", updatedData.phone_number);
        formData.append("commission_type", updatedData.commission_type);
        formData.append("amount", updatedData.amount);
        formData.append("status", updatedData.status);
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-orders/${hawalaId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const newData = { ...updatedData, id: hawalaId };
    dispatch({
      type: EDIT_HAWALA_SUCCESS,
      payload: newData,
    });
    toast.current?.show({
      severity: "success",
      summary: "Successful",
      detail: "Hawala updated successfully",
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: EDIT_HAWALA_FAIL,
      payload: error.message,
    });
    toast.current?.show({
      severity: "error",
      summary: "Error",
      detail: "Failed to update Hawala",
      life: 3000,
    });
  }
};

// Delete Hawala Branch
export const _deleteHawala = (hawalaId: number, toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_HAWALA_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/hawala-orders/${hawalaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch({
      type: DELETE_HAWALA_SUCCESS,
      payload: hawalaId,
    });
    toast.current?.show({
      severity: "success",
      summary: t('SUCCESS'),
      detail: t('HAWALA_DELETED'),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: DELETE_HAWALA_FAIL,
      payload: error.message,
    });
    toast.current?.show({
      severity: "error",
      summary: t('ERROR'),
      detail: t('HAWALA_DELETE_FAILED'),
      life: 3000,
    });
  }
};


export const _changeHawalaStatus = (
  hawalaId: number,
  status: number,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => {
  return async (dispatch: Dispatch) => {
    dispatch({ type: CHANGE_HAWALA_STATUS_REQUEST });

    try {

      const token = getAuthToken();
      //console.log(token)
      const baseURL = `${process.env.NEXT_PUBLIC_BASE_URL}/hawala-orders`;
      let response;

      switch (status) {
        case 3:
          response = await axios.get(`${baseURL}/cancel/${hawalaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          break;
        case 1:
          response = await axios.get(`${baseURL}/confirm-order/${hawalaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          break;
        case 2:
          response = await axios.get(`${baseURL}/reject-order/${hawalaId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          break;
        default:
          throw new Error('Invalid order status');
      }
      //console.log(response)
      if (response.data.success === true) {
        toast.current?.show({
          severity: 'success',
          summary: t('SUCCESS'),
          detail:  t('HAWALA_STATUS_CHANGED'),
          life: 3000,
        });

        dispatch({
          type: CHANGE_HAWALA_STATUS_SUCCESS,
          payload: { hawalaId, status, message: response.data.message },
        });

      } else {
        throw new Error(response.data.message ||  t('HAWALA_STATUS_CHANGED_FAILED'),);
      }
    } catch (error: any) {
        //console.log(error)
      toast.current?.show({
        severity: 'error',
        summary: t('ERROR'),
        detail: error.message || t('HAWALA_STATUS_CHANGED_FAILED'),
        life: 3000,
      });

      dispatch({
        type: CHANGE_HAWALA_STATUS_FAIL,
        payload: error.message,
      });
    }
  };
};
