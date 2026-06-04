import Link from "next/link";
import { PrivacyPolicySections } from "@/lib/legal-content";

export default function PrivacyPage() {
  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <article className="lux-card rounded-3xl p-6 sm:p-10">
          <p className="lux-kicker text-xs font-semibold">Privacy Policy</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">プライバシーポリシー</h1>
          <p className="mt-2 text-sm text-slate-500">最終更新: 2026年6月</p>
          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
            <PrivacyPolicySections />
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

