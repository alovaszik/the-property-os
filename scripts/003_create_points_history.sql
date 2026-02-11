-- Points history for tracking RentDuo points
create table if not exists public.points_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  points integer not null,
  reason text not null,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.points_history enable row level security;

-- RLS Policies
create policy "points_history_select_own" on public.points_history 
  for select using (auth.uid() = user_id);

-- Only the system (or support staff) can insert points
create policy "points_history_insert_support" on public.points_history 
  for insert with check (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('support', 'manager', 'owner')
    )
  );

-- Allow support to view all points history
create policy "points_history_select_support" on public.points_history 
  for select using (
    exists (
      select 1 from public.profiles 
      where id = auth.uid() 
      and role in ('support', 'manager', 'owner')
    )
  );

-- Create index for performance
create index if not exists points_history_user_id_idx on public.points_history(user_id);
create index if not exists points_history_created_at_idx on public.points_history(created_at desc);
