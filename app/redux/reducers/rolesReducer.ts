import {
    FETCH_ROLE_LIST_REQUEST,
    FETCH_ROLE_LIST_SUCCESS,
    FETCH_ROLE_LIST_FAIL,
    DELETE_ROLE_REQUEST,
    DELETE_ROLE_SUCCESS,
    DELETE_ROLE_FAIL,
    ADD_ROLE_REQUEST,
    ADD_ROLE_SUCCESS,
    ADD_ROLE_FAIL,
    EDIT_ROLE_REQUEST,
    EDIT_ROLE_SUCCESS,
    EDIT_ROLE_FAIL,
    FETCH_SINGLE_ROLE_REQUEST,
    FETCH_SINGLE_ROLE_SUCCESS,
    FETCH_SINGLE_ROLE_FAIL,
    CLEAR_SINGLE_ROLE,
  } from "../constants/rolesConstants";
  import { Roles } from "@/types/interface";

  interface RolesState {
    loading: boolean;
    roles: Roles[];
    singleRole:  null;
    error: string | null;
  }

  const initialState: RolesState = {
    loading: false,
    roles: [],
    singleRole: null,
    error: null,
  };

  export const rolesReducer = (state = initialState, action: any): RolesState => {
    switch (action.type) {
      case FETCH_ROLE_LIST_REQUEST:
      case DELETE_ROLE_REQUEST:
      case ADD_ROLE_REQUEST:
      case EDIT_ROLE_REQUEST:
      case FETCH_SINGLE_ROLE_REQUEST:
        return { ...state, loading: true };

      case FETCH_ROLE_LIST_SUCCESS:
        return { ...state, loading: false, roles: action.payload };

      case ADD_ROLE_SUCCESS:
        return { ...state, loading: false, roles: [...state.roles, action.payload] };

      case EDIT_ROLE_SUCCESS:
        return {
          ...state,
          loading: false,
          roles: state.roles.map((role) =>
            role.id === action.payload.id ? action.payload : role
          ),
        };

      case DELETE_ROLE_SUCCESS:
        return {
          ...state,
          loading: false,
          roles: state.roles.filter((role) => role.id !== action.payload),
        };

      case FETCH_SINGLE_ROLE_SUCCESS:
        return { ...state, loading: false, singleRole: action.payload };

      case FETCH_ROLE_LIST_FAIL:
      case DELETE_ROLE_FAIL:
      case ADD_ROLE_FAIL:
      case EDIT_ROLE_FAIL:
      case FETCH_SINGLE_ROLE_FAIL:
        return { ...state, loading: false, error: action.payload };

        case CLEAR_SINGLE_ROLE:
            return { ...state, singleRole: null };

      default:
        return state;
    }
  };
