"use client";

import type { EditorCard } from "@/components/editor/types";
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

type CardRendererProps = {
  card: EditorCard;
  isSelected?: boolean;
};

/**
 * Switch-based card renderer for the canvas.
 * Renders the appropriate card component by card.type.
 */
export function CardRenderer({ card, isSelected = false }: CardRendererProps) {
  switch (card.type) {
    case "text":
      return <TextCard card={card} isSelected={isSelected} />;
    case "image":
      return <ImageCard card={card} isSelected={isSelected} />;
    case "wifi":
      return <WifiCard card={card} isSelected={isSelected} />;
    case "breakfast":
      return <BreakfastCard card={card} isSelected={isSelected} />;
    case "checkout":
      return <CheckoutCard card={card} isSelected={isSelected} />;
    case "map":
      return <MapCard card={card} isSelected={isSelected} />;
    case "notice":
      return <NoticeCard card={card} isSelected={isSelected} />;
    case "button":
      return <ButtonCard card={card} isSelected={isSelected} />;
    case "schedule":
      return <ScheduleCard card={card} isSelected={isSelected} />;
    case "menu":
      return <MenuCard card={card} isSelected={isSelected} />;
    default:
      return <TextCard card={card as EditorCard} isSelected={isSelected} />;
  }
}
