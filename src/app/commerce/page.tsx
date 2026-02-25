import Link from "next/link";

export default function CommercePage() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@infomii.com";

  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <article className="lux-card rounded-3xl p-6 sm:p-10">
          <p className="lux-kicker text-xs font-semibold">Act on Specified Commercial Transactions</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">特定商取引法に基づく表記</h1>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            本ページは、Infomii（店舗向けインフォメーション作成SaaS）の有料プラン提供条件を記載しています。
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm text-slate-700">
              <tbody>
                <tr className="border-b border-slate-200">
                  <th className="w-44 bg-slate-50 px-4 py-3 font-semibold text-slate-900">販売事業者名</th>
                  <td className="px-4 py-3">Infomii</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">運営責任者</th>
                  <td className="px-4 py-3">永井 克範</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">所在地</th>
                  <td className="px-4 py-3">請求があった場合に遅滞なく開示します。</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">連絡先</th>
                  <td className="px-4 py-3">{contactEmail}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">販売価格（税込）</th>
                  <td className="px-4 py-3">
                    Freeプラン: 0円 / Proプラン: 月額1,980円
                    <br />
                    最新の価格は <Link href="/" className="text-emerald-700 underline">トップページ</Link> に表示します。
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">商品代金以外の必要料金</th>
                  <td className="px-4 py-3">インターネット接続に必要な通信料金等は利用者負担です。</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">支払方法</th>
                  <td className="px-4 py-3">クレジットカード決済（Stripe Checkout）</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">支払時期</th>
                  <td className="px-4 py-3">有料プラン申込時に初回課金、以降は毎月同日に自動更新課金されます。</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">提供時期</th>
                  <td className="px-4 py-3">決済完了後、直ちに有料機能（公開上限拡張等）を利用できます。</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">解約・返金</th>
                  <td className="px-4 py-3">
                    解約はStripe Customer Portalまたは管理画面の請求設定からいつでも可能です。
                    <br />
                    解約後は次回請求日以降に自動更新停止となります。
                    <br />
                    返金条件は<Link href="/refund" className="text-emerald-700 underline">返金・キャンセルポリシー</Link>をご確認ください。
                  </td>
                </tr>
                <tr>
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">動作環境</th>
                  <td className="px-4 py-3">最新の主要ブラウザ（Chrome / Safari / Edge）でご利用ください。</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            関連ページ:
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/terms" className="text-emerald-700 underline">利用規約</Link>
              <Link href="/privacy" className="text-emerald-700 underline">プライバシーポリシー</Link>
              <Link href="/refund" className="text-emerald-700 underline">返金・キャンセルポリシー</Link>
              <Link href="/login" className="text-emerald-700 underline">ログイン</Link>
            </div>
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
