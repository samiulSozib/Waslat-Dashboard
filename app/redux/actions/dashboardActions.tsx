import { Dispatch } from "redux";
import axios from "axios";

import {
    FETCH_DASHBOARD_DATA_REQUEST,
    FETCH_DASHBOARD_DATA_SUCCESS,
    FETCH_DASHBOARD_DATA_FAIL
} from '../constants/dashboardConstants'
import { AppDispatch } from "../store";

const getAuthToken = () => {
    return localStorage.getItem("api_token") || ""; // Get the token or return an empty string if not found
  };


export const fetchDashboardData=()=>async(dispatch:AppDispatch)=>{
    dispatch({type:FETCH_DASHBOARD_DATA_REQUEST})

    try{
        const token = getAuthToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        dispatch({type:FETCH_DASHBOARD_DATA_SUCCESS,payload:response.data.data})
    }catch(error:any){
        dispatch({type:FETCH_DASHBOARD_DATA_FAIL,payload:error.message})
    }
}
