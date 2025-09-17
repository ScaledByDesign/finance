import React from "react";
import { TextInput } from "@tremor/react";
import { SearchIcon } from "@heroicons/react/solid";

export default function SearchInput({ onSearch, ...rest }) {
	const handleEnterKeyDown = (e) => {
		var keycode = e.keyCode ? e.keyCode : e.which;
		if (keycode == 13) {
            onSearch();
		}
	};

	return (
		<TextInput
			onKeyDown={handleEnterKeyDown}
			icon={SearchIcon}
			{...rest}
		/>
	);
}
