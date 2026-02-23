import Link from "next/link";

export default function RefundPage() {
  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <article className="lux-card rounded-3xl p-6 sm:p-10">
          <p className="lux-kicker text-xs font-semibold">Refund & Cancellation</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">返金・キャンセルポリシー</h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">1. サブスクリプション解約</h2>
              <p>
                解約は次回更新日前までに実施してください。解約後は次回請求日以降の自動更新が停止されます。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">2. 返金について</h2>
              <p>
                原則として、決済完了後の返金は行っていません。法令上必要な場合または当方の判断で返金対応を行うことがあります。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">3. 日割り計算</h2>
              <p>
                月途中での解約について、日割りでの返金は行っていません。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">4. 問い合わせ窓口</h2>
              <p>
                返金・請求に関するお問い合わせ:
                {" "}
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@informe.jp"}
              </p>
            </section>
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

