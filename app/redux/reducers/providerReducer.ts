import { Category, Pagination, Product, Provider } from "@/types/interface";
import {
    FETCH_PROVIDERS_REQUEST,
    FETCH_PROVIDERS_SUCCESS,
    FETCH_PROVIDERS_FAIL,
    ADD_PROVIDER_REQUEST,
    ADD_PROVIDER_SUCCESS,
    ADD_PROVIDER_FAIL,
    EDIT_PROVIDER_REQUEST,
    EDIT_PROVIDER_SUCCESS,
    EDIT_PROVIDER_FAIL,
    DELETE_PROVIDER_REQUEST,
    DELETE_PROVIDER_SUCCESS,
    DELETE_PROVIDER_FAIL,
    TOGGLE_PROVIDER_REQUEST,
    TOGGLE_PROVIDER_SUCCESS,
    TOGGLE_PROVIDER_FAIL,
    FETCH_PROVIDER_CATEGORIES_REQUEST,
    FETCH_PROVIDER_CATEGORIES_SUCCESS,
    FETCH_PROVIDER_CATEGORIES_FAIL,
    FETCH_CATEGORY_PRODUCTS_SUCCESS,
    FETCH_CATEGORY_PRODUCTS_REQUEST,
    FETCH_CATEGORY_PRODUCTS_FAIL,
    CLEAR_SELECTED_CATEGORY,
    CLEAR_PROVIDER_PRODUCTS_DATA,
} from '../constants/providerConstants'




// First, update your ProviderState interface to include the new state:
interface ProviderState {
    loading: boolean;
    providers: Provider[];
    error: string | null;
    pagination: Pagination | null;
    // Add these new properties
    categories: Category[];
    selectedCategoryProducts: Product[];
    selectedCategoryName: string | null;
    selectedPurchaseType: string | null;
}

// Update your initialState:
const initialState: ProviderState = {
    loading: false,
    providers: [],
    error: null,
    pagination: null,
    // Add these new properties
    categories: [],
    selectedCategoryProducts: [],
    selectedCategoryName: null,
    selectedPurchaseType: null,
};

export const providerReducer = (state = initialState, action: any): ProviderState => {
    switch (action.type) {
        case FETCH_PROVIDERS_REQUEST:
        case ADD_PROVIDER_REQUEST:
        case EDIT_PROVIDER_REQUEST:
        case DELETE_PROVIDER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_PROVIDERS_SUCCESS:
            return {
                ...state,
                loading: false,
                providers: action.payload.data,
                error: null,
                pagination: action.payload.pagination,
            };

        case FETCH_PROVIDERS_FAIL:
        case ADD_PROVIDER_FAIL:
        case EDIT_PROVIDER_FAIL:
        case DELETE_PROVIDER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case ADD_PROVIDER_SUCCESS:
            return {
                ...state,
                loading: false,
                providers: [...state.providers, action.payload],
                error: null,
            };

        case EDIT_PROVIDER_SUCCESS:
            return {
                ...state,
                loading: false,
                providers: state.providers.map((provider) =>
                    provider.id === action.payload.id ? action.payload : provider
                ),
                error: null,
            };

        case DELETE_PROVIDER_SUCCESS:
            return {
                ...state,
                loading: false,
                providers: state.providers.filter((provider) => provider.id !== action.payload),
                error: null,
            };


        case TOGGLE_PROVIDER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case TOGGLE_PROVIDER_SUCCESS:
            return {
                ...state,
                loading: false,
                providers: state.providers.map((provider) =>
                    provider.id === action.payload.id ? action.payload : provider
                ),
                error: null,
            };

        case TOGGLE_PROVIDER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

            // Add new cases for categories and products
        case FETCH_PROVIDER_CATEGORIES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_PROVIDER_CATEGORIES_SUCCESS:
            return {
                ...state,
                loading: false,
                categories: action.payload,
                error: null,
            };

        case FETCH_PROVIDER_CATEGORIES_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case FETCH_CATEGORY_PRODUCTS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_CATEGORY_PRODUCTS_SUCCESS:
            return {
                ...state,
                loading: false,
                selectedCategoryProducts: action.payload.products,
                selectedCategoryName: action.payload.categoryName,
                selectedPurchaseType: action.payload.purchaseType,
                error: null,
            };

        case FETCH_CATEGORY_PRODUCTS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case CLEAR_SELECTED_CATEGORY:
            return {
                ...state,
                selectedCategoryProducts: [],
                selectedCategoryName: null,
                selectedPurchaseType: null,
            };

        case CLEAR_PROVIDER_PRODUCTS_DATA:
            return {
                ...state,
                categories: [],
                selectedCategoryProducts: [],
                selectedCategoryName: null,
                selectedPurchaseType: null,
            };

        default:
            return state;
    }
};
