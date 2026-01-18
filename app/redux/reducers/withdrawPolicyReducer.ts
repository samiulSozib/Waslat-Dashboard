import {
  FETCH_WITHDRAW_POLICIES_REQUEST,
  FETCH_WITHDRAW_POLICIES_SUCCESS,
  FETCH_WITHDRAW_POLICIES_FAILURE,
  ADD_WITHDRAW_POLICY_REQUEST,
  ADD_WITHDRAW_POLICY_SUCCESS,
  ADD_WITHDRAW_POLICY_FAIL,
  EDIT_WITHDRAW_POLICY_REQUEST,
  EDIT_WITHDRAW_POLICY_SUCCESS,
  EDIT_WITHDRAW_POLICY_FAIL,
  DELETE_WITHDRAW_POLICY_REQUEST,
  DELETE_WITHDRAW_POLICY_SUCCESS,
  DELETE_WITHDRAW_POLICY_FAIL,
} from "../constants/withdrawalPolicyConstants";
import { WithdrawalPolicy } from "@/types/interface";
import { Pagination } from "@/types/interface";

export interface WithdrawPoliciesState {
  withdrawPolicies: WithdrawalPolicy[];
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
}

const initialState: WithdrawPoliciesState = {
  withdrawPolicies: [],
  loading: false,
  error: null,
  pagination: null,
};

export const withdrawPoliciesReducer = (
  state = initialState,
  action: any
): WithdrawPoliciesState => {
  switch (action.type) {
    case FETCH_WITHDRAW_POLICIES_REQUEST:
    case ADD_WITHDRAW_POLICY_REQUEST:
    case EDIT_WITHDRAW_POLICY_REQUEST:
    case DELETE_WITHDRAW_POLICY_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_WITHDRAW_POLICIES_SUCCESS:
      return {
        ...state,
        loading: false,
        withdrawPolicies: action.payload.data,
        pagination: action.payload.pagination,
        error: null,
      };

    case ADD_WITHDRAW_POLICY_SUCCESS:
      return {
        ...state,
        loading: false,
        withdrawPolicies: [...state.withdrawPolicies, action.payload],
        error: null,
      };

    case EDIT_WITHDRAW_POLICY_SUCCESS:
      return {
        ...state,
        loading: false,
        withdrawPolicies: state.withdrawPolicies.map((policy) =>
          policy.id === action.payload.id ? action.payload : policy
        ),
        error: null,
      };

    case DELETE_WITHDRAW_POLICY_SUCCESS:
      return {
        ...state,
        loading: false,
        withdrawPolicies: state.withdrawPolicies.filter(
          (policy) => policy.id !== action.payload
        ),
        error: null,
      };

    case FETCH_WITHDRAW_POLICIES_FAILURE:
    case ADD_WITHDRAW_POLICY_FAIL:
    case EDIT_WITHDRAW_POLICY_FAIL:
    case DELETE_WITHDRAW_POLICY_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};