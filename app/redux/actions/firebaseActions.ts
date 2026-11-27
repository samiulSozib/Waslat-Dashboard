import axios from 'axios';

const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('api_token') || ''}`
});

/** Avoid trailing slash — redirects often surface in the browser as a false CORS error. */
const firebaseUrl = (path = '') => {
    const base = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
    const suffix = path && path !== '/' ? path.replace(/\/+$/, '') : '';
    return `${base}/firebase${suffix}`;
};

export type FirebaseCredentialsMeta = {
    exists?: boolean;
    relative_path?: string | null;
    file_name?: string | null;
    client_email?: string | null;
    project_id?: string | null;
};

export type FirebaseConfigSource = 'env' | 'settings';

export type FirebasePublicStatus = {
    configured?: boolean;
    enabled?: boolean;
    project_id?: string | null;
    project_id_configured?: boolean;
    client_email?: string | null;
    credentials_uploaded?: boolean;
    credentials_relative_path?: string | null;
    credentials_file_name?: string | null;
    config_source?: FirebaseConfigSource;
    source?: 'admin' | 'env' | 'none';
    using_env_fallback?: boolean;
    env_credentials?: FirebaseCredentialsMeta;
    settings_credentials?: FirebaseCredentialsMeta;
    env_enabled?: boolean;
    env_project_id?: string | null;
};

const parseFirebaseStatus = (body: any): FirebasePublicStatus | null =>
    body?.data?.firebase ?? body?.firebase ?? null;

export const fetchFirebaseSettings = async (): Promise<FirebasePublicStatus | null> => {
    const response = await axios.get(firebaseUrl(), {
        headers: authHeaders()
    });
    return parseFirebaseStatus(response.data);
};

export const saveFirebaseSettings = async (payload: {
    is_enabled: boolean;
    project_id: string;
    config_source: FirebaseConfigSource;
    credentials_file?: File | null;
    adopt_env_credentials?: boolean;
}): Promise<FirebasePublicStatus | null> => {
    const form = new FormData();
    form.append('is_enabled', payload.is_enabled ? '1' : '0');
    form.append('project_id', payload.project_id || '');
    form.append('config_source', payload.config_source);
    if (payload.adopt_env_credentials) {
        form.append('adopt_env_credentials', '1');
    }
    if (payload.credentials_file) {
        form.append('credentials_file', payload.credentials_file);
    }

    const response = await axios.post(firebaseUrl(), form, {
        headers: {
            ...authHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });

    return parseFirebaseStatus(response.data);
};
