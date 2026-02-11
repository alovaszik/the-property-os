import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: get or create wallet for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Try to get existing wallet
  let { data: wallet } = await supabaseAdmin
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Create wallet if doesn't exist
  if (!wallet) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("currency")
      .eq("id", user.id)
      .single();

    const { data: newWallet } = await supabaseAdmin
      .from("wallets")
      .insert({
        user_id: user.id,
        currency: profile?.currency || "EUR",
        balance: 0,
      })
      .select()
      .single();
    wallet = newWallet;
  }

  return NextResponse.json({ wallet });
}
