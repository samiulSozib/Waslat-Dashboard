import { AnyAction } from 'redux';
import {
    FETCH_ADVERTISEMENTS_REQUEST,
    FETCH_ADVERTISEMENTS_SUCCESS,
    FETCH_ADVERTISEMENTS_FAIL,
    ADD_ADVERTISEMENT_REQUEST,
    ADD_ADVERTISEMENT_SUCCESS,
    ADD_ADVERTISEMENT_FAIL,
    EDIT_ADVERTISEMENT_REQUEST,
    EDIT_ADVERTISEMENT_SUCCESS,
    EDIT_ADVERTISEMENT_FAIL,
    DELETE_ADVERTISEMENT_REQUEST,
    DELETE_ADVERTISEMENT_SUCCESS,
    DELETE_ADVERTISEMENT_FAIL,
} from '../constants/advertisementConstants';
import { Advertisement } from '../../../types/interface';

interface AdvertisementState {
    loading: boolean;
    advertisements: Advertisement[];
    error: string | null;
}

const initialState: AdvertisementState = {
    loading: false,
    advertisements: [],
    error: null,
};

export const advertisementsReducer = (
    state = initialState,
    action: AnyAction
): AdvertisementState => {
    switch (action.type) {
        case FETCH_ADVERTISEMENTS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_ADVERTISEMENTS_SUCCESS:
            return {
                ...state,
                loading: false,
                advertisements: action.payload,
                error: null,
            };

        case FETCH_ADVERTISEMENTS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case ADD_ADVERTISEMENT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case ADD_ADVERTISEMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                advertisements: [...state.advertisements, action.payload],
                error: null,
            };

        case ADD_ADVERTISEMENT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case EDIT_ADVERTISEMENT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case EDIT_ADVERTISEMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                advertisements: state.advertisements.map(advertisement =>
                    advertisement.id === action.payload.id
                        ? { ...advertisement, ...action.payload }
                        : advertisement
                ),
                error: null,
            };

        case EDIT_ADVERTISEMENT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case DELETE_ADVERTISEMENT_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case DELETE_ADVERTISEMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                advertisements: state.advertisements.filter(
                    advertisement => advertisement.id !== action.payload
                ),
                error: null,
            };

        case DELETE_ADVERTISEMENT_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};
