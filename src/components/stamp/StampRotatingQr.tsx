"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { qrCodeImageUrl } from "@/lib/storage";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

type TokenResponse = {
  code: string;
  path: string;
  expiresInMs: number;
  periodMs: number;
  error?: string;
};

/** Live rotating press QR for staff to show on their own device. */
export function StampRotatingQr({ pageId, origin }: { pageId: string; origin: string }) {
  const [state, setState] = useState<{ url: string; code: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<number | null>(null);

  const fetchToken = useCallback(async () => {
    const client = getBrowserSupabaseClient();
    const access = (await client?.auth.getSession())?.data.session?.access_token ?? "";
    if (!access) {
      setError("ログインが必要です");
      return 30_000;
    }
    try {
      const res = await fetch(`/api/stamp/programs/${encodeURIComponent(pageId)}/press-token`, {
        headers: { Authorization: `Bearer ${access}` },
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as TokenResponse;
      if (!res.ok) {
        setError(data.error ?? "QRを取得できませんでした");
        return 30_000;
      }
      setError(null);
      setState({ url: `${origin}${data.path}`, code: data.code });
      setSecondsLeft(Math.ceil(data.expiresInMs / 1000));
      // Refresh a touch after the current token rotates.
      return Math.max(3_000, data.expiresInMs + 500);
    } catch {
      setError("QRを取得できませんでした");
      return 30_000;
    }
  }, [origin, pageId]);

  useEffect(() => {
    let active = true;
    const loop = async () => {
      const nextInMs = await fetchToken();
      if (!active) return;
      timerRef.current = window.setTimeout(loop, nextInMs);
    };
    void loop();
    return () => {
      active = false;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [fetchToken]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="rounded-[1.15rem] border border-black/15 bg-white p-4 text-center">
      <p className="text-sm font-semibold">押印QR（回転式）</p>
      <p className="text-[11px] text-slate-500">スタッフ端末に表示してお客様に読み取ってもらいます</p>
      {error ? (
        <p className="mt-3 text-sm text-rose-600">{error}</p>
      ) : state ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeImageUrl(state.url, 200)}
            alt="回転式押印QR"
            className="mx-auto mt-3 rounded-xl bg-white p-2 shadow-sm"
          />
          <p className="mt-2 text-[12px] font-medium text-slate-700">
            コード: <span className="font-mono tracking-wider">{state.code}</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            約{secondsLeft}秒後に更新
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-500">読み込み中…</p>
      )}
    </div>
  );
}
