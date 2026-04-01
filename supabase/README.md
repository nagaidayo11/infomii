# Supabase（データベース）について

## マイグレーションとは

**マイグレーション**は、PostgreSQL（Supabase の DB）に対して「テーブルや列を追加する」などの変更を、**再現できる形で記録した SQL ファイル**のことです。

- このリポジトリでは `supabase/migrations/` 以下の `*.sql` が、そのときそのときの変更履歴です。
- デプロイや本番 DB に、**同じ変更を安全に当てる**ために使います。
- アプリのコード（`hide_guest_footer` を読み書きする処理）は、**DB にその列があること**を前提にしています。SQL を実行していないと、保存時にエラーになります。

## 本番・ステージングに「当てる」方法（どちらか）

### A. Supabase ダッシュボード（手早い）

1. [Supabase](https://supabase.com) → プロジェクトを開く  
2. 左メニュー **SQL Editor**  
3. **New query** で、次の内容を貼り付けて **Run**

```sql
alter table public.hotels
add column if not exists hide_guest_footer boolean not null default false;

comment on column public.hotels.hide_guest_footer is 'true のとき、公開ページ下部のデフォルト案内フッターを出さない（Business プラン時のみ有効）';
```

（既に `supabase/migrations/20260401000000_hotel_hide_guest_footer.sql` と同じ内容です。）

### B. Supabase CLI（ローカルで CLI を使っている場合）

プロジェクトが Supabase CLI とリンク済みなら、リポジトリのルートで:

```bash
supabase db push
```

またはマイグレーションをリモートに適用する流れ（`supabase link` 済みが前提）に従います。

---

未適用の **他のマイグレーション** がある場合は、`supabase/migrations/` 内の SQL を**上から順に**（または `db push` で一括）当ててください。
