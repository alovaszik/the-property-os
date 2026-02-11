import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // If next param is set, use it (onboarding will have role in query)
      if (next !== "/") {
        return NextResponse.redirect(new URL(next, origin));
      }

      // Otherwise get role from database profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_complete")
        .eq("id", data.user.id)
        .single();

      if (profile) {
        if (!profile.onboarding_complete) {
          return NextResponse.redirect(new URL(`/auth/onboarding?role=${profile.role}`, origin));
        }
        const forwardUrl = new URL(profile.role === "landlord" ? "/landlord" : "/tenant", origin);
        return NextResponse.redirect(forwardUrl);
      }
    }
  }

  // Something went wrong, redirect to error page
  return NextResponse.redirect(new URL("/auth/error", origin));
}
