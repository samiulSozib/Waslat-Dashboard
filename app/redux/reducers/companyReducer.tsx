import type { Company } from '@/types/interface';
import {
 FETCH_COMPANY_LIST_REQUEST,FETCH_COMPANY_LIST_SUCCESS,FETCH_COMPANY_LIST_FAIL,
 DELETE_COMPANY_REQUEST,DELETE_COMPANY_SUCCESS,DELETE_COMPANY_FAIL,
 ADD_COMPANY_REQUEST,ADD_COMPANY_SUCCESS,ADD_COMPANY_FAIL,
 EDIT_COMPANY_REQUEST,EDIT_COMPANY_SUCCESS,EDIT_COMPANY_FAIL
} from '../constants/companyConstants';
interface CompanyState {loading:boolean;companies:Company[];error:string|null;}
const initialState:CompanyState={loading:false,companies:[],error:null};
export const companyReducer=(state:CompanyState=initialState,action:any):CompanyState=>{
 switch(action.type){
  case FETCH_COMPANY_LIST_REQUEST: case DELETE_COMPANY_REQUEST: case ADD_COMPANY_REQUEST: case EDIT_COMPANY_REQUEST: return {...state,loading:true,error:null};
  case FETCH_COMPANY_LIST_SUCCESS: return {...state,loading:false,companies:Array.isArray(action.payload)?action.payload:[],error:null};
  case DELETE_COMPANY_SUCCESS: return {...state,loading:false,companies:state.companies.filter(c=>c.id!==action.payload),error:null};
  case ADD_COMPANY_SUCCESS: return {...state,loading:false,companies:[...state.companies,action.payload],error:null};
  case EDIT_COMPANY_SUCCESS: return {...state,loading:false,companies:state.companies.map(c=>c.id===action.payload?.id?{...c,...action.payload}:c),error:null};
  case FETCH_COMPANY_LIST_FAIL:case DELETE_COMPANY_FAIL:case ADD_COMPANY_FAIL:case EDIT_COMPANY_FAIL:return {...state,loading:false,error:action.payload};
  default:return state;
 }
};
