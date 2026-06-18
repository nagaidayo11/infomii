-- Security Advisor: resolve splinter warnings (RLS anonymous, definer RPC, storage listing, search_path).

-- ---------------------------------------------------------------------------
-- 1) Pin search_path on trigger function
-- ---------------------------------------------------------------------------
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2) current_hotel_id: SECURITY INVOKER (used only inside RLS; no public RPC)
-- ---------------------------------------------------------------------------
create or replace function public.current_hotel_id()
returns uuid
language sql
stable
security invoker
set search_path = public
as $$
  select hotel_id
  from public.hotel_memberships
  where user_id = auth.uid()
  limit 1
$$;

revoke all on function public.current_hotel_id() from public;
grant execute on function public.current_hotel_id() to authenticated;

-- ---------------------------------------------------------------------------
-- 3) Move privileged RPCs to private schema (service_role only; not browser RPC)
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to service_role;

create or replace function private.ensure_hotel_subscription(target_hotel_id uuid)
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
    update public.subscriptions
    set max_published_pages = 3
    where id = sub_id
      and plan = 'free'
      and max_published_pages <> 3;
    return sub_id;
  end if;

  insert into public.subscriptions (hotel_id, plan, status, max_published_pages)
  values (target_hotel_id, 'free', 'active', 3)
  returning id into sub_id;

  return sub_id;
end;
$$;

create or replace function private.bootstrap_user_workspace(
  caller_user_id uuid,
  default_name text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := caller_user_id;
  existing_hotel_id uuid;
  owned_hotel_id uuid;
  new_hotel_id uuid;
  hotel_name text;
  user_email text;
  email_label text;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;

  select m.hotel_id
  into existing_hotel_id
  from public.hotel_memberships m
  where m.user_id = uid
  limit 1;

  if existing_hotel_id is not null then
    perform private.ensure_hotel_subscription(existing_hotel_id);
    return existing_hotel_id;
  end if;

  select h.id
  into owned_hotel_id
  from public.hotels h
  where h.owner_user_id = uid
  order by h.created_at asc
  limit 1;

  if owned_hotel_id is not null then
    insert into public.hotel_memberships (user_id, hotel_id, role)
    values (uid, owned_hotel_id, 'editor')
    on conflict (user_id) do update
      set hotel_id = excluded.hotel_id;
    perform private.ensure_hotel_subscription(owned_hotel_id);
    return owned_hotel_id;
  end if;

  select u.email
  into user_email
  from auth.users u
  where u.id = uid;

  email_label := nullif(split_part(coalesce(user_email, ''), '@', 1), '');
  hotel_name := coalesce(
    nullif(trim(default_name), ''),
    case
      when email_label is not null then email_label || ' Store'
      else 'My Store'
    end
  );

  new_hotel_id := gen_random_uuid();

  insert into public.hotels (id, name, owner_user_id)
  values (new_hotel_id, hotel_name, uid);

  insert into public.hotel_memberships (user_id, hotel_id, role)
  values (uid, new_hotel_id, 'editor');

  perform private.ensure_hotel_subscription(new_hotel_id);

  insert into public.profiles (user_id, display_name)
  values (uid, coalesce(email_label, 'User'))
  on conflict (user_id) do nothing;

  return new_hotel_id;
exception
  when unique_violation then
    select m.hotel_id
    into existing_hotel_id
    from public.hotel_memberships m
    where m.user_id = uid
    limit 1;
    if existing_hotel_id is null then
      raise;
    end if;
    perform private.ensure_hotel_subscription(existing_hotel_id);
    return existing_hotel_id;
end;
$$;

create or replace function private.redeem_hotel_invite(
  caller_user_id uuid,
  input_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_row public.hotel_invites%rowtype;
  current_user_id uuid := caller_user_id;
  normalized_code text;
  invite_role text;
  member_count int;
  max_members int := 10;
begin
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

  select count(*)::int
  into member_count
  from public.hotel_memberships
  where hotel_id = invite_row.hotel_id;

  if not exists (
    select 1 from public.hotel_memberships
    where user_id = current_user_id and hotel_id = invite_row.hotel_id
  ) and member_count >= max_members then
    raise exception 'team_member_limit';
  end if;

  invite_role := coalesce(invite_row.role, 'editor');
  if invite_role not in ('admin', 'editor', 'viewer') then
    invite_role := 'editor';
  end if;

  insert into public.hotel_memberships (user_id, hotel_id, role)
  values (current_user_id, invite_row.hotel_id, invite_role)
  on conflict (user_id) do update
  set hotel_id = excluded.hotel_id, role = excluded.role;

  update public.hotel_invites
  set
    is_active = false,
    consumed_by_user_id = current_user_id,
    consumed_at = now()
  where id = invite_row.id;

  return invite_row.hotel_id;
end;
$$;

revoke all on function private.ensure_hotel_subscription(uuid) from public;
revoke all on function private.bootstrap_user_workspace(uuid, text) from public;
revoke all on function private.redeem_hotel_invite(uuid, text) from public;
grant execute on function private.ensure_hotel_subscription(uuid) to service_role;
grant execute on function private.bootstrap_user_workspace(uuid, text) to service_role;
grant execute on function private.redeem_hotel_invite(uuid, text) to service_role;

drop function if exists public.bootstrap_user_workspace(text);
drop function if exists public.redeem_hotel_invite(text);
drop function if exists public.ensure_hotel_subscription(uuid);

-- ---------------------------------------------------------------------------
-- 4) Storage: disable public listing; allow direct object reads
-- ---------------------------------------------------------------------------
update storage.buckets
set public = false
where id = 'page-assets';

drop policy if exists "Public read page assets" on storage.objects;
drop policy if exists "anon read page assets" on storage.objects;
drop policy if exists "authenticated read page assets" on storage.objects;

create policy "anon read page assets"
on storage.objects
for select
to anon
using (bucket_id = 'page-assets');

create policy "authenticated read page assets"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'page-assets'
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (
      select 1 from public.hotel_memberships m where m.user_id = auth.uid()
    )
  )
);

-- ---------------------------------------------------------------------------
-- 5) RLS: distinguish permanent vs anonymous authenticated users (splinter 0012)
--    Guard: permanent user OR user with hotel membership (invite / bootstrap).
-- ---------------------------------------------------------------------------

-- informations
drop policy if exists "authenticated read own hotel" on public.informations;
drop policy if exists "authenticated insert own hotel" on public.informations;
drop policy if exists "authenticated update own hotel" on public.informations;
drop policy if exists "authenticated delete own hotel" on public.informations;

create policy "authenticated read own hotel"
on public.informations for select to authenticated
using (
  hotel_id = public.current_hotel_id()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated insert own hotel"
on public.informations for insert to authenticated
with check (
  hotel_id = public.current_hotel_id()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated update own hotel"
on public.informations for update to authenticated
using (
  hotel_id = public.current_hotel_id()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
)
with check (
  hotel_id = public.current_hotel_id()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated delete own hotel"
on public.informations for delete to authenticated
using (
  hotel_id = public.current_hotel_id()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- hotels
drop policy if exists "authenticated create own hotels" on public.hotels;
drop policy if exists "authenticated read own hotels" on public.hotels;
drop policy if exists "authenticated update own hotels" on public.hotels;

create policy "authenticated create own hotels"
on public.hotels for insert to authenticated
with check (
  owner_user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated read own hotels"
on public.hotels for select to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = hotels.id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated update own hotels"
on public.hotels for update to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = hotels.id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = hotels.id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- hotel_memberships
drop policy if exists "authenticated read own memberships" on public.hotel_memberships;
drop policy if exists "authenticated insert first membership from owned hotel" on public.hotel_memberships;
drop policy if exists "authenticated update own memberships" on public.hotel_memberships;
drop policy if exists "authenticated delete own memberships" on public.hotel_memberships;

create policy "authenticated read own memberships"
on public.hotel_memberships for select to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is true
  )
);

create policy "authenticated insert first membership from owned hotel"
on public.hotel_memberships for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.hotels h
    where h.id = hotel_memberships.hotel_id and h.owner_user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is true
  )
);

create policy "authenticated update own memberships"
on public.hotel_memberships for update to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is true
  )
)
with check (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is true
  )
);

create policy "authenticated delete own memberships"
on public.hotel_memberships for delete to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is true
  )
);

-- subscriptions
drop policy if exists "authenticated read own subscriptions" on public.subscriptions;
drop policy if exists "authenticated create own subscriptions" on public.subscriptions;
drop policy if exists "authenticated update own subscriptions" on public.subscriptions;
drop policy if exists "authenticated delete own subscriptions" on public.subscriptions;

create policy "authenticated read own subscriptions"
on public.subscriptions for select to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = subscriptions.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated create own subscriptions"
on public.subscriptions for insert to authenticated
with check (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = subscriptions.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated update own subscriptions"
on public.subscriptions for update to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = subscriptions.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = subscriptions.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated delete own subscriptions"
on public.subscriptions for delete to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = subscriptions.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- information_views
drop policy if exists "public insert published information views" on public.information_views;
drop policy if exists "authenticated read own information views" on public.information_views;

create policy "anon insert published information views"
on public.information_views for insert to anon
with check (
  exists (
    select 1 from public.informations i
    where i.id = information_views.information_id
      and i.hotel_id = information_views.hotel_id
      and i.slug = information_views.slug
      and i.status = 'published'
      and (i.publish_at is null or i.publish_at <= now())
      and (i.unpublish_at is null or i.unpublish_at > now())
  )
);

create policy "authenticated insert published information views"
on public.information_views for insert to authenticated
with check (
  exists (
    select 1 from public.informations i
    where i.id = information_views.information_id
      and i.hotel_id = information_views.hotel_id
      and i.slug = information_views.slug
      and i.status = 'published'
      and (i.publish_at is null or i.publish_at <= now())
      and (i.unpublish_at is null or i.unpublish_at > now())
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated read own information views"
on public.information_views for select to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = information_views.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- page_views
drop policy if exists "page_views anon insert published" on public.page_views;
drop policy if exists "page_views authenticated read own hotel" on public.page_views;

create policy "page_views anon insert published"
on public.page_views for insert to anon
with check (
  exists (
    select 1 from public.informations i
    where i.id = page_views.page_id
      and i.status = 'published'
      and (i.publish_at is null or i.publish_at <= now())
      and (i.unpublish_at is null or i.unpublish_at > now())
  )
);

create policy "page_views authenticated insert published"
on public.page_views for insert to authenticated
with check (
  exists (
    select 1 from public.informations i
    where i.id = page_views.page_id
      and i.status = 'published'
      and (i.publish_at is null or i.publish_at <= now())
      and (i.unpublish_at is null or i.unpublish_at > now())
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "page_views authenticated read own hotel"
on public.page_views for select to authenticated
using (
  exists (
    select 1 from public.informations i
    join public.hotel_memberships m on m.hotel_id = i.hotel_id and m.user_id = auth.uid()
    where i.id = page_views.page_id
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- pages / cards
drop policy if exists "pages authenticated read write own hotel" on public.pages;
drop policy if exists "cards authenticated read write via page" on public.cards;

create policy "pages authenticated read write own hotel"
on public.pages for all to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = pages.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = pages.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "cards authenticated read write via page"
on public.cards for all to authenticated
using (
  exists (
    select 1 from public.pages p
    join public.hotel_memberships m on m.hotel_id = p.hotel_id and m.user_id = auth.uid()
    where p.id = cards.page_id
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.pages p
    join public.hotel_memberships m on m.hotel_id = p.hotel_id and m.user_id = auth.uid()
    where p.id = cards.page_id
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- templates
drop policy if exists "templates authenticated read" on public.templates;
create policy "templates authenticated read"
on public.templates for select to authenticated
using (
  coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
  or auth.uid() is not null
);

-- audit_logs
drop policy if exists "authenticated insert own audit logs" on public.audit_logs;
drop policy if exists "authenticated read own audit logs" on public.audit_logs;

create policy "authenticated insert own audit logs"
on public.audit_logs for insert to authenticated
with check (
  actor_user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated read own audit logs"
on public.audit_logs for select to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = audit_logs.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- hotel_invites
drop policy if exists "authenticated read own hotel invites" on public.hotel_invites;
drop policy if exists "authenticated insert own hotel invites" on public.hotel_invites;
drop policy if exists "authenticated update own hotel invites" on public.hotel_invites;
drop policy if exists "authenticated delete own hotel invites" on public.hotel_invites;

create policy "authenticated read own hotel invites"
on public.hotel_invites for select to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = hotel_invites.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated insert own hotel invites"
on public.hotel_invites for insert to authenticated
with check (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = hotel_invites.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated update own hotel invites"
on public.hotel_invites for update to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = hotel_invites.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = hotel_invites.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated delete own hotel invites"
on public.hotel_invites for delete to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = hotel_invites.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
on public.profiles for select to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "profiles_insert_own"
on public.profiles for insert to authenticated
with check (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "profiles_update_own"
on public.profiles for update to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
)
with check (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- publish_approval_requests
drop policy if exists "authenticated read own publish approvals" on public.publish_approval_requests;
drop policy if exists "authenticated insert own publish approvals" on public.publish_approval_requests;
drop policy if exists "authenticated update own publish approvals" on public.publish_approval_requests;

create policy "authenticated read own publish approvals"
on public.publish_approval_requests for select to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = publish_approval_requests.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated insert own publish approvals"
on public.publish_approval_requests for insert to authenticated
with check (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = publish_approval_requests.hotel_id and m.user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "authenticated update own publish approvals"
on public.publish_approval_requests for update to authenticated
using (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = publish_approval_requests.hotel_id and m.user_id = auth.uid()
      and (m.role = 'admin' or exists (
        select 1 from public.hotels h where h.id = m.hotel_id and h.owner_user_id = auth.uid()
      ))
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
)
with check (
  exists (
    select 1 from public.hotel_memberships m
    where m.hotel_id = publish_approval_requests.hotel_id and m.user_id = auth.uid()
      and (m.role = 'admin' or exists (
        select 1 from public.hotels h where h.id = m.hotel_id and h.owner_user_id = auth.uid()
      ))
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- information_saves
drop policy if exists "users manage own saves" on public.information_saves;
drop policy if exists "public read sample save stats" on public.information_saves;

create policy "users manage own saves"
on public.information_saves for all to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
)
with check (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "anon read sample save stats"
on public.information_saves for select to anon
using (sample_id is not null);

create policy "authenticated read sample save stats"
on public.information_saves for select to authenticated
using (
  sample_id is not null
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- push_device_tokens
drop policy if exists "push_tokens_select_own" on public.push_device_tokens;
drop policy if exists "push_tokens_insert_own" on public.push_device_tokens;
drop policy if exists "push_tokens_update_own" on public.push_device_tokens;
drop policy if exists "push_tokens_delete_own" on public.push_device_tokens;

create policy "push_tokens_select_own"
on public.push_device_tokens for select to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "push_tokens_insert_own"
on public.push_device_tokens for insert to authenticated
with check (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "push_tokens_update_own"
on public.push_device_tokens for update to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
)
with check (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "push_tokens_delete_own"
on public.push_device_tokens for delete to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

-- saas_editor_pages (legacy; optional table — skip if never migrated)
do $$
begin
  if to_regclass('public.saas_editor_pages') is not null then
    drop policy if exists "Users can manage own saas editor pages" on public.saas_editor_pages;
    execute $policy$
      create policy "Users can manage own saas editor pages"
      on public.saas_editor_pages for all to authenticated
      using (
        auth.uid() = user_id
        and (
          coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
          or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
        )
      )
      with check (
        auth.uid() = user_id
        and (
          coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
          or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
        )
      )
    $policy$;
  end if;
end $$;

-- storage upload policies (authenticated)
drop policy if exists "Authenticated users can upload page assets" on storage.objects;
drop policy if exists "Authenticated users can update own uploads" on storage.objects;
drop policy if exists "Authenticated users can delete own uploads" on storage.objects;

create policy "Authenticated users can upload page assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'page-assets'
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "Authenticated users can update own uploads"
on storage.objects for update to authenticated
using (
  bucket_id = 'page-assets'
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);

create policy "Authenticated users can delete own uploads"
on storage.objects for delete to authenticated
using (
  bucket_id = 'page-assets'
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or exists (select 1 from public.hotel_memberships m where m.user_id = auth.uid())
  )
);
