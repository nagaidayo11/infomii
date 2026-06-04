-- Expo push tokens from the native app shell (optional notifications)
create table if not exists public.push_device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null,
  platform text,
  updated_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

create index if not exists push_device_tokens_user_id_idx on public.push_device_tokens (user_id);

alter table public.push_device_tokens enable row level security;

drop policy if exists "push_tokens_select_own" on public.push_device_tokens;
create policy "push_tokens_select_own"
on public.push_device_tokens
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "push_tokens_insert_own" on public.push_device_tokens;
create policy "push_tokens_insert_own"
on public.push_device_tokens
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "push_tokens_update_own" on public.push_device_tokens;
create policy "push_tokens_update_own"
on public.push_device_tokens
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "push_tokens_delete_own" on public.push_device_tokens;
create policy "push_tokens_delete_own"
on public.push_device_tokens
for delete
to authenticated
using (user_id = auth.uid());
