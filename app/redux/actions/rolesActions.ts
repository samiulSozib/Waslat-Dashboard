// import { Dispatch } from "redux";
// import axios from "axios";
// import {
//   FETCH_ROLE_LIST_REQUEST,
//   FETCH_ROLE_LIST_SUCCESS,
//   FETCH_ROLE_LIST_FAIL,
//   DELETE_ROLE_REQUEST,
//   DELETE_ROLE_SUCCESS,
//   DELETE_ROLE_FAIL,
//   ADD_ROLE_REQUEST,
//   ADD_ROLE_SUCCESS,
//   ADD_ROLE_FAIL,
//   EDIT_ROLE_REQUEST,
//   EDIT_ROLE_SUCCESS,
//   EDIT_ROLE_FAIL,
//   FETCH_SINGLE_ROLE_REQUEST,
//   FETCH_SINGLE_ROLE_SUCCESS,
//   FETCH_SINGLE_ROLE_FAIL,
//   CLEAR_SINGLE_ROLE,
// } from "../constants/rolesConstants";
// import { Permission, Roles } from "@/types/interface";
// import { Toast } from "primereact/toast";

// const getAuthToken = () => {
//   return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
// };

// // Fetch Role List
// export const _fetchRoleList = () => async (dispatch: Dispatch) => {
//   dispatch({ type: FETCH_ROLE_LIST_REQUEST });
//   try {
//     const token = getAuthToken();
//     const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/roles`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     dispatch({
//       type: FETCH_ROLE_LIST_SUCCESS,
//       payload: response.data.data.roles,
//     });
//   } catch (error: any) {
//     dispatch({
//       type: FETCH_ROLE_LIST_FAIL,
//       payload: error.response?.data.message || error.message,
//     });
//   }
// };

// // single role
// export const _fetchSingleRole = (roleId: number) => async (dispatch: Dispatch) => {
//     dispatch({ type: FETCH_SINGLE_ROLE_REQUEST });
//     try {
//       const token = getAuthToken();
//       const response = await axios.get(
//         `${process.env.NEXT_PUBLIC_BASE_URL}/roles/${roleId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       dispatch({
//         type: FETCH_SINGLE_ROLE_SUCCESS,
//         payload: response.data.data.role,
//       });
//     } catch (error: any) {
//       dispatch({
//         type: FETCH_SINGLE_ROLE_FAIL,
//         payload: error.response?.data.message || error.message,
//       });
//     }
//   };

// // Add Role
// export const _addRole = (newRoleData: Roles,permissions:Permission[], toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: ADD_ROLE_REQUEST });
//   try {
//     const token = getAuthToken();
//     const selectedPermissionIds = permissions.map((permission) => permission.id);

//     const body={
//         name:newRoleData.name,
//         permissions:selectedPermissionIds
//     }
//     //console.log(body)
//     //return
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/roles`,
//       body,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     //console.log(response)
//     dispatch({
//       type: ADD_ROLE_SUCCESS,
//       payload: response.data.data.role,
//     });
//     toast.current?.show({
//       severity: "success",
//       summary: "Successful",
//       detail: "Role added",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({
//       type: ADD_ROLE_FAIL,
//       payload: error.response?.data.message || error.message,
//     });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to add role",
//       life: 3000,
//     });
//   }
// };

// // Edit Role
// export const _editRole = (roleId: number, updatedRoleData: Roles,permissions:Permission[], toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: EDIT_ROLE_REQUEST });
//   try {
//     const token = getAuthToken();
//     const selectedPermissionIds = permissions.map((permission) => permission.id);
//     const body={
//         name:updatedRoleData.name,
//         permissions:selectedPermissionIds
//     }
//     const response = await axios.put(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/roles/${roleId}`,
//       body,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     dispatch({
//       type: EDIT_ROLE_SUCCESS,
//       payload: response.data.data.role,
//     });
//     toast.current?.show({
//       severity: "success",
//       summary: "Successful",
//       detail: "Role updated",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({
//       type: EDIT_ROLE_FAIL,
//       payload: error.response?.data.message || error.message,
//     });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to update role",
//       life: 3000,
//     });
//   }
// };

// // Delete Role
// export const _deleteRole = (roleId: number, toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: DELETE_ROLE_REQUEST });
//   try {
//     const token = getAuthToken();
//     await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/roles/${roleId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     dispatch({
//       type: DELETE_ROLE_SUCCESS,
//       payload: roleId,
//     });
//     toast.current?.show({
//       severity: "success",
//       summary: "Successful",
//       detail: "Role deleted",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({
//       type: DELETE_ROLE_FAIL,
//       payload: error.response?.data.message || error.message,
//     });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to delete role",
//       life: 3000,
//     });
//   }
// };


// export const clearRole = () => async (dispatch: Dispatch) => {
//     dispatch({ type: CLEAR_SINGLE_ROLE });
//   };

import { Dispatch } from "redux";
import axios from "axios";
import {
  FETCH_ROLE_LIST_REQUEST,
  FETCH_ROLE_LIST_SUCCESS,
  FETCH_ROLE_LIST_FAIL,
  DELETE_ROLE_REQUEST,
  DELETE_ROLE_SUCCESS,
  DELETE_ROLE_FAIL,
  ADD_ROLE_REQUEST,
  ADD_ROLE_SUCCESS,
  ADD_ROLE_FAIL,
  EDIT_ROLE_REQUEST,
  EDIT_ROLE_SUCCESS,
  EDIT_ROLE_FAIL,
  FETCH_SINGLE_ROLE_REQUEST,
  FETCH_SINGLE_ROLE_SUCCESS,
  FETCH_SINGLE_ROLE_FAIL,
  CLEAR_SINGLE_ROLE,
} from "../constants/rolesConstants";
import { Permission, Roles } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || "";
};

// Fetch Role List
export const _fetchRoleList = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_ROLE_LIST_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: FETCH_ROLE_LIST_SUCCESS,
      payload: response.data.data.roles,
    });


  } catch (error: any) {
    dispatch({
      type: FETCH_ROLE_LIST_FAIL,
      payload: error.response?.data.message || error.message,
    });


  }
};

// Fetch Single Role
export const _fetchSingleRole = (
  roleId: number,
) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_SINGLE_ROLE_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/roles/${roleId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: FETCH_SINGLE_ROLE_SUCCESS,
      payload: response.data.data.role,
    });


  } catch (error: any) {
    dispatch({
      type: FETCH_SINGLE_ROLE_FAIL,
      payload: error.response?.data.message || error.message,
    });


  }
};

// Add Role
export const _addRole = (
  newRoleData: Roles,
  permissions: Permission[],
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_ROLE_REQUEST });
  try {
    const token = getAuthToken();
    const selectedPermissionIds = permissions.map((permission) => permission.id);

    const body = {
      name: newRoleData.name,
      permissions: selectedPermissionIds
    };

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/roles`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: ADD_ROLE_SUCCESS,
      payload: response.data.data.role,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("ROLE_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: ADD_ROLE_FAIL,
      payload: error.response?.data.message || error.message,
    });

    let errorMessage = t("ROLE_ADD_FAILED");
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

// Edit Role
export const _editRole = (
  roleId: number,
  updatedRoleData: Roles,
  permissions: Permission[],
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_ROLE_REQUEST });
  try {
    const token = getAuthToken();
    const selectedPermissionIds = permissions.map((permission) => permission.id);

    const body = {
      name: updatedRoleData.name,
      permissions: selectedPermissionIds
    };

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URL}/roles/${roleId}`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: EDIT_ROLE_SUCCESS,
      payload: response.data.data.role,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("ROLE_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: EDIT_ROLE_FAIL,
      payload: error.response?.data.message || error.message,
    });

    let errorMessage = t("ROLE_UPDATE_FAILED");
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

// Delete Role
export const _deleteRole = (
  roleId: number,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_ROLE_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/roles/${roleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({
      type: DELETE_ROLE_SUCCESS,
      payload: roleId,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("ROLE_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: DELETE_ROLE_FAIL,
      payload: error.response?.data.message || error.message,
    });

    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("ROLE_DELETE_FAILED"),
      life: 3000,
    });
  }
};

// Clear Single Role
export const clearRole = () => async (dispatch: Dispatch) => {
  dispatch({ type: CLEAR_SINGLE_ROLE });
};
