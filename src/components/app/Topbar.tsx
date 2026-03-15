"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TopbarProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

function getPageTitle(pathname: string): { title: string; subtitle?: string } {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard") && pathname === "/dashboard") {
    return { title: "ダッシュボード", subtitle: "ゲスト向け案内ページの管理" };
  }
  if (pathname.startsWith("/dashboard/pages")) {
    return { title: "ページ", subtitle: "案内ページの一覧・作成" };
  }
  if (pathname.startsWith("/dashboard/templates")) {
    return { title: "テンプレート", subtitle: "テンプレートから作成" };
  }
  if (pathname.startsWith("/dashboard/analytics")) {
    return { title: "分析", subtitle: "閲覧・QRスキャン状況" };
  }
  if (pathname.startsWith("/editor")) {
    return { title: "ページエディタ", subtitle: "案内ページを編集" };
  }
  if (pathname.startsWith("/settings")) {
    return { title: "設定", subtitle: "アカウント・施設設定" };
  }
  return { title: "Infomii", subtitle: "" };
}

export function Topbar({ title: titleProp, subtitle: subtitleProp, actions }: TopbarProps) {
  const pathname = usePathname();
  const { title: titleFromPath, subtitle: subtitleFromPath } = getPageTitle(pathname);
  const title = titleProp ?? titleFromPath;
  const subtitle = subtitleProp ?? subtitleFromPath;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-ds-border bg-ds-card px-6 shadow-[var(--shadow-ds-xs)]">
      <div>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Link
          href="/"
          className="rounded-lg border border-ds-border bg-ds-card px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          トップへ
        </Link>
      </div>
    </header>
  );
}
