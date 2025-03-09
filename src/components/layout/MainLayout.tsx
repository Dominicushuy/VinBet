// components/layout/MainLayout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  DollarSign,
  User,
  Award,
  Gamepad as GameController,
  Menu as MenuIcon,
} from "lucide-react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const closeSheet = () => setIsOpen(false);

  const navItems = [
    { href: "/", label: "Trang chủ", icon: <Home size={20} /> },
    { href: "/games", label: "Trò chơi", icon: <GameController size={20} /> },
    { href: "/finance", label: "Tài chính", icon: <DollarSign size={20} /> },
    { href: "/profile", label: "Tài khoản", icon: <User size={20} /> },
    { href: "/referrals", label: "Giới thiệu", icon: <Award size={20} /> },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <MenuIcon size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-6 py-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/logo.png" alt="VinBet" />
                      <AvatarFallback>VB</AvatarFallback>
                    </Avatar>
                    <span className="text-lg font-bold">VinBet</span>
                  </div>
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        isActive={pathname === item.href}
                        onClick={closeSheet}
                      />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/logo.png" alt="VinBet" />
                <AvatarFallback>VB</AvatarFallback>
              </Avatar>
              <span className="hidden font-bold sm:inline-block">VinBet</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <Button variant="outline" size="sm">
              <DollarSign size={16} className="mr-2" />
              <span>Nạp tiền</span>
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container flex-1 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
          <aside className="hidden h-fit md:block">
            <nav className="flex flex-col gap-1 py-2">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                />
              ))}
            </nav>
          </aside>
          <main>{children}</main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 VinBet. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Điều khoản
            </Button>
            <Button variant="ghost" size="sm">
              Hỗ trợ
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
