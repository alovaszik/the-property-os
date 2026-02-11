import { ArrowRight, Shield } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle glow backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]"
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 lg:px-12 lg:py-5 max-w-7xl mx-auto">
        <a href="/" className="flex items-center gap-3 no-underline">
          <img
            src="/logo.jpeg"
            alt="RentDuo logo"
            width={36}
            height={36}
            className="rounded-full"
            loading="eager"
          />
          <span className="text-lg font-semibold text-foreground tracking-tight">
            RentDuo
          </span>
        </a>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/auth/login"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
          >
            Sign In
          </a>
          <a
            href="/auth/register"
            className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity min-h-[44px] no-underline"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 px-5 pt-16 pb-20 lg:px-12 lg:pt-28 lg:pb-32 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-8">
          <Shield className="w-4 h-4" />
          <span>Property Management, Reinvented</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground text-balance leading-[1.1]">
          The smartest way to
          <br />
          manage your{" "}
          <span className="text-primary">property</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
          One platform for landlords and tenants across Europe. Leases,
          payments, documents, and communication — unified in a single,
          beautiful experience.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <a
            href="/auth/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 active:scale-[0.98] transition-all min-h-[52px] no-underline shadow-[0_0_24px_rgba(67,97,238,0.25)]"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#why"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-medium text-foreground border border-border rounded-full hover:bg-secondary active:scale-[0.98] transition-all min-h-[52px] no-underline"
          >
            Learn More
          </a>
        </div>

        {/* Trust bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            "12K+ Properties",
            "98% On-time Payments",
            "30+ EU Countries",
            "24/7 Support",
          ].map((stat) => (
            <span
              key={stat}
              className="text-sm text-muted-foreground font-medium"
            >
              {stat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
