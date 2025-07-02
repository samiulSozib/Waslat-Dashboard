// import axios from "axios";
// import {
//   FETCH_USER_LIST_REQUEST,
//   FETCH_USER_LIST_SUCCESS,
//   FETCH_USER_LIST_FAIL,
//   DELETE_USER_REQUEST,
//   DELETE_USER_SUCCESS,
//   DELETE_USER_FAIL,
//   ADD_USER_REQUEST,
//   ADD_USER_SUCCESS,
//   ADD_USER_FAIL,
//   EDIT_USER_REQUEST,
//   EDIT_USER_SUCCESS,
//   EDIT_USER_FAIL,
// } from "../constants/userListConstants";
// import { Toast } from "primereact/toast";
// import { User } from "@/types/interface";
// import { Dispatch } from "redux";

// const getAuthToken = () => {
//   return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
// };

// // Fetch User List
// export const _fetchUserList = (search:string='') => async (dispatch: Dispatch) => {
//   dispatch({ type: FETCH_USER_LIST_REQUEST });
//   try {
//     const token = getAuthToken();
//     const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/users?search=${search}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     dispatch({
//       type: FETCH_USER_LIST_SUCCESS,
//       payload: response.data.data.users,
//     });
//     console.log(response)
//   } catch (error: any) {
//     dispatch({
//       type: FETCH_USER_LIST_FAIL,
//       payload: error.message,
//     });

//   }
// };

// // Add User
// export const _addUser = (newUserData: any, toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: ADD_USER_REQUEST });
//   try {
//         const formData = new FormData();

//         // Append each property of the `body` object to the `FormData` instance
//         formData.append("name", newUserData.name);
//         formData.append("email", newUserData.email);
//         formData.append("phone", newUserData.phone);
//         formData.append("role", newUserData.role);
//         formData.append("password", newUserData.password);
//         formData.append("confirm_password", newUserData.confirm_password);
//         formData.append("currency_preference_id", newUserData.currency_preference_id);
//     const token = getAuthToken();
//     const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, formData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     //console.log(response)
//     //const newData = { ...newUserData, id: response.data.data.user.id };
//     dispatch({
//       type: ADD_USER_SUCCESS,
//       payload: response.data.data.user,
//     });
//     toast.current?.show({
//       severity: "success",
//       summary: "Successful",
//       detail: "User added successfully",
//       life: 3000,
//     });
//   } catch (error: any) {
//     //console.log(error)
//     dispatch({
//       type: ADD_USER_FAIL,
//       payload: error.message,
//     });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to add user",
//       life: 3000,
//     });
//   }
// };

// // Edit User
// export const _editUser = (userId: number, updatedUserData: any, toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: EDIT_USER_REQUEST });
//   try {

//     const token = getAuthToken();
//         const formData = new FormData();

//         // Append each property of the `body` object to the `FormData` instance
//         formData.append("name", updatedUserData.name);
//         formData.append("email", updatedUserData.email);
//         formData.append("phone", updatedUserData.phone);
//         formData.append("role", updatedUserData.role);
//         formData.append("password", updatedUserData.password);
//         formData.append("confirm_password", updatedUserData.confirm_password);
//         formData.append("currency_preference_id", updatedUserData.currency_preference_id);
//     const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}`, formData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     const newData = { ...updatedUserData, id: response.data.data.user.id };
//     dispatch({
//       type: EDIT_USER_SUCCESS,
//       payload: newData,
//     });
//     toast.current?.show({
//       severity: "success",
//       summary: "Successful",
//       detail: "User updated successfully",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({
//       type: EDIT_USER_FAIL,
//       payload: error.message,
//     });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to update user",
//       life: 3000,
//     });
//   }
// };

// // Delete User
// export const _deleteUser = (userId: number, toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: DELETE_USER_REQUEST });
//   try {
//     const token = getAuthToken();
//     await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     dispatch({
//       type: DELETE_USER_SUCCESS,
//       payload: userId,
//     });
//     toast.current?.show({
//       severity: "success",
//       summary: "Successful",
//       detail: "User deleted successfully",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({
//       type: DELETE_USER_FAIL,
//       payload: error.message,
//     });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to delete user",
//       life: 3000,
//     });
//   }
// };

import axios from "axios";
import {
  FETCH_USER_LIST_REQUEST,
  FETCH_USER_LIST_SUCCESS,
  FETCH_USER_LIST_FAIL,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAIL,
  ADD_USER_REQUEST,
  ADD_USER_SUCCESS,
  ADD_USER_FAIL,
  EDIT_USER_REQUEST,
  EDIT_USER_SUCCESS,
  EDIT_USER_FAIL,
} from "../constants/userListConstants";
import { Toast } from "primereact/toast";
import { User } from "@/types/interface";
import { Dispatch } from "redux";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || "";
};

// Fetch User List
export const _fetchUserList = (
  search: string = '',
) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_USER_LIST_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users?search=${search}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: FETCH_USER_LIST_SUCCESS,
      payload: response.data.data.users,
    });


  } catch (error: any) {
    dispatch({
      type: FETCH_USER_LIST_FAIL,
      payload: error.message,
    });


  }
};

// Add User
export const _addUser = (
  newUserData: any,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_USER_REQUEST });
  try {
    const formData = new FormData();
    formData.append("name", newUserData.name);
    formData.append("email", newUserData.email);
    formData.append("phone", newUserData.phone);
    formData.append("roles", newUserData.roles);
    formData.append("password", newUserData.password);
    formData.append("confirm_password", newUserData.confirm_password);
    formData.append("currency_preference_id", newUserData.currency_preference_id);

    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    dispatch({
      type: ADD_USER_SUCCESS,
      payload: response.data.data.user,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("USER_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: ADD_USER_FAIL,
      payload: error.message,
    });

    let errorMessage = t("USER_ADD_FAILED");
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

// Edit User
export const _editUser = (
  userId: number,
  updatedUserData: any,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_USER_REQUEST });
  try {

    const formData = new FormData();
    formData.append("name", updatedUserData.name);
    formData.append("email", updatedUserData.email);
    formData.append("phone", updatedUserData.phone);
    formData.append("roles", updatedUserData.roles);
    if (updatedUserData.password) {
      formData.append("password", updatedUserData.password);
      formData.append("confirm_password", updatedUserData.confirm_password);
    }
    formData.append("currency_preference_id", updatedUserData.currency_preference_id);

    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const newData = { ...updatedUserData, id: response.data.data.user.id };

    dispatch({
      type: EDIT_USER_SUCCESS,
      payload: newData,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("USER_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: EDIT_USER_FAIL,
      payload: error.message,
    });

    let errorMessage = t("USER_UPDATE_FAILED");
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

// Delete User
export const _deleteUser = (
  userId: number,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_USER_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: DELETE_USER_SUCCESS,
      payload: userId,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("USER_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: DELETE_USER_FAIL,
      payload: error.message,
    });

    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("USER_DELETE_FAILED"),
      life: 3000,
    });
  }
};
