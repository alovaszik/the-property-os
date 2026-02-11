"use client";

import { cn } from "@/lib/utils";
import { FileText, Plus, Search, CalendarDays, ChevronRight } from "@/components/icons";
import { useState } from "react";
import { useTenancies } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function LeasesPage() {
  const { data: tenancies, isLoading } = useTenancies();
  const [search, setSearch] = useState("");

  if (isLoading) return <PageSkeleton rows={6} />;

  const leases = (tenancies ?? []).map((t: Record<string, any>) => ({
    id: t.id?.substring(0, 8).toUpperCase() ?? "",
    tenant: t.tenant?.full_name || "Unknown",
    unit: t.unit || "",
    property: t.property?.name || "",
    start: t.lease_start ? new Date(t.lease_start).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "--",
    end: t.lease_end ? new Date(t.lease_end).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "--",
    rent: `${t.currency || "EUR"} ${Number(t.monthly_rent || 0).toLocaleString()}`,
    status: t.status === "active" ? "active" : t.status === "ending" ? "expiring" : "expired",
  }));

  const filtered = leases.filter(
    (l: Record<string, string>) =>
      l.tenant.toLowerCase().includes(search.toLowerCase()) ||
      l.property.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="px-4 py-6 lg:px-6 lg:py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold font-serif text-foreground tracking-tight">Leases</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage lease agreements</p>
        </div>
        <button type="button" className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium min-h-[36px] hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Lease</span>
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl min-h-[44px]">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search leases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {leases.length === 0 ? (
        <EmptyState icon={FileText} title="No leases yet" description="Create a lease when you add a tenancy to one of your properties." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((lease: Record<string, string>) => (
            <div key={lease.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground truncate">{lease.tenant}</h3>
                  <span className="text-xs text-muted-foreground font-mono">{lease.id}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{lease.property} - {lease.unit}</span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />
                    {lease.start} - {lease.end}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full",
                  lease.status === "active" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  lease.status === "expiring" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                  lease.status === "expired" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                )}>{lease.status}</span>
                <span className="text-sm font-semibold text-foreground hidden sm:inline">{lease.rent}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          ))}
          {filtered.length === 0 && leases.length > 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground text-sm">No leases match your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
