import { Check, ArrowRight } from "@/components/icons";

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "/month",
    description: "For individual landlords getting started.",
    features: [
      "Up to 3 properties",
      "Basic tenant management",
      "Payment tracking",
      "Email notifications",
      "Community support",
    ],
    cta: "Start Free",
    href: "/auth/register",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "19",
    period: "/month",
    description: "For growing portfolios and serious landlords.",
    features: [
      "Unlimited properties",
      "Automated rent collection",
      "Overhead statements",
      "Document management",
      "Unified chat & activity feed",
      "Priority support",
      "RentDuo Points rewards",
    ],
    cta: "Get Professional",
    href: "/auth/register",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "49",
    period: "/month",
    description: "For property management companies.",
    features: [
      "Everything in Professional",
      "Multi-user team access",
      "Custom branding",
      "API access",
      "Advanced analytics",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    href: "/auth/register",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative px-5 py-20 lg:px-10 lg:py-28 bg-card">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Pricing
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground text-balance font-serif">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Start for free, upgrade when you need more. No hidden fees, cancel
            anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-5 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-6 lg:p-7 rounded-xl border transition-shadow ${
                plan.highlighted
                  ? "bg-background border-primary/30 shadow-elevated"
                  : "bg-background border-border shadow-card hover:shadow-card-hover"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-foreground text-background text-2xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-base font-semibold text-foreground font-serif">
                  {plan.name}
                </h3>
                <p className="text-[13px] text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-0.5 mb-6">
                <span className="text-3xl font-bold text-foreground font-serif">
                  {"$"}{plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        plan.highlighted
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-[13px] text-foreground leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg transition-all active:scale-[0.98] min-h-[44px] no-underline ${
                  plan.highlighted
                    ? "bg-foreground text-background hover:opacity-90"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
