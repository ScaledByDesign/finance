"use server"

import { Products } from "plaid";
import db from "../lib/db";
import {
  getLiabilitiesByToken,
  getAuthByToken,
  getInvestmentsByToken,
} from "./plaid";
import {
  isEmpty,
  calculateKPIs,
  calculateNetWorth,
} from "./utils";
import { getUserInfo as getUserSession } from "./auth";

// Sign in user function to break circular dependency
export const signInUser = async (info) => {
  const {
    email,
    name,
    picture: image,
    given_name,
    family_name,
    locale,
  } = info;

  const existingUser = await db.user.findUnique({
    where: { email },
  });

  let userInfo = await db.user.upsert({
    where: { email },
    create: {
      email,
      name,
      image,
      given_name,
      family_name: family_name || "",
      locale,
    },
    update: {
      name,
      image,
      given_name,
      family_name: family_name || "",
      locale,
    },
  });

  let user = userInfo;
  let isAdmin = userInfo.email === process.env.ADMIN_EMAIL;
  let isNewUser = existingUser ? false : true; // Fixed logic: new user if NOT existing
  let isPro = userInfo.isPro;
  if (!isPro) {
    const createdAtDate = new Date(user.createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (createdAtDate > sevenDaysAgo) {
      isPro = true;
    }
  }

  await db.user.update({
    where: { email },
    data: {
      kpis_prev: userInfo.kpis,
    },
  });

  return {
    isNewUser,
    isPro,
    isAdmin
  };
};

export const getUserInfo = async () => {
  // Check if we should use demo mode
  const { isDemoMode, generateDemoData } = await import('../lib/demoData');

  // First check environment-based demo mode
  const envDemoMode = isDemoMode();

  // Get user session to check their preference
  let user;
  try {
    user = await getUserSession();
  } catch (error) {
    user = null;
  }

  // Check user's demo mode preference from database if user exists
  let userDemoPreference = null;
  if (user) {
    try {
      const userData = await db.user.findUnique({
        where: { id: user.id },
        select: { demoModePreference: true }
      });
      userDemoPreference = userData?.demoModePreference;
    } catch (error) {
      console.log('Could not fetch user demo preference:', error.message);
    }
  }

  // Determine if we should use demo mode:
  // 1. If user has explicit preference, use that
  // 2. If no user exists, use demo mode
  // 3. If environment forces demo mode, use that
  const shouldUseDemoMode = userDemoPreference !== null
    ? userDemoPreference
    : (!user || envDemoMode);

  if (shouldUseDemoMode) {
    const demoData = generateDemoData();
    return {
      user: demoData.user,
      items: demoData.items
    };
  }

  const { email } = user;
  const userInfo = await db.user.findUnique({
    where: { email },
  });

  const items = await db.item.findMany({
    where: { userId: userInfo.id },
    select: {
      institution: true,
      accounts: {
        include: {
          balances: true,
        }
      },
    },
  });

  return {
    user: userInfo,
    items
  };
}

export const updateUserAccount = async (userInfo) => {
  const user = await getUserSession();
  await db.user.update({
    where: {
      id: user.id
    },
    data: {
      given_name: userInfo.given_name,
      country: userInfo.country,
      state: userInfo.state,
      city: userInfo.city,
      salary: parseFloat(userInfo.salary),
      payday: parseInt(userInfo.payday),
      phone: userInfo.phone,
      twilioToken: userInfo.twilioToken,
      isPro: userInfo.isPro,
      subscription: userInfo.subscription,
    }
  });
  return "User account updated successfully";
}

export const deleteItemInfoById = async (id) => {
  const user = await getUserSession();
  const item = await db.item.findFirst({
    where: {
      id
    },
    include: {
      accounts: true
    }
  });
  const accountIds = item.accounts.map(account => account.account_id);
  await db.transaction.deleteMany({
    where: {
      userId: user.id,
      account_id: { in: accountIds }
    }
  });
  await db.account.deleteMany({
    where: {
      id: { in: accountIds }
    }
  });
  await db.item.delete({
    where: {
      id
    }
  });
  return "Account deleted successfully";
}

export const deleteUserAccount = async () => {
  const user = await getUserSession();
  await db.transaction.deleteMany({
    where: {
      userId: user.id,
    }
  });
  await db.item.deleteMany({
    where: {
      userId: user.id
    }
  });
  await db.user.delete({
    where: {
      id: user.id
    }
  });
  return "User account deleted successfully";
}

export const getDashboard = async () => {
  // Check if we should use demo mode first, before authentication
  const { isDemoMode, generateDemoData } = await import('../lib/demoData');

  // First check environment-based demo mode
  const envDemoMode = isDemoMode();

  // Get user session to check their preference
  let user;
  try {
    user = await getUserSession();
  } catch (error) {
    user = null;
  }

  // Check user's demo mode preference from database if user exists
  let userDemoPreference = null;
  if (user) {
    try {
      const userData = await db.user.findUnique({
        where: { id: user.id },
        select: { demoModePreference: true }
      });
      userDemoPreference = userData?.demoModePreference;
    } catch (error) {
      console.log('Could not fetch user demo preference:', error.message);
    }
  }

  // Determine if we should use demo mode:
  // 1. If user has explicit preference, use that
  // 2. If no user exists, use demo mode
  // 3. If environment forces demo mode, use that
  const shouldUseDemoMode = userDemoPreference !== null
    ? userDemoPreference
    : (!user || envDemoMode);

  if (shouldUseDemoMode) {
    const demoData = generateDemoData();
    return demoData; // Return complete demo data with user included
  }

  const items = await db.item.findMany({
    where: { userId: user.id },
    include: {
      accounts: {
        include: {
          balances: true,
        }
      },
      institution: true,
    }
  });
  const getTotalDebtInfoPromises = items.map(async (item)=> {
    let res;
    if (item.products.includes(Products.Auth))
      res = await getAuthByToken(item.ACCESS_TOKEN);
    else if (item.products.includes(Products.Liabilities))
      res = await getLiabilitiesByToken(item.ACCESS_TOKEN);
    else if (item.products.includes(Products.Investments))
      res = await getInvestmentsByToken(item.ACCESS_TOKEN);
    const kpis = calculateKPIs(res);
    const netWorth = calculateNetWorth(res);
    return {
      kpis,
      netWorth,
    };
  });

  const infos = await Promise.all(getTotalDebtInfoPromises);
  const totalInfos = infos.reduce((acc, curValue) => ({
    kpis: {
      totalCurrentBalance: acc.kpis.totalCurrentBalance + curValue.kpis.totalCurrentBalance,
      totalAvailableBalance: acc.kpis.totalAvailableBalance + curValue.kpis.totalAvailableBalance,
      mainContributor: acc.kpis.mainContributor.totalCurrentBalance > curValue.kpis.mainContributor.totalCurrentBalance ? acc.kpis.mainContributor : curValue.kpis.mainContributor,
      totalDebt: acc.kpis.totalDebt + curValue.kpis.totalDebt,
      totalAvailableCredit: acc.kpis.totalAvailableCredit + curValue.kpis.totalAvailableCredit,
      totalSpend: acc.kpis.totalSpend + curValue.kpis.totalSpend,
      maxCreditLimit: acc.kpis.maxCreditLimit + curValue.kpis.maxCreditLimit,
    },
    netWorth: acc.netWorth + curValue.netWorth,
  }), {
    kpis: {
      totalCurrentBalance: 0,
      totalAvailableBalance: 0,
      mainContributor: {},
      totalDebt: 0,
      totalAvailableCredit: 0,
      totalSpend: 0,
      maxCreditLimit: 0,
    },
    netWorth: 0,
  });

  const kpis = [
    {
      title: "Total Cash Balance",
      metric: totalInfos.kpis.totalAvailableBalance,
      metricPrev: user.kpis_prev[0]?.metric,
      text: "Total sum of balances across your cash accounts",
    },
    {
      title: "Available Credit",
      metric: totalInfos.kpis.totalAvailableCredit,
      metricPrev: user.kpis_prev[1]?.metric,
      // delta: transDelta.toFixed(2),
      delta: totalInfos.kpis.mainContributor?.name,
      text:
          "Total available spending" +
          totalInfos.kpis.totalAvailableCredit,
    },
    {
      title: "Max Credit Limit",
      metric: totalInfos.kpis.maxCreditLimit,
      metricPrev: user.kpis_prev[2]?.metric,
      // delta: transDelta.toFixed(2),
      delta: totalInfos.kpis.totalDebt,
      text: "Your total possible spending power from credit cards or loans",
    },
  ];

  // aggregate transactions
  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      date: 'desc'
    }
  });

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    if (!acc[transaction.account_id]) {
      acc[transaction.account_id] = [];
    }
    acc[transaction.account_id].push(transaction);
    return acc;
  }, {});

  const accounts_array = Object.entries(groupedTransactions).map(([accountId, transactions]) => {
    const recentTransactions = transactions.slice(0, 5).map(transaction => ({
      name: transaction.name,
      value: transaction.amount,
      date: transaction.date,
    }));

    const categorySums = transactions.reduce((acc, transaction) => {
      transaction.category.forEach(category => {
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount;
      });
      return acc;
    }, {});

    const topCategories = Object.entries(categorySums)
      .map(([category, sum]) => ({ name: category, value: sum }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      account_id: accountId,
      recentTransactions,
      topCategories,
    };
  });

  let accounts_info = {};
  accounts_array.forEach((element) => {
    accounts_info[element.account_id] = element;
  });

  await db.user.update({
    where: {
      email: user.email
    },
    data: {
      kpis: kpis
    }
  });

  const userId = user.id;

  const dashboardData = { kpis, accounts_info, items, userId };

  return dashboardData;
}

export const getChartInfo = async (req) => {
  // Check if we should use demo mode
  const { isDemoMode, generateDemoData } = await import('../lib/demoData');

  // First check environment-based demo mode
  const envDemoMode = isDemoMode();

  // Get user session to check their preference
  let user;
  try {
    user = await getUserSession();
  } catch (error) {
    user = null;
  }

  // Check user's demo mode preference from database if user exists
  let userDemoPreference = null;
  if (user) {
    try {
      const userData = await db.user.findUnique({
        where: { id: user.id },
        select: { demoModePreference: true }
      });
      userDemoPreference = userData?.demoModePreference;
    } catch (error) {
      console.log('Could not fetch user demo preference:', error.message);
    }
  }

  // Determine if we should use demo mode:
  // 1. If user has explicit preference, use that
  // 2. If no user exists, use demo mode
  // 3. If environment forces demo mode, use that
  const shouldUseDemoMode = userDemoPreference !== null
    ? userDemoPreference
    : (!user || envDemoMode);

  if (shouldUseDemoMode) {
    // Return the same comprehensive demo data that generateDemoData() provides
    const demoData = generateDemoData();
    return {
      chartData: demoData.chartData,
      chartDataByMonth: demoData.chartDataByMonth,
      barListData: demoData.barListData,
      donutChartData: demoData.donutChartData,
      donutAsBarData: demoData.donutAsBarData,
      paymentChannelData: demoData.paymentChannelData,
      cumulativeSpend: demoData.cumulativeSpend,
      cumulativeSpendNoCards: demoData.cumulativeSpendNoCards,
      monthlySpend: demoData.monthlySpend,
      monthlySpendNoCards: demoData.monthlySpendNoCards,
      githubGraph: demoData.githubGraph,
      analyzeSummary: demoData.analyzeSummary,
    };
  }
  const { filterDate, selectedAccounts } = req;
  let start_date = new Date(filterDate.startDate);
  if (!user.storeAYear) {
    const now = new Date();
    const firstDate = new Date(now.getFullYear(), 0, 1);
    if (start_date < firstDate) start_date = firstDate;
  }
  const end_date = new Date(filterDate.endDate);
  const search_data = {
    userId: user.id,
    date: {
      gte: start_date,
      lte: end_date,
    },
  };
  if (!isEmpty(selectedAccounts))
    search_data.account_id = { in: selectedAccounts };

  // get Total Count for categories percentage
  const totalCountData = await db.transaction.count({
    where: search_data,
  });

  // calculate Spend and Transaction Info from Transaction DB
  const filteredTxs = await db.transaction.findMany({
    where: search_data,
  });
  const cumulativeSpend = await getCumulativeSpend(filteredTxs);
  const cumulativeSpendNoCards = await getCumulativeSpendNoCards(filteredTxs);
  const barListData = await getBarListData(filteredTxs);
  const paymentChannelData = await getPaymentChannelData(search_data);
  const monthlySpend = await getMonthlySpend(filteredTxs);
  const monthlySpendNoCards = await getMonthlySpendNoCards(filteredTxs);
  const chartDataByMonth = await getChartDataByMonth(search_data);
  const donutChartData = await getDonutChartData(filteredTxs, totalCountData);
  const donutAsBarData = await getDonutAsBarData(filteredTxs, totalCountData);
  const githubGraph = await getGithubGraph();

  return {
    cumulativeSpend,
    cumulativeSpendNoCards,
    barListData,
    paymentChannelData,
    monthlySpend,
    monthlySpendNoCards,
    chartDataByMonth,
    donutChartData,
    donutAsBarData,
    totalCountData,
    githubGraph,
  }
}

export const getGithubGraph = async () => {
  // Check if we should use demo mode
  const { isDemoMode, generateDemoData } = await import('../lib/demoData');

  // First check environment-based demo mode
  const envDemoMode = isDemoMode();

  // Get user session to check their preference
  let user;
  try {
    user = await getUserSession();
  } catch (error) {
    user = null;
  }

  // Check user's demo mode preference from database if user exists
  let userDemoPreference = null;
  if (user) {
    try {
      const userData = await db.user.findUnique({
        where: { id: user.id },
        select: { demoModePreference: true }
      });
      userDemoPreference = userData?.demoModePreference;
    } catch (error) {
      console.log('Could not fetch user demo preference:', error.message);
    }
  }

  // Determine if we should use demo mode:
  // 1. If user has explicit preference, use that
  // 2. If no user exists, use demo mode
  // 3. If environment forces demo mode, use that
  const shouldUseDemoMode = userDemoPreference !== null
    ? userDemoPreference
    : (!user || envDemoMode);

  if (shouldUseDemoMode) {
    // Return consistent github graph from demo data
    const demoData = generateDemoData();
    return demoData.githubGraph;
  }
  const transactions = await db.transaction.findMany({
    where: { userId: user.id },
  });

  const formattedTransactions = transactions.map(transaction => ({
    date: transaction.date,
    amount: transaction.amount
  }));

  const groupedTransactions = formattedTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const week = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const day = date.getDay();

    if (!acc[week]) {
      acc[week] = Array(7).fill(0);
    }
    acc[week][day] += transaction.amount;
    return acc;
  }, {});

  const result = Array.from({ length: 52 }, (_, week) => groupedTransactions[week] || Array(7).fill(0));

  return result;
}

export const getAllUsers = async (filter) => {
  const {
    searchKey, currentPage, pageSize, selectedPayStatus
  } = filter;

  let queryObj = {};
  if (searchKey.length > 0) {
    queryObj.OR = [
      { name: { contains: searchKey } },
      { email: { contains: searchKey} },
    ];
  }

  if (selectedPayStatus !== "all") {
    queryObj.isPro = selectedPayStatus === "payed" ? true : false;
  }

  let totalFilteredData = await db.user.count({
    where: queryObj
  });
  let data = await db.user.findMany({
    where: queryObj,
    select: {
      email: 1,
      name: 1,
      isPro: 1,
      id: 1,
      ACCESS_TOKEN: 1,
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    orderBy: {
      createdAt: "desc"
    }
  });

  return {
    size: totalFilteredData,
    data,
  }
}

export const setUserPayByEmail = async (req) => {
  const { email, isPro } = req;
  const data = await db.user.update({
    where: {
      email
    },
    data: {
      isPro
    }
  });
  return data.isPro;
}

const getCumulativeSpend = async (filteredTxs) => {
  const groupedData = filteredTxs.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    if (!acc[key]) {
      acc[key] = {
        month,
        year,
        spend: 0,
        count: 0,
        moneyIn: 0,
        moneyInCount: 0,
      };
    }

    acc[key].spend += transaction.amount > 0 ? transaction.amount : 0;
    acc[key].count += 1;
    acc[key].moneyIn += transaction.amount < 0? transaction.amount : 0;
    acc[key].moneyInCount += transaction.amount < 0 ? 1 : 0;

    return acc;
  }, {});

  const sortedData = Object.values(groupedData).sort((a, b) => {
    if (a.year === b.year) {
      return a.month - b.month;
    }
    return a.year - b.year;
  });

  let cumulativeSum = 0;
  let cumulativeCount = 0;
  let cumulativeMoneyIn = 0;
  let cumulativeMoneyInCount = 0;

  const cumulativeData = sortedData.map(data => {
    cumulativeSum += data.spend;
    cumulativeCount += data.count;
    cumulativeMoneyIn += data.moneyIn;
    cumulativeMoneyInCount += data.moneyInCount;

    return {
      month: data.month,
      year: data.year,
      spend: cumulativeSum,
      count: cumulativeCount,
      moneyIn: -cumulativeMoneyIn,
      moneyInCount: cumulativeMoneyInCount,
    };
  });

  const result = cumulativeData.map(data => ({
    sortKey: `${data.year}-${data.month < 10 ? "0" : "0"}${data.month}`,
    date: `${data.month < 10 ? "0": ""}${data.month}-${data.year}`,
    spend: data.spend,
    count: data.count,
    moneyIn: data.moneyIn,
    moneyInCount: data.moneyInCount,
  }));

  return result;
}

const getCumulativeSpendNoCards = async (filteredTxs) => {
  const transactions = filteredTxs.filter(transaction =>
    !transaction.category.some(cat => ["Credit", "Payment", "Transfer"].includes(cat))
  );

  const groupedData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    if (!acc[key]) {
      acc[key] = {
        month,
        year,
        spend: 0,
        count: 0,
        moneyIn: 0,
        moneyInCount: 0,
      };
    }

    acc[key].spend += transaction.amount > 0 ? transaction.amount : 0;
    acc[key].count += 1;
    acc[key].moneyIn += transaction.amount < 0 ? transaction.amount : 0;
    acc[key].moneyInCount += transaction.amount < 0 ? 1 : 0;

    return acc;
  }, {});

  const sortedData = Object.values(groupedData).sort((a, b) => {
    if (a.year === b.year) {
      return a.month - b.month;
    }
    return a.year - b.year;
  });

  let cumulativeSum = 0;
  let cumulativeCount = 0;
  let cumulativeMoneyIn = 0;
  let cumulativeMoneyInCount = 0;

  const cumulativeData = sortedData.map(data => {
    cumulativeSum += data.spend;
    cumulativeCount += data.count;
    cumulativeMoneyIn += data.moneyIn;
    cumulativeMoneyInCount += data.moneyInCount;

    return {
      month: data.month,
      year: data.year,
      spend: cumulativeSum,
      count: cumulativeCount,
      moneyIn: -cumulativeMoneyIn,
      moneyInCount: cumulativeMoneyInCount,
    };
  });

  const result = cumulativeData.map(data => ({
    sortKey: `${data.year}-${data.month < 10? "0" : "0"}${data.month}`,
    date: `${data.month < 10? "0": ""}${data.month}-${data.year}`,
    spend: data.spend,
    count: data.count,
    moneyIn: data.moneyIn,
    moneyInCount: data.moneyInCount,
  }));

  return result;
}

const getBarListData = async (filteredTxs) => {
  const transactions = filteredTxs.filter(transaction =>
    !transaction.category.includes("Credit")
  );

  const groupedData = transactions.reduce((acc, transaction) => {
    const name = transaction.name;

    if (!acc[name]) {
      acc[name] = {
        value: 0,
        count: 0
      };
    }

    acc[name].value += transaction.amount;
    acc[name].count += 1;

    return acc;
  }, {});

  const filteredData = Object.entries(groupedData)
    .filter(([name, data]) => data.count > 3)
    .map(([name, data]) => ({
      name: `${name} (${data.count})`,
      value: Math.trunc(data.value * 100) / 100,
      count: data.count,
    }));

  const sortedData = filteredData.sort((a, b) => b.value - a.value);

  return sortedData;
}

const getPaymentChannelData = async (search_data) => {
  const transactions = await db.transaction.findMany({
    where: {
      ...search_data,
      payment_channel: {
        not: null,
        notIn: [""],
      },
      amount: {
        gte: 0,
      },
    }
  });

  const groupedData = transactions.reduce((acc, transaction) => {
    const paymentChannel = transaction.payment_channel;

    if (!acc[paymentChannel]) {
      acc[paymentChannel] = {
        value: 0,
        count: 0
      };
    }

    acc[paymentChannel].value += transaction.amount;
    acc[paymentChannel].count += 1;

    return acc;
  }, {});

  const formattedData = Object.entries(groupedData).map(([paymentChannel, data]) => ({
    name: `${paymentChannel} (${data.count})`,
    value: Math.round(data.value * 100) / 100,
    count: data.count,
  }));

  const sortedData = formattedData.sort((a, b) => b.value - a.value);

  return sortedData;
}

const getMonthlySpend = async (filteredTxs) => {
  const groupedData = filteredTxs.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    if (!acc[key]) {
      acc[key] = {
        month,
        year,
        spend: 0,
        spendCount: 0,
        moneyIn: 0,
        moneyInCount: 0,
      };
    }

    if (transaction.amount >= 0) {
      acc[key].spend += transaction.amount;
      acc[key].spendCount += 1;
    }
    else {
      acc[key].moneyIn += transaction.amount;
      acc[key].moneyInCount += 1;
    }

    return acc;
  }, {});

  const sortedData = Object.values(groupedData).sort((a, b) => {
    if (a.year === b.year) {
      return a.month - b.month;
    }
    return a.year - b.year;
  });

  const result = sortedData.map(data => ({
    sortKey: `${data.year}-${data.month < 10 ? "0" : ""}${data.month}`,
    date: `${data.month < 10 ? "0" : ""}${data.month}-${data.year}`,
    spend: data.spend,
    count: data.spendCount,
    moneyIn: -data.moneyIn,
    moneyInCount: data.moneyInCount,
  }));

  return result;
}

const getMonthlySpendNoCards = async (filteredTxs) => {
  const transactions = filteredTxs.filter(transaction =>
    !transaction.category.some(cat => ["Credit", "Payment", "Transfer"].includes(cat))
  );

  const groupedData = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    if (!acc[key]) {
      acc[key] = {
        month,
        year,
        spend: 0,
        spendCount: 0,
        moneyIn: 0,
        moneyInCount: 0,
      };
    }

    if (transaction.amount >= 0) {
      acc[key].spend += transaction.amount;
      acc[key].spendCount += 1;
    }
    else {
      acc[key].moneyIn += transaction.amount;
      acc[key].moneyInCount += 1;
    }

    return acc;
  }, {});

  const sortedData = Object.values(groupedData).sort((a, b) => {
    if (a.year === b.year) {
      return a.month - b.month;
    }
    return a.year - b.year;
  });

  const result = sortedData.map(data => ({
    sortKey: `${data.year}-${data.month < 10 ? "0" : ""}${data.month}`,
    date: `${data.month < 10 ? "0" : ""}${data.month}-${data.year}`,
    spend: data.spend,
    count: data.spendCount,
    moneyIn: -data.moneyIn,
    moneyInCount: data.moneyInCount,
  }));

  return result;
}

const getChartDataByMonth = async (search_data) => {
  const transactions = await db.transaction.findMany({
    where: {
      ...search_data,
      amount: {
        gte: 0,
      },
    },
    include: {
      personal_finance_category: true,
    },
  });

  const filteredTransactions = transactions.filter(transaction =>
    !transaction.category.includes("Credit Card")
  );

  const groupedData = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.personal_finance_category?.primary || "INVESTMENT";

    if (!acc[category]) {
      acc[category] = {
        spend: 0,
        count: 0,
      };
    }

    acc[category].spend += transaction.amount;
    acc[category].count += 1;

    return acc;
  }, {});

  const filteredData = Object.entries(groupedData)
    .filter(([category, data]) => data.count > 5)
    .map(([category, data]) => ({
      personalFinanceCategory: category,
      spend: data.spend,
      count: data.count,
    }));

  const totalSpend = filteredData.reduce((sum, data) => sum + data.spend, 0);

  const result = filteredData.map(data => ({
    name: `${data.personalFinanceCategory} (${data.count})`,
    value: data.spend,
    count: data.count,
  }));

  const sortedData = result.sort((a, b) => b.value - a.value);

  return sortedData;
}

const getDonutChartData = async (filteredTxs, totalCountData) => {
  const filteredTransactions = filteredTxs.filter(transaction =>
    !transaction.category.includes("Credit Card") && transaction.amount >= 0
  );

  const groupedData = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category[transaction.category.length - 1];

    if (!acc[category]) {
      acc[category] = {
        totalAmount: 0,
        totalCount: 0,
      };
    }

    acc[category].totalAmount += transaction.amount;
    acc[category].totalCount += 1;

    return acc;
  }, {});

  const result = Object.entries(groupedData).map(([category, data]) => ({
    name: category,
    totalAmount: data.totalAmount,
    totalCount: data.totalCount,
    percent: (data.totalCount / totalCountData) * 100,
  }));

  const sortedData = result.sort((a, b) => b.percent - a.percent).slice(0, 10);

  return sortedData;
}

const getDonutAsBarData = async (filteredTxs, totalCountData) => {
  const filteredTransactions = filteredTxs.filter(transaction =>
    !transaction.category.includes("Credit Card") && transaction.amount >= 0
  );

  const groupedData = filteredTransactions.reduce((acc, transaction) => {
    const category = transaction.category[transaction.category.length - 1];

    if (!acc[category]) {
      acc[category] = {
        totalAmount: 0,
        totalCount: 0,
      };
    }

    acc[category].totalAmount += transaction.amount;
    acc[category].totalCount += 1;

    return acc;
  }, {});

  const result = Object.entries(groupedData).map(([category, data]) => ({
    name: category,
    totalAmount: data.totalAmount,
    totalCount: data.totalCount,
    value: Math.round((data.totalCount / totalCountData) * 100 * 100) / 100,
  }));

  const sortedData = result.sort((a, b) => b.value - a.value);

  return sortedData;
}