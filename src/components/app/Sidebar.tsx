"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV_ITEMS, PRODUCT_TAGLINE } from "./app-nav-items";
import {
  TEAM_PENDING_RED_DOT_PREVIEW,
  usePendingPublishApprovalCount,
} from "./usePendingPublishApprovalCount";

/**
 * Desktop sidebar (`lg+`). Mobile uses {@link MobileNavDrawer}.
 */
export function Sidebar() {
  const pathname = usePathname();
  const teamPendingApprovals = usePendingPublishApprovalCount();

  return (
    <aside
      className="hidden w-[240px] shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:flex"
      role="navigation"
      aria-label="メインメニュー"
    >
      <div className="border-b border-slate-200/60 px-4 py-4">
        <Link href="/dashboard" className="block rounded-xl py-0.5">
          <span className="text-lg font-semibold tracking-tight text-slate-900">Infomii</span>
          <p className="mt-0.5 text-[11px] font-normal text-slate-500">{PRODUCT_TAGLINE}</p>
        </Link>
      </div>
      <nav className="app-stagger flex flex-1 flex-col gap-1 p-3">
        {APP_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const showTeamPendingDot =
            item.href === "/dashboard/team" &&
            (teamPendingApprovals > 0 || TEAM_PENDING_RED_DOT_PREVIEW);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={
                teamPendingApprovals > 0
                  ? `${item.label}（承認待ちの公開申請があります）`
                  : showTeamPendingDot
                    ? `${item.label}（赤丸の表示確認）`
                    : undefined
              }
              title={
                teamPendingApprovals > 0
                  ? "承認待ちの公開申請があります"
                  : showTeamPendingDot
                    ? "確認用（承認待ちはありません）"
                    : undefined
              }
              className={
                "group app-interactive flex min-h-[40px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                (isActive
                  ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-slate-600 hover:bg-white/80 hover:text-slate-900")
              }
            >
              <span
                className={
                  "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-[transform,color,background-color] duration-200 motion-safe:group-hover:scale-105 " +
                  (isActive ? "bg-slate-100 text-slate-800" : "text-slate-500")
                }
              >
                {item.icon}
                {showTeamPendingDot ? (
                  <span
                    className="absolute right-0 top-0 z-[1] h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-50"
                    aria-hidden
                  />
                ) : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200/60 p-3">
        <Link
          href="/lp/saas"
          className="app-interactive flex min-h-[40px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-white/80 hover:text-slate-700"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          トップへ
        </Link>
      </div>
    </aside>
  );
}
