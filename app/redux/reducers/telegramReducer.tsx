import { TelegramChat } from '@/types/interface';
import {
    FETCH_TELEGRAM_LIST_REQUEST,
    FETCH_TELEGRAM_LIST_SUCCESS,
    FETCH_TELEGRAM_LIST_FAIL
} from '../constants/telegramConstants'



interface TelegramState {
    loading: boolean;
    telegramChatIds: TelegramChat[];
    error: string | null;
}

const initialState: TelegramState = {
    loading: false,
    telegramChatIds: [],
    error: null,
};

export const telegramReducer = (state = initialState, action: any): TelegramState => {
    switch (action.type) {
        case FETCH_TELEGRAM_LIST_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case FETCH_TELEGRAM_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                telegramChatIds: action.payload,
                error: null,
            };
        case FETCH_TELEGRAM_LIST_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};
