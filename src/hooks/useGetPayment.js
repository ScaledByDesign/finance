// Retrieve information about your latest payment.

import { setPaymentState } from "@/store/actions/usePlaid";
import { isEmpty } from "@/utils/util";
import { useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetPayment = () => {
	const { accessToken, itemId, linkSuccess } = useSelector(
		(state) => state.plaid
	);
	const dispatch = useDispatch();

	useEffect(() => {
		const init = async () => {
			const response = await fetch("/api/v1/plaid/payment", {
				method: "GET",
			});
			const data = await response.json();
			dispatch(
				setPaymentState({
					payments: data,
				})
			);
		};
		if (!isEmpty(accessToken) && !isEmpty(itemId) && linkSuccess) init();
	}, [dispatch, accessToken, itemId, linkSuccess]);
};

export default useGetPayment;
