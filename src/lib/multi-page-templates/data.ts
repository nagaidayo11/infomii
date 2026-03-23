import type {
  MultiPageTemplate,
  MultiPageTemplateId,
  TemplatePage,
} from "./types";

function page(title: string, blocks: TemplatePage["blocks"]): TemplatePage {
  return { title, blocks };
}

function hotelBasicPages(): TemplatePage[] {
  return [
    page("チェックインガイド", [
      { type: "title", content: "チェックインガイド" },
      { type: "text", content: "到着後の手続き、館内の最初の導線をまとめています。" },
      { type: "image", src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", alt: "フロント" },
      { type: "button", label: "館内総合案内へ", href: "#overview" },
    ]),
    page("館内総合案内", [
      { type: "title", content: "館内総合案内" },
      { type: "icon", icon: "🧭", label: "主要設備の場所と利用時間" },
      { type: "text", content: "大浴場・ランドリー・自販機・電子レンジの場所をまとめて記載してください。" },
      { type: "button", label: "周辺アクセス", href: "#access" },
    ]),
    page("朝食案内", [
      { type: "title", content: "朝食案内" },
      { type: "icon", icon: "🍽️", label: "営業時間 / 会場 / 提供形式" },
      { type: "text", content: "混雑時間の目安やアレルギー案内を追記してください。" },
      { type: "button", label: "朝食会場への行き方", href: "#breakfast-map" },
    ]),
    page("チェックアウト", [
      { type: "title", content: "チェックアウト" },
      { type: "icon", icon: "🚪", label: "退館時刻・鍵返却・追加精算" },
      { type: "text", content: "荷物預かりやタクシー手配の最終受付も記載できます。" },
    ]),
    page("周辺アクセス", [
      { type: "title", content: "周辺アクセス" },
      { type: "icon", icon: "📍", label: "駅・コンビニ・駐車場・病院" },
      { type: "text", content: "徒歩分数や営業時間を付けると、フロントの質問対応が減ります。" },
      { type: "button", label: "地図を開く", href: "#map" },
    ]),
  ];
}

function businessHotelPages(): TemplatePage[] {
  return [
    page("出張ゲスト向けクイック案内", [
      { type: "title", content: "出張ゲスト向けクイック案内" },
      { type: "text", content: "忙しいビジネス利用者向けに、最初に必要な情報だけを集約。" },
      { type: "image", src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", alt: "ビジネスホテル" },
      { type: "button", label: "Wi-Fi・作業席を見る", href: "#wifi-work" },
      { type: "button", label: "領収書・精算案内", href: "#invoice" },
    ]),
    page("Wi-Fi / ワークスペース", [
      { type: "title", content: "Wi-Fi / ワークスペース" },
      { type: "icon", icon: "💻", label: "SSID・パスワード・作業席" },
      { type: "text", content: "ロビー作業席、電源、プリント可否、VPN利用注意を記載してください。" },
    ]),
    page("朝食（時短向け）", [
      { type: "title", content: "朝食（時短向け）" },
      { type: "icon", icon: "🥪", label: "混雑回避時間 / テイクアウト可否" },
      { type: "text", content: "出発前に短時間で利用しやすい導線を案内します。" },
    ]),
    page("領収書・インボイス", [
      { type: "title", content: "領収書・インボイス" },
      { type: "icon", icon: "🧾", label: "宛名変更 / 適格請求書 / 再発行" },
      { type: "text", content: "法人利用の問い合わせが多い項目を先回りで記載してください。" },
      { type: "button", label: "フロントへ連絡", href: "tel:+81-00-0000-0000" },
    ]),
    page("深夜到着・門限", [
      { type: "title", content: "深夜到着・門限" },
      { type: "icon", icon: "🌙", label: "24時以降の入館手順" },
      { type: "text", content: "夜間入口、インターホン、セルフチェックイン手順を記載してください。" },
    ]),
    page("ランドリー・アイロン貸出", [
      { type: "title", content: "ランドリー・アイロン貸出" },
      { type: "icon", icon: "👔", label: "洗濯機空き状況・備品貸出" },
      { type: "text", content: "出張ニーズが高い洗濯・アイロン関連を独立ページ化。" },
    ]),
    page("駅・空港アクセス", [
      { type: "title", content: "駅・空港アクセス" },
      { type: "icon", icon: "🚆", label: "始発案内 / 空港リムジン / タクシー" },
      { type: "text", content: "早朝移動の導線を事前提示して、朝の問い合わせを減らします。" },
    ]),
  ];
}

function ryokanPages(): TemplatePage[] {
  return [
    page("おもてなし案内", [
      { type: "title", content: "おもてなし案内" },
      { type: "text", content: "旅館での過ごし方を、チェックイン直後に理解できる構成です。" },
      { type: "image", src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", alt: "旅館" },
      { type: "button", label: "お食事時間を見る", href: "#dining" },
      { type: "button", label: "大浴場の利用方法", href: "#bath" },
    ]),
    page("お食事時間", [
      { type: "title", content: "お食事時間" },
      { type: "icon", icon: "🍱", label: "夕食部制 / 朝食時間 / 会場" },
      { type: "text", content: "アレルギー相談と最終入場時刻を明記すると安心感が上がります。" },
    ]),
    page("大浴場のご案内", [
      { type: "title", content: "大浴場のご案内" },
      { type: "icon", icon: "♨️", label: "利用時間 / 備品 / マナー" },
      { type: "text", content: "混雑しやすい時間帯、タオル案内、入れ墨方針などを記載してください。" },
    ]),
    page("貸切風呂予約", [
      { type: "title", content: "貸切風呂予約" },
      { type: "icon", icon: "🛁", label: "予約枠 / 料金 / キャンセル" },
      { type: "text", content: "家族利用が多い旅館向けに、予約導線を明確化。" },
      { type: "button", label: "予約問い合わせ", href: "tel:+81-00-0000-0000" },
    ]),
    page("館内作法・夜間マナー", [
      { type: "title", content: "館内作法・夜間マナー" },
      { type: "icon", icon: "🌙", label: "静粛時間 / 共用部マナー" },
      { type: "text", content: "文化的な違いで起きやすいトラブルを先に防ぐページです。" },
    ]),
    page("売店・土産", [
      { type: "title", content: "売店・土産" },
      { type: "icon", icon: "🎁", label: "営業時間 / 人気商品" },
      { type: "text", content: "館内売店の導線を作ることで、接客と売上の両方を支援します。" },
    ]),
    page("周辺散策", [
      { type: "title", content: "周辺散策" },
      { type: "icon", icon: "🥾", label: "神社・遊歩道・撮影スポット" },
      { type: "text", content: "徒歩圏散策に特化した案内。季節ごとの見どころ追記を推奨。" },
    ]),
    page("送迎案内", [
      { type: "title", content: "送迎案内" },
      { type: "icon", icon: "🚌", label: "駅送迎時刻 / 予約締切" },
      { type: "text", content: "チェックイン前の電話を減らすため、集合場所画像の追加も有効です。" },
    ]),
  ];
}

function minpakuPages(): TemplatePage[] {
  return [
    page("セルフチェックイン", [
      { type: "title", content: "セルフチェックイン" },
      { type: "text", content: "鍵の受け取り、入室方法、トラブル時連絡先を最短で案内します。" },
      { type: "image", src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", alt: "民泊" },
      { type: "button", label: "ハウスルールへ", href: "#rules" },
    ]),
    page("ハウスルール", [
      { type: "title", content: "ハウスルール" },
      { type: "icon", icon: "🏠", label: "騒音 / 禁煙 / パーティー禁止" },
      { type: "text", content: "近隣トラブル防止のため、違反時対応を明記してください。" },
    ]),
    page("ゴミ分別・収集日", [
      { type: "title", content: "ゴミ分別・収集日" },
      { type: "icon", icon: "🗑️", label: "分別ルール / ゴミ置き場" },
      { type: "text", content: "自治体ルールを画像つきで案内すると、滞在中トラブルが大きく減ります。" },
    ]),
    page("Wi-Fi / 家電の使い方", [
      { type: "title", content: "Wi-Fi / 家電の使い方" },
      { type: "icon", icon: "📶", label: "SSID / スマートロック / エアコン" },
      { type: "text", content: "使い方の問い合わせが多い設備を優先して記載してください。" },
    ]),
    page("チェックアウト手順", [
      { type: "title", content: "チェックアウト手順" },
      { type: "icon", icon: "✅", label: "施錠 / 消灯 / 忘れ物確認" },
      { type: "text", content: "退出時の写真送付ルールや鍵返却方法を明記できます。" },
    ]),
    page("緊急連絡", [
      { type: "title", content: "緊急連絡" },
      { type: "icon", icon: "🆘", label: "深夜トラブル / 病院 / 警察" },
      { type: "text", content: "ゲストが迷わないよう、優先順で連絡先を並べてください。" },
      { type: "button", label: "緊急連絡先に発信", href: "tel:+81-00-0000-0000" },
    ]),
  ];
}

function kurekakePages(): TemplatePage[] {
  return [
    page("トップページ", [
      { type: "title", content: "Information" },
      { type: "text", content: "滞在中によく使うご案内を1ページにまとめました。下のメニューから各案内をご確認ください。" },
      { type: "image", src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80", alt: "ホテルロビー" },
      { type: "button", label: "Wi-Fi", href: "#wifi" },
      { type: "button", label: "朝食", href: "#breakfast" },
      { type: "button", label: "駐車場", href: "#parking" },
      { type: "text", content: "メニュー: はじめに / 朝食 / ハッピーアワー / Wi-Fi / 客室案内 / アメニティ / 貸出品・売店 / 客室清掃 / コインランドリー / 電子レンジ / 駐車場 / 宅急便 / マッサージ / タクシー / モーニングコール / 周辺地図 / 提携居酒屋" },
    ]),
    page("はじめに", [{ type: "title", content: "はじめに" }, { type: "text", content: "このページでは、滞在中に必要な館内情報をまとめてご案内します。ご不明点はフロントまでお声がけください。" }]),
    page("朝食", [{ type: "title", content: "朝食" }, { type: "icon", icon: "🍽️", label: "朝食 6:00-9:30 / 1Fロビー" }, { type: "text", content: "会場・時間・混雑時間帯・アレルギー対応などを記載してください。" }]),
    page("ハッピーアワー", [{ type: "title", content: "ハッピーアワー" }, { type: "icon", icon: "🍺", label: "開催時間・会場" }, { type: "text", content: "ドリンク内容、対象時間、提供場所、注意事項を記載してください。" }]),
    page("Wi-Fi", [{ type: "title", content: "Wi-Fi" }, { type: "icon", icon: "📶", label: "SSID / パスワード" }, { type: "text", content: "客室または館内共通のWi-Fi情報、接続できない場合の案内を記載してください。" }]),
    page("客室案内", [{ type: "title", content: "客室案内" }, { type: "icon", icon: "🛏️", label: "客室設備・利用ルール" }, { type: "text", content: "空調、TV、冷蔵庫、チェックアウト時のお願いなどをまとめてください。" }]),
    page("アメニティ", [{ type: "title", content: "アメニティ" }, { type: "icon", icon: "🪥", label: "客室備え付け・フロント提供" }, { type: "text", content: "設置場所、追加受け取り方法、在庫がない場合の案内を記載してください。" }]),
    page("貸出品・売店", [{ type: "title", content: "貸出品・売店" }, { type: "icon", icon: "🛍️", label: "貸出備品 / 売店商品" }, { type: "text", content: "貸出可能時間、受付方法、売店営業時間を記載してください。" }]),
    page("客室清掃", [{ type: "title", content: "客室清掃" }, { type: "icon", icon: "🧹", label: "清掃時間・連泊時の対応" }, { type: "text", content: "清掃希望の出し方、タオル交換、清掃不要時のルールを記載してください。" }]),
    page("コインランドリー", [{ type: "title", content: "コインランドリー" }, { type: "icon", icon: "🧺", label: "設置場所・利用時間・料金" }, { type: "text", content: "台数、目安時間、利用上の注意を記載してください。" }]),
    page("電子レンジ", [{ type: "title", content: "電子レンジ" }, { type: "icon", icon: "📡", label: "設置場所・利用可能時間" }, { type: "text", content: "フロア、利用マナー、加熱できないものを記載してください。" }]),
    page("駐車場", [{ type: "title", content: "駐車場" }, { type: "icon", icon: "🅿️", label: "敷地内先着 / 提携あり" }, { type: "text", content: "満車時の案内、料金、入出庫可能時間を記載してください。" }]),
    page("宅急便", [{ type: "title", content: "宅急便" }, { type: "icon", icon: "📦", label: "発送受付・梱包資材" }, { type: "text", content: "受付時間、対応配送会社、支払い方法を記載してください。" }]),
    page("マッサージ", [{ type: "title", content: "マッサージ" }, { type: "icon", icon: "💆", label: "受付時間・料金" }, { type: "text", content: "予約方法、最終受付、キャンセルポリシーを記載してください。" }]),
    page("タクシー", [{ type: "title", content: "タクシー" }, { type: "icon", icon: "🚕", label: "手配方法・待機場所" }, { type: "text", content: "フロント手配可否、所要時間目安、配車アプリ案内を記載してください。" }]),
    page("モーニングコール", [{ type: "title", content: "モーニングコール" }, { type: "icon", icon: "⏰", label: "受付時間・依頼方法" }, { type: "text", content: "フロント依頼方法、対応可能時間、注意事項を記載してください。" }]),
    page("周辺地図", [{ type: "title", content: "周辺地図" }, { type: "icon", icon: "🗺️", label: "周辺施設・アクセス" }, { type: "text", content: "コンビニ、駅、病院、飲食店などを地図とともに記載してください。" }]),
    page("提携居酒屋", [{ type: "title", content: "提携居酒屋" }, { type: "icon", icon: "🏮", label: "特典・営業時間" }, { type: "text", content: "提携店名、特典内容、予約方法、移動手段を記載してください。" }]),
  ];
}

export const MULTI_PAGE_TEMPLATES: MultiPageTemplate[] = [
  {
    id: "hotel-basic",
    name: "ホテル基本（標準運用）",
    description: "はじめて導入するホテル向け。到着〜滞在〜退館を5ページで標準化します。",
    previewImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    pages: hotelBasicPages(),
  },
  {
    id: "business-hotel",
    name: "ビジネスホテル（時短運用）",
    description: "出張客向けに特化。領収書・深夜到着・移動導線まで含む7ページ構成。",
    previewImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
    pages: businessHotelPages(),
  },
  {
    id: "ryokan",
    name: "旅館（おもてなし運用）",
    description: "食事・温浴・作法・送迎など、旅館らしい接遇情報を8ページで構成。",
    previewImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
    pages: ryokanPages(),
  },
  {
    id: "minpaku",
    name: "民泊（一棟貸し運用）",
    description: "セルフチェックインとハウスルール重視。トラブル予防に強い6ページ構成。",
    previewImage: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
    pages: minpakuPages(),
  },
  {
    id: "hotel-kurekake",
    name: "くれたけ情報サイト構成（AI検索なし）",
    description: "kurekake-info.com の実運用を再現した18ページ構成。",
    previewImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80",
    pages: kurekakePages(),
  },
];

export function getMultiPageTemplate(
  id: MultiPageTemplateId
): MultiPageTemplate | null {
  return MULTI_PAGE_TEMPLATES.find((t) => t.id === id) ?? null;
}

export function getMultiPageTemplateIds(): MultiPageTemplateId[] {
  return MULTI_PAGE_TEMPLATES.map((t) => t.id as MultiPageTemplateId);
}
