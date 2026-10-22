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
import { BackupState } from '@/types/backupTypes';

const initialState: BackupState = {
    dashboard: null,
    backups: [],
    selectedBackup: null,
    settings: null,
    activeRequest: null,
    pagination: {
        total: 0,
        current_page: 1,
        per_page: 10,
        last_page: 1
    },
    dashboardLoading: false,
    listLoading: false,
    detailsLoading: false,
    settingsLoading: false,
    creating: false,
    savingSettings: false,
    downloadingId: null,
    error: null
};

export const backupReducer = (
    state: BackupState = initialState,
    action: any
): BackupState => {
    switch (action.type) {
        case FETCH_BACKUP_DASHBOARD_REQUEST:
            return { ...state, dashboardLoading: true, error: null };

        case FETCH_BACKUP_DASHBOARD_SUCCESS:
            return {
                ...state,
                dashboardLoading: false,
                dashboard: action.payload
            };

        case FETCH_BACKUP_DASHBOARD_FAIL:
            return {
                ...state,
                dashboardLoading: false,
                error: action.payload
            };

        case FETCH_BACKUPS_REQUEST:
            return { ...state, listLoading: true, error: null };

        case FETCH_BACKUPS_SUCCESS:
            return {
                ...state,
                listLoading: false,
                backups: action.payload.backups,
                pagination: action.payload.pagination
            };

        case FETCH_BACKUPS_FAIL:
            return {
                ...state,
                listLoading: false,
                error: action.payload
            };

        case FETCH_BACKUP_DETAILS_REQUEST:
            return { ...state, detailsLoading: true, error: null };

        case FETCH_BACKUP_DETAILS_SUCCESS:
            return {
                ...state,
                detailsLoading: false,
                selectedBackup: action.payload
            };

        case FETCH_BACKUP_DETAILS_FAIL:
            return {
                ...state,
                detailsLoading: false,
                error: action.payload
            };

        case FETCH_BACKUP_SETTINGS_REQUEST:
            return { ...state, settingsLoading: true, error: null };

        case FETCH_BACKUP_SETTINGS_SUCCESS:
            return {
                ...state,
                settingsLoading: false,
                settings: action.payload
            };

        case FETCH_BACKUP_SETTINGS_FAIL:
            return {
                ...state,
                settingsLoading: false,
                error: action.payload
            };

        case UPDATE_BACKUP_SETTINGS_REQUEST:
            return { ...state, savingSettings: true, error: null };

        case UPDATE_BACKUP_SETTINGS_SUCCESS:
            return {
                ...state,
                savingSettings: false,
                settings: action.payload
            };

        case UPDATE_BACKUP_SETTINGS_FAIL:
            return {
                ...state,
                savingSettings: false,
                error: action.payload
            };

        case CREATE_BACKUP_REQUEST:
            return { ...state, creating: true, error: null };

        case CREATE_BACKUP_SUCCESS:
            return {
                ...state,
                creating: false,
                activeRequest: action.payload
            };

        case CREATE_BACKUP_FAIL:
            return {
                ...state,
                creating: false,
                error: action.payload
            };

        case FETCH_BACKUP_REQUEST_STATUS_REQUEST:
            return { ...state };

        case FETCH_BACKUP_REQUEST_STATUS_SUCCESS:
            return {
                ...state,
                activeRequest: action.payload
            };

        case FETCH_BACKUP_REQUEST_STATUS_FAIL:
            return {
                ...state,
                error: action.payload
            };

        case DOWNLOAD_BACKUP_REQUEST:
            return {
                ...state,
                downloadingId: action.payload,
                error: null
            };

        case DOWNLOAD_BACKUP_SUCCESS:
            return { ...state, downloadingId: null };

        case DOWNLOAD_BACKUP_FAIL:
            return {
                ...state,
                downloadingId: null,
                error: action.payload
            };

        case CLEAR_BACKUP_ERROR:
            return { ...state, error: null };

        case CLEAR_BACKUP_REQUEST:
            return { ...state, activeRequest: null };

        default:
            return state;
    }
};
