"use server"

import db from "../../../lib/db";

const sumTransactions = async ({ user }) => {
  const results = await db.transaction.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      userId: user.id,
    }
  });

  return results._sum.amount || 0;
}

export default sumTransactions;