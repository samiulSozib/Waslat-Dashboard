// store/hawalaCurrencyReducer.ts
import { CustomerPricing } from '../../../types/interface';
import { DELETE_CUSTOMER_PRICING_FAIL, DELETE_CUSTOMER_PRICING_REQUEST, DELETE_CUSTOMER_PRICING_SUCCESS, FETCH_CUSTOMER_PRICING_LIST_FAILURE, FETCH_CUSTOMER_PRICING_LIST_REQUEST, FETCH_CUSTOMER_PRICING_LIST_SUCCESS } from '../constants/cusotmerPricingConstants';


interface CustomerPricingState {
    loading: boolean;
    customer_pricing_list: CustomerPricing[];
    error: string | null;
}

const initialState: CustomerPricingState = {
    loading: false,
    customer_pricing_list: [],
    error: null,
};

export const customerPricingReducer = (state = initialState, action: any): CustomerPricingState => {
    switch (action.type) {
        case FETCH_CUSTOMER_PRICING_LIST_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_CUSTOMER_PRICING_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                customer_pricing_list: action.payload,
                error: null,
            };
        case FETCH_CUSTOMER_PRICING_LIST_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case DELETE_CUSTOMER_PRICING_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };


        case DELETE_CUSTOMER_PRICING_SUCCESS:
            return {
                ...state,
                loading: false,
                customer_pricing_list: state.customer_pricing_list.filter((price) => price.id !== action.payload),
                error: null,
            };

        case DELETE_CUSTOMER_PRICING_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};
