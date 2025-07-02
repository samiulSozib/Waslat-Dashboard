import {
  FETCH_HAWALA_LIST_REQUEST,
  FETCH_HAWALA_LIST_SUCCESS,
  FETCH_HAWALA_LIST_FAIL,
  ADD_HAWALA_REQUEST,
  ADD_HAWALA_SUCCESS,
  ADD_HAWALA_FAIL,
  EDIT_HAWALA_REQUEST,
  EDIT_HAWALA_SUCCESS,
  EDIT_HAWALA_FAIL,
  DELETE_HAWALA_REQUEST,
  DELETE_HAWALA_SUCCESS,
  DELETE_HAWALA_FAIL,
  CHANGE_HAWALA_STATUS_REQUEST,
  CHANGE_HAWALA_STATUS_SUCCESS,
  CHANGE_HAWALA_STATUS_FAIL
} from '../constants/hawalaConstants';

import { Hawala, Pagination } from "@/types/interface";

interface HawalaState {
  loading: boolean;
  hawalas: Hawala[];
  error: string | null;
  pagination: Pagination | null;
}

const initialState: HawalaState = {
  loading: false,
  hawalas: [],
  error: null,
  pagination: null,
};

export const hawalaReducer = (state = initialState, action: any): HawalaState => {
  switch (action.type) {
    case FETCH_HAWALA_LIST_REQUEST:
    case DELETE_HAWALA_REQUEST:
    case ADD_HAWALA_REQUEST:
    case EDIT_HAWALA_REQUEST:
    case CHANGE_HAWALA_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_HAWALA_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        hawalas: action.payload.data,
        pagination: action.payload.pagination,
        error: null,
      };

    case ADD_HAWALA_SUCCESS:
      return {
        ...state,
        loading: false,
        hawalas: [...state.hawalas, action.payload],
        error: null,
      };

    case EDIT_HAWALA_SUCCESS:
      return {
        ...state,
        loading: false,
        hawalas: state.hawalas.map((hawala) =>
          hawala.id === action.payload.id ? action.payload : hawala
        ),
        error: null,
      };

    case DELETE_HAWALA_SUCCESS:
      return {
        ...state,
        loading: false,
        hawalas: state.hawalas.filter((hawala) => hawala.id !== action.payload),
        error: null,
      };

    case CHANGE_HAWALA_STATUS_SUCCESS:
  return {
    ...state,
    loading: false,
    hawalas: state.hawalas.map((hawala) =>
      hawala.id === action.payload.hawalaId
        ? {
            ...hawala,
            status:
              action.payload.status == 1
                ? "confirmed"
                : action.payload.status == 3
                ? "rejected"
                : "Pending",
          }
        : hawala
    ),
    error: null,
  };


    case FETCH_HAWALA_LIST_FAIL:
    case DELETE_HAWALA_FAIL:
    case ADD_HAWALA_FAIL:
    case EDIT_HAWALA_FAIL:
    case CHANGE_HAWALA_STATUS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
