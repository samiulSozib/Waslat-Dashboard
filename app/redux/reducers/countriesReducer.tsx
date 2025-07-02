// store/countryReducer.ts
import { Country } from '@/types/interface';
import {
    FETCH_COUNTRIES_REQUEST,
    FETCH_COUNTRIES_SUCCESS,
    FETCH_COUNTRIES_FAIL,
    ADD_COUNTRY_REQUEST,
    ADD_COUNTRY_SUCCESS,
    ADD_COUNTRY_FAIL,
    EDIT_COUNTRY_REQUEST,
    EDIT_COUNTRY_SUCCESS,
    EDIT_COUNTRY_FAIL,
    DELETE_COUNTRY_REQUEST,
    DELETE_COUNTRY_SUCCESS,
    DELETE_COUNTRY_FAIL,
} from '../constants/countriesConstants';

interface CountryState {
    loading: boolean;
    countries: Country[];
    error: string | null;
}

const initialState: CountryState = {
    loading: false,
    countries: [],
    error: null,
};

export const countriesReducer = (state = initialState, action: any): CountryState => {
    switch (action.type) {
        case FETCH_COUNTRIES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_COUNTRIES_SUCCESS:
            return {
                ...state,
                loading: false,
                countries: action.payload,
                error: null,
            };
        case FETCH_COUNTRIES_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case ADD_COUNTRY_REQUEST:
        case EDIT_COUNTRY_REQUEST:
        case DELETE_COUNTRY_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case ADD_COUNTRY_SUCCESS:
            return {
                ...state,
                loading: false,
                countries: [...state.countries, action.payload],
                error: null,
            };
        case EDIT_COUNTRY_SUCCESS:
            return {
                ...state,
                loading: false,
                countries: state.countries.map((country) =>
                    country.id === action.payload.id ? action.payload : country
                ),
                error: null,
            };
        case DELETE_COUNTRY_SUCCESS:
            return {
                ...state,
                loading: false,
                countries: state.countries.filter((country) => country.id !== action.payload),
                error: null,
            };
        case ADD_COUNTRY_FAIL:
        case EDIT_COUNTRY_FAIL:
        case DELETE_COUNTRY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};
