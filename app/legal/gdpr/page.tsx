import { ArrowRight } from "@/components/icons";

export default function GDPRPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-8">GDPR Compliance</h1>
        <div className="prose prose-sm text-muted-foreground flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Our Commitment</h2>
            <p className="leading-relaxed">RentDuo is fully committed to the General Data Protection Regulation (GDPR). We process personal data lawfully, fairly, and transparently. Data is collected for specified, explicit, and legitimate purposes only.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Data Protection Officer</h2>
            <p className="leading-relaxed">For any GDPR-related inquiries, please contact our Data Protection Officer at privacy@rentduo.eu.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Data Subject Rights</h2>
            <p className="leading-relaxed">You have the right to: access your data, rectify inaccuracies, erase your data, restrict processing, data portability, and object to processing. Requests are processed within 30 days.</p>
          </section>
          <p className="text-xs text-muted-foreground mt-8">Last updated: February 2026</p>
        </div>
      </div>
    </main>
  );
}
