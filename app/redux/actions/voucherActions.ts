import { Dispatch } from 'redux';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import {
    FETCH_VOUCHER_LIST_REQUEST,
    FETCH_VOUCHER_LIST_SUCCESS,
    FETCH_VOUCHER_LIST_FAIL,
    FETCH_VOUCHER_REQUEST,
    FETCH_VOUCHER_SUCCESS,
    FETCH_VOUCHER_FAIL,
    ADD_VOUCHER_REQUEST,
    ADD_VOUCHER_SUCCESS,
    ADD_VOUCHER_FAIL,
    EDIT_VOUCHER_REQUEST,
    EDIT_VOUCHER_SUCCESS,
    EDIT_VOUCHER_FAIL,
    DELETE_VOUCHER_REQUEST,
    DELETE_VOUCHER_SUCCESS,
    DELETE_VOUCHER_FAIL,
    BULK_IMPORT_VOUCHERS_REQUEST,
    BULK_IMPORT_VOUCHERS_SUCCESS,
    BULK_IMPORT_VOUCHERS_FAIL,
    FETCH_SOCIAL_COMPANIES_REQUEST,
    FETCH_SOCIAL_COMPANIES_SUCCESS,
    FETCH_SOCIAL_COMPANIES_FAIL,
    FETCH_BUNDLE_STATS_REQUEST,
    FETCH_BUNDLE_STATS_SUCCESS,
    FETCH_BUNDLE_STATS_FAIL,
    CLEAR_VOUCHER_STATE,
    CLEAR_BULK_IMPORT_STATE,
} from '../constants/voucherConstants';
import { BulkImportPayload, BulkImportResponse, BundleStatsResponse, CreateVoucherPayload, SingleVoucherResponse, SocialCompaniesResponse, UpdateVoucherPayload, VoucherListResponse, VoucherQueryParams } from '@/types/interface';


const getAuthToken = (): string => {
    return localStorage.getItem('api_token') || '';
};

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ============================
// Voucher List Actions
// ============================

export const _fetchVoucherList =
    (params: VoucherQueryParams = { page: 1, items_per_page: 20 }) =>
    async (dispatch: Dispatch) => {
        dispatch({ type: FETCH_VOUCHER_LIST_REQUEST });
        try {
            const token = getAuthToken();
            const queryParams = new URLSearchParams();

            // Pagination
            if (params.page) queryParams.append('page', String(params.page));
            if (params.items_per_page) queryParams.append('items_per_page', String(params.items_per_page));

            // Filters
            if (params.bundle_id) queryParams.append('bundle_id', String(params.bundle_id));
            if (params.status) queryParams.append('status', params.status);
            if (params.search) queryParams.append('search', params.search);
            if (params.provider) queryParams.append('provider', params.provider);

            const queryString = queryParams.toString();
            const response = await axios.get<VoucherListResponse>(
                `${API_BASE_URL}/vouchers?${queryString}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            dispatch({
                type: FETCH_VOUCHER_LIST_SUCCESS,
                payload: {
                    data: response.data.data.vouchers,
                    statistics: response.data.data.statistics,
                    pagination: response.data.data.pagination,
                },
            });
        } catch (error: any) {
            dispatch({
                type: FETCH_VOUCHER_LIST_FAIL,
                payload: error.response?.data?.message || error.message,
            });
        }
    };

// ============================
// Single Voucher Actions
// ============================

export const _fetchVoucher =
    (voucherId: number, toast?: React.RefObject<Toast>, t?: (key: string) => string) =>
    async (dispatch: Dispatch) => {
        dispatch({ type: FETCH_VOUCHER_REQUEST });
        try {
            const token = getAuthToken();
            const response = await axios.get<SingleVoucherResponse>(
                `${API_BASE_URL}/vouchers/${voucherId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            dispatch({
                type: FETCH_VOUCHER_SUCCESS,
                payload: response.data.data.voucher,
            });
        } catch (error: any) {
            dispatch({
                type: FETCH_VOUCHER_FAIL,
                payload: error.response?.data?.message || error.message,
            });
            toast?.current?.show({
                severity: 'error',
                summary: t?.('ERROR') || 'Error',
                detail: t?.('FETCH_VOUCHER_FAILED') || 'Failed to fetch voucher details.',
                life: 3000,
            });
        }
    };

// ============================
// Create Voucher Actions
// ============================

export const _addVoucher =
    (voucherData: CreateVoucherPayload, toast: React.RefObject<Toast>, t: (key: string) => string) =>
    async (dispatch: Dispatch) => {
        dispatch({ type: ADD_VOUCHER_REQUEST });
        try {
            const token = getAuthToken();
            const response = await axios.post<SingleVoucherResponse>(
                `${API_BASE_URL}/vouchers`,
                voucherData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            dispatch({
                type: ADD_VOUCHER_SUCCESS,
                payload: response.data.data.voucher,
            });

            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESS'),
                detail: t('VOUCHER_ADDED_SUCCESS'),
                life: 3000,
            });
            return response.data.data.voucher;
        } catch (error: any) {
            dispatch({
                type: ADD_VOUCHER_FAIL,
                payload: error.response?.data?.message || error.message,
            });
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: error.response?.data?.message || t('VOUCHER_ADD_FAILED'),
                life: 3000,
            });
        }
    };

// ============================
// Update Voucher Actions
// ============================

export const _editVoucher =
    (
        voucherId: number,
        voucherData: UpdateVoucherPayload,
        toast: React.RefObject<Toast>,
        t: (key: string) => string
    ) =>
    async (dispatch: Dispatch) => {
        dispatch({ type: EDIT_VOUCHER_REQUEST });
        try {
            const token = getAuthToken();
            const response = await axios.put<SingleVoucherResponse>(
                `${API_BASE_URL}/vouchers/${voucherId}`,
                voucherData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            dispatch({
                type: EDIT_VOUCHER_SUCCESS,
                payload: response.data.data.voucher,
            });

            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESS'),
                detail: t('VOUCHER_EDITED_SUCCESS'),
                life: 3000,
            });
            return response.data.data.voucher;
        } catch (error: any) {
            dispatch({
                type: EDIT_VOUCHER_FAIL,
                payload: error.response?.data?.message || error.message,
            });
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: error.response?.data?.message || t('VOUCHER_EDIT_FAILED'),
                life: 3000,
            });
        }
    };

// ============================
// Delete Voucher Actions
// ============================

export const _deleteVoucher =
    (voucherId: number, toast: React.RefObject<Toast>, t: (key: string) => string) =>
    async (dispatch: Dispatch) => {
        dispatch({ type: DELETE_VOUCHER_REQUEST });
        try {
            const token = getAuthToken();
            await axios.delete(`${API_BASE_URL}/vouchers/${voucherId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            dispatch({
                type: DELETE_VOUCHER_SUCCESS,
                payload: voucherId,
            });

            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESS'),
                detail: t('VOUCHER_DELETED_SUCCESS'),
                life: 3000,
            });
        } catch (error: any) {
            dispatch({
                type: DELETE_VOUCHER_FAIL,
                payload: error.response?.data?.message || error.message,
            });
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: error.response?.data?.message || t('VOUCHER_DELETE_FAILED'),
                life: 3000,
            });
        }
    };

// ============================
// Bulk Delete Vouchers
// ============================

export const _deleteSelectedVouchers =
    async (voucherIds: number[], toast: React.RefObject<Toast>, t: (key: string) => string) => {
        const token = getAuthToken();

        try {
            // Delete each voucher sequentially
            for (const id of voucherIds) {
                await axios.delete(`${API_BASE_URL}/vouchers/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESS'),
                detail: t('VOUCHERS_DELETED_SUCCESS'),
                life: 3000,
            });
        } catch (error: any) {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: t('VOUCHERS_DELETE_FAILED'),
                life: 3000,
            });
        }
    };

// ============================
// Bulk Import Actions
// ============================

export const _bulkImportVouchers =
    (importData: BulkImportPayload, toast: React.RefObject<Toast>, t: (key: string) => string) =>
    async (dispatch: Dispatch) => {
        dispatch({ type: BULK_IMPORT_VOUCHERS_REQUEST });
        try {
            const token = getAuthToken();
            const response = await axios.post<BulkImportResponse>(
                `${API_BASE_URL}/vouchers/bulk-import`,
                importData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            dispatch({
                type: BULK_IMPORT_VOUCHERS_SUCCESS,
                payload: {
                    vouchers: response.data.data.vouchers,
                    summary: response.data.data.summary,
                },
            });

            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESS'),
                detail: t('VOUCHERS_IMPORTED_SUCCESS'),
                life: 5000,
            });
            return response.data.data;
        } catch (error: any) {
            dispatch({
                type: BULK_IMPORT_VOUCHERS_FAIL,
                payload: error.response?.data?.message || error.message,
            });
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR'),
                detail: error.response?.data?.message || t('VOUCHERS_IMPORT_FAILED'),
                life: 3000,
            });
        }
    };

// ============================
// Social Companies Actions
// ============================

export const _fetchSocialCompanies =
    (toast?: React.RefObject<Toast>, t?: (key: string) => string) =>
    async (dispatch: Dispatch) => {
        dispatch({ type: FETCH_SOCIAL_COMPANIES_REQUEST });
        try {
            const token = getAuthToken();
            const response = await axios.get<SocialCompaniesResponse>(
                `${API_BASE_URL}/vouchers/social-companies`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            dispatch({
                type: FETCH_SOCIAL_COMPANIES_SUCCESS,
                payload: response.data.data.companies,
            });
        } catch (error: any) {
            dispatch({
                type: FETCH_SOCIAL_COMPANIES_FAIL,
                payload: error.response?.data?.message || error.message,
            });
            toast?.current?.show({
                severity: 'error',
                summary: t?.('ERROR') || 'Error',
                detail: t?.('FETCH_COMPANIES_FAILED') || 'Failed to fetch social companies.',
                life: 3000,
            });
        }
    };

// ============================
// Bundle Stats Actions
// ============================

export const _fetchBundleStats =
    (toast?: React.RefObject<Toast>, t?: (key: string) => string) =>
    async (dispatch: Dispatch) => {
        dispatch({ type: FETCH_BUNDLE_STATS_REQUEST });
        try {
            const token = getAuthToken();
            const response = await axios.get<BundleStatsResponse>(
                `${API_BASE_URL}/vouchers/bundles/stats`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            dispatch({
                type: FETCH_BUNDLE_STATS_SUCCESS,
                payload: response.data.data.bundles,
            });
        } catch (error: any) {
            dispatch({
                type: FETCH_BUNDLE_STATS_FAIL,
                payload: error.response?.data?.message || error.message,
            });
            toast?.current?.show({
                severity: 'error',
                summary: t?.('ERROR') || 'Error',
                detail: t?.('FETCH_STATS_FAILED') || 'Failed to fetch bundle statistics.',
                life: 3000,
            });
        }
    };

// ============================
// Clear State Actions
// ============================

export const _clearVoucherState = () => (dispatch: Dispatch) => {
    dispatch({ type: CLEAR_VOUCHER_STATE });
};

export const _clearBulkImportState = () => (dispatch: Dispatch) => {
    dispatch({ type: CLEAR_BULK_IMPORT_STATE });
};
