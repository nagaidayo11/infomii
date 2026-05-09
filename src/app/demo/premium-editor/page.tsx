"use client";

import { useMemo, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";

const BG = "#0F1115";
const CARD = "#1B1F2A";
const ACCENT = "#8BAFEC";
const EASE = [0.22, 1, 0.36, 1] as const;

type Lang = "ja" | "en";

type BlockKind = "wifi" | "breakfast" | "facility" | "happyhour" | "qr" | "new";

export default function PremiumEditorDemoPage() {
  const reduceMotion = useReducedMotion();
  const [lang, setLang] = useState<Lang>("ja");
  const baseOrder = useMemo(
    () => ["wifi", "breakfast", "facility", "happyhour", "qr"] as BlockKind[],
    []
  );
  const [extras, setExtras] = useState<BlockKind[]>([]);

  const blocks = [...baseOrder, ...extras];

  const addSoftBlock = () => {
    if (extras.includes("new")) return;
    setExtras((e) => [...e, "new"]);
    window.setTimeout(() => setExtras((e) => e.filter((x) => x !== "new")), 4200);
  };

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.65, ease: EASE };

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden font-sans text-white antialiased [--demo-card-ring:rgba(139,175,236,0.12)] [--demo-accent:#8BAFEC]"
      style={{ backgroundColor: BG }}
    >
      {/* Cinematics: ambient drift */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-[20%] top-[-14%] h-[560px] w-[560px] rounded-full opacity-[0.14]"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${ACCENT}, transparent 68%)`,
            filter: "blur(72px)",
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 42, -18, 0],
                  y: [0, 28, -12, 0],
                  scale: [1, 1.04, 0.98, 1],
                }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-18%] right-[-28%] h-[480px] w-[480px] rounded-full opacity-[0.09]"
          style={{
            background: `radial-gradient(circle at 60% 50%, rgba(255,255,255,0.35), transparent 70%)`,
            filter: "blur(80px)",
          }}
          animate={
            reduceMotion
              ? undefined
              : { x: [0, -56, 20, 0], y: [0, -24, 16, 0] }
          }
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto flex min-h-[100dvh] flex-col items-center px-4 pb-14 pt-12 sm:px-6">
        {/* Device shell */}
        <motion.div
          className="relative w-full max-w-[400px]"
          initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.965 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, ease: EASE, delay: reduceMotion ? 0 : 0.08 }}
        >
          {/* Floating outer glow */}
          <motion.div
            className="absolute -inset-3 rounded-[48px] opacity-55 blur-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,175,236,0.22) 0%, transparent 52%, rgba(255,255,255,0.06) 100%)",
            }}
            animate={
              reduceMotion ? undefined : { opacity: [0.45, 0.72, 0.5], scale: [0.98, 1.01, 0.98] }
            }
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          <div
            className="relative overflow-hidden rounded-[40px] border border-white/[0.08] p-[11px]"
            style={{
              background:
                "linear-gradient(155deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 40%, rgba(0,0,0,0.2) 100%)",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.04) inset, 0 44px 100px -32px rgba(0,0,0,0.75)",
            }}
          >
            <div
              className="relative overflow-hidden rounded-[32px]"
              style={{ backgroundColor: BG }}
            >
              {/* Top */}
              <div className="flex items-center justify-between px-7 pb-5 pt-7">
                <motion.div layout="position">
                  <p className="text-[15px] font-semibold tracking-[-0.03em] text-white/92">
                    Infomii
                  </p>
                  <p className="mt-1 text-[11px] font-medium tracking-wide text-white/38">
                    {lang === "ja" ? "館内コンテンツ" : "Guest content"}
                  </p>
                </motion.div>
                <LangSwitch lang={lang} onLang={setLang} reduceMotion={!!reduceMotion} />
              </div>

              {/* Canvas */}
              <div className="space-y-4 px-5 pb-28 pt-2">
                <motion.p
                  className="px-2 text-[12px] font-medium tracking-[0.18em] text-white/34"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  EDITOR · MOBILE
                </motion.p>

                <LayoutGroup id="editor-blocks">
                  <div className="space-y-4">
                    <AnimatePresence initial={false} mode="popLayout">
                      {blocks.map((kind, idx) => (
                        <BlockCard
                          key={`${kind}-${idx}`}
                          kind={kind}
                          index={idx}
                          lang={lang}
                          reduceMotion={!!reduceMotion}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </LayoutGroup>

                <motion.button
                  type="button"
                  className="group mt-8 flex w-full items-center justify-center gap-2 rounded-[20px] border border-white/[0.09] px-5 py-[14px] text-[13px] font-semibold tracking-tight text-white/55 outline-none backdrop-blur-sm transition-colors hover:border-white/[0.16] hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[var(--demo-accent)]/35"
                  style={{
                    background: "rgba(255,255,255,0.035)",
                  }}
                  onClick={addSoftBlock}
                  whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.986 }}
                  layout
                  transition={{ layout: transition }}
                >
                  <motion.span
                    className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[var(--demo-accent)]"
                    animate={
                      reduceMotion ? undefined : { rotate: [0, 90, 0], scale: [1, 1.08, 1] }
                    }
                    transition={{ duration: 3.8, repeat: Infinity, ease: EASE }}
                  >
                    +
                  </motion.span>
                  {lang === "ja" ? "ブロックを追加" : "Add block"}
                </motion.button>
              </div>

              {/* Bottom dock */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 border-t border-white/[0.06] px-5 py-6"
                style={{
                  background: "linear-gradient(180deg, rgba(15,17,21,0) 0%, rgba(15,17,21,0.94) 40%)",
                }}
                initial={reduceMotion ? false : { y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
              >
                <div className="flex flex-col gap-3">
                  <motion.button
                    type="button"
                    className="w-full rounded-[18px] py-[14px] text-[14px] font-semibold tracking-tight outline-none shadow-[0_18px_50px_-20px_rgba(139,175,236,0.55)] ring-2 ring-transparent transition-shadow focus-visible:ring-[rgba(139,175,236,0.45)]"
                    style={{
                      background: ACCENT,
                      color: BG,
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.12) inset",
                    }}
                    whileHover={
                      reduceMotion ? undefined : { y: -2, boxShadow: `0 24px 54px -18px rgba(139,175,236,0.65)` }
                    }
                    whileTap={reduceMotion ? undefined : { scale: 0.986 }}
                  >
                    {lang === "ja" ? "プレビューで確認" : "Preview"}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="w-full rounded-[18px] border border-white/[0.1] py-[13px] text-[14px] font-semibold tracking-tight text-white/78 outline-none transition-colors hover:border-white/[0.16] hover:text-white hover:bg-white/[0.035]"
                    style={{ background: "rgba(255,255,255,0.02)" }}
                    whileTap={reduceMotion ? undefined : { scale: 0.986 }}
                  >
                    {lang === "ja" ? "公開準備へ" : "Prepare publish"}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function LangSwitch({
  lang,
  onLang,
  reduceMotion,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  reduceMotion: boolean;
}) {
  return (
    <div className="relative flex rounded-full border border-white/[0.08] bg-white/[0.04] p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
      {(["ja", "en"] as const).map((code) => {
        const active = lang === code;
        return (
          <button
            key={code}
            type="button"
            className={`relative z-10 min-h-[38px] min-w-[42px] rounded-full px-[12px] text-[11px] font-semibold tracking-[0.2em] transition-colors hover:text-white/90`}
            style={{ WebkitTapHighlightColor: "transparent", color: active ? BG : "rgba(255,255,255,0.45)" }}
            onClick={() => onLang(code)}
          >
            {active ? (
              <motion.span
                layoutId={reduceMotion ? undefined : "lang-chip"}
                className="absolute inset-0 rounded-full shadow-sm"
                style={{
                  background: "linear-gradient(180deg, #f5f7ff 0%, #dbe7ff 100%)",
                  boxShadow: `0 0 0 1px rgba(139,175,236,0.35), 0 8px 20px -6px rgba(139,175,236,0.45)`,
                }}
                transition={{ type: "spring", stiffness: 520, damping: 34 }}
              />
            ) : null}
            <span className="relative z-[1]">{code.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}

function BlockCard({
  kind,
  index,
  lang,
  reduceMotion,
}: {
  kind: BlockKind;
  index: number;
  lang: Lang;
  reduceMotion: boolean;
}) {
  const delay = reduceMotion ? 0 : Math.min(index * 0.07 + 0.12, 0.55);

  const content =
    kind === "wifi"
      ? {
          k: lang === "ja" ? "Wi‑Fi" : "Wi‑Fi",
          t: lang === "ja" ? "InstaComfort" : "InstaComfort",
          s:
            lang === "ja"
              ? "チェックインIDで自動ログインされます。"
              : "Sign in seamlessly at check‑in.",
        }
      : kind === "breakfast"
        ? {
            k: lang === "ja" ? "朝食" : "Breakfast",
            t: lang === "ja" ? "サンライズテラス" : "Sunrise Terrace",
            s: lang === "ja" ? "6:30 — 11:00 · 24F" : "6:30 AM — 11:00 AM · 24F",
          }
        : kind === "facility"
          ? {
              k: lang === "ja" ? "館内案内" : "Facilities",
              t: lang === "ja" ? "Urban Lounge" : "Urban Lounge",
              s:
                lang === "ja"
                  ? "ワークラウンジ・大浴場 · 館内すべてアクセス一覧"
                  : "Work lounge & spa · curated map.",
            }
          : kind === "happyhour"
            ? {
                k: "Happy Hour",
                t: lang === "ja" ? "グラスワークBar" : "Glasswork Bar",
                s: lang === "ja" ? "17:00 — 21:30 · アペリティーボックス付き" : "5:00 — 9:30 PM · aperitif box",
              }
            : kind === "qr"
              ? {
                  k: "QR",
                  t: lang === "ja" ? "ゲスト用リンク" : "Guest link",
                  s: lang === "ja" ? "部屋にも置ける、一枚のインフォ" : "One sheet for rooms & desks.",
                }
              : {
                  k: lang === "ja" ? "新規セクション" : "New section",
                  t: lang === "ja" ? "ドラフト準備済み" : "Draft staged",
                  s: lang === "ja" ? "タイトルをタップして編集" : "Tap title to refine copy.",
                };

  const isQr = kind === "qr";

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        reduceMotion ? undefined : { opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.38, ease: EASE } }
      }
      transition={{ duration: 0.6, ease: EASE, delay }}
      style={{ backgroundColor: CARD }}
      className="relative overflow-hidden rounded-[24px] border border-white/[0.06]"
      whileHover={
        reduceMotion ? undefined : { y: -3, transition: { duration: 0.28, ease: EASE } }
      }
    >
      <motion.div
        className="pointer-events-none absolute -right-[30%] -top-[40%] h-[220px] w-[220px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle at 35% 35%, rgba(139,175,236,0.18), transparent 68%)`,
        }}
        animate={reduceMotion ? undefined : { opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 5.2 + index * 0.35, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative px-6 pb-7 pt-[22px]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em]" style={{ color: ACCENT }}>
              {content.k}
            </p>
            <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.03em] text-white/93">{content.t}</h3>
            <p className="mt-2 text-[13px] font-medium leading-relaxed tracking-tight text-white/45">{content.s}</p>
          </div>
          <DecorGlyph kind={kind} reduceMotion={reduceMotion} />
        </div>

        {isQr ? <QrGlow reduceMotion={reduceMotion} lang={lang} /> : null}
      </div>
    </motion.article>
  );
}

function DecorGlyph({
  kind,
  reduceMotion,
}: {
  kind: BlockKind;
  reduceMotion?: boolean;
}) {
  const ring =
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm";
  if (kind === "wifi")
    return (
      <div className={ring}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[var(--demo-accent)]">
          <path
            d="M12 20.75a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM9 16.95a10 10 0 0 1 6 3.2M17.657 13.757a13 13 0 1 0-11.314 0M20.728 11.728a16.5 16.5 0 0 0-21.456 0"
            stroke="currentColor"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  if (kind === "breakfast")
    return (
      <div className={ring}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--demo-accent)]">
          <path d="M6 14h12a2 2 0 0 1 0 4H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M6 11V9a4 4 0 1 1 8 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
    );
  if (kind === "facility")
    return (
      <div className={ring}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--demo-accent)]">
          <path
            d="M4 21V11l8-9 8 9v10M9 21v-6h6v6"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  if (kind === "happyhour")
    return (
      <div className={ring}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--demo-accent)]">
          <path
            d="M8 21h10M16 21V11M8 21V11l4-6 4 6M9 6h12l-4 10h4"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  if (kind === "qr")
    return (
      <div className={ring}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--demo-accent)]">
          <path d="M4 9V4h5M14 20h6v-6M4 14v6h6v-6H4Zm10-10V4h6v6h-6Z" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
        </svg>
      </div>
    );
  return (
    <div className={ring}>
      <motion.span
        className="text-[var(--demo-accent)]"
        animate={reduceMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        ◆
      </motion.span>
    </div>
  );
}

function QrGlow({ reduceMotion, lang }: { reduceMotion: boolean; lang: Lang }) {
  return (
    <motion.div
      className="mt-8 rounded-[18px] border border-white/[0.08] p-6"
      style={{ background: "rgba(255,255,255,0.022)" }}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.2, duration: 0.55, ease: EASE }}
    >
      <div className="grid grid-cols-7 gap-[5px]" aria-hidden>
        {Array.from({ length: 49 }).map((_, i) => (
          <motion.div
            key={i}
            className={`aspect-square rounded-[3px] ${
              [0, 1, 2, 6, 8, 12, 14, 41, 42, 43, 47].includes(i) ? "bg-white/88" : "bg-white/[0.12]"
            }`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : i * 0.006, duration: 0.25, ease: EASE }}
          />
        ))}
      </div>
      <motion.p
        className="mt-5 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/32"
        animate={reduceMotion ? undefined : { opacity: [0.28, 0.55, 0.28] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {lang === "ja" ? "QR生成プリセット" : "QR PRESET READY"}
      </motion.p>
    </motion.div>
  );
}
