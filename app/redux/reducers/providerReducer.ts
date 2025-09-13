import { Pagination, Provider } from "@/types/interface";
import {
    FETCH_PROVIDERS_REQUEST,
    FETCH_PROVIDERS_SUCCESS,
    FETCH_PROVIDERS_FAIL,
    ADD_PROVIDER_REQUEST,
    ADD_PROVIDER_SUCCESS,
    ADD_PROVIDER_FAIL,
    EDIT_PROVIDER_REQUEST,
    EDIT_PROVIDER_SUCCESS,
    EDIT_PROVIDER_FAIL,
    DELETE_PROVIDER_REQUEST,
    DELETE_PROVIDER_SUCCESS,
    DELETE_PROVIDER_FAIL,
    TOGGLE_PROVIDER_REQUEST,
    TOGGLE_PROVIDER_SUCCESS,
    TOGGLE_PROVIDER_FAIL,
} from '../constants/providerConstants'

interface ProviderState {
    loading: boolean;
    providers: Provider[];
    error: string | null;
    pagination: Pagination | null;

}

const initialState: ProviderState = {
    loading: false,
    providers: [],
    error: null,
    pagination: null
};

export const providerReducer = (state = initialState, action: any): ProviderState => {
    switch (action.type) {
        case FETCH_PROVIDERS_REQUEST:
        case ADD_PROVIDER_REQUEST:
        case EDIT_PROVIDER_REQUEST:
        case DELETE_PROVIDER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_PROVIDERS_SUCCESS:
            return {
                ...state,
                loading: false,
                providers: action.payload.data,
                error: null,
                pagination: action.payload.pagination,
            };

        case FETCH_PROVIDERS_FAIL:
        case ADD_PROVIDER_FAIL:
        case EDIT_PROVIDER_FAIL:
        case DELETE_PROVIDER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case ADD_PROVIDER_SUCCESS:
            return {
                ...state,
                loading: false,
                providers: [...state.providers, action.payload],
                error: null,
            };

        case EDIT_PROVIDER_SUCCESS:
            return {
                ...state,
                loading: false,
                providers: state.providers.map((provider) =>
                    provider.id === action.payload.id ? action.payload : provider
                ),
                error: null,
            };

        case DELETE_PROVIDER_SUCCESS:
            return {
                ...state,
                loading: false,
                providers: state.providers.filter((provider) => provider.id !== action.payload),
                error: null,
            };


        case TOGGLE_PROVIDER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case TOGGLE_PROVIDER_SUCCESS:
            return {
                ...state,
                loading: false,
                providers: state.providers.map((provider) =>
                    provider.id === action.payload.id ? action.payload : provider
                ),
                error: null,
            };

        case TOGGLE_PROVIDER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
