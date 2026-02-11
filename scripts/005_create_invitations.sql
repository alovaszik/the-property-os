-- Invitations table for landlord-to-tenant invite links
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  landlord_id uuid not null references auth.users(id) on delete cascade,
  tenant_name text not null,
  tenant_email text not null,
  tenant_phone text,
  property_name text,
  unit text,
  monthly_rent numeric,
  currency text default 'EUR',
  used boolean default false,
  used_by uuid references auth.users(id),
  used_at timestamp with time zone,
  expires_at timestamp with time zone default (now() + interval '7 days'),
  created_at timestamp with time zone default now()
);

alter table public.invitations enable row level security;

-- Landlords can see and manage their own invitations
create policy "invitations_select_own" on public.invitations
  for select using (auth.uid() = landlord_id);

create policy "invitations_insert_own" on public.invitations
  for insert with check (auth.uid() = landlord_id);

create policy "invitations_update_own" on public.invitations
  for update using (auth.uid() = landlord_id);

create policy "invitations_delete_own" on public.invitations
  for delete using (auth.uid() = landlord_id);

-- Anyone can read an invitation by token (for the registration page)
-- This is handled via a server route with service role, not RLS
