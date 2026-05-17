import { ensurePageLinksAfterOpening } from "@/lib/template-marketplace";

const PREVIEW_IMAGE = "/preset-hero-sample.png" as const;

type MarketplaceSeedCategory = "business" | "resort" | "ryokan" | "airbnb" | "guide" | "inbound";

type MarketplaceSeedCardType =
  | "hero"
  | "heading_body"
  | "info"
  | "highlight"
  | "action"
  | "welcome"
  | "wifi"
  | "breakfast"
  | "checkout"
  | "nearby"
  | "notice"
  | "map"
  | "restaurant"
  | "taxi"
  | "emergency"
  | "laundry"
  | "spa"
  | "image"
  | "video"
  | "button"
  | "faq"
  | "schedule"
  | "menu"
  | "gallery"
  | "parking"
  | "pageLinks"
  | "quote"
  | "checklist"
  | "steps"
  | "compare"
  | "kpi"
  | "tabs_info"
  | "faq_search"
  | "accordion_info"
  | "open_status"
  | "social_links"
  | "contact_hub"
  | "progress_steps"
  | "menu_categories"
  | "daily_special"
  | "drink_menu";

type MarketplaceSeedCard = {
  type: MarketplaceSeedCardType;
  content: Record<string, unknown>;
  order: number;
};

export type MarketplaceSeedTemplate = {
  name: string;
  description: string;
  preview_image: typeof PREVIEW_IMAGE;
  category: MarketplaceSeedCategory;
  cards: MarketplaceSeedCard[];
};

type CardDraft = Omit<MarketplaceSeedCard, "order">;

function block(type: MarketplaceSeedCardType, content: Record<string, unknown>): CardDraft {
  return { type, content };
}

function ordered(cards: CardDraft[]): MarketplaceSeedCard[] {
  return ensurePageLinksAfterOpening(cards).map((card, order) => ({ ...card, order }));
}

const hero = (title: string, subtitle: string) => ({ title, subtitle, image: PREVIEW_IMAGE });
const welcome = (title: string, message: string) => ({ title, message });
const notice = (title: string, body: string, variant = "info") => ({ title, body, variant });
const headingBody = (title: string, body: string) => ({ title, body, dividerEnabled: false, dividerStyle: "solid" });
const highlight = (title: string, body: string, accent = "amber") => ({ title, body, accent });
const wifi = (ssid: string, password: string, description: string, title = "Wi-Fi案内") => ({
  title,
  ssid,
  password,
  description,
});
const infoRows = (title: string, icon: string, rows: Array<{ label: string; value: string }>) => ({ title, icon, rows });
const openStatus = (title: string, hoursText: string, openLabel = "利用できます", closedLabel = "時間外") => ({
  title,
  mode: "manual",
  openNow: true,
  openLabel,
  closedLabel,
  hoursText,
});
const progressSteps = (title: string, items: Array<{ label: string; done: boolean }>, currentStep = 1) => ({
  title,
  currentStep,
  items,
});
const tabsInfo = (title: string, tabs: Array<{ label: string; body: string }>) => ({ title, defaultIndex: 0, tabs });
const accordionInfo = (title: string, items: Array<{ title: string; body: string }>) => ({ title, items });
const comparePricing = (
  title: string,
  pricingColumnHeaders: string[],
  pricingRows: Array<{ label: string; values: string[] }>,
  highlightColumnIndex = 0,
) => ({ layout: "pricing", title, pricingColumnHeaders, pricingRows, highlightColumnIndex });
const pageLinks = (title: string, items: Array<{ label: string; icon: string }>, columns = 3) => ({
  title,
  columns,
  iconSize: "md",
  styleVariant: "tile",
  tileShadowStrength: "md",
  circleIconShadowStrength: "md",
  items: items.map((item) => ({ ...item, linkType: "page", pageSlug: "", link: "" })),
});
const kpi = (title: string, items: Array<{ label: string; value: string }>) => ({ title, items });
const schedule = (title: string, items: Array<{ day: string; time: string; label: string }>) => ({
  title,
  dynamicEnabled: false,
  timezone: "Asia/Tokyo",
  rules: [],
  items,
});
const steps = (title: string, items: Array<{ title: string; description: string }>) => ({ title, items });
const checklist = (title: string, items: string[]) => ({
  title,
  items: items.map((text) => ({ text, checked: false })),
});
const quote = (quoteText: string, author: string) => ({ quote: quoteText, author });
const faq = (title: string, items: Array<{ q: string; a: string }>) => ({ title, items });
const faqSearch = (title: string, items: Array<{ q: string; a: string }>) => ({ title, items });
const menu = (title: string, items: Array<{ name: string; price: string; description: string }>) => ({ title, items });
const drinkMenu = (title: string, items: Array<{ name: string; sizes: string; note: string }>) => ({
  title,
  heroSrc: "/preset-menu-hero-beverage.jpg",
  heroAlt: `${title}のイメージ`,
  items,
});
const dailySpecial = (title: string, items: Array<{ name: string; price: string; description: string }>) => ({
  title,
  heroSrc: "/preset-menu-hero-dining.jpg",
  heroAlt: `${title}のイメージ`,
  showDate: true,
  items,
});
const menuCategories = (
  title: string,
  categories: Array<{ title: string; items: Array<{ name: string; price: string; description: string; tag?: string }> }>,
) => ({
  title,
  heroSrc: "/preset-menu-hero-dining.jpg",
  heroAlt: `${title}のイメージ`,
  categories: categories.map((category) => ({
    ...category,
    imageSrc: "/preset-menu-banner-category.jpg",
    imageAlt: `${category.title}のイメージ`,
  })),
});
const gallery = (title: string, alts: string[]) => ({
  title,
  columns: 2,
  items: alts.map((alt) => ({ src: PREVIEW_IMAGE, alt })),
});
const image = (alt: string) => ({ src: PREVIEW_IMAGE, alt });
const video = (title: string, caption: string) => ({ title, videoUrl: "", caption });
const spa = (title: string, hours: string, location: string, description: string, note = "") => ({
  title,
  hours,
  location,
  description,
  note,
});
const restaurant = (title: string, time: string, location: string, menuText: string) => ({
  title,
  time,
  location,
  menu: menuText,
});
const breakfast = (title: string, time: string, location: string, menuText: string) => ({
  title,
  time,
  location,
  menu: menuText,
});
const checkout = (time: string, note: string, linkLabel = "詳細を見る", title = "チェックアウト") => ({
  title,
  time,
  note,
  linkUrl: "",
  linkLabel,
});
const emergency = (title: string, hospital: string, note: string) => ({
  title,
  fire: "119",
  police: "110",
  hospital,
  note,
});
const map = (title: string, address: string) => ({ title, address, mapEmbedUrl: "" });
const nearby = (title: string, items: Array<{ name: string; description: string }>) => ({
  title,
  items: items.map((item) => ({ ...item, link: "" })),
});
const taxi = (title: string, phone: string, companyName: string, note: string) => ({ title, phone, companyName, note });
const parking = (capacity: string, fee: string, note: string, address: string) => ({
  title: "駐車場",
  capacity,
  fee,
  note,
  address,
});
const laundry = (hours: string, priceNote: string, contact: string, title = "ランドリー") => ({
  title,
  hours,
  priceNote,
  contact,
});
const button = (label: string, href = "") => ({ label, href });
const action = (label: string, href = "") => ({ label, href });
const contactHub = (title: string, note: string, phone = "03-1234-5678") => ({
  title,
  phone,
  email: "front@example.com",
  lineUrl: "",
  mapUrl: "",
  note,
});
const socialLinks = (title: string, handle: string) => ({
  title,
  items: [
    { label: "Instagram", href: "", handle },
    { label: "X", href: "", handle: handle.replace("@", "@info_") },
  ],
});

export const MARKETPLACE_SEED_TEMPLATES = [
  {
    name: "ビジネスホテル・即運用セット",
    description: "出張客向けに、Wi-Fi・朝食・ランドリー・チェックアウト導線を最適化した構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "business",
    cards: ordered([
      block("hero", hero("出張ステイ即運用ガイド", "Wi-Fi・朝食・精算まで迷わないビジネスホテル案内")),
      block("kpi", kpi("本日のクイック情報", [{ label: "チェックイン", value: "15:00" }, { label: "チェックアウト", value: "11:00" }, { label: "内線", value: "9" }])),
      block("wifi", wifi("Infomii-Biz", "biz2026stay", "Web会議利用時は客室デスク側の電波が安定しています。")),
      block("schedule", schedule("出張利用の営業時間", [{ day: "朝食", time: "6:30-9:30", label: "1F レストラン" }, { day: "ランドリー", time: "6:00-24:00", label: "2F" }, { day: "宅配受付", time: "7:00-22:00", label: "フロント" }])),
      block("laundry", laundry("6:00-24:00", "洗濯 300円 / 乾燥 100円(30分)", "内線 9")),
      block("pageLinks", pageLinks("出張クイック導線", [{ label: "Wi-Fi接続", icon: "wifi" }, { label: "朝食時間", icon: "utensils" }, { label: "領収書対応", icon: "credit-card" }])),
      block("checkout", checkout("11:00", "領収書の宛名変更はチェックアウト前にフロントへお申し付けください。", "領収書案内")),
      block("faq_search", faqSearch("ビジネス利用FAQ", [{ q: "宅配便は送れますか？", a: "1Fフロントで発送伝票をご用意しています。" }, { q: "延泊は可能ですか？", a: "空室状況により前日20:00まで承ります。" }])),
    ]),
  },
  {
    name: "駅前特化ビジホ・時短導線セット",
    description: "駅徒歩圏の強みを活かし、移動・チェックイン・朝の出発を最短化した構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "business",
    cards: ordered([
      block("welcome", welcome("駅前スマートステイへようこそ", "改札から客室、翌朝の出発まで短い導線でご案内します。")),
      block("steps", steps("駅からホテルまで3ステップ", [{ title: "東口へ", description: "改札を出て右手の東口へ進みます。" }, { title: "ロータリー沿い", description: "コンビニを左に見ながら180m直進します。" }, { title: "到着", description: "1Fカフェ併設ビルの上階がフロントです。" }])),
      block("open_status", openStatus("フロント対応状況", "24時間対応", "受付中", "夜間ベルをご利用ください")),
      block("breakfast", breakfast("時短朝食", "6:00-9:30", "2F レストラン", "テイクアウトBOXは8:30まで受け取り可能")),
      block("taxi", taxi("早朝タクシー手配", "03-5678-1234", "駅前タクシー", "前夜予約で翌朝の待ち時間を短縮できます。")),
      block("map", map("駅前アクセスマップ", "JR ○○駅 東口 徒歩3分")),
      block("accordion_info", accordionInfo("移動の補足", [{ title: "雨の日の入口", body: "地下通路A2出口から地上へ出ると屋根付き区間が長くなります。" }, { title: "始発利用", body: "5:20以前の出発は前夜までにタクシー予約がおすすめです。" }])),
    ]),
  },
  {
    name: "連泊ゲスト向け・快適滞在セット",
    description: "2泊以上のゲスト向けに、清掃タイミング・ランドリー・周辺導線を強化した構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "business",
    cards: ordered([
      block("notice", notice("連泊中の過ごし方", "清掃・ランドリー・生活用品の補充タイミングをまとめています。")),
      block("info", infoRows("清掃と備品交換", "info", [{ label: "通常清掃", value: "10:00-14:00" }, { label: "タオル交換", value: "フロントで随時" }, { label: "清掃不要", value: "ドアサインをご利用ください" }])),
      block("wifi", wifi("Infomii-LongStay", "stay2026plus", "連泊中のリモート作業向けに安定した回線を用意しています。")),
      block("laundry", laundry("6:00-24:00", "洗濯 300円 / 乾燥 100円(30分) / 洗剤自動投入", "内線 9")),
      block("nearby", nearby("生活に便利な周辺施設", [{ name: "スーパー", description: "徒歩4分 / 24時まで" }, { name: "ドラッグストア", description: "徒歩6分 / 日用品あり" }, { name: "クリーニング", description: "徒歩8分 / 翌日仕上げ" }])),
      block("tabs_info", tabsInfo("連泊サポート", [{ label: "清掃", body: "清掃不要日はドアサインでお知らせください。" }, { label: "荷物", body: "長期荷物はフロント横クロークで一時保管できます。" }, { label: "延泊", body: "前日20:00までにご相談ください。" }])),
      block("checkout", checkout("11:00", "延泊相談は空室状況を確認し、前日20:00まで承ります。", "延泊相談")),
    ]),
  },
  {
    name: "ビジネスホテル・深夜到着対応セット",
    description: "深夜チェックインの案内を中心に、到着後の迷いを減らす構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "business",
    cards: ordered([
      block("heading_body", headingBody("深夜到着のお客様へ", "24時以降は正面入口の夜間ベルをご利用ください。到着後すぐに客室へ進めるよう要点をまとめました。")),
      block("progress_steps", progressSteps("到着後の流れ", [{ label: "夜間ベルで呼び出し", done: true }, { label: "本人確認と鍵受け取り", done: false }, { label: "客室フロアへ移動", done: false }], 1)),
      block("open_status", openStatus("夜間受付", "24:00-6:00は夜間ベル対応", "夜間対応中", "ベルで呼び出し")),
      block("taxi", taxi("深夜タクシー", "03-1111-2233", "ナイトタクシー", "駅から約8分。ホテル名と正面入口をお伝えください。")),
      block("wifi", wifi("Infomii-Night", "nightstay", "深夜到着後も客室でそのままご利用いただけます。")),
      block("checkout", checkout("11:00", "翌朝の早朝出発は自動精算機をご利用ください。", "早朝出発案内")),
      block("emergency", emergency("夜間の緊急連絡", "○○夜間救急 03-2222-3333", "体調不良時はフロント内線9へご連絡ください。")),
    ]),
  },
  {
    name: "ビジネスホテル・会議参加者向けセット",
    description: "会場アクセス・朝食・領収書対応をまとめた出張参加者向け構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "business",
    cards: ordered([
      block("hero", hero("Conference Stay Guide", "会議参加をスムーズにする出張導線")),
      block("compare", comparePricing("会場までの移動比較", ["電車", "タクシー", "徒歩"], [{ label: "所要時間", values: ["12分", "15分", "28分"] }, { label: "おすすめ", values: ["朝の混雑回避", "荷物が多い時", "天候が良い時"] }, { label: "費用目安", values: ["180円", "2,000円前後", "0円"] }], 0)),
      block("breakfast", breakfast("会議前の朝食", "6:30-9:30", "2F レストラン", "短時間でも取りやすい和洋ビュッフェ")),
      block("schedule", schedule("会議日のおすすめ時間", [{ day: "朝食", time: "6:30-8:00", label: "混雑前がおすすめ" }, { day: "領収書", time: "前夜-出発前", label: "宛名確認可" }, { day: "宅配便", time: "7:00-21:00", label: "資料発送対応" }])),
      block("contact_hub", contactHub("会議参加者サポート", "会場への道順、領収書、宅配便はフロントでまとめてご相談いただけます。")),
      block("faq", faq("会議参加FAQ", [{ q: "チェックアウト前に荷物を預けられますか？", a: "当日中はフロントでお預かりします。" }, { q: "会場までの地図はありますか？", a: "フロントで紙の地図もお渡しできます。" }])),
      block("checkout", checkout("11:00", "会議開始前の混雑を避けるため10:30までの精算がおすすめです。", "精算案内")),
    ]),
  },
  {
    name: "ビジネスホテル・女性出張安心セット",
    description: "セキュリティとアメニティ案内を強化した女性出張向け構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "business",
    cards: ordered([
      block("welcome", welcome("安心してご滞在ください", "セキュリティ・アメニティ・夜間連絡先を見やすく整理しています。")),
      block("info", infoRows("セキュリティ情報", "shield", [{ label: "客室階", value: "カードキー認証" }, { label: "夜間入口", value: "24時以降は施錠" }, { label: "内線", value: "9 / 24時間" }])),
      block("checklist", checklist("客室到着後チェック", ["ドアロックとチェーンの確認", "非常口の場所を確認", "フロント内線番号を確認"])),
      block("accordion_info", accordionInfo("アメニティ案内", [{ title: "追加アメニティ", body: "ヘアアイロン、加湿器、ブランケットはフロントで貸出しています。" }, { title: "夜間の移動", body: "エレベーターはカードキー認証です。不安な場合はスタッフが同行します。" }])),
      block("wifi", wifi("Infomii-SafeStay", "safestay2026", "女性専用フロアでも同じSSIDをご利用いただけます。")),
      block("emergency", emergency("緊急時の連絡先", "○○病院 女性外来 03-3333-4444", "不安な点はフロント内線9へすぐにご連絡ください。")),
      block("quote", quote("細かな案内がまとまっていて、初めての出張でも安心できました。", "女性出張ゲスト")),
    ]),
  },
  {
    name: "ビジネスホテル・朝活サポートセット",
    description: "早朝行動に必要な情報を集約した朝活・早朝移動向け構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "business",
    cards: ordered([
      block("notice", notice("朝活サポート案内", "早朝出発、朝食、周辺ランニングコースをまとめています。")),
      block("schedule", schedule("朝のタイムテーブル", [{ day: "ジム", time: "5:00-23:00", label: "3F" }, { day: "朝食", time: "6:00-9:00", label: "1F" }, { day: "自動精算", time: "24時間", label: "ロビー" }])),
      block("open_status", openStatus("朝食会場", "6:00-9:00", "オープン中", "準備中")),
      block("nearby", nearby("朝ランコース", [{ name: "川沿い20分ルート", description: "信号が少なく走りやすい" }, { name: "公園30分ルート", description: "木陰が多く夏も快適" }])),
      block("drink_menu", drinkMenu("朝ドリンク", [{ name: "ホットコーヒー", sizes: "S 300円 / M 400円", note: "6:00から" }, { name: "スムージー", sizes: "M 550円", note: "数量限定" }])),
      block("taxi", taxi("早朝配車", "03-2222-1212", "モーニングタクシー", "前夜予約で空港・駅までスムーズに移動できます。")),
      block("checkout", checkout("24時間対応", "早朝は自動精算機をご利用ください。領収書は前夜発行も可能です。", "早朝精算")),
    ]),
  },
  {
    name: "ベーシック・ビジネスホテル案内",
    description: "出張利用で最低限必要な情報を1ページにまとめた基本構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "business",
    cards: ordered([
      block("heading_body", headingBody("ビジネスホテル基本案内", "Wi-Fi、朝食、チェックアウト、緊急連絡先を出張利用向けに整理しました。")),
      block("wifi", wifi("Hotel-WiFi", "welcome1234", "客室・ロビーで利用できます。")),
      block("breakfast", breakfast("朝食", "7:00-9:30", "1F レストラン", "和洋ビュッフェ / 最終入場9:00")),
      block("info", infoRows("館内基本情報", "info", [{ label: "フロント", value: "24時間" }, { label: "製氷機", value: "3F" }, { label: "電子レンジ", value: "2F" }])),
      block("map", map("所在地", "東京都○○区○○ 1-2-3")),
      block("checkout", checkout("11:00", "カードキーはフロントへご返却ください。", "出発手順")),
      block("emergency", emergency("緊急連絡先", "○○病院 03-1111-2222", "体調不良時はフロント内線9へご連絡ください。")),
    ]),
  },
  {
    name: "ベーシック・長期滞在案内",
    description: "連泊・長期滞在で必要な生活情報をまとめた基本構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "business",
    cards: ordered([
      block("welcome", welcome("長期滞在の基本案内", "数日から数週間の滞在で必要な生活情報をまとめています。")),
      block("info", infoRows("生活サポート", "home", [{ label: "清掃", value: "10:00-14:00" }, { label: "タオル交換", value: "フロント" }, { label: "ゴミ回収", value: "毎日午前" }])),
      block("laundry", laundry("6:00-24:00", "洗濯300円 / 乾燥100円(30分)", "内線9")),
      block("nearby", nearby("長期滞在向け周辺", [{ name: "スーパー", description: "徒歩4分 / 24時まで" }, { name: "ドラッグストア", description: "徒歩6分" }, { name: "郵便局", description: "徒歩9分" }])),
      block("checklist", checklist("週次チェック", ["清掃希望日を確認", "ランドリー利用時間を確認", "延泊希望は前日までに相談"])),
      block("faq", faq("長期滞在FAQ", [{ q: "郵便物は受け取れますか？", a: "事前にフロントへご相談ください。" }, { q: "調理はできますか？", a: "客室設備により異なります。電子レンジは共用部にあります。" }])),
      block("checkout", checkout("11:00", "延泊は前日20:00までにフロントへご相談ください。", "延泊相談")),
    ]),
  },

  {
    name: "リゾートホテル・体験訴求セット",
    description: "館内体験とアクティビティを中心に、滞在価値を伝える構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "resort",
    cards: ordered([
      block("hero", hero("Resort Experience Guide", "館内体験と自然を楽しむリゾート滞在")),
      block("gallery", gallery("体験ハイライト", ["プールサイド", "夕景ラウンジ", "スパ", "アクティビティデスク"])),
      block("daily_special", dailySpecial("本日のおすすめ体験", [{ name: "サンセットクルーズ", price: "4,800円", description: "17:30出航 / 要予約" }, { name: "星空観察", price: "無料", description: "20:30 ロビー集合" }])),
      block("spa", spa("スパ・温浴", "15:00-24:00 / 6:00-10:00", "2F Wellness", "露天風呂・サウナ・トリートメント")),
      block("tabs_info", tabsInfo("滞在テーマ", [{ label: "癒やす", body: "スパとラウンジでゆっくり過ごすプランです。" }, { label: "遊ぶ", body: "海・森の体験を午前中に予約するのがおすすめです。" }, { label: "味わう", body: "地元食材のディナーは前日までにご予約ください。" }])),
      block("action", action("アクティビティを相談する")),
      block("quote", quote("到着してすぐ、今日できる体験が分かって予定を立てやすかったです。", "リゾートゲスト")),
    ]),
  },
  {
    name: "ファミリー向け・館内回遊セット",
    description: "館内導線をわかりやすくし、子連れ滞在で必要な情報を網羅した構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "resort",
    cards: ordered([
      block("welcome", welcome("ファミリー滞在へようこそ", "お子さま連れで迷いやすい館内導線をまとめました。")),
      block("pageLinks", pageLinks("ファミリー館内マップ", [{ label: "キッズルーム", icon: "baby" }, { label: "朝食会場", icon: "utensils" }, { label: "授乳スペース", icon: "heart" }, { label: "駐車場入口", icon: "car" }], 2)),
      block("parking", parking("35台", "1泊 800円", "ベビーカー積み下ろしスペースあり", "ホテル南側")),
      block("breakfast", breakfast("ファミリー朝食", "7:00-9:30", "1F レストラン", "キッズメニュー・ベビーチェアあり")),
      block("checklist", checklist("お出かけ前チェック", ["ルームキー", "お子さまの上着", "水筒・おむつ", "駐車券"])),
      block("open_status", openStatus("キッズルーム", "9:00-20:00", "利用できます", "クローズ")),
      block("faq_search", faqSearch("子連れ滞在FAQ", [{ q: "ベビーベッドは借りられますか？", a: "数に限りがあるためフロントへご相談ください。" }, { q: "離乳食の温めは可能ですか？", a: "レストランスタッフへお声がけください。" }])),
      block("emergency", emergency("お子さまの急病時", "小児救急センター 03-2222-5555", "フロントでタクシー手配も可能です。")),
    ]),
  },
  {
    name: "スパ&ウェルネス重視セット",
    description: "スパ・温浴・食事の時間設計を重視し、滞在満足を高める構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "resort",
    cards: ordered([
      block("notice", notice("ウェルネス滞在のすすめ", "混雑しにくい時間帯とヘルシーメニューを組み合わせて、整う滞在をお楽しみください。")),
      block("spa", spa("スパ営業時間", "14:00-23:00 / 6:00-9:00", "2F Wellness Zone", "サウナ・露天・トリートメントルーム")),
      block("compare", comparePricing("おすすめ利用時間", ["朝", "夕方", "夜"], [{ label: "混雑", values: ["少なめ", "普通", "多め"] }, { label: "おすすめ", values: ["外気浴", "トリートメント", "サウナ"] }, { label: "雰囲気", values: ["静か", "景色", "リラックス"] }], 0)),
      block("menu", menu("ウェルネスメニュー", [{ name: "発酵和朝食", price: "2,200円", description: "地元野菜と味噌汁" }, { name: "ハーブティー", price: "850円", description: "ラウンジ限定" }])),
      block("video", video("スパ利用ガイド", "初めての方へ、受付からロッカー利用までの流れを紹介します。")),
      block("button", button("スパ予約をする")),
      block("faq", faq("スパFAQ", [{ q: "手ぶらで利用できますか？", a: "タオルと館内着をご用意しています。" }, { q: "妊娠中でも利用できますか？", a: "一部メニューは利用制限があります。事前にご相談ください。" }])),
    ]),
  },
  {
    name: "リゾートホテル・連泊体験セット",
    description: "2〜3日滞在を想定し、日ごとの過ごし方を提案する構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "resort",
    cards: ordered([
      block("heading_body", headingBody("連泊で深く楽しむリゾート", "到着日、滞在日、出発日の過ごし方を分けて提案します。")),
      block("steps", steps("3日間モデルプラン", [{ title: "1日目", description: "チェックイン後にスパとラウンジへ。" }, { title: "2日目", description: "午前はアクティビティ、午後は周辺散策。" }, { title: "3日目", description: "ブランチ後にゆっくりチェックアウト。" }])),
      block("progress_steps", progressSteps("滞在プラン進行", [{ label: "到着日の館内確認", done: true }, { label: "体験予約", done: false }, { label: "出発準備", done: false }], 1)),
      block("nearby", nearby("2日目のおすすめ", [{ name: "ビーチ散策", description: "徒歩10分 / 朝がおすすめ" }, { name: "サンセットクルーズ", description: "前日予約制" }])),
      block("restaurant", restaurant("連泊ディナー", "18:00-21:00", "1F ダイニング", "日替わりコース / 連泊ゲスト向け変更可")),
      block("checkout", checkout("11:00", "レイトチェックアウトは空室状況により承ります。", "出発日の相談")),
      block("quote", quote("連泊ならではの楽しみ方が分かり、予定を詰め込みすぎず過ごせました。", "連泊ゲスト")),
    ]),
  },
  {
    name: "リゾートホテル・ハネムーンセット",
    description: "記念日滞在向けに、演出・食事・写真導線を整えた構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "resort",
    cards: ordered([
      block("hero", hero("Honeymoon Stay", "記念日を美しく残す特別な滞在案内")),
      block("gallery", gallery("フォトスポット", ["海を望むテラス", "夕景チャペル", "客室バルコニー", "ガーデン小径"])),
      block("daily_special", dailySpecial("記念日おすすめ", [{ name: "アニバーサリーケーキ", price: "3,500円", description: "前日17時まで予約" }, { name: "花束手配", price: "5,000円〜", description: "色味の相談可" }])),
      block("restaurant", restaurant("記念日ディナー", "18:00 / 19:30", "テラスダイニング", "ペアコース・乾杯ドリンク付き")),
      block("accordion_info", accordionInfo("サプライズ相談", [{ title: "ケーキ提供", body: "ディナー後または客室入室前のどちらかを選べます。" }, { title: "写真撮影", body: "夕景時間帯の撮影スポットをスタッフがご案内します。" }])),
      block("button", button("記念日相談フォーム")),
      block("social_links", socialLinks("公式SNSで雰囲気を見る", "@infomii_resort")),
    ]),
  },
  {
    name: "リゾートホテル・雨の日満喫セット",
    description: "天候不良時でも館内で楽しめる導線をまとめた構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "resort",
    cards: ordered([
      block("notice", notice("雨の日の過ごし方", "屋外プログラムが難しい日は、館内体験・温浴・ラウンジを中心にお楽しみください。")),
      block("schedule", schedule("雨の日タイムテーブル", [{ day: "クラフト体験", time: "14:00", label: "2F ラボ" }, { day: "映画上映", time: "16:00", label: "1F シアター" }, { day: "スパ", time: "10:00-23:00", label: "屋内施設" }])),
      block("pageLinks", pageLinks("館内でできること", [{ label: "クラフト体験", icon: "palette" }, { label: "屋内温浴", icon: "bath" }, { label: "雨の日カフェ", icon: "coffee" }])),
      block("menu_categories", menuCategories("雨の日カフェ", [{ title: "スイーツ", items: [{ name: "季節のタルト", price: "900円", description: "ラウンジ限定", tag: "人気" }] }, { title: "ホットドリンク", items: [{ name: "スパイスチャイ", price: "650円", description: "雨の日おすすめ" }] }])),
      block("spa", spa("屋内温浴", "10:00-23:00", "2F", "サウナ・内湯でゆっくり過ごせます。", "14:00-17:00は混雑しやすいです。")),
      block("highlight", highlight("雨が弱まったら", "展望デッキと海沿い散歩コースの再開状況はフロントでご確認ください。")),
      block("faq", faq("雨天FAQ", [{ q: "屋外予約は変更できますか？", a: "天候による変更はアクティビティデスクで承ります。" }, { q: "傘は借りられますか？", a: "ロビーで貸出しています。" }])),
      block("quote", quote("雨の日でも館内だけで一日中楽しめました。", "ファミリーゲスト")),
    ]),
  },
  {
    name: "リゾートホテル・アクティビティ重視セット",
    description: "海・山・体験予約を主軸にしたアクティビティ訴求構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "resort",
    cards: ordered([
      block("hero", hero("Activity Base Resort", "海・山・体験を最大化する滞在案内")),
      block("nearby", nearby("人気アクティビティ", [{ name: "SUP体験", description: "9:00 / 14:00 出発" }, { name: "森のトレッキング", description: "初心者コースあり" }, { name: "星空ツアー", description: "20:30 ロビー集合" }])),
      block("checklist", checklist("参加前チェック", ["動きやすい服", "飲料水", "日焼け止め", "濡れてもよい靴"])),
      block("compare", comparePricing("体験選び比較", ["海", "森", "夜"], [{ label: "所要時間", values: ["90分", "120分", "60分"] }, { label: "難易度", values: ["普通", "やさしい", "やさしい"] }, { label: "おすすめ", values: ["晴天", "午前", "夕食後"] }], 1)),
      block("taxi", taxi("送迎・タクシー", "03-4444-8787", "リゾート交通", "集合場所までの送迎はフロントで手配できます。")),
      block("action", action("体験を予約する")),
      block("emergency", emergency("体験中の緊急連絡", "地域医療センター 03-7777-8888", "アクティビティ参加中はスタッフの指示に従ってください。")),
    ]),
  },
  {
    name: "ベーシック・リゾートホテル案内",
    description: "館内施設と基本動線をシンプルに伝えるリゾート向け基本構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "resort",
    cards: ordered([
      block("heading_body", headingBody("リゾートホテル基本案内", "館内施設、食事、温浴、周辺情報をシンプルに確認できます。")),
      block("gallery", gallery("施設イメージ", ["ロビー", "客室", "レストラン", "温浴施設"])),
      block("wifi", wifi("Resort-WiFi", "resort1234", "客室・ロビー・プールサイドで利用できます。")),
      block("spa", spa("スパ・大浴場", "15:00-24:00", "2F", "タオルは客室からお持ちください。")),
      block("breakfast", breakfast("朝食", "7:00-10:00", "1F", "ビュッフェ / 最終入場9:30")),
      block("nearby", nearby("周辺", [{ name: "ビーチ", description: "徒歩8分" }, { name: "コンビニ", description: "徒歩3分" }])),
      block("checkout", checkout("11:00", "レイトチェックアウトは空室状況により承ります。", "出発案内")),
    ]),
  },
  {
    name: "ベーシック・ファミリー滞在案内",
    description: "家族旅行で必要な基本情報をシンプルにまとめた構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "resort",
    cards: ordered([
      block("welcome", welcome("ファミリー向け基本案内", "お子さま連れで必要な情報を1ページにまとめました。")),
      block("breakfast", breakfast("朝食", "7:00-9:30", "1F", "キッズメニュー・ベビーチェアあり")),
      block("nearby", nearby("家族向け周辺施設", [{ name: "公園", description: "徒歩5分" }, { name: "コンビニ", description: "徒歩3分" }])),
      block("parking", parking("20台", "1泊 800円", "ベビーカー積み下ろし可", "ホテル北側")),
      block("checklist", checklist("出発前チェック", ["お子さまの忘れ物確認", "ルームキー返却", "駐車券精算"])),
      block("checkout", checkout("11:00", "混雑時は早めの精算がおすすめです。", "出発手順")),
      block("emergency", emergency("急病・けがの連絡先", "○○小児クリニック 03-4444-1111", "フロントで病院案内とタクシー手配が可能です。")),
    ]),
  },

  {
    name: "旅館・おもてなし案内セット",
    description: "大浴場・食事処・館内作法を丁寧に伝える和風旅館向け構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "ryokan",
    cards: ordered([
      block("welcome", welcome("ようこそ、湯宿へ", "温泉と季節の食事をゆっくりお楽しみください。")),
      block("notice", notice("館内でのお願い", "廊下や大浴場での通話はお控えください。館内は浴衣でお過ごしいただけます。", "warning")),
      block("spa", spa("大浴場", "15:00-24:00 / 5:30-9:30", "1F", "内湯・露天風呂", "タオルは客室からお持ちください。")),
      block("restaurant", restaurant("お食事処", "18:00-21:00", "1F お食事処", "季節の会席料理 / お子様膳あり")),
      block("steps", steps("ご出発までの流れ", [{ title: "朝食", description: "7:00-9:00に食事処へ。" }, { title: "精算", description: "10:00までにフロントへ。" }, { title: "お見送り", description: "玄関でスタッフがお見送りします。" }])),
      block("quote", quote("館内作法が分かりやすく、初めての旅館でも安心でした。", "ご宿泊のお客様")),
      block("map", map("温泉街散策口", "○○温泉街 中央通り 1-2-3")),
    ]),
  },
  {
    name: "旅館・食事時間重視セット",
    description: "夕朝食の導線と館内作法を中心に、和旅館運用に最適化した構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "ryokan",
    cards: ordered([
      block("hero", hero("お食事時間のご案内", "夕朝食を中心に、ゆったり過ごす旅館滞在")),
      block("schedule", schedule("お食事スケジュール", [{ day: "夕食", time: "18:00 / 19:00", label: "到着時に時間確認" }, { day: "朝食", time: "7:00-9:00", label: "食事処" }, { day: "夜食処", time: "21:00-22:30", label: "数量限定" }])),
      block("restaurant", restaurant("夕食", "18:00-21:00", "1F 食事処", "季節の会席料理")),
      block("breakfast", breakfast("朝食", "7:00-9:00", "1F 食事処", "和定食 / お子様対応可")),
      block("tabs_info", tabsInfo("食事の補足", [{ label: "アレルギー", body: "チェックイン時までにお申し出ください。" }, { label: "お子様", body: "お子様膳・椅子の用意が可能です。" }, { label: "時間変更", body: "混雑状況によりご希望に添えない場合があります。" }])),
      block("spa", spa("食後の温泉", "15:00-24:00 / 5:30-9:30", "1F 大浴場", "夕食後は21:00以降が比較的空いています。")),
      block("checkout", checkout("10:00", "送迎をご利用の方は朝食時までにフロントへお声がけください。", "送迎案内")),
    ]),
  },
  {
    name: "旅館・温泉街散策セット",
    description: "温泉街の回遊と館内滞在を両立させる旅館向け構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "ryokan",
    cards: ordered([
      block("heading_body", headingBody("温泉街散策のご案内", "外湯、足湯、土産店を徒歩で楽しめるように回遊順をまとめました。")),
      block("nearby", nearby("散策スポット", [{ name: "足湯通り", description: "徒歩3分 / 20:00まで" }, { name: "土産店街", description: "徒歩5分 / 夕方が賑わいます" }, { name: "外湯", description: "徒歩8分 / 宿泊者割引あり" }])),
      block("map", map("温泉街マップ", "○○温泉街 中央通り")),
      block("open_status", openStatus("外湯めぐり受付", "15:00-21:00", "受付中", "受付終了")),
      block("spa", spa("宿の大浴場", "15:00-24:00", "1F", "散策後の入浴に便利です。", "外出時は客室タオルをご持参ください。")),
      block("pageLinks", pageLinks("温泉街リンク", [{ label: "足湯通り", icon: "bath" }, { label: "外湯めぐり", icon: "map" }, { label: "土産店街", icon: "shopping-bag" }])),
      block("notice", notice("外出時のお願い", "門限は23:30です。夜間は足元にお気をつけください。", "warning")),
      block("checkout", checkout("10:00", "チェックアウト後も当日中は荷物預かりが可能です。", "荷物預かり")),
    ]),
  },
  {
    name: "旅館・団体旅行向けセット",
    description: "団体客向けに、食事時間・移動・館内ルールを整理した構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "ryokan",
    cards: ordered([
      block("notice", notice("団体様へのご案内", "集合時間、食事会場、館内ルールを代表者様と共有しやすくまとめています。")),
      block("schedule", schedule("団体スケジュール", [{ day: "夕食", time: "18:30", label: "大広間" }, { day: "朝食", time: "7:30", label: "大広間" }, { day: "出発集合", time: "9:45", label: "玄関前" }])),
      block("info", infoRows("団体利用の要点", "users", [{ label: "精算", value: "代表者様まとめ払い" }, { label: "バス", value: "玄関前乗降" }, { label: "宴会終了", value: "21:30" }])),
      block("steps", steps("出発までの流れ", [{ title: "荷物整理", description: "9:30までに客室確認。" }, { title: "精算", description: "代表者様はフロントへ。" }, { title: "集合", description: "9:45に玄関前へ。" }])),
      block("wifi", wifi("Ryokan-Group", "groupstay", "団体代表者様へフロントでご案内します。")),
      block("map", map("バス乗り場", "○○温泉 玄関前バス停")),
      block("emergency", emergency("団体滞在の緊急連絡", "○○病院 03-3333-2222", "体調不良者が出た場合は代表者様からフロントへご連絡ください。")),
    ]),
  },
  {
    name: "旅館・ファミリー三世代向けセット",
    description: "三世代旅行でも使いやすい導線・食事・温泉情報を整えた構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "ryokan",
    cards: ordered([
      block("welcome", welcome("三世代でのご滞在へ", "小さなお子さまからご年配の方まで快適に過ごせる情報をまとめました。")),
      block("restaurant", restaurant("お食事", "18:00-21:00", "食事処", "お子様膳・やわらか食対応")),
      block("spa", spa("温泉", "15:00-24:00", "1F", "手すり設置 / 貸切風呂あり", "貸切風呂はフロントで予約できます。")),
      block("checklist", checklist("お出かけ前チェック", ["部屋鍵", "タオル", "常備薬", "お子さまの上着"])),
      block("nearby", nearby("近場観光", [{ name: "庭園", description: "徒歩7分 / 段差少なめ" }, { name: "足湯", description: "徒歩3分 / ベンチあり" }])),
      block("contact_hub", contactHub("ご家族サポート", "貸切風呂、食事変更、送迎はフロントでまとめて承ります。")),
      block("emergency", emergency("急病時の連絡先", "○○病院 03-1111-9090", "ご年配の方の体調変化も遠慮なくフロントへご相談ください。")),
    ]),
  },
  {
    name: "ベーシック・旅館ご案内",
    description: "旅館滞在の基本情報（温泉・食事・出発）を網羅した基本構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "ryokan",
    cards: ordered([
      block("heading_body", headingBody("旅館ご案内", "温泉、食事、館内のお願い、出発時間を確認できます。")),
      block("spa", spa("大浴場", "15:00-24:00 / 6:00-9:00", "1F", "内湯・露天風呂")),
      block("restaurant", restaurant("お食事", "18:00-21:00", "お食事処", "会席料理")),
      block("notice", notice("館内のお願い", "23時以降はお静かにお過ごしください。客室内は禁煙です。", "warning")),
      block("wifi", wifi("Ryokan-Guest", "ryokan1234", "ロビーと客室で利用できます。")),
      block("checkout", checkout("10:00", "精算後も当日中は荷物をお預かりできます。", "出発案内")),
      block("emergency", emergency("緊急連絡先", "○○病院 03-2222-1111", "体調不良時はフロントへご連絡ください。")),
    ]),
  },

  {
    name: "民泊・セルフチェックインセット",
    description: "セルフ運用に必要な手順、ハウスルール、緊急連絡をまとめた構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "airbnb",
    cards: ordered([
      block("hero", hero("セルフチェックイン案内", "到着から入室までホスト不在でも迷わないガイド")),
      block("steps", steps("入室手順", [{ title: "入口解錠", description: "事前送付の暗証番号を入力します。" }, { title: "鍵受け取り", description: "キーボックスから鍵を取り出します。" }, { title: "室内確認", description: "ハウスルールとWi-Fiを確認します。" }])),
      block("progress_steps", progressSteps("チェックイン進行", [{ label: "建物到着", done: true }, { label: "キーボックス解錠", done: false }, { label: "入室完了", done: false }], 1)),
      block("wifi", wifi("Infomii-HomeStay", "home2026stay", "接続できない場合はホストへメッセージしてください。")),
      block("checklist", checklist("ハウスルール", ["22時以降は静かに過ごす", "室内は禁煙", "ゴミは分別して指定場所へ"])),
      block("checkout", checkout("10:00", "施錠後、鍵をキーボックスへ戻してメッセージで退室報告をお願いします。", "退室報告")),
      block("emergency", emergency("緊急連絡先", "○○クリニック 03-1111-2222", "緊急時は119/110の後、ホストへご連絡ください。")),
    ]),
  },
  {
    name: "Airbnb・ワーケーション向けセット",
    description: "長期滞在・リモートワーク利用向けに、設備情報と生活導線を重視した構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "airbnb",
    cards: ordered([
      block("welcome", welcome("ワーケーション滞在へようこそ", "仕事環境と生活導線を整えて、快適に滞在できます。")),
      block("info", infoRows("ワーク設備", "laptop", [{ label: "デスク", value: "窓側 / 電源2口" }, { label: "回線", value: "高速Wi-Fi" }, { label: "モニター", value: "HDMI接続可" }])),
      block("wifi", wifi("Infomii-Workation", "remote2026", "Web会議はリビング窓側が最も安定します。")),
      block("nearby", nearby("生活インフラ", [{ name: "コインランドリー", description: "徒歩3分 / 24時間" }, { name: "電源カフェ", description: "徒歩5分 / 8:00-20:00" }, { name: "スーパー", description: "徒歩6分 / 23時まで" }])),
      block("checklist", checklist("仕事開始前チェック", ["Wi-Fi接続", "デスク周辺の電源確認", "ゴミ分別ルール確認"])),
      block("faq_search", faqSearch("ワーケーションFAQ", [{ q: "有線LANはありますか？", a: "アダプタ貸出が必要な場合はホストへご連絡ください。" }, { q: "清掃日は選べますか？", a: "長期滞在では週1回を目安に相談できます。" }])),
      block("checkout", checkout("10:00", "退室時はモニター電源、エアコン、照明OFFをご確認ください。", "退室チェック")),
    ]),
  },
  {
    name: "Airbnb・ファミリー滞在セット",
    description: "子連れ民泊で必要なルール・設備・周辺情報をまとめた構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "airbnb",
    cards: ordered([
      block("notice", notice("ファミリー滞在のお願い", "共用部では走り回らず、22時以降は静かにお過ごしください。")),
      block("checklist", checklist("入室後チェック", ["ベビーベッドの位置確認", "調理器具の確認", "窓ロックの確認", "ゴミ分別場所の確認"])),
      block("wifi", wifi("Infomii-Family", "familyhome", "動画視聴はリビングWi-Fiが安定しています。")),
      block("nearby", nearby("家族向け周辺", [{ name: "公園", description: "徒歩4分 / 遊具あり" }, { name: "スーパー", description: "徒歩5分 / ベビー用品あり" }, { name: "小児科", description: "徒歩12分" }])),
      block("accordion_info", accordionInfo("子連れ設備", [{ title: "ベビーベッド", body: "事前連絡がある場合のみ設置しています。" }, { title: "調理器具", body: "子ども用食器はキッチン下段にあります。" }])),
      block("checkout", checkout("10:00", "おもちゃや食器の戻し忘れ、窓ロックをご確認ください。", "家族退室チェック")),
      block("emergency", emergency("緊急連絡", "○○小児科 03-2222-3333", "ホスト連絡先は予約メッセージをご確認ください。")),
    ]),
  },
  {
    name: "Airbnb・一人旅ミニマルセット",
    description: "一人旅ゲスト向けに必要情報だけを簡潔にまとめた構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "airbnb",
    cards: ordered([
      block("heading_body", headingBody("一人旅ミニマルガイド", "入室、Wi-Fi、周辺、退室だけを短く確認できます。")),
      block("wifi", wifi("Infomii-Solo", "solo2026", "客室デスク付近が電波良好です。")),
      block("open_status", openStatus("セルフチェックイン", "15:00以降いつでも入室可", "入室できます", "準備中")),
      block("nearby", nearby("近隣ミニ案内", [{ name: "コンビニ", description: "徒歩2分 / 24時間" }, { name: "駅", description: "徒歩8分" }, { name: "深夜食堂", description: "徒歩6分 / 25時まで" }])),
      block("taxi", taxi("移動サポート", "03-8989-1010", "シティタクシー", "深夜・早朝の移動に便利です。")),
      block("checkout", checkout("10:00", "鍵をキーボックスへ戻し、退室メッセージを送ってください。", "退室報告")),
      block("emergency", emergency("一人旅の緊急連絡", "○○病院 03-9999-1111", "不安な時はホストへメッセージしてください。")),
    ]),
  },
  {
    name: "Airbnb・ペット同伴セット",
    description: "ペット同伴滞在で必要なルール・設備案内を整えた構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "airbnb",
    cards: ordered([
      block("hero", hero("Pet Friendly Stay", "ペットと快適に過ごすための民泊案内")),
      block("notice", notice("ペット同伴ルール", "ベッド・ソファの利用は不可です。共用部では必ずリードを着用してください。", "warning")),
      block("checklist", checklist("持ち物チェック", ["ペットシーツ", "食器", "リード", "ワクチン証明の控え"])),
      block("nearby", nearby("ペット周辺施設", [{ name: "動物病院", description: "徒歩10分 / 夜間相談可" }, { name: "ドッグラン", description: "車で8分" }, { name: "ペット用品店", description: "徒歩12分" }])),
      block("info", infoRows("室内ペット設備", "paw-print", [{ label: "足拭き", value: "玄関横" }, { label: "ケージ", value: "リビング" }, { label: "ごみ", value: "専用袋で処理" }])),
      block("checkout", checkout("10:00", "ペット用品の忘れ物とシーツ回収場所をご確認ください。", "ペット退室チェック")),
      block("emergency", emergency("ペット緊急連絡", "○○動物病院 03-1111-7777", "体調不良時は動物病院へ連絡後、ホストへお知らせください。")),
    ]),
  },
  {
    name: "ベーシック・Airbnbゲスト案内",
    description: "民泊で必要なチェックイン・WiFi・退室情報をまとめた基本構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "airbnb",
    cards: ordered([
      block("welcome", welcome("Welcome", "チェックインから退室までの基本案内です。")),
      block("steps", steps("チェックイン手順", [{ title: "入口", description: "暗証番号を入力します。" }, { title: "鍵", description: "キーボックスから受け取ります。" }, { title: "確認", description: "Wi-Fiとルールを確認します。" }])),
      block("wifi", wifi("Home-WiFi", "airbnb1234", "接続できない場合はホストへご連絡ください。")),
      block("notice", notice("ハウスルール", "22時以降は静かにお過ごしください。室内は禁煙です。ゴミは分別してください。", "warning")),
      block("faq", faq("滞在FAQ", [{ q: "早めに荷物を置けますか？", a: "清掃状況により異なるため事前にご相談ください。" }, { q: "調味料は使えますか？", a: "備え付けのものは自由に利用できます。" }])),
      block("checkout", checkout("10:00", "施錠後にメッセージで退室報告をお願いします。", "退室報告")),
      block("emergency", emergency("緊急連絡先", "○○病院 03-4444-5555", "緊急時は119/110へ連絡し、ホストにもお知らせください。")),
    ]),
  },
  {
    name: "ベーシック・チェックイン案内セット",
    description: "チェックイン〜滞在開始までをわかりやすく伝える基本構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "airbnb",
    cards: ordered([
      block("notice", notice("チェックイン案内", "到着後の解錠、鍵の受け取り、室内確認の流れをまとめています。")),
      block("steps", steps("入室までの流れ", [{ title: "建物到着", description: "案内メッセージの住所を確認します。" }, { title: "解錠", description: "暗証番号を入力します。" }, { title: "鍵返却場所確認", description: "退室時に迷わないよう場所を確認します。" }])),
      block("image", image("キーボックス設置場所のサンプル画像")),
      block("wifi", wifi("Guest-WiFi", "gueststay", "入室後すぐに接続できます。")),
      block("checklist", checklist("到着後チェック", ["鍵の場所を確認", "エアコン動作確認", "ハウスルール確認"])),
      block("contact_hub", contactHub("ホスト連絡", "入室できない場合は予約メッセージまたは電話でご連絡ください。", "090-0000-0000")),
      block("checkout", checkout("10:00", "退室時は鍵返却と施錠確認をお願いします。", "退室手順")),
    ]),
  },

  {
    name: "観光ガイド・回遊促進セット",
    description: "周辺スポットと移動導線を整理し、滞在中の回遊を促す構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "guide",
    cards: ordered([
      block("hero", hero("Local Walking Guide", "徒歩・バス・タクシーで巡る周辺ガイド")),
      block("nearby", nearby("徒歩圏スポット", [{ name: "朝市", description: "徒歩5分 / 7:00-11:00" }, { name: "展望台", description: "徒歩12分 / 夕景が人気" }, { name: "古い商店街", description: "徒歩8分 / 食べ歩き可" }])),
      block("map", map("回遊マップ", "○○駅周辺 観光エリア")),
      block("pageLinks", pageLinks("回遊テーマ", [{ label: "朝市ルート", icon: "shopping-bag" }, { label: "展望台ルート", icon: "camera" }, { label: "商店街ルート", icon: "map" }])),
      block("taxi", taxi("移動サポート", "03-1234-5678", "○○観光タクシー", "主要スポットを短時間で回る相談ができます。")),
      block("tabs_info", tabsInfo("時間別おすすめ", [{ label: "午前", body: "朝市とカフェを中心に徒歩で巡ります。" }, { label: "午後", body: "展望台と商店街の組み合わせがおすすめです。" }, { label: "夜", body: "飲食店街は18時以降が賑わいます。" }])),
      block("faq_search", faqSearch("観光FAQ", [{ q: "雨の日も歩けますか？", a: "商店街アーケード経由なら濡れにくいです。" }, { q: "荷物は預けられますか？", a: "駅コインロッカーまたは宿泊施設へご相談ください。" }])),
      block("quote", quote("スポット同士の距離が分かり、予定を立てやすかったです。", "観光ゲスト")),
    ]),
  },
  {
    name: "観光ガイド・半日モデルコースセット",
    description: "半日で回れる観光導線を提案するベーシック観光構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "guide",
    cards: ordered([
      block("welcome", welcome("半日モデルコース", "午前または午後だけでも満足できる回り方を提案します。")),
      block("steps", steps("4時間モデル", [{ title: "10:00 朝市", description: "地元食材と軽食を楽しむ。" }, { title: "12:00 ランチ", description: "商店街の名物店へ。" }, { title: "14:00 展望台", description: "写真を撮って駅へ戻る。" }])),
      block("compare", comparePricing("午前・午後比較", ["午前発", "午後発"], [{ label: "向いている人", values: ["朝市を見たい", "ゆっくり出発したい"] }, { label: "混雑", values: ["少なめ", "やや多め"] }, { label: "食事", values: ["ランチ中心", "カフェ中心"] }], 0)),
      block("nearby", nearby("立ち寄り候補", [{ name: "朝市", description: "地元食材" }, { name: "展望台", description: "写真映え" }, { name: "資料館", description: "雨天でも可" }])),
      block("map", map("半日ルートマップ", "○○駅 周辺")),
      block("faq", faq("モデルコースFAQ", [{ q: "所要時間は？", a: "移動と休憩を含めて約4時間です。" }, { q: "子ども連れでも大丈夫？", a: "坂道が少ないルートへ変更できます。" }])),
      block("button", button("モデルコースを相談する")),
    ]),
  },
  {
    name: "観光ガイド・グルメ巡りセット",
    description: "食べ歩き・地元名店を中心に構成したグルメ特化ガイドです。",
    preview_image: PREVIEW_IMAGE,
    category: "guide",
    cards: ordered([
      block("notice", notice("グルメ巡りガイド", "地元名物と混雑しにくい時間帯をまとめました。")),
      block("nearby", nearby("おすすめ店", [{ name: "海鮮食堂", description: "11:00-14:00 / 行列あり" }, { name: "和菓子店", description: "10:00-18:00 / お土産向き" }, { name: "地酒スタンド", description: "16:00-21:00" }])),
      block("menu_categories", menuCategories("名物カテゴリ", [{ title: "ランチ", items: [{ name: "海鮮丼", price: "1,800円", description: "数量限定", tag: "人気" }] }, { title: "甘味", items: [{ name: "抹茶大福", price: "280円", description: "持ち歩き可" }] }])),
      block("drink_menu", drinkMenu("食べ歩きドリンク", [{ name: "地元焙煎コーヒー", sizes: "M 450円", note: "商店街入口" }, { name: "季節のソーダ", sizes: "M 500円", note: "夏季限定" }])),
      block("map", map("グルメエリア地図", "○○商店街")),
      block("schedule", schedule("おすすめ時間", [{ day: "海鮮食堂", time: "11:00-13:30", label: "早め推奨" }, { day: "和菓子店", time: "10:00-18:00", label: "売切れ注意" }])),
      block("faq", faq("グルメFAQ", [{ q: "予約は必要ですか？", a: "人気店は予約または開店直後がおすすめです。" }, { q: "食べ歩きマナーは？", a: "店舗前や指定スペースでお楽しみください。" }])),
    ]),
  },
  {
    name: "観光ガイド・雨天代替スポットセット",
    description: "雨の日でも楽しめる屋内スポット中心の構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "guide",
    cards: ordered([
      block("heading_body", headingBody("雨天代替スポット", "雨の日は屋内市場、美術館、アーケードを組み合わせると半日楽しめます。")),
      block("nearby", nearby("屋内スポット", [{ name: "美術館", description: "徒歩9分 / 企画展あり" }, { name: "屋内市場", description: "徒歩6分 / 食事可" }, { name: "アーケード街", description: "徒歩4分 / 買い物向き" }])),
      block("open_status", openStatus("屋内市場", "10:00-18:00", "営業中", "営業時間外")),
      block("taxi", taxi("雨天時移動", "03-4343-7878", "レインタクシー", "雨の日は配車が混み合うため早めの手配がおすすめです。")),
      block("highlight", highlight("雨天時のコツ", "美術館から屋内市場へ向かう順がおすすめ。16時以降は帰路が混雑しやすいです。")),
      block("faq", faq("雨天FAQ", [{ q: "傘は借りられますか？", a: "宿泊施設または観光案内所で貸出があります。" }, { q: "屋内だけで半日足りますか？", a: "市場と美術館を組み合わせると3〜4時間楽しめます。" }])),
      block("map", map("雨天ルートマップ", "○○駅 アーケード入口")),
    ]),
  },
  {
    name: "ベーシック・観光ガイド案内",
    description: "初めての来訪者向けに、主要スポットと移動方法をまとめた基本構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "guide",
    cards: ordered([
      block("hero", hero("Basic Local Guide", "初めての来訪で押さえたい定番情報")),
      block("nearby", nearby("主要スポット", [{ name: "駅周辺", description: "徒歩10分 / 飲食店多数" }, { name: "観光名所", description: "バス15分" }, { name: "展望スポット", description: "夕方がおすすめ" }])),
      block("map", map("エリアマップ", "○○駅 周辺")),
      block("taxi", taxi("タクシー", "03-1111-3333", "地域タクシー", "主要スポットへの移動を相談できます。")),
      block("schedule", schedule("営業時間の目安", [{ day: "観光名所", time: "9:00-17:00", label: "多くの施設" }, { day: "レストラン", time: "11:00-21:00", label: "エリア平均" }])),
      block("faq_search", faqSearch("観光FAQ", [{ q: "おすすめ時間帯は？", a: "午前中は混雑が少なくおすすめです。" }, { q: "雨の日は？", a: "屋内スポットへ切り替えできます。" }])),
      block("emergency", emergency("観光中の緊急連絡", "地域医療センター 03-1212-3434", "事故や体調不良時は近くの店舗スタッフにも助けを求めてください。")),
    ]),
  },
  {
    name: "ベーシック・駅アクセス案内",
    description: "最寄駅からの導線を中心にしたシンプルな基本構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "guide",
    cards: ordered([
      block("welcome", welcome("駅アクセス案内", "最寄駅から迷わず到着できるよう、出口と目印を整理しました。")),
      block("steps", steps("駅からの行き方", [{ title: "東口改札", description: "改札を出て東口へ進みます。" }, { title: "大通りを直進", description: "300m進み、郵便局を右折します。" }, { title: "到着", description: "右手の白い建物が目的地です。" }])),
      block("image", image("駅出口から見える目印のサンプル画像")),
      block("map", map("アクセスマップ", "○○駅 東口")),
      block("taxi", taxi("タクシー利用", "03-5555-1212", "駅前タクシー", "所要約5分。雨の日や荷物が多い時に便利です。")),
      block("nearby", nearby("駅周辺の目印", [{ name: "コンビニ", description: "駅構内" }, { name: "郵便局", description: "右折の目印" }, { name: "コインロッカー", description: "東口地下" }])),
      block("notice", notice("混雑注意", "朝夕は駅周辺が混雑します。時間に余裕を持ってお越しください。")),
    ]),
  },

  {
    name: "インバウンド特化・多言語おもてなしセット",
    description: "海外ゲスト向けに、交通・決済・ルールを短く伝える多言語構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "inbound",
    cards: ordered([
      block("hero", hero("海外ゲスト向け滞在ガイド", "交通・決済・館内ルールをやさしい日本語と英語で案内")),
      block("tabs_info", tabsInfo("Language Support", [{ label: "日本語", body: "フロントで翻訳QRと周辺マップをお渡しします。" }, { label: "English", body: "English support and translated guide are available at the front desk." }, { label: "中文", body: "主要 안내는 QR 번역으로確認できます。" }])),
      block("wifi", wifi("Infomii-Global", "global2026", "多言語案内ページの閲覧にご利用ください。", "Wi-Fi / Internet")),
      block("info", infoRows("決済と基本ルール", "credit-card", [{ label: "Payment", value: "Credit / IC / Cash" }, { label: "No smoking", value: "客室内禁煙" }, { label: "Quiet hours", value: "22:00以降" }])),
      block("contact_hub", contactHub("Multilingual Support", "翻訳が必要な場合はフロントにQR画面をお見せください。", "+81-3-9999-8888")),
      block("faq_search", faqSearch("Inbound FAQ", [{ q: "Can I pay by credit card?", a: "Yes, major credit cards are accepted." }, { q: "Do you support luggage shipping?", a: "Yes, delivery slips are available at front desk." }])),
      block("emergency", emergency("Emergency / 緊急連絡", "City General Hospital +81-3-1111-2222", "Front desk can assist in English. 英語対応可能です。")),
    ]),
  },
  {
    name: "インバウンド・空港アクセス重視セット",
    description: "海外ゲスト向けに、空港アクセス・決済・緊急時の英語導線を強化した構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "inbound",
    cards: ordered([
      block("welcome", welcome("空港アクセスガイド", "Airport transfer, payment, and emergency information are summarized here.")),
      block("compare", comparePricing("空港からの移動比較", ["Airport Bus", "Train", "Taxi"], [{ label: "Time", values: ["70 min", "55 min", "45 min"] }, { label: "Best for", values: ["Large luggage", "Low cost", "Late arrival"] }, { label: "Fare", values: ["1,600 JPY", "900 JPY", "12,000 JPY"] }], 1)),
      block("nearby", nearby("Airport Transfer", [{ name: "Limousine Bus", description: "Hotel front 6:10 / 7:20 / 8:30" }, { name: "Train Route", description: "Nearest station 5 min walk" }])),
      block("taxi", taxi("Taxi / タクシー", "+81-3-5555-6666", "City Taxi", "24/7 support with English operator.")),
      block("map", map("Hotel Location", "Tokyo, Chiyoda-ku ○○ 1-2-3")),
      block("accordion_info", accordionInfo("Arrival Tips", [{ title: "Late arrival", body: "If you arrive after midnight, please use the night bell at the entrance." }, { title: "Luggage delivery", body: "Delivery service is available at the front desk." }])),
      block("emergency", emergency("Emergency Contacts", "+81-3-1111-2222", "Front Desk: +81-3-9999-8888")),
    ]),
  },
  {
    name: "インバウンド・家族旅行セット",
    description: "海外ファミリー向けに、移動・食事・緊急対応をまとめた構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "inbound",
    cards: ordered([
      block("notice", notice("海外ファミリー向け案内", "Children-friendly spots, dining, and emergency support are listed for family guests.")),
      block("nearby", nearby("Family Spots", [{ name: "Zoo", description: "15 min by train" }, { name: "Science Museum", description: "20 min / indoor" }, { name: "Large Park", description: "10 min by bus" }])),
      block("wifi", wifi("Infomii-FamilyGlobal", "globalfamily", "Kids video calls and translation apps can use this network.", "Family Wi-Fi")),
      block("checklist", checklist("Before Going Out", ["Kids pass / ticket", "Emergency contact memo", "Weather and stroller route"])),
      block("menu", menu("Family Dining", [{ name: "Kids Plate", price: "900 JPY", description: "Available at breakfast restaurant" }, { name: "Rice ball set", price: "600 JPY", description: "Takeout available" }])),
      block("checkout", checkout("11:00", "Late check-out may be available on request. Please ask front desk.", "Late check-out")),
      block("emergency", emergency("Emergency for Family", "+81-3-2222-3333", "Front desk can assist with taxi and hospital communication.")),
    ]),
  },
  {
    name: "インバウンド・公共交通特化セット",
    description: "電車・バス移動を中心に説明する交通特化構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "inbound",
    cards: ordered([
      block("heading_body", headingBody("公共交通ガイド", "Train and bus routes are summarized with simple Japanese and English notes.")),
      block("steps", steps("Station to Hotel", [{ title: "Exit A2", description: "Take Exit A2 from the nearest station." }, { title: "Walk 350m", description: "Go straight along the main street." }, { title: "Front desk", description: "Show your reservation name at reception." }])),
      block("schedule", schedule("Main Transport Times", [{ day: "Airport Line", time: "5:40-23:30", label: "Every 15 min" }, { day: "City Loop Bus", time: "7:00-21:00", label: "Every 10 min" }])),
      block("map", map("Transit Map", "Nearest station Exit A2")),
      block("wifi", wifi("Infomii-Transit", "transit2026", "Use this Wi-Fi to check maps and translation apps.", "Transport Wi-Fi")),
      block("faq_search", faqSearch("Transit FAQ", [{ q: "Can I use IC cards?", a: "Yes, Suica/PASMO and major IC cards are accepted." }, { q: "What time is the last train?", a: "Around 23:40 from the nearest station." }])),
      block("emergency", emergency("Transport Emergency", "+81-3-1111-2222", "If you miss the last train, ask front desk for taxi support.")),
    ]),
  },
  {
    name: "インバウンド・長期滞在サポートセット",
    description: "1週間以上の海外滞在者向けに生活情報を重視した構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "inbound",
    cards: ordered([
      block("welcome", welcome("Long Stay Support", "生活情報、清掃、ランドリー、近隣施設をまとめた長期滞在ガイドです。")),
      block("laundry", laundry("6:00-24:00", "Wash 300 JPY / Dry 100 JPY", "Front desk")),
      block("nearby", nearby("Daily Life Spots", [{ name: "Supermarket", description: "4 min walk / open until 24:00" }, { name: "Drugstore", description: "6 min walk" }, { name: "Post office", description: "9 min walk" }])),
      block("notice", notice("Waste Separation", "Please separate burnable, recyclable, and bottles/cans. Ask front desk if unsure.")),
      block("schedule", schedule("Housekeeping", [{ day: "Room cleaning", time: "10:00-14:00", label: "Weekdays" }, { day: "Towel exchange", time: "Anytime", label: "Front desk" }])),
      block("contact_hub", contactHub("Long Stay Help", "For address forms, parcel delivery, or daily-life questions, please contact front desk.", "+81-3-8888-7777")),
      block("faq", faq("Long Stay FAQ", [{ q: "Can I receive packages?", a: "Please ask front desk before shipping." }, { q: "How do I separate trash?", a: "Use the guide posted near the trash area." }])),
    ]),
  },
  {
    name: "ベーシック・インバウンド案内",
    description: "海外ゲスト向けに、交通・WiFi・緊急連絡先を整理した基本構成です。",
    preview_image: PREVIEW_IMAGE,
    category: "inbound",
    cards: ordered([
      block("hero", hero("Inbound Basic Guide", "海外ゲスト向けの基本滞在情報")),
      block("wifi", wifi("Global-WiFi", "welcomeglobal", "Translation apps and maps can use this network.", "Wi-Fi")),
      block("nearby", nearby("Access", [{ name: "Nearest Station", description: "8 min walk" }, { name: "Airport Bus", description: "Hotel front" }])),
      block("notice", notice("House Rules", "No smoking in rooms. Quiet hours after 22:00. Please separate trash.")),
      block("checkout", checkout("11:00", "Please return room key to front desk. Luggage storage is available on the same day.", "Check-out Details")),
      block("faq_search", faqSearch("Guest FAQ", [{ q: "Can I store luggage?", a: "Yes, same-day storage is available." }, { q: "Is English support available?", a: "Basic English support is available at front desk." }])),
      block("emergency", emergency("Emergency", "+81-3-1111-2222", "Front desk supports English. Call 119 for fire/ambulance and 110 for police.")),
    ]),
  },
] satisfies MarketplaceSeedTemplate[];
