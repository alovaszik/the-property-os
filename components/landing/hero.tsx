import { ArrowRight, Shield } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-3.5 lg:px-10 max-w-7xl mx-auto">
        <a href="/" className="flex items-center gap-2 no-underline">
          <img
            src="/logo.jpeg"
            alt="RentDuo logo"
            width={28}
            height={28}
            className="rounded-md"
            loading="eager"
          />
          <span className="text-sm font-semibold text-foreground tracking-tight font-serif">
            RentDuo
          </span>
        </a>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <a
            href="/auth/login"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[36px]"
          >
            Sign In
          </a>
          <a
            href="/auth/register"
            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity min-h-[36px] no-underline"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 px-5 pt-20 pb-24 lg:px-10 lg:pt-32 lg:pb-36 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
          <Shield className="w-3.5 h-3.5" />
          <span>Property Management, Reinvented</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance leading-[1.08] font-serif">
          The smartest way to
          <br />
          manage your{" "}
          <span className="text-primary">property</span>
        </h1>

        <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed text-pretty">
          One platform for landlords and tenants across Europe. Leases,
          payments, documents, and communication -- unified in a single
          experience.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <a
            href="/auth/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 active:scale-[0.98] transition-all min-h-[44px] no-underline"
          >
            Get Started Free
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="#why"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-foreground border border-border rounded-md hover:bg-muted active:scale-[0.98] transition-all min-h-[44px] no-underline"
          >
            Learn More
          </a>
        </div>

        {/* Trust metrics */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {[
            "12K+ Properties",
            "98% On-time Payments",
            "30+ EU Countries",
            "24/7 Support",
          ].map((stat) => (
            <span
              key={stat}
              className="text-xs text-muted-foreground font-medium"
            >
              {stat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
