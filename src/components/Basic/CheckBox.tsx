import React from "react";
// import { Checkbox } from "@heroicons/react/solid";

const Checkbox = ({
    label,
    name,
    checked,
    handleChange,
    disabled,
    className
} : {
    label?: string;
    name?: string;
    checked: boolean;
    handleChange: (event: React.FormEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    className?: string;
 
}) => {
    return (
        <label
            id={name}
            className={`${className === undefined ? "" : className} flex cursor-pointer items-center`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                className="w-5 h-5 rounded text-slate-500 bg-slate-100 border-slate-300 focus:ring-2 focus:ring-slate-500 dark:border-slate-500 dark:bg-slate-600 dark:ring-offset-slate-700 dark:focus:ring-slate-600 dark:focus:ring-offset-slate-700"
            />
            <span className="ml-2 ">{label}</span>
        </label>
    );
};

export default Checkbox;
