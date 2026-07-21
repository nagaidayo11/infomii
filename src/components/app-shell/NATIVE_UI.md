# App native UI — Phase 0 foundation

App版のデフォルメUIの土台。`?client=app` / InfomiiApp WebView で有効。

## Tokens

`src/styles/app-shell.css` の `[data-client-shell="app"]`:

| Token | 用途 |
|-------|------|
| `--app-radius-sm/md/lg/xl/pill` | 角丸段階 |
| `--app-gap-*` | 余白 |
| `--app-tile-*` | リンクタイル（航空券など） |
| `--app-chip-*` | カテゴリチップ |
| `--app-option-*` | 2列/3列選択カード |

Document attributes: `data-client-shell="app"` + `data-app-ui="native"`.

## Branching

```tsx
const { isNativeUi } = useClientShell();
// Phase 1+: fork guest/editor UI with isNativeUi
```

`isNativeUi` は現状 `isAppShell` と同値。ゲスト/エディタの見た目分岐はこちらを使う。

## Primitives

| Component | Use |
|-----------|-----|
| `AppSectionHeader` | 🔗 リンク / 誰が何やるか |
| `AppChip` | カテゴリ pill |
| `AppLinkTile` + `AppLinkTileGrid` | ソフトティールのアクションタイル |
| `AppOptionCard` + `AppOptionCardRow` | 2列 / 3列 選択 |
| `AppSegmentedControl` `variant="filled"` | コンテンツ / 見た目 / サイズ・影 |
| `AppFieldLabel` / `AppFieldInput` | 設定フォーム |
| `AppListRow` | リンク項目リスト（href or onClick） |
| `AppBottomSheet` | 設定シート |

## Phase 1 (done)

Guest page (non-editable) forks when `isNativeUi`:

| Card type | Component | Native UI |
|-----------|-----------|-----------|
| `pageLinks` | `PageLinksCard` | `AppSectionHeader` + `AppLinkTileGrid` |
| `tabs_info` | `TabsInfoCard` | `AppSectionHeader` + `AppChip` |
| `schedule` | `ScheduleCard` | `AppSectionHeader` + timeline rows |

Validate: `/demo/okinawa-group-sample?client=app`

Web (no `client=app`) and editor editable paths are unchanged.

## Phase 2 (done)

Editor block settings when `isNativeUi`:

| Surface | Change |
|---------|--------|
| Palette tabs | `AppSegmentedControl variant="filled"` |
| `pageLinks` content | `PageLinksNativeSettings` — title field, 2/3列 OptionCards, expandable AppListRow items |
| Header actions | Softer copy/delete buttons |

Web settings unchanged. Other card types still use web forms under the native palette chrome.

## Phase 3 (done)

| Area | Change |
|------|--------|
| `tabs_info` / `schedule` settings | `TabsInfoNativeSettings` / `ScheduleNativeSettings` |
| checklist / contact_hub / faq guest | Native section headers + soft rows |
| Editor preview | Native chrome when `isNativeUi` (same look as guest) |

## Phase 4 (done)

| Area | Change |
|------|--------|
| Guest | core personal + hotel + menu + coupon/campaign cards |
| Settings | simple fields, list blocks, nearby/social/info, menu item expandables |
| Editor (app) | Mobile library/settings use `AppBottomSheet` (`panel--editor`) |
| Guest header | Native token chrome via `[data-guest-header]` |

## Phase 5 (done)

| Area | Change |
|------|--------|
| Settings | Expandable native editors for `menu_categories` / `menu_time_band` / `menu_grid` (`MenuComplexNativeSettings`) |
| Guest header | Share action (`GuestShareButton`: Web Share API + clipboard fallback) |
| Editor sheets | `AppBottomSheet` size snaps: `compact` / `comfortable` / `full` (+ chip controls) |

## Phase 9 (done)

| Area | Change |
|------|--------|
| `native-guest-icons` | Stroke SVG → filled deformed pictograms (section headers) |
| `AppLinkTileIcons` | Themed tile badges (travel / food / map / stay / alert / utility) |
| `pageLinks` guest | Native UI fork — `AppLinkTileGrid` + circle variant with deformed icons |
| `icon_shortcuts` | `AppLinkTileIcon` instead of `LineIcon` |
| Schedule | `NativeScheduleDot` — timeline dots + settings picker use SVG not emoji |
| Quote | `NativeQuoteIcon` in native section header |

## Phase 10 (done)

| Area | Change |
|------|--------|
| Native bridge | `app-haptic` + `app-share` postMessage from WebView |
| Expo | `expo-haptics` + `haptic-bridge` / `share-bridge` in InfomiiApp |
| Web | `appTapHaptic()` — native first, `navigator.vibrate` fallback |
| AppSwitch / taps | Light haptic on toggle and `.app-link-tile` taps |
| Guest share | Native share sheet when `ReactNativeWebView` is present |
| Link tiles | Labels wrap (`…` truncation removed) |
