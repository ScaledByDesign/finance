// Demo data for testing without Plaid credentials
export const generateDemoData = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Generate consistent transactions for the past 30 days
  const generateTransactions = (accountId: string, count: number) => {
    const categories = [
      ["Food and Drink", "Restaurants"],
      ["Shops", "Groceries"],
      ["Transportation", "Uber"],
      ["Service", "Subscription"],
      ["Transfer", "Deposit"],
      ["Recreation", "Entertainment"],
      ["Healthcare", "Pharmacy"],
      ["Service", "Utilities"],
    ];

    const merchants = [
      "Starbucks", "Whole Foods", "Target", "Amazon", "Netflix",
      "Spotify", "Uber", "Shell Gas", "CVS Pharmacy", "Walmart",
      "Chipotle", "Apple Store", "Best Buy", "Home Depot", "Costco"
    ];

    // Use account ID as seed for consistent data
    const seed = (accountId || "demo_account_001").split('_')[1] || '001';
    const seedNum = parseInt(seed, 10) || 1;

    const transactions = [];
    for (let i = 0; i < count; i++) {
      // Create deterministic "random" values based on seed and index
      const dayOffset = (seedNum * 7 + i * 3) % 30;
      const date = new Date(thirtyDaysAgo.getTime() + dayOffset * 24 * 60 * 60 * 1000);

      const categoryIndex = (seedNum + i * 2) % categories.length;
      const category = categories[categoryIndex];

      const merchantIndex = (seedNum * 3 + i * 5) % merchants.length;
      const merchant = merchants[merchantIndex];

      // Deterministic amount based on merchant and index
      const baseAmount = merchant.length * 10 + i * 15;
      const amount = (baseAmount % 200) + 5; // Between $5 and $205

      transactions.push({
        account_id: accountId,
        amount: parseFloat(amount.toFixed(2)),
        iso_currency_code: "USD",
        unofficial_currency_code: null,
        category: category,
        category_id: `${category[0]}_${category[1]}`.toLowerCase(),
        date: date.toISOString().split('T')[0],
        datetime: date.toISOString(),
        authorized_date: date.toISOString().split('T')[0],
        authorized_datetime: date.toISOString(),
        name: merchant,
        merchant_name: merchant,
        payment_channel: (seedNum + i) % 3 === 0 ? "online" : "in store",
        pending: false,
        transaction_id: `demo_${accountId}_${i.toString().padStart(3, '0')}`,
        transaction_type: category[0] === "Transfer" ? "special" : "place",
      });
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Demo accounts
  const demoAccounts = [
    {
      account_id: "demo_checking_001",
      balances: {
        available: 2543.65,
        current: 2543.65,
        iso_currency_code: "USD",
        limit: null,
        unofficial_currency_code: null,
      },
      mask: "4321",
      name: "Demo Checking",
      official_name: "Demo Checking Account",
      subtype: "checking",
      type: "depository",
    },
    {
      account_id: "demo_savings_001",
      balances: {
        available: 8750.00,
        current: 8750.00,
        iso_currency_code: "USD",
        limit: null,
        unofficial_currency_code: null,
      },
      mask: "9876",
      name: "Demo Savings",
      official_name: "Demo High-Yield Savings",
      subtype: "savings",
      type: "depository",
    },
    {
      account_id: "demo_credit_001",
      balances: {
        available: 2800.00,
        current: 1200.00,
        iso_currency_code: "USD",
        limit: 4000.00,
        unofficial_currency_code: null,
      },
      mask: "5678",
      name: "Demo Credit Card",
      official_name: "Demo Rewards Credit Card",
      subtype: "credit card",
      type: "credit",
    },
    {
      account_id: "demo_investment_001",
      balances: {
        available: null,
        current: 15420.50,
        iso_currency_code: "USD",
        limit: null,
        unofficial_currency_code: null,
      },
      mask: "1234",
      name: "Demo Investment",
      official_name: "Demo Brokerage Account",
      subtype: "brokerage",
      type: "investment",
    }
  ];

  // Demo items (bank connections)
  const demoItems = [
    {
      id: "demo_item_001",
      institution: {
        institution_id: "demo_bank",
        name: "Demo Bank",
      },
      accounts: [demoAccounts[0], demoAccounts[1]],
    },
    {
      id: "demo_item_002",
      institution: {
        institution_id: "demo_credit",
        name: "Demo Credit Union",
      },
      accounts: [demoAccounts[2]],
    },
    {
      id: "demo_item_003",
      institution: {
        institution_id: "demo_invest",
        name: "Demo Investments",
      },
      accounts: [demoAccounts[3]],
    }
  ];

  // Generate transactions for each account
  const allTransactions = [
    ...generateTransactions("demo_checking_001", 45),
    ...generateTransactions("demo_savings_001", 5),
    ...generateTransactions("demo_credit_001", 30),
    ...generateTransactions("demo_investment_001", 10),
  ];

  // Calculate spending by category
  const spendByCategory: Record<string, number> = {};
  const last30DaysTransactions = allTransactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= thirtyDaysAgo;
  });

  last30DaysTransactions.forEach(t => {
    const category = (t.category && t.category[0]) || "Other";
    if (!spendByCategory[category]) {
      spendByCategory[category] = 0;
    }
    spendByCategory[category] += t.amount;
  });

  const topCategories = Object.entries(spendByCategory)
    .map(([name, value]) => ({ name, value: parseFloat((value as number).toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Calculate KPIs
  const totalBalance = demoAccounts.reduce((sum, acc) => {
    return sum + (acc.balances.current || 0);
  }, 0);

  const totalSpending = last30DaysTransactions.reduce((sum, t) => sum + t.amount, 0);
  const avgDailySpending = totalSpending / 30;

  const kpis = [
    {
      title: "Total Balance",
      metric: parseFloat(totalBalance.toFixed(2)),
      metricPrev: parseFloat((totalBalance * 0.95).toFixed(2)),
    },
    {
      title: "Monthly Spending",
      metric: parseFloat(totalSpending.toFixed(2)),
      metricPrev: parseFloat((totalSpending * 1.1).toFixed(2)),
    },
    {
      title: "Daily Average",
      metric: parseFloat(avgDailySpending.toFixed(2)),
      metricPrev: parseFloat((avgDailySpending * 1.05).toFixed(2)),
    },
    {
      title: "Active Accounts",
      metric: demoAccounts.length,
      metricPrev: demoAccounts.length,
    }
  ];

  // Generate accounts info for dashboard
  const accounts_info: Record<string, any> = {};
  demoAccounts.forEach(account => {
    const accountTransactions = allTransactions
      .filter(t => t.account_id === account.account_id)
      .slice(0, 5);

    const accountSpendByCategory: Record<string, number> = {};
    accountTransactions.forEach(t => {
      const category = t.category[0];
      if (!accountSpendByCategory[category]) {
        accountSpendByCategory[category] = 0;
      }
      accountSpendByCategory[category] += t.amount;
    });

    accounts_info[account.account_id] = {
      recentTransactions: accountTransactions.map(t => ({
        name: t.merchant_name,
        value: t.amount,
      })),
      topCategories: Object.entries(accountSpendByCategory)
        .map(([name, value]) => ({ name, value: parseFloat((value as number).toFixed(2)) }))
        .sort((a, b) => b.value - a.value),
    };
  });

  // Generate chart data for analytics
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const categories = ['Food and Drink', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare', 'Service'];

  // Generate consistent cumulative spend data
  const cumulativeSpend = months.map((month, i) => ({
    date: month,
    spend: (i + 1) * 850 + (i * 47) % 300, // Deterministic progression
    moneyIn: (i + 1) * 220 + (i * 23) % 80,
    count: (i + 1) * 16 + (i * 7) % 8,
    moneyInCount: (i + 1) * 3 + (i % 3),
  }));

  const cumulativeSpendNoCards = months.map((month, i) => ({
    date: month,
    spend: (i + 1) * 650 + (i * 37) % 250,
    moneyIn: (i + 1) * 220 + (i * 23) % 80,
    count: (i + 1) * 13 + (i * 5) % 6,
    moneyInCount: (i + 1) * 3 + (i % 3),
  }));

  // Generate consistent monthly spend data
  const monthlySpend = months.map((month, i) => ({
    date: month,
    spend: 1200 + (i * 127) % 800, // Varies between 1200-2000
    moneyIn: 300 + (i * 67) % 400,  // Varies between 300-700
    count: 18 + (i * 13) % 15,      // Varies between 18-33
    moneyInCount: 3 + (i % 4),      // Varies between 3-6
  }));

  const monthlySpendNoCards = months.map((month, i) => ({
    date: month,
    spend: 950 + (i * 97) % 600,    // Varies between 950-1550
    moneyIn: 300 + (i * 67) % 400,  // Same as above
    count: 15 + (i * 11) % 12,      // Varies between 15-27
    moneyInCount: 3 + (i % 4),      // Same as above
  }));

  // Generate bar list data for recurring transactions
  const barListData = [
    { name: 'Netflix', value: 15.99 },
    { name: 'Spotify', value: 9.99 },
    { name: 'Amazon Prime', value: 12.99 },
    { name: 'Gym Membership', value: 29.99 },
    { name: 'Phone Bill', value: 45.00 },
    { name: 'Internet', value: 59.99 },
  ];

  // Generate donut chart data for categories
  const donutChartData = topCategories.map((cat, index) => ({
    name: cat.name,
    value: cat.value,
    percent: Math.round((cat.value / totalSpending) * 100),
    percentage: Math.round((cat.value / totalSpending) * 100),
    category: cat.name.replace(/\s+/g, ''),
  }));

  const donutAsBarData = donutChartData;

  // Generate consistent payment channel data based on actual transactions
  const onlineTransactions = (allTransactions || []).filter(t => t.payment_channel === "online");
  const inStoreTransactions = (allTransactions || []).filter(t => t.payment_channel === "in store");

  const paymentChannelData = [
    {
      name: `online (${onlineTransactions.length})`,
      value: Math.round(onlineTransactions.reduce((sum, t) => sum + t.amount, 0)),
      count: onlineTransactions.length
    },
    {
      name: `in store (${inStoreTransactions.length})`,
      value: Math.round(inStoreTransactions.reduce((sum, t) => sum + t.amount, 0)),
      count: inStoreTransactions.length
    },
  ];

  // Generate consistent chart data by month
  const chartDataByMonth = months.map((month, monthIndex) => ({
    month,
    ...categories.reduce((acc, cat, catIndex) => ({
      ...acc,
      [cat]: 150 + ((monthIndex * 37 + catIndex * 73) % 400), // Deterministic values between 150-550
    }), {})
  }));

  // Generate consistent GitHub-style activity graph
  const githubGraph = [];
  for (let week = 0; week < 52; week++) {
    const weekData = [];
    for (let day = 0; day < 7; day++) {
      // Create deterministic pattern based on week and day
      const seed = week * 7 + day;
      const isIncome = (seed % 10) < 3; // 30% chance of income
      const value = isIncome
        ? -((seed * 17) % 250 + 50)  // Income: -50 to -300
        : (seed * 23) % 150;         // Spend: 0 to 150
      weekData.push(value);
    }
    githubGraph.push(weekData);
  }

  return {
    user: {
      id: "demo_user",
      name: "Demo User",
      email: "demo@example.com",
      isPro: true,
      storeAYear: true,
    },
    items: demoItems,
    accounts: demoAccounts,
    transactions: allTransactions,
    kpis,
    kpis_prev: kpis.map(k => ({ ...k, metric: k.metricPrev })),
    accounts_info,
    topCategories,
    transactionsByDate: last30DaysTransactions,
    dashboardSummary: "This is demo data for testing the Finance dashboard. Connect your real accounts with Plaid to see your actual financial data.",
    // Additional fields required by the dashboard
    netWorth: (() => {
      const creditCurrent = demoAccounts.find(a => a.type === 'credit')?.balances?.current || 0
      return parseFloat((totalBalance - creditCurrent).toFixed(2))
    })(),
    dailyAverage: avgDailySpending,
    // Chart data for analytics
    chartData: donutChartData,
    chartDataByMonth,
    barListData,
    donutChartData,
    donutAsBarData,
    paymentChannelData,
    cumulativeSpend,
    cumulativeSpendNoCards,
    monthlySpend,
    monthlySpendNoCards,
    githubGraph,
    analyzeSummary: "",
  };
};

// Check if we should use demo mode
export const isDemoMode = () => {
  // Check client-side user preference first (if available)
  if (typeof window !== 'undefined') {
    const userPreference = localStorage.getItem('demoModePreference');
    if (userPreference !== null) {
      return userPreference === 'true';
    }
  }

  // Demo mode if no Plaid credentials or explicitly set
  const plaidClientId = process.env.PLAID_CLIENT_ID;
  const plaidSecret = process.env.PLAID_SECRET;
  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  const forceDemo = process.env.NEXT_PUBLIC_FORCE_DEMO === 'true';

  // Force demo mode if explicitly requested
  if (forceDemo || demoEnabled) {
    return true;
  }

  // Demo mode if no valid Plaid credentials
  return !plaidClientId ||
         !plaidSecret ||
         plaidClientId === 'your_sandbox_client_id_here' ||
         plaidClientId === 'your_plaid_client_id_here';
};
