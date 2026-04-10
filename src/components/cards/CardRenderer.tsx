"use client";

import type { EditorCard } from "@/components/editor/types";
import { getBlockStyle } from "@/components/editor/types";
import { useLocale } from "@/components/locale-context";
import { getLocalizedContent } from "@/lib/localized-content";
import { HeroCard } from "./HeroCard";
import { HeroSliderCard } from "./HeroSliderCard";
import { HeadingBodyCard } from "./HeadingBodyCard";
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
import { IconCard } from "./IconCard";
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
import { SpaceCard } from "./SpaceCard";
import { CampaignTimerCard } from "./CampaignTimerCard";
import { TabsInfoCard } from "./TabsInfoCard";
import { FaqSearchCard } from "./FaqSearchCard";
import { NoticeTickerCard } from "./NoticeTickerCard";
import { CouponCard } from "./CouponCard";
import { AccordionInfoCard } from "./AccordionInfoCard";
import { OpenStatusCard } from "./OpenStatusCard";
import { SocialLinksCard } from "./SocialLinksCard";
import { ContactHubCard } from "./ContactHubCard";
import { ProgressStepsCard } from "./ProgressStepsCard";
import { EmergencyBannerCard } from "./EmergencyBannerCard";
import { ScheduledBannerCard } from "./ScheduledBannerCard";

type SingleCardRendererProps = {
  card: EditorCard;
  isSelected?: boolean;
  showSpaceLabel?: boolean;
};

function isLocalizedObject(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    ("ja" in (value as Record<string, unknown>) ||
      "en" in (value as Record<string, unknown>) ||
      "zh" in (value as Record<string, unknown>) ||
      "ko" in (value as Record<string, unknown>))
  );
}

function resolveContentByLocale(value: unknown, locale: string): unknown {
  if (isLocalizedObject(value)) {
    return getLocalizedContent(value as { ja?: string; en?: string; zh?: string; ko?: string }, locale);
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveContentByLocale(item, locale));
  }
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      next[k] = resolveContentByLocale(v, locale);
    }
    return next;
  }
  return value;
}

/**
 * Renders a single card by type. Used by CardRenderer for both single and list modes.
 */
function SingleCardRenderer({ card, isSelected = false, showSpaceLabel = false }: SingleCardRendererProps) {
  const locale = useLocale();
  const resolvedCard: EditorCard = {
    ...card,
    content: resolveContentByLocale(card.content, locale) as Record<string, unknown>,
  };

  switch (resolvedCard.type) {
    case "hero":
      return <HeroCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "hero_slider":
      return <HeroSliderCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "heading_body":
      return <HeadingBodyCard card={resolvedCard} isSelected={isSelected} />;
    case "info":
      return <InfoCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "highlight":
      return <HighlightCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "action":
      return <ActionCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "welcome":
      return <WelcomeCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "wifi": {
      const c = resolvedCard.content as Record<string, unknown> | undefined;
      const wifiLabels =
        locale === "ko"
          ? { network: "네트워크", password: "비밀번호" }
          : locale === "zh"
            ? { network: "网络名称", password: "密码" }
            : locale === "en"
              ? { network: "Network", password: "Password" }
              : { network: "ネットワーク名", password: "パスワード" };
      const infoCard: EditorCard = {
        ...resolvedCard,
        type: "info",
        content: {
          title: (c?.title as string) || "Wi-Fi",
          icon: "wifi",
          rows: [
            { label: wifiLabels.network, value: (c?.ssid as string) ?? "" },
            { label: wifiLabels.password, value: (c?.password as string) ?? "" },
          ],
        },
      };
      return <InfoCard card={infoCard} isSelected={isSelected} locale={locale} />;
    }
    case "breakfast": {
      const c = resolvedCard.content as Record<string, unknown> | undefined;
      const time = (c?.time as string) ?? "";
      const location = (c?.location as string) ?? "";
      const menu = (c?.menu as string) ?? "";
      const breakfastLabels =
        locale === "ko"
          ? { title: "조식", body: "시간\n장소\n상세" }
          : locale === "zh"
            ? { title: "早餐", body: "时间\n地点\n详情" }
            : locale === "en"
              ? { title: "Breakfast", body: "Time\nVenue\nDetails" }
              : { title: "朝食", body: "時間\n場所\n詳細" };
      const detailLines = [time, location, menu].filter(Boolean);
      const highlightCard: EditorCard = {
        ...resolvedCard,
        type: "highlight",
        content: {
          title: (c?.title as string) || breakfastLabels.title,
          body: detailLines.join("\n") || breakfastLabels.body,
          accent: "amber",
        },
      };
      return <HighlightCard card={highlightCard} isSelected={isSelected} locale={locale} />;
    }
    case "spa": {
      const c = resolvedCard.content as Record<string, unknown> | undefined;
      const time = ((c?.time as string) ?? (c?.hours as string) ?? "").trim();
      const location = (c?.location as string) ?? "";
      const menu = ((c?.menu as string) ?? (c?.description as string) ?? (c?.note as string) ?? "").trim();
      const spaLabels =
        locale === "ko"
          ? { title: "스파 · 온천", body: "시간 · 장소 · 안내" }
          : locale === "zh"
            ? { title: "SPA / 温泉", body: "时间 · 地点 · 指南" }
            : locale === "en"
              ? { title: "Spa / Onsen", body: "Time · Location · Info" }
              : { title: "スパ・温泉", body: "時間・場所・ご案内" };
      const highlightCard: EditorCard = {
        ...resolvedCard,
        type: "highlight",
        content: {
          title: (c?.title as string) || spaLabels.title,
          body: [time, location, menu].filter(Boolean).join(" · ") || spaLabels.body,
          accent: "blue",
        },
      };
      return <HighlightCard card={highlightCard} isSelected={isSelected} locale={locale} />;
    }
    case "checkout":
      return <CheckoutCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "notice":
      return <NoticeCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "nearby":
      return <NearbyCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "map":
      return <MapCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "parking":
      return <ParkingCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "pageLinks":
      return <PageLinksCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "button":
      return <ButtonCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "image":
      return <ImageCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "gallery":
      return <GalleryCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "faq":
      return <FaqCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "emergency":
      return <EmergencyCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "laundry":
      return <LaundryCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "taxi":
      return <TaxiCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "restaurant":
      return <RestaurantCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "text":
      return <TextCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "icon":
      return <IconCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "schedule":
      return <ScheduleCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "menu":
      return <MenuCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "divider":
      return <DividerCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "quote":
      return <QuoteCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "checklist":
      return <ChecklistCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "steps":
      return <StepsCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "compare":
      return <CompareCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "kpi":
      return <KpiCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "space":
      return <SpaceCard card={resolvedCard} isSelected={isSelected} showLabel={showSpaceLabel} />;
    case "campaign_timer":
      return <CampaignTimerCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "tabs_info":
      return <TabsInfoCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "faq_search":
      return <FaqSearchCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "notice_ticker":
      return <NoticeTickerCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "coupon":
      return <CouponCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "accordion_info":
      return <AccordionInfoCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "open_status":
      return <OpenStatusCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "social_links":
      return <SocialLinksCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "contact_hub":
      return <ContactHubCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "progress_steps":
      return <ProgressStepsCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "emergency_banner":
      return <EmergencyBannerCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    case "scheduled_banner":
      return <ScheduledBannerCard card={resolvedCard} isSelected={isSelected} locale={locale} />;
    default:
      return <TextCard card={resolvedCard as EditorCard} isSelected={isSelected} locale={locale} />;
  }
}

export type CardRendererSingleProps = {
  card: EditorCard;
  isSelected?: boolean;
  showSpaceLabel?: boolean;
};

export type CardRendererListProps = {
  cards: EditorCard[];
  selectedCardId?: string | null;
  showSpaceLabel?: boolean;
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
    const { cards, selectedCardId = null, showSpaceLabel = false } = props;
    const sorted = [...cards].sort((a, b) => a.order - b.order);
    return (
      <>
        {sorted.map((card) => {
          const blockStyle = getBlockStyle(card);
          const textColor =
            card.style && typeof card.style === "object" && typeof card.style.textColor === "string"
              ? card.style.textColor
              : undefined;
          const innerSurfaceMode =
            card.style && typeof card.style === "object"
              ? (card.style as Record<string, unknown>).innerSurfaceMode
              : undefined;
          const hasInnerSurfaceOverride =
            innerSurfaceMode === "transparent" || innerSurfaceMode === "custom";
          return (
            <div
              key={card.id}
              className={
                (textColor ? "editor-card-colorized " : "") +
                (hasInnerSurfaceOverride ? "editor-inner-surface-overridden " : "") +
                "overflow-hidden rounded-2xl"
              }
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
                showSpaceLabel={showSpaceLabel}
              />
            </div>
          );
        })}
      </>
    );
  }

  const { card, isSelected = false, showSpaceLabel = false } = props;
  return <SingleCardRenderer card={card} isSelected={isSelected} showSpaceLabel={showSpaceLabel} />;
}
