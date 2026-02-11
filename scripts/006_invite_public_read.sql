-- Allow anyone to read unused, non-expired invitations by token
-- This is needed so unauthenticated tenants can view their invite details
create policy "invitations_select_by_token" on public.invitations
  for select using (
    used = false 
    and expires_at > now()
  );

-- Allow the mark-used API to update any invitation (the API validates the token)
create policy "invitations_update_by_token" on public.invitations
  for update using (
    used = false
  );
