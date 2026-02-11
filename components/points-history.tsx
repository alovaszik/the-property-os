"use client";

import { Card } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Award } from "@/components/icons";
import type { PointsActivity } from "@/types/user";

interface PointsHistoryProps {
  activities: PointsActivity[];
}

export function PointsHistory({ activities }: PointsHistoryProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Points History
        </h3>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Award className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No points activity yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start earning points by making on-time payments!
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  activity.type === "earned"
                    ? "bg-green-100 dark:bg-green-950/30"
                    : "bg-red-100 dark:bg-red-950/30"
                }`}
              >
                {activity.type === "earned" ? (
                  <ArrowUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.reason}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(activity.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div
                className={`text-base font-bold shrink-0 ${
                  activity.type === "earned"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {activity.type === "earned" ? "+" : "-"}
                {activity.points}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
