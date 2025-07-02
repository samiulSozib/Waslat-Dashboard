import { Bundle, Pagination } from '@/types/interface';
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
  } from '../constants/bundleConstants';

  interface BundleState {
    bundles: Bundle[];
    loading: boolean;
    error: string | null;
    pagination: Pagination | null;
  }

  const initialState: BundleState = {
    bundles: [],
    loading: false,
    error: null,
    pagination: null,
  };

  const bundleReducer = (state = initialState, action: any): BundleState => {
    switch (action.type) {
      case FETCH_BUNDLE_LIST_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case FETCH_BUNDLE_LIST_SUCCESS:
        return {
          ...state,
          loading: false,
          bundles: action.payload.data,
          pagination: action.payload.pagination,
          error: null,
        };
      case FETCH_BUNDLE_LIST_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload.error,
        };
      case DELETE_BUNDLE_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case DELETE_BUNDLE_SUCCESS:
        return {
          ...state,
          loading: false,
          bundles: state.bundles.filter(bundle => bundle.id !== action.payload),
          error: null,
        };
      case DELETE_BUNDLE_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload.error,
        };
      case ADD_BUNDLE_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case ADD_BUNDLE_SUCCESS:
        return {
          ...state,
          loading: false,
          bundles: [...state.bundles, action.payload],
          error: null,
        };
      case ADD_BUNDLE_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload.error,
        };
      case EDIT_BUNDLE_REQUEST:
        return {
          ...state,
          loading: true,
        };
      case EDIT_BUNDLE_SUCCESS:
        return {
          ...state,
          loading: false,
          bundles: state.bundles.map(bundle =>
            bundle.id === action.payload.id ? { ...bundle, ...action.payload } : bundle
          ),
          error: null,
        };
      case EDIT_BUNDLE_FAIL:
        return {
          ...state,
          loading: false,
          error: action.payload.error,
        };
      default:
        return state;
    }
  };

  export default bundleReducer;
