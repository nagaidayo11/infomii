"use client";

import type { ReactNode } from "react";
import { AppSectionHeader } from "@/components/app-shell/primitives";
import { MenuCardHeroImage } from "@/components/cards/menu-card-visual";
import type { LocalizedString } from "@/lib/localized-content";

/** Soft teal menu line row for native guest UI. */
export const NATIVE_MENU_ITEM_ROW =
  "app-native-menu-item flex gap-3 p-2.5";

export const NATIVE_MENU_ITEM_ROW_SPECIAL =
  "app-native-menu-item app-native-menu-item--special flex gap-3 p-2.5";

export const NATIVE_MENU_ITEM_ROW_BAND =
  "app-native-menu-item app-native-menu-item--band flex gap-3 p-2.5";

export function NativeMenuShell({
  title,
  icon,
  heroSrc,
  heroAlt,
  locale,
  children,
  onActivate,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  heroSrc?: string;
  heroAlt?: LocalizedString;
  locale?: string;
  children: ReactNode;
  onActivate?: () => void;
}) {
  const hasHero = typeof heroSrc === "string" && heroSrc.trim().length > 0;
  return (
    <div className="app-native-section app-native-guest-card" onClick={onActivate}>
      {hasHero ? (
        <div className="app-native-media mb-3 overflow-hidden">
          <MenuCardHeroImage heroSrc={heroSrc} heroAlt={heroAlt} locale={locale ?? "ja"} />
        </div>
      ) : null}
      {title ? <AppSectionHeader title={title} icon={icon} as="div" /> : null}
      {children}
    </div>
  );
}
