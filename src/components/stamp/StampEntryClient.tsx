"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { buildAuthCallbackUrl } from "@/lib/auth-redirect";
import {
  readStoredCardToken,
  writeStoredCardToken,
} from "@/lib/stamp/guest-storage";
import {
  buildStampCardPath,
  buildStampEntryPath,
} from "@/lib/stamp/types";
import { StampGuestNotice } from "@/components/stamp/StampGuestNotice";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import "@/styles/stamp.css";

function EntryCardPreview({ accent }: { accent: string }) {
  return (
    <div
      className="mx-auto w-full max-w-[12rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      aria-hidden
    >
      <div className="h-1.5" style={{ backgroundColor: accent }} />
      <div className="p-3.5">
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="aspect-square rounded-full border"
              style={
                i < 2
                  ? { backgroundColor: accent, borderColor: accent }
                  : { backgroundColor: "#fff", borderColor: "#e2e8f0" }
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const ENTRY_STEPS = [
  "カードをはじめる（ログイン不要）",
  "店内の押印QRをカメラで1日1回スキャン",
  "特典はスタッフの前で確認して利用",
] as const;

async function getAccessToken(): Promise<string | null> {
  const client = getBrowserSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return data.session?.access_token ?? null;
}

export function StampEntryClient({
  slug,
  title,
  description,
  accentColor,
  published,
}: {
  slug: string;
  title: string;
  description: string;
  accentColor: string;
  published: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingRestore, setCheckingRestore] = useState(true);

  useEffect(() => {
    if (!published) {
      setCheckingRestore(false);
      return;
    }

    let active = true;
    void (async () => {
      try {
        const existing = readStoredCardToken(slug);
        if (existing) {
          router.replace(buildStampCardPath(existing));
          return;
        }

        const accessToken = await getAccessToken();
        if (accessToken) {
          const res = await fetch(`/api/stamp/restore?slug=${encodeURIComponent(slug)}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const data = (await res.json().catch(() => ({}))) as {
            linked?: boolean;
            path?: string;
            token?: string;
          };
          if (res.ok && data.linked && data.path && data.token) {
            writeStoredCardToken(slug, data.token);
            router.replace(data.path);
            return;
          }
        }
      } finally {
        if (active) setCheckingRestore(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [published, router, slug]);

  async function startCard() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stamp/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        token?: string;
        path?: string;
      };
      if (!res.ok || !data.token || !data.path) {
        throw new Error(data.error ?? "カードを始められませんでした");
      }
      writeStoredCardToken(slug, data.token);

      const accessToken = await getAccessToken();
      if (accessToken) {
        await fetch(`/api/stamp/cards/${encodeURIComponent(data.token)}/link`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }

      router.push(data.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setBusy(false);
    }
  }

  async function restoreWithOAuth(provider: "google" | "apple") {
    const client = getBrowserSupabaseClient();
    if (!client) {
      setError("認証の準備ができていません");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: oauthError } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: buildAuthCallbackUrl({
          next: buildStampEntryPath(slug),
        }),
      },
    });
    if (oauthError) {
      setBusy(false);
      setError(oauthError.message || "ログインを開始できませんでした");
    }
  }

  if (!published) {
    return (
      <main className="stamp-surface mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center bg-[#f6f8fa] px-6 py-10 text-center">
        <h1 className="text-xl font-bold text-slate-900">準備中です</h1>
        <p className="mt-2 text-sm text-slate-600">このスタンプカードはまだ公開されていません。</p>
      </main>
    );
  }

  if (checkingRestore) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#f6f8fa] text-sm text-slate-600">
        確認中…
      </main>
    );
  }

  const shortDescription =
    description.length > 90 ? `${description.slice(0, 88).trimEnd()}…` : description;
  const heading = title.trim() || "スタンプカード";

  return (
    <main
      className="stamp-surface mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center bg-[#f6f8fa] px-6 py-12"
      style={{ ["--stamp-accent" as string]: accentColor }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <EntryCardPreview accent={accentColor} />

        <h1 className="mt-5 text-center text-[1.45rem] font-bold leading-snug tracking-tight text-slate-900">
          {heading}
        </h1>
        {shortDescription ? (
          <p className="mx-auto mt-2 max-w-sm text-center text-[14px] leading-relaxed text-slate-600">
            {shortDescription}
          </p>
        ) : (
          <p className="mx-auto mt-2 max-w-sm text-center text-[14px] leading-relaxed text-slate-600">
            会計時にスタンプを貯めて、特典と交換できます。
          </p>
        )}

        <ol className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
          {ENTRY_STEPS.map((step, index) => (
            <li key={step} className="flex gap-2.5 text-[13px] leading-relaxed text-slate-600">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {index + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-5">
          <StampGuestNotice variant="entry" />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void startCard()}
          className="stamp-cta stamp-cta-primary mt-6"
        >
          {busy ? "準備中…" : "カードをはじめる"}
        </button>

        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
          <p className="text-center text-[12px] leading-relaxed text-slate-500">
            以前保存したカードがありますか？
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void restoreWithOAuth("google")}
              className="stamp-cta stamp-cta-secondary text-[12px]"
            >
              Googleで復元
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void restoreWithOAuth("apple")}
              className="stamp-cta stamp-cta-secondary text-[12px]"
            >
              Appleで復元
            </button>
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-500">
          認証は任意です。カード画面からいつでも保存できます。
        </p>
        {error ? <p className="mt-3 text-center text-sm text-rose-600">{error}</p> : null}
      </div>
    </main>
  );
}

export function StampEntryPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [state, setState] = useState<{
    loading: boolean;
    title: string;
    description: string;
    accentColor: string;
    published: boolean;
  }>({
    loading: true,
    title: "",
    description: "",
    accentColor: "#0f766e",
    published: false,
  });

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      const res = await fetch(`/api/stamp/entry/${encodeURIComponent(slug)}`);
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        title?: string;
        description?: string;
        accentColor?: string;
        published?: boolean;
      };
      setState({
        loading: false,
        title: data.title ?? "スタンプカード",
        description: data.description ?? "",
        accentColor: data.accentColor ?? "#0f766e",
        published: Boolean(data.published),
      });
    })();
  }, [slug]);

  if (state.loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#f6f8fa] text-sm text-slate-600">
        読み込み中…
      </div>
    );
  }

  return (
    <StampEntryClient
      slug={slug}
      title={state.title}
      description={state.description}
      accentColor={state.accentColor}
      published={state.published}
    />
  );
}
