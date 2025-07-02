import {
  ADD_GROUP_PRICING_FAIL,
  ADD_GROUP_PRICING_REQUEST,
  ADD_GROUP_PRICING_SUCCESS,
  DELETE_GROUP_PRICING_FAIL,
  DELETE_GROUP_PRICING_REQUEST,
  DELETE_GROUP_PRICING_SUCCESS,
  EDIT_GROUP_PRICING_FAIL,
  EDIT_GROUP_PRICING_REQUEST,
  EDIT_GROUP_PRICING_SUCCESS,
  FETCH_GROUP_PRICING_LIST_FAIL,
  FETCH_GROUP_PRICING_LIST_REQUEST,
  FETCH_GROUP_PRICING_LIST_SUCCESS
} from "../constants/groupPricing";

import { GroupPricing } from "@/types/interface";

interface GroupPricingState {
  loading: boolean;
  groupPricings: GroupPricing[];
  error: string | null;
}

const initialState: GroupPricingState = {
  loading: false,
  groupPricings: [],
  error: null,
};

export const groupPricingReducer = (
  state = initialState,
  action: any
): GroupPricingState => {
  switch (action.type) {
    case FETCH_GROUP_PRICING_LIST_REQUEST:
    case DELETE_GROUP_PRICING_REQUEST:
    case ADD_GROUP_PRICING_REQUEST:
    case EDIT_GROUP_PRICING_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_GROUP_PRICING_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        groupPricings: action.payload.data,
      };

    case ADD_GROUP_PRICING_SUCCESS:
      return {
        ...state,
        loading: false,
        groupPricings: [...state.groupPricings, action.payload]
      };

    case EDIT_GROUP_PRICING_SUCCESS:
      return {
        ...state,
        loading: false,
        groupPricings: state.groupPricings.map((pricing) =>
          pricing.id === action.payload.id ? action.payload : pricing
        ),
      };

    case DELETE_GROUP_PRICING_SUCCESS:
      return {
        ...state,
        loading: false,
        groupPricings: state.groupPricings.filter(
          (pricing) => pricing.id !== action.payload
        ),
      };

    case FETCH_GROUP_PRICING_LIST_FAIL:
    case DELETE_GROUP_PRICING_FAIL:
    case ADD_GROUP_PRICING_FAIL:
    case EDIT_GROUP_PRICING_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    default:
      return state;
  }
};
