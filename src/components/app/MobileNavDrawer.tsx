"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAV_ITEMS, PRODUCT_TAGLINE } from "./app-nav-items";
import {
  TEAM_PENDING_RED_DOT_PREVIEW,
  usePendingPublishApprovalCount,
} from "./usePendingPublishApprovalCount";
import { useHotelName } from "@/lib/use-hotel-name";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Full-height slide-in navigation for viewports below `lg`.
 * Locks body scroll while open.
 */
export function MobileNavDrawer({ open, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();
  const teamPendingApprovals = usePendingPublishApprovalCount();
  const { hotelName, loaded: hotelNameLoaded } = useHotelName();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="メインメニュー">
      <button
        type="button"
        className="ui-overlay-fade absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-label="メニューを閉じる"
      />
      <nav
        className="ui-pop-in absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col border-r border-[#e6e8eb] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="border-b border-[#e6e8eb] px-4 pb-3">
          <Link href="/dashboard" className="block py-0.5" onClick={onClose}>
            <span className="text-xl font-semibold tracking-tight text-slate-900">Infomii</span>
            {hotelNameLoaded && hotelName ? (
              <p className="mt-1 truncate text-sm font-medium leading-snug text-slate-700" title={hotelName}>
                {hotelName}
              </p>
            ) : (
              <p className="mt-1 text-sm leading-snug text-slate-500">{PRODUCT_TAGLINE}</p>
            )}
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2.5">
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
                onClick={onClose}
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
                  "flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors " +
                  (isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900")
                }
              >
                <span
                  className={
                    "relative flex h-6 w-6 shrink-0 items-center justify-center " +
                    (isActive ? "text-slate-800" : "text-slate-400")
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
        </div>
        <div className="border-t border-[#e6e8eb] p-2.5">
          <Link
            href="/lp/business"
            onClick={onClose}
            className="flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            サービス紹介
          </Link>
        </div>
      </nav>
    </div>
  );
}
