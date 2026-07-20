"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button, Container } from "@/components/ui";

type LpSaasHeaderProps = {
  loginHref: string;
  ctaHref: string;
};

export function LpSaasHeader({ loginHref, ctaHref }: LpSaasHeaderProps) {
  const homeHref = "/lp/business";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const firstMenuLinkRef = useRef<HTMLAnchorElement | null>(null);
  const navLinkClass =
    "inline-flex min-h-[44px] items-center rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 transition-colors duration-200 " +
    "motion-safe:hover:-translate-y-px motion-safe:hover:bg-emerald-50/60 motion-safe:hover:text-emerald-800 " +
    "sm:px-3";

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstMenuLinkRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-shadow duration-300 motion-safe:hover:shadow-sm">
      <Container className="flex h-14 items-center gap-2 sm:gap-3">
        <Link
          href={homeHref}
          className="shrink-0 text-lg font-semibold tracking-tight text-slate-900 transition-colors duration-200 motion-safe:hover:text-emerald-800"
        >
          Infomii
        </Link>

        <div className="min-w-0 flex-1 md:flex-none" />

        <nav className="ml-auto hidden shrink-0 flex-wrap items-center justify-end gap-0.5 sm:gap-1 md:flex">
          <a href="#operations" className={navLinkClass}>
            現場のメリット
          </a>
          <a href="#live-demo" className={navLinkClass}>
            デモ
          </a>
          <a href="#pricing" className={navLinkClass}>
            料金
          </a>
          <Link href="/blog" className={navLinkClass}>
            ブログ
          </Link>
          <Button href={loginHref} variant="ghost" size="md" className="min-h-[44px] rounded-lg px-2 sm:px-4">
            ログイン
          </Button>
          <Button
            href={ctaHref}
            size="md"
            className="min-h-[44px] px-3 sm:px-4 !border-ds-accent/30 !bg-ds-accent hover:!bg-ds-accent-strong hover:!shadow-[0_2px_8px_rgba(5,150,105,0.22)]"
          >
            無料ではじめる
          </Button>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 md:hidden"
          aria-label="メニューを開く"
          aria-expanded={mobileMenuOpen}
          aria-controls="lp-mobile-menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </Container>

      <>
        <button
          type="button"
          aria-label="メニューを閉じる"
          aria-hidden={!mobileMenuOpen}
          className={`fixed inset-0 z-50 bg-slate-900/40 transition-opacity duration-200 md:hidden ${
            mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        <div
          id="lp-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="LPメニュー"
          aria-hidden={!mobileMenuOpen}
          className={`fixed inset-x-0 top-14 z-[60] border-b border-slate-200 bg-white px-4 pb-5 pt-3 shadow-xl transition-[opacity,transform] duration-200 md:hidden ${
            mobileMenuOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-2">
            <a
              ref={firstMenuLinkRef}
              href="#operations"
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              現場のメリット
            </a>
            <a
              href="#live-demo"
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              デモ
            </a>
            <a href="#pricing" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
              料金
            </a>
            <Link href="/blog" className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
              ブログ
            </Link>
            <Link href={loginHref} className={navLinkClass} onClick={() => setMobileMenuOpen(false)}>
              ログイン
            </Link>
            <Button
              href={ctaHref}
              size="md"
              className="min-h-[44px] justify-center !border-ds-accent/30 !bg-ds-accent hover:!bg-ds-accent-strong hover:!shadow-[0_2px_8px_rgba(5,150,105,0.22)]"
            >
              無料ではじめる
            </Button>
          </div>
        </div>
      </>
    </header>
  );
}
