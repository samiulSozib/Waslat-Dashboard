import { ServiceCategory } from "@/types/interface";
import {
    FETCH_SERVICE_CATEGORY_LIST_REQUEST, FETCH_SERVICE_CATEGORY_LIST_SUCCESS, FETCH_SERVICE_CATEGORY_LIST_FAIL,
    DELETE_SERVICE_CATEGORY_REQUEST, DELETE_SERVICE_CATEGORY_SUCCESS, DELETE_SERVICE_CATEGORY_FAIL,
    ADD_SERVICE_CATEGORY_REQUEST, ADD_SERVICE_CATEGORY_SUCCESS, ADD_SERVICE_CATEGORY_FAIL,
    EDIT_SERVICE_CATEGORY_REQUEST, EDIT_SERVICE_CATEGORY_SUCCESS, EDIT_SERVICE_CATEGORY_FAIL,
} from "../constants/serviceCategoryConstants";

interface State { loading: boolean; serviceCategories: ServiceCategory[]; error: string | null; }
const initialState: State = { loading: false, serviceCategories: [], error: null };
const sortCategories = (items: ServiceCategory[]): ServiceCategory[] =>
    [...items].sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0) || a.id - b.id);

const serviceCategoryReducer = (state = initialState, action: any): State => {
    switch (action.type) {
        case FETCH_SERVICE_CATEGORY_LIST_REQUEST:
        case DELETE_SERVICE_CATEGORY_REQUEST:
        case ADD_SERVICE_CATEGORY_REQUEST:
        case EDIT_SERVICE_CATEGORY_REQUEST:
            return { ...state, loading: true, error: null };
        case FETCH_SERVICE_CATEGORY_LIST_SUCCESS:
            return { ...state, loading: false, error: null,
                serviceCategories: sortCategories(Array.isArray(action.payload) ? action.payload : []) };
        case DELETE_SERVICE_CATEGORY_SUCCESS:
            return { ...state, loading: false,
                serviceCategories: state.serviceCategories.filter(c => c.id !== action.payload) };
        case ADD_SERVICE_CATEGORY_SUCCESS:
            return { ...state, loading: false,
                serviceCategories: sortCategories([...state.serviceCategories, action.payload]) };
        case EDIT_SERVICE_CATEGORY_SUCCESS:
            return { ...state, loading: false,
                serviceCategories: sortCategories(state.serviceCategories.map(category =>
                    category.id === action.payload.id ? { ...category, ...action.payload } : category)) };
        case FETCH_SERVICE_CATEGORY_LIST_FAIL:
        case DELETE_SERVICE_CATEGORY_FAIL:
        case ADD_SERVICE_CATEGORY_FAIL:
        case EDIT_SERVICE_CATEGORY_FAIL:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};
export default serviceCategoryReducer;
