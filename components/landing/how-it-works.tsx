import { UserPlus, Building2, Handshake } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    description:
      "Sign up as a landlord or tenant in seconds. Set up your profile and get started immediately.",
  },
  {
    icon: Building2,
    step: "02",
    title: "Add Your Property",
    description:
      "Landlords list their properties with details, photos, and lease terms. Tenants connect to their unit.",
  },
  {
    icon: Handshake,
    step: "03",
    title: "Start Managing",
    description:
      "Pay rent, submit maintenance requests, communicate directly, and keep everything organized in one place.",
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-secondary px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How It Works
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Get started in three simple steps
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.step} className="relative flex flex-col items-center text-center">
              {i < steps.length - 1 && (
                <div className="absolute left-1/2 top-10 hidden h-px w-full bg-border md:block" />
              )}
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <step.icon className="h-8 w-8" />
              </div>
              <span className="mt-4 font-mono text-sm font-bold text-primary">
                Step {step.step}
              </span>
              <h3 className="mt-2 text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
