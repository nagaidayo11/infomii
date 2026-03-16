"use client";

import type { ReactNode } from "react";

type PublicPageShellProps = {
  /** Page or facility name — shown in header so guests quickly understand where they are */
  title: string;
  /** Optional back link (e.g. when coming from hub) */
  backButton?: ReactNode;
  /** Primary + secondary content. Use large touch-friendly cards inside. */
  children: ReactNode;
  /** Optional contact/CTA section at bottom */
  contactActions?: ReactNode;
  /** Embed mode: no outer padding, no header chrome */
  isEmbed?: boolean;
};

/**
 * Public page layout for guests (QR / shared link).
 * Structure: header → main cards → secondary info → contact actions.
 * Mobile-first, large touch targets.
 */
export function PublicPageShell({
  title,
  backButton,
  children,
  contactActions,
  isEmbed = false,
}: PublicPageShellProps) {
  if (isEmbed) {
    return (
      <div className="min-h-full bg-[#f8fafc]">
        <main className="min-h-full pb-6">{children}</main>
        {contactActions ? (
          <footer className="border-t border-slate-200/80 bg-white px-4 py-5">
            {contactActions}
          </footer>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f1f5f9]">
      {/* Header — sticky, clear title so guests understand immediately */}
      <header className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm safe-area-inset-top">
        <div className="mx-auto flex max-w-[420px] flex-col gap-3">
          {backButton ? <div className="min-h-[44px]">{backButton}</div> : null}
          <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h1>
        </div>
      </header>

      {/* Main content — cards and secondary information */}
      <main className="flex-1 px-4 pb-8 pt-5">
        <div className="mx-auto max-w-[420px] space-y-5">{children}</div>
      </main>

      {/* Contact actions — large touch-friendly footer */}
      {contactActions ? (
        <footer className="border-t border-slate-200/90 bg-white px-4 py-5 shadow-[0_-1px_2px_rgba(0,0,0,0.04)]">
          <div className="mx-auto max-w-[420px]">{contactActions}</div>
        </footer>
      ) : (
        <footer className="border-t border-slate-200/80 bg-white px-4 py-5">
          <div className="mx-auto max-w-[420px]">
            <p className="text-sm leading-relaxed text-slate-600">
              ご不明な点はスタッフまでお声がけください。
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
