"use client";


import { addDays, format } from "date-fns"
import { MultiSelect } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalculatorIcon, BookOpenIcon } from "@heroicons/react/outline";
import { useCallback, useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleError } from "@/utils/util";
import {
    getChartsData,
    setAnalyzeFilterDate,
    setAnalyzeSelectedAccounts,
    setUserAnalyzeAISummary
} from "@/store/actions/useUser";
import { getDashboardData } from "@/store/actions/useUser";
import { getAIResponse } from "@/hooks/actions";
import MonthlySpend from "./spendOverTime/MonthlySpend";
import TopPurchaseCategory from "./spendByCategory/TopPurchaseCategory";
import SpendByChannel from "./recurringSpend/SpendByChannel";
import RecurringTransaction from "./recurringSpend/RecurringTransaction";
import { AppDispatch, RootState } from "@/store";
import { Item } from "@/lib/types";
import GithubGraph from "./spendOverTime/GithubGraph";
import { Spinner } from "@/components/chatui/spinner";

const Kpis = {
    Spend: "spend",
    Transactions: "count"
};

const kpiList = [Kpis.Spend, Kpis.Transactions];

export default function Charts() {
    const dispatch = useDispatch<AppDispatch>();
    const {
        chartData,
        chartDataByMonth,
        barListData,
        donutChartData,
        donutAsBarData,
        paymentChannelData,
        cumulativeSpend,
        cumulativeSpendNoCards,
        monthlySpend,
        monthlySpendNoCards,
        items,
        kpis,
        analyzeSummary,
        filterDate,
        selectedAccounts,
        githubGraph
    } = useSelector((state: RootState) => state.user);
    const { isTransactionsLoaded } = useSelector((state: RootState) => state.plaid);
    const [filterCreditCards, setFilterCreditCards] = useState('true');
    const [isDataReady, setIsDataReady] = useState(false);
    const hasMadeApiCall = useRef(false);
    const [insightsVisible, setInsightsVisible] = useState(true);
    const [aiSummary, setAiSummary] = useState("Summarizing insights from transactions data... ");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedKpi = kpiList[selectedIndex];
    const setFilterDate = (date: any) => dispatch(setAnalyzeFilterDate(date));
    const setSelectedAccounts = (accounts: any[]) => dispatch(setAnalyzeSelectedAccounts(accounts));

    const initAISummary = useCallback(() => {
        dispatch(setUserAnalyzeAISummary(""));
    }, [dispatch]);

    const fetchData = useCallback(async () => {
        if (isTransactionsLoaded) {
            dispatch(getDashboardData());
            dispatch(getChartsData({ filterDate, selectedAccounts }));
        }
    }, [dispatch, filterDate, isTransactionsLoaded, selectedAccounts]);

    useEffect(() => {
        fetchData();
    }, [filterDate, items, isTransactionsLoaded, selectedAccounts, fetchData]);

    const fetchAiSummary = async () => {
        if (isDataReady && !hasMadeApiCall.current && analyzeSummary?.length < 50) {
            try {
                hasMadeApiCall.current = true;
                const response = await getAIResponse(
                    `data:{${JSON.stringify([
                        barListData,
                        donutChartData,
                        paymentChannelData,
                        monthlySpendNoCards,
                        chartDataByMonth,
                        averageMonthlyMoneyIn,
                        averageMonthlySpend
                    ])}}`
                );

                if (response) {  // Check if response is not undefined
                    const { data } = response;
                    // Use data safely here
                    dispatch(setUserAnalyzeAISummary(data?.message));
                } else {
                    // Handle the undefined case gracefully
                    console.error('Response was undefined');
                }
            } catch (error) {
                handleError(error);
            }
        }
    };

    function calculateAveragesMonthly() {
        let totalSpend = 0;
        let totalMoneyIn = 0;
        let totalTransactions = 0;
        let numberOfMonths = filterCreditCards === 'true' ? monthlySpendNoCards?.length : monthlySpend?.length;

        for (let i = 0; i < numberOfMonths; i++) {
            if(filterCreditCards === 'true') {
                totalSpend += monthlySpendNoCards[i]?.spend;
                totalMoneyIn += monthlySpendNoCards[i]?.moneyIn;
                totalTransactions += monthlySpendNoCards[i]?.count;
            }
            else{
                totalSpend += monthlySpend[i]?.spend;
                totalMoneyIn += monthlySpend[i]?.moneyIn;
                totalTransactions += monthlySpend[i]?.count;
            }
        }

        let averageMonthlySpend = totalSpend / numberOfMonths;
        let averageMonthlyMoneyIn = totalMoneyIn / numberOfMonths;
        let avgTransaction = totalTransactions / numberOfMonths;

        return {
            averageMonthlySpend,
            averageMonthlyMoneyIn,
            avgTransaction
        };
    }

    const { averageMonthlySpend, averageMonthlyMoneyIn , avgTransaction} = calculateAveragesMonthly();

    const handleSetSelectedAccounts = (e: any) => {
        dispatch(setUserAnalyzeAISummary(""));
        setSelectedAccounts(e);
    };

    const handleSetFilterDate = (e: any) => {
        setFilterDate(e);
        dispatch(setUserAnalyzeAISummary(""));
    };

    return (
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 m-auto max-w-7xl">
            <div className="w-full space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto"
                        >
                            {filterDate.startDate ? (
                                filterDate.endDate ? (
                                    <>
                                        {new Date(filterDate.startDate).toLocaleDateString()} -{" "}
                                        {new Date(filterDate.endDate).toLocaleDateString()}
                                    </>
                                ) : (
                                    new Date(filterDate.startDate).toLocaleDateString()
                                )
                            ) : (
                                <span>Pick a date</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <div className="p-4 grid grid-cols-2 gap-2">
                            {[
                                { label: "Last 7 Days", daysOffset: -7 },
                                { label: "Last 14 Days", daysOffset: -14 },
                                { label: "Last 30 Days", daysOffset: -30 },
                                { label: "Last 60 Days", daysOffset: -60 },
                                { label: "Last 90 Days", daysOffset: -90 },
                                { label: "Last 365 Days", daysOffset: -365 },
                            ].map(({ label, daysOffset }) => (
                                <Button
                                    key={label}
                                    variant="outline"
                                    onClick={() => {
                                        const today = new Date();
                                        const startDate = addDays(today, daysOffset);
                                        setFilterDate({
                                            startDate: startDate.toISOString(),
                                            endDate: today.toISOString(),
                                        });
                                    }}
                                >
                                    {label}
                                </Button>
                            ))}
                        </div>
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={filterDate.startDate ? new Date(filterDate.startDate) : undefined}
                            selected={{
                                from: filterDate.startDate ? new Date(filterDate.startDate) : undefined,
                                to: filterDate.endDate ? new Date(filterDate.endDate) : undefined,
                            }}
                            onSelect={(range) => {
                                const newFilterDate = {
                                    startDate: range?.from ? range.from.toISOString() : null,
                                    endDate: range?.to ? range.to.toISOString() : null,
                                };
                                handleSetFilterDate(newFilterDate);
                            }}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
                <div className="w-full sm:w-auto">
                    <MultiSelect
                        options={items?.flatMap((item: Item) => item?.accounts?.map(account => ({
                            value: account.account_id,
                            label: account.name
                        })))}
                        variant="secondary"
                        onValueChange={handleSetSelectedAccounts}
                        defaultValue={selectedAccounts}
                        placeholder="Select Accounts..."
                    />
                </div>
                <div className="w-full sm:w-auto">
                    <Select value={filterCreditCards} onValueChange={setFilterCreditCards}>
                        <SelectContent>
                            <SelectItem value={'true'}>
                                Yes, filter credit payments out of spend
                            </SelectItem>
                            <SelectItem value={'false'}>
                                No, include card payments in spend
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-4 max-w-full">
                <div className="max-w-full">
                    {!githubGraph ? (
                        <div className="flex justify-center p-8 border rounded-md">
                            {Spinner}
                        </div>
                    ) : (
                        <GithubGraph data={githubGraph}/>
                    )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {!githubGraph || !donutChartData?.length || !paymentChannelData?.length || !barListData?.length ? (
                        <>
                            {Array(3).fill(null).map((_, index) => (
                                <div key={index} className="flex justify-center p-8 border rounded-md">{Spinner}</div>
                            ))}
                        </>
                    ) : (
                        <>
                            <TopPurchaseCategory />
                            <SpendByChannel />
                            <RecurringTransaction />
                        </>
                    )}
                </div>
                <div className="max-w-full">
                    {!githubGraph || !monthlySpend?.length || !monthlySpendNoCards?.length ? (
                        <div className="flex justify-center p-8 border rounded-md">
                            {Spinner}
                        </div>
                    ) : (
                        <MonthlySpend
                            selectedKpi={selectedKpi}
                            selectedIndex={selectedIndex}
                            setSelectedIndex={setSelectedIndex}
                            filterCreditCards={filterCreditCards}
                        />
                    )}
                </div>
            </div>
        </main>
    );
}
