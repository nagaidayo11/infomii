/** First-run setup checklist for web dashboard (localStorage dismiss). */

export const SETUP_CHECKLIST_DISMISS_KEY = "infomii-setup-checklist-dismissed";

export type SetupStepId = "facility_name" | "create_page" | "publish_page" | "qr_setup";

export type SetupStep = {
  id: SetupStepId;
  label: string;
  description: string;
  href: string;
  done: boolean;
};

export function isDefaultHotelName(name: string): boolean {
  const trimmed = name.trim();
  if (!trimmed || trimmed === "My Store") return true;
  return / Store$/.test(trimmed);
}

export function buildDashboardSetupSteps(input: {
  hotelName: string;
  pageCount: number;
  publishedCount: number;
  qrViews7d: number;
  canEdit: boolean;
}): SetupStep[] {
  if (!input.canEdit) return [];

  return [
    {
      id: "facility_name",
      label: "施設名を設定",
      description: "サイドバーと公開ページに表示される名称です",
      href: "/settings",
      done: !isDefaultHotelName(input.hotelName),
    },
    {
      id: "create_page",
      label: "案内ページを作成",
      description: "テンプレートから始めると早いです",
      href: "/templates",
      done: input.pageCount >= 1,
    },
    {
      id: "publish_page",
      label: "ページを公開",
      description: "ゲストが閲覧できる状態にします",
      href: "/dashboard/pages",
      done: input.publishedCount >= 1,
    },
    {
      id: "qr_setup",
      label: "QRコードを設置",
      description: "フロントや客室から案内へ誘導できます",
      href: "/dashboard/qr",
      done: input.qrViews7d > 0,
    },
  ];
}

export function readSetupChecklistDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SETUP_CHECKLIST_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeSetupChecklistDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETUP_CHECKLIST_DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function setupProgress(steps: SetupStep[]): { done: number; total: number; allDone: boolean } {
  const total = steps.length;
  const done = steps.filter((s) => s.done).length;
  return { done, total, allDone: total > 0 && done === total };
}
