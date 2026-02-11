import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const { user_id } = await request.json();
  const supabase = await createClient();

  const { error } = await supabase
    .from("invitations")
    .update({
      used: true,
      used_by: user_id,
      used_at: new Date().toISOString(),
    })
    .eq("token", token)
    .eq("used", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
