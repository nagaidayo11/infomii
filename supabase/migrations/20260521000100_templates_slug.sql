-- Stable slug for marketplace templates (LP deep links, seed sync)
alter table if exists public.templates
  add column if not exists slug text;

create unique index if not exists templates_slug_unique on public.templates (slug)
  where slug is not null;

comment on column public.templates.slug is 'Stable template key for LP starter links and seed sync';
