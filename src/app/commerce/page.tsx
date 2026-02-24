import Link from "next/link";

export default function CommercePage() {
  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <article className="lux-card rounded-3xl p-6 sm:p-10">
          <p className="lux-kicker text-xs font-semibold">Act on Specified Commercial Transactions</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">特定商取引法に基づく表記</h1>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm text-slate-700">
              <tbody>
                <tr className="border-b border-slate-200">
                  <th className="w-44 bg-slate-50 px-4 py-3 font-semibold text-slate-900">販売事業者名</th>
                  <td className="px-4 py-3">Infomii運営</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">運営責任者</th>
                  <td className="px-4 py-3">運営責任者名（公開名）</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">所在地</th>
                  <td className="px-4 py-3">請求があった場合に遅滞なく開示します。</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">連絡先</th>
                  <td className="px-4 py-3">{process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@informe.jp"}</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">販売価格</th>
                  <td className="px-4 py-3">各プラン紹介ページに表示する価格（税込）</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">商品代金以外の必要料金</th>
                  <td className="px-4 py-3">インターネット接続に必要な通信料金等は利用者負担です。</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">支払方法</th>
                  <td className="px-4 py-3">クレジットカード決済（Stripe）</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">支払時期</th>
                  <td className="px-4 py-3">申込時および契約更新時に課金されます。</td>
                </tr>
                <tr className="border-b border-slate-200">
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">提供時期</th>
                  <td className="px-4 py-3">決済完了後、直ちに利用可能です。</td>
                </tr>
                <tr>
                  <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-900">解約・返金</th>
                  <td className="px-4 py-3">
                    解約は次回更新日前までに手続きしてください。返金条件は返金・キャンセルポリシーをご確認ください。
                  </td>
                </tr>
              </tbody>
            </table>
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
