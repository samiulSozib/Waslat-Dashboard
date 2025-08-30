// // store/actions/provinceActions.ts
// import { Dispatch } from 'redux';
// import axios from 'axios';

// import {
//     FETCH_PROVINCES_REQUEST,
//     FETCH_PROVINCES_SUCCESS,
//     FETCH_PROVINCES_FAIL,
//     ADD_PROVINCE_REQUEST,
//     ADD_PROVINCE_SUCCESS,
//     ADD_PROVINCE_FAIL,
//     EDIT_PROVINCE_REQUEST,
//     EDIT_PROVINCE_SUCCESS,
//     EDIT_PROVINCE_FAIL,
//     DELETE_PROVINCE_REQUEST,
//     DELETE_PROVINCE_SUCCESS,
//     DELETE_PROVINCE_FAIL,
// } from '../constants/provinceConstants';
// import { Toast } from 'primereact/toast';
// import { Province } from '@/types/interface';

// const getAuthToken = () => {
//     return localStorage.getItem('api_token') || ''; // Retrieve the token from localStorage
// };

// // Fetch provinces
// export const _fetchProvinces = () => async (dispatch: Dispatch) => {
//     dispatch({ type: FETCH_PROVINCES_REQUEST });

//     try {
//         const token = getAuthToken();
//         const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/provinces`, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });

//         dispatch({ type: FETCH_PROVINCES_SUCCESS, payload: response.data.data.provinces });
//     } catch (error: any) {
//         dispatch({ type: FETCH_PROVINCES_FAIL, payload: error.message });
//     }
// };

// // Add a province
// export const _addProvince = (provinceData: Province,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//     dispatch({ type: ADD_PROVINCE_REQUEST });
//     const body={...provinceData,country_id:provinceData.country?.id}
//     try {
//         const token = getAuthToken();
//         const response = await axios.post(
//             `${process.env.NEXT_PUBLIC_BASE_URL}/provinces`,
//             body,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );
//         const newData={...provinceData,id:response.data.data.province.id}
//         dispatch({ type: ADD_PROVINCE_SUCCESS, payload: newData });
//         toast.current?.show({
//             severity: "success",
//             summary: "Successful",
//             detail: "Province added",
//             life: 3000,
//           });
//     } catch (error: any) {
//         dispatch({ type: ADD_PROVINCE_FAIL, payload: error.message });
//         toast.current?.show({
//             severity: "error",
//             summary: "Error",
//             detail: "Failed to add province",
//             life: 3000,
//           });
//     }
// };

// // Edit a province
// export const _editProvince = (provinceId: number, provinceData: Province,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//     dispatch({ type: EDIT_PROVINCE_REQUEST });

//     try {
//         const token = getAuthToken();
//         const body={...provinceData,country_id:provinceData.country?.id}
//         const response = await axios.put(
//             `${process.env.NEXT_PUBLIC_BASE_URL}/provinces/${provinceId}`,
//             body,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );
//         const newData={...provinceData,id:response.data.data.province.id}
//         dispatch({ type: EDIT_PROVINCE_SUCCESS, payload: newData });
//         toast.current?.show({
//             severity: "success",
//             summary: "Successful",
//             detail: "Province edited",
//             life: 3000,
//           });
//     } catch (error: any) {
//         dispatch({ type: EDIT_PROVINCE_FAIL, payload: error.message });
//         toast.current?.show({
//             severity: "error",
//             summary: "Error",
//             detail: "Failed to edit province",
//             life: 3000,
//           });
//     }
// };

// // Delete a province
// export const _deleteProvince = (provinceId: number,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//     dispatch({ type: DELETE_PROVINCE_REQUEST });

//     try {
//         const token = getAuthToken();
//         await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/provinces/${provinceId}`, {
//             headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//         });

//         dispatch({ type: DELETE_PROVINCE_SUCCESS, payload: provinceId });
//         toast.current?.show({
//             severity: "success",
//             summary: "Successful",
//             detail: "Province deleted",
//             life: 3000,
//           });
//     } catch (error: any) {
//         dispatch({ type: DELETE_PROVINCE_FAIL, payload: error.message });
//         toast.current?.show({
//             severity: "error",
//             summary: "Error",
//             detail: "Failed to delete province",
//             life: 3000,
//           });
//     }
// };
import { Dispatch } from 'redux';
import axios from 'axios';
import {
    FETCH_PROVINCES_REQUEST,
    FETCH_PROVINCES_SUCCESS,
    FETCH_PROVINCES_FAIL,
    ADD_PROVINCE_REQUEST,
    ADD_PROVINCE_SUCCESS,
    ADD_PROVINCE_FAIL,
    EDIT_PROVINCE_REQUEST,
    EDIT_PROVINCE_SUCCESS,
    EDIT_PROVINCE_FAIL,
    DELETE_PROVINCE_REQUEST,
    DELETE_PROVINCE_SUCCESS,
    DELETE_PROVINCE_FAIL,
} from '../constants/provinceConstants';
import { Toast } from 'primereact/toast';
import { Province } from '@/types/interface';

const getAuthToken = () => {
    return localStorage.getItem('api_token') || '';
};

// Fetch provinces
export const _fetchProvinces = () => async (dispatch: Dispatch) => {
    dispatch({ type: FETCH_PROVINCES_REQUEST });

    try {
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/provinces`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        dispatch({
            type: FETCH_PROVINCES_SUCCESS,
            payload: response.data.data.provinces
        });

    } catch (error: any) {
        dispatch({
            type: FETCH_PROVINCES_FAIL,
            payload: error.message
        });

    }
};

// Add a province
export const _addProvince = (
    provinceData: Province,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => async (dispatch: Dispatch) => {
    dispatch({ type: ADD_PROVINCE_REQUEST });
    const body = {
        ...provinceData,
        country_id: provinceData.country?.id
    };

    try {
        const token = getAuthToken();
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/provinces`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const newData = {
            ...provinceData,
            id: response.data.data.province.id
        };

        dispatch({
            type: ADD_PROVINCE_SUCCESS,
            payload: newData
        });

        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("PROVINCE_ADDED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({
            type: ADD_PROVINCE_FAIL,
            payload: error.message
        });

        let errorMessage = t("PROVINCE_ADD_FAILED");
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

// Edit a province
export const _editProvince = (
    provinceId: number,
    provinceData: Province,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => async (dispatch: Dispatch) => {
    dispatch({ type: EDIT_PROVINCE_REQUEST });
    const body = {
        ...provinceData,
        country_id: provinceData.country?.id
    };

    try {
        const token = getAuthToken();
        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}/provinces/${provinceId}`,
            body,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const newData = {
            ...provinceData,
            id: response.data.data.province.id
        };

        dispatch({
            type: EDIT_PROVINCE_SUCCESS,
            payload: newData
        });

        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("PROVINCE_UPDATED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({
            type: EDIT_PROVINCE_FAIL,
            payload: error.message
        });

        let errorMessage = t("PROVINCE_UPDATE_FAILED");
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

// Delete a province
export const _deleteProvince = (
    provinceId: number,
    toast: React.RefObject<Toast>,
    t: (key: string) => string
) => async (dispatch: Dispatch) => {
    dispatch({ type: DELETE_PROVINCE_REQUEST });

    try {
        const token = getAuthToken();
        await axios.delete(
            `${process.env.NEXT_PUBLIC_BASE_URL}/provinces/${provinceId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        dispatch({
            type: DELETE_PROVINCE_SUCCESS,
            payload: provinceId
        });

        toast.current?.show({
            severity: "success",
            summary: t("SUCCESS"),
            detail: t("PROVINCE_DELETED"),
            life: 3000,
        });
    } catch (error: any) {
        dispatch({
            type: DELETE_PROVINCE_FAIL,
            payload: error.message
        });

        toast.current?.show({
            severity: "error",
            summary: t("ERROR"),
            detail: t("PROVINCE_DELETE_FAILED"),
            life: 3000,
        });
    }
};




export const _deleteSelectedProvinces = async (
  provinceIds: number[],
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => {
  const token = getAuthToken();

  try {
    for (const id of provinceIds) {
      await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/provinces/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    toast.current?.show({
      severity: 'success',
      summary: t('SUCCESS'),
      detail: t('PROVINCES_DELETED'),
      life: 3000,
    });
  } catch (error: any) {
    toast.current?.show({
      severity: 'error',
      summary: t('ERROR'),
      detail: t('PROVINCES_DELETE_FAILED'),
      life: 3000,
    });
  }
};
