import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyPolicySections, type LegalVariant } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "Infomiiのプライバシーポリシー。取得する情報、利用目的、保管・開示の方針を説明します。",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

type PrivacyPageProps = {
  searchParams: Promise<{ client?: string }>;
};

export default async function PrivacyPage({ searchParams }: PrivacyPageProps) {
  const params = await searchParams;
  const variant: LegalVariant = params.client === "app" ? "app" : "web";
  const subtitle = variant === "app" ? "iOS アプリ" : "Web サイト";

  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <article className="lux-card rounded-3xl p-6 sm:p-10">
          <p className="lux-kicker text-xs font-semibold">Privacy Policy</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">プライバシーポリシー</h1>
          <p className="mt-2 text-sm text-slate-500">
            最終更新: 2026年6月 · {subtitle}
          </p>
          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
            <PrivacyPolicySections variant={variant} />
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
