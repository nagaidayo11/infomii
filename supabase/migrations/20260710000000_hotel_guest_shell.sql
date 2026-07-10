-- Facility-wide guest chrome (bottom tabs, etc.)
alter table public.hotels
add column if not exists guest_shell jsonb not null default '{}'::jsonb;

comment on column public.hotels.guest_shell is
  'Facility-wide guest UI shell. Example: {"enabled":true,"tabs":[{"id":"home","type":"home","label":"ホーム","enabled":true,"pageSlug":"..."},{"id":"front","type":"phone","label":"フロント","enabled":true,"phone":"03-..."},{"id":"faq","type":"page","label":"FAQ","enabled":true,"pageSlug":"..."},{"id":"lang","type":"locale","label":"言語","enabled":true}]}';
