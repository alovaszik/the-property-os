"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "Is PropertyOS free for tenants?",
    answer:
      "Yes! Tenants can use PropertyOS completely free. You can pay rent, submit maintenance requests, and communicate with your landlord at no cost.",
  },
  {
    question: "How do rent payments work?",
    answer:
      "PropertyOS supports multiple payment methods including bank transfers, credit/debit cards, and digital wallets. Payments are processed securely and landlords receive funds within 2-3 business days.",
  },
  {
    question: "Can I manage multiple properties?",
    answer:
      "Absolutely. Our Professional plan supports up to 25 properties, and our Enterprise plan offers unlimited properties. Each property gets its own dashboard with dedicated tenant management.",
  },
  {
    question: "Is my financial data secure?",
    answer:
      "Security is our top priority. We use bank-level encryption for all financial transactions, and your data is protected with SOC 2 Type II compliance. We never share your information with third parties.",
  },
  {
    question: "How do maintenance requests work?",
    answer:
      "Tenants can submit maintenance requests with descriptions and photos directly through the app. Landlords receive instant notifications, can assign contractors, and track the resolution status in real-time.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="bg-secondary px-4 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            FAQ
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold text-foreground md:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12 flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex min-h-[48px] w-full items-center justify-between px-5 py-4 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="pr-4 text-base font-medium text-foreground">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="border-t border-border px-5 pb-4 pt-3">
                  <p className="leading-relaxed text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
