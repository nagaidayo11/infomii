"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import {
  getCurrentHotelSubscription,
  getCurrentUserHotelRole,
  getHotelCustomDomain,
  setHotelCustomDomain,
} from "@/lib/storage";
import { Card } from "@/components/ui/Card";

/**
 * 設定ページ — アカウント・施設設定
 */
export default function SettingsPage() {
  const [subscription, setSubscription] = useState<{ plan: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sub, r, domain] = await Promise.all([
        getCurrentHotelSubscription(),
        getCurrentUserHotelRole(),
        getHotelCustomDomain(),
      ]);
      setSubscription(sub);
      setRole(r ?? null);
      setCustomDomain(domain ?? "");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSaveDomain(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await setHotelCustomDomain(customDomain.trim() || null);
      setMessage("保存しました");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  const isBusiness = subscription?.plan === "business";
  const isOwner = role === "owner";

  return (
    <AuthGate>
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">設定</h1>

        <Card padding="lg">
          <h2 className="text-base font-semibold text-slate-900">カスタムドメイン（Business向け）</h2>
          <p className="mt-2 text-sm text-slate-500">
            ご自身のドメイン（例: info.example.com）で案内ページを公開できます。Business プランでご利用いただけます。
          </p>
          {loading ? (
            <div className="mt-4 h-12 animate-pulse rounded-lg bg-slate-100" />
          ) : !isBusiness ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Business プランにアップグレードすると、カスタムドメインを設定できます。
            </p>
          ) : !isOwner ? (
            <p className="mt-4 text-sm text-slate-500">オーナーのみ設定できます</p>
          ) : (
            <form onSubmit={handleSaveDomain} className="mt-4 space-y-3">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="info.example.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
              />
              <p className="text-xs text-slate-500">
                DNS で CNAME レコードを設定し、当サービスのドメインを指してください。設定方法はサポートまでお問い合わせください。
              </p>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "保存中…" : "保存"}
              </button>
              {message && (
                <p className={`text-sm ${message.includes("失敗") ? "text-red-600" : "text-emerald-600"}`}>
                  {message}
                </p>
              )}
            </form>
          )}
        </Card>

        <Card padding="lg">
          <h2 className="text-base font-semibold text-slate-900">API（Business向け）</h2>
          <p className="mt-2 text-sm text-slate-500">
            ページの取得・更新を REST API で行えます。Business プランでご利用いただけます。
          </p>
          {!isBusiness ? (
            <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Business プランにアップグレードすると、API をご利用いただけます。
            </p>
          ) : (
            <div className="mt-4 space-y-2 font-mono text-xs text-slate-600">
              <p>GET /api/v1/pages — ページ一覧</p>
              <p>GET /api/v1/pages/[id] — ページ詳細（カード含む）</p>
              <p>PATCH /api/v1/pages/[id] — ページ更新</p>
              <p className="mt-2 text-slate-500">Authorization: Bearer &lt;セッショントークン&gt;</p>
            </div>
          )}
        </Card>
      </div>
    </AuthGate>
  );
}
