import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

let supabaseAdminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseAdmin() {
  if (!supabaseAdminClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    supabaseAdminClient = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdminClient;
}

// For backward compatibility
export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_, prop) {
    return (getSupabaseAdmin() as any)[prop];
  },
});
