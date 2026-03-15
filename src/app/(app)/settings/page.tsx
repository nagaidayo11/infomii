"use client";

import { Card } from "@/components/ui/Card";

/**
 * 設定ページ — アカウント・施設設定
 * New SaaS design: rounded-xl, soft shadows.
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card padding="lg" className="max-w-2xl">
        <h2 className="text-base font-semibold text-slate-900">設定</h2>
        <p className="mt-2 text-sm text-slate-500">
          アカウント・施設の設定は今後利用可能になります。
        </p>
      </Card>
    </div>
  );
}
