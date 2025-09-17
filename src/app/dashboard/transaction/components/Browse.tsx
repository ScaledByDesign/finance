import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis
} from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Card } from "@/components/ui/card";
import { editDateProperty } from "@/utils/util";
import { RootState } from "@/store";

const TransactionChart = ({ button }: { button: React.ReactNode }) => {
    const chartConfig: ChartConfig = useMemo(() => ({
        amount: {
            label: "Amount",
            color: "hsl(var(--chart-1))",
        },
        name: {
            label: "Name",
            color: "hsl(var(--chart-1))",
        },
        category: {
            label: "Category",
            color: "hsl(var(--chart-1))",
        },
    }), [])

    const { data: transactions, size: total } = useSelector((state: RootState) => state.transactions);
    const reversedTransactions = useMemo(() => editDateProperty([...transactions].reverse()), [transactions]);

    return (
        <Card className="relative max-w-full overflow-hidden p-8">
            <div className="flex justify-between items-center">
                <p className="text-md">Browse transactions over time </p>
                {button}
            </div>
            <ChartContainer className="w-full h-40" config={chartConfig}>
                <LineChart
                    width={100}
                    height={100}
                    accessibilityLayer
                    data={reversedTransactions}
                    margin={{
                        left: 12,
                        right: 12,
                        top: 12,
                        bottom: 12
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis
                        dataKey="amount"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={
                            <ChartTooltipContent
                                hideIndicator
                                className="w-fit"
                                formatter={(value, name, item, index) => (
                                <>
                                    {chartConfig[name]?.label}
                                    <div className="ml-auto flex items-baseline font-mono font-medium tabular-nums text-foreground">
                                        {value}
                                    </div>
                                    {/* Add this after the last item */}
                                    {index === 0 && (
                                        <>
                                            <div className="flex justify-between basis-full items-center text-xs font-medium text-foreground">
                                                Name
                                                <div className="ml-auto flex items-baseline font-mono font-medium tabular-nums text-foreground">
                                                    {item.payload.name}
                                                </div>
                                            </div>
                                            <div className="flex justify-between basis-full items-center text-xs font-medium text-foreground">
                                                Category
                                                <div className="ml-auto flex items-baseline font-mono font-medium tabular-nums text-foreground">
                                                    {item.payload.category}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                                )}
                            />
                        }
                    />
                    <Line
                        dataKey="amount"
                        type="linear"
                        stroke="green"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
        </Card>
    )
}

export default TransactionChart;
