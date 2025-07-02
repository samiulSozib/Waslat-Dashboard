import { EarningBalance } from '@/types/interface';
import {
  FETCH_EARNING_BALANCE_LIST_REQUEST,
  FETCH_EARNING_BALANCE_LIST_SUCCESS,
  FETCH_EARNING_BALANCE_LIST_FAIL,
  ADD_EARNING_BALANCE_REQUEST,
  ADD_EARNING_BALANCE_SUCCESS,
  ADD_EARNING_BALANCE_FAIL,
  CHANGE_STATUS_EARNING_BALANCE_REQUEST,
  CHANGE_STATUS_EARNING_BALANCE_SUCCESS,
  CHANGE_STATUS_EARNING_BALANCE_FAIL
} from '../constants/earningBalanceConstants';



interface EarningBalanceState {
  loading: boolean;
  earningBalances: EarningBalance[];
  error: string | null;
}

const initialState: EarningBalanceState = {
  loading: false,
  earningBalances: [],
  error: null,
};

export const earningBalanceReducer = (state = initialState, action: any): EarningBalanceState => {
  switch (action.type) {
    case FETCH_EARNING_BALANCE_LIST_REQUEST:
    case ADD_EARNING_BALANCE_REQUEST:
    case CHANGE_STATUS_EARNING_BALANCE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_EARNING_BALANCE_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        earningBalances: action.payload.data,
        error: null,
      };

    case ADD_EARNING_BALANCE_SUCCESS:
      return {
        ...state,
        loading: false,
        earningBalances: [...state.earningBalances, action.payload],
        error: null,
      };

    case CHANGE_STATUS_EARNING_BALANCE_SUCCESS:
      return {
        ...state,
        loading: false,
        earningBalances: state.earningBalances.map((balance) =>
          balance.id === action.payload.request_id
            ? {
                ...balance,
                status: action.payload.status,
                reviewed_at: new Date().toISOString(), // Update reviewed time
                // You might want to add other updated fields here
              }
            : balance
        ),
        error: null,
      };

    case FETCH_EARNING_BALANCE_LIST_FAIL:
    case ADD_EARNING_BALANCE_FAIL:
    case CHANGE_STATUS_EARNING_BALANCE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
