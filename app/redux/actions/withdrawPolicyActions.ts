import { Dispatch } from "redux";
import axios from "axios";
import { Toast } from "primereact/toast";
import { 
  FETCH_WITHDRAW_POLICIES_REQUEST,
  FETCH_WITHDRAW_POLICIES_SUCCESS,
  FETCH_WITHDRAW_POLICIES_FAILURE,
  ADD_WITHDRAW_POLICY_REQUEST,
  ADD_WITHDRAW_POLICY_SUCCESS,
  ADD_WITHDRAW_POLICY_FAIL,
  EDIT_WITHDRAW_POLICY_REQUEST,
  EDIT_WITHDRAW_POLICY_SUCCESS,
  EDIT_WITHDRAW_POLICY_FAIL,
  DELETE_WITHDRAW_POLICY_REQUEST,
  DELETE_WITHDRAW_POLICY_SUCCESS,
  DELETE_WITHDRAW_POLICY_FAIL
} from "../constants/withdrawalPolicyConstants";
import { WithdrawalPolicy } from "@/types/interface";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || "";
};

// Fetch Withdrawal Policies
export const fetchWithdrawPolicies = (page: number = 1, currencyId?: number) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_WITHDRAW_POLICIES_REQUEST });

  try {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();

    queryParams.append('page', String(page));
    
    if (currencyId) {
      queryParams.append('currency_id', String(currencyId));
    }

    const queryString = queryParams.toString();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/withdrawal-policies`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({ 
      type: FETCH_WITHDRAW_POLICIES_SUCCESS, 
      payload: { 
        data: response.data.data.policies, 
        pagination: response.data.payload?.pagination || null 
      } 
    });

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch withdrawal policies";
    dispatch({ type: FETCH_WITHDRAW_POLICIES_FAILURE, payload: errorMessage });
  }
};

// Add a Withdrawal Policy
export const addWithdrawPolicy = (
  data: Omit<WithdrawalPolicy, 'id' | 'created_at' | 'updated_at' | 'currency'>,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_WITHDRAW_POLICY_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/withdrawal-policies`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const newData = {
            ...data,
            id: response.data.data.policy.id
        };

    dispatch({ type: ADD_WITHDRAW_POLICY_SUCCESS, payload: newData });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("WITHDRAWAL_POLICY_ADDED_SUCCESSFULLY"),
      life: 3000,
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to add withdrawal policy";
    dispatch({ type: ADD_WITHDRAW_POLICY_FAIL, payload: errorMessage });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("WITHDRAWAL_POLICY_ADD_FAILED"),
      life: 3000,
    });
  }
};

// Edit a Withdrawal Policy
export const editWithdrawPolicy = (
  id: number,
  data: Partial<WithdrawalPolicy>,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_WITHDRAW_POLICY_REQUEST });

  try {
    console.log(data)
    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/withdrawal-policies/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const newData = {
            ...data,
            id: response.data.data.policy.id
        };

    dispatch({ type: EDIT_WITHDRAW_POLICY_SUCCESS, payload: newData });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("WITHDRAWAL_POLICY_UPDATED_SUCCESSFULLY"),
      life: 3000,
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update withdrawal policy";
    dispatch({ type: EDIT_WITHDRAW_POLICY_FAIL, payload: errorMessage });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("WITHDRAWAL_POLICY_UPDATE_FAILED"),
      life: 3000,
    });
  }
};

// Delete a Withdrawal Policy
export const deleteWithdrawPolicy = (
  id: number,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_WITHDRAW_POLICY_REQUEST });

  try {
    const token = getAuthToken();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/withdrawal-policies/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({ type: DELETE_WITHDRAW_POLICY_SUCCESS, payload: id });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("WITHDRAWAL_POLICY_DELETED_SUCCESSFULLY"),
      life: 3000,
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to delete withdrawal policy";
    dispatch({ type: DELETE_WITHDRAW_POLICY_FAIL, payload: errorMessage });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("WITHDRAWAL_POLICY_DELETE_FAILED"),
      life: 3000,
    });
  }
};