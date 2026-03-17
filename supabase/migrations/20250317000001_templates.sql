-- テンプレート一覧用テーブル（/templates ページで使用）
-- Supabase SQL Editor で実行するか、マイグレーションで適用してください。

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  preview_image text default '',
  cards jsonb default '[]'::jsonb,
  category text,
  created_at timestamptz not null default now()
);

comment on table public.templates is 'Template marketplace for QR page creation (business, resort, ryokan, etc.)';
