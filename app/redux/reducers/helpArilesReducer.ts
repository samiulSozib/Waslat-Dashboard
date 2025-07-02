import {
  FETCH_HELP_ARTICLES_REQUEST,
  FETCH_HELP_ARTICLES_SUCCESS,
  FETCH_HELP_ARTICLES_FAILURE,
  ADD_HELP_ARTICLE_REQUEST,
  ADD_HELP_ARTICLE_SUCCESS,
  ADD_HELP_ARTICLE_FAIL,
  EDIT_HELP_ARTICLE_REQUEST,
  EDIT_HELP_ARTICLE_SUCCESS,
  EDIT_HELP_ARTICLE_FAIL,
  DELETE_HELP_ARTICLE_REQUEST,
  DELETE_HELP_ARTICLE_SUCCESS,
  DELETE_HELP_ARTICLE_FAIL,
} from "../constants/helpAriclesConstants";
import { HelpArticle, Pagination } from "@/types/interface";

export interface HelpArticlesState {
  helpArticles: HelpArticle[];
  loading: boolean;
  error: string | null;
pagination: Pagination | null;

}

const initialState: HelpArticlesState = {
  helpArticles: [],
  loading: false,
  error: null,
pagination: null,

};

export const helpArticlesReducer = (
  state = initialState,
  action: any
): HelpArticlesState => {
  switch (action.type) {
    case FETCH_HELP_ARTICLES_REQUEST:
    case ADD_HELP_ARTICLE_REQUEST:
    case EDIT_HELP_ARTICLE_REQUEST:
    case DELETE_HELP_ARTICLE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_HELP_ARTICLES_SUCCESS:
      return {
        ...state,
        loading: false,
        helpArticles: action.payload.data,
        pagination: action.payload.pagination,
        error: null,
      };

    case ADD_HELP_ARTICLE_SUCCESS:
      return {
        ...state,
        loading: false,
        helpArticles: [...state.helpArticles, action.payload],
        error: null,
      };

    case EDIT_HELP_ARTICLE_SUCCESS:
      return {
        ...state,
        loading: false,
        helpArticles: state.helpArticles.map((article) =>
          article.id === action.payload.id ? action.payload : article
        ),
        error: null,
      };

    case DELETE_HELP_ARTICLE_SUCCESS:
      return {
        ...state,
        loading: false,
        helpArticles: state.helpArticles.filter(
          (article) => article.id !== action.payload
        ),
        error: null,
      };

    case FETCH_HELP_ARTICLES_FAILURE:
    case ADD_HELP_ARTICLE_FAIL:
    case EDIT_HELP_ARTICLE_FAIL:
    case DELETE_HELP_ARTICLE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};
