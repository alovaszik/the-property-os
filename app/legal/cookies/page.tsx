import { ArrowRight } from "@/components/icons";

export default function CookiesPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-8">Cookie Policy</h1>
        <div className="prose prose-sm text-muted-foreground flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">What Are Cookies</h2>
            <p className="leading-relaxed">Cookies are small text files stored on your device when you visit our website. They help us provide a better user experience and understand how our platform is used.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Essential Cookies</h2>
            <p className="leading-relaxed">These cookies are required for the platform to function. They include authentication cookies and session management. They cannot be disabled.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Analytics Cookies</h2>
            <p className="leading-relaxed">We use analytics cookies to understand how visitors interact with our platform. This data helps us improve our services. You can opt out of analytics cookies in your browser settings.</p>
          </section>
          <p className="text-xs text-muted-foreground mt-8">Last updated: February 2026</p>
        </div>
      </div>
    </main>
  );
}
