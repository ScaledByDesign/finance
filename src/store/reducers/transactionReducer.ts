"use client";
import {
	SET_TRANSACTION
} from "../constants/transactionConstants";

const initialState = {
	data: [],
	size: 0,
};

interface Action {
    type: string;
    payload?: any;
}

export const transactionReducer = (state = initialState, { type, payload }: Action) => {
	switch (type) {
		case SET_TRANSACTION:
			return { ...state, ...payload };
		default:
			return { ...state };
	}
};
