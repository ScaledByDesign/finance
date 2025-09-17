import React from 'react';
import {
    Card,
    Text,
    Title,
    Flex,
    Bold,
} from "@tremor/react";

const RecurringTransactionsSkeleton = () => {
  return (
    <Card>
        <Title>Recurring Transactions</Title>
        <Flex className="mt-4">
            <Text>
                <Bold>Merchant</Bold>
            </Text>
            <Text>
                <Bold>Total Spend</Bold>
            </Text>
        </Flex>
        <br />
        <div className="animate-pulse space-y-4">
            <div className="h-8 bg-blue-200 dark:bg-blue-800/50 rounded w-2/3"></div>
            <div className="h-8 bg-blue-200 dark:bg-blue-800/50 rounded w-4/3"></div>
            <div className="h-8 bg-blue-200 dark:bg-blue-800/50 rounded w-2/5"></div>
            <div className="h-8 bg-blue-200 dark:bg-blue-800/50 rounded w-1/2"></div>
        </div>
    </Card>
  )
}

export default RecurringTransactionsSkeleton;