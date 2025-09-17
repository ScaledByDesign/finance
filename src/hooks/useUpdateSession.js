"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function UseUpdateSession({ data }) {
    const { update, status } = useSession();
    const [called, setCalled] = useState(false);
    const router = useRouter();

    const fetchData = useCallback(async () => {
        setCalled(true);
        await update(data);
        router.push("/dashboard");
    }, [data, update, router]);

    useEffect(() => {
        if (status === "authenticated" && !called) fetchData();
    }, [status, called, fetchData]);

    return <div></div>;
}
