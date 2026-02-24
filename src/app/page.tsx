import Link from "next/link";

export default function Home() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@informe.jp";
  const faqItems = [
    {
      q: "どんな業種で使えますか？",
      a: "ホテル・飲食店・サロン・クリニック・観光施設など、案内情報を更新する業種で利用できます。",
    },
    {
      q: "QRコードはすぐ発行できますか？",
      a: "はい。ページ保存後に公開URLとQRコードをすぐ発行できます。紙印刷にもそのまま使えます。",
    },
    {
      q: "無料プランとProの違いは？",
      a: "Proでは公開上限の拡張、複数ページ連携（ノード）、運用管理機能が利用できます。",
    },
    {
      q: "デザイン知識がなくても使えますか？",
      a: "問題ありません。ブロックを追加し、テキストや色を編集するだけで見栄えの良いページを作れます。",
    },
  ];

  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8">
        <header className="lux-card rounded-3xl p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                I
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">Infomii</p>
                <p className="text-[11px] text-slate-500">店舗インフォメーション作成SaaS</p>
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <a href="#features" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-white/80">機能</a>
              <a href="#pricing" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-white/80">料金</a>
              <a href="#faq" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-white/80">FAQ</a>
              <a href="#contact" className="rounded-lg px-3 py-1.5 text-slate-700 hover:bg-white/80">お問い合わせ</a>
            </nav>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div>
              <p className="lux-kicker text-xs font-semibold">Infomii</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-5xl">
                Infomii
                <span className="mt-2 block text-base font-semibold text-emerald-700 sm:text-xl">誰でも、3分で、案内ページを公開</span>
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
                店舗向けインフォメーションを、ブロック編集で直感的に作成。
                QRから1ページ案内、Proならノードで複数ページ連携まで。
                現場で必要な更新を、その場で反映できます。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/login" className="lux-btn-primary rounded-xl px-5 py-3 text-sm font-semibold">
                  無料で始める
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
                >
                  ダッシュボードへ
                </Link>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">ホテル</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">飲食店</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">サロン</span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1">観光施設</span>
              </div>
            </div>

            <aside className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
              <p className="text-xs font-semibold tracking-wide text-emerald-700">運用メリット</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl border border-emerald-100 bg-white p-3">
                  <p className="text-[11px] text-slate-500">初回公開まで</p>
                  <p className="text-2xl font-bold text-slate-900">約3分</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-white p-3">
                  <p className="text-[11px] text-slate-500">QR導線</p>
                  <p className="text-2xl font-bold text-slate-900">1ページ1QR</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-white p-3">
                  <p className="text-[11px] text-slate-500">Pro機能</p>
                  <p className="text-xl font-bold text-slate-900">複数ページ連携</p>
                </div>
              </div>
            </aside>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="lux-card lux-section-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-emerald-700">Before</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">資料がバラバラ</h2>
            <p className="mt-2 text-sm text-slate-700">PDF・紙・チャットに分散して更新漏れが発生。</p>
          </article>
          <article className="lux-card lux-section-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-emerald-700">After</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">1か所で一元管理</h2>
            <p className="mt-2 text-sm text-slate-700">編集・公開・QRまで同じ画面で完結。</p>
          </article>
          <article className="lux-card lux-section-card rounded-2xl p-5">
            <p className="text-xs font-semibold text-emerald-700">Outcome</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">現場運用が速い</h2>
            <p className="mt-2 text-sm text-slate-700">営業時間変更や臨時案内を即時反映できます。</p>
          </article>
        </section>

        <section id="features" className="lux-card rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">機能</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">ブロックエディタ</p>
              <p className="mt-2 text-sm text-slate-700">テキスト・画像・アイコン・料金表などを自由に構成。</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">スマホプレビュー</p>
              <p className="mt-2 text-sm text-slate-700">編集しながら表示確認。公開前チェックも自動で実行。</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">公開URL / QR発行</p>
              <p className="mt-2 text-sm text-slate-700">保存後すぐに案内用URLとQRコードを発行。</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">ノード連携（Pro）</p>
              <p className="mt-2 text-sm text-slate-700">1つの入口ページから複数ページへ自然に遷移。</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">運用センター</p>
              <p className="mt-2 text-sm text-slate-700">Webhook状態や同期状況をまとめて監視。</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">監査ログ</p>
              <p className="mt-2 text-sm text-slate-700">更新・公開・課金関連の操作履歴を確認可能。</p>
            </article>
          </div>
        </section>

        <section id="pricing" className="lux-card rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">料金プラン</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Free</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">¥0</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>・公開ページ上限あり</li>
                <li>・基本ブロックエディタ</li>
                <li>・QR公開</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Pro</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">月額課金</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                <li>・公開ページ上限を拡張</li>
                <li>・ノードマップで複数ページ連携</li>
                <li>・運用管理機能</li>
              </ul>
              <Link href="/login" className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
                Proを試す
              </Link>
            </article>
          </div>
        </section>

        <section id="faq" className="lux-card rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">FAQ</h2>
          <div className="mt-4 space-y-2">
            {faqItems.map((item) => (
              <details key={item.q} className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.q}</summary>
                <p className="mt-2 text-sm leading-7 text-slate-700">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="contact" className="lux-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-slate-900">お問い合わせ</h2>
          <p className="mt-2 text-sm text-slate-700">導入・プラン・不具合のご相談は以下までご連絡ください。</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{contactEmail}</p>
        </section>

        <footer className="lux-card rounded-2xl p-5 text-sm text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} Infomii</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link className="hover:underline" href="/terms">利用規約</Link>
              <Link className="hover:underline" href="/privacy">プライバシーポリシー</Link>
              <Link className="hover:underline" href="/commerce">特定商取引法に基づく表記</Link>
              <Link className="hover:underline" href="/refund">返金・キャンセルポリシー</Link>
              <Link className="hover:underline" href="/login">ログイン</Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
