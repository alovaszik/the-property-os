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
  occupancy,
  monthlyRent,
  currency = "EUR",
  rooms,
  sizeSqm,
  propertyType,
  status,
}: PropertyCardProps) {
  return (
    <Link
      href={`/landlord/properties/${id}`}
      className="flex flex-col gap-4 p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors no-underline group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground font-display">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3" />
              {city ? `${address}, ${city}` : address}
            </div>
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 capitalize",
            status === "active" &&
              "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
            status === "maintenance" &&
              "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))]",
            status === "vacant" &&
              "bg-destructive/10 text-destructive",
            status === "inactive" && "bg-muted text-muted-foreground"
          )}
        >
          {status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-muted/50">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Units
          </span>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {units}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-muted/50">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            {rooms != null ? "Rooms" : sizeSqm != null ? "Size" : "Type"}
          </span>
          <div className="flex items-center gap-1.5">
            {rooms != null ? (
              <>
                <BedDouble className="w-3 h-3 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {rooms}
                </span>
              </>
            ) : sizeSqm != null ? (
              <>
                <Maximize2 className="w-3 h-3 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {sizeSqm}m2
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-foreground capitalize">
                {propertyType || "N/A"}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 p-2.5 rounded-lg bg-muted/50">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Rent
          </span>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              {monthlyRent ? `${Number(monthlyRent).toLocaleString()}` : "--"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <span className="text-xs font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
          View Details
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
