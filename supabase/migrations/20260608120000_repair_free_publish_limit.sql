-- Repair stale Free plan publish limits left at 1 by an older migration.

update public.subscriptions
set max_published_pages = 3
where plan = 'free' and max_published_pages <> 3;

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
