-- RentDuo Full Schema
-- Run this once the Supabase DB is accessible

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- 1. Properties
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
DROP POLICY IF EXISTS "properties_select_own" ON public.properties;
CREATE POLICY "properties_select_own" ON public.properties FOR SELECT USING (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "properties_insert_own" ON public.properties;
CREATE POLICY "properties_insert_own" ON public.properties FOR INSERT WITH CHECK (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "properties_update_own" ON public.properties;
CREATE POLICY "properties_update_own" ON public.properties FOR UPDATE USING (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "properties_delete_own" ON public.properties;
CREATE POLICY "properties_delete_own" ON public.properties FOR DELETE USING (auth.uid() = landlord_id);
DROP TRIGGER IF EXISTS properties_updated_at ON public.properties;
CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Tenancies
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
DROP POLICY IF EXISTS "tenancies_select_landlord" ON public.tenancies;
CREATE POLICY "tenancies_select_landlord" ON public.tenancies FOR SELECT USING (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "tenancies_insert_landlord" ON public.tenancies;
CREATE POLICY "tenancies_insert_landlord" ON public.tenancies FOR INSERT WITH CHECK (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "tenancies_update_landlord" ON public.tenancies;
CREATE POLICY "tenancies_update_landlord" ON public.tenancies FOR UPDATE USING (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "tenancies_delete_landlord" ON public.tenancies;
CREATE POLICY "tenancies_delete_landlord" ON public.tenancies FOR DELETE USING (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "tenancies_select_tenant" ON public.tenancies;
CREATE POLICY "tenancies_select_tenant" ON public.tenancies FOR SELECT USING (auth.uid() = tenant_id);
DROP TRIGGER IF EXISTS tenancies_updated_at ON public.tenancies;
CREATE TRIGGER tenancies_updated_at BEFORE UPDATE ON public.tenancies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  method text NOT NULL DEFAULT 'manual' CHECK (method IN ('manual','auto-pay','bank_transfer','card')),
  status text NOT NULL CHECK (status IN ('completed','pending','overdue','failed')) DEFAULT 'pending',
  due_date date NOT NULL,
  paid_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payments_select_landlord" ON public.payments;
CREATE POLICY "payments_select_landlord" ON public.payments FOR SELECT USING (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "payments_insert_landlord" ON public.payments;
CREATE POLICY "payments_insert_landlord" ON public.payments FOR INSERT WITH CHECK (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "payments_select_tenant" ON public.payments;
CREATE POLICY "payments_select_tenant" ON public.payments FOR SELECT USING (auth.uid() = tenant_id);
DROP POLICY IF EXISTS "payments_insert_tenant" ON public.payments;
CREATE POLICY "payments_insert_tenant" ON public.payments FOR INSERT WITH CHECK (auth.uid() = tenant_id);

-- 4. Maintenance Tickets
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
DROP POLICY IF EXISTS "maint_select_landlord" ON public.maintenance_tickets;
CREATE POLICY "maint_select_landlord" ON public.maintenance_tickets FOR SELECT USING (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "maint_update_landlord" ON public.maintenance_tickets;
CREATE POLICY "maint_update_landlord" ON public.maintenance_tickets FOR UPDATE USING (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "maint_select_tenant" ON public.maintenance_tickets;
CREATE POLICY "maint_select_tenant" ON public.maintenance_tickets FOR SELECT USING (auth.uid() = tenant_id);
DROP POLICY IF EXISTS "maint_insert_tenant" ON public.maintenance_tickets;
CREATE POLICY "maint_insert_tenant" ON public.maintenance_tickets FOR INSERT WITH CHECK (auth.uid() = tenant_id);
DROP TRIGGER IF EXISTS maint_updated_at ON public.maintenance_tickets;
CREATE TRIGGER maint_updated_at BEFORE UPDATE ON public.maintenance_tickets FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Documents
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
DROP POLICY IF EXISTS "docs_select_landlord" ON public.documents;
CREATE POLICY "docs_select_landlord" ON public.documents FOR SELECT USING (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "docs_insert_landlord" ON public.documents;
CREATE POLICY "docs_insert_landlord" ON public.documents FOR INSERT WITH CHECK (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "docs_select_tenant" ON public.documents;
CREATE POLICY "docs_select_tenant" ON public.documents FOR SELECT USING (auth.uid() = tenant_id);

-- 6. Statements
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
DROP POLICY IF EXISTS "stmt_select_landlord" ON public.statements;
CREATE POLICY "stmt_select_landlord" ON public.statements FOR SELECT USING (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "stmt_insert_landlord" ON public.statements;
CREATE POLICY "stmt_insert_landlord" ON public.statements FOR INSERT WITH CHECK (auth.uid() = landlord_id);
DROP POLICY IF EXISTS "stmt_select_tenant" ON public.statements;
CREATE POLICY "stmt_select_tenant" ON public.statements FOR SELECT USING (auth.uid() = tenant_id);

-- 7. Activity Log
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
DROP POLICY IF EXISTS "activity_select_own" ON public.activity_log;
CREATE POLICY "activity_select_own" ON public.activity_log FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "activity_insert_own" ON public.activity_log;
CREATE POLICY "activity_insert_own" ON public.activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);
