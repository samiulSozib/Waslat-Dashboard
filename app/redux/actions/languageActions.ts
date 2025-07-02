// // store/actions/languageActions.ts
// import { Dispatch } from "redux";
// import axios from "axios";

// import {
//   FETCH_LANGUAGES_REQUEST,
//   FETCH_LANGUAGES_SUCCESS,
//   FETCH_LANGUAGES_FAIL,
//   ADD_LANGUAGE_REQUEST,
//   ADD_LANGUAGE_SUCCESS,
//   ADD_LANGUAGE_FAIL,
//   EDIT_LANGUAGE_REQUEST,
//   EDIT_LANGUAGE_SUCCESS,
//   EDIT_LANGUAGE_FAIL,
//   DELETE_LANGUAGE_REQUEST,
//   DELETE_LANGUAGE_SUCCESS,
//   DELETE_LANGUAGE_FAIL,
// } from "../constants/languageConstants";
// import { Language } from "@/types/interface";
// import { Toast } from "primereact/toast";

// const getAuthToken = () => {
//   return localStorage.getItem("api_token") || ""; // Retrieve the token from localStorage
// };

// // Fetch languages
// export const _fetchLanguages = () => async (dispatch: Dispatch) => {
//   dispatch({ type: FETCH_LANGUAGES_REQUEST });

//   try {
//     const token = getAuthToken();
//     const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/languages`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     dispatch({ type: FETCH_LANGUAGES_SUCCESS, payload: response.data.data.languages });
//   } catch (error: any) {
//     dispatch({ type: FETCH_LANGUAGES_FAIL, payload: error.message });
//   }
// };

// // Add a language
// export const _addLanguage = (languageData: Language,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: ADD_LANGUAGE_REQUEST });

//   try {
//     const token = getAuthToken();
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/languages`,
//       languageData,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     dispatch({ type: ADD_LANGUAGE_SUCCESS, payload: response.data.data.language });
//     toast.current?.show({
//         severity: "success",
//         summary: "Successful",
//         detail: "Language added",
//         life: 3000,
//       });
//   } catch (error: any) {
//     dispatch({ type: ADD_LANGUAGE_FAIL, payload: error.message });
//     toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Failed to add language",
//         life: 3000,
//       });
//   }
// };

// // Edit a language
// export const _editLanguage = (languageId: number, languageData: Language,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: EDIT_LANGUAGE_REQUEST });

//   try {
//     const token = getAuthToken();
//     const response = await axios.put(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/languages/${languageId}`,
//       languageData,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     dispatch({ type: EDIT_LANGUAGE_SUCCESS, payload: response.data.data.language });
//     toast.current?.show({
//         severity: "success",
//         summary: "Successful",
//         detail: "Language edited",
//         life: 3000,
//       });
//   } catch (error: any) {
//     dispatch({ type: EDIT_LANGUAGE_FAIL, payload: error.message });
//     toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Failed to edit language",
//         life: 3000,
//       });
//   }
// };

// // Delete a language
// export const _deleteLanguage = (languageId: number,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: DELETE_LANGUAGE_REQUEST });

//   try {
//     const token = getAuthToken();
//     await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/languages/${languageId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     dispatch({ type: DELETE_LANGUAGE_SUCCESS, payload: languageId });
//     toast.current?.show({
//         severity: "success",
//         summary: "Successful",
//         detail: "Language deleted",
//         life: 3000,
//       });
//   } catch (error: any) {
//     dispatch({ type: DELETE_LANGUAGE_FAIL, payload: error.message });
//     toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Failed to delete language",
//         life: 3000,
//       });
//   }
// };


// store/actions/languageActions.ts
import { Dispatch } from "redux";
import axios from "axios";

import {
  FETCH_LANGUAGES_REQUEST,
  FETCH_LANGUAGES_SUCCESS,
  FETCH_LANGUAGES_FAIL,
  ADD_LANGUAGE_REQUEST,
  ADD_LANGUAGE_SUCCESS,
  ADD_LANGUAGE_FAIL,
  EDIT_LANGUAGE_REQUEST,
  EDIT_LANGUAGE_SUCCESS,
  EDIT_LANGUAGE_FAIL,
  DELETE_LANGUAGE_REQUEST,
  DELETE_LANGUAGE_SUCCESS,
  DELETE_LANGUAGE_FAIL,
} from "../constants/languageConstants";
import { Language } from "@/types/interface";
import { Toast } from "primereact/toast";

const getAuthToken = () => {
  return localStorage.getItem("api_token") || "";
};

// Fetch languages
export const _fetchLanguages = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_LANGUAGES_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/languages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: FETCH_LANGUAGES_SUCCESS, payload: response.data.data.languages });

  } catch (error: any) {
    dispatch({ type: FETCH_LANGUAGES_FAIL, payload: error.message });

  }
};

// Add a language
export const _addLanguage = (languageData: Language, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_LANGUAGE_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/languages`,
      languageData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({ type: ADD_LANGUAGE_SUCCESS, payload: response.data.data.language });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("LANGUAGE_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: ADD_LANGUAGE_FAIL, payload: error.message });

    let errorMessage = t("LANGUAGE_ADD_FAILED");
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

// Edit a language
export const _editLanguage = (languageId: number, languageData: Language, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_LANGUAGE_REQUEST });

  try {
    const token = getAuthToken();
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URL}/languages/${languageId}`,
      languageData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch({ type: EDIT_LANGUAGE_SUCCESS, payload: response.data.data.language });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("LANGUAGE_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: EDIT_LANGUAGE_FAIL, payload: error.message });

    let errorMessage = t("LANGUAGE_UPDATE_FAILED");
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

// Delete a language
export const _deleteLanguage = (languageId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_LANGUAGE_REQUEST });

  try {
    const token = getAuthToken();
    await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/languages/${languageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: DELETE_LANGUAGE_SUCCESS, payload: languageId });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("LANGUAGE_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({ type: DELETE_LANGUAGE_FAIL, payload: error.message });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("LANGUAGE_DELETE_FAILED"),
      life: 3000,
    });
  }
};
