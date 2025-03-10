// app/layout.tsx
import { fontSans, fontHeading } from "@/lib/fonts";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ComponentsProvider } from "@/providers/ComponentsProvider";
import NextTopLoader from "nextjs-toploader";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "VinBet - Nền tảng cá cược trực tuyến",
  description:
    "Tham gia cá cược, đặt cược theo con số và nhận thưởng dựa trên kết quả trò chơi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${fontSans.variable} ${fontHeading.variable}`}>
      <body className={inter.variable}>
        <NextTopLoader />
        <ComponentsProvider>{children}</ComponentsProvider>
      </body>
    </html>
  );
}
