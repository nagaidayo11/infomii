"use client";

import { PageHelp } from "@/components/help/PageHelp";
import { PAGE_HELP } from "@/lib/page-help-content";

/** Team page help: overview + role permissions. */
export function TeamRolePermissionsHelp({ className = "" }: { className?: string }) {
  const help = PAGE_HELP.team;
  const roles = [
    { title: "オーナー", body: "メンバー管理 / 承認 / 招待管理 / 履歴確認" },
    { title: "管理者", body: "承認 / 招待管理 / メンバー管理（オーナー除く）" },
    { title: "編集担当", body: "編集 / 公開申請" },
    { title: "閲覧担当", body: "閲覧のみ" },
  ] as const;

  return (
    <PageHelp
      className={className}
      title={help.title}
      description={help.description}
      items={[...help.items]}
      label="チーム機能の説明"
      wide
    >
      <p className="text-[11px] font-medium text-slate-500">ロールの権限</p>
      <div className="mt-1.5 grid gap-2">
        {roles.map((role) => (
          <div
            key={role.title}
            className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2"
          >
            <p className="text-xs font-semibold text-slate-800">{role.title}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{role.body}</p>
          </div>
        ))}
      </div>
    </PageHelp>
  );
}
