// Create and retrieve assets information an asset report

import { setAssets } from "@/store/actions/usePlaid";
import { isEmpty } from "@/utils/util";
import { useEffect, useContext, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetAssets = () => {
	const { accessToken, itemId, linkSuccess } = useSelector(
		(state) => state.plaid
	);
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchData = async () => {
			const response = await fetch("/api/v1/plaid/assets", {
				method: "GET",
			});
			const data = await response.json();
			dispatch(
				setAssets({
					assets: data,
				})
			);
		};
		// if (!isEmpty(accessToken) && !isEmpty(itemId) && linkSuccess)
			fetchData();
	}, [dispatch, accessToken, itemId, linkSuccess]);
};

export default useGetAssets;
