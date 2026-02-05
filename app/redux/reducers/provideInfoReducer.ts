// app/redux/reducers/providerInfoReducer.ts
import { AccountData } from '@/types/interface';
import { 
  FETCH_PROVIDER_INFO_FAIL, 
  FETCH_PROVIDER_INFO_REQUEST, 
  FETCH_PROVIDER_INFO_SUCCESS 
} from '../constants/providerInfoConstants';

interface ProviderInfoState {
  loading: boolean;
  accountData: AccountData | null;
  error: string | null;
}

const initialState: ProviderInfoState = {
  loading: false,
  accountData: null,
  error: null,
};

export const providerInfoReducer = (state = initialState, action: any): ProviderInfoState => {
  switch (action.type) {
    case FETCH_PROVIDER_INFO_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_PROVIDER_INFO_SUCCESS:
      return {
        ...state,
        loading: false,
        accountData: action.payload,
        error: null,
      };
    case FETCH_PROVIDER_INFO_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};