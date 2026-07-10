-- Page-level guest bottom tab config. NULL = inherit from connection-set root page.
alter table public.pages
add column if not exists guest_shell jsonb;

comment on column public.pages.guest_shell is
  'Guest bottom tab override for this page. NULL inherits from the pageLinks connection-set root.';
