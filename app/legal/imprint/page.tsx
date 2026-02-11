import { ArrowRight } from "@/components/icons";

export default function ImprintPage() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-5 py-4 lg:px-12 lg:py-5 max-w-7xl mx-auto">
        <a href="/" className="flex items-center gap-3 no-underline">
          <img src="/logo.jpeg" alt="RentDuo logo" width={36} height={36} className="rounded-full" />
          <span className="text-lg font-semibold text-foreground tracking-tight">RentDuo</span>
        </a>
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline min-h-[44px]">
          Back to Home <ArrowRight className="w-4 h-4" />
        </a>
      </nav>
      <div className="max-w-3xl mx-auto px-5 py-12 lg:py-20">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-8">Imprint</h1>
        <div className="prose prose-sm text-muted-foreground flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Company Information</h2>
            <p className="leading-relaxed">
              RentDuo GmbH<br />
              Musterstrasse 1<br />
              10115 Berlin, Germany
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
            <p className="leading-relaxed">
              Email: contact@rentduo.eu<br />
              Phone: +49 30 123456789
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Registration</h2>
            <p className="leading-relaxed">
              Commercial Register: Amtsgericht Berlin-Charlottenburg<br />
              Registration Number: HRB 000000<br />
              VAT ID: DE000000000
            </p>
          </section>
          <p className="text-xs text-muted-foreground mt-8">Last updated: February 2026</p>
        </div>
      </div>
    </main>
  );
}
