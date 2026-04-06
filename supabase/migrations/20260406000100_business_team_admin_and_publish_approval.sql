-- Business team ops: admin role + publish approval workflow

-- 1) role constraints: add admin
alter table public.hotel_memberships
  drop constraint if exists hotel_memberships_role_check;
alter table public.hotel_memberships
  add constraint hotel_memberships_role_check check (role in ('admin', 'editor', 'viewer'));

alter table public.hotel_invites
  drop constraint if exists hotel_invites_role_check;
alter table public.hotel_invites
  add constraint hotel_invites_role_check check (role in ('admin', 'editor', 'viewer'));

-- 2) redeem_hotel_invite: include admin role
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
  invite_role text;
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

-- 3) publish approval requests
create table if not exists public.publish_approval_requests (
  id uuid primary key default gen_random_uuid(),
  information_id uuid not null references public.informations(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  requested_by_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  requested_at timestamptz not null default now(),
  reviewed_by_user_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_comment text
);

create index if not exists publish_approval_requests_hotel_status_idx
  on public.publish_approval_requests (hotel_id, status, requested_at desc);

alter table public.publish_approval_requests enable row level security;

drop policy if exists "authenticated read own publish approvals" on public.publish_approval_requests;
drop policy if exists "authenticated insert own publish approvals" on public.publish_approval_requests;
drop policy if exists "authenticated update own publish approvals" on public.publish_approval_requests;

create policy "authenticated read own publish approvals"
on public.publish_approval_requests
for select
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = publish_approval_requests.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "authenticated insert own publish approvals"
on public.publish_approval_requests
for insert
to authenticated
with check (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = publish_approval_requests.hotel_id
      and m.user_id = auth.uid()
  )
);

create policy "authenticated update own publish approvals"
on public.publish_approval_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = publish_approval_requests.hotel_id
      and m.user_id = auth.uid()
      and (m.role = 'admin' or exists (
        select 1 from public.hotels h where h.id = m.hotel_id and h.owner_user_id = auth.uid()
      ))
  )
)
with check (
  exists (
    select 1
    from public.hotel_memberships m
    where m.hotel_id = publish_approval_requests.hotel_id
      and m.user_id = auth.uid()
      and (m.role = 'admin' or exists (
        select 1 from public.hotels h where h.id = m.hotel_id and h.owner_user_id = auth.uid()
      ))
  )
);
