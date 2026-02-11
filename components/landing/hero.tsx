import { ArrowRight, Shield } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";

export function Hero() {
  return (
    <section className="relative">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-5 py-4 lg:px-10 max-w-7xl mx-auto">
        <a href="/" className="flex items-center gap-2.5 no-underline">
          <img
            src="/logo.jpeg"
            alt="RentDuo logo"
            width={30}
            height={30}
            className="rounded-lg"
            loading="eager"
          />
          <span className="text-sm font-bold text-foreground font-serif">
            RentDuo
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Features", href: "#why" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="/auth/login"
            className="inline-flex items-center px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[36px]"
          >
            Sign In
          </a>
          <a
            href="/auth/register"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity min-h-[36px] no-underline"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 px-5 pt-24 pb-28 lg:px-10 lg:pt-36 lg:pb-40 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card text-foreground text-xs font-medium mb-8 shadow-card">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>Property Management, Reinvented</span>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-foreground text-balance leading-[1.1] font-serif">
          The smartest way to
          <br className="hidden sm:block" />
          manage your property
        </h1>

        <p className="mt-6 text-base lg:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed text-pretty">
          One platform for landlords and tenants across Europe. Leases,
          payments, documents, and communication -- unified.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
          <a
            href="/auth/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold bg-foreground text-background rounded-lg hover:opacity-90 active:scale-[0.98] transition-all min-h-[48px] no-underline"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#why"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold text-foreground bg-card border border-border rounded-lg shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all min-h-[48px] no-underline"
          >
            Learn More
          </a>
        </div>

        {/* Social proof strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
          {[
            "12K+ Properties",
            "98% On-time Payments",
            "30+ EU Countries",
            "24/7 Support",
          ].map((stat, i) => (
            <span key={stat} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium tracking-wide">
                {stat}
              </span>
              {i < 3 && (
                <span className="w-1 h-1 rounded-full bg-border" />
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
