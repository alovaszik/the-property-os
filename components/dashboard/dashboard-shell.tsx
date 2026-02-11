"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  const bottomBarItems = navItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 lg:px-6 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-foreground" />
            ) : (
              <Menu className="w-4 h-4 text-foreground" />
            )}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.jpeg"
              alt="RentDuo logo"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-sm font-semibold text-foreground tracking-tight hidden sm:inline font-serif">
              RentDuo
            </span>
          </Link>
          <span className="text-2xs font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-md capitalize hidden sm:inline">
            {variant}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-card" />
          </button>
          <ThemeToggle />
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary ml-1">
            {variant === "landlord" ? "JD" : "AT"}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 min-h-[calc(100vh-3.5rem)] border-r border-border bg-card px-3 py-4">
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" &&
                  item.href !== "/landlord" &&
                  item.href !== "/tenant" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-2xs bg-primary text-primary-foreground w-4 h-4 rounded flex items-center justify-center font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-3 border-t border-border space-y-0.5">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile slide-out */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setMobileMenuOpen(false)}
              role="button"
              tabIndex={0}
              aria-label="Close menu"
            />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-3 pt-16 overflow-y-auto animate-fade-in">
              <nav className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      {item.badge && (
                        <span className="ml-auto text-2xs bg-primary text-primary-foreground w-4 h-4 rounded flex items-center justify-center font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-6 pt-3 border-t border-border space-y-0.5">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-x-hidden pb-16 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden items-center justify-around bg-card border-t border-border px-1 pb-[env(safe-area-inset-bottom)]">
        {bottomBarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] min-h-[44px] transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="relative">
                <item.icon className="w-4 h-4" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 text-2xs font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-2xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
