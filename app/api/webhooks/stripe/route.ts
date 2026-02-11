import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (metadata?.type === "wallet_deposit" && metadata?.user_id && metadata?.wallet_id) {
      const amount = (session.amount_total || 0) / 100;

      // Credit wallet
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("balance")
        .eq("id", metadata.wallet_id)
        .single();

      if (wallet) {
        await supabaseAdmin
          .from("wallets")
          .update({ balance: Number(wallet.balance) + amount })
          .eq("id", metadata.wallet_id);

        await supabaseAdmin.from("wallet_transactions").insert({
          wallet_id: metadata.wallet_id,
          user_id: metadata.user_id,
          type: "deposit",
          amount,
          currency: session.currency?.toUpperCase() || "EUR",
          status: "completed",
          description: "Wallet deposit via Stripe",
          stripe_payment_intent_id: session.payment_intent as string,
        });

        // If auto_payout and instant_payout are on, initiate payout
        const { data: walletSettings } = await supabaseAdmin
          .from("wallets")
          .select("auto_payout, instant_payout")
          .eq("id", metadata.wallet_id)
          .single();

        if (walletSettings?.auto_payout && walletSettings?.instant_payout) {
          // In production: trigger payout via Stripe Connect
          // For now, this is logged as a system event
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
