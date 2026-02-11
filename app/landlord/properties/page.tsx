"use client";

import { PropertyCard } from "@/components/dashboard/property-card";
import { AddPropertyModal } from "@/components/dashboard/add-property-modal";
import { Plus, Search, Filter, Building2 } from "@/components/icons";
import { useState } from "react";
import { useProperties } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function PropertiesPage() {
  const { data: properties, isLoading, mutate } = useProperties();
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  if (isLoading) return <PageSkeleton />;

  const props = (properties ?? []) as Array<Record<string, any>>;

  const filtered = props.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.address?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: props.length,
    active: props.filter((p) => p.status === "active").length,
    vacant: props.filter((p) => p.status === "vacant").length,
    maintenance: props.filter((p) => p.status === "maintenance").length,
  };

  return (
    <div className="px-4 py-6 lg:px-6 lg:py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold font-serif text-foreground tracking-tight">Properties</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {props.length} {props.length === 1 ? "property" : "properties"} in your portfolio
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium min-h-[36px] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Property</span>
        </button>
      </div>

      {/* Stats */}
      {props.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Active", value: stats.active, color: "text-green-600 dark:text-green-400" },
            { label: "Vacant", value: stats.vacant, color: "text-red-600 dark:text-red-400" },
            { label: "Maintenance", value: stats.maintenance, color: "text-amber-600 dark:text-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1 p-3 rounded-lg bg-card border border-border">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <span className={`text-xl font-bold ${stat.color}`}>{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search + filter */}
      {props.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg min-h-[36px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-card border border-border text-sm text-foreground min-w-[100px]"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="vacant">Vacant</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      )}

      {/* Property grid */}
      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              name={property.name}
              address={property.address}
              city={property.city}
              units={property.total_units ?? 1}
              occupancy={0}
              monthlyRent={property.monthly_rent}
              currency={property.currency}
              rooms={property.rooms}
              sizeSqm={property.size_sqm}
              propertyType={property.property_type}
              status={property.status ?? "active"}
            />
          ))}
        </div>
      ) : props.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first property to start managing tenants and collecting rent."
          action={{ label: "Add Property", onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">No properties found matching your search.</p>
        </div>
      )}

      {/* Add Property Modal */}
      <AddPropertyModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
