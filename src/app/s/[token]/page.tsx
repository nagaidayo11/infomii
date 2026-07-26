import { Suspense } from "react";
import { StampCardClient } from "@/components/stamp/StampCardClient";

export default function StampCardRoutePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[100dvh] items-center justify-center bg-[#f6f8fa] text-sm text-slate-600">
          読み込み中…
        </main>
      }
    >
      <StampCardClient />
    </Suspense>
  );
}
