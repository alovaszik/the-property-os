"use client";

import { cn } from "@/lib/utils";
import { Bell, Shield, CreditCard, Users, ChevronRight } from "@/components/icons";

const settingsGroups = [
  {
    title: "Account",
    items: [
      { icon: Users, label: "Profile Information", desc: "Name, email, phone number" },
      { icon: Shield, label: "Security", desc: "Password, 2FA, login activity" },
      { icon: Bell, label: "Notifications", desc: "Email, push, SMS preferences" },
    ],
  },
  {
    title: "Billing",
    items: [
      { icon: CreditCard, label: "Payment Methods", desc: "Bank accounts, cards" },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="px-4 py-6 lg:px-8 lg:py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <div className="flex flex-col gap-8">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">{group.title}</h2>
            <div className="flex flex-col rounded-2xl bg-card border border-border overflow-hidden">
              {group.items.map((item, idx) => (
                <button key={item.label} className={cn( "flex items-center gap-4 p-4 text-left hover:bg-secondary/50 transition-colors min-h-[56px]", idx < group.items.length - 1 && "border-b border-border" )}>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
