import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import LpRevealObserver from "@/components/lp-reveal-observer";
import VoiceLogo from "@/components/voice-logo";
import { starterTemplates } from "@/lib/templates";
import type { InformationBlock } from "@/types/information";

function optimizePreviewImageUrl(url: string): string {
  const value = url.trim();
  if (!value) {
    return value;
  }
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    if (host.includes("images.unsplash.com")) {
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("w", "960");
      parsed.searchParams.set("q", "72");
      return parsed.toString();
    }
    if (host.includes("images.pexels.com") || host.includes("cdn.pixabay.com")) {
      parsed.searchParams.set("w", "960");
      parsed.searchParams.set("h", "540");
      parsed.searchParams.set("fit", "crop");
      return parsed.toString();
    }
  } catch {
    return value;
  }
  return value;
}

function renderTemplatePreviewIcon(icon: string | undefined): ReactNode {
  if (!icon) {
    return <span className="text-base leading-none">⭐</span>;
  }
  if (!icon.startsWith("svg:")) {
    return <span className="text-base leading-none">{icon}</span>;
  }
  const className = "h-4 w-4 text-slate-700";
  if (icon === "svg:clock") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    );
  }
  if (icon === "svg:map-pin") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    );
  }
  if (icon === "svg:wifi") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4.5 9.5a11 11 0 0 1 15 0" />
        <path d="M7.5 12.5a7 7 0 0 1 9 0" />
        <path d="M10.5 15.5a3 3 0 0 1 3 0" />
        <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (icon === "svg:car") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13h16l-1.5-4h-13L4 13Z" />
        <path d="M5 13v4h2" />
        <path d="M17 17h2v-4" />
        <circle cx="8" cy="17" r="1.6" />
        <circle cx="16" cy="17" r="1.6" />
      </svg>
    );
  }
  if (icon === "svg:bell") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 17h8l-1-2v-4a3 3 0 1 0-6 0v4l-1 2Z" />
        <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
      </svg>
    );
  }
  if (icon === "svg:utensils") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 4v8" />
        <path d="M5 4v4" />
        <path d="M9 4v4" />
        <path d="M7 12v8" />
        <path d="M16 4c1.5 2.5 1.5 5.5 0 8v8" />
      </svg>
    );
  }
  if (icon === "svg:bath") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 12h14v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3Z" />
        <path d="M8 12V8a2 2 0 1 1 4 0" />
      </svg>
    );
  }
  if (icon === "svg:phone") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3h4l1 4-2 1.5a14 14 0 0 0 6 6L16.5 12l4 1v4l-2 2a3 3 0 0 1-3 .7A18 18 0 0 1 4.3 8.5 3 3 0 0 1 5 5.5L6 3Z" />
      </svg>
    );
  }
  if (icon === "svg:key") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="8.5" cy="12" r="3.2" />
        <path d="M11.7 12H20" />
        <path d="M16 12v2" />
        <path d="M18 12v1.5" />
      </svg>
    );
  }
  if (icon === "svg:toothbrush") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 18.5h6.5a2.5 2.5 0 0 0 2.3-1.5L20 4.5" />
        <path d="M17.8 3.8 20.2 6.2" />
        <path d="M5.5 16.5h3.5" />
      </svg>
    );
  }
  if (icon === "svg:hanger") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 7a2 2 0 1 0-2-2" />
        <path d="M10 7.2 4.5 14a2 2 0 0 0 1.6 3.3h11.8a2 2 0 0 0 1.6-3.3L14 7.2" />
      </svg>
    );
  }
  if (icon === "svg:broom") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 19h9" />
        <path d="M14 5 9 10" />
        <path d="m8 11 4.5 4.5a2 2 0 0 1 0 2.8L11.8 19H6.5" />
      </svg>
    );
  }
  if (icon === "svg:washing-machine") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="3.5" width="14" height="17" rx="2" />
        <circle cx="12" cy="13" r="4" />
        <path d="M8 6.8h.01M10.5 6.8h.01" />
      </svg>
    );
  }
  if (icon === "svg:microwave") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="5" width="17" height="14" rx="2" />
        <rect x="6.5" y="8" width="9" height="8" rx="1" />
        <path d="M18 8v8M19 9v.01M19 12v.01M19 15v.01" />
      </svg>
    );
  }
  if (icon === "svg:package") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4.5 8.5 12 4l7.5 4.5v7L12 20l-7.5-4.5v-7Z" />
        <path d="M12 20v-7.5M4.5 8.5 12 13l7.5-4.5" />
      </svg>
    );
  }
  if (icon === "svg:taxi") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 13h14l-1.6-4.5H6.6L5 13Z" />
        <path d="M7.5 8.5 9 6h6l1.5 2.5" />
        <circle cx="8" cy="17" r="1.6" />
        <circle cx="16" cy="17" r="1.6" />
        <path d="M6 13v4M18 13v4" />
      </svg>
    );
  }
  if (icon === "svg:bed") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3.5 18.5h17" />
        <path d="M5 18.5V9.5h14v9" />
        <rect x="6.5" y="11" width="4.5" height="3" rx="1" />
      </svg>
    );
  }
  if (icon === "svg:info") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 10v5" />
        <path d="M12 7.5h.01" />
      </svg>
    );
  }
  return <span className="text-base leading-none">⭐</span>;
}

function TemplateScreenPreview({ blocks }: { blocks?: InformationBlock[] }) {
  const previewBlocks = (blocks ?? []).slice(0, 18);
  if (previewBlocks.length === 0) {
    return <div className="h-64 rounded-xl border border-slate-200 bg-slate-50" />;
  }

  return (
    <div className="relative h-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
      <p className="pointer-events-none absolute right-2 top-2 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
        スクロールで詳細
      </p>
      <div className="template-preview-scroll h-full space-y-2 overflow-y-auto pr-1 pb-8">
        {previewBlocks.map((block, index) => {
          if (block.type === "title" || block.type === "heading") {
            return (
              <p key={block.id} className="text-sm font-semibold text-slate-900">
                {block.text || "タイトル"}
              </p>
            );
          }
          if (block.type === "paragraph") {
            return (
              <p key={block.id} className="line-clamp-4 text-xs leading-5 text-slate-700">
                {block.text || ""}
              </p>
            );
          }
          if (block.type === "image" && block.url) {
            if (index > 10) {
              return null;
            }
            return (
              <Image
                key={block.id}
                src={optimizePreviewImageUrl(block.url)}
                alt="template preview"
                width={720}
                height={360}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 320px"
                className="h-20 w-full rounded-lg border border-slate-200 object-cover"
              />
            );
          }
          if (block.type === "iconRow") {
            const isRoundIconRow = block.cardRadius === "full";
            return (
              <div key={block.id} className="grid grid-cols-3 gap-1">
                {(block.iconItems ?? []).slice(0, 12).map((entry) => (
                  <div key={entry.id} className={`border border-slate-200 bg-slate-50 px-1 py-1.5 text-center ${isRoundIconRow ? "rounded-full" : "rounded-md"}`}>
                    <div className="flex justify-center leading-none">{renderTemplatePreviewIcon(entry.icon)}</div>
                    <p className="mt-1 truncate text-[9px] text-slate-700">{entry.label || "項目"}</p>
                  </div>
                ))}
              </div>
            );
          }
          if (block.type === "hours" || block.type === "pricing") {
            const items = block.type === "hours" ? block.hoursItems ?? [] : block.pricingItems ?? [];
            return (
              <div key={block.id} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                {items.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-2 text-[11px] text-slate-700">
                    <span className="truncate">{entry.label || "-"}</span>
                    <span className="shrink-0 font-medium">{entry.value || "-"}</span>
                  </div>
                ))}
              </div>
            );
          }
          if (block.type === "section") {
            return (
              <div key={block.id} className="rounded-md border border-slate-200 bg-slate-50 p-2">
                <p className="text-[11px] font-semibold text-slate-800">{block.sectionTitle || "セクション"}</p>
                <p className="line-clamp-4 text-[10px] text-slate-600">{block.sectionBody || ""}</p>
              </div>
            );
          }
          if (block.type === "cta") {
            return (
              <div key={block.id} className="inline-flex rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                {block.ctaLabel || "ボタン"}
              </div>
            );
          }
          if (block.type === "badge") {
            return (
              <span key={block.id} className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                {block.badgeText || "バッジ"}
              </span>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

type HomePageProps = {
  searchParams: Promise<{
    ab?: string;
    scene?: string;
    src?: string;
    utm_source?: string;
    lp?: string;
    win?: string;
    tag?: string;
    kw?: string;
  }>;
};
type SeasonKey = "spring" | "summer" | "autumn" | "winter";
type SearchSource = "search" | "sns" | "direct";

export default async function Home({ searchParams }: HomePageProps) {
  const query = await searchParams;
  const sourceChannelRaw = query.src ?? query.utm_source ?? "";
  const sourceChannel = sourceChannelRaw.trim().toLowerCase();
  const normalizedSourceChannel = sourceChannel === "ig" ? "instagram" : sourceChannel;
  const sourceType: SearchSource =
    sourceChannel.includes("google") || sourceChannel.includes("yahoo") || sourceChannel.includes("search")
      ? "search"
      : sourceChannel.length > 0
        ? "sns"
        : "direct";
  const lpCompactMode = true;
  const month = new Date().getMonth() + 1;
  const season: SeasonKey =
    month >= 3 && month <= 5
      ? "spring"
      : month >= 6 && month <= 8
        ? "summer"
        : month >= 9 && month <= 11
          ? "autumn"
          : "winter";
  const heroScene = query.scene === "bath" || query.scene === "breakfast" ? query.scene : "checkin";
  const keyword = query.kw === "checkin" || query.kw === "bath" || query.kw === "breakfast" || query.kw === "wifi"
    ? query.kw
    : "checkin";
  const landingPage = query.lp === "business" || query.lp === "resort" || query.lp === "spa" ? query.lp : "business";
  const winnerVariantByLandingPage = {
    business: "a",
    resort: "b",
    spa: "b",
  } as const;
  const ctaVariant = winnerVariantByLandingPage[landingPage];
  const sanitizedSourceChannel = sourceChannel.length > 0 ? sourceChannel : "unknown";
  const buildLoginHref = (ref: "lp-hero" | "lp-sticky" | "lp-bottom") =>
    `/login?ref=${ref}&ab=${ctaVariant}&scene=${heroScene}&src=${encodeURIComponent(sanitizedSourceChannel)}&lp=${landingPage}&kw=${keyword}`;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@informe.jp";
  const proMonthlyPriceRaw = Number(process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE ?? "1980");
  const proMonthlyPrice = Number.isFinite(proMonthlyPriceRaw) && proMonthlyPriceRaw > 0 ? proMonthlyPriceRaw : 1980;
  const proMonthlyPriceLabel = `¥${new Intl.NumberFormat("ja-JP").format(proMonthlyPrice)}`;
  const heroCopyByScene = {
    checkin: {
      title: "チェックイン導線を3分で公開",
      subtitle: "フロント問い合わせを減らす案内ページを即時反映",
      body: "チェックイン案内、深夜到着対応、館内設備導線を1ページに集約。現場の更新作業を最短化します。",
    },
    bath: {
      title: "温浴案内を迷わず共有",
      subtitle: "利用時間・注意事項をその場で更新",
      body: "大浴場・貸切風呂の案内を二次元コードで即配布。混雑時の導線変更にもすぐ対応できます。",
    },
    breakfast: {
      title: "朝食導線を一括管理",
      subtitle: "会場・時間・注意事項を統一表示",
      body: "営業時間、会場案内、アレルギー注意を1ページ化。朝の案内負荷を下げて運用を安定させます。",
    },
  } as const;
  const heroCopy = heroCopyByScene[heroScene];
  const heroCtaLabelByVariant = {
    a: landingPage === "business" ? "30秒で無料登録してチェックイン案内を作成" : landingPage === "resort" ? "30秒で無料登録して滞在案内を作成" : "30秒で無料登録して温浴案内を作成",
    b: landingPage === "business" ? "30秒で無料登録して夜間案内を公開" : landingPage === "resort" ? "30秒で無料登録して導線案内を公開" : "30秒で無料登録して温浴案内を公開",
    c: landingPage === "business" ? "30秒で無料登録してフロント運用を改善" : landingPage === "resort" ? "30秒で無料登録して滞在導線を整備" : "30秒で無料登録して温浴運用を整備",
  } as const;
  const heroPrimaryCtaLabel = heroCtaLabelByVariant[ctaVariant];
  const channelCtaSuffix =
    normalizedSourceChannel === "x"
      ? "（X投稿向け）"
      : normalizedSourceChannel === "instagram"
        ? "（Instagram向け）"
        : normalizedSourceChannel === "tiktok"
          ? "（TikTok向け）"
          : "";
  const optimizedHeroPrimaryCtaLabel = `${heroPrimaryCtaLabel}${channelCtaSuffix}`;
  const heroCtaShortLabelByVariant = {
    a: "30秒で無料登録",
    b: "30秒で無料登録",
    c: "30秒で無料登録",
  } as const;
  const heroPrimaryShortCtaLabel = heroCtaShortLabelByVariant[ctaVariant];
  const bottomCtaByLandingPage = {
    business: "無料登録してチェックイン導線を公開",
    resort: "無料登録して滞在導線を公開",
    spa: "無料登録して温浴導線を公開",
  } as const;
  const anxietyReliefByLanding = {
    business: [
      "専門知識なしでもテンプレから3分公開",
      "深夜到着導線を先に配置して問い合わせを抑制",
      "更新はテキスト差し替えだけで運用可能",
    ],
    resort: [
      "滞在導線テンプレを選ぶだけで初期構成が完成",
      "アクティビティ・プール案内を同時に公開",
      "季節イベント時の差し替えを画面内で完結",
    ],
    spa: [
      "温浴ルール/注意事項を初期値つきで配置",
      "混雑時の導線変更を即時反映して配布",
      "貸切風呂/利用時間の案内漏れを防止",
    ],
  } as const;

  const metrics = [
    { label: "初回公開まで", value: "最短3分", sub: "テンプレ選択→編集→公開" },
    { label: "更新反映", value: "即時", sub: "現場変更をそのまま反映" },
    { label: "対象運用", value: "ホテル特化", sub: "館内案内・温浴案内・客室導線" },
    { label: "運用導線", value: "1QR", sub: "入口ページから案内を集約" },
  ];

  const useCases = [
    {
      title: "ビジネスホテル",
      items: ["チェックイン/アウト案内", "館内設備・Wi-Fi情報", "深夜到着ゲスト対応"],
    },
    {
      title: "リゾートホテル",
      items: ["アクティビティ案内", "プール・スパ案内", "滞在中の導線集約"],
    },
    {
      title: "温浴併設ホテル",
      items: ["大浴場・貸切風呂案内", "混雑時の誘導案内", "利用ルールの共有"],
    },
  ];
  const hotelVoices = [
    {
      brandMark: "CB",
      brandTone: "from-slate-700 to-slate-500",
      logoSrc: "/logos/city-business-hotel",
      hotel: "都心ビジネスホテル（120室）",
      comment: "深夜チェックインの問い合わせが減って、フロント1名体制でも回せるようになりました。",
      impact: "導入3日で夜間電話対応を削減",
    },
    {
      brandMark: "RS",
      brandTone: "from-emerald-700 to-emerald-500",
      logoSrc: "/logos/resort-spa-hotel",
      hotel: "温浴併設リゾート（客室80室）",
      comment: "温浴ルールの更新を即反映できるので、紙案内差し替えの手間がほぼ無くなりました。",
      impact: "案内差し替え時間を週2時間削減",
    },
    {
      brandMark: "ST",
      brandTone: "from-cyan-700 to-cyan-500",
      logoSrc: "/logos/station-town-hotel",
      hotel: "駅前ホテル（客室65室）",
      comment: "朝食会場案内を統一して、スタッフ説明のばらつきが減りました。",
      impact: "朝ピークの案内対応を標準化",
    },
  ];

  const publicExamples: Array<{
    title: string;
    tag: string;
    pain: string;
    solution: string;
    impact: string;
    impactScore: number;
    industryTag: "business" | "resort" | "spa";
    seasonTags: SeasonKey[];
    template: (typeof starterTemplates)[number];
    bullets: string[];
    publishPath: string;
  }> = [
    {
      title: "トップメニューハブページ",
      tag: "アイコン導線",
      pain: "案内項目が分散してゲストが目的情報に辿り着きにくい",
      solution: "円形アイコンを大量配置したトップメニューで導線を集約",
      impact: "初動の自己解決率を高め、フロント案内負荷を軽減",
      impactScore: 42,
      industryTag: "business" as const,
      seasonTags: ["spring", "summer", "autumn", "winter"],
      template:
        starterTemplates.find((entry) => entry.title === "【ホテル共通】トップ案内ハブ（円形アイコン12）") ??
        starterTemplates.find((entry) => entry.title.startsWith("【ホテル共通】トップ案内ハブ（円形アイコン")) ??
        starterTemplates[0],
      bullets: ["主要導線を3列アイコンで一覧化", "Wi-Fi/清掃/駐車場など定番導線を即アクセス"],
      publishPath: "/p/demo-hub-menu",
    },
    {
      title: "温浴利用ガイドページ",
      tag: "温浴導線",
      pain: "利用ルールの説明がスタッフ依存",
      solution: "温浴時間・注意事項・予約導線を集約",
      impact: "案内差し替え時間を週2h削減",
      impactScore: 35,
      industryTag: "spa" as const,
      seasonTags: ["autumn", "winter"],
      template:
        starterTemplates.find((entry) => entry.title === "【旅館】大浴場・貸切風呂のご案内") ??
        starterTemplates[3],
      bullets: ["利用時間と注意事項を可視化", "貸切風呂予約導線を明確化", "入浴前ルールを1画面で統一"],
      publishPath: "/p/demo-bath",
    },
    {
      title: "アクティビティ予約ページ",
      tag: "滞在体験導線",
      pain: "体験プログラムの案内が口頭中心で予約漏れが発生",
      solution: "時間帯・料金・予約導線を1ページで見える化",
      impact: "現地案内を減らし、体験予約率を向上",
      impactScore: 33,
      industryTag: "resort" as const,
      seasonTags: ["spring", "summer"],
      template:
        starterTemplates.find((entry) => entry.title === "【リゾートホテル】滞在アクティビティ案内") ??
        starterTemplates[3],
      bullets: ["アクティビティ案内と予約導線を集約", "雨天時の代替案内まで同時配信", "当日変更を即時反映"],
      publishPath: "/p/demo-activity",
    },
  ];
  const sortedPublicExamples = [...publicExamples].sort((a, b) => {
    const seasonScore = (example: (typeof publicExamples)[number]) => (example.seasonTags.includes(season) ? 3 : 0);
    const landingScore = (example: (typeof publicExamples)[number]) => (example.industryTag === landingPage ? 2 : 0);
    const totalA = seasonScore(a) + landingScore(a);
    const totalB = seasonScore(b) + landingScore(b);
    if (totalA !== totalB) return totalB - totalA;
    if (a.impactScore !== b.impactScore) return b.impactScore - a.impactScore;
    return a.title.localeCompare(b.title, "ja");
  });
  const fixedImpactCards = [
    { label: "更新時間削減", value: "最大70%" },
    { label: "問い合わせ削減", value: "最大40%" },
    { label: "初回公開時間", value: "最短3分" },
  ];
  const exampleThemeByIndustry = {
    business: {
      cardBorder: "border-cyan-200",
      chip: "bg-cyan-100 text-cyan-800",
      subtitle: "チェックイン / フロント導線",
    },
    resort: {
      cardBorder: "border-amber-200",
      chip: "bg-amber-100 text-amber-800",
      subtitle: "アクティビティ / 滞在体験導線",
    },
    spa: {
      cardBorder: "border-emerald-200",
      chip: "bg-emerald-100 text-emerald-800",
      subtitle: "温浴 / 施設ルール導線",
    },
  } as const;

  const features = [
    {
      title: "ブロックエディタ",
      desc: "テキスト・画像・アイコン・料金表をドラッグ追加して編集。",
    },
    {
      title: "スマホプレビュー",
      desc: "編集と同時に表示を確認。公開前チェックで事故を予防。",
    },
    {
      title: "公開URL / QR発行",
      desc: "保存後にすぐ配布。紙運用にもそのまま利用可能。",
    },
    {
      title: "ノード連携（Pro）",
      desc: "1つの入口ページから複数ページへ自然遷移。",
    },
    {
      title: "閲覧分析（7日）",
      desc: "公開後の閲覧数・QR流入を見える化して改善サイクルを回せます。",
    },
    {
      title: "監査ログ",
      desc: "公開・削除・設定変更の履歴を時系列で追跡。",
    },
  ];

  const flow = [
    {
      step: "01",
      title: "テンプレを選ぶ",
      desc: "業種に合わせた構成を選択。白紙からでも開始できます。",
    },
    {
      step: "02",
      title: "必要情報を入力",
      desc: "見出し・画像・アイコン・料金などをその場で編集。",
    },
    {
      step: "03",
      title: "公開とQR発行",
      desc: "公開後すぐにURL/QRを配布して運用開始。",
    },
  ];

  const faqItems = [
    {
      q: "夜間帯の無人運用でも使えますか？",
      a: "使えます。セルフチェックイン案内、緊急連絡先、館内導線を1ページにまとめて運用できます。",
    },
    {
      q: "スタッフ間で更新を共有できますか？",
      a: "はい。管理画面から同じ施設のページを共同運用できるため、担当者依存を減らせます。",
    },
    {
      q: "多言語案内にも対応できますか？",
      a: "1施設内でページを分けて多言語案内を作成できます。ノード連携を使うと入口ページから言語別に遷移させられます。",
    },
    {
      q: "無料から有料に切り替えるタイミングは？",
      a: "まず無料で運用開始し、公開ページ数や導線連携が必要になった段階でProへ切り替える運用が一般的です。",
    },
  ];
  const searchOptimizedFaq = sourceType === "search"
    ? [
        {
          q: "ホテル案内ページ作成SaaSは無料で始められますか？",
          a: "はい。InfomiiはFreeプラン¥0から開始できます。必要になった時のみProへ切り替え可能です。",
        },
        {
          q: "チェックイン案内を最短で公開する方法は？",
          a: "テンプレ選択→必要項目入力→公開の3ステップで、最短3分で公開できます。",
        },
        {
          q: "QR運用は何を準備すればよいですか？",
          a: "公開後にURL/QRを発行し、A4テンプレで掲示すればそのまま運用開始できます。",
        },
      ]
    : faqItems;

  const impactStats = [
    { label: "更新時間の削減", value: "最大70%", sub: "紙・PDF運用から移行した場合の目安" },
    { label: "案内差し替え時間", value: "最短1分", sub: "テキスト更新のみの場合" },
    { label: "公開ミス検知", value: "自動", sub: "公開前チェックで不足項目を警告" },
  ];

  const compareRows = [
    { item: "月額料金（税込）", free: "¥0", pro: `${proMonthlyPriceLabel}` },
    { item: "案内ミス時の損失", free: "紙/PDF差し替え遅延", pro: "即時更新で機会損失を抑制" },
    { item: "公開ページ上限", free: "小規模向け", pro: "拡張可能（繁忙期に強い）" },
    { item: "複数ページ連携", free: "-", pro: "ノードマップ対応（導線漏れ防止）" },
    { item: "運用継続リスク", free: "担当者依存になりやすい", pro: "運用センターで復旧導線を固定" },
  ];

  const painSolutionRows = [
    {
      pain: "紙・PDF案内の差し替えが遅く、現場ごとに内容がズレる",
      solution: "1つの編集画面で更新し、URL/QRをそのまま使い回し",
      outcome: "全館一斉に最新案内へ更新",
    },
    {
      pain: "深夜帯の問い合わせがフロントに集中する",
      solution: "セルフチェックイン/連絡先/館内導線を1ページ集約",
      outcome: "電話対応を減らし、案内の自己解決率を向上",
    },
    {
      pain: "担当者しか更新できず、運用が属人化する",
      solution: "テンプレとブロック編集で誰でも同品質で更新",
      outcome: "引き継ぎしやすい運用体制を構築",
    },
  ];

  const launchChecklist = [
    "施設名・連絡先を入力",
    "チェックイン/アウト情報を入力",
    "館内設備・Wi-Fi・駐車場を反映",
    "公開してURL/QRを配布",
    "閲覧分析で反応を確認",
  ];

  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <LpRevealObserver />
      <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
        <header className="lux-card lp-hero-shell lp-reveal overflow-hidden rounded-3xl p-5 sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-r from-emerald-200/40 via-cyan-100/20 to-transparent lp-glow-pulse" />
          <div className="lp-float pointer-events-none absolute -left-12 top-8 h-36 w-36 rounded-full bg-emerald-300/20 blur-2xl" />
          <div className="lp-float-slow pointer-events-none absolute right-0 top-20 h-40 w-40 rounded-full bg-cyan-200/20 blur-2xl" />

          <div className="relative lp-reveal lp-delay-1 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xl font-black tracking-[0.28em] text-slate-900 sm:text-2xl">
              INFOMII
            </p>
            <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <a href="#proof" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-white/80">
                実績
              </a>
              <a href="#templates" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-white/80">
                テンプレ例
              </a>
              <a href="#features" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-white/80">
                機能
              </a>
              <a href="#flow" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-white/80">
                導入フロー
              </a>
              <a href="#pricing" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-white/80">
                料金
              </a>
              <a href="#faq" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-white/80">
                FAQ
              </a>
            </nav>
          </div>

          <div className="relative mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <h1 className="lp-reveal lp-delay-2 mt-3 text-3xl font-bold text-slate-900 sm:text-5xl">
                {heroCopy.title}
                <span className="mt-2 block text-base font-semibold text-emerald-700 sm:text-2xl">{heroCopy.subtitle}</span>
              </h1>
              <p className="lp-reveal lp-delay-3 mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
                {heroCopy.body} Proならノードで複数ページ連携まで対応し、現場で必要な更新をその場で反映できます。
              </p>
              <p className="lp-reveal lp-delay-3 mt-3 text-xs font-medium text-slate-600 sm:text-sm">
                Free: ¥0 / Pro: {proMonthlyPriceLabel}（税込・いつでも解約可能）
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric, index) => (
                  <div
                    key={metric.label}
                    className="lp-reveal lp-metric rounded-xl border border-emerald-100 bg-white/95 p-3"
                    style={{ transitionDelay: `${260 + index * 70}ms` }}
                  >
                    <p className="text-[11px] text-slate-500">{metric.label}</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{metric.value}</p>
                    <p className="text-[11px] text-slate-500">{metric.sub}</p>
                  </div>
                ))}
              </div>

              <div className="lp-reveal lp-delay-4 mt-5 flex flex-wrap gap-3">
                <Link href={buildLoginHref("lp-hero")} className="lux-btn-primary lp-cta-attention rounded-xl px-5 py-3 text-sm font-semibold">
                  {optimizedHeroPrimaryCtaLabel}
                </Link>
                <Link
                  href={buildLoginHref("lp-hero")}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
                >
                  ログイン
                </Link>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">CTAクリック後は登録/ログイン画面へ遷移します。登録完了後に作成ウィザードを開始できます。</p>
            </div>

            <aside className="lp-reveal lp-delay-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
              <p className="text-xs font-semibold tracking-wide text-emerald-700">運用イメージ</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl border border-emerald-100 bg-white p-3">
                  <p className="text-[11px] text-slate-500">1. 作成</p>
                  <p className="text-sm font-semibold text-slate-900">ブロックを追加して情報入力</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-white p-3">
                  <p className="text-[11px] text-slate-500">2. 公開</p>
                  <p className="text-sm font-semibold text-slate-900">URL / QRを即発行</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-white p-3">
                  <p className="text-[11px] text-slate-500">3. 拡張（Pro）</p>
                  <p className="text-sm font-semibold text-slate-900">ノードで複数ページ連携</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-600 p-3 text-white">
                <p className="text-xs text-emerald-100">現場向け</p>
                <p className="text-lg font-bold">更新作業の属人化を減らす</p>
                <p className="mt-1 text-xs text-emerald-50">&quot;更新できる人が限られる&quot; 状態を、運用画面で解消します。</p>
              </div>
            </aside>
          </div>
        </header>

        <section className="lux-card lp-reveal lp-delay-2 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">導入までの不安を先回りで解消</h2>
            <p className="text-sm text-slate-600">{landingPage === "business" ? "ビジネスホテル向け" : landingPage === "resort" ? "リゾートホテル向け" : "温浴施設向け"}の初期導線</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {anxietyReliefByLanding[landingPage].map((line) => (
              <article key={line} className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900">
                {line}
              </article>
            ))}
          </div>
        </section>

        <section className="lp-reveal lp-delay-2 grid gap-4 md:grid-cols-3">
          {useCases.map((item, index) => (
            <article
              key={item.title}
              className="lux-card lux-section-card lp-reveal rounded-2xl p-5"
              style={{ transitionDelay: `${220 + index * 90}ms` }}
            >
              <p className="text-xs font-semibold text-emerald-700">導入シーン</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h2>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {item.items.map((line) => (
                  <li key={line}>・{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section id="proof" className="lux-card lp-reveal lp-delay-2 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">実績と信頼性</h2>
            <p className="text-sm text-slate-600">導入ヒアリングで得た運用変化のサンプル</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {fixedImpactCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2">
                <p className="text-[11px] text-emerald-800">{card.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {hotelVoices.map((voice, index) => (
              <article
                key={voice.hotel}
                className="lp-reveal rounded-2xl border border-slate-200 bg-white p-4"
                style={{ transitionDelay: `${160 + index * 80}ms` }}
              >
                <div className="flex items-center gap-2">
                  <VoiceLogo logoSrc={voice.logoSrc} hotel={voice.hotel} brandMark={voice.brandMark} brandTone={voice.brandTone} />
                  <p className="text-xs font-semibold text-emerald-700">{voice.hotel}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-800">「{voice.comment}」</p>
                <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800">
                  {voice.impact}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <p>※ 数値は導入施設ヒアリングに基づく目安です。運用体制・更新頻度により変動します。</p>
            <p className="mt-1">
              法務・運営情報: <Link className="underline" href="/terms">利用規約</Link> / <Link className="underline" href="/privacy">プライバシーポリシー</Link> / <Link className="underline" href="/commerce">特定商取引法に基づく表記</Link>
            </p>
          </div>
        </section>

        {!lpCompactMode && (
        <section className="lux-card lp-reveal lp-delay-2 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">導入施設コメント</h2>
            <p className="text-sm text-slate-600">ホテル現場の実運用レビュー</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {hotelVoices.map((voice, index) => (
              <article
                key={voice.hotel}
                className="lp-reveal rounded-2xl border border-slate-200 bg-white p-4"
                style={{ transitionDelay: `${160 + index * 80}ms` }}
              >
                <div className="flex items-center gap-2">
                  <VoiceLogo logoSrc={voice.logoSrc} hotel={voice.hotel} brandMark={voice.brandMark} brandTone={voice.brandTone} />
                  <p className="text-xs font-semibold text-emerald-700">{voice.hotel}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-800">「{voice.comment}」</p>
                <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-800">
                  {voice.impact}
                </p>
              </article>
            ))}
          </div>
        </section>
        )}

        <section id="templates" className="lux-card lp-reveal lp-delay-2 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">実際の公開ページ事例（課題→解決）</h2>
            <p className="text-sm text-slate-600">業態別の課題を、公開ページでどう解決するかを可視化</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {sortedPublicExamples.map((example, index) => {
              const theme = exampleThemeByIndustry[example.industryTag];
              const templateIndex = starterTemplates.findIndex((entry) => entry.title === (example.template?.title ?? ""));
              const normalizedTemplateIndex = templateIndex >= 0 ? templateIndex : 0;
              const templateTitle = example.template?.title ?? "";
              const templateIndustry = example.industryTag === "business" ? "business" : example.industryTag === "resort" ? "resort" : "spa";
              const templateCreateNext = `/dashboard?tab=create&industry=${templateIndustry}&lp_template=${normalizedTemplateIndex}&lp_template_title=${encodeURIComponent(templateTitle)}`;
              const templateCreateHref =
                `/login?ref=lp-bottom&ab=${ctaVariant}&scene=${heroScene}&src=${encodeURIComponent(sanitizedSourceChannel)}&lp=${landingPage}&kw=${keyword}&lp_template=${normalizedTemplateIndex}&lp_template_title=${encodeURIComponent(templateTitle)}&next=${encodeURIComponent(templateCreateNext)}`;
              return (
              <article
                key={example.title}
                className={`lp-reveal overflow-hidden rounded-2xl border bg-white ${theme.cardBorder}`}
                style={{ transitionDelay: `${180 + index * 80}ms` }}
              >
                <div className="border-b border-slate-200 bg-slate-50 p-2">
                  <TemplateScreenPreview blocks={example.template?.blocks} />
                </div>
                <div className="p-4">
                  <p className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${theme.chip}`}>
                    {example.tag}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{example.title}</h3>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">{theme.subtitle}</p>
                  <div className="mt-2 space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px]">
                    <p className="text-slate-700"><span className="font-semibold text-rose-700">課題:</span> {example.pain}</p>
                    <p className="text-slate-700"><span className="font-semibold text-emerald-700">解決:</span> {example.solution}</p>
                    <p className="text-slate-700"><span className="font-semibold text-cyan-700">効果:</span> {example.impact}</p>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {example.bullets.map((bullet) => (
                      <li key={`${example.title}-${bullet}`}>・{bullet}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={templateCreateHref}
                      className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold !text-white shadow-[0_8px_18px_-12px_rgba(15,23,42,0.8)] hover:bg-slate-800 hover:!text-white"
                    >
                      このテンプレートで作る
                    </Link>
                    <p className="text-xs text-slate-500">公開URL例: {example.publishPath}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">使用テンプレ: {example.template?.title ?? "テンプレート"}</p>
                </div>
              </article>
              );
            })}
          </div>
        </section>

        {!lpCompactMode && (
        <section className="lux-card lp-reveal lp-delay-2 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">導入実感（目安）</h2>
            <p className="text-sm text-slate-600">現場運用で体感しやすい改善ポイント</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {impactStats.map((stat, index) => (
              <article
                key={stat.label}
                className="lp-reveal rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-5"
                style={{ transitionDelay: `${140 + index * 80}ms` }}
              >
                <p className="text-xs font-semibold text-emerald-700">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs text-slate-600">{stat.sub}</p>
              </article>
            ))}
          </div>
        </section>
        )}

        {!lpCompactMode && (
        <section className="lux-card lp-reveal lp-delay-2 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">ホテル現場の課題を、運用導線で解決</h2>
            <p className="text-sm text-slate-600">導入後すぐ実感しやすい改善ポイント</p>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="grid grid-cols-1 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 md:grid-cols-[1.1fr_1fr_0.9fr]">
              <p className="px-4 py-3">よくある課題</p>
              <p className="px-4 py-3">Infomiiでの対応</p>
              <p className="px-4 py-3">期待できる変化</p>
            </div>
            {painSolutionRows.map((row, index) => (
              <div
                key={row.pain}
                className={`grid grid-cols-1 text-sm md:grid-cols-[1.1fr_1fr_0.9fr] ${index < painSolutionRows.length - 1 ? "border-b border-slate-200" : ""}`}
              >
                <p className="px-4 py-3 text-slate-700">{row.pain}</p>
                <p className="px-4 py-3 font-medium text-emerald-700">{row.solution}</p>
                <p className="px-4 py-3 text-slate-900">{row.outcome}</p>
              </div>
            ))}
          </div>
        </section>
        )}

        {!lpCompactMode && (
        <section id="features" className="lux-card lp-reveal lp-delay-2 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">機能</h2>
            <p className="text-sm text-slate-600">作成から運用まで、1つの画面群で完結</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="lp-reveal rounded-2xl border border-slate-200 bg-white p-4"
                style={{ transitionDelay: `${180 + index * 60}ms` }}
              >
                <p className="text-sm font-semibold text-slate-900">{feature.title}</p>
                <p className="mt-2 text-sm text-slate-700">{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>
        )}

        {!lpCompactMode && (
        <section id="flow" className="lux-card lp-reveal lp-delay-2 rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">導入フロー</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {flow.map((item, index) => (
              <article
                key={item.step}
                className="lp-reveal rounded-2xl border border-slate-200 bg-white p-5"
                style={{ transitionDelay: `${180 + index * 80}ms` }}
              >
                <p className="text-xs font-bold tracking-widest text-emerald-600">STEP {item.step}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>
        )}

        <section id="pricing" className="lux-card lp-reveal lp-delay-3 rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">料金プラン</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Free</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">¥0</p>
              <p className="mt-1 text-xs text-slate-500">まずは無料で公開を開始</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>・公開ページ上限あり</li>
                <li>・基本ブロックエディタ</li>
                <li>・QR公開</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Pro</p>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                  おすすめ
                </span>
              </div>
              <p className="mt-2 text-4xl font-bold text-slate-900">
                {proMonthlyPriceLabel}
                <span className="ml-1 text-base font-semibold text-slate-700">/ 月</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">税込・Stripe決済・いつでも解約可能</p>
              <p className="mt-1 rounded-lg border border-emerald-200 bg-white/70 px-2 py-1 text-[11px] font-medium text-emerald-800">
                初期費用0円 / 契約縛りなし / 必要になった時だけアップグレード
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>・公開ページ上限を拡張</li>
                <li>・ノードマップで複数ページ連携</li>
                <li>・運用管理機能</li>
              </ul>
              <Link
                href={buildLoginHref("lp-bottom")}
                className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold !text-white hover:bg-emerald-500 hover:!text-white"
              >
                {bottomCtaByLandingPage[landingPage]}
              </Link>
            </article>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-semibold">項目</th>
                  <th className="px-4 py-3 font-semibold">Free</th>
                  <th className="px-4 py-3 font-semibold text-emerald-700">Pro</th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, index) => (
                  <tr key={row.item} className={index < compareRows.length - 1 ? "border-b border-slate-200" : ""}>
                    <td className="px-4 py-3 font-medium text-slate-900">{row.item}</td>
                    <td className="px-4 py-3 text-slate-700">{row.free}</td>
                    <td className="px-4 py-3 text-slate-900">{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="faq" className="lux-card lp-reveal lp-delay-3 rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">{sourceType === "search" ? "検索ユーザー向けFAQ" : "FAQ"}</h2>
          <div className="mt-4 space-y-2">
            {searchOptimizedFaq.map((item, index) => (
              <details
                key={item.q}
                className="lp-reveal rounded-xl border border-slate-200 bg-white p-4"
                style={{ transitionDelay: `${150 + index * 60}ms` }}
              >
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.q}</summary>
                <p className="mt-2 text-sm leading-7 text-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {!lpCompactMode && (
        <section id="contact" className="lux-card lp-reveal lp-delay-4 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-slate-900">お問い合わせ</h2>
          <p className="mt-2 text-sm text-slate-700">導入・プラン・不具合のご相談は以下までご連絡ください。</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{contactEmail}</p>
        </section>
        )}

        {!lpCompactMode && (
        <section className="lux-card lp-reveal lp-delay-4 rounded-3xl border border-emerald-300 p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">公開までのチェックリスト</h2>
              <p className="mt-2 text-sm text-slate-600">SNS流入ユーザーが迷わず始められるよう、初回作業を5項目に固定しています。</p>
              <ol className="mt-4 space-y-2">
                {launchChecklist.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
            <aside className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
              <p className="text-xs font-semibold text-emerald-700">最短スタート</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">3分で公開</p>
              <p className="mt-2 text-sm text-slate-700">今すぐテンプレートから開始して、当日中にQR運用へ切り替えできます。</p>
              <Link href={buildLoginHref("lp-bottom")} className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                {heroPrimaryCtaLabel}
              </Link>
            </aside>
          </div>
        </section>
        )}

        <section className="lp-cta-shell lp-reveal lp-delay-4 rounded-3xl border border-emerald-400 bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-[0_24px_40px_-24px_rgba(5,150,105,0.7)] sm:p-8">
          <p className="text-xs font-semibold tracking-widest text-emerald-100">READY TO START</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">まずは無料登録して、1ページ公開を始めましょう</h2>
          <p className="mt-2 text-sm text-emerald-50">
            まず登録/ログイン後に、編集から公開までの流れを管理画面でそのまま体験できます。必要になった時点でProへ拡張可能です。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={buildLoginHref("lp-bottom")}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold !text-emerald-700 shadow-[0_12px_24px_-14px_rgba(2,6,23,0.45)]"
            >
              {bottomCtaByLandingPage[landingPage]}
            </Link>
            <a
              href="#pricing"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold !text-slate-900 shadow-[0_10px_20px_-14px_rgba(2,6,23,0.45)]"
            >
              プラン比較を見る
            </a>
          </div>
        </section>

        <footer className="lux-card lp-reveal lp-delay-4 rounded-2xl p-5 text-sm text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} Infomii</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link className="hover:underline" href="/terms">
                利用規約
              </Link>
              <Link className="hover:underline" href="/privacy">
                プライバシーポリシー
              </Link>
              <Link className="hover:underline" href="/commerce">
                特定商取引法に基づく表記
              </Link>
              <Link className="hover:underline" href="/refund">
                返金・キャンセルポリシー
              </Link>
              <Link className="hover:underline" href={buildLoginHref("lp-bottom")}>
                ログイン
              </Link>
            </div>
          </div>
        </footer>
      </div>

      <div className="fixed inset-x-0 bottom-3 z-40 px-3 sm:bottom-4">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_16px_30px_-20px_rgba(2,6,23,0.55)] backdrop-blur">
          <p className="hidden text-xs font-semibold text-slate-600 sm:block">ホテル案内を今すぐ公開</p>
          <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
            <a href="#templates" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              テンプレ例
            </a>
            <Link href={buildLoginHref("lp-sticky")} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800">
              ログイン
            </Link>
            <Link href={buildLoginHref("lp-sticky")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
              {heroPrimaryShortCtaLabel}
            </Link>
          </div>
        </div>
      </div>

      {!lpCompactMode && (
      <div className="fixed right-3 top-3 z-40 sm:right-4 sm:top-4">
        <Link
          href={buildLoginHref("lp-sticky")}
          className="inline-flex items-center rounded-xl border border-emerald-300 bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-[0_14px_24px_-18px_rgba(5,150,105,0.75)]"
        >
          {heroPrimaryShortCtaLabel}
        </Link>
      </div>
      )}
    </main>
  );
}
