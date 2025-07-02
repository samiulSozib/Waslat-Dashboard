// import { Dispatch } from 'redux';
// import axios from 'axios';
// import {
//   FETCH_SUPPLIERS_REQUEST,
//   FETCH_SUPPLIERS_SUCCESS,
//   FETCH_SUPPLIERS_FAIL,
//   ADD_SUPPLIER_REQUEST,
//   ADD_SUPPLIER_SUCCESS,
//   ADD_SUPPLIER_FAIL,
//   EDIT_SUPPLIER_REQUEST,
//   EDIT_SUPPLIER_SUCCESS,
//   EDIT_SUPPLIER_FAIL,
//   DELETE_SUPPLIER_REQUEST,
//   DELETE_SUPPLIER_SUCCESS,
//   DELETE_SUPPLIER_FAIL,
// } from '../constants/supplierConstants';
// import { Supplier } from '@/types/interface';

// const getAuthToken = (): string => {
//   return localStorage.getItem('api_token') || '';
// };

// // Fetch Suppliers
// export const _fetchSuppliers = (search:string='') => async (dispatch: Dispatch) => {
//   dispatch({ type: FETCH_SUPPLIERS_REQUEST });
//   try {
//     const token = getAuthToken();
//     const response = await axios.get(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/suppliers?search=${search}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     dispatch({
//       type: FETCH_SUPPLIERS_SUCCESS,
//       payload: response.data.data.suppliers,
//     });
//     //console.log(response)
//   } catch (error: any) {
//     dispatch({
//       type: FETCH_SUPPLIERS_FAIL,
//       payload: error.message || 'Failed to fetch suppliers',
//     });
//   }
// };

// // Add Supplier
// export const _addSupplier = (newSupplier: Supplier,toast: React.RefObject<any>) => async (dispatch: Dispatch) => {
//   dispatch({ type: ADD_SUPPLIER_REQUEST });
//   try {
//     const token = getAuthToken();
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/suppliers`,
//       newSupplier,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     dispatch({ type: ADD_SUPPLIER_SUCCESS, payload: response.data.data.supplier });
//     toast.current?.show({
//         severity: "success",
//         summary: "Success",
//         detail: "Supplier Added successfully!",
//         life: 3000,
//       });
//   } catch (error: any) {
//     dispatch({ type: ADD_SUPPLIER_FAIL, payload: error.message });
//     toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Supplier Added fail!",
//         life: 3000,
//       });
//   }
// };

// // Edit Supplier
// export const _editSupplier = (supplierId: number, updatedSupplier: Supplier,toast: React.RefObject<any>) => async (dispatch: Dispatch) => {
//   dispatch({ type: EDIT_SUPPLIER_REQUEST });
//   try {
//     const token = getAuthToken();
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/suppliers/${supplierId}`,
//       updatedSupplier,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     dispatch({ type: EDIT_SUPPLIER_SUCCESS, payload: response.data.data.supplier });
//     toast.current?.show({
//         severity: "success",
//         summary: "Success",
//         detail: "Supplier edited successfully!",
//         life: 3000,
//       });
//   } catch (error: any) {
//     dispatch({ type: EDIT_SUPPLIER_FAIL, payload: error.message });
//     toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Supplier edited fail!",
//         life: 3000,
//       });
//   }
// };

// // Delete Supplier
// export const _deleteSupplier = (supplierId: number,toast: React.RefObject<any>) => async (dispatch: Dispatch) => {
//   dispatch({ type: DELETE_SUPPLIER_REQUEST });
//   try {
//     const token = getAuthToken();
//     await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL}/suppliers/${supplierId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     dispatch({ type: DELETE_SUPPLIER_SUCCESS, payload: supplierId });
//     toast.current?.show({
//         severity: "success",
//         summary: "Success",
//         detail: "Supplier deleted successfully!",
//         life: 3000,
//       });
//   } catch (error: any) {
//     dispatch({ type: DELETE_SUPPLIER_FAIL, payload: error.message });
//     toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Supplier deleted fail!",
//         life: 3000,
//       });
//   }
// };


import { Dispatch } from 'redux';
import axios from 'axios';
import {
  FETCH_SUPPLIERS_REQUEST,
  FETCH_SUPPLIERS_SUCCESS,
  FETCH_SUPPLIERS_FAIL,
  ADD_SUPPLIER_REQUEST,
  ADD_SUPPLIER_SUCCESS,
  ADD_SUPPLIER_FAIL,
  EDIT_SUPPLIER_REQUEST,
  EDIT_SUPPLIER_SUCCESS,
  EDIT_SUPPLIER_FAIL,
  DELETE_SUPPLIER_REQUEST,
  DELETE_SUPPLIER_SUCCESS,
  DELETE_SUPPLIER_FAIL,
} from '../constants/supplierConstants';
import { Toast } from 'primereact/toast';
import { Supplier } from '@/types/interface';

const getAuthToken = (): string => localStorage.getItem('api_token') || '';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Fetch Suppliers
export const _fetchSuppliers = (search: string = '') => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_SUPPLIERS_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${BASE_URL}/suppliers?search=${search}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch({
      type: FETCH_SUPPLIERS_SUCCESS,
      payload: response.data.data.suppliers,
    });

    // Optional success toast
    // toast.current?.show({
    //   severity: "success",
    //   summary: t("SUCCESS"),
    //   detail: t("SUPPLIERS_FETCHED"),
    //   life: 3000,
    // });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message ;
    dispatch({ type: FETCH_SUPPLIERS_FAIL, payload: errorMessage });

  }
};

// Add Supplier
export const _addSupplier = (newSupplier: Supplier, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_SUPPLIER_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${BASE_URL}/suppliers`,
      newSupplier,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch({ type: ADD_SUPPLIER_SUCCESS, payload: response.data.data.supplier });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("SUPPLIER_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    let errorMessage = t("SUPPLIER_ADD_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      errorMessage = Object.values(error.response.data.errors)
        .flat()
        .join(', ') || t("VALIDATION_FAILED");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    dispatch({ type: ADD_SUPPLIER_FAIL, payload: errorMessage });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage,
      life: 3000,
    });
  }
};

// Edit Supplier
export const _editSupplier = (supplierId: number, updatedSupplier: Supplier, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_SUPPLIER_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.post(
      `${BASE_URL}/suppliers/${supplierId}`,
      updatedSupplier,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch({ type: EDIT_SUPPLIER_SUCCESS, payload: response.data.data.supplier });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("SUPPLIER_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    let errorMessage = t("SUPPLIER_UPDATE_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      errorMessage = Object.values(error.response.data.errors)
        .flat()
        .join(', ') || t("VALIDATION_FAILED");
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    dispatch({ type: EDIT_SUPPLIER_FAIL, payload: errorMessage });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage,
      life: 3000,
    });
  }
};

// Delete Supplier
export const _deleteSupplier = (supplierId: number, toast: React.RefObject<Toast>, t: (key: string) => string) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_SUPPLIER_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(`${BASE_URL}/suppliers/${supplierId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    dispatch({ type: DELETE_SUPPLIER_SUCCESS, payload: supplierId });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("SUPPLIER_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || t("SUPPLIER_DELETE_FAILED");
    dispatch({ type: DELETE_SUPPLIER_FAIL, payload: errorMessage });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: errorMessage,
      life: 3000,
    });
  }
};
