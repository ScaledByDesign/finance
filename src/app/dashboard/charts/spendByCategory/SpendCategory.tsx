import { useSelector } from "react-redux";
import {
    BarList
} from "@tremor/react";
import { RootState } from "@/store";
import { formatCurrency } from "@/utils/currency";

const SpendCategory = ({
    searchQuery
}: {
    searchQuery: string
}) => {
    const {
        donutAsBarData,
    } = useSelector((state: RootState) => state.user);

    // Format the data with proper currency formatting
    const formattedData = donutAsBarData?.filter((item: { name: string | null; }) =>
        item.name !== null &&
        item.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    ).map((item: any) => ({
        ...item,
        value: formatCurrency(item.value || 0, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    })) || [];

    const barListChartConfig = {
        value: {
            label: "Value",
            color: "hsl(var(--chart-2))",
        },
        name: {
            label: "Name",
            color: "hsl(var(--chart-2))",
        },
        label: {
            color: "hsl(var(--background))",
        },
    }

    return (
        <div className="relative mt-4 h-[74vh] overflow-y-auto overflow-x-hidden py-20">
            <BarList
                data={formattedData}
                className="mr-4 sm:min-w-full"
                showAnimation={true}
            />
        </div>
    )
}

export default SpendCategory;
