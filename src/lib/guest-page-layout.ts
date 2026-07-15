/**
 * Guest / public card page horizontal layout — keep in sync with
 * `PublicPageShell` / editor FreeformCanvas (inset cards use --guest-gutter;
 * full-bleed heroes span the phone edge).
 */
export const GUEST_PAGE_MAIN_PADDING_X_PX = 16;

/** Tailwind `max-w-[420px]` — card column cap on narrow viewports. */
export const GUEST_PAGE_MAX_CONTENT_WIDTH_PX = 420;

/**
 * Card column max width inside a screen whose **inner** width is `screenInnerWidthPx`
 * (e.g. 375 for iPhone logical width), with standard horizontal padding.
 */
export function guestCardColumnMaxWidthPx(screenInnerWidthPx: number): number {
  const padded = screenInnerWidthPx - GUEST_PAGE_MAIN_PADDING_X_PX * 2;
  return Math.min(GUEST_PAGE_MAX_CONTENT_WIDTH_PX, Math.max(0, padded));
}
