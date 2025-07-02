import {
    FETCH_GROUP_DISCOUNTS_REQUEST,
    FETCH_GROUP_DISCOUNTS_SUCCESS,
    FETCH_GROUP_DISCOUNTS_FAIL,
    ADD_GROUP_DISCOUNT_REQUEST,
    ADD_GROUP_DISCOUNT_SUCCESS,
    ADD_GROUP_DISCOUNT_FAIL,
    EDIT_GROUP_DISCOUNT_REQUEST,
    EDIT_GROUP_DISCOUNT_SUCCESS,
    EDIT_GROUP_DISCOUNT_FAIL,
    DELETE_GROUP_DISCOUNT_REQUEST,
    DELETE_GROUP_DISCOUNT_SUCCESS,
    DELETE_GROUP_DISCOUNT_FAIL,
  } from "../constants/groupDiscountConstants";

  import { GroupDiscount } from "@/types/interface";

  interface GroupDiscountState {
    loading: boolean;
    group_discounts: GroupDiscount[];
    error: string | null;
  }

  const initialState: GroupDiscountState = {
    loading: false,
    group_discounts: [],
    error: null,
  };

  export const groupDiscountReducer = (
    state = initialState,
    action: { type: string; payload?: any }
  ): GroupDiscountState => {
    switch (action.type) {
      // Fetch GROUP_DISCOUNTs
      case FETCH_GROUP_DISCOUNTS_REQUEST:
        return { ...state, loading: true, error: null };

      case FETCH_GROUP_DISCOUNTS_SUCCESS:
        return { ...state, loading: false, group_discounts: action.payload };

      case FETCH_GROUP_DISCOUNTS_FAIL:
        return { ...state, loading: false, error: action.payload };

      // Add a GROUP_DISCOUNT
      case ADD_GROUP_DISCOUNT_REQUEST:
        return { ...state, loading: true };

      case ADD_GROUP_DISCOUNT_SUCCESS:
        return { ...state, loading: false, group_discounts: [...state.group_discounts, action.payload] };

      case ADD_GROUP_DISCOUNT_FAIL:
        return { ...state, loading: false, error: action.payload };

      // Edit a GROUP_DISCOUNT
      case EDIT_GROUP_DISCOUNT_REQUEST:
        return { ...state, loading: true };

      case EDIT_GROUP_DISCOUNT_SUCCESS:
        return {
          ...state,
          loading: false,
          group_discounts: state.group_discounts.map((GROUP_DISCOUNT) =>
            GROUP_DISCOUNT.id === action.payload.id ? action.payload : GROUP_DISCOUNT
          ),
        };

      case EDIT_GROUP_DISCOUNT_FAIL:
        return { ...state, loading: false, error: action.payload };

      // Delete a GROUP_DISCOUNT
      case DELETE_GROUP_DISCOUNT_REQUEST:
        return { ...state, loading: true };

      case DELETE_GROUP_DISCOUNT_SUCCESS:
        return {
          ...state,
          loading: false,
          group_discounts: state.group_discounts.filter((GROUP_DISCOUNT) => GROUP_DISCOUNT.id !== action.payload),
        };

      case DELETE_GROUP_DISCOUNT_FAIL:
        return { ...state, loading: false, error: action.payload };

      // Default case
      default:
        return state;
    }
  };
