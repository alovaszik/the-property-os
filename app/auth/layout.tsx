import type React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 lg:px-12 lg:py-5">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo.jpeg"
            alt="RentDuo logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="text-lg font-semibold text-foreground tracking-tight">
            RentDuo
          </span>
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-5 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="px-5 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          2026 RentDuo. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
