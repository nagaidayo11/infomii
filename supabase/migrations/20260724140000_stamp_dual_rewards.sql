-- Always 10 slots; dual rewards at 5 and 10; track redeem tier.

alter table public.stamp_programs
  add column if not exists reward_title_5 text not null default '5個特典',
  add column if not exists reward_description_5 text not null default '',
  add column if not exists reward_title_10 text not null default '10個特典',
  add column if not exists reward_description_10 text not null default '';

-- Migrate legacy single reward into the matching tier.
update public.stamp_programs
set
  reward_title_5 = case
    when stamps_required <= 5 then coalesce(nullif(trim(reward_title), ''), '5個特典')
    else coalesce(nullif(trim(reward_title_5), ''), '5個特典')
  end,
  reward_description_5 = case
    when stamps_required <= 5 then coalesce(reward_description, '')
    else coalesce(reward_description_5, '')
  end,
  reward_title_10 = case
    when stamps_required >= 10 then coalesce(nullif(trim(reward_title), ''), '10個特典')
    else coalesce(nullif(trim(reward_title_10), ''), '10個特典')
  end,
  reward_description_10 = case
    when stamps_required >= 10 then coalesce(reward_description, '')
    else coalesce(reward_description_10, '')
  end;

update public.stamp_programs
set stamps_required = 10
where stamps_required is distinct from 10;

alter table public.stamp_programs
  drop constraint if exists stamp_programs_stamps_required_check;

alter table public.stamp_programs
  add constraint stamp_programs_stamps_required_check
  check (stamps_required = 10);

comment on column public.stamp_programs.stamps_required is
  'Card capacity (always 10). Guests may redeem at 5 or 10.';

comment on column public.stamp_programs.reward_title_5 is
  'Reward title when redeeming at 5 stamps';

comment on column public.stamp_programs.reward_title_10 is
  'Reward title when redeeming at 10 stamps';

alter table public.stamp_cards
  add column if not exists pending_redeem_tier integer;

alter table public.stamp_cards
  drop constraint if exists stamp_cards_pending_redeem_tier_check;

alter table public.stamp_cards
  add constraint stamp_cards_pending_redeem_tier_check
  check (
    pending_redeem_tier is null
    or pending_redeem_tier in (5, 10)
  );

update public.stamp_cards
set pending_redeem_tier = 10
where pending_redeem = true and pending_redeem_tier is null;
