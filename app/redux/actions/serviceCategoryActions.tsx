import { Dispatch } from 'redux';
import axios from 'axios';
import {
    FETCH_SERVICE_CATEGORY_LIST_REQUEST,
    FETCH_SERVICE_CATEGORY_LIST_SUCCESS,
    FETCH_SERVICE_CATEGORY_LIST_FAIL,
    DELETE_SERVICE_CATEGORY_REQUEST,
    DELETE_SERVICE_CATEGORY_SUCCESS,
    DELETE_SERVICE_CATEGORY_FAIL,
    ADD_SERVICE_CATEGORY_REQUEST,
    ADD_SERVICE_CATEGORY_SUCCESS,
    ADD_SERVICE_CATEGORY_FAIL,
    EDIT_SERVICE_CATEGORY_REQUEST,
    EDIT_SERVICE_CATEGORY_SUCCESS,
    EDIT_SERVICE_CATEGORY_FAIL,
} from '../constants/serviceCategoryConstants';
import { Toast } from 'primereact/toast';
import { ServiceCategory } from '@/types/interface';

const getAuthToken = () => localStorage.getItem('api_token') || '';
const baseUrl = () => `${process.env.NEXT_PUBLIC_BASE_URL}/service_categories`;
const headers = () => ({ Authorization: `Bearer ${getAuthToken()}`, Accept: 'application/json' });

const getErrorMessage = (error: any, fallback: string): string => {
    const errors = error?.response?.data?.errors;
    if (errors) return Object.values(errors).flat().join(', ') || fallback;
    return error?.response?.data?.message || error?.message || fallback;
};

const assertSuccess = (response: any) => {
    if (response.data?.success === false || response.data?.status === 'error') {
        throw new Error(response.data?.message || 'Server rejected the update');
    }
};

const appendCategoryFields = (formData: FormData, category: ServiceCategory) => {
    formData.append('category_name', category.category_name);
    formData.append('type', category.type);
    formData.append('display_order', String(Number(category.display_order ?? 0)));
    formData.append('requires_country_selection',
        category.requires_country_selection === false ||
        category.requires_country_selection === 0 ||
        String(category.requires_country_selection) === '0' ||
        String(category.requires_country_selection) === 'false'
            ? '0' : '1'
    );
    if (category.category_image_url && typeof category.category_image_url !== 'string') {
        formData.append('category_image_url', category.category_image_url);
    }
    formData.append('input_form_schema', typeof category.input_form_schema === 'string'
        ? category.input_form_schema
        : JSON.stringify(category.input_form_schema ?? []));
};

// Fetch Service Categories
export const _fetchServiceCategories = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_SERVICE_CATEGORY_LIST_REQUEST });
    try {
        const response = await axios.get(baseUrl(), { headers: headers() });
        dispatch({ type: FETCH_SERVICE_CATEGORY_LIST_SUCCESS, payload: response.data.data.servicecategories });
    } catch (error: any) {
        dispatch({ type: FETCH_SERVICE_CATEGORY_LIST_FAIL, payload: getErrorMessage(error, 'Unable to fetch categories') });
        throw error;
    }
};

// Add Service Category
export const _addServiceCategory = (
    newCategory: ServiceCategory,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_SERVICE_CATEGORY_REQUEST });
    try {
        const formData = new FormData();
        appendCategoryFields(formData, newCategory);
        const response = await axios.post(baseUrl(), formData, { headers: headers() });
        assertSuccess(response);
        dispatch({ type: ADD_SERVICE_CATEGORY_SUCCESS, payload: response.data.data.servicecategory });
        toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: t('SERVICE_CATEGORY_ADDED'), life: 3000 });
        return true;
    } catch (error: any) {
        dispatch({ type: ADD_SERVICE_CATEGORY_FAIL, payload: getErrorMessage(error, 'Unable to create category') });
        toast.current?.show({ severity: 'error', summary: t('ERROR'), detail: getErrorMessage(error, t('SERVICE_CATEGORY_ADD_FAILED')), life: 3000 });
        return false;
    }
};

// Edit Service Category. Keep existing multipart POST convention.
export const _editServiceCategory = (
    updatedCategory: ServiceCategory,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_SERVICE_CATEGORY_REQUEST });
    try {
        const formData = new FormData();
        appendCategoryFields(formData, updatedCategory);
        const response = await axios.post(`${baseUrl()}/${updatedCategory.id}`, formData, { headers: headers() });
        assertSuccess(response);
        dispatch({ type: EDIT_SERVICE_CATEGORY_SUCCESS, payload: response.data.data.servicecategory });
        toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: t('SERVICE_CATEGORY_UPDATED'), life: 3000 });
        return true;
    } catch (error: any) {
        dispatch({ type: EDIT_SERVICE_CATEGORY_FAIL, payload: getErrorMessage(error, 'Unable to edit category') });
        toast.current?.show({ severity: 'error', summary: t('ERROR'), detail: getErrorMessage(error, t('SERVICE_CATEGORY_UPDATE_FAILED')), life: 3000 });
        return false;
    }
};

// Delete Service Category
export const _deleteServiceCategory = (
    categoryId: number,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_SERVICE_CATEGORY_REQUEST });
    try {
        await axios.delete(`${baseUrl()}/${categoryId}`, { headers: headers() });
        dispatch({ type: DELETE_SERVICE_CATEGORY_SUCCESS, payload: categoryId });
        toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: t('SERVICE_CATEGORY_DELETED'), life: 3000 });
    } catch (error: any) {
        dispatch({ type: DELETE_SERVICE_CATEGORY_FAIL, payload: getErrorMessage(error, 'Unable to delete category') });
        toast.current?.show({ severity: 'error', summary: t('ERROR'), detail: t('SERVICE_CATEGORY_DELETE_FAILED'), life: 3000 });
    }
};

export const _deleteSelectedServiceCategories = async (
    serviceCategoriesIds: number[],
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => {
    try {
        for (const id of serviceCategoriesIds) {
            await axios.delete(`${baseUrl()}/${id}`, { headers: headers() });
        }
        toast.current?.show({ severity: 'success', summary: t('SUCCESS'), detail: t('SERVICE_CATEGORIES_DELETED'), life: 3000 });
    } catch (error: any) {
        toast.current?.show({ severity: 'error', summary: t('ERROR'), detail: t('SERVICE_CATEGORIES_DELETE_FAILED'), life: 3000 });
    }
};

// Save ONLY display_order without touching image, custom fields or country setting.
export const _updateServiceCategoryPriority = (categoryId: number, displayOrder: number) =>
    async (dispatch: Dispatch): Promise<void> => {
        dispatch({ type: EDIT_SERVICE_CATEGORY_REQUEST });
        try {
            const formData = new FormData();
            formData.append('display_order', String(displayOrder));
            const response = await axios.post(`${baseUrl()}/${categoryId}`, formData, { headers: headers() });
            assertSuccess(response);
            const received = response.data?.data?.servicecategory;
            if (received?.id) {
                dispatch({ type: EDIT_SERVICE_CATEGORY_SUCCESS, payload: received });
            }
        } catch (error: any) {
            const message = getErrorMessage(error, 'Unable to save category priority');
            dispatch({ type: EDIT_SERVICE_CATEGORY_FAIL, payload: message });
            throw new Error(message);
        }
    };

// Save ONLY requires_country_selection without touching other category data.
export const _updateServiceCategoryCountrySelection = (categoryId: number, required: boolean) =>
    async (dispatch: Dispatch): Promise<void> => {
        dispatch({ type: EDIT_SERVICE_CATEGORY_REQUEST });
        try {
            const formData = new FormData();
            formData.append('requires_country_selection', required ? '1' : '0');
            const response = await axios.post(`${baseUrl()}/${categoryId}`, formData, { headers: headers() });
            assertSuccess(response);
            const received = response.data?.data?.servicecategory;
            if (received?.id) {
                dispatch({ type: EDIT_SERVICE_CATEGORY_SUCCESS, payload: received });
            }
        } catch (error: any) {
            const message = getErrorMessage(error, 'Unable to save country-selection setting');
            dispatch({ type: EDIT_SERVICE_CATEGORY_FAIL, payload: message });
            throw new Error(message);
        }
    };
