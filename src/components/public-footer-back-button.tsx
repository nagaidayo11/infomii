"use client";

import { useRouter } from "next/navigation";

type PublicFooterBackButtonProps = {
  fallbackHref?: string;
};

export function PublicFooterBackButton({ fallbackHref = "/" }: PublicFooterBackButtonProps) {
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
      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
    >
      <span aria-hidden>←</span>
      <span>戻る</span>
    </button>
  );
}
