import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, Search } from "lucide-react";

const MobileNavbar = () => {
    const pathname = usePathname();

    const navItems = [
        {
            label: "Home",
            href: "/dashboard",
            icon: Home
        },
        // {
        //     label: "Chat",
        //     href: "/dashboard/chat",
        //     icon: MessageCircle
        // },
        {
            label: "Explore",
            href: "/dashboard/transaction",
            icon: Search
        }
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 flex flex-row items-center justify-around w-full border-t sm:hidden bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl z-50"
        >
            {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <li
                        key={index}
                        className="flex-1 flex justify-center"
                    >
                        <Link
                            href={item.href}
                            className={`${
                                pathname == item.href
                                    ? "border-slate-500 text-gray-900 dark:text-gray-100 bg-background/20"
                                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-700 dark:hover:text-gray-300 hover:bg-background/10"
                            } inline-flex flex-col items-center justify-center border-t-2 py-3 px-2 text-xs font-medium transition-all duration-200 rounded-t-lg min-h-[64px] w-full active:scale-95`}
                        >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className="text-[10px] leading-tight">{item.label}</span>
                        </Link>
                    </li>
                );
            })}
        </nav>
    );
};

export default MobileNavbar;
