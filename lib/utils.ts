import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('api_token');
}

export function getUserInfo<T = Record<string, unknown>>(): T {
    if (typeof window === 'undefined') return {} as T;
    try {
        return JSON.parse(localStorage.getItem('user_info') || '{}') as T;
    } catch {
        return {} as T;
    }
}
