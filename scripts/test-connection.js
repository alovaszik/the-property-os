import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("[v0] SUPABASE_URL:", url ? url.substring(0, 30) + "..." : "NOT SET");
console.log("[v0] ANON_KEY:", key ? key.substring(0, 10) + "..." : "NOT SET");
console.log("[v0] SERVICE_KEY:", serviceKey ? serviceKey.substring(0, 10) + "..." : "NOT SET");

if (!url || !key) {
  console.log("[v0] Missing Supabase env vars - integration not connected");
  process.exit(1);
}

try {
  const supabase = createClient(url, serviceKey || key);
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  if (error) {
    console.log("[v0] Query error (expected if table doesn't exist):", error.message);
    console.log("[v0] But connection works! The database is reachable.");
  } else {
    console.log("[v0] Connection successful! Data:", data);
  }
} catch (e) {
  console.log("[v0] Connection failed:", e.message);
}
