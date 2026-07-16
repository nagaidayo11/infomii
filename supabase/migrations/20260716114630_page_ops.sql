-- Page-level live ops status (e.g. breakfast crowd congestion).
-- NULL = no ops written yet; guests/editor may heal from breakfast_crowd card content.
alter table public.pages
add column if not exists ops jsonb;

comment on column public.pages.ops is
  'Page-level live ops. Example: {"breakfastCrowd":{"level":"open","note":"...","updatedAt":"...","updatedBy":null}}';
