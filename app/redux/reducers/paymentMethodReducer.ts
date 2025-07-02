




import { PaymentMethod } from "@/types/interface";
  import {
    FETCH_PAYMENT_METHOD_LIST_REQUEST,
    FETCH_PAYMENT_METHOD_LIST_SUCCESS,
    FETCH_PAYMENT_METHOD_LIST_FAIL,
    DELETE_PAYMENT_METHOD_REQUEST,
    DELETE_PAYMENT_METHOD_SUCCESS,
    DELETE_PAYMENT_METHOD_FAIL,
    ADD_PAYMENT_METHOD_REQUEST,
    ADD_PAYMENT_METHOD_SUCCESS,
    ADD_PAYMENT_METHOD_FAIL,
    EDIT_PAYMENT_METHOD_REQUEST,
    EDIT_PAYMENT_METHOD_SUCCESS,
    EDIT_PAYMENT_METHOD_FAIL,
  } from "../constants/paymentMethodConstants";

  export interface PaymentMethodsState {
    loading: boolean;
    paymentMethods: PaymentMethod[];
    error: string | null;
  }

  const initialState: PaymentMethodsState = {
    loading: false,
    paymentMethods: [],
    error: null,
  };

  export const paymentMethodsReducer = (
    state = initialState,
    action: any
  ): PaymentMethodsState => {
    switch (action.type) {
      case FETCH_PAYMENT_METHOD_LIST_REQUEST:
      case ADD_PAYMENT_METHOD_REQUEST:
      case EDIT_PAYMENT_METHOD_REQUEST:
      case DELETE_PAYMENT_METHOD_REQUEST:
        return { ...state, loading: true, error: null };

      case FETCH_PAYMENT_METHOD_LIST_SUCCESS:
        return { ...state, loading: false, paymentMethods: action.payload };

      case ADD_PAYMENT_METHOD_SUCCESS:
        return {
          ...state,
          loading: false,
          paymentMethods: [...state.paymentMethods, action.payload],
        };

      case EDIT_PAYMENT_METHOD_SUCCESS:
        return {
          ...state,
          loading: false,
          paymentMethods: state.paymentMethods.map((method) =>
            method.id === action.payload.id ? action.payload : method
          ),
        };

      case DELETE_PAYMENT_METHOD_SUCCESS:
        return {
          ...state,
          loading: false,
          paymentMethods: state.paymentMethods.filter(
            (method) => method.id !== action.payload
          ),
        };

      case FETCH_PAYMENT_METHOD_LIST_FAIL:
      case ADD_PAYMENT_METHOD_FAIL:
      case EDIT_PAYMENT_METHOD_FAIL:
      case DELETE_PAYMENT_METHOD_FAIL:
        return { ...state, loading: false, error: action.payload };

      default:
        return state;
    }
  };
