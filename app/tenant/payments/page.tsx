"use client";

import { cn } from "@/lib/utils";
import { CreditCard, CheckCircle2, DollarSign, Clock } from "@/components/icons";
import { StatCard } from "@/components/dashboard/stat-card";
import { usePaymentsTenant, useTenantStats } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function TenantPaymentsPage() {
  const { data: payments, isLoading } = usePaymentsTenant();
  const { data: stats } = useTenantStats();

  if (isLoading) return <PageSkeleton />;

  const paymentList = (payments ?? []) as Array<Record<string, any>>;
  const s = stats ?? { nextPayment: null, totalPaid: 0, onTimeRate: 100, openTickets: 0 };
  const nextPayment = s.nextPayment as Record<string, any> | null;
  const completed = paymentList.filter((p) => p.status === "completed");

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage rent payments</p>
      </div>

      {nextPayment ? (
        <div className="p-5 rounded-2xl bg-primary text-primary-foreground mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium opacity-80">Next Payment Due</span>
            <span className="text-xs font-medium bg-primary-foreground/20 px-2.5 py-1 rounded-full">
              {new Date(nextPayment.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div className="text-3xl font-bold tracking-tight mb-4">{nextPayment.currency || "EUR"} {Number(nextPayment.amount || 0).toLocaleString()}</div>
          <button type="button" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-foreground text-primary rounded-xl text-sm font-semibold min-h-[48px] hover:opacity-90 transition-opacity">
            <CreditCard className="w-4 h-4" />Pay Now
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-card border border-border mb-6 text-center">
          <p className="text-sm text-muted-foreground">No pending payments</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total Paid" value={s.totalPaid > 0 ? `$${(s.totalPaid / 1000).toFixed(1)}K` : "$0"} change={`${completed.length} payments`} changeType="neutral" icon={DollarSign} />
        <StatCard label="On Time" value={completed.length > 0 ? "100%" : "--"} change={completed.length > 0 ? "All payments" : "No data"} changeType={completed.length > 0 ? "positive" : "neutral"} icon={CheckCircle2} />
      </div>

      {completed.length > 0 ? (
        <div className="p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-base font-semibold text-foreground mb-4">Payment History</h3>
          <div className="flex flex-col">
            {completed.map((payment, idx) => (
              <div key={payment.id} className={cn("flex items-center gap-3 py-3", idx < completed.length - 1 && "border-b border-border")}>
                <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Payment"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : ""} &middot; {payment.method || "Manual"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {payment.currency || "EUR"} {Number(payment.amount || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState icon={CreditCard} title="No payment history" description="Your payment history will appear here once payments are made." />
      )}
    </div>
  );
}
