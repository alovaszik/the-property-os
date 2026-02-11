"use client";

import { cn } from "@/lib/utils";
import {
  MapPin,
  Users,
  DollarSign,
  Building2,
  BedDouble,
  Maximize2,
  ChevronRight,
} from "@/components/icons";
import Link from "next/link";

interface PropertyCardProps {
  id: string;
  name: string;
  address: string;
  city?: string;
  units: number;
  occupancy: number;
  monthlyRent?: number | null;
  currency?: string;
  rooms?: number | null;
  sizeSqm?: number | null;
  propertyType?: string;
  status: "active" | "maintenance" | "vacant" | "inactive";
}

export function PropertyCard({
  id,
  name,
  address,
  city,
  units,
  monthlyRent,
  rooms,
  sizeSqm,
  propertyType,
  status,
}: PropertyCardProps) {
  return (
    <Link
      href={`/landlord/properties/${id}`}
      className="flex flex-col gap-3 p-4 lg:p-5 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow no-underline group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground font-serif truncate">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {city ? `${address}, ${city}` : address}
              </span>
            </div>
          </div>
        </div>
        <span
          className={cn(
            "text-2xs font-semibold px-2 py-0.5 rounded-md shrink-0 capitalize",
            status === "active" && "bg-success/10 text-success",
            status === "maintenance" && "bg-warning/10 text-warning",
            status === "vacant" && "bg-destructive/10 text-destructive",
            status === "inactive" && "bg-muted text-muted-foreground"
          )}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "Units",
            icon: Users,
            value: String(units),
          },
          {
            label: rooms != null ? "Rooms" : sizeSqm != null ? "Size" : "Type",
            icon: rooms != null ? BedDouble : Maximize2,
            value:
              rooms != null
                ? String(rooms)
                : sizeSqm != null
                  ? `${sizeSqm}m2`
                  : propertyType || "N/A",
          },
          {
            label: "Rent",
            icon: DollarSign,
            value: monthlyRent
              ? `${Number(monthlyRent).toLocaleString()}`
              : "--",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-0.5 p-2.5 rounded-lg bg-muted/50"
          >
            <span className="text-2xs text-muted-foreground font-medium uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="flex items-center gap-1">
              <stat.icon className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold text-foreground">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end pt-1">
        <span className="text-xs font-medium text-primary flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
          View Details
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
