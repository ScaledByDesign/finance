import Link from "next/link";
import { useSelector } from "react-redux";
import {
    Button,
    Card,
    Flex,
    Title,
    Text,
    Bold,
    BarList,
} from "@tremor/react";
import {
    ArrowNarrowRightIcon,
} from "@heroicons/react/solid";
import { RootState } from "@/store";
import { formatCurrency } from "@/utils/currency";

const TransactionsByCategory = () => {
    const {
        chartDataByMonth,
        filterDate,
        selectedAccounts,
    } = useSelector((state: RootState) => state.user);

    // Format the data with proper currency formatting and add insights
    const formattedData = chartDataByMonth?.slice(0, 10).map((item: any) => ({
        ...item,
        value: formatCurrency(item.value || 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    })) || [];

    // Calculate total spending and insights
    const totalSpending = chartDataByMonth?.reduce((sum: number, item: any) => sum + (item.value || 0), 0) || 0;
    const topCategory = formattedData[0];
    const categoryCount = chartDataByMonth?.length || 0;

    return (
        <Card>
            <Title>Spending Trends by Category</Title>
            <Text>
                {categoryCount > 0
                    ? `${categoryCount} spending categories • Total: ${formatCurrency(totalSpending, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}${topCategory ? ` • Top: ${topCategory.name.replace(/\s\(\d+\)/, '')}` : ''}`
                    : 'No spending data available'
                }
            </Text>
            <Flex className="mt-4 ">
                <Text>
                    <Bold>Category (Transactions)</Bold>
                </Text>
                <Text>
                    <Bold>Amount Spent</Bold>
                </Text>
            </Flex>
            <BarList
                data={formattedData}
                className="mt-2 overflow-visible whitespace-normal text-overflow sm:w-full"
                showAnimation={true}
            />
            <Flex className="pt-4">
                <Link
                    href={`/dashboard/transaction?financeCategory=${chartDataByMonth[0]?.name?.replace(
                        /\s\(\d+\)/,
                        ""
                    )}&startDate=${filterDate.startDate}&endDate=${
                        filterDate.endDate
                    }&accounts=${selectedAccounts.join(",")}`}
                >
                    <Button
                        size="xs"
                        variant="light"
                        icon={ArrowNarrowRightIcon}
                        iconPosition="right"
                        color="slate"
                    >
                        View in Explorer
                    </Button>
                </Link>
            </Flex>
            <br />
        </Card>
    )
}

export default TransactionsByCategory;
