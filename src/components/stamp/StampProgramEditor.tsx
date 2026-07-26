"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { StampGuestScreen } from "@/components/stamp/StampGuestScreen";
import { StampBetaNotice } from "@/components/stamp/StampBetaNotice";
import { StampMark } from "@/components/stamp/StampMark";
import { StampPhoneFrame } from "@/components/stamp/StampPhoneFrame";
import { StampRotatingQr } from "@/components/stamp/StampRotatingQr";
import {
  getPage,
  getStampProgramByPageId,
  publishStampProgram,
  qrCodeImageUrl,
  updateStampProgram,
  updatePageTitle,
} from "@/lib/storage";
import {
  STAMP_ACCENT_PRESETS,
  STAMP_CAPACITY,
  STAMP_STYLE_OPTIONS,
  normalizeStampStyle,
  type StampStyleId,
} from "@/lib/stamp/styles";
import { STAMP_TIMEZONE_OPTIONS, normalizeStampTimezone } from "@/lib/stamp/day";
import {
  buildStampCardPath,
  buildStampEntryPath,
  buildStampPressPath,
} from "@/lib/stamp/types";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import "@/styles/stamp.css";

type ProgramState = {
  id: string;
  title: string;
  description: string;
  reward_title_5: string;
  reward_description_5: string;
  reward_title_10: string;
  reward_description_10: string;
  accent_color: string;
  stamp_style: StampStyleId;
  stamp_code: string;
  once_per_day: boolean;
  timezone: string;
  rotating_qr: boolean;
  status: "draft" | "published";
};

function pickReward(
  prog: Record<string, unknown>,
  tier: 5 | 10,
): { title: string; description: string } {
  const titleKey = tier === 5 ? "reward_title_5" : "reward_title_10";
  const descKey = tier === 5 ? "reward_description_5" : "reward_description_10";
  const legacyRequired = Number(prog.stamps_required);
  const title =
    (typeof prog[titleKey] === "string" && prog[titleKey]) ||
    (legacyRequired === tier && typeof prog.reward_title === "string" ? prog.reward_title : "") ||
    `${tier}個特典`;
  const description =
    (typeof prog[descKey] === "string" ? prog[descKey] : "") ||
    (legacyRequired === tier && typeof prog.reward_description === "string"
      ? prog.reward_description
      : "") ||
    "";
  return { title: String(title), description: String(description) };
}

export function StampProgramEditor() {
  const params = useParams();
  const router = useRouter();
  const pageId = typeof params.id === "string" ? params.id : "";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [slug, setSlug] = useState("");
  const [program, setProgram] = useState<ProgramState | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [opsToken, setOpsToken] = useState("");
  const [opsResult, setOpsResult] = useState<string | null>(null);
  const [previewFilled, setPreviewFilled] = useState(4);
  const [previewAnimate, setPreviewAnimate] = useState(false);
  const [previewEarnPop, setPreviewEarnPop] = useState(false);
  const [previewUseTier, setPreviewUseTier] = useState<5 | 10 | null>(null);

  const load = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    const page = await getPage(pageId);
    if (!page || page.kind !== "stamp") {
      router.replace(`/editor/${pageId}`);
      return;
    }
    setSlug(page.slug);
    const prog = await getStampProgramByPageId(pageId);
    if (!prog) {
      setMessage("スタンプ設定が見つかりません");
      setLoading(false);
      return;
    }
    const row = prog as Record<string, unknown>;
    const r5 = pickReward(row, 5);
    const r10 = pickReward(row, 10);
    setProgram({
      id: String(prog.id),
      title: String(prog.title ?? ""),
      description: String(prog.description ?? ""),
      reward_title_5: r5.title,
      reward_description_5: r5.description,
      reward_title_10: r10.title,
      reward_description_10: r10.description,
      accent_color: String(prog.accent_color || "#0f766e"),
      stamp_style: normalizeStampStyle(prog.stamp_style),
      stamp_code: String(prog.stamp_code),
      once_per_day:
        typeof prog.once_per_day === "boolean"
          ? prog.once_per_day
          : Number(prog.cooldown_hours ?? 24) > 0,
      timezone: normalizeStampTimezone(
        typeof prog.timezone === "string" ? prog.timezone : "Asia/Tokyo",
      ),
      rotating_qr: Boolean(prog.rotating_qr),
      status: prog.status === "published" ? "published" : "draft",
    });
    setPreviewFilled((prev) => Math.min(prev, STAMP_CAPACITY));
    setLoading(false);
  }, [pageId, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const entryUrl = useMemo(
    () => (slug ? `${origin}${buildStampEntryPath(slug)}` : ""),
    [origin, slug],
  );
  const pressUrl = useMemo(
    () => (program ? `${origin}${buildStampPressPath(program.stamp_code)}` : ""),
    [origin, program],
  );

  async function handleSave() {
    if (!program || !pageId) return;
    setSaving(true);
    setMessage(null);
    try {
      const title5 = program.reward_title_5.trim() || "5個特典";
      const title10 = program.reward_title_10.trim() || "10個特典";
      await updateStampProgram(pageId, {
        title: program.title.trim() || "スタンプカード",
        description: program.description,
        stamps_required: STAMP_CAPACITY,
        reward_title_5: title5,
        reward_description_5: program.reward_description_5,
        reward_title_10: title10,
        reward_description_10: program.reward_description_10,
        reward_title: title10,
        reward_description: program.reward_description_10,
        accent_color: program.accent_color || "#0f766e",
        stamp_style: normalizeStampStyle(program.stamp_style),
        once_per_day: program.once_per_day,
        timezone: normalizeStampTimezone(program.timezone),
        rotating_qr: program.rotating_qr,
        cooldown_hours: program.once_per_day ? 24 : 0,
      });
      await updatePageTitle(pageId, program.title.trim() || "スタンプカード");
      setMessage("保存しました");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(next: boolean) {
    if (!pageId) return;
    setPublishing(true);
    setMessage(null);
    try {
      await handleSave();
      await publishStampProgram(pageId, next);
      setMessage(next ? "公開しました" : "非公開にしました");
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "公開状態の更新に失敗しました");
    } finally {
      setPublishing(false);
    }
  }

  async function runOps(action: "manual_stamp" | "confirm_redeem" | "reissue") {
    setOpsResult(null);
    const token = opsToken.trim();
    if (!token) {
      setOpsResult("お客様カードのトークン（URLの /s/ 以降）を入力してください");
      return;
    }
    const supabase = getBrowserSupabaseClient();
    const access =
      (await supabase?.auth.getSession())?.data.session?.access_token ?? "";
    if (!access) {
      setOpsResult("ログインが必要です");
      return;
    }
    const res = await fetch("/api/stamp/ops", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, cardToken: token }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      stampCount?: number;
      token?: string;
    };
    if (!res.ok) {
      setOpsResult(data.error ?? "操作に失敗しました");
      return;
    }
    if (action === "reissue" && data.token) {
      setOpsResult(
        `再発行しました（アカウント紐付けは引き継ぎ）。新しいURL: ${origin}${buildStampCardPath(data.token)}`,
      );
      return;
    }
    setOpsResult(
      action === "confirm_redeem"
        ? "提示中の交換を確定しました（余りスタンプは残ります）"
        : `手動でスタンプを付与しました（現在 ${data.stampCount ?? "?"}／1日1回制限の対象外）`,
    );
  }

  if (loading) {
    return (
      <div className="stamp-editor-studio flex min-h-screen items-center justify-center text-sm text-slate-600">
        読み込み中…
      </div>
    );
  }
  if (!program) {
    return <div className="p-8 text-sm text-rose-700">{message ?? "エラー"}</div>;
  }

  const filledPreview = Math.min(previewFilled, STAMP_CAPACITY);
  const canPreviewStamp = filledPreview < STAMP_CAPACITY;

  function demoEarnStamp() {
    if (!canPreviewStamp) return;
    const next = Math.min(STAMP_CAPACITY, filledPreview + 1);
    setPreviewFilled(next);
    setPreviewAnimate(true);
    setPreviewEarnPop(true);
    window.setTimeout(() => setPreviewAnimate(false), 900);
    window.setTimeout(() => setPreviewEarnPop(false), 2800);
  }

  function demoConfirmUse() {
    if (!previewUseTier) return;
    setPreviewFilled((n) => Math.max(0, n - previewUseTier));
    setPreviewUseTier(null);
  }

  return (
    <div className="stamp-surface stamp-editor-studio text-[color:var(--stamp-ink)]">
      <StampBetaNotice />
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-[#f5f3ef]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              スタンプカード
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold tracking-normal text-amber-800">
                ベータ版
              </span>
            </p>
            <h1 className="text-xl font-bold leading-tight tracking-tight">{program.title || "無題"}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                program.status === "published"
                  ? "bg-emerald-950 text-emerald-50"
                  : "bg-black/5 text-slate-600"
              }`}
            >
              {program.status === "published" ? "公開中" : "下書き"}
            </span>
            <Link
              href="/dashboard/pages"
              className="inline-flex min-h-10 items-center rounded-xl border border-black/10 bg-white/70 px-3 text-sm font-medium"
            >
              一覧
            </Link>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex min-h-10 items-center rounded-xl border border-black/10 bg-white/70 px-3 text-sm font-medium disabled:opacity-60"
            >
              {saving ? "保存中…" : "保存"}
            </button>
            <button
              type="button"
              onClick={() => void handlePublish(program.status !== "published")}
              disabled={publishing}
              className="inline-flex min-h-10 items-center rounded-xl bg-[color:var(--stamp-ink)] px-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {publishing
                ? "更新中…"
                : program.status === "published"
                  ? "非公開にする"
                  : "公開する"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          {message ? (
            <p className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-2.5 text-sm text-emerald-950">
              {message}
            </p>
          ) : null}

          <section className="stamp-editor-panel p-5">
            <h2 className="text-base font-bold tracking-tight">基本</h2>
            <div className="mt-4 grid gap-4">
              <label className="block text-sm">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500">
                  タイトル
                </span>
                <input
                  className="stamp-field"
                  value={program.title}
                  onChange={(e) => setProgram({ ...program, title: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500">
                  説明
                </span>
                <textarea
                  className="stamp-field min-h-[76px]"
                  value={program.description}
                  onChange={(e) => setProgram({ ...program, description: e.target.value })}
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500">
                    押印ルール
                  </span>
                  <select
                    className="stamp-field"
                    value={program.once_per_day ? "daily" : "off"}
                    onChange={(e) =>
                      setProgram({
                        ...program,
                        once_per_day: e.target.value === "daily",
                      })
                    }
                  >
                    <option value="daily">1日1回（午前4時リセット）</option>
                    <option value="off">制限なし</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500">
                    施設のタイムゾーン
                  </span>
                  <select
                    className="stamp-field"
                    value={program.timezone}
                    onChange={(e) =>
                      setProgram({
                        ...program,
                        timezone: normalizeStampTimezone(e.target.value),
                      })
                    }
                  >
                    {STAMP_TIMEZONE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-slate-500">
                  プレビュー進捗 · {filledPreview}/{STAMP_CAPACITY}
                </span>
                <input
                  type="range"
                  min={0}
                  max={STAMP_CAPACITY}
                  value={filledPreview}
                  onChange={(e) => setPreviewFilled(Number(e.target.value))}
                  className="mt-3 w-full accent-[color:var(--stamp-ink)]"
                />
              </label>
              <label className="flex items-start gap-2.5 rounded-xl border border-black/10 bg-white/70 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-[color:var(--stamp-ink)]"
                  checked={program.rotating_qr}
                  onChange={(e) =>
                    setProgram({ ...program, rotating_qr: e.target.checked })
                  }
                />
                <span>
                  <span className="font-semibold">回転式の押印QRにする</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                    スタッフ端末に約90秒ごとに変わるQRを表示。写真の使い回しを防げます。
                    印刷して貼る運用の場合はオフのままにしてください。
                  </span>
                </span>
              </label>
              <p className="text-[12px] leading-relaxed text-slate-500">
                カードは常に10枠。ゲストは5個特典と10個特典を好きなタイミングで選べます。
                1日1回の場合、施設タイムゾーンの午前4時にリセットされます。
              </p>
            </div>
          </section>

          <section className="stamp-editor-panel p-5">
            <h2 className="text-base font-bold tracking-tight">特典</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {[
                {
                  key: "5" as const,
                  title: program.reward_title_5,
                  desc: program.reward_description_5,
                  setTitle: (v: string) => setProgram({ ...program, reward_title_5: v }),
                  setDesc: (v: string) => setProgram({ ...program, reward_description_5: v }),
                  label: "5個特典",
                },
                {
                  key: "10" as const,
                  title: program.reward_title_10,
                  desc: program.reward_description_10,
                  setTitle: (v: string) => setProgram({ ...program, reward_title_10: v }),
                  setDesc: (v: string) => setProgram({ ...program, reward_description_10: v }),
                  label: "10個特典",
                },
              ].map((block) => (
                <div
                  key={block.key}
                  className="rounded-[1.1rem] border border-black/[0.07] bg-white/50 p-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {block.label}
                  </p>
                  <label className="mt-3 block text-sm">
                    <span className="mb-1.5 block text-[11px] text-slate-500">タイトル</span>
                    <input
                      className="stamp-field"
                      value={block.title}
                      onChange={(e) => block.setTitle(e.target.value)}
                    />
                  </label>
                  <label className="mt-3 block text-sm">
                    <span className="mb-1.5 block text-[11px] text-slate-500">説明</span>
                    <textarea
                      className="stamp-field min-h-[72px]"
                      value={block.desc}
                      onChange={(e) => block.setDesc(e.target.value)}
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>

          <section className="stamp-editor-panel p-5">
            <h2 className="text-base font-bold tracking-tight">見た目</h2>
            <p className="mt-1 text-[12px] text-slate-500">印のスタイルとカラーで世界観を決めます。</p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STAMP_STYLE_OPTIONS.map((opt) => {
                const active = program.stamp_style === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setProgram({ ...program, stamp_style: opt.id })}
                    className={`flex flex-col items-center gap-2 rounded-[1rem] border px-2 py-3 transition ${
                      active
                        ? "border-[color:var(--stamp-ink)] bg-white shadow-sm"
                        : "border-black/[0.07] bg-white/40 hover:border-black/20"
                    }`}
                  >
                    <StampMark filled accent={program.accent_color} styleId={opt.id} size="sm" />
                    <span className="text-[11px] font-semibold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-slate-500">カラー</p>
              <div className="flex flex-wrap items-center gap-2">
                {STAMP_ACCENT_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`色 ${color}`}
                    onClick={() => setProgram({ ...program, accent_color: color })}
                    className={`h-9 w-9 rounded-full transition ${
                      program.accent_color === color
                        ? "ring-2 ring-[color:var(--stamp-ink)] ring-offset-2"
                        : "ring-1 ring-black/10"
                    }`}
                    style={{ background: color }}
                  />
                ))}
                <input
                  type="color"
                  value={program.accent_color}
                  onChange={(e) => setProgram({ ...program, accent_color: e.target.value })}
                  className="h-9 w-11 cursor-pointer rounded-lg border border-black/10 bg-white p-0.5"
                />
              </div>
            </div>
          </section>

          <section className="stamp-editor-panel p-5">
            <h2 className="text-base font-bold tracking-tight">印刷用QR</h2>
            <p className="mt-1 text-[12px] text-slate-500">
              入口は客室・フロント／各席。押印は会計・チェックアウトへ。
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.15rem] border border-dashed border-black/15 bg-[#faf8f4] p-4">
                <p className="text-sm font-semibold">入口QR</p>
                <p className="text-[11px] text-slate-500">カード発行</p>
                {entryUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeImageUrl(entryUrl, 188)}
                    alt="入口QR"
                    className="mt-3 rounded-xl bg-white p-2 shadow-sm"
                  />
                ) : null}
                <p className="mt-2 break-all text-[10px] leading-relaxed text-slate-500">
                  {entryUrl}
                </p>
              </div>

              {program.rotating_qr ? (
                <StampRotatingQr pageId={pageId} origin={origin} />
              ) : (
                <div className="rounded-[1.15rem] border border-dashed border-black/15 bg-[#faf8f4] p-4">
                  <p className="text-sm font-semibold">押印QR</p>
                  <p className="text-[11px] text-slate-500">会計時（印刷して掲示）</p>
                  {pressUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrCodeImageUrl(pressUrl, 188)}
                      alt="押印QR"
                      className="mt-3 rounded-xl bg-white p-2 shadow-sm"
                    />
                  ) : null}
                  <p className="mt-2 break-all text-[10px] leading-relaxed text-slate-500">
                    {pressUrl}
                  </p>
                </div>
              )}
            </div>
            {program.rotating_qr ? (
              <p className="mt-3 text-[11px] leading-relaxed text-amber-700">
                回転式のため押印QRは印刷できません。会計時にスタッフ端末でこの画面を開いて提示してください。
              </p>
            ) : null}
          </section>

          <section className="stamp-editor-panel p-5">
            <h2 className="text-base font-bold tracking-tight">運用</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
              通常の特典利用はゲストがカード上で確認ダイアログを進めて完了します。
              ここはトラブル時の手動対応用です。再発行時はアカウント紐付けを引き継ぎます。
            </p>
            <input
              className="stamp-field mt-3 text-sm"
              placeholder="カードトークン"
              value={opsToken}
              onChange={(e) => setOpsToken(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["manual_stamp", "手動＋1（制限対象外）"],
                  ["confirm_redeem", "提示中の交換を確定"],
                  ["reissue", "再発行（紐付け引き継ぎ）"],
                ] as const
              ).map(([action, label]) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium transition hover:bg-white"
                  onClick={() => void runOps(action)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
              「提示中の交換を確定」は旧フロー（pending_redeem）向けです。通常のゲスト自己利用では不要です。
            </p>
            {opsResult ? <p className="mt-3 text-sm text-slate-700">{opsResult}</p> : null}
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <StampPhoneFrame label="ゲスト画面プレビュー" width={340}>
            <StampGuestScreen
              compact
              title={program.title}
              description={program.description}
              reward5={{
                title: program.reward_title_5,
                description: program.reward_description_5,
              }}
              reward10={{
                title: program.reward_title_10,
                description: program.reward_description_10,
              }}
              accent={program.accent_color}
              styleId={program.stamp_style}
              stampCount={filledPreview}
              animateLatest={previewAnimate}
              earnPopOpen={previewEarnPop}
              onEarnPopClose={() => setPreviewEarnPop(false)}
              useConfirmTier={previewUseTier}
              onUseReward={(tier) => setPreviewUseTier(tier)}
              onCancelUse={() => setPreviewUseTier(null)}
              onConfirmUse={demoConfirmUse}
              statusLabel={
                program.status === "published" ? "公開中プレビュー" : "下書きプレビュー"
              }
              footerNote="※この画面はプレビューです。実機ではカメラ読取・1日1回制限・確認ダイアログ・アカウント保存が動きます"
              primaryAction={
                canPreviewStamp ? (
                  <button
                    type="button"
                    onClick={demoEarnStamp}
                    className="stamp-cta stamp-cta-primary"
                  >
                    スキャンしてスタンプを獲得
                  </button>
                ) : null
              }
            />
          </StampPhoneFrame>
        </aside>
      </div>
    </div>
  );
}
