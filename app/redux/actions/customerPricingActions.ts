import { Dispatch } from "redux";
import axios from "axios";
import { Toast } from "primereact/toast";


import { DELETE_CUSTOMER_PRICING_FAIL, DELETE_CUSTOMER_PRICING_REQUEST, DELETE_CUSTOMER_PRICING_SUCCESS, FETCH_CUSTOMER_PRICING_LIST_FAILURE, FETCH_CUSTOMER_PRICING_LIST_REQUEST, FETCH_CUSTOMER_PRICING_LIST_SUCCESS } from "../constants/cusotmerPricingConstants";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

// Fetch Hawala currencies
export const _fetchCustomerPricing = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_CUSTOMER_PRICING_LIST_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/customer-pricings`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });


        //console.log(response)
        dispatch({ type: FETCH_CUSTOMER_PRICING_LIST_SUCCESS, payload: response.data.data.customer_pricings });
        //console.log(response.data.data.rates)
    } catch (error: any) {
        dispatch({ type: FETCH_CUSTOMER_PRICING_LIST_FAILURE, payload: error.message });
    }
};



// Delete a Hawala currency
export const _deleteCustomerPricing = (currencyId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_CUSTOMER_PRICING_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/customer-pricings/${currencyId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: DELETE_CUSTOMER_PRICING_SUCCESS, payload: currencyId });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("HAWALA_CURRENCY_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: DELETE_CUSTOMER_PRICING_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("HAWALA_CURRENCY_DELETE_FAILED"),
            life: 3000,
        });
    }
};
