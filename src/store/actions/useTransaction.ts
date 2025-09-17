import apiCall from "@/utils/apiCall";
import { SET_TRANSACTION } from "../constants/transactionConstants";
import { SET_ANNUAL_TRANSACTION } from "../constants/userConstants";
import { handleError } from "@/utils/util";
import { setTransactions } from "@/store/actions/usePlaid";
import { Action, Dispatch } from "redux";
import { ThunkAction } from "redux-thunk";
import { RootState } from "..";

export const getPaymentTransaction = (data: any, isSaveKPI: boolean) => async (dispatch: Dispatch<Action>) => {
    try {
        const res = await apiCall.post("/api/v1/transaction/getData", data);
        dispatch({
            type: SET_TRANSACTION,
            payload: res.data
        });
        if (isSaveKPI) {
            dispatch({ type: SET_ANNUAL_TRANSACTION, payload: res.data.data });
        }
    } catch (err) {
        handleError(err);
    }
};

type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action
>;

export const allTransactionSync = (): AppThunk => async (dispatch) => {
    try {
        dispatch(setTransactions({ isTransactionsLoaded: false }));

        await apiCall.get("/api/v1/plaid/transactions/all");

        dispatch(setTransactions({ isTransactionsLoaded: true }));
    } catch (err) {
        handleError(err);
    }
};
