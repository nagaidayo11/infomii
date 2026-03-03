# Release Notes - Week15

## Summary
Week15では、LP流入の分解可視化と公開品質チェックを強化し、運用センターで「拡張時に崩れやすいポイント」を先回りできる構成に更新しました。

## Implemented
- LP / Login
  - 業態別の「導入までの不安解消」セクションを追加
  - `kw`（checkin/bath/breakfast/wifi）をログイン遷移・計測に反映
- Ops Health API
  - `week15Preview` を追加
    - `ref/kw`単位のCTAファネル
    - LP LCPボトルネック要因
    - テンプレ別 初回公開率
    - 請求導線の遷移完了率
    - 新規/既存の継続率比較
    - 週次ボトルネック抽出
    - 重大アラート復旧チェック
    - 週次レポート改善実行率
    - Week15 KPIレビュー
- Dashboard
  - テンプレカードに「想定運用人数」「初期値補完」「初回公開率」を追加
  - 利用状況別のPro訴求メッセージを追加
  - checkout再開導線の1クリック有効状態を表示
  - Week15 KPIレビューと運用ボトルネック表示を追加
  - 週次レポート送信時に改善実行率を同送
- Editor
  - 公開前チェックに「公開直前チェックリスト（必須5項目）」を追加
  - 画像/リンク/法務/子ページ導線の優先度を調整
  - 子ページ導線不足の自動提案を追加
- Weekly Report API
  - `improvementExecutionRate` を監査ログに保存

## Notes
- `ref/kw`分解は `onboarding.login_success` / `onboarding.signup_completed` のメタデータ依存です。
- 週次レポート改善実行率は送信ログ蓄積後に安定します。
