"use client";

import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  ColumnDef,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { Key, MouseEventHandler, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Transaction {
  date: string;
  name: string;
  amount: number;
  category?: string[];
  personal_finance_category?: {
    detailed?: string;
  };
  account: string;
  payment_channel: string;
}

type SortDirection = "false" | "asc" | "desc";

const ModernTable = ({ transactions }: { transactions: Transaction[] }) => {
  console.log('Total transactions:', transactions.length);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  const dateFormat = (date: string) => new Date(date).toLocaleDateString();
  const valueFormatter = (value: number) => `$${value.toFixed(2)}`;

  const getAllUniqueCategories = () => {
    const categories = new Set<string>();
    transactions.forEach((transaction) => {
      transaction.category?.forEach((cat) => categories.add(cat));
    });
    return Array.from(categories);
  };

  const getAllUniqueAccounts = () => {
    const accounts = new Set<string>();
    transactions.forEach((transaction) => {
      accounts.add(transaction.account);
    });
    return Array.from(accounts);
  };

  const columns = [
    {
      accessorKey: "date",
      header: "Date",
      cell: (info: any) => dateFormat(info.getValue()),
      sortingFn: (a: any, b: any, columnId: string) => {
        const aDate = new Date(a.getValue(columnId)).getTime();
        const bDate = new Date(b.getValue(columnId)).getTime();
        return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;
      },
    },
    {
      accessorKey: "account",
      header: "Account",
      cell: (info: any) => info.getValue(),
      filterFn: (row: { getValue: (arg0: string) => string; }, _columnId: any, filterValue: string[]) => {
        if (!filterValue?.length) return true;
        return filterValue.includes(row.getValue("account"));
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      sortingFn: (a: any, b: any, columnId: string) => {
        const aVal = a.getValue(columnId).toLowerCase();
        const bVal = b.getValue(columnId).toLowerCase();
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (info: any) => valueFormatter(info.getValue()),
      sortingFn: (a: any, b: any, columnId: string) => {
        return a.getValue(columnId) - b.getValue(columnId);
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: (info: any) => (
        <div className="flex flex-wrap gap-2">
          {info.getValue()?.map((categoryItem: string) => (
            <Badge
              key={`categoryItem_${categoryItem}`}
              variant="secondary"
              className="px-2 py-1"
              title={info.row.original.personal_finance_category?.detailed || categoryItem}
            >
              {categoryItem}
            </Badge>
          ))}
        </div>
      ),
      filterFn: (row: any, columnId: string, filterValue: string) => {
        const categories = row.getValue(columnId);
        return categories?.some((category: string) => 
          category.toLowerCase().includes(filterValue.toLowerCase())
        );
      },
    },
  ];

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleAccountSelection = (account: string) => {
    const column = table.getColumn("account");
    
    if (account === "all") {
      setSelectedAccounts([]);
      column?.setFilterValue([]);
    } else {
      setSelectedAccounts(prev => {
        const newSelection = prev.includes(account)
          ? prev.filter(a => a !== account)
          : [...prev, account];
        column?.setFilterValue(newSelection);
        return newSelection;
      });
    }
  };

  return (
    <Card className="relative w-full p-6 mt-4">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full bg-background">
          <Search className="absolute left-2 top-2.5 h-4 w-4" />
          <Input
            placeholder="Search transactions..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2 justify-end">
        {/* Filter by Account */}
        <Popover>
          <PopoverTrigger asChild>
            <Button className="w-full" variant="outline">
              {selectedAccounts.length > 0 
                ? `${selectedAccounts.length} accounts selected`
                : "All Accounts"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Search accounts..." />
              <CommandList>
                <CommandEmpty>No accounts found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleAccountSelection("all")}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAccounts.length === 0}
                        className="mr-2 h-4 w-4"
                        readOnly
                      />
                      All Accounts
                    </div>
                  </CommandItem>
                  {getAllUniqueAccounts().map((account) => (
                    <CommandItem
                      key={account}
                      onSelect={() => handleAccountSelection(account)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.includes(account)}
                          className="mr-2 h-4 w-4"
                          readOnly
                        />
                        {account}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {/* Filter by amount range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full hidden md:block">
              Amount Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full bg-background">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Filter by amount</h4>
                <p className="text-sm text-muted-foreground">
                  Set the minimum and maximum transaction amount
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="minAmount">Min</Label>
                  <Input
                    id="minAmount"
                    type="number"
                    className="col-span-2"
                    value={(table.getColumn("amount")?.getFilterValue() as [number, number])?.[0] ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const [_, max] = (table.getColumn("amount")?.getFilterValue() as [number, number]) ?? [
                        undefined,
                        undefined,
                      ];
                      table.getColumn("amount")?.setFilterValue(
                        value ? [Number(value), max] : undefined
                      );
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="maxAmount">Max</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    className="col-span-2"
                    value={(table.getColumn("amount")?.getFilterValue() as [number, number])?.[1] ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const [min, _] = (table.getColumn("amount")?.getFilterValue() as [number, number]) ?? [
                        undefined,
                        undefined,
                      ];
                      table.getColumn("amount")?.setFilterValue(
                        value ? [min, Number(value)] : undefined
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {/* Filter by category */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full text-primary bg-background">
              Category
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Filter by category</h4>
              <p className="text-sm text-muted-foreground">
                Select the category to filter transactions
              </p>
            </div>
            <div className="mt-2 grid gap-2">
              <Command>
                <CommandInput placeholder="Search categories..." />
                <CommandList>
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        table.getColumn("category")?.setFilterValue("");
                      }}
                    >
                      All Categories
                    </CommandItem>
                    {getAllUniqueCategories().map((category) => (
                      <CommandItem
                        key={category}
                        onSelect={() => {
                          table.getColumn("category")?.setFilterValue(category);
                        }}
                      >
                        {category}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="outline"
          onClick={() => {
            console.log("Export button clicked");
            toast.info("Exporting to CSV...");
            const rows = table.getRowModel().rows.map((row) => {
              const cells = row.getVisibleCells().map((cell) => cell.getContext().getValue());
              return cells.join(",");
            });
            const csvContent = [
              table.getHeaderGroups()
                .map((headerGroup) =>
                  headerGroup.headers.map((header) => header.column.columnDef.header).join(",")
                )
                .join("\n"),
              ...rows,
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "transactions.csv");
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Exported to CSV successfully!");
          }}
        >
          Export to CSV
        </Button>
        </div>
      </div>

      <div className="overflow-x-hidden">
        <Table>
          <TableHeader className="text-center">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className={`${header.column.id !== 'category' ? 'text-center' : ''}`}
                  >
                    {header.isPlaceholder ? null : (
                      <Button
                        variant="ghost"
                        className={`h-8 flex items-center ${
                          header.column.id !== 'category' 
                            ? 'justify-center w-full' 
                            : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          "false": <ArrowUpDownIcon className="ml-1 h-4 w-4" />,
                          "asc": <ArrowUpIcon className="ml-1 h-4 w-4" />,
                          "desc": <ArrowDownIcon className="ml-1 h-4 w-4" />,
                        }[String(header.column.getIsSorted() || "false") as SortDirection]}
                      </Button>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row: { id: Key | null | undefined; getVisibleCells: () => any[]; }) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                {row.getVisibleCells().map((cell: { id: Key | null | undefined; column: { columnDef: { cell: any; }; }; getContext: () => any; }) => (
                  <TableCell 
                    key={cell.id} 
                    className={`py-4 ${cell.column.columnDef.cell !== 'category' ? 'text-center' : ''}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* Add pagination controls */}
        <div className="flex items-center justify-between px-2 py-4 w-full">
          <div className="flex items-center gap-2">
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => setPageSize(Number(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                {[5, 7,10, 20, 30, 40, 50, 100, 1000].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="w-full text-sm text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{" "} {table.getPageCount()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ModernTable;
