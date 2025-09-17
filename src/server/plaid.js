import {
  Configuration,
  PlaidApi,
  Products,
  PlaidEnvironments,
} from "plaid";
import moment from "moment/moment";
import db from "../lib/db";
import {
  DEFAULT_PLAID_PRODUCTS,
  PLAID_COUNTRY_CODES,
  PLAID_PRODUCTS_LIST,
  PLAID_CLIENT_ID,
  PLAID_SECRET,
  PLAID_ENV,
  PLAID_REDIRECT_URI,
  PLAID_ANDROID_PACKAGE_NAME,
} from "../lib/plaid";
import {
  prettyPrintResponse,
  isEmpty,
} from "./utils";
import { getUserInfo } from "./auth";

// We store the access_token in memory - in production, store it in a secure
// persistent data store
let ACCESS_TOKEN = null;
// let PUBLIC_TOKEN = null;
let ITEM_ID = null;
// The payment_id is only relevant for the UK/EU Payment Initiation product.
// We store the payment_id in memory - in production, store it in a secure
// persistent data store along with the Payment metadata, such as userId .
let PAYMENT_ID = null;
// // The transfer_id is only relevant for Transfer ACH product.
// // We store the transfer_id in memory - in production, store it in a secure
// // persistent data store
let TRANSFER_ID = null;

// Initialize the Plaid client
// Find your API keys in the Dashboard (https://dashboard.plaid.com/account/keys)

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID,
      "PLAID-SECRET": PLAID_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});
const client = new PlaidApi(configuration);

// Export the Plaid client for use in other modules
export { client };

export const info = () => {
  return {
    item_id: ITEM_ID,
    access_token: ACCESS_TOKEN,
    Products: DEFAULT_PLAID_PRODUCTS,
  };
}

export const createLinkToken = async () => {
  let user = await getUserInfo();

  // If no user exists, create a temporary user for demo purposes
  if (!user) {
    console.log('No user found, creating temporary user for Plaid link token in demo mode');
    // Create a temporary user object for link token creation
    user = {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      locale: 'en'
    };
  }

  const configs = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: `id-${user.name || user.email || 'anonymous'}`,
    },
    client_name: user.name || user.email || 'User',
    products: PLAID_PRODUCTS_LIST[0],
    country_codes: PLAID_COUNTRY_CODES,
    language: user.locale || 'en',
  };

  // Temporarily disable redirect URI for testing
  // if (PLAID_REDIRECT_URI !== "") {
  //   configs.redirect_uri = PLAID_REDIRECT_URI;
  // }

  if (PLAID_ANDROID_PACKAGE_NAME !== "") {
    configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
  }
  let linkArray = [];
  const createTokenResponse1 = await client.linkTokenCreate(configs);
  linkArray.push(createTokenResponse1.data);

  configs.products = PLAID_PRODUCTS_LIST[1];
  const createTokenResponse2 = await client.linkTokenCreate(configs);
  linkArray.push(createTokenResponse2.data);

  configs.products = PLAID_PRODUCTS_LIST[2];
  const createTokenResponse3 = await client.linkTokenCreate(configs);
  linkArray.push(createTokenResponse3.data);

  return { link_token: linkArray };
}

export const setAccessToken = async (req) => {
  const { public_token: PUBLIC_TOKEN, metadata, type } = req;

  // Check if we're in demo mode
  const { isDemoMode } = await import('../lib/demoData');

  if (isDemoMode()) {
    // In demo mode, return a success response without actually saving to database
    console.log('Demo mode: Simulating account connection for:', metadata.accounts.map(acc => acc.name));
    return {
      isItemAccess: true,
      item_id: 'demo-item-' + Date.now(),
      accounts: metadata.accounts,
      message: 'Demo mode: Account connection simulated successfully'
    };
  }

  const user = await getUserInfo();

  if (!user) {
    throw new Error('User not found. Please create an account first.');
  }

  const { institution_id } = metadata.institution;
  const accountNames = metadata.accounts.map((item) => item.name);

  const items = await db.item.findMany({
    where: {
      userId: user.id,
      accounts: {
        some: {
          name: { in: accountNames },
        },
      },
    },
    include: {
      institution: true,
    }
  });

  const itemData = items.find(item => item.institution.institution_id === institution_id);

  if (itemData) {
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        ACCESS_TOKEN: itemData.ACCESS_TOKEN,
        ITEM_ID: itemData.ITEM_ID,
        TRANSFER_ID: itemData.TRANSFER_ID,
      }
    });

    return {
      isItemAccess: true,
      item_id: null
    };
  }
  else {
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: PUBLIC_TOKEN,
    });

    // Save it to database
    const ACCESS_TOKEN = tokenResponse.data.access_token;
    const ITEM_ID = tokenResponse.data.item_id;
    const PLAID_PRODUCTS = PLAID_PRODUCTS_LIST[type];

    let TRANSFER_ID = null;
    if (PLAID_PRODUCTS.includes(Products.Transfer)) {
      TRANSFER_ID = await authorizeAndCreateTransfer(client, ACCESS_TOKEN);
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        ACCESS_TOKEN,
        ITEM_ID,
        TRANSFER_ID,
      }
    });

    const accountsResponse = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    });
    const newAccounts = accountsResponse.data.accounts;

    console.log(`Processing ${newAccounts.length} accounts from Plaid:`, newAccounts.map(acc => acc.name));

    // Create or find institution (avoid duplicates)
    let institution = await db.institution.findFirst({
      where: { institution_id }
    });

    if (!institution) {
      institution = await db.institution.create({
        data: {
          institution_id,
          name: metadata.institution.name,
        }
      });
    }

    const newItem = await db.item.create({
      data: {
        userId: user.id,
        institutionId: institution.id,
        ACCESS_TOKEN,
        ITEM_ID,
        TRANSFER_ID,
        products: PLAID_PRODUCTS,
      },
    });

    // Process accounts sequentially to ensure all are created
    const createdAccounts = [];
    for (const account of newAccounts) {
      try {
        const newAccount = await db.account.create({
          data: {
            itemId: newItem.id,
            account_id: account.account_id,
            mask: account.mask,
            name: account.name,
            official_name: account.official_name,
            subtype: account.subtype,
            type: account.type,
          }
        });

        await db.balances.create({
          data: {
            ...account.balances,
            accountId: newAccount.id,
          }
        });

        createdAccounts.push(newAccount);
        console.log(`Successfully created account: ${account.name} (${account.account_id})`);
      } catch (error) {
        console.error(`Error creating account ${account.name}:`, error);
      }
    }

    console.log(`Successfully created ${createdAccounts.length} out of ${newAccounts.length} accounts`);

    // Automatically sync transactions after creating accounts
    console.log('Starting automatic transaction sync for new accounts...');
    try {
      await updateTransactionByItem(newItem, user);
      console.log('Transaction sync completed successfully');
    } catch (error) {
      console.error('Error during automatic transaction sync:', error);
      // Don't fail the account connection if transaction sync fails
    }

    return {
      isItemAccess: true,
      item_id: newItem.id,
      accounts: newAccounts,
    };
  }
}

export const auth = (next) => {
  Promise.resolve()
    .then(async () => {
      const authResponse = await client.authGet({
        access_token: ACCESS_TOKEN,
      });
      prettyPrintResponse(authResponse);
      return authResponse.data;
    })
    .catch(next);
}

export const updateTransactionByItem = async (item, user) => {
  const creditAccounts = item.accounts
    .filter((account) => account.type === "credit")
    .map((creditAccount) => creditAccount.account_id);

  // Update Transactions
  if (
    !isEmpty(item.products) &&
    item?.products?.includes(Products.Transactions)
  ) {
    // Set cursor to empty to receive all historical updates
    let cursor = isEmpty(item?.cursor) ? null : item.cursor;

    // New transaction updates since "cursor"
    let added = [];
    let modified = [];

    // Removed transaction ids
    let removed = [];
    let hasMore = true;

    // Iterate through each page of new transaction updates for item
    while (hasMore) {
      const request = {
        access_token: item.ACCESS_TOKEN,
        cursor: cursor,
      };

      const res = await client.transactionsSync(request);
      const data = res.data;

      // Add this page of results
      added = added.concat(data.added);
      modified = modified.concat(data.modified);
      removed = removed.concat(data.removed);

      hasMore = data.has_more;

      // Update cursor to the next cursor
      cursor = data.next_cursor;
    }

    // Update cursor for next new transaction
    await db.item.update({
      where: {
        id: item.id,
      },
      data: {
        cursor: cursor,
      },
    });

    let addedData = added.map((addedRecord) => {
      addedRecord.user = user.id;
      if (creditAccounts?.includes(addedRecord.account_id))
        addedRecord.amount = Math.abs(addedRecord.amount);
      return addedRecord;
    });

    // add new transaction
    const addPromises = addedData.map(async (tx) => {
      const newTx = await db.transaction.create({
        data: {
          userId: user.id,
          name: tx.name,
          amount: tx.amount,
          account_id: tx.account_id,
          date: new Date(tx.date),
          iso_currency_code: tx.iso_currency_code,
          unofficial_currency_code: tx.unofficial_currency_code,
          category: tx.category,
          payment_channel: tx.payment_channel,
          category_id: tx.category_id,
          check_number: tx.check_number,
          datetime: new Date(tx.datetime),
          authorized_date: new Date(tx.authorized_date),
          authorized_datetime: new Date(tx.authorized_datetime),
          merchant_name: tx.merchant_name,
          paymentMetaId: tx.paymentMetaId,
          pending: tx.pending,
          pending_transaction_id: tx.pending_transaction_id,
          personalFinanceCategoryId: tx.personalFinanceCategoryId,
          transaction_id: tx.transaction_id,
          transaction_code: tx.transaction_code,
          transaction_type: tx.transaction_type,
          cancel_transaction_id: tx.cancel_transaction_id,
          fees: tx.fees,
          investment_transaction_id: tx.investment_transaction_id,
          price: tx.price,
          quantity: tx.quantity,
          security_id: tx.security_id,
          subtype: tx.subtype,
          type: tx.type,
        }
      })

      await db.location.create({
        data: {
          ...tx.location,
          transactionId: newTx.id,
        },
      });

      await db.paymentMeta.create({
        data: {
          ...tx.payment_meta,
          transactionId: newTx.id,
        },
      });

      await db.personalFinanceCategory.create({
        data: {
          transactionId: newTx.id,
          primary: tx.personal_finance_category.primary,
          detailed: tx.personal_finance_category.detailed,
        },
      });

      
    });
    await Promise.all(addPromises);

    // update transaction
    const updatePromises = modified.map(async (tx) => {
      if (creditAccounts?.includes(tx.account_id))
        tx.amount = Math.abs(tx.amount);

      // get original transaction
      const txOrigin = await db.transaction.findFirst({
        where: {
          user: user.id,
          transaction_id: tx.transaction_id,
        }
      });

      // update location
      await db.location.update({
        where: {
          transactionId: txOrigin.id,
        },
        data: tx.location,
      });

      // update payment meta
      await db.paymentMeta.update({
        where: {
          transactionId: txOrigin.id,
        },
        data: tx.payment_meta
      })

      // update personal finance category
      await db.personalFinanceCategory.update({
        where: {
          transactionId: txOrigin.id,
        },
        data: {
          primary: tx.personal_finance_category.primary,
          detailed: tx.personal_finance_category.detailed,
        },
      })

      // update transaction
      await db.transaction.update({
        where: {
          user: user.id,
          transaction_id: txOrigin.transaction_id,
        },
        data: {
          name: tx.name,
          amount: tx.amount,
          account_id: tx.account_id,
          date: new Date(tx.date),
          iso_currency_code: tx.iso_currency_code,
          unofficial_currency_code: tx.unofficial_currency_code,
          category: tx.category,
          payment_channel: tx.payment_channel,
          category_id: tx.category_id,
          check_number: tx.check_number,
          datetime: new Date(tx.datetime),
          authorized_date: new Date(tx.authorized_date),
          authorized_datetime: new Date(tx.authorized_datetime),
          merchant_name: tx.merchant_name,
          paymentMetaId: tx.paymentMetaId,
          pending: tx.pending,
          pending_transaction_id: tx.pending_transaction_id,
          personalFinanceCategoryId: tx.personalFinanceCategoryId,
          transaction_id: tx.transaction_id,
          transaction_code: tx.transaction_code,
          transaction_type: tx.transaction_type,
          cancel_transaction_id: tx.cancel_transaction_id,
          fees: tx.fees,
          investment_transaction_id: tx.investment_transaction_id,
          price: tx.price,
          quantity: tx.quantity,
          security_id: tx.security_id,
          subtype: tx.subtype,
          type: tx.type,
        },
      });
    });
    await Promise.all(updatePromises);

    const removeItemIds = removed.map(
      (removedRecord) => removedRecord.transaction_id
    );

    // delete transactions
    await db.transaction.deleteMany({
      where: {
        userId: user.id,
        transaction_id: {
          in: removeItemIds,
        },
      },
    })
  }

  // Update investments Transactions
  try {
    if (
      isEmpty(item.products) ||
      !item?.products?.includes(Products.Investments)
    ) {
      return;
    }

    const startDate = isEmpty(item.endDate)
      ? moment().subtract(2, "years").format("YYYY-MM-DD")
      : item.endDate;
    const endDate = moment().format("YYYY-MM-DD");
    const configs = {
      access_token: item.ACCESS_TOKEN,
      start_date: startDate,
      end_date: endDate,
    };

    const investmentTransactionsResponse =
      await client.investmentsTransactionsGet(configs);
    if (isEmpty(investmentTransactionsResponse.error_code)) {
      let addedInvestData =
        investmentTransactionsResponse.data?.investment_transactions?.map(
          (addedRecord) => {
            addedRecord.user = user.id;
            addedRecord.category = [Products.Investments];
            addedRecord.payment_channel = "invest";
            return addedRecord;
          }
        );

      // add investment transaction
      const addInvestPromises = addedInvestData.map(async (tx) => {
        const location = await db.location.create({
          data: tx.location,
        });
  
        const payment_meta = await db.paymentMeta.create({
          data: tx.payment_meta,
        });
  
        const personal_finance_category = await db.personalFinanceCategory.create({
          data: {
            primary: tx.personal_finance_category.primary,
            detailed: tx.personal_finance_category.detailed,
          },
        });
  
        await db.transaction.create({
          data: {
            userId: user.id,
            name: tx.name,
            amount: tx.amount,
            account_id: tx.account_id,
            date: new Date(tx.date),
            iso_currency_code: tx.iso_currency_code,
            unofficial_currency_code: tx.unofficial_currency_code,
            category: tx.category,
            payment_channel: tx.payment_channel,
            category_id: tx.category_id,
            check_number: tx.check_number,
            datetime: new Date(tx.datetime),
            authorized_date: new Date(tx.authorized_date),
            authorized_datetime: new Date(tx.authorized_datetime),
            merchant_name: tx.merchant_name,
            paymentMetaId: tx.paymentMetaId,
            pending: tx.pending,
            pending_transaction_id: tx.pending_transaction_id,
            personalFinanceCategoryId: tx.personalFinanceCategoryId,
            transaction_id: tx.transaction_id,
            transaction_code: tx.transaction_code,
            transaction_type: tx.transaction_type,
            cancel_transaction_id: tx.cancel_transaction_id,
            fees: tx.fees,
            investment_transaction_id: tx.investment_transaction_id,
            price: tx.price,
            quantity: tx.quantity,
            security_id: tx.security_id,
            subtype: tx.subtype,
            type: tx.type,
            locationId: location.id,
            paymentMetaId: payment_meta.id,
            personalFinanceCategoryId: personal_finance_category.id,
          }
        })
      });
      await Promise.all(addInvestPromises);
    }

    await db.item.update({
      where: {
        id: item.id,
      },
      data: {
        endDate: endDate,
      },
    });
  } catch (err) {
    console.log(err.data);
  }
};

export const transactions = async (req) => {
  // Check if we should use demo mode
  const { isDemoMode, generateDemoData } = await import('../lib/demoData');
  if (isDemoMode()) {
    const demoData = generateDemoData();
    return {
      message: "success",
      transactions: demoData.transactions
    };
  }

  const user = await getUserInfo();
  const item = await db.item.findFirst({
    where: {
      userId: user.id,
      ACCESS_TOKEN: user.ACCESS_TOKEN,
    },
    include: {
      accounts: {
        include: {
          balances: true,
        },
      },
    },
  });

  await updateTransactionByItem(item, user);
  return { message: "success" };
}

export const investmentTransactions = (next) => {
  Promise.resolve()
    .then(async () => {
      const startDate = moment().subtract(30, "days").format("YYYY-MM-DD");
      const endDate = moment().format("YYYY-MM-DD");
      const configs = {
        access_token: ACCESS_TOKEN,
        start_date: startDate,
        end_date: endDate,
      };
      const investmentTransactionsResponse =
        await client.investmentsTransactionsGet(configs);
      prettyPrintResponse(investmentTransactionsResponse);
      return {
        error: null,
        investments_transactions: investmentTransactionsResponse.data,
      };
    })
    .catch(next);
};

export const identity = (next) => {
  Promise.resolve()
    .then(async () => {
      const identityResponse = await client.identityGet({
        access_token: ACCESS_TOKEN,
      });
      prettyPrintResponse(identityResponse);
      return { identity: identityResponse.data.accounts };
    })
    .catch(next);
};

// Retrieve real-time balance information
export const balance = (next) => {
  Promise.resolve()
    .then(async () => {
      const balanceResponse = await client.accountsBalanceGet({
        access_token: ACCESS_TOKEN,
      });
      prettyPrintResponse(balanceResponse);
      return balanceResponse.data;
    })
    .catch(next);
};

export const holdings = async (next) => {
  try {
    const holdingsResponse = await client.investmentsHoldingsGet({
      access_token: ACCESS_TOKEN,
    });
    prettyPrintResponse(holdingsResponse);
    return { error: null, holdings: holdingsResponse.data };
  } catch (err) {
    return handleError(err, response);
  }
};

export const liabilities = (next) => {
  Promise.resolve()
    .then(async () => {
      const liabilitiesResponse = await client.liabilitiesGet({
        access_token: ACCESS_TOKEN,
      });
      prettyPrintResponse(liabilitiesResponse);
      return {
        error: null,
        liabilities: liabilitiesResponse.data,
      };
    })
    .catch(next);
};

export const item = (next) => {
  Promise.resolve()
    .then(async () => {
      // Pull the Item - this includes information about available products,
      // billed products, webhook information, and more.
      const itemResponse = await client.itemGet({
        access_token: ACCESS_TOKEN,
      });
      // Also pull information about the institution
      const configs = {
        institution_id: itemResponse.data.item.institution_id,
        country_codes: PLAID_COUNTRY_CODES,
      };
      const instResponse = await client.institutionsGetById(configs);
      prettyPrintResponse(itemResponse);
      return {
        item: itemResponse.data.item,
        institution: instResponse.data.institution,
      };
    })
    .catch(next);
};

export const accounts = async (next) => {
  // Check if we should use demo mode
  const { isDemoMode, generateDemoData } = await import('../lib/demoData');
  if (isDemoMode()) {
    const demoData = generateDemoData();
    return demoData.accounts;
  }

  const user = await getUserInfo();
  const items = await db.item.findMany({
    where: {
      userId: user.id,
    },
    include: {
      institution: true, // Include related accounts if needed
    },
  });

  const getAccountAndUpdate = items.map(async (item) => {
    const accountsResponse = await client.accountsGet({
      access_token: item.ACCESS_TOKEN,
    });

    const curAccounts = accountsResponse.data.accounts;

    const updateAccounts = curAccounts.map(async (acc) => {
      const originAccount = await db.account.findFirst({
        where: {
          itemId: item.id,
          account_id: acc.account_id,
        }
      });

      if (originAccount) {
        const updatedAcc = await db.account.update({
          where: {
            id: originAccount.id,
          },
          data: {
            mask: acc.mask,
            name: acc.name,
            official_name: acc.official_name,
            subtype: acc.subtype,
            type: acc.type,
            persistent_account_id: acc.persistent_account_id,
          },
        });
        const updatedBalances = await db.balances.update({
          where: {
            accountId: originAccount.id
          },
          data: {
            current: acc.balances.current,
            available: acc.balances.available,
            iso_currency_code: acc.balances.iso_currency_code,
            unofficial_currency_code: acc.balances.unofficial_currency_code,
          }
        });

        return {
          ...updatedAcc,
          balances: updatedBalances
        };
      }
      else {
        const newAcc = await db.account.create({
          data: {
            itemId: item.id,
            account_id: acc.account_id,
            mask: acc.mask,
            name: acc.name,
            official_name: acc.official_name,
            subtype: acc.Subtype,
            type: acc.type,
            persistent_account_id: acc.persistent_account_id,
          }
        });
        const newBalances = await db.balances.create({
          data: {
            accountId: newAcc.id,
            current: acc.balances.current,
            available: acc.balances.available,
            iso_currency_code: acc.balances.iso_currency_code,
            unofficial_currency_code: acc.balances.unofficial_currency_code,
          }
        });

        return {
          ...newAcc,
          balances: newBalances,
        };
      }
    });

    const updatedAccounts = await Promise.all(updateAccounts);

    return {
      ...item,
      accounts: updatedAccounts,
    }
  });

  // Wait for all updates to finish and collect the updated items
  const updatedItems = await Promise.all(getAccountAndUpdate);

  return updatedItems;
};

export const getUserAccountInfo = async (access_token) => {
  const accountsResponse = await client.accountsGet({
    access_token,
  });
  return accountsResponse.data;
};

export const asserts = (next) => {
  Promise.resolve()
    .then(async () => {
      // You can specify up to two years of transaction history for an Asset
      // Report.
      const daysRequested = 10;

      // The `options` object allows you to specify a webhook for Asset Report
      // generation, as well as information that you want included in the Asset
      // Report. All fields are optional.
      const options = {
        client_report_id: "Custom Report ID #123",
        // webhook: 'https://your-domain.tld/plaid-webhook',
        user: {
          client_user_id: "Custom User ID #456",
          first_name: "Alice",
          middle_name: "Bobcat",
          last_name: "Cranberry",
          ssn: "123-45-6789",
          phone_number: "555-123-4567",
          email: "alice@example.com",
        },
      };
      const configs = {
        access_tokens: [ACCESS_TOKEN],
        days_requested: daysRequested,
        options,
      };
      const assetReportCreateResponse = await client.assetReportCreate(configs);
      prettyPrintResponse(assetReportCreateResponse);
      const assetReportToken =
        assetReportCreateResponse.data.asset_report_token;
      const getResponse = await getAssetReportWithRetries(
        client,
        assetReportToken
      );
      const pdfRequest = {
        asset_report_token: assetReportToken,
      };

      const pdfResponse = await client.assetReportPdfGet(pdfRequest, {
        responseType: "arraybuffer",
      });
      prettyPrintResponse(getResponse);
      prettyPrintResponse(pdfResponse);
      return {
        json: getResponse.data.report,
        pdf: pdfResponse.data.toString("base64"),
      };
    })
    .catch(next);
};

export const transfer = (next) => {
  Promise.resolve()
    .then(async () => {
      const transferGetResponse = await client.transferGet({
        transfer_id: TRANSFER_ID,
      });
      prettyPrintResponse(transferGetResponse);
      return {
        error: null,
        transfer: transferGetResponse.data.transfer,
      };
    })
    .catch(next);
};

export const payment = async (next) => {
  try {
    const paymentGetResponse = await client.paymentInitiationPaymentGet({
      payment_id: PAYMENT_ID,
    });
    prettyPrintResponse(paymentGetResponse);
    return { error: null, payment: paymentGetResponse.data };
  } catch (err) {
    return handleError(err, response);
  }
};

export const incomeVerification = (next) => {
  Promise.resolve()
    .then(async () => {
      const paystubsGetResponse = await client.incomeVerificationPaystubsGet({
        access_token: ACCESS_TOKEN,
      });
      prettyPrintResponse(paystubsGetResponse);
      return { error: null, paystubs: paystubsGetResponse.data };
    })
    .catch(next);
};

// This is a helper function to poll for the completion of an Asset Report and
// then send it in the response to the client. Alternatively, you can provide a
// webhook in the `options` object in your `/asset_report/create` request to be
// notified when the Asset Report is finished being generated.

const getAssetReportWithRetries = (
  client,
  asset_report_token,
  ms = 1000,
  retriesLeft = 20
) =>
  new Promise((resolve, reject) => {
    const request = {
      asset_report_token,
    };

    client
      .assetReportGet(request)
      .then(resolve)
      .catch(() => {
        setTimeout(() => {
          if (retriesLeft === 1) {
            reject("Ran out of retries while polling for asset report");
            return;
          }
          getAssetReportWithRetries(
            client,
            asset_report_token,
            ms,
            retriesLeft - 1
          ).then(resolve);
        }, ms);
      });
  });

// This is a helper function to authorize and create a Transfer after successful
// exchange of a public_token for an access_token. The TRANSFER_ID is then used
// to obtain the data about that particular Transfer.

const authorizeAndCreateTransfer = async (client, accessToken) => {
  // We call /accounts/get to obtain first account_id - in production,
  // account_id's should be persisted in a data store and retrieved
  // from there.
  const accountsResponse = await client.accountsGet({
    access_token: accessToken,
  });
  const accountId = accountsResponse.data.accounts[0].account_id;

  const transferAuthorizationResponse =
    await client.transferAuthorizationCreate({
      access_token: accessToken,
      account_id: accountId,
      type: "credit",
      network: "ach",
      amount: "1.34",
      ach_class: "ppd",
      user: {
        legal_name: "FirstName LastName",
        email_address: "foobar@email.com",
        address: {
          street: "123 Main St.",
          city: "San Francisco",
          region: "CA",
          postal_code: "94053",
          country: "US",
        },
      },
    });
  prettyPrintResponse(transferAuthorizationResponse);
  const authorizationId = transferAuthorizationResponse.data.authorization.id;

  const transferResponse = await client.transferCreate({
    access_token: accessToken,
    account_id: accountId,
    authorization_id: authorizationId,
    description: "Payment",
  });
  prettyPrintResponse(transferResponse);
  return transferResponse.data.transfer.id;
};

// Get All Categories stored in the firestore. If it doesn't exist then get all categories from plaid api.

export const getAllCategories = async (req) => {
  // Check if we should use demo mode
  const { isDemoMode, generateDemoData } = await import('../lib/demoData');
  if (isDemoMode()) {
    const demoData = generateDemoData();
    // Extract distinct categories from demo transactions
    const categories = [...new Set(demoData.transactions.flatMap(tx => tx.category))];
    const personalFinanceCategories = [
      "Food and Drink", "Shops", "Transportation", "Service", "Transfer", "Recreation", "Healthcare"
    ];
    return { categories, personalFinanceCategories };
  }

  const user = await getUserInfo();

  const transactions = await db.transaction.findMany({
    where: {
      userId: user.id,
    },
    select: {
      category: true,
      personal_finance_category: {
        select: {
          primary: true,
        },
      },
    },
  });

  // Extract distinct categories
  const categories = [...new Set(transactions.flatMap(tx => tx.category))];

  // Extract distinct personal finance categories
  const personalFinanceCategories = [
    ...new Set(transactions.map(tx => tx.personal_finance_category?.primary).filter(Boolean))
  ];

  return { categories, personalFinanceCategories };
};

export const getLiabilitiesByToken = async (ACCESS_TOKEN) => {
  const liabilitiesResponse = await client.liabilitiesGet({
    access_token: ACCESS_TOKEN,
  });
  return liabilitiesResponse.data || null;
};

export const getAuthByToken = async (ACCESS_TOKEN) => {
  const authResponse = await client.authGet({
    access_token: ACCESS_TOKEN,
  });
  return authResponse.data || null;
};

export const getInvestmentsByToken = async (ACCESS_TOKEN) => {
  const investmentsResponse = await client.investmentsHoldingsGet({
    access_token: ACCESS_TOKEN,
  });
  return investmentsResponse.data || null;
};

export const transactionsSyncAll = async (req) => {
  const user = await getUserInfo();
  const items = await db.item.findMany({
    where: {
      userId: user.id,
    },
    include: {
      accounts: {
        include: {
          balances: true,
        },
      },
    },
  });

  // Now we map over items and convert them to an array of promises
  const promises = items.map(async (item) =>
    await updateTransactionByItem(item, user)
  );
  // And then we await all these promises to finish
  await Promise.all(promises);

  return { message: "success" };
};
