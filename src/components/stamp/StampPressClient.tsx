"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { STAMP_CARD_STORAGE_PREFIX, buildStampCardPath } from "@/lib/stamp/types";
import "@/styles/stamp.css";

/** Landing when guest scans press QR with the system camera (no card context). */
export function StampPressClient() {
  const params = useParams();
  const code = typeof params.code === "string" ? decodeURIComponent(params.code) : "";
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const keys = Object.keys(window.localStorage).filter((k) =>
      k.startsWith(STAMP_CARD_STORAGE_PREFIX),
    );
    if (keys.length === 1) {
      const token = window.localStorage.getItem(keys[0]!);
      if (token) {
        setHint(buildStampCardPath(token));
      }
    }
  }, []);

  return (
    <main
      className="stamp-surface mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center bg-[#f6f8fa] px-6 py-10 text-center"
      style={{ ["--stamp-accent" as string]: "#0f766e" }}
    >
      <p className="text-[11px] font-semibold text-slate-500">押印QR</p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">押印用のQRです</h1>
      <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-slate-600">
        スタンプはマイカードを開いてから読み取ってください。カードをなくした場合は、入口QRを同じ端末で読み直すと再開できます。
      </p>
      {hint ? (
        <Link href={hint} className="stamp-cta stamp-cta-primary mt-8 max-w-xs">
          マイカードを開く
        </Link>
      ) : (
        <p className="mt-8 text-sm text-slate-500">まずは入口QRからカードをはじめてください。</p>
      )}
      <p className="mt-5 text-[10px] text-slate-400">ref {code.slice(0, 8)}</p>
    </main>
  );
}
