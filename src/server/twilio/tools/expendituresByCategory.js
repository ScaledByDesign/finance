"use server"

import db from "../../../lib/db";

const expendituresByCategory = async ({user}) => {
  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
    }
  });

  const categorySpend = transactions.reduce((acc, transaction) => {
    if (transaction.category && Array.isArray(transaction.category)) {
      transaction.category.forEach(cat => {
        if (!acc[cat]) {
          acc[cat] = 0;
        }
        acc[cat] += transaction.amount;
      })
    }

    return acc;
  }, {});

  const sortedData = Object.entries(categorySpend)
    .map(([category, totalSpent]) => ({ category, totalSpent }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return sortedData.map(result => `${result.category}: ${result.totalSpent}`);
}

export default expendituresByCategory;