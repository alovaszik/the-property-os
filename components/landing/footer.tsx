const footerLinks = {
  Product: [
    { label: "Features", href: "#why" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Cookie Policy", href: "/legal/cookies" },
    { label: "GDPR", href: "/legal/gdpr" },
    { label: "Imprint", href: "/legal/imprint" },
  ],
  Support: [
    { label: "Help Center", href: "/support" },
    { label: "Submit a Ticket", href: "/support" },
    { label: "System Status", href: "#" },
    { label: "Community", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-5xl mx-auto px-5 lg:px-10">
        <div className="py-12 lg:py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4 font-serif">
                {category}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-[13px] text-muted-foreground hover:text-foreground transition-colors no-underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.jpeg"
              alt="RentDuo logo"
              width={20}
              height={20}
              className="rounded-md"
            />
            <span className="text-sm font-semibold text-foreground font-serif">
              RentDuo
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {"2026 RentDuo. All rights reserved. Made in the EU."}
          </p>
        </div>
      </div>
    </footer>
  );
}
