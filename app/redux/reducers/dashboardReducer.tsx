
import {
    FETCH_DASHBOARD_DATA_REQUEST,
    FETCH_DASHBOARD_DATA_SUCCESS,
    FETCH_DASHBOARD_DATA_FAIL
} from '../constants/dashboardConstants'

export interface DashboardDataState {
    loading: boolean;
    error: string | null;
    data: {
        today_orders: number;
        total_orders: number;
        total_sale: number;
        total_profit: number;
        today_sale: number;
        today_profit: number;
        total_resellers: number;
        total_companies: number;
        total_services: number;
        total_bundles: number;
        balances_by_currency: {
            currency_code: string;
            total_balance: string;
        }[];
    } | null;
}

const initialState: DashboardDataState = {
    loading: false,
    error: null,
    data: null,
};

export const dashboardDataReducer = (state = initialState, action: any): DashboardDataState => {
    switch (action.type) {
        case FETCH_DASHBOARD_DATA_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_DASHBOARD_DATA_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload,
                error: null,
            };

        case FETCH_DASHBOARD_DATA_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
                data: null,
            };

        default:
            return state;
    }
};
