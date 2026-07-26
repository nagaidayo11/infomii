-- Optional rotating press QR: staff shows a live QR that changes every ~90s.
-- When off (default), the printed static stamp_code keeps working.

alter table public.stamp_programs
  add column if not exists rotating_qr boolean not null default false;

comment on column public.stamp_programs.rotating_qr is
  'When true, guest_scan requires a time-based rotating token instead of the static stamp_code.';
