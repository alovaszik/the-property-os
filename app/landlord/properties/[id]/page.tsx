"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import {
  ChevronLeft,
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Car,
  Sofa,
  PawPrint,
  ArrowUp,
  Home,
  Trees,
  Package,
  Flame,
  DollarSign,
  Save,
  Loader2,
  Trash2,
  Users,
  Check,
  X,
  Pencil,
  Eye,
  FileText,
} from "@/components/icons";

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "studio", label: "Studio" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
];

const HEATING_TYPES = [
  { value: "central", label: "Central" },
  { value: "individual", label: "Individual" },
  { value: "electric", label: "Electric" },
  { value: "gas", label: "Gas" },
  { value: "none", label: "None" },
];

const CURRENCIES = ["EUR","GBP","CHF","SEK","NOK","DKK","PLN","CZK","HUF","RON","USD"];

const AMENITY_LIST = [
  { key: "parking", label: "Parking", icon: Car },
  { key: "furnished", label: "Furnished", icon: Sofa },
  { key: "pets_allowed", label: "Pets Allowed", icon: PawPrint },
  { key: "elevator", label: "Elevator", icon: ArrowUp },
  { key: "balcony", label: "Balcony / Terrace", icon: Home },
  { key: "garden", label: "Garden", icon: Trees },
  { key: "storage", label: "Storage", icon: Package },
  { key: "utilities_included", label: "Utilities Included", icon: Flame },
] as const;

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState<Record<string, any>>({});

  const supabase = createClient();

  const { data: property, isLoading, mutate } = useSWR(
    id ? `property-${id}` : null,
    async () => {
      const { data } = await supabase.from("properties").select("*").eq("id", id).single();
      return data;
    }
  );

  // Fetch tenants for this property
  const { data: tenancies } = useSWR(
    id ? `property-tenancies-${id}` : null,
    async () => {
      const { data } = await supabase
        .from("tenancies")
        .select("*, tenant:profiles!tenancies_tenant_id_fkey(*)")
        .eq("property_id", id)
        .order("created_at", { ascending: false });
      return data ?? [];
    }
  );

  useEffect(() => {
    if (property) setForm({ ...property });
  }, [property]);

  if (isLoading || !property) return <PageSkeleton rows={8} />;

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.from("properties").update({
      name: form.name?.trim(),
      property_type: form.property_type,
      description: form.description?.trim() || null,
      address: form.address?.trim(),
      city: form.city?.trim() || null,
      country: form.country?.trim() || null,
      zip_code: form.zip_code?.trim() || null,
      floor: form.floor?.trim() || null,
      total_units: form.total_units ?? 1,
      rooms: form.rooms ?? null,
      bathrooms: form.bathrooms ?? null,
      size_sqm: form.size_sqm ?? null,
      heating_type: form.heating_type,
      parking: form.parking ?? false,
      furnished: form.furnished ?? false,
      pets_allowed: form.pets_allowed ?? false,
      elevator: form.elevator ?? false,
      balcony: form.balcony ?? false,
      garden: form.garden ?? false,
      storage: form.storage ?? false,
      utilities_included: form.utilities_included ?? false,
      monthly_rent: form.monthly_rent ?? null,
      currency: form.currency,
      deposit_amount: form.deposit_amount ?? null,
      notes: form.notes?.trim() || null,
      status: form.status,
    }).eq("id", id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccessMsg("Property saved successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
      setEditing(false);
      await mutate();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error: delError } = await supabase.from("properties").delete().eq("id", id);
    if (delError) {
      setError(delError.message);
      setDeleting(false);
    } else {
      router.push("/landlord/properties");
    }
  };

  const activeTenants = (tenancies ?? []).filter((t: any) => t.status === "active");

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-4xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => router.push("/landlord/properties")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Properties
        </button>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                onClick={() => { setEditing(false); setForm({ ...property }); }}
                className="h-10 bg-transparent"
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="h-10">
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)} className="h-10 bg-transparent">
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(true)}
                className="h-10 bg-transparent text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">{error}</div>
      )}
      {successMsg && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm mb-4 flex items-center gap-2">
          <Check className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Header card */}
      <div className="p-5 rounded-2xl bg-card border border-border mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <Input value={form.name ?? ""} onChange={(e) => update("name", e.target.value)} className="h-10 text-lg font-bold" placeholder="Property name" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={form.property_type ?? "apartment"} onChange={(e) => update("property_type", e.target.value)} className="h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground">
                    {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <select value={form.status ?? "active"} onChange={(e) => update("status", e.target.value)} className="h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground">
                    <option value="active">Active</option>
                    <option value="vacant">Vacant</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">{property.name}</h1>
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full capitalize",
                    property.status === "active" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    property.status === "maintenance" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                    property.status === "vacant" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    property.status === "inactive" && "bg-muted text-muted-foreground"
                  )}>{property.status}</span>
                </div>
                <p className="text-sm text-muted-foreground capitalize mt-1">{property.property_type || "Property"}</p>
                {property.description && <p className="text-sm text-muted-foreground mt-2">{property.description}</p>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="p-5 rounded-2xl bg-card border border-border mb-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-primary" /> Location
        </h2>
        {editing ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Street Address</Label>
              <Input value={form.address ?? ""} onChange={(e) => update("address", e.target.value)} className="h-10" placeholder="123 Main St" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>City</Label>
                <Input value={form.city ?? ""} onChange={(e) => update("city", e.target.value)} className="h-10" placeholder="Budapest" />
              </div>
              <div className="space-y-1.5">
                <Label>Zip Code</Label>
                <Input value={form.zip_code ?? ""} onChange={(e) => update("zip_code", e.target.value)} className="h-10" placeholder="1051" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input value={form.country ?? ""} onChange={(e) => update("country", e.target.value)} className="h-10" placeholder="Hungary" />
              </div>
              <div className="space-y-1.5">
                <Label>Floor</Label>
                <Input value={form.floor ?? ""} onChange={(e) => update("floor", e.target.value)} className="h-10" placeholder="3rd" />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <div><span className="text-muted-foreground">Address</span><p className="font-medium text-foreground mt-0.5">{property.address || "-"}</p></div>
            <div><span className="text-muted-foreground">City</span><p className="font-medium text-foreground mt-0.5">{property.city || "-"}</p></div>
            <div><span className="text-muted-foreground">Zip Code</span><p className="font-medium text-foreground mt-0.5">{property.zip_code || "-"}</p></div>
            <div><span className="text-muted-foreground">Country</span><p className="font-medium text-foreground mt-0.5">{property.country || "-"}</p></div>
            {property.floor && <div><span className="text-muted-foreground">Floor</span><p className="font-medium text-foreground mt-0.5">{property.floor}</p></div>}
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-5 rounded-2xl bg-card border border-border mb-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-primary" /> Property Details
        </h2>
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label>Units</Label>
                <Input type="number" min={1} value={form.total_units ?? 1} onChange={(e) => update("total_units", Number(e.target.value))} className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>Rooms</Label>
                <Input type="number" min={0} value={form.rooms ?? ""} onChange={(e) => update("rooms", e.target.value ? Number(e.target.value) : null)} className="h-10" placeholder="-" />
              </div>
              <div className="space-y-1.5">
                <Label>Bathrooms</Label>
                <Input type="number" min={0} value={form.bathrooms ?? ""} onChange={(e) => update("bathrooms", e.target.value ? Number(e.target.value) : null)} className="h-10" placeholder="-" />
              </div>
              <div className="space-y-1.5">
                <Label>Size (m2)</Label>
                <Input type="number" min={0} value={form.size_sqm ?? ""} onChange={(e) => update("size_sqm", e.target.value ? Number(e.target.value) : null)} className="h-10" placeholder="-" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Heating</Label>
              <div className="flex flex-wrap gap-2">
                {HEATING_TYPES.map((h) => (
                  <button key={h.value} type="button" onClick={() => update("heating_type", h.value)} className={cn("px-3 py-2 rounded-lg border text-xs font-medium min-h-[40px] transition-colors", form.heating_type === h.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30")}>{h.label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea value={form.description ?? ""} onChange={(e) => update("description", e.target.value)} rows={3} placeholder="Property description..." className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Units", value: property.total_units, icon: Users },
                { label: "Rooms", value: property.rooms, icon: BedDouble },
                { label: "Bathrooms", value: property.bathrooms, icon: Bath },
                { label: "Size", value: property.size_sqm ? `${property.size_sqm} m2` : null, icon: Maximize2 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex flex-col gap-1 p-3 rounded-xl bg-secondary/50">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{item.value ?? "-"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {property.heating_type && (
              <div className="flex items-center gap-2 text-sm">
                <Flame className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Heating:</span>
                <span className="font-medium text-foreground capitalize">{property.heating_type}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Amenities */}
      <div className="p-5 rounded-2xl bg-card border border-border mb-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <Check className="w-4 h-4 text-primary" /> Amenities
        </h2>
        {editing ? (
          <div className="grid grid-cols-2 gap-2">
            {AMENITY_LIST.map((amenity) => {
              const Icon = amenity.icon;
              const active = !!form[amenity.key];
              return (
                <button key={amenity.key} type="button" onClick={() => update(amenity.key, !active)} className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors min-h-[44px]", active ? "border-primary bg-primary/5" : "border-border hover:border-primary/30")}>
                  <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>{amenity.label}</span>
                  {active && <Check className="w-3 h-3 text-primary ml-auto" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {AMENITY_LIST.filter((a) => property[a.key]).map((amenity) => {
              const Icon = amenity.icon;
              return (
                <div key={amenity.key} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/5 border border-primary/20">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">{amenity.label}</span>
                </div>
              );
            })}
            {AMENITY_LIST.every((a) => !property[a.key]) && (
              <p className="text-sm text-muted-foreground">No amenities selected</p>
            )}
          </div>
        )}
      </div>

      {/* Financials */}
      <div className="p-5 rounded-2xl bg-card border border-border mb-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-primary" /> Financials
        </h2>
        {editing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Monthly Rent</Label>
                <Input type="number" min={0} value={form.monthly_rent ?? ""} onChange={(e) => update("monthly_rent", e.target.value ? Number(e.target.value) : null)} className="h-10" placeholder="150000" />
              </div>
              <div className="space-y-1.5">
                <Label>Currency</Label>
                <select value={form.currency ?? "EUR"} onChange={(e) => update("currency", e.target.value)} className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Security Deposit</Label>
              <Input type="number" min={0} value={form.deposit_amount ?? ""} onChange={(e) => update("deposit_amount", e.target.value ? Number(e.target.value) : null)} className="h-10" placeholder="300000" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-secondary/50">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Monthly Rent</span>
              <span className="text-sm font-semibold text-foreground">
                {property.monthly_rent ? `${property.currency || "EUR"} ${Number(property.monthly_rent).toLocaleString()}` : "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-secondary/50">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Deposit</span>
              <span className="text-sm font-semibold text-foreground">
                {property.deposit_amount ? `${property.currency || "EUR"} ${Number(property.deposit_amount).toLocaleString()}` : "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-secondary/50">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Utilities</span>
              <span className="text-sm font-semibold text-foreground">{property.utilities_included ? "Included" : "Not included"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {(editing || property.notes) && (
        <div className="p-5 rounded-2xl bg-card border border-border mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-primary" /> Notes
          </h2>
          {editing ? (
            <textarea value={form.notes ?? ""} onChange={(e) => update("notes", e.target.value)} rows={3} placeholder="Additional notes..." className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{property.notes}</p>
          )}
        </div>
      )}

      {/* Tenants section */}
      <div className="p-5 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Tenants ({activeTenants.length})
          </h2>
          <Button
            variant="outline"
            onClick={() => router.push("/landlord/tenants")}
            className="h-9 text-xs bg-transparent"
          >
            Manage Tenants
          </Button>
        </div>
        {activeTenants.length > 0 ? (
          <div className="flex flex-col gap-2">
            {activeTenants.map((tenancy: any) => (
              <div key={tenancy.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                  {(tenancy.tenant?.full_name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tenancy.tenant?.full_name || "Unnamed Tenant"}</p>
                  <p className="text-xs text-muted-foreground">Unit {tenancy.unit} - {tenancy.currency} {Number(tenancy.monthly_rent).toLocaleString()}/mo</p>
                </div>
                <span className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full capitalize",
                  tenancy.status === "active" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                  tenancy.status === "ending" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                )}>{tenancy.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active tenants</p>
            <p className="text-xs text-muted-foreground mt-1">Invite tenants from the Tenants page to assign them here</p>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} onKeyDown={() => {}} role="button" tabIndex={-1} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Property</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete "{property.name}"? This action cannot be undone and will also remove all associated tenancies.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setConfirmDelete(false)} className="flex-1 h-11 bg-transparent">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="flex-1 h-11">
                {deleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
