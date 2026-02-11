"use client";

import { useEffect, useState } from "react";
import { UserPlus, Rocket, Coins, ArrowRight, Check } from "@/components/icons";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: UserPlus,
    label: "Register",
    title: "Create your free account",
    description: "Sign up in seconds. No credit card required, no trial limits. Your dashboard is ready instantly.",
  },
  {
    icon: Rocket,
    label: "Use",
    title: "Manage everything in one place",
    description: "Add properties, invite tenants, track payments, handle documents. All tools included from day one.",
  },
  {
    icon: Coins,
    label: "Pay when you earn",
    title: "We only win when you do",
    description: "Small transaction fee only on rent collected through the platform. No monthly subscription, no hidden costs.",
  },
];

const included = [
  "Unlimited properties",
  "Unlimited tenants",
  "Wallet & payouts",
  "Document management",
  "Maintenance requests",
  "Activity feed & chat",
  "GDPR compliant",
  "EU-wide support",
];

export function Pricing() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 4000;
    const interval = 40;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);
      if (elapsed >= duration) {
        setActiveStep((prev) => (prev + 1) % steps.length);
        elapsed = 0;
        setProgress(0);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [activeStep]);

  const ActiveIcon = steps[activeStep].icon;

  return (
    <section id="pricing" className="relative px-5 py-20 lg:px-10 lg:py-28">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Pricing
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground text-balance">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground text-sm max-w-lg mx-auto leading-relaxed">
            RentDuo is free to use. We only charge a small fee on rent collected through the platform. No subscriptions, no hidden costs.
          </p>
        </div>

        {/* 3-step compact stepper with animation */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-center mb-16">
          {/* Left: step selector */}
          <div className="flex flex-col gap-1">
            {steps.map((step, i) => (
              <button
                key={step.label}
                type="button"
                onClick={() => { setActiveStep(i); setProgress(0); }}
                className={cn(
                  "relative flex items-start gap-4 p-4 rounded-xl text-left transition-all",
                  activeStep === i
                    ? "bg-card border border-border shadow-card"
                    : "hover:bg-card/50"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors",
                    activeStep === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  <step.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground">
                      Step {i + 1}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold transition-colors",
                        activeStep === i ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {activeStep === i && (
                    <p className="text-[13px] text-muted-foreground leading-relaxed mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {step.description}
                    </p>
                  )}
                </div>
                {/* Progress bar for active step */}
                {activeStep === i && (
                  <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-none"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Right: animated preview card */}
          <div className="bg-card border border-border rounded-xl shadow-card p-8 flex flex-col items-center justify-center text-center min-h-[280px]">
            <div
              key={activeStep}
              className="animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <ActiveIcon className="w-7 h-7 text-primary" />
              </div>
              <span className="text-2xs font-bold uppercase tracking-wider text-primary mb-2">
                Step {activeStep + 1}
              </span>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {steps[activeStep].title}
              </h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xs">
                {steps[activeStep].description}
              </p>
            </div>
          </div>
        </div>

        {/* Everything included */}
        <div className="bg-card border border-border rounded-xl shadow-card p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-foreground">Everything included. Always.</h3>
              <p className="text-[13px] text-muted-foreground mt-1">No feature gates. No upgrade nags. Just use it.</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">$0</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[13px] text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center gap-3">
            <a
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity active:scale-[0.98] min-h-[44px] no-underline"
            >
              Get started for free
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <span className="text-2xs text-muted-foreground">No credit card required</span>
          </div>
        </div>
      </div>
    </section>
  );
}
