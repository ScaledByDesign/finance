import {
    Card,
    Text,
    BarList,
    Title,
    Flex,
    Bold,
} from "@tremor/react";

interface RecurringTransaction {
    name: string;
    count: number;
    value: number;
}

const RecurringTransactions = ({
    props: barListData,
} : {
    props: RecurringTransaction[];
}) => {
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
        <BarList
            data={barListData}
            className="mt-2 overflow-visible whitespace-normal text-overflow sm:w-full"
            showAnimation={true}
        />
    </Card>
  )
}

export default RecurringTransactions;