import { useSelector } from "react-redux";
import {
    BarList,
} from "@tremor/react";
import { FC } from 'react';
import { formatCurrency } from "@/utils/currency";

function filterAndSortBarListData(barListData: any[], searchQuery: string) {
    const filteredData = barListData.filter((item: { name: string | null; }) => item.name !== null && item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const sortedFilteredData = filteredData.sort((a: { value: number; }, b: { value: number; }) => a.value - b.value);

    // Format currency values
    return sortedFilteredData.map((item: any) => ({
        ...item,
        value: formatCurrency(item.value || 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    }));
}

interface RecurringSpendProps {
    searchQuery: string;
}

const RecurringSpend: FC<RecurringSpendProps> = ({
    searchQuery
}) => {
    const {
        barListData
    } = useSelector((state: any) => state.user);

    const filteredpages = filterAndSortBarListData(barListData, searchQuery);

    return (
        <div className="relative mt-4 h-[74vh] overflow-y-auto overflow-x-hidden py-20">
            <BarList
                data={filteredpages}
                className="mr-4 sm:min-w-full"
                showAnimation={true}
            />
        </div>
    )
}

export default RecurringSpend;
