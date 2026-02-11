"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  HelpCircle,
  Building2,
  CreditCard,
  Wallet,
  Key,
  Wrench,
  Shield,
  Settings,
  MessageCircle,
  Mail,
  ExternalLink,
} from "@/components/icons";
import { cn } from "@/lib/utils";

interface HelpArticle {
  question: string;
  answer: string;
}

interface HelpCategory {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  articles: HelpArticle[];
}

const helpCategories: HelpCategory[] = [
  {
    label: "Getting Started",
    icon: HelpCircle,
    articles: [
      {
        question: "How do I add my first property?",
        answer:
          "Go to Properties in the sidebar and click \"Add Property\". Follow the multi-step form to enter your property details, location, amenities, and financial settings. You can always edit these later.",
      },
      {
        question: "How do I invite a tenant?",
        answer:
          "Navigate to Tenants and click \"Invite Tenant\". Enter their email address and they will receive an invitation link to register and join your property.",
      },
      {
        question: "Can I use RentDuo on my phone?",
        answer:
          "Yes. RentDuo is fully responsive and works on any device. The dashboard adapts to your screen size with a mobile-optimized navigation.",
      },
    ],
  },
  {
    label: "Properties & Leases",
    icon: Building2,
    articles: [
      {
        question: "How do I create a lease?",
        answer:
          "Go to Leases and click \"New Lease\". Select the property and tenant, set the lease dates, rent amount, deposit, and any special terms. Both parties will be notified.",
      },
      {
        question: "Can I manage multiple properties?",
        answer:
          "Yes. RentDuo supports unlimited properties on the free plan. Each property has its own detail page with units, tenants, financials, and documents.",
      },
      {
        question: "What happens when a lease ends?",
        answer:
          "You will be notified before the lease expires. You can renew it, create a new lease, or end the tenancy. Security deposits are released or deducted at contract end.",
      },
    ],
  },
  {
    label: "Payments & Wallet",
    icon: Wallet,
    articles: [
      {
        question: "How do deposits work?",
        answer:
          "Click \"Deposit\" in your wallet, enter the amount, and pay through the secure Stripe checkout. Funds appear in your wallet balance after confirmation.",
      },
      {
        question: "How do I withdraw to my bank?",
        answer:
          "Add a bank account in your wallet settings, then click \"Withdraw\" and enter the amount. Transfers typically arrive within 1-3 business days.",
      },
      {
        question: "What is automatic payout?",
        answer:
          "Landlords can enable automatic payout in wallet settings. When enabled, received rent is automatically sent to your linked bank account within 24 hours.",
      },
      {
        question: "How are security deposits handled?",
        answer:
          "Security deposits are locked in the platform and cannot be accessed by either party during the active lease. Upon contract end, the landlord can release the full amount or deduct for damages with documentation.",
      },
    ],
  },
  {
    label: "Maintenance & Requests",
    icon: Wrench,
    articles: [
      {
        question: "How do tenants request money for repairs?",
        answer:
          "Tenants go to their Wallet and click \"Request Money\". They select a category (maintenance, repair, utility), enter the amount and a description. The landlord receives a notification to approve or reject.",
      },
      {
        question: "What happens when a request is approved?",
        answer:
          "The approved amount is deducted from the landlord's wallet and credited to the tenant's wallet. Both parties see the transaction in their history.",
      },
    ],
  },
  {
    label: "Security & Privacy",
    icon: Shield,
    articles: [
      {
        question: "Is my data encrypted?",
        answer:
          "Yes. All sensitive data is encrypted in transit and at rest. We use industry-standard TLS encryption and secure EU-based servers.",
      },
      {
        question: "Is RentDuo GDPR compliant?",
        answer:
          "Fully. You can export all your data or request deletion at any time from the Settings page. We never sell your data to third parties.",
      },
      {
        question: "How secure are payments?",
        answer:
          "All payments are processed through Stripe, a PCI Level 1 certified payment processor. We never store your full card details on our servers.",
      },
    ],
  },
  {
    label: "Account & Settings",
    icon: Settings,
    articles: [
      {
        question: "How do I change my email or password?",
        answer:
          "Go to Settings in the sidebar. You can update your email, password, notification preferences, and other account details from there.",
      },
      {
        question: "Can I delete my account?",
        answer:
          "Yes. Go to Settings and scroll to the bottom. You can request full account deletion which will remove all your data within 30 days, as required by GDPR.",
      },
    ],
  },
];

export function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<number | null>(0);
  const [openArticle, setOpenArticle] = useState<string | null>(null);

  const filteredCategories = searchQuery.trim()
    ? helpCategories
        .map((cat) => ({
          ...cat,
          articles: cat.articles.filter(
            (a) =>
              a.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.articles.length > 0)
    : helpCategories;

  const totalResults = filteredCategories.reduce((sum, c) => sum + c.articles.length, 0);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Help Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find answers, guides, and get support.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setOpenCategory(null);
            setOpenArticle(null);
          }}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
        />
        {searchQuery && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-muted-foreground">
            {totalResults} result{totalResults !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Categories + Articles */}
      <div className="grid lg:grid-cols-3 gap-4 lg:gap-6">
        {/* FAQ accordion */}
        <div className="lg:col-span-2 space-y-2">
          {filteredCategories.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No results found</p>
              <p className="text-[13px] text-muted-foreground mt-1">
                Try a different search term or contact support below.
              </p>
            </div>
          ) : (
            filteredCategories.map((category, catIndex) => (
              <div
                key={category.label}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenCategory(openCategory === catIndex ? null : catIndex)
                  }
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <category.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground">
                      {category.label}
                    </span>
                    <span className="text-2xs text-muted-foreground ml-2">
                      {category.articles.length} article{category.articles.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform duration-200",
                      openCategory === catIndex && "rotate-180 text-primary"
                    )}
                  />
                </button>

                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    openCategory === catIndex
                      ? "max-h-[2000px] opacity-100"
                      : "max-h-0 opacity-0"
                  )}
                >
                  <div className="px-5 pb-3 space-y-0.5">
                    {category.articles.map((article) => {
                      const key = `${category.label}-${article.question}`;
                      const isOpen = openArticle === key;
                      return (
                        <div key={key} className="border-t border-border first:border-t-0">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenArticle(isOpen ? null : key)
                            }
                            className="w-full flex items-center justify-between gap-3 py-3 text-left group"
                          >
                            <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                              {article.question}
                            </span>
                            <ChevronDown
                              className={cn(
                                "w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200",
                                isOpen && "rotate-180 text-primary"
                              )}
                            />
                          </button>
                          <div
                            className={cn(
                              "overflow-hidden transition-all duration-200",
                              isOpen
                                ? "max-h-[500px] opacity-100 pb-3"
                                : "max-h-0 opacity-0"
                            )}
                          >
                            <p className="text-[13px] text-muted-foreground leading-relaxed pl-0 pr-6">
                              {article.answer}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Support sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Need more help?
            </h3>
            <div className="space-y-3">
              <a
                href="mailto:support@rentduo.com"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors no-underline group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                    Email Support
                  </p>
                  <p className="text-2xs text-muted-foreground">
                    support@rentduo.com
                  </p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors no-underline group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">
                    Live Chat
                  </p>
                  <p className="text-2xs text-muted-foreground">
                    Mon-Fri, 9am-6pm CET
                  </p>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-card">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Quick links
            </h3>
            <div className="space-y-1.5">
              {[
                { label: "Privacy Policy", href: "/legal/privacy" },
                { label: "Terms of Service", href: "/legal/terms" },
                { label: "GDPR Info", href: "/legal/gdpr" },
                { label: "Cookie Policy", href: "/legal/cookies" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-primary transition-colors no-underline py-1"
                >
                  <ExternalLink className="w-3 h-3 shrink-0" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
