// import axios from "axios";
// import {
//   FETCH_RESELLER_GROUP_LIST_REQUEST,
//   FETCH_RESELLER_GROUP_LIST_SUCCESS,
//   FETCH_RESELLER_GROUP_LIST_FAIL,
//   DELETE_RESELLER_GROUP_REQUEST,
//   DELETE_RESELLER_GROUP_SUCCESS,
//   DELETE_RESELLER_GROUP_FAIL,
//   ADD_RESELLER_GROUP_REQUEST,
//   ADD_RESELLER_GROUP_SUCCESS,
//   ADD_RESELLER_GROUP_FAIL,
//   EDIT_RESELLER_GROUP_REQUEST,
//   EDIT_RESELLER_GROUP_SUCCESS,
//   EDIT_RESELLER_GROUP_FAIL,
// } from "../constants/resellerGroupConstants";
// import { ResellerGroup } from "@/types/interface";
// import { Toast } from "primereact/toast";

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// const getAuthToken = () => localStorage.getItem("api_token") || ""; // Fetch token from localStorage

// // Fetch Reseller Groups
// export const _fetchResellerGroups = () => async (dispatch: any) => {
//   dispatch({ type: FETCH_RESELLER_GROUP_LIST_REQUEST });
//   try {
//     const token = getAuthToken();
//     const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/reseller-groups`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     dispatch({
//       type: FETCH_RESELLER_GROUP_LIST_SUCCESS,
//       payload: response.data.data.reseller_groups,
//     });
//   } catch (error: any) {
//     dispatch({
//       type: FETCH_RESELLER_GROUP_LIST_FAIL,
//       payload: error.response?.data?.message || error.message,
//     });
//   }
// };

// // Add Reseller Group
// export const _addResellerGroup =
//   (groupData: ResellerGroup, toast: React.RefObject<Toast>) => async (dispatch: any) => {
//     dispatch({ type: ADD_RESELLER_GROUP_REQUEST });
//     try {
//       const token = getAuthToken();
//       const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/reseller-groups`, groupData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       //console.log(response)
//       dispatch({
//         type: ADD_RESELLER_GROUP_SUCCESS,
//         payload: response.data.data.reseller_group,
//       });

//       toast.current?.show({
//         severity: "success",
//         summary: "Success",
//         detail: "Reseller Group added successfully",
//         life: 3000,
//       });
//     } catch (error: any) {
//       dispatch({
//         type: ADD_RESELLER_GROUP_FAIL,
//         payload: error.response?.data?.message || error.message,
//       });
//       //console.log(error)
//       toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Failed to add Reseller Group",
//         life: 3000,
//       });
//     }
//   };

// // Edit Reseller Group
// export const _editResellerGroup =
//   (id: number, groupData: ResellerGroup, toast: React.RefObject<Toast>) => async (dispatch: any) => {
//     dispatch({ type: EDIT_RESELLER_GROUP_REQUEST });
//     //console.log(id)
//     //console.log(groupData)
//     try {
//       const token = getAuthToken();
//       const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/reseller-groups/${id}`, groupData, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       dispatch({
//         type: EDIT_RESELLER_GROUP_SUCCESS,
//         payload: response.data.data.reseller_group,
//       });

//       toast.current?.show({
//         severity: "success",
//         summary: "Success",
//         detail: "Reseller Group updated successfully",
//         life: 3000,
//       });
//     } catch (error: any) {
//       dispatch({
//         type: EDIT_RESELLER_GROUP_FAIL,
//         payload: error.response?.data?.message || error.message,
//       });
//       //console.log(error)

//       toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Failed to update Reseller Group",
//         life: 3000,
//       });
//     }
//   };

// // Delete Reseller Group
// export const _deleteResellerGroup =
//   (id: number, toast: React.RefObject<Toast>) => async (dispatch: any) => {
//     dispatch({ type: DELETE_RESELLER_GROUP_REQUEST });
//     try {
//       const token = getAuthToken();
//       const response=await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/reseller-groups/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       //console.log(response)
//       dispatch({
//         type: DELETE_RESELLER_GROUP_SUCCESS,
//         payload: id,
//       });

//       toast.current?.show({
//         severity: "success",
//         summary: "Success",
//         detail: "Reseller Group deleted successfully",
//         life: 3000,
//       });
//     } catch (error: any) {
//       dispatch({
//         type: DELETE_RESELLER_GROUP_FAIL,
//         payload: error.message,
//       });
//       //console.log(error)
//       toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Failed to delete Reseller Group",
//         life: 3000,
//       });
//     }
//   };
import axios from "axios";
import {
  FETCH_RESELLER_GROUP_LIST_REQUEST,
  FETCH_RESELLER_GROUP_LIST_SUCCESS,
  FETCH_RESELLER_GROUP_LIST_FAIL,
  DELETE_RESELLER_GROUP_REQUEST,
  DELETE_RESELLER_GROUP_SUCCESS,
  DELETE_RESELLER_GROUP_FAIL,
  ADD_RESELLER_GROUP_REQUEST,
  ADD_RESELLER_GROUP_SUCCESS,
  ADD_RESELLER_GROUP_FAIL,
  EDIT_RESELLER_GROUP_REQUEST,
  EDIT_RESELLER_GROUP_SUCCESS,
  EDIT_RESELLER_GROUP_FAIL,
} from "../constants/resellerGroupConstants";
import { ResellerGroup } from "@/types/interface";
import { Toast } from "primereact/toast";
import { Dispatch } from "redux";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const getAuthToken = () => localStorage.getItem("api_token") || "";

// Fetch Reseller Groups
export const _fetchResellerGroups = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_RESELLER_GROUP_LIST_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(`${BASE_URL}/reseller-groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({
      type: FETCH_RESELLER_GROUP_LIST_SUCCESS,
      payload: response.data.data.reseller_groups,
    });

    // Optional success toast
    // toast.current?.show({
    //   severity: "success",
    //   summary: t("SUCCESS"),
    //   detail: t("RESELLER_GROUPS_FETCHED"),
    //   life: 3000,
    // });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message ;
    dispatch({ type: FETCH_RESELLER_GROUP_LIST_FAIL, payload: errorMessage });

  }
};

// Add Reseller Group
export const _addResellerGroup = (
  groupData: ResellerGroup,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_RESELLER_GROUP_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.post(`${BASE_URL}/reseller-groups`, groupData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({
      type: ADD_RESELLER_GROUP_SUCCESS,
      payload: response.data.data.reseller_group,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("RESELLER_GROUP_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    let errorMessage = t("RESELLER_GROUP_ADD_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      errorMessage = Object.values(error.response.data.errors)
        .flat()
        .join(', ') || t("VALIDATION_FAILED");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    dispatch({ type: ADD_RESELLER_GROUP_FAIL, payload: errorMessage });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage,
      life: 3000,
    });
  }
};

// Edit Reseller Group
export const _editResellerGroup = (
  id: number,
  groupData: ResellerGroup,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_RESELLER_GROUP_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${BASE_URL}/reseller-groups/${id}`,
      groupData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch({
      type: EDIT_RESELLER_GROUP_SUCCESS,
      payload: response.data.data.reseller_group,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("RESELLER_GROUP_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    let errorMessage = t("RESELLER_GROUP_UPDATE_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      errorMessage = Object.values(error.response.data.errors)
        .flat()
        .join(', ') || t("VALIDATION_FAILED");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    dispatch({ type: EDIT_RESELLER_GROUP_FAIL, payload: errorMessage });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage,
      life: 3000,
    });
  }
};

// Delete Reseller Group
export const _deleteResellerGroup = (
  id: number,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_RESELLER_GROUP_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(`${BASE_URL}/reseller-groups/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({ type: DELETE_RESELLER_GROUP_SUCCESS, payload: id });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("RESELLER_GROUP_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || t("RESELLER_GROUP_DELETE_FAILED");
    dispatch({ type: DELETE_RESELLER_GROUP_FAIL, payload: errorMessage });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage,
      life: 3000,
    });
  }
};
