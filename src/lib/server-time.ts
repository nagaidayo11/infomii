"use client";

import { useEffect, useMemo, useState } from "react";

export function useServerNow(refreshMs = 60_000): number {
  const [serverNowMs, setServerNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    let active = true;
    const sync = async () => {
      try {
        const res = await fetch("/api/ops/time", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { serverNowMs?: number };
        if (active && typeof data.serverNowMs === "number" && Number.isFinite(data.serverNowMs)) {
          setServerNowMs(data.serverNowMs);
        }
      } catch {
        // keep local fallback time
      }
    };
    void sync();
    const id = window.setInterval(() => {
      setServerNowMs((prev) => prev + refreshMs);
      void sync();
    }, refreshMs);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [refreshMs]);

  return serverNowMs;
}

export function isWithinSchedule(
  nowMs: number,
  options: {
    startAt?: string | null;
    endAt?: string | null;
    enabledDays?: number[];
    startHour?: number;
    endHour?: number;
  }
): boolean {
  const now = new Date(nowMs);
  const days = Array.isArray(options.enabledDays) ? options.enabledDays : null;
  if (days && days.length > 0 && !days.includes(now.getDay())) return false;
  const startHour = Number.isFinite(options.startHour) ? Number(options.startHour) : null;
  const endHour = Number.isFinite(options.endHour) ? Number(options.endHour) : null;
  if (startHour != null && endHour != null && !(now.getHours() >= startHour && now.getHours() < endHour)) return false;
  if (options.startAt) {
    const start = new Date(options.startAt);
    if (!Number.isNaN(start.getTime()) && nowMs < start.getTime()) return false;
  }
  if (options.endAt) {
    const end = new Date(options.endAt);
    if (!Number.isNaN(end.getTime()) && nowMs > end.getTime()) return false;
  }
  return true;
}

export function hasInvalidRange(startAt?: string | null, endAt?: string | null): boolean {
  if (!startAt || !endAt) return false;
  const s = new Date(startAt);
  const e = new Date(endAt);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return false;
  return s.getTime() > e.getTime();
}

export function detectBusinessTypeMisuse(cardTypes: string[], isBusinessEnabled: boolean): boolean {
  const businessTypes = new Set([
    "hero_slider",
    "campaign_timer",
    "notice_ticker",
    "coupon",
    "emergency_banner",
    "scheduled_banner",
  ]);
  return !isBusinessEnabled && cardTypes.some((type) => businessTypes.has(type));
}

export function estimateTemplateConsistencyScore(title: string, cardsJson: string): number {
  const tokens = title
    .toLowerCase()
    .replace(/[【】・\[\]（）()]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return 100;
  const source = cardsJson.toLowerCase();
  const matches = tokens.filter((t) => source.includes(t)).length;
  return Math.max(0, Math.min(100, Math.round((matches / tokens.length) * 100)));
}

export function useTemplateMismatchReason(score: number, mustInclude: string[], forbidden: string[]): string {
  return useMemo(() => {
    if (score >= 60) return "整合良好";
    if (mustInclude.length > 0) return `必須要素不足: ${mustInclude.join(" / ")}`;
    if (forbidden.length > 0) return `禁止要素混入の可能性: ${forbidden.join(" / ")}`;
    return "タイトルと画像の意味一致が低い可能性があります";
  }, [score, mustInclude, forbidden]);
}

