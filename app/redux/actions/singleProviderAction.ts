// singleProviderActions.ts
import axios from "axios";
import { Dispatch } from "redux";
import {
    FETCH_SINGLE_PROVIDER_REQUEST,
    FETCH_SINGLE_PROVIDER_SUCCESS,
    FETCH_SINGLE_PROVIDER_FAIL,
    CLEAR_SINGLE_PROVIDER,
    FETCH_PAYSTORE_OPERATORS_REQUEST,
    FETCH_PAYSTORE_OPERATORS_SUCCESS,
    FETCH_PAYSTORE_OPERATORS_FAIL,
    CLEAR_PAYSTORE_OPERATORS,
    SELECT_PAYSTORE_GROUP,
    SELECT_PAYSTORE_OPERATOR,
    FETCH_PAYSTORE_PRODUCTS_BY_FIRM_REQUEST,
    FETCH_PAYSTORE_PRODUCTS_BY_FIRM_SUCCESS,
    FETCH_PAYSTORE_PRODUCTS_BY_FIRM_FAIL
} from "../constants/singleProviderConstant";
import { PaystoreGroup, PaystoreOperator } from '@/types/interface';

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

// Fetch single Provider
export const _fetchSingleProvider = (
    providerId: number,
    code: string,
    capability: string,
    company: string,
    page: number = 1,
    search: string = '',
    filters: Record<string, any> = {}
) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_SINGLE_PROVIDER_REQUEST });

    try {
        const token = getAuthToken();
        const queryParams = new URLSearchParams();

        if (company) queryParams.append("company", company);
        if (search) queryParams.append('search', search);

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, String(value));
            }
        });

        const queryString = queryParams.toString();
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api-providers/${providerId}/${code}/${capability}${queryString ? `?${queryString}` : ''}`;

        console.log("🌐 API URL:", url);

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("🔥 FULL API RESPONSE:", response.data);

        let productsData = [];
        let internetData = [];

        // For paystore with products capability
        if (code === 'paystore' && capability === 'products') {
            productsData = response.data.data?.products ||
                          response.data.data?.internet ||
                          response.data.data?.raw?.products ||
                          response.data.data?.raw?.internet ||
                          response.data.data ||
                          [];

            console.log("✅ Products data extracted for paystore:", productsData);
        } else {
            internetData = response.data.data?.internet ||
                          response.data.data?.raw?.internet ||
                          [];
        }

        dispatch({
            type: FETCH_SINGLE_PROVIDER_SUCCESS,
            payload: {
                products: productsData,
                provider: response.data.data?.provider || response.data.provider,
                internets: internetData,
                rawInternets: code === "iimobile"
                    ? response.data.data?.categories?.[0]?.bundles
                    : response.data.data?.raw?.internet || response.data.data?.internet || [],
                rawBundles: response.data.data?.bundles || [],
                pagination: response.data.payload?.pagination || response.data.data?.pagination || null,
                isPaystoreProducts: code === 'paystore' && capability === 'products',
            },
        });

    } catch (error: any) {
        console.error("❌ API Error:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch provider";
        dispatch({
            type: FETCH_SINGLE_PROVIDER_FAIL,
            payload: errorMessage
        });
    }
};

// Clear single provider data
export const clearSingleProvider = () => ({
    type: CLEAR_SINGLE_PROVIDER
});

// 🔥 FIXED: Fetch PayStore operators
export const _fetchPaystoreOperators = (
    providerId: number
) => async (dispatch: Dispatch) => {
    console.log("🔵 _fetchPaystoreOperators called with providerId:", providerId);
    dispatch({ type: FETCH_PAYSTORE_OPERATORS_REQUEST });

    try {
        const token = getAuthToken();
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api-providers/${providerId}/paystore/operators`;

        console.log("🌐 Fetching PayStore operators from:", url);

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("🔥 PayStore Operators Response:", response.data);

        const groups = response.data.data?.groups || [];
        const totalGroups = response.data.data?.total_groups || 0;

        console.log("✅ Groups extracted:", groups);
        console.log("📊 Total groups:", totalGroups);

        dispatch({
            type: FETCH_PAYSTORE_OPERATORS_SUCCESS,
            payload: {
                groups: groups,
                totalGroups: totalGroups,
            },
        });

        return response.data;

    } catch (error: any) {
        console.error("❌ Error fetching PayStore operators:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch PayStore operators";
        dispatch({
            type: FETCH_PAYSTORE_OPERATORS_FAIL,
            payload: errorMessage
        });
        throw error;
    }
};

// Select PayStore group
export const selectPaystoreGroup = (group: PaystoreGroup) => ({
    type: SELECT_PAYSTORE_GROUP,
    payload: group,
});

// Select PayStore operator
export const selectPaystoreOperator = (operator: PaystoreOperator) => ({
    type: SELECT_PAYSTORE_OPERATOR,
    payload: operator,
});

// Fetch PayStore products by op_firm
export const _fetchPaystoreProductsByFirm = (
    providerId: number,
    opFirm: string
) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_PAYSTORE_PRODUCTS_BY_FIRM_REQUEST });

    try {
        const token = getAuthToken();
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api-providers/${providerId}/paystore/products?op_firm=${encodeURIComponent(opFirm)}`;

        console.log("🌐 Fetching PayStore products for firm:", opFirm);
        console.log("🌐 URL:", url);

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        console.log("🔥 PayStore Products by Firm Response:", response.data);

        let productsData = response.data.data?.products ||
                          response.data.data?.internet ||
                          response.data.data ||
                          [];

        dispatch({
            type: FETCH_PAYSTORE_PRODUCTS_BY_FIRM_SUCCESS,
            payload: {
                products: productsData,
                selectedOpFirm: opFirm,
            },
        });

        return response.data;

    } catch (error: any) {
        console.error("❌ Error fetching PayStore products:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch PayStore products";
        dispatch({
            type: FETCH_PAYSTORE_PRODUCTS_BY_FIRM_FAIL,
            payload: errorMessage
        });
        throw error;
    }
};

// Clear PayStore operators data
export const clearPaystoreOperators = () => ({
    type: CLEAR_PAYSTORE_OPERATORS,
});
