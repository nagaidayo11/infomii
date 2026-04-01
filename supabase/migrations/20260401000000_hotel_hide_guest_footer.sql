-- Business 向け: 公開ゲスト画面のデフォルトフッター（案内文）を非表示にするフラグ
alter table public.hotels
add column if not exists hide_guest_footer boolean not null default false;

comment on column public.hotels.hide_guest_footer is 'true のとき、公開ページ下部のデフォルト案内フッターを出さない（Business プラン時のみ有効）';
