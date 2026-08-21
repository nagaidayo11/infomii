"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { isOpsAdminUser } from "@/lib/ops-auth";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { PageHelp } from "@/components/help/PageHelp";

type GrowthSnapshot = {
  generatedAt: string;
  authUsers: number;
  authUsers7d: number;
  authUsers28d: number;
  likelyTestUsers: number;
  realCustomersEstimate: number;
  hotels: number;
  hotels28d: number;
  hotelsWithMembership: number;
  informations: number;
  publishedPages: number;
  publishedUpdated28d: number;
  editorPages: number;
  subscriptions: number;
  planCounts: { free: number; pro: number; business: number; other: number };
  paidSubscriptions: number;
  notes: string[];
};

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default function DashboardGrowthPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<GrowthSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const allowed = Boolean(user && isOpsAdminUser(user));

  const load = useCallback(async () => {
    if (!user || !isOpsAdminUser(user)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const client = getBrowserSupabaseClient();
      const {
        data: { session },
      } = (await client?.auth.getSession()) ?? { data: { session: null } };
      const token = session?.access_token;
      if (!token) throw new Error("セッションがありません");
      const res = await fetch("/api/ops/growth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json()) as GrowthSnapshot & { message?: string };
      if (!res.ok) throw new Error(json.message || "取得に失敗しました");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "取得に失敗しました");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  if (authLoading || loading) {
    return (
      <main className="app-main-container py-8">
        <p className="text-sm text-slate-600">読み込み中…</p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="app-main-container py-8">
        <h1 className="text-xl font-semibold text-slate-900">成長指標</h1>
        <p className="mt-2 text-sm text-slate-600">このページは運用管理者のみ利用できます。</p>
      </main>
    );
  }

  return (
    <main className="app-main-container space-y-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">成長指標</h1>
          <p className="mt-1 text-sm text-slate-600">
            週次で見る実顧客・公開・課金のスナップショット（ops admin）
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="app-button-native rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          再読み込み
        </button>
      </div>

      <PageHelp
        title="見方"
        description="Authユーザーはテスト除外の見積もりも併記。施設数はデモ含むため、所属付き施設数を優先してください。有料は subscriptions の plan 集計です。"
      />

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      ) : null}

      {data ? (
        <>
          <p className="text-xs text-slate-500">
            更新: {new Date(data.generatedAt).toLocaleString("ja-JP")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="登録ユーザー（Auth）"
              value={data.authUsers}
              hint={`テストらしき除外見積: ${data.realCustomersEstimate}（除外${data.likelyTestUsers}）`}
            />
            <StatCard label="新規登録 7日 / 28日" value={`${data.authUsers7d} / ${data.authUsers28d}`} />
            <StatCard
              label="所属付き施設"
              value={data.hotelsWithMembership}
              hint={`hotels 全体 ${data.hotels}（デモ含む）`}
            />
            <StatCard
              label="公開ページ"
              value={data.publishedPages}
              hint={`28日更新 ${data.publishedUpdated28d} · 下書き含め情報 ${data.informations}`}
            />
            <StatCard label="エディタ pages" value={data.editorPages} />
            <StatCard
              label="有料サブスク"
              value={data.paidSubscriptions}
              hint={`Free ${data.planCounts.free} / Pro ${data.planCounts.pro} / Biz ${data.planCounts.business}`}
            />
            <StatCard label="施設 新規28日" value={data.hotels28d} />
            <StatCard label="subscriptions 行" value={data.subscriptions} />
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            {data.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </>
      ) : null}
    </main>
  );
}
