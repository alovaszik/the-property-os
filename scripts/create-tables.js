const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing env vars:");
  console.log("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "SET" : "MISSING");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "SET" : "MISSING");
  process.exit(1);
}

console.log("Connecting to Supabase:", supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Test connection first
async function testConnection() {
  const { data, error } = await supabase.from("profiles").select("id").limit(1);
  if (error && error.code === "42P01") {
    console.log("Table 'profiles' does not exist yet - DB is fresh, ready for migration.");
    return true;
  }
  if (error) {
    console.log("Connection test result:", error.message, "code:", error.code);
  } else {
    console.log("Connection successful! Profiles table already exists with", data.length, "rows");
  }
  return true;
}

async function main() {
  const connected = await testConnection();
  if (!connected) {
    console.error("Cannot connect to Supabase. Check your env vars.");
    process.exit(1);
  }

  console.log("");
  console.log("=== MIGRATION SQL ===");
  console.log("The SQL script executor cannot run DDL. Please run the following SQL in the Supabase SQL Editor:");
  console.log(`Go to: ${supabaseUrl.replace(".supabase.co", ".supabase.co")}`);
  console.log("Open SQL Editor and paste the contents of scripts/006_fresh_database.sql");
  console.log("");
  console.log("OR copy from below:");
  console.log("=====================");
}

main();
