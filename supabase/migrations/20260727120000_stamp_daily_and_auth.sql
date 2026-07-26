-- Stamp daily limit (business day @ 04:00) + optional account restore.

alter table public.stamp_programs
  add column if not exists once_per_day boolean not null default true;

alter table public.stamp_programs
  add column if not exists timezone text not null default 'Asia/Tokyo';

comment on column public.stamp_programs.once_per_day is
  'When true, guest_scan allowed once per facility business day (resets at 04:00 local).';
comment on column public.stamp_programs.timezone is
  'IANA timezone for business-day boundaries (default Asia/Tokyo).';

-- Preserve previous "off" semantics: cooldown_hours = 0 meant unlimited.
update public.stamp_programs
set once_per_day = false
where cooldown_hours = 0;

alter table public.stamp_events
  add column if not exists stamp_day date;

comment on column public.stamp_events.stamp_day is
  'Facility business day (YYYY-MM-DD) for guest_scan uniqueness; null for staff/carryover.';

create unique index if not exists stamp_events_card_guest_day_uidx
  on public.stamp_events (card_id, stamp_day)
  where source = 'guest_scan' and stamp_day is not null;

alter table public.stamp_cards
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

comment on column public.stamp_cards.owner_user_id is
  'Optional guest auth user for cross-device restore. Null = device/token only.';

create unique index if not exists stamp_cards_program_owner_active_uidx
  on public.stamp_cards (program_id, owner_user_id)
  where owner_user_id is not null and status = 'active';

create index if not exists stamp_cards_owner_user_id_idx
  on public.stamp_cards (owner_user_id)
  where owner_user_id is not null;
