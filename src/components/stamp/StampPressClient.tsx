"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { listStoredCardTokens } from "@/lib/stamp/guest-storage";
import {
  buildStampCardPath,
  extractStampCodeFromScanText,
} from "@/lib/stamp/types";
import "@/styles/stamp.css";

/**
 * Landing when guest scans the facility press QR with the system camera.
 * Applies the stamp to the pending / stored card and returns to the card page.
 */
export function StampPressClient() {
  const params = useParams();
  const router = useRouter();
  const rawCode = typeof params.code === "string" ? decodeURIComponent(params.code) : "";
  const stampCode = extractStampCodeFromScanText(rawCode) ?? rawCode.trim();

  const [status, setStatus] = useState<"working" | "need_card" | "error">("working");
  const [message, setMessage] = useState<string | null>(null);
  const [cardPath, setCardPath] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!stampCode) {
        setStatus("error");
        setMessage("押印コードが無効です");
        return;
      }

      const tokens = listStoredCardTokens();
      if (tokens.length === 0) {
        setStatus("need_card");
        return;
      }

      let lastError = "スタンプを付けられませんでした";
      for (const token of tokens) {
        if (cancelled) return;
        try {
          const res = await fetch(`/api/stamp/cards/${encodeURIComponent(token)}/stamp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ stampCode }),
          });
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (!res.ok) {
            lastError = data.error ?? lastError;
            continue;
          }
          try {
            window.sessionStorage.removeItem("infomii_stamp_scan_pending");
          } catch {
            /* ignore */
          }
          if (!cancelled) {
            router.replace(`${buildStampCardPath(token)}?earned=1`);
          }
          return;
        } catch {
          lastError = "通信エラーが発生しました";
        }
      }

      if (cancelled) return;
      const fallback = tokens[0] ? buildStampCardPath(tokens[0]) : null;
      setCardPath(fallback);
      setStatus("error");
      setMessage(lastError);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [router, stampCode]);

  if (status === "working") {
    return (
      <main
        className="stamp-surface mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center bg-[#f6f8fa] px-6 py-10 text-center"
        style={{ ["--stamp-accent" as string]: "#0f766e" }}
      >
        <p className="text-[11px] font-semibold text-slate-500">押印中</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          スタンプを付けています…
        </h1>
        <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-slate-600">
          そのままお待ちください。カード画面に戻ります。
        </p>
      </main>
    );
  }

  if (status === "need_card") {
    return (
      <main
        className="stamp-surface mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center bg-[#f6f8fa] px-6 py-10 text-center"
        style={{ ["--stamp-accent" as string]: "#0f766e" }}
      >
        <p className="text-[11px] font-semibold text-slate-500">押印QR</p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
          先にカードを開いてください
        </h1>
        <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-slate-600">
          スタンプはマイカードを開いてから、端末のカメラでこの押印QRを読み取ってください。カードをなくした場合は、入口QRを同じ端末で読み直すと再開できます。
        </p>
        <p className="mt-8 text-sm text-slate-500">まずは入口QRからカードをはじめてください。</p>
      </main>
    );
  }

  return (
    <main
      className="stamp-surface mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center bg-[#f6f8fa] px-6 py-10 text-center"
      style={{ ["--stamp-accent" as string]: "#0f766e" }}
    >
      <p className="text-[11px] font-semibold text-slate-500">押印QR</p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">付与できませんでした</h1>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-slate-600">
        {message ?? "スタンプを付けられませんでした"}
      </p>
      {cardPath ? (
        <Link href={cardPath} className="stamp-cta stamp-cta-primary mt-8 max-w-xs">
          マイカードに戻る
        </Link>
      ) : null}
    </main>
  );
}
