import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// POST: update wallet settings (auto payout, instant payout)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { auto_payout, instant_payout } = await req.json();

  const updates: Record<string, boolean> = {};
  if (typeof auto_payout === "boolean") updates.auto_payout = auto_payout;
  if (typeof instant_payout === "boolean") updates.instant_payout = instant_payout;

  const { data: wallet } = await supabaseAdmin
    .from("wallets")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();

  return NextResponse.json({ wallet });
}
