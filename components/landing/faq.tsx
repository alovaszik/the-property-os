"use client";

import { useState } from "react";
import { ChevronDown, LifeBuoy } from "@/components/icons";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is RentDuo really free?",
    answer:
      "Yes. There is no monthly subscription. You get unlimited properties, tenants, and all features from day one. We only charge a small percentage fee on rent payments collected through the platform. If you don't collect rent through us, you pay nothing.",
  },
  {
    question: "Which countries does RentDuo support?",
    answer:
      "RentDuo supports all 30+ EU and EEA countries including Germany, France, Spain, Italy, Netherlands, Austria, Hungary, and more. Each country has localized currency, language, and legal regulation support.",
  },
  {
    question: "How do payments and payouts work?",
    answer:
      "Tenants deposit funds into their RentDuo wallet and pay rent from there. Landlords receive payments instantly in their wallet balance and can withdraw to their linked bank account at any time, or enable automatic payouts.",
  },
  {
    question: "What about security deposits?",
    answer:
      "Security deposits are locked in the platform and held securely until the tenancy contract ends. Neither party can touch the funds during the lease. Upon contract end, the landlord can release the full deposit or deduct for damages with a documented reason.",
  },
  {
    question: "Can tenants request money for repairs?",
    answer:
      "Yes. Tenants can submit maintenance requests with a cost estimate directly from their wallet. The landlord reviews and can approve or reject the request. Approved amounts are transferred from the landlord's balance to the tenant.",
  },
  {
    question: "Is my data GDPR compliant?",
    answer:
      "Absolutely. RentDuo is fully GDPR compliant with end-to-end encryption for sensitive data. All data is stored on EU servers. You can export or delete your data at any time from Settings.",
  },
  {
    question: "How do I get help?",
    answer:
      "Every dashboard has a built-in Help Center with searchable FAQ, quick guides, and a direct support contact. You can access it from the sidebar at any time.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
      >
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-primary"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"
        )}
      >
        <p className="text-[13px] text-muted-foreground leading-relaxed pr-8">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative px-5 py-20 lg:px-10 lg:py-28 bg-card">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            FAQ
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Everything you need to know about RentDuo.
          </p>
        </div>

        <div className="bg-background border border-border rounded-xl px-6 shadow-card">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Still have questions?
          </p>
          <a
            href="mailto:support@rentduo.com"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <LifeBuoy className="w-4 h-4" />
            Contact our support team
          </a>
        </div>
      </div>
    </section>
  );
}
