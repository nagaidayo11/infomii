"use client";

import type { EditorCard } from "@/components/editor/types";
import { useLocale } from "@/components/locale-context";
import { TextCard } from "./TextCard";
import { ImageCard } from "./ImageCard";
import { WifiCard } from "./WifiCard";
import { BreakfastCard } from "./BreakfastCard";
import { CheckoutCard } from "./CheckoutCard";
import { MapCard } from "./MapCard";
import { NoticeCard } from "./NoticeCard";
import { ButtonCard } from "./ButtonCard";
import { ScheduleCard } from "./ScheduleCard";
import { MenuCard } from "./MenuCard";
import { TaxiCard } from "./TaxiCard";
import { RestaurantCard } from "./RestaurantCard";
import { LaundryCard } from "./LaundryCard";
import { EmergencyCard } from "./EmergencyCard";

type CardRendererProps = {
  card: EditorCard;
  isSelected?: boolean;
};

/**
 * カードを描画。LocaleContext のロケールで多言語フィールドを解決する。
 */
export function CardRenderer({ card, isSelected = false }: CardRendererProps) {
  const locale = useLocale();

  switch (card.type) {
    case "text":
      return <TextCard card={card} isSelected={isSelected} locale={locale} />;
    case "image":
      return <ImageCard card={card} isSelected={isSelected} locale={locale} />;
    case "wifi":
      return <WifiCard card={card} isSelected={isSelected} locale={locale} />;
    case "breakfast":
      return <BreakfastCard card={card} isSelected={isSelected} locale={locale} />;
    case "checkout":
      return <CheckoutCard card={card} isSelected={isSelected} locale={locale} />;
    case "map":
      return <MapCard card={card} isSelected={isSelected} locale={locale} />;
    case "notice":
      return <NoticeCard card={card} isSelected={isSelected} locale={locale} />;
    case "button":
      return <ButtonCard card={card} isSelected={isSelected} locale={locale} />;
    case "schedule":
      return <ScheduleCard card={card} isSelected={isSelected} locale={locale} />;
    case "menu":
      return <MenuCard card={card} isSelected={isSelected} locale={locale} />;
    case "taxi":
      return <TaxiCard card={card} isSelected={isSelected} locale={locale} />;
    case "restaurant":
      return <RestaurantCard card={card} isSelected={isSelected} locale={locale} />;
    case "laundry":
      return <LaundryCard card={card} isSelected={isSelected} locale={locale} />;
    case "emergency":
      return <EmergencyCard card={card} isSelected={isSelected} locale={locale} />;
    default:
      return <TextCard card={card as EditorCard} isSelected={isSelected} locale={locale} />;
  }
}
