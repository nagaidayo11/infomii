"use client";

import { motion } from "framer-motion";
import { Button, Container } from "@/components/ui";
import { FadeIn } from "@/components/motion";

function IconWifi({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12.55c4.7-4.15 9.3-4.15 14 0" />
      <path d="M8.5 16c2.4-2.1 4.6-2.1 7 0" />
      <path d="M12 20h.01" />
    </svg>
  );
}

function IconForkKnife({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7 3v9a4 4 0 0 0 4 4v5" />
      <path d="M17 3v7" />
      <path d="M20 3v5c0 2-1 3-3 3h-1" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  );
}

function IconInfo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v6" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function GuestPhoneScreen() {
  return (
    <div className="flex h-full flex-col px-3 pt-3">
      {/* Hero block (top) */}
      <div>
        <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="mt-2 w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-300 relative aspect-[16/9]">
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute left-3 bottom-3">
            <p className="text-[10px] font-bold text-white/95">Infomii Hotel</p>
            <p className="mt-0.5 text-[8.5px] text-white/80">
              館内案内をスマートにまとめました
            </p>
          </div>
        </div>
      </div>

      {/* Icon labels (2 rows x 2 columns) */}
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {[
          { label: "WiFi", icon: <IconWifi className="h-4 w-4 text-slate-700" /> },
          { label: "朝食", icon: <IconForkKnife className="h-4 w-4 text-slate-700" /> },
          { label: "チェックアウト", icon: <IconClock className="h-4 w-4 text-slate-700" /> },
          { label: "お知らせ", icon: <IconInfo className="h-4 w-4 text-slate-700" /> },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-slate-50 p-1.5 ring-1 ring-slate-200/80 text-center"
          >
            <div className="flex items-center justify-center">{item.icon}</div>
            <p className="mt-1 text-[8.5px] font-semibold text-slate-800">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Breakfast block */}
      <div className="mt-3 rounded-lg border border-slate-200/80 bg-white/70 px-2 py-1">
        <p className="text-[9px] font-semibold text-slate-800">朝食バイキング</p>
        <p className="mt-0.5 text-[8.5px] text-slate-600">時間：6:00-9:00</p>
        <p className="mt-0.5 text-[8.5px] text-slate-600">場所：1F</p>
        <p className="mt-1 text-[8.5px] font-semibold text-slate-700">朝食ビュッフェ</p>
      </div>
    </div>
  );
}

function HeroVisuals() {
  return (
    <motion.div
      className="relative mx-auto grid w-full max-w-[1480px] grid-cols-1 items-center gap-10 sm:gap-12 lg:items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,375px)_minmax(0,0.45fr)] lg:gap-8 xl:gap-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Left: large editor visual */}
      <div className="flex min-w-0 flex-col items-center gap-3 lg:h-full">
        <motion.div
          className="w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] lg:h-[520px] xl:h-[560px]"
          whileHover={{
            scale: 1.01,
            boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
            transition: { duration: 0.2 },
          }}
        >
          <div className="flex h-full w-full flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-10 rounded-full bg-slate-200" />
                <div className="h-2.5 w-16 rounded-full bg-slate-100" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-14 rounded-full bg-slate-100" />
                <div className="h-2.5 w-8 rounded-full bg-slate-100" />
              </div>
            </div>

            {/* Body */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
              {/* Sidebar */}
              <aside className="w-24 shrink-0 border-r border-slate-200/70 bg-slate-50 px-3 py-4">
                <div className="h-2 w-full rounded bg-slate-200" />
                <div className="mt-3 h-2 w-full rounded bg-slate-200" />
                <div className="mt-3 h-2 w-[70%] rounded bg-slate-200" />
                <div className="mt-6 space-y-3">
                  <div className="h-2 w-full rounded bg-slate-200" />
                  <div className="h-2 w-[85%] rounded bg-slate-200" />
                  <div className="h-2 w-[60%] rounded bg-slate-200" />
                </div>
              </aside>

              {/* Editor canvas */}
              <main className="min-w-0 flex-1 bg-white p-5">
                <div className="h-full overflow-hidden rounded-lg border border-slate-200/70 bg-slate-50">
                  <div className="p-4">
                    <div className="h-3 w-24 rounded bg-slate-200" />
                      {/* Preview: guest phone mock (same wrapper behavior as the guest) */}
                      <div className="mt-3 relative mx-auto aspect-[9/18] w-[min(375px,100%)] overflow-hidden rounded-[1.9rem] shadow-md ring-1 ring-slate-200/80">
                        <div className="absolute inset-0 bg-[#dbe3ed]" />
                        <div className="absolute inset-[10px] rounded-[1.65rem] bg-white shadow-sm ring-1 ring-slate-200/60">
                          <GuestPhoneScreen />
                        </div>
                      </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {[
                        { label: "WiFi", icon: <IconWifi className="h-6 w-6 text-slate-700" /> },
                        { label: "朝食", icon: <IconForkKnife className="h-6 w-6 text-slate-700" /> },
                        { label: "チェックアウト", icon: <IconClock className="h-6 w-6 text-slate-700" /> },
                        { label: "お知らせ", icon: <IconInfo className="h-6 w-6 text-slate-700" /> },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl bg-white/70 ring-1 ring-slate-200/80 p-3 text-center">
                          <div className="flex items-center justify-center">{item.icon}</div>
                          <p className="mt-2 text-[11px] font-semibold text-slate-800">{item.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-xl bg-white/70 ring-1 ring-slate-200/80 p-3">
                      <p className="text-[11px] font-semibold text-slate-800">朝食バイキング</p>
                      <p className="mt-1 text-[10px] text-slate-600">時間：6:00-9:00</p>
                      <p className="mt-1 text-[10px] text-slate-600">場所：1F</p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="h-2 w-16 rounded bg-slate-200" />
                        <div className="h-2 w-10 rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </main>

              {/* Right side tabs (visual balance) */}
              <aside className="w-24 shrink-0 border-l border-slate-200/70 bg-slate-50 px-3 py-4">
                <div className="h-2 w-full rounded bg-slate-200" />
                <div className="mt-3 h-2 w-full rounded bg-slate-200" />
                <div className="mt-3 h-2 w-[65%] rounded bg-slate-200" />
                <div className="mt-6 space-y-3">
                  <div className="h-2 w-[85%] rounded bg-slate-200" />
                  <div className="h-2 w-full rounded bg-slate-200" />
                  <div className="h-2 w-[60%] rounded bg-slate-200" />
                </div>
              </aside>
            </div>
          </div>
        </motion.div>
        <p className="text-center text-sm font-semibold text-slate-700">ページエディタ</p>
      </div>

      {/* Middle: guest phone */}
      <div className="flex min-w-0 flex-col items-center gap-3 lg:h-full">
        <motion.div
          className="relative mx-auto aspect-[9/18] w-[min(330px,100%)] overflow-hidden rounded-[1.9rem] shadow-md ring-1 ring-slate-200/80 sm:w-[min(360px,100%)] lg:h-[520px] lg:w-[375px] lg:max-w-full lg:aspect-auto xl:h-[560px]"
          whileHover={{
            scale: 1.03,
            rotate: -1.5,
            transition: { duration: 0.2 },
          }}
        >
          <div className="absolute inset-0 bg-[#dbe3ed]" />
          <div className="absolute inset-[10px] rounded-[1.65rem] bg-white shadow-sm ring-1 ring-slate-200/60">
            <GuestPhoneScreen />
          </div>
        </motion.div>
        <p className="text-center text-sm font-semibold text-slate-700">ゲストのスマホ画面</p>
      </div>

      {/* Right: QR (smaller) */}
      <div className="flex min-w-0 flex-col items-center justify-center gap-3 lg:h-full lg:justify-self-center">
        <motion.div
          className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-md sm:h-24 sm:w-24"
          whileHover={{ scale: 1.08, rotate: 5, transition: { duration: 0.2 } }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[70%] w-[70%] shrink-0 text-slate-700"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <path d="M14 14h1v4h4v-4" />
            <path d="M14 17h4" />
          </svg>
        </motion.div>
        <p className="text-center text-sm font-semibold text-slate-700">QRコード</p>
      </div>
    </motion.div>
  );
}

type LpHeroProps = {
  ctaHref: string;
  /** 登録なしで触れるサンプル（公開ゲストページ） */
  samplePageHref: string;
  /** 登録なしで触れるデモエディタ */
  demoEditorHref?: string;
};

export function LpHero({ ctaHref, samplePageHref, demoEditorHref = "/demo/editor" }: LpHeroProps) {
  return (
    <section className="border-b border-slate-200/80 bg-white overflow-x-hidden">
      {/* コピー・CTAは従来どおりコンテナ幅 */}
      <Container className="pt-16 sm:pt-20 lg:pt-24">
        <div className="mx-auto max-w-5xl text-center">
          <FadeIn>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
              ビジネスホテル・少人数運営・外国人対応に強い
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              <span className="block text-2xl sm:text-3xl lg:text-4xl">
                フロント対応、まだ口頭でやってますか？
              </span>
              <span className="mt-5 block">
                QRひとつで
                <span className="text-emerald-600">「全部伝わる館内案内」</span>
                を3分で。
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 sm:text-xl">
              WiFi・朝食・設備案内を1ページに集約。
              <br className="hidden sm:block" />
              説明・紙・更新の手間をゼロに近づけます。
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button href={demoEditorHref} size="lg">
                30秒で試す（登録なし）
              </Button>
              <Button href="#live-demo" variant="secondary" size="lg">
                実際の画面を見る
              </Button>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              すぐに作成するなら{" "}
              <a
                href={ctaHref}
                className="font-semibold text-emerald-700 underline decoration-emerald-300/80 underline-offset-2 hover:text-emerald-800"
              >
                無料でページを作成
              </a>
            </p>
          </FadeIn>
        </div>
      </Container>

      {/* ビジュアル：フルブリード背景の上に幅90%で配置 */}
      <div
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] pb-16 pt-10 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14"
        aria-label="プロダクト画面の例"
      >
        <div className="mx-auto w-[90%] max-w-[100%] px-4 sm:px-6">
          <HeroVisuals />
          <p className="mt-3 text-center text-xs text-slate-500">※イメージです</p>
        </div>
      </div>
    </section>
  );
}
