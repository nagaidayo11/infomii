"use client";

import { FullScreenLoadingOverlay } from "@/components/ui/FullScreenLoadingOverlay";

export default function GlobalLoading() {
  return (
    <FullScreenLoadingOverlay
      title="読み込み中…"
      subtitle="ページを準備しています"
      classNameZ="z-[100]"
    />
  );
}
