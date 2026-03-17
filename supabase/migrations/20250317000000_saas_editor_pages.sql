-- SaaS Editor (Notion + Canva style): one table for pages with blocks stored as JSONB.
-- Run this in Supabase SQL editor if you use migrations, or create the table manually.

create table if not exists public.saas_editor_pages (
  id uuid primary key default gen_random_uuid(),
  title text not null default 'Untitled',
  slug text unique,
  user_id uuid references auth.users(id) on delete set null,
  blocks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: RLS
alter table public.saas_editor_pages enable row level security;

create policy "Users can manage own saas editor pages"
  on public.saas_editor_pages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for listing by user
create index if not exists saas_editor_pages_user_id_idx on public.saas_editor_pages(user_id);
