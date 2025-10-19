import {
  FETCH_HAWALA_NUMBER_SERIES_LIST_REQUEST,
  FETCH_HAWALA_NUMBER_SERIES_LIST_SUCCESS,
  FETCH_HAWALA_NUMBER_SERIES_LIST_FAIL,
  FETCH_HAWALA_NUMBER_SERIES_NEXT_REQUEST,
  FETCH_HAWALA_NUMBER_SERIES_NEXT_SUCCESS,
  FETCH_HAWALA_NUMBER_SERIES_NEXT_FAIL,
  HAWALA_NUMBER_SERIES_STATUS_CHANGE_REQUEST,
  HAWALA_NUMBER_SERIES_STATUS_CHANGE_SUCCESS,
  HAWALA_NUMBER_SERIES_STATUS_CHANGE_FAIL,
  DELETE_HAWALA_NUMBER_SERIES_REQUEST,
  DELETE_HAWALA_NUMBER_SERIES_SUCCESS,
  DELETE_HAWALA_NUMBER_SERIES_FAIL,
  ADD_HAWALA_NUMBER_SERIES_REQUEST,
  ADD_HAWALA_NUMBER_SERIES_SUCCESS,
  ADD_HAWALA_NUMBER_SERIES_FAIL,
  EDIT_HAWALA_NUMBER_SERIES_REQUEST,
  EDIT_HAWALA_NUMBER_SERIES_SUCCESS,
  EDIT_HAWALA_NUMBER_SERIES_FAIL,
} from "../constants/hawalaSeriesConstants";

import { HawalaNumberSeries, Pagination } from "@/types/interface";



interface HawalaNumberSeriesState {
  loading: boolean;
  series: HawalaNumberSeries[];
  nextNumber: string | null;
  error: string | null;
  pagination: Pagination | null;
}

const initialState: HawalaNumberSeriesState = {
  loading: false,
  series: [],
  nextNumber: null,
  error: null,
  pagination: null,
};

export const hawalaNumberSeriesReducer = (
  state = initialState,
  action: any
): HawalaNumberSeriesState => {
  switch (action.type) {
    // 🔹 Common Request
    case FETCH_HAWALA_NUMBER_SERIES_LIST_REQUEST:
    case FETCH_HAWALA_NUMBER_SERIES_NEXT_REQUEST:
    case ADD_HAWALA_NUMBER_SERIES_REQUEST:
    case EDIT_HAWALA_NUMBER_SERIES_REQUEST:
    case DELETE_HAWALA_NUMBER_SERIES_REQUEST:
    case HAWALA_NUMBER_SERIES_STATUS_CHANGE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    // 🔹 Fetch Series List
    case FETCH_HAWALA_NUMBER_SERIES_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        series: action.payload.data,
        pagination: action.payload.pagination,
        error: null,
      };

    // 🔹 Fetch Next Number
    case FETCH_HAWALA_NUMBER_SERIES_NEXT_SUCCESS:
      return {
        ...state,
        loading: false,
        nextNumber: action.payload.next_number,
        error: null,
      };

    // 🔹 Add New Series
    case ADD_HAWALA_NUMBER_SERIES_SUCCESS:
      return {
        ...state,
        loading: false,
        series: [...state.series, action.payload],
        error: null,
      };

    // 🔹 Edit Series
    case EDIT_HAWALA_NUMBER_SERIES_SUCCESS:
      return {
        ...state,
        loading: false,
        series: state.series.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload } : s
        ),
        error: null,
      };

    // 🔹 Delete Series
    case DELETE_HAWALA_NUMBER_SERIES_SUCCESS:
      return {
        ...state,
        loading: false,
        series: state.series.filter((s) => s.id !== action.payload),
        error: null,
      };

    // 🔹 Change Status
    case HAWALA_NUMBER_SERIES_STATUS_CHANGE_SUCCESS:
      return {
        ...state,
        loading: false,
        series: state.series.map((s) =>
          s.id === action.payload.id
            ? { ...s, is_active: action.payload.is_active }
            : s
        ),
        error: null,
      };

    // 🔹 Failures
    case FETCH_HAWALA_NUMBER_SERIES_LIST_FAIL:
    case FETCH_HAWALA_NUMBER_SERIES_NEXT_FAIL:
    case ADD_HAWALA_NUMBER_SERIES_FAIL:
    case EDIT_HAWALA_NUMBER_SERIES_FAIL:
    case DELETE_HAWALA_NUMBER_SERIES_FAIL:
    case HAWALA_NUMBER_SERIES_STATUS_CHANGE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
