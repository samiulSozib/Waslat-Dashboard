import { Balance, MoneyTransaction, Order, Pagination, Payment, Reseller } from "@/types/interface";
import { FETCH_RESELLER_BALANCES_FAIL, FETCH_RESELLER_BALANCES_REQUEST, FETCH_RESELLER_BALANCES_SUCCESS, FETCH_RESELLER_ORDERS_FAIL, FETCH_RESELLER_ORDERS_REQUEST, FETCH_RESELLER_ORDERS_SUCCESS, FETCH_RESELLER_PAYMENTS_FAIL, FETCH_RESELLER_PAYMENTS_REQUEST, FETCH_RESELLER_PAYMENTS_SUCCESS, FETCH_RESELLER_SUB_RESELLERS_FAIL, FETCH_RESELLER_SUB_RESELLERS_REQUEST, FETCH_RESELLER_SUB_RESELLERS_SUCCESS, FETCH_RESELLER_TRANSACTIONS_FAIL, FETCH_RESELLER_TRANSACTIONS_REQUEST, FETCH_RESELLER_TRANSACTIONS_SUCCESS } from '../constants/resellerInfomationConstants';

interface ResellerInformationState {
    loading: boolean;
    orders: Order[];
    balances: Balance[],
    payments: Payment[],
    sub_resellers: Reseller[],
    transactions: MoneyTransaction[];
    error: string | null;
    orders_pagination: Pagination | null,
    balances_pagination: Pagination | null,
    payments_pagination: Pagination | null,
    sub_resellers_pagination: Pagination | null,
    transactions_pagination: Pagination | null
}

const initialState: ResellerInformationState = {
    loading: false,
    orders: [],
    balances: [],
    payments: [],
    sub_resellers: [],
    transactions: [],
    error: null,
    orders_pagination: null,
    balances_pagination: null,
    payments_pagination: null,
    sub_resellers_pagination: null,
    transactions_pagination: null

};

export const resellerInformationReducer = (state = initialState, action: any): ResellerInformationState => {
    switch (action.type) {
        case FETCH_RESELLER_ORDERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_RESELLER_ORDERS_SUCCESS:
            return {
                ...state,
                loading: false,
                orders: action.payload.data,
                orders_pagination: action.payload.pagination,
                error: null,
            };


        case FETCH_RESELLER_ORDERS_FAIL:

            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case FETCH_RESELLER_BALANCES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_RESELLER_BALANCES_SUCCESS:
            return {
                ...state,
                loading: false,
                balances: action.payload.data,
                balances_pagination: action.payload.pagination,
                error: null,
            };


        case FETCH_RESELLER_BALANCES_FAIL:

            return {
                ...state,
                loading: false,
                error: action.payload,
            };

            // PAYMENTS

            case FETCH_RESELLER_PAYMENTS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_RESELLER_PAYMENTS_SUCCESS:
            return {
                ...state,
                loading: false,
                payments: action.payload.data,
                payments_pagination: action.payload.pagination,
                error: null,
            };


        case FETCH_RESELLER_PAYMENTS_FAIL:

            return {
                ...state,
                loading: false,
                error: action.payload,
            };


            // TRANSACTIONS

            case FETCH_RESELLER_TRANSACTIONS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_RESELLER_TRANSACTIONS_SUCCESS:
            return {
                ...state,
                loading: false,
                transactions: action.payload.data,
                transactions_pagination: action.payload.pagination,
                error: null,
            };


        case FETCH_RESELLER_TRANSACTIONS_FAIL:

            return {
                ...state,
                loading: false,
                error: action.payload,
            };



            // SUB RESELLER

            case FETCH_RESELLER_SUB_RESELLERS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_RESELLER_SUB_RESELLERS_SUCCESS:
            return {
                ...state,
                loading: false,
                sub_resellers: action.payload.data,
                sub_resellers_pagination: action.payload.pagination,
                error: null,
            };


        case FETCH_RESELLER_SUB_RESELLERS_FAIL:

            return {
                ...state,
                loading: false,
                error: action.payload,
            };






        default:
            return state;
    }
};
