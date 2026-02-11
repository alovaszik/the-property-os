"use client";

import { cn } from "@/lib/utils";
import { DollarSign, Clock, CheckCircle2, AlertCircle, Search, Filter } from "@/components/icons";
import { StatCard } from "@/components/dashboard/stat-card";
import { useState } from "react";
import { usePaymentsLandlord } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function PaymentsPage() {
  const { data: paymentsRaw, isLoading } = usePaymentsLandlord();
  const [search, setSearch] = useState("");

  if (isLoading) return <PageSkeleton rows={6} />;

  const payments = (paymentsRaw ?? []) as Array<Record<string, any>>;
  const completed = payments.filter(p => p.status === "completed");
  const pendingArr = payments.filter(p => p.status === "pending");
  const overdueArr = payments.filter(p => p.status === "overdue");
  const totalCollected = completed.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalPending = pendingArr.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalOverdue = overdueArr.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const filtered = payments.filter((p) => {
    const tenantName = p.tenancy?.tenant?.full_name || "";
    return tenantName.toLowerCase().includes(search.toLowerCase()) || p.id?.toLowerCase().includes(search.toLowerCase());
  });

  const fmtCurrency = (val: number) => val >= 1000 ? `$${(val / 1000).toFixed(1)}K` : `$${val.toFixed(0)}`;
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="px-4 py-6 lg:px-6 lg:py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold font-serif text-foreground tracking-tight">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track rent collection and payments</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Collected" value={fmtCurrency(totalCollected)} change="This month" changeType="positive" icon={DollarSign} />
        <StatCard label="Pending" value={fmtCurrency(totalPending)} change={`${pendingArr.length} tenant${pendingArr.length !== 1 ? "s" : ""}`} changeType="neutral" icon={Clock} />
        <StatCard label="Overdue" value={fmtCurrency(totalOverdue)} change={`${overdueArr.length} tenant${overdueArr.length !== 1 ? "s" : ""}`} changeType={overdueArr.length > 0 ? "negative" : "neutral"} icon={AlertCircle} />
        <StatCard label="Total" value={String(payments.length)} change="All payments" changeType="neutral" icon={DollarSign} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg min-h-[44px]">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
        </div>
        <button type="button" className="flex items-center justify-center w-11 h-11 rounded-lg bg-card border border-border hover:bg-secondary transition-colors" aria-label="Filter">
          <Filter className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((payment) => {
            const tenantName = payment.tenancy?.tenant?.full_name || "Unknown";
            const unit = payment.tenancy?.unit || "";
            return (
              <div key={payment.id} className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  payment.status === "completed" && "bg-green-100 dark:bg-green-900/30",
                  payment.status === "pending" && "bg-amber-100 dark:bg-amber-900/30",
                  payment.status === "overdue" && "bg-red-100 dark:bg-red-900/30",
                )}>
                  {payment.status === "completed" && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
                  {payment.status === "pending" && <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                  {payment.status === "overdue" && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">{tenantName}</h3>
                    <span className="text-xs text-muted-foreground">{unit}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{fmtDate(payment.due_date)} &middot; {payment.method}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-foreground">{payment.currency} {Number(payment.amount).toLocaleString()}</span>
                  <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full hidden sm:inline",
                    payment.status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    payment.status === "pending" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    payment.status === "overdue" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  )}>{payment.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState icon={DollarSign} title="No payments yet" description="Payments will appear here once tenants start paying rent." />
      ) : (
        <div className="text-center py-16"><p className="text-sm text-muted-foreground">No payments match your search.</p></div>
      )}
    </div>
  );
}
