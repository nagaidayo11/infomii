"use client";

import { usePathname } from "next/navigation";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { APP_NAV_ITEMS } from "./app-nav-items";
import { useProfileDisplayName } from "@/lib/use-profile-display-name";
import { getAvatarInitials } from "@/lib/user-label";

type TopbarProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  /** Opens slide-in navigation (mobile only). */
  onOpenMobileNav?: () => void;
};

const SECTION_TITLES: Record<string, string> = {
  "/dashboard/summary": "ダッシュボード",
};

function getSectionTitle(pathname: string | null): string {
  if (!pathname) return "";
  if (pathname.startsWith("/editor")) return "編集";

  const extra = SECTION_TITLES[pathname];
  if (extra) return extra;

  const exactNav = APP_NAV_ITEMS.find((item) => item.href === pathname);
  if (exactNav) return exactNav.label;

  const prefixNav = [...APP_NAV_ITEMS]
    .filter((item) => item.href !== "/dashboard" && pathname.startsWith(item.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (prefixNav) return prefixNav.label;

  return pathname.startsWith("/dashboard") ? "ダッシュボード" : "";
}

export function Topbar({ title: _title, subtitle: _subtitle, actions, onOpenMobileNav }: TopbarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { displayName } = useProfileDisplayName();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = () => {
    const el = triggerRef.current;
    if (!el || typeof window === "undefined") return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  };

  useLayoutEffect(() => {
    if (!menuOpen) return;
    updateMenuPosition();
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [menuOpen]);

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handlePointerDown, true);
      return () => document.removeEventListener("mousedown", handlePointerDown, true);
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const sectionTitle = getSectionTitle(pathname);
  const email = user?.email;
  const initials = getAvatarInitials(displayName, email);

  const userMenu =
    menuOpen && typeof document !== "undefined" ? (
      createPortal(
        <div
          ref={panelRef}
          className="ui-pop-in fixed z-[200] min-w-[200px] max-w-[min(100vw-1rem,20rem)] rounded-xl border border-slate-200 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
          role="menu"
          style={{
            top: menuPos.top,
            right: menuPos.right,
          }}
        >
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-xs font-medium text-slate-500">ログイン中</p>
            {displayName ? (
              <>
                <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                {email ? <p className="truncate text-xs text-slate-500">{email}</p> : null}
              </>
            ) : (
              <p className="truncate text-sm text-slate-800">{email || "—"}</p>
            )}
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
        </div>,
        document.body
      )
    ) : null;

  return (
    <header
      className="app-content-enter flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white px-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:gap-4 sm:px-4"
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
            {sectionTitle && (
              <h1 className="truncate text-sm font-semibold text-slate-800">{sectionTitle}</h1>
            )}
          </div>
          <div className="min-w-0 sm:hidden">
            {sectionTitle && (
              <h1 className="truncate text-sm font-semibold leading-tight text-slate-900">{sectionTitle}</h1>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {actions}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setMenuOpen((o) => {
              const next = !o;
              if (next && triggerRef.current && typeof window !== "undefined") {
                const rect = triggerRef.current.getBoundingClientRect();
                setMenuPos({
                  top: rect.bottom + 8,
                  right: window.innerWidth - rect.right,
                });
              }
              return next;
            });
          }}
          className="app-button-native flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300"
          aria-expanded={menuOpen}
          aria-haspopup="true"
          aria-label={displayName ? `${displayName}のメニュー` : "ユーザーメニュー"}
        >
          {initials}
        </button>
      </div>
      {userMenu}
    </header>
  );
}
