create extension if not exists pgcrypto;

create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.hotel_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.informations (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid references public.hotels(id) on delete cascade,
  title text not null,
  body text not null default '',
  images text[] not null default '{}',
  content_blocks jsonb not null default '[]'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  publish_at timestamptz,
  unpublish_at timestamptz,
  slug text not null unique,
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null unique references public.hotels(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active' check (status in ('trialing', 'active', 'past_due', 'canceled')),
  max_published_pages integer not null default 3 check (max_published_pages >= 0),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.information_views (
  id uuid primary key default gen_random_uuid(),
  information_id uuid not null references public.informations(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  slug text not null,
  source text not null default 'direct',
  referrer text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.informations
add column if not exists hotel_id uuid references public.hotels(id) on delete cascade;
alter table public.informations
add column if not exists publish_at timestamptz;
alter table public.informations
add column if not exists unpublish_at timestamptz;
alter table public.informations
add column if not exists content_blocks jsonb not null default '[]'::jsonb;
alter table public.informations
add column if not exists theme jsonb not null default '{}'::jsonb;
alter table public.hotels
add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
alter table public.subscriptions
add column if not exists plan text not null default 'free';
alter table public.subscriptions
add column if not exists status text not null default 'active';
alter table public.subscriptions
add column if not exists max_published_pages integer not null default 3;
alter table public.subscriptions
add column if not exists updated_at timestamptz not null default now();
alter table public.subscriptions
add column if not exists stripe_customer_id text;
alter table public.subscriptions
add column if not exists stripe_subscription_id text;
alter table public.subscriptions
add column if not exists stripe_price_id text;
alter table public.subscriptions
add column if not exists current_period_end timestamptz;
alter table public.information_views
add column if not exists information_id uuid references public.informations(id) on delete cascade;
alter table public.information_views
add column if not exists hotel_id uuid references public.hotels(id) on delete cascade;
alter table public.information_views
add column if not exists slug text;
alter table public.information_views
add column if not exists source text not null default 'direct';
alter table public.information_views
add column if not exists referrer text;
alter table public.information_views
add column if not exists user_agent text;
alter table public.information_views
add column if not exists created_at timestamptz not null default now();

-- QR analytics: page views for public pages (/p/[slug])
create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.informations(id) on delete cascade,
  country text not null default '',
  language text not null default '',
  viewed_at timestamptz not null default now(),
  device text not null default ''
);
create index if not exists page_views_page_id_idx on public.page_views (page_id);
create index if not exists page_views_viewed_at_idx on public.page_views (viewed_at desc);
alter table public.page_views enable row level security;

alter table public.audit_logs
add column if not exists hotel_id uuid references public.hotels(id) on delete cascade;
alter table public.audit_logs
add column if not exists actor_user_id uuid references auth.users(id) on delete set null;
alter table public.audit_logs
add column if not exists action text;
alter table public.audit_logs
add column if not exists target_type text;
alter table public.audit_logs
add column if not exists target_id text;
alter table public.audit_logs
add column if not exists message text;
alter table public.audit_logs
add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.audit_logs
add column if not exists created_at timestamptz not null default now();

alter table public.hotels enable row level security;
alter table public.hotel_memberships enable row level security;
alter table public.informations enable row level security;
alter table public.subscriptions enable row level security;
alter table public.information_views enable row level security;
alter table public.audit_logs enable row level security;

update public.hotels h
set owner_user_id = m.user_id
from public.hotel_memberships m
where h.owner_user_id is null
  and m.hotel_id = h.id;

insert into public.subscriptions (hotel_id, plan, status, max_published_pages)
select h.id, 'free', 'active', 3
from public.hotels h
where not exists (
  select 1 from public.subscriptions s where s.hotel_id = h.id
);

create or replace function public.current_hotel_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select hotel_id
  from public.hotel_memberships
  where user_id = auth.uid()
  limit 1
$$;

revoke all on function public.current_hotel_id() from public;
grant execute on function public.current_hotel_id() to anon, authenticated;

create or replace function public.ensure_hotel_subscription(target_hotel_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  sub_id uuid;
begin
  if target_hotel_id is null then
    raise exception 'missing_hotel_id';
  end if;

  select id
  into sub_id
  from public.subscriptions
  where hotel_id = target_hotel_id
  limit 1;

  if sub_id is not null then
    return sub_id;
  end if;

  insert into public.subscriptions (hotel_id, plan, status, max_published_pages)
  values (target_hotel_id, 'free', 'active', 3)
  returning id into sub_id;

  return sub_id;
end;
$$;

revoke all on function public.ensure_hotel_subscription(uuid) from public;
grant execute on function public.ensure_hotel_subscription(uuid) to authenticated;

drop policy if exists "public read published" on public.informations;
drop policy if exists "allow all anon for mvp" on public.informations;
drop policy if exists "allow all authenticated for mvp" on public.informations;
drop policy if exists "authenticated read own hotel" on public.informations;
drop policy if exists "authenticated insert own hotel" on public.informations;
drop policy if exists "authenticated update own hotel" on public.informations;
drop policy if exists "authenticated delete own hotel" on public.informations;

drop policy if exists "authenticated create hotels" on public.hotels;
drop policy if exists "authenticated read own hotels" on public.hotels;
drop policy if exists "authenticated update own hotels" on public.hotels;
drop policy if exists "authenticated create own hotels" on public.hotels;

drop policy if exists "authenticated read own memberships" on public.hotel_memberships;
drop policy if exists "authenticated insert own memberships" on public.hotel_memberships;
drop policy if exists "authenticated update own memberships" on public.hotel_memberships;
drop policy if exists "authenticated delete own memberships" on public.hotel_memberships;
drop policy if exists "authenticated insert first membership from owned hotel" on public.hotel_memberships;
drop policy if exists "authenticated read own subscriptions" on public.subscriptions;
drop policy if exists "authenticated create own subscriptions" on public.subscriptions;
drop policy if exists "authenticated update own subscriptions" on public.subscriptions;
drop policy if exists "authenticated delete own subscriptions" on public.subscriptions;
drop policy if exists "public insert published information views" on public.information_views;
drop policy if exists "authenticated read own information views" on public.information_views;
drop policy if exists "page_views anon insert published" on public.page_views;
drop policy if exists "page_views authenticated read own hotel" on public.page_views;
drop policy if exists "authenticated insert own audit logs" on public.audit_logs;
drop policy if exists "authenticated read own audit logs" on public.audit_logs;

create policy "public read published"
on public.informations
for select
to anon
using (
  status = 'published'
  and (publish_at is null or publish_at <= now())
  and (unpublish_at is null or unpublish_at > now())
);

create policy "authenticated read own hotel"
on public.informations
for select
to authenticated
using (hotel_id = public.current_hotel_id());

create policy "authenticated insert own hotel"
on public.informations
for insert
to authenticated
with check (hotel_id = public.current_hotel_id());

create policy "authenticated update own hotel"
on public.informations
for update
to authenticated
using (hotel_id = public.current_hotel_id())
with check (hotel_id = public.current_hotel_id());

create policy "authenticated delete own hotel"
on public.informations
for delete
to authenticated
using (hotel_id = public.current_hotel_id());

create policy "authenticated create own hotels"
on public.hotels
for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy "authenticated read own hotels"
on public.hotels
for select
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = hotels.id
      and m.user_id = auth.uid()
  )
);

create policy "authenticated update own hotels"
on public.hotels
for update
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = hotels.id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = hotels.id
      and m.user_id = auth.uid()
  )
);


create policy "authenticated read own memberships"
on public.hotel_memberships
for select
to authenticated
using (user_id = auth.uid());

create policy "authenticated insert first membership from owned hotel"
on public.hotel_memberships
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.hotels h
    where h.id = hotel_memberships.hotel_id
      and h.owner_user_id = auth.uid()
  )
);

create policy "authenticated update own memberships"
on public.hotel_memberships
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "authenticated delete own memberships"
on public.hotel_memberships
for delete
to authenticated
using (user_id = auth.uid());

create policy "authenticated read own subscriptions"
on public.subscriptions
for select
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = subscriptions.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "authenticated create own subscriptions"
on public.subscriptions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = subscriptions.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "authenticated update own subscriptions"
on public.subscriptions
for update
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = subscriptions.hotel_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = subscriptions.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "authenticated delete own subscriptions"
on public.subscriptions
for delete
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = subscriptions.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "public insert published information views"
on public.information_views
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.informations i
    where i.id = information_views.information_id
      and i.hotel_id = information_views.hotel_id
      and i.slug = information_views.slug
      and i.status = 'published'
      and (i.publish_at is null or i.publish_at <= now())
      and (i.unpublish_at is null or i.unpublish_at > now())
  )
);

create policy "authenticated read own information views"
on public.information_views
for select
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = information_views.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "page_views anon insert published"
on public.page_views
for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.informations i
    where i.id = page_views.page_id
      and i.status = 'published'
      and (i.publish_at is null or i.publish_at <= now())
      and (i.unpublish_at is null or i.unpublish_at > now())
  )
);

create policy "page_views authenticated read own hotel"
on public.page_views
for select
to authenticated
using (
  exists (
    select 1
    from public.informations i
    join public.hotel_memberships m on m.hotel_id = i.hotel_id and m.user_id = auth.uid()
    where i.id = page_views.page_id
  )
);

create policy "authenticated insert own audit logs"
on public.audit_logs
for insert
to authenticated
with check (
  actor_user_id = auth.uid()
  and exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = audit_logs.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "authenticated read own audit logs"
on public.audit_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = audit_logs.hotel_id
      and m.user_id = auth.uid()
  )
);

-- Week2 Day3: staff invite flow
create table if not exists public.hotel_invites (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  code text not null,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  consumed_by_user_id uuid references auth.users(id) on delete set null,
  consumed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.hotel_invites
add column if not exists hotel_id uuid references public.hotels(id) on delete cascade;
alter table public.hotel_invites
add column if not exists code text;
alter table public.hotel_invites
add column if not exists created_by_user_id uuid references auth.users(id) on delete cascade;
alter table public.hotel_invites
add column if not exists is_active boolean not null default true;
alter table public.hotel_invites
add column if not exists consumed_by_user_id uuid references auth.users(id) on delete set null;
alter table public.hotel_invites
add column if not exists consumed_at timestamptz;
alter table public.hotel_invites
add column if not exists expires_at timestamptz;
alter table public.hotel_invites
add column if not exists created_at timestamptz not null default now();

create unique index if not exists hotel_invites_code_key on public.hotel_invites (code);
create index if not exists hotel_invites_hotel_created_idx on public.hotel_invites (hotel_id, created_at desc);

alter table public.hotel_invites enable row level security;

drop policy if exists "authenticated read own hotel invites" on public.hotel_invites;
drop policy if exists "authenticated insert own hotel invites" on public.hotel_invites;
drop policy if exists "authenticated update own hotel invites" on public.hotel_invites;
drop policy if exists "authenticated delete own hotel invites" on public.hotel_invites;

create policy "authenticated read own hotel invites"
on public.hotel_invites
for select
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = hotel_invites.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "authenticated insert own hotel invites"
on public.hotel_invites
for insert
to authenticated
with check (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = hotel_invites.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "authenticated update own hotel invites"
on public.hotel_invites
for update
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = hotel_invites.hotel_id
      and m.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = hotel_invites.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "authenticated delete own hotel invites"
on public.hotel_invites
for delete
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = hotel_invites.hotel_id
      and m.user_id = auth.uid()
  )
);

create or replace function public.redeem_hotel_invite(input_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.hotel_invites%rowtype;
  current_user_id uuid;
  normalized_code text;
begin
  current_user_id := auth.uid();
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  normalized_code := upper(trim(input_code));
  if normalized_code is null or normalized_code = '' then
    raise exception 'invalid_invite_code';
  end if;

  select *
  into invite_row
  from public.hotel_invites
  where code = normalized_code
  for update;

  if not found then
    raise exception 'invite_not_found';
  end if;
  if invite_row.is_active is not true then
    raise exception 'invite_inactive';
  end if;
  if invite_row.consumed_at is not null then
    raise exception 'invite_already_used';
  end if;
  if invite_row.expires_at is not null and invite_row.expires_at <= now() then
    raise exception 'invite_expired';
  end if;

  insert into public.hotel_memberships (user_id, hotel_id)
  values (current_user_id, invite_row.hotel_id)
  on conflict (user_id) do update
  set hotel_id = excluded.hotel_id;

  update public.hotel_invites
  set
    is_active = false,
    consumed_by_user_id = current_user_id,
    consumed_at = now()
  where id = invite_row.id;

  return invite_row.hotel_id;
end;
$$;

revoke all on function public.redeem_hotel_invite(text) from public;
grant execute on function public.redeem_hotel_invite(text) to authenticated;
