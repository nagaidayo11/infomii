import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <article className="lux-card rounded-3xl p-6 sm:p-10">
          <p className="lux-kicker text-xs font-semibold">Privacy Policy</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">プライバシーポリシー</h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">1. 取得する情報</h2>
              <p>
                当サービスは、アカウント情報、決済に必要な情報、利用ログ、問い合わせ情報を取得する場合があります。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">2. 利用目的</h2>
              <p>
                サービス提供、本人確認、請求処理、障害対応、品質改善、重要なお知らせの通知のために利用します。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">3. 第三者提供</h2>
              <p>
                法令に基づく場合を除き、本人の同意なく第三者に提供しません。決済処理・配信等で必要な委託先には、業務遂行に必要な範囲で提供することがあります。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">4. 保存期間</h2>
              <p>
                取得情報は、利用目的達成に必要な期間または法令で定められた期間保存し、その後適切に削除します。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">5. 開示・訂正・削除</h2>
              <p>
                本人からの請求があった場合、法令に従い合理的な範囲で対応します。問い合わせ先へご連絡ください。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">6. お問い合わせ</h2>
              <p>
                連絡先: {process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@informe.jp"}
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

