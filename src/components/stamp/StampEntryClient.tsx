"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { StampMark } from "@/components/stamp/StampMark";
import { buildAuthCallbackUrl } from "@/lib/auth-redirect";
import {
  STAMP_CARD_STORAGE_PREFIX,
  buildStampCardPath,
  buildStampEntryPath,
} from "@/lib/stamp/types";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import "@/styles/stamp.css";

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
        const existing = window.localStorage.getItem(`${STAMP_CARD_STORAGE_PREFIX}${slug}`);
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
            window.localStorage.setItem(`${STAMP_CARD_STORAGE_PREFIX}${slug}`, data.token);
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
      window.localStorage.setItem(`${STAMP_CARD_STORAGE_PREFIX}${slug}`, data.token);

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

  return (
    <main
      className="stamp-surface relative mx-auto flex min-h-[100dvh] max-w-md flex-col justify-center overflow-hidden px-6 py-12"
      style={{
        ["--stamp-accent" as string]: accentColor,
        background: `
          radial-gradient(100% 70% at 50% 0%, color-mix(in srgb, ${accentColor} 20%, transparent), transparent 55%),
          linear-gradient(180deg, #f6f8fa 0%, #fff 55%)
        `,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.35)]"
      >
        <div className="mb-5 flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.08 + i * 0.06, duration: 0.35 }}
            >
              <StampMark filled accent={accentColor} styleId="seal" size="md" />
            </motion.div>
          ))}
        </div>

        <p className="text-center text-[11px] font-semibold text-slate-500">スタンプカード</p>
        <h1 className="mt-2 text-center text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900">
          {title}
        </h1>
        {shortDescription ? (
          <p className="mx-auto mt-3 max-w-sm text-center text-[14px] leading-relaxed text-slate-600">
            {shortDescription}
          </p>
        ) : null}

        <ol className="mt-5 space-y-1.5 text-left text-[12px] leading-relaxed text-slate-600">
          <li>1. カードをはじめる（ログイン不要）</li>
          <li>2. 店内の押印QRを1日1回スキャン</li>
          <li>3. 特典はスタッフの前で確認して利用</li>
        </ol>

        <button
          type="button"
          disabled={busy}
          onClick={() => void startCard()}
          className="stamp-cta stamp-cta-primary mt-6"
        >
          {busy ? "準備中…" : "カードをはじめる"}
        </button>

        <div className="mt-4 rounded-xl bg-slate-50 px-3 py-3">
          <p className="text-center text-[11px] leading-relaxed text-slate-500">
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
      </motion.div>
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
