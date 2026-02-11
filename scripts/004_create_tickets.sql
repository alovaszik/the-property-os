-- Support tickets table
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in ('account', 'billing', 'technical', 'feature_request', 'name_change', 'country_change', 'other')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status text not null check (status in ('open', 'in_progress', 'waiting', 'resolved', 'closed')) default 'open',
  assigned_to uuid references auth.users(id),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Ticket messages table
create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  is_support boolean not null default false,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;

-- Tickets RLS Policies
create policy "tickets_select_own" on public.tickets 
  for select using (auth.uid() = user_id);

create policy "tickets_insert_own" on public.tickets 
  for insert with check (auth.uid() = user_id);

create policy "tickets_update_own" on public.tickets 
  for update using (auth.uid() = user_id);

-- Allow support to view and update all tickets
create policy "tickets_select_support" on public.tickets 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('support', 'manager', 'owner')
    )
  );

create policy "tickets_update_support" on public.tickets 
  for update using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('support', 'manager', 'owner')
    )
  );

-- Ticket messages RLS Policies
create policy "ticket_messages_select_own" on public.ticket_messages 
  for select using (
    exists (
      select 1 from public.tickets 
      where id = ticket_id 
      and user_id = auth.uid()
    )
  );

create policy "ticket_messages_insert_own" on public.ticket_messages 
  for insert with check (
    exists (
      select 1 from public.tickets 
      where id = ticket_id 
      and user_id = auth.uid()
    )
  );

-- Allow support to view and insert messages on all tickets
create policy "ticket_messages_select_support" on public.ticket_messages 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('support', 'manager', 'owner')
    )
  );

create policy "ticket_messages_insert_support" on public.ticket_messages 
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('support', 'manager', 'owner')
    )
  );

-- Create updated_at trigger for tickets
create trigger tickets_updated_at
  before update on public.tickets
  for each row
  execute function public.handle_updated_at();

-- Create indexes
create index if not exists tickets_user_id_idx on public.tickets(user_id);
create index if not exists tickets_status_idx on public.tickets(status);
create index if not exists tickets_created_at_idx on public.tickets(created_at desc);
create index if not exists ticket_messages_ticket_id_idx on public.ticket_messages(ticket_id);
create index if not exists ticket_messages_created_at_idx on public.ticket_messages(created_at);
