import { cn } from "@/lib/utils";
import {
  CreditCard,
  MessageSquare,
  Bug,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "@/components/icons";

export interface ActivityItem {
  id: string;
  type: "payment" | "message" | "ticket" | "system";
  title: string;
  description: string;
  time: string;
  status?: "success" | "warning" | "pending";
}

const iconMap = {
  payment: CreditCard,
  message: MessageSquare,
  ticket: Bug,
  system: CheckCircle2,
};

const statusIconMap = {
  success: CheckCircle2,
  warning: AlertCircle,
  pending: Clock,
};

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <div className="flex flex-col gap-3 p-5 lg:p-6 rounded-xl bg-card border border-border shadow-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground font-serif">
          Recent Activity
        </h3>
        <button className="text-xs font-medium text-primary hover:underline min-h-[44px] flex items-center">
          View All
        </button>
      </div>

      <div className="flex flex-col">
        {items.map((item, idx) => {
          const Icon = iconMap[item.type];
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 py-3",
                idx < items.length - 1 && "border-b border-border"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  item.type === "payment" && "bg-success/10",
                  item.type === "message" && "bg-primary/10",
                  item.type === "ticket" && "bg-warning/10",
                  item.type === "system" && "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    item.type === "payment" && "text-success",
                    item.type === "message" && "text-primary",
                    item.type === "ticket" && "text-warning",
                    item.type === "system" && "text-muted-foreground"
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
              <span className="text-2xs text-muted-foreground font-medium shrink-0 mt-1">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
