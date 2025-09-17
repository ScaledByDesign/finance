import { useState, useMemo, Fragment } from "react";
import { useSelector } from "react-redux";
import {
    Flex,
    Title,
    Text,
    TextInput,
} from "@tremor/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList, Tooltip } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Dialog, Transition } from "@headlessui/react";
import {
    SearchIcon,
    ArrowRightIcon
} from "@heroicons/react/solid";
import { usNumberformatter } from "@/utils/util";
import SpendCategory from "./SpendCategory";
import { colors } from "@/lib/utils";

const TopPurchaseCategory = () => {
    const {
        donutChartData,
    } = useSelector((state: { user: { donutChartData: any[] } }) => state.user);

    const [searchQuery, setSearchQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setSearchQuery("");
        setIsOpen(false);
    };

    const chartConfig = useMemo(() => donutChartData?.filter((item: { name: null; }) => item && item.name !== null).reduce((acc: { [x: string]: { label: any; color: string; }; }, item: { name: string; }, idx: number) => {
        acc[item.name?.replace(/\s+/g, '') || 'unknown'] = {
            label: item.name,
            color: colors[idx % 12],
        }
        return acc;
    }, {}) || {}, [donutChartData])

    const totalPercent = useMemo(() => donutChartData.filter((item: { name: null; }) => item && item.name !== null).reduce((sum: any, item: { percent: any; }) => sum + item.percent, 0), [donutChartData])

    const chartData = useMemo(() =>
        donutChartData
            ?.filter((item: { name: null; }) => item && item.name !== null)
            ?.map((item: { name: string; percent: number }) => ({
                category: item.name,
                percent: item.percent,
                fill: colors[donutChartData.indexOf(item) % 12]
            }))
            ?.sort((a, b) => b.percent - a.percent) || [], // Sort by percentage descending
    [donutChartData]);

    return (
        <Card className="w-full p-6 bg-background">
            <div className="w-full">
                <Title>Top Purchase Categories</Title>
                <Text>Your breakdown of purchases by category</Text>
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto w-full"
                >
                    <BarChart
                        data={chartData.slice(0, 3)}
                        layout="vertical"
                        margin={{ left: 20, right: 40, top: 10, bottom: 10 }}
                    >
                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="category"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                        />
                        <XAxis
                            type="number"
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                return (
                                    
                                        <ChartTooltipContent>
                                            <span className="font-medium">{payload[0].payload.category}</span>
                                            <span className="ml-2">{payload[0].value}%</span>
                                        </ChartTooltipContent>
                                    
                                );
                            }}
                        />
                        <Bar
                            dataKey="percent"
                            fill="var(--color-desktop)"
                            radius={4}
                        >
                            <LabelList
                                dataKey="percent"
                                position="right"
                                formatter={(value: any) => `${value}%`}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
                <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={openModal}
                >
                    Show more
                    <ArrowRightIcon className="w-4 h-4" />
                </Button>
            </div>
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
                                        <Text className="text-base font-medium">
                                            Spend Categories
                                        </Text>
                                    </Flex>
                                    <TextInput
                                        icon={SearchIcon}
                                        placeholder="Search..."
                                        className="mt-6"
                                        value={searchQuery}
                                        onChange={event => setSearchQuery(event.target.value)}
                                    />
                                    <SpendCategory searchQuery={searchQuery} />
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
        </Card>
    )
}

export default TopPurchaseCategory
