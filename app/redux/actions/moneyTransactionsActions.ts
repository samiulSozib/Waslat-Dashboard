import { Dispatch } from "redux";
import axios from "axios";
import {
    FETCH_MONEY_TRANSACTIONS_LIST_REQUEST,
    FETCH_MONEY_TRANSACTIONS_LIST_SUCCESS,
    FETCH_MONEY_TRANSACTIONS_LIST_FAIL,
    ADD_MONEY_TRANSACTIONS_REQUEST,
    ADD_MONEY_TRANSACTIONS_SUCCESS,
    ADD_MONEY_TRANSACTIONS_FAIL,
    EDIT_MONEY_TRANSACTIONS_REQUEST,
    EDIT_MONEY_TRANSACTIONS_SUCCESS,
    EDIT_MONEY_TRANSACTIONS_FAIL,
    DELETE_MONEY_TRANSACTIONS_REQUEST,
    DELETE_MONEY_TRANSACTIONS_SUCCESS,
    DELETE_MONEY_TRANSACTIONS_FAIL,
} from "../constants/moneyTransactionConstants";
import { Toast } from "primereact/toast";
import { MoneyTransaction } from "@/types/interface";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

// Fetch Reseller Balance Transaction List
export const _fetchMoneyTransactionsList =
    (page: number = 1,search:string='',filters: any = {}) => async (dispatch: Dispatch) => {
        dispatch({ type: FETCH_MONEY_TRANSACTIONS_LIST_REQUEST });
        try {
            const token = getAuthToken();
            const queryParams = new URLSearchParams();

        queryParams.append('page', String(page));
        queryParams.append('search', search);


        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, String(value));
            }
        });


        const queryString = queryParams.toString();
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BASE_URL}/transactions?page=${page}&items_per_page=15&${queryString}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            dispatch({
                type: FETCH_MONEY_TRANSACTIONS_LIST_SUCCESS,
                payload: {
                    data: response.data.data.reseller_balance_transactions,
                    pagination: response.data.payload.pagination,
                },
            });

        } catch (error: any) {
            dispatch({
                type: FETCH_MONEY_TRANSACTIONS_LIST_FAIL,
                payload: error.message,
            });
        }
    };

// Add Reseller Balance Transaction
export const _addMoneyTransaction = (
    newTransactionData: MoneyTransaction,
    toast: React.RefObject<Toast>
) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_MONEY_TRANSACTIONS_REQUEST });
    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/transactions`,
            newTransactionData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        dispatch({
            type: ADD_MONEY_TRANSACTIONS_SUCCESS,
            payload: response.data.data.transaction,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Transaction added",
            life: 3000,
        });
    } catch (error: any) {
        dispatch({
            type: ADD_MONEY_TRANSACTIONS_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to add transaction",
            life: 3000,
        });
    }
};

// Edit Reseller Balance Transaction
export const _editMoneyTransaction = (
    transactionId: number,
    updatedTransactionData: MoneyTransaction,
    toast: React.RefObject<Toast>
) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_MONEY_TRANSACTIONS_REQUEST });
    try {
        const token = getAuthToken();
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}/transactions/${transactionId}`,
            updatedTransactionData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        dispatch({
            type: EDIT_MONEY_TRANSACTIONS_SUCCESS,
            payload: response.data.data.transaction,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Transaction edited",
            life: 3000,
        });
    } catch (error: any) {
        dispatch({
            type: EDIT_MONEY_TRANSACTIONS_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to edit transaction",
            life: 3000,
        });
    }
};

// Delete Reseller Balance Transaction
export const _deleteMoneyTransaction = (
    transactionId: number,
    toast: React.RefObject<Toast>
) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_MONEY_TRANSACTIONS_REQUEST });
    try {
        const token = getAuthToken();
        await axios.delete(
            `${process.env.NEXT_PUBLIC_BASE_URL}/transactions/${transactionId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        dispatch({
            type: DELETE_MONEY_TRANSACTIONS_SUCCESS,
            payload: transactionId,
        });
        toast.current?.show({
            severity: "success",
            summary: "Successful",
            detail: "Transaction deleted",
            life: 3000,
        });
    } catch (error: any) {
        dispatch({
            type: DELETE_MONEY_TRANSACTIONS_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: "error",
            summary: "Error",
            detail: "Failed to delete transaction",
            life: 3000,
        });
    }
};


export const _deleteSelectedTransactions = async (
  transactionIds: number[],
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => {
  const token = getAuthToken();

  try {
    for (const id of transactionIds) {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('TRANSACTIONS_DELETED'),
      life: 3000,
    });
  } catch (error: any) {
    toast.current?.show({
      severity: 'error',
      summary: t('ERROR'),
      detail: t('TRANSACTIONS_DELETE_FAILED'),
      life: 3000,
    });
  }
};
