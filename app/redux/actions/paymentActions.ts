// import { Dispatch } from "redux";
// import axios from "axios";

// import {
//     FETCH_PAYMENT_LIST_REQUEST,
//     FETCH_PAYMENT_LIST_SUCCESS,
//     FETCH_PAYMENT_LIST_FAIL,
//     ADD_PAYMENT_REQUEST,
//     ADD_PAYMENT_SUCCESS,
//     ADD_PAYMENT_FAIL,
//     EDIT_PAYMENT_REQUEST,
//     EDIT_PAYMENT_SUCCESS,
//     EDIT_PAYMENT_FAIL,
//     DELETE_PAYMENT_REQUEST,
//     DELETE_PAYMENT_SUCCESS,
//     DELETE_PAYMENT_FAIL,
// } from "../constants/paymentConstants";
// import { Payment } from "@/types/interface";
// import { Toast } from "primereact/toast";

// const getAuthToken = () => {
//     return localStorage.getItem("api_token") || ""; // Retrieve the token from localStorage
// };

// // Fetch payment list
// export const _fetchPayments = () => async (dispatch: Dispatch) => {
//     dispatch({ type: FETCH_PAYMENT_LIST_REQUEST });

//     try {
//         const token = getAuthToken();
//         const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/payments`, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });

//         dispatch({ type: FETCH_PAYMENT_LIST_SUCCESS, payload: response.data.data.payments });
//     } catch (error: any) {
//         dispatch({ type: FETCH_PAYMENT_LIST_FAIL, payload: error.message });
//     }
// };

// // Add a payment
// export const _addPayment = (paymentData: Payment,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//     dispatch({ type: ADD_PAYMENT_REQUEST });
//     const body={
//         reseller_id:paymentData.reseller?.id,
//         payment_method_id:paymentData.payment_method?.id,
//         currency_id:paymentData.currency?.id,
//         amount:paymentData.amount,
//         notes:paymentData.notes,
//         payment_date:paymentData.payment_date
//     }
//     //console.log(body)
//     //return
//     try {
//         const token = getAuthToken();
//         const response = await axios.post(
//             `${process.env.NEXT_PUBLIC_BASE_URL}/payments`,
//             body,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );
//         const newData={...paymentData,id:response.data.data.payment.id}
//         dispatch({ type: ADD_PAYMENT_SUCCESS, payload: newData });
//         toast.current?.show({
//             severity: "success",
//             summary: "Successful",
//             detail: "Payment added",
//             life: 3000,
//           });
//     } catch (error: any) {
//         dispatch({ type: ADD_PAYMENT_FAIL, payload: error.message });
//         toast.current?.show({
//             severity: "error",
//             summary: "Error",
//             detail: "Failed to add payment",
//             life: 3000,
//           });
//     }
// };

// // Edit a payment
// export const _editPayment = (paymentId: number, paymentData: Payment,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//     dispatch({ type: EDIT_PAYMENT_REQUEST });

//     try {
//         const token = getAuthToken();
//         const body={...paymentData,reseller_id:paymentData.reseller?.id,payment_method_id:paymentData.payment_method?.id,currency_id:paymentData.currency?.id}

//         const response = await axios.post(
//             `${process.env.NEXT_PUBLIC_BASE_URL}/payments/${paymentId}`,
//             body,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );
//         const newData={...paymentData,id:response.data.data.payment.id}
//         dispatch({ type: EDIT_PAYMENT_SUCCESS, payload: newData });
//         toast.current?.show({
//             severity: "success",
//             summary: "Successful",
//             detail: "Payment edited",
//             life: 3000,
//           });
//     } catch (error: any) {
//         dispatch({ type: EDIT_PAYMENT_FAIL, payload: error.message });
//         //console.log(error)
//         toast.current?.show({
//             severity: "error",
//             summary: "Error",
//             detail: "Failed to edit payment",
//             life: 3000,
//           });
//     }
// };

// // Delete a payment
// export const _deletePayment = (paymentId: number,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//     dispatch({ type: DELETE_PAYMENT_REQUEST });

//     try {
//         const token = getAuthToken();
//         await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/payments/${paymentId}`, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });

//         dispatch({ type: DELETE_PAYMENT_SUCCESS, payload: paymentId });
//         toast.current?.show({
//             severity: "success",
//             summary: "Successful",
//             detail: "Payment deleted",
//             life: 3000,
//           });
//     } catch (error: any) {
//         dispatch({ type: DELETE_PAYMENT_FAIL, payload: error.message });
//         toast.current?.show({
//             severity: "error",
//             summary: "Error",
//             detail: "Failed to delete payment",
//             life: 3000,
//           });
//     }
// };
import { Dispatch } from "redux";
import axios from "axios";
import {
    FETCH_PAYMENT_LIST_REQUEST,
    FETCH_PAYMENT_LIST_SUCCESS,
    FETCH_PAYMENT_LIST_FAIL,
    ADD_PAYMENT_REQUEST,
    ADD_PAYMENT_SUCCESS,
    ADD_PAYMENT_FAIL,
    EDIT_PAYMENT_REQUEST,
    EDIT_PAYMENT_SUCCESS,
    EDIT_PAYMENT_FAIL,
    DELETE_PAYMENT_REQUEST,
    DELETE_PAYMENT_SUCCESS,
    DELETE_PAYMENT_FAIL,
} from "../constants/paymentConstants";
import { Payment } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

// Fetch payment list
export const _fetchPayments = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_PAYMENT_LIST_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/payments`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: FETCH_PAYMENT_LIST_SUCCESS, payload: response.data.data.payments });

    } catch (error: any) {
        dispatch({ type: FETCH_PAYMENT_LIST_FAIL, payload: error.message });

    }
};

// Add a payment
export const _addPayment = (
    paymentData: Payment,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_PAYMENT_REQUEST });

    const body = {
        reseller_id: paymentData.reseller?.id,
        payment_method_id: paymentData.payment_method?.id,
        currency_id: paymentData.currency?.id,
        amount: paymentData.amount,
        notes: paymentData.notes,
        payment_date: paymentData.payment_date
    };

    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/payments`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const newData = { ...paymentData, id: response.data.data.payment.id };
        dispatch({ type: ADD_PAYMENT_SUCCESS, payload: newData });

        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("PAYMENT_ADDED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: ADD_PAYMENT_FAIL, payload: error.message });

        let errorMessage = t("PAYMENT_ADD_FAILED");
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

// Edit a payment
export const _editPayment = (
    paymentId: number,
    paymentData: Payment,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_PAYMENT_REQUEST });

    try {
        const token = getAuthToken();
        const body = {
            ...paymentData,
            reseller_id: paymentData.reseller?.id,
            payment_method_id: paymentData.payment_method?.id,
            currency_id: paymentData.currency?.id
        };

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/payments/${paymentId}`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const newData = { ...paymentData, id: response.data.data.payment.id };
        dispatch({ type: EDIT_PAYMENT_SUCCESS, payload: newData });

        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("PAYMENT_UPDATED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: EDIT_PAYMENT_FAIL, payload: error.message });

        let errorMessage = t("PAYMENT_UPDATE_FAILED");
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

// Delete a payment
export const _deletePayment = (
    paymentId: number,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_PAYMENT_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/payments/${paymentId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: DELETE_PAYMENT_SUCCESS, payload: paymentId });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("PAYMENT_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: DELETE_PAYMENT_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("PAYMENT_DELETE_FAILED"),
            life: 3000,
        });
    }
};
