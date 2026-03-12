# Notion風ビジュアルエディタ（インフォミー）

## 概要

- **利用者**: 日本のホテル現場スタッフ  
- **用途**: ゲスト向け案内ページの組み立て  
- **UI言語**: 日本語のみ  

## レイアウト

| エリア | 内容 |
|--------|------|
| **左サイドバー** | ブロックライブラリ（クリック or ドラッグで追加） |
| **中央** | 編集キャンバス（並べ替え・インライン編集） |
| **右** | iPhone風フレームのライブプレビュー（Zustand 購読で即時反映） |

## ブロック（7種）

1. テキスト  
2. 画像  
3. ボタン  
4. アイコン  
5. 区切り線  
6. 地図  
7. ギャラリー  

## 操作

- **追加**: ライブラリをクリック、またはブロックをキャンバスへドロップ  
- **並べ替え**: 各ブロック左のハンドル（⋮⋮）をドラッグ  
- **インライン編集**: テキストはその場で編集、画像URL・ボタン文言などは入力欄  
- **複製 / 削除**: ブロック右上のツールバー（複製・削除）  
- **保存 / 読み込み**: ヘッダーの「保存（JSON）」でダウンロード、「読み込み」で `.json` を復元  

## 技術スタック

- React / TypeScript / TailwindCSS  
- **dnd-kit**（Sortable + Draggable）  
- **Zustand**（`usePageEditorStore`）  

## データ（JSON）

```ts
usePageEditorStore.getState().toJSON()   // 保存用
usePageEditorStore.getState().loadJSON(s) // 読み込み
```

## エントリ

- ルート: `/editor/builder`  
- コンポーネント: `Editor` または `NotionVisualEditor`（同一）  
- 配置: `src/components/page-editor/`
