// Retrieve investment holdings on file with the bank,
// brokerage, or investment institution. Analyze over-exposure
// to market segments.

import { setInvestTransactions } from "@/store/actions/usePlaid";
import { isEmpty } from "@/utils/util";
import { useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetInvestTransactions = () => {
	const { accessToken, itemId, linkSuccess } = useSelector(
		(state) => state.plaid
	);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("/api/v1/plaid/investments_transactions", {
				method: "GET",
			});
			const data = await response.json();
			dispatch(
				setInvestTransactions({
					investTransactions: data,
				})
			);
		};
		// if (!isEmpty(accessToken) && !isEmpty(itemId) && linkSuccess)
			fetchData();
	}, [dispatch, accessToken, itemId, linkSuccess]);
};

export default useGetInvestTransactions;
