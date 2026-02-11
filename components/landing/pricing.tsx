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
    <section id="pricing" className="relative px-5 py-20 lg:px-12 lg:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight text-balance">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
            Start for free, upgrade when you need more. No hidden fees, cancel
            anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col p-6 lg:p-8 rounded-2xl border transition-all duration-300 ${
                plan.highlighted
                  ? "bg-card border-primary/40 shadow-[0_0_40px_rgba(67,97,238,0.12)]"
                  : "bg-card border-border hover:border-primary/20"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-foreground tracking-tight">
                  {"$"}{plan.price}
                </span>
                <span className="text-sm text-muted-foreground">
                  {plan.period}
                </span>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        plan.highlighted
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-full transition-all active:scale-[0.98] min-h-[48px] no-underline ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_20px_rgba(67,97,238,0.2)]"
                    : "bg-secondary text-foreground hover:bg-accent"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
