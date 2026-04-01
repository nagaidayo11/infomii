"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getCurrentHotelSubscription,
  getCurrentUserHotelRole,
  getHotelHideGuestFooter,
  setHotelHideGuestFooter,
} from "@/lib/storage";
import { Card } from "@/components/ui/Card";

/**
 * Business のみ: 公開ページ下部のデフォルト案内文（「ご不明な点は…」）を出さない
 */
export function BusinessGuestFooterSettings() {
  const [plan, setPlan] = useState<"free" | "pro" | "business" | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sub, r, h] = await Promise.all([
        getCurrentHotelSubscription(),
        getCurrentUserHotelRole(),
        getHotelHideGuestFooter(),
      ]);
      setPlan((sub?.plan as "free" | "pro" | "business") ?? "free");
      setRole(r ?? null);
      setHidden(h);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading || plan === null) {
    return (
      <Card padding="lg">
        <div className="h-24 animate-pulse rounded-lg bg-slate-100" aria-hidden />
      </Card>
    );
  }

  if (plan !== "business") {
    return null;
  }

  const isOwner = role === "owner";

  async function handleChange(next: boolean) {
    if (!isOwner) return;
    setSaving(true);
    setMessage(null);
    try {
      await setHotelHideGuestFooter(next);
      setHidden(next);
      setMessage("保存しました");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card padding="lg" className="border-slate-200">
      <h2 className="text-base font-semibold text-slate-900">公開ページのフッター（ゲスト向け）</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        お客様が開く案内ページの<strong className="text-slate-800">一番下に表示される案内文</strong>
        （「ご不明な点はスタッフまでお声がけください。」）を、出さないようにできます。
      </p>
      {!isOwner ? (
        <p className="mt-4 text-sm text-slate-500">この設定は施設のオーナーだけが変更できます。</p>
      ) : (
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={hidden}
            disabled={saving}
            onChange={(e) => void handleChange(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900"
          />
          <span className="text-sm text-slate-700">
            <span className="font-medium text-slate-900">案内フッターを非表示にする</span>
            <span className="mt-1 block text-xs text-slate-500">
              Business プランの施設のみ有効です。オフにすると再び表示されます。
            </span>
          </span>
        </label>
      )}
      {message && (
        <p className={`mt-3 text-sm ${message.includes("失敗") ? "text-red-600" : "text-emerald-600"}`}>
          {message}
        </p>
      )}
    </Card>
  );
}
