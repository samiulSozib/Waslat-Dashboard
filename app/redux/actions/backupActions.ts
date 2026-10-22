import axios from 'axios';
import { Dispatch } from 'redux';
import {
    FETCH_BACKUP_DASHBOARD_REQUEST,
    FETCH_BACKUP_DASHBOARD_SUCCESS,
    FETCH_BACKUP_DASHBOARD_FAIL,
    FETCH_BACKUPS_REQUEST,
    FETCH_BACKUPS_SUCCESS,
    FETCH_BACKUPS_FAIL,
    FETCH_BACKUP_DETAILS_REQUEST,
    FETCH_BACKUP_DETAILS_SUCCESS,
    FETCH_BACKUP_DETAILS_FAIL,
    FETCH_BACKUP_SETTINGS_REQUEST,
    FETCH_BACKUP_SETTINGS_SUCCESS,
    FETCH_BACKUP_SETTINGS_FAIL,
    UPDATE_BACKUP_SETTINGS_REQUEST,
    UPDATE_BACKUP_SETTINGS_SUCCESS,
    UPDATE_BACKUP_SETTINGS_FAIL,
    CREATE_BACKUP_REQUEST,
    CREATE_BACKUP_SUCCESS,
    CREATE_BACKUP_FAIL,
    FETCH_BACKUP_REQUEST_STATUS_REQUEST,
    FETCH_BACKUP_REQUEST_STATUS_SUCCESS,
    FETCH_BACKUP_REQUEST_STATUS_FAIL,
    DOWNLOAD_BACKUP_REQUEST,
    DOWNLOAD_BACKUP_SUCCESS,
    DOWNLOAD_BACKUP_FAIL,
    CLEAR_BACKUP_ERROR,
    CLEAR_BACKUP_REQUEST
} from '../constants/backupConstants';
import {
    BackupRecord,
    BackupRequest,
    BackupSettings,
    BackupPagination
} from '@/types/backupTypes';

const getToken = () =>
    typeof window !== 'undefined'
        ? localStorage.getItem('api_token') || ''
        : '';

const baseUrl = () =>
    (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/+$/, '');

const backupUrl = (path = '') =>
    `${baseUrl()}/backups${path}`;

const authHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    Accept: 'application/json'
});

const extractData = (response: any): any => {
    const body = response?.data;

    if (body?.success === false) {
        throw new Error(body?.message || 'The request failed.');
    }

    return body?.data ?? body;
};

const unwrap = (value: any): any => {
    if (value && typeof value === 'object' &&
        !Array.isArray(value) && value.data !== undefined) {
        return value.data;
    }
    return value;
};

const getError = (error: any): string => {
    const status = error?.response?.status;

    if (status === 401) return 'Your session has expired. Please log in again.';
    if (status === 403) return 'SuperAdmin authorization is required.';
    if (status === 404) return 'The requested resource was not found.';
    if (status === 409) return 'This operation is not currently permitted.';
    if (status === 503) return 'The backup file is temporarily unavailable.';

    const message = error?.response?.data?.message;

    return typeof message === 'string'
        ? message
        : error?.message || 'An unexpected error occurred.';
};

const normalizeList = (payload: any): {
    backups: BackupRecord[];
    pagination: BackupPagination;
} => {
    const value = unwrap(payload);
    const candidates = [
        value?.backups,
        value?.records,
        value?.backup_records,
        value?.items,
        value
    ];

    const collection = candidates.find((item: any) =>
        Array.isArray(item) || Array.isArray(item?.data)
    );

    const backups: BackupRecord[] = Array.isArray(collection)
        ? collection
        : Array.isArray(collection?.data)
            ? collection.data
            : [];

    const paging = Array.isArray(collection) ? value : collection || value;

    const pagination: BackupPagination = {
        total: Number(paging?.total ?? value?.total ?? backups.length),
        current_page: Number(
            paging?.current_page ?? value?.current_page ?? 1
        ),
        per_page: Number(
            paging?.per_page ?? value?.per_page ?? 10
        ),
        last_page: Number(
            paging?.last_page ?? value?.last_page ?? 1
        )
    };

    return { backups, pagination };
};

export const fetchBackupDashboard = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_BACKUP_DASHBOARD_REQUEST });

    try {
        const response = await axios.get(backupUrl('/dashboard'), {
            headers: authHeaders()
        });

        const payload = extractData(response);
        const dashboard = payload?.dashboard ?? payload;

        dispatch({
            type: FETCH_BACKUP_DASHBOARD_SUCCESS,
            payload: dashboard
        });

        return dashboard;
    } catch (error: any) {
        dispatch({
            type: FETCH_BACKUP_DASHBOARD_FAIL,
            payload: getError(error)
        });
        throw error;
    }
};

export const fetchBackups = (
    page = 1,
    perPage = 10
) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_BACKUPS_REQUEST });

    try {
        const response = await axios.get(backupUrl(), {
            headers: authHeaders(),
            params: {
                page,
                per_page: perPage,
                items_per_page: perPage
            }
        });

        const normalized = normalizeList(extractData(response));

        dispatch({
            type: FETCH_BACKUPS_SUCCESS,
            payload: normalized
        });

        return normalized;
    } catch (error: any) {
        dispatch({
            type: FETCH_BACKUPS_FAIL,
            payload: getError(error)
        });
        throw error;
    }
};

export const fetchBackupDetails = (
    id: number
) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_BACKUP_DETAILS_REQUEST });

    try {
        const response = await axios.get(backupUrl(`/${id}`), {
            headers: authHeaders()
        });

        const payload = extractData(response);
        const backup: BackupRecord = payload?.backup ??
            payload?.record ?? payload;

        dispatch({
            type: FETCH_BACKUP_DETAILS_SUCCESS,
            payload: backup
        });

        return backup;
    } catch (error: any) {
        dispatch({
            type: FETCH_BACKUP_DETAILS_FAIL,
            payload: getError(error)
        });
        throw error;
    }
};

export const fetchBackupSettings = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_BACKUP_SETTINGS_REQUEST });

    try {
        const response = await axios.get(backupUrl('/settings'), {
            headers: authHeaders()
        });

        const payload = extractData(response);
        const settings: BackupSettings =
            payload?.settings ?? payload;

        dispatch({
            type: FETCH_BACKUP_SETTINGS_SUCCESS,
            payload: settings
        });

        return settings;
    } catch (error: any) {
        dispatch({
            type: FETCH_BACKUP_SETTINGS_FAIL,
            payload: getError(error)
        });
        throw error;
    }
};

export const updateBackupSettings = (
    changes: Partial<BackupSettings>
) => async (dispatch: Dispatch) => {
    dispatch({ type: UPDATE_BACKUP_SETTINGS_REQUEST });

    try {
        const response = await axios.put(
            backupUrl('/settings'),
            changes,
            {
                headers: {
                    ...authHeaders(),
                    'Content-Type': 'application/json'
                }
            }
        );

        const payload = extractData(response);
        const settings = payload?.settings ?? payload;

        dispatch({
            type: UPDATE_BACKUP_SETTINGS_SUCCESS,
            payload: settings
        });

        return settings;
    } catch (error: any) {
        dispatch({
            type: UPDATE_BACKUP_SETTINGS_FAIL,
            payload: getError(error)
        });
        throw error;
    }
};

export const createBackup = () => async (dispatch: Dispatch) => {
    dispatch({ type: CREATE_BACKUP_REQUEST });

    try {
        const response = await axios.post(
            backupUrl('/create'),
            {},
            {
                headers: {
                    ...authHeaders(),
                    'Content-Type': 'application/json'
                }
            }
        );

        const payload = extractData(response);
        const request: BackupRequest =
            payload?.request ??
            payload?.backup_request ??
            payload;

        dispatch({
            type: CREATE_BACKUP_SUCCESS,
            payload: request
        });

        return request;
    } catch (error: any) {
        dispatch({
            type: CREATE_BACKUP_FAIL,
            payload: getError(error)
        });
        throw error;
    }
};

export const fetchBackupRequestStatus = (
    requestId: number
) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_BACKUP_REQUEST_STATUS_REQUEST });

    try {
        const response = await axios.get(
            backupUrl(`/requests/${requestId}`),
            { headers: authHeaders() }
        );

        const payload = extractData(response);
        const request: BackupRequest =
            payload?.request ??
            payload?.backup_request ??
            payload;

        dispatch({
            type: FETCH_BACKUP_REQUEST_STATUS_SUCCESS,
            payload: request
        });

        return request;
    } catch (error: any) {
        dispatch({
            type: FETCH_BACKUP_REQUEST_STATUS_FAIL,
            payload: getError(error)
        });
        throw error;
    }
};

const filenameFromHeader = (header?: string): string | null => {
    if (!header) return null;

    const encoded = header.match(/filename\*=UTF-8''([^;]+)/i);
    if (encoded) {
        try {
            return decodeURIComponent(encoded[1]);
        } catch {
            return null;
        }
    }

    const regular = header.match(/filename="?([^";]+)"?/i);
    return regular?.[1] || null;
};

const safeFilename = (name: string) => {
    const cleaned = name.split(/[\\/]/).pop() || 'backup.sql.gz';
    return cleaned.replace(/[\x00-\x1f\x7f]/g, '_');
};

export const downloadBackup = (
    backup: BackupRecord
) => async (dispatch: Dispatch) => {
    dispatch({
        type: DOWNLOAD_BACKUP_REQUEST,
        payload: backup.id
    });

    try {
        const response = await axios.get(
            backupUrl(`/${backup.id}/download`),
            {
                headers: authHeaders(),
                responseType: 'blob',
                timeout: 0
            }
        );

        if (response.status !== 200) {
            throw new Error('Backup download failed.');
        }

        const blob: Blob = response.data;
        const objectUrl = URL.createObjectURL(blob);

        const headerFilename = filenameFromHeader(
            response.headers['content-disposition']
        );

        const filename = safeFilename(
            headerFilename ||
            backup.filename ||
            `backup-${backup.id}.sql.gz`
        );

        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);

        dispatch({
            type: DOWNLOAD_BACKUP_SUCCESS,
            payload: backup.id
        });

        return true;
    } catch (error: any) {
        dispatch({
            type: DOWNLOAD_BACKUP_FAIL,
            payload: getError(error)
        });
        throw error;
    }
};

export const clearBackupError = () => ({
    type: CLEAR_BACKUP_ERROR
});

export const clearBackupRequest = () => ({
    type: CLEAR_BACKUP_REQUEST
});
