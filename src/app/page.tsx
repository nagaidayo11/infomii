import Link from "next/link";
import Image from "next/image";
import LpRevealObserver from "@/components/lp-reveal-observer";
import { starterTemplates } from "@/lib/templates";
import type { InformationBlock } from "@/types/information";

function TemplateScreenPreview({ blocks }: { blocks?: InformationBlock[] }) {
  const previewBlocks = (blocks ?? []).slice(0, 9);
  if (previewBlocks.length === 0) {
    return <div className="h-64 rounded-xl border border-slate-200 bg-slate-50" />;
  }

  return (
    <div className="h-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
      <div className="space-y-2">
        {previewBlocks.map((block) => {
          if (block.type === "title" || block.type === "heading") {
            return (
              <p key={block.id} className="text-sm font-semibold text-slate-900">
                {block.text || "タイトル"}
              </p>
            );
          }
          if (block.type === "paragraph") {
            return (
              <p key={block.id} className="line-clamp-2 text-xs leading-5 text-slate-700">
                {block.text || ""}
              </p>
            );
          }
          if (block.type === "image" && block.url) {
            return (
              <Image
                key={block.id}
                src={block.url}
                alt="template preview"
                width={720}
                height={360}
                className="h-24 w-full rounded-lg border border-slate-200 object-cover"
                unoptimized
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
                {items.slice(0, 3).map((entry) => (
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
                <p className="line-clamp-2 text-[10px] text-slate-600">{block.sectionBody || ""}</p>
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

export default function Home() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@informe.jp";
  const proMonthlyPriceRaw = Number(process.env.NEXT_PUBLIC_PRO_MONTHLY_PRICE ?? "1980");
  const proMonthlyPrice = Number.isFinite(proMonthlyPriceRaw) && proMonthlyPriceRaw > 0 ? proMonthlyPriceRaw : 1980;
  const proMonthlyPriceLabel = `¥${new Intl.NumberFormat("ja-JP").format(proMonthlyPrice)}`;

  const metrics = [
    { label: "初回公開まで", value: "最短3分", sub: "テンプレ選択→編集→公開" },
    { label: "更新反映", value: "即時", sub: "現場変更をそのまま反映" },
    { label: "導入業種", value: "5+", sub: "ホテル・飲食店・サロンなど" },
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
      title: "旅館",
      items: ["お食事処の案内", "大浴場・貸切風呂案内", "館内ルールの共有"],
    },
  ];

  const templatePreviews = [
    {
      title: "ビジネスホテル案内",
      subtitle: "チェックイン・館内導線",
      template:
        starterTemplates.find((entry) => entry.title === "【ビジネスホテル】チェックイン・館内総合案内") ??
        starterTemplates[0],
      points: ["Wi-Fi / 駐車場", "チェックイン情報", "フロント連絡ボタン"],
    },
    {
      title: "深夜到着ゲスト案内",
      subtitle: "セルフチェックイン導線",
      template:
        starterTemplates.find((entry) => entry.title === "【ビジネスホテル】深夜到着・セルフチェックイン案内") ??
        starterTemplates[1],
      points: ["本人確認/入室導線", "緊急連絡先", "夜間運用ルール"],
    },
    {
      title: "リゾート滞在案内",
      subtitle: "アクティビティ導線",
      template:
        starterTemplates.find((entry) => entry.title === "【リゾートホテル】滞在アクティビティ案内") ??
        starterTemplates[2],
      points: ["体験予約導線", "雨天時の案内", "滞在プログラム共有"],
    },
    {
      title: "旅館の浴場案内",
      subtitle: "大浴場・貸切風呂",
      template:
        starterTemplates.find((entry) => entry.title === "【旅館】大浴場・貸切風呂のご案内") ??
        starterTemplates[3],
      points: ["利用時間", "貸切予約方法", "注意事項"],
    },
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
      q: "どんな業種で使えますか？",
      a: "ホテル・飲食店・サロン・クリニック・観光施設など、案内情報を更新する業種で利用できます。",
    },
    {
      q: "QRコードはすぐ発行できますか？",
      a: "はい。ページ保存後に公開URLとQRコードをすぐ発行できます。紙印刷にもそのまま使えます。",
    },
    {
      q: "無料プランとProの違いは？",
      a: "Proでは公開上限の拡張、複数ページ連携（ノード）、詳細な閲覧分析が利用できます。",
    },
    {
      q: "デザイン知識がなくても使えますか？",
      a: "問題ありません。ブロックを追加し、テキストや色を編集するだけで見栄えの良いページを作れます。",
    },
  ];

  const impactStats = [
    { label: "更新時間の削減", value: "最大70%", sub: "紙・PDF運用から移行した場合の目安" },
    { label: "案内差し替え時間", value: "最短1分", sub: "テキスト更新のみの場合" },
    { label: "公開ミス検知", value: "自動", sub: "公開前チェックで不足項目を警告" },
  ];

  const compareRows = [
    { item: "月額料金（税込）", free: "¥0", pro: `${proMonthlyPriceLabel}` },
    { item: "公開ページ上限", free: "小規模向け", pro: "拡張可能" },
    { item: "複数ページ連携", free: "-", pro: "ノードマップ対応" },
    { item: "閲覧分析", free: "基本", pro: "詳細に確認可能" },
    { item: "更新体験", free: "1ページ運用", pro: "ハブ導線で運用集約" },
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
              <h1 className="lp-reveal lp-delay-2 mt-3 text-3xl font-bold text-slate-900 sm:text-5xl">
                ホテル現場で使える案内ページを
                <span className="mt-2 block text-base font-semibold text-emerald-700 sm:text-2xl">誰でも、3分で、公開</span>
              </h1>
              <p className="lp-reveal lp-delay-3 mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
                ホテル向けインフォメーションを、ブロック編集で直感的に作成。チェックイン案内から館内導線、
                Proならノードで複数ページ連携まで。現場で必要な更新を、その場で反映できます。
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
                <Link href="/login" className="lux-btn-primary lp-cta-attention rounded-xl px-5 py-3 text-sm font-semibold">
                  無料でホテル案内を作成
                </Link>
                <Link
                  href="/login"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
                >
                  ログイン
                </Link>
              </div>
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

        <section className="lp-reveal lp-delay-2 grid gap-4 md:grid-cols-3">
          {useCases.map((item, index) => (
            <article
              key={item.title}
              className="lux-card lux-section-card lp-reveal rounded-2xl p-5"
              style={{ transitionDelay: `${220 + index * 90}ms` }}
            >
              <p className="text-xs font-semibold text-emerald-700">導入業種</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{item.title}</h2>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {item.items.map((line) => (
                  <li key={line}>・{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section id="templates" className="lux-card lp-reveal lp-delay-2 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold text-slate-900">ホテルでこんなのが作れます</h2>
            <p className="text-sm text-slate-600">テンプレを選んで、ホテル案内をすぐ公開</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {templatePreviews.map((template, index) => (
              <article
                key={template.title}
                className="lp-reveal overflow-hidden rounded-2xl border border-slate-200 bg-white"
                style={{ transitionDelay: `${180 + index * 70}ms` }}
              >
                <div className="border-b border-slate-200 bg-slate-50 p-2">
                  <TemplateScreenPreview blocks={template.template?.blocks} />
                </div>
                <div className="p-4">
                  <p className="text-xs font-semibold text-emerald-700">{template.subtitle}</p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{template.title}</h3>
                  <ul className="mt-3 space-y-1 text-sm text-slate-700">
                    {template.points.map((point) => (
                      <li key={`${template.title}-${point}`}>・{point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

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
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Pro</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">
                {proMonthlyPriceLabel}
                <span className="ml-1 text-base font-semibold text-slate-700">/ 月</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">税込・Stripe決済・いつでも解約可能</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>・公開ページ上限を拡張</li>
                <li>・ノードマップで複数ページ連携</li>
                <li>・運用管理機能</li>
              </ul>
              <Link
                href="/login"
                className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold !text-white hover:bg-emerald-500 hover:!text-white"
              >
                無料登録してProを試す
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
          <h2 className="text-2xl font-bold text-slate-900">FAQ</h2>
          <div className="mt-4 space-y-2">
            {faqItems.map((item, index) => (
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

        <section id="contact" className="lux-card lp-reveal lp-delay-4 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-slate-900">お問い合わせ</h2>
          <p className="mt-2 text-sm text-slate-700">導入・プラン・不具合のご相談は以下までご連絡ください。</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{contactEmail}</p>
        </section>

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
              <Link href="/login" className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                無料でホテル案内を作成
              </Link>
            </aside>
          </div>
        </section>

        <section className="lp-cta-shell lp-reveal lp-delay-4 rounded-3xl border border-emerald-400 bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white shadow-[0_24px_40px_-24px_rgba(5,150,105,0.7)] sm:p-8">
          <p className="text-xs font-semibold tracking-widest text-emerald-100">READY TO START</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">まずは無料で1ページ公開してみましょう</h2>
          <p className="mt-2 text-sm text-emerald-50">
            編集から公開までの流れを、実際の管理画面でそのまま体験できます。必要になった時点でProへ拡張可能です。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold !text-emerald-700 shadow-[0_12px_24px_-14px_rgba(2,6,23,0.45)]"
            >
              無料でホテル案内を作成
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
              <Link className="hover:underline" href="/login">
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
            <a href="#pricing" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
              料金
            </a>
            <Link href="/login" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800">
              ログイン
            </Link>
            <Link href="/login" className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">
              無料で作成
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
