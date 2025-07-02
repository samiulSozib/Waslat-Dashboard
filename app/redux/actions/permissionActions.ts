import { Dispatch } from "redux";
import axios from "axios";

import {
    FETCH_PERMISSIONS_REQUEST,
    FETCH_PERMISSIONS_SUCCESS,
    FETCH_PERMISSIONS_FAIL,

  } from "../constants/permissionConstants";

  import { Permission,} from "@/types/interface";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || ""; // Retrieve the token from localStorage
};

// Fetch payment list
export const _fetchPermissions = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_PERMISSIONS_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_WITHOUT_ADMIN}/permissions`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: FETCH_PERMISSIONS_SUCCESS, payload: response.data.data.permissions });
    } catch (error: any) {
        dispatch({ type: FETCH_PERMISSIONS_FAIL, payload: error.message });
    }
};
