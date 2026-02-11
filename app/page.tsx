import { Hero } from "@/components/landing/hero";
import { WhyUs } from "@/components/landing/why-us";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <WhyUs />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
