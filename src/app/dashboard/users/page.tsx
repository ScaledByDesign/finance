"use client";

import { useEffect, useState, useCallback } from "react";
import { InformationCircleIcon } from "@heroicons/react/solid";
import {
    Card,
    Title,
    Text,
    Flex,
    Icon,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow
} from "@tremor/react";
import { handleError } from "@/utils/util";
import Pagination from "@/components/Basic/Pagination";
import SearchInput from "@/components/Basic/SearchInput";
import apiCall from "@/utils/apiCall";
import Checkbox from "@/components/Basic/CheckBox";
import { User } from "@/lib/types";

export default function Users() {
    const [searchKey, setSearchKey] = useState("");
    const [selectedPayStatus, setSelectedPayStatus] = useState("all");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);

    const fetchData = useCallback(
        async (newCurPage: number) => {
            try {
                setCurrentPage(newCurPage);
                const res = await apiCall.post("/api/v1/user/users", {
                    filter: {
                        searchKey,
                        selectedPayStatus,
                        pageSize,
                        currentPage: newCurPage
                    }
                });
                setUsers(res.data.data);
                setTotal(res.data.size);
            } catch (err) {
                handleError(err);
            }
        },
        [searchKey, selectedPayStatus, pageSize]
    );

    useEffect(() => {
        fetchData(1);
    }, [selectedPayStatus, pageSize, fetchData]);

    const setPayState = async (email: string, isPro: boolean) => {
        const res = await apiCall.post("/api/v1/user/users/pay", {
            email,
            isPro
        });
        setUsers(users.map(user => (user.email === email ? { ...user, isPro: res.data } : user)));
    };

    console.log(users);

    return (
        <main className="min-h-screen p-4 m-auto max-w-7xl bg-muted/50">
            {/* <Text className="mt-6">
                {"A bird's eye view of your financial positions."}
            </Text> */}
            <Card className="mt-6">
                <div>
                    <Flex className="space-x-0.5" justifyContent="start" alignItems="center">
                        <Title> Registered Users ({total}) </Title>
                        <Icon
                            icon={InformationCircleIcon}
                            variant="simple"
                            tooltip="Show All Registered Users"
                            color="slate"
                        />
                    </Flex>
                </div>
                <div className="items-center mt-2 md:flex">
                    <div className="flex w-full mt-2 md:mt-0">
                        <SearchInput
                            className="mr-2"
                            placeholder="Input User's Email"
                            value={searchKey}
                            onChange={(e: any) => setSearchKey(e.target.value)}
                            onSearch={() => fetchData(1)}
                        />
                        <Select className="flex-1" defaultValue="all" onValueChange={setSelectedPayStatus}>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="payed">Payed Users</SelectItem>
                            <SelectItem value="unpaid">Unpaid Users</SelectItem>
                        </Select>
                    </div>
                    <div className="w-full" />
                    <Pagination
                        total={total}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        currentPage={currentPage}
                        setCurrentPage={fetchData}
                    />
                </div>
                <div>
                    <Table className="mt-6 m-auto w-[calc(100vw_-_theme(spacing.2))] sm:w-full overflow-auto">
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Email</TableHeaderCell>
                                <TableHeaderCell>UUID</TableHeaderCell>
                                <TableHeaderCell className="text-right">Name</TableHeaderCell>
                                <TableHeaderCell className="text-right">Paid</TableHeaderCell>
                            </TableRow>
                        </TableHead>

                        <TableBody className="">
                            {users.map((item, index) => (
                                <TableRow key={"transaction_" + index}>
                                    <TableCell>{item.email}</TableCell>
                                    <TableCell>{item.id}</TableCell>
                                    <TableCell className="max-w-sm overflow-hidden text-right text-ellipsis">
                                        {item.name}
                                    </TableCell>
                                    <TableCell className="flex flex-wrap justify-end text-right">
                                        <Checkbox
                                            checked={item.isPro}
                                            handleChange={() => setPayState(item.email, !item.isPro)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </main>
    );
}
