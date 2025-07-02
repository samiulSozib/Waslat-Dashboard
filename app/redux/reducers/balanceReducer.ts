import { AnyAction } from 'redux';
import {
    FETCH_BALANCES_REQUEST,
    FETCH_BALANCES_SUCCESS,
    FETCH_BALANCES_FAIL,
    ADD_BALANCE_REQUEST,
    ADD_BALANCE_SUCCESS,
    ADD_BALANCE_FAIL,
    EDIT_BALANCE_REQUEST,
    EDIT_BALANCE_SUCCESS,
    EDIT_BALANCE_FAIL,
    DELETE_BALANCE_REQUEST,
    DELETE_BALANCE_SUCCESS,
    DELETE_BALANCE_FAIL,
} from '../constants/balanceConstants';
import { Balance } from '@/types/interface';

interface BalanceState {
    loading: boolean;
    balances: Balance[];
    error: string | null;
}

const initialState: BalanceState = {
    loading: false,
    balances: [],
    error: null,
};

export const balanceReducer = (state = initialState, action: AnyAction): BalanceState => {
    switch (action.type) {
        case FETCH_BALANCES_REQUEST:
        case ADD_BALANCE_REQUEST:
        case EDIT_BALANCE_REQUEST:
        case DELETE_BALANCE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_BALANCES_SUCCESS:
            return {
                ...state,
                loading: false,
                balances: action.payload,
                error: null,
            };

        case ADD_BALANCE_SUCCESS:
            return {
                ...state,
                loading: false,
                balances: [...state.balances, action.payload], // Add the new balance to the existing list
                error: null,
            };

        case EDIT_BALANCE_SUCCESS:
            return {
                ...state,
                loading: false,
                balances: state.balances.map((district) =>
                    district.id === action.payload.id ? action.payload : district
                ),
                error: null,
            };

        case DELETE_BALANCE_SUCCESS:
            return {
                ...state,
                loading: false,
                balances: state.balances.filter((district) => district.id !== action.payload),
                error: null,
            };

        case FETCH_BALANCES_FAIL:
        case ADD_BALANCE_FAIL:
        case EDIT_BALANCE_FAIL:
        case DELETE_BALANCE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
