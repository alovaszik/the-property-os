import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// POST: request withdrawal from wallet to bank account
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, bank_account_id } = await req.json();
  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Minimum withdrawal is 1" }, { status: 400 });
  }

  // Get wallet
  const { data: wallet } = await supabaseAdmin
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
  if (wallet.balance < amount) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }

  // Verify bank account belongs to user
  const { data: bankAccount } = await supabaseAdmin
    .from("bank_accounts")
    .select("*")
    .eq("id", bank_account_id)
    .eq("user_id", user.id)
    .single();

  if (!bankAccount) return NextResponse.json({ error: "Bank account not found" }, { status: 404 });

  // Deduct balance and create transaction
  const newBalance = Number(wallet.balance) - amount;
  await supabaseAdmin
    .from("wallets")
    .update({ balance: newBalance })
    .eq("id", wallet.id);

  const { data: tx } = await supabaseAdmin
    .from("wallet_transactions")
    .insert({
      wallet_id: wallet.id,
      user_id: user.id,
      type: "withdrawal",
      amount: -amount,
      currency: wallet.currency,
      status: "pending",
      description: `Withdrawal to ${bankAccount.bank_name} (${bankAccount.iban.slice(-4)})`,
    })
    .select()
    .single();

  // In production, you would initiate a Stripe payout here via Connect.
  // For now, mark as completed after a brief delay simulation.
  await supabaseAdmin
    .from("wallet_transactions")
    .update({ status: "completed" })
    .eq("id", tx?.id);

  return NextResponse.json({ success: true, transaction: tx });
}
