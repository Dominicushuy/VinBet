// src/app/(main)/finance/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Banknote, CreditCard, BarChart2, History } from "lucide-react";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/finance",
      label: "Tổng quan",
      icon: <BarChart2 size={16} />,
    },
    {
      href: "/finance/deposit",
      label: "Nạp tiền",
      icon: <Banknote size={16} />,
    },
    {
      href: "/finance/withdrawal",
      label: "Rút tiền",
      icon: <CreditCard size={16} />,
    },
    {
      href: "/finance/transactions",
      label: "Lịch sử giao dịch",
      icon: <History size={16} />,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <nav className="flex p-2 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </Card>

      {children}
    </div>
  );
}
