import { Dispatch } from "redux";
import axios from "axios";

import {
    FETCH_DASHBOARD_DATA_REQUEST,
    FETCH_DASHBOARD_DATA_SUCCESS,
    FETCH_DASHBOARD_DATA_FAIL
} from '../constants/dashboardConstants'
import { AppDispatch } from "../store";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
};

export const fetchDashboardData = (filters?: any) => async (dispatch: AppDispatch) => {
    dispatch({ type: FETCH_DASHBOARD_DATA_REQUEST });

    try {
        const token = getAuthToken();
        
        // Build query parameters from filters
        const params = new URLSearchParams();
        
        if (filters) {
            if (filters.filter_service_id) {
                params.append('service_id', filters.filter_service_id.toString());
            }
            if (filters.from_date) {
                params.append('from_date', filters.from_date);
            }
            if (filters.to_date) {
                params.append('to_date', filters.to_date);
            }
        }

        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
        
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        
        dispatch({ type: FETCH_DASHBOARD_DATA_SUCCESS, payload: response.data.data });
    } catch (error: any) {
        dispatch({ type: FETCH_DASHBOARD_DATA_FAIL, payload: error.message });
    }
}