"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  ShoppingBag,
  Users,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Calendar,
  PieChart,
  BarChart3,
  Wallet,
  Plus,
  Home,
  Receipt,
  TrendingUp as Analytics,
  Settings,
  Menu,
  X,
  ChevronDown,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransactions } from "../hooks/useTransactions";
import type { Transaction } from "../hooks/useTransactions";

interface CategoryBudget {
  name: string;
  budget: number;
  spent: number;
  icon: React.ElementType;
  color: string;
}

interface MobileBusinessScreenProps {
  onBack?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const MobileBusinessScreen: React.FC<MobileBusinessScreenProps> = ({
  onBack = () => window.history.back(),
  isDarkMode = false,
  onToggleTheme = () => {}
}) => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const { scrollY } = useScroll();
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);

  // Use the custom hook to fetch transactions
  const {
    transactions: rawTransactions,
    totalCount,
    loading,
    error,
    refresh
  } = useTransactions({
    pageSize: 50,
    selectedPaymentChannel: 'all'
  });


  // Handle scroll for header compression
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsHeaderCompact(latest > 50);
  });

  // Calculate current month info
  const currentMonth = useMemo(() => {
    const now = new Date();
    return {
      name: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      shortName: now.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      daysLeft: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()
    };
  }, []);

  // Calculate financial metrics
  const metrics = useMemo(() => {
    const income = rawTransactions
      .filter((t: Transaction) => t.amount < 0)
      .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);

    const expenses = rawTransactions
      .filter((t: Transaction) => t.amount > 0)
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const netIncome = income - expenses;
    const avgDailySpending = expenses / 30;
    const budgetUsed = (expenses / 65000) * 100; // Assuming $65k monthly budget

    return {
      income,
      expenses,
      netIncome,
      avgDailySpending,
      budgetUsed,
      pendingCount: rawTransactions.filter((t: Transaction) => t.pending).length
    };
  }, [rawTransactions]);

  // Category budgets
  const categoryBudgets: CategoryBudget[] = useMemo(() => {
    const categories = [
      { name: "Payroll", budget: 20000, icon: Users, color: "bg-violet-500" },
      { name: "Software", budget: 3500, icon: CreditCard, color: "bg-blue-500" },
      { name: "Marketing", budget: 5000, icon: TrendingUp, color: "bg-emerald-500" },
      { name: "Office", budget: 2000, icon: Briefcase, color: "bg-amber-500" }
    ];

    return categories.map(cat => {
      const spent = rawTransactions
        .filter((t: Transaction) =>
          t.category?.some(c => c.toLowerCase().includes(cat.name.toLowerCase()))
        )
        .reduce((sum: number, t: Transaction) => sum + Math.abs(t.amount), 0);

      return { ...cat, spent };
    });
  }, [rawTransactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return rawTransactions.filter((t: Transaction) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!t.name?.toLowerCase().includes(searchLower) &&
            !t.merchant_name?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    });
  }, [rawTransactions, searchTerm]);

  // Sort and group transactions by date
  const groupedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    const groups: { [key: string]: Transaction[] } = {};
    sorted.forEach((transaction) => {
      const date = new Date(transaction.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else {
        key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(transaction);
    });

    return groups;
  }, [filteredTransactions]);

  const formatCurrency = (amount: number, compact = false) => {
    const absAmount = Math.abs(amount);
    if (compact && absAmount >= 1000) {
      return `$${(absAmount / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: compact ? 0 : 2,
      maximumFractionDigits: compact ? 0 : 2
    }).format(absAmount);
  };

  const getCategoryIcon = (category: string[]) => {
    const mainCategory = category?.[0]?.toLowerCase() || "";

    if (mainCategory.includes("payroll") || mainCategory.includes("salary")) return Users;
    if (mainCategory.includes("software") || mainCategory.includes("saas")) return CreditCard;
    if (mainCategory.includes("marketing") || mainCategory.includes("advertising")) return TrendingUp;
    if (mainCategory.includes("travel")) return ShoppingBag;
    if (mainCategory.includes("legal") || mainCategory.includes("consulting")) return FileText;
    if (mainCategory.includes("office") || mainCategory.includes("rent")) return Briefcase;
    return DollarSign;
  };

  const getCategoryColor = (category: string[]) => {
    const mainCategory = category?.[0]?.toLowerCase() || "";

    if (mainCategory.includes("transfer") && mainCategory.includes("deposit")) return "text-emerald-600 bg-emerald-50";
    if (mainCategory.includes("payroll")) return "text-violet-600 bg-violet-50";
    if (mainCategory.includes("software")) return "text-blue-600 bg-blue-50";
    if (mainCategory.includes("marketing")) return "text-green-600 bg-green-50";
    if (mainCategory.includes("travel")) return "text-orange-600 bg-orange-50";
    if (mainCategory.includes("legal")) return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-black' : 'bg-white'
    }`}>
      {/* Header */}
      <header className="p-4 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2 border rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                  : 'bg-gray-100 border-gray-300 hover:border-blue-500'
              }`}
            >
              <ChevronLeft className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div>
              <h1 className={`text-xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Business Transactions</h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>Manage your business finances</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 border rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                  : 'bg-gray-100 border-gray-300 hover:border-blue-500'
              }`}
            >
              <Search className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`p-2 border rounded-lg transition-colors ${
                  isDarkMode
                    ? 'bg-gray-900/50 border-gray-800 hover:border-blue-500'
                    : 'bg-gray-100 border-gray-300 hover:border-blue-500'
                }`}>
                  <MoreVertical className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`w-48 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
                <DropdownMenuItem className={isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem className={isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Date Range
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} />
                <DropdownMenuItem className={isDarkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3"
            >
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-9 py-2 border rounded-lg focus:outline-none focus:border-blue-500 transition-colors ${
                    isDarkMode
                      ? 'bg-gray-900/50 border-gray-800 text-white placeholder-gray-400'
                      : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'
                  }`}
                />
                {searchTerm && (
                  <button
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
                    onClick={() => setSearchTerm("")}
                  >
                    <X className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <div className="pb-20">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className={`border-b ${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'}`}>
            <TabsList className={`grid w-full grid-cols-4 h-12 rounded-none bg-transparent`}>
              <TabsTrigger
                value="overview"
                className={`data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent ${
                  isDarkMode
                    ? 'text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent'
                    : 'text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent'
                }`}>
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className={`data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent ${
                  isDarkMode
                    ? 'text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent'
                    : 'text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent'
                }`}>
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="budget"
                className={`data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent ${
                  isDarkMode
                    ? 'text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent'
                    : 'text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent'
                }`}>
                Budget
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className={`data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none bg-transparent ${
                  isDarkMode
                    ? 'text-gray-400 data-[state=active]:text-white data-[state=active]:bg-transparent'
                    : 'text-gray-600 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent'
                }`}>
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0 p-4 space-y-4">
            {/* Balance Card */}
            <Card className={`${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white border-0'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-blue-100'}`}>Net Income</p>
                    <p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                      {formatCurrency(metrics.netIncome)}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/20'}`}>
                    <Wallet className={`h-5 w-5 ${isDarkMode ? 'text-blue-500' : 'text-white'}`} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className={`border-0 ${isDarkMode ? 'bg-gray-800/50 text-gray-400' : 'bg-white/20 text-white'}`}>
                    {metrics.netIncome > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {metrics.netIncome > 0 ? "+12%" : "-5%"} this month
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className={`${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                    <Badge variant="secondary" className={`text-xs border-0 ${isDarkMode ? 'bg-gray-800/50 text-green-500' : 'bg-emerald-50 text-emerald-700'}`}>
                      +8%
                    </Badge>
                  </div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(metrics.income, true)}</p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Income</p>
                </CardContent>
              </Card>

              <Card className={`${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <ArrowUpRight className={`h-4 w-4 ${isDarkMode ? 'text-red-500' : 'text-red-600'}`} />
                    <Badge variant="secondary" className={`text-xs border-0 ${isDarkMode ? 'bg-gray-800/50 text-red-500' : 'bg-red-50 text-red-700'}`}>
                      -3%
                    </Badge>
                  </div>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(metrics.expenses, true)}</p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Expenses</p>
                </CardContent>
              </Card>
            </div>

            {/* Budget Overview */}
            <Card className={`${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Monthly Budget</CardTitle>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {Math.round(metrics.budgetUsed)}% used
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={metrics.budgetUsed} className="h-2 mb-3" />
                <div className="flex justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatCurrency(metrics.expenses, true)} spent
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatCurrency(65000 - metrics.expenses, true)} left
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Category Spending */}
            <Card className={`${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Category Spending</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryBudgets.map((category) => {
                  const Icon = category.icon;
                  const percentage = (category.spent / category.budget) * 100;

                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                            <Icon className={`h-3.5 w-3.5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                          </div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{category.name}</span>
                        </div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatCurrency(category.spent, true)} / {formatCurrency(category.budget, true)}
                        </span>
                      </div>
                      <Progress
                        value={Math.min(percentage, 100)}
                        className={cn(
                          "h-1.5",
                          percentage > 90 && "animate-pulse"
                        )}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Recent Transactions Preview */}
            <Card className={`${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Transactions</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTab("transactions")}
                    className={isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                  >
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(groupedTransactions).slice(0, 1).map(([date, transactions]) => (
                    transactions.slice(0, 3).map((transaction, index) => {
                      const Icon = getCategoryIcon(transaction.category);
                      const isIncome = transaction.amount < 0;

                      return (
                        <div key={transaction.id || index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              isIncome
                                ? isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                                : isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                isIncome
                                  ? isDarkMode ? 'text-green-500' : 'text-green-600'
                                  : isDarkMode ? 'text-red-500' : 'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {transaction.merchant_name || transaction.name}
                              </p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {transaction.category?.[0]}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-semibold ${
                              isIncome
                                ? isDarkMode ? 'text-green-500' : 'text-green-600'
                                : isDarkMode ? 'text-red-500' : 'text-red-600'
                            }`}>
                              {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            <ScrollArea className="h-[calc(100vh-8.5rem)]">
              <div className="p-4 space-y-4">
                {Object.entries(groupedTransactions).map(([date, transactions]) => (
                  <div key={date}>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{date}</h3>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {transactions.length} transactions
                      </span>
                    </div>
                    <Card className={`${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                      <CardContent className="p-0">
                        {transactions.map((transaction, index) => {
                          const Icon = getCategoryIcon(transaction.category);
                          const isIncome = transaction.amount < 0;

                          return (
                            <React.Fragment key={transaction.id || `${date}-${index}`}>
                              <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className={`p-4 flex items-center justify-between transition-colors cursor-pointer ${
                                  isDarkMode ? 'hover:bg-gray-800/30' : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedTransaction(transaction)}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`p-2.5 rounded-lg ${
                                    isIncome
                                      ? isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                                      : isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
                                  }`}>
                                    <Icon className={`h-4 w-4 ${
                                      isIncome
                                        ? isDarkMode ? 'text-green-500' : 'text-green-600'
                                        : isDarkMode ? 'text-red-500' : 'text-red-600'
                                    }`} />
                                  </div>
                                  <div className="flex-1">
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                      {transaction.merchant_name || transaction.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {transaction.category?.slice(0, 2).join(" • ")}
                                      </span>
                                      {transaction.pending && (
                                        <Badge variant="secondary" className={`text-xs px-1.5 py-0 ${isDarkMode ? 'bg-gray-800/50 text-gray-400' : ''}`}>
                                          Pending
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <p className={`text-sm font-semibold ${
                                  isIncome
                                    ? isDarkMode ? 'text-green-500' : 'text-green-600'
                                    : isDarkMode ? 'text-red-500' : 'text-red-600'
                                }`}>
                                  {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
                                </p>
                              </motion.div>
                              {index < transactions.length - 1 && <Separator />}
                            </React.Fragment>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="budget" className="mt-0 p-4">
            <div className="space-y-4">
              <Card className={`${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Budget Management</CardTitle>
                  <CardDescription className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Track and manage your monthly spending limits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryBudgets.map((category) => {
                      const Icon = category.icon;
                      const percentage = (category.spent / category.budget) * 100;
                      const remaining = category.budget - category.spent;

                      return (
                        <div key={category.name} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50'}`}>
                                <Icon className={`h-5 w-5 ${isDarkMode ? 'text-blue-500' : 'text-blue-600'}`} />
                              </div>
                              <div>
                                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{category.name}</p>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {remaining > 0
                                    ? `${formatCurrency(remaining)} remaining`
                                    : `${formatCurrency(Math.abs(remaining))} over budget`
                                  }
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(category.spent)}</p>
                              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                of {formatCurrency(category.budget)}
                              </p>
                            </div>
                          </div>
                          <Progress
                            value={Math.min(percentage, 100)}
                            className={cn(
                              "h-2",
                              percentage > 90 && "animate-pulse",
                              percentage > 100 && "[&>div]:bg-red-500"
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <Button className="w-full mt-6" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category Budget
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 p-4">
            <div className="space-y-4">
              <Card className={`${isDarkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Financial Analytics</CardTitle>
                  <CardDescription className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Insights and trends for your business
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Average Daily Spending</span>
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(metrics.avgDailySpending)}</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Days Until Month End</span>
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentMonth.daysLeft}</span>
                    </div>
                    <Progress value={(30 - currentMonth.daysLeft) / 30 * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Projected Month-End Balance</span>
                      <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(metrics.netIncome - (metrics.avgDailySpending * currentMonth.daysLeft))}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Detailed Reports
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <div className={`fixed bottom-0 left-0 right-0 border-t z-40 ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-5 h-16">
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none gap-1"
            onClick={() => setSelectedTab("overview")}
          >
            <Home className={cn("h-5 w-5", selectedTab === "overview" ? "text-blue-600" : isDarkMode ? "text-gray-400" : "text-gray-600")} />
            <span className={cn("text-xs", selectedTab === "overview" ? "text-blue-600" : isDarkMode ? "text-gray-400" : "text-gray-600")}>Home</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none gap-1"
            onClick={() => setSelectedTab("transactions")}
          >
            <Receipt className={cn("h-5 w-5", selectedTab === "transactions" ? "text-blue-600" : isDarkMode ? "text-gray-400" : "text-gray-600")} />
            <span className={cn("text-xs", selectedTab === "transactions" ? "text-blue-600" : isDarkMode ? "text-gray-400" : "text-gray-600")}>Transactions</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none gap-1 relative"
          >
            <div className="absolute -top-6 bg-blue-600 rounded-full p-3 shadow-lg">
              <Plus className="h-6 w-6 text-white" />
            </div>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none gap-1"
            onClick={() => setSelectedTab("budget")}
          >
            <PieChart className={cn("h-5 w-5", selectedTab === "budget" ? "text-blue-600" : isDarkMode ? "text-gray-400" : "text-gray-600")} />
            <span className={cn("text-xs", selectedTab === "budget" ? "text-blue-600" : isDarkMode ? "text-gray-400" : "text-gray-600")}>Budget</span>
          </Button>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center h-full rounded-none gap-1"
            onClick={() => setSelectedTab("analytics")}
          >
            <Analytics className={cn("h-5 w-5", selectedTab === "analytics" ? "text-blue-600" : isDarkMode ? "text-gray-400" : "text-gray-600")} />
            <span className={cn("text-xs", selectedTab === "analytics" ? "text-blue-600" : isDarkMode ? "text-gray-400" : "text-gray-600")}>Analytics</span>
          </Button>
        </div>
      </div>

      {/* Transaction Detail Sheet */}
      <Sheet open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <SheetContent side="bottom" className="h-[50vh]">
          {selectedTransaction && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedTransaction.merchant_name || selectedTransaction.name}</SheetTitle>
                <SheetDescription>
                  Transaction Details
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className={cn(
                    "text-xl font-bold",
                    selectedTransaction.amount < 0 ? "text-emerald-600" : "text-gray-900"
                  )}>
                    {selectedTransaction.amount < 0 ? "+" : "-"}
                    {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="text-sm font-medium">
                    {new Date(selectedTransaction.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <span className="text-sm font-medium">
                    {selectedTransaction.category?.join(" • ")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                  <span className="text-sm font-medium capitalize">
                    {selectedTransaction.payment_channel || "Unknown"}
                  </span>
                </div>
                {selectedTransaction.pending && (
                  <Badge variant="secondary" className="w-full justify-center">
                    Transaction Pending
                  </Badge>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileBusinessScreen;
