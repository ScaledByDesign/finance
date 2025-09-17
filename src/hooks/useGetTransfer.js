// Retrieve information about your latest ACH Transfer.

import { setTransfer } from "@/store/actions/usePlaid";
import { isEmpty } from "@/utils/util";
import { useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetTransfer = () => {
	const { accessToken, itemId, linkSuccess } = useSelector(
		(state) => state.plaid
	);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("/api/v1/plaid/transfer", {
				method: "GET",
			});
			const data = await response.json();
			dispatch(
				setTransfer({
					transfer: data,
				})
			);
		};
		// if (!isEmpty(accessToken) && !isEmpty(itemId) && linkSuccess)
			fetchData();
	}, [dispatch, accessToken, itemId, linkSuccess]);
};

export default useGetTransfer;
