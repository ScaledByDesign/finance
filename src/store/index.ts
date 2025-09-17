import { createStore, applyMiddleware, combineReducers, AnyAction } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk, { ThunkDispatch } from "redux-thunk";

import { themeReducer } from "./reducers/themeReducer";
import { plaidReducer } from "./reducers/plaidReducer";
import { transactionReducer } from "./reducers/transactionReducer";
import { userReducer } from "./reducers/userReducer";

const reducer = combineReducers({
	theme: themeReducer,
	plaid: plaidReducer,
	transactions: transactionReducer,
	user: userReducer,
});

const store = createStore(reducer, composeWithDevTools(applyMiddleware(thunk)));

// Get the type of our store variable
export type AppStore = typeof store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

export default store;
