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
};

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
    title: "【ビジネスホテル】チェックイン・館内案内",
    body: "この度はご利用いただきありがとうございます。\n\n【チェックイン / チェックアウト】\nチェックイン: 15:00より\nチェックアウト: 10:00まで\n\n【館内設備】\nコインランドリー: 2F（24時間）\n自動販売機: 2F / 5F\n製氷機: 5F\n\n【ご案内】\nお急ぎのご用件はフロントまでお知らせください。",
  },
  {
    industry: "hotel_resort",
    title: "【リゾートホテル】アクティビティ案内",
    body: "ご滞在中にお楽しみいただけるアクティビティをご案内します。\n\n【朝ヨガ】\n7:00 - 7:40（ガーデンエリア）\n\n【サンセットクルーズ】\n17:30 - 18:30（要予約）\n\n【キッズプログラム】\n10:00 - 16:00（ロビー集合）",
  },
  {
    industry: "ryokan",
    title: "【旅館】お食事処のご案内",
    body: "お食事処のご案内でございます。\n\n【ご夕食】\n18:00 / 18:30 / 19:00（3部制）\n\n【ご朝食】\n7:00 - 9:00\n\nアレルギー等ございましたら事前にお知らせくださいませ。",
  },
  {
    industry: "restaurant",
    title: "【飲食店】本日のおすすめメニュー",
    body: "本日のおすすめをご案内します。\n\n【数量限定】\n季節の前菜盛り合わせ\n\n【おすすめドリンク】\n自家製レモンサワー / ノンアルレモネード\n\n【ラストオーダー】\nフード 22:00 / ドリンク 22:30",
  },
  {
    industry: "restaurant",
    title: "【飲食店】営業時間とご利用案内",
    body: "いつもご利用ありがとうございます。\n\n【営業時間】\nランチ 11:30 - 14:30\nディナー 17:30 - 23:00\n\n【ご案内】\n混雑時はお席を90分制とさせていただく場合がございます。",
  },
  {
    industry: "cafe",
    title: "【カフェ】季節限定ドリンクのお知らせ",
    body: "季節限定ドリンクのご案内です。\n\n【期間】\n3月1日〜4月30日\n\n【メニュー】\nさくらラテ / 抹茶いちごスムージー\n\nテイクアウトも可能です。",
  },
  {
    industry: "salon",
    title: "【サロン】ご来店前のご案内",
    body: "ご予約ありがとうございます。\n\n【ご来店時間】\nご予約時間の5分前を目安にお越しください。\n\n【注意事項】\n遅刻される場合はお電話でご連絡ください。\n\n【キャンセル】\n前日までにご連絡をお願いいたします。",
  },
  {
    industry: "clinic",
    title: "【クリニック】受診前のご案内",
    body: "スムーズなご案内のため、以下をご確認ください。\n\n【受付時間】\n午前 9:00 - 12:00 / 午後 15:00 - 18:00\n\n【ご持参いただくもの】\n健康保険証 / 診察券 / お薬手帳\n\n発熱症状がある方は受付でお申し出ください。",
  },
  {
    industry: "retail",
    title: "【小売店】キャンペーンのお知らせ",
    body: "期間限定キャンペーンを実施中です。\n\n【期間】\n今月末まで\n\n【内容】\n対象商品2点以上で10%OFF\n\n詳しくはスタッフまでお声がけください。",
  },
];
