import { Dispatch } from "redux";
import axios from "axios";
import { Toast } from "primereact/toast";
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
  CLEAR_WITHDRAW_FILTERS
} from "../constants/withdrawalRequestConstants";
import { WithdrawRequest } from "@/types/interface";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || "";
};

interface WithdrawFilters {
  status?: string;
  reseller_id?: number;
  currency_id?: number;
  start_date?: string;
  end_date?: string;
}

// Fetch Withdraw Requests with filters
export const fetchWithdrawRequests = (
  page: number = 1,
  filters?: WithdrawFilters
) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_WITHDRAW_REQUESTS_REQUEST });

  try {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();

    queryParams.append('page', String(page));
    
    // Add filters if present
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/withdraw-requests${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ 
      type: FETCH_WITHDRAW_REQUESTS_SUCCESS, 
      payload: { 
        data: response.data.data.withdraw_requests || response.data.data || response.data,
        pagination: response.data.pagination || response.data.meta?.pagination || null
      } 
    });

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch withdraw requests";
    dispatch({ type: FETCH_WITHDRAW_REQUESTS_FAILURE, payload: errorMessage });
  }
};

// Create Withdraw Request (Admin)
export const createWithdrawRequest = (
  data: {
    reseller_id: number;
    currency_id: number;
    amount: number;
    net_amount?: number;
    commission_amount?: number;
    admin_note?: string;
    bank_details?: {
      bank_name?: string;
      account_holder_name?: string;
      account_number?: string;
      iban?: string;
      branch?: string;
      swift_code?: string;
    }
  },
  toast: React.RefObject<Toast>,
  t: (key: string) => string,
  onSuccess?: () => void
) => async (dispatch: Dispatch) => {
  dispatch({ type: CREATE_WITHDRAW_REQUEST_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/withdraw-requests`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    dispatch({ 
      type: CREATE_WITHDRAW_REQUEST_SUCCESS, 
      payload: response.data.data 
    });
    
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("WITHDRAW_REQUEST_CREATED_SUCCESSFULLY"),
      life: 3000,
    });

    if (onSuccess) onSuccess();

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to create withdraw request";
    dispatch({ type: CREATE_WITHDRAW_REQUEST_FAILURE, payload: errorMessage });
    
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage || t("WITHDRAW_REQUEST_CREATE_FAILED"),
      life: 3000,
    });
  }
};

// Update Withdraw Request Status (Approve/Reject)
export const updateWithdrawStatus = (
  id: number,
  status: string,
  admin_note?: string,
  toast?: React.RefObject<Toast>,
  t?: (key: string) => string,
  onSuccess?: () => void
) => async (dispatch: Dispatch) => {
  dispatch({ type: UPDATE_WITHDRAW_STATUS_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URL}/withdraw-requests/${id}/update-status`,
      { status, admin_note },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    dispatch({ 
      type: UPDATE_WITHDRAW_STATUS_SUCCESS, 
      payload: response.data.data 
    });
    
    if (toast && t) {
      //const statusText = status === 1 ? t("APPROVED") : t("REJECTED");
      toast.current?.show({
        severity: "success",
        summary: t("SUCCESS"),
        detail: `${t("WITHDRAW_REQUEST")} ${status} ${t("SUCCESSFULLY")}`,
        life: 3000,
      });
    }

    if (onSuccess) onSuccess();

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update withdraw status";
    dispatch({ type: UPDATE_WITHDRAW_STATUS_FAILURE, payload: errorMessage });
    
    if (toast && t) {
      toast.current?.show({
        severity: "error",
        summary: t("ERROR"),
        detail: errorMessage || t("WITHDRAW_STATUS_UPDATE_FAILED"),
        life: 3000,
      });
    }
  }
};

// Update Withdraw Request (Full update)
export const updateWithdrawRequest = (
  id: number,
  data: Partial<{
    amount: number;
    net_amount: number;
    commission_amount: number;
    admin_note: string;
    bank_details: {
      bank_name?: string;
      account_holder_name?: string;
      account_number?: string;
      iban?: string;
      branch?: string;
      swift_code?: string;
    }
  }>,
  toast: React.RefObject<Toast>,
  t: (key: string) => string,
  onSuccess?: () => void
) => async (dispatch: Dispatch) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URL}/withdraw-requests/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    dispatch({ 
      type: UPDATE_WITHDRAW_STATUS_SUCCESS, 
      payload: response.data.data 
    });
    
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("WITHDRAW_REQUEST_UPDATED_SUCCESSFULLY"),
      life: 3000,
    });

    if (onSuccess) onSuccess();

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to update withdraw request";
    
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage || t("WITHDRAW_REQUEST_UPDATE_FAILED"),
      life: 3000,
    });
  }
};

// Fetch single withdraw request by ID
export const fetchWithdrawRequestById = (
  id: number
) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_WITHDRAW_REQUESTS_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/withdraw-requests/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({ 
      type: FETCH_WITHDRAW_REQUESTS_SUCCESS, 
      payload: { 
        data: [response.data.data],
        pagination: null
      } 
    });

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch withdraw request";
    dispatch({ type: FETCH_WITHDRAW_REQUESTS_FAILURE, payload: errorMessage });
  }
};

// Set Filters
export const setWithdrawFilters = (filters: WithdrawFilters) => (dispatch: Dispatch) => {
  dispatch({ type: SET_WITHDRAW_FILTERS, payload: filters });
};

// Clear Filters
export const clearWithdrawFilters = () => (dispatch: Dispatch) => {
  dispatch({ type: CLEAR_WITHDRAW_FILTERS });
};