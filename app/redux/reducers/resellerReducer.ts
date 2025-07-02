// store/resellerReducer.ts
import {
    FETCH_RESELLERS_REQUEST,
    FETCH_RESELLERS_SUCCESS,
    FETCH_RESELLERS_FAIL,
    ADD_RESELLER_REQUEST,
    ADD_RESELLER_SUCCESS,
    ADD_RESELLER_FAIL,
    EDIT_RESELLER_REQUEST,
    EDIT_RESELLER_SUCCESS,
    EDIT_RESELLER_FAIL,
    DELETE_RESELLER_REQUEST,
    DELETE_RESELLER_SUCCESS,
    DELETE_RESELLER_FAIL,
    CHANGE_RESELLER_STATUS_REQUEST,
    CHANGE_RESELLER_STATUS_SUCCESS,
    CHANGE_RESELLER_STATUS_FAIL,
    GET_RESELLER_BY_ID_REQUEST,
    GET_RESELLER_BY_ID_SUCCESS,
    GET_RESELLER_BY_ID_FAIL,
    CHANGE_RESELLER_PASSWORD_REQUEST,
    CHANGE_RESELLER_PASSWORD_SUCCESS,
    CHANGE_RESELLER_PASSWORD_FAIL,
    CHANGE_RESELLER_PIN_REQUEST,
    CHANGE_RESELLER_PIN_SUCCESS,
    CHANGE_RESELLER_PIN_FAIL,
} from "../constants/resellerConstants";
import { Pagination, Reseller } from "@/types/interface";

interface ResellerState {
    loading: boolean;
    resellers: Reseller[];
    error: string | null;
    singleReseller: Reseller|null,
    pagination: Pagination | null;
}

const initialState: ResellerState = {
    loading: false,
    resellers: [],
    error: null,
    singleReseller: null,
    pagination:null

};

export const resellerReducer = (state = initialState, action: any): ResellerState => {
    switch (action.type) {
        case FETCH_RESELLERS_REQUEST:
        case ADD_RESELLER_REQUEST:
        case EDIT_RESELLER_REQUEST:
        case DELETE_RESELLER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_RESELLERS_SUCCESS:
            return {
                ...state,
                loading: false,
                resellers: action.payload.data,
                pagination:action.payload.pagination,
                error: null,
            };

        case FETCH_RESELLERS_FAIL:
        case ADD_RESELLER_FAIL:
        case EDIT_RESELLER_FAIL:
        case DELETE_RESELLER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case ADD_RESELLER_SUCCESS:
            return {
                ...state,
                loading: false,
                resellers: [...state.resellers, action.payload],
                error: null,
            };

        case EDIT_RESELLER_SUCCESS:
            return {
                ...state,
                loading: false,
                resellers: state.resellers.map((reseller) =>
                    reseller.id === action.payload.id ? action.payload : reseller
                ),
                error: null,
            };

        case DELETE_RESELLER_SUCCESS:
            return {
                ...state,
                loading: false,
                resellers: state.resellers.filter((reseller) => reseller.id !== action.payload),
                error: null,
            };

            case CHANGE_RESELLER_STATUS_REQUEST:
                return {
                    ...state,
                    loading: true,
                    error: null,
                };

            case CHANGE_RESELLER_STATUS_SUCCESS:
                return {
                    ...state,
                    loading: false,
                    resellers: state.resellers.map((reseller) =>
                        reseller.id === action.payload.id
                            ? { ...reseller, status: action.payload.status }
                            : reseller
                    ),
                    error: null,
                };

            case CHANGE_RESELLER_STATUS_FAIL:
                return {
                    ...state,
                    loading: false,
                    error: action.payload,
                };

                case GET_RESELLER_BY_ID_REQUEST:
                    return {
                        ...state,
                        loading: true,
                        error: null,
                    };

                case GET_RESELLER_BY_ID_SUCCESS:
                    return {
                        ...state,
                        loading: false,
                        singleReseller: action.payload,
                        error: null,
                    };

                case GET_RESELLER_BY_ID_FAIL:
                    return {
                        ...state,
                        loading: false,
                        error: action.payload,
                    };

                    case CHANGE_RESELLER_PASSWORD_REQUEST:
                        case CHANGE_RESELLER_PIN_REQUEST:
                            return {
                                ...state,
                                loading: true,
                                error: null,
                            };

                        case CHANGE_RESELLER_PASSWORD_SUCCESS:
                        case CHANGE_RESELLER_PIN_SUCCESS:
                            return {
                                ...state,
                                loading: false,
                                error: null,
                            };

                        case CHANGE_RESELLER_PASSWORD_FAIL:
                        case CHANGE_RESELLER_PIN_FAIL:
                            return {
                                ...state,
                                loading: false,
                                error: action.payload,
                            };

        default:
            return state;
    }
};
