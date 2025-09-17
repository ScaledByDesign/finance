import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import axios from "axios";

export const isEmpty = value =>
    value === undefined ||
    value === "undefined" ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0);

export const handleError = err => {
    if (axios.isCancel(err)) {
        console.log("cancel");
    } else if (err.response) {
        if (err.response.status === 401) {
            signOut();
        } else if (err.response.status == 403) {
            toast.error(err.response.data.message || err.response.data);
        }
    } else {
        toast.error(err.message);
    }
};

export const dateFormat = value => {
    const date = new Date(value);
    const formattedDate =
        date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2);
    return formattedDate;
};


// Legacy formatters - consider migrating to @/utils/currency.ts
export const numberFormatter = value => Intl.NumberFormat("us").format(value).toString();
export const dollarFormatter = value => Intl.NumberFormat("us", { style: "currency", currency: "USD" }).format(value).toString();

export const percentageFormatter = value =>
    `${Intl.NumberFormat("us")
        .format(value * 100)
        .toString()}%`;

export const sumArray = (array, metric) => {
    return array.reduce((accumulator, currentValue) => accumulator + currentValue[metric], 0);
}

export const usNumberformatter = (number, decimals = 0) =>
    Intl.NumberFormat("us", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })
        .format(Number(number))
        .toString();

export const formatters = {
    Spend: number => `$ ${dollarFormatter(usNumberformatter(number))}`,
    Debt: number => `$ ${usNumberformatter(number)}`,
    Transactions: number => `${numberFormatter(usNumberformatter(number))}`,
    Category: number => `${usNumberformatter(number, 2)}%`
};

export const convertIsoDateToCustomFormat = (isoDateString) => {
    return new Date(isoDateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

export const editDateProperty = (transactions) => {
    for (let i = 0; i < transactions.length; i++) {
        if (transactions[i].hasOwnProperty("date")) {
            transactions[i].date = convertIsoDateToCustomFormat(transactions[i].date);
        }
    }
    return transactions;
}

export const valueFormatter = number => `$${Intl.NumberFormat("us").format(number).toString()}`;