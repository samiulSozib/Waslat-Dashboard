// import { Dispatch } from "redux";
// import axios from "axios";
// import {
//   FETCH_PAYMENT_METHOD_LIST_REQUEST,
//   FETCH_PAYMENT_METHOD_LIST_SUCCESS,
//   FETCH_PAYMENT_METHOD_LIST_FAIL,
//   DELETE_PAYMENT_METHOD_REQUEST,
//   DELETE_PAYMENT_METHOD_SUCCESS,
//   DELETE_PAYMENT_METHOD_FAIL,
//   ADD_PAYMENT_METHOD_REQUEST,
//   ADD_PAYMENT_METHOD_SUCCESS,
//   ADD_PAYMENT_METHOD_FAIL,
//   EDIT_PAYMENT_METHOD_REQUEST,
//   EDIT_PAYMENT_METHOD_SUCCESS,
//   EDIT_PAYMENT_METHOD_FAIL,
// } from "../constants/paymentMethodConstants";
// import { PaymentMethod } from "@/types/interface";

// const getAuthToken = (): string => {
//   return localStorage.getItem("api_token") || "";
// };

// // Fetch Payment Methods
// export const _fetchPaymentMethods = () => async (dispatch: Dispatch) => {
//   dispatch({ type: FETCH_PAYMENT_METHOD_LIST_REQUEST });
//   try {
//     const token = getAuthToken();
//     const response = await axios.get(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/paymentmethods`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     dispatch({
//       type: FETCH_PAYMENT_METHOD_LIST_SUCCESS,
//       payload: response.data.data.paymentmethods,
//     });
//     //console.log(response)
//   } catch (error: any) {
//     dispatch({
//       type: FETCH_PAYMENT_METHOD_LIST_FAIL,
//       payload: error.message || "Failed to fetch payment methods",
//     });
//   }
// };

// // Add Payment Method
// export const _addPaymentMethod = (
//   newMethod: PaymentMethod,
//   toast: React.RefObject<any>
// ) => async (dispatch: Dispatch) => {
//   dispatch({ type: ADD_PAYMENT_METHOD_REQUEST });
//   const formData=new FormData()
//   formData.append('method_name',newMethod.method_name)
//   formData.append('account_details',newMethod.account_details)
//   formData.append('status',newMethod.status.toString())
//   if(newMethod.account_image && typeof newMethod.account_image!=='string'){
//     formData.append('account_image',newMethod.account_image)
//   }


//   try {
//     const token = getAuthToken();
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/paymentmethods`,
//       formData,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );
//     dispatch({
//       type: ADD_PAYMENT_METHOD_SUCCESS,
//       payload: response.data.data.payment_method,
//     });
//     toast.current?.show({
//       severity: "success",
//       summary: "Success",
//       detail: "Payment method added successfully!",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({ type: ADD_PAYMENT_METHOD_FAIL, payload: error.message });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to add payment method",
//       life: 3000,
//     });
//   }
// };

// // Edit Payment Method
// export const _editPaymentMethod = (
//   methodId: number,
//   updatedMethod: PaymentMethod,
//   toast: React.RefObject<any>
// ) => async (dispatch: Dispatch) => {
//   dispatch({ type: EDIT_PAYMENT_METHOD_REQUEST });
//   const formData=new FormData()
//   formData.append('method_name',updatedMethod.method_name)
//   formData.append('account_details',updatedMethod.account_details)
//   formData.append('status',updatedMethod.status.toString())
//   if(updatedMethod.account_image && typeof updatedMethod.account_image!=='string'){
//     formData.append('account_image',updatedMethod.account_image)
//   }
//   try {
//     const token = getAuthToken();
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/paymentmethods/${methodId}`,
//       updatedMethod,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'multipart/form-data',
//         },
//       }
//     );

//     dispatch({
//       type: EDIT_PAYMENT_METHOD_SUCCESS,
//       payload: response.data.data.payment_method,
//     });
//     toast.current?.show({
//       severity: "success",
//       summary: "Success",
//       detail: "Payment method updated successfully!",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({ type: EDIT_PAYMENT_METHOD_FAIL, payload: error.message });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to update payment method",
//       life: 3000,
//     });
//   }
// };

// // Delete Payment Method
// export const _deletePaymentMethod = (
//   methodId: number,
//   toast: React.RefObject<any>
// ) => async (dispatch: Dispatch) => {
//   dispatch({ type: DELETE_PAYMENT_METHOD_REQUEST });
//   try {
//     const token = getAuthToken();
//     await axios.delete(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/paymentmethods/${methodId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     dispatch({
//       type: DELETE_PAYMENT_METHOD_SUCCESS,
//       payload: methodId,
//     });
//     toast.current?.show({
//       severity: "success",
//       summary: "Success",
//       detail: "Payment method deleted successfully!",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({ type: DELETE_PAYMENT_METHOD_FAIL, payload: error.message });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to delete payment method",
//       life: 3000,
//     });
//   }
// };

import { Dispatch } from "redux";
import axios from "axios";
import {
  FETCH_PAYMENT_METHOD_LIST_REQUEST,
  FETCH_PAYMENT_METHOD_LIST_SUCCESS,
  FETCH_PAYMENT_METHOD_LIST_FAIL,
  DELETE_PAYMENT_METHOD_REQUEST,
  DELETE_PAYMENT_METHOD_SUCCESS,
  DELETE_PAYMENT_METHOD_FAIL,
  ADD_PAYMENT_METHOD_REQUEST,
  ADD_PAYMENT_METHOD_SUCCESS,
  ADD_PAYMENT_METHOD_FAIL,
  EDIT_PAYMENT_METHOD_REQUEST,
  EDIT_PAYMENT_METHOD_SUCCESS,
  EDIT_PAYMENT_METHOD_FAIL,
} from "../constants/paymentMethodConstants";
import { PaymentMethod } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = (): string => {
  return localStorage.getItem("api_token") || "";
};

// Fetch Payment Methods
export const _fetchPaymentMethods = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_PAYMENT_METHOD_LIST_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/paymentmethods`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch({
      type: FETCH_PAYMENT_METHOD_LIST_SUCCESS,
      payload: response.data.data.paymentmethods,
    });

  } catch (error: any) {
    dispatch({
      type: FETCH_PAYMENT_METHOD_LIST_FAIL,
      payload: error.message ,
    });

  }
};

// Add Payment Method
export const _addPaymentMethod = (
  newMethod: PaymentMethod,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_PAYMENT_METHOD_REQUEST });
  const formData = new FormData();
  formData.append('method_name', newMethod.method_name);
  formData.append('account_details', newMethod.account_details);
  formData.append('status', newMethod.status.toString());
  if (newMethod.account_image && typeof newMethod.account_image !== 'string') {
    formData.append('account_image', newMethod.account_image);
  }

  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/paymentmethods`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    dispatch({
      type: ADD_PAYMENT_METHOD_SUCCESS,
      payload: response.data.data.payment_method,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("PAYMENT_METHOD_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: ADD_PAYMENT_METHOD_FAIL, payload: error.message });

    let errorMessage = t("PAYMENT_METHOD_ADD_FAILED");
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

// Edit Payment Method
export const _editPaymentMethod = (
  methodId: number,
  updatedMethod: PaymentMethod,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_PAYMENT_METHOD_REQUEST });
  const formData = new FormData();
  formData.append('method_name', updatedMethod.method_name);
  formData.append('account_details', updatedMethod.account_details);
  formData.append('status', updatedMethod.status.toString());
  if (updatedMethod.account_image && typeof updatedMethod.account_image !== 'string') {
    formData.append('account_image', updatedMethod.account_image);
  }

  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/paymentmethods/${methodId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    dispatch({
      type: EDIT_PAYMENT_METHOD_SUCCESS,
      payload: response.data.data.payment_method,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("PAYMENT_METHOD_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: EDIT_PAYMENT_METHOD_FAIL, payload: error.message });

    let errorMessage = t("PAYMENT_METHOD_UPDATE_FAILED");
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

// Delete Payment Method
export const _deletePaymentMethod = (
  methodId: number,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_PAYMENT_METHOD_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/paymentmethods/${methodId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: DELETE_PAYMENT_METHOD_SUCCESS,
      payload: methodId,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("PAYMENT_METHOD_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: DELETE_PAYMENT_METHOD_FAIL, payload: error.message });

    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("PAYMENT_METHOD_DELETE_FAILED"),
      life: 3000,
    });
  }
};
