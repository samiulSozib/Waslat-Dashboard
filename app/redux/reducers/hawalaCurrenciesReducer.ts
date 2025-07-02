// store/hawalaCurrencyReducer.ts
import { HawalaCurrency } from '@/types/interface';
import {
    FETCH_HAWALA_CURRENCIES_REQUEST,
    FETCH_HAWALA_CURRENCIES_SUCCESS,
    FETCH_HAWALA_CURRENCIES_FAILURE,
    ADD_HAWALA_CURRENCY_REQUEST,
    ADD_HAWALA_CURRENCY_SUCCESS,
    ADD_HAWALA_CURRENCY_FAIL,
    EDIT_HAWALA_CURRENCY_REQUEST,
    EDIT_HAWALA_CURRENCY_SUCCESS,
    EDIT_HAWALA_CURRENCY_FAIL,
    DELETE_HAWALA_CURRENCY_REQUEST,
    DELETE_HAWALA_CURRENCY_SUCCESS,
    DELETE_HAWALA_CURRENCY_FAIL,
} from '../constants/hawalaCurrenciesConstants';

interface HawalaCurrencyState {
    loading: boolean;
    hawala_currencies: HawalaCurrency[];
    error: string | null;
}

const initialState: HawalaCurrencyState = {
    loading: false,
    hawala_currencies: [],
    error: null,
};

export const hawalaCurrenciesReducer = (state = initialState, action: any): HawalaCurrencyState => {
    switch (action.type) {
        case FETCH_HAWALA_CURRENCIES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_HAWALA_CURRENCIES_SUCCESS:
            return {
                ...state,
                loading: false,
                hawala_currencies: action.payload,
                error: null,
            };
        case FETCH_HAWALA_CURRENCIES_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case ADD_HAWALA_CURRENCY_REQUEST:
        case EDIT_HAWALA_CURRENCY_REQUEST:
        case DELETE_HAWALA_CURRENCY_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case ADD_HAWALA_CURRENCY_SUCCESS:
            return {
                ...state,
                loading: false,
                hawala_currencies: [...state.hawala_currencies, action.payload],
                error: null,
            };
        case EDIT_HAWALA_CURRENCY_SUCCESS:
            return {
                ...state,
                loading: false,
                hawala_currencies: state.hawala_currencies.map((currency) =>
                    currency.id === action.payload.id ? action.payload : currency
                ),
                error: null,
            };
        case DELETE_HAWALA_CURRENCY_SUCCESS:
            return {
                ...state,
                loading: false,
                hawala_currencies: state.hawala_currencies.filter((currency) => currency.id !== action.payload),
                error: null,
            };
        case ADD_HAWALA_CURRENCY_FAIL:
        case EDIT_HAWALA_CURRENCY_FAIL:
        case DELETE_HAWALA_CURRENCY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};
