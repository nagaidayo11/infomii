# Release Notes - Week14

## Summary
Week14では、運用拡張に備えたLP/作成導線/運用センターの可視化を強化し、継続率悪化の早期検知と復旧アクションを1画面で判断できる状態にしました。

## Implemented
- LP
  - `kw` パラメータで訴求文を最適化（`checkin` / `bath` / `breakfast` / `wifi`）
  - CTA離脱率ヒートマップの基礎指標を運用センターで可視化
  - LP速度KPIを4週間トレンドで可視化
- Dashboard / Ops Center
  - `week14Preview` を追加し、以下を表示
    - KPIレビュー（LP→登録 / 公開完了 / Pro転換 / 14日継続 / 紹介 / 復旧時間）
    - 再公開リワード訴求メッセージ
    - 14日継続率の下振れアラート
    - 障害復旧プレイブック固定表示
    - 週次レポート配信ログ監査
    - 請求完了率（曜日別）
    - checkout未完了の再送対象判定
  - テンプレ選択の自動ソート精度を強化（施設規模/業態の重み付け）
  - 初回公開ウィザード離脱理由の集計表示を追加
- API
  - `/api/ops/health` に Week14用集計ロジックを追加
  - `/api/ops/weekly-report` 実行時に `ops.weekly_report_sent` を監査ログへ保存

## Notes
- `NEXT_PUBLIC_LP_WINNER_ONLY=true` はVercel環境変数で有効化が必要です。
- 週次レポート監査は配信実行後にログが蓄積されます。
