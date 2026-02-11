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
      "Set up recurring rent collection with automatic reminders. Support for all European currencies — EUR, GBP, CHF, and more.",
  },
  {
    icon: MessageSquare,
    title: "Unified Communication",
    description:
      "Payments, messages, and maintenance tickets in one timeline. Every interaction between landlord and tenant, in one place.",
  },
  {
    icon: FileText,
    title: "Digital Documents",
    description:
      "Leases, overhead statements, and invoices stored securely. Generate, sign, and share documents without leaving the app.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Never miss a deadline. Automated alerts for payment due dates, lease renewals, and maintenance updates.",
  },
  {
    icon: Globe,
    title: "Multi-language Support",
    description:
      "Available in every major European language. Each user can set their own language and currency preference.",
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
    <div className="group relative flex flex-col gap-4 p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300">
      {/* Subtle glow on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_32px_rgba(67,97,238,0.08)]"
      />
      <div className="relative z-10 flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="relative z-10">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function WhyUs() {
  return (
    <section id="why" className="relative px-5 py-20 lg:px-12 lg:py-28">
      {/* Subtle glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]"
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Why RentDuo
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight text-balance">
            Everything you need in
            <br className="hidden md:block" />
            one platform
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
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
