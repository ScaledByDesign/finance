// Retrieve account and routing numbers for checking and savings accounts.

import { setAuth } from "@/store/actions/usePlaid";
import { isEmpty } from "@/utils/util";
import { useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAuth = () => {
	const { accessToken, itemId, linkSuccess } = useSelector(
		(state) => state.plaid
	);
	const dispatch = useDispatch();

	useEffect(() => {
		const init = async () => {
			const response = await fetch("/api/v1/plaid/auth", {
				method: "GET",
			});
			const data = await response.json();
			dispatch(
				setAuth({
					auth: data,
				})
			);
		};
		// if (!isEmpty(accessToken) && !isEmpty(itemId) && linkSuccess) 
			init();
	}, [dispatch, accessToken, itemId, linkSuccess]);
};

export default useGetAuth;
