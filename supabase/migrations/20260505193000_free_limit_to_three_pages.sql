-- Free プラン上限を 3 ページに引き上げ

-- 1) subscriptions.max_published_pages のデフォルトを 3 に変更
alter table public.subscriptions
  alter column max_published_pages set default 3;

-- 2) 既存 Free プランユーザーを 3 ページに統一
update public.subscriptions
set max_published_pages = 3
where plan = 'free' and max_published_pages < 3;

-- 3) ensure_hotel_subscription: 新規作成時の Free を 3 ページに
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
