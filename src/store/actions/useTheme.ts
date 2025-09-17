import { Action, Dispatch } from "redux";
import { SET_THEME_MODE } from "../constants/themeConstants";

export const toggleTheme = (dispatch: Dispatch<Action>) => {
	dispatch({
		type: SET_THEME_MODE,
	});
};
