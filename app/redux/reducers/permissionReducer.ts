import {
    FETCH_PERMISSIONS_REQUEST,
    FETCH_PERMISSIONS_SUCCESS,
    FETCH_PERMISSIONS_FAIL,

  } from "../constants/permissionConstants";

  import { Permission,} from "@/types/interface";

  interface PermissionState {
    loading: boolean;
    permissions: Permission[];
    error: string | null;
  }

  const initialState: PermissionState = {
    loading: false,
    permissions: [],
    error: null,
  };

  export const permissionsReducer = (state = initialState, action: any): PermissionState => {
    switch (action.type) {
      case FETCH_PERMISSIONS_REQUEST:
        return { ...state, loading: true };

      case FETCH_PERMISSIONS_SUCCESS:
        return { ...state, loading: false, permissions: action.payload };




      case FETCH_PERMISSIONS_FAIL:

        return { ...state, loading: false, error: action.payload };

      default:
        return state;
    }
  };
