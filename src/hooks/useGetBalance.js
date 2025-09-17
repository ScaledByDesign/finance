// Check balances in real time to prevent non-sufficient funds fees.

import { setBalance } from "@/store/actions/usePlaid";
import { isEmpty } from "@/utils/util";
import { useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetBalance = () => {
	const { accessToken, itemId, linkSuccess } = useSelector(
		(state) => state.plaid
	);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("/api/v1/plaid/balance", {
				method: "GET",
			});
			const data = await response.json();
			dispatch(
				setBalance({
					balance: data,
				})
			);
		};
		// if (!isEmpty(accessToken) && !isEmpty(itemId) && linkSuccess)
			fetchData();
	}, [dispatch, accessToken, itemId, linkSuccess]);
};

export default useGetBalance;
