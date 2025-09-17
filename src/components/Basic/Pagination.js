import { Metric, Select, SelectItem } from "@tremor/react";
import { useState } from "react";

const Pagination = ({
    total = 100,
    pageSize = 10,
    setPageSize = (size) => console.log("setPageSize"),
    currentPage = 1,
    setCurrentPage = (page) => console.log("setCurrentPage")
}) => {
    const totalPages = Math.ceil(total / pageSize);
    let startPage = Math.max(currentPage - 2, 1);
    let endPage = Math.min(startPage + 4, totalPages);
    if (endPage - startPage < 4) {
        startPage = Math.max(endPage - 4, 1);
    }
    const pages =
        endPage + 1 - startPage > 0
            ? [...Array(endPage + 1 - startPage).keys()].map(i => startPage + i)
            : [];

    return (
        <div className="flex items-center justify-between mt-2 ml-0 md:ml-2 md:mt-0">
            <div>
                <Select
                    className="min-w-[5rem] text-center"
                    value={pageSize}
                    onValueChange={setPageSize}
                    enableClear={false}
                >
                    <SelectItem value={10}>10</SelectItem>
                    <SelectItem value={20}>20</SelectItem>
                    <SelectItem value={50}>50</SelectItem>
                    <SelectItem value={100}>100</SelectItem>
                </Select>
            </div>
            <div className="flex ml-2">
                <button
                    className="px-3 py-1 font-bold text-white bg-slate-600 rounded-l cursor-pointer whitespace-nowrap hover:bg-slate-600 focus:outline-none"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    &larr;
                </button>
                {startPage > 2 && (
                    <>
                        <button
                            className="px-3 py-1 mx-1 font-bold text-white border bg-slate-600 rounded-sm cursor-pointer hover:bg-slate-600 hover:text-white focus:outline-none"
                            onClick={() => setCurrentPage(1)}
                        >
                            1
                        </button>
                        <div className="px-3 py-1">...</div>
                    </>
                )}
                {pages.map(number => (
                    <button
                        key={number}
                        className={`mx-1 px-3 py-1 font-bold ${
                            number === currentPage
                                ? "bg-slate-600 text-white"
                                : "text-gray"
                        }  cursor-pointer rounded-sm border border-black hover:bg-slate-600 hover:text-white focus:outline-none`}
                        onClick={() => setCurrentPage(number)}
                    >
                        {number}
                    </button>
                ))}
                {endPage <= totalPages - 2 && (
                    <>
                        <div className="px-3 py-1">...</div>
                        <button
                            className="px-3 py-1 mx-1 font-bold text-white border bg-slate-600 rounded-sm cursor-pointer hover:bg-slate-600 hover:text-white focus:outline-none"
                            onClick={() => setCurrentPage(totalPages)}
                        >
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    className="px-3 py-1 font-bold text-white bg-slate-600 rounded-r cursor-pointer whitespace-nowrap hover:bg-slate-600 focus:outline-none"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    &rarr;
                </button>
            </div>
        </div>
    );
};

export default Pagination;
