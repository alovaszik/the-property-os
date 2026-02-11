"use client";

import React from "react"

import { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Home,
  Building2,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  Bell,
  Settings,
  Menu,
  X,
  Key,
  Wrench,
  Bug,
  BarChart3,
  LogOut,
  Wallet,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const landlordNav: NavItem[] = [
  { label: "Dashboard", href: "/landlord", icon: Home },
  { label: "Properties", href: "/landlord/properties", icon: Building2 },
  { label: "Tenants", href: "/landlord/tenants", icon: Users },
  { label: "Leases", href: "/landlord/leases", icon: FileText },
  { label: "Payments", href: "/landlord/payments", icon: CreditCard },
  { label: "Wallet", href: "/landlord/wallet", icon: Wallet },
  { label: "Activity", href: "/landlord/activity", icon: MessageSquare, badge: 3 },
  { label: "Tickets", href: "/landlord/tickets", icon: Bug },
  { label: "Settings", href: "/landlord/settings", icon: Settings },
];

const tenantNav: NavItem[] = [
  { label: "Dashboard", href: "/tenant", icon: Home },
  { label: "My Lease", href: "/tenant/lease", icon: Key },
  { label: "Payments", href: "/tenant/payments", icon: CreditCard },
  { label: "Wallet", href: "/tenant/wallet", icon: Wallet },
  { label: "Documents", href: "/tenant/documents", icon: FileText },
  { label: "Statements", href: "/tenant/statements", icon: BarChart3 },
  { label: "Activity", href: "/tenant/activity", icon: MessageSquare, badge: 2 },
  { label: "Maintenance", href: "/tenant/maintenance", icon: Wrench },
  { label: "Settings", href: "/tenant/settings", icon: Settings },
];

export function DashboardShell({
  children,
  variant = "landlord",
}: {
  children: React.ReactNode;
  variant?: "landlord" | "tenant";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = variant === "landlord" ? landlordNav : tenantNav;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Get the bottom 4 nav items for mobile bottom bar
  const bottomBarItems = navItems.slice(0, 4);
  const moreItems = navItems.slice(4);

  return (
    <div className="min-h-screen bg-background">
      {/* Top header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-card/80 backdrop-blur-xl border-b border-border lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/logo.jpeg"
              alt="RentDuo logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="text-base font-semibold text-foreground tracking-tight hidden sm:inline">
              RentDuo
            </span>
          </Link>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full capitalize hidden sm:inline">
            {variant}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-secondary transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
          </button>
          <ThemeToggle />
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
            {variant === "landlord" ? "JD" : "AT"}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-[calc(100vh-57px)] border-r border-border bg-card p-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-border space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[44px]"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[44px]"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile slide-out menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border p-4 pt-20 overflow-y-auto">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors min-h-[48px]",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 pt-4 border-t border-border space-y-1">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[48px]"
                >
                  <Home className="w-5 h-5" />
                  Back to Home
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors min-h-[48px]"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-x-hidden pb-20 lg:pb-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden items-center justify-around bg-card/80 backdrop-blur-xl border-t border-border px-2 pb-[env(safe-area-inset-bottom)]">
        {bottomBarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px] min-h-[48px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
