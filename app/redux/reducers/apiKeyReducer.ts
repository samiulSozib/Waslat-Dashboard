import { AnyAction } from 'redux';
import {
    FETCH_API_KEYS_REQUEST,
    FETCH_API_KEYS_SUCCESS,
    FETCH_API_KEYS_FAIL,
    FETCH_API_KEY_REQUEST,
    FETCH_API_KEY_SUCCESS,
    FETCH_API_KEY_FAIL,
    CREATE_API_KEY_REQUEST,
    CREATE_API_KEY_SUCCESS,
    CREATE_API_KEY_FAIL,
    UPDATE_API_KEY_REQUEST,
    UPDATE_API_KEY_SUCCESS,
    UPDATE_API_KEY_FAIL,
    DELETE_API_KEY_REQUEST,
    DELETE_API_KEY_SUCCESS,
    DELETE_API_KEY_FAIL,
    TOGGLE_API_KEY_REQUEST,
    TOGGLE_API_KEY_SUCCESS,
    TOGGLE_API_KEY_FAIL,
    REGENERATE_API_KEY_REQUEST,
    REGENERATE_API_KEY_SUCCESS,
    REGENERATE_API_KEY_FAIL,
} from '../constants/apiKeyConstants';
import { ApiKey, Pagination } from '@/types/interface';

interface ApiKeyState {
    loading: boolean;
    apiKeys: ApiKey[];
    currentApiKey: ApiKey | null;
    error: string | null;
    pagination: Pagination | null;
}

const initialState: ApiKeyState = {
    loading: false,
    apiKeys: [],
    currentApiKey: null,
    error: null,
    pagination: null
};

export const apiKeyReducer = (state = initialState, action: AnyAction): ApiKeyState => {
    switch (action.type) {
        case FETCH_API_KEYS_REQUEST:
        case FETCH_API_KEY_REQUEST:
        case CREATE_API_KEY_REQUEST:
        case UPDATE_API_KEY_REQUEST:
        case DELETE_API_KEY_REQUEST:
        case TOGGLE_API_KEY_REQUEST:
        case REGENERATE_API_KEY_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_API_KEYS_SUCCESS:
            return {
                ...state,
                loading: false,
                apiKeys: action.payload.data,
                pagination: action.payload.pagination,
                error: null,
            };

        case FETCH_API_KEY_SUCCESS:
            return {
                ...state,
                loading: false,
                currentApiKey: action.payload,
                error: null,
            };

        case CREATE_API_KEY_SUCCESS:
            return {
                ...state,
                loading: false,
                apiKeys: [action.payload, ...state.apiKeys], // Add new API key to the beginning of the list
                error: null,
            };

        case UPDATE_API_KEY_SUCCESS:
            return {
                ...state,
                loading: false,
                apiKeys: state.apiKeys.map((apiKey) =>
                    apiKey.id === action.payload.id ? action.payload : apiKey
                ),
                currentApiKey: state.currentApiKey?.id === action.payload.id
                    ? action.payload
                    : state.currentApiKey,
                error: null,
            };

        case DELETE_API_KEY_SUCCESS:
            return {
                ...state,
                loading: false,
                apiKeys: state.apiKeys.filter((apiKey) => apiKey.id !== action.payload),
                currentApiKey: state.currentApiKey?.id === action.payload
                    ? null
                    : state.currentApiKey,
                error: null,
            };

        case TOGGLE_API_KEY_SUCCESS:
            return {
                ...state,
                loading: false,
                apiKeys: state.apiKeys.map((apiKey) =>
                    apiKey.id === action.payload.id ? action.payload : apiKey
                ),
                currentApiKey: state.currentApiKey?.id === action.payload.id
                    ? action.payload
                    : state.currentApiKey,
                error: null,
            };

        case REGENERATE_API_KEY_SUCCESS:
            return {
                ...state,
                loading: false,
                apiKeys: state.apiKeys.map((apiKey) =>
                    apiKey.id === action.payload.id ? action.payload : apiKey
                ),
                currentApiKey: state.currentApiKey?.id === action.payload.id
                    ? action.payload
                    : state.currentApiKey,
                error: null,
            };

        case FETCH_API_KEYS_FAIL:
        case FETCH_API_KEY_FAIL:
        case CREATE_API_KEY_FAIL:
        case UPDATE_API_KEY_FAIL:
        case DELETE_API_KEY_FAIL:
        case TOGGLE_API_KEY_FAIL:
        case REGENERATE_API_KEY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
