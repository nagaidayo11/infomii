"use client";

import Link from "next/link";
import { TemplateGallery } from "@/components/template-gallery";

export default function TemplateGalleryPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/editor/builder"
            className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            ← エディタに戻る
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <TemplateGallery applyToEditor />
          <p className="mt-6 text-center text-sm text-slate-500">
            適用後は{" "}
            <Link href="/editor/builder" className="font-medium text-emerald-700 hover:underline">
              編集
            </Link>
            {" "}でプレビュー・編集できます。
          </p>
        </div>
      </div>
    </div>
  );
}
