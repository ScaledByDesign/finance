"use client";

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { dollarFormatter, numberFormatter, sumArray } from "../../../../utils/util";
import { Info } from "lucide-react";
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart";

interface SumSpendProps {
  selectedKpi: string;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  filterCreditCards: boolean | string;
}

const SumSpend: React.FC<SumSpendProps> = ({
  selectedKpi,
  selectedIndex,
  setSelectedIndex,
  filterCreditCards,
}) => {
  const { cumulativeSpend, cumulativeSpendNoCards } = useSelector(
    (state: any) => state.user
  );

  const chartConfig = useMemo(
    () => ({
      spend: {
        label: selectedKpi === "spend" ? "Spend" : "Count",
        color: "#4c8f40",
      },
      moneyIn: {
        label: selectedKpi === "spend" ? "MoneyIn" : "MoneyInCount",
        color: "#82ca9d",
      },
    }),
    [selectedKpi]
  );

  const finalSum = useMemo(
    () =>
      cumulativeSpend?.length > 0
        ? cumulativeSpend[cumulativeSpend.length - 1].spend
        : 0,
    [cumulativeSpend]
  );
  const finalSumNoCards = useMemo(
    () =>
      cumulativeSpendNoCards?.length > 0
        ? cumulativeSpendNoCards[cumulativeSpendNoCards.length - 1].spend
        : 0,
    [cumulativeSpendNoCards]
  );
  const finalTransactions = useMemo(
    () =>
      cumulativeSpend?.length > 0
        ? cumulativeSpend[cumulativeSpend.length - 1].count
        : 0,
    [cumulativeSpend]
  );
  const finalTransactionsNoCards = useMemo(
    () =>
      cumulativeSpendNoCards?.length > 0
        ? cumulativeSpendNoCards[cumulativeSpendNoCards.length - 1].count
        : 0,
    [cumulativeSpendNoCards]
  );

  return (
    <Card className="p-4">
      <div className="md:flex justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Sum Spend over time</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipContent>
                  Shows daily increase of spend from debit accounts or credit cards
                </TooltipContent>
                <Info size={18} />
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground">
            Total of spend summed cumulatively over time
          </p>
          <h3 className="text-xl font-bold mt-2 p-2 border rounded-md">
            Total {" "}
            {selectedKpi === "spend"
              ? dollarFormatter(finalSum)
              : numberFormatter(finalTransactions)}
          </h3>
        </div>
        <Tabs
          defaultValue={selectedIndex === 0 ? "dollars" : "transactions"}
          onValueChange={(value) =>
            setSelectedIndex(value === "dollars" ? 0 : 1)
          }
        >
          <TabsList>
            <TabsTrigger value="dollars">Dollars</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-8 overflow-auto">
        <ChartContainer className="mt-5 h-72 w-full" config={chartConfig}>
            <AreaChart
                accessibilityLayer
                data={filterCreditCards === true ? cumulativeSpendNoCards : cumulativeSpend}
                margin={{
                    left: 22,
                    right: 12,
                }}
                className='w-full'
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => selectedKpi === "spend" ? dollarFormatter(value) : numberFormatter(value)}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                    dataKey={selectedKpi === "spend" ? "spend" : "count"}
                    type="natural"
                    fill="var(--color-spend)"
                    fillOpacity={0.4}
                    stroke="var(--color-spend)"
                    stackId="a"
                />
                <Area
                    dataKey={selectedKpi === "spend" ? "moneyIn" : "moneyInCount"}
                    type="natural"
                    fill="var(--color-moneyIn)"
                    fillOpacity={0.4}
                    stroke="var(--color-moneyIn)"
                    stackId="a"
                />
            </AreaChart>
        </ChartContainer>
    </div>
    </Card>
  );
};

export default SumSpend;
