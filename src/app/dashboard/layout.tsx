"use client";
import { Toaster } from "sonner";
// import { DemoModeIndicator } from "@/components/DemoModeIndicator";
// import { DemoModeDemo } from "@/components/DemoModeDemo";

import { ReactNode } from "react";

interface RootLayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <>
            {/* Demo mode controls hidden for now */}
            {/* <DemoModeIndicator /> */}
            {/* <DemoModeDemo /> */}
            <div className={`grid min-h-screen bg-muted max-w-full overflow-x-hidden`}>
                <div className="relative">
                    {children}
                </div>
            </div>
            <Toaster />
        </>
    );
}
