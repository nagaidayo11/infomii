-- Backfill stamp_day for legacy guest_scan rows (business day @ 04:00 local).
-- Only fill when it would not violate the unique (card_id, stamp_day) index.

with computed as (
  select
    e.id,
    e.card_id,
    (
      case
        when extract(
          hour from (e.created_at at time zone coalesce(nullif(trim(p.timezone), ''), 'Asia/Tokyo'))
        ) < 4
        then ((e.created_at at time zone coalesce(nullif(trim(p.timezone), ''), 'Asia/Tokyo'))::date - 1)
        else (e.created_at at time zone coalesce(nullif(trim(p.timezone), ''), 'Asia/Tokyo'))::date
      end
    ) as day_key,
    e.created_at
  from public.stamp_events e
  join public.stamp_programs p on p.id = e.program_id
  where e.source = 'guest_scan'
    and e.stamp_day is null
),
ranked as (
  select
    c.*,
    row_number() over (
      partition by c.card_id, c.day_key
      order by c.created_at asc, c.id asc
    ) as rn
  from computed c
)
update public.stamp_events e
set stamp_day = r.day_key
from ranked r
where e.id = r.id
  and r.rn = 1
  and not exists (
    select 1
    from public.stamp_events x
    where x.card_id = r.card_id
      and x.source = 'guest_scan'
      and x.stamp_day = r.day_key
  );
