import { Bundle, Pagination, PriceAdjustmentPreview } from '@/types/interface';
import {
    FETCH_BUNDLE_LIST_REQUEST,
    FETCH_BUNDLE_LIST_SUCCESS,
    FETCH_BUNDLE_LIST_FAIL,
    DELETE_BUNDLE_REQUEST,
    DELETE_BUNDLE_SUCCESS,
    DELETE_BUNDLE_FAIL,
    ADD_BUNDLE_REQUEST,
    ADD_BUNDLE_SUCCESS,
    ADD_BUNDLE_FAIL,
    EDIT_BUNDLE_REQUEST,
    EDIT_BUNDLE_SUCCESS,
    EDIT_BUNDLE_FAIL,
    SET_PROVIDER_REQUEST,
    SET_PROVIDER_SUCCESS,
    SET_PROVIDER_FAIL,
    UNSET_PROVIDER_REQUEST,
    UNSET_PROVIDER_SUCCESS,
    UNSET_PROVIDER_FAIL,
    BUNDLE_PRICE_ADJUSTMENT_PREVIEW_REQUEST,
    BUNDLE_PRICE_ADJUSTMENT_PREVIEW_SUCCESS,
    BUNDLE_PRICE_ADJUSTMENT_PREVIEW_FAIL,
    BUNDLE_PRICE_ADJUSTMENT_UPDATE_REQUEST,
    BUNDLE_PRICE_ADJUSTMENT_UPDATE_SUCCESS,
    BUNDLE_PRICE_ADJUSTMENT_UPDATE_FAIL,
    CLEAR_PRICE_ADJUSTMENT_PREVIEW,
    // Add new constants
    BULK_BUNDLE_PRICE_UPDATE_REQUEST,
    BULK_BUNDLE_PRICE_UPDATE_SUCCESS,
    BULK_BUNDLE_PRICE_UPDATE_FAIL
} from '../constants/bundleConstants';

interface BundleState {
    bundles: Bundle[];
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
    priceAdjustment: {
        previewLoading: boolean;
        updateLoading: boolean;
        previewData: PriceAdjustmentPreview[] | null;
        previewError: string | null;
        updateError: string | null;
    };
    // Add bulk update state
    bulkUpdate: {
        loading: boolean;
        error: string | null;
        result: any; // or define a proper type for the result
    };
}

const initialState: BundleState = {
    bundles: [],
    loading: false,
    error: null,
    pagination: null,
    priceAdjustment: {
        previewLoading: false,
        updateLoading: false,
        previewData: null,
        previewError: null,
        updateError: null
    },
    // Add bulk update initial state
    bulkUpdate: {
        loading: false,
        error: null,
        result: null
    }
};

const bundleReducer = (state = initialState, action: any): BundleState => {
    switch (action.type) {
        case FETCH_BUNDLE_LIST_REQUEST:
            return {
                ...state,
                loading: true
            };
        case FETCH_BUNDLE_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                bundles: action.payload.data,
                pagination: action.payload.pagination,
                error: null
            };
        case FETCH_BUNDLE_LIST_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload.error
            };
        case DELETE_BUNDLE_REQUEST:
            return {
                ...state,
                loading: true
            };
        case DELETE_BUNDLE_SUCCESS:
            return {
                ...state,
                loading: false,
                bundles: state.bundles.filter((bundle) => bundle.id !== action.payload),
                error: null
            };
        case DELETE_BUNDLE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload.error
            };
        case ADD_BUNDLE_REQUEST:
            return {
                ...state,
                loading: true
            };
        case ADD_BUNDLE_SUCCESS:
            return {
                ...state,
                loading: false,
                bundles: [...state.bundles, action.payload],
                error: null
            };
        case ADD_BUNDLE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload.error
            };
        case EDIT_BUNDLE_REQUEST:
            return {
                ...state,
                loading: true
            };
        case EDIT_BUNDLE_SUCCESS:
            return {
                ...state,
                loading: false,
                bundles: state.bundles.map((bundle) => (bundle.id === action.payload.id ? { ...bundle, ...action.payload } : bundle)),
                error: null
            };
        case EDIT_BUNDLE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload.error
            };

        case SET_PROVIDER_REQUEST:
        case UNSET_PROVIDER_REQUEST:
            return { ...state, loading: true };

        case SET_PROVIDER_SUCCESS:
        case UNSET_PROVIDER_SUCCESS:
            return {
                ...state,
                loading: false,
                bundles: state.bundles.map((bundle) => (bundle.id === action.payload.id ? { ...bundle, ...action.payload } : bundle)),
                error: null
            };

        case SET_PROVIDER_FAIL:
        case UNSET_PROVIDER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload
            };

        case BUNDLE_PRICE_ADJUSTMENT_PREVIEW_REQUEST:
            return {
                ...state,
                priceAdjustment: {
                    ...state.priceAdjustment,
                    previewLoading: true,
                    previewError: null
                }
            };
        
        case BUNDLE_PRICE_ADJUSTMENT_PREVIEW_SUCCESS:
            return {
                ...state,
                priceAdjustment: {
                    ...state.priceAdjustment,
                    previewLoading: false,
                    previewData: action.payload,
                    previewError: null
                }
            };
        
        case BUNDLE_PRICE_ADJUSTMENT_PREVIEW_FAIL:
            return {
                ...state,
                priceAdjustment: {
                    ...state.priceAdjustment,
                    previewLoading: false,
                    previewError: action.payload
                }
            };

        case BUNDLE_PRICE_ADJUSTMENT_UPDATE_REQUEST:
            return {
                ...state,
                priceAdjustment: {
                    ...state.priceAdjustment,
                    updateLoading: true,
                    updateError: null
                }
            };
        
        case BUNDLE_PRICE_ADJUSTMENT_UPDATE_SUCCESS:
            return {
                ...state,
                priceAdjustment: {
                    ...state.priceAdjustment,
                    updateLoading: false,
                    previewData: null, // Clear preview after successful update
                    updateError: null
                }
            };
        
        case BUNDLE_PRICE_ADJUSTMENT_UPDATE_FAIL:
            return {
                ...state,
                priceAdjustment: {
                    ...state.priceAdjustment,
                    updateLoading: false,
                    updateError: action.payload
                }
            };

        case CLEAR_PRICE_ADJUSTMENT_PREVIEW:
            return {
                ...state,
                priceAdjustment: {
                    ...state.priceAdjustment,
                    previewData: null,
                    previewError: null,
                    updateError: null
                }
            };

        // Bulk Bundle Price Update Cases
        case BULK_BUNDLE_PRICE_UPDATE_REQUEST:
            return {
                ...state,
                bulkUpdate: {
                    ...state.bulkUpdate,
                    loading: true,
                    error: null
                }
            };
        
        case BULK_BUNDLE_PRICE_UPDATE_SUCCESS:
            return {
                ...state,
                bulkUpdate: {
                    ...state.bulkUpdate,
                    loading: false,
                    result: action.payload,
                    error: null
                },
                
            };
        
        case BULK_BUNDLE_PRICE_UPDATE_FAIL:
            return {
                ...state,
                bulkUpdate: {
                    ...state.bulkUpdate,
                    loading: false,
                    error: action.payload
                }
            };

        default:
            return state;
    }
};

export default bundleReducer;