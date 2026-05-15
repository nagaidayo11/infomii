"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";

/**
 * UI 確認用: `true` のとき、承認待ちがなくてもナビの「チーム」とチーム画面の「公開申請」見出しに赤丸を出します。
 * 確認が終わったら `false` に戻してください。
 */
export const TEAM_PENDING_RED_DOT_PREVIEW = false;

/**
 * Business かつオーナー/管理者で承認待ち公開申請がある件数。取得失敗時は 0。
 * サイドバー等の軽い通知用（チーム画面本体とは別フェッチ）。
 */
export function usePendingPublishApprovalCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchPending() {
      try {
        const supabase = getBrowserSupabaseClient();
        if (!supabase) {
          if (!cancelled) setCount(0);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          if (!cancelled) setCount(0);
          return;
        }
        const res = await fetch("/api/team/publish-approvals?status=pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (!cancelled) setCount(0);
          return;
        }
        const data = (await res.json()) as { approvals?: unknown[] };
        const list = Array.isArray(data.approvals) ? data.approvals : [];
        if (!cancelled) setCount(list.length);
      } catch {
        if (!cancelled) setCount(0);
      }
    }

    void fetchPending();
    const onVisible = () => {
      if (document.visibilityState === "visible") void fetchPending();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return count;
}
