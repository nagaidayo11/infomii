"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
  type ReactNode,
  type TouchEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { useAuth } from "@/components/auth-provider";
import {
  buildPublicQrUrl,
  buildPublicUrl,
  createBlankInformation,
  createStripeCheckoutSession,
  deleteInformation,
  ensureUserHotelScope,
  getCurrentHotelPublishedCount,
  getCurrentHotelSubscription,
  getInformation,
  listCurrentHotelNodeMapInfos,
  listCurrentHotelPageLinks,
  trackUpgradeClick,
  type HotelNodeMapInfo,
  type HotelPageLink,
  type HotelSubscription,
  updateInformation,
} from "@/lib/storage";
import type { Information, InformationBlock, InformationTheme, NodeMap } from "@/types/information";

const ICON_CHOICES: Array<{ value: string; label: string }> = [
  { value: "🍽️", label: "絵文字: 食事" },
  { value: "☕", label: "絵文字: カフェ" },
  { value: "🛁", label: "絵文字: 大浴場" },
  { value: "🛎️", label: "絵文字: フロント" },
  { value: "📶", label: "絵文字: Wi-Fi" },
  { value: "📍", label: "絵文字: 位置" },
  { value: "ℹ️", label: "絵文字: 案内" },
  { value: "svg:clock", label: "ライン: 時間" },
  { value: "svg:map-pin", label: "ライン: 場所" },
  { value: "svg:wifi", label: "ライン: Wi-Fi" },
  { value: "svg:car", label: "ライン: 駐車場" },
  { value: "svg:bell", label: "ライン: サービス" },
  { value: "svg:utensils", label: "ライン: レストラン" },
  { value: "svg:bath", label: "ライン: 温浴" },
];

const BACKGROUND_SWATCHES = [
  "#ffffff",
  "#f8fafc",
  "#fefce8",
  "#ecfeff",
  "#f5f3ff",
  "#fff1f2",
  "#e2e8f0",
  "#0f172a",
];

const TEXT_SWATCHES = [
  "#0f172a",
  "#1e293b",
  "#334155",
  "#0f766e",
  "#1d4ed8",
  "#7c3aed",
  "#be123c",
  "#ffffff",
];

const BLOCK_TEXT_SWATCHES = [
  "#0f172a",
  "#334155",
  "#0f766e",
  "#1d4ed8",
  "#7c3aed",
  "#be123c",
  "#ea580c",
  "#ffffff",
];

type AddPanelSection = "text" | "column" | "section" | "preset";
type BlockSetKind = "campaign" | "menu" | "faq" | "access" | "notice";
type IndustryBlockSetKind = "hotel" | "restaurant" | "cafe" | "salon" | "clinic" | "retail";

type PublishCheckIssue = {
  level: "error" | "warning";
  message: string;
};

const PUBLISH_CHECK_SEVERITY = {
  emptyImageUrl: "error",
  draftInternalTarget: "error",
  invalidExternalUrlFormat: "warning",
} as const;

function normalizeNodeMap(value: InformationTheme["nodeMap"]): NodeMap {
  if (!value) {
    return { enabled: false, nodes: [], edges: [] };
  }
  return {
    enabled: value.enabled === true,
    nodes: Array.isArray(value.nodes) ? value.nodes : [],
    edges: Array.isArray(value.edges) ? value.edges : [],
  };
}

function getPageStatusForSlug(
  slug: string,
  currentItem: Information,
  pageStatusBySlug: Map<string, Information["status"]>,
): Information["status"] | null {
  if (!slug) {
    return null;
  }
  if (slug === currentItem.slug) {
    return currentItem.status;
  }
  return pageStatusBySlug.get(slug) ?? null;
}

function collectPublishCheckIssues(
  currentItem: Information,
  pageStatusBySlug: Map<string, Information["status"]>,
): PublishCheckIssue[] {
  const issues: PublishCheckIssue[] = [];

  if (!currentItem.title.trim()) {
    issues.push({ level: "error", message: "ページタイトルを入力してください。" });
  }

  const hasAnyContentBlock = currentItem.contentBlocks.some((block) => {
    if (block.type === "image") {
      return Boolean((block.url ?? "").trim());
    }
    if (block.type === "divider" || block.type === "space") {
      return true;
    }
    if (block.type === "iconRow") {
      return (block.iconItems ?? []).some((entry) => (entry.label ?? "").trim() || (entry.link ?? "").trim());
    }
    if (block.type === "section") {
      return Boolean((block.sectionTitle ?? "").trim() || (block.sectionBody ?? "").trim());
    }
    if (block.type === "columns") {
      return Boolean(
        (block.leftTitle ?? "").trim() ||
          (block.leftText ?? "").trim() ||
          (block.rightTitle ?? "").trim() ||
          (block.rightText ?? "").trim(),
      );
    }
    if (block.type === "cta") {
      return Boolean((block.ctaLabel ?? "").trim() || (block.ctaUrl ?? "").trim());
    }
    if (block.type === "badge") {
      return Boolean((block.badgeText ?? "").trim());
    }
    if (block.type === "hours") {
      return (block.hoursItems ?? []).some((entry) => (entry.label ?? "").trim() || (entry.value ?? "").trim());
    }
    if (block.type === "pricing") {
      return (block.pricingItems ?? []).some((entry) => (entry.label ?? "").trim() || (entry.value ?? "").trim());
    }
    return Boolean((block.text ?? "").trim() || (block.label ?? "").trim() || (block.description ?? "").trim());
  });

  if (!hasAnyContentBlock) {
    issues.push({ level: "error", message: "本文ブロックが空です。最低1つ入力してください。" });
  }

  if (currentItem.publishAt && currentItem.unpublishAt) {
    const publishAtMs = new Date(currentItem.publishAt).getTime();
    const unpublishAtMs = new Date(currentItem.unpublishAt).getTime();
    if (!Number.isNaN(publishAtMs) && !Number.isNaN(unpublishAtMs) && publishAtMs >= unpublishAtMs) {
      issues.push({ level: "error", message: "公開終了日時は公開開始日時より後に設定してください。" });
    }
  }

  currentItem.contentBlocks.forEach((block, blockIndex) => {
    if (block.type === "image" && !(block.url ?? "").trim()) {
      issues.push({
        level: PUBLISH_CHECK_SEVERITY.emptyImageUrl,
        message: `${blockIndex + 1}.画像ブロック: 画像URLが未設定です。`,
      });
      return;
    }

    if (block.type !== "iconRow") {
      return;
    }

    (block.iconItems ?? []).forEach((entry, entryIndex) => {
      const rowLabel = (entry.label ?? "").trim() || `${blockIndex + 1}.アイコン並び-${entryIndex + 1}`;
      const link = (entry.link ?? "").trim();
      if (!link) {
        return;
      }

      if (link.startsWith("/p/")) {
        const slug = link.replace(/^\/p\//, "").trim();
        if (!slug) {
          issues.push({
            level: "error",
            message: `${rowLabel}: ページリンク形式が不正です。`,
          });
          return;
        }
        const targetStatus = getPageStatusForSlug(slug, currentItem, pageStatusBySlug);
        if (!targetStatus) {
          issues.push({
            level: "error",
            message: `${rowLabel}: 遷移先ページが見つかりません。`,
          });
          return;
        }
        if (targetStatus !== "published") {
          issues.push({
            level: PUBLISH_CHECK_SEVERITY.draftInternalTarget,
            message: `${rowLabel}: 遷移先ページが未公開（下書き）です。`,
          });
        }
        return;
      }

      if (!/^https?:\/\//i.test(link)) {
        issues.push({
          level: PUBLISH_CHECK_SEVERITY.invalidExternalUrlFormat,
          message: `${rowLabel}: 外部リンクは http(s) で始めることを推奨します。`,
        });
      }
    });
  });

  return issues;
}

function renderLineIcon(token: string): ReactNode {
  const className = "h-5 w-5 text-slate-700";
  if (token === "svg:clock") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    );
  }
  if (token === "svg:map-pin") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 21s6-5.4 6-10a6 6 0 1 0-12 0c0 4.6 6 10 6 10Z" />
        <circle cx="12" cy="11" r="2.5" />
      </svg>
    );
  }
  if (token === "svg:wifi") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4.5 9.5a11 11 0 0 1 15 0" />
        <path d="M7.5 12.5a7 7 0 0 1 9 0" />
        <path d="M10.5 15.5a3 3 0 0 1 3 0" />
        <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (token === "svg:car") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 13h16l-1.5-4h-13L4 13Z" />
        <path d="M5 13v4h2" />
        <path d="M17 17h2v-4" />
        <circle cx="8" cy="17" r="1.6" />
        <circle cx="16" cy="17" r="1.6" />
      </svg>
    );
  }
  if (token === "svg:bell") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 17h8l-1-2v-4a3 3 0 1 0-6 0v4l-1 2Z" />
        <path d="M10.5 19a1.5 1.5 0 0 0 3 0" />
      </svg>
    );
  }
  if (token === "svg:utensils") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 4v8" />
        <path d="M5 4v4" />
        <path d="M9 4v4" />
        <path d="M7 12v8" />
        <path d="M16 4c1.5 2.5 1.5 5.5 0 8v8" />
      </svg>
    );
  }
  if (token === "svg:bath") {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 12h14v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3Z" />
        <path d="M8 12V8a2 2 0 1 1 4 0" />
      </svg>
    );
  }
  return null;
}

function renderIconVisual(icon: string | undefined): ReactNode {
  if (!icon) {
    return <span className="text-xl">⭐</span>;
  }
  if (icon.startsWith("svg:")) {
    return renderLineIcon(icon) ?? <span className="text-xl">⭐</span>;
  }
  return <span className="text-xl">{icon}</span>;
}

function toDateTimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function fromDateTimeLocal(value: string): string | null {
  const input = value.trim();
  if (!input) {
    return null;
  }
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

function formatSchedule(value: string | null): string {
  if (!value) {
    return "未設定";
  }
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatSavedAt(value: string | null): string {
  if (!value) {
    return "--:--";
  }
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function isProActivated(sub: HotelSubscription | null): boolean {
  if (!sub) {
    return false;
  }
  return sub.plan === "pro" && (sub.status === "active" || sub.status === "trialing");
}

function getBlockSetLabel(kind: BlockSetKind): string {
  if (kind === "campaign") {
    return "キャンペーン告知セット";
  }
  if (kind === "menu") {
    return "営業時間・料金セット";
  }
  if (kind === "faq") {
    return "FAQセット";
  }
  if (kind === "access") {
    return "アクセス案内セット";
  }
  return "お知らせセット";
}

function makeBlockSet(kind: BlockSetKind): InformationBlock[] {
  if (kind === "campaign") {
    return [
      { id: crypto.randomUUID(), type: "badge", badgeText: "期間限定", badgeColor: "#dcfce7", badgeTextColor: "#065f46", spacing: "md", textAlign: "left" },
      { id: crypto.randomUUID(), type: "title", text: "キャンペーンのお知らせ" },
      { id: crypto.randomUUID(), type: "paragraph", text: "期間限定キャンペーンを実施中です。詳細は以下をご確認ください。" },
      { id: crypto.randomUUID(), type: "pricing", pricingItems: [{ id: crypto.randomUUID(), label: "通常価格", value: "¥3,000" }, { id: crypto.randomUUID(), label: "キャンペーン価格", value: "¥2,400" }], spacing: "md" },
      { id: crypto.randomUUID(), type: "cta", ctaLabel: "詳細を見る", ctaUrl: "https://example.com", spacing: "md", textAlign: "center" },
    ];
  }
  if (kind === "menu") {
    return [
      { id: crypto.randomUUID(), type: "heading", text: "営業時間・料金案内" },
      { id: crypto.randomUUID(), type: "hours", hoursItems: [{ id: crypto.randomUUID(), label: "平日", value: "10:00 - 20:00" }, { id: crypto.randomUUID(), label: "土日祝", value: "9:00 - 21:00" }], spacing: "md" },
      { id: crypto.randomUUID(), type: "pricing", pricingItems: [{ id: crypto.randomUUID(), label: "スタンダード", value: "¥3,000" }, { id: crypto.randomUUID(), label: "プレミアム", value: "¥5,000" }], spacing: "md" },
      { id: crypto.randomUUID(), type: "section", sectionTitle: "ご利用時の注意", sectionBody: "混雑時はご案内までお時間をいただく場合があります。", sectionBackgroundColor: "#f8fafc", spacing: "md" },
    ];
  }
  if (kind === "faq") {
    return [
      { id: crypto.randomUUID(), type: "heading", text: "よくあるご質問" },
      { id: crypto.randomUUID(), type: "section", sectionTitle: "Q. 予約は必要ですか？", sectionBody: "A. 混雑が予想されるため、事前予約をおすすめします。", sectionBackgroundColor: "#f8fafc", spacing: "md" },
      { id: crypto.randomUUID(), type: "section", sectionTitle: "Q. 支払い方法は？", sectionBody: "A. 現金・クレジットカード・QR決済に対応しています。", sectionBackgroundColor: "#f8fafc", spacing: "md" },
      { id: crypto.randomUUID(), type: "section", sectionTitle: "Q. キャンセル料はかかりますか？", sectionBody: "A. 前日まで無料、当日は条件により発生します。", sectionBackgroundColor: "#f8fafc", spacing: "md" },
    ];
  }
  if (kind === "access") {
    return [
      { id: crypto.randomUUID(), type: "heading", text: "アクセス案内" },
      { id: crypto.randomUUID(), type: "columns", leftTitle: "電車でお越しの方", leftText: "最寄り駅から徒歩 [分]", rightTitle: "お車でお越しの方", rightText: "駐車場 [台] / 1時間 [料金] 円", columnsBackgroundColor: "#f8fafc", spacing: "md" },
      { id: crypto.randomUUID(), type: "iconRow", iconRowBackgroundColor: "#f8fafc", iconItems: [{ id: crypto.randomUUID(), icon: "svg:map-pin", label: "地図", link: "https://maps.google.com", backgroundColor: "#ffffff" }, { id: crypto.randomUUID(), icon: "svg:car", label: "駐車場", link: "", backgroundColor: "#ffffff" }, { id: crypto.randomUUID(), icon: "svg:clock", label: "営業時間", link: "", backgroundColor: "#ffffff" }], spacing: "md" },
      { id: crypto.randomUUID(), type: "cta", ctaLabel: "地図を開く", ctaUrl: "https://maps.google.com", spacing: "md", textAlign: "left" },
    ];
  }
  return [
    { id: crypto.randomUUID(), type: "badge", badgeText: "重要なお知らせ", badgeColor: "#fef3c7", badgeTextColor: "#92400e", spacing: "md", textAlign: "left" },
    { id: crypto.randomUUID(), type: "title", text: "営業に関するお知らせ" },
    { id: crypto.randomUUID(), type: "paragraph", text: "いつもご利用ありがとうございます。本日のお知らせ内容をこちらに記載します。" },
    { id: crypto.randomUUID(), type: "section", sectionTitle: "詳細", sectionBody: "該当する日時・対象・注意事項をご入力ください。", sectionBackgroundColor: "#f8fafc", spacing: "md" },
  ];
}

function getIndustryBlockSetLabel(kind: IndustryBlockSetKind): string {
  if (kind === "hotel") {
    return "ホテル向けセット";
  }
  if (kind === "restaurant") {
    return "飲食店向けセット";
  }
  if (kind === "cafe") {
    return "カフェ向けセット";
  }
  if (kind === "salon") {
    return "サロン向けセット";
  }
  if (kind === "clinic") {
    return "クリニック向けセット";
  }
  return "小売店向けセット";
}

function makeIndustryBlockSet(kind: IndustryBlockSetKind): InformationBlock[] {
  if (kind === "hotel") {
    return [
      { id: crypto.randomUUID(), type: "badge", badgeText: "宿泊者向け情報", badgeColor: "#dcfce7", badgeTextColor: "#065f46", spacing: "md" },
      { id: crypto.randomUUID(), type: "title", text: "チェックイン・館内案内" },
      { id: crypto.randomUUID(), type: "image", url: "/templates/hotel-business.svg", spacing: "md" },
      { id: crypto.randomUUID(), type: "hours", hoursItems: [{ id: crypto.randomUUID(), label: "チェックイン", value: "15:00〜24:00" }, { id: crypto.randomUUID(), label: "チェックアウト", value: "10:00まで" }], spacing: "md" },
      { id: crypto.randomUUID(), type: "iconRow", iconRowBackgroundColor: "#f8fafc", iconItems: [{ id: crypto.randomUUID(), icon: "svg:wifi", label: "Wi-Fi" }, { id: crypto.randomUUID(), icon: "svg:car", label: "駐車場" }, { id: crypto.randomUUID(), icon: "svg:clock", label: "朝食時間" }], spacing: "md" },
    ];
  }
  if (kind === "restaurant") {
    return [
      { id: crypto.randomUUID(), type: "badge", badgeText: "本日のおすすめ", badgeColor: "#fee2e2", badgeTextColor: "#991b1b", spacing: "md" },
      { id: crypto.randomUUID(), type: "title", text: "メニュー・営業時間案内" },
      { id: crypto.randomUUID(), type: "image", url: "/templates/restaurant.svg", spacing: "md" },
      { id: crypto.randomUUID(), type: "pricing", pricingItems: [{ id: crypto.randomUUID(), label: "ランチセット", value: "¥1,200" }, { id: crypto.randomUUID(), label: "ディナーセット", value: "¥2,400" }], spacing: "md" },
      { id: crypto.randomUUID(), type: "cta", ctaLabel: "予約する", ctaUrl: "https://example.com/reserve", spacing: "md", textAlign: "left" },
    ];
  }
  if (kind === "cafe") {
    return [
      { id: crypto.randomUUID(), type: "badge", badgeText: "期間限定メニュー", badgeColor: "#fef3c7", badgeTextColor: "#92400e", spacing: "md" },
      { id: crypto.randomUUID(), type: "title", text: "季節限定ドリンク案内" },
      { id: crypto.randomUUID(), type: "image", url: "/templates/cafe.svg", spacing: "md" },
      { id: crypto.randomUUID(), type: "pricing", pricingItems: [{ id: crypto.randomUUID(), label: "さくらラテ", value: "¥680" }, { id: crypto.randomUUID(), label: "抹茶スムージー", value: "¥720" }], spacing: "md" },
      { id: crypto.randomUUID(), type: "section", sectionTitle: "Wi-Fi / 電源", sectionBody: "SSID: [SSID]\nPASS: [PASSWORD]\n電源席: 窓側 [席数]席", sectionBackgroundColor: "#f8fafc", spacing: "md" },
    ];
  }
  if (kind === "salon") {
    return [
      { id: crypto.randomUUID(), type: "badge", badgeText: "予約前にご確認ください", badgeColor: "#fce7f3", badgeTextColor: "#9d174d", spacing: "md" },
      { id: crypto.randomUUID(), type: "title", text: "施術メニュー・来店案内" },
      { id: crypto.randomUUID(), type: "image", url: "/templates/salon.svg", spacing: "md" },
      { id: crypto.randomUUID(), type: "pricing", pricingItems: [{ id: crypto.randomUUID(), label: "カット", value: "¥4,500" }, { id: crypto.randomUUID(), label: "カラー", value: "¥6,800" }], spacing: "md" },
      { id: crypto.randomUUID(), type: "section", sectionTitle: "遅刻・キャンセル", sectionBody: "10分以上遅れる場合はご連絡ください。\n前日まで無料 / 当日条件あり。", sectionBackgroundColor: "#f8fafc", spacing: "md" },
    ];
  }
  if (kind === "clinic") {
    return [
      { id: crypto.randomUUID(), type: "badge", badgeText: "受診前チェック", badgeColor: "#cffafe", badgeTextColor: "#155e75", spacing: "md" },
      { id: crypto.randomUUID(), type: "title", text: "診療時間・持ち物案内" },
      { id: crypto.randomUUID(), type: "image", url: "/templates/clinic.svg", spacing: "md" },
      { id: crypto.randomUUID(), type: "hours", hoursItems: [{ id: crypto.randomUUID(), label: "午前", value: "9:00〜12:00" }, { id: crypto.randomUUID(), label: "午後", value: "15:00〜18:00" }], spacing: "md" },
      { id: crypto.randomUUID(), type: "section", sectionTitle: "ご持参いただくもの", sectionBody: "健康保険証 / 診察券 / お薬手帳", sectionBackgroundColor: "#f8fafc", spacing: "md" },
    ];
  }
  return [
    { id: crypto.randomUUID(), type: "badge", badgeText: "ご来店前に確認", badgeColor: "#dcfce7", badgeTextColor: "#166534", spacing: "md" },
    { id: crypto.randomUUID(), type: "title", text: "キャンペーン・返品案内" },
    { id: crypto.randomUUID(), type: "image", url: "/templates/retail.svg", spacing: "md" },
    { id: crypto.randomUUID(), type: "section", sectionTitle: "キャンペーン内容", sectionBody: "対象商品2点以上で10%OFF\n会員様は追加特典あり", sectionBackgroundColor: "#f8fafc", spacing: "md" },
    { id: crypto.randomUUID(), type: "section", sectionTitle: "返品・交換", sectionBody: "購入日より [日数] 日以内\nレシート持参で対応", sectionBackgroundColor: "#f8fafc", spacing: "md" },
  ];
}

function makeBlock(type: InformationBlock["type"]): InformationBlock {
  const id = crypto.randomUUID();
  if (type === "title") {
    return { id, type, text: "タイトルを入力" };
  }
  if (type === "heading") {
    return { id, type, text: "見出しを入力" };
  }
  if (type === "paragraph") {
    return { id, type, text: "本文を入力" };
  }
  if (type === "image") {
    return { id, type, url: "" };
  }
  if (type === "icon") {
    return {
      id,
      type,
      icon: "⭐",
      label: "サービス名",
      description: "説明を入力してください",
    };
  }
  if (type === "space") {
    return { id, type, spacing: "md" };
  }
  if (type === "section") {
    return {
      id,
      type,
      sectionTitle: "セクションタイトル",
      sectionBody: "セクション説明を入力",
      sectionBackgroundColor: "#f8fafc",
      spacing: "md",
    };
  }
  if (type === "columns") {
    return {
      id,
      type,
      leftTitle: "左カラム",
      leftText: "左側の説明を入力",
      rightTitle: "右カラム",
      rightText: "右側の説明を入力",
      columnsBackgroundColor: "#f8fafc",
      spacing: "md",
    };
  }
  if (type === "iconRow") {
    return {
      id,
      type,
      iconRowBackgroundColor: "#f8fafc",
      iconItems: [
        { id: crypto.randomUUID(), icon: "svg:wifi", label: "Wi-Fi", link: "", backgroundColor: "#ffffff" },
        { id: crypto.randomUUID(), icon: "svg:car", label: "駐車場", link: "", backgroundColor: "#ffffff" },
        { id: crypto.randomUUID(), icon: "svg:clock", label: "営業時間", link: "", backgroundColor: "#ffffff" },
      ],
      spacing: "md",
    };
  }
  if (type === "cta") {
    return {
      id,
      type,
      ctaLabel: "予約する",
      ctaUrl: "https://example.com",
      spacing: "md",
      textAlign: "center",
    };
  }
  if (type === "badge") {
    return {
      id,
      type,
      badgeText: "本日限定",
      badgeColor: "#dcfce7",
      badgeTextColor: "#065f46",
      spacing: "md",
      textAlign: "left",
    };
  }
  if (type === "hours") {
    return {
      id,
      type,
      hoursItems: [
        { id: crypto.randomUUID(), label: "平日", value: "10:00 - 20:00" },
        { id: crypto.randomUUID(), label: "土日祝", value: "9:00 - 21:00" },
      ],
      spacing: "md",
    };
  }
  if (type === "pricing") {
    return {
      id,
      type,
      pricingItems: [
        { id: crypto.randomUUID(), label: "スタンダード", value: "¥3,000" },
        { id: crypto.randomUUID(), label: "プレミアム", value: "¥5,000" },
      ],
      spacing: "md",
    };
  }
  return { id, type };
}

function blocksToBody(blocks: InformationBlock[]): string {
  return blocks
    .filter(
      (block) =>
        block.type === "title" ||
        block.type === "heading" ||
        block.type === "paragraph" ||
        block.type === "icon" ||
        block.type === "section" ||
        block.type === "columns" ||
        block.type === "iconRow" ||
        block.type === "cta" ||
        block.type === "badge" ||
        block.type === "hours" ||
        block.type === "pricing",
    )
    .map((block) => {
      if (block.type === "icon") {
        return [block.label?.trim(), block.description?.trim()].filter(Boolean).join("\n");
      }
      if (block.type === "section") {
        return [block.sectionTitle?.trim(), block.sectionBody?.trim()].filter(Boolean).join("\n");
      }
      if (block.type === "columns") {
        return [
          block.leftTitle?.trim(),
          block.leftText?.trim(),
          block.rightTitle?.trim(),
          block.rightText?.trim(),
        ]
          .filter(Boolean)
          .join("\n");
      }
      if (block.type === "iconRow") {
        return (block.iconItems ?? [])
          .map((entry) => entry.label.trim())
          .filter(Boolean)
          .join(" / ");
      }
      if (block.type === "cta") {
        return [block.ctaLabel?.trim(), block.ctaUrl?.trim()].filter(Boolean).join("\n");
      }
      if (block.type === "badge") {
        return block.badgeText?.trim() ?? "";
      }
      if (block.type === "hours") {
        return (block.hoursItems ?? [])
          .map((entry) => `${entry.label.trim()} ${entry.value.trim()}`.trim())
          .filter(Boolean)
          .join("\n");
      }
      if (block.type === "pricing") {
        return (block.pricingItems ?? [])
          .map((entry) => `${entry.label.trim()} ${entry.value.trim()}`.trim())
          .filter(Boolean)
          .join("\n");
      }
      return block.text?.trim() ?? "";
    })
    .filter(Boolean)
    .join("\n\n");
}

function blocksToImages(blocks: InformationBlock[]): string[] {
  return blocks
    .filter((block) => block.type === "image" && block.url)
    .map((block) => block.url as string)
    .slice(0, 3);
}

function getTitleSizeClass(size: InformationTheme["titleSize"]): string {
  if (size === "sm") {
    return "text-xl";
  }
  if (size === "lg") {
    return "text-3xl";
  }
  return "text-2xl";
}

function getBlockTextSizeClass(
  size: InformationBlock["textSize"] | undefined,
  fallback: InformationTheme["bodySize"],
): string {
  const value = size ?? fallback;
  if (value === "sm") {
    return "text-sm";
  }
  if (value === "lg") {
    return "text-lg";
  }
  return "text-base";
}

function getWeightClass(weight: "normal" | "medium" | "semibold" | undefined): string {
  if (weight === "semibold") {
    return "font-semibold";
  }
  if (weight === "medium") {
    return "font-medium";
  }
  return "font-normal";
}

function getBlockAlignClass(align: InformationBlock["textAlign"] | undefined): string {
  if (align === "center") {
    return "text-center";
  }
  if (align === "right") {
    return "text-right";
  }
  return "text-left";
}

function getBlockJustifyClass(align: InformationBlock["textAlign"] | undefined): string {
  if (align === "center") {
    return "justify-center";
  }
  if (align === "right") {
    return "justify-end";
  }
  return "justify-start";
}

function getDividerThicknessStyle(
  thickness: InformationBlock["dividerThickness"] | undefined,
  color: string | undefined,
): { borderTopWidth: string; borderTopColor: string } {
  if (thickness === "thick") {
    return { borderTopWidth: "3px", borderTopColor: color ?? "#e2e8f0" };
  }
  if (thickness === "medium") {
    return { borderTopWidth: "2px", borderTopColor: color ?? "#e2e8f0" };
  }
  return { borderTopWidth: "1px", borderTopColor: color ?? "#e2e8f0" };
}

function getBlockSpacingStyle(
  spacing: InformationBlock["spacing"] | undefined,
): { marginBottom: string } {
  if (spacing === "sm") {
    return { marginBottom: "8px" };
  }
  if (spacing === "lg") {
    return { marginBottom: "28px" };
  }
  return { marginBottom: "16px" };
}

function getSpaceHeightClass(spacing: InformationBlock["spacing"] | undefined): string {
  if (spacing === "sm") {
    return "h-4";
  }
  if (spacing === "lg") {
    return "h-12";
  }
  return "h-8";
}

function getBlockTypeLabel(type: InformationBlock["type"]): string {
  if (type === "title") {
    return "タイトル";
  }
  if (type === "heading") {
    return "見出し";
  }
  if (type === "paragraph") {
    return "テキスト";
  }
  if (type === "image") {
    return "画像";
  }
  if (type === "divider") {
    return "区切り線";
  }
  if (type === "icon") {
    return "アイコン";
  }
  if (type === "section") {
    return "セクション";
  }
  if (type === "columns") {
    return "2カラム";
  }
  if (type === "iconRow") {
    return "アイコン並び";
  }
  if (type === "cta") {
    return "CTAボタン";
  }
  if (type === "badge") {
    return "バッジ";
  }
  if (type === "hours") {
    return "営業時間";
  }
  if (type === "pricing") {
    return "料金表";
  }
  return "スペース";
}

function supportsDetailTextAlign(type: InformationBlock["type"]): boolean {
  return (
    type === "title" ||
    type === "heading" ||
    type === "paragraph" ||
    type === "icon" ||
    type === "section" ||
    type === "cta" ||
    type === "badge"
  );
}

function supportsDetailTextColor(type: InformationBlock["type"]): boolean {
  return type !== "columns";
}

function SideNavButton(props: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`group relative flex h-11 w-11 items-center justify-center rounded-xl border text-slate-700 transition duration-200 ${
        props.active
          ? "border-emerald-400 bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-[0_10px_20px_-14px_rgba(16,185,129,0.65)]"
          : "border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md"
      }`}
      title={props.label}
      aria-label={props.label}
    >
      {props.children}
      <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm group-hover:block">
        {props.label}
      </span>
    </button>
  );
}

export default function EditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { signOut } = useAuth();
  const id = params.id;

  const [item, setItem] = useState<Information | null>(null);
  const [saving, setSaving] = useState(false);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [noticeKind, setNoticeKind] = useState<"success" | "error">("success");
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingPageTitle, setEditingPageTitle] = useState(false);
  const [pageTitleDraft, setPageTitleDraft] = useState("");
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const [draggingNewBlockType, setDraggingNewBlockType] = useState<InformationBlock["type"] | null>(null);
  const [justInsertedBlockId, setJustInsertedBlockId] = useState<string | null>(null);
  const [detailTabBlockId, setDetailTabBlockId] = useState<string | null>(null);
  const [copiedBlock, setCopiedBlock] = useState<InformationBlock | null>(null);
  const [collapsedImagePreviews, setCollapsedImagePreviews] = useState<Record<string, boolean>>({});
  const [collapsedBlocks, setCollapsedBlocks] = useState<Record<string, boolean>>({});
  const [collapsedAddSections, setCollapsedAddSections] = useState<Record<AddPanelSection, boolean>>({
    text: false,
    column: false,
    section: false,
    preset: false,
  });
  const [inlineAddToast, setInlineAddToast] = useState<{
    id: string;
    x: number;
    y: number;
    message: string;
  } | null>(null);
  const [blockHistoryPast, setBlockHistoryPast] = useState<InformationBlock[][]>([]);
  const [blockHistoryFuture, setBlockHistoryFuture] = useState<InformationBlock[][]>([]);
  const [subscription, setSubscription] = useState<HotelSubscription | null>(null);
  const [publishedCount, setPublishedCount] = useState(0);
  const [pageLinks, setPageLinks] = useState<HotelPageLink[]>([]);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [newNodePopId, setNewNodePopId] = useState<string | null>(null);
  const [creatingNodeProjectId, setCreatingNodeProjectId] = useState<string | null>(null);
  const [nodeMapOwner, setNodeMapOwner] = useState<HotelNodeMapInfo | null>(null);
  const [nodeMapThemeBase, setNodeMapThemeBase] = useState<InformationTheme>({});
  const [sharedNodeMap, setSharedNodeMap] = useState<NodeMap>({ enabled: false, nodes: [], edges: [] });
  const [previewOverlay, setPreviewOverlay] = useState<{
    title: string;
    loading: boolean;
    error: string;
    information: Information | null;
  } | null>(null);
  const [overlayTouchStartX, setOverlayTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      await ensureUserHotelScope();
      const [data, sub, published, links] = await Promise.all([
        getInformation(id),
        getCurrentHotelSubscription(),
        getCurrentHotelPublishedCount(),
        listCurrentHotelPageLinks(),
      ]);
      const mapInfos = await listCurrentHotelNodeMapInfos();
      if (mounted) {
        setBlockHistoryPast([]);
        setBlockHistoryFuture([]);
        setItem(data);
        setSubscription(sub);
        setPublishedCount(published);
        setPageLinks(data ? links.filter((row) => row.id !== data.id) : links);
        if (data) {
          const selfNodeMap = normalizeNodeMap(data.theme.nodeMap);
          if (selfNodeMap.enabled) {
            setNodeMapOwner({ id: data.id, title: data.title, slug: data.slug, nodeMap: selfNodeMap });
            setNodeMapThemeBase(data.theme);
            setSharedNodeMap(selfNodeMap);
          } else {
            const owner = mapInfos.find((row) =>
              row.id !== data.id &&
              row.nodeMap?.enabled &&
              (row.nodeMap.nodes ?? []).some((node) => node.targetSlug === data.slug),
            );
            if (owner?.nodeMap) {
              const ownerInfo = await getInformation(owner.id);
              setNodeMapOwner(owner);
              setNodeMapThemeBase(ownerInfo?.theme ?? {});
              setSharedNodeMap(normalizeNodeMap(owner.nodeMap));
            } else {
              setNodeMapOwner({ id: data.id, title: data.title, slug: data.slug, nodeMap: selfNodeMap });
              setNodeMapThemeBase(data.theme);
              setSharedNodeMap(selfNodeMap);
            }
          }
        } else {
          setNodeMapOwner(null);
          setNodeMapThemeBase({});
          setSharedNodeMap({ enabled: false, nodes: [], edges: [] });
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!item) {
      return;
    }
    setPageTitleDraft(item.title);
  }, [item]);

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const query = new URLSearchParams(search);
    const billing = query.get("billing");

    let cancelled = false;

    async function handleBillingSuccess() {
      setNoticeKind("success");
      setNotice("決済が完了しました。プラン情報を確認しています。");

      for (let i = 0; i < 6; i += 1) {
        if (cancelled) {
          return;
        }
        const latest = await getCurrentHotelSubscription();
        if (cancelled) {
          return;
        }
        setSubscription(latest);
        if (isProActivated(latest)) {
          setNoticeKind("success");
          setNotice("Proプランの反映が完了しました。公開を続けられます。");
          return;
        }
        await new Promise((resolve) => {
          window.setTimeout(resolve, 1000);
        });
      }

      setNoticeKind("success");
      setNotice("決済は完了しています。プラン反映まで数秒かかる場合があります。");
    }

    if (billing === "success") {
      void handleBillingSuccess();
    }
    if (billing === "cancel") {
      setNoticeKind("error");
      setNotice("決済はキャンセルされました。");
    }

    if (billing && typeof window !== "undefined") {
      query.delete("billing");
      const next = query.toString();
      const nextUrl = `${window.location.pathname}${next ? `?${next}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const publishLimit = subscription?.maxPublishedPages ?? 0;
  const projectedPublishedCount = item && item.status !== "published"
    ? publishedCount + 1
    : publishedCount;
  const willHitLimitOnPublish = publishLimit > 0 && projectedPublishedCount === publishLimit;
  const willExceedLimitOnPublish = publishLimit > 0 && projectedPublishedCount > publishLimit;

  const publicUrl = useMemo(
    () => (item ? buildPublicUrl(item.slug) : ""),
    [item],
  );
  const qrPublicUrl = useMemo(
    () => (item ? buildPublicQrUrl(item.slug) : ""),
    [item],
  );

  function extractSlugFromPublicPath(url: string): string | null {
    if (!url.startsWith("/p/")) {
      return null;
    }
    const withoutPrefix = url.slice(3);
    const [slug] = withoutPrefix.split("?");
    return slug?.trim() || null;
  }

  async function openPreviewOverlayBySlug(slug: string, title: string) {
    const resolvedSlug = slug.trim();
    if (!resolvedSlug) {
      return;
    }
    setPreviewOverlay({
      title: title || "リンク先プレビュー",
      loading: true,
      error: "",
      information: null,
    });

    try {
      const selfCandidate = item?.slug === resolvedSlug ? item : null;
      const targetId = selfCandidate?.id ?? pageLinks.find((row) => row.slug === resolvedSlug)?.id;
      if (!targetId) {
        setPreviewOverlay({
          title: title || "リンク先プレビュー",
          loading: false,
          error: "ページが見つかりませんでした。",
          information: null,
        });
        return;
      }
      const linkedInfo = selfCandidate ?? (await getInformation(targetId));
      if (!linkedInfo) {
        setPreviewOverlay({
          title: title || "リンク先プレビュー",
          loading: false,
          error: "ページが見つかりませんでした。",
          information: null,
        });
        return;
      }
      setPreviewOverlay({
        title: linkedInfo.title || title || "リンク先プレビュー",
        loading: false,
        error: "",
        information: linkedInfo,
      });
    } catch (e) {
      setPreviewOverlay({
        title: title || "リンク先プレビュー",
        loading: false,
        error: e instanceof Error ? e.message : "プレビューの読み込みに失敗しました。",
        information: null,
      });
    }
  }

  async function openPreviewOverlay(url: string, title: string) {
    if (!url) {
      return;
    }

    const slug = extractSlugFromPublicPath(url);
    if (!slug) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    await openPreviewOverlayBySlug(slug, title);
  }

  const overlaySwipeSlugs = useMemo(() => {
    const ordered = sharedNodeMap.nodes
      .map((node) => (node.targetSlug ?? "").trim())
      .filter((slug, index, arr) => Boolean(slug) && arr.indexOf(slug) === index);
    if (item?.slug && !ordered.includes(item.slug)) {
      ordered.unshift(item.slug);
    }
    return ordered;
  }, [item?.slug, sharedNodeMap.nodes]);
  const overlaySwipePosition = useMemo(() => {
    if (!previewOverlay?.information) {
      return null;
    }
    const currentIndex = overlaySwipeSlugs.indexOf(previewOverlay.information.slug);
    if (currentIndex < 0) {
      return null;
    }
    return { current: currentIndex + 1, total: overlaySwipeSlugs.length };
  }, [previewOverlay, overlaySwipeSlugs]);

  function onOverlayTouchStart(event: TouchEvent<HTMLDivElement>) {
    setOverlayTouchStartX(event.touches[0]?.clientX ?? null);
  }

  async function onOverlayTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (!previewOverlay?.information || overlayTouchStartX === null) {
      setOverlayTouchStartX(null);
      return;
    }
    const endX = event.changedTouches[0]?.clientX ?? overlayTouchStartX;
    const diff = endX - overlayTouchStartX;
    setOverlayTouchStartX(null);
    if (Math.abs(diff) < 48) {
      return;
    }
    const currentSlug = previewOverlay.information.slug;
    const currentIndex = overlaySwipeSlugs.indexOf(currentSlug);
    if (currentIndex < 0) {
      return;
    }
    const nextIndex = diff < 0 ? currentIndex + 1 : currentIndex - 1;
    const nextSlug = overlaySwipeSlugs[nextIndex];
    if (!nextSlug) {
      return;
    }
    await openPreviewOverlayBySlug(nextSlug, "リンク先プレビュー");
  }

  function renderSmartphoneBlocks(sourceItem: Information) {
    return sourceItem.contentBlocks.map((block) => {
      if (block.type === "title") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            <h3
              className={`${getWeightClass(block.textWeight ?? "semibold")} ${getTitleSizeClass(block.textSize ?? "md")} ${getBlockAlignClass(block.textAlign)}`}
              style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
            >
              {block.text || "タイトル"}
            </h3>
          </div>
        );
      }
      if (block.type === "heading") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            <h3
              className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)} ${getBlockAlignClass(block.textAlign)}`}
              style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
            >
              {block.text || "見出し"}
            </h3>
          </div>
        );
      }
      if (block.type === "paragraph") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            <p
              className={`whitespace-pre-wrap leading-7 ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)} ${getBlockAlignClass(block.textAlign)}`}
              style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
            >
              {block.text || ""}
            </p>
          </div>
        );
      }
      if (block.type === "image") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            {block.url ? (
              <Image
                src={block.url}
                alt="block"
                width={640}
                height={360}
                unoptimized
                className="h-auto w-full rounded-lg object-cover"
              />
            ) : null}
          </div>
        );
      }
      if (block.type === "icon") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            <div className={`rounded-lg border border-slate-200 bg-slate-50/70 p-3 ${getBlockAlignClass(block.textAlign)}`}>
              <div className={`flex items-center gap-2 ${getBlockJustifyClass(block.textAlign)}`}>
                {renderIconVisual(block.icon)}
                <p
                  className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                  style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
                >
                  {block.label || "ラベル"}
                </p>
              </div>
              <p
                className={`mt-1 whitespace-pre-wrap ${getWeightClass(block.textWeight)} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
              >
                {block.description || ""}
              </p>
            </div>
          </div>
        );
      }
      if (block.type === "iconRow") {
        const iconItems = block.iconItems ?? [];
        const iconColumnsClass = iconItems.length >= 3 ? "grid-cols-3" : "grid-cols-2";
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            <div
              className="rounded-lg border border-slate-200 p-3"
              style={{ backgroundColor: block.iconRowBackgroundColor ?? "#f8fafc" }}
            >
              <div className={`grid gap-2 ${iconColumnsClass}`}>
                {iconItems.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-md border border-slate-200 text-center shadow-sm"
                    style={{ backgroundColor: entry.backgroundColor ?? "#ffffff" }}
                  >
                    {entry.link ? (
                      <button
                        type="button"
                        onClick={() => void openPreviewOverlay(entry.link ?? "", entry.label || "リンク先プレビュー")}
                        className="flex min-h-[76px] w-full touch-manipulation flex-col items-center justify-center gap-1 px-2 py-2.5 transition active:scale-[0.99]"
                      >
                        {renderIconVisual(entry.icon)}
                        <p
                          className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                          style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
                        >
                          {entry.label || "項目"}
                        </p>
                      </button>
                    ) : (
                      <div className="flex min-h-[76px] w-full flex-col items-center justify-center gap-1 px-2 py-2.5">
                        {renderIconVisual(entry.icon)}
                        <p
                          className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                          style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
                        >
                          {entry.label || "項目"}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      if (block.type === "section") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            <div
              className={`rounded-xl border border-slate-200 px-4 py-4 ${getBlockAlignClass(block.textAlign)}`}
              style={{ backgroundColor: block.sectionBackgroundColor ?? "#f8fafc" }}
            >
              <p
                className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
              >
                {block.sectionTitle || "セクションタイトル"}
              </p>
              <p
                className={`mt-2 whitespace-pre-wrap ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
              >
                {block.sectionBody || ""}
              </p>
            </div>
          </div>
        );
      }
      if (block.type === "columns") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            <div className="grid gap-2 sm:grid-cols-2">
              <div
                className="rounded-lg border border-slate-200 p-3"
                style={{ backgroundColor: block.columnsBackgroundColor ?? "#f8fafc" }}
              >
                <p className={`mb-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}>
                  {block.leftTitle || "左タイトル"}
                </p>
                <p className={`whitespace-pre-wrap ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}>
                  {block.leftText || ""}
                </p>
              </div>
              <div
                className="rounded-lg border border-slate-200 p-3"
                style={{ backgroundColor: block.columnsBackgroundColor ?? "#f8fafc" }}
              >
                <p className={`mb-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}>
                  {block.rightTitle || "右タイトル"}
                </p>
                <p className={`whitespace-pre-wrap ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}>
                  {block.rightText || ""}
                </p>
              </div>
            </div>
          </div>
        );
      }
      if (block.type === "cta") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)} className={getBlockAlignClass(block.textAlign)}>
            <a
              href={block.ctaUrl || "#"}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex rounded-lg bg-emerald-600 px-4 py-2 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
              style={{ color: block.textColor ?? "#ffffff" }}
            >
              {block.ctaLabel || "ボタン"}
            </a>
          </div>
        );
      }
      if (block.type === "badge") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)} className={getBlockAlignClass(block.textAlign)}>
            <span
              className={`inline-flex rounded-full px-3 py-1 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
              style={{
                backgroundColor: block.badgeColor ?? "#dcfce7",
                color: block.textColor ?? block.badgeTextColor ?? "#065f46",
              }}
            >
              {block.badgeText || "バッジ"}
            </span>
          </div>
        );
      }
      if (block.type === "hours") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <p
                className={`mb-2 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
              >
                営業時間
              </p>
              <div className="space-y-1.5">
                {(block.hoursItems ?? []).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3">
                    <span
                      className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                      style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
                    >
                      {entry.label || "-"}
                    </span>
                    <span
                      className={getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}
                      style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
                    >
                      {entry.value || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      if (block.type === "pricing") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
              <p
                className={`mb-2 ${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
              >
                料金表
              </p>
              <div className="space-y-1.5">
                {(block.pricingItems ?? []).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between gap-3">
                    <span
                      className={`${getWeightClass(block.textWeight ?? "medium")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                      style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
                    >
                      {entry.label || "-"}
                    </span>
                    <span
                      className={`${getWeightClass(block.textWeight ?? "semibold")} ${getBlockTextSizeClass(block.textSize, sourceItem.theme.bodySize)}`}
                      style={{ color: block.textColor ?? sourceItem.theme.textColor ?? "#0f172a" }}
                    >
                      {entry.value || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      if (block.type === "space") {
        return (
          <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
            <div className={getSpaceHeightClass(block.spacing)} />
          </div>
        );
      }
      return (
        <div key={block.id} style={getBlockSpacingStyle(block.spacing)}>
          <hr
            className="border-slate-200"
            style={getDividerThicknessStyle(block.dividerThickness, block.dividerColor)}
          />
        </div>
      );
    });
  }

  async function save(patch: Partial<Information>) {
    if (!item) {
      return;
    }

    setSaving(true);
    setAutosaveState("saving");
    try {
      await updateInformation(id, {
        title: patch.title,
        body: patch.body,
        images: patch.images,
        contentBlocks: patch.contentBlocks,
        theme: patch.theme,
        status: patch.status,
        publishAt: patch.publishAt,
        unpublishAt: patch.unpublishAt,
        slug: patch.slug,
      });
      setItem((prev) => {
        if (!prev) {
          return prev;
        }

        const next = { ...prev, ...patch };
        const prevStatus = prev.status;
        const nextStatus = next.status;

        if (prevStatus !== "published" && nextStatus === "published") {
          setPublishedCount((count) => count + 1);
        }
        if (prevStatus === "published" && nextStatus !== "published") {
          setPublishedCount((count) => Math.max(count - 1, 0));
        }

        return next;
      });
      setAutosaveState("saved");
      setLastSavedAt(new Date().toISOString());
    } catch (e) {
      setAutosaveState("error");
      setNoticeKind("error");
      setNotice(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  function showInlineFeedback(message: string, point?: { x: number; y: number } | null) {
    const id = crypto.randomUUID();
    const x = point?.x ?? (typeof window !== "undefined" ? Math.round(window.innerWidth / 2) : 320);
    const y = point?.y ?? (typeof window !== "undefined" ? Math.round(window.innerHeight / 2) : 240);
    setInlineAddToast({ id, x, y, message });
    window.setTimeout(() => {
      setInlineAddToast((prev) => (prev?.id === id ? null : prev));
    }, 850);
  }

  async function saveBlocks(nextBlocks: InformationBlock[]) {
    await save({
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
  }

  async function onCopyUrl() {
    if (!publicUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(publicUrl);
      setNoticeKind("success");
      setNotice("公開URLをコピーしました");
    } catch {
      setNoticeKind("error");
      setNotice("URLコピーに失敗しました");
    }
  }

  async function onStartStripeCheckout() {
    setCreatingCheckout(true);
    setNotice("");
    try {
      await trackUpgradeClick("editor");
      const url = await createStripeCheckoutSession({
        successPath: `/editor/${id}?billing=success`,
        cancelPath: `/editor/${id}?billing=cancel`,
      });
      window.location.assign(url);
    } catch (e) {
      setNoticeKind("error");
      setNotice(e instanceof Error ? e.message : "Stripe Checkoutの開始に失敗しました");
      setCreatingCheckout(false);
    }
  }

  async function onDeleteInformation() {
    if (!item || deleting) {
      return;
    }

    setDeleting(true);
    setNoticeKind("success");
    setNotice(`「${item.title}」を削除しています...`);
    try {
      await deleteInformation(item.id);
      router.replace("/dashboard");
    } catch (e) {
      setNoticeKind("error");
      setNotice(e instanceof Error ? e.message : "削除に失敗しました");
      setDeleting(false);
    }
  }

  async function onAddBlock(type: InformationBlock["type"], clickEvent?: MouseEvent<HTMLElement>) {
    if (!item) {
      return;
    }
    setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
    setBlockHistoryFuture([]);
    const nextBlocks = [...item.contentBlocks, makeBlock(type)];
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
    if (clickEvent) {
      showInlineFeedback(`「${getBlockTypeLabel(type)}」を行末に追加しました`, {
        x: clickEvent.clientX,
        y: clickEvent.clientY - 8,
      });
    }
  }

  function onAddBlockSet(kind: BlockSetKind, clickEvent?: MouseEvent<HTMLElement>) {
    if (!item) {
      return;
    }
    const setBlocks = makeBlockSet(kind);
    setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
    setBlockHistoryFuture([]);
    const nextBlocks = [...item.contentBlocks, ...setBlocks];
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
    if (clickEvent) {
      showInlineFeedback(`「${getBlockSetLabel(kind)}」を追加しました`, {
        x: clickEvent.clientX,
        y: clickEvent.clientY - 8,
      });
    }
  }

  function onAddIndustryBlockSet(kind: IndustryBlockSetKind, clickEvent?: MouseEvent<HTMLElement>) {
    if (!item) {
      return;
    }
    const setBlocks = makeIndustryBlockSet(kind);
    setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
    setBlockHistoryFuture([]);
    const nextBlocks = [...item.contentBlocks, ...setBlocks];
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
    if (clickEvent) {
      showInlineFeedback(`「${getIndustryBlockSetLabel(kind)}」を追加しました`, {
        x: clickEvent.clientX,
        y: clickEvent.clientY - 8,
      });
    }
  }

  function onUndoBlocks() {
    if (!item || blockHistoryPast.length === 0) {
      return;
    }
    const prevBlocks = blockHistoryPast[blockHistoryPast.length - 1];
    setBlockHistoryPast((prev) => prev.slice(0, -1));
    setBlockHistoryFuture((prev) => [[...item.contentBlocks.map((b) => ({ ...b }))], ...prev].slice(0, 80));
    setItem({
      ...item,
      contentBlocks: prevBlocks,
      body: blocksToBody(prevBlocks),
      images: blocksToImages(prevBlocks),
    });
    void saveBlocks(prevBlocks);
    setNoticeKind("success");
    setNotice("一つ前の状態に戻しました");
  }

  function onRedoBlocks() {
    if (!item || blockHistoryFuture.length === 0) {
      return;
    }
    const nextBlocks = blockHistoryFuture[0];
    setBlockHistoryFuture((prev) => prev.slice(1));
    setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
    setNoticeKind("success");
    setNotice("一つ先の状態に進みました");
  }

  function toDroppedNewBlockType(event: DragEvent<HTMLElement>): InformationBlock["type"] | null {
    const customType = event.dataTransfer.getData("application/x-new-block-type");
    const fallback = event.dataTransfer.getData("text/plain");
    const type = customType || (fallback.startsWith("new-block:") ? fallback.replace("new-block:", "") : fallback);
    if (
      type === "title" ||
      type === "heading" ||
      type === "paragraph" ||
      type === "icon" ||
      type === "divider" ||
      type === "space" ||
      type === "image" ||
      type === "section" ||
      type === "columns" ||
      type === "iconRow" ||
      type === "cta" ||
      type === "badge" ||
      type === "hours" ||
      type === "pricing"
    ) {
      return type;
    }
    return null;
  }

  function onPaletteDragStart(event: DragEvent<HTMLElement>, type: InformationBlock["type"]) {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("application/x-new-block-type", type);
    event.dataTransfer.setData("text/plain", `new-block:${type}`);
    setDraggingNewBlockType(type);
  }

  function onPaletteDragEnd() {
    setDraggingNewBlockType(null);
  }

  function toggleAddSection(section: AddPanelSection) {
    setCollapsedAddSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  function onUpdateBlock(blockId: string, patch: Partial<InformationBlock>) {
    if (!item) {
      return;
    }
    const nextBlocks = item.contentBlocks.map((block) =>
      block.id === blockId ? { ...block, ...patch } : block,
    );
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
  }

  function onApplyBlockStyle(blockId: string, patch: Partial<InformationBlock>) {
    if (!item) {
      return;
    }
    setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
    setBlockHistoryFuture([]);
    const nextBlocks = item.contentBlocks.map((block) =>
      block.id === blockId ? { ...block, ...patch } : block,
    );
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
    showInlineFeedback("ブロックを並び替えました");
  }

function onUpdateIconRowItem(
  blockId: string,
  itemId: string,
  patch: { icon?: string; label?: string; nodeId?: string; link?: string; backgroundColor?: string },
) {
    if (!item) {
      return;
    }
    const nextBlocks = item.contentBlocks.map((block) => {
      if (block.id !== blockId || block.type !== "iconRow") {
        return block;
      }
      return {
        ...block,
        iconItems: (block.iconItems ?? []).map((entry) =>
          entry.id === itemId ? { ...entry, ...patch } : entry,
        ),
      };
    });
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
    if (patch.nodeId !== undefined) {
      void syncNodeMapTreeByBlocks(getCurrentNodeMap(), nextBlocks, { persist: true });
    }
  }

  function onAddIconRowItem(blockId: string) {
    if (!item) {
      return;
    }
    const nextBlocks = item.contentBlocks.map((block) => {
      if (block.id !== blockId || block.type !== "iconRow") {
        return block;
      }
      return {
        ...block,
        iconItems: [
          ...(block.iconItems ?? []),
          { id: crypto.randomUUID(), icon: "⭐", label: "項目名", link: "", backgroundColor: "#ffffff" },
        ],
      };
    });
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void syncNodeMapTreeByBlocks(getCurrentNodeMap(), nextBlocks, { persist: true });
    void saveBlocks(nextBlocks);
  }

  function onDeleteIconRowItem(blockId: string, itemId: string) {
    if (!item) {
      return;
    }
    const nextBlocks = item.contentBlocks.map((block) => {
      if (block.id !== blockId || block.type !== "iconRow") {
        return block;
      }
      const filtered = (block.iconItems ?? []).filter((entry) => entry.id !== itemId);
      return {
        ...block,
        iconItems: filtered.length > 0
          ? filtered
          : [{ id: crypto.randomUUID(), icon: "⭐", label: "項目名", link: "", backgroundColor: "#ffffff" }],
      };
    });
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void syncNodeMapTreeByBlocks(getCurrentNodeMap(), nextBlocks, { persist: true });
    void saveBlocks(nextBlocks);
  }

  function onUpdateKeyValueItem(
    blockId: string,
    blockType: "hours" | "pricing",
    itemId: string,
    patch: { label?: string; value?: string },
  ) {
    if (!item) {
      return;
    }
    const nextBlocks = item.contentBlocks.map((block) => {
      if (block.id !== blockId || block.type !== blockType) {
        return block;
      }
      const key = blockType === "hours" ? "hoursItems" : "pricingItems";
      const current = (block[key] ?? []) as Array<{ id: string; label: string; value: string }>;
      return {
        ...block,
        [key]: current.map((entry) => (entry.id === itemId ? { ...entry, ...patch } : entry)),
      };
    });
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
  }

  function onAddKeyValueItem(blockId: string, blockType: "hours" | "pricing") {
    if (!item) {
      return;
    }
    const nextBlocks = item.contentBlocks.map((block) => {
      if (block.id !== blockId || block.type !== blockType) {
        return block;
      }
      const key = blockType === "hours" ? "hoursItems" : "pricingItems";
      const current = (block[key] ?? []) as Array<{ id: string; label: string; value: string }>;
      return {
        ...block,
        [key]: [...current, { id: crypto.randomUUID(), label: "項目", value: "" }],
      };
    });
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
  }

  function onDeleteKeyValueItem(blockId: string, blockType: "hours" | "pricing", itemId: string) {
    if (!item) {
      return;
    }
    const nextBlocks = item.contentBlocks.map((block) => {
      if (block.id !== blockId || block.type !== blockType) {
        return block;
      }
      const key = blockType === "hours" ? "hoursItems" : "pricingItems";
      const current = (block[key] ?? []) as Array<{ id: string; label: string; value: string }>;
      const filtered = current.filter((entry) => entry.id !== itemId);
      return {
        ...block,
        [key]: filtered.length > 0 ? filtered : [{ id: crypto.randomUUID(), label: "項目", value: "" }],
      };
    });
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
  }

  function onBlurBlockSave() {
    if (!item) {
      return;
    }
    void saveBlocks(item.contentBlocks);
  }

  function onMoveBlock(blockId: string, direction: "up" | "down") {
    if (!item) {
      return;
    }
    setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
    setBlockHistoryFuture([]);
    const idx = item.contentBlocks.findIndex((block) => block.id === blockId);
    if (idx < 0) {
      return;
    }
    const nextIndex = direction === "up" ? idx - 1 : idx + 1;
    if (nextIndex < 0 || nextIndex >= item.contentBlocks.length) {
      return;
    }

    const nextBlocks = [...item.contentBlocks];
    const temp = nextBlocks[idx];
    nextBlocks[idx] = nextBlocks[nextIndex];
    nextBlocks[nextIndex] = temp;

    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
  }

  function onDeleteBlock(blockId: string) {
    if (!item) {
      return;
    }
    setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
    setBlockHistoryFuture([]);
    const nextBlocks = item.contentBlocks.filter((block) => block.id !== blockId);
    const safeBlocks = nextBlocks.length ? nextBlocks : [makeBlock("paragraph")];
    setItem({
      ...item,
      contentBlocks: safeBlocks,
      body: blocksToBody(safeBlocks),
      images: blocksToImages(safeBlocks),
    });
    void saveBlocks(safeBlocks);
  }

  function toggleBlockCollapse(blockId: string) {
    setCollapsedBlocks((prev) => {
      const next = { ...prev, [blockId]: !prev[blockId] };
      if (next[blockId] && detailTabBlockId === blockId) {
        setDetailTabBlockId(null);
      }
      return next;
    });
  }

  function onCopyBlock(blockId: string) {
    if (!item) {
      return;
    }
    const target = item.contentBlocks.find((block) => block.id === blockId);
    if (!target) {
      return;
    }
    setCopiedBlock({ ...target, id: "" });
    setNoticeKind("success");
    setNotice("ブロックをコピーしました");
  }

  function onPasteBlock(afterBlockId: string) {
    if (!item) {
      return;
    }
    if (!copiedBlock) {
      setNoticeKind("error");
      setNotice("先にコピーしてください");
      return;
    }
    setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
    setBlockHistoryFuture([]);
    const insertIndex = item.contentBlocks.findIndex((block) => block.id === afterBlockId);
    if (insertIndex < 0) {
      return;
    }
    const nextBlock: InformationBlock = {
      ...copiedBlock,
      id: crypto.randomUUID(),
    };
    const nextBlocks = [...item.contentBlocks];
    nextBlocks.splice(insertIndex + 1, 0, nextBlock);

    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
    showInlineFeedback("コピーしたブロックを貼り付けました");
    setNoticeKind("success");
    setNotice("コピーしたブロックを貼り付けました");
  }

  function onBlockDragStart(event: DragEvent<HTMLElement>, blockId: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", blockId);
    setDraggingNewBlockType(null);
    setDraggingBlockId(blockId);
    setDragOverBlockId(blockId);
  }

  function onBlockDragOver(event: DragEvent<HTMLElement>, blockId: string) {
    const newBlockType = draggingNewBlockType ?? toDroppedNewBlockType(event);
    event.preventDefault();
    event.dataTransfer.dropEffect = newBlockType ? "copy" : "move";
    if (dragOverBlockId !== blockId) {
      setDragOverBlockId(blockId);
    }
  }

  function onBlockDrop(event: DragEvent<HTMLElement>, targetBlockId: string) {
    event.preventDefault();
    event.stopPropagation();
    const newBlockType = draggingNewBlockType ?? toDroppedNewBlockType(event);
    if (item && newBlockType) {
      setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
      setBlockHistoryFuture([]);
      const targetIndex = item.contentBlocks.findIndex((block) => block.id === targetBlockId);
      const insertIndex = targetIndex < 0 ? item.contentBlocks.length : targetIndex;
      const newBlock = makeBlock(newBlockType);
      const nextBlocks = [...item.contentBlocks];
      nextBlocks.splice(insertIndex, 0, newBlock);
      setItem({
        ...item,
        contentBlocks: nextBlocks,
        body: blocksToBody(nextBlocks),
        images: blocksToImages(nextBlocks),
      });
      setJustInsertedBlockId(newBlock.id);
      window.setTimeout(() => setJustInsertedBlockId((prev) => (prev === newBlock.id ? null : prev)), 650);
      setDragOverBlockId(null);
      setDraggingBlockId(null);
      setDraggingNewBlockType(null);
      void saveBlocks(nextBlocks);
      showInlineFeedback(`「${getBlockTypeLabel(newBlockType)}」を挿入しました`, {
        x: event.clientX,
        y: event.clientY - 8,
      });
      return;
    }

    if (!item || !draggingBlockId || draggingBlockId === targetBlockId) {
      setDragOverBlockId(null);
      setDraggingBlockId(null);
      return;
    }
    setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
    setBlockHistoryFuture([]);

    const sourceIndex = item.contentBlocks.findIndex((block) => block.id === draggingBlockId);
    const targetIndex = item.contentBlocks.findIndex((block) => block.id === targetBlockId);
    if (sourceIndex < 0 || targetIndex < 0) {
      setDragOverBlockId(null);
      setDraggingBlockId(null);
      return;
    }

    const nextBlocks = [...item.contentBlocks];
    const [moved] = nextBlocks.splice(sourceIndex, 1);
    nextBlocks.splice(targetIndex, 0, moved);

    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    setDragOverBlockId(null);
    setDraggingBlockId(null);
    void saveBlocks(nextBlocks);
    showInlineFeedback("ブロックを並び替えました", {
      x: event.clientX,
      y: event.clientY - 8,
    });
  }

  function onBlockDragEnd() {
    setDragOverBlockId(null);
    setDraggingBlockId(null);
    setDraggingNewBlockType(null);
  }

  function onAddImageBlock(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !item) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
      setBlockHistoryFuture([]);
      const nextBlocks = [
        ...item.contentBlocks,
        { id: crypto.randomUUID(), type: "image" as const, url: dataUrl },
      ];
      setItem({
        ...item,
        contentBlocks: nextBlocks,
        body: blocksToBody(nextBlocks),
        images: blocksToImages(nextBlocks),
      });
      void saveBlocks(nextBlocks);
    };
    reader.readAsDataURL(file);
  }

  function onReplaceImageBlock(blockId: string, file: File) {
    if (!item) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setNoticeKind("error");
      setNotice("画像ファイルを選択してください");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      setBlockHistoryPast((prev) => [...prev.slice(-79), item.contentBlocks.map((b) => ({ ...b }))]);
      setBlockHistoryFuture([]);
      const nextBlocks = item.contentBlocks.map((block) =>
        block.id === blockId ? { ...block, url: dataUrl } : block,
      );
      setItem({
        ...item,
        contentBlocks: nextBlocks,
        body: blocksToBody(nextBlocks),
        images: blocksToImages(nextBlocks),
      });
      void saveBlocks(nextBlocks);
    };
    reader.readAsDataURL(file);
  }

  function onApplyThemeColor(key: "backgroundColor" | "textColor", color: string) {
    if (!item) {
      return;
    }
    const nextTheme = { ...item.theme, [key]: color };
    setItem({ ...item, theme: nextTheme });
    void save({ theme: nextTheme });
  }

  function getCurrentNodeMap(): NodeMap {
    return sharedNodeMap;
  }

  function syncNodeMapTreeByBlocks(
    baseMap: NodeMap,
    blocks: InformationBlock[],
    options?: { persist?: boolean },
  ): NodeMap {
    if (!item) {
      return baseMap;
    }
    const persist = options?.persist ?? false;
    const hubId = "__hub__";
    const hubTitle = nodeMapOwner?.title ?? item.title;
    const hubSlug = nodeMapOwner?.slug ?? item.slug;

    const existingHub = baseMap.nodes.find((node) => node.id === hubId);
    const hubNode = existingHub
      ? { ...existingHub, title: hubTitle, targetSlug: hubSlug, icon: "🏠" }
      : { id: hubId, title: hubTitle, icon: "🏠", x: 50, y: 12, targetSlug: hubSlug };
    const otherNodes = baseMap.nodes.filter((node) => node.id !== hubId);
    const nodes = [hubNode, ...otherNodes];
    const validNodeIds = new Set(nodes.map((node) => node.id));
    const linkedNodeIds = Array.from(
      new Set(
        blocks.flatMap((block) => {
          if (block.type !== "iconRow") {
            return [];
          }
          return (block.iconItems ?? [])
            .map((entry) => (entry.nodeId ?? "").trim())
            .filter((nodeId) => nodeId && nodeId !== hubId && validNodeIds.has(nodeId));
        }),
      ),
    );
    const edges = linkedNodeIds.map((nodeId) => ({
      id: `auto-${hubId}-${nodeId}`,
      from: hubId,
      to: nodeId,
    }));

    const nextMap: NodeMap = {
      ...baseMap,
      enabled: true,
      nodes,
      edges,
    };
    updateNodeMap(nextMap, persist);
    return nextMap;
  }

  function updateNodeMap(nextNodeMap: NodeMap, persist = true) {
    if (!item) {
      return;
    }
    setSharedNodeMap(nextNodeMap);
    const ownerId = nodeMapOwner?.id ?? item.id;
    const nextTheme = { ...nodeMapThemeBase, nodeMap: nextNodeMap };
    if (ownerId === item.id) {
      setItem((prev) => (prev ? { ...prev, theme: nextTheme } : prev));
      setNodeMapThemeBase(nextTheme);
    }
    if (persist) {
      void updateInformation(ownerId, { theme: nextTheme });
    }
  }

  function onAddNodeMapNode() {
    if (!item || !isProActivated(subscription)) {
      return;
    }
    const map = getCurrentNodeMap();
    const usedSlugs = new Set(map.nodes.map((node) => node.targetSlug).filter(Boolean));
    const candidate = pageLinks.find((row) => !usedSlugs.has(row.slug));
    const nodeId = crypto.randomUUID();
    const nextNode = {
      id: nodeId,
      title: candidate?.title ?? `ページ ${map.nodes.length + 1}`,
      icon: "📄",
      x: 14 + (map.nodes.length % 4) * 22,
      y: 18 + Math.floor(map.nodes.length / 4) * 20,
      targetSlug: candidate?.slug ?? "",
    };
    updateNodeMap(
      {
        ...map,
        enabled: true,
        nodes: [...map.nodes, nextNode],
      },
      true,
    );
    setNewNodePopId(nodeId);
    window.setTimeout(() => setNewNodePopId((prev) => (prev === nodeId ? null : prev)), 420);
  }

  function onDeleteNodeMapNode(nodeId: string) {
    if (!item || !isProActivated(subscription)) {
      return;
    }
    if (nodeId === "__hub__") {
      return;
    }
    const map = getCurrentNodeMap();
    updateNodeMap(
      {
        ...map,
        nodes: map.nodes.filter((node) => node.id !== nodeId),
        edges: map.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId),
      },
      true,
    );
    const nextBlocks = item.contentBlocks.map((block) => {
      if (block.type !== "iconRow") {
        return block;
      }
      return {
        ...block,
        iconItems: (block.iconItems ?? []).map((entry) =>
          entry.nodeId === nodeId
            ? { ...entry, nodeId: "", link: "" }
            : entry,
        ),
      };
    });
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void syncNodeMapTreeByBlocks(
      {
        ...map,
        nodes: map.nodes.filter((node) => node.id !== nodeId),
        edges: map.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId),
      },
      nextBlocks,
      { persist: true },
    );
    void saveBlocks(nextBlocks);
  }

  function onSelectNodeTarget(nodeId: string, slug: string) {
    if (!item || !isProActivated(subscription)) {
      return;
    }
    if (nodeId === "__hub__") {
      return;
    }
    const map = getCurrentNodeMap();
    updateNodeMap(
      {
        ...map,
        nodes: map.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                targetSlug: slug,
                title: pageLinks.find((row) => row.slug === slug)?.title ?? node.title,
              }
            : node,
        ),
      },
      true,
    );
    const nextBlocks = item.contentBlocks.map((block) => {
      if (block.type !== "iconRow") {
        return block;
      }
      return {
        ...block,
        iconItems: (block.iconItems ?? []).map((entry) =>
          entry.nodeId === nodeId
            ? { ...entry, link: slug ? `/p/${slug}` : "" }
            : entry,
        ),
      };
    });
    setItem({
      ...item,
      contentBlocks: nextBlocks,
      body: blocksToBody(nextBlocks),
      images: blocksToImages(nextBlocks),
    });
    void saveBlocks(nextBlocks);
  }

  function onChangeNodeTitle(nodeId: string, title: string) {
    if (!item || !isProActivated(subscription)) {
      return;
    }
    const map = getCurrentNodeMap();
    const targetNode = map.nodes.find((node) => node.id === nodeId);
    updateNodeMap(
      {
        ...map,
        nodes: map.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                title,
              }
            : node,
        ),
      },
      false,
    );
    if (targetNode?.targetSlug && targetNode.targetSlug === item.slug) {
      setItem((prev) => (prev ? { ...prev, title } : prev));
      setPageTitleDraft(title);
    }
  }

  async function onBlurNodeTitle(nodeId: string) {
    if (!item || !isProActivated(subscription)) {
      return;
    }
    const map = getCurrentNodeMap();
    const currentNode = map.nodes.find((node) => node.id === nodeId);
    const nextTitle = (currentNode?.title ?? "").trim() || "ページ";
    const nextMap = {
      ...map,
      nodes: map.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              title: nextTitle,
            }
          : node,
      ),
    };
    updateNodeMap(
      nextMap,
      true,
    );

    const targetSlug = currentNode?.targetSlug?.trim();
    if (!targetSlug) {
      return;
    }

    const target =
      targetSlug === item.slug
        ? { id: item.id, isCurrent: true }
        : (() => {
            const linked = pageLinks.find((row) => row.slug === targetSlug);
            return linked ? { id: linked.id, isCurrent: false } : null;
          })();

    if (!target) {
      return;
    }

    try {
      await updateInformation(target.id, { title: nextTitle });
      if (target.isCurrent) {
        setItem((prev) => (prev ? { ...prev, title: nextTitle } : prev));
        setPageTitleDraft(nextTitle);
      }
      setPageLinks((prev) =>
        prev.map((row) => (row.id === target.id ? { ...row, title: nextTitle } : row)),
      );
    } catch (e) {
      setNoticeKind("error");
      setNotice(e instanceof Error ? e.message : "ページ名の同期に失敗しました");
    }
  }

  async function onSavePageTitle() {
    if (!item) {
      return;
    }
    const nextTitle = pageTitleDraft.trim();
    if (!nextTitle) {
      setNoticeKind("error");
      setNotice("ページ名を入力してください");
      return;
    }
    await save({ title: nextTitle });
    setEditingPageTitle(false);
  }

  async function onCreateNodeProject(nodeId: string) {
    if (!item || !isProActivated(subscription)) {
      return;
    }
    setCreatingNodeProjectId(nodeId);
    try {
      await ensureUserHotelScope();
      const map = getCurrentNodeMap();
      const targetNode = map.nodes.find((node) => node.id === nodeId);
      const nextTitle = targetNode?.title?.trim() || "新規インフォメーション";
      const createdId = await createBlankInformation(nextTitle);
      const created = await getInformation(createdId);
      if (!created) {
        throw new Error("新規ページ作成後の情報取得に失敗しました");
      }
      const links = await listCurrentHotelPageLinks();
      setPageLinks(links.filter((row) => row.id !== item.id));
      updateNodeMap(
        {
          ...map,
          enabled: true,
          nodes: map.nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  targetSlug: created.slug,
                  title: created.title,
                }
              : node,
          ),
        },
        true,
      );
      setNoticeKind("success");
      setNotice(`ノードに新規ページ「${created.title}」を接続しました`);
    } catch (e) {
      setNoticeKind("error");
      setNotice(e instanceof Error ? e.message : "ノードからの新規ページ作成に失敗しました");
    } finally {
      setCreatingNodeProjectId(null);
    }
  }

  function onStartDragNode(event: MouseEvent<HTMLElement>, nodeId: string) {
    if (!isProActivated(subscription)) {
      return;
    }
    const target = event.target as HTMLElement;
    if (target.closest("input,select,button,textarea,a")) {
      return;
    }
    setDraggingNodeId(nodeId);
  }

  function onMoveNode(event: MouseEvent<HTMLDivElement>) {
    if (!item || !isProActivated(subscription)) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    let x = ((event.clientX - rect.left) / rect.width) * 100;
    let y = ((event.clientY - rect.top) / rect.height) * 100;
    if (!draggingNodeId) {
      return;
    }
    const map = getCurrentNodeMap();
    for (const node of map.nodes) {
      if (node.id === draggingNodeId) {
        continue;
      }
      if (Math.abs(node.x - x) < 2.5) {
        x = node.x;
      }
      if (Math.abs(node.y - y) < 2.5) {
        y = node.y;
      }
    }
    x = Math.round(x / 2) * 2;
    y = Math.round(y / 2) * 2;
    x = Math.min(96, Math.max(4, x));
    y = Math.min(94, Math.max(6, y));
    updateNodeMap(
      {
        ...map,
        nodes: map.nodes.map((node) => (node.id === draggingNodeId ? { ...node, x, y } : node)),
      },
      false,
    );
  }

  function onEndDragNode() {
    if (!item || !draggingNodeId || !isProActivated(subscription)) {
      return;
    }
    const nextTheme = { ...item.theme, nodeMap: getCurrentNodeMap() };
    setItem({ ...item, theme: nextTheme });
    void save({ theme: nextTheme });
    setDraggingNodeId(null);
  }

  async function onSignOut() {
    await signOut();
    router.replace("/login");
  }

  const nodeMap = sharedNodeMap;
  const proNodeEnabled = isProActivated(subscription);
  const activeEditingNodeId = useMemo(() => {
    if (!item) {
      return null;
    }
    const currentSlug = item.slug.trim();
    const matched = nodeMap.nodes.find((node) => (node.targetSlug ?? "").trim() === currentSlug);
    return matched?.id ?? null;
  }, [item, nodeMap.nodes]);
  const nodeTargetOptions = useMemo(
    () =>
      nodeMap.nodes
        .filter((node) => node.id !== "__hub__")
        .filter((node) => (node.targetSlug ?? "").trim().length > 0)
        .map((node) => ({
          id: node.id,
          title: node.title,
          slug: (node.targetSlug ?? "").trim(),
        })),
    [nodeMap.nodes],
  );
  const pageStatusBySlug = useMemo(
    () => new Map(pageLinks.map((link) => [link.slug, link.status])),
    [pageLinks],
  );
  const publishCheckIssues = useMemo(() => {
    if (!item) {
      return [];
    }
    return collectPublishCheckIssues(item, pageStatusBySlug);
  }, [item, pageStatusBySlug]);
  const publishCheckErrors = publishCheckIssues.filter((issue) => issue.level === "error");
  const publishCheckWarnings = publishCheckIssues.filter((issue) => issue.level === "warning");

  function getNodeTargetStatus(node: { id: string; targetSlug?: string }): "published" | "draft" | null {
    const slug = (node.targetSlug ?? "").trim();
    if (!slug) {
      return null;
    }
    if (item && slug === item.slug) {
      return item.status;
    }
    return (pageStatusBySlug.get(slug) as "published" | "draft" | undefined) ?? null;
  }

  async function onPublishWithCheck() {
    if (!item) {
      return;
    }
    if (publishCheckErrors.length > 0) {
      setNoticeKind("error");
      setNotice(`公開前チェックでエラー ${publishCheckErrors.length} 件があります。内容を修正してください。`);
      return;
    }
    if (publishCheckWarnings.length > 0) {
      setNoticeKind("success");
      setNotice(`公開前チェック: 警告 ${publishCheckWarnings.length} 件（公開は続行します）。`);
    }
    await save({ status: "published" });
  }

  useEffect(() => {
    if (!item || !proNodeEnabled) {
      return;
    }
    if (nodeMapOwner && nodeMapOwner.id !== item.id) {
      return;
    }
    const baseMap = sharedNodeMap;
    const hubId = "__hub__";
    const hubTitle = nodeMapOwner?.title ?? item.title;
    const hubSlug = nodeMapOwner?.slug ?? item.slug;
    const existingHub = baseMap.nodes.find((node) => node.id === hubId);
    const hubNode = existingHub
      ? { ...existingHub, title: hubTitle, targetSlug: hubSlug, icon: "🏠" }
      : { id: hubId, title: hubTitle, icon: "🏠", x: 50, y: 12, targetSlug: hubSlug };
    const otherNodes = baseMap.nodes.filter((node) => node.id !== hubId);
    const nodes = [hubNode, ...otherNodes];
    const validNodeIds = new Set(nodes.map((node) => node.id));
    const linkedNodeIds = Array.from(
      new Set(
        item.contentBlocks.flatMap((block) => {
          if (block.type !== "iconRow") {
            return [];
          }
          return (block.iconItems ?? [])
            .map((entry) => (entry.nodeId ?? "").trim())
            .filter((nodeId) => nodeId && nodeId !== hubId && validNodeIds.has(nodeId));
        }),
      ),
    );
    const edges = linkedNodeIds.map((nodeId) => ({ id: `auto-${hubId}-${nodeId}`, from: hubId, to: nodeId }));
    const sameNodes =
      baseMap.nodes.length === nodes.length &&
      baseMap.nodes.every((node, index) => {
        const next = nodes[index];
        return next && node.id === next.id && node.title === next.title && node.targetSlug === next.targetSlug;
      });
    const sameEdges =
      baseMap.edges.length === edges.length &&
      baseMap.edges.every((edge, index) => {
        const next = edges[index];
        return next && edge.id === next.id && edge.from === next.from && edge.to === next.to;
      });
    if (sameNodes && sameEdges && baseMap.enabled) {
      return;
    }
    setSharedNodeMap({
      ...baseMap,
      enabled: true,
      nodes,
      edges,
    });
  }, [item, nodeMapOwner, proNodeEnabled, sharedNodeMap]);

  return (
    <AuthGate>
      <main className="lux-main min-h-screen bg-[radial-gradient(circle_at_top_left,#86efac30_0%,#34d39924_35%,#ecfdf5_100%)] pl-4 pr-6 py-10 sm:pl-8 sm:pr-10 lg:pl-[92px] lg:pr-8">
        <aside className="rounded-3xl border border-emerald-200/70 bg-white p-2 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.7)] backdrop-blur lg:fixed lg:left-0 lg:top-0 lg:z-20 lg:flex lg:h-screen lg:w-[72px] lg:flex-col lg:rounded-none lg:rounded-r-3xl">
          <div className="mb-2 flex items-center justify-center rounded-2xl border border-emerald-200/60 bg-white py-3 text-xs font-semibold text-slate-700">
            <SideNavButton label="LPへ" onClick={() => router.push("/")}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
              </svg>
            </SideNavButton>
          </div>
          <div className="flex flex-row items-center justify-center gap-2 lg:flex-col lg:gap-3">
            <SideNavButton label="ダッシュボード" onClick={() => router.push("/dashboard?tab=dashboard")}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="8" height="8" rx="1.5" />
                <rect x="13" y="3" width="8" height="5" rx="1.5" />
                <rect x="13" y="10" width="8" height="11" rx="1.5" />
                <rect x="3" y="13" width="8" height="8" rx="1.5" />
              </svg>
            </SideNavButton>
            <SideNavButton label="作成" active>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
                <rect x="3" y="3" width="18" height="18" rx="2.5" />
              </svg>
            </SideNavButton>
            <SideNavButton label="プロジェクト" onClick={() => router.push("/dashboard?tab=project")}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 9h18" />
              </svg>
            </SideNavButton>
            <SideNavButton label="運用センター" onClick={() => router.push("/dashboard?tab=ops")}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 20h16" />
                <path d="M7 17v-3" />
                <path d="M12 17v-6" />
                <path d="M17 17v-9" />
                <circle cx="7" cy="10" r="1.2" />
                <circle cx="12" cy="7" r="1.2" />
                <circle cx="17" cy="4" r="1.2" />
              </svg>
            </SideNavButton>
          </div>
          <div className="mt-auto hidden lg:flex lg:flex-col lg:items-center lg:gap-3">
            <SideNavButton label="利用規約へ" onClick={() => router.push("/terms")}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 3h9l3 3v15H6z" />
                <path d="M15 3v4h3" />
                <path d="M9 12h6M9 16h6" />
              </svg>
            </SideNavButton>
            <SideNavButton label="ログアウト" onClick={() => void onSignOut()}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </SideNavButton>
          </div>
        </aside>
        {inlineAddToast && (
          <div
            className="inline-pop-in-out pointer-events-none fixed z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-900 shadow-lg"
            style={{ left: inlineAddToast.x, top: inlineAddToast.y, transform: "translate(-10%, -100%)" }}
          >
            {inlineAddToast.message}
          </div>
        )}
        {item && (
          <aside
            className="fixed top-1/2 z-40 -translate-y-1/2"
            style={{ left: "max(6px, calc((100vw - min(93.75rem, calc(100vw - 4rem))) / 4 - 8px))" }}
          >
            <div className="flex flex-col gap-2 rounded-2xl border border-emerald-300 bg-white/98 p-2.5 shadow-xl ring-1 ring-emerald-200/80 backdrop-blur">
              <span className="group relative inline-flex">
                <button
                  type="button"
                  onClick={onUndoBlocks}
                  disabled={blockHistoryPast.length === 0}
                  className="flex h-11 w-[54px] flex-col items-center justify-center gap-0.5 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white text-emerald-800 shadow-sm transition hover:-translate-y-[1px] hover:border-emerald-400 hover:from-emerald-100 hover:to-emerald-50 hover:text-emerald-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="一つ前に戻す"
                >
                  <span className="text-[15px] font-semibold leading-none">↶</span>
                  <span className="text-[9px] leading-none">戻る</span>
                </button>
                <span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                  一つ前に戻す
                </span>
              </span>
              <span className="group relative inline-flex">
                <button
                  type="button"
                  onClick={onRedoBlocks}
                  disabled={blockHistoryFuture.length === 0}
                  className="flex h-11 w-[54px] flex-col items-center justify-center gap-0.5 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white text-emerald-800 shadow-sm transition hover:-translate-y-[1px] hover:border-emerald-400 hover:from-emerald-100 hover:to-emerald-50 hover:text-emerald-900 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="一つ先に進む"
                >
                  <span className="text-[15px] font-semibold leading-none">↷</span>
                  <span className="text-[9px] leading-none">進む</span>
                </button>
                <span className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                  一つ先に進む
                </span>
              </span>
            </div>
          </aside>
        )}
        <div className="mx-auto w-full max-w-[1650px] space-y-5">
          {!item ? (
            <section className="animate-pulse space-y-5">
              <div className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="h-4 w-40 rounded bg-slate-200" />
                <div className="mt-3 h-8 w-64 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-80 rounded bg-slate-200" />
              </div>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <div className="space-y-5">
                  <div className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="h-5 w-28 rounded bg-slate-200" />
                    <div className="mt-4 h-10 w-full rounded bg-slate-200" />
                    <div className="mt-3 h-24 w-full rounded bg-slate-200" />
                    <div className="mt-3 h-24 w-full rounded bg-slate-200" />
                  </div>
                  <div className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="h-5 w-20 rounded bg-slate-200" />
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="h-10 rounded bg-slate-200" />
                      <div className="h-10 rounded bg-slate-200" />
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="h-5 w-36 rounded bg-slate-200" />
                    <div className="mt-3 h-4 w-full rounded bg-slate-200" />
                    <div className="mt-3 h-36 w-36 rounded bg-slate-200" />
                  </div>
                  <div className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="h-5 w-28 rounded bg-slate-200" />
                    <div className="mt-3 h-80 w-full rounded-3xl bg-slate-200" />
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <>
              <header className="lux-card lux-section-card rounded-2xl p-5 backdrop-blur">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Link href="/dashboard" className="text-sm text-slate-600 hover:underline">
                      ← ダッシュボードへ戻る
                    </Link>
                    <h1 className="mt-2 text-2xl font-semibold text-slate-900">インフォメーション編集</h1>
                    <p className="mt-1 text-sm text-slate-600">
                      ブロックを追加して自由に組み立てできます。
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        item.status === "published"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status === "published" ? "公開中" : "下書き"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        autosaveState === "saving"
                          ? "bg-blue-100 text-blue-700"
                          : autosaveState === "saved"
                            ? "bg-emerald-100 text-emerald-700"
                            : autosaveState === "error"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {autosaveState === "saving"
                        ? "自動保存中..."
                        : autosaveState === "saved"
                          ? `保存済み ${formatSavedAt(lastSavedAt)}`
                          : autosaveState === "error"
                            ? "保存失敗"
                            : "待機中"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void onDeleteInformation()}
                      disabled={deleting}
                      className="rounded-md border border-rose-300 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    >
                      {deleting ? "削除中..." : "削除"}
                    </button>
                  </div>
                </div>
              </header>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <section className="space-y-5">
                  <article className="lux-card lux-section-card rounded-2xl p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <h2 className="text-lg font-semibold">基本情報</h2>
                      {editingPageTitle ? (
                        <div className="flex items-center gap-2">
                          <input
                            value={pageTitleDraft}
                            onChange={(e) => setPageTitleDraft(e.target.value)}
                            className="min-w-[180px] rounded-md border border-slate-300 px-2 py-1 text-sm"
                            placeholder="ページ名"
                          />
                          <button
                            type="button"
                            onClick={() => void onSavePageTitle()}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50"
                          >
                            保存
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPageTitle(false);
                              setPageTitleDraft(item.title);
                            }}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50"
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="max-w-[260px] truncate font-medium">{item.title}</span>
                          <button
                            type="button"
                            onClick={() => setEditingPageTitle(true)}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                            title="ページ名を編集"
                            aria-label="ページ名を編集"
                          >
                            ✎
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mb-4 text-xs text-slate-500">
                      ブロックを追加してオリジナルのページを作成しよう！
                    </p>

                    <section className="mb-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">ブロックを追加</h3>
                        <p className="text-[11px] text-slate-500">クリックまたはドラッグで追加</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                        <button
                          type="button"
                          onClick={() => toggleAddSection("text")}
                          className="col-span-2 mb-0.5 flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-600 sm:col-span-3 lg:col-span-4"
                        >
                          <span>テキスト</span>
                          <span>{collapsedAddSections.text ? "+" : "-"}</span>
                        </button>
                        {!collapsedAddSections.text && (
                          <>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("title", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "title")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-sky-300 hover:bg-sky-50"
                        >
                          <div className="font-medium">+ タイトル</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-sky-700">ページの主見出し</div>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("heading", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "heading")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-violet-300 hover:bg-violet-50"
                        >
                          <div className="font-medium">+ 見出し</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-violet-700">セクション分け</div>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("paragraph", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "paragraph")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-emerald-300 hover:bg-emerald-50"
                        >
                          <div className="font-medium">+ テキスト</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-emerald-700">本文を入力</div>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("divider", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "divider")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-slate-400 hover:bg-slate-100"
                        >
                          <div className="font-medium">+ 区切り線</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-slate-700">区切りを追加</div>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("space", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "space")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-fuchsia-300 hover:bg-fuchsia-50"
                        >
                          <div className="font-medium">+ スペース</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-fuchsia-700">余白を追加</div>
                        </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleAddSection("column")}
                          className="col-span-2 mt-1 mb-0.5 flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-600 sm:col-span-3 lg:col-span-4"
                        >
                          <span>カラム</span>
                          <span>{collapsedAddSections.column ? "+" : "-"}</span>
                        </button>
                        {!collapsedAddSections.column && (
                          <>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("icon", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "icon")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-emerald-300 hover:bg-emerald-50"
                        >
                          <div className="font-medium">+ アイコン項目</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-emerald-700">情報を見やすく</div>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("iconRow", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "iconRow")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-sky-300 hover:bg-sky-50"
                        >
                          <div className="font-medium">+ アイコン並び</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-sky-700">横並びで一覧化</div>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("section", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "section")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-emerald-300 hover:bg-emerald-50"
                        >
                          <div className="font-medium">+ セクション</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-emerald-700">背景付きブロック</div>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("columns", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "columns")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-violet-300 hover:bg-violet-50"
                        >
                          <div className="font-medium">+ 2カラム</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-violet-700">左右で情報整理</div>
                        </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleAddSection("section")}
                          className="col-span-2 mt-1 mb-0.5 flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-600 sm:col-span-3 lg:col-span-4"
                        >
                          <span>セクション</span>
                          <span>{collapsedAddSections.section ? "+" : "-"}</span>
                        </button>
                        {!collapsedAddSections.section && (
                          <>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("cta", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "cta")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-emerald-300 hover:bg-emerald-50"
                        >
                          <div className="font-medium">+ CTAボタン</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-emerald-700">予約・注文導線</div>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("badge", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "badge")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-amber-300 hover:bg-amber-50"
                        >
                          <div className="font-medium">+ バッジ</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-amber-700">限定・おすすめ</div>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("hours", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "hours")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-sky-300 hover:bg-sky-50"
                        >
                          <div className="font-medium">+ 営業時間</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-sky-700">時間情報を一覧化</div>
                        </button>
                        <button
                          type="button"
                          onClick={(event) => void onAddBlock("pricing", event)}
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "pricing")}
                          onDragEnd={onPaletteDragEnd}
                          className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-fuchsia-300 hover:bg-fuchsia-50"
                        >
                          <div className="font-medium">+ 料金表</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-fuchsia-700">価格を見やすく表示</div>
                        </button>
                        <label
                          draggable
                          onDragStart={(event) => onPaletteDragStart(event, "image")}
                          onDragEnd={onPaletteDragEnd}
                          className="group cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-cyan-300 hover:bg-cyan-50"
                        >
                          <div className="font-medium">+ 画像</div>
                          <div className="mt-1 text-[10px] text-slate-500 group-hover:text-cyan-700">アップロードして追加</div>
                          <input type="file" accept="image/*" onChange={onAddImageBlock} className="hidden" />
                        </label>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleAddSection("preset")}
                          className="col-span-2 mt-1 mb-0.5 flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold tracking-wide text-slate-600 sm:col-span-3 lg:col-span-4"
                        >
                          <span>ブロックセット</span>
                          <span>{collapsedAddSections.preset ? "+" : "-"}</span>
                        </button>
                        {!collapsedAddSections.preset && (
                          <>
                            <div className="col-span-2 rounded-md border border-emerald-200 bg-emerald-50/60 px-2 py-1 text-[11px] font-semibold text-emerald-800 sm:col-span-3 lg:col-span-4">
                              業種別セット
                            </div>
                            <button
                              type="button"
                              onClick={(event) => onAddIndustryBlockSet("hotel", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-cyan-300 hover:bg-cyan-50"
                            >
                              <div className="font-medium">+ ホテル向けセット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-cyan-700">チェックイン・館内導線・時間情報</div>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => onAddIndustryBlockSet("restaurant", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-rose-300 hover:bg-rose-50"
                            >
                              <div className="font-medium">+ 飲食店向けセット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-rose-700">おすすめ・価格・予約CTA</div>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => onAddIndustryBlockSet("cafe", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-amber-300 hover:bg-amber-50"
                            >
                              <div className="font-medium">+ カフェ向けセット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-amber-700">限定メニュー・Wi-Fi導線</div>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => onAddIndustryBlockSet("salon", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-pink-300 hover:bg-pink-50"
                            >
                              <div className="font-medium">+ サロン向けセット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-pink-700">メニュー価格・来店ルール</div>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => onAddIndustryBlockSet("clinic", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-sky-300 hover:bg-sky-50"
                            >
                              <div className="font-medium">+ クリニック向けセット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-sky-700">診療時間・持ち物・注意事項</div>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => onAddIndustryBlockSet("retail", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-lime-300 hover:bg-lime-50"
                            >
                              <div className="font-medium">+ 小売店向けセット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-lime-700">キャンペーン・返品案内</div>
                            </button>
                            <div className="col-span-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 sm:col-span-3 lg:col-span-4">
                              汎用セット
                            </div>
                            <button
                              type="button"
                              onClick={(event) => onAddBlockSet("campaign", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-emerald-300 hover:bg-emerald-50"
                            >
                              <div className="font-medium">+ キャンペーン告知セット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-emerald-700">バッジ+価格+CTAを一括追加</div>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => onAddBlockSet("menu", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-sky-300 hover:bg-sky-50"
                            >
                              <div className="font-medium">+ 営業時間・料金セット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-sky-700">時間+料金+注意事項を自動配置</div>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => onAddBlockSet("faq", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-violet-300 hover:bg-violet-50"
                            >
                              <div className="font-medium">+ FAQセット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-violet-700">よくある質問の雛形を3問追加</div>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => onAddBlockSet("access", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-cyan-300 hover:bg-cyan-50"
                            >
                              <div className="font-medium">+ アクセス案内セット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-cyan-700">2カラム+アイコン導線+CTA</div>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => onAddBlockSet("notice", event)}
                              className="group rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:border-amber-300 hover:bg-amber-50"
                            >
                              <div className="font-medium">+ お知らせセット</div>
                              <div className="mt-1 text-[10px] text-slate-500 group-hover:text-amber-700">重要告知の基本構成を追加</div>
                            </button>
                          </>
                        )}
                      </div>
                    </section>

                    <div className="space-y-3 rounded-lg border border-dashed border-transparent p-1">
                      {item.contentBlocks.map((block, index) => (
                        <article
                          key={block.id}
                          data-block-id={block.id}
                          draggable
                          onDragStart={(event) => onBlockDragStart(event, block.id)}
                          onDragEnd={onBlockDragEnd}
                          onDragOver={(event) => onBlockDragOver(event, block.id)}
                          onDrop={(event) => onBlockDrop(event, block.id)}
                          className={`cursor-grab rounded-lg border p-3 transition duration-200 hover:-translate-y-[1px] hover:shadow-md active:cursor-grabbing ${
                            dragOverBlockId === block.id
                              ? draggingNewBlockType
                                ? "border-sky-500 bg-sky-50/80 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]"
                                : "border-violet-400 bg-violet-50/50"
                              : "border-slate-200 hover:border-slate-300"
                          } ${
                            draggingBlockId === block.id
                              ? "scale-[0.995] border-violet-500 bg-violet-50/70 shadow-md"
                              : ""
                          } ${
                            justInsertedBlockId === block.id
                              ? "animate-pulse border-emerald-400 bg-emerald-50/80 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
                              : ""
                          }`}
                        >
                          {dragOverBlockId === block.id && draggingNewBlockType && (
                            <div className="mb-2 rounded-md border border-dashed border-sky-400 bg-sky-100/70 px-2 py-1 text-[11px] font-medium text-sky-900">
                              ここに「{getBlockTypeLabel(draggingNewBlockType)}」を挿入
                            </div>
                          )}
                          <div
                            onClick={() => toggleBlockCollapse(block.id)}
                            className="relative mb-2 grid cursor-pointer grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs text-slate-500"
                          >
                            <div className="group relative flex items-center gap-2 justify-self-start">
                              <span>{index + 1}. {getBlockTypeLabel(block.type)}</span>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleBlockCollapse(block.id);
                                }}
                                className="px-0.5 text-[12px] leading-none text-slate-500 hover:text-slate-800"
                                aria-label={collapsedBlocks[block.id] ? "ブロックを展開" : "ブロックを折りたたむ"}
                              >
                                {collapsedBlocks[block.id] ? "+" : "-"}
                              </button>
                            </div>
                            {(block.type === "title" ||
                              block.type === "heading" ||
                              block.type === "paragraph" ||
                              block.type === "icon" ||
                              block.type === "image" ||
                              block.type === "iconRow" ||
                              block.type === "section" ||
                              block.type === "columns" ||
                              block.type === "cta" ||
                              block.type === "badge" ||
                              block.type === "hours" ||
                              block.type === "pricing") ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setCollapsedBlocks({});
                                  setDetailTabBlockId((prev) => (prev === block.id ? null : block.id));
                                }}
                                className="justify-self-center rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] hover:bg-slate-50"
                              >
                                {detailTabBlockId === block.id ? "細かく編集を閉じる" : "細かく編集する"}
                              </button>
                            ) : (
                              <span />
                            )}
                            <div className="flex gap-1 justify-self-end">
                              <span className="group relative inline-flex">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onCopyBlock(block.id);
                                  }}
                                  className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50"
                                  aria-label="ブロックをコピー"
                                >
                                  ⧉
                                </button>
                                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                                  ブロックをコピー
                                </span>
                              </span>
                              <span className="group relative inline-flex">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onPasteBlock(block.id);
                                  }}
                                  disabled={!copiedBlock}
                                  className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  aria-label="コピーしたブロックを貼り付け"
                                >
                                  ⎘
                                </button>
                                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                                  コピーしたブロックを貼り付け
                                </span>
                              </span>
                              <span className="group relative inline-flex">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onMoveBlock(block.id, "up");
                                  }}
                                  className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50"
                                  aria-label="上へ移動"
                                >
                                  ↑
                                </button>
                                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                                  上へ移動
                                </span>
                              </span>
                              <span className="group relative inline-flex">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onMoveBlock(block.id, "down");
                                  }}
                                  className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-50"
                                  aria-label="下へ移動"
                                >
                                  ↓
                                </button>
                                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                                  下へ移動
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onDeleteBlock(block.id);
                                }}
                                className="rounded border border-rose-300 px-2 py-0.5 text-rose-700 hover:bg-rose-50"
                              >
                                削除
                              </button>
                            </div>
                          </div>
                          {!collapsedBlocks[block.id] && (
                            block.type === "title" ||
                            block.type === "heading" ||
                            block.type === "paragraph" ||
                            block.type === "icon" ||
                            block.type === "iconRow" ||
                            block.type === "section" ||
                            block.type === "columns" ||
                            block.type === "cta" ||
                            block.type === "badge" ||
                            block.type === "hours" ||
                            block.type === "pricing"
                          ) && (
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-out ${
                                detailTabBlockId === block.id
                                  ? "mb-2 max-h-80 translate-y-0 opacity-100"
                                  : "mb-0 max-h-0 -translate-y-1 opacity-0"
                              }`}
                            >
                              <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50/70 p-2 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                  <label className="mb-1 block text-[11px] text-slate-600">文字サイズ</label>
                                  <select
                                    value={block.textSize ?? "md"}
                                    onChange={(e) =>
                                      onApplyBlockStyle(block.id, {
                                        textSize: e.target.value as InformationBlock["textSize"],
                                      })}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                                  >
                                    <option value="sm">小</option>
                                    <option value="md">中</option>
                                    <option value="lg">大</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="mb-1 block text-[11px] text-slate-600">文字の太さ</label>
                                  <select
                                    value={block.textWeight ?? "semibold"}
                                    onChange={(e) =>
                                      onApplyBlockStyle(block.id, {
                                        textWeight: e.target.value as InformationBlock["textWeight"],
                                      })}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                                  >
                                    <option value="normal">標準</option>
                                    <option value="medium">中</option>
                                    <option value="semibold">太め</option>
                                  </select>
                                </div>
                                {supportsDetailTextAlign(block.type) && (
                                  <div>
                                    <label className="mb-1 block text-[11px] text-slate-600">配置</label>
                                    <select
                                      value={block.textAlign ?? "left"}
                                      onChange={(e) =>
                                        onApplyBlockStyle(block.id, {
                                          textAlign: e.target.value as InformationBlock["textAlign"],
                                        })}
                                      className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                                    >
                                      <option value="left">左</option>
                                      <option value="center">中央</option>
                                      <option value="right">右</option>
                                    </select>
                                  </div>
                                )}
                                <div>
                                  <label className="mb-1 block text-[11px] text-slate-600">余白</label>
                                  <select
                                    value={block.spacing ?? "md"}
                                    onChange={(e) =>
                                      onApplyBlockStyle(block.id, {
                                        spacing: e.target.value as InformationBlock["spacing"],
                                      })}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                                  >
                                    <option value="sm">小</option>
                                    <option value="md">中</option>
                                    <option value="lg">大</option>
                                  </select>
                                </div>
                                {supportsDetailTextColor(block.type) && (
                                  <div className="sm:col-span-2 lg:col-span-2">
                                    <label className="mb-1 block text-[11px] text-slate-600">文字色</label>
                                    <div className="flex flex-wrap items-center gap-1">
                                      {BLOCK_TEXT_SWATCHES.map((color) => (
                                        <button
                                          key={`${block.id}-text-${color}`}
                                          type="button"
                                          onClick={() => onApplyBlockStyle(block.id, { textColor: color })}
                                          className={`h-5 w-5 shrink-0 rounded border ${
                                            (block.textColor ?? "") === color
                                              ? "border-slate-700 ring-1 ring-slate-400"
                                              : "border-slate-300"
                                          }`}
                                          style={{ backgroundColor: color }}
                                          aria-label={`文字色 ${color}`}
                                          title={color}
                                        />
                                      ))}
                                      <input
                                        type="color"
                                        value={block.textColor ?? "#0f172a"}
                                        onChange={(e) =>
                                          onApplyBlockStyle(block.id, {
                                            textColor: e.target.value,
                                          })}
                                        className="h-6 w-8 shrink-0 rounded border border-slate-300 bg-white p-0.5"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && block.type === "image" && (
                            <div
                              className={`overflow-hidden transition-all duration-300 ease-out ${
                                detailTabBlockId === block.id
                                  ? "mb-2 max-h-32 translate-y-0 opacity-100"
                                  : "mb-0 max-h-0 -translate-y-1 opacity-0"
                              }`}
                            >
                              <div className="grid gap-2 rounded-md border border-slate-200 bg-slate-50/70 p-2 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
                                <div>
                                  <label className="mb-1 block text-[11px] text-slate-600">余白</label>
                                  <select
                                    value={block.spacing ?? "md"}
                                    onChange={(e) =>
                                      onApplyBlockStyle(block.id, {
                                        spacing: e.target.value as InformationBlock["spacing"],
                                      })}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                                  >
                                    <option value="sm">小</option>
                                    <option value="md">中</option>
                                    <option value="lg">大</option>
                                  </select>
                                </div>
                                <p className="self-end text-[11px] text-slate-500">
                                  ブロック下の余白を設定します。
                                </p>
                              </div>
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && (block.type === "title" || block.type === "heading" || block.type === "paragraph") && (
                            <div className="space-y-2">
                              <textarea
                                rows={block.type === "paragraph" ? 3 : 1}
                                value={block.text ?? ""}
                                onChange={(e) => onUpdateBlock(block.id, { text: e.target.value })}
                                onBlur={onBlurBlockSave}
                                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm leading-5"
                              />
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && block.type === "image" && (
                            <div className="space-y-2">
                              {block.url && (
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCollapsedImagePreviews((prev) => ({
                                        ...prev,
                                        [block.id]: !prev[block.id],
                                      }))}
                                    className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                                  >
                                    {collapsedImagePreviews[block.id] ? "プレビューを表示" : "プレビューを閉じる"}
                                  </button>
                                </div>
                              )}
                              <label
                                onDragOver={(event) => event.preventDefault()}
                                onDrop={(event) => {
                                  event.preventDefault();
                                  const file = event.dataTransfer.files?.[0];
                                  if (file) {
                                    onReplaceImageBlock(block.id, file);
                                  }
                                }}
                                className="block cursor-pointer rounded-md border border-dashed border-slate-300 bg-slate-50/70 p-3 text-center hover:bg-slate-100"
                                >
                                  <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                  onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    if (file) {
                                      onReplaceImageBlock(block.id, file);
                                    }
                                  }}
                                    className="hidden"
                                  />
                                {block.url ? (
                                  <div className="space-y-2">
                                    {!collapsedImagePreviews[block.id] && (
                                      <Image
                                        src={block.url}
                                        alt="preview"
                                        width={320}
                                        height={160}
                                        unoptimized
                                        className="mx-auto max-h-40 w-auto rounded-md object-contain"
                                      />
                                    )}
                                    <p className="text-xs text-slate-600">画像を変更（クリックまたはドラッグ&ドロップ）</p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-600">画像をアップロード（クリックまたはドラッグ&ドロップ）</p>
                                )}
                              </label>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onUpdateBlock(block.id, { url: "" });
                                    onBlurBlockSave();
                                  }}
                                  className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                                >
                                  画像をクリア
                                </button>
                              </div>

                              <input
                                value={block.url ?? ""}
                                onChange={(e) => onUpdateBlock(block.id, { url: e.target.value })}
                                onBlur={onBlurBlockSave}
                                placeholder="または画像URLを入力"
                                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                              />
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && block.type === "icon" && (
                            <div className="space-y-1.5">
                              <div className="grid gap-1.5 sm:grid-cols-3">
                                <select
                                  value={block.icon ?? "⭐"}
                                  onChange={(e) => onUpdateBlock(block.id, { icon: e.target.value })}
                                  onBlur={onBlurBlockSave}
                                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                >
                                  {ICON_CHOICES.map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                  ))}
                                </select>
                                <input
                                  value={block.label ?? ""}
                                  onChange={(e) => onUpdateBlock(block.id, { label: e.target.value })}
                                  onBlur={onBlurBlockSave}
                                  placeholder="ラベル"
                                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm sm:col-span-2"
                                />
                              </div>
                              <textarea
                                rows={2}
                                value={block.description ?? ""}
                                onChange={(e) => onUpdateBlock(block.id, { description: e.target.value })}
                                onBlur={onBlurBlockSave}
                                placeholder="説明文"
                                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm leading-5"
                              />
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && block.type === "iconRow" && (
                            <div className="space-y-2">
                              <div className="sm:max-w-[160px]">
                                <label className="mb-1 block text-xs text-slate-600">背景色</label>
                                <input
                                  type="color"
                                  value={block.iconRowBackgroundColor ?? "#f8fafc"}
                                  onChange={(e) => onUpdateBlock(block.id, { iconRowBackgroundColor: e.target.value })}
                                  onBlur={onBlurBlockSave}
                                  className="h-9 w-full rounded border border-slate-300 bg-white p-1"
                                />
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-600">横並びアイコン項目</p>
                                <button
                                  type="button"
                                  onClick={() => onAddIconRowItem(block.id)}
                                  className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                                >
                                  + 項目を追加
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {(block.iconItems ?? []).map((entry) => (
                                  <div key={entry.id} className="grid gap-1.5 rounded-md border border-slate-200 bg-slate-50/60 p-2 sm:grid-cols-[170px_1fr_1fr_84px_auto]">
                                    <select
                                      value={entry.icon}
                                      onChange={(e) => onUpdateIconRowItem(block.id, entry.id, { icon: e.target.value })}
                                      onBlur={onBlurBlockSave}
                                      className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                    >
                                      {ICON_CHOICES.map((icon) => (
                                        <option key={icon.value} value={icon.value}>{icon.label}</option>
                                      ))}
                                    </select>
                                    <input
                                      value={entry.label}
                                      onChange={(e) => onUpdateIconRowItem(block.id, entry.id, { label: e.target.value })}
                                      onBlur={onBlurBlockSave}
                                      placeholder="ラベル"
                                      className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                    />
                                    <input
                                      value={entry.link ?? ""}
                                      onChange={(e) => onUpdateIconRowItem(block.id, entry.id, { link: e.target.value })}
                                      onBlur={onBlurBlockSave}
                                      placeholder="リンクURL (任意)"
                                      className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                    />
                                    <input
                                      type="color"
                                      value={entry.backgroundColor ?? "#ffffff"}
                                      onChange={(e) => onUpdateIconRowItem(block.id, entry.id, { backgroundColor: e.target.value })}
                                      onBlur={onBlurBlockSave}
                                      className="h-9 w-full rounded border border-slate-300 bg-white p-1"
                                      title="カラム背景色"
                                      aria-label="カラム背景色"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => onDeleteIconRowItem(block.id, entry.id)}
                                      className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                                    >
                                      削除
                                    </button>
                                    <div className="sm:col-span-5">
                                      <select
                                        value={
                                          entry.nodeId ??
                                          (entry.link?.startsWith("/p/")
                                            ? nodeTargetOptions.find((node) => node.slug === entry.link?.replace("/p/", ""))?.id ?? ""
                                            : "")
                                        }
                                        onChange={(e) => {
                                          const nextNodeId = e.target.value;
                                          const selectedNode = nodeTargetOptions.find((node) => node.id === nextNodeId);
                                          onUpdateIconRowItem(block.id, entry.id, {
                                            nodeId: nextNodeId || "",
                                            link: selectedNode ? `/p/${selectedNode.slug}` : "",
                                          });
                                        }}
                                        onBlur={onBlurBlockSave}
                                        className="w-full rounded-md border border-emerald-300 bg-emerald-50/50 px-2 py-1.5 text-xs text-emerald-900"
                                      >
                                        <option value="">ノード遷移先を選択（任意）</option>
                                        {nodeTargetOptions.map((node) => (
                                          <option key={node.id} value={node.id}>
                                            {node.title}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && block.type === "section" && (
                            <div className="space-y-2">
                              <input
                                value={block.sectionTitle ?? ""}
                                onChange={(e) => onUpdateBlock(block.id, { sectionTitle: e.target.value })}
                                onBlur={onBlurBlockSave}
                                placeholder="セクションタイトル"
                                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                              />
                              <textarea
                                rows={3}
                                value={block.sectionBody ?? ""}
                                onChange={(e) => onUpdateBlock(block.id, { sectionBody: e.target.value })}
                                onBlur={onBlurBlockSave}
                                placeholder="セクション説明"
                                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm leading-5"
                              />
                              <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                                <div>
                                  <label className="mb-1 block text-xs text-slate-600">背景色</label>
                                  <input
                                    type="color"
                                    value={block.sectionBackgroundColor ?? "#f8fafc"}
                                    onChange={(e) => onUpdateBlock(block.id, { sectionBackgroundColor: e.target.value })}
                                    onBlur={onBlurBlockSave}
                                    className="h-9 w-full rounded border border-slate-300 bg-white p-1"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs text-slate-600">余白</label>
                                  <select
                                    value={block.spacing ?? "md"}
                                    onChange={(e) =>
                                      onUpdateBlock(block.id, {
                                        spacing: e.target.value as InformationBlock["spacing"],
                                      })}
                                    onBlur={onBlurBlockSave}
                                    className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                  >
                                    <option value="sm">小</option>
                                    <option value="md">中</option>
                                    <option value="lg">大</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && block.type === "columns" && (
                            <div className="space-y-2">
                              <div className="grid gap-2 sm:grid-cols-2">
                                <input
                                  value={block.leftTitle ?? ""}
                                  onChange={(e) => onUpdateBlock(block.id, { leftTitle: e.target.value })}
                                  onBlur={onBlurBlockSave}
                                  placeholder="左タイトル"
                                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                />
                                <input
                                  value={block.rightTitle ?? ""}
                                  onChange={(e) => onUpdateBlock(block.id, { rightTitle: e.target.value })}
                                  onBlur={onBlurBlockSave}
                                  placeholder="右タイトル"
                                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                />
                              </div>
                              <div className="grid gap-2 sm:grid-cols-2">
                                <textarea
                                  rows={3}
                                  value={block.leftText ?? ""}
                                  onChange={(e) => onUpdateBlock(block.id, { leftText: e.target.value })}
                                  onBlur={onBlurBlockSave}
                                  placeholder="左テキスト"
                                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm leading-5"
                                />
                                <textarea
                                  rows={3}
                                  value={block.rightText ?? ""}
                                  onChange={(e) => onUpdateBlock(block.id, { rightText: e.target.value })}
                                  onBlur={onBlurBlockSave}
                                  placeholder="右テキスト"
                                  className="rounded-md border border-slate-300 px-2 py-1.5 text-sm leading-5"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-slate-600">余白</label>
                                <select
                                  value={block.spacing ?? "md"}
                                  onChange={(e) =>
                                    onUpdateBlock(block.id, {
                                      spacing: e.target.value as InformationBlock["spacing"],
                                    })}
                                  onBlur={onBlurBlockSave}
                                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm sm:max-w-[160px]"
                                >
                                  <option value="sm">小</option>
                                  <option value="md">中</option>
                                  <option value="lg">大</option>
                                  </select>
                              </div>
                              <div className="sm:max-w-[160px]">
                                <label className="mb-1 block text-xs text-slate-600">背景色</label>
                                <input
                                  type="color"
                                  value={block.columnsBackgroundColor ?? "#f8fafc"}
                                  onChange={(e) =>
                                    onUpdateBlock(block.id, { columnsBackgroundColor: e.target.value })}
                                  onBlur={onBlurBlockSave}
                                  className="h-9 w-full rounded border border-slate-300 bg-white p-1"
                                />
                              </div>
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && block.type === "cta" && (
                            <div className="space-y-2">
                              <input
                                value={block.ctaLabel ?? ""}
                                onChange={(e) => onUpdateBlock(block.id, { ctaLabel: e.target.value })}
                                onBlur={onBlurBlockSave}
                                placeholder="ボタンテキスト"
                                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                              />
                              <input
                                value={block.ctaUrl ?? ""}
                                onChange={(e) => onUpdateBlock(block.id, { ctaUrl: e.target.value })}
                                onBlur={onBlurBlockSave}
                                placeholder="遷移先URL (https://...)"
                                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                              />
                              <div className="sm:max-w-[160px]">
                                <label className="mb-1 block text-xs text-slate-600">配置</label>
                                <select
                                  value={block.textAlign ?? "center"}
                                  onChange={(e) =>
                                    onUpdateBlock(block.id, {
                                      textAlign: e.target.value as InformationBlock["textAlign"],
                                    })}
                                  onBlur={onBlurBlockSave}
                                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                >
                                  <option value="left">左</option>
                                  <option value="center">中央</option>
                                  <option value="right">右</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && block.type === "badge" && (
                            <div className="space-y-2">
                              <input
                                value={block.badgeText ?? ""}
                                onChange={(e) => onUpdateBlock(block.id, { badgeText: e.target.value })}
                                onBlur={onBlurBlockSave}
                                placeholder="バッジテキスト"
                                className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                              />
                              <div className="grid gap-2 sm:grid-cols-2">
                                <div>
                                  <label className="mb-1 block text-xs text-slate-600">背景色</label>
                                  <input
                                    type="color"
                                    value={block.badgeColor ?? "#dcfce7"}
                                    onChange={(e) => onUpdateBlock(block.id, { badgeColor: e.target.value })}
                                    onBlur={onBlurBlockSave}
                                    className="h-9 w-full rounded border border-slate-300 bg-white p-1"
                                  />
                                </div>
                                <div>
                                  <label className="mb-1 block text-xs text-slate-600">文字色</label>
                                  <input
                                    type="color"
                                    value={block.badgeTextColor ?? "#065f46"}
                                    onChange={(e) => onUpdateBlock(block.id, { badgeTextColor: e.target.value })}
                                    onBlur={onBlurBlockSave}
                                    className="h-9 w-full rounded border border-slate-300 bg-white p-1"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && (block.type === "hours" || block.type === "pricing") && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-slate-600">
                                  {block.type === "hours" ? "営業時間項目" : "料金項目"}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => onAddKeyValueItem(block.id, block.type as "hours" | "pricing")}
                                  className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                                >
                                  + 項目を追加
                                </button>
                              </div>
                              <div className="space-y-1.5">
                                {(block.type === "hours" ? block.hoursItems ?? [] : block.pricingItems ?? []).map((entry) => (
                                  <div key={entry.id} className="grid gap-1.5 sm:grid-cols-[1fr_1fr_auto]">
                                    <input
                                      value={entry.label}
                                      onChange={(e) =>
                                        onUpdateKeyValueItem(block.id, block.type as "hours" | "pricing", entry.id, {
                                          label: e.target.value,
                                        })}
                                      onBlur={onBlurBlockSave}
                                      placeholder={block.type === "hours" ? "区分 (平日など)" : "商品名"}
                                      className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                    />
                                    <input
                                      value={entry.value}
                                      onChange={(e) =>
                                        onUpdateKeyValueItem(block.id, block.type as "hours" | "pricing", entry.id, {
                                          value: e.target.value,
                                        })}
                                      onBlur={onBlurBlockSave}
                                      placeholder={block.type === "hours" ? "10:00 - 20:00" : "¥3,000"}
                                      className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => onDeleteKeyValueItem(block.id, block.type as "hours" | "pricing", entry.id)}
                                      className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                                    >
                                      削除
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && block.type === "space" && (
                            <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                              <div>
                                <label className="mb-1 block text-xs text-slate-600">余白</label>
                                <select
                                  value={block.spacing ?? "md"}
                                  onChange={(e) => onUpdateBlock(block.id, {
                                    spacing: e.target.value as InformationBlock["spacing"],
                                  })}
                                  onBlur={onBlurBlockSave}
                                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                >
                                  <option value="sm">小</option>
                                  <option value="md">中</option>
                                  <option value="lg">大</option>
                                </select>
                              </div>
                              <div className="self-end text-xs text-slate-500">空白の高さを調整できます。</div>
                            </div>
                          )}

                          {!collapsedBlocks[block.id] && block.type === "divider" && (
                            <div className="grid gap-2 sm:grid-cols-[160px_1fr_120px]">
                              <div>
                                <label className="mb-1 block text-xs text-slate-600">線の太さ</label>
                                <select
                                  value={block.dividerThickness ?? "thin"}
                                  onChange={(e) =>
                                    onUpdateBlock(block.id, {
                                      dividerThickness: e.target.value as InformationBlock["dividerThickness"],
                                    })}
                                  onBlur={onBlurBlockSave}
                                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                >
                                  <option value="thin">細い</option>
                                  <option value="medium">中</option>
                                  <option value="thick">太い</option>
                                </select>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-slate-600">線の色</label>
                                <div className="flex items-center gap-1.5">
                                  {BLOCK_TEXT_SWATCHES.map((color) => (
                                    <button
                                      key={`${block.id}-divider-color-${color}`}
                                      type="button"
                                      onClick={() => onApplyBlockStyle(block.id, { dividerColor: color })}
                                      className={`h-5 w-5 rounded border ${
                                        (block.dividerColor ?? "") === color
                                          ? "border-slate-700 ring-1 ring-slate-400"
                                          : "border-slate-300"
                                      }`}
                                      style={{ backgroundColor: color }}
                                      aria-label={`区切り線色 ${color}`}
                                      title={color}
                                    />
                                  ))}
                                  <input
                                    type="color"
                                    value={block.dividerColor ?? "#e2e8f0"}
                                    onChange={(e) => onUpdateBlock(block.id, { dividerColor: e.target.value })}
                                    onBlur={onBlurBlockSave}
                                    className="h-8 w-10 rounded border border-slate-300 bg-white p-1"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs text-slate-600">余白</label>
                                <select
                                  value={block.spacing ?? "md"}
                                  onChange={(e) =>
                                    onUpdateBlock(block.id, {
                                      spacing: e.target.value as InformationBlock["spacing"],
                                    })}
                                  onBlur={onBlurBlockSave}
                                  className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                                >
                                  <option value="sm">小</option>
                                  <option value="md">中</option>
                                  <option value="lg">大</option>
                                </select>
                              </div>
                            </div>
                          )}

                        </article>
                      ))}
                    </div>
                  </article>

                  <article className="lux-card lux-section-card rounded-2xl p-5">
                    <h2 className="mb-4 text-lg font-semibold">デザイン</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">背景色</label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {BACKGROUND_SWATCHES.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => onApplyThemeColor("backgroundColor", color)}
                                className={`h-7 w-7 rounded-md border ${
                                  (item.theme.backgroundColor ?? "#ffffff") === color
                                    ? "border-slate-700 ring-1 ring-slate-400"
                                    : "border-slate-300"
                                }`}
                                style={{ backgroundColor: color }}
                                aria-label={`背景色 ${color}`}
                                title={color}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={item.theme.backgroundColor ?? "#ffffff"}
                              onChange={(e) =>
                                setItem({
                                  ...item,
                                  theme: { ...item.theme, backgroundColor: e.target.value },
                                })}
                              onBlur={() => void save({ theme: item.theme })}
                              className="h-9 w-12 rounded border border-slate-300 bg-white p-1"
                            />
                            <input
                              value={item.theme.backgroundColor ?? "#ffffff"}
                              onChange={(e) =>
                                setItem({
                                  ...item,
                                  theme: { ...item.theme, backgroundColor: e.target.value },
                                })}
                              onBlur={() => void save({ theme: item.theme })}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">文字色</label>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {TEXT_SWATCHES.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => onApplyThemeColor("textColor", color)}
                                className={`h-7 w-7 rounded-md border ${
                                  (item.theme.textColor ?? "#0f172a") === color
                                    ? "border-slate-700 ring-1 ring-slate-400"
                                    : "border-slate-300"
                                }`}
                                style={{ backgroundColor: color }}
                                aria-label={`文字色 ${color}`}
                                title={color}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={item.theme.textColor ?? "#0f172a"}
                              onChange={(e) =>
                                setItem({
                                  ...item,
                                  theme: { ...item.theme, textColor: e.target.value },
                                })}
                              onBlur={() => void save({ theme: item.theme })}
                              className="h-9 w-12 rounded border border-slate-300 bg-white p-1"
                            />
                            <input
                              value={item.theme.textColor ?? "#0f172a"}
                              onChange={(e) =>
                                setItem({
                                  ...item,
                                  theme: { ...item.theme, textColor: e.target.value },
                                })}
                              onBlur={() => void save({ theme: item.theme })}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">テキストサイズ</label>
                        <select
                          value={item.theme.bodySize ?? "md"}
                          onChange={(e) => {
                            const nextTheme = { ...item.theme, bodySize: e.target.value as InformationTheme["bodySize"] };
                            setItem({ ...item, theme: nextTheme });
                            void save({ theme: nextTheme });
                          }}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        >
                          <option value="sm">小</option>
                          <option value="md">中</option>
                          <option value="lg">大</option>
                        </select>
                      </div>
                    </div>
                  </article>

                  <article className="lux-card lux-section-card rounded-2xl p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-semibold">ノードマップ（Pro）</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <p>1QRで複数ページへ遷移するハブ導線を作成します。</p>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            公開中
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                            未公開
                          </span>
                        </div>
                        {nodeMapOwner && nodeMapOwner.id !== item.id && (
                          <p className="mt-1 text-[11px] text-emerald-700">
                            現在このページは「{nodeMapOwner.title}」のノードマップを共有中です。
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {nodeMapOwner && nodeMapOwner.id !== item.id && (
                          <button
                            type="button"
                            onClick={() => router.push(`/editor/${nodeMapOwner.id}`)}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                          >
                            親ページを編集
                          </button>
                        )}
                        {proNodeEnabled && (
                          <button
                            type="button"
                            onClick={onAddNodeMapNode}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                          >
                            + ページ追加
                          </button>
                        )}
                      </div>
                    </div>

                    {!proNodeEnabled ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                        <p className="text-sm text-emerald-900">ノード連携は Proプランで利用できます。</p>
                        <button
                          type="button"
                          onClick={() => void onStartStripeCheckout()}
                          disabled={creatingCheckout}
                          className="mt-3 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
                        >
                          {creatingCheckout ? "遷移中..." : "Proで解放する"}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div
                          className="relative h-[460px] overflow-hidden rounded-xl border border-slate-200 bg-[radial-gradient(circle_at_20%_20%,#ecfeff_0%,#f8fafc_55%,#ffffff_100%)]"
                          onMouseMove={onMoveNode}
                          onMouseUp={onEndDragNode}
                          onMouseLeave={() => {
                            onEndDragNode();
                          }}
                        >
                          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {nodeMap.edges.map((edge) => {
                              const from = nodeMap.nodes.find((n) => n.id === edge.from);
                              const to = nodeMap.nodes.find((n) => n.id === edge.to);
                              if (!from || !to) {
                                return null;
                              }
                              return (
                                <g key={edge.id}>
                                  <line
                                    x1={from.x}
                                    y1={from.y}
                                    x2={to.x}
                                    y2={to.y}
                                    stroke="#22c55e"
                                    strokeWidth="0.85"
                                  />
                                </g>
                              );
                            })}
                          </svg>

                          {nodeMap.nodes.map((node) => (
                            <div
                              key={node.id}
                              className={`absolute z-20 w-[146px] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-1.5 shadow-sm ${
                                newNodePopId === node.id ? "node-pop" : ""
                              } ${
                                activeEditingNodeId === node.id
                                  ? "border-emerald-500 ring-2 ring-emerald-300"
                                  : "border-slate-200"
                              }`}
                              style={{ left: `${node.x}%`, top: `${node.y}%` }}
                              onMouseDown={(event) => onStartDragNode(event, node.id)}
                            >
                              <div className="mb-1 flex items-center justify-between gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void onCreateNodeProject(node.id);
                                  }}
                                  disabled={creatingNodeProjectId === node.id || node.id === "__hub__"}
                                  className="rounded border border-emerald-300 px-1 py-0 text-[10px] text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="このノード用に新規ページを作成"
                                >
                                  {creatingNodeProjectId === node.id ? "作成中..." : "新規"}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const target = pageLinks.find((row) => row.slug === (node.targetSlug ?? ""));
                                    if (target) {
                                      router.push(`/editor/${target.id}`);
                                    }
                                  }}
                                  disabled={!node.targetSlug || !pageLinks.some((row) => row.slug === node.targetSlug)}
                                  className="rounded border border-slate-300 px-1 py-0 text-[10px] text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="遷移先ページを編集"
                                >
                                  編集
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteNodeMapNode(node.id);
                                  }}
                                  disabled={node.id === "__hub__"}
                                  className="rounded border border-rose-300 px-1 py-0 text-[10px] text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                                  title="ノード削除"
                                >
                                  削除
                                </button>
                              </div>
                              <div className="grid gap-1">
                                <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700">
                                  {(() => {
                                    const status = getNodeTargetStatus(node);
                                    if (!status || node.id === "__hub__") {
                                      return null;
                                    }
                                    return (
                                      <span
                                        className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${
                                          status === "published" ? "bg-emerald-500" : "bg-amber-400"
                                        }`}
                                        title={status === "published" ? "公開中" : "未公開"}
                                        aria-label={status === "published" ? "公開中" : "未公開"}
                                      />
                                    );
                                  })()}
                                  <span>{node.icon}</span>
                                  <input
                                    value={node.title}
                                    onChange={(e) => onChangeNodeTitle(node.id, e.target.value)}
                                    onBlur={() => void onBlurNodeTitle(node.id)}
                                    className="w-full min-w-0 border-0 bg-transparent px-0 py-0 text-xs text-slate-700 outline-none"
                                    placeholder="ノード名"
                                  />
                                </div>
                                <select
                                  value={node.targetSlug ?? ""}
                                  onChange={(e) => onSelectNodeTarget(node.id, e.target.value)}
                                  disabled={node.id === "__hub__"}
                                  className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                                >
                                  <option value="">{node.id === "__hub__" ? "親ノード（固定）" : "遷移先ページを選択"}</option>
                                  {pageLinks.map((link) => (
                                    <option key={link.id} value={link.slug}>{link.title}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )}
                  </article>

                  <article className="lux-card lux-section-card rounded-2xl p-5">
                    <h2 className="mb-4 text-lg font-semibold">公開設定</h2>
                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                      <p>
                        公開枠: {publishedCount} / {publishLimit || "-"} 件
                      </p>
                      {item.status !== "published" && willHitLimitOnPublish && (
                        <p className="mt-2 rounded bg-amber-100 px-2 py-1 text-amber-800">
                          このページを公開すると上限ちょうどになります。
                        </p>
                      )}
                      {item.status !== "published" && willExceedLimitOnPublish && (
                        <div className="mt-2 rounded bg-rose-100 px-2 py-2 text-rose-800">
                          <p>上限超過のため、このままでは公開できません。プラン変更が必要です。</p>
                          <button
                            type="button"
                            onClick={() => void onStartStripeCheckout()}
                            disabled={creatingCheckout}
                            className="mt-2 rounded-md bg-rose-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-600 disabled:opacity-60"
                          >
                            {creatingCheckout ? "遷移中..." : "Proにアップグレード"}
                          </button>
                        </div>
                      )}
                    </div>
                    <div
                      className={`mb-4 rounded-lg border p-3 text-xs ${
                        publishCheckErrors.length > 0
                          ? "border-rose-200 bg-rose-50 text-rose-900"
                          : publishCheckWarnings.length > 0
                            ? "border-amber-200 bg-amber-50 text-amber-900"
                            : "border-emerald-200 bg-emerald-50 text-emerald-900"
                      }`}
                    >
                      <p className="font-medium">公開前チェック（自動）</p>
                      {publishCheckIssues.length === 0 ? (
                        <p className="mt-1">すべてOKです。このまま公開できます。</p>
                      ) : (
                        <ul className="mt-2 space-y-1">
                          {publishCheckIssues.map((issue, index) => (
                            <li key={`${issue.level}-${index}`} className="leading-relaxed">
                              <span className="mr-1">{issue.level === "error" ? "✕" : "!"}</span>
                              {issue.message}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="mb-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => void save({ status: "draft" })}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          item.status === "draft"
                            ? "bg-slate-900 text-white"
                            : "border border-slate-300"
                        }`}
                      >
                        下書き
                      </button>
                      <button
                        type="button"
                        onClick={() => void onPublishWithCheck()}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          item.status === "published"
                            ? "bg-slate-900 text-white"
                            : "border border-slate-300"
                        }`}
                        disabled={item.status !== "published" && willExceedLimitOnPublish}
                      >
                        公開
                      </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">公開開始日時 (任意)</label>
                        <input
                          type="datetime-local"
                          value={toDateTimeLocal(item.publishAt)}
                          onChange={(e) =>
                            setItem({
                              ...item,
                              publishAt: fromDateTimeLocal(e.target.value),
                            })
                          }
                          onBlur={() => void save({ publishAt: item.publishAt })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-slate-600">公開終了日時 (任意)</label>
                        <input
                          type="datetime-local"
                          value={toDateTimeLocal(item.unpublishAt)}
                          onChange={(e) =>
                            setItem({
                              ...item,
                              unpublishAt: fromDateTimeLocal(e.target.value),
                            })
                          }
                          onBlur={() => void save({ unpublishAt: item.unpublishAt })}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                      <p>開始: {formatSchedule(item.publishAt)}</p>
                      <p className="mt-1">終了: {formatSchedule(item.unpublishAt)}</p>
                    </div>
                  </article>
                </section>

                <section className="space-y-5 lg:sticky lg:top-6 lg:h-fit lg:w-full">
                  <article className="lux-card lux-section-card rounded-2xl p-5">
                    <p className="mb-4 text-lg font-semibold text-slate-700">スマホプレビュー</p>
                    <article
                      className="relative mx-auto min-h-[640px] max-w-sm rounded-3xl border border-slate-200 p-6 shadow-sm"
                      style={{
                        backgroundColor: item.theme.backgroundColor ?? "#ffffff",
                        color: item.theme.textColor ?? "#0f172a",
                      }}
                    >
                      {previewOverlay ? (
                        <div
                          className="absolute inset-0 z-30 overflow-y-auto rounded-3xl border border-slate-200 bg-white/95 p-4 pt-16 shadow-lg backdrop-blur-sm"
                          onTouchStart={onOverlayTouchStart}
                          onTouchEnd={(event) => void onOverlayTouchEnd(event)}
                        >
                          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-white/90 px-4 py-3 backdrop-blur-sm">
                            <div className="flex min-w-0 items-center gap-2">
                              <p className="truncate text-xs font-semibold text-slate-700">{previewOverlay.title}</p>
                              {overlaySwipePosition ? (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800">
                                  {overlaySwipePosition.current}/{overlaySwipePosition.total}
                                </span>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => setPreviewOverlay(null)}
                              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                            >
                              閉じる
                            </button>
                          </div>
                          {previewOverlay.loading ? (
                            <div className="flex min-h-[540px] items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-600">
                              プレビューを読み込み中...
                            </div>
                          ) : previewOverlay.error ? (
                            <div className="flex min-h-[540px] items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/70 px-4 text-center text-sm text-rose-700">
                              {previewOverlay.error}
                            </div>
                          ) : previewOverlay.information ? (
                            <article
                              className="mx-auto min-h-[640px] max-w-sm rounded-3xl border border-slate-200 p-6 shadow-sm"
                              style={{
                                backgroundColor: previewOverlay.information.theme.backgroundColor ?? "#ffffff",
                                color: previewOverlay.information.theme.textColor ?? "#0f172a",
                              }}
                            >
                              <div>{renderSmartphoneBlocks(previewOverlay.information)}</div>
                              <p className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
                                ご不明な点はスタッフまでお声がけください。
                              </p>
                            </article>
                          ) : null}
                        </div>
                      ) : null}
                      <div>
                        {renderSmartphoneBlocks(item)}
                      </div>
                      <p className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-500">
                        ご不明な点はスタッフまでお声がけください。
                      </p>
                    </article>
                  </article>

                  <article className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-lg font-semibold">公開URL / QR</h2>
                      <button
                        type="button"
                        onClick={onCopyUrl}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs hover:bg-slate-50"
                      >
                        URLコピー
                      </button>
                    </div>
                    <a className="break-all text-sm text-blue-700 underline" href={publicUrl} target="_blank" rel="noreferrer">
                      {publicUrl}
                    </a>
                    <div className="mt-3 inline-block rounded-lg bg-white p-2 shadow-sm">
                      <Image
                        alt="QR"
                        width={140}
                        height={140}
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrPublicUrl)}`}
                        unoptimized
                      />
                    </div>
                  </article>
                </section>
              </div>
            </>
          )}
        </div>
        {notice && (
          <div className="pointer-events-none fixed bottom-5 right-5 z-50">
            <div
              onAnimationEnd={() => {
                if (noticeKind === "success") {
                  setNotice("");
                }
              }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
                noticeKind === "success"
                  ? "toast-slide-in-out border-emerald-200 bg-emerald-50/95 text-emerald-900"
                  : "border-rose-200 bg-rose-50/95 text-rose-900"
              }`}
            >
              <span className="text-base leading-none">
                {noticeKind === "success" ? "✓" : "!"}
              </span>
              <span>{notice}</span>
            </div>
          </div>
        )}
      </main>
    </AuthGate>
  );
}
