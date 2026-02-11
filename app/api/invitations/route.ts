import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tenant_name, tenant_email, tenant_phone, property_name, unit, monthly_rent, currency } = body;

  if (!tenant_name || !tenant_email) {
    return NextResponse.json(
      { error: "Tenant name and email are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      landlord_id: user.id,
      tenant_name,
      tenant_email,
      tenant_phone: tenant_phone || null,
      property_name: property_name || null,
      unit: unit || null,
      monthly_rent: monthly_rent || null,
      currency: currency || "EUR",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ invitation: data });
}
