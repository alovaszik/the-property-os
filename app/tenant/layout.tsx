import React from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell variant="tenant">{children}</DashboardShell>;
}
