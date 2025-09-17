"use client";

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, FilterIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPaymentTransaction } from "@/store/actions/useTransaction";
import { Card } from "@/components/ui/card";
import { dateFormat, handleError, isEmpty } from "@/utils/util";
import { getAllCategories } from "@/store/actions/usePlaid";
import { getDashboardData } from "@/store/actions/useUser";
import { useSearchParams } from "next/navigation";
import { valueFormatter } from "@/utils/util";
import TransactionChart from "./components/Browse";
import { AppDispatch, RootState } from "@/store";
import { Account, Item, Transaction } from "@/lib/types";
import ModernTable from "./components/Table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/chatui/spinner";
import { getAccountNameMapping, initializeDemoDataService } from "@/lib/demoDataService";

type AccountMap = { [key: string]: string };

export default function Transactions() {
    const dispatch = useDispatch<AppDispatch>();
    const searchParams = useSearchParams();
    const { isItemAccess, isTransactionsLoaded, categories } = useSelector(
        (state: RootState) => state.plaid || {}
    );
    const { data: transactions = [], size: total = 0 } = useSelector((state: RootState) => state.transactions || {});
    const { items = [], annualTransactionData } = useSelector((state: RootState) => state.user || {});
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedFinCategories, setSelectedFinCategories] = useState<string[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
    const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<string | null>("all");
    const threeMonthsAgo = useMemo(() => {
        const currentDate = new Date();
        return new Date(currentDate.getFullYear(), currentDate.getMonth() - 4, currentDate.getDate());
    }, []);

    const [filterDate, setFilterDate] = useState({
        startDate: dateFormat(threeMonthsAgo),
        endDate: dateFormat(new Date())
    });
    const [priceRange, setPriceRange] = useState({
        minPrice: "",
        maxPrice: ""
    });
    const [pageSize, setPageSize] = useState(50); // Default page size
    const [currentPage, setCurrentPage] = useState(1);
    const [showChart, setshowChart] = useState(true);
    const [merchantName, setMerchantName] = useState("");
    const [isClient, setIsClient] = useState(false);

    // Ensure we're on the client side
    useEffect(() => {
        setIsClient(true);

        // Initialize search params after client-side mount
        if (searchParams) {
            const accountsParam = searchParams.get("accounts");

            setSelectedFinCategories(
                isEmpty(searchParams.get("financeCategory"))
                    ? []
                    : searchParams.get("financeCategory")?.split(",") || []
            );

            const accountsArray = isEmpty(accountsParam) ? [] : accountsParam?.split(",") || [];
            setSelectedAccounts(accountsArray);

            setSelectedPaymentChannel(
                isEmpty(searchParams.get("channel")) ? "all" : searchParams.get("channel") || null
            );
            if (!isEmpty(searchParams.get("startDate")) || !isEmpty(searchParams.get("endDate"))) {
                setFilterDate({
                    startDate: isEmpty(searchParams.get("startDate"))
                        ? dateFormat(threeMonthsAgo)
                        : (searchParams.get("startDate") || ""),
                    endDate: isEmpty(searchParams.get("endDate")) ? dateFormat(new Date()) : (searchParams.get("endDate") || "")
                });
            }
        }
    }, [searchParams, threeMonthsAgo]);

    // Function to toggle the visibility
    const toggleFilters = () => {
        setshowChart(!showChart);
    };
  
    // fetch data - stable function that doesn't recreate unnecessarily
    const fetchData = useCallback(
        (newCurPage: number) => {
            try {
                setCurrentPage(newCurPage);
                dispatch(
                    getPaymentTransaction(
                        {
                            filter: {
                                selectedCategories,
                                selectedAccounts,
                                selectedPaymentChannel,
                                filterDate,
                                pageSize,
                                currentPage: newCurPage,
                                priceRange,
                                merchantName,
                                selectedFinCategories
                            }
                        },
                        isEmpty(annualTransactionData)
                    )
                );
            } catch (err) {
                handleError(err);
            }
        },
        [dispatch, selectedCategories, selectedAccounts, selectedPaymentChannel, filterDate, pageSize, priceRange, merchantName, selectedFinCategories, annualTransactionData]
    );

    // Single effect for initial setup - runs only once on mount
    useEffect(() => {
        if (!isClient) return;

        // Initialize demo data service for consistent account mapping
        initializeDemoDataService();

        // Load dashboard data first to populate items and accounts
        if (isEmpty(items)) {
            dispatch(getDashboardData());
        }
        if (isEmpty(categories)) {
            dispatch(getAllCategories());
        }

        // Load initial transaction data
        fetchData(1);
    }, [isClient, items, categories, fetchData, dispatch]); // Only run when client is ready

    // Separate effect for filter changes - only when filters actually change
    useEffect(() => {
        if (isClient && (selectedCategories.length > 0 || selectedAccounts.length > 0 || selectedPaymentChannel !== "all" || merchantName || selectedFinCategories.length > 0)) {
            fetchData(1);
        }
    }, [selectedCategories, selectedAccounts, selectedPaymentChannel, filterDate, pageSize, merchantName, selectedFinCategories, isClient, fetchData]);

    // Remove redundant effect - transaction loading is handled in the initial effect

    // Create a mapping of account IDs to account names
    // Use centralized demo data service for consistent mapping
    const demoAccountMapping = getAccountNameMapping();
    const accountIdToName: AccountMap = { ...demoAccountMapping };
    const depositories: AccountMap = {};

    items?.forEach((item: Item) => {
        item?.accounts?.forEach((account: Account) => {
            accountIdToName[account.account_id] = account.name ?? "unknown";
            if (account.type == "depository") {
                depositories[account.account_id] = account.name ?? "unknown";
            }
        });
    });



    const calculateAmount = (transactions: Transaction[], condition: (item: Transaction) => boolean) => 
        transactions.reduce((acc: number, item: Transaction) => condition(item) ? acc + Math.abs(item.amount) : acc, 0);
    
    const moneyIn = calculateAmount(transactions, (item) => 
        item.amount < 0 &&
        !item.category?.includes("Payment") &&
        !item.category?.includes("Credit") &&
        !item.category?.includes("Overdraft") &&
        !item.category?.includes("Transfer") &&
        !!depositories[item.account_id]
    );
    const moneyOut = calculateAmount(transactions, (item) => 
        item.amount > 0 &&
        !item.category?.includes("Transfer")
    );

    const kpis = [
        {
            title: "Transactions",
            metric: total
        },
        {
            title: "Money In",
            metric: valueFormatter(moneyIn)
        },
        {
            title: "Money Out",
            metric: valueFormatter(moneyOut)
        }
    ];

    const finalTransactions = transactions.map((transaction: Transaction) => {
        const accountName = accountIdToName[transaction.account_id];
        return {
            ...transaction,
            account: accountName,
        };
    });



    // Debug logging
    console.log('Transaction page state:', {
        isClient,
        transactionsLength: transactions.length,
        total,
        finalTransactionsLength: finalTransactions.length,
        items: items.length
    });

    // Use finalTransactions to determine loading state
    const isLoading = !isClient || !finalTransactions || finalTransactions.length === 0;

    // Show loading spinner if not yet client-side
    if (!isClient) {
        return (
            <main className="min-h-screen p-2 sm:p-4 justify-center m-auto max-w-[95vw] sm:max-w-6xl">
                <div className="flex justify-center items-center h-64">
                    {Spinner}
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen p-2 sm:p-4 justify-center m-auto max-w-[95vw] sm:max-w-6xl">
            <div className="flex justify-end gap-2 w-full mx-auto">
                {/* Top-Level Filters */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="ml-1 w-full md:w-auto text-primary bg-background">
                        <FilterIcon className="w-4 h-4 mr-1" />
                        Filter by Payment Channel
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4">
                        <div className="space-y-2">
                        <h4 className="font-medium leading-none">In Store, Online, Investment, Other</h4>
                        <p className="text-sm text-muted-foreground">
                            Select the payment channel to filter transactions
                        </p>
                        </div>
                        <div className="mt-2 grid gap-2">
                        <Select
                            value={selectedPaymentChannel ?? "all"}
                            onValueChange={(value) => {
                            setSelectedPaymentChannel(value);
                            }}
                        >
                            <SelectTrigger className="w-full text-primary bg-background">
                            <SelectValue className="text-primary font-medium border-primary" placeholder="All channels" />
                            </SelectTrigger>
                            <SelectContent>
                            <SelectItem value="all">All Channels</SelectItem>
                            <SelectItem value="online">Online Channel</SelectItem>
                            <SelectItem value="in store">In Store Channel</SelectItem>
                            <SelectItem value="investment">Investment</SelectItem>
                            <SelectItem value="other">Other Channel</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </PopoverContent>
                </Popover>
                <div className="grid gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-full md:w-auto justify-start text-left font-normal",
                        !filterDate.startDate && !filterDate.endDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        {filterDate.startDate ? (
                        filterDate.endDate ? (
                            <>
                            {format(new Date(filterDate.startDate), "LLL dd, y")} -{" "}
                            {format(new Date(filterDate.endDate), "LLL dd, y")}
                            </>
                        ) : (
                            format(new Date(filterDate.startDate), "LLL dd, y")
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
                        { label: "This Month", startOfMonth: true },
                        { label: "Last 3 Months", monthsOffset: -3 },
                        { label: "Year to Date", startOfYear: true },
                        { label: "Full Year from Today", yearsOffset: -1 },
                        { label: "2 Years from Today", yearsOffset: -2 },
                        ].map(({ label, daysOffset, monthsOffset, startOfMonth, startOfYear, yearsOffset }) => (
                        <Button
                            key={label}
                            variant="outline"
                            onClick={() => {
                            const today = new Date();
                            let startDate;
                            if (daysOffset) {
                                startDate = addDays(today, daysOffset);
                            } else if (monthsOffset) {
                                startDate = new Date(today.getFullYear(), today.getMonth() + monthsOffset, today.getDate());
                            } else if (startOfMonth) {
                                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                            } else if (startOfYear) {
                                startDate = new Date(today.getFullYear(), 0, 1);
                            } else if (yearsOffset) {
                                startDate = new Date(today.getFullYear() + yearsOffset, today.getMonth(), today.getDate());
                            }
                            if (startDate) {
                                setFilterDate({
                                startDate: startDate.toISOString(),
                                endDate: today.toISOString(),
                                });
                            }
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
                            startDate: range?.from ? range.from.toISOString() : filterDate.startDate,
                            endDate: range?.to ? range.to.toISOString() : filterDate.endDate,
                        };
                        setFilterDate(newFilterDate);
                        }}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
                </div>
            </div>
            <div className="my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {isLoading ? (
                    <>
                        <Card className="w-full p-3 sm:p-4 flex justify-center items-center">
                            {Spinner}
                        </Card>
                        <Card className="w-full p-3 sm:p-4 flex justify-center items-center">
                            {Spinner}
                        </Card>
                        <Card className="w-full p-3 sm:p-4 flex justify-center items-center">
                            {Spinner}
                        </Card>
                    </>
                ) : (
                    kpis?.map((item, index) => (
                        <Card key={"kpis" + index} className="w-full p-3 sm:p-4">
                            <div className="space-y-1 sm:space-y-2">
                                <p className="text-sm sm:text-md">{item.title}</p>
                                <div className="text-base sm:text-lg font-medium">{item.metric}</div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
            {/* Graph with loading state */}
            {showChart && (
                isLoading ? (
                    <Card className="w-full p-8 flex justify-center items-center">
                        {Spinner}
                    </Card>
                ) : (
                    <TransactionChart 
                        button={
                            <Button 
                                onClick={toggleFilters} 
                                variant="outline" 
                                type="button"
                            >
                                {showChart ? "Hide chart" : "Show chart"}
                            </Button>
                        } 
                    />
                )
            )}
            {/* Active Filters Indicator */}
            {selectedAccounts.length > 0 && (
                <div className="mt-4 mb-2">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Filtered by account:</span>
                        {selectedAccounts.map((accountId) => (
                            <span
                                key={accountId}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                                {accountIdToName[accountId] || accountId}
                                <button
                                    onClick={() => {
                                        const newAccounts = selectedAccounts.filter(id => id !== accountId);
                                        setSelectedAccounts(newAccounts);
                                        // Update URL
                                        const url = new URL(window.location.href);
                                        if (newAccounts.length > 0) {
                                            url.searchParams.set('accounts', newAccounts.join(','));
                                        } else {
                                            url.searchParams.delete('accounts');
                                        }
                                        window.history.pushState({}, '', url.toString());
                                    }}
                                    className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Table with loading state */}
            {isLoading ? (
                <Card className="mt-4 w-full p-8 flex justify-center items-center">
                    {Spinner}
                </Card>
            ) : (
                <ModernTable transactions={finalTransactions} />
            )}
            <br />
        </main>
    );
}
