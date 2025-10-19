import { Dispatch } from "redux";
import axios from "axios";

import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT
} from '../constants/authConstants'
import { Toast } from "primereact/toast";

export const _login = (username: string, password: string,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
    dispatch({ type: LOGIN_REQUEST });

    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/login`, { username, password });
        //console.log(response)
        localStorage.setItem('api_token', response.data.data.api_token);
        localStorage.setItem('user_info', JSON.stringify(response.data.data.user_info));

        

        dispatch({ type: LOGIN_SUCCESS, payload: response.data.data });

        return { success: true }; // Explicitly indicate success
    } catch (error: any) {
        //console.log(error)
        dispatch({ type: LOGIN_FAIL, payload: error.response?.data?.message || error.message });

        return { success: false, error: error.response?.data?.message || error.message }; // Return failure
    }
};


export const signOut = () => (dispatch: Dispatch) => {
    // Clear stored tokens and user information
    localStorage.removeItem('api_token');
    localStorage.removeItem('user_info');

    // Dispatch the LOGOUT action to reset the state
    dispatch({ type: LOGOUT });

    // Optionally, you can return a success response or navigate
    return { success: true };
};
