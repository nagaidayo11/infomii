import type { Metadata } from "next";
import Link from "next/link";
import { TermsOfServiceSections } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "利用規約",
  description: "Infomiiの利用規約。サービス利用条件、禁止事項、免責事項を定めます。",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <article className="lux-card rounded-3xl p-6 sm:p-10">
          <p className="lux-kicker text-xs font-semibold">Terms</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">利用規約</h1>
          <p className="mt-2 text-sm text-slate-500">最終更新: 2026年6月</p>
          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
            <TermsOfServiceSections />
          </div>
          <div className="mt-8">
            <Link href="/" className="text-sm text-emerald-700 hover:underline">
              ← トップへ戻る
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
