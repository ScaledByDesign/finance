"use client";
import {
    DELETE_ITEM_BY_ID,
    SET_USER_INFO,
    UPDATE_USER_INFO,
    SET_DASHBOARD_DATA,
    SET_ANNUAL_TRANSACTION,
    SET_DASHBOARD_AI_SUMMARY,
    SET_ANALYZE_AI_SUMMARY,
    SET_ANALYZE_FILTER_DATE,
    SET_SELECTED_ACCOUNTS
} from "../constants/userConstants";
import { dateFormat } from "@/utils/util";

const initialState = {
    user: {},
    items: [],
    kpis: [],
    userId: "",
    accounts_info: {},
    chartData: [],
    chartDataByMonth: [],
    cumulativeSpend: [],
    cumulativeSpendNoCards: [],
    monthlySpend: [],
    monthlySpendNoCards: [],
    barListData: [],
    donutChartData: [],
    donutAsBarData: [],
    paymentChannelData: [],
    annualTransactionData: [],
    dashboardSummary: "",
    analyzeSummary: "",
    githubGraph: [],
    filterDate: {
        startDate: dateFormat(new Date(new Date().getFullYear(), new Date().getMonth() - 12, 1)),
        endDate: dateFormat(new Date())
    },
    selectedAccounts: []
};

interface Action {
    type: string;
    payload?: any;
}

export const userReducer = (state = initialState, { type, payload }: Action) => {
    switch (type) {
        case SET_USER_INFO:
            return { ...state, ...payload };
        case DELETE_ITEM_BY_ID:
            const newItems = state.items.filter((item: any) => payload !== item.id);
            return { ...state, items: newItems };
        case UPDATE_USER_INFO:
            return { ...state, user: { ...state.user, ...payload } };
        case SET_DASHBOARD_DATA:
            return { ...state, ...payload };
        case SET_ANNUAL_TRANSACTION:
            return { ...state, annualTransactionData: payload };
        case SET_DASHBOARD_AI_SUMMARY:
            return { ...state, dashboardSummary: payload };
        case SET_ANALYZE_AI_SUMMARY:
            return { ...state, analyzeSummary: payload };
        case SET_ANALYZE_FILTER_DATE:
            return { ...state, filterDate: payload };
        case SET_SELECTED_ACCOUNTS:
            return { ...state, selectedAccounts: payload };
        default:
            return { ...state };
    }
};
