import { useState, Fragment, useMemo } from "react";
import { useSelector } from "react-redux";
import {
    Flex,
    Title,
    Text,
    TextInput,
} from "@tremor/react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    SearchIcon,
    ArrowRightIcon,
} from "@heroicons/react/solid";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Dialog, Transition } from "@headlessui/react";
import RecurringSpend from "./RecurringSpend";
import { RootState } from "@/store";
import { colors } from "@/lib/utils";

// Add chart configuration
const chartConfig = {
    amount: {
        label: "Amount",
        color: "hsl(var(--chart-1))",
    },
    label: {
        color: "hsl(var(--background))",
    },
} satisfies ChartConfig;

const RecurringTransaction = () => {
    const {
        barListData
    } = useSelector((state: RootState) => state.user);

    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const closeModal = () => {
        setSearchQuery("");
        setIsOpen(false);
    };
    const openModal = () => setIsOpen(true);

    const chartData = useMemo(() =>
        barListData?.slice(0, 3)?.map((item: { name: any; value: string; }) => ({
            merchant: item.name,
            amount: item.value,
            fill: colors[barListData.indexOf(item) % 12]
        })) || []
    , [barListData]);

    return (
        <>
            <Card className="bg-background p-6">
                <Title>Recurring Transactions</Title>
                <div className="mt-4">
                    <ChartContainer config={chartConfig}>
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ left: 40, right: 40, top: 10, bottom: 10 }}
                            width={500}
                            height={200}
                        >
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                dataKey="merchant"
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
                                    dataKey="merchant"
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
                <Button
                    className="w-full mt-4"
                    variant="outline"
                    onClick={openModal}
                >
                    Show more
                    <ArrowRightIcon className="w-4 h-4" />
                </Button>
            </Card>
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 px-30" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-opacity-25 bg-background" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-full p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-full p-6 overflow-hidden text-left align-middle transition-all transform ring-tremor shadow-tremor rounded-xl">
                                    <Flex alignItems="center" justifyContent="between">
                                        <Text className="text-base font-medium text-gray-700">
                                            Recurring Transactions
                                        </Text>
                                        <Text>Spend</Text>
                                    </Flex>
                                    <TextInput
                                        icon={SearchIcon}
                                        placeholder="Search..."
                                        className="mt-6"
                                        value={searchQuery}
                                        onChange={event => setSearchQuery(event.target.value)}
                                    />
                                    <RecurringSpend searchQuery={searchQuery} />
                                    <Button
                                        className="w-full mt-4"
                                        onClick={closeModal}
                                        color="slate"
                                    >
                                        Go back
                                    </Button>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default RecurringTransaction;
