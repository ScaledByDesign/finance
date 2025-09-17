"use server"

import db from "../../../lib/db";
import { updateTransactionByItem } from "../../plaid";

const refreshTransactionsAndGetConnectionForUser = async (user) => {
  const item = await db.item.findFirst({
    where: {
      userId: user.id,
      ACCESS_TOKEN: user.ACCESS_TOKEN,
    }
  });

  await updateTransactionByItem(item, user);
}

export default refreshTransactionsAndGetConnectionForUser;