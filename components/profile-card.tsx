"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Star, Shield, Award } from "@/components/icons";
import type { UserProfile, UserRole } from "@/types/user";
import { roleBadges } from "@/types/user";

interface ProfileCardProps {
  user: UserProfile;
  showPoints?: boolean;
  compact?: boolean;
}

export function ProfileCard({ user, showPoints = true, compact = false }: ProfileCardProps) {
  const badge = roleBadges[user.role];
  const pointsLevel = Math.floor(user.points / 100);

  return (
    <Card className={cn("overflow-hidden", compact ? "p-4" : "p-6")}>
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </div>
          {user.role === "owner" && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-sm border-2 border-card">
              👑
            </div>
          )}
          {user.role === "manager" && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-sm border-2 border-card">
              ⭐
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {user.name}
            </h3>
            <Badge
              className={cn(
                "border",
                badge.color,
                badge.bgColor,
                badge.borderColor,
                user.role === "owner" && "animate-pulse"
              )}
              variant="outline"
            >
              {badge.icon && <span className="mr-1">{badge.icon}</span>}
              {badge.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          
          {!compact && (
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>🌍 {user.country}</span>
              <span>💰 {user.currency}</span>
              <span>🗣️ {user.language.toUpperCase()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Points Section */}
      {showPoints && (
        <div className={cn("border-t border-border pt-4", compact ? "mt-4" : "mt-6")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                RentDuo Points
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {user.points}
              </span>
              {pointsLevel > 0 && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(pointsLevel, 5) }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-500 fill-amber-500"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {pointsLevel > 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-right">
              Level {pointsLevel} • {100 - (user.points % 100)} points to next level
            </p>
          )}
        </div>
      )}

      {/* Restrictions Notice */}
      {!compact && (
        <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your real name and country are verified and cannot be changed. Contact support if you need to update these details.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
