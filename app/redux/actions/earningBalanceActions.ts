import axios from "axios";
import { Toast } from "primereact/toast";
import { Dispatch } from "redux";
import { ADD_EARNING_BALANCE_FAIL, ADD_EARNING_BALANCE_REQUEST, ADD_EARNING_BALANCE_SUCCESS, CHANGE_STATUS_EARNING_BALANCE_FAIL, CHANGE_STATUS_EARNING_BALANCE_REQUEST, CHANGE_STATUS_EARNING_BALANCE_SUCCESS, FETCH_EARNING_BALANCE_LIST_FAIL, FETCH_EARNING_BALANCE_LIST_REQUEST, FETCH_EARNING_BALANCE_LIST_SUCCESS } from "../constants/earningBalanceConstants";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
};

// Fetch earning balance List
export const _fetchEarningBalanceRequestList = (page: number = 1, search: string = '') => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_EARNING_BALANCE_LIST_REQUEST });
    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/earning-transfers?search=${search}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        //console.log(response)
        dispatch({
            type: FETCH_EARNING_BALANCE_LIST_SUCCESS,
            payload: {
                data: response.data.data.requests,
            },
        });
        //console.log(response)
    } catch (error: any) {
        //console.log(error)
        dispatch({
            type: FETCH_EARNING_BALANCE_LIST_FAIL,
            payload: error.message,
        });

    }
};

// Add EARNING BALANCE REQUEST
export const _addEarningBalanceRequest = (newData: any, toast: React.RefObject<Toast>,t:(key:string)=>string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_EARNING_BALANCE_REQUEST });
    try {
        const formData = new FormData();

        // Append each property of the `body` object to the `FormData` instance
        formData.append("reseller_id", newData.reseller_id);
        formData.append("amount", newData.amount);

        const token = getAuthToken();
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/balances/transfer-earning`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        //console.log(response)
        //const newData = { ...newUserData, id: response.data.data.user.id };
        dispatch({
            type: ADD_EARNING_BALANCE_SUCCESS,
            payload: response.data.data.balance,
        });
        toast.current?.show({
            severity: "success",
            summary: t('SUCCESS'),
            detail: response.data.message,
            life: 3000,
        });
    } catch (error: any) {
        //console.log(error)
        dispatch({
            type: ADD_EARNING_BALANCE_FAIL,
            payload: error.message,
        });

        let errorMessage = "Failed to transfer"; // Default message

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
            summary: t('ERROR'),
            detail: errorMessage,
            life: 3000,
        });

    }
};




export const _changeEarningBalanceStatus = (
    request_id: number,
    status: string,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => {
    return async (dispatch: Dispatch) => {
        dispatch({ type: CHANGE_STATUS_EARNING_BALANCE_REQUEST });

        try {

            const token = getAuthToken();
            //console.log(token)
            const baseURL = `${process.env.NEXT_PUBLIC_BASE_URL}/earning-transfers/${request_id}/update-status`;
            const formData = new FormData()
            formData.append("status", status)


            const response = await axios.post(`${baseURL}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            //console.log(response)
            if (response.data.success === true) {
                toast.current?.show({
                    severity: 'success',
                    summary: t('SUCCESS'),
                    detail: response.data.message,
                    life: 3000,
                });

                dispatch({
                    type: CHANGE_STATUS_EARNING_BALANCE_SUCCESS,
                    payload: { request_id, status, message: response.data.message },
                });

            } else {
                throw new Error(response.data.message );
            }
        } catch (error: any) {
            //console.log(error)
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: error.response.data.message ,
                life: 3000,
            });

            dispatch({
                type: CHANGE_STATUS_EARNING_BALANCE_FAIL ,
                payload: error.response.data.message,
            });
        }
    };
};
