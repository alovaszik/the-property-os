import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-primary px-6 py-16 text-center md:px-16">
          <h2 className="text-balance text-3xl font-bold text-primary-foreground md:text-4xl">
            Ready to simplify property management?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-primary-foreground/80">
            Join thousands of landlords and tenants who are already using
            PropertyOS to make renting easier.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary-foreground px-6 py-3 text-base font-medium text-primary transition-colors hover:bg-primary-foreground/90"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-primary-foreground/30 px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
