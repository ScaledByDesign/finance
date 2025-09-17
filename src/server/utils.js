import util from "util";

export const prettyPrintResponse = (response) => {
	console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

export const isEmpty = (value) =>
	value === undefined ||
	value === null ||
	(typeof value === "object" && Object.keys(value).length === 0) ||
	(typeof value === "string" && value.trim().length === 0);

export const calculateKPIs = (apiResponse) => {
  let totalCurrentBalance = 0.0;
  let totalAvailableBalance = 0.0;
  let mainContributor = "";
  let mainContributorBalance = 0;
  let totalDebt = 0.0;
  let totalAvailableCredit = 0.0;
  let totalSpend = 0.0;
  let maxCreditLimit = 0.0;
  let userAccounts = [];

  apiResponse.accounts.forEach((account) => {
    let { available, current, limit } = account.balances;
    console.log(account, account.balances);
    if (available == null) available = 0;
    if (current == null) current = 0;
    if (limit == null) limit = 0;

    userAccounts += [account];

    if (
      account.type === "savings" ||
      account.type == "investment" ||
      account.type == "brokerage" ||
      account.type === "depository"
    ) {
      totalCurrentBalance += current;
      totalAvailableBalance += available === 0 ? current : available;
    }

    if (account.type === "loan") {
      totalDebt += current;
    }

    if (account.type === "credit") {
      maxCreditLimit += limit;
      totalSpend += current;
      totalAvailableCredit += available;
    }
  });

  return {
    totalCurrentBalance,
    totalAvailableBalance,
    mainContributor,
    totalDebt,
    totalAvailableCredit,
    totalSpend,
    maxCreditLimit,
    userAccounts,
  };
};

// Define function to calculate net worth
export const calculateNetWorth = (apiResponse) => {
  const { totalDebt, totalCurrentBalance } = calculateKPIs(apiResponse);

  return totalCurrentBalance - totalDebt;
};