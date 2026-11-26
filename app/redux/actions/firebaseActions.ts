import axios from 'axios';
import { Dispatch } from 'redux';

const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('api_token') || ''}`
});

/** Avoid trailing slash — redirects often surface in the browser as a false CORS error. */
const firebaseUrl = (path = '') => {
    const base = (process.env.NEXT_PUBLIC_BASE_URL || '').replace(/\/+$/, '');
    const suffix = path && path !== '/' ? path.replace(/\/+$/, '') : '';
    return `${base}/firebase${suffix}`;
};

export type FirebasePublicStatus = {
    configured?: boolean;
    enabled?: boolean;
    project_id?: string | null;
    project_id_configured?: boolean;
    client_email?: string | null;
    credentials_uploaded?: boolean;
    source?: 'admin' | 'env' | 'none';
    using_env_fallback?: boolean;
};

export const fetchFirebaseSettings = () => async (_dispatch?: Dispatch): Promise<FirebasePublicStatus | null> => {
    const response = await axios.get(firebaseUrl(), {
        headers: authHeaders()
    });
    return response.data?.data?.firebase ?? response.data?.firebase ?? null;
};

export const saveFirebaseSettings = (payload: {
    is_enabled: boolean;
    project_id: string;
    credentials_file?: File | null;
}) => async (_dispatch?: Dispatch): Promise<FirebasePublicStatus | null> => {
    const form = new FormData();
    form.append('is_enabled', payload.is_enabled ? '1' : '0');
    form.append('project_id', payload.project_id || '');
    if (payload.credentials_file) {
        form.append('credentials_file', payload.credentials_file);
    }

    const response = await axios.post(firebaseUrl(), form, {
        headers: {
            ...authHeaders(),
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data?.data?.firebase ?? response.data?.firebase ?? null;
};
