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
    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
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
                  "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                  item.type === "payment" &&
                    "bg-green-100 dark:bg-green-900/30",
                  item.type === "message" &&
                    "bg-primary/10",
                  item.type === "ticket" &&
                    "bg-amber-100 dark:bg-amber-900/30",
                  item.type === "system" &&
                    "bg-secondary"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    item.type === "payment" &&
                      "text-green-600 dark:text-green-400",
                    item.type === "message" && "text-primary",
                    item.type === "ticket" &&
                      "text-amber-600 dark:text-amber-400",
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
              <span className="text-[10px] text-muted-foreground font-medium shrink-0 mt-1">
                {item.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
