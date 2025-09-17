import { SET_THEME_MODE } from "../constants/themeConstants";

const initialState = {
	theme: "light",
};

interface Action {
    type: string;
    payload?: any;
}

export const themeReducer = (state = initialState, { type, payload }: Action) => {
	switch (type) {
		case SET_THEME_MODE:
			return {
				...state,
				theme: state.theme === "light" ? "dark" : "light",
			};
		default:
			return state;
	}
};
