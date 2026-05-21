import type { Metadata } from "next";
import Link from "next/link";
import { Button, Container, Section } from "@/components/ui";
import CheckoutButton from "@/components/lp/CheckoutButtonDynamic";
import { HorizontalScrollHint } from "@/components/lp/HorizontalScrollHint";
import { LpFeatures } from "@/components/lp/LpFeatures";
import { LpFinalCta } from "@/components/lp/LpFinalCta";
import { LpHero } from "@/components/lp/LpHero";
import { LpInstagramBanner } from "@/components/lp/LpInstagramBanner";
import { LpSaasHeader } from "@/components/lp/LpSaasHeader";
import { LpSocialProof } from "@/components/lp/LpSocialProof";
import { LpTemplates } from "@/components/lp/LpTemplates";
import { LpUseCases } from "@/components/lp/LpUseCases";
import { ScrollReveal, StaggerReveal } from "@/components/motion";
import { LP_FAQ } from "@/lib/lp/data";
import { LP_PAGE_TYPOGRAPHY_CLASS } from "@/lib/lp/typography";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://infomii.com";
const SAMPLE_PAGE_HREF = "/demo/guest-live?embed=1";
const SAMPLE_PAGE_DEMO_HREF = "/lp/saas?focus=templates";
const DEMO_EDITOR_HREF = "/demo/editor";

export const metadata: Metadata = {
  title: "Infomii | 情報を1ページに。旅行・予定・案内をスマホで整理",
  description:
    "旅行しおり、推し活、イベント、ホテル案内まで。伝えたい情報をスマホで見やすくまとめて共有。無料で3ページまで、登録なしデモあり。",
  alternates: { canonical: "https://www.infomii.com/lp/saas" },
  keywords: [
    "情報整理",
    "旅行しおり",
    "推し活",
    "リンク共有",
    "スマホ案内",
    "ホテル案内",
    "QR共有",
  ],
  openGraph: {
    url: `${appUrl}/lp/saas`,
    title: "Infomii | 情報を1ページに。共有をシンプルに",
    description:
      "旅行、予定、案内、リンク共有まで。スマホで見やすい情報ページを無料で作成。宿泊施設向けの運用例もあります。",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Infomii" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infomii | 情報を1ページに",
    description: "旅行しおり・推し活・イベント共有。ホテル案内にも。無料3ページ・デモ体験あり。",
  },
};

function PricingComparisonTable() {
  const no = <span className="text-slate-300">—</span>;
  const yes = <span className="font-medium text-emerald-700">✓</span>;
  const yesBadge = <span className="font-medium text-white">✓</span>;

  return (
    <div className="lux-section-card rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
      <p className="px-4 pt-3 text-xs text-slate-500 sm:hidden" aria-live="polite">
        横にスクロールして比較できます
      </p>
      <HorizontalScrollHint
        className="relative min-w-0 px-2 pb-2 sm:px-0 sm:pb-0"
        viewportClassName="max-h-[70dvh] min-w-0 overflow-x-auto overflow-y-auto overscroll-x-contain scroll-smooth sm:max-h-none"
        showEdgeFade={false}
      >
          <table className="w-full min-w-[860px] table-fixed border-collapse text-sm">
        <caption className="sr-only">Infomii プラン別の機能比較</caption>
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th
              scope="col"
              className="w-[38%] bg-slate-50 px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-500 sm:w-[34%]"
            >
              比較項目
            </th>
            <th scope="col" className="w-[20.5%] bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-600 sm:w-[22%]">
              Free
            </th>
            <th scope="col" className="w-[20.5%] border-x border-slate-200 bg-slate-100/90 px-3 py-3 text-center text-xs font-semibold text-slate-900 sm:w-[22%]">
              Pro
            </th>
            <th scope="col" className="w-[20.5%] bg-slate-50 px-3 py-3 text-center text-xs font-semibold text-slate-600 sm:w-[22%]">
              Business
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          <tr>
            <th scope="row" className="w-[38%] bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 sm:w-[34%]">作成規模: 公開ページ数</th>
            <td className="px-3 py-2.5 text-center tabular-nums">3本</td>
            <td className="border-x border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center tabular-nums">最大10本</td>
            <td className="px-3 py-2.5 text-center tabular-nums">
              <span className="inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 font-semibold text-white ring-1 ring-emerald-700">
                無制限
              </span>
            </td>
          </tr>
          <tr>
            <th scope="row" className="w-[38%] bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 sm:w-[34%]">テンプレート適用</th>
            <td className="px-3 py-2.5 text-center">{yes}</td>
            <td className="border-x border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">{yes}</td>
            <td className="px-3 py-2.5 text-center">{yes}</td>
          </tr>
          <tr>
            <th scope="row" className="w-[38%] bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 sm:w-[34%]">編集プレビュー（PC / スマホ）</th>
            <td className="px-3 py-2.5 text-center">{yes}</td>
            <td className="border-x border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">{yes}</td>
            <td className="px-3 py-2.5 text-center">{yes}</td>
          </tr>
          <tr>
            <th scope="row" className="w-[38%] bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 sm:w-[34%]">下書き / 公開切り替え</th>
            <td className="px-3 py-2.5 text-center">{yes}</td>
            <td className="border-x border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">{yes}</td>
            <td className="px-3 py-2.5 text-center">{yes}</td>
          </tr>
          <tr>
            <th scope="row" className="w-[38%] bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 sm:w-[34%]">QR発行 / 共有URL</th>
            <td className="px-3 py-2.5 text-center">{yes}</td>
            <td className="border-x border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">{yes}</td>
            <td className="px-3 py-2.5 text-center">{yes}</td>
          </tr>
          <tr>
            <th scope="row" className="w-[38%] bg-white px-4 py-2.5 text-left text-sm font-medium text-slate-700 sm:w-[34%]">運用効率: 閲覧分析</th>
            <td className="px-3 py-2.5 text-center">{no}</td>
            <td className="border-x border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">{yes}</td>
            <td className="px-3 py-2.5 text-center">{yes}</td>
          </tr>
          <tr>
            <th scope="row" className="w-[38%] bg-white px-4 py-2.5 text-left text-sm font-semibold text-emerald-800 sm:w-[34%]">
              <span className="block">チーム統制: チーム招待</span>
              <span className="mt-1 block text-xs font-medium text-emerald-700/90">
                更新漏れ防止・引き継ぎ容易
              </span>
            </th>
            <td className="px-3 py-2.5 text-center">{no}</td>
            <td className="border-x border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">{no}</td>
            <td className="px-3 py-2.5 text-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-emerald-700">
                {yesBadge} 対応
              </span>
            </td>
          </tr>
          <tr>
            <th scope="row" className="w-[38%] bg-white px-4 py-2.5 text-left text-sm font-semibold text-emerald-800 sm:w-[34%]">
              <span className="block">公開時の多言語自動翻訳</span>
              <span className="mt-1 block text-xs font-medium text-emerald-700/90">
                公開操作にあわせて主要言語へまとめて反映
              </span>
            </th>
            <td className="px-3 py-2.5 text-center">{no}</td>
            <td className="border-x border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">{no}</td>
            <td className="px-3 py-2.5 text-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-emerald-700">
                {yesBadge} 対応
              </span>
            </td>
          </tr>
          <tr>
            <th scope="row" className="w-[38%] bg-white px-4 py-2.5 text-left text-sm font-semibold text-emerald-800 sm:w-[34%]">
              <span className="block">動的ブロック</span>
              <span className="mt-1 block text-xs font-medium text-emerald-700/90">
                ヒーロースライド / キャンペーンタイマー / 緊急バナー など
              </span>
            </th>
            <td className="px-3 py-2.5 text-center">{no}</td>
            <td className="border-x border-slate-100 bg-slate-50/60 px-3 py-2.5 text-center">{no}</td>
            <td className="px-3 py-2.5 text-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-emerald-700">
                {yesBadge} 対応
              </span>
            </td>
          </tr>
        </tbody>
          </table>
      </HorizontalScrollHint>
    </div>
  );
}

export default function LpSaaSPage() {
  const loginHref = "/login?ref=lp-saas";
  const ctaHref = "/login?ref=lp-saas&next=%2Fdashboard%3Ftab%3Dcreate";
  const hasProAnnual = !!process.env.STRIPE_PRO_ANNUAL_PRICE_ID;
  const hasBusinessAnnual = !!process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID;

  return (
    <main
      className={`lp-page min-h-screen w-full max-w-full min-w-0 overflow-x-clip bg-[#F2FBF7] text-slate-900 antialiased font-['M_PLUS_Rounded_1c','Noto_Sans_JP',system-ui,sans-serif] ${LP_PAGE_TYPOGRAPHY_CLASS}`}
    >
      <LpSaasHeader loginHref={loginHref} ctaHref={ctaHref} />
      <LpInstagramBanner />

      <LpHero
        ctaHref={ctaHref}
        samplePageHref={SAMPLE_PAGE_HREF}
        demoEditorHref={DEMO_EDITOR_HREF}
      />

      <LpUseCases />
      <LpFeatures />
      <LpTemplates ctaHref={ctaHref} demoHref={SAMPLE_PAGE_DEMO_HREF} />

      <Section
        id="live-demo"
        kicker="デモ"
        title="まず30秒だけ触ってください"
        description="登録なしでデモ編集画面、または公開サンプルページを体験できます。"
        popTitle
      >
        <ScrollReveal>
          <div className="lux-section-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                href={DEMO_EDITOR_HREF}
                size="lg"
                className="min-h-[44px] !border-ds-accent/30 !bg-ds-accent hover:!bg-ds-accent-strong hover:!shadow-[0_2px_8px_rgba(5,150,105,0.22)]"
              >
                30秒デモを触る
              </Button>
              <Button href={SAMPLE_PAGE_DEMO_HREF} variant="secondary" size="lg" className="min-h-[44px]">
                用途別サンプルを見る
              </Button>
              <Button href={ctaHref} variant="secondary" size="lg" className="min-h-[44px]">
                無料ではじめる
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              デモは体験用です。公開やQR発行など実運用は無料登録後のダッシュボードで行います。
            </p>
          </div>
        </ScrollReveal>
      </Section>

      <LpSocialProof />

      <Section id="how-it-works" kicker="使い方" title="3ステップで、1ページができる" variant="muted" popTitle>
        <ScrollReveal>
          <StaggerReveal className="grid gap-8 sm:grid-cols-3" staggerDelay={0.1}>
            {[
              { step: "1", title: "テンプレを選ぶ", desc: "旅行・推し活・案内など、用途に合った土台から。" },
              { step: "2", title: "編集して確認", desc: "予定・リンク・MAPを足して、スマホ表示を確認。" },
              { step: "3", title: "共有する", desc: "URL・QR・SNSで届ける。ホテルなら客室掲示も。" },
            ].map((item) => (
              <div key={item.step}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition-[transform,border-color,background-color,box-shadow] duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-emerald-300 motion-safe:hover:bg-emerald-50/50 motion-safe:hover:shadow-sm">
                  {item.step}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </StaggerReveal>
        </ScrollReveal>
      </Section>

      <Section
        id="pricing"
        kicker="料金"
        title="用途で選べる3プラン"
        description="Freeは3ページまで無料。個人のしおりから、宿泊施設の案内運用まで。"
        popTitle
      >
        <ScrollReveal>
          <div
            id="pricing-comparison"
            className="lux-section-card mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100"
          >
            <h3 className="text-base font-semibold text-slate-900">機能比較（主要項目）</h3>
            <p className="mt-1 text-sm text-slate-600">比較軸: 作成規模 / 運用効率 / チーム統制（詳細は横スクロールで確認）</p>
            <HorizontalScrollHint className="mt-4 min-w-0 w-full max-w-full md:hidden" showEdgeFade={false}>
                <p className="mb-2 text-xs text-slate-500">横にスクロールして比較できます</p>
                <div className="flex w-max max-w-none snap-x snap-mandatory gap-3 pb-1">
                <article className="min-w-[240px] snap-start rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold tracking-wide text-slate-500">Free</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">¥0</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                    <li>・公開ページ数: 3本</li>
                    <li>・編集プレビュー / QR共有</li>
                    <li>・まず3ページまで無料で公開</li>
                  </ul>
                  <Button href={ctaHref} variant="secondary" className="mt-3 min-h-[44px] w-full">
                    Freeで始める
                  </Button>
                </article>
                <article className="min-w-[240px] snap-start rounded-xl border border-emerald-300 bg-emerald-50/80 p-4">
                  <p className="text-xs font-semibold tracking-wide text-emerald-700">Pro（人気）</p>
                  <p className="mt-1 text-xl font-bold text-emerald-700">¥1,980/月</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                    <li>・公開ページ数: 最大10本</li>
                    <li>・閲覧分析</li>
                    <li>・2ページ目以降の運用向け</li>
                  </ul>
                  <CheckoutButton
                    plan="pro"
                    className="mt-3 min-h-[44px] w-full !border-ds-accent/30 !bg-ds-accent hover:!bg-ds-accent-strong hover:!shadow-[0_2px_8px_rgba(5,150,105,0.22)]"
                  >
                    Proを申し込む{hasProAnnual ? "（月払い）" : ""}
                  </CheckoutButton>
                </article>
                <article className="min-w-[240px] snap-start rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold tracking-wide text-slate-500">Business</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">¥4,980/月</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
                    <li>・公開ページ数: 無制限</li>
                    <li>・チーム招待 / 多言語自動翻訳</li>
                    <li>・複数拠点と担当者運用向け</li>
                  </ul>
                  <CheckoutButton
                    plan="business"
                    variant="secondary"
                    className="mt-3 min-h-[44px] w-full"
                    adaptiveBusinessCta
                    showUpgradeHint
                  >
                    Businessプランを申し込む
                  </CheckoutButton>
                </article>
                </div>
            </HorizontalScrollHint>
            <div className="mt-4 hidden md:block">
              <PricingComparisonTable />
            </div>
          </div>

          <div id="pricing-plans" className="scroll-mt-24" aria-label="3プラン（Free / Pro / Business）">
            <StaggerReveal className="hidden gap-6 lg:grid-cols-3 md:grid" staggerDelay={0.1}>
              <div className="lux-section-card rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm ring-1 ring-slate-100/80">
                <p className="text-xs font-semibold tracking-wider text-slate-500">Free</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">¥0</p>
                <p className="mt-1 text-sm text-slate-500">まずは3ページまで無料で公開して試す</p>
                <ul className="mt-6 space-y-2 text-sm text-slate-700">
                  <li>✓ 公開ページ数: 3本</li>
                  <li>✓ 編集プレビュー</li>
                  <li>✓ QR発行 / 共有URL</li>
                  <li>✓ 下書き / 公開切り替え</li>
                  <li>✓ 小規模な案内運用の開始に</li>
                </ul>
                <Button href={ctaHref} variant="secondary" className="mt-6 min-h-[44px]">
                  Freeで始める
                </Button>
                <p className="mt-3 text-xs text-slate-500">4ページ目以降の運用はProがおすすめ</p>
              </div>

              <div className="lux-section-card scale-[1.02] rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50/90 to-[#ECFDF5] p-8 shadow-lg motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-emerald-400 motion-safe:hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold tracking-wider text-emerald-700">Pro</p>
                  <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold !text-white">人気No.1</span>
                </div>
                <p className="mt-3 text-5xl font-extrabold text-emerald-600">
                  ¥1,980<span className="text-base font-normal text-slate-600">/月</span>
                </p>
                <p className="mt-1 text-sm text-slate-500">1拠点を安定して運用する</p>
                <ul className="mt-6 space-y-2 text-sm text-slate-700">
                  <li>✓ 公開ページ数: 最大10本</li>
                  <li>✓ 用途別にページを分けて更新しやすい</li>
                  <li>✓ 閲覧分析</li>
                  <li>✓ 日々の更新が発生する拠点向け</li>
                </ul>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  4ページ目以降の運用や用途分けが必要になったら、Proが最適です。
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <a
                    href="#pricing-comparison"
                    className="text-center text-xs font-medium text-slate-500 underline decoration-slate-300 underline-offset-2 transition hover:text-emerald-700 hover:decoration-emerald-400"
                  >
                    比較表の詳細を見る
                  </a>
                  <CheckoutButton
                    plan="pro"
                    className="w-full min-h-[44px] !border-ds-accent/30 !bg-ds-accent hover:!bg-ds-accent-strong hover:!shadow-[0_2px_8px_rgba(5,150,105,0.22)]"
                  >
                    Proを申し込む{hasProAnnual ? "（月払い）" : ""}
                  </CheckoutButton>
                  {hasProAnnual ? (
                    <CheckoutButton plan="pro" interval="yearly" variant="secondary" className="w-full min-h-[44px]">
                      年払い ¥19,800（2ヶ月分お得）
                    </CheckoutButton>
                  ) : null}
                </div>
              </div>

              <div className="lux-section-card rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm ring-1 ring-slate-100/80">
                <p className="text-xs font-semibold tracking-wider text-slate-500">Business</p>
                <p className="mt-3 text-4xl font-bold text-slate-900">
                  ¥4,980<span className="text-base font-normal text-slate-600">/月</span>
                </p>
                <p className="mt-1 text-sm text-slate-500">複数拠点・複数担当で継続運用する</p>
                <ul className="mt-6 space-y-2 text-sm text-slate-700">
                  <li>✓ 公開ページ数: <span className="font-semibold text-emerald-700">無制限</span></li>
                  <li>✓ 閲覧分析</li>
                  <li>✓ チーム招待（引き継ぎしやすい）</li>
                  <li className="font-semibold text-emerald-700">✓ 多言語自動翻訳（AI翻訳）</li>
                </ul>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  複数拠点と担当者の運用体制でも、案内品質をそろえて運用しやすいプランです。
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <CheckoutButton
                    plan="business"
                    variant="secondary"
                    className="w-full min-h-[44px]"
                    adaptiveBusinessCta
                    showUpgradeHint
                  >
                    Businessプランを申し込む
                  </CheckoutButton>
                  {hasBusinessAnnual ? (
                    <CheckoutButton plan="business" interval="yearly" variant="secondary" className="w-full min-h-[44px]">
                      年払い ¥49,800（2ヶ月分お得）
                    </CheckoutButton>
                  ) : null}
                </div>
              </div>
            </StaggerReveal>
          </div>
          <p className="mt-5 text-center text-sm font-medium text-slate-600">
            迷ったらPro：1名運用で最も選ばれています
          </p>
        </ScrollReveal>
      </Section>

      <Section id="faq" kicker="FAQ" title="よくある質問" variant="muted" popTitle>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl space-y-3">
            {LP_FAQ.map((row) => (
              <details
                key={row.q}
                className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm ring-1 ring-slate-100 transition-[box-shadow,border-color,transform] duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-emerald-200/60 motion-safe:hover:shadow-md open:border-emerald-200/50"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 transition-colors duration-200 group-hover:text-emerald-900">
                  <span className="inline-flex w-full items-center justify-between gap-4">
                    <span>{row.q}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{row.a}</p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </Section>

      <LpFinalCta ctaHref={ctaHref} demoEditorHref={DEMO_EDITOR_HREF} loginHref={loginHref} />

      <footer className="border-t border-slate-200/80 bg-white py-8">
        <Container className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Infomii</p>
          <div className="flex flex-wrap gap-6 text-sm">
            <Link
              href="/terms"
              className="text-slate-600 underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color,transform] duration-200 motion-safe:hover:-translate-y-px motion-safe:hover:text-emerald-700 motion-safe:hover:decoration-emerald-400/80"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-slate-600 underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color,transform] duration-200 motion-safe:hover:-translate-y-px motion-safe:hover:text-emerald-700 motion-safe:hover:decoration-emerald-400/80"
            >
              プライバシーポリシー
            </Link>
            <Link
              href={loginHref}
              className="text-slate-600 underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color,transform] duration-200 motion-safe:hover:-translate-y-px motion-safe:hover:text-emerald-700 motion-safe:hover:decoration-emerald-400/80"
            >
              ログイン
            </Link>
          </div>
        </Container>
      </footer>
    </main>
  );
}
