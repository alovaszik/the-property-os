import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: list user's bank accounts
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accounts } = await supabaseAdmin
    .from("bank_accounts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ accounts: accounts || [] });
}

// POST: add a new bank account
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bank_name, account_holder, iban } = await req.json();
  if (!bank_name || !account_holder || !iban) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // If this is the first account, set as default; otherwise don't override
  const { count } = await supabaseAdmin
    .from("bank_accounts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: account } = await supabaseAdmin
    .from("bank_accounts")
    .insert({
      user_id: user.id,
      bank_name,
      account_holder,
      iban,
      is_default: (count || 0) === 0,
    })
    .select()
    .single();

  return NextResponse.json({ account });
}

// DELETE: remove a bank account
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await supabaseAdmin
    .from("bank_accounts")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
}
