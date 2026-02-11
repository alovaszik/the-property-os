"use client";

import { cn } from "@/lib/utils";
import { BarChart3, Download } from "@/components/icons";
import { useStatementsTenant } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function StatementsPage() {
  const { data: statements, isLoading } = useStatementsTenant();

  if (isLoading) return <PageSkeleton rows={4} />;

  const stmts = (statements ?? []) as Array<Record<string, any>>;

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Overhead Statements</h1>
          <p className="text-sm text-muted-foreground mt-1">Monthly breakdown of all charges</p>
        </div>
      </div>

      {stmts.length === 0 ? (
        <EmptyState icon={BarChart3} title="No statements yet" description="Your monthly overhead statements will appear here once your landlord generates them." />
      ) : (
        <>
          {/* Latest statement detailed view */}
          {stmts.length > 0 && (() => {
            const latest = stmts[0];
            return (
              <div className="p-5 rounded-2xl bg-card border border-border mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-foreground">{latest.period}</h3>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    latest.paid ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                  )}>{latest.paid ? "Paid" : `Due ${latest.due_date ? new Date(latest.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}`}</span>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Base Rent", amount: Number(latest.rent || 0) },
                    { label: "Utilities", amount: Number(latest.utilities || 0) },
                    { label: "Water & Sewer", amount: Number(latest.water || 0) },
                    { label: "Parking", amount: Number(latest.parking || 0) },
                    ...(Number(latest.other || 0) > 0 ? [{ label: "Other", amount: Number(latest.other) }] : []),
                  ].map((line) => (
                    <div key={line.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{line.label}</span>
                      <span className="text-sm font-medium text-foreground">${line.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-semibold text-foreground">Total Due</span>
                    <span className="text-lg font-bold text-primary">${Number(latest.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {stmts.length > 1 && (
            <>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Past Statements</h3>
              <div className="flex flex-col gap-2">
                {stmts.slice(1).map((stmt) => (
                  <div key={stmt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{stmt.period}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Rent + utilities + overhead</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-foreground">${Number(stmt.total || 0).toLocaleString()}</span>
                      <button type="button" className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors" aria-label="Download statement">
                        <Download className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
