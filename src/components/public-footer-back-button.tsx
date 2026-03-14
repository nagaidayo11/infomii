"use client";

import { useRouter } from "next/navigation";

type PublicFooterBackButtonProps = {
  fallbackHref?: string;
  label?: string;
};

export function PublicFooterBackButton({ fallbackHref = "/", label = "戻る" }: PublicFooterBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }
        router.push(fallbackHref);
      }}
      className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
    >
      <span aria-hidden>←</span>
      <span>{label}</span>
    </button>
  );
}
