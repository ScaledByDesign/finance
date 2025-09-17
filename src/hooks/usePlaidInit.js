import { setPlaidState } from "@/store/actions/usePlaid";
import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import apiCall from "@/utils/apiCall";

const usePlaidInit = () => {
    const dispatch = useDispatch();
    const { linkToken, linkSuccess } = useSelector(state => state.plaid);

    const init = useCallback(async () => {
        try {
            const res = await apiCall.get("/api/v1/plaid/create_link_token");

            if (res.status !== 200) {
                dispatch(setPlaidState({ linkToken: null, linkSuccess: true }));
                return;
            }
            const data = await res.data;

            // Store the link token array correctly - data.link_token is already an array
            dispatch(
                setPlaidState({ linkToken: data.link_token, linkSuccess: true })
            );
        } catch (error) {
            console.error('usePlaidInit: Error creating link token:', error);
            dispatch(setPlaidState({ linkToken: null, linkSuccess: true }));
        }
    }, [dispatch]);

    useEffect(() => {
        if (linkToken === null || linkSuccess === false) {
            init();
        }
    }, [linkToken, linkSuccess, init]);
};

export default usePlaidInit;