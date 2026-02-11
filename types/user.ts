export type UserRole = "tenant" | "landlord" | "support" | "manager" | "owner";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  country: string;
  currency: string;
  language: string;
  points: number;
  avatar?: string;
  joinedAt: Date;
  // Fields that cannot be changed by user (only support)
  readonly realName?: string;
  readonly verifiedCountry?: string;
}

export interface RoleBadge {
  role: UserRole;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon?: string;
}

export const roleBadges: Record<UserRole, RoleBadge> = {
  tenant: {
    role: "tenant",
    label: "Tenant",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  landlord: {
    role: "landlord",
    label: "Landlord",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-indigo-200 dark:border-indigo-800",
  },
  support: {
    role: "support",
    label: "Support Team",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
  },
  manager: {
    role: "manager",
    label: "Support Manager",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-purple-200 dark:border-purple-800",
    icon: "⭐",
  },
  owner: {
    role: "owner",
    label: "Owner",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
    borderColor: "border-amber-300 dark:border-amber-700",
    icon: "👑",
  },
};

export interface PointsActivity {
  id: string;
  type: "earned" | "spent";
  points: number;
  reason: string;
  date: Date;
}

export const pointsReasons = {
  onTimePayment: { points: 10, label: "On-time rent payment" },
  earlyPayment: { points: 15, label: "Early payment" },
  goodReview: { points: 25, label: "Positive review from landlord" },
  propertyMaintained: { points: 20, label: "Well-maintained property" },
  quickResponse: { points: 5, label: "Quick response time" },
  longTerm: { points: 50, label: "Long-term tenant (1 year)" },
  referral: { points: 30, label: "Successful referral" },
  profileComplete: { points: 10, label: "Complete profile" },
};
