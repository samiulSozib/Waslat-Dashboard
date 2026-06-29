import {
    FETCH_VOUCHER_LIST_REQUEST,
    FETCH_VOUCHER_LIST_SUCCESS,
    FETCH_VOUCHER_LIST_FAIL,
    FETCH_VOUCHER_REQUEST,
    FETCH_VOUCHER_SUCCESS,
    FETCH_VOUCHER_FAIL,
    ADD_VOUCHER_REQUEST,
    ADD_VOUCHER_SUCCESS,
    ADD_VOUCHER_FAIL,
    EDIT_VOUCHER_REQUEST,
    EDIT_VOUCHER_SUCCESS,
    EDIT_VOUCHER_FAIL,
    DELETE_VOUCHER_REQUEST,
    DELETE_VOUCHER_SUCCESS,
    DELETE_VOUCHER_FAIL,
    BULK_IMPORT_VOUCHERS_REQUEST,
    BULK_IMPORT_VOUCHERS_SUCCESS,
    BULK_IMPORT_VOUCHERS_FAIL,
    FETCH_SOCIAL_COMPANIES_REQUEST,
    FETCH_SOCIAL_COMPANIES_SUCCESS,
    FETCH_SOCIAL_COMPANIES_FAIL,
    FETCH_BUNDLE_STATS_REQUEST,
    FETCH_BUNDLE_STATS_SUCCESS,
    FETCH_BUNDLE_STATS_FAIL,
    CLEAR_VOUCHER_STATE,
    CLEAR_BULK_IMPORT_STATE,
} from '../constants/voucherConstants';
import {
    VoucherState,
    Voucher,
    VoucherStatistics,
    VoucherPagination,
    SocialCompany,
    BundleStat,
    BulkImportState,
} from '@/types/interface';

const initialBulkImportState: BulkImportState = {
    loading: false,
    success: false,
    error: null,
    summary: null,
};

const initialState: VoucherState = {
    vouchers: [],
    currentVoucher: null,
    statistics: null,
    pagination: null,
    socialCompanies: [],
    bundleStats: [],
    loading: false,
    error: null,
    bulkImport: initialBulkImportState,
};

const voucherReducer = (state = initialState, action: any): VoucherState => {
    switch (action.type) {
        // ============================
        // Voucher List
        // ============================
        case FETCH_VOUCHER_LIST_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_VOUCHER_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                vouchers: action.payload.data,
                statistics: action.payload.statistics,
                pagination: action.payload.pagination,
                error: null,
            };

        case FETCH_VOUCHER_LIST_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // ============================
        // Single Voucher
        // ============================
        case FETCH_VOUCHER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_VOUCHER_SUCCESS:
            return {
                ...state,
                loading: false,
                currentVoucher: action.payload,
                error: null,
            };

        case FETCH_VOUCHER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // ============================
        // Create Voucher
        // ============================
        case ADD_VOUCHER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case ADD_VOUCHER_SUCCESS:
            return {
                ...state,
                loading: false,
                vouchers: [action.payload, ...state.vouchers],
                error: null,
            };

        case ADD_VOUCHER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // ============================
        // Update Voucher
        // ============================
        case EDIT_VOUCHER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case EDIT_VOUCHER_SUCCESS:
            return {
                ...state,
                loading: false,
                vouchers: state.vouchers.map((voucher: Voucher) =>
                    voucher.id === action.payload.id ? action.payload : voucher
                ),
                currentVoucher: action.payload,
                error: null,
            };

        case EDIT_VOUCHER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // ============================
        // Delete Voucher
        // ============================
        case DELETE_VOUCHER_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case DELETE_VOUCHER_SUCCESS:
            return {
                ...state,
                loading: false,
                vouchers: state.vouchers.filter((voucher: Voucher) => voucher.id !== action.payload),
                error: null,
            };

        case DELETE_VOUCHER_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // ============================
        // Bulk Import
        // ============================
        case BULK_IMPORT_VOUCHERS_REQUEST:
            return {
                ...state,
                bulkImport: {
                    ...state.bulkImport,
                    loading: true,
                    error: null,
                    success: false,
                },
            };

        case BULK_IMPORT_VOUCHERS_SUCCESS:
            return {
                ...state,
                bulkImport: {
                    loading: false,
                    success: true,
                    error: null,
                    summary: action.payload.summary,
                },
                vouchers: [...action.payload.vouchers, ...state.vouchers],
            };

        case BULK_IMPORT_VOUCHERS_FAIL:
            return {
                ...state,
                bulkImport: {
                    ...state.bulkImport,
                    loading: false,
                    success: false,
                    error: action.payload,
                },
            };

        // ============================
        // Social Companies
        // ============================
        case FETCH_SOCIAL_COMPANIES_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_SOCIAL_COMPANIES_SUCCESS:
            return {
                ...state,
                loading: false,
                socialCompanies: action.payload,
                error: null,
            };

        case FETCH_SOCIAL_COMPANIES_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // ============================
        // Bundle Stats
        // ============================
        case FETCH_BUNDLE_STATS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_BUNDLE_STATS_SUCCESS:
            return {
                ...state,
                loading: false,
                bundleStats: action.payload,
                error: null,
            };

        case FETCH_BUNDLE_STATS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        // ============================
        // Clear State
        // ============================
        case CLEAR_VOUCHER_STATE:
            return {
                ...initialState,
                socialCompanies: state.socialCompanies,
                bundleStats: state.bundleStats,
            };

        case CLEAR_BULK_IMPORT_STATE:
            return {
                ...state,
                bulkImport: initialBulkImportState,
            };

        default:
            return state;
    }
};

export default voucherReducer;
