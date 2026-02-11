import { ArrowRight } from "@/components/icons";

export default function TermsPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-8">Terms of Service</h1>
        <div className="prose prose-sm text-muted-foreground flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">By accessing and using RentDuo, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h2>
            <p className="leading-relaxed">RentDuo provides a property management platform connecting landlords and tenants across Europe. Our services include lease management, payment processing, document storage, and communication tools.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. User Accounts</h2>
            <p className="leading-relaxed">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information during registration.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Acceptable Use</h2>
            <p className="leading-relaxed">You agree not to misuse our services, including but not limited to: violating any laws, infringing on intellectual property rights, or attempting to gain unauthorized access to our systems.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Limitation of Liability</h2>
            <p className="leading-relaxed">RentDuo shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our platform. Our total liability shall not exceed the amount paid by you in the twelve months preceding the claim.</p>
          </section>
          <p className="text-xs text-muted-foreground mt-8">Last updated: February 2026</p>
        </div>
      </div>
    </main>
  );
}
