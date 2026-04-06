"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase-browser";
import { redeemHotelInvite } from "@/lib/storage";

export default function InviteRedeemPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = useMemo(() => (params?.code ?? "").trim().toUpperCase(), [params?.code]);
  const [message, setMessage] = useState("招待コードを確認しています…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!code) {
        setError("招待コードが不正です。");
        return;
      }
      const supabase = getBrowserSupabaseClient();
      const {
        data: { session },
      } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
      if (!session) {
        const next = encodeURIComponent(`/invite/${code}`);
        router.replace(`/login?next=${next}`);
        return;
      }
      try {
        await redeemHotelInvite(code);
        if (cancelled) return;
        setMessage("参加が完了しました。チーム画面へ移動します…");
        setTimeout(() => {
          router.replace("/dashboard/team");
        }, 500);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "招待コードの適用に失敗しました");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [code, router]);

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">チーム招待</h1>
        {error ? (
          <>
            <p className="mt-3 text-sm text-rose-700">{error}</p>
            <div className="mt-5 flex gap-2">
              <Link
                href="/dashboard/team"
                className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                チーム画面へ
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800"
              >
                ログインへ
              </Link>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-600">{message}</p>
        )}
      </div>
    </main>
  );
}
