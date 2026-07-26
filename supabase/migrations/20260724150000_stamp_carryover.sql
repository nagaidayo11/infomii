-- Allow carryover stamps after partial reward redemption.
alter table public.stamp_events
  drop constraint if exists stamp_events_source_check;

alter table public.stamp_events
  add constraint stamp_events_source_check
  check (source in ('guest_scan', 'staff_manual', 'carryover'));

comment on column public.stamp_events.source is
  'guest_scan | staff_manual | carryover (remainder after redeeming a lower tier)';
