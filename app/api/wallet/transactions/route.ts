import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET: list wallet transactions
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Number(req.nextUrl.searchParams.get("limit") || "50");
  const offset = Number(req.nextUrl.searchParams.get("offset") || "0");

  const { data: transactions, count } = await supabaseAdmin
    .from("wallet_transactions")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return NextResponse.json({ transactions: transactions || [], count: count || 0 });
}
