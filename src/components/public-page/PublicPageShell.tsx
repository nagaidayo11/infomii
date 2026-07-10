"use client";

import type { MouseEvent, ReactNode } from "react";
import { useCallback } from "react";
import { GUEST_PAGE_MAX_CONTENT_WIDTH_PX } from "@/lib/guest-page-layout";
import { interceptGuestAnchorHardNavigation } from "@/lib/guest-hard-navigation";
import type { PageBackgroundStyle } from "@/lib/storage";
import { PhoneDeviceFrame } from "@/components/ui/PhoneDeviceFrame";

type PublicPageShellProps = {
  /** Page or facility name — shown in header so guests quickly understand where they are */
  title: string;
  /** Optional back link (e.g. when coming from hub) */
  backButton?: ReactNode;
  /** Primary + secondary content. Use large touch-friendly cards inside. */
  children: ReactNode;
  /** Optional contact/CTA section at bottom */
  contactActions?: ReactNode;
  /** Facility-wide bottom tab chrome (Core Guide–style) */
  bottomChrome?: ReactNode;
  /** Optional actions rendered on the same row as title (e.g. language toggle) */
  headerActions?: ReactNode;
  /** Embed mode: no outer padding, no header chrome */
  isEmbed?: boolean;
  /** Page background style configured in editor */
  pageBackground?: PageBackgroundStyle | null;
  /** Same-origin links use full page loads (required for app WebView / preview). */
  hardNavigation?: boolean;
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
  bottomChrome,
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
      {bottomChrome ? (
        <div className="guest-bottom-chrome shrink-0 z-30 bg-white">
          {bottomChrome}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Public page layout for guests (QR / shared link).
 * Mobile: full-bleed. Desktop: phone chassis filling most of the viewport height.
 */
export function PublicPageShell({
  title,
  backButton,
  children,
  contactActions,
  bottomChrome,
  headerActions,
  isEmbed = false,
  pageBackground = null,
  hardNavigation = true,
}: PublicPageShellProps) {
  const onGuestLinkCapture = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (!hardNavigation) return;
      interceptGuestAnchorHardNavigation(event.nativeEvent);
    },
    [hardNavigation],
  );

  const pageBackgroundStyle =
    pageBackground?.mode === "gradient"
      ? `linear-gradient(${pageBackground.angle}deg, ${pageBackground.from}, ${pageBackground.to})`
      : pageBackground?.color ?? "#ffffff";

  if (isEmbed) {
    return (
      <div
        className="h-[100dvh] overflow-hidden rounded-[1.5rem] bg-white pt-3"
        style={{ background: pageBackgroundStyle }}
        onClickCapture={onGuestLinkCapture}
      >
        <PageContent
          title={title}
          backButton={backButton}
          contactActions={contactActions}
          bottomChrome={bottomChrome}
          headerActions={headerActions}
          headerClassName="px-3.5 pb-2.5 pt-3"
          mainClassName="px-3.5 pb-6 pt-4"
        >
          {children}
        </PageContent>
      </div>
    );
  }

  const inner = (
    <PageContent
      title={title}
      backButton={backButton}
      contactActions={contactActions}
      bottomChrome={bottomChrome}
      headerActions={headerActions}
    >
      {children}
    </PageContent>
  );

  return (
    <div
      className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#e8eef4] md:bg-slate-300"
      data-guest-page-root
    >
      {/* Mobile: full-bleed, no chassis */}
      <div
        className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-white md:hidden"
        data-guest-page-shell
        style={{ background: pageBackgroundStyle }}
        onClickCapture={onGuestLinkCapture}
      >
        {inner}
      </div>

      {/* Desktop: fixed 400 screen width, with top/bottom inset */}
      <div className="hidden h-full min-h-0 w-full flex-1 md:block">
        <PhoneDeviceFrame
          width={350}
          fillHeight
          verticalInset={28}
          manageScroll={false}
          className="h-full w-full"
          screenStyle={{ background: pageBackgroundStyle }}
        >
          <div
            className="flex h-full min-h-0 flex-col overflow-hidden"
            data-guest-page-shell
            onClickCapture={onGuestLinkCapture}
          >
            {inner}
          </div>
        </PhoneDeviceFrame>
      </div>
    </div>
  );
}
