import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  // Use service-level query to check invitation without auth
  const { data, error } = await supabase
    .from("invitations")
    .select("id, token, tenant_name, tenant_email, tenant_phone, property_name, unit, monthly_rent, currency, used, expires_at, landlord_id")
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Invitation not found" },
      { status: 404 }
    );
  }

  if (data.used) {
    return NextResponse.json(
      { error: "This invitation has already been used" },
      { status: 410 }
    );
  }

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json(
      { error: "This invitation has expired" },
      { status: 410 }
    );
  }

  return NextResponse.json({ invitation: data });
}
