import { AnyAction } from "redux";
import {
    FETCH_PAYMENT_LIST_REQUEST,
    FETCH_PAYMENT_LIST_SUCCESS,
    FETCH_PAYMENT_LIST_FAIL,
    ADD_PAYMENT_REQUEST,
    ADD_PAYMENT_SUCCESS,
    ADD_PAYMENT_FAIL,
    EDIT_PAYMENT_REQUEST,
    EDIT_PAYMENT_SUCCESS,
    EDIT_PAYMENT_FAIL,
    DELETE_PAYMENT_REQUEST,
    DELETE_PAYMENT_SUCCESS,
    DELETE_PAYMENT_FAIL,
} from "../constants/paymentConstants";
import { Payment } from "@/types/interface";

export interface PaymentState {
    loading: boolean;
    payments: Payment[];
    error: string | null;
  }

const initialState: PaymentState = {
    loading: false,
    payments: [],
    error: null,
};

export const paymentReducer = (state = initialState, action: AnyAction): PaymentState => {
    switch (action.type) {
        case FETCH_PAYMENT_LIST_REQUEST:
        case ADD_PAYMENT_REQUEST:
        case EDIT_PAYMENT_REQUEST:
        case DELETE_PAYMENT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_PAYMENT_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                payments: action.payload,
                error: null,
            };

        case ADD_PAYMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                payments: [...state.payments, action.payload],
                error: null,
            };

        case EDIT_PAYMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                payments: state.payments.map(payment =>
                    payment.id === action.payload.id ? action.payload : payment
                ),
                error: null,
            };

        case DELETE_PAYMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                payments: state.payments.filter(payment => payment.id !== action.payload),
                error: null,
            };

        case FETCH_PAYMENT_LIST_FAIL:
        case ADD_PAYMENT_FAIL:
        case EDIT_PAYMENT_FAIL:
        case DELETE_PAYMENT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
