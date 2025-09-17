"use server"

import db from "../lib/db";
import { getUserInfo } from "./auth";
import { isEmpty } from "./utils";

export const getTransaction = async (filter) => {
  // Check if we should use demo mode
  const { isDemoMode, generateDemoData } = await import('../lib/demoData');
  const { getUserInfo: getUserSession } = await import('./auth');

  // First check environment-based demo mode
  const envDemoMode = isDemoMode();

  // Get user session to check their preference
  let user;
  try {
    user = await getUserSession();
  } catch (error) {
    console.log('Session error:', error.message);
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

  // Check if there are any real Plaid accounts in the database
  let hasRealPlaidData = false;
  try {
    const accountCount = await db.account.count();
    hasRealPlaidData = accountCount > 0;
    console.log('Real Plaid accounts found:', accountCount);
  } catch (error) {
    console.log('Could not check for real Plaid data:', error.message);
  }

  // Determine if we should use demo mode:
  // 1. If environment forces demo mode, use that
  // 2. If user has explicit preference, use that
  // 3. If real Plaid data exists, use live mode even without session
  // 4. If no user exists and no real data, use demo mode
  const shouldUseDemoMode = envDemoMode
    ? true
    : userDemoPreference !== null
    ? userDemoPreference
    : hasRealPlaidData
    ? false
    : !user;

  if (shouldUseDemoMode) {
    const demoData = generateDemoData();
    console.log('Demo mode transaction filter:', JSON.stringify(filter, null, 2));
    console.log('Demo data transactions count:', demoData.transactions.length);
    const result = handleDemoTransactions(filter, demoData);
    console.log('Returning demo transaction result:', { size: result.size, dataLength: result.data.length });
    return result;
  }

  // Use live mode - get user info through the normal flow
  let userInfo;
  try {
    userInfo = await getUserInfo();
  } catch (error) {
    console.log('Could not get user info for live mode, trying to find any user with Plaid data');
    // If we can't get user info but have real Plaid data, try to find any user
    try {
      const anyUserWithPlaidData = await db.user.findFirst({
        include: {
          items: true
        }
      });
      if (anyUserWithPlaidData) {
        userInfo = anyUserWithPlaidData;
        console.log('Using user with Plaid data:', userInfo.id);
      } else {
        console.log('No users with Plaid data found, falling back to demo mode');
        const demoData = generateDemoData();
        const result = handleDemoTransactions(filter, demoData);
        return result;
      }
    } catch (dbError) {
      console.log('Database error, falling back to demo mode:', dbError.message);
      const demoData = generateDemoData();
      const result = handleDemoTransactions(filter, demoData);
      return result;
    }
  }

  // Final safety check
  if (!userInfo || !userInfo.id) {
    console.log('No valid user found, falling back to demo mode');
    const demoData = generateDemoData();
    const result = handleDemoTransactions(filter, demoData);
    return result;
  }

  console.log('Using live mode with user:', userInfo.id);

  // Check if user has any transactions, if not try to sync first
  const existingTransactionCount = await db.transaction.count({
    where: { userId: userInfo.id }
  });

  console.log('Existing transactions for user:', existingTransactionCount);

  if (existingTransactionCount === 0) {
    console.log('No transactions found, attempting to sync from Plaid...');
    try {
      // Import the sync function
      const { transactionsSyncAll } = await import('./plaid');
      await transactionsSyncAll();

      // Check again after sync
      const newTransactionCount = await db.transaction.count({
        where: { userId: userInfo.id }
      });
      console.log('Transactions after sync:', newTransactionCount);

      if (newTransactionCount === 0) {
        console.log('No transactions available after sync - Plaid sandbox may need transaction generation');
        // Return empty result with helpful message instead of demo data
        return {
          size: 0,
          data: [],
          message: "No transactions found. Plaid sandbox accounts may need transaction history generated."
        };
      }
    } catch (syncError) {
      console.log('Transaction sync failed:', syncError.message);
      // Continue with query anyway in case there are transactions
    }
  }

  const {
    currentPage,
    pageSize,
    filterDate,
    merchantName,
    priceRange,
    selectedAccounts,
    selectedCategories,
    selectedPaymentChannel,
    selectedFinCategories,
  } = filter;
  let query = { userId: userInfo.id };

  if (!isEmpty(filterDate?.startDate) || !userInfo.storeAYear) {
    let start_date = new Date(filterDate.startDate);
    if (!userInfo.storeAYear) {
      const now = new Date();
      const firstDate = new Date(now.getFullYear(), 0, 1);
      if (start_date < firstDate) start_date = firstDate;
    }
    query.date = { gte: start_date };
  }
  if (!isEmpty(filterDate?.endDate)) {
    const end_date = new Date(filterDate.endDate);
    query.date = { ...query.date, lte: end_date };
  }

  if (priceRange.minPrice !== "") {
    query.amount = { gte: Number(priceRange.minPrice) };
  }
  if (priceRange.maxPrice !== "") {
    query.amount = {...query.amount, lte: Number(priceRange.maxPrice) };
  }

  if (merchantName !== "") {
    query.name = { contains: merchantName };
  }

  if (selectedPaymentChannel != "all") {
    query.payment_channel = selectedPaymentChannel;
  }

  if (selectedAccounts.length > 0) {
    query.account_id = { in: selectedAccounts };
  }

  if (selectedCategories.length > 0) {
    query.OR = selectedCategories.map(category => ({
      category: {
        has: category,
      },
    }));
  }

  if (selectedFinCategories.length > 0) {
    query.personal_finance_category = {
      primary: {
        in: selectedFinCategories,
      }
    }
  }

  const totalFilteredData = await db.transaction.count({
    where: {
      ...query
    }
  });
  const data = await db.transaction.findMany({
    where: {
      ...query
    },
    orderBy: {
      date: "desc"
    },
  });
  return { size: totalFilteredData, data };
}

// Handle demo transactions with filtering
function handleDemoTransactions(filter, demoData) {
  const {
    currentPage = 1,
    pageSize = 10,
    filterDate,
    merchantName,
    priceRange,
    selectedAccounts,
    selectedCategories,
    selectedPaymentChannel,
  } = filter;

  let filteredTransactions = [...demoData.transactions];

  // Apply date filters
  if (filterDate?.startDate) {
    const startDate = new Date(filterDate.startDate);
    filteredTransactions = filteredTransactions.filter(t =>
      new Date(t.date) >= startDate
    );
  }
  if (filterDate?.endDate) {
    const endDate = new Date(filterDate.endDate);
    filteredTransactions = filteredTransactions.filter(t =>
      new Date(t.date) <= endDate
    );
  }

  // Apply price range filters
  if (priceRange?.minPrice !== "" && priceRange?.minPrice !== undefined) {
    filteredTransactions = filteredTransactions.filter(t =>
      t.amount >= Number(priceRange.minPrice)
    );
  }
  if (priceRange?.maxPrice !== "" && priceRange?.maxPrice !== undefined) {
    filteredTransactions = filteredTransactions.filter(t =>
      t.amount <= Number(priceRange.maxPrice)
    );
  }

  // Apply merchant name filter
  if (merchantName && merchantName !== "") {
    filteredTransactions = filteredTransactions.filter(t =>
      t.name.toLowerCase().includes(merchantName.toLowerCase()) ||
      t.merchant_name?.toLowerCase().includes(merchantName.toLowerCase())
    );
  }

  // Apply payment channel filter
  if (selectedPaymentChannel && selectedPaymentChannel !== "all") {
    filteredTransactions = filteredTransactions.filter(t =>
      t.payment_channel === selectedPaymentChannel
    );
  }

  // Apply account filter
  if (selectedAccounts && selectedAccounts.length > 0) {
    filteredTransactions = filteredTransactions.filter(t =>
      selectedAccounts.includes(t.account_id)
    );
  }

  // Apply category filter
  if (selectedCategories && selectedCategories.length > 0) {
    filteredTransactions = filteredTransactions.filter(t =>
      t.category && selectedCategories.some(cat => t.category.includes(cat))
    );
  }

  // Sort by date descending
  filteredTransactions.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Apply pagination
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = filteredTransactions.slice(start, end);

  console.log(`Demo transactions: total=${filteredTransactions.length}, page=${currentPage}, pageSize=${pageSize}, returning=${paginatedData.length}`);

  return {
    size: filteredTransactions.length,
    data: paginatedData
  };
}