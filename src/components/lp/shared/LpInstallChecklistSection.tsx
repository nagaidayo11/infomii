"use client";

import { Section, Card } from "@/components/ui";
import { ScrollReveal } from "@/components/motion";

type ChecklistStep = {
  title: string;
  description: string;
};

const CHECKLIST_STEPS: ChecklistStep[] = [
  {
    title: "まずは「減らしたいこと」を決める",
    description: "口頭説明・貼り紙待ち・問い合わせのどれを減らしたいかを最初に揃えます。",
  },
  {
    title: "施設タイプのテンプレから開始",
    description: "business / spa / resort の型をベースに、施設に合わせて必要なブロックだけ整えます。",
  },
  {
    title: "現場の情報を差し替える",
    description: "写真・営業時間・ルール文言など、ゲストが迷う箇所を優先して入力します。",
  },
  {
    title: "公開前にゲスト目線で確認",
    description: "プレビューで表示順と読みやすさを確認。必要ならタイトル/導線を調整します。",
  },
  {
    title: "公開URLをQRにして設置",
    description: "客室カード・フロント・施設入口など、迷う場所にQRを置いて導線を一本化します。",
  },
  {
    title: "多言語・チーム運用（必要なら）",
    description: "更新担当や権限、対応言語を整えて、現場が回せる体制にします。",
  },
  {
    title: "1週間回して改善する",
    description: "閲覧されているブロックから改善ポイントを見つけ、上に出す/文言を直します。",
  },
];

export function LpInstallChecklistSection() {
  return (
    <Section id="install-checklist" kicker="導入チェックリスト" title="今日から運用を回す7つ" description="迷わない順番で整えるだけ。まずは1ページ公開→QR設置→現場運用→改善の流れです。">
      <ScrollReveal intensity="subtle">
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CHECKLIST_STEPS.map((step, idx) => (
            <li key={step.title}>
              <Card className="h-full border-emerald-100/80 bg-white/70">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 grid h-10 w-10 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700"
                      aria-hidden
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold leading-snug text-slate-900">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      </ScrollReveal>
    </Section>
  );
}

