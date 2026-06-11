-- Repair prod DBs that missed earlier migrations (IAP verify + billing UI).

alter table public.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists cancel_at timestamptz;

alter table public.subscriptions
  add column if not exists billing_provider text
    check (billing_provider is null or billing_provider in ('stripe', 'apple')),
  add column if not exists apple_original_transaction_id text,
  add column if not exists apple_product_id text,
  add column if not exists apple_environment text
    check (apple_environment is null or apple_environment in ('Sandbox', 'Production'));

create unique index if not exists subscriptions_apple_original_transaction_id_key
  on public.subscriptions (apple_original_transaction_id)
  where apple_original_transaction_id is not null;

notify pgrst, 'reload schema';
