-- Business プラン追加 & Free プラン上限を1ページに統一
-- 注意1: 既存Freeユーザーの max_published_pages を 1 に更新
-- 注意2: Business プラン対応（plan check に business 追加）

-- 1. plan check に business を追加
alter table public.subscriptions drop constraint if exists subscriptions_plan_check;
alter table public.subscriptions add constraint subscriptions_plan_check check (plan in ('free', 'pro', 'business'));

-- 2. 既存 Free プランの max_published_pages を 1 に更新
update public.subscriptions
set max_published_pages = 1
where plan = 'free' and max_published_pages > 1;

-- 3. ensure_hotel_subscription: 新規作成時の Free を 1 ページに
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
  values (target_hotel_id, 'free', 'active', 1)
  returning id into sub_id;

  return sub_id;
end;
$$;
