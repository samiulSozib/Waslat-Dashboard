




  import { PaymentType } from "@/types/interface";
import {
    FETCH_PAYMENT_TYPE_LIST_REQUEST,
    FETCH_PAYMENT_TYPE_LIST_SUCCESS,
    FETCH_PAYMENT_TYPE_LIST_FAIL,
    DELETE_PAYMENT_TYPE_REQUEST,
    DELETE_PAYMENT_TYPE_SUCCESS,
    DELETE_PAYMENT_TYPE_FAIL,
    ADD_PAYMENT_TYPE_REQUEST,
    ADD_PAYMENT_TYPE_SUCCESS,
    ADD_PAYMENT_TYPE_FAIL,
    EDIT_PAYMENT_TYPE_REQUEST,
    EDIT_PAYMENT_TYPE_SUCCESS,
    EDIT_PAYMENT_TYPE_FAIL,
  } from "../constants/paymentTypeConstants";

  export interface PaymentTypeState {
    loading: boolean;
    payment_types: PaymentType[];
    error: string | null;
  }

  const initialState: PaymentTypeState = {
    loading: false,
    payment_types: [],
    error: null,
  };

  export const paymentTypesReducer = (
    state = initialState,
    action: any
  ): PaymentTypeState => {
    switch (action.type) {
      case FETCH_PAYMENT_TYPE_LIST_REQUEST:
      case ADD_PAYMENT_TYPE_REQUEST:
      case EDIT_PAYMENT_TYPE_REQUEST:
      case DELETE_PAYMENT_TYPE_REQUEST:
        return { ...state, loading: true, error: null };

      case FETCH_PAYMENT_TYPE_LIST_SUCCESS:
        return { ...state, loading: false, payment_types: action.payload };

      case ADD_PAYMENT_TYPE_SUCCESS:
        return {
          ...state,
          loading: false,
          payment_types: [...state.payment_types, action.payload],
        };

      case EDIT_PAYMENT_TYPE_SUCCESS:
        return {
          ...state,
          loading: false,
          payment_types: state.payment_types.map((TYPE) =>
            TYPE.id === action.payload.id ? action.payload : TYPE
          ),
        };

      case DELETE_PAYMENT_TYPE_SUCCESS:
        return {
          ...state,
          loading: false,
          payment_types: state.payment_types.filter(
            (TYPE) => TYPE.id !== action.payload
          ),
        };

      case FETCH_PAYMENT_TYPE_LIST_FAIL:
      case ADD_PAYMENT_TYPE_FAIL:
      case EDIT_PAYMENT_TYPE_FAIL:
      case DELETE_PAYMENT_TYPE_FAIL:
        return { ...state, loading: false, error: action.payload };

      default:
        return state;
    }
  };
