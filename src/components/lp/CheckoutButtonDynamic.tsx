"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type { CheckoutButton } from "@/components/lp/CheckoutButton";

const CheckoutButtonInner = dynamic(
  () => import("@/components/lp/CheckoutButton").then((m) => ({ default: m.CheckoutButton })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-500">
        読み込み中…
      </div>
    ),
  },
);

/** LP料金用 — storage.ts を page チャンクから分離（default export で RSC 互換） */
export default function CheckoutButtonDynamic(props: ComponentProps<typeof CheckoutButton>) {
  return <CheckoutButtonInner {...props} />;
}
