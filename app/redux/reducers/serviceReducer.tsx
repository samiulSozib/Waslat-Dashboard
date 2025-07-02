import { Service } from "@/types/interface";
import {
    FETCH_SERVICE_LIST_REQUEST,
    FETCH_SERVICE_LIST_SUCCESS,
    FETCH_SERVICE_LIST_FAIL,
    DELETE_SERVICE_REQUEST,
    DELETE_SERVICE_SUCCESS,
    DELETE_SERVICE_FAIL,
    ADD_SERVICE_REQUEST,
    ADD_SERVICE_SUCCESS,
    ADD_SERVICE_FAIL,
    EDIT_SERVICE_REQUEST,
    EDIT_SERVICE_SUCCESS,
    EDIT_SERVICE_FAIL,
  } from "../constants/serviceConstants";

  // Define service and company types


  interface State {
    loading: boolean;
    services: Service[];
    error: string | null;
  }

  const initialState: State = {
    loading: false,
    services: [],
    error: null,
  };

  const serviceReducer = (state = initialState, action: any): State => {
    switch (action.type) {
      case FETCH_SERVICE_LIST_REQUEST:
        return { ...state, loading: true };
      case FETCH_SERVICE_LIST_SUCCESS:
        return { ...state, loading: false, services: action.payload };
      case FETCH_SERVICE_LIST_FAIL:
        return { ...state, loading: false, error: action.payload };
      case DELETE_SERVICE_REQUEST:
        return { ...state, loading: true };
      case DELETE_SERVICE_SUCCESS:
        return {
          ...state,
          loading: false,
          services: state.services.filter((service) => service.id !== action.payload),
        };
      case DELETE_SERVICE_FAIL:
        return { ...state, loading: false, error: action.payload };
      case ADD_SERVICE_REQUEST:
        return { ...state, loading: true };
      case ADD_SERVICE_SUCCESS:
        return {
          ...state,
          loading: false,
          services: [...state.services, action.payload],
        };
      case ADD_SERVICE_FAIL:
        return { ...state, loading: false, error: action.payload };
      case EDIT_SERVICE_REQUEST:
        return { ...state, loading: true };
      case EDIT_SERVICE_SUCCESS:
        return {
          ...state,
          loading: false,
          services: state.services.map((service) =>
            service.id === action.payload.id ? action.payload : service
          ),
        };
      case EDIT_SERVICE_FAIL:
        return { ...state, loading: false, error: action.payload };
      default:
        return state;
    }
  };

  export default serviceReducer;
