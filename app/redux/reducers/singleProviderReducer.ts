// singleProviderReducer.ts
import { Internet, Pagination, RawInternet, SingleProvider } from '@/types/interface';
import {
  FETCH_SINGLE_PROVIDER_REQUEST,
  FETCH_SINGLE_PROVIDER_SUCCESS,
  FETCH_SINGLE_PROVIDER_FAIL,
  CLEAR_SINGLE_PROVIDER
} from '../constants/singleProviderConstant';

interface SingleProviderState {
  loading: boolean;
  provider: SingleProvider | null;
  internets: Internet[];
  rawInternets:RawInternet[],
  error: string | null;
  pagination: Pagination | null;
}

const initialState: SingleProviderState = {
  loading: false,
  provider: null,
  internets: [],
  rawInternets:[],
  error: null,
  pagination: null
};

export const singleProviderReducer = (
  state = initialState,
  action: any
): SingleProviderState => {
  switch (action.type) {
    case FETCH_SINGLE_PROVIDER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_SINGLE_PROVIDER_SUCCESS:
      return {
        ...state,
        loading: false,
        provider: action.payload.provider,
        internets: action.payload.internets,
        rawInternets:action.payload.rawInternets,
        pagination: action.payload.pagination,
        error: null,
      };

    case FETCH_SINGLE_PROVIDER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        provider: null,
        internets: [],
        rawInternets:[],
        pagination: null,
      };

    case CLEAR_SINGLE_PROVIDER:
      return initialState;

    default:
      return state;
  }
};
