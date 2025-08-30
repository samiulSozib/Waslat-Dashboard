// import { Dispatch } from "redux";
// import axios from "axios";

// import {
//   FETCH_SERVICE_CATEGORY_LIST_REQUEST,
//   FETCH_SERVICE_CATEGORY_LIST_SUCCESS,
//   FETCH_SERVICE_CATEGORY_LIST_FAIL,
//   DELETE_SERVICE_CATEGORY_REQUEST,
//   DELETE_SERVICE_CATEGORY_SUCCESS,
//   DELETE_SERVICE_CATEGORY_FAIL,
//   ADD_SERVICE_CATEGORY_REQUEST,
//   ADD_SERVICE_CATEGORY_SUCCESS,
//   ADD_SERVICE_CATEGORY_FAIL,
//   EDIT_SERVICE_CATEGORY_REQUEST,
//   EDIT_SERVICE_CATEGORY_SUCCESS,
//   EDIT_SERVICE_CATEGORY_FAIL,
// } from "../constants/serviceCategoryConstants";
// import { Toast } from "primereact/toast";
// import { ServiceCategory } from "@/types/interface";

// const getAuthToken = () => {
//     return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
//   };

// // FETCH SERVICE CATEGORIES
// export const _fetchServiceCategories = () => async (dispatch: Dispatch) => {
//   dispatch({ type: FETCH_SERVICE_CATEGORY_LIST_REQUEST });

//   try {
//     const token = getAuthToken();
//     const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/service_categories`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     dispatch({ type: FETCH_SERVICE_CATEGORY_LIST_SUCCESS, payload: response.data.data.servicecategories });
//   } catch (error: any) {
//     dispatch({ type: FETCH_SERVICE_CATEGORY_LIST_FAIL, payload: error.message });
//   }
// };

// // DELETE SERVICE CATEGORY
// export const _deleteServiceCategory = (categoryId: number, toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: DELETE_SERVICE_CATEGORY_REQUEST });

//   try {
//     const token = getAuthToken();
//     await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/service_categories/${categoryId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     dispatch({ type: DELETE_SERVICE_CATEGORY_SUCCESS, payload: categoryId });
//     toast.current?.show({
//       severity: "success",
//       summary: "Successful",
//       detail: "Service category deleted",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({ type: DELETE_SERVICE_CATEGORY_FAIL, payload: error.message });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to delete service category",
//       life: 3000,
//     });
//   }
// };

// // ADD SERVICE CATEGORY
// export const _addServiceCategory = (newCategory: Partial<ServiceCategory>, toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: ADD_SERVICE_CATEGORY_REQUEST });

//   try {
//     //console.log(newCategory)
//     const body={
//         category_name:newCategory.category_name,
//         type:newCategory.type
//     }
//     const token = getAuthToken();
//     const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/service_categories`, body, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });
//     //console.log(response)

//     dispatch({ type: ADD_SERVICE_CATEGORY_SUCCESS, payload: response.data.data.servicecategory });
//     toast.current?.show({
//       severity: "success",
//       summary: "Successful",
//       detail: "Service category added",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({ type: ADD_SERVICE_CATEGORY_FAIL, payload: error.message });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to add service category",
//       life: 3000,
//     });
//   }
// };

// // EDIT SERVICE CATEGORY
// export const _editServiceCategory = (updatedCategory: ServiceCategory, toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: EDIT_SERVICE_CATEGORY_REQUEST });

//   try {
//     const body={
//         category_name:updatedCategory.category_name,
//         type:updatedCategory.type
//     }
//     const token = getAuthToken();
//     const response = await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/service_categories/${updatedCategory.id}`, body, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     dispatch({ type: EDIT_SERVICE_CATEGORY_SUCCESS, payload: response.data.data.servicecategory });
//     toast.current?.show({
//       severity: "success",
//       summary: "Successful",
//       detail: "Service category updated",
//       life: 3000,
//     });
//   } catch (error: any) {
//     dispatch({ type: EDIT_SERVICE_CATEGORY_FAIL, payload: error.message });
//     toast.current?.show({
//       severity: "error",
//       summary: "Error",
//       detail: "Failed to update service category",
//       life: 3000,
//     });
//   }
// };

import { Dispatch } from "redux";
import axios from "axios";
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
} from "../constants/serviceCategoryConstants";
import { Toast } from "primereact/toast";
import { ServiceCategory } from "@/types/interface";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || "";
};

// Fetch Service Categories
export const _fetchServiceCategories = (
) => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_SERVICE_CATEGORY_LIST_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/service_categories`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: FETCH_SERVICE_CATEGORY_LIST_SUCCESS,
      payload: response.data.data.servicecategories,
    });


  } catch (error: any) {
    dispatch({
      type: FETCH_SERVICE_CATEGORY_LIST_FAIL,
      payload: error.message,
    });


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
    const formData=new FormData()
    formData.append('category_name',newCategory.category_name)
    formData.append('type',newCategory.type)

    if (newCategory.category_image_url && typeof newCategory.category_image_url !== 'string') {
        formData.append('category_image_url', newCategory.category_image_url);
    }

    formData.append("input_form_schema",JSON.stringify(newCategory.input_form_schema))



    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/service_categories`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    dispatch({
      type: ADD_SERVICE_CATEGORY_SUCCESS,
      payload: response.data.data.servicecategory,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("SERVICE_CATEGORY_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: ADD_SERVICE_CATEGORY_FAIL,
      payload: error.message,
    });

    let errorMessage = t("SERVICE_CATEGORY_ADD_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .flat()
        .join(', ');
      errorMessage = errorMessages || t("VALIDATION_FAILED");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage,
      life: 3000,
    });
  }
};

// Edit Service Category
export const _editServiceCategory = (
  updatedCategory: ServiceCategory,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_SERVICE_CATEGORY_REQUEST });

  try {
   const formData=new FormData()
    formData.append('category_name',updatedCategory.category_name)
    formData.append('type',updatedCategory.type)

    if (updatedCategory.category_image_url && typeof updatedCategory.category_image_url !== 'string') {
        formData.append('category_image_url', updatedCategory.category_image_url);
    }
        formData.append("input_form_schema",JSON.stringify(updatedCategory.input_form_schema))


    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/service_categories/${updatedCategory.id}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log(response)
    const data=response.data.data.servicecategory
    dispatch({
      type: EDIT_SERVICE_CATEGORY_SUCCESS,
      payload: data,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("SERVICE_CATEGORY_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    console.log(error)
    dispatch({
      type: EDIT_SERVICE_CATEGORY_FAIL,
      payload: error.message,
    });

    let errorMessage = t("SERVICE_CATEGORY_UPDATE_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors)
        .flat()
        .join(', ');
      errorMessage = errorMessages || t("VALIDATION_FAILED");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage,
      life: 3000,
    });
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
    const token = getAuthToken();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/service_categories/${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({
      type: DELETE_SERVICE_CATEGORY_SUCCESS,
      payload: categoryId,
    });

    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("SERVICE_CATEGORY_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: DELETE_SERVICE_CATEGORY_FAIL,
      payload: error.message,
    });

    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("SERVICE_CATEGORY_DELETE_FAILED"),
      life: 3000,
    });
  }
};


export const _deleteSelectedServiceCategories = async (
  serviceCategoriesIds: number[],
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => {
  const token = getAuthToken();

  try {
    for (const id of serviceCategoriesIds) {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/service_categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('SERVICE_CATEGORIES_DELETED'),
      life: 3000,
    });
  } catch (error: any) {
    toast.current?.show({
      severity: 'error',
      summary: t('ERROR'),
      detail: t('SERVICE_CATEGORIES_DELETE_FAILED'),
      life: 3000,
    });
  }
};
