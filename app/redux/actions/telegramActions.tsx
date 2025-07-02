import { Dispatch } from "redux";
import axios from "axios";

import {
    FETCH_TELEGRAM_LIST_REQUEST,
    FETCH_TELEGRAM_LIST_SUCCESS,
    FETCH_TELEGRAM_LIST_FAIL
} from '../constants/telegramConstants'

const getAuthToken = () => {
    return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
  };


export const _fetchTelegramList=()=>async(dispatch:Dispatch)=>{
    dispatch({type:FETCH_TELEGRAM_LIST_REQUEST})

    try{
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/telegram-chat-ids`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        //console.log(response)
        dispatch({type:FETCH_TELEGRAM_LIST_SUCCESS,payload:response.data.data.telegram_chat_ids})
    }catch(error:any){
        dispatch({type:FETCH_TELEGRAM_LIST_FAIL,payload:error.message})
    }
}
