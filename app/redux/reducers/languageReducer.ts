import {
    FETCH_LANGUAGES_REQUEST,
    FETCH_LANGUAGES_SUCCESS,
    FETCH_LANGUAGES_FAIL,
    ADD_LANGUAGE_REQUEST,
    ADD_LANGUAGE_SUCCESS,
    ADD_LANGUAGE_FAIL,
    EDIT_LANGUAGE_REQUEST,
    EDIT_LANGUAGE_SUCCESS,
    EDIT_LANGUAGE_FAIL,
    DELETE_LANGUAGE_REQUEST,
    DELETE_LANGUAGE_SUCCESS,
    DELETE_LANGUAGE_FAIL,
  } from "../constants/languageConstants";

  import { Language } from "@/types/interface";

  interface LanguageState {
    loading: boolean;
    languages: Language[];
    error: string | null;
  }

  const initialState: LanguageState = {
    loading: false,
    languages: [],
    error: null,
  };

  export const languageReducer = (
    state = initialState,
    action: { type: string; payload?: any }
  ): LanguageState => {
    switch (action.type) {
      // Fetch languages
      case FETCH_LANGUAGES_REQUEST:
        return { ...state, loading: true, error: null };

      case FETCH_LANGUAGES_SUCCESS:
        return { ...state, loading: false, languages: action.payload };

      case FETCH_LANGUAGES_FAIL:
        return { ...state, loading: false, error: action.payload };

      // Add a language
      case ADD_LANGUAGE_REQUEST:
        return { ...state, loading: true };

      case ADD_LANGUAGE_SUCCESS:
        return { ...state, loading: false, languages: [...state.languages, action.payload] };

      case ADD_LANGUAGE_FAIL:
        return { ...state, loading: false, error: action.payload };

      // Edit a language
      case EDIT_LANGUAGE_REQUEST:
        return { ...state, loading: true };

      case EDIT_LANGUAGE_SUCCESS:
        return {
          ...state,
          loading: false,
          languages: state.languages.map((language) =>
            language.id === action.payload.id ? action.payload : language
          ),
        };

      case EDIT_LANGUAGE_FAIL:
        return { ...state, loading: false, error: action.payload };

      // Delete a language
      case DELETE_LANGUAGE_REQUEST:
        return { ...state, loading: true };

      case DELETE_LANGUAGE_SUCCESS:
        return {
          ...state,
          loading: false,
          languages: state.languages.filter((language) => language.id !== action.payload),
        };

      case DELETE_LANGUAGE_FAIL:
        return { ...state, loading: false, error: action.payload };

      // Default case
      default:
        return state;
    }
  };
