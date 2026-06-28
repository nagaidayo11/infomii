"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GuestCardPageView } from "@/components/guest/GuestCardPageView";
import type { CardType, EditorCard } from "@/components/editor/types";
import { LP_DEMO_HERO_IMAGES } from "@/lib/lp/data";
import type { PageBackgroundStyle } from "@/lib/storage";

const DEMO_STORAGE_KEY = "editor2:demo-state:v2";

const FALLBACK_CARDS: EditorCard[] = [
  {
    id: "demo-hero",
    type: "hero",
    order: 0,
    content: {
      title: "Infomii Hotel",
      subtitle: "館内案内をスマートにまとめました",
      image: LP_DEMO_HERO_IMAGES.hotel,
    },
  },
  {
    id: "demo-notice",
    type: "notice",
    order: 1,
    content: {
      title: "お知らせ",
      body: "客室清掃は10:00-14:00に実施します。",
      variant: "info",
    },
  },
  {
    id: "demo-wifi",
    type: "wifi",
    order: 2,
    content: {
      title: "WiFi",
      ssid: "Infomii-Guest",
      password: "welcome-2026",
      description: "接続できない場合はフロントへお知らせください。",
    },
  },
];

const FALLBACK_BG: PageBackgroundStyle = {
  mode: "solid",
  color: "#ffffff",
  from: "#ffffff",
  to: "#ffffff",
  angle: 180,
};

const TEMPLATE_VARIANTS = [
  "city-hotel",
  "travel",
  "oshi",
  "event",
  "resort",
  "ryokan",
  "business-hotel",
  "glamping",
  "spa",
  "restaurant",
  "cafe",
  "salon",
  "clinic",
] as const;

type TemplateVariant = (typeof TEMPLATE_VARIANTS)[number];

function createCard(type: CardType, order: number, content: Record<string, unknown>): EditorCard {
  return {
    id: `variant-${type}-${order}`,
    type,
    order,
    content,
    style: {},
  };
}

function variantCardsAndBg(variant: TemplateVariant): { title: string; cards: EditorCard[]; bg: PageBackgroundStyle } {
  const baseBg: PageBackgroundStyle = {
    mode: "solid",
    color: "#ffffff",
    from: "#ffffff",
    to: "#ffffff",
    angle: 180,
  };
  switch (variant) {
    case "resort":
      return {
        title: "リゾートご案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Ocean Resort",
            subtitle: "アクティビティと送迎案内",
            image: "/templates/previews/resort/ab668978.jpg",
          }),
          createCard("pageLinks", 1, {
            title: "人気メニュー",
            columns: 2,
            items: [
              { label: "送迎時刻", icon: "taxi", linkType: "page", pageSlug: "", link: "" },
              { label: "朝食予約", icon: "breakfast", linkType: "page", pageSlug: "", link: "" },
              { label: "周辺スポット", icon: "nearby", linkType: "page", pageSlug: "", link: "" },
              { label: "体験メニュー", icon: "info", linkType: "page", pageSlug: "", link: "" },
            ],
          }),
          createCard("schedule", 2, {
            title: "本日のスケジュール",
            items: [
              { day: "朝ヨガ", time: "7:00", label: "ビーチデッキ" },
              { day: "送迎バス", time: "9:30 / 13:30", label: "駅行き" },
              { day: "サンセットクルーズ", time: "17:45", label: "要予約 / 桟橋集合" },
            ],
          }),
          createCard("notice", 3, {
            title: "お知らせ",
            body: "本日のSUP体験は風が強いため14:00のみ開催です。",
            variant: "warning",
          }),
          createCard("contact_hub", 4, {
            title: "ご予約・お問い合わせ",
            phone: "03-2000-1200",
            email: "resort@infomii.example",
            note: "アクティビティ変更は開始2時間前までにご連絡ください。",
          }),
        ],
      };
    case "ryokan":
      return {
        title: "温泉旅館ご案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "湯けむり旅館",
            subtitle: "食事時間と温泉ルール",
            image: "/templates/previews/ryokan/bc8ea4ce.jpg",
          }),
          createCard("schedule", 1, {
            title: "お食事時間",
            items: [
              { day: "夕食", time: "18:00-20:30", label: "会場: 2F 料亭" },
              { day: "朝食", time: "7:00-9:00", label: "会場: 1F ダイニング" },
              { day: "湯上がり処", time: "15:00-22:00", label: "甘味とお茶を提供" },
            ],
          }),
          createCard("spa", 2, {
            title: "大浴場",
            hours: "15:00-24:00 / 5:30-9:30",
            location: "1F",
            description: "刺青・泥酔での利用はご遠慮ください。",
          }),
          createCard("notice", 3, {
            title: "館内ルール",
            body: "22:00以降は客室フロアでお静かにお過ごしください。",
            variant: "info",
          }),
          createCard("faq", 4, {
            title: "よくある質問",
            items: [
              { q: "貸切風呂はありますか？", a: "有料で45分枠をご用意しています。" },
              { q: "アレルギー対応は可能ですか？", a: "3日前までのご連絡で対応可能です。" },
            ],
          }),
        ],
      };
    case "business-hotel":
      return {
        title: "ビジネスホテル案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Business Inn",
            subtitle: "チェックイン導線に特化",
            image: "/templates/previews/business/1270b91a.jpg",
          }),
          createCard("checklist", 1, {
            title: "チェックイン前確認",
            items: [
              { text: "予約名義を確認", checked: true },
              { text: "身分証をご提示", checked: false },
              { text: "朝食有無を選択", checked: false },
              { text: "領収書宛名を確認", checked: false },
            ],
          }),
          createCard("wifi", 2, {
            title: "WiFi",
            ssid: "Business-Inn",
            password: "stay-smart",
          }),
          createCard("checkout", 3, {
            title: "チェックアウト",
            time: "10:00",
            note: "延長希望は7:00までにフロントへ。",
          }),
          createCard("pageLinks", 4, {
            title: "館内クイック導線",
            columns: 2,
            items: [
              { label: "ランドリー", icon: "laundry", linkType: "page", pageSlug: "", link: "" },
              { label: "タクシー手配", icon: "taxi", linkType: "page", pageSlug: "", link: "" },
              { label: "会議室予約", icon: "info", linkType: "page", pageSlug: "", link: "" },
              { label: "領収書案内", icon: "checkout", linkType: "page", pageSlug: "", link: "" },
            ],
          }),
        ],
      };
    case "glamping":
      return {
        title: "グランピング案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Forest Glamping",
            subtitle: "持ち物と天候対応の案内",
            image: "/templates/previews/guide/acdc87e3.jpg",
          }),
          createCard("checklist", 1, {
            title: "持ち物チェック",
            items: [
              { text: "防寒着", checked: false },
              { text: "懐中電灯", checked: false },
              { text: "雨具", checked: true },
              { text: "虫よけスプレー", checked: false },
            ],
          }),
          createCard("notice", 2, {
            title: "天候案内",
            body: "強風時は焚き火エリアを18:00で終了します。",
            variant: "warning",
          }),
          createCard("faq", 3, {
            title: "よくある質問",
            items: [{ q: "ペット同伴できますか？", a: "一部テントのみ可能です。" }],
          }),
          createCard("schedule", 4, {
            title: "体験メニュー時間",
            items: [
              { day: "薪割り体験", time: "16:00", label: "共用広場" },
              { day: "星空ガイド", time: "20:30", label: "フロント集合" },
            ],
          }),
        ],
      };
    case "spa":
      return {
        title: "スパ利用案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Wellness Spa",
            subtitle: "利用時間と注意事項",
            image: "/templates/previews/guide/ce894f8e.jpg",
          }),
          createCard("spa", 1, {
            title: "サウナ・スパ",
            hours: "10:00-23:00",
            location: "2F",
            description: "最終受付 22:00",
          }),
          createCard("menu", 2, {
            title: "施術メニュー",
            items: [
              { name: "アロマ60分", price: "8,000円", description: "人気No.1" },
              { name: "ヘッド30分", price: "4,500円", description: "短時間ケア" },
              { name: "ストレッチ40分", price: "5,500円", description: "肩腰ケア" },
            ],
          }),
          createCard("notice", 3, {
            title: "ご利用前に",
            body: "高血圧・飲酒時はサウナ利用をお控えください。",
            variant: "info",
          }),
          createCard("contact_hub", 4, {
            title: "予約窓口",
            phone: "03-3100-5500",
            lineUrl: "",
            note: "当日枠の確認は電話が最短です。",
          }),
        ],
      };
    case "restaurant":
      return {
        title: "レストラン案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Restaurant Guide",
            subtitle: "注文導線をシンプルに",
            image: "/templates/previews/guide/b325ae5a.jpg",
          }),
          createCard("menu", 1, {
            title: "おすすめメニュー",
            items: [
              { name: "本日のパスタ", price: "1,200円", description: "季節野菜のトマトソース" },
              { name: "キッズプレート", price: "800円", description: "ドリンク付き" },
              { name: "グリルチキン", price: "1,450円", description: "ライス or パン付き" },
            ],
          }),
          createCard("button", 2, { label: "モバイルオーダーへ", href: "#" }),
          createCard("notice", 3, { title: "ラストオーダー", body: "フード 21:00 / ドリンク 21:30", variant: "info" }),
          createCard("coupon", 4, {
            title: "ご宿泊者限定クーポン",
            code: "DINNER10",
            expiryText: "本日22:00まで",
            notes: "モバイルオーダー時にクーポンコード入力で10%OFF",
            ctaLabel: "クーポンを使う",
            ctaUrl: "#",
          }),
        ],
      };
    case "cafe":
      return {
        title: "カフェ案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Cafe Board",
            subtitle: "日替わりと混雑案内",
            image: LP_DEMO_HERO_IMAGES.cafe,
          }),
          createCard("notice_ticker", 1, {
            title: "本日のおすすめ",
            items: ["季節のラテ 550円", "焼き菓子セット 780円", "モーニングは11:00まで", "17:00以降は席予約優先"],
            speed: "normal",
            pauseOnHover: true,
          }),
          createCard("open_status", 2, {
            title: "営業状況",
            mode: "manual",
            openNow: true,
            openLabel: "営業中",
            closedLabel: "準備中",
            hoursText: "8:00-20:00",
          }),
          createCard("social_links", 3, {
            title: "SNS",
            items: [{ label: "Instagram", href: "", handle: "@cafe_daily" }],
          }),
          createCard("pageLinks", 4, {
            title: "クイックアクション",
            columns: 2,
            items: [
              { label: "テイクアウト", icon: "checkout", linkType: "page", pageSlug: "", link: "" },
              { label: "席予約", icon: "info", linkType: "page", pageSlug: "", link: "" },
              { label: "アクセス", icon: "taxi", linkType: "page", pageSlug: "", link: "" },
              { label: "本日のメニュー", icon: "breakfast", linkType: "page", pageSlug: "", link: "" },
            ],
          }),
        ],
      };
    case "salon":
      return {
        title: "美容サロン案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Salon Menu",
            subtitle: "施術メニューと導線",
            image: "/preset-menu-hero-salon.jpg",
          }),
          createCard("menu", 1, {
            title: "施術メニュー",
            items: [
              { name: "カット", price: "4,500円", description: "シャンプー込み" },
              { name: "カラー", price: "6,800円〜", description: "長さで変動" },
              { name: "トリートメント", price: "3,200円〜", description: "髪質診断つき" },
            ],
          }),
          createCard("schedule", 2, {
            title: "予約枠",
            items: [
              { day: "平日", time: "10:00-20:00", label: "最終受付 19:00" },
              { day: "土日", time: "9:00-19:00", label: "最終受付 18:00" },
            ],
          }),
          createCard("contact_hub", 3, {
            title: "予約・お問い合わせ",
            phone: "03-0000-1111",
            lineUrl: "",
            note: "当日予約は電話がスムーズです。",
          }),
          createCard("notice", 4, {
            title: "キャンセル規定",
            body: "前日18:00以降は施術料金の50%を頂戴します。",
            variant: "warning",
          }),
        ],
      };
    case "clinic":
      return {
        title: "クリニック案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Clinic Information",
            subtitle: "受付手順と注意事項",
            image: "/template-inbound-hero-01.jpg",
          }),
          createCard("progress_steps", 1, {
            title: "受診の流れ",
            currentStep: 2,
            items: [
              { label: "受付", done: true },
              { label: "問診票", done: false },
              { label: "診察", done: false },
              { label: "会計", done: false },
            ],
          }),
          createCard("notice", 2, {
            title: "ご来院時のお願い",
            body: "発熱症状がある方は来院前に電話でご連絡ください。",
            variant: "warning",
          }),
          createCard("contact_hub", 3, {
            title: "お問い合わせ",
            phone: "03-2222-3333",
            email: "front@clinic.example.com",
            note: "平日 9:00-18:00 対応",
          }),
          createCard("faq", 4, {
            title: "初診の質問",
            items: [
              { q: "保険証は必要ですか？", a: "初診時は必ずご持参ください。" },
              { q: "Web問診はありますか？", a: "受付前にスマホで入力できます。" },
            ],
          }),
        ],
      };
    case "travel":
      return {
        title: "京都・大阪 2泊3日",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "旅行しおり",
            subtitle: "予定・MAP・持ち物をこの1ページに",
            image: LP_DEMO_HERO_IMAGES.travel,
          }),
          createCard("schedule", 1, {
            title: "日程",
            items: [
              { day: "1日目", time: "10:30", label: "京都駅 → 清水寺周辺" },
              { day: "2日目", time: "9:00", label: "伏見稲荷 → 嵐山" },
              { day: "3日目", time: "14:00", label: "大阪・心斎橋 → 帰路" },
            ],
          }),
          createCard("checklist", 2, {
            title: "持ち物",
            items: [
              { text: "ICカード・充電器", checked: true },
              { text: "歩きやすい靴", checked: true },
              { text: "雨具", checked: false },
              { text: "新幹線チケット", checked: false },
            ],
          }),
          createCard("pageLinks", 3, {
            title: "リンク",
            columns: 2,
            items: [
              { label: "宿MAP", icon: "nearby", linkType: "page", pageSlug: "", link: "" },
              { label: "予約確認", icon: "info", linkType: "page", pageSlug: "", link: "" },
              { label: "グループLINE", icon: "checkout", linkType: "page", pageSlug: "", link: "" },
              { label: "持ち物メモ", icon: "notice", linkType: "page", pageSlug: "", link: "" },
            ],
          }),
          createCard("notice", 4, {
            title: "メモ",
            body: "2日目の夕食は18:30予約。遅れる場合は連絡を。",
            variant: "info",
          }),
        ],
      };
    case "oshi":
      return {
        title: "推し活まとめ",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Summer Live Tour",
            subtitle: "遠征・グッズ・会場情報",
            image: LP_DEMO_HERO_IMAGES.oshi,
          }),
          createCard("schedule", 1, {
            title: "公演スケジュール",
            items: [
              { day: "6/14 東京", time: "開場 16:00", label: "グッズ先行 14:30〜" },
              { day: "6/21 大阪", time: "開場 17:00", label: "遠征バス 13:00発" },
              { day: "6/28 名古屋", time: "開場 16:30", label: "FC先行あり" },
            ],
          }),
          createCard("notice_ticker", 2, {
            title: "当日メモ",
            items: ["物販は開場2時間前", "公式アプリで整理券", "ペンライト色は青"],
            speed: "normal",
            pauseOnHover: true,
          }),
          createCard("social_links", 3, {
            title: "リンク",
            items: [
              { label: "公式X", href: "", handle: "@tour_official" },
              { label: "ファン垢", href: "", handle: "@oshi_memo" },
            ],
          }),
          createCard("button", 4, { label: "セットリスト予想シート", href: "#" }),
        ],
      };
    case "event":
      return {
        title: "イベント案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Design Meetup #12",
            subtitle: "会場・集合・タイムテーブル",
            image: LP_DEMO_HERO_IMAGES.event,
          }),
          createCard("schedule", 1, {
            title: "タイムテーブル",
            items: [
              { day: "受付", time: "18:30", label: "1F ロビー" },
              { day: "オープニング", time: "19:00", label: "メインホール" },
              { day: "ネットワーキング", time: "20:30", label: "軽食エリア" },
            ],
          }),
          createCard("notice", 2, {
            title: "集合について",
            body: "遅刻の方は受付で名前をお伝えください。",
            variant: "info",
          }),
          createCard("pageLinks", 3, {
            title: "関連リンク",
            columns: 2,
            items: [
              { label: "会場MAP", icon: "nearby", linkType: "page", pageSlug: "", link: "" },
              { label: "アンケート", icon: "info", linkType: "page", pageSlug: "", link: "" },
              { label: "配布資料", icon: "checkout", linkType: "page", pageSlug: "", link: "" },
              { label: "懇親会案内", icon: "breakfast", linkType: "page", pageSlug: "", link: "" },
            ],
          }),
          createCard("contact_hub", 4, {
            title: "主催への連絡",
            phone: "",
            email: "hello@meetup.example",
            note: "当日の変更はXでもお知らせします。",
          }),
        ],
      };
    case "city-hotel":
    default:
      return {
        title: "ご案内",
        bg: baseBg,
        cards: [
          createCard("hero", 0, {
            title: "Infomii Hotel",
            subtitle: "館内案内をスマートにまとめました",
            image: LP_DEMO_HERO_IMAGES.hotel,
          }),
          createCard("notice", 1, {
            title: "お知らせ",
            body: "客室清掃は10:00-14:00に実施します。",
            variant: "info",
          }),
          createCard("pageLinks", 2, {
            title: "メニュー",
            columns: 2,
            items: [
              { label: "WiFi", icon: "wifi", linkType: "page", pageSlug: "", link: "" },
              { label: "朝食時間", icon: "breakfast", linkType: "page", pageSlug: "", link: "" },
              { label: "チェックアウト", icon: "checkout", linkType: "page", pageSlug: "", link: "" },
              { label: "館内マップ", icon: "nearby", linkType: "page", pageSlug: "", link: "" },
            ],
          }),
          createCard("schedule", 3, {
            title: "営業時間",
            items: [
              { day: "フロント", time: "24時間", label: "内線 9 で対応" },
              { day: "朝食会場", time: "6:30-10:00", label: "1F ダイニング" },
            ],
          }),
          createCard("contact_hub", 4, {
            title: "お問い合わせ",
            phone: "03-1111-2222",
            email: "front@infomii.example.com",
            note: "滞在中のご要望はチャット・電話で24時間受付",
          }),
        ],
      };
  }
}

function isTemplateVariant(value: string | null): value is TemplateVariant {
  return !!value && TEMPLATE_VARIANTS.includes(value as TemplateVariant);
}

function isEditorCardArray(value: unknown): value is EditorCard[] {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && "id" in item && "type" in item);
}

function normalizeBackground(value: unknown): PageBackgroundStyle | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  return {
    mode: raw.mode === "gradient" ? "gradient" : "solid",
    color: typeof raw.color === "string" ? raw.color : "#ffffff",
    from: typeof raw.from === "string" ? raw.from : "#ffffff",
    to: typeof raw.to === "string" ? raw.to : "#ffffff",
    angle: typeof raw.angle === "number" ? raw.angle : 180,
  };
}

export default function DemoGuestLivePage() {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";
  const variantParam = searchParams.get("variant");
  const templateVariant: TemplateVariant | null = isTemplateVariant(variantParam) ? variantParam : null;
  const variantPreset = templateVariant ? variantCardsAndBg(templateVariant) : null;
  // Keep first render identical between server/client to avoid hydration mismatch.
  const [liveCards, setLiveCards] = useState<EditorCard[]>(FALLBACK_CARDS);
  const [livePageBackground, setLivePageBackground] = useState<PageBackgroundStyle>(FALLBACK_BG);
  const cards = variantPreset?.cards ?? liveCards;
  const pageBackground = variantPreset?.bg ?? livePageBackground;

  const syncFromDemoStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        cards?: unknown;
        background?: unknown;
      };
      if (isEditorCardArray(parsed.cards) && parsed.cards.length > 0) {
        setLiveCards(parsed.cards);
      }
      const bg = normalizeBackground(parsed.background);
      if (bg) setLivePageBackground(bg);
    } catch {
      // ignore malformed demo data
    }
  }, []);

  useEffect(() => {
    if (variantPreset) return;
    const initialSyncId = window.setTimeout(syncFromDemoStorage, 0);
    const onFocus = () => syncFromDemoStorage();
    const onStorage = (event: StorageEvent) => {
      if (event.key == null || event.key === DEMO_STORAGE_KEY) syncFromDemoStorage();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(syncFromDemoStorage, 1200);
    return () => {
      window.clearTimeout(initialSyncId);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [syncFromDemoStorage, variantPreset]);

  return (
    <GuestCardPageView
      title={variantPreset?.title ?? "ご案内"}
      cards={cards}
      initialLocale="ja"
      localeLocked
      isEmbed={isEmbed}
      disableInteractions={isEmbed}
      pageBackground={pageBackground}
      localeToggleHint="Businessプラン加入時は、言語トグルでページ全体を一括翻訳できます。"
      disableLocaleSwitch
    />
  );
}
