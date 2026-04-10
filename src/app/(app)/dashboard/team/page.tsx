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

type PublishApprovalRow = {
  id: string;
  informationId: string;
  pageTitle: string;
  requestedByUserId: string;
  requestedByEmail?: string | null;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewComment: string | null;
};

async function readJsonSafe<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function TeamPage() {
  const [members, setMembers] = useState<HotelMember[]>([]);
  const [invites, setInvites] = useState<HotelInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [approvals, setApprovals] = useState<PublishApprovalRow[]>([]);
  const [approvalFilter, setApprovalFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [approvalActingId, setApprovalActingId] = useState<string | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [businessChecked, setBusinessChecked] = useState(false);

  const fetchApprovals = useCallback(
    async (
      token: string | null,
      filter: "pending" | "approved" | "rejected" | "all",
      businessEnabled: boolean,
    ) => {
      if (!token || !businessEnabled) {
        setApprovals([]);
        return;
      }
      const res = await fetch(`/api/team/publish-approvals?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = (await readJsonSafe<{ error?: string }>(res)) ?? {};
        // owner/admin以外は403になるため、画面では黙って空表示にする
        if (res.status !== 403) {
          setError(data.error ?? "公開申請一覧の取得に失敗しました");
        } else if ((data.error ?? "").includes("Businessプラン")) {
          // API側の判定を優先し、プラン表示と実機能の不整合を解消する
          setIsBusiness(false);
          setBusinessChecked(true);
        }
        setApprovals([]);
        return;
      }
      const data = (await readJsonSafe<{ approvals?: PublishApprovalRow[] }>(res)) ?? {};
      setApprovals(Array.isArray(data.approvals) ? data.approvals : []);
    },
    [],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: { session } } = await supabase?.auth.getSession() ?? { data: { session: null } };
      const token = session?.access_token;
      setCurrentUserId(session?.user?.id ?? null);
      const membersApi = token
        ? await fetch("/api/team/members", {
            headers: { Authorization: `Bearer ${token}` },
          }).then(async (r) => ({
            ok: r.ok,
            status: r.status,
            body: (await readJsonSafe<{ members?: HotelMember[]; error?: string }>(r)) ?? {},
          }))
        : { ok: false, status: 401, body: { members: [] as HotelMember[] } };
      const membersRes = membersApi.body ?? { members: [] };
      setMembers(Array.isArray(membersRes.members) ? membersRes.members : []);
      const isBiz = membersApi.ok;
      setIsBusiness(isBiz);
      setBusinessChecked(true);
      if (isBiz) {
        const invitesData = await listCurrentHotelInvites();
        setInvites(invitesData);
        await fetchApprovals(token ?? null, approvalFilter, true);
      } else {
        setInvites([]);
        setApprovals([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [approvalFilter, fetchApprovals]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!businessChecked || !isBusiness) return;
    const supabase = getBrowserSupabaseClient();
    void (async () => {
      const { data: { session } } = await supabase?.auth.getSession() ?? { data: { session: null } };
      await fetchApprovals(session?.access_token ?? null, approvalFilter, true);
    })();
  }, [approvalFilter, businessChecked, fetchApprovals, isBusiness]);

  async function handleCreateInvite() {
    if (!isBusiness) {
      setError("チーム招待はBusinessプランでご利用いただけます");
      return;
    }
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
    if (!isBusiness) {
      setError("チーム招待はBusinessプランでご利用いただけます");
      return;
    }
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
      const data = (await readJsonSafe<{ error?: string }>(res)) ?? {};
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

  const currentRole = members.find((m) => m.userId === currentUserId)?.role ?? null;
  const canManageMembers = currentRole === "owner" || currentRole === "admin";
  const canReviewApprovals = currentRole === "owner" || currentRole === "admin";

  async function handleApprovalAction(requestId: string, action: "approve" | "reject", comment = "") {
    setApprovalActingId(requestId);
    setError(null);
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: { session } } = await supabase?.auth.getSession() ?? { data: { session: null } };
      const token = session?.access_token;
      if (!token) {
        setError("ログインが必要です");
        return;
      }
      const res = await fetch("/api/team/publish-approvals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId, action, comment }),
      });
      const data = (await readJsonSafe<{ error?: string }>(res)) ?? {};
      if (!res.ok) {
        setError(data.error ?? "公開申請の処理に失敗しました");
        return;
      }
      await fetchApprovals(token, approvalFilter, true);
      if (action === "reject") {
        setRejectModalOpen(false);
        setRejectTargetId(null);
        setRejectComment("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "公開申請の処理に失敗しました");
    } finally {
      setApprovalActingId(null);
    }
  }

  async function submitRejectModal() {
    if (!rejectTargetId) return;
    await handleApprovalAction(rejectTargetId, "reject", rejectComment.trim());
  }

  function appendRejectTemplate(template: string) {
    setRejectComment((prev) => (prev.trim() ? `${prev.trim()}\n${template}` : template));
  }

  async function handleRedeem(e: React.FormEvent) {
    if (!isBusiness) {
      setError("招待コード参加はBusinessプランでご利用いただけます");
      return;
    }
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
      <div className="app-main-container space-y-6 sm:space-y-8">
        {businessChecked && !isBusiness ? (
          <FadeIn>
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <h2 className="text-base font-semibold">Businessプラン限定機能です</h2>
              <p className="mt-2 text-sm leading-relaxed">
                チーム招待・公開申請の承認フローは Business プランでご利用いただけます。
                現在のプランではこの画面の操作はできません。
              </p>
              <a
                href="/lp/saas#pricing"
                className="app-button-native mt-4 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium !text-white shadow-sm transition hover:bg-slate-800 hover:!text-white"
              >
                Businessプランを見る
              </a>
            </section>
          </FadeIn>
        ) : null}
        <FadeIn>
          <header className="app-page-header">
            <h1 className="app-page-title">チーム・招待</h1>
            <p className="app-page-subtitle">
              施設のメンバーを招待し、編集権限または閲覧権限を付与できます。
            </p>
          </header>
        </FadeIn>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {isBusiness ? (
          <>
            {/* 招待コードで参加 */}
            <FadeIn>
              <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-6">
                <h2 className="app-section-title">招待コードで参加</h2>
                <p className="mt-1 text-sm text-slate-500">
                  招待コードを受け取った場合、ここで入力して施設に参加できます。
                </p>
                <form onSubmit={handleRedeem} className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-2">
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    placeholder="例: ABCD1234"
                    className="min-h-[44px] w-full flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-mono uppercase placeholder:normal-case placeholder:text-slate-400"
                    maxLength={12}
                  />
                  <button
                    type="submit"
                    disabled={redeeming || !redeemCode.trim()}
                    className="app-button-native min-h-[44px] w-full shrink-0 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto"
                  >
                    {redeeming ? "適用中…" : "参加する"}
                  </button>
                </form>
              </section>
            </FadeIn>

            {/* 招待コード発行 */}
            <FadeIn>
              <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-6">
                <h2 className="app-section-title">招待コードを発行</h2>
                <p className="mt-1 text-sm text-slate-500">
                  コードを共有すると、相手がログイン後に施設に参加できます。
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as "admin" | "editor" | "viewer")}
                    className="min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 sm:w-auto"
                  >
                    <option value="admin">管理者（承認・メンバー管理）</option>
                    <option value="editor">編集可</option>
                    <option value="viewer">閲覧のみ</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleCreateInvite}
                    disabled={creating}
                    className="app-button-native min-h-[44px] w-full rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60 sm:w-auto"
                  >
                    {creating ? "発行中…" : "招待コードを発行"}
                  </button>
                </div>
              </section>
            </FadeIn>

            {/* 発行済み招待 */}
            <FadeIn>
              <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-6">
            <h2 className="app-section-title">発行済み招待コード</h2>
            {loading ? (
              <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
            ) : invites.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">まだ招待コードは発行されていません</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {invites.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <code className="w-fit rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-semibold text-slate-800">
                        {inv.code}
                      </code>
                      <span className="text-xs text-slate-500">
                        {inv.role === "viewer" ? "閲覧" : inv.role === "admin" ? "管理者" : "編集"} · {inv.consumedAt ? "使用済み" : "有効"}
                        {!inv.consumedAt && (
                          <span className="ml-2 text-[11px] text-slate-400">
                            / 招待リンク: {typeof window !== "undefined" ? `${window.location.origin}/invite/${inv.code}` : `/invite/${inv.code}`}
                          </span>
                        )}
                      </span>
                    </div>
                    {inv.isActive && !inv.consumedAt && (
                      <button
                        type="button"
                        onClick={() => handleRevoke(inv.id)}
                        disabled={!isBusiness}
                        className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:min-h-0 sm:w-auto sm:border-0 sm:bg-transparent sm:py-1 sm:text-xs"
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
              <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-6">
            <h2 className="app-section-title">メンバー</h2>
            {loading ? (
              <div className="mt-4 h-32 animate-pulse rounded-xl bg-slate-100" />
            ) : (
              <ul className="mt-4 space-y-2">
                {members.map((m) => (
                  <li
                    key={m.userId}
                    className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="break-all font-medium text-slate-800">{m.email ?? "（メール未取得）"}</p>
                      <p className="text-xs text-slate-500">
                        {m.role === "owner"
                          ? "オーナー"
                          : m.role === "admin"
                            ? "管理者"
                            : m.role === "viewer"
                              ? "閲覧のみ"
                              : "編集可"}
                      </p>
                    </div>
                    {m.role !== "owner" && canManageMembers && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(m.userId)}
                        disabled={removingId === m.userId}
                        className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:min-h-0 sm:w-auto sm:border-0 sm:bg-transparent sm:py-1.5 sm:text-xs"
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
            {/* 公開申請 */}
            <FadeIn>
              <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="app-section-title">公開申請</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    editor からの公開申請を確認し、承認/却下できます（owner/adminのみ）。
                  </p>
                </div>
                <select
                  value={approvalFilter}
                  onChange={(e) => setApprovalFilter(e.target.value as "pending" | "approved" | "rejected" | "all")}
                  className="min-h-[40px] rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                >
                  <option value="pending">承認待ち</option>
                  <option value="approved">承認済み</option>
                  <option value="rejected">却下済み</option>
                  <option value="all">すべて</option>
                </select>
              </div>
              {loading ? (
                <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
              ) : approvals.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">該当する公開申請はありません</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {approvals.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          {row.pageTitle || "（タイトル未設定）"}
                        </p>
                        <span
                          className={
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium " +
                            (row.status === "pending"
                              ? "bg-amber-50 text-amber-800"
                              : row.status === "approved"
                                ? "bg-emerald-50 text-emerald-800"
                                : "bg-rose-50 text-rose-700")
                          }
                        >
                          {row.status === "pending" ? "承認待ち" : row.status === "approved" ? "承認済み" : "却下"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        申請日時: {new Date(row.requestedAt).toLocaleString("ja-JP")}
                        {row.reviewedAt ? ` / 処理日時: ${new Date(row.reviewedAt).toLocaleString("ja-JP")}` : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        申請者: {row.requestedByEmail?.trim() ? row.requestedByEmail : row.requestedByUserId}
                      </p>
                      {row.reviewComment ? (
                        <p className="text-xs text-slate-500">コメント: {row.reviewComment}</p>
                      ) : null}
                      {canReviewApprovals && row.status === "pending" && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={approvalActingId === row.id}
                            onClick={() => void handleApprovalAction(row.id, "approve")}
                            className="app-button-native min-h-[40px] rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                          >
                            承認して公開
                          </button>
                          <button
                            type="button"
                            disabled={approvalActingId === row.id}
                            onClick={() => {
                              setRejectTargetId(row.id);
                              setRejectComment("");
                              setRejectModalOpen(true);
                            }}
                            className="app-button-native min-h-[40px] rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-700 shadow-sm hover:bg-rose-50 disabled:opacity-50"
                          >
                            却下
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              </section>
            </FadeIn>
          </>
        ) : null}
      </div>
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">公開申請を却下</h3>
            <p className="mt-1 text-sm text-slate-500">
              却下理由を入力できます（任意）。入力内容は履歴に記録されます。
            </p>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              rows={4}
              placeholder="例: 住所表記に誤りがあるため修正後に再申請してください"
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                "文言が未確定です。確定後に再申請してください。",
                "画像が未設定です。画像反映後に再申請してください。",
                "営業時間情報が不足しています。追記後に再申請してください。",
                "リンク先URLが未設定です。設定後に再申請してください。",
              ].map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => appendRejectTemplate(template)}
                  className="app-button-native rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 shadow-sm hover:bg-slate-100"
                >
                  追記: {template.slice(0, 12)}...
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectTargetId(null);
                  setRejectComment("");
                }}
                className="app-button-native rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={!rejectTargetId || approvalActingId === rejectTargetId}
                onClick={() => void submitRejectModal()}
                className="app-button-native rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
              >
                却下を確定
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthGate>
  );
}
