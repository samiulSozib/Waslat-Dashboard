

  export interface SuppliersState {
    loading: boolean;
    suppliers: Supplier[];
    error: string | null;
  }
import { Supplier } from '@/types/interface';
  import {
    FETCH_SUPPLIERS_REQUEST,
    FETCH_SUPPLIERS_SUCCESS,
    FETCH_SUPPLIERS_FAIL,
    ADD_SUPPLIER_REQUEST,
    ADD_SUPPLIER_SUCCESS,
    ADD_SUPPLIER_FAIL,
    EDIT_SUPPLIER_REQUEST,
    EDIT_SUPPLIER_SUCCESS,
    EDIT_SUPPLIER_FAIL,
    DELETE_SUPPLIER_REQUEST,
    DELETE_SUPPLIER_SUCCESS,
    DELETE_SUPPLIER_FAIL,
  } from '../constants/supplierConstants';

  const initialState: SuppliersState = {
    loading: false,
    suppliers: [],
    error: null,
  };

  export const suppliersReducer = (
    state = initialState,
    action: any
  ): SuppliersState => {
    switch (action.type) {
      case FETCH_SUPPLIERS_REQUEST:
      case ADD_SUPPLIER_REQUEST:
      case EDIT_SUPPLIER_REQUEST:
      case DELETE_SUPPLIER_REQUEST:
        return { ...state, loading: true, error: null };

      case FETCH_SUPPLIERS_SUCCESS:
        return { ...state, loading: false, suppliers: action.payload };

      case ADD_SUPPLIER_SUCCESS:
        return {
          ...state,
          loading: false,
          suppliers: [...state.suppliers, action.payload],
        };

      case EDIT_SUPPLIER_SUCCESS:
        return {
          ...state,
          loading: false,
          suppliers: state.suppliers.map((supplier) =>
            supplier.id === action.payload.id ? action.payload : supplier
          ),
        };

      case DELETE_SUPPLIER_SUCCESS:
        return {
          ...state,
          loading: false,
          suppliers: state.suppliers.filter(
            (supplier) => supplier.id !== action.payload
          ),
        };

      case FETCH_SUPPLIERS_FAIL:
      case ADD_SUPPLIER_FAIL:
      case EDIT_SUPPLIER_FAIL:
      case DELETE_SUPPLIER_FAIL:
        return { ...state, loading: false, error: action.payload };

      default:
        return state;
    }
  };
