import React from "react"
import { cn } from "@/lib/utils";
import { TrendingUp } from "@/components/icons";

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
}

export function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          {label}
        </span>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div>
        <span className="text-2xl font-bold text-foreground tracking-tight">
          {value}
        </span>
        {change && (
          <span
            className={cn(
              "ml-2 text-xs font-medium",
              changeType === "positive" && "text-green-600 dark:text-green-400",
              changeType === "negative" && "text-red-600 dark:text-red-400",
              changeType === "neutral" && "text-muted-foreground"
            )}
          >
            {change}
          </span>
        )}
      </div>
    </div>
  );
}
