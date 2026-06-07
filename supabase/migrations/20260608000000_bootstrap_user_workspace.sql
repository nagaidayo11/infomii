-- Idempotent workspace bootstrap for self-serve signup (bypasses RLS safely).

create or replace function public.bootstrap_user_workspace(default_name text default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
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
    perform public.ensure_hotel_subscription(existing_hotel_id);
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
    perform public.ensure_hotel_subscription(owned_hotel_id);
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

  perform public.ensure_hotel_subscription(new_hotel_id);

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
    perform public.ensure_hotel_subscription(existing_hotel_id);
    return existing_hotel_id;
end;
$$;

revoke all on function public.bootstrap_user_workspace(text) from public;
grant execute on function public.bootstrap_user_workspace(text) to authenticated;
