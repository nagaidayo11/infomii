import Link from "next/link";
import Image from "next/image";
import LpRevealObserver from "@/components/lp-reveal-observer";
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
            return (
              <div key={block.id} className="grid grid-cols-3 gap-1">
                {(block.iconItems ?? []).slice(0, 3).map((entry) => (
                  <div key={entry.id} className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-2 text-center">
                    <p className="text-sm leading-none">{entry.icon || "⭐"}</p>
                    <p className="mt-1 truncate text-[10px] text-slate-700">{entry.label || "項目"}</p>
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
  const hasDedicatedLpPath = query.lp === "business" || query.lp === "resort" || query.lp === "spa";
  const lpBasePath = hasDedicatedLpPath
    ? landingPage === "business"
      ? "/lp/business"
      : landingPage === "resort"
        ? "/lp/resort"
        : "/lp/spa"
    : "/";
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
  const heroValuePropositionByLpVariant = {
    business: {
      a: "フロント問い合わせ削減を最優先",
      b: "夜間帯の案内を自己解決化",
      c: "チェックイン導線を最短で標準化",
    },
    resort: {
      a: "滞在導線を一画面に集約",
      b: "アクティビティ案内を即更新",
      c: "館内導線の迷いを最小化",
    },
    spa: {
      a: "温浴ルール共有を即時反映",
      b: "混雑時の誘導変更を即配布",
      c: "大浴場案内の問い合わせを削減",
    },
  } as const;
  const heroCtaLabelByVariant = {
    a: landingPage === "business" ? "30秒登録でチェックイン案内を作成" : landingPage === "resort" ? "30秒登録で滞在案内を作成" : "30秒登録で温浴案内を作成",
    b: landingPage === "business" ? "30秒登録で夜間案内を公開" : landingPage === "resort" ? "30秒登録で導線案内を公開" : "30秒登録で温浴案内を公開",
    c: landingPage === "business" ? "30秒登録でフロント運用を改善" : landingPage === "resort" ? "30秒登録で滞在導線を整備" : "30秒登録で温浴運用を整備",
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
    a: "30秒登録で作成",
    b: "30秒登録で公開",
    c: "30秒で開始",
  } as const;
  const heroPrimaryShortCtaLabel = heroCtaShortLabelByVariant[ctaVariant];
  const bottomCtaByLandingPage = {
    business: "無料でチェックイン導線を公開",
    resort: "無料で滞在導線を公開",
    spa: "無料で温浴導線を公開",
  } as const;
  const seasonalHeroMessage = {
    business: {
      spring: "新年度の導線切り替えを1ページで標準化",
      summer: "繁忙期前のチェックイン導線を即時更新",
      autumn: "団体・連休対応の案内変更を最短反映",
      winter: "遅延到着・夜間問い合わせ対策を強化",
    },
    resort: {
      spring: "行楽シーズンの滞在導線を一括更新",
      summer: "プール・アクティビティ導線をピーク対応",
      autumn: "館内イベント案内を即時配信",
      winter: "天候変更時の案内差し替えを高速化",
    },
    spa: {
      spring: "温浴ルールと混雑案内を統一表示",
      summer: "時間帯別の温浴導線を分かりやすく配信",
      autumn: "連休時の利用案内を即時差し替え",
      winter: "繁忙期の温浴案内をリアルタイム更新",
    },
  } as const;
  const keywordGuidance = {
    checkin: "検索意図: チェックイン導線の最短公開",
    bath: "検索意図: 温浴ルールの即時共有",
    breakfast: "検索意図: 朝食導線の統一運用",
    wifi: "検索意図: 館内設備/Wi-Fi案内の問い合わせ削減",
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
      hotel: "都心ビジネスホテル（120室）",
      comment: "深夜チェックインの問い合わせが減って、フロント1名体制でも回せるようになりました。",
      impact: "導入3日で夜間電話対応を削減",
    },
    {
      hotel: "温浴併設リゾート（客室80室）",
      comment: "温浴ルールの更新を即反映できるので、紙案内差し替えの手間がほぼ無くなりました。",
      impact: "案内差し替え時間を週2時間削減",
    },
    {
      hotel: "駅前ホテル（客室65室）",
      comment: "朝食会場案内を統一して、スタッフ説明のばらつきが減りました。",
      impact: "朝ピークの案内対応を標準化",
    },
  ];

  const activeExampleTag = query.tag === "business" || query.tag === "resort" || query.tag === "spa" ? query.tag : "all";
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
      title: "チェックイン案内ページ",
      tag: "フロント導線",
      pain: "深夜到着時の問い合わせが集中",
      solution: "チェックイン手順と連絡先を1画面固定",
      impact: "夜間問い合わせの一次対応を約40%削減",
      impactScore: 40,
      industryTag: "business" as const,
      seasonTags: ["spring", "summer", "autumn", "winter"],
      template:
        starterTemplates.find((entry) => entry.title === "【ビジネスホテル】チェックイン・館内総合案内") ??
        starterTemplates[0],
      bullets: ["到着直後の案内を1画面に集約", "深夜到着でも自己解決しやすい導線"],
      publishPath: "/p/demo-checkin",
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
      bullets: ["利用時間と注意事項を可視化", "貸切風呂予約導線を明確化"],
      publishPath: "/p/demo-bath",
    },
    {
      title: "館内設備ページ",
      tag: "設備導線",
      pain: "設備情報がページごとに分散",
      solution: "Wi-Fi/駐車場/設備情報を統一表示",
      impact: "フロント問い合わせを日次で平準化",
      impactScore: 30,
      industryTag: "resort" as const,
      seasonTags: ["spring", "summer"],
      template:
        starterTemplates.find((entry) => entry.title === "【ビジネスホテル】深夜到着・セルフチェックイン案内") ??
        starterTemplates[1],
      bullets: ["Wi-Fi / 駐車場 / 自販機を整理", "客室問い合わせの削減に寄与"],
      publishPath: "/p/demo-facility",
    },
  ];
  const filteredPublicExamples = activeExampleTag === "all"
    ? publicExamples
    : publicExamples.filter((example) => example.industryTag === activeExampleTag);
  const sortedPublicExamples = [...filteredPublicExamples].sort((a, b) => {
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
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                  訴求テーマ
                </span>
                {[
                  { id: "checkin", label: "チェックイン" },
                  { id: "bath", label: "温浴" },
                  { id: "breakfast", label: "朝食" },
                ].map((entry) => (
                  <Link
                    key={entry.id}
                    href={`${lpBasePath}?scene=${entry.id}&ab=${ctaVariant}&src=${encodeURIComponent(sanitizedSourceChannel)}&lp=${landingPage}`}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      heroScene === entry.id
                        ? "border-emerald-400 bg-emerald-600 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {entry.label}
                  </Link>
                ))}
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-800">
                  検索キーワード
                </span>
                {([
                  ["checkin", "チェックイン"],
                  ["bath", "温浴"],
                  ["breakfast", "朝食"],
                  ["wifi", "Wi-Fi"],
                ] as const).map(([value, label]) => (
                  <Link
                    key={value}
                    href={`${lpBasePath}?scene=${heroScene}&ab=${ctaVariant}&src=${encodeURIComponent(sanitizedSourceChannel)}&lp=${landingPage}&kw=${value}`}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      keyword === value
                        ? "border-cyan-400 bg-cyan-600 text-white"
                        : "border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <h1 className="lp-reveal lp-delay-2 mt-3 text-3xl font-bold text-slate-900 sm:text-5xl">
                {heroCopy.title}
                <span className="mt-2 block text-base font-semibold text-emerald-700 sm:text-2xl">{heroCopy.subtitle}</span>
              </h1>
              <p className="mt-2 text-xs font-semibold text-cyan-700">
                {heroValuePropositionByLpVariant[landingPage][ctaVariant]}
              </p>
              <p className="mt-1 text-xs font-semibold text-emerald-700">
                季節最適化: {seasonalHeroMessage[landingPage][season]}
              </p>
              <p className="mt-1 text-xs font-semibold text-cyan-700">
                {keywordGuidance[keyword]}
              </p>
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
              <p className="mt-2 text-[11px] text-slate-600">
                流入チャネル最適化: {sourceChannel ? `${sourceChannel}向け` : "通常"} CTA（固定 variant {ctaVariant.toUpperCase()}）を表示中
              </p>
              <p className="mt-1 text-[11px] text-slate-500">Week12: 季節要因を加味した業態別の勝ち訴求を固定配信しています。</p>
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
                <p className="text-xs font-semibold text-emerald-700">{voice.hotel}</p>
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
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {fixedImpactCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2">
                <p className="text-[11px] text-emerald-800">{card.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {([
              ["all", "すべて"],
              ["business", "ビジネス"],
              ["resort", "リゾート"],
              ["spa", "温浴・スパ"],
            ] as const).map(([value, label]) => (
              <Link
                key={value}
                href={`${lpBasePath}?scene=${heroScene}&ab=${ctaVariant}&src=${encodeURIComponent(sanitizedSourceChannel)}&lp=${landingPage}&tag=${value}`}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  activeExampleTag === value
                    ? "border-emerald-500 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {sortedPublicExamples.map((example, index) => (
              <article
                key={example.title}
                className="lp-reveal overflow-hidden rounded-2xl border border-slate-200 bg-white"
                style={{ transitionDelay: `${180 + index * 80}ms` }}
              >
                <div className="border-b border-slate-200 bg-slate-50 p-2">
                  <TemplateScreenPreview blocks={example.template?.blocks} />
                </div>
                <div className="p-4">
                  <p className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    {example.tag}
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{example.title}</h3>
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
                  <p className="mt-3 text-xs text-slate-500">公開URL例: {example.publishPath}</p>
                </div>
              </article>
            ))}
          </div>
          {filteredPublicExamples.length === 0 && (
            <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
              選択した業態タグの事例はまだありません。
            </p>
          )}
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
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">まずは無料で1ページ公開してみましょう</h2>
          <p className="mt-2 text-sm text-emerald-50">
            編集から公開までの流れを、実際の管理画面でそのまま体験できます。必要になった時点でProへ拡張可能です。
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
