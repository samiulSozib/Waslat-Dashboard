import { Dispatch } from 'redux';
import axios from 'axios';
import {
  FETCH_PROVIDER_INFO_FAIL,
  FETCH_PROVIDER_INFO_REQUEST,
  FETCH_PROVIDER_INFO_SUCCESS,
} from '../constants/providerInfoConstants';

const getAuthToken = () => localStorage.getItem('api_token') || '';

// Provider codes are resolved using the existing authenticated provider detail endpoint.
// This avoids hard-coding ZoodPay's database ID, which can differ across deployments.
export const fetchProviderInfo = (
  providerId: number,
  page: number = 1,
  perPage: number = 10,
  refreshSupplierStatus: boolean = false
) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_PROVIDER_INFO_REQUEST });

  try {
    const token = getAuthToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const base = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/$/, '');
    if (!base) throw new Error('NEXT_PUBLIC_BASE_URL is not configured');

    // GET /admin/api-providers/{provider} is already used by the provider module.
    const providerResponse = await axios.get(`${base}/api-providers/${providerId}`, config);
    const envelope = providerResponse.data?.data ?? providerResponse.data;
    const provider = envelope?.provider ?? envelope;
    const code = String(provider?.code ?? '').toLowerCase();

    const path = code === 'zoodpay'
      ? `/zoodpay-providers/${providerId}/account-info`
      : `/afghanistan-providers/${providerId}/account-info`;

    const response = await axios.get(`${base}${path}`, {
      ...config,
      params: code === 'zoodpay' ? { page, per_page: perPage, ...(refreshSupplierStatus ? { refresh_supplier_status: 1 } : {}) } : undefined,
    });

    dispatch({
      type: FETCH_PROVIDER_INFO_SUCCESS,
      payload: response.data?.data ?? response.data,
    });
  } catch (error: any) {
    dispatch({
      type: FETCH_PROVIDER_INFO_FAIL,
      payload: error.response?.data?.message || error.message || 'Could not load provider information',
    });
  }
};
