import type { ReactNode } from "react";
import Link from "next/link";
import { APP_NAV_ITEMS } from "@/components/app/app-nav-items";
import { Card } from "@/components/ui/Card";

/**
 * 左メニューにないがマニュアルから辿れる画面
 */
const EXTRA_SCREEN_LINKS: { href: string; label: string; description: string }[] = [
  {
    href: "/login",
    label: "ログイン",
    description: "メールアドレスとパスワードでサインインします。",
  },
  {
    href: "/dashboard/qr",
    label: "QRコード管理",
    description: "ページごとの QR やスキャン状況をまとめて確認します。",
  },
  {
    href: "/dashboard/qr-generator",
    label: "QRコード生成",
    description: "大きな QR の表示・ダウンロード・印刷・リンクコピーができます。",
  },
];

const MANUAL_SCREEN_PREVIEWS: { href: string; title: string; note: string }[] = [
  {
    href: "/dashboard",
    title: "ダッシュボード",
    note: "ページ作成・最近のページ・主要指標の起点です。",
  },
  {
    href: "/templates",
    title: "テンプレート",
    note: "型から素早くページを作成できます。",
  },
  {
    href: "/dashboard/pages",
    title: "ページ一覧",
    note: "公開/下書き、名前変更、削除などの管理を行います。",
  },
  {
    href: "/dashboard/qr-generator",
    title: "QRコード生成",
    note: "大きなQR表示・保存・印刷ができます。",
  },
  {
    href: "/dashboard/qr",
    title: "QRコード管理",
    note: "ページごとのQRとスキャン状況を確認できます。",
  },
  {
    href: "/dashboard/analytics",
    title: "分析",
    note: "閲覧状況や人気ページを確認できます。",
  },
  {
    href: "/dashboard/team",
    title: "チーム",
    note: "メンバー招待と権限管理を行います。",
  },
  {
    href: "/settings",
    title: "設定",
    note: "Business向け設定や運用設定の確認画面です。",
  },
];

function OpenScreenLink({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <p className="mt-3">
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
      >
        {children ?? "この画面を開く"}
        <span aria-hidden>→</span>
      </Link>
    </p>
  );
}

function LivePreviewCard({ href, title, note }: { href: string; title: string; note: string }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="border-b border-slate-100 px-3 py-2.5">
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{note}</p>
      </div>
      <div className="relative bg-slate-100">
        <iframe
          title={`${title} の実画面プレビュー`}
          src={href}
          loading="lazy"
          className="h-52 w-full border-0 bg-white"
        />
      </div>
      <div className="border-t border-slate-100 px-3 py-2">
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
        >
          この画面を開く
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

/**
 * Infomii の主な機能を一覧した利用マニュアル（設定画面用）
 * 実際の画面へのリンクで、左メニューと同じ動線をたどれるようにします。
 */
export function InfomiiManual() {
  return (
    <div className="space-y-6">
      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">実画面プレビュー</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          主要画面をそのまま埋め込んでいます。見た目を確認してから、下のリンクで同じ画面へ移動できます。
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {MANUAL_SCREEN_PREVIEWS.map((item) => (
            <LivePreviewCard key={item.href} href={item.href} title={item.title} note={item.note} />
          ))}
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">画面一覧（メニューと同じ）</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          ログイン後、左のメニューから開く画面と同じリンクです。タップするとそのまま移動します。
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {APP_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-slate-300 hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <h3 className="mt-6 text-sm font-semibold text-slate-800">その他の画面</h3>
        <ul className="mt-2 space-y-2">
          {EXTRA_SCREEN_LINKS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm transition hover:border-slate-300 hover:bg-white"
              >
                <span className="font-medium text-slate-900">{item.label}</span>
                <span className="mt-0.5 block text-xs text-slate-600">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">はじめに</h2>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-600">
          <li>
            <strong className="font-medium text-slate-800">アカウント</strong>
            ：メールアドレスとパスワードでログインします。
          </li>
          <li>
            <strong className="font-medium text-slate-800">施設（ホテル）</strong>
            ：案内ページは施設単位で管理されます。チーム機能で他のスタッフを招待できます。
          </li>
        </ul>
        <OpenScreenLink href="/login">ログイン画面を開く</OpenScreenLink>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">ダッシュボード</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          ログイン後のホームです。ページの新規作成、テンプレート、説明文からの AI 生成（表示されている場合）、分析サマリー、最近編集したページへのショートカットがあります。
        </p>
        <OpenScreenLink href="/dashboard">ダッシュボードを開く</OpenScreenLink>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">ページ一覧</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          施設内の案内ページを一覧で管理します。単発ページとページ連携をセット単位で見られます。各ページから編集・公開／下書き・名前変更・削除ができます。
        </p>
        <OpenScreenLink href="/dashboard/pages">ページ一覧を開く</OpenScreenLink>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">テンプレート</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          館内案内などの型を選び、自分の施設向けに複製して編集できます。
        </p>
        <OpenScreenLink href="/templates">テンプレートを開く</OpenScreenLink>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">エディタ</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          ダッシュボードやページ一覧から「編集」を選ぶと開きます。カードを並べてスマホ向け案内を作ります。左のライブラリでブロック追加、右のパネルで文字・色・フォント、上部の「一括フォント」やプレビュー・公開もここから使います。
        </p>
        <p className="mt-2 text-sm text-slate-500">
          ページをまだ作っていない場合は、先にダッシュボードで「ページを作成」してください。
        </p>
        <OpenScreenLink href="/dashboard">ページを作成する（ダッシュボード）</OpenScreenLink>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">QR・印刷</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          QR の管理と、大きな QR の表示・印刷は別の画面です。どちらも左メニューにはないため、下のリンクから開いてください。
        </p>
        <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <li>
            <OpenScreenLink href="/dashboard/qr">QRコード管理を開く</OpenScreenLink>
          </li>
          <li>
            <OpenScreenLink href="/dashboard/qr-generator">QRコード生成（大きく表示）を開く</OpenScreenLink>
          </li>
        </ul>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">分析</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          閲覧数や国・言語別の傾向、人気ページを確認できます（プランにより表示内容が異なります）。
        </p>
        <OpenScreenLink href="/dashboard/analytics">分析ダッシュボードを開く</OpenScreenLink>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">チーム</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          施設にメンバーを招待し、編集権限や閲覧のみなどの役割を分けられます。
        </p>
        <OpenScreenLink href="/dashboard/team">チームを開く</OpenScreenLink>
      </Card>

      <Card padding="lg">
        <h2 className="text-base font-semibold text-slate-900">お客様向けの公開ページ（URL）</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          公開した案内は、施設ごとに発行される URL（パスは{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">/p/…</code> 形式）で閲覧されます。パンフレットや客室の QR に載せます。
        </p>
        <p className="mt-2 text-sm text-slate-500">
          公開 URL はページ一覧や各ページカードの「公開ページを見る」からも開けます。
        </p>
        <OpenScreenLink href="/dashboard/pages">ページ一覧で URL を確認する</OpenScreenLink>
      </Card>

      <p className="text-center text-xs text-slate-400">
        機能は随時アップデートされるため、画面とあわせてご利用ください。
      </p>
    </div>
  );
}
