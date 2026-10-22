export interface BackupRecord {
    id: number;
    backup_uid?: string | null;
    filename?: string | null;
    backup_type?: string | null;
    status?: string | null;
    trigger_type?: string | null;
    file_size?: number | string | null;
    checksum_sha256?: string | null;
    is_verified?: boolean | number;
    is_compressed?: boolean | number;
    is_encrypted?: boolean | number;
    created_at?: string | null;
    started_at?: string | null;
    completed_at?: string | null;
    error_message?: string | null;
    metadata?: Record<string, unknown> | null;
    [key: string]: unknown;
}

export interface BackupRequest {
    id: number;
    status?: string | null;
    backup_id?: number | null;
    backup_record_id?: number | null;
    backup_uid?: string | null;
    created_at?: string | null;
    completed_at?: string | null;
    error_message?: string | null;
    message?: string | null;
    [key: string]: unknown;
}

export type BackupSettings = Record<string, unknown>;

export interface BackupDashboard {
    [key: string]: unknown;
}

export interface BackupPagination {
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
}

export interface BackupState {
    dashboard: BackupDashboard | null;
    backups: BackupRecord[];
    selectedBackup: BackupRecord | null;
    settings: BackupSettings | null;
    activeRequest: BackupRequest | null;
    pagination: BackupPagination;
    dashboardLoading: boolean;
    listLoading: boolean;
    detailsLoading: boolean;
    settingsLoading: boolean;
    creating: boolean;
    savingSettings: boolean;
    downloadingId: number | null;
    error: string | null;
}
