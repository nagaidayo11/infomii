import type { CardType, EditorCard } from "@/components/editor/types";
import type { PageBackgroundStyle } from "@/lib/storage";

const IMG = {
  cover: "/demo/akari/akari-cover-door.jpg",
  room: "/demo/akari/akari-poster-room.jpg",
  breakfast: "/demo/akari/akari-poster-breakfast.jpg",
  bath: "/demo/akari/akari-poster-bath.jpg",
  dinner: "/demo/akari/akari-poster-dinner.jpg",
  street: "/demo/akari/akari-poster-street.jpg",
  park: "/demo/akari/akari-park.jpg",
  cafe: "/demo/akari/akari-cafe.jpg",
  lounge: "/demo/akari/akari-lounge.jpg",
  mark: "/demo/akari/akari-mark.jpg",
} as const;

const ACCENT = "#e8b086";

export const AKARI_PAGE_IDS = [
  "home",
  "wifi",
  "breakfast",
  "bath",
  "dine",
  "area",
  "checkout",
] as const;

export type AkariPageId = (typeof AKARI_PAGE_IDS)[number];

export type AkariPreset = {
  title: string;
  currentSlug: AkariPageId;
  cards: EditorCard[];
  bg: PageBackgroundStyle;
  brandLogoSrc: string;
  showLocaleToggle: boolean;
  contentInset: "default" | "flush";
};

export const AKARI_BG: PageBackgroundStyle = {
  mode: "solid",
  color: "#120e0b",
  from: "#120e0b",
  to: "#120e0b",
  angle: 180,
};

function pageHref(page: AkariPageId): string {
  return `/demo/guest-live?variant=akari&page=${page}`;
}

function card(type: CardType, order: number, content: Record<string, unknown>): EditorCard {
  return {
    id: `akari-${type}-${order}`,
    type,
    order,
    content,
    style: {},
  };
}

function poster(label: string, src: string, page: AkariPageId) {
  return {
    src,
    label,
    alt: label,
    linkType: "url" as const,
    pageSlug: "",
    link: pageHref(page),
  };
}

function isAkariPage(value: string): value is AkariPageId {
  return (AKARI_PAGE_IDS as readonly string[]).includes(value);
}

function homeCards(): EditorCard[] {
  return [
    card("editorialCover", 0, {
      kicker: "Kiyosumi Shirakawa",
      title: "今夜は、灯のそばで",
      fact: "大浴場 〜23:00　·　朝食 7:00　·　内線 9",
      image: IMG.cover,
      imageAlt: "客室の灯",
      size: "cover",
      href: "",
      widthMode: "full",
    }),
    card("image_tiles", 1, {
      title: "",
      columns: 2,
      showLabels: true,
      layout: "poster",
      items: [
        poster("朝ごはん", IMG.breakfast, "breakfast"),
        poster("湯", IMG.bath, "bath"),
        poster("食卓", IMG.dinner, "dine"),
        poster("このまち", IMG.street, "area"),
        poster("つながる", IMG.room, "wifi"),
        poster("出発", IMG.lounge, "checkout"),
      ],
    }),
    card("quote", 2, {
      quote: "鍵を閉めたあとの、いちばん長い時間のために。",
      author: "ホテル灯",
    }),
  ];
}

function wifiCards(): EditorCard[] {
  return [
    card("editorialCover", 0, {
      kicker: "Signal",
      title: "つながる、すぐ。",
      fact: "Akari-Guest　·　light-stay",
      image: IMG.room,
      imageAlt: "客室",
      size: "chapter",
      href: "",
      widthMode: "full",
    }),
    card("wifi", 1, {
      title: "客室Wi-Fi",
      ssid: "Akari-Guest",
      password: "light-stay",
      description: "小文字とハイフン。客室・ロビー・湯殿前。",
    }),
    card("iconAccordion", 2, {
      title: "つながらない",
      columns: 1,
      iconSize: "md",
      styleVariant: "list",
      accentColor: ACCENT,
      items: [
        { label: "機内モード", icon: "wifi", description: "5秒", body: "オンにしてオフ。Wi-Fiを入れ直す。" },
        { label: "VPN", icon: "info", description: "切る", body: "社用VPNがオンだと認証に失敗します。" },
        { label: "台数", icon: "phone", description: "3台まで", body: "4台目はどれかを切ってから。" },
        { label: "内線9", icon: "phone", description: "部屋番号を", body: "それでもダメならフロントへ。" },
      ],
    }),
  ];
}

function breakfastCards(): EditorCard[] {
  return [
    card("editorialCover", 0, {
      kicker: "Breakfast",
      title: "7時の、静かな席。",
      fact: "1F ダイニング　·　7:00–10:00　·　最終 9:30",
      image: IMG.breakfast,
      imageAlt: "朝食",
      size: "cover",
      href: "",
      widthMode: "full",
    }),
    card("quote", 1, {
      quote: "空いているのは、まだ空が暗い時間。",
      author: "7:00–7:40",
    }),
    card("breakfast_crowd", 2, {
      title: "いま",
      level: "open",
      note: "空いているのは 7:00–7:40。8時は会社員で埋まります。",
      updatedAt: new Date().toISOString(),
    }),
    card("menu", 3, {
      title: "きょうの皿",
      items: [
        { name: "灯の和定食", price: "無料", description: "焼き魚と小鉢", imageSrc: IMG.breakfast },
        { name: "パンとスープ", price: "無料", description: "本日のパン" },
        { name: "子どもの皿", price: "無料", description: "果物つき" },
      ],
    }),
  ];
}

function bathCards(): EditorCard[] {
  return [
    card("editorialCover", 0, {
      kicker: "Bath",
      title: "湯気の、いちばん静かな時間。",
      fact: "15:00–24:00 / 6:00–9:00　·　1F 奥　·　男女別",
      image: IMG.bath,
      imageAlt: "檜風呂",
      size: "cover",
      href: "",
      widthMode: "full",
    }),
    card("quote", 1, {
      quote: "一番静かなのは、閉館の直前。",
      author: "23:00 近く",
    }),
    card("spa_crowd", 2, {
      title: "いま",
      level: "open",
      note: "21時がピーク。23時近くは空きます。",
      updatedAt: new Date().toISOString(),
    }),
    card("iconAccordion", 3, {
      title: "入り方",
      columns: 1,
      iconSize: "md",
      styleVariant: "list",
      accentColor: ACCENT,
      items: [
        { label: "先に洗う", icon: "spa", description: "浴槽の外", body: "かけ湯をしてから。石鹸は洗い場だけ。" },
        { label: "タオル", icon: "info", description: "湯に入れない", body: "頭に乗せるのは構いません。" },
        { label: "飲酒", icon: "notice", description: "お断り", body: "酔っての入浴はご遠慮ください。" },
        { label: "タトゥー", icon: "info", description: "カバー可", body: "小さく隠せる場合は利用可。迷ったら内線9。" },
      ],
    }),
  ];
}

function dineCards(): EditorCard[] {
  return [
    card("editorialCover", 0, {
      kicker: "Dinner",
      title: "部屋着のまま、1階へ。",
      fact: "17:30–21:30　·　最終 21:00　·　火曜休",
      image: IMG.dinner,
      imageAlt: "夕食",
      size: "cover",
      href: "",
      widthMode: "full",
    }),
    card("quote", 1, {
      quote: "部屋着のまま、1階へ降りてください。",
      author: "火曜休",
    }),
    card("menu", 2, {
      title: "今夜",
      items: [
        { name: "本日の焼き魚", price: "2,400円", description: "炊き込みご飯", imageSrc: IMG.dinner },
        { name: "灯の定食", price: "1,900円", description: "汁物と小鉢" },
        { name: "子どもの皿", price: "900円", description: "18時まで" },
      ],
    }),
  ];
}

function areaCards(): EditorCard[] {
  return [
    card("editorialCover", 0, {
      kicker: "The neighborhood",
      title: "雨の夜も、歩きたくなる。",
      fact: "門を出て右へ3分。提灯の通りです。",
      image: IMG.street,
      imageAlt: "夜の街",
      size: "cover",
      href: "",
      widthMode: "full",
    }),
    card("quote", 1, {
      quote: "門を出て、提灯の多いほうへ。",
      author: "右へ3分",
    }),
    card("image_tiles", 2, {
      title: "",
      columns: 2,
      showLabels: true,
      layout: "poster",
      items: [
        { src: IMG.park, label: "清澄庭園 8分", alt: "庭園", linkType: "url", pageSlug: "", link: "https://maps.google.com/?q=清澄庭園" },
        { src: IMG.cafe, label: "朝のコーヒー 4分", alt: "カフェ", linkType: "url", pageSlug: "", link: "https://maps.google.com/?q=清澄白河 カフェ" },
      ],
    }),
    card("dayTimeline", 3, {
      title: "半日",
      accentColor: ACCENT,
      items: [
        { time: "9:00", title: "清澄庭園", description: "開園すぐ。" },
        { time: "11:00", title: "コーヒー", description: "商店街側。" },
        { time: "15:00", title: "隅田川", description: "風が強い日は戻る。" },
        { time: "18:00", title: "灯の食卓", description: "部屋着でどうぞ。" },
      ],
    }),
  ];
}

function checkoutCards(): EditorCard[] {
  return [
    card("editorialCover", 0, {
      kicker: "Departure",
      title: "11時までに、ロビーへ。",
      fact: "鍵は左手の箱。荷物は当日預かります。",
      image: IMG.lounge,
      imageAlt: "ラウンジ",
      size: "chapter",
      href: "",
      widthMode: "full",
    }),
    card("quote", 1, {
      quote: "鍵は、ロビー左手の箱へ。",
      author: "11:00 まで",
    }),
    card("steps", 2, {
      title: "出発",
      items: [
        { title: "部屋", description: "充電器・洗面台・ハンガーの奥。" },
        { title: "冷蔵庫", description: "有料分は自動精算。" },
        { title: "鍵", description: "ロビー左手。" },
      ],
    }),
    card("taxi", 3, {
      title: "タクシー",
      companyName: "日本交通",
      phone: "03-5755-1515",
      note: "清澄通り側。フロントでも呼べます。",
    }),
  ];
}

const PAGE_BUILDERS: Record<AkariPageId, { title: string; cards: () => EditorCard[] }> = {
  home: { title: "灯", cards: homeCards },
  wifi: { title: "Wi-Fi", cards: wifiCards },
  breakfast: { title: "朝", cards: breakfastCards },
  bath: { title: "湯", cards: bathCards },
  dine: { title: "食卓", cards: dineCards },
  area: { title: "まち", cards: areaCards },
  checkout: { title: "出発", cards: checkoutCards },
};

export function getAkariPreset(pageParam: string | null): AkariPreset {
  const page: AkariPageId = pageParam && isAkariPage(pageParam) ? pageParam : "home";
  const built = PAGE_BUILDERS[page];
  return {
    title: built.title,
    currentSlug: page,
    cards: built.cards(),
    bg: AKARI_BG,
    brandLogoSrc: IMG.mark,
    showLocaleToggle: true,
    contentInset: "flush",
  };
}
