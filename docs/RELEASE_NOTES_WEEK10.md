# Release Notes - Week10

## 概要
Week10では、ホテル導入後の継続率と課金転換を同時に上げるため、LP最適化・編集効率化・運用センター分析を強化しました。

## 主な変更
- 施設規模（小/中/大）ごとの初回公開ガイドをダッシュボードに追加
- 公開後48時間アクションを自動提案
- テンプレ採用率の高い業態を優先表示
- LP事例セクションに業態タグフィルタを追加
- LP CTA文言を流入チャネル別に最適化表示
- LPスクロール離脱ヒートマップ（CTA到達ベース）を運用センターに表示
- 編集画面に「おすすめ構成」ボタン群を追加
- 未入力項目の一括補完を追加
- 公開前チェックに問い合わせ導線（連絡先）必須判定を追加
- 再訪予測スコアを運用センターへ追加
- 通知チャネルの勝ちパターンを施設タイプ別に自動選択
- 通知送信後24h反応率の週次比較を表示
- Pro転換阻害要因アンケートを追加
- 請求・カード管理導線の完了率を表示
- 週次レポートに改善アクション実行率を追加
- エラー履歴に優先度（高/中/低）表示を追加
- 再発防止チェックリストを固定表示
- Week10 KPIレビューカードを追加

## 技術ノート
- `OpsHealthSnapshot` / `ops/health` API に `week10Preview` を追加
- `week10Preview`:
  - `lpScrollHeatmap`
  - `revisitPredictionScore`
  - `dormancyWinnerChannelByFacility`
  - `dormancyReactionTrend4w`
  - `proBlockerTopReasons`
  - `billingManagementCompletion7d`
  - `actionExecutionRate`
- `trackProBlockerReason` を追加し、阻害要因ログを保存
- `docs/WEEK11_EXECUTION_TICKETS.md` を新規作成
