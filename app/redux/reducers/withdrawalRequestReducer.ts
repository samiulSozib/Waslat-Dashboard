import {
  FETCH_WITHDRAW_REQUESTS_REQUEST,
  FETCH_WITHDRAW_REQUESTS_SUCCESS,
  FETCH_WITHDRAW_REQUESTS_FAILURE,
  CREATE_WITHDRAW_REQUEST_REQUEST,
  CREATE_WITHDRAW_REQUEST_SUCCESS,
  CREATE_WITHDRAW_REQUEST_FAILURE,
  UPDATE_WITHDRAW_STATUS_REQUEST,
  UPDATE_WITHDRAW_STATUS_SUCCESS,
  UPDATE_WITHDRAW_STATUS_FAILURE,
  SET_WITHDRAW_FILTERS,
  CLEAR_WITHDRAW_FILTERS,
} from "../constants/withdrawalRequestConstants";
import { WithdrawRequest } from "@/types/interface";
import { Pagination } from "@/types/interface";

export interface WithdrawRequestsState {
  withdrawRequests: WithdrawRequest[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  filters: {
    status?: string;
    reseller_id?: number;
    currency_id?: number;
    start_date?: string;
    end_date?: string;
  };
}

const initialState: WithdrawRequestsState = {
  withdrawRequests: [],
  loading: false,
  error: null,
  pagination: null,
  filters: {},
};

export const withdrawRequestsReducer = (
  state = initialState,
  action: any
): WithdrawRequestsState => {
  switch (action.type) {
    case FETCH_WITHDRAW_REQUESTS_REQUEST:
    case CREATE_WITHDRAW_REQUEST_REQUEST:
    case UPDATE_WITHDRAW_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_WITHDRAW_REQUESTS_SUCCESS:
      return {
        ...state,
        loading: false,
        withdrawRequests: action.payload.data,
        pagination: action.payload.pagination,
        error: null,
      };

    case CREATE_WITHDRAW_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        withdrawRequests: [action.payload, ...state.withdrawRequests],
        error: null,
      };

    case UPDATE_WITHDRAW_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        withdrawRequests: state.withdrawRequests.map((request) =>
          request.id === action.payload.id ? { ...request, ...action.payload } : request
        ),
        error: null,
      };

    case FETCH_WITHDRAW_REQUESTS_FAILURE:
    case CREATE_WITHDRAW_REQUEST_FAILURE:
    case UPDATE_WITHDRAW_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case SET_WITHDRAW_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case CLEAR_WITHDRAW_FILTERS:
      return {
        ...state,
        filters: {},
      };

    default:
      return state;
  }
};