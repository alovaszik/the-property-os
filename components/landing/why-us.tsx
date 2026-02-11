import type React from "react";
import {
  Shield,
  CreditCard,
  MessageSquare,
  FileText,
  Bell,
  Globe,
} from "@/components/icons";

const reasons = [
  {
    icon: Shield,
    title: "Built for European Regulations",
    description:
      "Fully compliant with GDPR and local tenancy laws across 30+ EU countries. Your data stays safe and legal.",
  },
  {
    icon: CreditCard,
    title: "Automated Payments",
    description:
      "Set up recurring rent collection with automatic reminders. Support for all European currencies.",
  },
  {
    icon: MessageSquare,
    title: "Unified Communication",
    description:
      "Payments, messages, and maintenance tickets in one timeline. Every interaction in one place.",
  },
  {
    icon: FileText,
    title: "Digital Documents",
    description:
      "Leases, overhead statements, and invoices stored securely. Generate, sign, and share without leaving the app.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated alerts for payment due dates, lease renewals, and maintenance updates. Never miss a deadline.",
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    description:
      "Available in every major European language. Each user sets their own language and currency preference.",
  },
];

function ReasonCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-5 lg:p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-[18px] h-[18px] text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground font-serif">
          {title}
        </h3>
        <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function WhyUs() {
  return (
    <section id="why" className="relative px-5 py-20 lg:px-10 lg:py-28">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Why RentDuo
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground text-balance font-serif">
            Everything you need in
            <br className="hidden md:block" />
            one platform
          </h2>
          <p className="mt-4 text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            We built RentDuo to eliminate the chaos of managing properties with
            spreadsheets, emails, and phone calls.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map((reason) => (
            <ReasonCard key={reason.title} {...reason} />
          ))}
        </div>
      </div>
    </section>
  );
}
