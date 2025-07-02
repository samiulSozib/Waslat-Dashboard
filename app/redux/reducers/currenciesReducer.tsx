import { AnyAction } from "redux";
import {
    FETCH_CURRENCIES_REQUEST,
    FETCH_CURRENCIES_SUCCESS,
    FETCH_CURRENCIES_FAILURE,
    ADD_CURRENCY_REQUEST,
    ADD_CURRENCY_SUCCESS,
    ADD_CURRENCY_FAIL,
    EDIT_CURRENCY_REQUEST,
    EDIT_CURRENCY_SUCCESS,
    EDIT_CURRENCY_FAIL,
    DELETE_CURRENCY_REQUEST,
    DELETE_CURRENCY_SUCCESS,
    DELETE_CURRENCY_FAIL,
} from "../constants/currenciesConstants";
import { Currency } from "@/types/interface";

export interface CurrencyState {
    currencies: Currency[];
    loading: boolean;
    error: string | null;
}

const initialState: CurrencyState = {
    currencies: [],
    loading: false,
    error: null,
};

export const currenciesReducer = (state = initialState, action: AnyAction): CurrencyState => {
    switch (action.type) {
        case FETCH_CURRENCIES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_CURRENCIES_SUCCESS:
            return {
                ...state,
                loading: false,
                currencies: action.payload,
                error: null,
            };

        case FETCH_CURRENCIES_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case ADD_CURRENCY_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case ADD_CURRENCY_SUCCESS:
            return {
                ...state,
                loading: false,
                currencies: [...state.currencies, action.payload],
                error: null,
            };

        case ADD_CURRENCY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case EDIT_CURRENCY_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case EDIT_CURRENCY_SUCCESS:
            return {
                ...state,
                loading: false,
                currencies: state.currencies.map((currency) =>
                    currency.id === action.payload.id ? action.payload : currency
                ),
                error: null,
            };

        case EDIT_CURRENCY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case DELETE_CURRENCY_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case DELETE_CURRENCY_SUCCESS:
            return {
                ...state,
                loading: false,
                currencies: state.currencies.filter(
                    (currency) => currency.id !== action.payload
                ),
                error: null,
            };

        case DELETE_CURRENCY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
