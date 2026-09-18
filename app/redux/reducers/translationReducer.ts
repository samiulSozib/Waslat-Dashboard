// reducers/translationReducer.ts

import { Pagination } from '@/types/interface';
import {
  FETCH_TRANSLATION_LANGUAGES_REQUEST,
  FETCH_TRANSLATION_LANGUAGES_SUCCESS,
  FETCH_TRANSLATION_LANGUAGES_FAIL,
  FETCH_TRANSLATION_TYPES_REQUEST,
  FETCH_TRANSLATION_TYPES_SUCCESS,
  FETCH_TRANSLATION_TYPES_FAIL,
  FETCH_TRANSLATION_WORKSPACE_REQUEST,
  FETCH_TRANSLATION_WORKSPACE_SUCCESS,
  FETCH_TRANSLATION_WORKSPACE_FAIL,
  BULK_SAVE_TRANSLATIONS_REQUEST,
  BULK_SAVE_TRANSLATIONS_SUCCESS,
  BULK_SAVE_TRANSLATIONS_FAIL,
  MARK_TRANSLATION_DIRTY,
  CLEAR_TRANSLATION_DIRTY,
  RESET_TRANSLATION_DIRTY,
} from '../constants/translationConstants';

import {
  TranslationLanguage,
  TranslationType,
  TranslationItem,
  TranslationStatistics,
  TranslationField,
} from '@/types/translation';

interface TranslationState {
  // Languages
  languages: TranslationLanguage[];
  languagesLoading: boolean;
  languagesError: string | null;

  // Types / modules
  types: TranslationType[];
  typesLoading: boolean;
  typesError: string | null;

  // Workspace
  workspace: {
    type: string;
    entity_label: string;
    language: TranslationLanguage | null;
    fields: TranslationField[];
    statistics: TranslationStatistics | null;
    items: TranslationItem[];
    active_filters: Record<string, any>;
    pagination: Pagination | null;
    loading: boolean;
    error: string | null;
  };

  // Dirty rows (frontend-only): id -> { fieldKey: value }
  dirtyRows: Record<number, Record<string, string>>;

  // Bulk save
  bulkSave: {
    loading: boolean;
    error: string | null;
    success: boolean;
  };
}

const initialState: TranslationState = {
  languages: [],
  languagesLoading: false,
  languagesError: null,

  types: [],
  typesLoading: false,
  typesError: null,

  workspace: {
    type: '',
    entity_label: '',
    language: null,
    fields: [],
    statistics: null,
    items: [],
    active_filters: {},
    pagination: null,
    loading: false,
    error: null,
  },

  dirtyRows: {},

  bulkSave: {
    loading: false,
    error: null,
    success: false,
  },
};

const translationReducer = (state = initialState, action: any): TranslationState => {
  switch (action.type) {
    // ---------------- Languages ----------------
    case FETCH_TRANSLATION_LANGUAGES_REQUEST:
      return { ...state, languagesLoading: true, languagesError: null };
    case FETCH_TRANSLATION_LANGUAGES_SUCCESS:
      return {
        ...state,
        languagesLoading: false,
        languages: action.payload,
        languagesError: null,
      };
    case FETCH_TRANSLATION_LANGUAGES_FAIL:
      return {
        ...state,
        languagesLoading: false,
        languagesError: action.payload,
      };

    // ---------------- Types ----------------
    case FETCH_TRANSLATION_TYPES_REQUEST:
      return { ...state, typesLoading: true, typesError: null };
    case FETCH_TRANSLATION_TYPES_SUCCESS:
      return {
        ...state,
        typesLoading: false,
        types: action.payload,
        typesError: null,
      };
    case FETCH_TRANSLATION_TYPES_FAIL:
      return {
        ...state,
        typesLoading: false,
        typesError: action.payload,
      };

    // ---------------- Workspace ----------------
    case FETCH_TRANSLATION_WORKSPACE_REQUEST:
      return {
        ...state,
        workspace: {
          ...state.workspace,
          loading: true,
          error: null,
        },
      };
    case FETCH_TRANSLATION_WORKSPACE_SUCCESS:
      return {
        ...state,
        workspace: {
          ...state.workspace,
          loading: false,
          type: action.payload.type,
          entity_label: action.payload.entity_label,
          language: action.payload.language,
          fields: action.payload.fields,
          statistics: action.payload.statistics,
          items: action.payload.items,
          active_filters: action.payload.active_filters,
          pagination: action.payload.pagination,
          error: null,
        },
      };
    case FETCH_TRANSLATION_WORKSPACE_FAIL:
      return {
        ...state,
        workspace: {
          ...state.workspace,
          loading: false,
          error: action.payload,
        },
      };

    // ---------------- Dirty Rows ----------------
    case MARK_TRANSLATION_DIRTY: {
      const { id, field, value } = action.payload;
      return {
        ...state,
        dirtyRows: {
          ...state.dirtyRows,
          [id]: {
            ...(state.dirtyRows[id] || {}),
            [field]: value,
          },
        },
      };
    }

    case CLEAR_TRANSLATION_DIRTY: {
      const { id } = action.payload;
      const newDirty = { ...state.dirtyRows };
      delete newDirty[id];
      return { ...state, dirtyRows: newDirty };
    }

    case RESET_TRANSLATION_DIRTY:
      return { ...state, dirtyRows: {} };

    // ---------------- Bulk Save ----------------
    case BULK_SAVE_TRANSLATIONS_REQUEST:
      return {
        ...state,
        bulkSave: { loading: true, error: null, success: false },
      };
    case BULK_SAVE_TRANSLATIONS_SUCCESS:
      return {
        ...state,
        bulkSave: { loading: false, error: null, success: true },
        dirtyRows: {}, // clear dirty rows after successful save
      };
    case BULK_SAVE_TRANSLATIONS_FAIL:
      return {
        ...state,
        bulkSave: { loading: false, error: action.payload, success: false },
      };

    default:
      return state;
  }
};

export default translationReducer;
