# App Store スクリーンショット（グループ旅行・沖縄）

## 実画面 PNG（ChatGPT 加工用）

`raw/` に iPhone 6.7" 相当（430×932 @3x → **1290×2796**）の実画面を保存しています。

| ファイル | 画面 | 訴求 |
|---------|------|------|
| `01-templates.png` | テンプレート（グループ旅行・役割分担セット） | 型からすぐ始められる |
| `02-ai-home.png` | ホーム（AIでつくる） | 一文で下書き |
| `03-editor.png` | エディタ（リンクブロック設定中） | ブロック編集がわかる |
| `04-publish.png` | 公開モーダル（QR・友だち共有） | リンク/QR/LINEで配布 |
| `05-guest.png` | 公開ページ（ゲスト視点） | 友だちが開くしおり |

- 公開URL（見本）: `https://www.infomii.com/v/okinawa-group-sample`
- ゲスト画面: `/demo/okinawa-group-sample`
- QR（04）: 装飾用プレースホルダ（スキャン用の実リンクではありません）

## 再撮影

```bash
npm run dev
npm run app-store:capture-screenshots
```

## ChatGPT 用プロンプト例

1. **01-templates** — 「5人の沖縄旅行、型から3分で」
2. **02-ai-home** — 「書くだけで、役割分担まで下書き」
3. **03-editor** — 「リンクも日程も、ブロックで編集」
4. **04-publish** — 「LINEもQRも、友だちにそのまま」
5. **05-guest** — 「開いた瞬間、みんなのしおり」
