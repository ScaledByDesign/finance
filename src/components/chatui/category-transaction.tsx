import Link from 'next/link';
import {
    Card,
    Text,
    BarList,
    Title,
    Flex,
    Bold,
} from "@tremor/react";
import {
    ArrowNarrowRightIcon,
} from "@heroicons/react/solid";
import { formatCurrency } from "@/utils/currency";

interface CategoryTransaction {
    name: string;
    count: number;
    value: number;
}

interface FormattedCategoryTransaction {
    name: string;
    count: number;
    value: number;
}

const CategoryTransactions = ({
    props
} : { 
    props: {
        chartDataByMonth: CategoryTransaction[],
        filterDate: {
            startDate: string,
            endDate: string,
        }
    }
 }) => {
    const { chartDataByMonth, filterDate } = props;

    // Prepare data for BarList (numeric value required)
    const formattedData: FormattedCategoryTransaction[] = chartDataByMonth?.map((item: CategoryTransaction) => ({
        ...item,
        value: item.value || 0,
    })) || [];

    // Calculate insights
    const totalSpending = chartDataByMonth?.reduce((sum: number, item: CategoryTransaction) => sum + (item.value || 0), 0) || 0;
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
            className='mt-2 overflow-visible whitespace-normal text-overflow  sm:w-full'
            showAnimation={true}
            data={formattedData}
        />
        <Flex className="pt-4">
            <Link
                href={`/dashboard/transaction?financeCategory=${formattedData[0]?.name?.replace(
                    /\s\(\d+\)/,
                    ""
                )}&startDate=${filterDate.startDate}&endDate=${
                    filterDate.endDate
                }&accounts=`}
            >
                <div className='flex items-center'>
                    <p className='text-sm'>View in Explorer</p>
                    <ArrowNarrowRightIcon className='w-4 ml-2' />
                </div>
            </Link>
        </Flex>
        <br />
    </Card>
  )
}

export default CategoryTransactions;
