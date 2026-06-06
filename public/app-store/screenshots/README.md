# App Store スクリーンショット（グループ旅行・沖縄）

## 実画面 PNG（ChatGPT 加工用）

`raw/` に iPhone 6.7" 相当（430×932 @3x → **1290×2796**）の実画面を保存しています。

| ファイル | 画面 | 訴求 |
|---------|------|------|
| `01-templates.png` | テンプレート（グループ旅行・役割分担セット・中央） | 型からすぐ始められる |
| `02-ai-home.png` | ホーム（AIでつくる・ゲストさん） | 一文で下書き |
| `03-editor.png` | エディタ（リンクブロック設定中） | ブロック編集がわかる |
| `04-publish.png` | 公開モーダル（QR・共有/リンク/開く） | QRとリンクで配布 |
| `05-guest.png` | 公開ページ（ゲスト視点） | 友だちが開くしおり |

- 公開URL（見本）: `https://www.infomii.com/v/okinawa-group-sample`
- ゲスト画面: `/demo/okinawa-group-sample`
- QR（04）: 見本URLのQR風画像（装飾用・スキャン検証用ではありません）

## 再撮影

```bash
npm run dev
PLAYWRIGHT_BROWSERS_PATH="$HOME/Library/Caches/ms-playwright" npm run app-store:capture-screenshots
```

部分撮影: `APP_STORE_CAPTURE_ONLY=01,04 npm run app-store:capture-screenshots`

## ChatGPT 用プロンプト例

各 PNG をアップロードし、1290×2796 の App Store 用フレーム画像に加工してください。UI はそのまま、背景・キャッチコピー・余白のみ整えてください。

1. **01-templates** — キャッチ: 「5人の沖縄旅行、型から3分で」／サブ: テンプレートを選んでそのまま編集
2. **02-ai-home** — キャッチ: 「書くだけで、役割分担まで下書き」／サブ: AIでつくる
3. **03-editor** — キャッチ: 「リンクも日程も、ブロックで編集」／サブ: スマホでその場編集
4. **04-publish** — キャッチ: 「QRもリンクも、すぐ共有」／サブ: 公開したら共有・コピー・プレビュー
5. **05-guest** — キャッチ: 「開いた瞬間、みんなのしおり」／サブ: 友だちはアプリ不要

### 加工時の注意

- 画面上部のロードバー・開発用バッジは写さない（raw は除去済み）
- 02 の名前は「ゲストさん」、審査用の文言は写していない
- 04 の QR は見た目用（実リンクの保証は不要）
