"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import {
  createHotelInvite,
  listCurrentHotelInvites,
  redeemHotelInvite,
  revokeHotelInvite,
  type HotelInvite,
  type HotelMember,
} from "@/lib/storage";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { FadeIn } from "@/components/motion";

export default function TeamPage() {
  const [members, setMembers] = useState<HotelMember[]>([]);
  const [invites, setInvites] = useState<HotelInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("editor");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: { session } } = await supabase?.auth.getSession() ?? { data: { session: null } };
      const token = session?.access_token;
      const [invitesData, membersRes] = await Promise.all([
        listCurrentHotelInvites(),
        token
          ? fetch("/api/team/members", {
              headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json())
          : Promise.resolve({ members: [] }),
      ]);
      setInvites(invitesData);
      setMembers(Array.isArray(membersRes.members) ? membersRes.members : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreateInvite() {
    setCreating(true);
    setError(null);
    try {
      await createHotelInvite(inviteRole);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "招待コードの発行に失敗しました");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(inviteId: string) {
    try {
      await revokeHotelInvite(inviteId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "無効化に失敗しました");
    }
  }

  async function handleRemoveMember(userId: string) {
    setRemovingId(userId);
    setError(null);
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: { session } } = await supabase?.auth.getSession() ?? { data: { session: null } };
      const token = session?.access_token;
      if (!token) {
        setError("ログインが必要です");
        return;
      }
      const res = await fetch("/api/team/members/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "削除に失敗しました");
        return;
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました");
    } finally {
      setRemovingId(null);
    }
  }

  const isOwner = members.some((m) => m.role === "owner" && m.userId === currentUserId);

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    const code = redeemCode.trim().toUpperCase();
    if (!code) return;
    setRedeeming(true);
    setError(null);
    try {
      await redeemHotelInvite(code);
      setRedeemCode("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "招待コードの適用に失敗しました");
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <AuthGate>
      <div className="mx-auto max-w-2xl space-y-8">
        <FadeIn>
          <header>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">チーム・招待</h1>
            <p className="mt-1 text-sm text-slate-500">
              施設のメンバーを招待し、編集権限または閲覧権限を付与できます。
            </p>
          </header>
        </FadeIn>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* 招待コードで参加 */}
        <FadeIn>
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <h2 className="text-base font-semibold text-slate-900">招待コードで参加</h2>
            <p className="mt-1 text-sm text-slate-500">
              招待コードを受け取った場合、ここで入力して施設に参加できます。
            </p>
            <form onSubmit={handleRedeem} className="mt-4 flex gap-2">
              <input
                type="text"
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="例: ABCD1234"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono uppercase placeholder:normal-case placeholder:text-slate-400"
                maxLength={12}
              />
              <button
                type="submit"
                disabled={redeeming || !redeemCode.trim()}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
              >
                {redeeming ? "適用中…" : "参加する"}
              </button>
            </form>
          </section>
        </FadeIn>

        {/* 招待コード発行 */}
        <FadeIn>
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <h2 className="text-base font-semibold text-slate-900">招待コードを発行</h2>
            <p className="mt-1 text-sm text-slate-500">
              コードを共有すると、相手がログイン後に施設に参加できます。
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900"
              >
                <option value="editor">編集可</option>
                <option value="viewer">閲覧のみ</option>
              </select>
              <button
                type="button"
                onClick={handleCreateInvite}
                disabled={creating}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
              >
                {creating ? "発行中…" : "招待コードを発行"}
              </button>
            </div>
          </section>
        </FadeIn>

        {/* 発行済み招待 */}
        <FadeIn>
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <h2 className="text-base font-semibold text-slate-900">発行済み招待コード</h2>
            {loading ? (
              <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
            ) : invites.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">まだ招待コードは発行されていません</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <code className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-semibold text-slate-800">
                        {inv.code}
                      </code>
                      <span className="text-xs text-slate-500">
                        {inv.role === "viewer" ? "閲覧" : "編集"} · {inv.consumedAt ? "使用済み" : "有効"}
                      </span>
                    </div>
                    {inv.isActive && !inv.consumedAt && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(inv.id)}
                        className="text-xs font-medium text-slate-500 hover:text-red-600"
                      >
                        無効化
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </FadeIn>

        {/* メンバー一覧 */}
        <FadeIn>
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <h2 className="text-base font-semibold text-slate-900">メンバー</h2>
            {loading ? (
              <div className="mt-4 h-32 animate-pulse rounded-xl bg-slate-100" />
            ) : (
              <ul className="mt-4 space-y-2">
                {members.map((m) => (
                  <li
                    key={m.userId}
                    className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{m.email ?? "（メール未取得）"}</p>
                      <p className="text-xs text-slate-500">
                        {m.role === "owner" ? "オーナー" : m.role === "viewer" ? "閲覧のみ" : "編集可"}
                      </p>
                    </div>
                    {m.role !== "owner" && isOwner && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.userId)}
                        disabled={removingId === m.userId}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {removingId === m.userId ? "削除中…" : "削除"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </FadeIn>
      </div>
    </AuthGate>
  );
}
