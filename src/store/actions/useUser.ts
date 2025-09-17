import apiCall from "@/utils/apiCall";
import {
    SET_USER_INFO,
    DELETE_ITEM_BY_ID,
    UPDATE_USER_INFO,
    SET_DASHBOARD_DATA,
    SET_DASHBOARD_AI_SUMMARY,
    SET_ANALYZE_AI_SUMMARY,
    SET_SELECTED_ACCOUNTS,
    SET_ANALYZE_FILTER_DATE
} from "../constants/userConstants";
import { handleError, isEmpty } from "@/utils/util";
import { toast } from "react-hot-toast";
import { allTransactionSync } from "@/store/actions/useTransaction";
import { User } from "@/lib/types";

export const getUserInfo = (data: {}) => async (dispatch: any) => {
    const res = await apiCall.get("/api/v1/user", data);

    if (!isEmpty(res.data.items) && res.data.isPro) dispatch(allTransactionSync());

    dispatch(setUserInfoState(res.data));
};

export const setUserInfoState = (payload: { items?: any; isAccountsLoaded?: boolean; }) => {
    return {
        type: SET_USER_INFO,
        payload
    };
};

export const deleteItemInfoById = (item_id: string) => async (dispatch: (arg0: { type: string; payload: any; }) => void) => {
    try {
        await apiCall.delete(`/api/v1/user/item/${item_id}`);
        dispatch({
            type: DELETE_ITEM_BY_ID,
            payload: item_id
        });
        toast.success("Account deleted successfully");
    } catch (err) {
        handleError(err);
    }
};

export const updateUserInfo = (userInfo: User) => async (dispatch: (arg0: { type: string; payload: any; }) => void) => {
    try {
        await apiCall.post("/api/v1/user", { userInfo });
        dispatch({
            type: UPDATE_USER_INFO,
            payload: userInfo
        });
        toast.success("success!");
    } catch (err) {
        handleError(err);
    }
};

export const getDashboardData = () => async (dispatch: (arg0: { type: string; payload: any; }) => void) => {
    try {
        const res = await apiCall.get("/api/v1/user/dashboard");
        dispatch({
            type: SET_DASHBOARD_DATA,
            payload: res.data
        });
    } catch (err) {
        handleError(err);
    }
};

export const getChartsData = (data: { filterDate: any; selectedAccounts: any; }) => async (dispatch: (arg0: { type: string; payload: any; }) => void) => {
    try {
        const res = await apiCall.post("/api/v1/user/charts", data);
        dispatch({
            type: SET_DASHBOARD_DATA,
            payload: res.data
        });
    } catch (err) {
        handleError(err);
    }
};

export const setUserDashboardAISummary = (data: any) => async (dispatch: (arg0: { type: string; payload: any; }) => void) => {
    dispatch({
        type: SET_DASHBOARD_AI_SUMMARY,
        payload: data
    });
};

export const setUserAnalyzeAISummary = (data: string) => async (dispatch: (arg0: { type: string; payload: any; }) => void) => {
    dispatch({
        type: SET_ANALYZE_AI_SUMMARY,
        payload: data
    });
};

export const setAnalyzeFilterDate = (data: any) => async (dispatch: (arg0: { type: string; payload: any; }) => void) => {
    dispatch({
        type: SET_ANALYZE_FILTER_DATE,
        payload: data
    });
};

export const setAnalyzeSelectedAccounts = (data: any[]) => async (dispatch: (arg0: { type: string; payload: any; }) => void) => {
    dispatch({
        type: SET_SELECTED_ACCOUNTS,
        payload: data
    });
};
