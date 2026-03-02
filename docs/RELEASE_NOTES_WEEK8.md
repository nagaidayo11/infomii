# Release Notes - Week8

## 概要
Week8では、ホテル向けLPの勝ち訴求固定・初回公開ウィザードの完了率改善・運用センターKPIを中心に、収益化導線の安定化を実施しました。

## 主な変更
- LPに勝ち訴求固定モードを追加し、業態別の勝ちCTAを優先表示
- LPのSNS流入に応じたCTAバリアント自動適用を継続
- 初回公開ウィザードに「QR配布完了」チェックを追加
- ウィザード離脱時に再開リンクを自動表示
- ウィザード完了者の7日継続率をダッシュボードに追加
- 施設タイプ別テンプレTop3固定・低利用テンプレ改善候補表示を継続強化
- テンプレ選択→公開中央値を業態別比較で表示
- Week8 KPIレビューカードを運用センターに追加

## 技術ノート
- `OnboardingFunnel7d.wizard` に `qrDistributedCompleted` / `retention7d` を追加
- `audit_logs` からウィザード完了者の7日継続率を集計
- `ops/health` APIに `templateToPublishMedianByIndustry` を追加
- `docs/WEEK9_EXECUTION_TICKETS.md` を新規作成
