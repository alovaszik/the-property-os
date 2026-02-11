"use client";

import React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Key, Users, ArrowRight } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "tenant" as "tenant" | "landlord",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/auth/onboarding?role=${encodeURIComponent(formData.role)}`,
        data: {
          full_name: formData.name,
          role: formData.role,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user && !data.session) {
      router.push("/auth/sign-up-success");
    } else if (data.session) {
      router.push(`/auth/onboarding?role=${formData.role}`);
    }
  };

  return (
    <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="p-7 border-border">
        <div className="mb-7">
          <h1 className="text-xl font-semibold text-foreground font-display">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Join RentDuo and simplify property management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-xs font-medium">
              Full Name
            </Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="pl-9 h-10"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="pl-9 h-10"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="text-xs font-medium">
              Password
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="pl-9 h-10"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                className="pl-9 h-10"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs font-medium">I am a...</Label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "tenant" })}
                className={`p-3.5 rounded-lg border transition-colors ${
                  formData.role === "tenant"
                    ? "border-primary bg-primary/8 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <p className="text-sm font-semibold">Tenant</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {"I'm renting"}
                </p>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, role: "landlord" })
                }
                className={`p-3.5 rounded-lg border transition-colors ${
                  formData.role === "landlord"
                    ? "border-primary bg-primary/8 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                <p className="text-sm font-semibold">Landlord</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  I own properties
                </p>
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-10 mt-1" disabled={loading}>
            {loading ? (
              "Creating account..."
            ) : (
              <>
                Continue
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>

      <div className="mt-5 text-center">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
