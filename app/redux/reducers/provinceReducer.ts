// store/provinceReducer.ts
import {
    FETCH_PROVINCES_REQUEST,
    FETCH_PROVINCES_SUCCESS,
    FETCH_PROVINCES_FAIL,
    ADD_PROVINCE_REQUEST,
    ADD_PROVINCE_SUCCESS,
    ADD_PROVINCE_FAIL,
    EDIT_PROVINCE_REQUEST,
    EDIT_PROVINCE_SUCCESS,
    EDIT_PROVINCE_FAIL,
    DELETE_PROVINCE_REQUEST,
    DELETE_PROVINCE_SUCCESS,
    DELETE_PROVINCE_FAIL,
} from '../constants/provinceConstants';

import { Province } from '@/types/interface';

interface ProvinceState {
    loading: boolean;
    provinces: Province[];
    error: string | null;
}

const initialState: ProvinceState = {
    loading: false,
    provinces: [],
    error: null,
};

export const provinceReducer = (state = initialState, action: any): ProvinceState => {
    switch (action.type) {
        // Fetch Provinces
        case FETCH_PROVINCES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_PROVINCES_SUCCESS:
            return {
                ...state,
                loading: false,
                provinces: action.payload,
                error: null,
            };
        case FETCH_PROVINCES_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Add Province
        case ADD_PROVINCE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case ADD_PROVINCE_SUCCESS:
            return {
                ...state,
                loading: false,
                provinces: [...state.provinces, action.payload],
                error: null,
            };
        case ADD_PROVINCE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Edit Province
        case EDIT_PROVINCE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case EDIT_PROVINCE_SUCCESS:
            return {
                ...state,
                loading: false,
                provinces: state.provinces.map((province) =>
                    province.id === action.payload.id ? action.payload : province
                ),
                error: null,
            };
        case EDIT_PROVINCE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // Delete Province
        case DELETE_PROVINCE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case DELETE_PROVINCE_SUCCESS:
            return {
                ...state,
                loading: false,
                provinces: state.provinces.filter((province) => province.id !== action.payload),
                error: null,
            };
        case DELETE_PROVINCE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
