"use client";

import { useState } from "react";
import { ChevronRight } from "@/components/icons";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Is RentDuo free to use?",
    answer:
      "Yes! Our Starter plan is completely free and lets you manage up to 3 properties. You can upgrade to Professional or Enterprise at any time for more features and unlimited properties.",
  },
  {
    question: "Which countries does RentDuo support?",
    answer:
      "RentDuo supports all 30+ European Union and EEA countries, including Germany, France, Spain, Italy, Netherlands, Austria, Hungary, and many more. Each country has localized currency, language, and regulation support.",
  },
  {
    question: "How does the unified chat work?",
    answer:
      "Every interaction between landlord and tenant appears in a single timeline. Think of it like a modern banking app where every transaction and conversation is in one place.",
  },
  {
    question: "Can I change my name or country after registering?",
    answer:
      "Your legal name and country are set during registration for verification purposes. To change these, you can submit a support ticket and our team will verify and process the change within 24-48 hours.",
  },
  {
    question: "What are RentDuo Points?",
    answer:
      "RentDuo Points are our loyalty rewards system. Both landlords and tenants earn points for positive actions like on-time payments, completing profile setup, and maintaining good standing. Points can unlock premium features and badges.",
  },
  {
    question: "Is my data secure and GDPR compliant?",
    answer:
      "Absolutely. RentDuo is fully GDPR compliant and uses end-to-end encryption for sensitive data. All data is stored in EU-based servers, and you can request data export or deletion at any time.",
  },
  {
    question: "How do automatic payments work?",
    answer:
      "Tenants can set up recurring payments that automatically process on their rent due date. Landlords receive instant notifications when payments are made, and everything is logged in the activity feed.",
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
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{question}</span>
        <ChevronRight
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-90 text-primary"
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
    <section id="faq" className="relative px-5 py-20 lg:px-10 lg:py-28">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3">
            FAQ
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-balance font-serif">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Everything you need to know about RentDuo.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl px-6 shadow-card">
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
      </div>
    </section>
  );
}
