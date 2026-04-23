-- 施設あたりのメンバー数上限（オーナー含む hotel_memberships 行数）
-- 招待で参加しようとした時点で、既に上限なら却下

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
  member_count int;
  max_members int := 10;
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

  -- 新規参加で人数 +1 になるが、その前に枠を確認（同一ユーザーの他施設移動は on conflict で上書きのため、ここでは行数のまま扱い）
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
