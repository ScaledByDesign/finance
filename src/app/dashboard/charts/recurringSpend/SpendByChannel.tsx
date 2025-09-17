"use client"

import Link from "next/link";
import { useSelector } from "react-redux";
import { Title, Text, Bold } from "@tremor/react";
import { Button } from "@/components/ui/button";
import { ArrowNarrowRightIcon } from "@heroicons/react/solid";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { Card } from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { RootState } from "@/store";
import { colors } from "@/lib/utils";
const chartConfig = {
    amount: {
        label: "Amount",
        color: "hsl(var(--chart-1))",
    },
    label: {
        color: "hsl(var(--background))",
    },
} satisfies ChartConfig;

const SpendByChannel = () => {
    const {
        paymentChannelData,
        filterDate,
        selectedAccounts
    } = useSelector((state: RootState) => state.user);

    const chartData = paymentChannelData?.map((item: { name: string; value: string; }) => ({
        channel: (item.name || "").replace(/\s\(\d+\)/, ""),
        amount: item.value,
        fill: colors[paymentChannelData.indexOf(item) % 12]
    })) || [];

    return (
        <Card className="w-full p-6 bg-background">
            <Title>Spend by Sales Channel</Title>
            <div className="mt-4">
                <ChartContainer config={chartConfig}>
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ left: 2, right: 20, top: 10, bottom: 10 }}
                        width={500}
                        height={200}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="channel"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                        />
                        <XAxis
                            type="number"
                            tickFormatter={(value) => `$${value}`}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <Bar
                            dataKey="amount"
                            fill="var(--color-amount)"
                            radius={4}
                        >
                            {/* <LabelList
                                dataKey="channel"
                                position="insideLeft"
                                offset={8}
                                className="fill-[--color-label]"
                                fontSize={12}
                            /> */}
                            <LabelList
                                dataKey="amount"
                                position="right"
                                formatter={(value: any) => `$${value}`}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </div>
            
            <div className="mt-4">
                <Link
                    href={`/dashboard/transaction?channel=${chartData[0]?.channel}&startDate=${filterDate.startDate}&endDate=${
                        filterDate.endDate
                    }&accounts=${selectedAccounts.join(",")}`}
                >
                    <Button className="w-full" variant="outline">
                        View in Explorer
                        <ArrowNarrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                </Link>
            </div>
        </Card>
    );
};

export default SpendByChannel;