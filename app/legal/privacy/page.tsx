import { ArrowRight } from "@/components/icons";

export default function PrivacyPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-8">Privacy Policy</h1>
        <div className="prose prose-sm text-muted-foreground flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Data Collection</h2>
            <p className="leading-relaxed">We collect personal data necessary to provide our services, including your name, email address, country of residence, and payment information. All data is processed in accordance with GDPR regulations.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Data Usage</h2>
            <p className="leading-relaxed">Your data is used solely to provide and improve our property management services. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Storage</h2>
            <p className="leading-relaxed">All data is stored on EU-based servers and encrypted at rest and in transit. We implement industry-standard security measures to protect your information.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Your Rights</h2>
            <p className="leading-relaxed">Under GDPR, you have the right to access, rectify, delete, and port your personal data. You can exercise these rights through your account settings or by contacting our support team.</p>
          </section>
          <p className="text-xs text-muted-foreground mt-8">Last updated: February 2026</p>
        </div>
      </div>
    </main>
  );
}
