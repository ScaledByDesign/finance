// Retrieve investment holdings on file with the bank,
// brokerage, or investment institution. Analyze over-exposure
// to market segments.

import { setHoldings } from "@/store/actions/usePlaid";
import { isEmpty } from "@/utils/util";
import { useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetHoldings = () => {
	const { accessToken, itemId, linkSuccess } = useSelector(
		(state) => state.plaid
	);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("/api/v1/plaid/holdings", {
				method: "GET",
			});
			const data = await response.json();
			dispatch(
				setHoldings({
					holdings: data,
				})
			);
		};
		// if (!isEmpty(accessToken) && !isEmpty(itemId) && linkSuccess)
			fetchData();
	}, [dispatch, accessToken, itemId, linkSuccess]);
};

export default useGetHoldings;
