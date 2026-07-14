import { Button } from "@/components/ui";
import { CheckoutButton } from "@/components/lp/CheckoutButton";
import { HorizontalScrollHint } from "@/components/lp/HorizontalScrollHint";

type LpPricingDetailsProps = {
  freeSignupHref: string;
  hasProAnnual?: boolean;
  hasBusinessAnnual?: boolean;
};

export function LpPricingDetails({ freeSignupHref, hasProAnnual }: LpPricingDetailsProps) {
  const no = <span className="text-slate-300">—</span>;
  const yes = <span className="font-medium text-emerald-700">✓</span>;
  const yesBadge = <span className="font-medium text-white">✓</span>;

  return (
    <details
      id="pricing-details"
      className="mt-10 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ring-1 ring-slate-100 open:shadow-md"
    >
      <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex w-full items-center justify-between gap-3">
          プラン別の詳細比較
          <span className="text-xs font-medium text-emerald-700">開く</span>
        </span>
      </summary>

      <div className="mt-4">
        <p className="mb-3 text-xs text-slate-500 sm:hidden">横にスクロールして比較できます</p>
        <HorizontalScrollHint
          className="relative min-w-0"
          viewportClassName="overflow-x-auto overscroll-x-contain"
          showEdgeFade={false}
        >
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <caption className="sr-only">Infomii プラン比較</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
                  項目
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-semibold text-slate-600">
                  Free
                </th>
                <th scope="col" className="border-x border-slate-200 bg-emerald-50/80 px-3 py-3 text-center text-xs font-semibold text-emerald-800">
                  Pro
                </th>
                <th scope="col" className="px-3 py-3 text-center text-xs font-semibold text-slate-600">
                  Business
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <th scope="row" className="px-4 py-2.5 text-left font-medium text-slate-700">
                  公開ページ数
                </th>
                <td className="px-3 py-2.5 text-center tabular-nums">2本</td>
                <td className="border-x border-slate-100 bg-emerald-50/40 px-3 py-2.5 text-center tabular-nums">最大20本</td>
                <td className="px-3 py-2.5 text-center font-semibold text-emerald-700">無制限</td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-2.5 text-left font-medium text-slate-700">
                  QR / テンプレ
                </th>
                <td className="px-3 py-2.5 text-center">{yes}</td>
                <td className="border-x border-slate-100 bg-emerald-50/40 px-3 py-2.5 text-center">{yes}</td>
                <td className="px-3 py-2.5 text-center">{yes}</td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-2.5 text-left font-medium text-slate-700">
                  閲覧分析
                </th>
                <td className="px-3 py-2.5 text-center">{no}</td>
                <td className="border-x border-slate-100 bg-emerald-50/40 px-3 py-2.5 text-center">{yes}</td>
                <td className="px-3 py-2.5 text-center">{yes}</td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-2.5 text-left font-medium text-slate-700">
                  チーム招待
                </th>
                <td className="px-3 py-2.5 text-center">{no}</td>
                <td className="border-x border-slate-100 bg-emerald-50/40 px-3 py-2.5 text-center">{no}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className="inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {yesBadge}
                  </span>
                </td>
              </tr>
              <tr>
                <th scope="row" className="px-4 py-2.5 text-left font-medium text-slate-700">
                  多言語自動翻訳
                </th>
                <td className="px-3 py-2.5 text-center">{no}</td>
                <td className="border-x border-slate-100 bg-emerald-50/40 px-3 py-2.5 text-center">{no}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className="inline-flex rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                    {yesBadge}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </HorizontalScrollHint>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={freeSignupHref} className="min-h-[44px] !bg-emerald-600 !text-white hover:!bg-emerald-700">
            無料ではじめる
          </Button>
          <CheckoutButton plan="pro" variant="secondary" className="min-h-[44px]">
            Proを試す{hasProAnnual ? "（月払い）" : ""}
          </CheckoutButton>
          <CheckoutButton plan="business" variant="secondary" className="min-h-[44px]" adaptiveBusinessCta>
            Businessを見る
          </CheckoutButton>
        </div>
      </div>
    </details>
  );
}
