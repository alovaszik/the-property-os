"use client";

import { useActivityLog } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";
import { DollarSign, MessageSquare, Wrench, CircleDot } from "@/components/icons";

const typeIcons: Record<string, { icon: typeof DollarSign; bg: string; fg: string }> = {
  payment: { icon: DollarSign, bg: "bg-green-100 dark:bg-green-900/30", fg: "text-green-600 dark:text-green-400" },
  message: { icon: MessageSquare, bg: "bg-blue-100 dark:bg-blue-900/30", fg: "text-blue-600 dark:text-blue-400" },
  ticket: { icon: Wrench, bg: "bg-amber-100 dark:bg-amber-900/30", fg: "text-amber-600 dark:text-amber-400" },
  system: { icon: CircleDot, bg: "bg-muted", fg: "text-muted-foreground" },
  lease: { icon: CircleDot, bg: "bg-purple-100 dark:bg-purple-900/30", fg: "text-purple-600 dark:text-purple-400" },
  document: { icon: CircleDot, bg: "bg-cyan-100 dark:bg-cyan-900/30", fg: "text-cyan-600 dark:text-cyan-400" },
};

export default function LandlordActivityPage() {
  const { data: activityRaw, isLoading } = useActivityLog();

  if (isLoading) return <PageSkeleton rows={8} />;

  const items = (activityRaw ?? []) as Array<Record<string, any>>;

  const fmtTime = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold font-display text-foreground tracking-tight">Activity Feed</h1>
        <p className="text-sm text-muted-foreground mt-1">All messages, payments, and tickets in one place</p>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const t = typeIcons[item.type] || typeIcons.system;
            const Icon = t.icon;
            return (
              <div key={item.id} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", t.bg)}>
                  <Icon className={cn("w-4 h-4", t.fg)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  {item.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{fmtTime(item.created_at)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon={CircleDot} title="No activity yet" description="Your activity feed will fill up as you manage properties, tenants, and payments." />
      )}
    </div>
  );
}
