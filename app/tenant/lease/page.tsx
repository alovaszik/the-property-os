"use client";

import { Key, CalendarDays, Building2, Users, FileText, Download, MapPin } from "@/components/icons";
import { useMyTenancy, useDocumentsTenant } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function TenantLeasePage() {
  const { data: tenancy, isLoading } = useMyTenancy();
  const { data: docs } = useDocumentsTenant();

  if (isLoading) return <PageSkeleton />;

  const t = tenancy as Record<string, any> | null;
  const leaseDocs = ((docs ?? []) as Array<Record<string, any>>).filter((d) => d.category === "lease" || d.category === "inspection");

  if (!t) {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">My Lease</h1>
          <p className="text-sm text-muted-foreground mt-1">Lease agreement details</p>
        </div>
        <EmptyState icon={Key} title="No active lease" description="You don't have an active lease yet. Your landlord needs to add you to a property." />
      </div>
    );
  }

  const property = t.property as Record<string, string> | null;
  const landlord = t.landlord as Record<string, string> | null;

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">My Lease</h1>
        <p className="text-sm text-muted-foreground mt-1">Lease agreement details</p>
      </div>

      <div className="p-5 rounded-2xl bg-card border border-border mb-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Key className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Lease Agreement</h2>
            <span className="text-xs text-muted-foreground font-mono">{t.id?.substring(0, 8).toUpperCase()}</span>
          </div>
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{t.status}</span>
        </div>

        <div className="flex flex-col gap-4">
          {[
            { label: "Property", value: `${property?.name || "Property"}, Unit ${t.unit}`, icon: Building2 },
            { label: "Address", value: property?.address || "--", icon: MapPin },
            { label: "Lease Period", value: `${t.lease_start ? new Date(t.lease_start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"} - ${t.lease_end ? new Date(t.lease_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}`, icon: CalendarDays },
            { label: "Monthly Rent", value: `${t.currency || "EUR"} ${Number(t.monthly_rent || 0).toLocaleString()}`, icon: Key },
            { label: "Security Deposit", value: `${t.currency || "EUR"} ${Number(t.deposit || 0).toLocaleString()}`, icon: Key },
            { label: "Landlord", value: landlord?.full_name || "--", icon: Users },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <item.icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground w-28 shrink-0">{item.label}</span>
              <span className="text-sm font-medium text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {leaseDocs.length > 0 && (
        <div className="p-5 rounded-2xl bg-card border border-border">
          <h3 className="text-base font-semibold text-foreground mb-4">Lease Documents</h3>
          <div className="flex flex-col gap-2">
            {leaseDocs.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer min-h-[48px]">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ""}{doc.file_size ? ` \u00b7 ${doc.file_size}` : ""}</p>
                </div>
                {doc.file_url && (
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors" aria-label="Download">
                    <Download className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
