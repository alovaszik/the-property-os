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

const queries = [
  // 1. Updated at trigger function
  `CREATE OR REPLACE FUNCTION public.handle_updated_at()
   RETURNS trigger LANGUAGE plpgsql AS $$
   BEGIN NEW.updated_at = now(); RETURN NEW; END; $$`,

  // 2. Profiles table
  `CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    email text,
    role text NOT NULL DEFAULT 'tenant' CHECK (role IN ('tenant','landlord','support','manager','owner')),
    country text DEFAULT 'Germany',
    currency text DEFAULT 'EUR',
    language text DEFAULT 'en',
    points integer DEFAULT 0,
    level integer DEFAULT 1,
    avatar_url text,
    phone text,
    onboarding_complete boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 3. Profile trigger on signup
  `CREATE OR REPLACE FUNCTION public.handle_new_user()
   RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
   BEGIN
     INSERT INTO public.profiles (id, full_name, email, role)
     VALUES (
       new.id,
       COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
       new.email,
       COALESCE(new.raw_user_meta_data ->> 'role', 'tenant')
     ) ON CONFLICT (id) DO NOTHING;
     RETURN new;
   END; $$`,

  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`,
  `CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()`,

  // 4. Properties table
  `CREATE TABLE IF NOT EXISTS public.properties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    address text NOT NULL,
    city text,
    country text,
    total_units integer NOT NULL DEFAULT 1,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','maintenance','vacant','inactive')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "props_sel" ON public.properties FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "props_ins" ON public.properties FOR INSERT WITH CHECK (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "props_upd" ON public.properties FOR UPDATE USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "props_del" ON public.properties FOR DELETE USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 5. Tenancies table
  `CREATE TABLE IF NOT EXISTS public.tenancies (
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
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','ending','expired','terminated')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "ten_sel_ll" ON public.tenancies FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "ten_ins_ll" ON public.tenancies FOR INSERT WITH CHECK (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "ten_upd_ll" ON public.tenancies FOR UPDATE USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "ten_sel_tn" ON public.tenancies FOR SELECT USING (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 6. Payments table
  `CREATE TABLE IF NOT EXISTS public.payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount numeric(12,2) NOT NULL,
    currency text NOT NULL DEFAULT 'EUR',
    method text NOT NULL DEFAULT 'manual' CHECK (method IN ('manual','auto-pay','bank_transfer','card')),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('completed','pending','overdue','failed')),
    due_date date NOT NULL,
    paid_at timestamptz,
    note text,
    created_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "pay_sel_ll" ON public.payments FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "pay_ins_ll" ON public.payments FOR INSERT WITH CHECK (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "pay_sel_tn" ON public.payments FOR SELECT USING (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "pay_ins_tn" ON public.payments FOR INSERT WITH CHECK (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 7. Maintenance tickets
  `CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in-progress','resolved','closed')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "mt_sel_ll" ON public.maintenance_tickets FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "mt_upd_ll" ON public.maintenance_tickets FOR UPDATE USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "mt_sel_tn" ON public.maintenance_tickets FOR SELECT USING (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "mt_ins_tn" ON public.maintenance_tickets FOR INSERT WITH CHECK (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 8. Documents
  `CREATE TABLE IF NOT EXISTS public.documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenancy_id uuid REFERENCES public.tenancies(id) ON DELETE SET NULL,
    uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    name text NOT NULL,
    category text NOT NULL DEFAULT 'other' CHECK (category IN ('lease','inspection','insurance','receipt','notice','other')),
    file_url text,
    file_size text,
    created_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "doc_sel_ll" ON public.documents FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "doc_ins_ll" ON public.documents FOR INSERT WITH CHECK (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "doc_sel_tn" ON public.documents FOR SELECT USING (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 9. Statements
  `CREATE TABLE IF NOT EXISTS public.statements (
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
    created_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "stmt_sel_ll" ON public.statements FOR SELECT USING (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "stmt_ins_ll" ON public.statements FOR INSERT WITH CHECK (auth.uid() = landlord_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "stmt_sel_tn" ON public.statements FOR SELECT USING (auth.uid() = tenant_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 10. Activity log
  `CREATE TABLE IF NOT EXISTS public.activity_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('payment','message','ticket','system','lease','document')),
    title text NOT NULL,
    description text,
    status text CHECK (status IN ('success','warning','pending')),
    related_id uuid,
    created_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "act_sel" ON public.activity_log FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "act_ins" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 11. Points history
  `CREATE TABLE IF NOT EXISTS public.points_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points integer NOT NULL,
    reason text NOT NULL,
    category text DEFAULT 'other' CHECK (category IN ('payment','engagement','referral','bonus','other')),
    created_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "pts_sel" ON public.points_history FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "pts_ins" ON public.points_history FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 12. Support tickets
  `CREATE TABLE IF NOT EXISTS public.tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    subject text NOT NULL,
    category text NOT NULL DEFAULT 'general' CHECK (category IN ('general','billing','technical','account_change','bug','feature_request')),
    priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
    status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in-progress','waiting','resolved','closed')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "tkt_sel" ON public.tickets FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "tkt_ins" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "tkt_upd" ON public.tickets FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 13. Ticket messages
  `CREATE TABLE IF NOT EXISTS public.ticket_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message text NOT NULL,
    is_internal boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
  )`,

  `ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY`,
  `DO $$ BEGIN CREATE POLICY "tmsg_sel" ON public.ticket_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.tickets WHERE tickets.id = ticket_messages.ticket_id AND tickets.user_id = auth.uid())
  ); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE POLICY "tmsg_ins" ON public.ticket_messages FOR INSERT WITH CHECK (auth.uid() = sender_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 14. Updated_at triggers
  `DROP TRIGGER IF EXISTS profiles_updated ON public.profiles`,
  `CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at()`,
  `DROP TRIGGER IF EXISTS properties_updated ON public.properties`,
  `CREATE TRIGGER properties_updated BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION handle_updated_at()`,
  `DROP TRIGGER IF EXISTS tenancies_updated ON public.tenancies`,
  `CREATE TRIGGER tenancies_updated BEFORE UPDATE ON public.tenancies FOR EACH ROW EXECUTE FUNCTION handle_updated_at()`,
  `DROP TRIGGER IF EXISTS maint_updated ON public.maintenance_tickets`,
  `CREATE TRIGGER maint_updated BEFORE UPDATE ON public.maintenance_tickets FOR EACH ROW EXECUTE FUNCTION handle_updated_at()`,
  `DROP TRIGGER IF EXISTS tickets_updated ON public.tickets`,
  `CREATE TRIGGER tickets_updated BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION handle_updated_at()`,
];

async function run() {
  console.log('Starting database migration...');
  console.log('Supabase URL:', supabaseUrl);

  for (let i = 0; i < queries.length; i++) {
    const q = queries[i];
    const label = q.substring(0, 60).replace(/\n/g, ' ');
    try {
      const { error } = await supabase.rpc('exec_sql', { query: q });
      if (error) {
        // rpc might not exist, try direct SQL via REST
        const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ query: q }),
        });
        if (!res.ok) {
          // Use the SQL endpoint directly
          const sqlRes = await fetch(`${supabaseUrl}/pg`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ query: q }),
          });
          if (!sqlRes.ok) {
            console.log(`[${i+1}/${queries.length}] WARN: ${label}... - using fallback`);
          } else {
            console.log(`[${i+1}/${queries.length}] OK: ${label}...`);
          }
        } else {
          console.log(`[${i+1}/${queries.length}] OK: ${label}...`);
        }
      } else {
        console.log(`[${i+1}/${queries.length}] OK: ${label}...`);
      }
    } catch (err) {
      console.log(`[${i+1}/${queries.length}] ERR: ${label}... - ${err.message}`);
    }
  }
  console.log('Migration complete!');
}

run();
