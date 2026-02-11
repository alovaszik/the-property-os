"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  Building2,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Home,
  Warehouse,
  Store,
  BedDouble,
  Bath,
  Maximize2,
  Car,
  Sofa,
  PawPrint,
  ArrowUp,
  Trees,
  Package,
  Flame,
  DollarSign,
  FileText,
} from "@/components/icons";

interface AddPropertyModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment", icon: Building2 },
  { value: "house", label: "House", icon: Home },
  { value: "studio", label: "Studio", icon: BedDouble },
  { value: "commercial", label: "Commercial", icon: Store },
  { value: "other", label: "Other", icon: Warehouse },
] as const;

const HEATING_TYPES = [
  { value: "central", label: "Central" },
  { value: "individual", label: "Individual" },
  { value: "electric", label: "Electric" },
  { value: "gas", label: "Gas" },
  { value: "none", label: "None" },
] as const;

const CURRENCIES = [
  "EUR", "GBP", "CHF", "SEK", "NOK", "DKK", "PLN", "CZK", "HUF", "RON", "USD",
] as const;

const STEPS = [
  { id: 1, title: "Basics", description: "Name & type" },
  { id: 2, title: "Location", description: "Address details" },
  { id: 3, title: "Details", description: "Rooms & features" },
  { id: 4, title: "Amenities", description: "What's included" },
  { id: 5, title: "Financials", description: "Rent & deposit" },
] as const;

type FormData = {
  name: string;
  property_type: string;
  description: string;
  address: string;
  city: string;
  country: string;
  zip_code: string;
  floor: string;
  total_units: number;
  rooms: number | null;
  bathrooms: number | null;
  size_sqm: number | null;
  heating_type: string;
  parking: boolean;
  furnished: boolean;
  pets_allowed: boolean;
  elevator: boolean;
  balcony: boolean;
  garden: boolean;
  storage: boolean;
  utilities_included: boolean;
  monthly_rent: number | null;
  currency: string;
  deposit_amount: number | null;
  notes: string;
  status: string;
};

const initialForm: FormData = {
  name: "",
  property_type: "apartment",
  description: "",
  address: "",
  city: "",
  country: "",
  zip_code: "",
  floor: "",
  total_units: 1,
  rooms: null,
  bathrooms: null,
  size_sqm: null,
  heating_type: "central",
  parking: false,
  furnished: false,
  pets_allowed: false,
  elevator: false,
  balcony: false,
  garden: false,
  storage: false,
  utilities_included: false,
  monthly_rent: null,
  currency: "EUR",
  deposit_amount: null,
  notes: "",
  status: "active",
};

export function AddPropertyModal({ open, onClose, onSuccess }: AddPropertyModalProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({ ...initialForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const update = (key: keyof FormData, value: FormData[keyof FormData]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    if (step === 1) return form.name.trim().length > 0;
    if (step === 2) return form.address.trim().length > 0;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setSaving(false); return; }

      const { error: insertError } = await supabase.from("properties").insert({
        landlord_id: user.id,
        name: form.name.trim(),
        property_type: form.property_type,
        description: form.description.trim() || null,
        address: form.address.trim(),
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        zip_code: form.zip_code.trim() || null,
        floor: form.floor.trim() || null,
        total_units: form.total_units,
        rooms: form.rooms,
        bathrooms: form.bathrooms,
        size_sqm: form.size_sqm,
        heating_type: form.heating_type,
        parking: form.parking,
        furnished: form.furnished,
        pets_allowed: form.pets_allowed,
        elevator: form.elevator,
        balcony: form.balcony,
        garden: form.garden,
        storage: form.storage,
        utilities_included: form.utilities_included,
        monthly_rent: form.monthly_rent,
        currency: form.currency,
        deposit_amount: form.deposit_amount,
        notes: form.notes.trim() || null,
        status: form.status,
      });

      if (insertError) { setError(insertError.message); setSaving(false); return; }

      setForm({ ...initialForm });
      setStep(1);
      onSuccess();
      onClose();
    } catch {
      setError("Failed to save property");
    }
    setSaving(false);
  };

  const handleClose = () => {
    setForm({ ...initialForm });
    setStep(1);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
        onKeyDown={() => {}}
        role="button"
        tabIndex={-1}
      />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Add Property</h2>
              <p className="text-xs text-muted-foreground">Step {step} of {STEPS.length} - {STEPS[step - 1].title}</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors" aria-label="Close">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex gap-1.5 px-5 pt-4">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                s.id <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-5">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prop-name">Property Name *</Label>
                <Input
                  id="prop-name"
                  placeholder="e.g. Riverside Apartments"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="h-11"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Property Type</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {PROPERTY_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => update("property_type", type.value)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors min-h-[44px]",
                          form.property_type === type.value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[11px] font-medium">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prop-desc">Description</Label>
                <textarea
                  id="prop-desc"
                  placeholder="Brief description of your property..."
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prop-units">Total Units</Label>
                <Input
                  id="prop-units"
                  type="number"
                  min={1}
                  value={form.total_units}
                  onChange={(e) => update("total_units", Math.max(1, Number(e.target.value)))}
                  className="h-11"
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prop-address">Street Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="prop-address"
                    placeholder="e.g. 123 Main Street"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    className="pl-10 h-11"
                    autoFocus
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="prop-city">City</Label>
                  <Input
                    id="prop-city"
                    placeholder="Budapest"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-zip">Zip / Postal Code</Label>
                  <Input
                    id="prop-zip"
                    placeholder="1051"
                    value={form.zip_code}
                    onChange={(e) => update("zip_code", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="prop-country">Country</Label>
                  <Input
                    id="prop-country"
                    placeholder="Hungary"
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-floor">Floor</Label>
                  <Input
                    id="prop-floor"
                    placeholder="e.g. 3rd"
                    value={form.floor}
                    onChange={(e) => update("floor", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="prop-rooms" className="flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5" /> Rooms
                  </Label>
                  <Input
                    id="prop-rooms"
                    type="number"
                    min={0}
                    placeholder="3"
                    value={form.rooms ?? ""}
                    onChange={(e) => update("rooms", e.target.value ? Number(e.target.value) : null)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-bath" className="flex items-center gap-1.5">
                    <Bath className="w-3.5 h-3.5" /> Bathrooms
                  </Label>
                  <Input
                    id="prop-bath"
                    type="number"
                    min={0}
                    placeholder="1"
                    value={form.bathrooms ?? ""}
                    onChange={(e) => update("bathrooms", e.target.value ? Number(e.target.value) : null)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-size" className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" /> Size (m2)
                  </Label>
                  <Input
                    id="prop-size"
                    type="number"
                    min={0}
                    placeholder="85"
                    value={form.size_sqm ?? ""}
                    onChange={(e) => update("size_sqm", e.target.value ? Number(e.target.value) : null)}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Heating Type
                </Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {HEATING_TYPES.map((h) => (
                    <button
                      key={h.value}
                      type="button"
                      onClick={() => update("heating_type", h.value)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl border text-xs font-medium transition-colors min-h-[44px]",
                        form.heating_type === h.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["active", "vacant", "maintenance"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update("status", s)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl border text-xs font-medium transition-colors min-h-[44px] capitalize",
                        form.status === s
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card text-muted-foreground hover:border-primary/30"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Amenities */}
          {step === 4 && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground mb-1">Select all that apply</p>
              {[
                { key: "parking" as const, label: "Parking", icon: Car },
                { key: "furnished" as const, label: "Furnished", icon: Sofa },
                { key: "pets_allowed" as const, label: "Pets Allowed", icon: PawPrint },
                { key: "elevator" as const, label: "Elevator", icon: ArrowUp },
                { key: "balcony" as const, label: "Balcony / Terrace", icon: Home },
                { key: "garden" as const, label: "Garden", icon: Trees },
                { key: "storage" as const, label: "Storage", icon: Package },
                { key: "utilities_included" as const, label: "Utilities Included", icon: Flame },
              ].map((amenity) => {
                const Icon = amenity.icon;
                const active = form[amenity.key] as boolean;
                return (
                  <button
                    key={amenity.key}
                    type="button"
                    onClick={() => update(amenity.key, !active)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors min-h-[48px]",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                      active ? "bg-primary/10" : "bg-secondary"
                    )}>
                      <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")} />
                    </div>
                    <span className={cn("text-sm font-medium flex-1 text-left", active ? "text-foreground" : "text-muted-foreground")}>
                      {amenity.label}
                    </span>
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                      active ? "border-primary bg-primary" : "border-muted-foreground/30"
                    )}>
                      {active && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 5: Financials */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="prop-rent" className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Monthly Rent
                  </Label>
                  <Input
                    id="prop-rent"
                    type="number"
                    min={0}
                    placeholder="150000"
                    value={form.monthly_rent ?? ""}
                    onChange={(e) => update("monthly_rent", e.target.value ? Number(e.target.value) : null)}
                    className="h-11"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prop-currency">Currency</Label>
                  <select
                    id="prop-currency"
                    value={form.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm text-foreground"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prop-deposit" className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Security Deposit
                </Label>
                <Input
                  id="prop-deposit"
                  type="number"
                  min={0}
                  placeholder="300000"
                  value={form.deposit_amount ?? ""}
                  onChange={(e) => update("deposit_amount", e.target.value ? Number(e.target.value) : null)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prop-notes" className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Notes
                </Label>
                <textarea
                  id="prop-notes"
                  placeholder="Any additional notes about this property..."
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {/* Summary */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summary</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Name</span>
                  <span className="text-foreground font-medium text-right">{form.name || "-"}</span>
                  <span className="text-muted-foreground">Type</span>
                  <span className="text-foreground font-medium text-right capitalize">{form.property_type}</span>
                  <span className="text-muted-foreground">Address</span>
                  <span className="text-foreground font-medium text-right truncate">{form.address || "-"}</span>
                  <span className="text-muted-foreground">Location</span>
                  <span className="text-foreground font-medium text-right">{[form.city, form.country].filter(Boolean).join(", ") || "-"}</span>
                  {form.rooms && <>
                    <span className="text-muted-foreground">Rooms</span>
                    <span className="text-foreground font-medium text-right">{form.rooms}</span>
                  </>}
                  {form.size_sqm && <>
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-foreground font-medium text-right">{form.size_sqm} m2</span>
                  </>}
                  {form.monthly_rent && <>
                    <span className="text-muted-foreground">Rent</span>
                    <span className="text-foreground font-medium text-right">{form.currency} {form.monthly_rent.toLocaleString()}</span>
                  </>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 pt-0">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="h-11 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < STEPS.length ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="h-11"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !canProceed()}
              className="h-11"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              {saving ? "Saving..." : "Save Property"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
