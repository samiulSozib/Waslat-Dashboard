

  export interface PurchasedProductsState {
    loading: boolean;
    purchasedProducts: PurchasedProduct[];
    error: string | null;
  }
import { PurchasedProduct } from '@/types/interface';
  import {
    FETCH_PURCHASED_PRODUCTS_REQUEST,
    FETCH_PURCHASED_PRODUCTS_SUCCESS,
    FETCH_PURCHASED_PRODUCTS_FAIL,
    ADD_PURCHASED_PRODUCT_REQUEST,
    ADD_PURCHASED_PRODUCT_SUCCESS,
    ADD_PURCHASED_PRODUCT_FAIL,
    EDIT_PURCHASED_PRODUCT_REQUEST,
    EDIT_PURCHASED_PRODUCT_SUCCESS,
    EDIT_PURCHASED_PRODUCT_FAIL,
    DELETE_PURCHASED_PRODUCT_REQUEST,
    DELETE_PURCHASED_PRODUCT_SUCCESS,
    DELETE_PURCHASED_PRODUCT_FAIL,
  } from '../constants/purchasedProductsConstants';

  const initialState: PurchasedProductsState = {
    loading: false,
    purchasedProducts: [],
    error: null,
  };

  export const purchasedProductsReducer = (
    state = initialState,
    action: any
  ): PurchasedProductsState => {
    switch (action.type) {
      case FETCH_PURCHASED_PRODUCTS_REQUEST:
      case ADD_PURCHASED_PRODUCT_REQUEST:
      case EDIT_PURCHASED_PRODUCT_REQUEST:
      case DELETE_PURCHASED_PRODUCT_REQUEST:
        return { ...state, loading: true, error: null };

      case FETCH_PURCHASED_PRODUCTS_SUCCESS:
        return { ...state, loading: false, purchasedProducts: action.payload };

      case ADD_PURCHASED_PRODUCT_SUCCESS:
        return {
          ...state,
          loading: false,
          purchasedProducts: [...state.purchasedProducts, action.payload],
        };

      case EDIT_PURCHASED_PRODUCT_SUCCESS:
        return {
          ...state,
          loading: false,
          purchasedProducts: state.purchasedProducts.map((product) =>
            product.id === action.payload.id ? action.payload : product
          ),
        };

      case DELETE_PURCHASED_PRODUCT_SUCCESS:
        return {
          ...state,
          loading: false,
          purchasedProducts: state.purchasedProducts.filter(
            (product) => product.id !== action.payload
          ),
        };

      case FETCH_PURCHASED_PRODUCTS_FAIL:
      case ADD_PURCHASED_PRODUCT_FAIL:
      case EDIT_PURCHASED_PRODUCT_FAIL:
      case DELETE_PURCHASED_PRODUCT_FAIL:
        return { ...state, loading: false, error: action.payload };

      default:
        return state;
    }
  };
