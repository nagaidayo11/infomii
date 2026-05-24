-- BtoC mobile: bookmark (= like) per user. Supports published informations and sample slugs.

create table if not exists public.information_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  information_id uuid references public.informations(id) on delete cascade,
  sample_id text,
  created_at timestamptz not null default now(),
  constraint information_saves_target_check check (
    information_id is not null or (sample_id is not null and length(trim(sample_id)) > 0)
  )
);

create unique index if not exists information_saves_user_information_uidx
  on public.information_saves (user_id, information_id)
  where information_id is not null;

create unique index if not exists information_saves_user_sample_uidx
  on public.information_saves (user_id, sample_id)
  where sample_id is not null;

create index if not exists information_saves_information_id_idx
  on public.information_saves (information_id)
  where information_id is not null;

create index if not exists information_saves_sample_id_idx
  on public.information_saves (sample_id)
  where sample_id is not null;

alter table public.information_saves enable row level security;

drop policy if exists "users manage own saves" on public.information_saves;
create policy "users manage own saves"
on public.information_saves
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Aggregate counts for published pages (no user_id exposed)
create or replace view public.information_save_stats as
select
  information_id,
  count(*)::int as save_count
from public.information_saves
where information_id is not null
group by information_id;

grant select on public.information_save_stats to anon, authenticated;

drop policy if exists "public read sample save stats" on public.information_saves;
create policy "public read sample save stats"
on public.information_saves
for select
to anon, authenticated
using (sample_id is not null);
