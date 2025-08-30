// reducers/appSettingsReducer.ts
import {
  FETCH_APP_SETTINGS_REQUEST,
  FETCH_APP_SETTINGS_SUCCESS,
  FETCH_APP_SETTINGS_FAIL,
  UPDATE_APP_SETTINGS_REQUEST,
  UPDATE_APP_SETTINGS_SUCCESS,
  UPDATE_APP_SETTINGS_FAIL,
  RESET_APP_SETTINGS_REQUEST,
  RESET_APP_SETTINGS_SUCCESS,
  RESET_APP_SETTINGS_FAIL
} from '../constants/appSettingsConstants';
import { AppSettings } from '@/types/interface';

interface AppSettingsState {
  loading: boolean;
  settings: AppSettings | null;
  error: string | null;
}

const initialState: AppSettingsState = {
  loading: false,
  settings: null,
  error: null,
};

export const appSettingsReducer = (state = initialState, action: any): AppSettingsState => {
  switch (action.type) {
    case FETCH_APP_SETTINGS_REQUEST:
    case UPDATE_APP_SETTINGS_REQUEST:
    case RESET_APP_SETTINGS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_APP_SETTINGS_SUCCESS:
    case UPDATE_APP_SETTINGS_SUCCESS:
    case RESET_APP_SETTINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        settings: action.payload,
        error: null,
      };

    case FETCH_APP_SETTINGS_FAIL:
    case UPDATE_APP_SETTINGS_FAIL:
    case RESET_APP_SETTINGS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
