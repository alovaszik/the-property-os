"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, CreditCard, Languages, ArrowRight, Check } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

const europeanCountries = [
  { code: "AT", name: "Austria", currency: "EUR", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", currency: "EUR", flag: "🇧🇪" },
  { code: "BG", name: "Bulgaria", currency: "BGN", flag: "🇧🇬" },
  { code: "HR", name: "Croatia", currency: "EUR", flag: "🇭🇷" },
  { code: "CY", name: "Cyprus", currency: "EUR", flag: "🇨🇾" },
  { code: "CZ", name: "Czech Republic", currency: "CZK", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", currency: "DKK", flag: "🇩🇰" },
  { code: "EE", name: "Estonia", currency: "EUR", flag: "🇪🇪" },
  { code: "FI", name: "Finland", currency: "EUR", flag: "🇫🇮" },
  { code: "FR", name: "France", currency: "EUR", flag: "🇫🇷" },
  { code: "DE", name: "Germany", currency: "EUR", flag: "🇩🇪" },
  { code: "GR", name: "Greece", currency: "EUR", flag: "🇬🇷" },
  { code: "HU", name: "Hungary", currency: "HUF", flag: "🇭🇺" },
  { code: "IE", name: "Ireland", currency: "EUR", flag: "🇮🇪" },
  { code: "IT", name: "Italy", currency: "EUR", flag: "🇮🇹" },
  { code: "LV", name: "Latvia", currency: "EUR", flag: "🇱🇻" },
  { code: "LT", name: "Lithuania", currency: "EUR", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", currency: "EUR", flag: "🇱🇺" },
  { code: "MT", name: "Malta", currency: "EUR", flag: "🇲🇹" },
  { code: "NL", name: "Netherlands", currency: "EUR", flag: "🇳🇱" },
  { code: "PL", name: "Poland", currency: "PLN", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", currency: "EUR", flag: "🇵🇹" },
  { code: "RO", name: "Romania", currency: "RON", flag: "🇷🇴" },
  { code: "SK", name: "Slovakia", currency: "EUR", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", currency: "EUR", flag: "🇸🇮" },
  { code: "ES", name: "Spain", currency: "EUR", flag: "🇪🇸" },
  { code: "SE", name: "Sweden", currency: "SEK", flag: "🇸🇪" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "de", name: "German (Deutsch)" },
  { code: "fr", name: "French (Français)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "pl", name: "Polish (Polski)" },
  { code: "nl", name: "Dutch (Nederlands)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "ro", name: "Romanian (Română)" },
  { code: "cs", name: "Czech (Čeština)" },
  { code: "hu", name: "Hungarian (Magyar)" },
  { code: "sv", name: "Swedish (Svenska)" },
  { code: "da", name: "Danish (Dansk)" },
  { code: "fi", name: "Finnish (Suomi)" },
  { code: "el", name: "Greek (Ελληνικά)" },
  { code: "bg", name: "Bulgarian (Български)" },
];

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "tenant";

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useState({
    country: "",
    currency: "",
    language: "en",
  });

  const selectedCountry = europeanCountries.find(
    (c) => c.code === onboarding.country
  );

  const handleCountryChange = (countryCode: string) => {
    const country = europeanCountries.find((c) => c.code === countryCode);
    if (country) {
      setOnboarding({
        ...onboarding,
        country: countryCode,
        currency: country.currency,
      });
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Update user profile with onboarding data
      await supabase
        .from("profiles")
        .update({
          country: onboarding.country,
          currency: onboarding.currency,
          language: onboarding.language,
          onboarding_complete: true,
        })
        .eq("id", user.id);
    }
    
    // Redirect to appropriate dashboard with tutorial
    if (role === "landlord") {
      router.push("/landlord?tutorial=true");
    } else {
      router.push("/tenant?tutorial=true");
    }
  };

  return (
    <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              s === step
                ? "w-10 bg-primary"
                : s < step
                  ? "w-6 bg-primary/50"
                  : "w-6 bg-border"
            }`}
          />
        ))}
      </div>

      <Card className="p-7 border-border">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1.5 font-display">
                Select your country
              </h2>
              <p className="text-sm text-muted-foreground">
                This helps us provide localized features and currency
              </p>
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={onboarding.country} onValueChange={handleCountryChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose your country" />
                </SelectTrigger>
                <SelectContent>
                  {europeanCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCountry && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Currency detected
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      All prices will be shown in {selectedCountry.currency}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {selectedCountry.currency}
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={() => setStep(2)}
              disabled={!onboarding.country}
              className="w-full h-12 text-base"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                <Languages className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1.5 font-display">
                Choose your language
              </h2>
              <p className="text-sm text-muted-foreground">
                RentDuo speaks your language
              </p>
            </div>

            <div className="space-y-2">
              <Label>Preferred Language</Label>
              <Select
                value={onboarding.language}
                onValueChange={(lang) =>
                  setOnboarding({ ...onboarding, language: lang })
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 h-12 text-base"
              >
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1 h-12 text-base">
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1.5 font-display">
                {"You're all set!"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Your account is configured and ready to use
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-secondary/50">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Country</span>
                <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  {selectedCountry?.flag} {selectedCountry?.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Currency</span>
                <span className="text-sm font-semibold text-foreground">
                  {onboarding.currency}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Language</span>
                <span className="text-sm font-semibold text-foreground">
                  {languages.find((l) => l.code === onboarding.language)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {role}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 h-12 text-base"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 h-12 text-base"
              >
                {loading ? "Setting up..." : "Complete Setup"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-2xl">
        <Card className="p-8 shadow-xl border-border/50 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
