import type { CardType } from "@/components/editor/types";
import { HERO_SLIDER_MAX_ITEMS } from "@/components/editor/types";

const PERSONAL_HERO_IMAGE = "/lp/demo/travel-hero.jpg";

const PERSONAL_HERO_SLIDER_IMAGES = [
  { src: "/lp/demo/travel-hero.jpg", alt: "旅行のメイン", caption: "旅のしおり・集合はここから" },
  { src: "/lp/demo/oshi-hero.jpg", alt: "ライブ会場", caption: "当日の集合・開演時間を確認" },
  { src: "/lp/use-cases/live-trip.jpg", alt: "おでかけ", caption: "移動と休憩ポイント" },
  { src: "/lp/demo/event-hero.jpg", alt: "イベント", caption: "受付・タイムテーブルは下を見てね" },
  { src: "/lp/demo/cafe-hero.jpg", alt: "カフェ", caption: "途中の待ち合わせ・おやつタイム" },
] as const;

export function createPersonalHeroSliderSlide(index: number): Record<string, unknown> {
  const picked = PERSONAL_HERO_SLIDER_IMAGES[Math.max(0, Math.min(index, PERSONAL_HERO_SLIDER_IMAGES.length - 1))];
  return {
    src: picked.src,
    alt: picked.alt,
    caption: picked.caption,
    linkEnabled: false,
    linkType: "internal",
    href: "",
    openInNewTab: false,
  };
}

/** 個人・友達向けタブでブロック追加時の初期文言（ホテル案内トーンは使わない） */
export function personalDefaultContent(type: CardType): Record<string, unknown> | null {
  switch (type) {
    case "hero":
      return {
        title: "旅のしおり",
        subtitle: "予定・持ち物・リンクをここにまとめたよ",
        image: PERSONAL_HERO_IMAGE,
        widthMode: "inset",
      };
    case "hero_slider":
      return {
        title: "思い出フォト",
        autoplay: true,
        intervalSec: 4,
        transitionEnabled: true,
        transitionType: "fade",
        transitionDurationMs: 500,
        showCaptions: true,
        height: "s",
        widthMode: "inset",
        slides: Array.from({ length: HERO_SLIDER_MAX_ITEMS }, (_, i) => createPersonalHeroSliderSlide(i)),
      };
    case "heading_body":
      return {
        title: "ひとこと",
        body: "今日の予定や連絡先を、友達にわかりやすく書いておこう。",
        dividerEnabled: false,
        dividerStyle: "solid",
      };
    case "highlight":
      return {
        title: "大事な連絡",
        body: "30分以上遅れるときはチャットで一声。集合場所が変わったらここも更新してね。",
        accent: "amber",
      };
    case "notice":
      return {
        title: "リマインド",
        body: "雨の日は屋外の予定をやめて、屋内に逃げるプランに切り替えよう。",
        variant: "info",
      };
    case "welcome":
      return {
        title: "はじめに",
        message: "このページに今日の予定をまとめたよ。迷ったらチャットで聞いてね。",
      };
    case "map":
      return {
        title: "集合・会場",
        address: "○○駅ハチ公口（例）",
        mapEmbedUrl: "",
      };
    case "nearby":
      return {
        title: "行きたい場所",
        items: [
          { name: "ランチの店", description: "12:00予約済み。遅れたら店に電話して", link: "" },
          { name: "カフェ", description: "午後にひと休みする予定", link: "" },
        ],
      };
    case "schedule":
      return {
        title: "今日の予定",
        dynamicEnabled: false,
        timezone: "Asia/Tokyo",
        rules: [],
        items: [
          { day: "1日目", time: "10:00", label: "集合（駅改札前）" },
          { day: "1日目", time: "12:00", label: "ランチ" },
          { day: "1日目", time: "15:00", label: "散歩・お土産" },
        ],
      };
    case "faq":
      return {
        title: "よくある質問",
        items: [
          { q: "お金どうする？", a: "交通費と食事はだいたい割り勘。レシート写真をチャットに上げといて。" },
          { q: "遅れそう", a: "次の集合場所をチャットに書いて。連絡つかないときは電話して。" },
        ],
      };
    case "accordion_info":
      return {
        title: "メモ",
        items: [
          { title: "雨天のとき", body: "屋外はやめて屋内プランに切り替え。" },
          { title: "荷物", body: "大きい荷物はロッカーか預かりを検討。" },
        ],
      };
    case "emergency":
      return {
        title: "困ったとき",
        fire: "119",
        police: "110",
        hospital: "最寄りの救急（要確認）",
        note: "まずは連絡先の人に電話。迷ったら110/119。",
      };
    case "button":
      return { label: "予約を見る", href: "#" };
    case "pageLinks":
      return {
        title: "リンクまとめ",
        columns: 2,
        iconSize: "md",
        styleVariant: "tile",
        tileShadowStrength: "md",
        circleIconShadowStrength: "md",
        items: [
          { label: "予約画面", icon: "calendar", linkType: "page" as const, pageSlug: "", link: "" },
          { label: "地図", icon: "map", linkType: "page" as const, pageSlug: "", link: "" },
          { label: "天気", icon: "link", linkType: "page" as const, pageSlug: "", link: "" },
        ],
      };
    case "social_links":
      return {
        title: "SNS・連絡",
        items: [
          { label: "Instagram", href: "", handle: "@your_account" },
          { label: "X", href: "", handle: "@your_account" },
        ],
      };
    case "contact_hub":
      return {
        title: "連絡先",
        phone: "",
        email: "",
        lineUrl: "",
        mapUrl: "",
        note: "当日迷ったらチャットか電話で。",
      };
    case "quote":
      return {
        quote: "楽しみにしてる。当日よろしく！",
        author: "",
      };
    case "checklist":
      return {
        title: "持ち物",
        items: [
          { text: "身分証", checked: false },
          { text: "充電器・モバイルバッテリー", checked: false },
          { text: "予約のスクショ", checked: false },
          { text: "歩きやすい靴", checked: false },
        ],
      };
    case "steps":
      return {
        title: "今日の流れ",
        items: [
          { title: "集合", description: "10:00 駅改札前。遅れたらチャットで" },
          { title: "ランチ", description: "12:00 予約店（店名は上の地図参照）" },
          { title: "解散", description: "17:00頃。帰りは各自でOK" },
        ],
      };
    case "compare":
      return {
        layout: "pricing",
        title: "プラン比較",
        pricingColumnHeaders: ["A案", "B案"],
        pricingRows: [
          { label: "ポイント", values: ["のんびり", "寄り道多め"] },
          { label: "予算目安", values: ["5,000円", "8,000円"] },
        ],
        highlightColumnIndex: 0,
        leftTitle: "A案",
        leftBody: "移動少なめ",
        rightTitle: "B案",
        rightBody: "スポット多め",
      };
    case "kpi":
      return {
        title: "数字メモ",
        items: [
          { label: "集合", value: "10:00" },
          { label: "人数", value: "3人" },
          { label: "予算目安", value: "5,000円/人" },
        ],
      };
    case "progress_steps":
      return {
        title: "準備の進捗",
        currentStep: 1,
        items: [
          { label: "予約完了", done: true },
          { label: "集合場所共有", done: false },
          { label: "当日連絡", done: false },
        ],
      };
    case "tabs_info":
      return {
        title: "タブで整理",
        defaultIndex: 0,
        tabs: [
          { label: "今日", body: "集合・食事・解散の時間は上のタイムラインを見てね。" },
          { label: "リンク", body: "予約や地図は下のリンクまとめから。" },
          { label: "持ち物", body: "チェックリストを忘れずに。" },
        ],
      };
    case "faq_search":
      return {
        title: "Q&A",
        items: [
          { q: "集合どこ？", a: "地図ブロックの住所を見て。変更あったらチャット。" },
          { q: "キャンセルしたい", a: "主催者に早めに連絡してね。" },
        ],
      };
    case "text":
      return { title: "メモ", content: "自由に書ける欄。割り勘メモや連絡先など。" };
    case "image":
      return { src: PERSONAL_HERO_IMAGE, alt: "思い出の写真" };
    case "video":
      return { title: "動画メモ", videoUrl: "", caption: "当日の様子など" };
    case "gallery":
      return {
        title: "",
        columns: 2,
        items: [
          { src: PERSONAL_HERO_IMAGE, alt: "写真1" },
          { src: PERSONAL_HERO_IMAGE, alt: "写真2" },
        ],
      };
    case "divider":
      return { style: "line" };
    case "space":
      return { height: 48 };
    case "info":
      return {
        title: "",
        icon: "",
        rows: [{ label: "", value: "", show: true }],
      };
    case "action":
      return { label: "詳細を見る", href: "#" };
    case "notice_ticker":
      return {
        title: "今日の連絡",
        items: [
          "集合は10:00・駅改札前（変更あったらチャット）",
          "雨の日は屋外コースをやめて屋内に切り替え",
        ],
        speed: "normal",
        pauseOnHover: true,
      };
    case "emergency_banner":
      return {
        title: "至急確認",
        message: "集合場所が変わった。チャットを見てから向かってね。",
        level: "high",
      };
    case "scheduled_banner":
      return {
        title: "イベント期間のお知らせ",
        message: "このバナーはイベント当日だけ表示する想定。",
        startAt: "",
        endAt: "",
      };
    case "menu_sheet_sync":
      return {
        title: "食べ歩きメモ",
        csvUrl: "",
        delimiter: ",",
        hasHeader: true,
        nameColumn: 0,
        priceColumn: 1,
        descriptionColumn: 2,
        tagColumn: -1,
        fallbackText: "メニュー表を読み込めませんでした。URLを確認してね。",
        cacheTtlSec: 120,
      };
    default:
      return null;
  }
}
