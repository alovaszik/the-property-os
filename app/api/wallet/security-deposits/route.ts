import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: list security deposits for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const column = profile?.role === "landlord" ? "landlord_id" : "tenant_id";
  const { data: deposits } = await supabaseAdmin
    .from("security_deposits")
    .select("*, tenancies(unit, property_id, properties(name))")
    .eq(column, user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ deposits: deposits || [] });
}

// POST: release security deposit (landlord only)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deposit_id, release_amount, deduction_reason } = await req.json();

  const { data: deposit } = await supabaseAdmin
    .from("security_deposits")
    .select("*")
    .eq("id", deposit_id)
    .eq("landlord_id", user.id)
    .single();

  if (!deposit) return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
  if (deposit.status === "released") {
    return NextResponse.json({ error: "Already released" }, { status: 400 });
  }

  const releaseAmt = release_amount ?? deposit.amount;
  const newStatus = releaseAmt >= deposit.amount ? "released" : "partially_released";

  await supabaseAdmin
    .from("security_deposits")
    .update({
      status: newStatus,
      release_amount: releaseAmt,
      released_at: new Date().toISOString(),
      deduction_reason: deduction_reason || null,
    })
    .eq("id", deposit_id);

  // Credit released amount to tenant wallet
  const { data: tenantWallet } = await supabaseAdmin
    .from("wallets")
    .select("*")
    .eq("user_id", deposit.tenant_id)
    .single();

  if (tenantWallet) {
    await supabaseAdmin
      .from("wallets")
      .update({ balance: Number(tenantWallet.balance) + releaseAmt })
      .eq("id", tenantWallet.id);

    await supabaseAdmin.from("wallet_transactions").insert({
      wallet_id: tenantWallet.id,
      user_id: deposit.tenant_id,
      type: "security_deposit_release",
      amount: releaseAmt,
      currency: deposit.currency,
      status: "completed",
      description: `Security deposit released${deduction_reason ? ` (deducted: ${deposit.amount - releaseAmt})` : ""}`,
      related_tenancy_id: deposit.tenancy_id,
    });
  }

  return NextResponse.json({ success: true });
}
