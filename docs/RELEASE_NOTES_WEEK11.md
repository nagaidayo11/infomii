# Release Notes - Week11

## 概要
Week11では、2本目公開までの短縮・通知最適化・課金導線の運用定着を中心に、収益安定化のための施策を実装しました。

## 主な変更
- 施設規模別オンボーディング完了率比較を追加
- 2本目公開ショートカットとテンプレ複製→即公開導線を追加
- LPの業態別勝ち訴求を固定し、A/B切り替えUIを停止
- LP事例セクションの業態タグ表示を継続強化
- CTA遷移率のデバイス別（SP/PC）可視化を追加
- 事例セクション閲覧率（スクロール深度）の比較指標を追加
- 編集画面に公開後チェックパネルを追加
- 問い合わせ導線追加の1クリック修正を追加
- 画像最適化未実施ブロックへの直接遷移を追加
- 休眠通知の最適時間帯提案を追加
- 通知文面の勝ちパターン自動選択コピーを追加
- 通知チャネル別の再開後7日継続（推定）を追加
- 阻害要因ベースの改善タスク提案を追加
- 請求/カード更新後の再開導線を固定表示
- 週次レポートへ実行済み改善数を追加
- 重大アラート件数（即時通知対象）を追加
- Week11 KPIレビューカードを追加

## 技術ノート
- `OpsHealthSnapshot` / `ops/health` API に `week11Preview` を追加
- `week11Preview`:
  - `onboardingCompletionByScale`
  - `secondPublishShortcutReady`
  - `secondPublishMedianHours`
  - `ctaRateByDevice`
  - `caseSectionViewRate`
  - `optimizedDormancySendWindow`
  - `dormancyWinnerCopyVariant`
  - `retention7dByDormancyChannel`
  - `blockerImprovementTasks`
  - `executedImprovementsCount`
  - `criticalAlertCount`
- `trackOnboardingAuthEvent` に `deviceType` を追加
- `docs/WEEK12_EXECUTION_TICKETS.md` を新規作成
