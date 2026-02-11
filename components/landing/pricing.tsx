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
    <section id="pricing" className="relative px-5 py-20 lg:px-10 lg:py-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-2">
            Pricing
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground tracking-tight text-balance font-serif">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Start for free, upgrade when you need more. No hidden fees, cancel
            anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-5 lg:p-6 rounded-lg border transition-colors ${
                plan.highlighted
                  ? "bg-card border-primary/40"
                  : "bg-card border-border hover:border-primary/20"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-primary text-primary-foreground text-2xs font-semibold rounded-md">
                  Most Popular
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-base font-semibold text-foreground font-serif">
                  {plan.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-0.5 mb-5">
                <span className="text-3xl font-bold text-foreground tracking-tight font-serif">
                  {"$"}{plan.price}
                </span>
                <span className="text-xs text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              <ul className="flex flex-col gap-2 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                        plan.highlighted
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-xs text-foreground leading-relaxed">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-md transition-all active:scale-[0.98] min-h-[40px] no-underline ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
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
