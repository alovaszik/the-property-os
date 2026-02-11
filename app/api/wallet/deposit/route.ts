import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";

// POST: create Stripe checkout session for wallet deposit
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { amount, currency = "eur" } = await req.json();
  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Minimum deposit is 1" }, { status: 400 });
  }

  // Get or create wallet
  let { data: wallet } = await supabaseAdmin
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet) {
    const { data: newWallet } = await supabaseAdmin
      .from("wallets")
      .insert({ user_id: user.id, currency: currency.toUpperCase(), balance: 0 })
      .select()
      .single();
    wallet = newWallet;
  }

  // Get or create Stripe customer
  let stripeCustomerId = wallet?.stripe_customer_id;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    stripeCustomerId = customer.id;
    await supabaseAdmin
      .from("wallets")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("user_id", user.id);
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "";

  // Get user role to redirect correctly
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const dashboardPath = profile?.role === "landlord" ? "/landlord/wallet" : "/tenant/wallet";

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: "Wallet Deposit" },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      wallet_id: wallet?.id,
      type: "wallet_deposit",
    },
    success_url: `${origin}${dashboardPath}?deposit=success`,
    cancel_url: `${origin}${dashboardPath}?deposit=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
