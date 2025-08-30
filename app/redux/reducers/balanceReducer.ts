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
    ROLLBACK_BALANCE_SUCCESS,
    ROLLBACK_BALANCE_REQUEST,
    ROLLBACK_BALANCE_FAIL,
    VERIFY_BALANCE_REQUEST,
    REJECT_BALANCE_REQUEST,
    VERIFY_BALANCE_SUCCESS,
    REJECT_BALANCE_SUCCESS,
    VERIFY_BALANCE_FAIL,
    REJECT_BALANCE_FAIL,
} from '../constants/balanceConstants';
import { Balance, Pagination } from '@/types/interface';

interface BalanceState {
    loading: boolean;
    balances: Balance[];
    error: string | null;
    pagination: Pagination | null,
}

const initialState: BalanceState = {
    loading: false,
    balances: [],
    error: null,
    pagination:null
};

export const balanceReducer = (state = initialState, action: AnyAction): BalanceState => {
    switch (action.type) {
        case FETCH_BALANCES_REQUEST:
        case ADD_BALANCE_REQUEST:
        case EDIT_BALANCE_REQUEST:
        case DELETE_BALANCE_REQUEST:
        case ROLLBACK_BALANCE_REQUEST:
        case VERIFY_BALANCE_REQUEST:
        case REJECT_BALANCE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_BALANCES_SUCCESS:
            return {
                ...state,
                loading: false,
                balances: action.payload.data,
                pagination:action.payload.pagination,
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

            case ROLLBACK_BALANCE_SUCCESS:
            return {
                ...state,
                loading: false,
                balances: state.balances.map((balance) =>
                    balance.id === action.payload
                        ? { ...balance, status: 'rollbacked' }
                        : balance
                ),
                error: null,
            };

            case VERIFY_BALANCE_SUCCESS:
            return {
                ...state,
                loading: false,
                balances: state.balances.map((balance) =>
                    balance.id === action.payload
                        ? { ...balance, status: 'verified' }
                        : balance
                ),
                error: null,
            };

            case REJECT_BALANCE_SUCCESS:
            return {
                ...state,
                loading: false,
                balances: state.balances.map((balance) =>
                    balance.id === action.payload
                        ? { ...balance, status: 'rejected' }
                        : balance
                ),
                error: null,
            };

        case FETCH_BALANCES_FAIL:
        case ADD_BALANCE_FAIL:
        case EDIT_BALANCE_FAIL:
        case DELETE_BALANCE_FAIL:
        case ROLLBACK_BALANCE_FAIL:
        case VERIFY_BALANCE_FAIL:
        case REJECT_BALANCE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
