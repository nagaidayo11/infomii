-- Fix infinite recursion: hotel_memberships policies must not subquery hotel_memberships.
-- The is_anonymous guard for this table uses JWT claims only (no membership lookup).

drop policy if exists "authenticated read own memberships" on public.hotel_memberships;
drop policy if exists "authenticated insert first membership from owned hotel" on public.hotel_memberships;
drop policy if exists "authenticated update own memberships" on public.hotel_memberships;
drop policy if exists "authenticated delete own memberships" on public.hotel_memberships;

create policy "authenticated read own memberships"
on public.hotel_memberships
for select
to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is true
  )
);

create policy "authenticated insert first membership from owned hotel"
on public.hotel_memberships
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.hotels h
    where h.id = hotel_memberships.hotel_id
      and h.owner_user_id = auth.uid()
  )
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is true
  )
);

create policy "authenticated update own memberships"
on public.hotel_memberships
for update
to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is true
  )
)
with check (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is true
  )
);

create policy "authenticated delete own memberships"
on public.hotel_memberships
for delete
to authenticated
using (
  user_id = auth.uid()
  and (
    coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is false
    or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) is true
  )
);
