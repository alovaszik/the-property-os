import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const sql = `
-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL CHECK (role IN ('tenant','landlord','support','manager','owner')) DEFAULT 'tenant',
  country text DEFAULT 'DE',
  currency text DEFAULT 'EUR',
  language text DEFAULT 'en',
  points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  onboarding_complete boolean DEFAULT false,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'tenant')
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- 4. Points history
CREATE TABLE IF NOT EXISTS public.points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL,
  type text NOT NULL CHECK (type IN ('earned','spent','bonus','penalty')) DEFAULT 'earned',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "points_select_own" ON public.points_history FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "points_insert_own" ON public.points_history FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. Tickets
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  category text NOT NULL CHECK (category IN ('name_change','country_change','billing','bug','feature','other')) DEFAULT 'other',
  status text NOT NULL CHECK (status IN ('open','in_progress','waiting','resolved','closed')) DEFAULT 'open',
  priority text NOT NULL CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "tickets_select_own" ON public.tickets FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tickets_insert_own" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tickets_update_own" ON public.tickets FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6. Ticket messages
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role text NOT NULL CHECK (sender_role IN ('user','support','manager','owner')) DEFAULT 'user',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "ticket_msg_select" ON public.ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tickets WHERE tickets.id = ticket_messages.ticket_id AND tickets.user_id = auth.uid())
); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "ticket_msg_insert" ON public.ticket_messages FOR INSERT WITH CHECK (auth.uid() = sender_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7. Properties
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  city text,
  country text,
  total_units integer NOT NULL DEFAULT 1,
  status text NOT NULL CHECK (status IN ('active','maintenance','vacant','inactive')) DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "properties_select_own" ON public.properties FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "properties_insert_own" ON public.properties FOR INSERT WITH CHECK (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "properties_update_own" ON public.properties FOR UPDATE USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "properties_delete_own" ON public.properties FOR DELETE USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. Tenancies
CREATE TABLE IF NOT EXISTS public.tenancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit text NOT NULL,
  monthly_rent numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  lease_start date,
  lease_end date,
  deposit numeric(12,2) DEFAULT 0,
  status text NOT NULL CHECK (status IN ('active','ending','expired','terminated')) DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "tenancies_select_landlord" ON public.tenancies FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tenancies_insert_landlord" ON public.tenancies FOR INSERT WITH CHECK (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tenancies_update_landlord" ON public.tenancies FOR UPDATE USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "tenancies_select_tenant" ON public.tenancies FOR SELECT USING (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 9. Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  method text NOT NULL DEFAULT 'manual',
  status text NOT NULL CHECK (status IN ('completed','pending','overdue','failed')) DEFAULT 'pending',
  due_date date NOT NULL,
  paid_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "payments_select_landlord" ON public.payments FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "payments_insert_landlord" ON public.payments FOR INSERT WITH CHECK (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "payments_select_tenant" ON public.payments FOR SELECT USING (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "payments_insert_tenant" ON public.payments FOR INSERT WITH CHECK (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 10. Maintenance tickets
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text NOT NULL CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  status text NOT NULL CHECK (status IN ('open','in-progress','resolved','closed')) DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "maint_select_landlord" ON public.maintenance_tickets FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "maint_update_landlord" ON public.maintenance_tickets FOR UPDATE USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "maint_select_tenant" ON public.maintenance_tickets FOR SELECT USING (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "maint_insert_tenant" ON public.maintenance_tickets FOR INSERT WITH CHECK (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 11. Documents
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid REFERENCES public.tenancies(id) ON DELETE SET NULL,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('lease','inspection','insurance','receipt','notice','other')) DEFAULT 'other',
  file_url text,
  file_size text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "docs_select_landlord" ON public.documents FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "docs_insert_landlord" ON public.documents FOR INSERT WITH CHECK (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "docs_select_tenant" ON public.documents FOR SELECT USING (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 12. Statements
CREATE TABLE IF NOT EXISTS public.statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period text NOT NULL,
  rent numeric(12,2) DEFAULT 0,
  utilities numeric(12,2) DEFAULT 0,
  water numeric(12,2) DEFAULT 0,
  parking numeric(12,2) DEFAULT 0,
  other numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  paid boolean DEFAULT false,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "stmt_select_landlord" ON public.statements FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "stmt_insert_landlord" ON public.statements FOR INSERT WITH CHECK (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "stmt_select_tenant" ON public.statements FOR SELECT USING (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 13. Activity log
CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('payment','message','ticket','system','lease','document')),
  title text NOT NULL,
  description text,
  status text CHECK (status IN ('success','warning','pending')),
  related_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "activity_select_own" ON public.activity_log FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "activity_insert_own" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 14. Updated_at triggers
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS properties_updated_at ON public.properties;
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS tenancies_updated_at ON public.tenancies;
CREATE TRIGGER tenancies_updated_at BEFORE UPDATE ON public.tenancies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS tickets_updated_at ON public.tickets;
CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS maint_updated_at ON public.maintenance_tickets;
CREATE TRIGGER maint_updated_at BEFORE UPDATE ON public.maintenance_tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
`;

async function run() {
  console.log('Connecting to Supabase:', supabaseUrl);
  
  // Split SQL into individual statements and execute one by one
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  let success = 0;
  let failed = 0;

  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_string: stmt + ';' });
      if (error) {
        // Try direct fetch approach
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql_string: stmt + ';' }),
        });
        if (!res.ok) {
          // Fall through - we'll use the SQL API directly
          throw new Error('RPC not available');
        }
      }
      success++;
    } catch {
      // Use the Supabase SQL API endpoint directly
      try {
        const res = await fetch(`${supabaseUrl}/pg`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: stmt + ';' }),
        });
        if (res.ok) {
          success++;
        } else {
          failed++;
          console.log('Failed statement (first 80 chars):', stmt.substring(0, 80));
        }
      } catch (e2) {
        failed++;
        console.log('Failed statement (first 80 chars):', stmt.substring(0, 80));
      }
    }
  }

  console.log(`Done: ${success} succeeded, ${failed} failed`);
}

run().catch(console.error);
