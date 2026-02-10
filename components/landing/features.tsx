import {
  CreditCard,
  Wrench,
  MessageSquare,
  FileText,
  Shield,
  BarChart3,
} from "lucide-react"

const features = [
  {
    icon: CreditCard,
    title: "Automated Payments",
    description:
      "Set up recurring rent payments, track payment history, and send automated reminders. No more chasing checks.",
  },
  {
    icon: Wrench,
    title: "Maintenance Requests",
    description:
      "Tenants submit requests with photos. Landlords track, assign, and resolve issues all in one place.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description:
      "Built-in messaging keeps all conversations organized and documented. No more lost emails or texts.",
  },
  {
    icon: FileText,
    title: "Lease Management",
    description:
      "Digital lease signing, automatic renewal reminders, and secure document storage for every unit.",
  },
  {
    icon: Shield,
    title: "Tenant Screening",
    description:
      "Comprehensive background checks, credit reports, and rental history verification in minutes.",
  },
  {
    icon: BarChart3,
    title: "Financial Reports",
    description:
      "Real-time dashboards with income tracking, expense management, and tax-ready financial reports.",
  },
]

export function Features() {
  return (
    <section id="features" className="px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Features
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Everything you need to manage property
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            From rent collection to maintenance tracking, PropertyOS gives
            landlords and tenants the tools they need.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
