import { FETCH_HAWALA_BRANCH_LIST_REQUEST, FETCH_HAWALA_BRANCH_LIST_SUCCESS, FETCH_HAWALA_BRANCH_LIST_FAIL, ADD_HAWALA_BRANCH_REQUEST, ADD_HAWALA_BRANCH_SUCCESS, ADD_HAWALA_BRANCH_FAIL, EDIT_HAWALA_BRANCH_REQUEST, EDIT_HAWALA_BRANCH_SUCCESS, EDIT_HAWALA_BRANCH_FAIL, DELETE_HAWALA_BRANCH_REQUEST, DELETE_HAWALA_BRANCH_SUCCESS, DELETE_HAWALA_BRANCH_FAIL } from '../constants/hawalaBranchConstants';

  import { HawalaBranch, Pagination } from "@/types/interface";

  interface HawalaBranchState {
    loading: boolean;
    hawalaBranches: HawalaBranch[];
    error: string | null;
    pagination: Pagination | null;

  }

  const initialState: HawalaBranchState = {
    loading: false,
    hawalaBranches: [],
    error: null,
    pagination: null,
  };

  export const hawalaBranchReducer = (state = initialState, action: any): HawalaBranchState => {
    switch (action.type) {
      case FETCH_HAWALA_BRANCH_LIST_REQUEST:
      case DELETE_HAWALA_BRANCH_REQUEST:
      case ADD_HAWALA_BRANCH_REQUEST:
      case EDIT_HAWALA_BRANCH_REQUEST:
        return { ...state, loading: true, error: null };

      case FETCH_HAWALA_BRANCH_LIST_SUCCESS:
        return { ...state, loading: false,
             hawalaBranches: action.payload.data,
             pagination:action.payload.pagination
             };

      case ADD_HAWALA_BRANCH_SUCCESS:
        return { ...state, loading: false, hawalaBranches: [...state.hawalaBranches, action.payload] };

      case EDIT_HAWALA_BRANCH_SUCCESS:
        return {
          ...state,
          loading: false,
          hawalaBranches: state.hawalaBranches.map((branch) =>
            branch.id === action.payload.id ? action.payload : branch
          ),
        };

      case DELETE_HAWALA_BRANCH_SUCCESS:
        return {
          ...state,
          loading: false,
          hawalaBranches: state.hawalaBranches.filter((branch) => branch.id !== action.payload),
        };

      case FETCH_HAWALA_BRANCH_LIST_FAIL:
      case DELETE_HAWALA_BRANCH_FAIL:
      case ADD_HAWALA_BRANCH_FAIL:
      case EDIT_HAWALA_BRANCH_FAIL:
        return { ...state, loading: false, error: action.payload };

      default:
        return state;
    }
  };
