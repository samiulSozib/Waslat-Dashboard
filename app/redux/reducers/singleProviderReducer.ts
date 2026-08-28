// singleProviderReducer.ts
import { Internet, Pagination, RawBundles, RawInternet, SingleProvider, Product } from '@/types/interface';
import {
    FETCH_SINGLE_PROVIDER_REQUEST,
    FETCH_SINGLE_PROVIDER_SUCCESS,
    FETCH_SINGLE_PROVIDER_FAIL,
    CLEAR_SINGLE_PROVIDER,
    FETCH_PAYSTORE_OPERATORS_REQUEST,
    FETCH_PAYSTORE_OPERATORS_SUCCESS,
    FETCH_PAYSTORE_OPERATORS_FAIL,
    CLEAR_PAYSTORE_OPERATORS,
    SELECT_PAYSTORE_GROUP,
    SELECT_PAYSTORE_OPERATOR,
    FETCH_PAYSTORE_PRODUCTS_BY_FIRM_REQUEST,
    FETCH_PAYSTORE_PRODUCTS_BY_FIRM_SUCCESS,
    FETCH_PAYSTORE_PRODUCTS_BY_FIRM_FAIL
} from '../constants/singleProviderConstant';

// Paystore operator interfaces
export interface PaystoreOperator {
    code: string;
    product_count: number;
}

export interface PaystoreGroup {
    op_firm: string;
    product_count: number;
    operators: PaystoreOperator[];
}

interface SingleProviderState {
    loading: boolean;
    provider: SingleProvider | null;
    internets: Internet[];
    rawInternets: RawInternet[],
    rawBundles: RawBundles[],
    products: Product[],
    error: string | null;
    pagination: Pagination | null;
    isPaystoreProducts: boolean;
    // Paystore operators fields
    isPaystoreOperators: boolean;
    operatorGroups: PaystoreGroup[];
    totalGroups: number;
    selectedOpFirm: string | null;
    selectedGroup: PaystoreGroup | null;
    selectedOperator: PaystoreOperator | null;
}

const initialState: SingleProviderState = {
    loading: false,
    provider: null,
    internets: [],
    rawInternets: [],
    rawBundles: [],
    products: [],
    error: null,
    pagination: null,
    isPaystoreProducts: false,
    isPaystoreOperators: false,
    operatorGroups: [],
    totalGroups: 0,
    selectedOpFirm: null,
    selectedGroup: null,
    selectedOperator: null,
};

export const singleProviderReducer = (
    state = initialState,
    action: any
): SingleProviderState => {
    switch (action.type) {
        case FETCH_SINGLE_PROVIDER_REQUEST:
        case FETCH_PAYSTORE_OPERATORS_REQUEST:
        case FETCH_PAYSTORE_PRODUCTS_BY_FIRM_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_SINGLE_PROVIDER_SUCCESS:
            console.log("📦 Reducer - Products payload:", action.payload.products);
            console.log("📦 Reducer - Products count:", action.payload.products?.length);
            console.log("📦 Reducer - RawInternets payload:", action.payload.rawInternets);

            return {
                ...state,
                loading: false,
                provider: action.payload.provider,
                internets: action.payload.internets || [],
                rawInternets: action.payload.rawInternets || [],
                rawBundles: action.payload.rawBundles || [],
                products: action.payload.products || [],
                pagination: action.payload.pagination,
                isPaystoreProducts: action.payload.isPaystoreProducts || false,
                isPaystoreOperators: action.payload.isPaystoreOperators || false,
                operatorGroups: action.payload.operatorGroups || [],
                totalGroups: action.payload.totalGroups || 0,
                selectedOpFirm: action.payload.selectedOpFirm || state.selectedOpFirm,
                error: null,
            };

        case FETCH_PAYSTORE_OPERATORS_SUCCESS:
            return {
                ...state,
                loading: false,
                operatorGroups: action.payload.groups,
                totalGroups: action.payload.totalGroups,
                error: null,
            };

        case FETCH_PAYSTORE_PRODUCTS_BY_FIRM_SUCCESS:
            return {
                ...state,
                loading: false,
                products: action.payload.products,
                selectedOpFirm: action.payload.selectedOpFirm,
                isPaystoreProducts: true,
                error: null,
            };

        case SELECT_PAYSTORE_GROUP:
            return {
                ...state,
                selectedGroup: action.payload,
                selectedOperator: null,
            };

        case SELECT_PAYSTORE_OPERATOR:
            return {
                ...state,
                selectedOperator: action.payload,
            };

        case FETCH_SINGLE_PROVIDER_FAIL:
        case FETCH_PAYSTORE_OPERATORS_FAIL:
        case FETCH_PAYSTORE_PRODUCTS_BY_FIRM_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
                provider: null,
                internets: [],
                rawInternets: [],
                rawBundles: [],
                products: [],
                pagination: null,
                isPaystoreProducts: false,
                isPaystoreOperators: false,
                operatorGroups: [],
                totalGroups: 0,
                selectedOpFirm: null,
                selectedGroup: null,
                selectedOperator: null,
            };

        case CLEAR_SINGLE_PROVIDER:
        case CLEAR_PAYSTORE_OPERATORS:
            return initialState;

        default:
            return state;
    }
};
