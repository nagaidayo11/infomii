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
      { type: "text", content: "到着後3分で必要情報を確認できる、標準運用向けページです。" },
      {
        type: "checklist",
        items: [
          "本人確認書類をご提示ください（1分程度）",
          "宿泊者情報の確認にご協力ください",
          "Wi-Fi/朝食/チェックアウト時刻をご確認ください",
        ],
      },
      {
        type: "iconRow",
        items: [
          { icon: "wifi", label: "Wi-Fi" },
          { icon: "breakfast", label: "朝食" },
          { icon: "checkout", label: "チェックアウト" },
          { icon: "map", label: "アクセス" },
        ],
      },
      { type: "image", src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", alt: "フロント" },
      { type: "button", label: "館内総合案内へ", href: "#facility-overview" },
    ]),
    page("館内総合案内", [
      { type: "title", content: "館内総合案内" },
      { type: "text", content: "設備の場所と利用時間をまとめています。迷ったときは内線9へご連絡ください。" },
      {
        type: "hours",
        items: [
          { label: "大浴場（2F）", value: "15:00-24:00 / 6:00-10:00" },
          { label: "コインランドリー（2F）", value: "24時間" },
          { label: "朝食会場（1F）", value: "6:30-9:30（最終入場 9:00）" },
          { label: "売店（1F）", value: "7:00-22:00" },
        ],
      },
      { type: "button", label: "周辺アクセスへ", href: "#access" },
    ]),
    page("朝食案内", [
      { type: "title", content: "朝食案内" },
      { type: "text", content: "和洋ビュッフェ形式です。混雑回避とアレルギー対応案内を含めた実運用文面です。" },
      {
        type: "section",
        title: "基本情報",
        body: "営業時間 6:30-9:30（最終入場 9:00）\n会場 1F レストラン\n混雑ピーク 7:15-8:10",
      },
      {
        type: "checklist",
        items: [
          "アレルギー対応が必要な場合はスタッフへお声がけください",
          "お部屋への持ち出しはご遠慮ください",
          "出発が早い場合はフロントへ事前相談ください",
        ],
      },
      { type: "button", label: "朝食会場への行き方", href: "#breakfast-map" },
    ]),
    page("チェックアウト", [
      { type: "title", content: "チェックアウト" },
      { type: "text", content: "チェックアウトは11:00までです。混雑緩和のため、出発前の事前確認にご協力ください。" },
      {
        type: "checklist",
        items: [
          "チェックアウト時刻 11:00",
          "カードキーをフロント返却または回収BOXへ",
          "ご精算内容をご確認ください",
          "タクシー手配は内線9（目安 10-15分）",
        ],
      },
    ]),
    page("周辺アクセス", [
      { type: "title", content: "周辺アクセス" },
      { type: "text", content: "徒歩圏の主要スポットです。地図案内が必要な場合はフロントへお声がけください。" },
      {
        type: "pricing",
        items: [
          { label: "○○駅", value: "徒歩5分" },
          { label: "コンビニ", value: "徒歩2分（24時間）" },
          { label: "ドラッグストア", value: "徒歩4分" },
          { label: "救急病院", value: "タクシー8分" },
        ],
      },
      { type: "button", label: "地図を開く", href: "#map" },
    ]),
  ];
}

function businessHotelPages(): TemplatePage[] {
  return [
    page("出張ゲスト向けクイック案内", [
      { type: "title", content: "出張ゲスト向けクイック案内" },
      { type: "text", content: "忙しい出張利用向けに、初動で必要な情報を90秒で確認できる構成です。" },
      {
        type: "iconRow",
        items: [
          { icon: "wifi", label: "Wi-Fi / 作業席" },
          { icon: "notice", label: "領収書・インボイス" },
          { icon: "map", label: "駅・空港アクセス" },
          { icon: "checkout", label: "深夜到着 / 退館" },
        ],
      },
      { type: "image", src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", alt: "ビジネスホテル" },
      { type: "button", label: "Wi-Fi・作業席を見る", href: "#wifi-work" },
      { type: "button", label: "領収書・精算案内", href: "#invoice" },
    ]),
    page("Wi-Fi / ワークスペース", [
      { type: "title", content: "Wi-Fi / ワークスペース" },
      { type: "text", content: "客室・ロビーどちらも接続可能です。会議推奨席や印刷導線も案内します。" },
      {
        type: "section",
        title: "接続情報",
        body: "SSID: Infomii-Biz\nPASS: biz2026\n接続不可時: 内線9まで",
      },
      {
        type: "hours",
        items: [
          { label: "ロビー作業席", value: "12席（全席電源あり）" },
          { label: "会議推奨エリア", value: "ロビー奥席（比較的静か）" },
          { label: "印刷対応", value: "フロント対応（有料）" },
        ],
      },
    ]),
    page("朝食（時短向け）", [
      { type: "title", content: "朝食（時短向け）" },
      { type: "text", content: "朝の混雑を避けたい方向けの案内です。出発前でも短時間で利用できます。" },
      { type: "icon", icon: "svg:clock", label: "営業時間: 6:00-9:30" },
      { type: "icon", icon: "svg:info", label: "比較的空いている時間: 6:00-6:45 / 8:45以降" },
      { type: "icon", icon: "svg:package", label: "テイクアウト: 一部メニュー対応" },
    ]),
    page("領収書・インボイス", [
      { type: "title", content: "領収書・インボイス" },
      { type: "text", content: "法人利用でよくある質問をまとめています。出発前の混雑緩和にご協力ください。" },
      {
        type: "checklist",
        items: [
          "適格請求書（登録番号記載）発行可",
          "宛名変更はフロントで対応",
          "再発行は当日中まで対応可",
          "チェックアウト前日の依頼で待ち時間を短縮できます",
        ],
      },
      { type: "button", label: "フロントへ連絡", href: "tel:+81-00-0000-0000" },
    ]),
    page("深夜到着・門限", [
      { type: "title", content: "深夜到着・門限" },
      { type: "text", content: "24:00以降は夜間入口をご利用ください。フロント不在時はインターホンで対応します。" },
      { type: "icon", icon: "svg:info", label: "夜間入口: 建物右側通路" },
      { type: "icon", icon: "svg:bell", label: "インターホン: 1回押して応答をお待ちください" },
    ]),
    page("ランドリー・アイロン貸出", [
      { type: "title", content: "ランドリー・アイロン貸出" },
      { type: "text", content: "出張利用で需要の高いクリーニング関連をまとめています。" },
      { type: "icon", icon: "svg:washing-machine", label: "コインランドリー: 2F / 24時間" },
      { type: "icon", icon: "svg:hanger", label: "アイロン貸出: フロント（在庫数に限りあり）" },
      { type: "icon", icon: "svg:phone", label: "問い合わせ: 内線9" },
    ]),
    page("駅・空港アクセス", [
      { type: "title", content: "駅・空港アクセス" },
      { type: "text", content: "早朝移動向けの主要導線です。時間に余裕をもってご出発ください。" },
      { type: "icon", icon: "svg:train", label: "○○駅: 徒歩5分 / 始発 5:12" },
      { type: "icon", icon: "svg:bus", label: "空港リムジン: ホテル前 6:10発" },
      { type: "icon", icon: "svg:taxi", label: "タクシー手配: 内線9（目安10分）" },
    ]),
  ];
}

function ryokanPages(): TemplatePage[] {
  return [
    page("おもてなし案内", [
      { type: "title", content: "おもてなし案内" },
      { type: "text", content: "旅館ならではの滞在導線を、到着直後に把握できるようにまとめました。" },
      {
        type: "iconRow",
        items: [
          { icon: "spa", label: "大浴場" },
          { icon: "breakfast", label: "お食事時間" },
          { icon: "notice", label: "館内作法" },
          { icon: "map", label: "周辺散策" },
        ],
      },
      { type: "image", src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", alt: "旅館" },
      { type: "button", label: "お食事時間を見る", href: "#dining" },
      { type: "button", label: "大浴場の利用方法", href: "#bath" },
    ]),
    page("お食事時間", [
      { type: "title", content: "お食事時間" },
      { type: "text", content: "会席料理は時間制です。開始時刻の10分前までに会場へお越しください。" },
      { type: "icon", icon: "svg:clock", label: "夕食: 18:00 / 18:30 / 19:00（3部制）" },
      { type: "icon", icon: "svg:clock", label: "朝食: 7:00-9:00（最終入場8:30）" },
      { type: "icon", icon: "svg:info", label: "アレルギー対応: 前日20:00までに連絡" },
    ]),
    page("大浴場のご案内", [
      { type: "title", content: "大浴場のご案内" },
      { type: "text", content: "利用時間・備品・混雑目安です。客室のタオルをご持参ください。" },
      {
        type: "hours",
        items: [
          { label: "利用時間", value: "15:00-24:00 / 6:00-10:00" },
          { label: "備品", value: "シャンプー / ボディソープ / ドライヤー" },
          { label: "混雑目安", value: "20:00-22:00" },
        ],
      },
    ]),
    page("貸切風呂予約", [
      { type: "title", content: "貸切風呂予約" },
      { type: "text", content: "貸切風呂は50分ごとの事前予約制です。空き枠はフロントで確認できます。" },
      { type: "icon", icon: "svg:bath", label: "利用枠: 16:00-22:00（50分制）" },
      { type: "icon", icon: "svg:credit-card", label: "料金: 2,200円 / 1枠" },
      { type: "icon", icon: "svg:bell", label: "キャンセル: 1時間前まで無料" },
      { type: "button", label: "予約問い合わせ", href: "tel:+81-00-0000-0000" },
    ]),
    page("館内作法・夜間マナー", [
      { type: "title", content: "館内作法・夜間マナー" },
      { type: "text", content: "皆さまに気持ちよくお過ごしいただくため、以下のご協力をお願いします。" },
      { type: "icon", icon: "svg:clock", label: "静粛時間: 22:00-7:00" },
      { type: "icon", icon: "svg:info", label: "廊下・共用部ではお静かに" },
      { type: "icon", icon: "svg:phone", label: "お困りごとは内線9へ" },
    ]),
    page("売店・土産", [
      { type: "title", content: "売店・土産" },
      { type: "text", content: "地元名産を中心に取り揃えています。客室付けでの精算も可能です。" },
      { type: "icon", icon: "svg:clock", label: "営業時間: 7:00-21:00" },
      { type: "icon", icon: "svg:package", label: "人気: 温泉まんじゅう / 地酒 / だし茶漬け" },
    ]),
    page("周辺散策", [
      { type: "title", content: "周辺散策" },
      { type: "text", content: "徒歩圏で楽しめる散策コースです。季節ごとの見どころもご確認ください。" },
      { type: "icon", icon: "svg:map-pin", label: "○○神社: 徒歩8分" },
      { type: "icon", icon: "svg:map-pin", label: "遊歩道: 徒歩12分（春は桜が見頃）" },
      { type: "icon", icon: "svg:map-pin", label: "撮影スポット: 川沿い展望台" },
    ]),
    page("送迎案内", [
      { type: "title", content: "送迎案内" },
      { type: "text", content: "最寄り駅からの送迎を運行しています。事前予約でスムーズにご案内します。" },
      { type: "icon", icon: "svg:bus", label: "迎え: 14:30 / 15:30 / 16:30" },
      { type: "icon", icon: "svg:map-pin", label: "集合場所: ○○駅 西口ロータリー" },
      { type: "icon", icon: "svg:clock", label: "予約締切: 当日12:00" },
    ]),
  ];
}

function minpakuPages(): TemplatePage[] {
  return [
    page("セルフチェックイン", [
      { type: "title", content: "セルフチェックイン" },
      { type: "text", content: "鍵受け取りから入室までを迷わない順番で案内します。" },
      {
        type: "checklist",
        items: [
          "キーボックス番号: 1234（到着日当日のみ有効）",
          "入室後は内鍵を施錠してください",
          "チェックイン完了メッセージを送信してください",
        ],
      },
      { type: "image", src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", alt: "民泊" },
      { type: "button", label: "ハウスルールへ", href: "#rules" },
    ]),
    page("ハウスルール", [
      { type: "title", content: "ハウスルール" },
      { type: "text", content: "近隣トラブル防止のため、以下ルールの順守をお願いします。" },
      { type: "icon", icon: "svg:clock", label: "22:00-7:00は静かにお過ごしください" },
      { type: "icon", icon: "svg:bell", label: "室内・ベランダとも禁煙です" },
      { type: "icon", icon: "svg:bell", label: "パーティー・大人数利用は禁止です" },
    ]),
    page("ゴミ分別・収集日", [
      { type: "title", content: "ゴミ分別・収集日" },
      { type: "text", content: "自治体ルールに沿って分別をお願いします。袋はキッチン下にあります。" },
      { type: "icon", icon: "svg:package", label: "可燃ごみ: 赤袋 / 缶・びん: 青袋" },
      { type: "icon", icon: "svg:map-pin", label: "ゴミ置き場: 建物右側の白いボックス" },
    ]),
    page("Wi-Fi / 家電の使い方", [
      { type: "title", content: "Wi-Fi / 家電の使い方" },
      { type: "text", content: "問い合わせが多い設備の使い方を先にまとめています。" },
      {
        type: "section",
        title: "Wi-Fi",
        body: "SSID: Infomii-Home\nPASS: home2026\n接続不可時はサポートへ",
      },
      {
        type: "checklist",
        items: [
          "エアコン: リモコン中央の電源ボタン",
          "TV: HDMI1が地上波 / HDMI2が動画端末",
          "給湯: 蛇口左レバーで温度調整",
        ],
      },
    ]),
    page("チェックアウト手順", [
      { type: "title", content: "チェックアウト手順" },
      { type: "text", content: "退出時は以下3点だけご確認ください。" },
      { type: "icon", icon: "svg:info", label: "消灯・エアコンOFF" },
      { type: "icon", icon: "svg:key", label: "鍵をキーボックスへ返却" },
      { type: "icon", icon: "svg:info", label: "退室後、玄関写真をメッセージで送信" },
    ]),
    page("緊急連絡", [
      { type: "title", content: "緊急連絡" },
      { type: "text", content: "緊急時は下記の順でご連絡ください。" },
      { type: "icon", icon: "svg:phone", label: "宿サポート: +81-00-0000-0000（24時間）" },
      { type: "icon", icon: "svg:phone", label: "救急: 119 / 警察: 110" },
      { type: "icon", icon: "svg:map-pin", label: "最寄り救急病院: ○○総合病院" },
      { type: "button", label: "緊急連絡先に発信", href: "tel:+81-00-0000-0000" },
    ]),
  ];
}

function kurekakePages(): TemplatePage[] {
  return [
    page("トップページ", [
      { type: "title", content: "滞在インフォメーション" },
      { type: "text", content: "滞在中によく使う案内を集約しています。下のメニューから必要な項目を選択してください。" },
      { type: "image", src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80", alt: "ホテルロビー" },
      {
        type: "iconRow",
        items: [
          { icon: "wifi", label: "Wi-Fi" },
          { icon: "breakfast", label: "朝食" },
          { icon: "parking", label: "駐車場" },
          { icon: "map", label: "周辺地図" },
        ],
      },
      { type: "button", label: "はじめに", href: "#intro" },
      { type: "button", label: "朝食", href: "#breakfast" },
      { type: "button", label: "Wi-Fi", href: "#wifi" },
    ]),
    page("はじめに", [
      { type: "title", content: "はじめに" },
      { type: "text", content: "この案内は、フロントへの問い合わせを減らしつつ、迷わない滞在体験を目的に設計しています。" },
      { type: "section", title: "困ったとき", body: "内線9へご連絡ください（24時間対応）" },
    ]),
    page("朝食", [
      { type: "title", content: "朝食" },
      { type: "hours", items: [{ label: "営業時間", value: "6:00-9:30（最終入場 9:00）" }, { label: "会場", value: "1F ロビー横レストラン" }] },
      { type: "checklist", items: ["混雑ピークは 7:20-8:10", "アレルギー対応はスタッフへご相談ください"] },
    ]),
    page("ハッピーアワー", [
      { type: "title", content: "ハッピーアワー" },
      { type: "section", title: "開催情報", body: "17:00-19:00 / 1F ラウンジ\n対象: 宿泊者無料" },
      { type: "checklist", items: ["飲酒後の外出時は交通安全にご注意ください", "混雑時は30分制の案内となる場合があります"] },
    ]),
    page("Wi-Fi", [
      { type: "title", content: "Wi-Fi" },
      { type: "section", title: "接続情報", body: "SSID: Infomii-Guest\nPASS: welcome2026" },
      { type: "checklist", items: ["接続できない場合は機内モードON/OFFをお試しください", "改善しない場合は内線9へ"] },
    ]),
    page("客室案内", [
      { type: "title", content: "客室案内" },
      { type: "checklist", items: ["空調・照明は入口パネルから操作できます", "冷蔵庫の飲料は有料です", "チェックアウト時は忘れ物をご確認ください"] },
    ]),
    page("アメニティ", [
      { type: "title", content: "アメニティ" },
      { type: "pricing", items: [{ label: "客室常設", value: "タオル / 歯ブラシ / ドライヤー" }, { label: "フロント受取", value: "ヘアアイロン / 追加タオル / 充電器" }] },
    ]),
    page("貸出品・売店", [
      { type: "title", content: "貸出品・売店" },
      { type: "hours", items: [{ label: "貸出受付", value: "24時間（在庫限り）" }, { label: "売店営業時間", value: "7:00-22:00" }] },
    ]),
    page("客室清掃", [
      { type: "title", content: "客室清掃" },
      { type: "checklist", items: ["連泊清掃 10:00-14:00", "不要の場合はドア札をご提示ください", "タオル交換のみ希望の場合はフロントへ"] },
    ]),
    page("コインランドリー", [
      { type: "title", content: "コインランドリー" },
      { type: "hours", items: [{ label: "場所", value: "2F エレベーター横" }, { label: "利用時間", value: "24時間" }, { label: "料金目安", value: "洗濯 300円 / 乾燥 100円（30分）" }] },
    ]),
    page("電子レンジ", [
      { type: "title", content: "電子レンジ" },
      { type: "section", title: "設置場所", body: "2F 共用スペース（24時間）" },
    ]),
    page("駐車場", [
      { type: "title", content: "駐車場" },
      { type: "pricing", items: [{ label: "敷地内駐車場", value: "先着順 1,200円/泊" }, { label: "提携駐車場", value: "徒歩3分 1,000円/泊" }] },
    ]),
    page("宅急便", [
      { type: "title", content: "宅急便" },
      { type: "hours", items: [{ label: "受付時間", value: "7:00-21:00" }, { label: "対応会社", value: "ヤマト / 佐川" }] },
    ]),
    page("マッサージ", [
      { type: "title", content: "マッサージ" },
      { type: "pricing", items: [{ label: "30分", value: "4,500円" }, { label: "60分", value: "8,000円" }] },
      { type: "button", label: "フロントへ予約依頼", href: "tel:+81-00-0000-0000" },
    ]),
    page("タクシー", [
      { type: "title", content: "タクシー" },
      { type: "text", content: "内線9で手配します。混雑時間帯は10-20分ほどかかる場合があります。" },
    ]),
    page("モーニングコール", [
      { type: "title", content: "モーニングコール" },
      { type: "text", content: "希望時刻の前日までにフロントへご依頼ください。" },
    ]),
    page("周辺地図", [
      { type: "title", content: "周辺地図" },
      { type: "iconRow", items: [{ icon: "map", label: "駅" }, { icon: "map", label: "コンビニ" }, { icon: "map", label: "病院" }, { icon: "map", label: "飲食店" }] },
      { type: "button", label: "Googleマップを開く", href: "#map" },
    ]),
    page("提携居酒屋", [
      { type: "title", content: "提携居酒屋" },
      { type: "section", title: "宿泊者特典", body: "ドリンク1杯無料（チェックイン当日）" },
      { type: "quote", text: "地元食材の人気店です。混雑するため事前予約がおすすめです。", author: "フロント" },
    ]),
  ];
}

export const MULTI_PAGE_TEMPLATES: MultiPageTemplate[] = [
  {
    id: "hotel-basic",
    name: "ホテル基本（標準運用）",
    description: "到着〜滞在〜退館をそのまま公開できる文面入りの完成テンプレ。",
    previewImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
    pages: hotelBasicPages(),
  },
  {
    id: "business-hotel",
    name: "ビジネスホテル（時短運用）",
    description: "出張客の問い合わせを減らす完成済みテンプレ。Wi-Fi/領収書/移動導線まで網羅。",
    previewImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
    pages: businessHotelPages(),
  },
  {
    id: "ryokan",
    name: "旅館（おもてなし運用）",
    description: "旅館接遇向けの完成テンプレ。食事・温浴・作法・送迎まで文面入りで8ページ構成。",
    previewImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
    pages: ryokanPages(),
  },
  {
    id: "minpaku",
    name: "民泊（一棟貸し運用）",
    description: "セルフ運用の実務文面を入れた完成テンプレ。トラブル予防に強い6ページ構成。",
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
