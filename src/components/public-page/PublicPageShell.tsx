"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useCallback } from "react";
import {
  GUEST_CARD_STACK_CLASS,
  GUEST_CARD_STACK_FLUSH_CLASS,
} from "@/lib/editor/card-width-mode";
import { GUEST_PAGE_MAX_CONTENT_WIDTH_PX } from "@/lib/guest-page-layout";
import { interceptGuestAnchorHardNavigation } from "@/lib/guest-hard-navigation";
import type { PageBackgroundStyle } from "@/lib/storage";
import { PhoneDeviceFrame } from "@/components/ui/PhoneDeviceFrame";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { PageAtmosphereDecor } from "@/components/atmosphere/PageAtmosphereDecor";
import { normalizePageAtmosphere } from "@/lib/page-atmosphere";

type PublicPageShellProps = {
  /** Page or facility name — shown in header so guests quickly understand where they are */
  title: string;
  /** Optional circular brand mark next to title */
  brandLogoSrc?: string | null;
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
  /**
   * How embed chrome nests in a host phone frame.
   * - card: rounded inset (default, e.g. demo panels)
   * - device: flush square screen for CSS/device shells (avoids double radius / notch clash)
   */
  embedFit?: "card" | "device";
  /** Page background style configured in editor */
  pageBackground?: PageBackgroundStyle | null;
  /** Same-origin links use full page loads (required for app WebView / preview). */
  hardNavigation?: boolean;
  /** Flush main content (edge-to-edge hero/list hospitality home). */
  contentInset?: "default" | "flush";
};

function PageHeader({
  title,
  brandLogoSrc,
  backButton,
  headerActions,
  className = "px-4 py-3",
  isNativeUi = false,
}: {
  title: string;
  brandLogoSrc?: string | null;
  backButton?: ReactNode;
  headerActions?: ReactNode;
  className?: string;
  isNativeUi?: boolean;
}) {
  if (!backButton && !title.trim() && !headerActions) return null;

  const headerChromeClass = isNativeUi
    ? "border-b border-[var(--app-border)] bg-[color-mix(in_srgb,var(--app-surface)_92%,transparent)] backdrop-blur-sm"
    : "border-b border-slate-200/80 bg-white/95 backdrop-blur-sm";

  return (
    <header
      className={`app-page-enter relative z-[90] shrink-0 overflow-visible safe-area-inset-top ${headerChromeClass} ${className}`}
      data-guest-header
    >
      <div
        className="mx-auto flex w-full flex-col gap-2.5"
        style={{ maxWidth: GUEST_PAGE_MAX_CONTENT_WIDTH_PX }}
      >
        {backButton ? <div className="min-h-[44px]">{backButton}</div> : null}
        {(title.trim() || headerActions) && (
          <div className={"flex justify-between gap-2 " + (brandLogoSrc ? "items-center" : "items-start")}>
            {title.trim() ? (
              brandLogoSrc ? (
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brandLogoSrc}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-slate-200/80"
                  />
                  <h1 className={"min-w-0 flex-1 truncate text-[15px] leading-tight sm:text-base " + (isNativeUi ? "font-extrabold tracking-tight text-[var(--app-text)]" : "font-semibold tracking-tight text-slate-900")}>
                    {title}
                  </h1>
                </div>
              ) : (
                <h1 className={"min-w-0 flex-1 break-words text-lg leading-tight sm:text-2xl " + (isNativeUi ? "font-extrabold tracking-tight text-[var(--app-text)]" : "font-bold tracking-tight text-slate-900")}>
                  {title}
                </h1>
              )
            ) : (
              <div className="min-w-0 flex-1" />
            )}
            {headerActions ? <div className="flex shrink-0 items-center justify-end">{headerActions}</div> : null}
          </div>
        )}
      </div>
    </header>
  );
}

function PageContent({
  title,
  brandLogoSrc,
  backButton,
  children,
  contactActions,
  bottomChrome,
  headerActions,
  headerClassName,
  contentClassName,
  guestGutter,
  contentInset,
  isNativeUi = false,
}: Omit<PublicPageShellProps, "isEmbed" | "pageBackground" | "hardNavigation"> & {
  headerClassName?: string;
  contentClassName?: string;
  guestGutter?: string;
  isNativeUi?: boolean;
}) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <PageHeader
        title={title}
        brandLogoSrc={brandLogoSrc}
        backButton={backButton}
        headerActions={headerActions}
        className={headerClassName}
        isNativeUi={isNativeUi}
      />
      <main
        className="guest-page guest-content-gutter guest-page-main template-preview-scroll min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
        data-guest-gutter={guestGutter}
        data-guest-content-inset={contentInset}
        style={
          guestGutter != null
            ? ({
                ["--guest-gutter" as string]: guestGutter === "0" ? "0px" : `${guestGutter}rem`,
              } as CSSProperties)
            : undefined
        }
      >
        <div
          className={"app-stagger mx-auto w-full " + (contentClassName ?? GUEST_CARD_STACK_CLASS)}
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
  brandLogoSrc = null,
  backButton,
  children,
  contactActions,
  bottomChrome,
  headerActions,
  isEmbed = false,
  embedFit = "card",
  pageBackground = null,
  hardNavigation = true,
  contentInset = "default",
}: PublicPageShellProps) {
  const { isNativeUi } = useClientShell();
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
  const atmosphere = normalizePageAtmosphere(pageBackground?.atmosphere);

  const flush = contentInset === "flush";
  const deviceEmbed = isEmbed && embedFit === "device";
  const mainPadStyle: CSSProperties | undefined = flush
    ? undefined
    : deviceEmbed
      ? ({
          ["--guest-main-pad-y-top" as string]: "0.5rem",
          ["--guest-main-pad-y-bottom" as string]: "1.25rem",
        } as CSSProperties)
      : undefined;
  const guestGutter = flush ? "0" : deviceEmbed ? "0.75" : isEmbed ? "0.875" : undefined;
  const contentClassName = flush ? GUEST_CARD_STACK_FLUSH_CLASS : GUEST_CARD_STACK_CLASS;
  const headerClassName = deviceEmbed
    ? "px-3 pb-2 pt-8"
    : isEmbed
      ? "px-3.5 pb-2.5 pt-3"
      : "px-4 py-3";

  if (isEmbed) {
    return (
      <div
        className={
          deviceEmbed
            ? "guest-page relative flex h-full min-h-0 flex-col overflow-hidden bg-white"
            : "guest-page relative h-[100dvh] overflow-hidden rounded-[1.5rem] bg-white pt-3"
        }
        style={{ background: pageBackgroundStyle, ...mainPadStyle }}
        onClickCapture={onGuestLinkCapture}
      >
        <PageAtmosphereDecor atmosphere={atmosphere} />
        <div className="relative z-[1] flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <PageContent
            title={title}
            brandLogoSrc={brandLogoSrc}
            backButton={backButton}
            contactActions={contactActions}
            bottomChrome={bottomChrome}
            headerActions={headerActions}
            headerClassName={headerClassName}
            contentClassName={contentClassName}
            guestGutter={guestGutter}
            contentInset={contentInset}
            isNativeUi={isNativeUi}
          >
            {children}
          </PageContent>
        </div>
      </div>
    );
  }

  const inner = (
    <div className="relative z-[1] flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <PageContent
        title={title}
        brandLogoSrc={brandLogoSrc}
        backButton={backButton}
        contactActions={contactActions}
        bottomChrome={bottomChrome}
        headerActions={headerActions}
        headerClassName={headerClassName}
        contentClassName={contentClassName}
        guestGutter={guestGutter}
        contentInset={contentInset}
        isNativeUi={isNativeUi}
      >
        {children}
      </PageContent>
    </div>
  );

  return (
    <div
      className="guest-page flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[#e8eef4] md:bg-slate-300"
      data-guest-page-root
    >
      {/* Mobile: full-bleed, no chassis */}
      <div
        className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-white md:hidden"
        data-guest-page-shell
        style={{ background: pageBackgroundStyle }}
        onClickCapture={onGuestLinkCapture}
      >
        <PageAtmosphereDecor atmosphere={atmosphere} />
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
            className="relative flex h-full min-h-0 flex-col overflow-hidden"
            data-guest-page-shell
            onClickCapture={onGuestLinkCapture}
          >
            <PageAtmosphereDecor atmosphere={atmosphere} />
            {inner}
          </div>
        </PhoneDeviceFrame>
      </div>
    </div>
  );
}
