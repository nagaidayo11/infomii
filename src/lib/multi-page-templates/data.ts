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
      { type: "text", content: "ようこそ Infomii Hotel へ。到着後の手続きと、最初によく聞かれる案内をまとめています。" },
      { type: "icon", icon: "🪪", label: "本人確認書類をご提示ください（1分程度）" },
      { type: "icon", icon: "📶", label: "Wi-Fi: Infomii-Guest / Pass: welcome2026" },
      { type: "icon", icon: "🧳", label: "荷物預かり: チェックイン前後どちらも可" },
      { type: "image", src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80", alt: "フロント" },
      { type: "button", label: "館内総合案内へ", href: "#overview" },
    ]),
    page("館内総合案内", [
      { type: "title", content: "館内総合案内" },
      { type: "text", content: "主要設備の場所と利用時間です。迷ったらフロント内線9へご連絡ください。" },
      { type: "icon", icon: "♨️", label: "大浴場: 2F / 15:00-24:00・6:00-10:00" },
      { type: "icon", icon: "🧺", label: "コインランドリー: 2F / 24時間" },
      { type: "icon", icon: "🍽️", label: "朝食会場: 1F / 6:30-9:30（最終入場9:00）" },
      { type: "button", label: "周辺アクセス", href: "#access" },
    ]),
    page("朝食案内", [
      { type: "title", content: "朝食案内" },
      { type: "text", content: "和洋ビュッフェをご用意しています。ご出発が早い方はフロントへご相談ください。" },
      { type: "icon", icon: "⏰", label: "営業時間: 6:30-9:30（最終入場9:00）" },
      { type: "icon", icon: "📍", label: "会場: 1F レストラン" },
      { type: "icon", icon: "🥗", label: "アレルギー対応: スタッフへお声がけください" },
      { type: "button", label: "朝食会場への行き方", href: "#breakfast-map" },
    ]),
    page("チェックアウト", [
      { type: "title", content: "チェックアウト" },
      { type: "text", content: "チェックアウトは11:00までです。延長希望は当日朝までにフロントへご相談ください。" },
      { type: "icon", icon: "🕚", label: "チェックアウト時刻: 11:00" },
      { type: "icon", icon: "🔑", label: "カードキーはフロント返却または回収BOXへ" },
      { type: "icon", icon: "🚕", label: "タクシー手配: 内線9（目安10-15分）" },
    ]),
    page("周辺アクセス", [
      { type: "title", content: "周辺アクセス" },
      { type: "text", content: "徒歩圏の主要スポットです。道順が不安な場合はフロントで地図をお渡しします。" },
      { type: "icon", icon: "🚉", label: "○○駅: 徒歩5分" },
      { type: "icon", icon: "🏪", label: "コンビニ: 徒歩2分（24時間）" },
      { type: "icon", icon: "🏥", label: "救急病院: タクシー8分" },
      { type: "button", label: "地図を開く", href: "#map" },
    ]),
  ];
}

function businessHotelPages(): TemplatePage[] {
  return [
    page("出張ゲスト向けクイック案内", [
      { type: "title", content: "出張ゲスト向けクイック案内" },
      { type: "text", content: "忙しい出張利用向けに、最初に必要な情報を90秒で確認できる構成です。" },
      { type: "icon", icon: "📶", label: "Wi-Fi情報は次ページに記載" },
      { type: "icon", icon: "🧾", label: "領収書・インボイス案内あり" },
      { type: "icon", icon: "🚆", label: "駅・空港アクセス案内あり" },
      { type: "image", src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80", alt: "ビジネスホテル" },
      { type: "button", label: "Wi-Fi・作業席を見る", href: "#wifi-work" },
      { type: "button", label: "領収書・精算案内", href: "#invoice" },
    ]),
    page("Wi-Fi / ワークスペース", [
      { type: "title", content: "Wi-Fi / ワークスペース" },
      { type: "text", content: "客室・ロビーどちらも接続可能です。オンライン会議はロビー奥席がおすすめです。" },
      { type: "icon", icon: "📶", label: "SSID: Infomii-Biz / Pass: biz2026" },
      { type: "icon", icon: "🔌", label: "ロビー作業席: 12席（全席電源あり）" },
      { type: "icon", icon: "🖨️", label: "印刷: フロントで対応（有料）" },
    ]),
    page("朝食（時短向け）", [
      { type: "title", content: "朝食（時短向け）" },
      { type: "text", content: "朝の混雑を避けたい方向けの案内です。出発前でも短時間で利用できます。" },
      { type: "icon", icon: "⏰", label: "営業時間: 6:00-9:30" },
      { type: "icon", icon: "🚶", label: "比較的空いている時間: 6:00-6:45 / 8:45以降" },
      { type: "icon", icon: "🥡", label: "テイクアウト: 一部メニュー対応" },
    ]),
    page("領収書・インボイス", [
      { type: "title", content: "領収書・インボイス" },
      { type: "text", content: "法人利用でよくある質問をまとめています。出発前の混雑緩和にご協力ください。" },
      { type: "icon", icon: "🧾", label: "適格請求書: 発行可（登録番号記載）" },
      { type: "icon", icon: "✍️", label: "宛名変更: フロントで対応" },
      { type: "icon", icon: "♻️", label: "再発行: 当日中は対応可" },
      { type: "button", label: "フロントへ連絡", href: "tel:+81-00-0000-0000" },
    ]),
    page("深夜到着・門限", [
      { type: "title", content: "深夜到着・門限" },
      { type: "text", content: "24:00以降は夜間入口をご利用ください。フロント不在時はインターホンで対応します。" },
      { type: "icon", icon: "🌙", label: "夜間入口: 建物右側通路" },
      { type: "icon", icon: "🔔", label: "インターホン: 1回押して応答をお待ちください" },
    ]),
    page("ランドリー・アイロン貸出", [
      { type: "title", content: "ランドリー・アイロン貸出" },
      { type: "text", content: "出張利用で需要の高いクリーニング関連をまとめています。" },
      { type: "icon", icon: "🧺", label: "コインランドリー: 2F / 24時間" },
      { type: "icon", icon: "👔", label: "アイロン貸出: フロント（在庫数に限りあり）" },
      { type: "icon", icon: "📞", label: "問い合わせ: 内線9" },
    ]),
    page("駅・空港アクセス", [
      { type: "title", content: "駅・空港アクセス" },
      { type: "text", content: "早朝移動向けの主要導線です。時間に余裕をもってご出発ください。" },
      { type: "icon", icon: "🚆", label: "○○駅: 徒歩5分 / 始発 5:12" },
      { type: "icon", icon: "🚌", label: "空港リムジン: ホテル前 6:10発" },
      { type: "icon", icon: "🚕", label: "タクシー手配: 内線9（目安10分）" },
    ]),
  ];
}

function ryokanPages(): TemplatePage[] {
  return [
    page("おもてなし案内", [
      { type: "title", content: "おもてなし案内" },
      { type: "text", content: "ようこそ。旅館での過ごし方を、到着後すぐに分かるようにまとめました。" },
      { type: "icon", icon: "👘", label: "館内着は客室にご用意しています" },
      { type: "icon", icon: "♨️", label: "大浴場の利用時間は次ページでご案内" },
      { type: "icon", icon: "🍱", label: "お食事時間は事前確認をお願いします" },
      { type: "image", src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", alt: "旅館" },
      { type: "button", label: "お食事時間を見る", href: "#dining" },
      { type: "button", label: "大浴場の利用方法", href: "#bath" },
    ]),
    page("お食事時間", [
      { type: "title", content: "お食事時間" },
      { type: "text", content: "会席料理は時間制です。開始時刻の10分前までに会場へお越しください。" },
      { type: "icon", icon: "🌙", label: "夕食: 18:00 / 18:30 / 19:00（3部制）" },
      { type: "icon", icon: "🌅", label: "朝食: 7:00-9:00（最終入場8:30）" },
      { type: "icon", icon: "🥗", label: "アレルギー対応: 前日20:00までに連絡" },
    ]),
    page("大浴場のご案内", [
      { type: "title", content: "大浴場のご案内" },
      { type: "text", content: "ご利用前に客室のタオルをご持参ください。混雑時間帯は次の通りです。" },
      { type: "icon", icon: "♨️", label: "利用時間: 15:00-24:00 / 6:00-10:00" },
      { type: "icon", icon: "🧴", label: "備品: シャンプー / ボディソープ / ドライヤー" },
      { type: "icon", icon: "🕘", label: "混雑目安: 20:00-22:00" },
    ]),
    page("貸切風呂予約", [
      { type: "title", content: "貸切風呂予約" },
      { type: "text", content: "貸切風呂は50分ごとの事前予約制です。空き枠はフロントで確認できます。" },
      { type: "icon", icon: "🛁", label: "利用枠: 16:00-22:00（50分制）" },
      { type: "icon", icon: "💴", label: "料金: 2,200円 / 1枠" },
      { type: "icon", icon: "⚠️", label: "キャンセル: 1時間前まで無料" },
      { type: "button", label: "予約問い合わせ", href: "tel:+81-00-0000-0000" },
    ]),
    page("館内作法・夜間マナー", [
      { type: "title", content: "館内作法・夜間マナー" },
      { type: "text", content: "皆さまに気持ちよくお過ごしいただくため、以下のご協力をお願いします。" },
      { type: "icon", icon: "🌙", label: "静粛時間: 22:00-7:00" },
      { type: "icon", icon: "👣", label: "廊下・共用部ではお静かに" },
      { type: "icon", icon: "📞", label: "お困りごとは内線9へ" },
    ]),
    page("売店・土産", [
      { type: "title", content: "売店・土産" },
      { type: "text", content: "地元名産を中心に取り揃えています。客室付けでの精算も可能です。" },
      { type: "icon", icon: "🕘", label: "営業時間: 7:00-21:00" },
      { type: "icon", icon: "🎁", label: "人気: 温泉まんじゅう / 地酒 / だし茶漬け" },
    ]),
    page("周辺散策", [
      { type: "title", content: "周辺散策" },
      { type: "text", content: "徒歩圏で楽しめる散策コースです。季節ごとの見どころもご確認ください。" },
      { type: "icon", icon: "⛩️", label: "○○神社: 徒歩8分" },
      { type: "icon", icon: "🌸", label: "遊歩道: 徒歩12分（春は桜が見頃）" },
      { type: "icon", icon: "📷", label: "撮影スポット: 川沿い展望台" },
    ]),
    page("送迎案内", [
      { type: "title", content: "送迎案内" },
      { type: "text", content: "最寄り駅からの送迎を運行しています。事前予約でスムーズにご案内します。" },
      { type: "icon", icon: "🚌", label: "迎え: 14:30 / 15:30 / 16:30" },
      { type: "icon", icon: "📍", label: "集合場所: ○○駅 西口ロータリー" },
      { type: "icon", icon: "⏳", label: "予約締切: 当日12:00" },
    ]),
  ];
}

function minpakuPages(): TemplatePage[] {
  return [
    page("セルフチェックイン", [
      { type: "title", content: "セルフチェックイン" },
      { type: "text", content: "到着後すぐに入室できるよう、鍵の受け取りから入室までを順番に案内します。" },
      { type: "icon", icon: "🔐", label: "キーボックス番号: 1234（到着日当日のみ有効）" },
      { type: "icon", icon: "🚪", label: "入室後は必ず内鍵も施錠してください" },
      { type: "icon", icon: "📞", label: "トラブル時: 24時間サポートへ連絡" },
      { type: "image", src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", alt: "民泊" },
      { type: "button", label: "ハウスルールへ", href: "#rules" },
    ]),
    page("ハウスルール", [
      { type: "title", content: "ハウスルール" },
      { type: "text", content: "近隣トラブル防止のため、以下ルールの順守をお願いします。" },
      { type: "icon", icon: "🔇", label: "22:00-7:00は静かにお過ごしください" },
      { type: "icon", icon: "🚭", label: "室内・ベランダとも禁煙です" },
      { type: "icon", icon: "🎉", label: "パーティー・大人数利用は禁止です" },
    ]),
    page("ゴミ分別・収集日", [
      { type: "title", content: "ゴミ分別・収集日" },
      { type: "text", content: "自治体ルールに沿って分別をお願いします。袋はキッチン下にあります。" },
      { type: "icon", icon: "🗑️", label: "可燃ごみ: 赤袋 / 缶・びん: 青袋" },
      { type: "icon", icon: "📍", label: "ゴミ置き場: 建物右側の白いボックス" },
    ]),
    page("Wi-Fi / 家電の使い方", [
      { type: "title", content: "Wi-Fi / 家電の使い方" },
      { type: "text", content: "問い合わせが多い設備の使い方を先にまとめています。" },
      { type: "icon", icon: "📶", label: "SSID: Infomii-Home / Pass: home2026" },
      { type: "icon", icon: "❄️", label: "エアコン: リモコン中央の電源ボタン" },
      { type: "icon", icon: "📺", label: "TV: HDMI1が地上波、HDMI2が動画端末" },
    ]),
    page("チェックアウト手順", [
      { type: "title", content: "チェックアウト手順" },
      { type: "text", content: "退出時は以下3点だけご確認ください。" },
      { type: "icon", icon: "💡", label: "消灯・エアコンOFF" },
      { type: "icon", icon: "🔑", label: "鍵をキーボックスへ返却" },
      { type: "icon", icon: "📷", label: "退室後、玄関写真をメッセージで送信" },
    ]),
    page("緊急連絡", [
      { type: "title", content: "緊急連絡" },
      { type: "text", content: "緊急時は下記の順でご連絡ください。" },
      { type: "icon", icon: "🆘", label: "宿サポート: +81-00-0000-0000（24時間）" },
      { type: "icon", icon: "🚑", label: "救急: 119 / 警察: 110" },
      { type: "icon", icon: "🏥", label: "最寄り救急病院: ○○総合病院" },
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
    description: "到着〜滞在〜退館をそのまま公開できる文面入りで5ページ化した完成テンプレ。",
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
