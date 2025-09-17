import { DM_Sans, Inter } from "next/font/google";
import localFont from "next/font/local";

export const inter = DM_Sans({
    weight: ["400", "500", "700"],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter"
});

export const agbalumo = localFont({ src: "../../public/font/Agbalumo.ttf", variable: "--font-tile" });
