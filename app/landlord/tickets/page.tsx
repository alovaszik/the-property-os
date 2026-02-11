"use client";

import { cn } from "@/lib/utils";
import { Bug, Search, Clock, CheckCircle2, AlertCircle, ChevronRight } from "@/components/icons";
import { useState } from "react";
import { useMaintenanceLandlord } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function TicketsPage() {
  const { data: raw, isLoading } = useMaintenanceLandlord();
  const [search, setSearch] = useState("");

  if (isLoading) return <PageSkeleton rows={6} />;

  const tickets = (raw ?? []).map((t: Record<string, any>) => ({
    id: t.id?.substring(0, 6).toUpperCase() ?? "",
    title: t.title || "Untitled",
    tenant: t.tenancy?.tenant?.full_name || "Unknown",
    unit: t.tenancy?.unit || "",
    priority: t.priority || "medium",
    status: t.status || "open",
    created: t.created_at ? new Date(t.created_at).toLocaleDateString() : "--",
  }));

  const filtered = tickets.filter(
    (t: Record<string, string>) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.tenant.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
  );

  const openCount = tickets.filter((t: Record<string, string>) => t.status !== "resolved" && t.status !== "closed").length;

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Maintenance Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">{openCount} open {openCount === 1 ? "ticket" : "tickets"}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl min-h-[44px]">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input type="text" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState icon={Bug} title="No maintenance tickets" description="When tenants report issues, they will appear here." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((ticket: Record<string, string>) => (
            <div key={ticket.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                ticket.status === "open" && "bg-amber-100 dark:bg-amber-900/30",
                ticket.status === "in-progress" && "bg-primary/10",
                (ticket.status === "resolved" || ticket.status === "closed") && "bg-green-100 dark:bg-green-900/30",
              )}>
                {ticket.status === "open" && <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                {ticket.status === "in-progress" && <Clock className="w-5 h-5 text-primary" />}
                {(ticket.status === "resolved" || ticket.status === "closed") && <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">{ticket.id}</span>
                  <span className={cn(
                    "text-[10px] font-medium px-1.5 py-0.5 rounded",
                    ticket.priority === "urgent" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    ticket.priority === "high" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    ticket.priority === "medium" && "bg-primary/10 text-primary",
                    ticket.priority === "low" && "bg-secondary text-muted-foreground",
                  )}>{ticket.priority}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground truncate mt-0.5">{ticket.title}</h3>
                <div className="text-xs text-muted-foreground mt-0.5">{ticket.tenant} &middot; Unit {ticket.unit} &middot; {ticket.created}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          ))}
          {filtered.length === 0 && tickets.length > 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground text-sm">No tickets match your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
