// import { Dispatch } from 'redux';
// import axios from 'axios';
// import {
//   FETCH_PURCHASED_PRODUCTS_REQUEST,
//   FETCH_PURCHASED_PRODUCTS_SUCCESS,
//   FETCH_PURCHASED_PRODUCTS_FAIL,
//   ADD_PURCHASED_PRODUCT_REQUEST,
//   ADD_PURCHASED_PRODUCT_SUCCESS,
//   ADD_PURCHASED_PRODUCT_FAIL,
//   EDIT_PURCHASED_PRODUCT_REQUEST,
//   EDIT_PURCHASED_PRODUCT_SUCCESS,
//   EDIT_PURCHASED_PRODUCT_FAIL,
//   DELETE_PURCHASED_PRODUCT_REQUEST,
//   DELETE_PURCHASED_PRODUCT_SUCCESS,
//   DELETE_PURCHASED_PRODUCT_FAIL,
// } from '../constants/purchasedProductsConstants';
// import { PurchasedProduct } from '@/types/interface';
// import { Toast } from 'primereact/toast';

// const getAuthToken = (): string => {
//   return localStorage.getItem('api_token') || '';
// };

// // Fetch Purchased Products
// export const _fetchPurchasedProducts = () => async (dispatch: Dispatch) => {
//   dispatch({ type: FETCH_PURCHASED_PRODUCTS_REQUEST });
//   try {
//     const token = getAuthToken();
//     const response = await axios.get(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/purchased-products`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     dispatch({
//       type: FETCH_PURCHASED_PRODUCTS_SUCCESS,
//       payload: response.data.data.purchasedproducts,
//     });
//     //console.log(response)
//   } catch (error: any) {
//     dispatch({
//       type: FETCH_PURCHASED_PRODUCTS_FAIL,
//       payload: error.message || 'Failed to fetch purchased products',
//     });
//   }
// };

// // Add Purchased Product
// export const _addPurchasedProduct = (newProduct: PurchasedProduct,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: ADD_PURCHASED_PRODUCT_REQUEST });
//   try {
//     const token = getAuthToken();

//     const body={...newProduct,supplier_id:newProduct.supplier?.id,service_id:newProduct.service?.id}
//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/purchased-products`,
//       body,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     const newData={...newProduct,id:response.data.data.purchased_product.id}
//     dispatch({
//       type: ADD_PURCHASED_PRODUCT_SUCCESS,
//       payload: newData,
//     });
//     //console.log(response)
//     toast.current?.show({
//         severity: "success",
//         summary: "Successful",
//         detail: "Purchased Product added",
//         life: 3000,
//       });

//   } catch (error: any) {
//     dispatch({ type: ADD_PURCHASED_PRODUCT_FAIL, payload: error.message });
//     toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Purchased Product added fail",
//         life: 3000,
//       });
//   }
// };

// // Edit Purchased Product
// export const _editPurchasedProduct = (productId: number, updatedProduct: PurchasedProduct,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: EDIT_PURCHASED_PRODUCT_REQUEST });
//   try {
//     const token = getAuthToken();
//     const body={...updatedProduct,supplier_id:updatedProduct.supplier?.id,service_id:updatedProduct.service?.id}

//     const response = await axios.post(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/purchased-products/${productId}`,
//       body,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     const newData={...updatedProduct,id:response.data.data.purchased_product.id}
//     dispatch({ type: EDIT_PURCHASED_PRODUCT_SUCCESS, payload: newData });
//     toast.current?.show({
//         severity: "success",
//         summary: "Successful",
//         detail: "Purchased Product edited",
//         life: 3000,
//       });
//   } catch (error: any) {
//     dispatch({ type: EDIT_PURCHASED_PRODUCT_FAIL, payload: error.message });
//     toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Purchased Product edited fail",
//         life: 3000,
//       });
//   }
// };

// // Delete Purchased Product
// export const _deletePurchasedProduct = (productId: number,toast: React.RefObject<Toast>) => async (dispatch: Dispatch) => {
//   dispatch({ type: DELETE_PURCHASED_PRODUCT_REQUEST });
//   try {
//     const token = getAuthToken();
//     await axios.delete(
//       `${process.env.NEXT_PUBLIC_BASE_URL}/purchased-products/${productId}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     dispatch({ type: DELETE_PURCHASED_PRODUCT_SUCCESS, payload: productId });
//     toast.current?.show({
//         severity: "success",
//         summary: "Successful",
//         detail: "Purchased Product deleted",
//         life: 3000,
//       });
//   } catch (error: any) {
//     dispatch({ type: DELETE_PURCHASED_PRODUCT_FAIL, payload: error.message });
//     toast.current?.show({
//         severity: "error",
//         summary: "Error",
//         detail: "Purchased Product deleted fail",
//         life: 3000,
//       });
//   }
// };

import { Dispatch } from 'redux';
import axios from 'axios';
import {
  FETCH_PURCHASED_PRODUCTS_REQUEST,
  FETCH_PURCHASED_PRODUCTS_SUCCESS,
  FETCH_PURCHASED_PRODUCTS_FAIL,
  ADD_PURCHASED_PRODUCT_REQUEST,
  ADD_PURCHASED_PRODUCT_SUCCESS,
  ADD_PURCHASED_PRODUCT_FAIL,
  EDIT_PURCHASED_PRODUCT_REQUEST,
  EDIT_PURCHASED_PRODUCT_SUCCESS,
  EDIT_PURCHASED_PRODUCT_FAIL,
  DELETE_PURCHASED_PRODUCT_REQUEST,
  DELETE_PURCHASED_PRODUCT_SUCCESS,
  DELETE_PURCHASED_PRODUCT_FAIL,
} from '../constants/purchasedProductsConstants';
import { PurchasedProduct } from '@/types/interface';
import { Toast } from 'primereact/toast';

const getAuthToken = (): string => {
  return localStorage.getItem('api_token') || '';
};

// Fetch Purchased Products
export const _fetchPurchasedProducts = () => async (dispatch: Dispatch) => {
  dispatch({ type: FETCH_PURCHASED_PRODUCTS_REQUEST });
  try {
    const token = getAuthToken();
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/purchased-products`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch({
      type: FETCH_PURCHASED_PRODUCTS_SUCCESS,
      payload: response.data.data.purchasedproducts,
    });

    // Optional success toast
    // toast.current?.show({
    //   severity: "success",
    //   summary: t("SUCCESS"),
    //   detail: t("PURCHASED_PRODUCTS_FETCHED"),
    //   life: 3000,
    // });
  } catch (error: any) {
    dispatch({
      type: FETCH_PURCHASED_PRODUCTS_FAIL,
      payload: error.message ,
    });

  }
};

// Add Purchased Product
export const _addPurchasedProduct = (
  newProduct: PurchasedProduct,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: ADD_PURCHASED_PRODUCT_REQUEST });
  try {
    const token = getAuthToken();
    const body = {
      ...newProduct,
      supplier_id: newProduct.supplier?.id,
      service_id: newProduct.service?.id
    };

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/purchased-products`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newData = {
      ...newProduct,
      id: response.data.data.purchased_product.id
    };

    dispatch({ type: ADD_PURCHASED_PRODUCT_SUCCESS, payload: newData });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("PURCHASED_PRODUCT_ADDED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: ADD_PURCHASED_PRODUCT_FAIL,
      payload: error.message || t("PURCHASED_PRODUCT_ADD_FAILED")
    });

    let errorMessage = t("PURCHASED_PRODUCT_ADD_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      errorMessage = Object.values(error.response.data.errors)
        .flat()
        .join(', ') || t("VALIDATION_FAILED");
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

// Edit Purchased Product
export const _editPurchasedProduct = (
  productId: number,
  updatedProduct: PurchasedProduct,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: EDIT_PURCHASED_PRODUCT_REQUEST });
  try {
    const token = getAuthToken();
    const body = {
      ...updatedProduct,
      supplier_id: updatedProduct.supplier?.id,
      service_id: updatedProduct.service?.id
    };

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/purchased-products/${productId}`,
      body,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newData = {
      ...updatedProduct,
      id: response.data.data.purchased_product.id
    };

    dispatch({ type: EDIT_PURCHASED_PRODUCT_SUCCESS, payload: newData });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("PURCHASED_PRODUCT_UPDATED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: EDIT_PURCHASED_PRODUCT_FAIL,
      payload: error.message || t("PURCHASED_PRODUCT_UPDATE_FAILED")
    });

    let errorMessage = t("PURCHASED_PRODUCT_UPDATE_FAILED");
    if (error.response?.status === 422 && error.response.data?.errors) {
      errorMessage = Object.values(error.response.data.errors)
        .flat()
        .join(', ') || t("VALIDATION_FAILED");
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

// Delete Purchased Product
export const _deletePurchasedProduct = (
  productId: number,
  toast: React.RefObject<Toast>,
  t: (key: string) => string
) => async (dispatch: Dispatch) => {
  dispatch({ type: DELETE_PURCHASED_PRODUCT_REQUEST });
  try {
    const token = getAuthToken();
    await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/purchased-products/${productId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    dispatch({ type: DELETE_PURCHASED_PRODUCT_SUCCESS, payload: productId });
    toast.current?.show({
      severity: "success",
      summary: t("SUCCESS"),
      detail: t("PURCHASED_PRODUCT_DELETED"),
      life: 3000,
    });
  } catch (error: any) {
    dispatch({
      type: DELETE_PURCHASED_PRODUCT_FAIL,
      payload: error.message || t("PURCHASED_PRODUCT_DELETE_FAILED")
    });
    toast.current?.show({
      severity: "error",
      summary: t("ERROR"),
      detail: t("PURCHASED_PRODUCT_DELETE_FAILED"),
      life: 3000,
    });
  }
};
