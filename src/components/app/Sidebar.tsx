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
 * Stripe-calm: white rail, hairline borders, quiet active state.
 */
export function Sidebar() {
  const pathname = usePathname();
  const teamPendingApprovals = usePendingPublishApprovalCount();

  return (
    <aside
      className="hidden w-[248px] shrink-0 flex-col border-r border-[#e6e8eb] bg-white lg:flex"
      role="navigation"
      aria-label="メインメニュー"
    >
      <div className="border-b border-[#e6e8eb] px-4 py-4">
        <Link href="/dashboard" className="block py-0.5">
          <span className="text-xl font-semibold tracking-tight text-slate-900">Infomii</span>
          <p className="mt-1 text-sm leading-snug text-slate-500">{PRODUCT_TAGLINE}</p>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2.5">
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
                "group flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors " +
                (isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
              }
            >
              <span
                className={
                  "relative flex h-6 w-6 shrink-0 items-center justify-center " +
                  (isActive ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600")
                }
              >
                {item.icon}
                {showTeamPendingDot ? (
                  <span
                    className="absolute -right-0.5 -top-0.5 z-[1] h-1.5 w-1.5 rounded-full bg-red-500"
                    aria-hidden
                  />
                ) : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[#e6e8eb] p-2.5">
        <Link
          href="/lp/business"
          className="flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          サービス紹介
        </Link>
      </div>
    </aside>
  );
}
