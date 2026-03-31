import { NextResponse } from "next/server";
import { getSupabaseAdminServerClient } from "@/lib/server/supabase-server";

type SeedTemplate = {
  name: string;
  description: string;
  preview_image: string;
  category: string | null;
  cards: Array<{ type: string; content: Record<string, unknown>; order: number }>;
};

const STYLE_KEY = "_style";
const PAGE_STYLE_KEY = "_pageStyle";

function getCategoryBackground(category: string | null): {
  mode: "solid" | "gradient";
  color: string;
  from: string;
  to: string;
  angle: number;
} {
  switch (category) {
    case "business":
      return { mode: "gradient", color: "#f8fafc", from: "#f8fafc", to: "#e2e8f0", angle: 180 };
    case "resort":
      return { mode: "gradient", color: "#ecfeff", from: "#ecfeff", to: "#cffafe", angle: 160 };
    case "ryokan":
      return { mode: "gradient", color: "#fff7ed", from: "#fff7ed", to: "#ffedd5", angle: 165 };
    case "airbnb":
      return { mode: "gradient", color: "#fdf4ff", from: "#fdf4ff", to: "#f3e8ff", angle: 170 };
    case "guide":
      return { mode: "gradient", color: "#f0fdf4", from: "#f0fdf4", to: "#dcfce7", angle: 170 };
    case "inbound":
      return { mode: "gradient", color: "#eff6ff", from: "#eff6ff", to: "#dbeafe", angle: 170 };
    default:
      return { mode: "gradient", color: "#f8fafc", from: "#f8fafc", to: "#f1f5f9", angle: 180 };
  }
}

function getBaseCardStyle(type: string): Record<string, unknown> {
  const shared = {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
    titleFontSize: "lg",
    bodyFontSize: "base",
  };
  switch (type) {
    case "hero":
      return {
        ...shared,
        borderRadius: 18,
        backgroundColor: "#0f172a",
        borderColor: "#0f172a",
        textColor: "#ffffff",
        titleFontSize: "2xl",
        bodyFontSize: "lg",
      };
    case "notice":
    case "emergency":
      return {
        ...shared,
        backgroundColor: "#fff7ed",
        borderColor: "#fdba74",
      };
    case "wifi":
    case "checklist":
    case "steps":
      return {
        ...shared,
        backgroundColor: "#eff6ff",
        borderColor: "#bfdbfe",
      };
    case "breakfast":
    case "menu":
    case "restaurant":
      return {
        ...shared,
        backgroundColor: "#fefce8",
        borderColor: "#fde68a",
      };
    case "nearby":
    case "map":
    case "pageLinks":
      return {
        ...shared,
        backgroundColor: "#ecfeff",
        borderColor: "#a5f3fc",
      };
    default:
      return {
        ...shared,
        backgroundColor: "#ffffff",
        borderColor: "#e2e8f0",
      };
  }
}

function applyTemplateVisualStyles(template: SeedTemplate): SeedTemplate {
  const background = getCategoryBackground(template.category);
  const cards = template.cards.map((card, index) => {
    const content = { ...(card.content ?? {}) };
    const existingStyle =
      STYLE_KEY in content && typeof content[STYLE_KEY] === "object" && content[STYLE_KEY] != null
        ? (content[STYLE_KEY] as Record<string, unknown>)
        : {};
    const style = {
      ...getBaseCardStyle(card.type),
      ...existingStyle,
    };
    const nextContent: Record<string, unknown> = {
      ...content,
      [STYLE_KEY]: style,
    };
    if (index === 0) {
      nextContent[PAGE_STYLE_KEY] = {
        background,
      };
    }
    return {
      ...card,
      content: nextContent,
    };
  });
  return {
    ...template,
    cards,
  };
}

const SEED_TEMPLATES: SeedTemplate[] = [
  {
    name: "ビジネスホテル・即運用セット",
    description: "出張客向けに、Wi-Fi・朝食・ランドリー・チェックアウト導線を最適化した構成です。",
    preview_image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80",
    category: "business",
    cards: [
      { type: "hero", content: { title: "Business Stay Guide", subtitle: "必要情報を1ページで確認", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "kpi", content: { title: "クイック情報", items: [{ label: "チェックイン", value: "15:00" }, { label: "チェックアウト", value: "11:00" }, { label: "フロント内線", value: "9" }] }, order: 1 },
      { type: "wifi", content: { title: "Wi-Fi案内", ssid: "Infomii-Biz", password: "biz2026stay", description: "接続不具合はフロントへ" }, order: 2 },
      { type: "schedule", content: { title: "営業時間", items: [{ day: "朝食会場", time: "6:30-9:30", label: "1F レストラン" }, { day: "ランドリー", time: "6:00-24:00", label: "2F セルフランドリー" }] }, order: 3 },
      { type: "laundry", content: { title: "ランドリー案内", hours: "6:00-24:00", priceNote: "洗濯 300円 / 乾燥 100円(30分)", contact: "内線 9" }, order: 4 },
      { type: "checkout", content: { title: "チェックアウト手順", time: "11:00", note: "混雑を避ける場合は10:30までがおすすめです。", linkUrl: "", linkLabel: "延長申請はこちら" }, order: 5 },
      { type: "faq", content: { title: "よくある質問", items: [{ q: "領収書の宛名変更は可能ですか？", a: "フロントで対応可能です。" }, { q: "深夜チェックインはできますか？", a: "24時以降は事前連絡をお願いします。" }] }, order: 6 },
    ],
  },
  {
    name: "リゾートホテル・体験訴求セット",
    description: "館内体験とアクティビティを中心に、滞在価値を伝える構成です。",
    preview_image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&q=80",
    category: "resort",
    cards: [
      { type: "hero", content: { title: "Resort Experience", subtitle: "非日常の滞在を満喫", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "gallery", content: { title: "館内ハイライト", columns: 2, items: [{ src: "", alt: "プール" }, { src: "", alt: "ラウンジ" }, { src: "", alt: "スパ" }, { src: "", alt: "夕景" }] }, order: 1 },
      { type: "spa", content: { title: "スパ・温泉", hours: "15:00-24:00 / 6:00-10:00", location: "2F", description: "サウナ・露天風呂あり", note: "混雑時は時間をずらしてご利用ください。" }, order: 2 },
      { type: "menu", content: { title: "リゾートダイニング", items: [{ name: "サンセットコース", price: "6,500円", description: "地元食材のフルコース" }, { name: "トロピカルモクテル", price: "980円", description: "バーラウンジ限定" }] }, order: 3 },
      { type: "action", content: { label: "アクティビティ予約", href: "#" }, order: 4 },
      { type: "quote", content: { quote: "館内で一日中楽しめる、満足度の高い滞在でした。", author: "ゲストレビュー" }, order: 5 },
    ],
  },
  {
    name: "旅館・おもてなし案内セット",
    description: "大浴場・食事処・館内作法を丁寧に伝える和風旅館向け構成です。",
    preview_image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80",
    category: "ryokan",
    cards: [
      { type: "welcome", content: { title: "ご到着ありがとうございます", message: "湯と食を楽しむひとときをお過ごしください。" }, order: 0 },
      { type: "notice", content: { title: "館内のお願い", body: "23:00以降は客室廊下での会話をお控えください。", variant: "warning" }, order: 1 },
      { type: "spa", content: { title: "大浴場のご案内", hours: "15:00-24:00 / 5:30-9:30", location: "1F", description: "内湯・露天風呂", note: "刺青がある場合は貸切風呂をご利用ください。" }, order: 2 },
      { type: "restaurant", content: { title: "お食事処", time: "18:00-21:00", location: "1F お食事処", menu: "会席料理 / お子様膳あり" }, order: 3 },
      { type: "steps", content: { title: "チェックアウトまでの流れ", items: [{ title: "朝食", description: "7:00-9:00に会場へ" }, { title: "精算", description: "10:00までにフロントへ" }, { title: "お見送り", description: "玄関でスタッフがお見送りします" }] }, order: 4 },
      { type: "map", content: { title: "周辺散策", address: "○○温泉街 中央通り 1-2-3", mapEmbedUrl: "" }, order: 5 },
    ],
  },
  {
    name: "民泊・セルフチェックインセット",
    description: "セルフ運用に必要な手順、ハウスルール、緊急連絡をまとめた構成です。",
    preview_image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80",
    category: "airbnb",
    cards: [
      { type: "hero", content: { title: "Welcome to Your Stay", subtitle: "セルフチェックイン案内", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "steps", content: { title: "チェックイン手順", items: [{ title: "1. 入口解錠", description: "暗証番号を入力して解錠" }, { title: "2. 鍵受け取り", description: "キーボックスから受け取り" }, { title: "3. 入室", description: "室内案内を確認してご利用開始" }] }, order: 1 },
      { type: "checklist", content: { title: "ハウスルール", items: [{ text: "22時以降は静かに過ごす", checked: false }, { text: "室内は禁煙", checked: false }, { text: "ゴミは分別して廃棄", checked: false }] }, order: 2 },
      { type: "wifi", content: { title: "Wi-Fi", ssid: "Infomii-HomeStay", password: "home2026stay", description: "接続できない場合はホストへ連絡" }, order: 3 },
      { type: "emergency", content: { title: "緊急連絡先", fire: "119", police: "110", hospital: "○○クリニック 03-1111-2222", note: "ホスト直通: 090-xxxx-xxxx" }, order: 4 },
      { type: "checkout", content: { title: "チェックアウト", time: "10:00", note: "退室時にエアコンと照明OFFを確認してください。", linkUrl: "", linkLabel: "退室報告" }, order: 5 },
    ],
  },
  {
    name: "観光ガイド・回遊促進セット",
    description: "周辺スポットと移動導線を整理し、滞在中の回遊を促す構成です。",
    preview_image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80",
    category: "guide",
    cards: [
      { type: "hero", content: { title: "Local Guide", subtitle: "周辺のおすすめを厳選", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "nearby", content: { title: "徒歩圏スポット", items: [{ name: "朝市", description: "徒歩5分 / 7:00-11:00", link: "" }, { name: "展望台", description: "徒歩12分 / 夕景が人気", link: "" }] }, order: 1 },
      { type: "pageLinks", content: { title: "テーマ別ガイド", columns: 3, iconSize: "md", items: [{ label: "グルメ", icon: "utensils", linkType: "page", pageSlug: "", link: "" }, { label: "温泉", icon: "bath", linkType: "page", pageSlug: "", link: "" }, { label: "交通", icon: "train", linkType: "page", pageSlug: "", link: "" }] }, order: 2 },
      { type: "taxi", content: { title: "タクシー・移動", phone: "03-1234-5678", companyName: "○○タクシー", note: "主要駅まで約12分" }, order: 3 },
      { type: "map", content: { title: "ホテル所在地", address: "東京都○○区○○ 2-3-4", mapEmbedUrl: "" }, order: 4 },
      { type: "faq", content: { title: "観光FAQ", items: [{ q: "雨の日におすすめの場所は？", a: "美術館と屋内市場がおすすめです。" }, { q: "最終バス時刻は？", a: "ホテル前バス停は21:40発が最終です。" }] }, order: 5 },
    ],
  },
  {
    name: "ファミリー向け・館内回遊セット",
    description: "館内導線をわかりやすくし、子連れ滞在で必要な情報を網羅した構成です。",
    preview_image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80",
    category: "resort",
    cards: [
      { type: "hero", content: { title: "Family Stay Guide", subtitle: "お子さま連れでも安心", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "pageLinks", content: { title: "館内メニュー", columns: 2, iconSize: "lg", items: [{ label: "朝食会場", icon: "utensils", linkType: "page", pageSlug: "", link: "" }, { label: "キッズ備品", icon: "package", linkType: "page", pageSlug: "", link: "" }, { label: "駐車場", icon: "car", linkType: "page", pageSlug: "", link: "" }, { label: "周辺観光", icon: "map-pin", linkType: "page", pageSlug: "", link: "" }] }, order: 1 },
      { type: "parking", content: { title: "駐車場", capacity: "35台", fee: "1泊 800円", note: "ベビーカー積み下ろしスペースあり", address: "ホテル南側" }, order: 2 },
      { type: "breakfast", content: { title: "朝食ビュッフェ", time: "7:00-9:30", location: "1F レストラン", menu: "キッズメニューあり" }, order: 3 },
      { type: "checklist", content: { title: "出発前チェック", items: [{ text: "お子さまの忘れ物チェック", checked: false }, { text: "ルームキー返却", checked: false }, { text: "駐車券精算", checked: false }] }, order: 4 },
      { type: "quote", content: { quote: "案内が見やすく、子連れでも迷わず過ごせました。", author: "ファミリーゲスト" }, order: 5 },
    ],
  },
  {
    name: "駅前特化ビジホ・時短導線セット",
    description: "駅徒歩圏の強みを活かし、移動・チェックイン・朝の出発を最短化した構成です。",
    preview_image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
    category: "business",
    cards: [
      { type: "hero", content: { title: "Station Access Smart Stay", subtitle: "駅徒歩3分・最短導線で迷わない", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "kpi", content: { title: "アクセス要点", items: [{ label: "最寄駅", value: "JR ○○駅 東口" }, { label: "徒歩", value: "3分" }, { label: "始発空港バス", value: "5:40" }] }, order: 1 },
      { type: "steps", content: { title: "駅からホテルまで", items: [{ title: "Step 1", description: "東口改札を出て右へ" }, { title: "Step 2", description: "ロータリー沿いに直進 180m" }, { title: "Step 3", description: "1Fコンビニ併設ビルの上階" }] }, order: 2 },
      { type: "pageLinks", content: { title: "出張クイックメニュー", columns: 3, iconSize: "md", items: [{ label: "交通案内", icon: "train", linkType: "page", pageSlug: "", link: "" }, { label: "チェックアウト", icon: "checkout", linkType: "page", pageSlug: "", link: "" }, { label: "領収書", icon: "credit-card", linkType: "page", pageSlug: "", link: "" }] }, order: 3 },
      { type: "breakfast", content: { title: "朝食（時短対応）", time: "6:00-9:30", location: "2F レストラン", menu: "テイクアウトBOX対応（6:00-8:30）" }, order: 4 },
      { type: "taxi", content: { title: "タクシー即時手配", phone: "03-5678-1234", companyName: "駅前タクシー", note: "フロントから最短3分で配車可能" }, order: 5 },
      { type: "faq", content: { title: "ビジネスFAQ", items: [{ q: "早朝チェックアウトは可能ですか？", a: "24時間対応の自動精算機をご利用いただけます。" }, { q: "会場までの最短ルートは？", a: "フロントで当日朝に地図をお渡しします。" }] }, order: 6 },
    ],
  },
  {
    name: "インバウンド特化・多言語おもてなしセット",
    description: "海外ゲスト向けに、交通・決済・ハウスルールをわかりやすく伝える多言語運用向け構成です。",
    preview_image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&q=80",
    category: "inbound",
    cards: [
      { type: "hero", content: { title: "Welcome International Guests", subtitle: "EN/JP対応の滞在ガイド", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "notice", content: { title: "Language Support", body: "Front desk supports English. Translation support available via QR.", variant: "info" }, order: 1 },
      { type: "pageLinks", content: { title: "Travel Essentials", columns: 3, iconSize: "md", items: [{ label: "Transport", icon: "train", linkType: "page", pageSlug: "", link: "" }, { label: "Local Bus", icon: "bus", linkType: "page", pageSlug: "", link: "" }, { label: "Area Map", icon: "map-pin", linkType: "page", pageSlug: "", link: "" }, { label: "Payment", icon: "credit-card", linkType: "page", pageSlug: "", link: "" }, { label: "Emergency", icon: "phone", linkType: "page", pageSlug: "", link: "" }, { label: "Baggage", icon: "package", linkType: "page", pageSlug: "", link: "" }] }, order: 2 },
      { type: "wifi", content: { title: "Wi-Fi", ssid: "Infomii-Global", password: "global2026", description: "For support, contact front desk." }, order: 3 },
      { type: "checklist", content: { title: "Stay Rules", items: [{ text: "No smoking in rooms", checked: false }, { text: "Quiet hours after 22:00", checked: false }, { text: "Please separate trash", checked: false }] }, order: 4 },
      { type: "emergency", content: { title: "Emergency Contacts", fire: "119", police: "110", hospital: "City General Hospital +81-3-1111-2222", note: "Front desk: +81-3-9999-8888" }, order: 5 },
      { type: "faq", content: { title: "International FAQ", items: [{ q: "Can I pay by credit card?", a: "Yes, Visa/Mastercard/Amex are accepted." }, { q: "Do you support luggage shipping?", a: "Yes, delivery slips are available at front desk." }] }, order: 6 },
    ],
  },
  {
    name: "連泊ゲスト向け・快適滞在セット",
    description: "2泊以上のゲスト向けに、清掃タイミング・ランドリー・周辺導線を強化した構成です。",
    preview_image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80",
    category: "business",
    cards: [
      { type: "welcome", content: { title: "Long Stay Guide", message: "連泊中に便利な情報をまとめています。" }, order: 0 },
      { type: "wifi", content: { ssid: "Infomii-LongStay", password: "stay2026plus", description: "動画会議に最適化された回線です。" }, order: 1 },
      { type: "notice", content: { title: "客室清掃のご案内", body: "清掃は毎日 10:00-14:00。不要時はドアサインをご利用ください。", variant: "info" }, order: 2 },
      { type: "laundry", content: { title: "ランドリー", hours: "6:00-24:00", priceNote: "洗濯 300円 / 乾燥 100円(30分)", contact: "内線 9" }, order: 3 },
      { type: "nearby", content: { title: "連泊に便利な周辺施設", items: [{ name: "スーパー", description: "徒歩4分 / 24時まで営業", link: "" }, { name: "ドラッグストア", description: "徒歩6分 / 日用品あり", link: "" }] }, order: 4 },
      { type: "checkout", content: { title: "チェックアウト", time: "11:00", note: "連泊中の延泊相談は前日20:00までにご連絡ください。", linkUrl: "", linkLabel: "延泊相談" }, order: 5 },
    ],
  },
  {
    name: "スパ&ウェルネス重視セット",
    description: "スパ・温浴・食事の時間設計を重視し、滞在満足を高める構成です。",
    preview_image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80",
    category: "resort",
    cards: [
      { type: "hero", content: { title: "Wellness Stay", subtitle: "整える滞在体験をご案内", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "spa", content: { title: "スパ営業時間", hours: "14:00-23:00 / 6:00-9:00", location: "2F Wellness Zone", description: "トリートメント・サウナ利用可", note: "混雑状況はフロントで確認できます。" }, order: 1 },
      { type: "schedule", content: { title: "おすすめ利用時間", items: [{ day: "夕方", time: "16:00-18:00", label: "比較的空いています" }, { day: "朝", time: "6:30-8:00", label: "景色を楽しめる時間帯" }] }, order: 2 },
      { type: "menu", content: { title: "ヘルシーメニュー", items: [{ name: "発酵和朝食", price: "2,200円", description: "地元食材中心" }, { name: "デトックスティー", price: "850円", description: "ラウンジ提供" }] }, order: 3 },
      { type: "notice", content: { title: "ご利用前のお願い", body: "体調が優れない場合は無理せずスタッフへご相談ください。", variant: "info" }, order: 4 },
      { type: "button", content: { label: "スパ予約をする", href: "" }, order: 5 },
    ],
  },
  {
    name: "旅館・食事時間重視セット",
    description: "夕朝食の導線と館内作法を中心に、和旅館運用に最適化した構成です。",
    preview_image: "https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=600&q=80",
    category: "ryokan",
    cards: [
      { type: "welcome", content: { title: "ご滞在のご案内", message: "お食事と温泉をゆったりお楽しみください。" }, order: 0 },
      { type: "restaurant", content: { title: "夕食のご案内", time: "18:00-21:00", location: "1F 食事処", menu: "季節の会席料理" }, order: 1 },
      { type: "breakfast", content: { title: "朝食", time: "7:00-9:00", location: "1F 食事処", menu: "和定食 / お子様対応可" }, order: 2 },
      { type: "notice", content: { title: "館内作法", body: "浴場・廊下での通話はお控えください。客室内は禁煙です。", variant: "warning" }, order: 3 },
      { type: "spa", content: { title: "温泉", hours: "15:00-24:00 / 5:30-9:30", location: "1F 大浴場", description: "内湯・露天", note: "貸切風呂は要予約" }, order: 4 },
      { type: "checkout", content: { title: "ご出発", time: "10:00", note: "送迎をご利用の方はチェックイン時にお申し付けください。", linkUrl: "", linkLabel: "送迎案内" }, order: 5 },
    ],
  },
  {
    name: "Airbnb・ワーケーション向けセット",
    description: "長期滞在・リモートワーク利用向けに、設備情報と生活導線を重視した構成です。",
    preview_image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80",
    category: "airbnb",
    cards: [
      { type: "hero", content: { title: "Workation Home Guide", subtitle: "仕事も滞在も快適に", image: "/preset-hero-sample.png" }, order: 0 },
      { type: "wifi", content: { title: "Wi-Fi / Work", ssid: "Infomii-Workation", password: "remote2026", description: "会議用の有線LANアダプタ貸出あり" }, order: 1 },
      { type: "checklist", content: { title: "チェックイン後の確認", items: [{ text: "ワークデスク位置の確認", checked: false }, { text: "エアコン動作確認", checked: false }, { text: "ゴミ分別ルール確認", checked: false }] }, order: 2 },
      { type: "nearby", content: { title: "生活インフラ", items: [{ name: "コインランドリー", description: "徒歩3分 / 24時間", link: "" }, { name: "カフェ", description: "徒歩5分 / 電源あり", link: "" }] }, order: 3 },
      { type: "emergency", content: { title: "緊急時", fire: "119", police: "110", hospital: "○○総合病院 03-2222-3333", note: "ホスト連絡先: 090-xxxx-xxxx" }, order: 4 },
      { type: "checkout", content: { title: "チェックアウト", time: "10:00", note: "キーボックス返却後にメッセージ送信をお願いします。", linkUrl: "", linkLabel: "退室報告" }, order: 5 },
    ],
  },
  {
    name: "インバウンド・空港アクセス重視セット",
    description: "海外ゲスト向けに、空港アクセス・決済・緊急時の英語導線を強化した構成です。",
    preview_image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80",
    category: "inbound",
    cards: [
      { type: "welcome", content: { title: "Airport Access Guide", message: "International guests can check transport and payment info here." }, order: 0 },
      { type: "notice", content: { title: "Payment", body: "Credit cards and contactless payments are accepted.", variant: "info" }, order: 1 },
      { type: "nearby", content: { title: "Airport Transfer", items: [{ name: "Limousine Bus", description: "Hotel front 6:10 / 7:20 / 8:30", link: "" }, { name: "Train", description: "Nearest station 5 min walk", link: "" }] }, order: 2 },
      { type: "taxi", content: { title: "Taxi", phone: "+81-3-5555-6666", companyName: "City Taxi", note: "24/7 support with English operator" }, order: 3 },
      { type: "emergency", content: { title: "Emergency Contacts", fire: "119", police: "110", hospital: "+81-3-1111-2222", note: "Front Desk: +81-3-9999-8888" }, order: 4 },
      { type: "map", content: { title: "Hotel Location", address: "Tokyo, Chiyoda-ku ○○ 1-2-3", mapEmbedUrl: "" }, order: 5 },
    ],
  },
];

export async function GET(request: Request) {
  try {
    const supabase = getSupabaseAdminServerClient();
    const { searchParams } = new URL(request.url);
    const syncLatest = searchParams.get("sync") === "1";

    const { data: existing, error: existingError } = await supabase
      .from("templates")
      .select("id, name")
      .limit(200);
    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const existingByName = new Map<string, { id: string; name: string }>();
    for (const row of existing ?? []) {
      existingByName.set(row.name, row as { id: string; name: string });
    }

    const toInsert: SeedTemplate[] = [];
    let updated = 0;

    for (const template of SEED_TEMPLATES) {
      const visualTemplate = applyTemplateVisualStyles(template);
      const found = existingByName.get(template.name);
      if (!found) {
        toInsert.push(visualTemplate);
        continue;
      }
      if (syncLatest) {
        const { error } = await supabase
          .from("templates")
          .update({
            description: visualTemplate.description,
            preview_image: visualTemplate.preview_image,
            category: visualTemplate.category,
            cards: visualTemplate.cards,
          })
          .eq("id", found.id);
        if (!error) updated += 1;
      }
    }

    let inserted = 0;
    if (toInsert.length > 0) {
      const rows = toInsert.map(({ name, description, preview_image, category, cards }) => ({
        name,
        description,
        preview_image,
        category,
        cards,
      }));
      const { error } = await supabase.from("templates").insert(rows);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      inserted = rows.length;
    }

    return NextResponse.json({
      seeded: inserted > 0,
      syncLatest,
      message: syncLatest ? "Templates synced to latest" : "Templates checked",
      inserted,
      updated,
      totalSeedTemplates: SEED_TEMPLATES.length,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Seed failed" },
      { status: 500 }
    );
  }
}
