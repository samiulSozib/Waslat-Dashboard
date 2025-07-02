import { CompanyCode } from '@/types/interface';
import {
    FETCH_COMPANY_CODE_LIST_REQUEST,
    FETCH_COMPANY_CODE_LIST_SUCCESS,
    FETCH_COMPANY_CODE_LIST_FAIL,
    DELETE_COMPANY_CODE_REQUEST,
    DELETE_COMPANY_CODE_SUCCESS,
    DELETE_COMPANY_CODE_FAIL,
    ADD_COMPANY_CODE_REQUEST,
    ADD_COMPANY_CODE_SUCCESS,
    ADD_COMPANY_CODE_FAIL,
    EDIT_COMPANY_CODE_REQUEST,
    EDIT_COMPANY_CODE_SUCCESS,
    EDIT_COMPANY_CODE_FAIL,
} from '../constants/companyCodeConstants';



interface CompanyCodeState {
    loading: boolean;
    companyCodes: CompanyCode[];
    error: string | null;
}

const initialState: CompanyCodeState = {
    loading: false,
    companyCodes: [],
    error: null,
};

export const companyCodeReducer = (state = initialState, action: any): CompanyCodeState => {
    switch (action.type) {
        case FETCH_COMPANY_CODE_LIST_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_COMPANY_CODE_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                companyCodes: action.payload,
                error: null,
            };
        case FETCH_COMPANY_CODE_LIST_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case ADD_COMPANY_CODE_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case ADD_COMPANY_CODE_SUCCESS:
            return {
                ...state,
                loading: false,
                companyCodes: [...state.companyCodes, action.payload],
            };
        case ADD_COMPANY_CODE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case DELETE_COMPANY_CODE_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case DELETE_COMPANY_CODE_SUCCESS:
            return {
                ...state,
                loading: false,
                companyCodes: state.companyCodes.filter(code => code.id !== action.payload),
            };
        case DELETE_COMPANY_CODE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case EDIT_COMPANY_CODE_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case EDIT_COMPANY_CODE_SUCCESS:
            return {
                ...state,
                loading: false,
                companyCodes: state.companyCodes.map((code) =>
                    code.id === action.payload.id ? action.payload : code
                ),
            };
        case EDIT_COMPANY_CODE_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
