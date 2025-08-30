import { Order, Pagination } from '@/types/interface';
// import {
//     FETCH_ORDERS_REQUEST,
//     FETCH_ORDERS_SUCCESS,
//     FETCH_ORDERS_FAIL,
//     ADD_ORDER_REQUEST,
//     ADD_ORDER_SUCCESS,
//     ADD_ORDER_FAIL,
//     EDIT_ORDER_REQUEST,
//     EDIT_ORDER_SUCCESS,
//     EDIT_ORDER_FAIL,
//     DELETE_ORDER_REQUEST,
//     DELETE_ORDER_SUCCESS,
//     DELETE_ORDER_FAIL
// } from '../constants/orderConstants';


// interface OrderState {
//     loading: boolean;
//     orders: Order[];
//     error: string | null;
//     pagination: Pagination | null;
// }

// const initialState: OrderState = {
//     loading: false,
//     orders: [],
//     error: null,
//     pagination: null,
// };

// export const orderReducer = (state = initialState, action: any): OrderState => {
//     switch (action.type) {
//         case FETCH_ORDERS_REQUEST:
//         case ADD_ORDER_REQUEST:
//         case EDIT_ORDER_REQUEST:
//         case DELETE_ORDER_REQUEST:
//             return {
//                 ...state,
//                 loading: true,
//                 error: null,
//             };

//         case FETCH_ORDERS_SUCCESS:
//             return {
//                 ...state,
//                 loading: false,
//                 orders: action.payload.data,
//                 pagination: action.payload.pagination,
//                 error: null,
//             };

//         case ADD_ORDER_SUCCESS:
//             return {
//                 ...state,
//                 loading: false,
//                 orders: [action.payload, ...state.orders],
//                 error: null,
//             };

//         case EDIT_ORDER_SUCCESS:
//             return {
//                 ...state,
//                 loading: false,
//                 orders: state.orders.map((order) =>
//                     order.id === action.payload.id ? action.payload : order
//                 ),
//                 error: null,
//             };

//         case DELETE_ORDER_SUCCESS:
//             return {
//                 ...state,
//                 loading: false,
//                 orders: state.orders.filter((order) => order.id !== action.payload),
//                 error: null,
//             };

//         case FETCH_ORDERS_FAIL:
//         case ADD_ORDER_FAIL:
//         case EDIT_ORDER_FAIL:
//         case DELETE_ORDER_FAIL:
//             return {
//                 ...state,
//                 loading: false,
//                 error: action.payload,
//             };

//         default:
//             return state;
//     }
// };

import {
    FETCH_ORDERS_REQUEST,
    FETCH_ORDERS_SUCCESS,
    FETCH_ORDERS_FAIL,
    ADD_ORDER_REQUEST,
    ADD_ORDER_SUCCESS,
    ADD_ORDER_FAIL,
    EDIT_ORDER_REQUEST,
    EDIT_ORDER_SUCCESS,
    EDIT_ORDER_FAIL,
    DELETE_ORDER_REQUEST,
    DELETE_ORDER_SUCCESS,
    DELETE_ORDER_FAIL,
    CHANGE_ORDER_STATUS_REQUEST,
    CHANGE_ORDER_STATUS_SUCCESS,
    CHANGE_ORDER_STATUS_FAIL,
} from '../constants/orderConstants';


interface OrderState {
    loading: boolean;
    orders: Order[];
    error: string | null;
    pagination: Pagination | null;
}

const initialState: OrderState = {
    loading: false,
    orders: [],
    error: null,
    pagination: null,
};

export const orderReducer = (state = initialState, action: any): OrderState => {
    switch (action.type) {
        case FETCH_ORDERS_REQUEST:
        case ADD_ORDER_REQUEST:
        case EDIT_ORDER_REQUEST:
        case DELETE_ORDER_REQUEST:
        case CHANGE_ORDER_STATUS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_ORDERS_SUCCESS:
            return {
                ...state,
                loading: false,
                orders: action.payload.data,
                pagination: action.payload.pagination,
                error: null,
            };

        case ADD_ORDER_SUCCESS:
            return {
                ...state,
                loading: false,
                orders: [action.payload, ...state.orders],
                error: null,
            };

        case EDIT_ORDER_SUCCESS:
            return {
                ...state,
                loading: false,
                orders: state.orders.map((order) =>
                    order.id === action.payload.id ? action.payload : order
                ),
                error: null,
            };

        case DELETE_ORDER_SUCCESS:
            return {
                ...state,
                loading: false,
                orders: state.orders.filter((order) => order.id !== action.payload),
                error: null,
            };

        case CHANGE_ORDER_STATUS_SUCCESS:
            return {
                ...state,
                loading: false,
                orders: state.orders.map((order) =>
                    order.id === action.payload.orderId
                        ? {
                            ...order,
                            status: action.payload.status,
                            ...(action.payload.status === 2 && {
                                reject_reason: action.payload.rejectedReason || '',
                            }),
                        }
                        : order
                ),
                error: null,
            };


        case FETCH_ORDERS_FAIL:
        case ADD_ORDER_FAIL:
        case EDIT_ORDER_FAIL:
        case DELETE_ORDER_FAIL:
        case CHANGE_ORDER_STATUS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
