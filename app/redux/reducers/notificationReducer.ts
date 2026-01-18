import {
  FETCH_NOTIFICATIONS_REQUEST,
  FETCH_NOTIFICATIONS_SUCCESS,
  FETCH_NOTIFICATIONS_FAIL,

  CREATE_NOTIFICATION_REQUEST,
  CREATE_NOTIFICATION_SUCCESS,
  CREATE_NOTIFICATION_FAIL,
  UPDATE_NOTIFICATION_REQUEST,
  UPDATE_NOTIFICATION_SUCCESS,
  UPDATE_NOTIFICATION_FAIL,
  DELETE_NOTIFICATION_REQUEST,
  DELETE_NOTIFICATION_SUCCESS,
  DELETE_NOTIFICATION_FAIL,
 
} from "../constants/notificationConstants";
import { Notification } from "@/types/interface";

interface NotificationState {
  loading: boolean;
  notifications: Notification[];
  notificationDetail: Notification | null;
  error: string | null;
  totalCount: number;
  unreadCount: number;
}

const initialState: NotificationState = {
  loading: false,
  notifications: [],
  notificationDetail: null,
  error: null,
  totalCount: 0,
  unreadCount: 0,
};

const notificationReducer = (state = initialState, action: any): NotificationState => {
  switch (action.type) {
    case FETCH_NOTIFICATIONS_REQUEST:
    case CREATE_NOTIFICATION_REQUEST:
    case UPDATE_NOTIFICATION_REQUEST:
    case DELETE_NOTIFICATION_REQUEST:
    
      return { ...state, loading: true, error: null };

    case FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: action.payload.data || action.payload,
        totalCount: action.payload.totalCount || action.payload.length,
        unreadCount: action.payload.unreadCount || action.payload.filter((n: Notification) => !n.is_read).length,
        error: null,
      };



    case CREATE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: [action.payload, ...state.notifications],
        totalCount: state.totalCount + 1,
        unreadCount: state.unreadCount,
        error: null,
      };

    case UPDATE_NOTIFICATION_SUCCESS:
      return {
        ...state,
        loading: false,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload.id ? action.payload : notification
        ),
        notificationDetail: state.notificationDetail?.id === action.payload.id ? action.payload : state.notificationDetail,
        error: null,
      };

    case DELETE_NOTIFICATION_SUCCESS:
      const deletedNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        loading: false,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        totalCount: state.totalCount - 1,
        unreadCount: deletedNotification && !deletedNotification.is_read 
          ? state.unreadCount - 1 
          : state.unreadCount,
        notificationDetail: state.notificationDetail?.id === action.payload ? null : state.notificationDetail,
        error: null,
      };





    case FETCH_NOTIFICATIONS_FAIL:
    case CREATE_NOTIFICATION_FAIL:
    case UPDATE_NOTIFICATION_FAIL:
    case DELETE_NOTIFICATION_FAIL:
    
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default notificationReducer;