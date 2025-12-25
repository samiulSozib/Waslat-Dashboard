import { SupportContacts } from '@/types/interface';
import {
  FETCH_SUPPORT_CONTACT_LIST_REQUEST,
  FETCH_SUPPORT_CONTACT_LIST_SUCCESS,
  FETCH_SUPPORT_CONTACT_LIST_FAIL,
  DELETE_SUPPORT_CONTACT_REQUEST,
  DELETE_SUPPORT_CONTACT_SUCCESS,
  DELETE_SUPPORT_CONTACT_FAIL,
  ADD_SUPPORT_CONTACT_REQUEST,
  ADD_SUPPORT_CONTACT_SUCCESS,
  ADD_SUPPORT_CONTACT_FAIL,
  EDIT_SUPPORT_CONTACT_REQUEST,
  EDIT_SUPPORT_CONTACT_SUCCESS,
  EDIT_SUPPORT_CONTACT_FAIL,
} from '../constants/supportContactConstants';

interface SupportContactState {
  loading: boolean;
  supportContacts: SupportContacts[];
  error: string | null;
}

const initialState: SupportContactState = {
  loading: false,
  supportContacts: [],
  error: null,
};

export const supportContactReducer = (
  state = initialState,
  action: any
): SupportContactState => {
  switch (action.type) {
    case FETCH_SUPPORT_CONTACT_LIST_REQUEST:
      return { ...state, loading: true, error: null };

    case FETCH_SUPPORT_CONTACT_LIST_SUCCESS:
      return {
        ...state,
        loading: false,
        supportContacts: action.payload,
      };

    case FETCH_SUPPORT_CONTACT_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };

    case ADD_SUPPORT_CONTACT_REQUEST:
    case DELETE_SUPPORT_CONTACT_REQUEST:
    case EDIT_SUPPORT_CONTACT_REQUEST:
      return { ...state, loading: true };

    case ADD_SUPPORT_CONTACT_SUCCESS:
      return {
        ...state,
        loading: false,
        supportContacts: [...state.supportContacts, action.payload],
      };

    case DELETE_SUPPORT_CONTACT_SUCCESS:
      return {
        ...state,
        loading: false,
        supportContacts: state.supportContacts.filter(
          (contact) => contact.id !== action.payload
        ),
      };

    case EDIT_SUPPORT_CONTACT_SUCCESS:
      return {
        ...state,
        loading: false,
        supportContacts: state.supportContacts.map((contact) =>
          contact.id === action.payload.id ? action.payload : contact
        ),
      };

    case ADD_SUPPORT_CONTACT_FAIL:
    case DELETE_SUPPORT_CONTACT_FAIL:
    case EDIT_SUPPORT_CONTACT_FAIL:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
