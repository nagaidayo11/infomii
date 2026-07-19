import type { Metadata } from "next";
import Link from "next/link";
import { CommerceDisclosureTable, type LegalVariant } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記",
  description: "Infomiiの特定商取引法に基づく表記。販売事業者、料金、支払方法、返品・キャンセル条件を記載します。",
  alternates: { canonical: "/commerce" },
  robots: { index: true, follow: true },
};

type CommercePageProps = {
  searchParams: Promise<{ client?: string }>;
};

export default async function CommercePage({ searchParams }: CommercePageProps) {
  const params = await searchParams;
  const variant: LegalVariant = params.client === "app" ? "app" : "web";
  const subtitle = variant === "app" ? "iOS アプリ" : "Web サイト";

  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <article className="lux-card rounded-3xl p-6 sm:p-10">
          <p className="lux-kicker text-xs font-semibold">Act on Specified Commercial Transactions</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">特定商取引法に基づく表記</h1>
          <p className="mt-2 text-sm text-slate-500">最終更新: 2026年6月 · {subtitle}</p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            本ページは、Infomii（店舗向けインフォメーション作成SaaS）の有料プラン提供条件を記載しています。
          </p>
          <div className="mt-6 space-y-5">
            <CommerceDisclosureTable variant={variant} />
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
