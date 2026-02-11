"use client";

import { cn } from "@/lib/utils";
import { Wrench, Plus, Clock, CheckCircle2, AlertCircle } from "@/components/icons";
import { useMaintenanceTenant } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function MaintenancePage() {
  const { data: raw, isLoading, mutate } = useMaintenanceTenant();
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  if (isLoading) return <PageSkeleton rows={4} />;

  const tickets = (raw ?? []) as Array<Record<string, any>>;

  async function handleSubmit() {
    if (!title.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    // Get tenant's active tenancy
    const { data: tenancy } = await supabase.from("tenancies").select("id, landlord_id").eq("tenant_id", user.id).eq("status", "active").single();
    if (!tenancy) { setSubmitting(false); return; }

    await supabase.from("maintenance_tickets").insert({
      tenancy_id: tenancy.id,
      tenant_id: user.id,
      landlord_id: tenancy.landlord_id,
      title: title.trim(),
      description: description.trim() || null,
      priority: "medium",
      status: "open",
    });
    setTitle("");
    setDescription("");
    setShowForm(false);
    setSubmitting(false);
    await mutate();
  }

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Maintenance</h1>
          <p className="text-sm text-muted-foreground mt-1">Submit and track repair requests</p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium min-h-[44px] hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Request</span>
        </button>
      </div>

      {showForm && (
        <div className="p-5 rounded-2xl bg-card border border-border mb-6">
          <h3 className="text-base font-semibold text-foreground mb-3">New Maintenance Request</h3>
          <input type="text" placeholder="Title (e.g. Leaky faucet)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none mb-3 min-h-[44px]" />
          <textarea placeholder="Describe the issue..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground outline-none mb-3 min-h-[88px] resize-none" />
          <button type="button" onClick={handleSubmit} disabled={submitting || !title.trim()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium min-h-[44px] hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      )}

      {tickets.length === 0 && !showForm ? (
        <EmptyState icon={Wrench} title="No maintenance requests" description="Submit a request when something needs fixing in your unit." action={{ label: "New Request", onClick: () => setShowForm(true) }} />
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
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
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      ticket.priority === "urgent" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      ticket.priority === "high" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                      ticket.priority === "medium" && "bg-primary/10 text-primary",
                      ticket.priority === "low" && "bg-secondary text-muted-foreground",
                    )}>{ticket.priority}</span>
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded ml-auto",
                      ticket.status === "open" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                      ticket.status === "in-progress" && "bg-primary/10 text-primary",
                      (ticket.status === "resolved" || ticket.status === "closed") && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    )}>{ticket.status}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{ticket.title}</h3>
                  {ticket.description && <p className="text-xs text-muted-foreground mt-0.5">{ticket.description}</p>}
                  <div className="text-xs text-muted-foreground mt-2">
                    Created {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "--"}
                    {ticket.updated_at && ticket.updated_at !== ticket.created_at && ` \u00b7 Updated ${new Date(ticket.updated_at).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
