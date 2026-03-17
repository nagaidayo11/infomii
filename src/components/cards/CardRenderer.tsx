"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBlockStyle } from "@/components/editor/types";
import { useLocale } from "@/components/locale-context";
import { HeroCard } from "./HeroCard";
import { InfoCard } from "./InfoCard";
import { HighlightCard } from "./HighlightCard";
import { ActionCard } from "./ActionCard";
import { WelcomeCard } from "./WelcomeCard";
import { WifiCard } from "./WifiCard";
import { BreakfastCard } from "./BreakfastCard";
import { CheckoutCard } from "./CheckoutCard";
import { NearbyCard } from "./NearbyCard";
import { NoticeCard } from "./NoticeCard";
import { MapCard } from "./MapCard";
import { RestaurantCard } from "./RestaurantCard";
import { TaxiCard } from "./TaxiCard";
import { EmergencyCard } from "./EmergencyCard";
import { LaundryCard } from "./LaundryCard";
import { SpaCard } from "./SpaCard";
import { TextCard } from "./TextCard";
import { ImageCard } from "./ImageCard";
import { ButtonCard } from "./ButtonCard";
import { FaqCard } from "./FaqCard";
import { ScheduleCard } from "./ScheduleCard";
import { MenuCard } from "./MenuCard";
import { GalleryCard } from "./GalleryCard";
import { DividerCard } from "./DividerCard";
import { ParkingCard } from "./ParkingCard";
import { PageLinksCard } from "./PageLinksCard";

type SingleCardRendererProps = {
  card: EditorCard;
  isSelected?: boolean;
};

/**
 * Renders a single card by type. Used by CardRenderer for both single and list modes.
 */
function SingleCardRenderer({ card, isSelected = false }: SingleCardRendererProps) {
  const locale = useLocale();

  switch (card.type) {
    case "hero":
      return <HeroCard card={card} isSelected={isSelected} locale={locale} />;
    case "info":
      return <InfoCard card={card} isSelected={isSelected} locale={locale} />;
    case "highlight":
      return <HighlightCard card={card} isSelected={isSelected} locale={locale} />;
    case "action":
      return <ActionCard card={card} isSelected={isSelected} locale={locale} />;
    case "welcome":
      return <WelcomeCard card={card} isSelected={isSelected} locale={locale} />;
    case "wifi": {
      const c = card.content as Record<string, unknown> | undefined;
      const infoCard: EditorCard = {
        ...card,
        type: "info",
        content: {
          title: (c?.title as string) || "Wi-Fi",
          icon: "📶",
          rows: [
            { label: "ネットワーク名", value: (c?.ssid as string) ?? "" },
            { label: "パスワード", value: (c?.password as string) ?? "" },
          ],
        },
      };
      return <InfoCard card={infoCard} isSelected={isSelected} locale={locale} />;
    }
    case "breakfast": {
      const c = card.content as Record<string, unknown> | undefined;
      const time = (c?.time as string) ?? "";
      const location = (c?.location as string) ?? "";
      const menu = (c?.menu as string) ?? "";
      const highlightCard: EditorCard = {
        ...card,
        type: "highlight",
        content: {
          title: (c?.title as string) || "朝食",
          body: [time, location, menu].filter(Boolean).join(" · ") || "時間・会場・メニュー",
          accent: "amber",
        },
      };
      return <HighlightCard card={highlightCard} isSelected={isSelected} locale={locale} />;
    }
    case "checkout":
      return <CheckoutCard card={card} isSelected={isSelected} locale={locale} />;
    case "notice":
      return <NoticeCard card={card} isSelected={isSelected} locale={locale} />;
    case "nearby":
      return <NearbyCard card={card} isSelected={isSelected} locale={locale} />;
    case "map":
      return <MapCard card={card} isSelected={isSelected} locale={locale} />;
    case "parking":
      return <ParkingCard card={card} isSelected={isSelected} locale={locale} />;
    case "pageLinks":
      return <PageLinksCard card={card} isSelected={isSelected} locale={locale} />;
    case "button":
      return <ButtonCard card={card} isSelected={isSelected} locale={locale} />;
    case "image":
      return <ImageCard card={card} isSelected={isSelected} locale={locale} />;
    case "gallery":
      return <GalleryCard card={card} isSelected={isSelected} locale={locale} />;
    case "faq":
      return <FaqCard card={card} isSelected={isSelected} locale={locale} />;
    case "emergency":
      return <EmergencyCard card={card} isSelected={isSelected} locale={locale} />;
    case "laundry":
      return <LaundryCard card={card} isSelected={isSelected} locale={locale} />;
    case "taxi":
      return <TaxiCard card={card} isSelected={isSelected} locale={locale} />;
    case "restaurant":
      return <RestaurantCard card={card} isSelected={isSelected} locale={locale} />;
    case "spa":
      return <SpaCard card={card} isSelected={isSelected} locale={locale} />;
    case "text":
      return <TextCard card={card} isSelected={isSelected} locale={locale} />;
    case "schedule":
      return <ScheduleCard card={card} isSelected={isSelected} locale={locale} />;
    case "menu":
      return <MenuCard card={card} isSelected={isSelected} locale={locale} />;
    case "divider":
      return <DividerCard card={card} isSelected={isSelected} locale={locale} />;
    default:
      return <TextCard card={card as EditorCard} isSelected={isSelected} locale={locale} />;
  }
}

export type CardRendererSingleProps = {
  card: EditorCard;
  isSelected?: boolean;
};

export type CardRendererListProps = {
  cards: EditorCard[];
  selectedCardId?: string | null;
};

export type CardRendererProps = CardRendererSingleProps | CardRendererListProps;

function isListProps(props: CardRendererProps): props is CardRendererListProps {
  return "cards" in props && Array.isArray(props.cards);
}

/**
 * CardRenderer: render a single card or a list of cards (using cards.map()).
 * Supports: hero, info, highlight, action, welcome, wifi→info, breakfast→highlight,
 * checkout, notice, nearby, map, button, image, gallery, faq, emergency, laundry, taxi, restaurant, spa.
 */
export function CardRenderer(props: CardRendererProps) {
  if (isListProps(props)) {
    const { cards, selectedCardId = null } = props;
    const sorted = [...cards].sort((a, b) => a.order - b.order);
    return (
      <>
        {sorted.map((card) => {
          const blockStyle = getBlockStyle(card);
          return (
            <div key={card.id} style={blockStyle}>
              <SingleCardRenderer
                card={card}
                isSelected={selectedCardId === card.id}
              />
            </div>
          );
        })}
      </>
    );
  }

  const { card, isSelected = false } = props;
  return <SingleCardRenderer card={card} isSelected={isSelected} />;
}
