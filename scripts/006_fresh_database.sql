-- RentDuo Complete Database Schema (Fresh Install)
-- This creates all tables from scratch for a new Supabase project

-- ============================================================
-- 0. Utility function for updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============================================================
-- 1. Profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role text NOT NULL CHECK (role IN ('tenant','landlord','support','manager','owner')) DEFAULT 'tenant',
  country text NOT NULL DEFAULT 'DE',
  currency text NOT NULL DEFAULT 'EUR',
  language text NOT NULL DEFAULT 'en',
  points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);
CREATE POLICY "profiles_select_staff" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('support','manager','owner'))
);

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 2. Auto-create profile on signup trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, country, currency, language, onboarding_completed)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'tenant'),
    coalesce(new.raw_user_meta_data ->> 'country', 'DE'),
    coalesce(new.raw_user_meta_data ->> 'currency', 'EUR'),
    coalesce(new.raw_user_meta_data ->> 'language', 'en'),
    coalesce((new.raw_user_meta_data ->> 'onboarding_completed')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. Points History
-- ============================================================
CREATE TABLE IF NOT EXISTS public.points_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "points_select_own" ON public.points_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "points_insert_staff" ON public.points_history FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('support','manager','owner'))
);
CREATE POLICY "points_select_staff" ON public.points_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('support','manager','owner'))
);

CREATE INDEX IF NOT EXISTS idx_points_user ON public.points_history(user_id);

-- ============================================================
-- 4. Support Tickets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('account','billing','technical','feature_request','name_change','country_change','other')),
  priority text NOT NULL CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  status text NOT NULL CHECK (status IN ('open','in_progress','waiting','resolved','closed')) DEFAULT 'open',
  assigned_to uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tickets_select_own" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tickets_insert_own" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tickets_update_own" ON public.tickets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tickets_select_staff" ON public.tickets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('support','manager','owner'))
);
CREATE POLICY "tickets_update_staff" ON public.tickets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('support','manager','owner'))
);

CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);

-- ============================================================
-- 5. Ticket Messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_support boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tmsg_select_own" ON public.ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.tickets WHERE id = ticket_id AND user_id = auth.uid())
);
CREATE POLICY "tmsg_insert_own" ON public.ticket_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tickets WHERE id = ticket_id AND user_id = auth.uid())
);
CREATE POLICY "tmsg_select_staff" ON public.ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('support','manager','owner'))
);
CREATE POLICY "tmsg_insert_staff" ON public.ticket_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('support','manager','owner'))
);

CREATE INDEX IF NOT EXISTS idx_tmsg_ticket ON public.ticket_messages(ticket_id);

-- ============================================================
-- 6. Properties
-- ============================================================
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
CREATE POLICY "prop_select_own" ON public.properties FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "prop_insert_own" ON public.properties FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "prop_update_own" ON public.properties FOR UPDATE USING (auth.uid() = landlord_id);
CREATE POLICY "prop_delete_own" ON public.properties FOR DELETE USING (auth.uid() = landlord_id);

CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 7. Tenancies (links tenant + landlord + property)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tenancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit text NOT NULL DEFAULT 'Unit 1',
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
CREATE POLICY "ten_select_landlord" ON public.tenancies FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "ten_insert_landlord" ON public.tenancies FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "ten_update_landlord" ON public.tenancies FOR UPDATE USING (auth.uid() = landlord_id);
CREATE POLICY "ten_delete_landlord" ON public.tenancies FOR DELETE USING (auth.uid() = landlord_id);
CREATE POLICY "ten_select_tenant" ON public.tenancies FOR SELECT USING (auth.uid() = tenant_id);

CREATE TRIGGER tenancies_updated_at BEFORE UPDATE ON public.tenancies
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 8. Payments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  method text NOT NULL DEFAULT 'manual' CHECK (method IN ('manual','auto_pay','bank_transfer','card')),
  status text NOT NULL CHECK (status IN ('completed','pending','overdue','failed')) DEFAULT 'pending',
  due_date date NOT NULL,
  paid_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pay_select_landlord" ON public.payments FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "pay_insert_landlord" ON public.payments FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "pay_select_tenant" ON public.payments FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "pay_insert_tenant" ON public.payments FOR INSERT WITH CHECK (auth.uid() = tenant_id);
CREATE POLICY "pay_update_tenant" ON public.payments FOR UPDATE USING (auth.uid() = tenant_id);

CREATE INDEX IF NOT EXISTS idx_pay_tenancy ON public.payments(tenancy_id);
CREATE INDEX IF NOT EXISTS idx_pay_tenant ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pay_landlord ON public.payments(landlord_id);

-- ============================================================
-- 9. Maintenance Tickets (property issues)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.maintenance_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  priority text NOT NULL CHECK (priority IN ('low','medium','high','urgent')) DEFAULT 'medium',
  status text NOT NULL CHECK (status IN ('open','in_progress','resolved','closed')) DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.maintenance_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mt_select_landlord" ON public.maintenance_tickets FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "mt_update_landlord" ON public.maintenance_tickets FOR UPDATE USING (auth.uid() = landlord_id);
CREATE POLICY "mt_select_tenant" ON public.maintenance_tickets FOR SELECT USING (auth.uid() = tenant_id);
CREATE POLICY "mt_insert_tenant" ON public.maintenance_tickets FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE TRIGGER mt_updated_at BEFORE UPDATE ON public.maintenance_tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 10. Documents
-- ============================================================
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
CREATE POLICY "doc_select_landlord" ON public.documents FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "doc_insert_landlord" ON public.documents FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "doc_delete_landlord" ON public.documents FOR DELETE USING (auth.uid() = landlord_id);
CREATE POLICY "doc_select_tenant" ON public.documents FOR SELECT USING (auth.uid() = tenant_id);

-- ============================================================
-- 11. Statements (overhead / billing)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period text NOT NULL,
  rent numeric(12,2) NOT NULL DEFAULT 0,
  utilities numeric(12,2) NOT NULL DEFAULT 0,
  water numeric(12,2) NOT NULL DEFAULT 0,
  parking numeric(12,2) NOT NULL DEFAULT 0,
  other numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  paid boolean NOT NULL DEFAULT false,
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stmt_select_landlord" ON public.statements FOR SELECT USING (auth.uid() = landlord_id);
CREATE POLICY "stmt_insert_landlord" ON public.statements FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "stmt_select_tenant" ON public.statements FOR SELECT USING (auth.uid() = tenant_id);

-- ============================================================
-- 12. Activity Log
-- ============================================================
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
CREATE POLICY "actlog_select_own" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "actlog_insert_own" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
