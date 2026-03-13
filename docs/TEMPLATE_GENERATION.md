# テンプレート生成システム（infomii）

ユーザーがテンプレートを選択すると、**複数ページとブロックが自動作成**されます。テンプレートは **JSON** で定義・保存できます。

## 例: Hotel Basic

**生成されるページ（5件）**

1. 館内総合案内  
2. WiFi  
3. 朝食  
4. チェックアウト  
5. 周辺観光  

各ページには、タイトル・テキスト・画像・ボタン・アイコンなどの**事前定義ブロック**が入ります。

## テンプレートの保存形式（JSON）

```json
{
  "id": "hotel-basic",
  "name": "Hotel Basic",
  "description": "館内総合案内・WiFi・朝食・チェックアウト・周辺観光の5ページを自動作成します。",
  "previewImage": "https://...",
  "pages": [
    {
      "title": "館内総合案内",
      "blocks": [
        { "type": "title", "content": "館内総合案内" },
        { "type": "text", "content": "ご滞在に役立つ情報をまとめました。" },
        { "type": "image", "src": "https://...", "alt": "館内" },
        { "type": "button", "label": "館内マップ", "href": "#" }
      ]
    }
  ]
}
```

ブロックタイプ: `title` | `text` | `image` | `button` | `icon`

## 実装（React + TypeScript）

| 役割 | 場所 |
|------|------|
| 型定義 | `src/lib/multi-page-templates/types.ts` |
| テンプレートデータ（JSON互換） | `src/lib/multi-page-templates/data.ts` |
| ブロック → 保存用変換 | `src/lib/multi-page-templates/convert.ts` |
| ページ作成 API | `src/lib/storage.ts`（`createPagesFromTemplate`, `createPagesFromMultiPageTemplate`） |
| JSON 入出力 | `getTemplatesAsJson()`, `loadTemplatesFromJson(json)` |
| UI | `src/components/template-gallery-ui/` |

## フロー

1. ユーザーがテンプレートを選択（ギャラリー or ID）
2. `createPagesFromMultiPageTemplate(templateId)` または `createPagesFromTemplate(template)` を呼ぶ
3. テンプレートの各 `page` について 1 件の Information を作成
4. 各ページの `blocks` を `InformationBlock[]` に変換して保存

## サンプル JSON

`/templates/hotel-basic.json` に Hotel Basic の例を配置しています。
