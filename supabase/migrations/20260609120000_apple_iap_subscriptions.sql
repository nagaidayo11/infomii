-- Apple In-App Purchase fields on subscriptions (Stripe remains for web billing).

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

comment on column public.subscriptions.billing_provider is 'Active billing channel: stripe (web) or apple (App Store IAP).';
comment on column public.subscriptions.apple_original_transaction_id is 'Apple subscription family id for renewals and Server Notifications.';
