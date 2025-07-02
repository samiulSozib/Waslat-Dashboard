import { Company } from '@/types/interface';
import {
    FETCH_COMPANY_LIST_REQUEST,
    FETCH_COMPANY_LIST_SUCCESS,
    FETCH_COMPANY_LIST_FAIL,
    DELETE_COMPANY_REQUEST,
    DELETE_COMPANY_SUCCESS,
    DELETE_COMPANY_FAIL,
    ADD_COMPANY_REQUEST,
    ADD_COMPANY_SUCCESS,
    ADD_COMPANY_FAIL,
    EDIT_COMPANY_REQUEST,
    EDIT_COMPANY_SUCCESS,
    EDIT_COMPANY_FAIL
} from '../constants/companyConstants';



interface CompanyState {
    loading: boolean;
    companies: Company[];
    error: string | null;
}

const initialState: CompanyState = {
    loading: false,
    companies: [],
    error: null,
};

export const companyReducer = (state = initialState, action: any): CompanyState => {
    switch (action.type) {
        case FETCH_COMPANY_LIST_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_COMPANY_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                companies: action.payload,
                error: null,
            };
        case FETCH_COMPANY_LIST_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case DELETE_COMPANY_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case DELETE_COMPANY_SUCCESS:
            return {
                ...state,
                loading: false,
                companies: state.companies.filter(company => company.id !== action.payload),
            };
        case DELETE_COMPANY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case ADD_COMPANY_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case ADD_COMPANY_SUCCESS:
            return {
                ...state,
                loading: false,
                companies: [...state.companies, action.payload],
            };
        case ADD_COMPANY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        case EDIT_COMPANY_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case EDIT_COMPANY_SUCCESS:
            return {
                ...state,
                loading: false,
                companies: state.companies.map((company) =>
                    company.id === action.payload.id ? action.payload : company
                ),
            };
        case EDIT_COMPANY_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};
