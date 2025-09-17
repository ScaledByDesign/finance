import { Title } from "@tremor/react";
import { FC, Key } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GithubGraphProps {
    data: any;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const GithubGraph: FC<GithubGraphProps> = ({ data }) => {
    const getActivityLevel = (value: number) => {
        if (value === 0) return 'bg-primary/10';
        // Negative values (red)
        if (value < 0) {
            if (value > -10) return 'bg-indigo-200';
            if (value > -50) return 'bg-indigo-300';
            if (value > -1000) return 'bg-indigo-400';
            return 'bg-indigo-500';
        }
        // Positive values (green)
        if (value < 50) return 'bg-green-200';
        if (value < 200) return 'bg-green-300';
        if (value < 1000) return 'bg-green-400';
        return 'bg-green-500';
    };

    if (!data) {
        return (
            <Card className="mt-4 p-8">
                <p>Loading...</p>
            </Card>
        );
    }
    
    return (
        <Card className="p-4 sm:p-6">
            <Title>Spend Heatmap</Title>
            <p>Inspired by Github contribution graph</p>
            <ScrollArea className="w-full" scrollHideDelay={1000}>
                <div className="">
                    <div className="flex justify-between mt-2">
                        {months.map((month, index) => (
                            <span key={index} className="text-xs">{month}</span>
                        ))}
                    </div>
                    <div className="flex gap-1">
                        {data.map((week: any[], weekIndex: Key | null | undefined) => (
                            <div key={weekIndex} className="flex flex-col gap-1 w-full">
                                {week.map((value: number, dayIndex: Key | null | undefined) => (
                                    <div
                                        key={dayIndex as string | number}
                                        className={`w-3 h-3 rounded-sm ${getActivityLevel(value)}`}
                                        title={`Week ${Number(weekIndex) + 1}, Day ${Number(dayIndex) + 1}: ${value.toFixed(2)}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>
            <div className="mt-4 flex flex-wrap gap-4 justify-between text-xs">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary/10 rounded-sm mr-2"></div>
                    <span>No Activity</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-200 rounded-sm mr-2"></div>
                    <span>Low Spend</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-sm mr-2"></div>
                    <span>High Spend</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-200 rounded-sm mr-2"></div>
                    <span>Low Income</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded-sm mr-2"></div>
                    <span>High Income</span>
                </div>
            </div>
        </Card>
    );
};

export default GithubGraph;
