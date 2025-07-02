import {
    FETCH_RESELLER_GROUP_LIST_REQUEST,
    FETCH_RESELLER_GROUP_LIST_SUCCESS,
    FETCH_RESELLER_GROUP_LIST_FAIL,
    DELETE_RESELLER_GROUP_REQUEST,
    DELETE_RESELLER_GROUP_SUCCESS,
    DELETE_RESELLER_GROUP_FAIL,
    ADD_RESELLER_GROUP_REQUEST,
    ADD_RESELLER_GROUP_SUCCESS,
    ADD_RESELLER_GROUP_FAIL,
    EDIT_RESELLER_GROUP_REQUEST,
    EDIT_RESELLER_GROUP_SUCCESS,
    EDIT_RESELLER_GROUP_FAIL,
  } from "../constants/resellerGroupConstants";
  import { ResellerGroup } from "@/types/interface";

  interface ResellerGroupState {
    loading: boolean;
    reseller_groups: ResellerGroup[];
    error: string | null;
  }

  const initialState: ResellerGroupState = {
    loading: false,
    reseller_groups: [],
    error: null,
  };

  export const resellerGroupReducer = (
    state = initialState,
    action: any
  ): ResellerGroupState => {
    switch (action.type) {
      case FETCH_RESELLER_GROUP_LIST_REQUEST:
      case DELETE_RESELLER_GROUP_REQUEST:
      case ADD_RESELLER_GROUP_REQUEST:
      case EDIT_RESELLER_GROUP_REQUEST:
        return { ...state, loading: true, error: null };

      case FETCH_RESELLER_GROUP_LIST_SUCCESS:
        return { ...state, loading: false, reseller_groups: action.payload };

      case ADD_RESELLER_GROUP_SUCCESS:
        return {
          ...state,
          loading: false,
          reseller_groups: [...state.reseller_groups, action.payload],
        };

      case EDIT_RESELLER_GROUP_SUCCESS:
        return {
          ...state,
          loading: false,
          reseller_groups: state.reseller_groups.map((group) =>
            group.id === action.payload.id ? action.payload : group
          ),
        };

      case DELETE_RESELLER_GROUP_SUCCESS:
        return {
          ...state,
          loading: false,
          reseller_groups: state.reseller_groups.filter(
            (group) => group.id !== action.payload
          ),
        };

      case FETCH_RESELLER_GROUP_LIST_FAIL:
      case DELETE_RESELLER_GROUP_FAIL:
      case ADD_RESELLER_GROUP_FAIL:
      case EDIT_RESELLER_GROUP_FAIL:
        return { ...state, loading: false, error: action.payload };

      default:
        return state;
    }
  };
