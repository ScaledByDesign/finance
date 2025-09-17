import { Products } from "plaid";

export const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
export const PLAID_SECRET = process.env.PLAID_SECRET;
export const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

export const DEFAULT_PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || Products.Transactions).split(",");

export const PLAID_PRODUCTS_LIST = [
  [Products.Transactions, Products.Auth],
  [Products.Transactions, Products.Liabilities],
  [Products.Transactions, Products.Investments],
];

export const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || "US").split(",");

export const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || "";

export const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || "";
