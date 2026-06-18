-- Security Advisor: public.information_save_stats was SECURITY DEFINER (bypasses caller RLS).
-- Recreate as security invoker so aggregates respect information_saves RLS policies.

drop view if exists public.information_save_stats;

create view public.information_save_stats
with (security_invoker = true)
as
select
  information_id,
  count(*)::int as save_count
from public.information_saves
where information_id is not null
group by information_id;

grant select on public.information_save_stats to anon, authenticated;
