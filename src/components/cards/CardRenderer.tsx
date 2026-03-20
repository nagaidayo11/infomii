"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBlockStyle } from "@/components/editor/types";
import { useLocale } from "@/components/locale-context";
import { HeroCard } from "./HeroCard";
import { InfoCard } from "./InfoCard";
import { HighlightCard } from "./HighlightCard";
import { ActionCard } from "./ActionCard";
import { WelcomeCard } from "./WelcomeCard";
import { CheckoutCard } from "./CheckoutCard";
import { NearbyCard } from "./NearbyCard";
import { NoticeCard } from "./NoticeCard";
import { MapCard } from "./MapCard";
import { RestaurantCard } from "./RestaurantCard";
import { TaxiCard } from "./TaxiCard";
import { EmergencyCard } from "./EmergencyCard";
import { LaundryCard } from "./LaundryCard";
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
import { QuoteCard } from "./QuoteCard";
import { ChecklistCard } from "./ChecklistCard";
import { StepsCard } from "./StepsCard";
import { CompareCard } from "./CompareCard";
import { KpiCard } from "./KpiCard";

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
          icon: "wifi",
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
    case "spa": {
      const c = card.content as Record<string, unknown> | undefined;
      const time = ((c?.time as string) ?? (c?.hours as string) ?? "").trim();
      const location = (c?.location as string) ?? "";
      const menu = ((c?.menu as string) ?? (c?.description as string) ?? (c?.note as string) ?? "").trim();
      const highlightCard: EditorCard = {
        ...card,
        type: "highlight",
        content: {
          title: (c?.title as string) || "スパ・温泉",
          body: [time, location, menu].filter(Boolean).join(" · ") || "時間・場所・ご案内",
          accent: "blue",
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
    case "text":
      return <TextCard card={card} isSelected={isSelected} locale={locale} />;
    case "schedule":
      return <ScheduleCard card={card} isSelected={isSelected} locale={locale} />;
    case "menu":
      return <MenuCard card={card} isSelected={isSelected} locale={locale} />;
    case "divider":
      return <DividerCard card={card} isSelected={isSelected} locale={locale} />;
    case "quote":
      return <QuoteCard card={card} isSelected={isSelected} locale={locale} />;
    case "checklist":
      return <ChecklistCard card={card} isSelected={isSelected} locale={locale} />;
    case "steps":
      return <StepsCard card={card} isSelected={isSelected} locale={locale} />;
    case "compare":
      return <CompareCard card={card} isSelected={isSelected} locale={locale} />;
    case "kpi":
      return <KpiCard card={card} isSelected={isSelected} locale={locale} />;
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
          const textColor =
            card.style && typeof card.style === "object" && typeof card.style.textColor === "string"
              ? card.style.textColor
              : undefined;
          return (
            <div
              key={card.id}
              className={textColor ? "editor-card-colorized" : undefined}
              style={{
                ...blockStyle,
                ...(textColor
                  ? ({
                      ["--editor-card-text-color"]: textColor,
                    } as Record<string, string>)
                  : {}),
              }}
            >
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
