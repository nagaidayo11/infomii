"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppNavItem } from "./app-nav-items";
import {
  TEAM_PENDING_RED_DOT_PREVIEW,
  usePendingPublishApprovalCount,
} from "./usePendingPublishApprovalCount";

type AppNavLinkProps = {
  item: AppNavItem;
  onClick?: () => void;
  compact?: boolean;
};

export function AppNavLink({ item, onClick, compact = false }: AppNavLinkProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const teamPendingApprovals = usePendingPublishApprovalCount();
  const isActive =
    pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
  const showTeamPendingDot =
    item.href === "/dashboard/team" &&
    (teamPendingApprovals > 0 || TEAM_PENDING_RED_DOT_PREVIEW);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
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
        "group relative flex items-center gap-2.5 rounded-lg px-2 text-[13px] font-medium tracking-tight transition-colors duration-200 " +
        (compact ? "min-h-[40px] py-1.5" : "min-h-[44px] py-2") +
        " " +
        (isActive ? "text-slate-900" : "text-slate-600 hover:bg-white/55 hover:text-slate-900")
      }
    >
      {isActive ? (
        <motion.span
          layoutId="app-nav-active"
          className="absolute inset-0 z-0 rounded-lg bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] ring-1 ring-slate-200/90"
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 460, damping: 38, mass: 0.7 }
          }
          aria-hidden
        >
          <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-emerald-500" />
        </motion.span>
      ) : null}
      <span
        className={
          "relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-200 " +
          (isActive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-200/50 text-slate-500 group-hover:bg-white/80 group-hover:text-slate-700")
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
      <span className="relative z-[1]">{item.label}</span>
    </Link>
  );
}
