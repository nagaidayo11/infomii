-- Stamp card UX: redeem at 5 or 10 only, optional stamp visual style.

update public.stamp_programs
set stamps_required = case
  when stamps_required <= 5 then 5
  else 10
end
where stamps_required not in (5, 10);

alter table public.stamp_programs
  drop constraint if exists stamp_programs_stamps_required_check;

alter table public.stamp_programs
  add constraint stamp_programs_stamps_required_check
  check (stamps_required in (5, 10));

alter table public.stamp_programs
  add column if not exists stamp_style text not null default 'seal';

alter table public.stamp_programs
  drop constraint if exists stamp_programs_stamp_style_check;

alter table public.stamp_programs
  add constraint stamp_programs_stamp_style_check
  check (
    stamp_style in (
      'seal',
      'star',
      'heart',
      'coffee',
      'leaf',
      'flower',
      'check',
      'sun'
    )
  );

comment on column public.stamp_programs.stamps_required is
  'Redeem threshold: 5 or 10 (card capacity max is 10)';

comment on column public.stamp_programs.stamp_style is
  'Visual mark used for filled / empty stamp slots';
