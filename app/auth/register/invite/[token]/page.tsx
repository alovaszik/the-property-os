"use client";

import React from "react"

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Key,
  Users,
  ArrowRight,
  Loader2,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Shield,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

type Invitation = {
  id: string;
  token: string;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string | null;
  property_name: string | null;
  unit: string | null;
  monthly_rent: number | null;
  currency: string;
  landlord_id: string;
};

export default function InviteRegisterPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [pageStatus, setPageStatus] = useState<"loading" | "valid" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invitations/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error || "Invalid invitation");
          setPageStatus("error");
          return;
        }

        setInvitation(data.invitation);
        setPageStatus("valid");
      } catch {
        setErrorMessage("Failed to load invitation");
        setPageStatus("error");
      }
    }

    if (token) fetchInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setFormError("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    if (!invitation) return;

    setLoading(true);
    setFormError("");

    const supabase = createClient();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: invitation.tenant_email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/onboarding?role=tenant`,
        data: {
          full_name: invitation.tenant_name,
          role: "tenant",
          invited_by: invitation.landlord_id,
          phone: invitation.tenant_phone,
        },
      },
    });

    if (signUpError) {
      setFormError(signUpError.message);
      setLoading(false);
      return;
    }

    // Mark invitation as used
    if (data.user) {
      await fetch(`/api/invitations/${token}/use`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: data.user.id }),
      });
    }

    if (data.user && !data.session) {
      router.push("/auth/sign-up-success");
    } else if (data.session) {
      router.push("/auth/onboarding?role=tenant");
    }
  };

  // Loading state
  if (pageStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center animate-in fade-in duration-500">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (pageStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Invalid Invitation</h1>
          <p className="text-sm text-muted-foreground mb-6">{errorMessage}</p>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/auth/register">Register Normally</Link>
            </Button>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to home
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Card className="p-8 shadow-xl border-border/50">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <img
                src="/logo.jpeg"
                alt="RentDuo logo"
                width={48}
                height={48}
                className="rounded-full"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
              <Shield className="w-3 h-3" />
              Invited by your landlord
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Welcome to RentDuo
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete your registration to get started
            </p>
          </div>

          {/* Pre-filled info card */}
          <div className="p-4 rounded-xl bg-secondary/50 border border-border mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                {invitation.tenant_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{invitation.tenant_name}</p>
                <p className="text-xs text-muted-foreground truncate">{invitation.tenant_email}</p>
              </div>
            </div>
            {(invitation.tenant_phone || invitation.property_name) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                {invitation.tenant_phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {invitation.tenant_phone}
                  </span>
                )}
                {invitation.property_name && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {invitation.property_name}
                    {invitation.unit && ` - ${invitation.unit}`}
                  </span>
                )}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              These details were pre-filled by your landlord
            </p>
          </div>

          {/* Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {formError}
              </div>
            )}

            {/* Pre-filled fields (read only) */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={invitation.tenant_name}
                  disabled
                  className="pl-10 h-12 opacity-70"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={invitation.tenant_email}
                  disabled
                  className="pl-10 h-12 opacity-70"
                />
              </div>
            </div>

            {/* Password fields */}
            <div className="space-y-2">
              <Label htmlFor="invite-password">Create Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="invite-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-confirm">Confirm Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="invite-confirm"
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
