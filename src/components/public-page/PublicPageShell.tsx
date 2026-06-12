"use client";

import type { ReactNode } from "react";
import { GUEST_PAGE_MAX_CONTENT_WIDTH_PX } from "@/lib/guest-page-layout";
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
  /** Optional actions rendered on the same row as title (e.g. language toggle) */
  headerActions?: ReactNode;
  /** Embed mode: no outer padding, no header chrome */
  isEmbed?: boolean;
  /** Page background style configured in editor */
  pageBackground?: PageBackgroundStyle | null;
};

function PageHeader({
  title,
  backButton,
  headerActions,
  className = "px-4 py-3",
}: {
  title: string;
  backButton?: ReactNode;
  headerActions?: ReactNode;
  className?: string;
}) {
  if (!backButton && !title.trim() && !headerActions) return null;

  return (
    <header
      className={`app-page-enter shrink-0 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm safe-area-inset-top z-20 ${className}`}
    >
      <div
        className="mx-auto flex w-full flex-col gap-2.5"
        style={{ maxWidth: GUEST_PAGE_MAX_CONTENT_WIDTH_PX }}
      >
        {backButton ? <div className="min-h-[44px]">{backButton}</div> : null}
        {(title.trim() || headerActions) && (
          <div className="flex flex-col gap-1.5">
            {title.trim() ? (
              <h1 className="w-full break-words text-lg font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl">
                {title}
              </h1>
            ) : null}
            {headerActions ? <div className="flex justify-end">{headerActions}</div> : null}
          </div>
        )}
      </div>
    </header>
  );
}

function PageContent({
  title,
  backButton,
  children,
  contactActions,
  headerActions,
  headerClassName,
  mainClassName,
}: Omit<PublicPageShellProps, "isEmbed" | "pageBackground"> & {
  headerClassName?: string;
  mainClassName?: string;
}) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <PageHeader
        title={title}
        backButton={backButton}
        headerActions={headerActions}
        className={headerClassName}
      />
      <main
        className={
          "template-preview-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain " +
          (mainClassName ?? "px-4 pb-6 pt-4")
        }
      >
        <div
          className="app-stagger mx-auto w-full space-y-3"
          style={{ maxWidth: GUEST_PAGE_MAX_CONTENT_WIDTH_PX }}
        >
          {children}
        </div>
      </main>
      {contactActions ? (
        <footer className="app-page-enter shrink-0 border-t border-slate-200/80 bg-white px-4 py-5" style={{ animationDelay: "180ms" }}>
          <div className="mx-auto w-full" style={{ maxWidth: GUEST_PAGE_MAX_CONTENT_WIDTH_PX }}>
            {contactActions}
          </div>
        </footer>
      ) : null}
    </div>
  );
}

/**
 * Public page layout for guests (QR / shared link).
 * Structure: header → main cards → optional contact actions footer.
 * Mobile-first, large touch targets.
 * On desktop: スマホ画面風のフレームで表示
 */
export function PublicPageShell({
  title,
  backButton,
  children,
  contactActions,
  headerActions,
  isEmbed = false,
  pageBackground = null,
}: PublicPageShellProps) {
  const pageBackgroundStyle =
    pageBackground?.mode === "gradient"
      ? `linear-gradient(${pageBackground.angle}deg, ${pageBackground.from}, ${pageBackground.to})`
      : pageBackground?.color ?? "#ffffff";

  if (isEmbed) {
    return (
      <div className="h-[100dvh] overflow-hidden rounded-[1.5rem] bg-white pt-3" style={{ background: pageBackgroundStyle }}>
        <PageContent
          title={title}
          backButton={backButton}
          contactActions={contactActions}
          headerActions={headerActions}
          headerClassName="px-3.5 pb-2.5 pt-3"
          mainClassName="px-3.5 pb-6 pt-4"
        >
          {children}
        </PageContent>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-[#f1f5f9] md:min-h-screen md:items-center md:justify-center md:bg-slate-300 md:py-8"
      data-guest-page-root
    >
      <div className="flex w-full flex-1 flex-col md:flex-none">
        <div
          className={
            "flex w-full flex-1 flex-col bg-[#f1f5f9] md:mx-auto md:max-w-[399px] md:flex-none " +
            "md:rounded-[2rem] md:border md:border-slate-200/90 md:bg-slate-100/80 md:p-3 " +
            "md:shadow-[0_8px_32px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.08)]"
          }
        >
          <div className="mx-auto mb-1 hidden h-2 w-16 shrink-0 rounded-full bg-slate-300/70 md:block" aria-hidden />
          <div
            className={
              "flex min-h-[100dvh] w-full flex-1 flex-col overflow-hidden bg-white " +
              "md:min-h-[480px] md:h-[84vh] md:max-h-[84vh] md:max-w-[375px] md:rounded-[1.25rem] md:border md:border-slate-200/80"
            }
            data-guest-page-shell
            style={{ background: pageBackgroundStyle }}
          >
            <PageContent
              title={title}
              backButton={backButton}
              contactActions={contactActions}
              headerActions={headerActions}
            >
              {children}
            </PageContent>
          </div>
        </div>
      </div>
    </div>
  );
}
