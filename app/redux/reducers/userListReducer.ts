import {
    FETCH_USER_LIST_REQUEST,
    FETCH_USER_LIST_SUCCESS,
    FETCH_USER_LIST_FAIL,
    DELETE_USER_REQUEST,
    DELETE_USER_SUCCESS,
    DELETE_USER_FAIL,
    ADD_USER_REQUEST,
    ADD_USER_SUCCESS,
    ADD_USER_FAIL,
    EDIT_USER_REQUEST,
    EDIT_USER_SUCCESS,
    EDIT_USER_FAIL,
  } from "../constants/userListConstants";
  import { User } from "@/types/interface";

  interface UserState {
    loading: boolean;
    users: User[];
    error: string | null;
  }

  const initialState: UserState = {
    loading: false,
    users: [],
    error: null,
  };

  export const userReducer = (state = initialState, action: any): UserState => {
    switch (action.type) {
      case FETCH_USER_LIST_REQUEST:
      case DELETE_USER_REQUEST:
      case ADD_USER_REQUEST:
      case EDIT_USER_REQUEST:
        return { ...state, loading: true, error: null };

      case FETCH_USER_LIST_SUCCESS:
        return { ...state, loading: false, users: action.payload };

      case ADD_USER_SUCCESS:
        return { ...state, loading: false, users: [...state.users, action.payload] };

      case EDIT_USER_SUCCESS:
        return {
          ...state,
          loading: false,
          users: state.users.map((user) =>
            user.id === action.payload.id ? action.payload : user
          ),
        };

      case DELETE_USER_SUCCESS:
        return {
          ...state,
          loading: false,
          users: state.users.filter((user) => user.id !== action.payload),
        };

      case FETCH_USER_LIST_FAIL:
      case DELETE_USER_FAIL:
      case ADD_USER_FAIL:
      case EDIT_USER_FAIL:
        return { ...state, loading: false, error: action.payload };

      default:
        return state;
    }
  };
