# Infomii App Shell UI / モーション 指示プロンプト集

Expo WebView（`?client=app` / `data-client-shell="app"`）向けに、**押せる／押せないの視認性**、**切り替え UI**、**画面遷移・マイクロインタラクション**を iOS/Android アプリ品質に引き上げるためのマスタープロンプトです。

実装エージェント・デザイナー・将来の自分用に、**そのままコピペしてタスク単位で投入**してください。

---

## 0. 現状スコープ（コードベース）

| 領域 | 主なファイル |
|------|----------------|
| デザイントークン | `src/styles/app-shell.css`（`--app-*`, `app-touch-btn`, `app-shell-card`） |
| タブシェル | `AppTabLayout.tsx`, `AppTabBar.tsx`, `AppShellLink.tsx` |
| 画面 | `AppDashboardView`, `AppPagesListView`, `AppSettingsPage`, `AppBillingView`, `AppOnboardingTour` |
| エディタ App ヘッダ | `EditorAppTopBar.tsx`（公開トグル `role="switch"` あり） |
| 一覧カード | `PageCard.tsx`（作品タブで使用） |
| タップ基盤 | `globals.css` の `.ui-pop-tap` |
| 遷移 | `app-shell-page-enter`（220ms fade+translateY）、`GlobalRouteProgress` |
| 依存 | `framer-motion` 済み（未活用箇所あり） |

**既知の課題（このドキュメントの目的）**

- テキストリンクとボタン・メタ情報の区別が弱い（例: 作品一覧の公開 ON/OFF）
- Web 由来の `PageCard` が App 一覧にそのまま載り、Primary/Secondary が不明瞭
- タブ切替は色変化のみで、**方向性のある遷移**がない
- トグルはエディタヘッダのみ App らしく、一覧側はテキスト寄りで一貫性がない
- `prefers-reduced-motion` 未配慮の App 専用アニメが増えるリスク

---

## 1. マスターシステムプロンプト（全タスク共通）

以下を **システム** に置き、ユーザーメッセージで画面名・ファイルを指定する。

```text
You are a senior mobile UI engineer polishing Infomii's native app shell (Expo WebView, Next.js, Tailwind).

## Product context
- Infomii is a page builder for travel, fan activities, food trucks, small businesses—not hotel-only.
- App shell is activated with `data-client-shell="app"` and CSS variables in `src/styles/app-shell.css`.
- Do NOT break web (`client=web`) layouts; gate App-only styles with `[data-client-shell="app"]` or `useClientShell().isAppShell`.

## North star
Make the UI feel like a native iOS/Android app: obvious affordances, confident toggles, smooth transitions, subtle motion—not a responsive website.

## Interaction hierarchy (must enforce)
1. **Primary action** — filled accent button (`app-touch-btn-primary`), one per screen section max.
2. **Secondary action** — outlined or muted surface button (`app-touch-btn` + border).
3. **Tertiary / navigation** — list rows (`app-touch-row`), chevron, full-width tap target ≥44px.
4. **Meta / status** — plain text or pill with NO button chrome (color only: emerald = published, slate = draft).
5. **Destructive** — red text or red outline, never same style as primary.

## Tappable vs non-tappable
- Tappable: min-height 44px, `ui-pop-tap`, visible pressed state (`active:scale` or `active:bg`), focus ring on keyboard.
- Non-tappable labels: `font-normal`, `text-[var(--app-text-muted)]`, no border, no shadow, no rounded pill unless status-only.
- Never use solid filled badges for toggle state in list meta rows—use iOS-style switch OR segmented control.

## Toggles & switches
- Publish on/off: `role="switch"` with track + thumb, 52×32pt minimum, haptic-friendly spacing.
- Animate thumb with `transition-transform` 200ms spring; show spinner overlay when `disabled` + loading.
- Pair with short label: 「公開」+ switch, not duplicate 「公開中」+「公開ON」 text buttons.

## Motion rules
- Page enter: 220–280ms, ease `[0.22, 1, 0.36, 1]`, opacity + translateY(8px) max.
- Tab switch: optional horizontal slide (forward/back) based on tab index delta; respect reduced motion.
- List items: stagger 30–40ms for first paint only (not on every re-render).
- Buttons: press scale 0.97, release spring; no hover lift on touch devices.
- Route loading: keep `GlobalRouteProgress` + `useRouteProgressLoading`; do not add second competing loader.

## Technical constraints
- Prefer CSS in `app-shell.css` for shared primitives; use `framer-motion` only for layout transitions (tab, sheet, list stagger).
- Reuse `AppShellLink`, `AppTabBar`, `RouteProgressProvider`.
- TypeScript strict, minimal new abstractions—e.g. `AppSwitch`, `AppListRow`, `AppPressable` only if used ≥3 times.
- Japanese UI copy; no new English labels in production UI.

## Accessibility
- `aria-checked` on switches, `aria-busy` during publish toggle, `aria-current="page"` on tabs (already on AppTabBar).
- Contrast WCAG AA on `--app-accent` (#0d9488) and white text.
- Honor `prefers-reduced-motion: reduce` → disable translate/stagger, keep opacity-only or instant.

## Deliverables per task
- Code changes scoped to listed files
- Before/after behavior notes in PR description
- No unrelated refactors
```

---

## 2. デザイン原則チートシート（実装者向け）

| 原則 | App での具体 |
|------|----------------|
| 一画面一主操作 | ホーム＝AI生成、作品＝FAB「+」、設定＝保存 |
| 状態は色＋アイコン | 公開＝緑ドット or switch ON、下書き＝グレー |
| 押した感 | `ui-pop-tap` + `active:scale-[0.98]` + 短い haptic（将来 Native bridge） |
| 待ちは局所化 | カード全体スケルトン、ボタン内スピナー、画面ロックは最後の手段 |
| 遷移に方向 | タブ index が増えたら左から入、減ったら右から入 |
| Web と分離 | `PageCard` に `variant="app"` または `AppPageListItem` を新設 |

---

## 3. フェーズ別 実装プロンプト

### Phase A — デザインシステム基盤（先にやる）

```text
Task: App shell interaction primitives

Extend `src/styles/app-shell.css` and add minimal components under `src/components/app-shell/primitives/`:

1. `.app-pressable` — base for buttons/rows: min-h 44px, ui-pop-tap, active scale, disabled opacity 40% + no pointer.
2. `.app-switch` — track 52×32, thumb 28×28, on=--app-accent, off=--app-border, focus-visible ring.
3. `.app-meta` — text-sm muted, no padding, for timestamps and counts.
4. `.app-status-dot` — 6px circle inline before label (emerald | slate).
5. `@media (prefers-reduced-motion: reduce)` overrides for all app-shell animations.

Export React: `AppSwitch`, `AppPressable` (polymorphic button/link), `AppListRow` (title, subtitle, trailing chevron|switch|badge).

Gate usage with `useClientShell().isAppShell` only where needed; do not change web PageCard default.

Acceptance:
- Storybook not required; verify in `?client=app` on /dashboard/pages
- Toggle has visible on/off and does not look like plain text link
```

### Phase B — 作品一覧（スクリーンショット課題の中心）

```text
Task: App-native works list (`AppPagesListView` + PageCard app variant)

Problem: Users cannot tell if 「公開ON」 is tappable; meta row looks like flat text soup.

Implement `AppWorksListItem` (or PageCard variant="app") used only from AppPagesListView:

Layout per row:
- Card: app-shell-card, full width, ui-pop-card subtle lift on press of main area → navigate to editor
- Row 1: title (semibold), trailing chevron (muted)
- Row 2: [status dot + 公開中|下書き] · [AppSwitch 公開] · meta (7時間前 · QR閲覧 n) — single baseline, text-sm
- Remove duplicate text 「公開ON」; switch replaces toggle text
- FAB 「+」: keep fixed position; add `ui-pop-tap` + scale on press; optional subtle pulse once on empty state only

Loading: app-shell-skeleton rows (3), match final row height.
Empty: AppEmptyState with primary → templates, secondary → create.

Motion:
- List mount: stagger children 40ms (framer-motion), max 8 items
- On publish toggle: optimistic UI + switch disabled + spinner; rollback on error toast

Files: AppPagesListView.tsx, new AppWorksListItem.tsx, optionally slim PageCard for web only.

Do not change web PagesListView styling.
```

### Phase C — タブバー & 画面遷移

```text
Task: Tab bar polish + directional page transitions

1. AppTabBar:
   - Active tab: accent icon + label, optional 2px top indicator bar with layoutId animation (framer-motion)
   - Inactive: muted; active:bg only on press (already partially there)
   - Add `ui-pop-tap` if missing on inactive feedback

2. AppTabLayout:
   - Detect tab group from pathname (/dashboard, /templates, /dashboard/pages, /settings/billing, /settings)
   - On tab index change: animate content wrapper with slide 12px + opacity 200ms; skip if reduced motion
   - Do NOT double-animate with app-shell-page-enter—merge into one transition component `AppTabTransition`

3. GlobalRouteProgress:
   - Ensure `app-route-progress-bar` visible on app shell (already styled in app-shell.css)
   - Link prefetch on AppShellLink: keep prefetch

Files: AppTabBar.tsx, AppTabLayout.tsx, new AppTabTransition.tsx, app-shell.css

Acceptance: switching ホーム→作品 feels like app tab change, not full page reload flash.
```

### Phase D — エディタ App ヘッダ

```text
Task: EditorAppTopBar consistency with list publish switch

1. Unify publish switch styling with new AppSwitch primitive (same sizes/colors).
2. Add label 「公開」 next to switch (sr-only ok on switch, visible label for clarity).
3. Preview / overflow buttons: use app-pressable, disabled state 40% opacity + no active scale.
4. Save hint line: crossfade text 公開中→保存済み (150ms opacity) when state changes.
5. More menu: sheet slide-up from bottom (280ms) with backdrop fade; not dropdown on mobile.

Keep teal gradient header brand; do not redesign entire editor chrome.

Files: EditorAppTopBar.tsx, AppSwitch.tsx
```

### Phase E — ホーム・テンプレ・設定

```text
Task: App dashboard, templates gallery, settings — affordance pass

Dashboard (`AppDashboardView`):
- AI block: single primary CTA, card with app-shell-hero
- Stats: non-clickable numbers use app-meta; clickable rows use AppListRow → analytics
- Recent works: reuse AppWorksListItem compact variant (no switch, tap → editor)

Templates (`/templates` with client=app):
- TemplateCard: ensure unoptimized images + press state on whole card
- Category chips: segmented control style, selected = filled accent soft

Settings (`AppSettingsPage`, `AppSettingsShell`):
- Each setting row: AppListRow with chevron; toggles use AppSwitch
- Destructive (logout): text red, separated section

Motion: section headers fade-in 180ms on first mount only.

Scope: only components rendered when isAppShell; use wrapper or conditional classes.
```

### Phase F — マイクロインタラクション & 仕上げ

```text
Task: Micro-interactions and reduced-motion pass

Add:
- Toast slide-in top (safe area aware) for errors/success on toggle publish
- Pull-to-refresh on AppPagesListView (optional if WebView allows; else skip)
- Haptic comment hooks `// TODO: native haptic light` on switch change
- Checkbox/radio in settings: 44px row height

Audit all `[data-client-shell="app"]` buttons without `ui-pop-tap` or min-height.

Add `app-shell.css`:
```css
@media (prefers-reduced-motion: reduce) {
  [data-client-shell="app"] .app-shell-page-enter,
  [data-client-shell="app"] .app-shell-skeleton { animation: none; }
}
```

Performance: will-change only on active press, not permanent.

Deliverable: checklist comment in PR linking each screen verified on iOS Expo Go.
```

---

## 4. 画面別クイックプロンプト（コピペ用）

### 4.1 作品タブ

```text
Improve /dashboard/pages in app shell only.
Replace text 「公開ON/OFF」 with AppSwitch aligned to EditorAppTopBar.
Make entire card tap → editor except switch hit area.
Meta 「7時間前」「QR閲覧」 must look non-interactive (app-meta).
List stagger on load. See docs/APP_SHELL_UI_MOTION_PROMPTS.md Phase B.
```

### 4.2 ホーム

```text
App dashboard: one clear primary action (AI), de-emphasize secondary links.
Recent works: compact list rows with chevron, no web PageCard chrome.
See Phase E.
```

### 4.3 テンプレート

```text
App templates gallery: card press feedback, category filter as segmented control.
Image cards already unoptimized—add ui-pop-card active state.
```

### 4.4 エディタ

```text
EditorAppTopBar: AppSwitch primitive, bottom sheet for overflow menu, save hint crossfade.
Match publish control with works list switch.
See Phase D.
```

### 4.5 タブバー

```text
AppTabBar: active indicator animation, directional tab content transition in AppTabLayout.
See Phase C.
```

---

## 5. コンポーネント API 案（実装時の参照）

```tsx
// AppSwitch — 公開トグル共通化
<AppSwitch
  checked={published}
  onCheckedChange={(v) => void toggle(v)}
  disabled={loading}
  label="公開"
  aria-describedby="publish-hint"
/>

// AppListRow — 設定・一覧
<AppListRow
  href="/settings/profile"
  title="プロフィール"
  subtitle="表示名とアイコン"
  trailing="chevron"
/>

// AppWorksListItem — 作品一覧
<AppWorksListItem
  title="Infomii"
  status="published"
  updatedLabel="7時間前"
  qrViews={0}
  publishChecked
  onPublishChange={...}
  onOpenEditor={...}
  loading={toggling}
/>
```

---

## 6. NG / やらないこと

- Web 版ダッシュボードの見た目を App 用に壊す
- 過剰なグラデーション・ガラスモーフィズムの追加
- 自動再生のループアニメ（注意散漫）
- 同一操作に二重ローダー（RouteProgress + 全画面スピナー）
- 英語ラベルの混入
- `window.prompt` のまま放置（将来は App 用ボトムシート入力に置換—別タスク）

---

## 7. 検証チェックリスト（QA プロンプト）

```text
Verify Infomii app shell on iOS Expo Go (?client=app):

[ ] 作品一覧: 公開スイッチの ON/OFF が一目で分かる
[ ] 作品一覧: 時刻・QR数がリンクに見えない
[ ] 作品カードタップでエディタへ、スイッチタップで切替のみ
[ ] タブ切替でコンテンツが軽くスライド（または reduced motion でフェードのみ）
[ ] 各ボタン押下に視覚フィードバック（縮小 or 背景変化）
[ ] エディタヘッダの公開スイッチが一覧と同じ見た目
[ ] 遷移中トップの progress bar が表示される
[ ] VoiceOver: スイッチに「公開、オン」など読み上げ
[ ] ダークモード未対応なら light のみでコントラスト確認

Report screenshots + failing items.
```

---

## 8. 推奨実施順序

1. **Phase A**（プリミティブ）— 実装済み
2. **Phase B**（作品一覧）— 実装済み
3. **Phase C**（タブ遷移）— 実装済み
4. **Phase D**（エディタヘッダ）— 実装済み
5. **Phase E**（残画面）— 実装済み
6. **Phase F**（仕上げ・a11y）— 実装済み

手動 QA: `docs/APP_SHELL_QA_CHECKLIST.md`

---

## 9. 単発タスク投入例

```text
category: app-ui
screen: works-list
priority: P0
goal: 押せる/押せないの視認性
hint: 公開ONテキストをスイッチに。PageCardはapp専用化。
reference: docs/APP_SHELL_UI_MOTION_PROMPTS.md Phase B
```

---

*最終更新: App shell 現行構成（5タブ、PageCard メタ行、EditorAppTopBar switch）に合わせて作成。*
