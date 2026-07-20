"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const INSTAGRAM_SOURCES = new Set(["instagram", "ig", "insta"]);

/**
 * Instagram等の流入向け。静かな1行バナー（?utm_source=instagram 等で表示）
 */
export function LpInstagramBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = (params.get("utm_source") ?? params.get("ref") ?? "").toLowerCase();
    if (INSTAGRAM_SOURCES.has(source)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="border-b border-emerald-100/80 bg-emerald-50/50 px-4 py-2.5 text-center text-sm text-slate-700 backdrop-blur-sm">
      <span>Instagramからお越しの方へ — </span>
      <Link
        href="/demo/editor"
        className="font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-2"
      >
        登録なしで30秒デモ
      </Link>
      <span className="text-slate-400"> · </span>
      <Link
        href="/lp/business?focus=templates"
        className="font-medium text-emerald-800 underline decoration-emerald-300 underline-offset-2"
      >
        サンプルを見る
      </Link>
    </div>
  );
}
