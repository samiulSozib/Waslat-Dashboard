// app/redux/actions/providerInfoActions.ts
import { Dispatch } from "redux";
import axios from "axios";
import { 
  FETCH_PROVIDER_INFO_FAIL, 
  FETCH_PROVIDER_INFO_REQUEST, 
  FETCH_PROVIDER_INFO_SUCCESS 
} from "../constants/providerInfoConstants";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || "";
};

// FETCH PROVIDER ACCOUNT INFO ACTION
export const fetchProviderInfo = (providerId: number) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_PROVIDER_INFO_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/afghanistan-providers/${providerId}/account-info`, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    dispatch({ 
      type: FETCH_PROVIDER_INFO_SUCCESS, 
      payload: response.data.data 
    });
  } catch (error: any) {
    dispatch({ 
      type: FETCH_PROVIDER_INFO_FAIL, 
      payload: error.response?.data?.message || error.message 
    });
  }
};