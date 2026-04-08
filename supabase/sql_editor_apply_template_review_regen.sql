-- Apply in Supabase SQL Editor
alter table if exists public.templates
  add column if not exists review_status text not null default 'ok',
  add column if not exists consistency_score integer,
  add column if not exists consistency_reason text,
  add column if not exists regen_requested_at timestamptz,
  add column if not exists regen_completed_at timestamptz,
  add column if not exists regen_error text;

create index if not exists idx_templates_review_status on public.templates (review_status);

