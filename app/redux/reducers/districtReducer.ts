// store/districtReducer.ts
import { District } from "@/types/interface";

import {
    FETCH_DISTRICTS_REQUEST,
    FETCH_DISTRICTS_SUCCESS,
    FETCH_DISTRICTS_FAIL,
    ADD_DISTRICT_REQUEST,
    ADD_DISTRICT_SUCCESS,
    ADD_DISTRICT_FAIL,
    EDIT_DISTRICT_REQUEST,
    EDIT_DISTRICT_SUCCESS,
    EDIT_DISTRICT_FAIL,
    DELETE_DISTRICT_REQUEST,
    DELETE_DISTRICT_SUCCESS,
    DELETE_DISTRICT_FAIL
} from '../constants/districtsConstants'

interface DistrictState {
    loading: boolean;
    districts: District[];
    error: string | null;
}

const initialState: DistrictState = {
    loading: false,
    districts: [],
    error: null,
};



export const districtReducer = (state = initialState, action: any): DistrictState => {
    switch (action.type) {
        case FETCH_DISTRICTS_REQUEST:
        case ADD_DISTRICT_REQUEST:
        case EDIT_DISTRICT_REQUEST:
        case DELETE_DISTRICT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_DISTRICTS_SUCCESS:
            return {
                ...state,
                loading: false,
                districts: action.payload,
                error: null,
            };

        case FETCH_DISTRICTS_FAIL:
        case ADD_DISTRICT_FAIL:
        case EDIT_DISTRICT_FAIL:
        case DELETE_DISTRICT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case ADD_DISTRICT_SUCCESS:
            return {
                ...state,
                loading: false,
                districts: [...state.districts, action.payload],
                error: null,
            };

        case EDIT_DISTRICT_SUCCESS:
            return {
                ...state,
                loading: false,
                districts: state.districts.map((district) =>
                    district.id === action.payload.id ? action.payload : district
                ),
                error: null,
            };

        case DELETE_DISTRICT_SUCCESS:
            return {
                ...state,
                loading: false,
                districts: state.districts.filter((district) => district.id !== action.payload),
                error: null,
            };

        default:
            return state;
    }
};
