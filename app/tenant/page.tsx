"use client";

import { cn } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import {
  Key, CreditCard, FileText, CalendarDays, ArrowRight,
  CheckCircle2, Clock, Wrench, Building2, MapPin,
} from "@/components/icons";
import Link from "next/link";
import { useMyTenancy, useTenantStats, useActivityLog, useProfile } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function TenantDashboard() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: tenancy, isLoading: tenancyLoading } = useMyTenancy();
  const { data: stats, isLoading: statsLoading } = useTenantStats();
  const { data: activity, isLoading: activityLoading } = useActivityLog();

  if (profileLoading || tenancyLoading || statsLoading) return <PageSkeleton />;

  const s = stats ?? { nextPayment: null, totalPaid: 0, onTimeRate: 100, openTickets: 0 };
  const t = tenancy as Record<string, any> | null;
  const name = (profile as Record<string, any>)?.full_name?.split(" ")[0] || "there";

  const activityItems = (activity ?? []).map((a: Record<string, any>) => ({
    id: a.id,
    type: a.type || "system",
    title: a.title || "",
    description: a.description || "",
    time: a.created_at ? new Date(a.created_at).toLocaleDateString() : "",
    status: a.status,
  }));

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-xl font-bold text-foreground font-serif">Welcome back, {name}</h1>
        <p className="text-sm text-muted-foreground">
          {t ? `Your home at ${(t.property as Record<string, string>)?.name || "your property"}` : "No active lease found"}
        </p>
      </div>

      {t ? (
        <div className="p-5 lg:p-6 rounded-xl bg-card border border-border shadow-card mb-8">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground font-serif">{(t.property as Record<string, string>)?.name || "Property"}</h2>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" />
                  Unit {t.unit} - {(t.property as Record<string, string>)?.address || ""}
                </div>
              </div>
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-success/10 text-success">Active</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
              <span className="text-2xs text-muted-foreground font-medium uppercase tracking-wider">Rent</span>
              <span className="text-sm font-bold text-foreground">{t.currency || "EUR"} {Number(t.monthly_rent || 0).toLocaleString()}/mo</span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
              <span className="text-2xs text-muted-foreground font-medium uppercase tracking-wider">Next Due</span>
              <span className="text-sm font-bold text-foreground">{s.nextPayment ? new Date((s.nextPayment as Record<string, string>).due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "--"}</span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/50">
              <span className="text-2xs text-muted-foreground font-medium uppercase tracking-wider">Lease End</span>
              <span className="text-sm font-bold text-foreground">{t.lease_end ? new Date(t.lease_end as string).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "--"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <Link href="/tenant/payments" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-semibold min-h-[44px] hover:opacity-90 transition-opacity">
              <CreditCard className="w-4 h-4" />Pay Rent
            </Link>
            <Link href="/tenant/lease" className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold min-h-[44px] hover:bg-accent transition-colors">
              <Key className="w-4 h-4" />View Lease
            </Link>
          </div>
        </div>
      ) : (
        <EmptyState icon={Building2} title="No active lease" description="You don't have an active lease yet. Your landlord needs to add you to a property." />
      )}

      <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-8">
        <StatCard label="Payment Status" value={s.totalPaid > 0 ? "Paid" : "--"} change={s.onTimeRate > 0 ? "On time" : "No data yet"} changeType={s.totalPaid > 0 ? "positive" : "neutral"} icon={CheckCircle2} />
        <StatCard label="Open Tickets" value={String(s.openTickets)} change={s.openTickets > 0 ? "In progress" : "None"} changeType="neutral" icon={Wrench} />
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Documents", icon: FileText, href: "/tenant/documents", color: "bg-primary/10 text-primary" },
            { label: "Statements", icon: CalendarDays, href: "/tenant/statements", color: "bg-success/10 text-success" },
            { label: "Maintenance", icon: Wrench, href: "/tenant/maintenance", color: "bg-warning/10 text-warning" },
            { label: "Activity", icon: Clock, href: "/tenant/activity", color: "bg-secondary text-secondary-foreground" },
          ].map((action) => (
            <Link key={action.label} href={action.href} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow min-h-[56px] no-underline">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", action.color)}>
                <action.icon className="w-[18px] h-[18px]" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </Link>
          ))}
        </div>
      </div>

      {activityItems.length > 0 && <RecentActivity items={activityItems} />}
    </div>
  );
}
