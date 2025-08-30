import { Dispatch } from "redux";
import axios from "axios";

import {
    FETCH_COMPANY_LIST_REQUEST,
    FETCH_COMPANY_LIST_SUCCESS,
    FETCH_COMPANY_LIST_FAIL,
    DELETE_COMPANY_REQUEST,
    DELETE_COMPANY_SUCCESS,
    DELETE_COMPANY_FAIL,
    ADD_COMPANY_REQUEST,
    ADD_COMPANY_SUCCESS,
    ADD_COMPANY_FAIL,
    EDIT_COMPANY_REQUEST,
    EDIT_COMPANY_SUCCESS,
    EDIT_COMPANY_FAIL
} from '../constants/companyConstants'
import { Toast } from "primereact/toast";
import { Company } from "@/types/interface";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
  };

// FETCH COMPANY LIST ACTION
export const _fetchCompanies=(search:string='')=>async(dispatch:Dispatch)=>{
    dispatch({type:FETCH_COMPANY_LIST_REQUEST})

    try{
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/companies?search=${search}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        //console.log(response)
        dispatch({type:FETCH_COMPANY_LIST_SUCCESS,payload:response.data.data.companies})
    }catch(error:any){
        dispatch({type:FETCH_COMPANY_LIST_FAIL,payload:error.message})
    }
}




// DELETE COMPANY ACTION
export const _deleteCompany = (companyId: number,toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_COMPANY_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/companies/${companyId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({ type: DELETE_COMPANY_SUCCESS, payload: companyId });
        toast.current?.show({
            severity: 'success',
            summary: t("SUCCESS"),
            detail: t("COMPANY_DELETED"),
            life: 3000
        });

    } catch (error: any) {
        dispatch({ type: DELETE_COMPANY_FAIL, payload: error.message });
        toast.current?.show({
            severity: 'error',
            summary: t("ERROR"),
            detail: t("COMPANY_DELETE_FAILED"),
            life: 3000
        });
    }
};

// ADD COMPANY ACTION
export const _addCompany = (newCompany: Company,toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_COMPANY_REQUEST });
    //console.log(newCompany)
    //return
    const formData = new FormData();

    formData.append('company_name', newCompany.company_name);

    if (newCompany.company_logo && typeof newCompany.company_logo !== 'string') {
        formData.append('company_logo', newCompany.company_logo);
    }

    formData.append("input_form_schema", JSON.stringify(newCompany.input_form_schema || []))

    formData.append('country_id', newCompany.country?.id?.toString()||'');

    formData.append('telegram_chat_id', newCompany.telegram_chat_id?.id?.toString()||'');


    try {
        const token = getAuthToken();
        const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/companies`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        //console.log(response)

        const newData = { ...newCompany, id: response.data.data.company.id };


        dispatch({
            type: ADD_COMPANY_SUCCESS,
            payload: newData, // Assuming API returns the created company.
        });
        toast.current?.show({
            severity: 'success',
            summary: t("SUCCESS"),
            detail: t("COMPANY_ADDED"),
            life: 3000
        });
    } catch (error: any) {
        //console.log(error)
        dispatch({
            type: ADD_COMPANY_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: 'error',
            summary: t("ERROR"),
            detail: t("COMPANY_ADD_FAILED"),
            life: 3000
        });
    }
};


// EDIT COMPANY ACTION
export const _editCompany = (updatedCompany: Company,toast: React.RefObject<Toast>,t: (key: string) => string) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_COMPANY_REQUEST });
    //console.log(updatedCompany)


    const formData = new FormData();

    formData.append('company_name', updatedCompany.company_name);

    if (updatedCompany.company_logo && typeof updatedCompany.company_logo !== 'string') {
        formData.append('company_logo', updatedCompany.company_logo);
    }
        formData.append("input_form_schema", JSON.stringify(updatedCompany.input_form_schema || []))


    formData.append('country_id', updatedCompany.country?.id?.toString() || '');
    formData.append('telegram_chat_id', updatedCompany.telegram_chat_id?.id?.toString() || '');

    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/companies/${updatedCompany.id}`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        const newData = { ...updatedCompany, id: response.data.data.company.id };
        dispatch({
            type: EDIT_COMPANY_SUCCESS,
            payload: newData, // Assuming API returns the updated company.
        });
        toast.current?.show({
            severity: 'success',
            summary: t("SUCCESS"),
            detail: t("COMPANY_UPDATED"),
            life: 3000
        });
    } catch (error: any) {
        //console.log(error);
        dispatch({
            type: EDIT_COMPANY_FAIL,
            payload: error.message,
        });
        toast.current?.show({
            severity: 'error',
            summary: t("ERROR"),
            detail: t("COMPANY_UPDATE_FAILED"),
            life: 3000
        });
    }
};



export const _deleteSelectedCompanies = async (
  provinceIds: number[],
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => {
  const token = getAuthToken();

  try {
    for (const id of provinceIds) {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/companies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('COMPANIES_DELETED'),
      life: 3000,
    });
  } catch (error: any) {
    toast.current?.show({
      severity: 'error',
      summary: t('ERROR'),
      detail: t('COMPANIES_DELETE_FAILED'),
      life: 3000,
    });
  }
};
