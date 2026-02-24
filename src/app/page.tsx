import Link from "next/link";

export default function Home() {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "support@informe.jp";

  return (
    <main className="lux-main min-h-screen px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="lux-card rounded-3xl p-6 sm:p-10">
          <p className="lux-kicker text-xs font-semibold">Infomii</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 sm:text-5xl">Infomii（インフォーミー）</h1>
          <p className="mt-4 max-w-2xl text-sm text-slate-700 sm:text-base">
            店舗向けインフォメーションを、誰でもかんたん作成・公開。
            <br />
            QRから1ページ案内、Proならノードで複数ページ連携まで。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="lux-btn-primary rounded-xl px-5 py-3 text-sm font-semibold"
            >
              無料で始める
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800"
            >
              ダッシュボードへ
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="lux-card lux-section-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">ページ作成</h2>
            <p className="mt-2 text-sm text-slate-700">
              ブロック追加で直感的に作成。店舗向け情報をすばやく更新できます。
            </p>
          </article>
          <article className="lux-card lux-section-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">QR公開</h2>
            <p className="mt-2 text-sm text-slate-700">
              1ページにつき1つのQRを発行。印刷してそのまま案内に使えます。
            </p>
          </article>
          <article className="lux-card lux-section-card rounded-2xl p-5">
            <h2 className="text-lg font-semibold text-slate-900">複数ページ連携（Pro）</h2>
            <p className="mt-2 text-sm text-slate-700">
              ノードでページをつなぎ、1つの入口ページから複数案内へ遷移できます。
            </p>
          </article>
        </section>

        <section className="lux-card rounded-3xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900">料金プラン</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold text-slate-500">Free</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">¥0</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>公開ページ上限あり</li>
                <li>基本ブロックエディタ</li>
                <li>QR公開</li>
              </ul>
            </article>
            <article className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5">
              <p className="text-xs font-semibold text-emerald-700">Pro</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">月額課金</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>公開ページ上限を拡張</li>
                <li>ノードマップで複数ページ連携</li>
                <li>運用管理機能</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="lux-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-slate-900">お問い合わせ</h2>
          <p className="mt-2 text-sm text-slate-700">
            導入・プラン・不具合のご相談は以下までご連絡ください。
          </p>
          <p className="mt-2 text-sm font-medium text-slate-900">{contactEmail}</p>
        </section>

        <footer className="lux-card rounded-2xl p-5 text-sm text-slate-700">
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link className="hover:underline" href="/terms">利用規約</Link>
            <Link className="hover:underline" href="/privacy">プライバシーポリシー</Link>
            <Link className="hover:underline" href="/commerce">特定商取引法に基づく表記</Link>
            <Link className="hover:underline" href="/refund">返金・キャンセルポリシー</Link>
            <Link className="hover:underline" href="/login">ログイン</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
