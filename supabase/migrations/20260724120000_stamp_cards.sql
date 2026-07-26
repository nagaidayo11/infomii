-- Stamp card MVP: page kind + loyalty tables (Business feature).
-- Guest identity = opaque card token URL (no login).
-- stamp_events.source: guest_scan | staff_manual | carryover

alter table public.pages
  add column if not exists kind text not null default 'guide';

alter table public.pages
  drop constraint if exists pages_kind_check;

alter table public.pages
  add constraint pages_kind_check check (kind in ('guide', 'stamp'));

comment on column public.pages.kind is
  'guide = block editor page; stamp = stamp-card program page';

create table if not exists public.stamp_programs (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  page_id uuid not null unique references public.pages(id) on delete cascade,
  title text not null default 'スタンプカード',
  description text not null default '',
  stamps_required integer not null default 5
    check (stamps_required >= 1 and stamps_required <= 50),
  reward_title text not null default '特典',
  reward_description text not null default '',
  accent_color text not null default '#0d9488',
  stamp_code text not null unique,
  cooldown_hours integer not null default 24
    check (cooldown_hours >= 0 and cooldown_hours <= 8760),
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stamp_programs_hotel_id_idx on public.stamp_programs(hotel_id);
create index if not exists stamp_programs_stamp_code_idx on public.stamp_programs(stamp_code);

comment on table public.stamp_programs is
  'Stamp card campaign definition (1:1 with pages.kind=stamp)';

create table if not exists public.stamp_cards (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.stamp_programs(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  token text not null unique,
  status text not null default 'active'
    check (status in ('active', 'revoked')),
  pending_redeem boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stamp_cards_program_id_idx on public.stamp_cards(program_id);
create index if not exists stamp_cards_hotel_id_idx on public.stamp_cards(hotel_id);
create index if not exists stamp_cards_token_idx on public.stamp_cards(token);

create table if not exists public.stamp_events (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.stamp_cards(id) on delete cascade,
  program_id uuid not null references public.stamp_programs(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  source text not null default 'guest_scan'
    check (source in ('guest_scan', 'staff_manual', 'carryover')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists stamp_events_card_id_idx on public.stamp_events(card_id);
create index if not exists stamp_events_program_id_created_at_idx
  on public.stamp_events(program_id, created_at desc);
create index if not exists stamp_events_card_created_at_idx
  on public.stamp_events(card_id, created_at desc);

create table if not exists public.stamp_redemptions (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.stamp_cards(id) on delete cascade,
  program_id uuid not null references public.stamp_programs(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  stamps_at_redeem integer not null,
  confirmed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists stamp_redemptions_card_id_idx on public.stamp_redemptions(card_id);
create index if not exists stamp_redemptions_program_id_idx on public.stamp_redemptions(program_id);

-- RLS: hotel members manage programs/cards/events; guests use service-role APIs only.
alter table public.stamp_programs enable row level security;
alter table public.stamp_cards enable row level security;
alter table public.stamp_events enable row level security;
alter table public.stamp_redemptions enable row level security;

drop policy if exists "stamp_programs hotel members all" on public.stamp_programs;
create policy "stamp_programs hotel members all"
  on public.stamp_programs
  for all
  using (
    exists (
      select 1 from public.hotel_memberships m
      where m.hotel_id = stamp_programs.hotel_id
        and m.user_id = auth.uid()
        and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
  )
  with check (
    exists (
      select 1 from public.hotel_memberships m
      where m.hotel_id = stamp_programs.hotel_id
        and m.user_id = auth.uid()
        and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
  );

drop policy if exists "stamp_cards hotel members all" on public.stamp_cards;
create policy "stamp_cards hotel members all"
  on public.stamp_cards
  for all
  using (
    exists (
      select 1 from public.hotel_memberships m
      where m.hotel_id = stamp_cards.hotel_id
        and m.user_id = auth.uid()
        and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
  )
  with check (
    exists (
      select 1 from public.hotel_memberships m
      where m.hotel_id = stamp_cards.hotel_id
        and m.user_id = auth.uid()
        and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
  );

drop policy if exists "stamp_events hotel members all" on public.stamp_events;
create policy "stamp_events hotel members all"
  on public.stamp_events
  for all
  using (
    exists (
      select 1 from public.hotel_memberships m
      where m.hotel_id = stamp_events.hotel_id
        and m.user_id = auth.uid()
        and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
  )
  with check (
    exists (
      select 1 from public.hotel_memberships m
      where m.hotel_id = stamp_events.hotel_id
        and m.user_id = auth.uid()
        and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
  );

drop policy if exists "stamp_redemptions hotel members all" on public.stamp_redemptions;
create policy "stamp_redemptions hotel members all"
  on public.stamp_redemptions
  for all
  using (
    exists (
      select 1 from public.hotel_memberships m
      where m.hotel_id = stamp_redemptions.hotel_id
        and m.user_id = auth.uid()
        and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
  )
  with check (
    exists (
      select 1 from public.hotel_memberships m
      where m.hotel_id = stamp_redemptions.hotel_id
        and m.user_id = auth.uid()
        and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    )
  );
