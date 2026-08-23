"use client";

import Link from "next/link";
import { getNavItemsByGroup, PRODUCT_TAGLINE } from "./app-nav-items";
import { AppNavLink } from "./AppNavLink";
import { useHotelName } from "@/lib/use-hotel-name";
import { SidebarPlanHint } from "./SidebarPlanHint";
import { InfomiiAppMark } from "./InfomiiAppMark";
import { LayoutGroup } from "framer-motion";

/**
 * Desktop sidebar (`lg+`). Mobile uses {@link MobileNavDrawer}.
 */
export function Sidebar() {
  const { hotelName, loaded: hotelNameLoaded } = useHotelName();
  const groups = getNavItemsByGroup();

  return (
    <aside
      className="relative z-10 hidden w-[248px] shrink-0 flex-col border-r border-slate-200/80 bg-[#f3f4f6] lg:flex"
      role="navigation"
      aria-label="メインメニュー"
    >
      <div className="px-3 pb-3 pt-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-white/70"
        >
          <InfomiiAppMark className="h-8 w-8 drop-shadow-[0_1px_1px_rgba(15,23,42,0.12)]" />
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold leading-none tracking-tight text-slate-900">
              Infomii
            </span>
            {hotelNameLoaded && hotelName ? (
              <span className="mt-1 block truncate text-[11px] font-medium leading-snug text-slate-500" title={hotelName}>
                {hotelName}
              </span>
            ) : (
              <span className="mt-1 block text-[11px] leading-snug text-slate-500">{PRODUCT_TAGLINE}</span>
            )}
          </span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2.5 pb-2">
        <LayoutGroup id="app-sidebar-nav">
          {groups.map((group) => (
            <div key={group.id}>
              <p className="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <AppNavLink key={item.href} item={item} compact />
                ))}
              </div>
            </div>
          ))}
        </LayoutGroup>
      </nav>
      <div className="border-t border-slate-200/80 p-2.5">
        <SidebarPlanHint />
        <Link
          href="/lp/business"
          className="flex min-h-[40px] items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-slate-600 transition hover:bg-white/70 hover:text-slate-900"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-200/50 text-slate-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.9}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </span>
          サービス紹介
        </Link>
      </div>
    </aside>
  );
}
