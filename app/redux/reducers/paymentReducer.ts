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
    ROLLBACK_PAYMENT_SUCCESS,
    ROLLBACK_PAYMENT_FAIL,
    ROLLBACK_PAYMENT_REQUEST,
    INVALIDATE_PAYMENT_REQUEST,
    VERIFY_PAYMENT_REQUEST,
    VERIFY_PAYMENT_AND_SEND_TO_BALANCE_REQUEST,
    INVALIDATE_PAYMENT_FAIL,
    VERIFY_PAYMENT_FAIL,
    VERIFY_PAYMENT_AND_SEND_TO_BALANCE_FAIL,
    INVALIDATE_PAYMENT_SUCCESS,
    VERIFY_PAYMENT_SUCCESS,
    VERIFY_PAYMENT_AND_SEND_TO_BALANCE_SUCCESS,
} from "../constants/paymentConstants";
import { Pagination, Payment } from "@/types/interface";

export interface PaymentState {
    loading: boolean;
    payments: Payment[];
    error: string | null;
    pagination: Pagination | null
}

const initialState: PaymentState = {
    loading: false,
    payments: [],
    error: null,
    pagination: null
};

export const paymentReducer = (state = initialState, action: AnyAction): PaymentState => {
    switch (action.type) {
        case FETCH_PAYMENT_LIST_REQUEST:
        case ADD_PAYMENT_REQUEST:
        case EDIT_PAYMENT_REQUEST:
        case DELETE_PAYMENT_REQUEST:
        case ROLLBACK_PAYMENT_REQUEST:
        case INVALIDATE_PAYMENT_REQUEST:
        case VERIFY_PAYMENT_REQUEST:
        case VERIFY_PAYMENT_AND_SEND_TO_BALANCE_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_PAYMENT_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                payments: action.payload.data,
                pagination: action.payload.pagination,
                error: null,
            };

        case ADD_PAYMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                payments: [ action.payload,...state.payments],
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

        case ROLLBACK_PAYMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                payments: state.payments.map((payment) =>
                    payment.id === action.payload
                        ? { ...payment, status: 'rollback' }
                        : payment
                ),
                error: null,
            };

            case INVALIDATE_PAYMENT_SUCCESS:
                return {
                ...state,
                loading: false,
                payments: state.payments.map((payment) =>
                    payment.id === action.payload.paymentId
                        ? { ...payment, status: 'failed',notes:action.payload.notes }
                        : payment
                ),
                error: null,
            };
            case VERIFY_PAYMENT_SUCCESS:
            case VERIFY_PAYMENT_AND_SEND_TO_BALANCE_SUCCESS:
            return {
                ...state,
                loading: false,
                payments: state.payments.map((payment) =>
                    payment.id === action.payload.paymentId
                        ? { ...payment, status: 'completed',notes:action.payload.notes }
                        : payment
                ),
                error: null,
            };

        case FETCH_PAYMENT_LIST_FAIL:
        case ADD_PAYMENT_FAIL:
        case EDIT_PAYMENT_FAIL:
        case DELETE_PAYMENT_FAIL:
        case ROLLBACK_PAYMENT_FAIL:
        case INVALIDATE_PAYMENT_FAIL:
        case VERIFY_PAYMENT_FAIL:
        case VERIFY_PAYMENT_AND_SEND_TO_BALANCE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
