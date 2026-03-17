-- Phase 5.2: チーム・招待 — 権限（編集/閲覧）
-- hotel_memberships に role を追加。owner は hotels.owner_user_id で判定。
-- hotel_invites に role を追加（招待時の権限指定）。

alter table public.hotel_memberships
add column if not exists role text not null default 'editor' check (role in ('editor', 'viewer'));

alter table public.hotel_invites
add column if not exists role text not null default 'editor' check (role in ('editor', 'viewer'));

-- redeem_hotel_invite: 招待の role を memberships に反映
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
  if invite_role not in ('editor', 'viewer') then
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
