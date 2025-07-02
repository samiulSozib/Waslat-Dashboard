// reducer.ts
import { MoneyTransaction, Pagination } from '@/types/interface';
import {
    FETCH_MONEY_TRANSACTIONS_LIST_REQUEST,
    FETCH_MONEY_TRANSACTIONS_LIST_SUCCESS,
    FETCH_MONEY_TRANSACTIONS_LIST_FAIL,
    DELETE_MONEY_TRANSACTIONS_REQUEST,
    DELETE_MONEY_TRANSACTIONS_SUCCESS,
    DELETE_MONEY_TRANSACTIONS_FAIL,
    ADD_MONEY_TRANSACTIONS_REQUEST,
    ADD_MONEY_TRANSACTIONS_SUCCESS,
    ADD_MONEY_TRANSACTIONS_FAIL,
    EDIT_MONEY_TRANSACTIONS_REQUEST,
    EDIT_MONEY_TRANSACTIONS_SUCCESS,
    EDIT_MONEY_TRANSACTIONS_FAIL
  } from '../constants/moneyTransactionConstants';




  // Define initial state
  interface TransactionState {
    transactions: MoneyTransaction[];
    loading: boolean;
    error: string | null;
    pagination:Pagination|null
  }

  const initialState: TransactionState = {
    transactions: [],
    loading: false,
    error: null,
    pagination:null
  };

  // Reducer function
  export const moneyTransactionReducer = (state = initialState, action: any): TransactionState => {
    switch (action.type) {
      case FETCH_MONEY_TRANSACTIONS_LIST_REQUEST:
        return { ...state, loading: true };

      case FETCH_MONEY_TRANSACTIONS_LIST_SUCCESS:
        return { ...state, loading: false, transactions: action.payload.data,pagination: action.payload.pagination };

      case FETCH_MONEY_TRANSACTIONS_LIST_FAIL:
        return { ...state, loading: false, error: action.payload };

      case DELETE_MONEY_TRANSACTIONS_REQUEST:
        return { ...state, loading: true };

      case DELETE_MONEY_TRANSACTIONS_SUCCESS:
        return {
          ...state,
          loading: false,
          transactions: state.transactions.filter(
            (transaction) => transaction.id !== action.payload
          ),
        };

      case DELETE_MONEY_TRANSACTIONS_FAIL:
        return { ...state, loading: false, error: action.payload };

      case ADD_MONEY_TRANSACTIONS_REQUEST:
        return { ...state, loading: true };

      case ADD_MONEY_TRANSACTIONS_SUCCESS:
        return {
          ...state,
          loading: false,
          transactions: [...state.transactions, action.payload],
        };

      case ADD_MONEY_TRANSACTIONS_FAIL:
        return { ...state, loading: false, error: action.payload };

      case EDIT_MONEY_TRANSACTIONS_REQUEST:
        return { ...state, loading: true };

      case EDIT_MONEY_TRANSACTIONS_SUCCESS:
        return {
          ...state,
          loading: false,
          transactions: state.transactions.map((transaction) =>
            transaction.id === action.payload.id ? action.payload : transaction
          ),
        };

      case EDIT_MONEY_TRANSACTIONS_FAIL:
        return { ...state, loading: false, error: action.payload };

      default:
        return state;
    }
  };
