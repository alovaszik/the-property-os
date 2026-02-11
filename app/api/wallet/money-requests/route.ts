import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: list money requests
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
  const { data: requests } = await supabaseAdmin
    .from("money_requests")
    .select("*, tenancies(unit, properties(name))")
    .eq(column, user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ requests: requests || [] });
}

// POST: create money request (tenant) or approve/reject (landlord)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Tenant creates a request
  if (profile?.role === "tenant" || body.action === "create") {
    const { tenancy_id, amount, reason, category } = body;
    if (!tenancy_id || !amount || !reason) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify tenancy belongs to this tenant
    const { data: tenancy } = await supabaseAdmin
      .from("tenancies")
      .select("landlord_id")
      .eq("id", tenancy_id)
      .eq("tenant_id", user.id)
      .single();

    if (!tenancy) return NextResponse.json({ error: "Tenancy not found" }, { status: 404 });

    const { data: request } = await supabaseAdmin
      .from("money_requests")
      .insert({
        tenant_id: user.id,
        landlord_id: tenancy.landlord_id,
        tenancy_id,
        amount,
        currency: "EUR",
        reason,
        category: category || "other",
      })
      .select()
      .single();

    return NextResponse.json({ request });
  }

  // Landlord approves/rejects
  if (body.action === "approve" || body.action === "reject") {
    const { request_id, landlord_note } = body;

    const { data: request } = await supabaseAdmin
      .from("money_requests")
      .select("*")
      .eq("id", request_id)
      .eq("landlord_id", user.id)
      .single();

    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    if (body.action === "approve") {
      // Deduct from landlord wallet and credit tenant wallet
      const { data: landlordWallet } = await supabaseAdmin
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!landlordWallet || Number(landlordWallet.balance) < request.amount) {
        return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
      }

      // Deduct from landlord
      await supabaseAdmin
        .from("wallets")
        .update({ balance: Number(landlordWallet.balance) - request.amount })
        .eq("id", landlordWallet.id);

      await supabaseAdmin.from("wallet_transactions").insert({
        wallet_id: landlordWallet.id,
        user_id: user.id,
        type: "maintenance_request",
        amount: -request.amount,
        currency: request.currency,
        status: "completed",
        description: `Approved: ${request.reason}`,
        related_user_id: request.tenant_id,
        related_tenancy_id: request.tenancy_id,
      });

      // Credit tenant
      const { data: tenantWallet } = await supabaseAdmin
        .from("wallets")
        .select("*")
        .eq("user_id", request.tenant_id)
        .single();

      if (tenantWallet) {
        await supabaseAdmin
          .from("wallets")
          .update({ balance: Number(tenantWallet.balance) + request.amount })
          .eq("id", tenantWallet.id);

        await supabaseAdmin.from("wallet_transactions").insert({
          wallet_id: tenantWallet.id,
          user_id: request.tenant_id,
          type: "maintenance_request",
          amount: request.amount,
          currency: request.currency,
          status: "completed",
          description: `Reimbursement: ${request.reason}`,
          related_user_id: user.id,
          related_tenancy_id: request.tenancy_id,
        });
      }

      await supabaseAdmin
        .from("money_requests")
        .update({ status: "paid", landlord_note })
        .eq("id", request_id);
    } else {
      await supabaseAdmin
        .from("money_requests")
        .update({ status: "rejected", landlord_note })
        .eq("id", request_id);
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
