"use client";

import { usePathname } from "next/navigation";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getDashboardBootstrapData } from "@/lib/storage";

type TopbarProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** Opens slide-in navigation (mobile only). */
  onOpenMobileNav?: () => void;
};

const SECTION_TITLES: Record<string, string> = {
  "/dashboard": "ダッシュボード",
  "/dashboard/pages": "ページ",
  "/templates": "テンプレート",
  "/dashboard/analytics": "分析",
  "/settings": "設定",
};

function getSectionTitle(pathname: string | null): string {
  if (!pathname) return "";
  if (pathname.startsWith("/editor")) return "編集";
  const exact = SECTION_TITLES[pathname];
  if (exact) return exact;
  const matched = Object.entries(SECTION_TITLES)
    .filter(([path]) => path !== "/dashboard" && pathname.startsWith(path))
    .sort(([a], [b]) => b.length - a.length)[0];
  return matched ? matched[1] : pathname.startsWith("/dashboard") ? "ダッシュボード" : "";
}

function getInitials(email: string | undefined): string {
  if (!email) return "?";
  const part = email.split("@")[0] ?? "";
  if (part.length >= 2) return part.slice(0, 2).toUpperCase();
  return part.slice(0, 1).toUpperCase() || "?";
}

/**
 * トップバー — ワークスペース名・セクション・ユーザーアバター・ログアウトメニュー
 * Linear / Notion / Stripe 風
 */
export function Topbar({ title: _title, subtitle: _subtitle, actions, onOpenMobileNav }: TopbarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [workspaceTitle, setWorkspaceTitle] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    getDashboardBootstrapData()
      .then((d) => {
        if (mounted) setWorkspaceTitle(d.hotelName || "施設");
      })
      .catch(() => {
        if (mounted) setWorkspaceTitle("施設");
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [menuOpen]);

  const sectionTitle = getSectionTitle(pathname);
  const email = user?.email;
  const initials = getInitials(email);

  return (
    <header
      className="app-page-enter flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white px-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:gap-4 sm:px-4"
      style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="app-button-native flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 lg:hidden"
            aria-label="メニューを開く"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="hidden min-w-0 items-center gap-2 sm:flex">
            <span className="truncate text-sm font-medium text-slate-700">{workspaceTitle || "—"}</span>
            {sectionTitle && (
              <>
                <span className="shrink-0 text-slate-300" aria-hidden>
                  /
                </span>
                <h1 className="truncate text-sm font-semibold text-slate-800">{sectionTitle}</h1>
              </>
            )}
          </div>
          <div className="min-w-0 sm:hidden">
            <span className="block truncate text-[11px] font-medium uppercase tracking-wide text-slate-500">
              {workspaceTitle || "—"}
            </span>
            {sectionTitle && (
              <h1 className="truncate text-sm font-semibold leading-tight text-slate-900">{sectionTitle}</h1>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {actions}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="app-button-native flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="ユーザーメニュー"
          >
            {initials}
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-2 min-w-[160px] rounded-xl border border-slate-200 bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              role="menu"
            >
              <div className="border-b border-slate-100 px-3 py-2">
                <p className="truncate text-xs font-medium text-slate-500">ログイン中</p>
                <p className="truncate text-sm text-slate-800">{email || "—"}</p>
              </div>
              <Link
                href="/settings"
              className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
              >
                設定
              </Link>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut();
                }}
              >
                ログアウト
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
