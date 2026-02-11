import type React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 px-5 lg:px-12 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.jpeg"
            alt="RentDuo logo"
            width={28}
            height={28}
            className="rounded-lg"
          />
          <span className="text-sm font-semibold text-foreground tracking-tight font-display">
            RentDuo
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-8">
        {children}
      </main>

      <footer className="h-14 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">
          2026 RentDuo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
