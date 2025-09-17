"use client";

import store from "../store";
import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/providers";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { OnboardingProvider } from "@/components/onboarding-provider";

import { ReactNode } from "react";

interface TemplateProps {
    children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
    return (
        <SessionProvider>
            <Provider store={store}>
                <DemoModeProvider>
                    <body className="font-sans scroll-smooth" suppressHydrationWarning>
                        <Providers
                            attribute="class"
                            defaultTheme="light"
                            enableSystem
                        >
                            <OnboardingProvider>
                                {children}
                            </OnboardingProvider>
                        </Providers>
                        <Toaster />
                    </body>
                </DemoModeProvider>
            </Provider>
        </SessionProvider>
    );
}
