import { Dispatch } from "redux";
import axios from "axios";

import { Toast } from "primereact/toast";
import { ADD_HELP_ARTICLE_FAIL, ADD_HELP_ARTICLE_REQUEST, ADD_HELP_ARTICLE_SUCCESS, DELETE_HELP_ARTICLE_FAIL, DELETE_HELP_ARTICLE_REQUEST, DELETE_HELP_ARTICLE_SUCCESS, EDIT_HELP_ARTICLE_FAIL, EDIT_HELP_ARTICLE_REQUEST, EDIT_HELP_ARTICLE_SUCCESS, FETCH_HELP_ARTICLES_FAILURE, FETCH_HELP_ARTICLES_REQUEST, FETCH_HELP_ARTICLES_SUCCESS } from "../constants/helpAriclesConstants";
import { HelpArticle } from "@/types/interface";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || "";
};

// Fetch HELP ARTICLES
export const _fetchHelpArticles = (page: number = 1) => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_HELP_ARTICLES_REQUEST });

    try {
        const token = getAuthToken();
        const queryParams = new URLSearchParams();

        queryParams.append('page', String(page));




        const queryString = queryParams.toString();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/help-articles?${queryString}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: FETCH_HELP_ARTICLES_SUCCESS, payload: { data: response.data.data.articles, pagination: response.data.payload.pagination } });

        // Optional success toast for fetch operation
        // toast.current?.show({
        //     severity: "success",
        //     summary: t("SUCCESS"),
        //     detail: t("CURRENCIES_FETCHED"),
        //     life: 3000,
        // });
    } catch (error: any) {
        dispatch({ type: FETCH_HELP_ARTICLES_FAILURE, payload: error.message });

    }
};

// Add a HELP ARTICLES
export const _addHelpArticle = (data: HelpArticle, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_HELP_ARTICLE_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/help-articles`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        dispatch({ type: ADD_HELP_ARTICLE_SUCCESS, payload: response.data.data.article });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("HELP_ARTICLE_ADDED_SUCCESSFULLY"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: ADD_HELP_ARTICLE_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("HELP_ARTICLE_ADDED_FAILED"),
            life: 3000,
        });
    }
};

// Edit a HELP ARTICLE
export const _editHelpArticle = (id: number, data: HelpArticle, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_HELP_ARTICLE_REQUEST });

    try {
        const token = getAuthToken();
        console.log(data)
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/help-articles/${id}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        dispatch({ type: EDIT_HELP_ARTICLE_SUCCESS, payload: response.data.data.article });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("HELP_ARTICLE_UPDATED_SUCCESSFULLY"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: EDIT_HELP_ARTICLE_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("HELP_ARTICLE_UPDATED_FAILED"),
            life: 3000,
        });
    }
};

// Delete a HELP ARTICLE
export const _deleteHelpArticle = (id: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_HELP_ARTICLE_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/help-articles/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: DELETE_HELP_ARTICLE_SUCCESS, payload: id });
        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("HELP_ARTICLE_DELETED_SUCCESSFULLY"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({ type: DELETE_HELP_ARTICLE_FAIL, payload: error.message });
        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("HELP_ARTICLE_DELETED_FAILED"),
            life: 3000,
        });
    }
};
