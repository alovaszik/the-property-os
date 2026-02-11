"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { PropertyCard } from "@/components/dashboard/property-card";
import {
  Building2,
  Users,
  CreditCard,
  Wrench,
  Plus,
} from "@/components/icons";
import { useLandlordStats, useProperties } from "@/lib/supabase/hooks";
import { PageSkeleton } from "@/components/dashboard/page-skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";

export default function LandlordDashboard() {
  const { data: stats, isLoading: statsLoading } = useLandlordStats();
  const { data: properties, isLoading: propsLoading } = useProperties();

  if (statsLoading || propsLoading) return <PageSkeleton />;

  const s = stats ?? {
    properties: 0,
    tenants: 0,
    revenue: 0,
    pendingPayments: 0,
    occupancy: 0,
    maintenanceOpen: 0,
  };
  const props = properties ?? [];

  const formatCurrency = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
  };

  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground font-serif">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Here is what is happening across your properties.
          </p>
        </div>
        <a
          href="/landlord/properties"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Property
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
        <StatCard
          label="Properties"
          value={String(s.properties)}
          change={`${s.properties} total`}
          changeType="neutral"
          icon={Building2}
        />
        <StatCard
          label="Tenants"
          value={String(s.tenants)}
          change="Active leases"
          changeType="neutral"
          icon={Users}
        />
        <StatCard
          label="Revenue"
          value={formatCurrency(s.revenue)}
          change="This month"
          changeType="positive"
          icon={CreditCard}
        />
        <StatCard
          label="Open Tickets"
          value={String(s.maintenanceOpen)}
          change={
            s.maintenanceOpen > 0 ? "Needs attention" : "All resolved"
          }
          changeType={s.maintenanceOpen > 0 ? "negative" : "positive"}
          icon={Wrench}
        />
      </div>

      {/* Mobile add property button */}
      <a
        href="/landlord/properties"
        className="flex sm:hidden items-center justify-center gap-2 w-full px-4 py-3 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity mb-8"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Property
      </a>

      {props.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-4 font-serif">
            Your Properties
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {props
              .slice(0, 6)
              .map(
                (property: Record<string, string | number>) => (
                  <PropertyCard
                    key={property.id as string}
                    id={property.id as string}
                    name={property.name as string}
                    address={property.address as string}
                    units={property.total_units as number}
                    occupancy={0}
                    monthlyRent={property.monthly_rent as number | null}
                    status={
                      property.status as
                        | "active"
                        | "maintenance"
                        | "vacant"
                    }
                  />
                )
              )}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No properties yet"
          description="Add your first property to start managing tenants and collecting rent."
        />
      )}
    </div>
  );
}
