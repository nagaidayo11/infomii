"use client";

import { isEphemeralGuestStorage } from "@/lib/stamp/guest-storage";

type Variant = "entry" | "card";

const COPY: Record<Variant, string> = {
  entry:
    "プライベートブラウズなどでは、タブを閉じるとカードが消えることがあります。ホーム画面追加かアカウント保存をおすすめします。",
  card:
    "このブラウザではカードが端末に保存されにくい状態です。ホーム画面追加か Google / Apple 保存をおすすめします。",
};

/** Shown when localStorage is unavailable (private browsing, etc.). */
export function StampGuestNotice({ variant }: { variant: Variant }) {
  if (!isEphemeralGuestStorage()) return null;

  return (
    <p
      className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-950"
      role="status"
    >
      {COPY[variant]}
    </p>
  );
}
