# Infomii セットアップ手順

ログインと「ページを作成」を動かすための最小手順です。**管理者・招待コードは不要**で、初回ログイン時に自動で1施設（hotel）が作成され、その施設に所属します。

---

## 1. 環境変数の設定

プロジェクトルートに `.env.local` を作成し、Supabase の値を設定します。

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 値の取得方法

1. [Supabase](https://supabase.com) にログインし、プロジェクトを作成（または既存プロジェクトを開く）。
2. 左メニュー **Settings** → **API** を開く。
3. **Project URL** を `NEXT_PUBLIC_SUPABASE_URL` にコピー。
4. **Project API keys** の **anon public** を `NEXT_PUBLIC_SUPABASE_ANON_KEY` にコピー。

設定後、開発サーバーを再起動してください。

```bash
npm run dev
```

---

## 2. Supabase にテーブルを作る

Supabase ダッシュボードの **SQL Editor** で、次のいずれかを実行します。

### 方法 A: 一式をまとめて実行（推奨）

リポジトリの **`supabase/schema.sql`** の内容をそのまま SQL Editor に貼り付けて実行します。  
これで以下が作成されます。

- `hotels` … 施設
- `hotel_memberships` … ユーザーと施設の紐付け
- `subscriptions` … プラン（無料枠など）
- `ensure_hotel_subscription` … 初回用のサブスク作成関数
- `pages` / `cards` … カードエディタ用
- `informations` などその他

### 方法 B: 最小限だけ作りたい場合

「ページを作成」とログインだけ動かす最小構成は次のとおりです。

```sql
-- 1) 施設
create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'マイ施設',
  owner_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2) ユーザーと施設の紐付け（1ユーザー1施設）
create table if not exists public.hotel_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 3) プラン用（無料枠など）
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null unique references public.hotels(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  status text not null default 'active' check (status in ('trialing', 'active', 'past_due', 'canceled')),
  max_published_pages integer not null default 1 check (max_published_pages >= 0),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) 初回ログイン時にサブスクを作る関数
create or replace function public.ensure_hotel_subscription(target_hotel_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare sub_id uuid;
begin
  if target_hotel_id is null then raise exception 'missing_hotel_id'; end if;
  select id into sub_id from public.subscriptions where hotel_id = target_hotel_id limit 1;
  if sub_id is not null then return sub_id; end if;
  insert into public.subscriptions (hotel_id, plan, status, max_published_pages)
  values (target_hotel_id, 'free', 'active', 1) returning id into sub_id;
  return sub_id;
end; $$;
revoke all on function public.ensure_hotel_subscription(uuid) from public;
grant execute on function public.ensure_hotel_subscription(uuid) to authenticated;

-- 5) RLS 有効化
alter table public.hotels enable row level security;
alter table public.hotel_memberships enable row level security;
alter table public.subscriptions enable row level security;

-- 6) ポリシー（ログインユーザーが自分の施設だけ見られるようにする）
create policy "authenticated create own hotels" on public.hotels for insert to authenticated with check (owner_user_id = auth.uid());
create policy "authenticated read own hotels" on public.hotels for select to authenticated
  using (exists (select 1 from public.hotel_memberships m where m.hotel_id = hotels.id and m.user_id = auth.uid()));
create policy "authenticated update own hotels" on public.hotels for update to authenticated
  using (exists (select 1 from public.hotel_memberships m where m.hotel_id = hotels.id and m.user_id = auth.uid()));

create policy "authenticated read own memberships" on public.hotel_memberships for select to authenticated using (user_id = auth.uid());
create policy "authenticated insert first membership from owned hotel" on public.hotel_memberships for insert to authenticated
  with check (user_id = auth.uid() and exists (select 1 from public.hotels h where h.id = hotel_memberships.hotel_id and h.owner_user_id = auth.uid()));
create policy "authenticated update own memberships" on public.hotel_memberships for update to authenticated using (user_id = auth.uid());
create policy "authenticated delete own memberships" on public.hotel_memberships for delete to authenticated using (user_id = auth.uid());

create policy "authenticated read own subscriptions" on public.subscriptions for select to authenticated
  using (exists (select 1 from public.hotel_memberships m where m.hotel_id = subscriptions.hotel_id and m.user_id = auth.uid()));
create policy "authenticated create own subscriptions" on public.subscriptions for insert to authenticated
  with check (exists (select 1 from public.hotel_memberships m where m.hotel_id = subscriptions.hotel_id and m.user_id = auth.uid()));
create policy "authenticated update own subscriptions" on public.subscriptions for update to authenticated
  using (exists (select 1 from public.hotel_memberships m where m.hotel_id = subscriptions.hotel_id and m.user_id = auth.uid()));
```

さらに **カードエディタの「ページを作成」** を使う場合は、`pages` と `cards` も必要です。

```sql
-- ページ（カードエディタ用）
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  title text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique(hotel_id, slug)
);
alter table public.pages enable row level security;
create policy "authenticated pages own hotel" on public.pages for all to authenticated
  using (hotel_id = (select hotel_id from public.hotel_memberships where user_id = auth.uid() limit 1))
  with check (hotel_id = (select hotel_id from public.hotel_memberships where user_id = auth.uid() limit 1));

-- カード（各ページのブロック）
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  type text not null,
  content jsonb not null default '{}'::jsonb,
  "order" int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.cards enable row level security;
create policy "authenticated cards via pages" on public.cards for all to authenticated
  using (exists (select 1 from public.pages p join public.hotel_memberships m on m.hotel_id = p.hotel_id where p.id = cards.page_id and m.user_id = auth.uid()))
  with check (exists (select 1 from public.pages p join public.hotel_memberships m on m.hotel_id = p.hotel_id where p.id = cards.page_id and m.user_id = auth.uid()));
```

---

## 3. 動作の流れ

1. **環境変数**  
   `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定する。

2. **Supabase**  
   上記のとおりテーブル・関数・RLS を作成する。

3. **ログイン**  
   `/login` でメールとパスワードで「新規登録」または「ログイン」する。

4. **初回ログイン時**  
   アプリ側で「このユーザーに紐づく施設がない」と判定されると、自動で  
   - 施設（`hotels`）が1件作成され、  
   - その施設とユーザーの紐付け（`hotel_memberships`）が1件作成され、  
   - その施設用のサブスク（`subscriptions`）が `ensure_hotel_subscription` で1件作成されます。  
   **招待コードや管理者の操作は不要**です。

5. **ページを作成**  
   ダッシュボードの「ページを作成」を押すと、上記で作られた施設に紐づく `pages` が1件作成され、エディタ（`/editor/[id]`）に遷移します。

---

## 4. トラブルシューティング

| 症状 | 確認すること |
|------|----------------|
| ログインできない | Supabase の **Authentication** → **Providers** で Email が有効か。**Settings** → **API** の URL/anon key が `.env.local` と一致しているか。 |
| 「施設が選択されていません」 | 上記 2 のテーブルとポリシーがすべて実行されているか。RLS のポリシー名が重複していないか。 |
| 「Supabase設定が未完了です」 | `.env.local` がルートにあり、`NEXT_PUBLIC_` の typo がないか。`npm run dev` をやり直したか。 |

セットアップ後も問題がある場合は、ブラウザの開発者ツールのコンソールやネットワークタブでエラー内容を確認してください。
