/**
 * Infomii Editor 2.0 — Supabase data structure.
 * Use this to create tables or type your Supabase client.
 *
 * Table: pages
 *   id         uuid primary key default gen_random_uuid()
 *   title      text
 *   slug       text unique
 *   user_id    uuid references auth.users(id)
 *   created_at timestamptz default now()
 *
 * Table: cards
 *   id         uuid primary key default gen_random_uuid()
 *   page_id    uuid references pages(id) on delete cascade
 *   type       text  -- 'text' | 'image' | 'wifi' | 'breakfast' | 'checkout' | 'map' | 'notice' | 'button' | 'schedule' | 'menu'
 *   content    jsonb -- card-type-specific fields
 *   order      int   -- display order (0, 1, 2, ...)
 *   created_at timestamptz default now()
 *
 * When card order changes (drag-and-drop), update the "order" field for affected cards.
 */

export type PagesRow = {
  id: string;
  title: string;
  slug: string;
  user_id: string;
  created_at: string;
};

export type CardsRow = {
  id: string;
  page_id: string;
  type: string;
  content: Record<string, unknown>;
  order: number;
  created_at: string;
};
