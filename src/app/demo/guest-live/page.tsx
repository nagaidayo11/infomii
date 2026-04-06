"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { GuestCardPageView } from "@/components/guest/GuestCardPageView";
import type { EditorCard } from "@/components/editor/types";
import type { PageBackgroundStyle } from "@/lib/storage";

const DEMO_STORAGE_KEY = "editor2:demo-state:v2";

const FALLBACK_CARDS: EditorCard[] = [
  {
    id: "demo-hero",
    type: "hero",
    order: 0,
    content: {
      title: "Infomii Hotel",
      subtitle: "館内案内をスマートにまとめました",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    },
  },
  {
    id: "demo-notice",
    type: "notice",
    order: 1,
    content: {
      title: "お知らせ",
      body: "客室清掃は10:00-14:00に実施します。",
      variant: "info",
    },
  },
  {
    id: "demo-wifi",
    type: "wifi",
    order: 2,
    content: {
      title: "WiFi",
      ssid: "Infomii-Guest",
      password: "welcome-2026",
      description: "接続できない場合はフロントへお知らせください。",
    },
  },
];

const FALLBACK_BG: PageBackgroundStyle = {
  mode: "solid",
  color: "#f8fafc",
  from: "#f8fafc",
  to: "#e2e8f0",
  angle: 180,
};

function isEditorCardArray(value: unknown): value is EditorCard[] {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && "id" in item && "type" in item);
}

function normalizeBackground(value: unknown): PageBackgroundStyle | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  return {
    mode: raw.mode === "gradient" ? "gradient" : "solid",
    color: typeof raw.color === "string" ? raw.color : "#f8fafc",
    from: typeof raw.from === "string" ? raw.from : "#f8fafc",
    to: typeof raw.to === "string" ? raw.to : "#e2e8f0",
    angle: typeof raw.angle === "number" ? raw.angle : 180,
  };
}

export default function DemoGuestLivePage() {
  const searchParams = useSearchParams();
  const isEmbed = searchParams.get("embed") === "1";
  // Keep first render identical between server/client to avoid hydration mismatch.
  const [cards, setCards] = useState<EditorCard[]>(FALLBACK_CARDS);
  const [pageBackground, setPageBackground] = useState<PageBackgroundStyle>(FALLBACK_BG);

  const syncFromDemoStorage = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(DEMO_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        cards?: unknown;
        background?: unknown;
      };
      if (isEditorCardArray(parsed.cards) && parsed.cards.length > 0) {
        setCards(parsed.cards);
      }
      const bg = normalizeBackground(parsed.background);
      if (bg) setPageBackground(bg);
    } catch {
      // ignore malformed demo data
    }
  }, []);

  useEffect(() => {
    const initialSyncId = window.setTimeout(syncFromDemoStorage, 0);
    const onFocus = () => syncFromDemoStorage();
    const onStorage = (event: StorageEvent) => {
      if (event.key == null || event.key === DEMO_STORAGE_KEY) syncFromDemoStorage();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(syncFromDemoStorage, 1200);
    return () => {
      window.clearTimeout(initialSyncId);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [syncFromDemoStorage]);

  return (
    <GuestCardPageView
      title="ご案内"
      cards={cards}
      initialLocale="ja"
      localeLocked
      isEmbed={isEmbed}
      pageBackground={pageBackground}
      localeToggleHint="Businessプラン加入時は、言語トグルでページ全体を一括翻訳できます。"
      disableLocaleSwitch
    />
  );
}
