"use client";

import { cn } from "@/lib/utils";
import {
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  MapPin,
  MoreVertical,
  X,
  Users,
  Copy,
  Link2,
  Check,
  Loader2,
  Building2,
  Key,
  DollarSign,
} from "@/components/icons";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTenancies } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

type InviteStep = "form" | "loading" | "success";

export default function TenantsPage() {
  const { data: tenanciesRaw, isLoading } = useTenancies();
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteStep, setInviteStep] = useState<InviteStep>("form");
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteForm, setInviteForm] = useState({
    tenant_name: "",
    tenant_email: "",
    tenant_phone: "",
    property_name: "",
    unit: "",
    monthly_rent: "",
    currency: "EUR",
  });

  const tenancies = (tenanciesRaw ?? []) as Array<Record<string, any>>;
  const tenants = tenancies.map((t) => ({
    id: t.id,
    name: t.tenant?.full_name || "Unknown",
    email: t.tenant?.email || "",
    phone: "",
    unit: t.unit || "",
    property: t.property?.name || "",
    rent: `${t.currency || "EUR"} ${Number(t.monthly_rent || 0).toLocaleString()}`,
    status: t.status === "active" ? "active" : t.status === "ending" ? "ending" : "active",
    paid: true,
  }));
  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.property.toLowerCase().includes(search.toLowerCase()) ||
      t.unit.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <PageSkeleton rows={6} />;

  const handleInviteSubmit = async () => {
    if (!inviteForm.tenant_name || !inviteForm.tenant_email) {
      setInviteError("Name and email are required");
      return;
    }
    setInviteError("");
    setInviteStep("loading");

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...inviteForm,
          monthly_rent: inviteForm.monthly_rent ? Number(inviteForm.monthly_rent) : null,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setInviteError(result.error || "Failed to create invitation");
        setInviteStep("form");
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setInviteLink(`${origin}/auth/register/invite/${result.invitation.token}`);
      setInviteStep("success");
    } catch {
      setInviteError("Something went wrong. Please try again.");
      setInviteStep("form");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetInvite = () => {
    setShowInvite(false);
    setInviteStep("form");
    setInviteLink("");
    setCopied(false);
    setInviteError("");
    setInviteForm({
      tenant_name: "",
      tenant_email: "",
      tenant_phone: "",
      property_name: "",
      unit: "",
      monthly_rent: "",
      currency: "EUR",
    });
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Tenants</h1>
          <p className="text-sm text-muted-foreground mt-1">{tenants.length} {tenants.length === 1 ? "tenant" : "tenants"} across all properties</p>
        </div>
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium min-h-[44px] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Invite Tenant</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl min-h-[44px]">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search tenants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <button
          type="button"
          className="flex items-center justify-center w-11 h-11 rounded-xl bg-card border border-border hover:bg-secondary transition-colors"
          aria-label="Filter"
        >
          <Filter className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Tenant list */}
      <div className="flex flex-col gap-3">
        {filtered.map((tenant) => (
          <div key={tenant.id} className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors">
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
              {tenant.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground truncate">{tenant.name}</h3>
                <span className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0",
                  tenant.status === "active" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  tenant.status === "late" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  tenant.status === "ending" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                )}>{tenant.status}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {tenant.property} - {tenant.unit}
                </span>
                <span className="font-medium text-foreground">{tenant.rent}/mo</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full hidden sm:inline",
                tenant.paid
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              )}>
                {tenant.paid ? "Paid" : "Unpaid"}
              </span>
              <button type="button" className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors" aria-label="More options">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Tenant Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={resetInvite}
            onKeyDown={() => {}}
            role="button"
            tabIndex={-1}
          />

          {/* Modal */}
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {inviteStep === "success" ? "Invitation Created" : "Invite Tenant"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {inviteStep === "success"
                      ? "Share the link with your tenant"
                      : "Generate a one-time registration link"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetInvite}
                className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-6">
              {inviteStep === "form" && (
                <div className="space-y-4">
                  {inviteError && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      {inviteError}
                    </div>
                  )}

                  {/* Tenant Info */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tenant Information</p>
                    <div className="space-y-2">
                      <Label htmlFor="inv-name">Full Name *</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="inv-name"
                          placeholder="John Doe"
                          value={inviteForm.tenant_name}
                          onChange={(e) => setInviteForm({ ...inviteForm, tenant_name: e.target.value })}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="inv-email"
                          type="email"
                          placeholder="tenant@example.com"
                          value={inviteForm.tenant_email}
                          onChange={(e) => setInviteForm({ ...inviteForm, tenant_email: e.target.value })}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="inv-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="inv-phone"
                          type="tel"
                          placeholder="+49 123 456 7890"
                          value={inviteForm.tenant_phone}
                          onChange={(e) => setInviteForm({ ...inviteForm, tenant_phone: e.target.value })}
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Property Details (Optional)</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="inv-property">Property</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="inv-property"
                            placeholder="Building name"
                            value={inviteForm.property_name}
                            onChange={(e) => setInviteForm({ ...inviteForm, property_name: e.target.value })}
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inv-unit">Unit</Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="inv-unit"
                            placeholder="4B"
                            value={inviteForm.unit}
                            onChange={(e) => setInviteForm({ ...inviteForm, unit: e.target.value })}
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="inv-rent">Monthly Rent</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="inv-rent"
                            type="number"
                            placeholder="1200"
                            value={inviteForm.monthly_rent}
                            onChange={(e) => setInviteForm({ ...inviteForm, monthly_rent: e.target.value })}
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="inv-currency">Currency</Label>
                        <select
                          id="inv-currency"
                          value={inviteForm.currency}
                          onChange={(e) => setInviteForm({ ...inviteForm, currency: e.target.value })}
                          className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm text-foreground"
                        >
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="CHF">CHF</option>
                          <option value="SEK">SEK</option>
                          <option value="NOK">NOK</option>
                          <option value="DKK">DKK</option>
                          <option value="PLN">PLN</option>
                          <option value="CZK">CZK</option>
                          <option value="HUF">HUF</option>
                          <option value="RON">RON</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-4">
                      This generates a one-time invite link valid for 7 days. The tenant can only register once using this link.
                    </p>
                    <Button onClick={handleInviteSubmit} className="w-full h-11">
                      <Link2 className="w-4 h-4 mr-2" />
                      Generate Invite Link
                    </Button>
                  </div>
                </div>
              )}

              {inviteStep === "loading" && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                  <p className="text-sm text-muted-foreground">Creating invitation...</p>
                </div>
              )}

              {inviteStep === "success" && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">Invitation created for {inviteForm.tenant_name}</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">The link expires in 7 days and can only be used once.</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Invite Link</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 rounded-lg bg-secondary/50 border border-border text-xs text-foreground font-mono break-all select-all">
                        {inviteLink}
                      </div>
                      <Button
                        onClick={handleCopyLink}
                        variant="outline"
                        size="icon"
                        className="shrink-0 h-11 w-11 bg-transparent"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={resetInvite} variant="outline" className="flex-1 h-11 bg-transparent">
                      Close
                    </Button>
                    <Button
                      onClick={() => {
                        resetInvite();
                        setShowInvite(true);
                      }}
                      className="flex-1 h-11"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Another
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
