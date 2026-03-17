-- Phase 5.3: カスタムドメイン（Business向け）
-- hotels に custom_domain を追加。Business プランのみ設定可能。

alter table public.hotels
add column if not exists custom_domain text default null;

comment on column public.hotels.custom_domain is 'Business向けカスタムドメイン（例: info.example.com）';
