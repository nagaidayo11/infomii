"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppSettingsCard } from "@/components/app-shell/AppSettingsCard";
import { AppSettingsIconDelete } from "@/components/app-shell/icons/AppSettingsIcons";
import { useAppDialog } from "@/components/app-shell/AppDialogProvider";
import { useClientShell } from "@/components/app-shell/useClientShell";
import { deleteCurrentUserAccount } from "@/lib/account-api";
import { withAppClientQuery } from "@/lib/app-href";

export function AppSettingsAccountDeleteSection() {
  const { isAppShell } = useClientShell();
  const { confirm, prompt } = useAppDialog();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (busy) return;

    const ok = isAppShell
      ? await confirm({
          title: "アカウントを削除",
          message:
            "アカウントを削除すると、ワークスペースのデータにアクセスできなくなります。この操作は取り消せません。続行しますか？",
          confirmLabel: "続行",
          destructive: true,
        })
      : window.confirm(
          "アカウントを削除すると、ワークスペースのデータにアクセスできなくなります。\nこの操作は取り消せません。続行しますか？",
        );
    if (!ok) return;

    const typed = isAppShell
      ? await prompt({
          title: "最終確認",
          message: "確認のため「削除」と入力してください",
          placeholder: "削除",
          confirmLabel: "削除する",
          validate: (value) => (value === "削除" ? null : "入力が一致しませんでした。"),
        })
      : window.prompt("確認のため「削除」と入力してください");

    if (typed !== "削除") {
      if (typed != null && !isAppShell) setError("入力が一致しませんでした。");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await deleteCurrentUserAccount();
      router.replace(withAppClientQuery("/login"));
    } catch (e) {
      setError((e as Error).message || "アカウント削除に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  const deleteButton = (
    <button
      type="button"
      className={
        "app-settings-danger-btn app-pressable w-full px-4 py-3.5 text-center text-base font-semibold disabled:opacity-60" +
        (isAppShell ? " flex items-center justify-center gap-2.5" : "")
      }
      onClick={() => void handleDelete()}
      disabled={busy}
    >
      {isAppShell ? <AppSettingsIconDelete size={22} /> : null}
      <span>{busy ? "削除中…" : "アカウントを削除"}</span>
    </button>
  );

  if (isAppShell) {
    return (
      <section className="app-settings-danger app-shell-card overflow-hidden">
        {error ? <p className="px-4 py-2 text-sm text-rose-700">{error}</p> : null}
        {deleteButton}
      </section>
    );
  }

  return (
    <AppSettingsCard className="app-settings-danger overflow-hidden" padding="none">
      <div className="px-4 py-3">
        <h2 className="text-base font-semibold text-rose-800">アカウントを削除</h2>
        <p className="mt-1 text-sm leading-relaxed text-rose-900/80">
          ログイン情報とプロフィールを削除します。オーナーのみのワークスペースは関連データごと削除されます。
          有料プラン契約中や他メンバーがいる場合は先に解約・権限移譲が必要です。
        </p>
      </div>
      {error ? <p className="px-4 pb-2 text-sm text-rose-700">{error}</p> : null}
      {deleteButton}
    </AppSettingsCard>
  );
}
