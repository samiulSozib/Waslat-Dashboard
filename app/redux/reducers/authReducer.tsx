import { AnyAction } from "redux";
import { LOGIN_FAIL, LOGIN_REQUEST, LOGIN_SUCCESS, LOGOUT } from "../constants/authConstants";
import { UserInfo } from "@/types/interface";


export interface AuthState {
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    api_token: string | null;
    userInfo: UserInfo | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    loading: false,
    error: null,
    api_token: null,
    userInfo: null,
};

export const authReducer = (state = initialState, action: any): AuthState => {
    switch (action.type) {
        case LOGIN_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case LOGIN_SUCCESS:
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                api_token: action.payload.api_token,
                userInfo: action.payload.user_info,
                error: null,
            };

        case LOGIN_FAIL:
            return {
                ...state,
                isAuthenticated: false,
                loading: false,
                error: action.payload,
            };

        case LOGOUT:
            return {
                ...initialState,
            };

        default:
            return state;
    }
};
