"use client";

import type { ReactNode } from "react";
import type { PageBackgroundStyle } from "@/lib/storage";

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
  /** Page background style configured in editor */
  pageBackground?: PageBackgroundStyle | null;
};

const PHONE_WIDTH = 375;

function PageContent({
  title,
  backButton,
  children,
  contactActions,
}: Omit<PublicPageShellProps, "isEmbed">) {
  return (
    <>
      <header className="sticky top-0 z-20 bg-white/95 px-4 py-4 backdrop-blur-sm safe-area-inset-top">
        <div className="mx-auto flex max-w-[420px] flex-col gap-3">
          {backButton ? <div className="min-h-[44px]">{backButton}</div> : null}
          {title.trim() ? (
            <h1 className="text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl">
              {title}
            </h1>
          ) : null}
        </div>
      </header>
      <main className="flex-1 px-4 pb-8 pt-5">
        <div className="mx-auto max-w-[420px] space-y-5">{children}</div>
      </main>
      {contactActions ? (
        <footer className="bg-white px-4 py-5">
          <div className="mx-auto max-w-[420px]">{contactActions}</div>
        </footer>
      ) : (
        <footer className="bg-white px-4 py-5">
          <div className="mx-auto max-w-[420px]">
            <p className="text-sm leading-relaxed text-slate-600">
              ご不明な点はスタッフまでお声がけください。
            </p>
          </div>
        </footer>
      )}
    </>
  );
}

/**
 * Public page layout for guests (QR / shared link).
 * Structure: header → main cards → secondary info → contact actions.
 * Mobile-first, large touch targets.
 * On desktop: スマホ画面風のフレームで表示
 */
export function PublicPageShell({
  title,
  backButton,
  children,
  contactActions,
  isEmbed = false,
  pageBackground = null,
}: PublicPageShellProps) {
  const pageBackgroundStyle =
    pageBackground?.mode === "gradient"
      ? `linear-gradient(${pageBackground.angle}deg, ${pageBackground.from}, ${pageBackground.to})`
      : pageBackground?.color ?? "#ffffff";

  if (isEmbed) {
    return (
      <div className="min-h-full" style={{ background: pageBackgroundStyle }}>
        <main className="min-h-full pb-6">{children}</main>
        {contactActions ? (
          <footer className="bg-white/80 px-4 py-5 backdrop-blur-sm">
            {contactActions}
          </footer>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f1f5f9] md:min-h-screen md:items-center md:justify-center md:bg-slate-300 md:py-8">
      <div
        className="flex w-full flex-1 flex-col md:flex-none"
        style={{ maxWidth: "100%" }}
      >
        <div
          className="flex flex-1 flex-col bg-[#f1f5f9] md:mx-auto md:flex-none md:rounded-[2rem] md:border md:border-slate-200/90 md:bg-slate-100/80 md:p-3 md:shadow-[0_8px_32px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.08)]"
          style={{ width: "100%", maxWidth: PHONE_WIDTH + 24 }}
        >
          <div className="mx-auto mb-1 hidden h-2 w-16 shrink-0 rounded-full bg-slate-300/70 md:block" aria-hidden />
          <div
            className="flex min-h-[480px] w-full flex-1 flex-col overflow-hidden rounded-b-[1.25rem] border-0 border-t-0 bg-white md:h-[84vh] md:max-h-[84vh] md:max-w-[375px] md:rounded-[1.25rem] md:border md:border-slate-200/80"
          >
            <div
              className="template-preview-scroll flex h-full min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain"
              style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y", background: pageBackgroundStyle }}
            >
              <PageContent
                title={title}
                backButton={backButton}
                contactActions={contactActions}
              >
                {children}
              </PageContent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
