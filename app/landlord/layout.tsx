import React from "react"
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function LandlordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell variant="landlord">{children}</DashboardShell>;
}
