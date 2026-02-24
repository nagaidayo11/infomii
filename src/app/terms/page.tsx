import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl">
        <article className="lux-card rounded-3xl p-6 sm:p-10">
          <p className="lux-kicker text-xs font-semibold">Terms</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">利用規約</h1>
          <div className="mt-6 space-y-5 text-sm leading-7 text-slate-700">
            <section>
              <h2 className="text-base font-semibold text-slate-900">第1条（適用）</h2>
              <p>
                本規約は、Infomii（インフォーミー、以下「当サービス」）の利用条件を定めるものです。利用者は本規約に同意のうえ当サービスを利用するものとします。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">第2条（禁止事項）</h2>
              <p>
                法令違反、公序良俗違反、第三者の権利侵害、不正アクセス、サービス運営を妨害する行為を禁止します。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">第3条（サービス提供の停止）</h2>
              <p>
                保守、障害、外部サービスの停止等により、事前通知なく当サービスの全部または一部を停止することがあります。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">第4条（免責）</h2>
              <p>
                当サービスは現状有姿で提供され、特定目的適合性や完全性を保証しません。当サービス利用による損害について、当方の故意または重過失を除き責任を負いません。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">第5条（規約変更）</h2>
              <p>
                本規約は必要に応じて変更されることがあります。変更後の規約は本ページ掲載時点から効力を生じます。
              </p>
            </section>
            <section>
              <h2 className="text-base font-semibold text-slate-900">第6条（準拠法・管轄）</h2>
              <p>
                本規約は日本法に準拠し、本サービスに関して紛争が生じた場合は当方所在地を管轄する裁判所を第一審の専属的合意管轄とします。
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
