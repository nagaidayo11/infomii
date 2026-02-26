import type { InformationBlock } from "@/types/information";

export type IndustryPreset =
  | "hotel_business"
  | "hotel_resort"
  | "ryokan"
  | "restaurant"
  | "cafe"
  | "salon"
  | "clinic"
  | "retail";

export type StarterTemplate = {
  industry: IndustryPreset;
  title: string;
  body: string;
  blocks?: InformationBlock[];
};

type TemplateSection = {
  title: string;
  body: string;
};

function buildTemplateBlocks(params: {
  title: string;
  badgeText: string;
  lead: string;
  hours?: Array<[string, string]>;
  pricing?: Array<[string, string]>;
  sections: TemplateSection[];
  ctaLabel?: string;
  ctaUrl?: string;
}): InformationBlock[] {
  const blocks: InformationBlock[] = [
    { id: "title-1", type: "title", text: params.title, textWeight: "semibold", textSize: "lg" },
    { id: "badge-1", type: "badge", badgeText: params.badgeText, badgeColor: "#dcfce7", badgeTextColor: "#065f46" },
    { id: "paragraph-1", type: "paragraph", text: params.lead },
  ];

  if (params.hours && params.hours.length > 0) {
    blocks.push({
      id: "hours-1",
      type: "hours",
      hoursItems: params.hours.map(([label, value], index) => ({
        id: `hours-item-${index + 1}`,
        label,
        value,
      })),
    });
  }

  if (params.pricing && params.pricing.length > 0) {
    blocks.push({
      id: "pricing-1",
      type: "pricing",
      pricingItems: params.pricing.map(([label, value], index) => ({
        id: `pricing-item-${index + 1}`,
        label,
        value,
      })),
    });
  }

  params.sections.forEach((section, index) => {
    blocks.push({
      id: `section-${index + 1}`,
      type: "section",
      sectionTitle: section.title,
      sectionBody: section.body,
      sectionBackgroundColor: "#f8fafc",
    });
  });

  if (params.ctaLabel && params.ctaUrl) {
    blocks.push({
      id: "cta-1",
      type: "cta",
      ctaLabel: params.ctaLabel,
      ctaUrl: params.ctaUrl,
      textWeight: "semibold",
      textAlign: "left",
    });
  }

  return blocks;
}

export const INDUSTRY_PRESET_LABELS: Record<IndustryPreset, string> = {
  hotel_business: "ホテル（ビジネス）",
  hotel_resort: "ホテル（リゾート）",
  ryokan: "旅館",
  restaurant: "飲食店",
  cafe: "カフェ",
  salon: "サロン",
  clinic: "クリニック",
  retail: "小売店",
};

export const starterTemplates: StarterTemplate[] = [
  {
    industry: "hotel_business",
    title: "【ビジネスホテル】チェックイン・館内総合案内",
    body: "本日はご宿泊ありがとうございます。滞在中のご案内をまとめました。\n\n【チェックイン / チェックアウト】\nチェックイン: 15:00〜24:00\nチェックアウト: 10:00まで\n延長利用: 1時間ごと [料金] 円（空室時のみ）\n\n【館内設備】\nコインランドリー: 2F（24時間）\n自動販売機: 2F / 5F\n製氷機: 5F\n電子レンジ: 2F\n\n【朝食】\n会場: 1F レストラン\n時間: 6:30〜9:30（最終入店 9:00）\n\n【よくあるお問い合わせ】\nWi-Fi: 客室TVの案内画面をご確認ください\nタクシー手配: フロント内線 [番号]\n荷物預かり: 当日中まで対応",
    blocks: buildTemplateBlocks({
      title: "チェックイン・館内総合案内",
      badgeText: "まずはこちらを確認",
      lead: "滞在中に必要な情報を1ページにまとめています。",
      hours: [
        ["チェックイン", "15:00〜24:00"],
        ["チェックアウト", "10:00まで"],
        ["朝食（1F）", "6:30〜9:30（最終 9:00）"],
      ],
      sections: [
        {
          title: "館内設備",
          body: "コインランドリー: 2F（24時間）\n自動販売機: 2F / 5F\n製氷機: 5F\n電子レンジ: 2F",
        },
        {
          title: "お問い合わせ",
          body: "Wi-Fi案内: 客室TVをご確認ください\nタクシー手配: フロント内線 [番号]\n荷物預かり: 当日中まで対応",
        },
      ],
      ctaLabel: "フロントへ連絡",
      ctaUrl: "tel:+81-00-0000-0000",
    }),
  },
  {
    industry: "hotel_business",
    title: "【ビジネスホテル】深夜到着・セルフチェックイン案内",
    body: "深夜にご到着のお客様向け案内です。\n\n【チェックイン方法】\n1. 入口横タブレットで予約名を入力\n2. 本人確認書類を読み取り\n3. ルームキーを受け取り客室へ\n\n【フロント対応時間】\n有人対応: 7:00〜24:00\n緊急連絡: 内線 [番号] / 外線 [電話番号]\n\n【注意事項】\n24:00以降は正面自動ドアが施錠されます\n予約番号が不明な場合は確認メールをご提示ください\n\n【周辺情報】\nコンビニ: 徒歩2分\nコインパーキング: 徒歩1分",
  },
  {
    industry: "hotel_resort",
    title: "【リゾートホテル】滞在アクティビティ案内",
    body: "ご滞在中にお楽しみいただけるプログラムをご案内します。\n\n【朝ヨガ】\n7:00〜7:40（ガーデン）\n参加費: 無料 / 事前予約不要\n\n【サンセットクルーズ】\n17:30〜18:30（要予約）\n料金: 大人 [料金] 円 / 小人 [料金] 円\n\n【キッズプログラム】\n10:00〜16:00（ロビー集合）\n対象: 4〜10歳\n\n【予約方法】\nフロント内線 [番号] または QR 予約フォーム\n\n【雨天時】\n屋内ワークショップへ振替実施",
    blocks: buildTemplateBlocks({
      title: "滞在アクティビティ案内",
      badgeText: "本日のおすすめ体験",
      lead: "予約が必要なプログラムは早めの確保がおすすめです。",
      hours: [
        ["朝ヨガ", "7:00〜7:40（ガーデン）"],
        ["キッズプログラム", "10:00〜16:00（ロビー集合）"],
        ["サンセットクルーズ", "17:30〜18:30（要予約）"],
      ],
      pricing: [
        ["朝ヨガ", "無料"],
        ["サンセットクルーズ（大人）", "[料金] 円"],
        ["サンセットクルーズ（小人）", "[料金] 円"],
      ],
      sections: [
        { title: "予約方法", body: "フロント内線 [番号] / QR予約フォーム" },
        { title: "雨天時", body: "屋内ワークショップへ振替実施" },
      ],
      ctaLabel: "アクティビティを予約",
      ctaUrl: "https://example.com/reserve",
    }),
  },
  {
    industry: "hotel_resort",
    title: "【リゾートホテル】プール・スパ利用ガイド",
    body: "プール・スパの利用方法をご案内します。\n\n【屋外プール】\n営業: 9:00〜18:00\nタオル: プール受付で貸出\n\n【スパ】\n営業時間: 14:00〜23:00（最終受付 22:00）\n予約: 当日10:00より受付\n\n【ドレスコード / 注意事項】\nガラス製品の持ち込み不可\n12歳未満は保護者同伴\n混雑時は入場制限あり\n\n【おすすめ時間帯】\n比較的空いている時間: 9:00〜11:00 / 20:00以降",
  },
  {
    industry: "ryokan",
    title: "【旅館】お食事処のご案内",
    body: "お食事のお時間と会場についてご案内いたします。\n\n【ご夕食】\n18:00 / 18:30 / 19:00（3部制）\n会場: [会場名]\n\n【ご朝食】\n7:00〜9:00（最終入場 8:30）\n\n【アレルギー対応】\n事前申告制です。該当の方はチェックイン時にお知らせください。\n\n【お子様向け対応】\nキッズメニュー: あり / なし\nベビーチェア: あり / なし",
    blocks: buildTemplateBlocks({
      title: "お食事処のご案内",
      badgeText: "夕食は3部制です",
      lead: "お時間になりましたら会場までお越しください。",
      hours: [
        ["ご夕食", "18:00 / 18:30 / 19:00"],
        ["ご朝食", "7:00〜9:00（最終 8:30）"],
      ],
      sections: [
        { title: "会場", body: "[会場名]" },
        { title: "アレルギー対応", body: "事前申告制です。チェックイン時にお知らせください。" },
        { title: "お子様向け", body: "キッズメニュー: あり / なし\nベビーチェア: あり / なし" },
      ],
      ctaLabel: "食事時間を確認",
      ctaUrl: "https://example.com/dining",
    }),
  },
  {
    industry: "ryokan",
    title: "【旅館】大浴場・貸切風呂のご案内",
    body: "湯処のご利用方法をご案内します。\n\n【大浴場】\n利用時間: 15:00〜24:00 / 5:00〜9:30\n備品: シャンプー・ボディソープ・ドライヤー\n\n【貸切風呂】\n利用時間: 45分制\n予約方法: フロントまたは客室タブレット\n料金: 1回 [料金] 円\n\n【お願い】\n貴重品は客室金庫をご利用ください\n湯あたり防止のため長湯にご注意ください",
  },
  {
    industry: "restaurant",
    title: "【飲食店】本日のおすすめメニュー",
    body: "本日のおすすめメニューです。\n\n【数量限定】\n・季節の前菜盛り合わせ\n・本日の鮮魚カルパッチョ\n\n【おすすめドリンク】\n・自家製レモンサワー\n・ノンアルレモネード\n\n【売り切れ情報】\n[商品名] は本日分終了しました\n\n【ラストオーダー】\nフード 22:00 / ドリンク 22:30",
    blocks: buildTemplateBlocks({
      title: "本日のおすすめメニュー",
      badgeText: "数量限定あり",
      lead: "売り切れ次第終了します。スタッフまでお気軽にお声がけください。",
      hours: [["ラストオーダー", "フード 22:00 / ドリンク 22:30"]],
      pricing: [
        ["季節の前菜盛り合わせ", "[料金] 円"],
        ["鮮魚カルパッチョ", "[料金] 円"],
        ["自家製レモンサワー", "[料金] 円"],
      ],
      sections: [
        {
          title: "本日のおすすめ",
          body: "・季節の前菜盛り合わせ\n・本日の鮮魚カルパッチョ\n・自家製レモンサワー\n・ノンアルレモネード",
        },
        { title: "売り切れ情報", body: "[商品名] は本日分終了しました" },
      ],
      ctaLabel: "予約する",
      ctaUrl: "https://example.com/restaurant-reserve",
    }),
  },
  {
    industry: "restaurant",
    title: "【飲食店】営業時間・予約・席利用案内",
    body: "ご来店前にご確認ください。\n\n【営業時間】\nランチ 11:30〜14:30\nディナー 17:30〜23:00\n定休日: [曜日]\n\n【ご予約】\n電話: [電話番号]\nネット予約: [URL]\n\n【席利用について】\n混雑時は90分制となる場合があります\nピーク帯: 19:00〜21:00\n\n【お支払い】\nクレジット: 可 / 不可\n電子マネー: 可 / 不可",
  },
  {
    industry: "restaurant",
    title: "【飲食店】宴会・コース利用案内",
    body: "宴会・コース利用のご案内です。\n\n【コース】\n・スタンダード [料金] 円\n・プレミアム [料金] 円\n\n【飲み放題】\n120分（L.O. 30分前）\n\n【予約締切】\n前日 20:00まで\n\n【キャンセルポリシー】\n当日: 100% / 前日: 50%\n\n【貸切】\n人数: [最小]〜[最大] 名\n時間帯: [時間帯]",
  },
  {
    industry: "cafe",
    title: "【カフェ】季節限定ドリンクのお知らせ",
    body: "季節限定メニューのご案内です。\n\n【販売期間】\n3月1日〜4月30日\n\n【期間限定メニュー】\n・さくらラテ\n・抹茶いちごスムージー\n\n【サイズ / 価格】\nS [料金] 円 / M [料金] 円\n\n【提供形態】\n店内 / テイクアウト どちらも可",
    blocks: buildTemplateBlocks({
      title: "季節限定ドリンクのお知らせ",
      badgeText: "期間限定",
      lead: "テイクアウト対応。混雑時は提供にお時間をいただく場合があります。",
      hours: [["販売期間", "3月1日〜4月30日"]],
      pricing: [
        ["さくらラテ（S）", "[料金] 円"],
        ["さくらラテ（M）", "[料金] 円"],
        ["抹茶いちごスムージー", "[料金] 円"],
      ],
      sections: [
        { title: "期間限定メニュー", body: "・さくらラテ\n・抹茶いちごスムージー" },
        { title: "提供形態", body: "店内 / テイクアウト どちらも可" },
      ],
      ctaLabel: "モバイルオーダー",
      ctaUrl: "https://example.com/cafe-order",
    }),
  },
  {
    industry: "cafe",
    title: "【カフェ】Wi-Fi・電源・滞在ルール案内",
    body: "快適にご利用いただくためのご案内です。\n\n【Wi-Fi】\nSSID: [SSID]\nPASS: [PASSWORD]\n\n【電源席】\n窓側 [席数] 席\n利用時間の目安: 2時間\n\n【お願い】\n混雑時は長時間利用をご遠慮ください\nオンライン会議はイヤホン着用をお願いします\n\n【ラストオーダー】\n閉店30分前",
  },
  {
    industry: "salon",
    title: "【サロン】ご来店前のご案内",
    body: "ご予約ありがとうございます。ご来店前にご確認ください。\n\n【ご来店時間】\nご予約の5分前を目安にお越しください\n\n【施術前のお願い】\n整髪料 / メイクの有無は事前にお知らせください\n体調不良時は無理せずご相談ください\n\n【遅刻時】\n10分以上遅れる場合はお電話ください\n\n【キャンセルポリシー】\n前日まで無料 / 当日 [条件]",
    blocks: buildTemplateBlocks({
      title: "ご来店前のご案内",
      badgeText: "予約前に要確認",
      lead: "スムーズな施術のため、ご来店前にご確認をお願いします。",
      hours: [
        ["ご来店目安", "予約時間の5分前"],
        ["遅刻連絡", "10分以上遅れる場合は電話連絡"],
      ],
      sections: [
        { title: "施術前のお願い", body: "整髪料 / メイクの有無は事前にお知らせください\n体調不良時は無理せずご相談ください" },
        { title: "キャンセルポリシー", body: "前日まで無料 / 当日 [条件]" },
      ],
      ctaLabel: "予約内容を確認",
      ctaUrl: "https://example.com/salon-reserve",
    }),
  },
  {
    industry: "salon",
    title: "【サロン】料金・指名・オプション案内",
    body: "メニューと追加オプションのご案内です。\n\n【基本メニュー】\nカット: [料金] 円\nカラー: [料金] 円\nトリートメント: [料金] 円\n\n【指名料金】\nスタイリスト指名: [料金] 円\n\n【オプション】\nヘッドスパ 15分: [料金] 円\n\n【お支払い】\n現金 / カード / QR決済 対応",
  },
  {
    industry: "clinic",
    title: "【クリニック】受診前のご案内",
    body: "スムーズなご案内のため、受診前にご確認ください。\n\n【受付時間】\n午前 9:00〜12:00 / 午後 15:00〜18:00\n休診日: [曜日]\n\n【ご持参いただくもの】\n健康保険証 / 診察券 / お薬手帳\n紹介状（お持ちの方）\n\n【発熱・感染症状がある方】\n来院前に [電話番号] へご連絡ください\n\n【お支払い】\n現金 / クレジット / 電子決済 対応",
    blocks: buildTemplateBlocks({
      title: "受診前のご案内",
      badgeText: "来院前に確認",
      lead: "受診前に必要な持ち物・連絡事項を掲載しています。",
      hours: [
        ["午前受付", "9:00〜12:00"],
        ["午後受付", "15:00〜18:00"],
        ["休診日", "[曜日]"],
      ],
      sections: [
        { title: "持ち物", body: "健康保険証 / 診察券 / お薬手帳\n紹介状（お持ちの方）" },
        { title: "発熱・感染症状がある方", body: "来院前に [電話番号] へご連絡ください" },
        { title: "お支払い", body: "現金 / クレジット / 電子決済 対応" },
      ],
      ctaLabel: "Web予約へ進む",
      ctaUrl: "https://example.com/clinic-reserve",
    }),
  },
  {
    industry: "clinic",
    title: "【クリニック】予防接種・健診の予約案内",
    body: "予防接種・健診の予約手順をご案内します。\n\n【予約方法】\n電話: [電話番号]\nWeb: [予約URL]\n\n【当日の流れ】\n1. 受付\n2. 問診票記入\n3. 診察 / 接種\n\n【持ち物】\n母子手帳（対象者）\n自治体クーポン（対象者）\n\n【注意事項】\n接種後15分は院内で様子観察をお願いします",
  },
  {
    industry: "retail",
    title: "【小売店】キャンペーンのお知らせ",
    body: "期間限定キャンペーン実施中です。\n\n【期間】\n[開始日]〜[終了日]\n\n【内容】\n対象商品2点以上で10%OFF\n会員様はさらに [特典]\n\n【対象外】\nセール品 / 一部ブランド商品\n\n【在庫】\n在庫がなくなり次第終了となります",
    blocks: buildTemplateBlocks({
      title: "キャンペーンのお知らせ",
      badgeText: "期間限定キャンペーン",
      lead: "対象商品・対象外条件をご確認のうえご利用ください。",
      hours: [["期間", "[開始日]〜[終了日]"]],
      sections: [
        { title: "特典内容", body: "対象商品2点以上で10%OFF\n会員様はさらに [特典]" },
        { title: "対象外", body: "セール品 / 一部ブランド商品" },
        { title: "在庫", body: "在庫がなくなり次第終了となります" },
      ],
      ctaLabel: "対象商品を見る",
      ctaUrl: "https://example.com/retail-campaign",
    }),
  },
  {
    industry: "retail",
    title: "【小売店】返品・交換ポリシー案内",
    body: "返品・交換ルールをご案内します。\n\n【返品可能期間】\n購入日より [日数] 日以内\n\n【必要なもの】\nレシート / 購入履歴\n未使用・タグ付き商品\n\n【返品不可】\n食品 / 衛生商品 / セール最終価格商品\n\n【お問い合わせ】\n店頭スタッフ または [電話番号]",
  },
];
