// singleProviderActions.ts
import axios from "axios";
import { Dispatch } from "redux";
import {
  FETCH_SINGLE_PROVIDER_REQUEST,
  FETCH_SINGLE_PROVIDER_SUCCESS,
  FETCH_SINGLE_PROVIDER_FAIL,
  CLEAR_SINGLE_PROVIDER
} from "../constants/singleProviderConstant";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || "";
};

// Fetch single Provider
export const _fetchSingleProvider = (
  providerId: number,
  code: string,
  capability: string,
  page: number = 1,
  search: string = '',
  filters: Record<string, any> = {}
) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_SINGLE_PROVIDER_REQUEST });

  try {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();

    queryParams.append('page', String(page));
    if (search) queryParams.append('search', search);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api-providers/${providerId}/${code}/${capability}${queryString ? `?${queryString}` : ''}`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch({
      type: FETCH_SINGLE_PROVIDER_SUCCESS,
      payload: {
        provider: response.data.data.provider,
        internets: response.data.data.internet,
        rawInternets:response.data.data.raw.internet,
        pagination: response.data.payload?.pagination || null,
      },
    });

  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || "Failed to fetch provider";
    dispatch({
      type: FETCH_SINGLE_PROVIDER_FAIL,
      payload: errorMessage
    });
  }
};

// Clear single provider data
export const clearSingleProvider = () => ({
  type: CLEAR_SINGLE_PROVIDER
});
