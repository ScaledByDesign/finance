// Retrieve transactions or incremental updates for credit and depository accounts.

import { setTransactions } from "@/store/actions/usePlaid";
import apiCall from "@/utils/apiCall";
import { handleError, isEmpty } from "@/utils/util";
import { useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetTransactionsSync = () => {
    const { isItemAccess, linkSuccess } = useSelector(state => state.plaid);
    const { items } = useSelector(state => state.user);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch(
                    setTransactions({
                        isTransactionsLoaded: false,
                        transactionsInfo: {}
                    })
                );
                const response = await apiCall.get(
                    "/api/v1/plaid/transactions/all"
                );
                const data = await response.data;
                dispatch(
                    setTransactions({
                        transactionsInfo: data,
                        isTransactionsLoaded: true
                    })
                );
            } catch (err) {
                dispatch(
                    setTransactions({
                        isTransactionsLoaded: true
                    })
                );
                handleError(err);
            }
        };
        if (isItemAccess) fetchData();
    }, [dispatch, isItemAccess]); // Removed 'items' dependency to prevent infinite loop
};

export default useGetTransactionsSync;
