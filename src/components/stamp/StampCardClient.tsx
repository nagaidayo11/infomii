"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { StampGuestScreen } from "@/components/stamp/StampGuestScreen";
import { buildAuthCallbackUrl } from "@/lib/auth-redirect";
import { normalizeStampStyle, type StampRewardTier } from "@/lib/stamp/styles";
import type { StampCardView } from "@/lib/stamp/types";
import {
  STAMP_CARD_STORAGE_PREFIX,
  buildStampCardPath,
  buildStampScanPath,
  extractStampCodeFromScanText,
} from "@/lib/stamp/types";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import "@/styles/stamp.css";

function formatCooldownLabel(
  nextStampAt: string | null | undefined,
  timezone?: string,
): string | null {
  if (!nextStampAt) return null;
  const next = new Date(nextStampAt);
  if (Number.isNaN(next.getTime()) || next.getTime() <= Date.now()) return null;
  const label = next.toLocaleString("ja-JP", {
    timeZone: timezone || undefined,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `本日分は済み · 次は ${label} 以降`;
}

async function getAccessToken(): Promise<string | null> {
  const client = getBrowserSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}

export function StampCardClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = typeof params.token === "string" ? decodeURIComponent(params.token) : "";
  const [view, setView] = useState<StampCardView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [animateLatest, setAnimateLatest] = useState(false);
  const [earnPopOpen, setEarnPopOpen] = useState(false);
  const [useConfirmTier, setUseConfirmTier] = useState<StampRewardTier | null>(null);
  const [useBusy, setUseBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{
    current: { token: string; path: string; stampCount: number };
    existing: { token: string; path: string; stampCount: number };
  } | null>(null);
  const prevCountRef = useRef<number | null>(null);
  const linkAttemptedRef = useRef(false);
  const earnedHandledRef = useRef(false);

  const reload = useCallback(
    async (opts?: { celebrate?: boolean }) => {
      if (!token) return;
      const res = await fetch(`/api/stamp/cards/${encodeURIComponent(token)}`);
      const data = (await res.json().catch(() => ({}))) as StampCardView & { error?: string };
      if (!res.ok) {
        setError(data.error ?? "カードを読み込めません");
        setView(null);
        return;
      }
      const gained =
        opts?.celebrate === true ||
        (prevCountRef.current !== null && data.stampCount > prevCountRef.current);
      if (gained) {
        setAnimateLatest(true);
        setEarnPopOpen(true);
        window.setTimeout(() => setAnimateLatest(false), 900);
        window.setTimeout(() => setEarnPopOpen(false), 2800);
      }
      prevCountRef.current = data.stampCount;
      setView(data);
      setError(null);
      if (data.program.pageSlug) {
        window.localStorage.setItem(
          `${STAMP_CARD_STORAGE_PREFIX}${data.program.pageSlug}`,
          token,
        );
      }
    },
    [token],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  const linkToAccount = useCallback(
    async (resolve?: "current" | "existing") => {
      const accessToken = await getAccessToken();
      if (!accessToken || !token) return false;
      setSaveBusy(true);
      try {
        const res = await fetch(`/api/stamp/cards/${encodeURIComponent(token)}/link`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resolve ? { resolve } : {}),
        });
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          path?: string;
          token?: string;
          switchedToExisting?: boolean;
          conflict?: boolean;
          current?: { token: string; path: string; stampCount: number };
          existing?: { token: string; path: string; stampCount: number };
          view?: StampCardView;
        };
        if (!res.ok) throw new Error(data.error ?? "保存に失敗しました");

        if (data.conflict && data.current && data.existing) {
          setConflict({ current: data.current, existing: data.existing });
          return false;
        }

        setConflict(null);

        if (data.switchedToExisting && data.token && data.token !== token) {
          if (view?.program.pageSlug) {
            window.localStorage.setItem(
              `${STAMP_CARD_STORAGE_PREFIX}${view.program.pageSlug}`,
              data.token,
            );
          }
          setSaveNote("保存済みのカードを開きます。");
          router.replace(data.path ?? buildStampCardPath(data.token));
          return true;
        }

        if (data.view) setView(data.view);
        else await reload();
        setSaveNote("アカウントに保存しました。別の端末からも復元できます。");
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "保存に失敗しました");
        return false;
      } finally {
        setSaveBusy(false);
      }
    },
    [reload, router, token, view?.program.pageSlug],
  );

  useEffect(() => {
    if (!token || linkAttemptedRef.current) return;
    const shouldSave =
      searchParams.get("save") === "1" || searchParams.get("linked") === "1";
    if (!shouldSave) return;
    linkAttemptedRef.current = true;
    void (async () => {
      await linkToAccount();
      router.replace(buildStampCardPath(token));
    })();
  }, [linkToAccount, router, searchParams, token]);

  useEffect(() => {
    if (!view || !token || earnedHandledRef.current) return;
    if (searchParams.get("earned") !== "1") return;
    earnedHandledRef.current = true;
    setAnimateLatest(true);
    setEarnPopOpen(true);
    window.setTimeout(() => setAnimateLatest(false), 900);
    window.setTimeout(() => setEarnPopOpen(false), 2800);
    prevCountRef.current = view.stampCount;
    router.replace(buildStampCardPath(token));
  }, [router, searchParams, token, view]);

  function openCameraScan() {
    setError(null);
    router.push(buildStampScanPath(token));
  }

  async function applyCode(stampCode: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/stamp/cards/${encodeURIComponent(token)}/stamp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stampCode }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "スタンプを付けられませんでした");
      setShowManual(false);
      await reload({ celebrate: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setBusy(false);
    }
  }

  async function confirmUse() {
    if (!useConfirmTier) return;
    setUseBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/stamp/cards/${encodeURIComponent(token)}/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: useConfirmTier }),
      });
      const data = (await res.json().catch(() => ({}))) as StampCardView & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "特典の使用に失敗しました");
      setUseConfirmTier(null);
      prevCountRef.current = data.stampCount ?? 0;
      setView(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
    } finally {
      setUseBusy(false);
    }
  }

  async function startSaveOAuth(provider: "google" | "apple") {
    const client = getBrowserSupabaseClient();
    if (!client) {
      setError("認証の準備ができていません");
      return;
    }
    setSaveBusy(true);
    setError(null);
    const accessToken = await getAccessToken();
    if (accessToken) {
      await linkToAccount();
      return;
    }
    const { error: oauthError } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildAuthCallbackUrl({
          next: `${buildStampCardPath(token)}?save=1`,
        }),
      },
    });
    if (oauthError) {
      setSaveBusy(false);
      setError(oauthError.message || "ログインを開始できませんでした");
    }
  }

  if (!view) {
    return (
      <main className="stamp-surface mx-auto flex min-h-[100dvh] max-w-md items-center justify-center bg-[#f6f8fa] px-6">
        <p className="text-sm text-slate-600">{error ?? "読み込み中…"}</p>
      </main>
    );
  }

  const accent = view.program.accentColor || "#0f766e";
  const styleId = normalizeStampStyle(view.program.stampStyle);
  const cooldownLabel = formatCooldownLabel(view.nextStampAt, view.program.timezone);
  const entryHint = view.program.pageSlug
    ? `なくした場合は入口QRから再開するか、アカウント保存済みなら同じアカウントで復元できます。`
    : "なくした場合は入口QRから再開してください。";

  return (
    <main className="mx-auto min-h-[100dvh] max-w-md bg-[#f6f8fa]">
      <StampGuestScreen
        title={view.program.title}
        description={view.program.description}
        reward5={{
          title: view.program.rewardTitle5,
          description: view.program.rewardDescription5,
        }}
        reward10={{
          title: view.program.rewardTitle10,
          description: view.program.rewardDescription10,
        }}
        accent={accent}
        styleId={styleId}
        stampCount={view.stampCount}
        cooldownLabel={cooldownLabel}
        animateLatest={animateLatest}
        earnPopOpen={earnPopOpen}
        onEarnPopClose={() => setEarnPopOpen(false)}
        useConfirmTier={useConfirmTier}
        useConfirmBusy={useBusy}
        onUseReward={(tier) => setUseConfirmTier(tier)}
        onCancelUse={() => setUseConfirmTier(null)}
        onConfirmUse={() => void confirmUse()}
        footerNote={`ブックマークかホーム画面追加もおすすめです。${entryHint}`}
        primaryAction={
          !view.isFull ? (
            <button
              type="button"
              disabled={busy || Boolean(cooldownLabel)}
              onClick={openCameraScan}
              className="stamp-cta stamp-cta-primary"
            >
              {cooldownLabel ? "本日分は済み" : "カメラでスキャンして獲得"}
            </button>
          ) : null
        }
        secondaryActions={
          <>
            {!view.isFull ? (
              <>
                <button
                  type="button"
                  className="w-full text-center text-[12px] text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                  onClick={() => setShowManual((v) => !v)}
                >
                  {showManual ? "コード入力を閉じる" : "コードで付与する"}
                </button>
                {showManual ? (
                  <div className="rounded-[1.15rem] border border-slate-200 bg-white p-3.5">
                    <div className="flex gap-2">
                      <input
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400"
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="押印コード"
                      />
                      <button
                        type="button"
                        disabled={busy}
                        className="rounded-xl bg-slate-900 px-3.5 text-sm font-semibold text-white"
                        onClick={() => {
                          const code =
                            extractStampCodeFromScanText(manualCode) ?? manualCode.trim();
                          if (code) void applyCode(code);
                        }}
                      >
                        付与
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}

            {view.linkedToAccount ? (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-[12px] font-medium text-emerald-800">
                アカウントに保存済み · 別端末でも復元できます
              </p>
            ) : (
              <div className="rounded-[1.15rem] border border-slate-200 bg-white p-3.5">
                <p className="text-center text-[12px] leading-relaxed text-slate-600">
                  任意：Google / Appleで保存すると、機種変更後もカードを復元できます
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={saveBusy}
                    onClick={() => void startSaveOAuth("google")}
                    className="stamp-cta stamp-cta-secondary text-[13px]"
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    disabled={saveBusy}
                    onClick={() => void startSaveOAuth("apple")}
                    className="stamp-cta stamp-cta-secondary text-[13px]"
                  >
                    Apple
                  </button>
                </div>
                {saveNote ? (
                  <p className="mt-2 text-center text-[11px] text-slate-500">{saveNote}</p>
                ) : null}
              </div>
            )}
          </>
        }
      />
      {error ? <p className="px-4 pb-6 text-center text-sm text-rose-600">{error}</p> : null}

      {conflict ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
          <button
            type="button"
            aria-label="閉じる"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onClick={() => setConflict(null)}
            disabled={saveBusy}
          />
          <div className="relative w-full max-w-[320px] rounded-[1.35rem] bg-white px-5 py-6 shadow-[0_28px_56px_-24px_rgba(15,23,42,0.5)]">
            <p className="text-center text-lg font-bold tracking-tight text-slate-900">
              どちらのカードを使いますか？
            </p>
            <p className="mt-2 text-center text-[12px] leading-relaxed text-slate-500">
              このアカウントには保存済みのカードがあります。統合はされません。使う方を選んでください。
            </p>
            <div className="mt-4 grid gap-2">
              <button
                type="button"
                disabled={saveBusy}
                onClick={() => void linkToAccount("current")}
                className="rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span className="block text-sm font-bold text-slate-900">
                  今の端末のカードを使う
                </span>
                <span className="block text-[12px] text-slate-500">
                  スタンプ {conflict.current.stampCount} 個 · 保存済みカードは無効化されます
                </span>
              </button>
              <button
                type="button"
                disabled={saveBusy}
                onClick={() => void linkToAccount("existing")}
                className="rounded-xl border border-slate-200 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span className="block text-sm font-bold text-slate-900">
                  保存済みのカードを使う
                </span>
                <span className="block text-[12px] text-slate-500">
                  スタンプ {conflict.existing.stampCount} 個 · こちらを開きます
                </span>
              </button>
              <button
                type="button"
                disabled={saveBusy}
                onClick={() => setConflict(null)}
                className="mt-1 text-center text-[12px] text-slate-500 underline-offset-2 hover:underline"
              >
                あとで決める
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
