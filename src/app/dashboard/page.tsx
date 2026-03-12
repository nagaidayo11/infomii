"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/auth-gate";
import { useAuth } from "@/components/auth-provider";
import AppToast from "@/components/app-toast";
import MobileTemplatePreview from "@/components/mobile-template-preview";
import {
  buildPublicUrl,
  createBlankInformation,
  createHotelInvite,
  createStripePortalSession,
  createStripeCheckoutSession,
  createInformationFromTemplate,
  deleteInformation,
  ensureUserHotelScope,
  getDashboardBootstrapData,
  getInformation,
  getCurrentHotelSubscription,
  getSharedTemplateFavorites,
  getCurrentHotelInviteMetrics,
  getCurrentHotelViewMetrics,
  getOnboardingFunnel7d,
  getOpsHealthSnapshot,
  listCurrentHotelInvites,
  listCurrentHotelAuditLogs,
  revokeHotelInvite,
  runOpsRecoveryAction,
  runOpsAlertTest,
  runOpsWeeklyReport,
  setSharedTemplateFavorite,
  trackBillingResumeClick,
  trackDormancyNoticeSent,
  trackDormancyNoticeReaction,
  trackDormancyNoticeVariantCopy,
  trackOnboardingWizardEvent,
  trackProBlockerReason,
  trackRestartWinnerLocked,
  trackOpsRestartFlowClick,
  trackUpgradeClick,
  type HotelAuditLog,
  type HotelInvite,
  type HotelInviteMetrics,
  type OnboardingFunnel7d,
  type HotelSubscription,
  type HotelViewMetrics,
  type OpsHealthSnapshot,
  type SubscriptionStatus,
  updateCurrentHotelName,
  updateInformation,
} from "@/lib/storage";
import type { Information, InformationBlock } from "@/types/information";
import {
  DashboardHeaderBar,
  DashboardPageList,
  DashboardQrAnalytics,
} from "@/components/dashboard";
import { INDUSTRY_PRESET_LABELS, type IndustryPreset, type StarterTemplate, starterTemplates } from "@/lib/templates";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value: string | null): string {
  if (!value) {
    return "未設定";
  }
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function formatAuditDate(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toTimestamp(value: string): number {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getStatusLabel(status: SubscriptionStatus): string {
  if (status === "active") {
    return "有効";
  }
  if (status === "trialing") {
    return "トライアル中";
  }
  if (status === "past_due") {
    return "支払い失敗";
  }
  return "解約済み";
}

function clampPercent(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return value;
}

function getTemplateBlockLabel(type: string): string {
  if (type === "title") return "タイトル";
  if (type === "heading") return "見出し";
  if (type === "paragraph") return "本文";
  if (type === "image") return "画像";
  if (type === "icon") return "アイコン";
  if (type === "iconRow") return "導線アイコン";
  if (type === "section") return "セクション";
  if (type === "columns") return "2カラム";
  if (type === "cta") return "CTA";
  if (type === "badge") return "バッジ";
  if (type === "hours") return "営業時間";
  if (type === "pricing") return "料金表";
  if (type === "quote") return "引用";
  if (type === "checklist") return "チェックリスト";
  if (type === "gallery") return "ギャラリー";
  if (type === "columnGroup") return "カラムグループ";
  if (type === "divider") return "区切り線";
  if (type === "space") return "余白";
  return "ブロック";
}

function DashboardTemplateScreenPreview({ blocks }: { blocks?: InformationBlock[] }) {
  const previewBlocks = blocks ?? [];
  if (previewBlocks.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 h-[34rem] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 sm:h-[40rem]">
      <div className="template-preview-scroll h-full overflow-y-auto pr-1">
        <MobileTemplatePreview blocks={previewBlocks} className="min-h-[900px] p-5" />
      </div>
    </div>
  );
}

type TemplatePurposeFilter = "all" | "checkin" | "facility" | "breakfast" | "bath";
type TemplateSortMode = "recommended" | "latest";
type TemplateScene = "front" | "guestroom" | "facility";
type FacilityType = "business" | "resort" | "spa";
type TemplateGrouping = "industry" | "scene";
type HotelScale = "small" | "mid" | "large";

const TEMPLATE_PURPOSE_LABELS: Record<TemplatePurposeFilter, string> = {
  all: "すべて",
  checkin: "チェックイン",
  facility: "館内案内",
  breakfast: "朝食",
  bath: "温浴",
};
const TEMPLATE_SCENE_LABELS: Record<TemplateScene, string> = {
  front: "フロント",
  guestroom: "客室",
  facility: "館内",
};
const FACILITY_LABELS: Record<FacilityType, string> = {
  business: "ビジネス",
  resort: "リゾート",
  spa: "温浴・スパ",
};
const SCALE_LABELS: Record<HotelScale, string> = {
  small: "小規模（~59室）",
  mid: "中規模（60-149室）",
  large: "大規模（150室~）",
};

const SCALE_GUIDE: Record<HotelScale, string[]> = {
  small: [
    "チェックイン導線テンプレを先に公開",
    "問い合わせ先を1画面目に固定",
    "QR配布後に当日中の更新ルールを決める",
  ],
  mid: [
    "館内設備テンプレをフロント導線とセット公開",
    "朝食/温浴の時間変更導線を事前に用意",
    "担当者2名以上で更新手順を共通化",
  ],
  large: [
    "入口ハブページ + 子ページ導線を先に構成",
    "繁忙時間帯向けの案内差し替えテンプレを準備",
    "運用センターで速度/休眠通知を週次で確認",
  ],
};
const SCALE_PRIMARY_PURPOSE: Record<HotelScale, TemplatePurposeFilter> = {
  small: "checkin",
  mid: "facility",
  large: "bath",
};

function getLowUsageTemplateImprovementSuggestion(industry: IndustryPreset): string {
  if (industry === "hotel_business") {
    return "フロントQ&Aと深夜到着導線を冒頭に追加すると利用率が上がりやすいです。";
  }
  if (industry === "hotel_resort") {
    return "滞在体験（アクティビティ/プール）を先頭に出すと選択率が改善しやすいです。";
  }
  if (industry === "ryokan") {
    return "温浴ルールと混雑回避導線をCTA直下に置くと再利用率が上がりやすいです。";
  }
  if (industry === "restaurant") {
    return "営業時間と注文導線を1画面目に集約すると離脱を抑えられます。";
  }
  if (industry === "cafe") {
    return "混雑時間帯と席利用ルールを短文で追加すると効果的です。";
  }
  if (industry === "salon") {
    return "予約変更導線と注意事項をセットで提示すると問い合わせ削減につながります。";
  }
  if (industry === "clinic") {
    return "当日の持ち物と受付導線を冒頭固定すると初回利用率が上がりやすいです。";
  }
  return "主要導線を最上部に配置し、1クリックCTAを追加すると改善しやすいです。";
}

function inferFacilityType(hotelName: string): FacilityType {
  const normalized = hotelName.toLowerCase();
  if (
    normalized.includes("温泉") ||
    normalized.includes("温浴") ||
    normalized.includes("浴場") ||
    normalized.includes("スパ") ||
    normalized.includes("spa")
  ) {
    return "spa";
  }
  if (
    normalized.includes("リゾート") ||
    normalized.includes("resort") ||
    normalized.includes("旅館") ||
    normalized.includes("ryokan")
  ) {
    return "resort";
  }
  return "business";
}

function mapFacilityToIndustry(type: FacilityType): IndustryPreset {
  if (type === "resort") {
    return "hotel_resort";
  }
  if (type === "spa") {
    return "ryokan";
  }
  return "hotel_business";
}

function inferHotelScale(roomCount: number): HotelScale {
  if (roomCount >= 150) {
    return "large";
  }
  if (roomCount >= 60) {
    return "mid";
  }
  return "small";
}

function getRecommendedPurposeByScale(scale: HotelScale): TemplatePurposeFilter {
  if (scale === "small") {
    return "checkin";
  }
  if (scale === "mid") {
    return "facility";
  }
  return "bath";
}

function getTemplateRequirementHints(template: StarterTemplate): { required: string[]; recommended: string[] } {
  const blockTypes = new Set((template.blocks ?? []).map((block) => block.type));
  const required = ["タイトル", "公開導線（CTA）"];
  const recommended: string[] = [];
  if (blockTypes.has("hours")) {
    required.push("営業時間/提供時間");
  }
  if (blockTypes.has("iconRow")) {
    recommended.push("導線アイコンの遷移先URL");
  }
  if (blockTypes.has("pricing")) {
    recommended.push("料金・補足条件");
  }
  if (blockTypes.has("image") || blockTypes.has("gallery")) {
    recommended.push("画像の軽量化（WebP推奨）");
  }
  if (blockTypes.has("columns") || blockTypes.has("columnGroup")) {
    recommended.push("比較カラムの数値/条件");
  }
  if (recommended.length === 0) {
    recommended.push("連絡先・受付時間");
  }
  return { required, recommended };
}

function getTemplateSlaMs(template: StarterTemplate): number {
  const text = `${template.title}\n${template.body}`.toLowerCase();
  if (text.includes("チェックイン") || text.includes("深夜到着")) {
    return 2200;
  }
  if (text.includes("温浴") || text.includes("温泉") || text.includes("スパ")) {
    return 2400;
  }
  if (text.includes("アクティビティ") || text.includes("プール")) {
    return 2500;
  }
  return 2300;
}

function getTemplateQualityScore(template: StarterTemplate): { score: number; missing: string[] } {
  const blocks = template.blocks ?? [];
  const blockTypes = new Set(blocks.map((block) => block.type));
  const checks = [
    { ok: blockTypes.has("title") || blockTypes.has("heading"), label: "見出し" },
    { ok: blockTypes.has("cta"), label: "CTA" },
    { ok: blockTypes.has("hours") || blockTypes.has("pricing"), label: "時間/料金情報" },
    { ok: blockTypes.has("iconRow") || blockTypes.has("columnGroup") || blockTypes.has("columns"), label: "導線/比較情報" },
    { ok: blockTypes.has("image") || blockTypes.has("gallery"), label: "視覚要素" },
  ];
  const passed = checks.filter((entry) => entry.ok).length;
  const score = Math.round((passed / checks.length) * 100);
  return {
    score,
    missing: checks.filter((entry) => !entry.ok).map((entry) => entry.label),
  };
}

function detectTemplatePurposes(template: StarterTemplate): TemplatePurposeFilter[] {
  const text = `${template.title}\n${template.body}`.toLowerCase();
  const purposes = new Set<TemplatePurposeFilter>();

  if (
    text.includes("チェックイン") ||
    text.includes("チェックアウト") ||
    text.includes("深夜到着") ||
    text.includes("セルフチェックイン")
  ) {
    purposes.add("checkin");
  }
  if (
    text.includes("館内") ||
    text.includes("設備") ||
    text.includes("wi-fi") ||
    text.includes("アクセス") ||
    text.includes("案内")
  ) {
    purposes.add("facility");
  }
  if (
    text.includes("朝食") ||
    text.includes("お食事") ||
    text.includes("レストラン") ||
    text.includes("メニュー")
  ) {
    purposes.add("breakfast");
  }
  if (
    text.includes("大浴場") ||
    text.includes("貸切風呂") ||
    text.includes("温泉") ||
    text.includes("風呂") ||
    text.includes("スパ")
  ) {
    purposes.add("bath");
  }

  if (purposes.size === 0) {
    purposes.add("facility");
  }

  return Array.from(purposes);
}

function detectTemplateScenes(template: StarterTemplate): TemplateScene[] {
  const text = `${template.title}\n${template.body}`.toLowerCase();
  const scenes = new Set<TemplateScene>();
  if (text.includes("チェックイン") || text.includes("フロント") || text.includes("到着")) {
    scenes.add("front");
  }
  if (text.includes("客室") || text.includes("ルーム") || text.includes("滞在")) {
    scenes.add("guestroom");
  }
  if (
    text.includes("館内") ||
    text.includes("設備") ||
    text.includes("大浴場") ||
    text.includes("朝食") ||
    text.includes("アクティビティ")
  ) {
    scenes.add("facility");
  }
  if (scenes.size === 0) {
    scenes.add("facility");
  }
  return Array.from(scenes);
}

function estimateTemplateInputCount(template: StarterTemplate): number {
  const blocks = template.blocks ?? [];
  if (blocks.length === 0) {
    const lines = template.body.split("\n").map((line) => line.trim()).filter(Boolean);
    return Math.max(3, Math.min(12, lines.length));
  }

  let count = 0;
  for (const block of blocks) {
    if (block.type === "title" || block.type === "heading" || block.type === "paragraph" || block.type === "section") {
      count += 1;
      continue;
    }
    if (block.type === "iconRow") {
      count += Math.max(1, block.iconItems?.length ?? 0);
      continue;
    }
    if (block.type === "hours") {
      count += Math.max(1, block.hoursItems?.length ?? 0);
      continue;
    }
    if (block.type === "pricing") {
      count += Math.max(1, block.pricingItems?.length ?? 0);
      continue;
    }
    if (block.type === "checklist") {
      count += Math.max(1, block.checklistItems?.length ?? 0);
      continue;
    }
    if (block.type === "gallery") {
      count += Math.max(1, block.galleryItems?.length ?? 0);
      continue;
    }
    if (block.type === "columnGroup") {
      count += Math.max(1, block.columnGroupItems?.length ?? 0);
      continue;
    }
    count += 1;
  }

  return Math.max(3, Math.min(24, count));
}

function estimateTemplateViewSeconds(template: StarterTemplate, inputCount: number): number {
  const textLength = `${template.title}\n${template.body}`.replace(/\s+/g, "").length;
  const seconds = Math.round(12 + inputCount * 2.6 + textLength / 22);
  return Math.max(18, Math.min(90, seconds));
}

function detectTemplatePublishWindow(template: StarterTemplate): "morning" | "daytime" | "night" {
  const text = `${template.title}\n${template.body}`.toLowerCase();
  if (text.includes("朝食") || text.includes("モーニング") || text.includes("朝")) {
    return "morning";
  }
  if (text.includes("深夜") || text.includes("夜") || text.includes("温浴") || text.includes("貸切風呂")) {
    return "night";
  }
  return "daytime";
}

function estimateTemplateOperators(inputCount: number): string {
  if (inputCount <= 8) {
    return "1人";
  }
  if (inputCount <= 14) {
    return "1-2人";
  }
  if (inputCount <= 20) {
    return "2-3人";
  }
  return "3人以上";
}

function getTemplateFailureProneDefaults(template: StarterTemplate): string[] {
  const text = `${template.title}\n${template.body}`.toLowerCase();
  const defaults: string[] = [];
  if (text.includes("チェックイン") || text.includes("チェックアウト")) {
    defaults.push("チェックイン/チェックアウト時間");
  }
  if (text.includes("温浴") || text.includes("大浴場") || text.includes("風呂")) {
    defaults.push("利用時間・注意事項");
  }
  if (text.includes("朝食") || text.includes("レストラン")) {
    defaults.push("会場・最終入場時刻");
  }
  defaults.push("問い合わせ先（TEL/メール）");
  return Array.from(new Set(defaults)).slice(0, 3);
}

const PUBLISH_WINDOW_LABELS = {
  morning: "朝（6:00-10:00）",
  daytime: "日中（10:00-18:00）",
  night: "夜間（18:00-24:00）",
} as const;

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/95 p-4 backdrop-blur shadow-[0_4px_12px_-10px_rgba(15,23,42,0.22)]">
      <p className="text-xs uppercase tracking-[0.12em] text-emerald-700">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </article>
  );
}

function SideNavButton(props: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`group relative flex h-11 w-11 items-center justify-center rounded-xl border text-slate-700 transition duration-200 ${
        props.active
          ? "border-emerald-400 bg-gradient-to-b from-emerald-400 to-emerald-500 text-white shadow-[0_10px_20px_-14px_rgba(16,185,129,0.65)]"
          : "border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700 hover:shadow-md"
      }`}
      title={props.label}
      aria-label={props.label}
    >
      {props.children}
      <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm group-hover:block">
        {props.label}
      </span>
    </button>
  );
}

type DashboardTab = "dashboard" | "create" | "project" | "ops";
type OpsActionFilter = "all" | "webhook" | "checkout" | "portal";
type ProjectStatusFilter = "all" | "published" | "draft";
type ProjectFileGroup = {
  hub: Information;
  pages: Information[];
};
type PendingDeleteBatch = {
  id: string;
  label: string;
  items: Information[];
  expiresAt: number;
};
const QUICKSTART_DISMISSED_KEY = "hotel-quickstart-dismissed-v1";
const DASHBOARD_TEMPLATE_FAVORITES_KEY = "dashboard-template-favorites-v1";
const WIZARD_RESUME_STORAGE_KEY = "dashboard-onboarding-wizard-resume-v1";
const OPS_PERF_SNAPSHOT_KEY = "ops-perf-snapshot-v1";
const LP_TEMPLATE_HANDOFF_KEY = "lp-template-handoff-v1";
const OPS_OWNER_EMAILS = new Set([
  "nagai9_119@ezweb.ne.jp",
  "nagaisoccer@gmail.com",
]);

type LpTemplateHandoff = {
  templateIndex?: unknown;
  templateTitle?: unknown;
  createdAt?: unknown;
};

function parseDashboardTab(value: string | null): DashboardTab | null {
  if (value === "dashboard" || value === "create" || value === "project" || value === "ops") {
    return value;
  }
  return null;
}

function normalizeProjectName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export default function DashboardPage() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [items, setItems] = useState<Information[]>([]);
  const [hotelName, setHotelName] = useState("");
  const [subscription, setSubscription] = useState<HotelSubscription | null>(null);
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [viewMetrics, setViewMetrics] = useState<HotelViewMetrics | null>(null);
  const [inviteMetrics, setInviteMetrics] = useState<HotelInviteMetrics | null>(null);
  const [invites, setInvites] = useState<HotelInvite[]>([]);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [onboardingFunnel, setOnboardingFunnel] = useState<OnboardingFunnel7d | null>(null);
  const [auditLogs, setAuditLogs] = useState<HotelAuditLog[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingOnboardingFunnel, setLoadingOnboardingFunnel] = useState(false);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState(false);
  const [loadingOpsHealth, setLoadingOpsHealth] = useState(false);
  const [opsHealth, setOpsHealth] = useState<OpsHealthSnapshot | null>(null);
  const [recoveringAction, setRecoveringAction] = useState<"ensure_scope" | "sync_subscription" | null>(null);
  const [sendingOpsTest, setSendingOpsTest] = useState(false);
  const [sendingWeeklyReport, setSendingWeeklyReport] = useState(false);
  const [pendingDeleteBatches, setPendingDeleteBatches] = useState<PendingDeleteBatch[]>([]);
  const [editingHotelName, setEditingHotelName] = useState(false);
  const [hotelNameDraft, setHotelNameDraft] = useState("");
  const [savingHotelName, setSavingHotelName] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [quickSearch, setQuickSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] = useState<ProjectStatusFilter>("all");
  const [industryFilter, setIndustryFilter] = useState<IndustryPreset | "all">("all");
  const [purposeFilter, setPurposeFilter] = useState<TemplatePurposeFilter>("all");
  const [templateSortMode, setTemplateSortMode] = useState<TemplateSortMode>("recommended");
  const [templateGrouping, setTemplateGrouping] = useState<TemplateGrouping>("industry");
  const [roomCountInput, setRoomCountInput] = useState("80");
  const [wizardVisible, setWizardVisible] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardQrDistributed, setWizardQrDistributed] = useState(false);
  const [wizardQrDistributedAt, setWizardQrDistributedAt] = useState<string | null>(null);
  const [wizardDropoffReason, setWizardDropoffReason] = useState<"manual_close" | "time_shortage" | "content_not_ready" | "other">("manual_close");
  const [wizardResume, setWizardResume] = useState<{ step: 1 | 2 | 3; updatedAt: string } | null>(null);
  const [reevaluatingTop3, setReevaluatingTop3] = useState(false);
  const [top3ReevaluatedAt, setTop3ReevaluatedAt] = useState<string | null>(null);
  const [perfSnapshot, setPerfSnapshot] = useState<{
    capturedAt: string;
    byPath: Array<{ path: string; lcpMs: number; inpMs: number; cls: number; samples: number }>;
  } | null>(null);
  const [lockingRestartWinner, setLockingRestartWinner] = useState(false);
  const [opsActionFilter, setOpsActionFilter] = useState<OpsActionFilter>("all");
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);
  const [creatingQuickPublish, setCreatingQuickPublish] = useState(false);
  const [previewTemplateIndex, setPreviewTemplateIndex] = useState<number | null>(null);
  const [favoriteTemplateIndices, setFavoriteTemplateIndices] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdownNow, setCountdownNow] = useState<number>(Date.now());
  const deleteTimersRef = useRef<Map<string, number>>(new Map());
  const autoSyncedRenewalRef = useRef(false);
  const industryAutoSelectionDoneRef = useRef(false);
  const lpTemplateAutoCreateRef = useRef(false);
  const [lpTemplateRetryCount, setLpTemplateRetryCount] = useState(0);
  const userEmail = user?.email?.trim().toLowerCase() ?? "";
  const canAccessOps = userEmail.length > 0 && OPS_OWNER_EMAILS.has(userEmail);
  const inferredFacilityType = useMemo<FacilityType>(() => inferFacilityType(hotelName), [hotelName]);
  const roomCount = useMemo(() => {
    const parsed = Number(roomCountInput);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 80;
    }
    return Math.round(parsed);
  }, [roomCountInput]);
  const hotelScale = useMemo(() => inferHotelScale(roomCount), [roomCount]);
  const recommendedPurposeByScale = useMemo(() => getRecommendedPurposeByScale(hotelScale), [hotelScale]);

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const params = new URLSearchParams(search);
    const requestedTab = parseDashboardTab(params.get("tab"));
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
    const billing = params.get("billing");
    if (billing === "success") {
      setSuccess("決済が完了しました。プラン情報を更新しています。");
    }
    if (billing === "cancel") {
      setError("決済はキャンセルされました。");
    }
    if (params.get("wizard") === "1") {
      setActiveTab("create");
      setWizardVisible(true);
      setWizardStep(1);
      setWizardQrDistributed(false);
      setWizardResume(null);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(WIZARD_RESUME_STORAGE_KEY);
      }
      void trackOnboardingWizardEvent("wizard_started", { step: 1 });
    }
    if ((billing || params.get("wizard") === "1") && typeof window !== "undefined") {
      params.delete("billing");
      params.delete("wizard");
      const next = params.toString();
      const nextUrl = `${window.location.pathname}${next ? `?${next}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(WIZARD_RESUME_STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { step?: unknown; updatedAt?: unknown };
      const step = parsed.step;
      const updatedAt = typeof parsed.updatedAt === "string" ? parsed.updatedAt : "";
      if ((step === 1 || step === 2 || step === 3) && updatedAt) {
        setWizardResume({ step, updatedAt });
      } else {
        window.localStorage.removeItem(WIZARD_RESUME_STORAGE_KEY);
      }
    } catch {
      window.localStorage.removeItem(WIZARD_RESUME_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (loading || !user || lpTemplateAutoCreateRef.current || typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("lp_template");
    const rawTitle = params.get("lp_template_title");
    let handoffTemplateIndex: number | null = null;
    let handoffTemplateTitle: string | null = null;
    if (!raw && !rawTitle) {
      const handoffRaw = window.localStorage.getItem(LP_TEMPLATE_HANDOFF_KEY);
      if (handoffRaw) {
        try {
          const parsed = JSON.parse(handoffRaw) as LpTemplateHandoff;
          const idx = Number(parsed.templateIndex);
          handoffTemplateIndex =
            Number.isInteger(idx) && idx >= 0 && idx < starterTemplates.length ? idx : null;
          handoffTemplateTitle =
            typeof parsed.templateTitle === "string" && parsed.templateTitle.trim()
              ? parsed.templateTitle
              : null;
        } catch {
          window.localStorage.removeItem(LP_TEMPLATE_HANDOFF_KEY);
        }
      }
    }
    if (!raw && !rawTitle && handoffTemplateIndex === null && !handoffTemplateTitle) {
      return;
    }
    const parsedTemplateIndex =
      raw !== null
        ? Number(raw)
        : handoffTemplateIndex !== null
          ? handoffTemplateIndex
          : NaN;
    const resolvedTemplateIndex =
      Number.isInteger(parsedTemplateIndex) && parsedTemplateIndex >= 0 && parsedTemplateIndex < starterTemplates.length
        ? parsedTemplateIndex
        : (rawTitle ?? handoffTemplateTitle)
          ? starterTemplates.findIndex((entry) => entry.title === (rawTitle ?? handoffTemplateTitle))
          : -1;
    if (resolvedTemplateIndex < 0 || resolvedTemplateIndex >= starterTemplates.length) {
      params.delete("lp_template");
      params.delete("lp_template_title");
      window.localStorage.removeItem(LP_TEMPLATE_HANDOFF_KEY);
      const next = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${next ? `?${next}` : ""}`);
      return;
    }
    lpTemplateAutoCreateRef.current = true;
    setActiveTab("create");
    setSuccess("テンプレートを複製中...");
    void (async () => {
      let created = false;
      try {
        const id = await createInformationFromTemplate(resolvedTemplateIndex);
        created = true;
        window.localStorage.removeItem(LP_TEMPLATE_HANDOFF_KEY);
        router.replace(`/editor/${id}?guide=start`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "新規作成に失敗しました");
        lpTemplateAutoCreateRef.current = false;
        if (lpTemplateRetryCount < 2) {
          setSuccess("テンプレート複製を再試行中...");
          window.setTimeout(() => {
            setLpTemplateRetryCount((prev) => prev + 1);
          }, 700);
        }
      } finally {
        if (created) {
          params.delete("lp_template");
          params.delete("lp_template_title");
          const next = params.toString();
          window.history.replaceState({}, "", `${window.location.pathname}${next ? `?${next}` : ""}`);
        }
      }
    })();
  }, [loading, router, user, lpTemplateRetryCount]);

  useEffect(() => {
    if (canAccessOps || activeTab !== "ops") {
      return;
    }
    setActiveTab("dashboard");
  }, [canAccessOps, activeTab]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        const boot = await getDashboardBootstrapData();
        if (mounted) {
          setHotelName(boot.hotelName);
          setHotelNameDraft(boot.hotelName);
          setSubscription(boot.subscription);
          setItems(boot.informations);
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : "一覧取得に失敗しました");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void run();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }
    let mounted = true;
    setLoadingMetrics(true);
    void getCurrentHotelViewMetrics()
      .then((metrics) => {
        if (!mounted) {
          return;
        }
        setViewMetrics(metrics);
      })
      .catch((e) => {
        if (!mounted) {
          return;
        }
        setError(e instanceof Error ? e.message : "分析データ取得に失敗しました");
      })
      .finally(() => {
        if (!mounted) {
          return;
        }
        setLoadingMetrics(false);
      });

    return () => {
      mounted = false;
    };
  }, [loading]);

  useEffect(() => {
    if (loading || !canAccessOps) {
      setOnboardingFunnel(null);
      setLoadingOnboardingFunnel(false);
      return;
    }
    let mounted = true;
    setLoadingOnboardingFunnel(true);
    void getOnboardingFunnel7d()
      .then((funnel) => {
        if (!mounted) {
          return;
        }
        setOnboardingFunnel(funnel);
      })
      .catch((e) => {
        if (!mounted) {
          return;
        }
        setError(e instanceof Error ? e.message : "オンボーディング指標の取得に失敗しました");
      })
      .finally(() => {
        if (!mounted) {
          return;
        }
        setLoadingOnboardingFunnel(false);
      });

    return () => {
      mounted = false;
    };
  }, [loading, canAccessOps]);

  useEffect(() => {
    if (loading) {
      return;
    }
    let mounted = true;
    setLoadingInvites(true);
    void Promise.all([listCurrentHotelInvites(20), getCurrentHotelInviteMetrics()])
      .then(([rows, metrics]) => {
        if (!mounted) {
          return;
        }
        setInvites(rows);
        setInviteMetrics(metrics);
      })
      .catch((e) => {
        if (!mounted) {
          return;
        }
        setError(e instanceof Error ? e.message : "招待情報の取得に失敗しました");
      })
      .finally(() => {
        if (!mounted) {
          return;
        }
        setLoadingInvites(false);
      });

    return () => {
      mounted = false;
    };
  }, [loading]);

  useEffect(() => {
    if (loading || autoSyncedRenewalRef.current) {
      return;
    }
    const needsAutoSync =
      subscription?.plan === "pro" &&
      (subscription.status === "active" || subscription.status === "trialing") &&
      !subscription.currentPeriodEnd;
    if (!needsAutoSync) {
      return;
    }
    autoSyncedRenewalRef.current = true;
    void (async () => {
      try {
        await runOpsRecoveryAction("sync_subscription");
        const latest = await getCurrentHotelSubscription();
        setSubscription(latest);
      } catch {
        autoSyncedRenewalRef.current = false;
      }
    })();
  }, [loading, subscription]);

  const refreshOpsHealth = useCallback(async () => {
    if (!canAccessOps) {
      setOpsHealth(null);
      setLoadingOpsHealth(false);
      return;
    }
    setLoadingOpsHealth(true);
    try {
      const health = await getOpsHealthSnapshot();
      setOpsHealth(health);
    } catch (e) {
      setError(e instanceof Error ? e.message : "運用ヘルスの取得に失敗しました");
    } finally {
      setLoadingOpsHealth(false);
    }
  }, [canAccessOps]);

  useEffect(() => {
    if (loading || !canAccessOps) {
      return;
    }
    void refreshOpsHealth();
  }, [loading, canAccessOps, refreshOpsHealth]);

  useEffect(() => {
    if (loading || typeof window === "undefined") {
      return;
    }
    if (!canAccessOps) {
      const dismissed = window.localStorage.getItem(QUICKSTART_DISMISSED_KEY) === "1";
      const shouldShow = !dismissed && items.length === 0;
      setShowQuickStart(shouldShow);
      return;
    }
    if (!opsHealth) {
      return;
    }
    const dismissed = window.localStorage.getItem(QUICKSTART_DISMISSED_KEY) === "1";
    const shouldShow = !dismissed && opsHealth.onboarding.totalPages === 0;
    setShowQuickStart(shouldShow);
  }, [loading, opsHealth, canAccessOps, items.length]);

  useEffect(() => {
    if (industryAutoSelectionDoneRef.current || !hotelName || industryFilter !== "all") {
      return;
    }
    industryAutoSelectionDoneRef.current = true;
    setIndustryFilter(mapFacilityToIndustry(inferredFacilityType));
  }, [hotelName, industryFilter, inferredFacilityType]);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const industry = params.get("industry");
    if (industry === "business") {
      setIndustryFilter("hotel_business");
    } else if (industry === "resort") {
      setIndustryFilter("hotel_resort");
    } else if (industry === "spa") {
      setIndustryFilter("ryokan");
    }
  }, []);

  useEffect(() => {
    if (purposeFilter !== "all") {
      return;
    }
    setPurposeFilter(recommendedPurposeByScale);
  }, [purposeFilter, recommendedPurposeByScale]);

  useEffect(() => {
    if (loading) {
      return;
    }
    let mounted = true;
    setLoadingAuditLogs(true);
    void listCurrentHotelAuditLogs()
      .then((logs) => {
        if (!mounted) {
          return;
        }
        setAuditLogs(logs);
      })
      .catch((e) => {
        if (!mounted) {
          return;
        }
        setError(e instanceof Error ? e.message : "監査ログ取得に失敗しました");
      })
      .finally(() => {
        if (!mounted) {
          return;
        }
        setLoadingAuditLogs(false);
      });

    return () => {
      mounted = false;
    };
  }, [loading]);

  const published = useMemo(
    () => items.filter((item) => item.status === "published"),
    [items],
  );
  const draft = useMemo(
    () => items.filter((item) => item.status === "draft"),
    [items],
  );
  const projectFileGroups = useMemo<ProjectFileGroup[]>(() => {
    const bySlug = new Map(items.map((item) => [item.slug, item]));
    return items
      .map((hub) => {
        const nodeMap = hub.theme.nodeMap;
        if (!nodeMap?.enabled) {
          return null;
        }
        const pageSlugs = Array.from(
          new Set(
            nodeMap.nodes
              .map((node) => (typeof node.targetSlug === "string" ? node.targetSlug.trim() : ""))
              .filter(Boolean),
          ),
        );
        const pages = pageSlugs
          .map((slug) => bySlug.get(slug))
          .filter((entry): entry is Information => Boolean(entry))
          .filter((entry) => entry.id !== hub.id);
        return { hub, pages };
      })
      .filter((group): group is ProjectFileGroup => Boolean(group));
  }, [items]);
  const groupedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const group of projectFileGroups) {
      ids.add(group.hub.id);
      for (const page of group.pages) {
        ids.add(page.id);
      }
    }
    return ids;
  }, [projectFileGroups]);
  const standaloneProjectItems = useMemo(
    () => items.filter((item) => !groupedIds.has(item.id)),
    [items, groupedIds],
  );
  const filteredProjectFileGroups = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    const byStatus = (entry: Information) =>
      projectStatusFilter === "all" ? true : entry.status === projectStatusFilter;
    return projectFileGroups
      .map((group) => {
        const pages = group.pages.filter((entry) => byStatus(entry));
        const keywordHit =
          !q ||
          group.hub.title.toLowerCase().includes(q) ||
          pages.some((entry) => entry.title.toLowerCase().includes(q));
        if (!keywordHit) {
          return null;
        }
        if (q && group.hub.title.toLowerCase().includes(q)) {
          return { ...group, pages };
        }
        if (q && pages.length === 0) {
          return null;
        }
        return { ...group, pages };
      })
      .filter((entry): entry is ProjectFileGroup => Boolean(entry));
  }, [projectFileGroups, projectSearch, projectStatusFilter]);
  const filteredStandaloneProjectItems = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return standaloneProjectItems
      .filter((entry) => (projectStatusFilter === "all" ? true : entry.status === projectStatusFilter))
      .filter((entry) => (!q ? true : entry.title.toLowerCase().includes(q)));
  }, [standaloneProjectItems, projectSearch, projectStatusFilter]);
  const groupedPageCount = useMemo(
    () => projectFileGroups.reduce((sum, group) => sum + group.pages.length, 0),
    [projectFileGroups],
  );
  const pendingDeleteIds = useMemo(
    () => new Set(pendingDeleteBatches.flatMap((batch) => batch.items.map((item) => item.id))),
    [pendingDeleteBatches],
  );
  const publishedLimit = subscription?.maxPublishedPages ?? 0;
  const remainingPublishSlots = Math.max(publishedLimit - published.length, 0);
  const usagePercent = publishedLimit > 0
    ? clampPercent((published.length / publishedLimit) * 100)
    : 0;
  const isLimitReached = publishedLimit > 0 && published.length >= publishedLimit;
  const isNearLimit = !isLimitReached && publishedLimit > 0 && usagePercent >= 80;
  const isProActive = subscription?.plan === "pro" && (subscription.status === "active" || subscription.status === "trialing");
  const isHighTraffic = (viewMetrics?.totalViews7d ?? 0) >= 120;
  const utilizationBand =
    publishedLimit <= 0 ? "low" : usagePercent >= 80 ? "high" : usagePercent >= 40 ? "mid" : "low";
  const dashboardCompactMode = true;
  const createCompactMode = true;
  const currentMonth = new Date().getMonth() + 1;
  const isPeakSeason = [3, 4, 5, 8, 11, 12].includes(currentMonth);
  const shouldShowUpgradeCta = !isProActive && (isNearLimit || isLimitReached || isHighTraffic || isPeakSeason);
  const primaryBillingCtaLabel = isProActive ? "解約する" : "Proにアップグレード";
  const primaryBillingCtaLoading = isProActive ? openingPortal : creatingCheckout;
  const primaryBillingCtaDisabled = isProActive ? openingPortal || !subscription?.hasStripeCustomer : creatingCheckout;
  const nextRenewalLabel = subscription
    ? subscription.currentPeriodEnd
      ? formatShortDate(subscription.currentPeriodEnd)
      : isProActive
        ? "請求ポータルで確認"
        : "未設定"
    : "-";
  const filteredTemplateEntries = useMemo(
    () => {
      const q = quickSearch.trim().toLowerCase();
      return starterTemplates
        .map((template, originalIndex) => {
          const purposes = detectTemplatePurposes(template);
          const scenes = detectTemplateScenes(template);
          const inputCount = estimateTemplateInputCount(template);
          const viewSeconds = estimateTemplateViewSeconds(template, inputCount);
          const operators = estimateTemplateOperators(inputCount);
          const defaultHints = getTemplateFailureProneDefaults(template);
          return { template, originalIndex, purposes, scenes, inputCount, viewSeconds, operators, defaultHints };
        })
        .filter(({ template, purposes }) => {
        if (industryFilter !== "all" && template.industry !== industryFilter) {
          return false;
        }
        if (purposeFilter !== "all" && !purposes.includes(purposeFilter)) {
          return false;
        }
        if (!q) {
          return true;
        }
        return (
          template.title.toLowerCase().includes(q) ||
          template.body.toLowerCase().includes(q)
        );
      });
    },
    [quickSearch, industryFilter, purposeFilter],
  );
  const recommendedTemplateByIndustry = useMemo(() => {
    const map = new Map<IndustryPreset, number>();
    starterTemplates.forEach((template, index) => {
      if (!map.has(template.industry)) {
        map.set(template.industry, index);
      }
    });
    return map;
  }, []);
  const favoriteTemplateSet = useMemo(
    () => new Set(favoriteTemplateIndices),
    [favoriteTemplateIndices],
  );
  const sortTemplateEntries = useCallback(
    (
      entries: Array<{
        template: StarterTemplate;
        originalIndex: number;
        purposes: TemplatePurposeFilter[];
        scenes: TemplateScene[];
        inputCount: number;
        viewSeconds: number;
        operators: string;
        defaultHints: string[];
      }>,
      industry: IndustryPreset | null,
    ) =>
      [...entries].sort((a, b) => {
        if (templateSortMode === "latest") {
          return b.originalIndex - a.originalIndex;
        }
        if (templateSortMode === "recommended") {
          const score = (entry: {
            purposes: TemplatePurposeFilter[];
            scenes: TemplateScene[];
            originalIndex: number;
            template: StarterTemplate;
            operators: string;
          }) => {
            let s = 0;
            if (purposeFilter !== "all" && entry.purposes.includes(purposeFilter)) {
              s += 4;
            }
            if (entry.purposes.includes(recommendedPurposeByScale)) {
              s += 6;
            }
            if (entry.template.industry === mapFacilityToIndustry(inferredFacilityType)) {
              s += 8;
            }
            if (entry.scenes.includes("front")) {
              s += 2;
            }
            if (entry.scenes.includes("facility")) {
              s += 1;
            }
            if (industry) {
              const rec = recommendedTemplateByIndustry.get(industry);
              if (rec !== undefined && entry.originalIndex === rec) {
                s += 3;
              }
            }
            if (favoriteTemplateSet.has(entry.originalIndex)) {
              s += 5;
            }
            if (entry.operators === "1人" || entry.operators === "1-2人") {
              s += 2;
            }
            return s;
          };
          const delta = score(b) - score(a);
          if (delta !== 0) {
            return delta;
          }
        }
        const aFav = favoriteTemplateSet.has(a.originalIndex);
        const bFav = favoriteTemplateSet.has(b.originalIndex);
        if (aFav !== bFav) {
          return aFav ? -1 : 1;
        }
        return a.originalIndex - b.originalIndex;
      }),
    [favoriteTemplateSet, inferredFacilityType, purposeFilter, recommendedPurposeByScale, recommendedTemplateByIndustry, templateSortMode],
  );
  const groupedTemplateEntries = useMemo(() => {
    if (templateGrouping === "scene") {
      const sceneOrder: TemplateScene[] = ["front", "guestroom", "facility"];
      return sceneOrder
        .map((scene) => ({
          industry: null as IndustryPreset | null,
          label: TEMPLATE_SCENE_LABELS[scene],
          entries: sortTemplateEntries(
            filteredTemplateEntries.filter((entry) => entry.scenes.includes(scene)),
            null,
          ),
        }))
        .filter((group) => group.entries.length > 0);
    }
    return (Object.keys(INDUSTRY_PRESET_LABELS) as IndustryPreset[])
      .map((industry) => ({
        industry,
        label: INDUSTRY_PRESET_LABELS[industry],
        entries: sortTemplateEntries(
          filteredTemplateEntries.filter((entry) => entry.template.industry === industry),
          industry,
        ),
      }))
      .filter((group) => group.entries.length > 0);
  }, [filteredTemplateEntries, sortTemplateEntries, templateGrouping]);
  const fixedTopTemplatesByFacility = useMemo(() => {
    const targetIndustry = mapFacilityToIndustry(inferredFacilityType);
    const usageMap = new Map<string, number>();
    for (const information of items) {
      const title = information.title.trim();
      if (!title) continue;
      usageMap.set(title, (usageMap.get(title) ?? 0) + 1);
    }
    const baseEntries = filteredTemplateEntries
      .filter((entry) => entry.template.industry === targetIndustry)
      .map((entry) => {
        const usage = usageMap.get(entry.template.title) ?? 0;
        const quality = getTemplateQualityScore(entry.template).score;
        const score = quality + usage * 6 + (entry.viewSeconds <= 60 ? 8 : 0);
        return { ...entry, score };
      });
    return [...baseEntries].sort((a, b) => b.score - a.score).slice(0, 3);
  }, [filteredTemplateEntries, inferredFacilityType, items]);
  const shortestTemplateByScale = useMemo(() => {
    const industry = mapFacilityToIndustry(inferredFacilityType);
    const pickByScale = (scale: HotelScale) => {
      const purpose = SCALE_PRIMARY_PURPOSE[scale];
      const candidates = starterTemplates
        .map((template, originalIndex) => {
          const inputCount = estimateTemplateInputCount(template);
          const viewSeconds = estimateTemplateViewSeconds(template, inputCount);
          const purposes = detectTemplatePurposes(template);
          const industryMatch = template.industry === industry ? 1 : 0;
          const purposeMatch = purposes.includes(purpose) ? 1 : 0;
          return { template, originalIndex, inputCount, viewSeconds, purposeMatch, industryMatch };
        })
        .sort((a, b) => {
          const scoreA = a.purposeMatch * 100 + a.industryMatch * 40 - a.viewSeconds - a.inputCount;
          const scoreB = b.purposeMatch * 100 + b.industryMatch * 40 - b.viewSeconds - b.inputCount;
          if (scoreA !== scoreB) return scoreB - scoreA;
          return a.originalIndex - b.originalIndex;
        });
      return candidates[0] ?? null;
    };
    return {
      small: pickByScale("small"),
      mid: pickByScale("mid"),
      large: pickByScale("large"),
    };
  }, [inferredFacilityType]);
  const activeTemplatePreviewEntry = useMemo(() => {
    if (filteredTemplateEntries.length === 0) {
      return null;
    }
    if (previewTemplateIndex === null) {
      return filteredTemplateEntries[0];
    }
    return (
      filteredTemplateEntries.find((entry) => entry.originalIndex === previewTemplateIndex) ??
      filteredTemplateEntries[0]
    );
  }, [filteredTemplateEntries, previewTemplateIndex]);
  const activeTemplateRequirements = useMemo(
    () => (activeTemplatePreviewEntry ? getTemplateRequirementHints(activeTemplatePreviewEntry.template) : null),
    [activeTemplatePreviewEntry],
  );
  const activeTemplateSlaMs = useMemo(
    () => (activeTemplatePreviewEntry ? getTemplateSlaMs(activeTemplatePreviewEntry.template) : 2300),
    [activeTemplatePreviewEntry],
  );
  const templateUsageRanking = useMemo(() => {
    const usageMap = new Map<string, number>();
    for (const information of items) {
      const title = information.title.trim();
      if (!title) {
        continue;
      }
      usageMap.set(title, (usageMap.get(title) ?? 0) + 1);
    }
    return starterTemplates
      .map((template, index) => ({
        index,
        title: template.title,
        count: usageMap.get(template.title) ?? 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [items]);
  const templateUsageCountByTitle = useMemo(() => {
    const usageMap = new Map<string, number>();
    for (const information of items) {
      const title = information.title.trim();
      if (!title) continue;
      usageMap.set(title, (usageMap.get(title) ?? 0) + 1);
    }
    return usageMap;
  }, [items]);
  const templateFirstPublishRateByTitle = useMemo(() => {
    const map = new Map<string, { selected: number; published: number; rate: number }>();
    for (const row of opsHealth?.week15Preview.templateFirstPublishRate ?? []) {
      map.set(row.templateTitle, { selected: row.selected, published: row.published, rate: row.rate });
    }
    return map;
  }, [opsHealth?.week15Preview.templateFirstPublishRate]);
  const topAdoptedIndustry = useMemo(() => {
    const top = templateUsageRanking[0];
    if (!top || top.count <= 0) {
      return mapFacilityToIndustry(inferredFacilityType);
    }
    const matched = starterTemplates[top.index];
    return matched?.industry ?? mapFacilityToIndustry(inferredFacilityType);
  }, [templateUsageRanking, inferredFacilityType]);

  useEffect(() => {
    if (filteredTemplateEntries.length === 0) {
      setPreviewTemplateIndex(null);
      return;
    }
    if (previewTemplateIndex === null) {
      setPreviewTemplateIndex(filteredTemplateEntries[0].originalIndex);
      return;
    }
    const exists = filteredTemplateEntries.some((entry) => entry.originalIndex === previewTemplateIndex);
    if (!exists) {
      setPreviewTemplateIndex(filteredTemplateEntries[0].originalIndex);
    }
  }, [filteredTemplateEntries, previewTemplateIndex]);
  useEffect(() => {
    if (industryAutoSelectionDoneRef.current || industryFilter !== "all") {
      return;
    }
    industryAutoSelectionDoneRef.current = true;
    setIndustryFilter(topAdoptedIndustry);
  }, [industryFilter, topAdoptedIndustry]);

  const onSelectIndustryFilter = useCallback((next: IndustryPreset | "all") => {
    industryAutoSelectionDoneRef.current = true;
    setIndustryFilter(next);
  }, []);
  useEffect(() => {
    let mounted = true;
    void getSharedTemplateFavorites()
      .then((favorites) => {
        if (!mounted) {
          return;
        }
        setFavoriteTemplateIndices(favorites);
      })
      .catch(() => {
        if (typeof window === "undefined") {
          return;
        }
        const raw = window.localStorage.getItem(DASHBOARD_TEMPLATE_FAVORITES_KEY);
        if (!raw) {
          return;
        }
        try {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) {
            setFavoriteTemplateIndices(
              parsed
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value >= 0 && value < starterTemplates.length),
            );
          }
        } catch {
          // ignore parse error
        }
      });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(DASHBOARD_TEMPLATE_FAVORITES_KEY, JSON.stringify(favoriteTemplateIndices));
  }, [favoriteTemplateIndices]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(OPS_PERF_SNAPSHOT_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        capturedAt?: string;
        byPath?: Array<{ path?: string; lcpMs?: number; inpMs?: number; cls?: number; samples?: number }>;
      };
      if (!parsed.capturedAt || !Array.isArray(parsed.byPath)) {
        return;
      }
      setPerfSnapshot({
        capturedAt: parsed.capturedAt,
        byPath: parsed.byPath
          .filter((row) => typeof row.path === "string")
          .map((row) => ({
            path: row.path as string,
            lcpMs: Number(row.lcpMs ?? 0),
            inpMs: Number(row.inpMs ?? 0),
            cls: Number(row.cls ?? 0),
            samples: Number(row.samples ?? 0),
          })),
      });
    } catch {
      // no-op
    }
  }, []);
  const trackedEditActions = useMemo(
    () =>
      auditLogs.filter(
        (log) =>
          log.action === "information.created" ||
          log.action === "information.updated" ||
          log.action === "information.published",
      ).length,
    [auditLogs],
  );
  const estimatedMonthlyEdits = useMemo(
    () => Math.max(12, trackedEditActions * 3, items.length * 4),
    [trackedEditActions, items.length],
  );
  const estimatedSavedMinutesPerMonth = estimatedMonthlyEdits * 7;
  const estimatedSavedHoursPerMonth = (estimatedSavedMinutesPerMonth / 60).toFixed(1);
  const qrShare7d = useMemo(() => {
    const total = viewMetrics?.totalViews7d ?? 0;
    const qr = viewMetrics?.qrViews7d ?? 0;
    if (total <= 0) {
      return 0;
    }
    return Math.round((qr / total) * 100);
  }, [viewMetrics]);
  const proFitSignals = useMemo(
    () =>
      [
        remainingPublishSlots <= 1,
        projectFileGroups.length > 0,
        (viewMetrics?.totalViews7d ?? 0) >= 50,
      ].filter(Boolean).length,
    [projectFileGroups.length, remainingPublishSlots, viewMetrics],
  );
  const opsTimeline = useMemo(
    () =>
      auditLogs
        .filter((log) => log.action.startsWith("billing.") || log.action.startsWith("ops."))
        .filter((log) => {
          if (opsActionFilter === "all") {
            return true;
          }
          if (opsActionFilter === "webhook") {
            return (
              log.action.includes("webhook") ||
              log.action === "billing.subscription_synced" ||
              log.action === "billing.checkout_completed"
            );
          }
          if (opsActionFilter === "checkout") {
            return log.action.startsWith("billing.checkout");
          }
          return log.action.startsWith("billing.portal");
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [auditLogs, opsActionFilter],
  );
  const opsErrorTimeline = useMemo(
    () =>
      opsTimeline
        .filter(
          (log) =>
            log.action.includes("failed") ||
            log.message.includes("失敗") ||
            log.message.toLowerCase().includes("error"),
        )
        .map((log) => {
          const raw = `${log.action} ${log.message}`.toLowerCase();
          const priority: "high" | "medium" | "low" =
            raw.includes("webhook") || raw.includes("checkout_failed") || raw.includes("row-level security")
              ? "high"
              : raw.includes("portal") || raw.includes("scope")
                ? "medium"
                : "low";
          return { ...log, priority };
        })
        .sort((a, b) => {
          const score = { high: 3, medium: 2, low: 1 };
          const delta = score[b.priority] - score[a.priority];
          if (delta !== 0) {
            return delta;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }),
    [opsTimeline],
  );
  const latestCheckoutSessionLog = useMemo(
    () =>
      auditLogs
        .filter((log) => log.action === "billing.checkout_session_created")
        .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))[0] ?? null,
    [auditLogs],
  );
  const latestCheckoutCompletedAt = useMemo(
    () =>
      auditLogs
        .filter((log) => log.action === "billing.checkout_completed")
        .map((log) => toTimestamp(log.createdAt))
        .sort((a, b) => b - a)[0] ?? null,
    [auditLogs],
  );
  const hasPendingCheckout = useMemo(() => {
    if (isProActive || !latestCheckoutSessionLog) {
      return false;
    }
    const startedAt = toTimestamp(latestCheckoutSessionLog.createdAt);
    if (!latestCheckoutCompletedAt) {
      return true;
    }
    return startedAt > latestCheckoutCompletedAt;
  }, [isProActive, latestCheckoutCompletedAt, latestCheckoutSessionLog]);
  const normalizedProjectName = useMemo(() => normalizeProjectName(newProjectName), [newProjectName]);
  const canCreateProject = normalizedProjectName.length >= 2;
  const week1Snapshot = useMemo(() => {
    const lpRate = onboardingFunnel?.lpToSignupRate ?? 0;
    const views = viewMetrics?.totalViews7d ?? 0;
    const publishedPages = published.length;
    const score =
      (lpRate >= 20 ? 1 : 0) +
      (views >= 50 ? 1 : 0) +
      (publishedPages >= 3 ? 1 : 0);
    const level = score >= 3 ? "good" : score === 2 ? "mid" : "low";
    return { lpRate, views, publishedPages, score, level };
  }, [onboardingFunnel, viewMetrics, published.length]);
  const firstPublishDropOff = useMemo(() => {
    const logins = onboardingFunnel?.lpAttributedLogins ?? 0;
    const signups = onboardingFunnel?.signupCompleted ?? 0;
    const created = items.length;
    const publishedCount = published.length;
    const loginToSignupDrop = logins > 0 ? Math.max(0, 100 - Math.round((signups / logins) * 100)) : 0;
    const signupToCreatedDrop = signups > 0 ? Math.max(0, 100 - Math.round((created / signups) * 100)) : 0;
    const createdToPublishedDrop = created > 0 ? Math.max(0, 100 - Math.round((publishedCount / created) * 100)) : 0;
    return {
      logins,
      signups,
      created,
      publishedCount,
      loginToSignupDrop,
      signupToCreatedDrop,
      createdToPublishedDrop,
    };
  }, [items.length, onboardingFunnel?.lpAttributedLogins, onboardingFunnel?.signupCompleted, published.length]);
  const hotelRevenueValidation = useMemo(() => {
    const landingRows = onboardingFunnel?.byLandingPage ?? [];
    const hotelRows = landingRows.filter((row) => row.lp === "business" || row.lp === "resort" || row.lp === "spa");
    const lpLogins = hotelRows.reduce((sum, row) => sum + row.logins, 0);
    const lpSignups = hotelRows.reduce((sum, row) => sum + row.signups, 0);
    const lpRate = lpLogins > 0 ? Math.round((lpSignups / lpLogins) * 100) : 0;

    const createdCount = firstPublishDropOff.created;
    const publishedCount = firstPublishDropOff.publishedCount;
    const publishRate = createdCount > 0 ? Math.round((publishedCount / createdCount) * 100) : 0;

    const upgradeClicks = opsHealth?.billing.funnel7d.upgradeClicks ?? 0;
    const checkoutCount = opsHealth?.billing.funnel7d.checkoutSessions ?? 0;
    const paidCount = opsHealth?.billing.funnel7d.completedCheckouts ?? 0;
    const paidRate = checkoutCount > 0 ? Math.round((paidCount / checkoutCount) * 100) : 0;
    const retention14dRate = opsHealth?.restart7d.retention14d.rate ?? 0;

    const targets = {
      lp: 20,
      publish: 60,
      paid: 40,
      retention14d: 35,
    };
    const stages = [
      {
        key: "acquire",
        label: "獲得",
        metric: "LP→登録",
        value: `${lpSignups}/${lpLogins}`,
        rate: lpRate,
        target: targets.lp,
      },
      {
        key: "activate",
        label: "公開",
        metric: "作成→初回公開",
        value: `${publishedCount}/${createdCount}`,
        rate: publishRate,
        target: targets.publish,
      },
      {
        key: "monetize",
        label: "課金",
        metric: "Checkout→完了",
        value: `${paidCount}/${checkoutCount}`,
        rate: paidRate,
        target: targets.paid,
      },
    ] as const;
    const healthyCount = stages.filter((stage) => stage.rate >= stage.target).length;
    const bottleneck = [...stages].sort((a, b) => (a.rate - a.target) - (b.rate - b.target))[0];
    const nextActions: string[] = [];
    if (lpRate < targets.lp) {
      nextActions.push("LPのホテル訴求見出しを1本に絞り、CTA文言を固定して7日比較");
    }
    if (publishRate < targets.publish) {
      nextActions.push("テンプレ作成直後に初回公開ウィザードを必須導線として再実行");
    }
    if (paidRate < targets.paid) {
      nextActions.push("公開完了直後にアップグレード導線を表示し、未完了には決済再開を即表示");
    }
    if (retention14dRate < targets.retention14d) {
      nextActions.push("公開7日後の休眠通知を固定し、再公開リワードをセットで送信");
    }
    if (nextActions.length === 0) {
      nextActions.push("現行導線を維持し、トラフィック増加だけに集中");
    }

    return {
      stages,
      healthyCount,
      bottleneck,
      retention14dRate,
      targets,
      upgradeClicks,
      nextActions: nextActions.slice(0, 3),
    };
  }, [
    firstPublishDropOff.created,
    firstPublishDropOff.publishedCount,
    onboardingFunnel?.byLandingPage,
    opsHealth?.billing.funnel7d.checkoutSessions,
    opsHealth?.billing.funnel7d.completedCheckouts,
    opsHealth?.billing.funnel7d.upgradeClicks,
    opsHealth?.restart7d.retention14d.rate,
  ]);
  const dormancyStage = useMemo(() => {
    const days = opsHealth?.dormancy.daysSinceLastUpdate;
    if (days === null || days === undefined) {
      return "unknown" as const;
    }
    if (days >= 14) {
      return "critical" as const;
    }
    if (days >= 7) {
      return "warning" as const;
    }
    return "healthy" as const;
  }, [opsHealth?.dormancy.daysSinceLastUpdate]);
  const week5Kpi = useMemo(() => {
    const lp = onboardingFunnel?.lpToSignupRate ?? 0;
    const publishCompletion = items.length > 0 ? Math.round((published.length / items.length) * 100) : 0;
    const proConversion = opsHealth?.billing.funnel7d.checkoutToPaidRate ?? 0;
    const retention = opsHealth?.restart7d.retention7d.rate ?? 0;
    const standardize = [];
    const stopOrFix = [];
    if (lp >= 20) standardize.push("LP訴求とCTA");
    else stopOrFix.push("LP訴求とCTA");
    if (publishCompletion >= 60) standardize.push("初回公開導線");
    else stopOrFix.push("初回公開導線");
    if (proConversion >= 15) standardize.push("課金導線");
    else stopOrFix.push("課金導線");
    if (retention >= 40) standardize.push("休眠再開導線");
    else stopOrFix.push("休眠再開導線");
    return {
      lp,
      publishCompletion,
      proConversion,
      retention,
      standardize,
      stopOrFix,
    };
  }, [items.length, onboardingFunnel?.lpToSignupRate, opsHealth?.billing.funnel7d.checkoutToPaidRate, opsHealth?.restart7d.retention7d.rate, published.length]);
  const week7PriorityTop3 = useMemo(() => {
    const priorities: string[] = [];
    if ((onboardingFunnel?.wizard.step1CompletionRate ?? 0) < 60) {
      priorities.push("初回公開ウィザード1画面目の完了率を改善");
    }
    if ((opsHealth?.performance7d.slowPages ?? []).length > 0) {
      priorities.push("速度低下ページの画像最適化を実施");
    }
    if ((opsHealth?.restart7d.retention14d.rate ?? 0) < 30) {
      priorities.push("14日継続率向上の再開導線を固定");
    }
    for (const label of week5Kpi.stopOrFix) {
      priorities.push(`${label}を優先修正`);
    }
    return Array.from(new Set(priorities)).slice(0, 3);
  }, [onboardingFunnel?.wizard.step1CompletionRate, opsHealth?.performance7d.slowPages, opsHealth?.restart7d.retention14d.rate, week5Kpi.stopOrFix]);
  const speedComparisonByPage = useMemo(() => {
    if (!perfSnapshot) {
      return [];
    }
    const latestMap = new Map((opsHealth?.performance7d.lcpByPage ?? []).map((row) => [row.path, row]));
    return perfSnapshot.byPath
      .map((before) => {
        const after = latestMap.get(before.path);
        if (!after) {
          return null;
        }
        return {
          path: before.path,
          beforeLcp: before.lcpMs,
          afterLcp: after.lcpMs,
          deltaLcp: after.lcpMs - before.lcpMs,
          beforeInp: before.inpMs,
          afterInp: after.inpMs,
          deltaInp: after.inpMs - before.inpMs,
        };
      })
      .filter((row): row is {
        path: string;
        beforeLcp: number;
        afterLcp: number;
        deltaLcp: number;
        beforeInp: number;
        afterInp: number;
        deltaInp: number;
      } => Boolean(row))
      .sort((a, b) => Math.abs(b.deltaLcp) - Math.abs(a.deltaLcp))
      .slice(0, 5);
  }, [opsHealth?.performance7d.lcpByPage, perfSnapshot]);
  const restartDefaultPathByFacility = useMemo(() => {
    const defaults = opsHealth?.week9Preview.restartDefaultPathByFacility;
    return {
      business: defaults?.business ?? "template",
      resort: defaults?.resort ?? "template",
      spa: defaults?.spa ?? "template",
    } as const;
  }, [opsHealth?.week9Preview.restartDefaultPathByFacility]);
  const inferredRestartDefaultPath = restartDefaultPathByFacility[inferredFacilityType];
  const preferredDormancyChannel = useMemo(() => {
    const preview = opsHealth?.week10Preview.dormancyWinnerChannelByFacility;
    if (!preview) {
      return inferredFacilityType === "business" ? "mail" : "line";
    }
    return preview[inferredFacilityType];
  }, [inferredFacilityType, opsHealth?.week10Preview.dormancyWinnerChannelByFacility]);
  const week10RecommendedActions48h = useMemo(() => {
    const actions: string[] = [];
    if ((opsHealth?.week10Preview.revisitPredictionScore ?? 0) < 60) {
      actions.push("再開通知を当日中に送信し、テンプレ導線へ誘導");
    }
    if ((opsHealth?.week10Preview.billingManagementCompletion7d.rate ?? 0) < 50) {
      actions.push("請求/カード管理導線を1クリックで案内");
    }
    if ((opsHealth?.week7Review.kpi.firstPublishRate ?? 0) < 60) {
      actions.push("初回公開ウィザードを再実行してQR配布まで完了");
    }
    if (actions.length === 0) {
      actions.push("高反応テンプレを複製し、2本目ページを48時間以内に公開");
    }
    return actions.slice(0, 3);
  }, [opsHealth?.week10Preview.billingManagementCompletion7d.rate, opsHealth?.week10Preview.revisitPredictionScore, opsHealth?.week7Review.kpi.firstPublishRate]);
  const billingFaqEntries = useMemo(() => {
    const defaultFaq = [
      {
        key: "timing",
        q: "Q. 繁忙期だけPro運用に切り替えできますか？",
        a: "A. 可能です。必要な期間だけProにして、落ち着いたら解約できます。",
      },
      {
        key: "feature_unclear",
        q: "Q. 深夜チェックイン導線や温浴案内だけPro化する意味はありますか？",
        a: "A. 公開枠や複数ページ連携が必要なら効果が高く、問い合わせ削減に繋がります。",
      },
      {
        key: "approval_needed",
        q: "Q. 決済画面を閉じた後の再開はできますか？",
        a: "A. できます。上の「決済を再開する」から同じ施設で再開可能です。",
      },
    ];
    const reasonOrder = (opsHealth?.week10Preview.proBlockerTopReasons ?? []).map((row) => row.reason);
    const score = (key: string) => {
      const index = reasonOrder.findIndex((reason) => reason.includes(
        key === "timing" ? "タイミング" : key === "feature_unclear" ? "機能差" : key === "approval_needed" ? "承認" : key,
      ));
      return index < 0 ? 99 : index;
    };
    return [...defaultFaq].sort((a, b) => score(a.key) - score(b.key));
  }, [opsHealth?.week10Preview.proBlockerTopReasons]);
  const hasBillingInsightData = useMemo(() => {
    const topReasons = opsHealth?.week10Preview.proBlockerTopReasons ?? [];
    const blockerTasks = opsHealth?.week11Preview.blockerImprovementTasks ?? [];
    const actionPlan = opsHealth?.week12Preview.proBlockerActionPlan ?? [];
    const weekday = opsHealth?.week14Preview.billingCompletionByWeekday ?? [];
    const completion = opsHealth?.week10Preview.billingManagementCompletion7d;
    const dropoff = opsHealth?.week12Preview.billingDropoffByStep;
    const reasonCount = topReasons.reduce((sum, row) => sum + (row.count ?? 0), 0);
    const hasCompletion = (completion?.started ?? 0) > 0 || (completion?.completed ?? 0) > 0;
    const hasCvr =
      (dropoff?.upgradeToCheckout ?? 0) > 0 ||
      (dropoff?.checkoutToPaid ?? 0) > 0 ||
      (dropoff?.paidToPortal ?? 0) > 0;
    return hasCompletion || hasCvr || reasonCount > 0 || blockerTasks.length > 0 || actionPlan.length > 0 || weekday.length > 0;
  }, [
    opsHealth?.week10Preview.billingManagementCompletion7d,
    opsHealth?.week10Preview.proBlockerTopReasons,
    opsHealth?.week11Preview.blockerImprovementTasks,
    opsHealth?.week12Preview.billingDropoffByStep,
    opsHealth?.week12Preview.proBlockerActionPlan,
    opsHealth?.week14Preview.billingCompletionByWeekday,
  ]);
  const weeklyOpsReport = useMemo(
    () => {
      const reportDate = new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());
      return [
        "【Infomii 週次運用レポート v1】",
        `対象日: ${reportDate}`,
        "",
        "[KPI]",
        `LP→登録率: ${week5Kpi.lp}%`,
        `公開完了率: ${week5Kpi.publishCompletion}%`,
        `Pro転換率: ${week5Kpi.proConversion}%`,
        `再開後7日継続率: ${week5Kpi.retention}%`,
        "",
        "[標準化]",
        week5Kpi.standardize.join(" / ") || "なし",
        "",
        "[停止/修正]",
        week5Kpi.stopOrFix.join(" / ") || "なし",
        "",
        "[最優先3施策]",
        week7PriorityTop3.join(" / ") || "なし",
        "",
        "[改善アクション実行率]",
        `${opsHealth?.week10Preview.actionExecutionRate ?? 0}%`,
        `週次レポート実行率: ${opsHealth?.week15Preview.weeklyReportImprovementExecutionRate ?? 0}%`,
        `実行済み改善数: ${opsHealth?.week11Preview.executedImprovementsCount ?? 0}件`,
        `運用負荷削減時間（週）: ${opsHealth?.week12Preview.weeklyOpsSavedHours ?? 0}h`,
        `紹介流入率: ${opsHealth?.week12Preview.referralInflowRate ?? 0}%`,
      ].join("\n");
    },
    [opsHealth?.week10Preview.actionExecutionRate, opsHealth?.week11Preview.executedImprovementsCount, opsHealth?.week12Preview.referralInflowRate, opsHealth?.week12Preview.weeklyOpsSavedHours, opsHealth?.week15Preview.weeklyReportImprovementExecutionRate, week5Kpi, week7PriorityTop3],
  );
  const unoptimizedImageUrls = useMemo(() => {
    const urls = new Set<string>();
    for (const info of items) {
      for (const block of info.contentBlocks) {
        if (block.type === "image") {
          const url = (block.url ?? "").trim();
          if (!url) continue;
          const lower = url.toLowerCase();
          if (
            lower.startsWith("http") &&
            (lower.includes(".png") || lower.includes(".bmp") || lower.includes(".tiff") || lower.includes(".gif")) &&
            !lower.includes("w=") &&
            !lower.includes("q=")
          ) {
            urls.add(url);
          }
        }
        if (block.type === "gallery") {
          for (const entry of block.galleryItems ?? []) {
            const url = (entry.url ?? "").trim();
            if (!url) continue;
            const lower = url.toLowerCase();
            if (
              lower.startsWith("http") &&
              (lower.includes(".png") || lower.includes(".bmp") || lower.includes(".tiff") || lower.includes(".gif")) &&
              !lower.includes("w=") &&
              !lower.includes("q=")
            ) {
              urls.add(url);
            }
          }
        }
      }
    }
    return Array.from(urls).slice(0, 8);
  }, [items]);
  const imageOptimizationEstimate = useMemo(() => {
    const estimateBytes = (url: string): number => {
      const lower = url.toLowerCase();
      if (lower.includes(".png")) return 1200 * 1024;
      if (lower.includes(".bmp") || lower.includes(".tiff")) return 2000 * 1024;
      if (lower.includes(".gif")) return 900 * 1024;
      return 700 * 1024;
    };
    const beforeBytes = unoptimizedImageUrls.reduce((sum, url) => sum + estimateBytes(url), 0);
    const afterBytes = Math.round(beforeBytes * 0.45);
    return {
      beforeKb: Math.round(beforeBytes / 1024),
      afterKb: Math.round(afterBytes / 1024),
      reducedKb: Math.max(0, Math.round((beforeBytes - afterBytes) / 1024)),
    };
  }, [unoptimizedImageUrls]);
  const lpOptimizationTip = useMemo(() => {
    if (week1Snapshot.lpRate >= 20) {
      return "LP導線は良好です。次はテンプレ作成後の公開完了率を改善しましょう。";
    }
    if ((onboardingFunnel?.lpAttributedLogins ?? 0) === 0) {
      return "LP ref付き流入が未計測です。SNS投稿リンクを /login?ref=lp-hero&src=x&ab=a の形式で統一してください。";
    }
    return "LP→登録率が20%未満です。ヒーロー見出しとCTA文言をホテル業務課題にさらに寄せるのが有効です。";
  }, [onboardingFunnel?.lpAttributedLogins, week1Snapshot.lpRate]);

  const onCreateFromTemplate = useCallback(async (templateIndex: number) => {
    try {
      setSuccess("テンプレートを複製中...");
      const id = await createInformationFromTemplate(templateIndex);
      router.push(`/editor/${id}?guide=start`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "新規作成に失敗しました");
    }
  }, [router]);

  async function onCreateFromTemplateQuickPublish(templateIndex: number) {
    setCreatingQuickPublish(true);
    try {
      await ensureUserHotelScope();
      const id = await createInformationFromTemplate(templateIndex);
      await updateInformation(id, { status: "published" });
      setSuccess("テンプレ複製から即公開しました。次に内容確認へ進んでください。");
      router.push(`/editor/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "テンプレ即公開に失敗しました");
    } finally {
      setCreatingQuickPublish(false);
    }
  }

  function onToggleTemplateFavorite(templateIndex: number) {
    setFavoriteTemplateIndices((prev) => {
      const next = prev.includes(templateIndex)
        ? prev.filter((value) => value !== templateIndex)
        : [...prev, templateIndex];
      void setSharedTemplateFavorite(templateIndex, next.includes(templateIndex)).catch(() => {
        // no-op
      });
      return next;
    });
  }

  async function onCreateBlank() {
    try {
      await ensureUserHotelScope();
      const id = await createBlankInformation();
      router.push(`/editor/${id}?guide=start`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "新規作成に失敗しました");
    }
  }

  async function onSaveHotelName() {
    const nextName = hotelNameDraft.trim();
    if (!nextName) {
      setError("施設名を入力してください");
      return;
    }
    setSavingHotelName(true);
    setError(null);
    setSuccess(null);
    try {
      await updateCurrentHotelName(nextName);
      setHotelName(nextName);
      setEditingHotelName(false);
      setSuccess("施設名を更新しました");
    } catch (e) {
      setError(e instanceof Error ? e.message : "施設名の更新に失敗しました");
    } finally {
      setSavingHotelName(false);
    }
  }

  async function onStartStripeCheckout() {
    setCreatingCheckout(true);
    setError(null);
    setSuccess(null);
    try {
      await trackUpgradeClick("dashboard");
      const url = await createStripeCheckoutSession();
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Stripe Checkoutの開始に失敗しました");
      setCreatingCheckout(false);
    }
  }

  async function onResumeCheckout() {
    try {
      await trackBillingResumeClick();
    } catch {
      // no-op
    }
    await onStartStripeCheckout();
  }

  async function onOpenBillingPortal() {
    setOpeningPortal(true);
    setError(null);
    setSuccess(null);
    try {
      const url = await createStripePortalSession();
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Customer Portalの開始に失敗しました");
      setOpeningPortal(false);
    }
  }

  async function refreshInviteData() {
    const [rows, metrics] = await Promise.all([listCurrentHotelInvites(20), getCurrentHotelInviteMetrics()]);
    setInvites(rows);
    setInviteMetrics(metrics);
  }

  async function onCreateInvite() {
    setCreatingInvite(true);
    setError(null);
    setSuccess(null);
    try {
      const invite = await createHotelInvite();
      await navigator.clipboard.writeText(invite.code);
      setSuccess(`招待コード ${invite.code} を発行しました（コピー済み）`);
      await Promise.all([refreshInviteData(), listCurrentHotelAuditLogs().then(setAuditLogs)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "招待コードの発行に失敗しました");
    } finally {
      setCreatingInvite(false);
    }
  }

  async function onCopyInvite(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setSuccess(`招待コード ${code} をコピーしました`);
    } catch {
      setError("招待コードのコピーに失敗しました");
    }
  }

  async function onRevokeInvite(inviteId: string) {
    setRevokingInviteId(inviteId);
    setError(null);
    setSuccess(null);
    try {
      await revokeHotelInvite(inviteId);
      setSuccess("招待コードを無効化しました");
      await Promise.all([refreshInviteData(), listCurrentHotelAuditLogs().then(setAuditLogs)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "招待コードの無効化に失敗しました");
    } finally {
      setRevokingInviteId(null);
    }
  }

  async function onSignOut() {
    await signOut();
    router.replace("/login");
  }

  function upsertItemsWithSort(nextItems: Information[]) {
    const byId = new Map<string, Information>();
    for (const entry of nextItems) {
      byId.set(entry.id, entry);
    }
    return Array.from(byId.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async function finalizeDeleteBatch(batchId: string, deletingItems: Information[], label: string) {
    deleteTimersRef.current.delete(batchId);
    setPendingDeleteBatches((prev) => prev.filter((batch) => batch.id !== batchId));
    const results = await Promise.allSettled(
      deletingItems.map((target) => deleteInformation(target.id).then(() => target.id)),
    );
    const failedIds = new Set(
      results
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((_, index) => deletingItems[index]?.id)
        .filter(Boolean),
    );
    if (failedIds.size > 0) {
      const failedItems = deletingItems.filter((entry) => failedIds.has(entry.id));
      setItems((prev) => upsertItemsWithSort([...prev, ...failedItems]));
      setError(`「${label}」の削除で一部失敗しました。再試行してください。`);
      return;
    }
    setSuccess(`「${label}」を削除しました`);
  }

  function scheduleDeleteBatch(targets: Information[], label: string) {
    const batchId = crypto.randomUUID();
    const expiresAt = Date.now() + 5000;
    setError(null);
    setSuccess(`「${label}」を削除しました。5秒以内なら取り消せます。`);
    setItems((prev) => prev.filter((entry) => !targets.some((target) => target.id === entry.id)));
    setPendingDeleteBatches((prev) => [...prev, { id: batchId, label, items: targets, expiresAt }]);
    const timerId = window.setTimeout(() => {
      void finalizeDeleteBatch(batchId, targets, label);
    }, 5000);
    deleteTimersRef.current.set(batchId, timerId);
  }

  function onDeleteInformation(item: Information) {
    if (pendingDeleteIds.has(item.id)) {
      return;
    }
    scheduleDeleteBatch([item], item.title);
  }

  function onDeleteProjectGroup(group: ProjectFileGroup) {
    const targets = [group.hub, ...group.pages];
    if (targets.some((target) => pendingDeleteIds.has(target.id))) {
      return;
    }
    scheduleDeleteBatch(targets, `${group.hub.title}（プロジェクト）`);
  }

  function onUndoDeleteBatch(batchId: string) {
    const timerId = deleteTimersRef.current.get(batchId);
    if (typeof timerId === "number") {
      window.clearTimeout(timerId);
      deleteTimersRef.current.delete(batchId);
    }
    setPendingDeleteBatches((prev) => {
      const batch = prev.find((entry) => entry.id === batchId);
      if (batch) {
        setItems((itemsPrev) => upsertItemsWithSort([...itemsPrev, ...batch.items]));
        setSuccess(`「${batch.label}」の削除を取り消しました`);
      }
      return prev.filter((entry) => entry.id !== batchId);
    });
  }

  useEffect(() => {
    const timers = deleteTimersRef.current;
    return () => {
      for (const timerId of timers.values()) {
        window.clearTimeout(timerId);
      }
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (pendingDeleteBatches.length === 0) {
      return;
    }
    const timerId = window.setInterval(() => {
      setCountdownNow(Date.now());
    }, 250);
    return () => {
      window.clearInterval(timerId);
    };
  }, [pendingDeleteBatches.length]);

  function dismissQuickStart() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(QUICKSTART_DISMISSED_KEY, "1");
    }
    setShowQuickStart(false);
  }

  async function onRunRecovery(action: "ensure_scope" | "sync_subscription") {
    setRecoveringAction(action);
    setError(null);
    setSuccess(null);
    try {
      const message = await runOpsRecoveryAction(action);
      setSuccess(message);
      await Promise.all([
        refreshOpsHealth(),
        listCurrentHotelAuditLogs().then(setAuditLogs),
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "復旧操作に失敗しました");
    } finally {
      setRecoveringAction(null);
    }
  }

  async function onRunOpsAlertTest() {
    setSendingOpsTest(true);
    setError(null);
    setSuccess(null);
    try {
      const message = await runOpsAlertTest();
      setSuccess(message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "通知テストに失敗しました");
    } finally {
      setSendingOpsTest(false);
    }
  }

  function onWizardClose() {
    if (wizardVisible && (wizardStep < 3 || !wizardQrDistributed)) {
      const resume = { step: wizardStep, updatedAt: new Date().toISOString() };
      setWizardResume(resume);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(WIZARD_RESUME_STORAGE_KEY, JSON.stringify(resume));
      }
      void trackOnboardingWizardEvent("wizard_dropoff", { step: wizardStep, reason: wizardDropoffReason });
      setSuccess(`ウィザードを中断しました。再開リンク（Step ${wizardStep}）から続けられます。`);
    }
    setWizardVisible(false);
  }

  function onWizardNext() {
    if (wizardStep < 3) {
      const nextStep = (wizardStep + 1) as 2 | 3;
      void trackOnboardingWizardEvent("wizard_step_completed", { step: wizardStep });
      setWizardStep(nextStep);
      return;
    }
    if (!wizardQrDistributed) {
      setError("QR配布が完了したらチェックを入れてください。");
      return;
    }
    void trackOnboardingWizardEvent("wizard_step_completed", {
      step: 3,
      reason: wizardQrDistributedAt ? `qr_distributed:${wizardQrDistributedAt}` : "qr_distributed",
    });
    void trackOnboardingWizardEvent("wizard_completed", { step: 3 });
    setWizardResume(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(WIZARD_RESUME_STORAGE_KEY);
    }
    setWizardQrDistributed(false);
    setWizardQrDistributedAt(null);
    setWizardVisible(false);
    setSuccess("初回公開ウィザードを完了しました。テンプレを選んで公開を進めましょう。");
  }

  async function onReevaluateTop3Templates() {
    setReevaluatingTop3(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const now = new Date().toISOString();
      setTop3ReevaluatedAt(now);
      setSuccess(`Top3テンプレを再評価しました（${formatDate(now)}）`);
    } finally {
      setReevaluatingTop3(false);
    }
  }

  function onCapturePerformanceSnapshot() {
    const byPath = (opsHealth?.performance7d.lcpByPage ?? []).map((row) => ({
      path: row.path,
      lcpMs: row.lcpMs,
      inpMs: row.inpMs,
      cls: row.cls,
      samples: row.samples,
    }));
    if (byPath.length === 0) {
      setError("比較用の速度データがありません。計測後に再実行してください。");
      return;
    }
    const snapshot = { capturedAt: new Date().toISOString(), byPath };
    setPerfSnapshot(snapshot);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(OPS_PERF_SNAPSHOT_KEY, JSON.stringify(snapshot));
    }
    setSuccess("速度比較のベースラインを記録しました。");
  }

  async function onLockRestartWinnerPath() {
    if (!opsHealth?.restart7d?.byPathRetention) {
      return;
    }
    setLockingRestartWinner(true);
    try {
      const entries: Array<{
        path: "template" | "draft" | "publish";
        score: number;
      }> = [
        { path: "template", score: (opsHealth.restart7d.byPathRetention.template.rate7d ?? 0) + (opsHealth.restart7d.byPathRetention.template.rate14d ?? 0) },
        { path: "draft", score: (opsHealth.restart7d.byPathRetention.draft.rate7d ?? 0) + (opsHealth.restart7d.byPathRetention.draft.rate14d ?? 0) },
        { path: "publish", score: (opsHealth.restart7d.byPathRetention.publish.rate7d ?? 0) + (opsHealth.restart7d.byPathRetention.publish.rate14d ?? 0) },
      ];
      const winner = entries.sort((a, b) => b.score - a.score)[0]?.path;
      if (!winner) {
        return;
      }
      await trackRestartWinnerLocked(winner);
      setSuccess(`再開勝ち導線を固定しました（${winner}）`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "勝ち導線の固定に失敗しました");
    } finally {
      setLockingRestartWinner(false);
    }
  }

  async function onSendWeeklyReport() {
    setSendingWeeklyReport(true);
    setError(null);
    setSuccess(null);
    try {
      const message = await runOpsWeeklyReport(weeklyOpsReport, {
        improvementExecutionRate: opsHealth?.week15Preview.weeklyReportImprovementExecutionRate ?? opsHealth?.week10Preview.actionExecutionRate ?? 0,
      });
      setSuccess(message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "週次レポート送信に失敗しました");
    } finally {
      setSendingWeeklyReport(false);
    }
  }

  async function onCreateProjectWithName() {
    const title = normalizeProjectName(newProjectName);
    if (!title) {
      setError("プロジェクト名を入力してください");
      return;
    }
    if (title.length < 2) {
      setError("プロジェクト名は2文字以上で入力してください");
      return;
    }
    setCreatingProject(true);
    setError(null);
    setSuccess(null);
    try {
      await ensureUserHotelScope();
      const id = await createBlankInformation(title);
      const created = await getInformation(id);
      if (!created) {
        throw new Error("新規プロジェクトの取得に失敗しました");
      }
      const nextTheme = {
        ...created.theme,
        nodeMap: {
          enabled: true,
          nodes: [],
          edges: [],
        },
      };
      await updateInformation(id, { title, theme: nextTheme });
      const nextItem: Information = {
        ...created,
        title,
        theme: nextTheme,
        updatedAt: new Date().toISOString(),
      };
      setItems((prev) => upsertItemsWithSort([nextItem, ...prev]));
      setShowCreateProjectModal(false);
      setNewProjectName("");
      setSuccess(`プロジェクト「${title}」を作成しました`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "プロジェクト作成に失敗しました");
    } finally {
      setCreatingProject(false);
    }
  }

  return (
    <AuthGate>
      <main
        className="lux-main ux-route-fade min-h-screen bg-[radial-gradient(circle_at_top_right,#86efac33_0%,#34d39926_24%,#ecfdf5_58%,#dcfce7_100%)] px-2 pt-3 pb-6 sm:px-3 sm:pb-7 lg:pl-[82px] lg:pr-6"
      >
        <div className="mx-auto w-full max-w-[1820px] space-y-2">
          {activeTab === "dashboard" && (
          <header className="lux-card lux-section-card rounded-3xl p-4 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="lux-kicker text-xs">店舗管理</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {editingHotelName ? (
                    <>
                      <input
                        value={hotelNameDraft}
                        onChange={(e) => setHotelNameDraft(e.target.value)}
                        className="min-w-[220px] rounded-lg border border-slate-300 px-3 py-1.5 text-xl font-semibold text-slate-900"
                        placeholder="施設名"
                      />
                      <button
                        type="button"
                        disabled={savingHotelName}
                        onClick={() => void onSaveHotelName()}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-60"
                      >
                        {savingHotelName ? "保存中..." : "保存"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingHotelName(false);
                          setHotelNameDraft(hotelName);
                        }}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl font-semibold text-slate-900">{hotelName || "Infomii"}</h1>
                      <button
                        type="button"
                        onClick={() => setEditingHotelName(true)}
                        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                        title="施設名を編集"
                        aria-label="施設名を編集"
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  誰でも迷わずページ作成と公開管理ができます。
                </p>
                {canAccessOps && (
                  <p className="mt-1 inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                    管理者モード: 運用センター表示中
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void onCreateBlank()}
                  className="lux-btn-primary rounded-xl px-4 py-2 text-sm font-medium"
                >
                  + ページ作成
                </button>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50"
                >
                  ログアウト
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="現在プラン"
                value={subscription?.plan ?? "-"}
                note={`status: ${subscription?.status ?? "-"}`}
              />
              <StatCard
                label="公開中"
                value={`${published.length}`}
                note={`上限 ${subscription?.maxPublishedPages ?? "-"} 件`}
              />
              <StatCard label="下書き" value={`${draft.length}`} note="公開前の下書き件数" />
              <StatCard label="合計ページ" value={`${items.length}`} note="公開中 + 下書き" />
            </div>
          </header>
          )}

          {/* Stripe-style overview: page table + QR analytics */}
          {activeTab === "dashboard" && !dashboardCompactMode && (
            <section className="space-y-4">
              <DashboardHeaderBar
                hotelName={hotelName}
                onEditHotelName={() => setEditingHotelName(true)}
                actions={
                  <>
                    <button
                      type="button"
                      onClick={() => void onCreateBlank()}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      ページ作成
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("project")}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      プロジェクト一覧
                    </button>
                  </>
                }
              />
              <DashboardQrAnalytics
                metrics={viewMetrics}
                loading={loadingMetrics}
              />
              <DashboardPageList
                loading={loading}
                rows={items.map((item) => {
                  const stat = viewMetrics?.pageStats?.find(
                    (p) => p.informationId === item.id
                  );
                  return {
                    id: item.id,
                    title: item.title,
                    slug: item.slug,
                    views7d: stat?.views ?? 0,
                    qrViews7d: stat?.qrViews ?? 0,
                    status: item.status,
                  };
                })}
              />
            </section>
          )}

          {pendingDeleteBatches.length > 0 && (
            <div className="fixed bottom-5 right-5 z-50 space-y-2">
              {pendingDeleteBatches.map((batch) => (
                <div key={batch.id} className="min-w-[260px] rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
                  <p className="text-xs text-slate-700">「{batch.label}」を削除しました</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-500">
                      {Math.max(1, Math.ceil((batch.expiresAt - countdownNow) / 1000))}秒以内なら取り消せます
                    </p>
                    <button
                      type="button"
                      onClick={() => onUndoDeleteBatch(batch.id)}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-xs text-emerald-800 hover:bg-emerald-100"
                    >
                      取り消し
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {showCreateProjectModal && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/35 px-4">
              <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
                <h3 className="text-base font-semibold text-slate-900">新規プロジェクトを作成</h3>
                <p className="mt-1 text-xs text-slate-500">
                  プロジェクト名を入力すると、ノードマップ付きの親ページを作成します。
                </p>
                <input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void onCreateProjectWithName();
                    }
                  }}
                  placeholder="例: 館内総合案内"
                  className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-[11px] text-slate-500">2文字以上で入力してください。</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateProjectModal(false);
                      setNewProjectName("");
                    }}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={() => void onCreateProjectWithName()}
                    disabled={creatingProject || !canCreateProject}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {creatingProject ? "作成中..." : "作成する"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === "dashboard" && !dashboardCompactMode && (
            <article className="rounded-2xl lux-section-card border border-emerald-200/80 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-slate-900">Free / Pro 比較</h2>
                {isProActive ? (
                  <span className="rounded-md bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-800">
                    現在Proプランです
                  </span>
                ) : shouldShowUpgradeCta ? (
                  <button
                    type="button"
                    onClick={() => void onStartStripeCheckout()}
                    disabled={creatingCheckout}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {creatingCheckout ? "遷移中..." : "Proにアップグレード"}
                  </button>
                ) : (
                  <span className="text-xs text-slate-500">公開枠が80%を超えるとアップグレード導線を表示します</span>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <p className="font-medium text-slate-500">項目</p>
                <p className="font-medium text-slate-500">Free</p>
                <p className="font-medium text-slate-500">Pro</p>
                <p>公開ページ上限</p>
                <p>3件</p>
                <p>1000件</p>
                <p>請求書・カード管理</p>
                <p>不可</p>
                <p>利用可</p>
                <p>おすすめ用途</p>
                <p>小規模運用</p>
                <p>本番運用 / 複数案件</p>
              </div>
              {isPeakSeason && !isProActive && (
                <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  繁忙期シーズンのため、Pro導線を優先表示しています（混雑時の案内更新と複数ページ運用を想定）。
                </p>
              )}
            </article>
          )}
          {activeTab === "dashboard" && !dashboardCompactMode && showQuickStart && (
            <div className="rounded-2xl lux-section-card border border-emerald-200 bg-emerald-50/70 p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-[240px]">
                  <p className="text-sm font-semibold text-emerald-900">初回セットアップ（1画面完了）</p>
                  <p className="mt-1 text-xs text-emerald-800">テンプレ選択から公開まで、この画面内の4ステップで進めます。</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("create");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500"
                  >
                    セットアップ開始
                  </button>
                  <button
                    type="button"
                    onClick={dismissQuickStart}
                    className="rounded-md border border-transparent px-2 py-1 text-xs text-emerald-700 hover:border-emerald-200 hover:bg-emerald-100/70"
                    aria-label="初回セットアップを閉じる"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ["1. テンプレ選択", "業種と用途でテンプレを選ぶ"],
                  ["2. 必要情報を編集", "営業時間・料金・導線を調整"],
                  ["3. 公開前チェック", "不足項目を自動検出して修正"],
                  ["4. 公開してQR配布", "URL/QRで現場運用を開始"],
                ].map(([title, description]) => (
                  <div key={title} className="rounded-xl border border-emerald-200 bg-white/80 px-3 py-2">
                    <p className="text-xs font-semibold text-emerald-900">{title}</p>
                    <p className="mt-1 text-[11px] text-slate-600">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "dashboard" && !dashboardCompactMode && (
            <article className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-sky-900">導入初日チェックリスト（固定）</p>
                <p className="text-xs text-sky-800">この5項目が埋まれば運用開始できます</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  { label: "施設名を設定", done: hotelName.trim().length > 0 },
                  { label: "テンプレ/新規作成", done: items.length > 0 },
                  { label: "1ページ公開", done: published.length > 0 },
                  { label: "スタッフ招待発行", done: (inviteMetrics?.issued ?? 0) > 0 },
                  { label: "A4 QR配布準備", done: published.length > 0 },
                ].map((entry) => (
                  <div key={entry.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <p className={`text-xs font-semibold ${entry.done ? "text-emerald-700" : "text-slate-500"}`}>
                      {entry.done ? "✓" : "・"} {entry.label}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          )}
          {activeTab === "dashboard" && dashboardCompactMode && (
            <section className="space-y-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-slate-900">今日やること</h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab("create")}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                  >
                    作成へ進む
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    1. テンプレ/新規作成
                  </p>
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    2. 1ページ公開
                  </p>
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    3. URL/QR共有
                  </p>
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    4. 請求状態確認
                  </p>
                </div>
              </article>
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-slate-900">契約・請求</h2>
                  <button
                    type="button"
                    disabled={openingPortal || !subscription?.hasStripeCustomer}
                    onClick={onOpenBillingPortal}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
                  >
                    {openingPortal ? "遷移中..." : "請求書・カード管理"}
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    現在プラン: {subscription?.plan ?? "-"}
                  </p>
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    支払い状態: {subscription?.status ?? "-"}
                  </p>
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    次回更新日: {nextRenewalLabel}
                  </p>
                </div>
                {!isProActive && (
                  <div className="mt-2">
                    <button
                      type="button"
                      disabled={creatingCheckout}
                      onClick={() => void onStartStripeCheckout()}
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                      {creatingCheckout ? "遷移中..." : "Proにアップグレード"}
                    </button>
                  </div>
                )}
              </article>
            </section>
          )}

          <div className="relative">
            <aside className="rounded-3xl border border-emerald-200/70 bg-white p-2 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.7)] backdrop-blur lg:fixed lg:left-0 lg:top-0 lg:z-20 lg:flex lg:h-screen lg:w-[72px] lg:flex-col lg:rounded-none lg:rounded-r-3xl">
              <div className="flex flex-row items-center justify-center gap-2 lg:flex-col lg:gap-3">
                <SideNavButton label="トップページへ" onClick={() => router.push("/")}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 10.5 12 3l9 7.5" />
                    <path d="M5 9.5V21h14V9.5" />
                  </svg>
                </SideNavButton>
                <SideNavButton
                  label="ダッシュボード"
                  active={activeTab === "dashboard"}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="3" width="8" height="8" rx="1.5" />
                    <rect x="13" y="3" width="8" height="5" rx="1.5" />
                    <rect x="13" y="10" width="8" height="11" rx="1.5" />
                    <rect x="3" y="13" width="8" height="8" rx="1.5" />
                  </svg>
                </SideNavButton>
                <SideNavButton
                  label="作成"
                  active={activeTab === "create"}
                  onClick={() => setActiveTab("create")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                    <rect x="3" y="3" width="18" height="18" rx="2.5" />
                  </svg>
                </SideNavButton>
                <SideNavButton
                  label="プロジェクト"
                  active={activeTab === "project"}
                  onClick={() => setActiveTab("project")}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 9h18" />
                  </svg>
                </SideNavButton>
                {canAccessOps && (
                  <SideNavButton
                    label="運用センター"
                    active={activeTab === "ops"}
                    onClick={() => setActiveTab("ops")}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 20h16" />
                      <path d="M7 17v-3" />
                      <path d="M12 17v-6" />
                      <path d="M17 17v-9" />
                      <circle cx="7" cy="10" r="1.2" />
                      <circle cx="12" cy="7" r="1.2" />
                      <circle cx="17" cy="4" r="1.2" />
                    </svg>
                  </SideNavButton>
                )}
              </div>
              <div className="mt-auto hidden lg:flex lg:flex-col lg:items-center lg:gap-3">
                <SideNavButton label="利用規約へ" onClick={() => router.push("/terms")}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 3h9l3 3v15H6z" />
                    <path d="M15 3v4h3" />
                    <path d="M9 12h6M9 16h6" />
                  </svg>
                </SideNavButton>
                <SideNavButton label="ログアウト" onClick={onSignOut}>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                </SideNavButton>
              </div>
            </aside>

            <div
              key={loading ? "loading" : activeTab}
              className={`space-y-3 ${loading ? "" : "dashboard-tab-fade"}`}
            >
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="h-4 w-36 rounded ux-skeleton" />
                <div className="mt-3 h-9 w-72 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-96 rounded bg-slate-200" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={`sk-stat-${i}`} className="h-24 rounded-2xl bg-slate-200" />
                  ))}
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="h-48 rounded-2xl border border-slate-200/80 bg-white" />
                  <div className="h-48 rounded-2xl border border-slate-200/80 bg-white" />
                </div>
                <div className="space-y-4">
                  <div className="h-40 rounded-2xl border border-slate-200/80 bg-white" />
                  <div className="h-56 rounded-2xl border border-slate-200/80 bg-white" />
                </div>
              </div>
            </div>
          ) : activeTab === "create" ? (
            <section className="space-y-4">
              <div className="lux-card rounded-3xl bg-gradient-to-r from-emerald-100/70 via-teal-100/70 to-cyan-100/60 p-6 shadow-sm">
                <p className="text-center text-4xl font-light tracking-wide text-emerald-800">さあ、何を作成しますか？</p>
                <div className="mx-auto mt-4 max-w-3xl">
                  <input
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    placeholder="テンプレートを検索（タイトル / 本文）"
                    className="w-full rounded-2xl border border-emerald-300/70 bg-white/95 px-4 py-3 text-sm text-slate-800 shadow-sm outline-none ring-emerald-300 focus:ring"
                  />
                </div>
                <div className="mx-auto mt-3 flex max-w-5xl items-center justify-center">
                  <p className="rounded-full border border-emerald-300 bg-white/90 px-3 py-1 text-xs text-emerald-900">
                    施設タイプ推定: {FACILITY_LABELS[inferredFacilityType]}（おすすめカテゴリを自動選択）
                  </p>
                </div>
                {!createCompactMode && (
                <div className="mx-auto mt-2 flex max-w-5xl flex-wrap items-center justify-center gap-2">
                  <label className="text-xs text-slate-600" htmlFor="room-count-input">客室数</label>
                  <input
                    id="room-count-input"
                    type="number"
                    min={1}
                    value={roomCountInput}
                    onChange={(e) => setRoomCountInput(e.target.value)}
                    className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                  />
                  <p className="rounded-full border border-cyan-300 bg-white/90 px-3 py-1 text-xs text-cyan-900">
                    規模推定: {SCALE_LABELS[hotelScale]} / 推奨用途: {TEMPLATE_PURPOSE_LABELS[recommendedPurposeByScale]}
                  </p>
                </div>
                )}
                <div className="mx-auto mt-3 flex max-w-5xl flex-wrap justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectIndustryFilter("all")}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      industryFilter === "all"
                        ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                        : "border-slate-300 bg-white/90 text-slate-700 hover:bg-white"
                    }`}
                  >
                    すべて
                  </button>
                  {(Object.entries(INDUSTRY_PRESET_LABELS) as Array<[IndustryPreset, string]>).map(
                    ([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onSelectIndustryFilter(key)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          industryFilter === key
                            ? "border-emerald-400 bg-emerald-100 text-emerald-900"
                            : "border-slate-300 bg-white/90 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>
                <div className="mx-auto mt-2 flex max-w-5xl flex-wrap justify-center gap-1.5">
                  {(Object.entries(TEMPLATE_PURPOSE_LABELS) as Array<[TemplatePurposeFilter, string]>).map(
                    ([key, label]) => (
                      <button
                        key={`purpose-${key}`}
                        type="button"
                        onClick={() => setPurposeFilter(key)}
                        className={`rounded-full border px-3 py-1 text-xs ${
                          purposeFilter === key
                            ? "border-cyan-400 bg-cyan-100 text-cyan-900"
                            : "border-slate-300 bg-white/90 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {label}
                      </button>
                    ),
                  )}
                </div>
                {!createCompactMode && (
                <>
                <div className="mx-auto mt-2 flex max-w-5xl flex-wrap justify-center gap-1.5">
                  {([
                    ["industry", "業種別"],
                    ["scene", "シーン別"],
                  ] as Array<[TemplateGrouping, string]>).map(([value, label]) => (
                    <button
                      key={`grouping-${value}`}
                      type="button"
                      onClick={() => setTemplateGrouping(value)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        templateGrouping === value
                          ? "border-violet-500 bg-violet-600 text-white"
                          : "border-slate-300 bg-white/90 text-slate-700 hover:bg-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="mx-auto mt-2 flex max-w-5xl flex-wrap justify-center gap-1.5">
                  {([
                    ["recommended", "おすすめ順"],
                    ["latest", "追加順"],
                  ] as Array<[TemplateSortMode, string]>).map(([value, label]) => (
                    <button
                      key={`sort-${value}`}
                      type="button"
                      onClick={() => setTemplateSortMode(value)}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        templateSortMode === value
                          ? "border-emerald-500 bg-emerald-600 text-white"
                          : "border-slate-300 bg-white/90 text-slate-700 hover:bg-white"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                </>
                )}
              </div>

              {!createCompactMode && (
              <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.08em] text-cyan-800">初回公開ウィザード（3画面）</p>
                    <p className="mt-1 text-sm text-slate-700">新規登録直後はこの順で進めると最短で公開できます。</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (wizardVisible) {
                        return;
                      }
                      setWizardVisible(true);
                      setWizardStep(1);
                      setWizardQrDistributed(false);
                      setWizardResume(null);
                      if (typeof window !== "undefined") {
                        window.localStorage.removeItem(WIZARD_RESUME_STORAGE_KEY);
                      }
                      void trackOnboardingWizardEvent("wizard_started", { step: 1, reason: "manual_open" });
                    }}
                    className="rounded-md border border-cyan-300 bg-white px-3 py-1 text-xs text-cyan-800 hover:bg-cyan-50"
                  >
                    {wizardVisible ? "ウィザード表示中" : "ウィザードを開始"}
                  </button>
                </div>
                <div className="mt-2 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs text-cyan-900">
                  1画面目完了率（7日）: {onboardingFunnel?.wizard.step1CompletionRate ?? 0}% / 開始 {onboardingFunnel?.wizard.started ?? 0} / 完了 {onboardingFunnel?.wizard.step1Completed ?? 0}
                </div>
                <div className="mt-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                  QR配布完了（7日）: {onboardingFunnel?.wizard.qrDistributedCompleted ?? 0}件 / ウィザード完了者7日継続率: {onboardingFunnel?.wizard.retention7d.rate ?? 0}%（対象 {onboardingFunnel?.wizard.retention7d.eligible ?? 0} / 継続 {onboardingFunnel?.wizard.retention7d.retained ?? 0}）
                </div>
                <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900">
                  LP作成導線完了率（7日）: {onboardingFunnel?.templateCreateFlow.completionRate ?? 0}%（意図ありログイン {onboardingFunnel?.templateCreateFlow.intentLogins ?? 0} / 編集画面到達 {onboardingFunnel?.templateCreateFlow.editorOpened ?? 0}）
                </div>
                {(onboardingFunnel?.templateCreateFlow.intentLogins ?? 0) === 0 && (
                  <div className="mt-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                    計測準備中: LPの「作成する」経由でログインが発生すると、この指標の集計が始まります。
                  </div>
                )}
                <div className="mt-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs text-violet-900">
                  離脱理由（7日）: {(opsHealth?.week14Preview.wizardDropoffByReason ?? []).map((row) => `${row.reason} ${row.count}件`).join(" / ") || "データなし"}
                </div>
                {wizardQrDistributedAt ? (
                  <div className="mt-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                    QR配布証跡: {formatDate(wizardQrDistributedAt)}
                  </div>
                ) : null}
                {wizardResume && !wizardVisible ? (
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                    <p className="text-xs font-semibold text-amber-900">前回の続きがあります（Step {wizardResume.step}）</p>
                    <p className="mt-1 text-[11px] text-amber-800">
                      中断時刻: {formatDate(wizardResume.updatedAt)}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const resumeUrl = `${window.location.origin}/dashboard?tab=create&wizard=1`;
                        const body = `Infomii 初回公開ウィザードの再開リンクです。\n${resumeUrl}\n（前回: Step ${wizardResume.step}）`;
                        void navigator.clipboard.writeText(body).then(() => setSuccess("再開リンク付きメール文面をコピーしました"));
                      }}
                      className="mt-2 rounded-md border border-amber-300 bg-white px-3 py-1 text-xs text-amber-900 hover:bg-amber-100"
                    >
                      メール文面をコピー
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWizardVisible(true);
                        setWizardStep(wizardResume.step);
                        setWizardQrDistributed(false);
                        void trackOnboardingWizardEvent("wizard_started", { step: wizardResume.step, reason: "resume_link" });
                      }}
                      className="mt-2 rounded-md border border-amber-300 bg-white px-3 py-1 text-xs text-amber-900 hover:bg-amber-100"
                    >
                      再開する
                    </button>
                  </div>
                ) : null}
                {wizardVisible ? (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {wizardStep === 1
                          ? "1. 目的で絞る"
                          : wizardStep === 2
                            ? "2. テンプレ選択"
                            : "3. 編集して公開"}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {wizardStep === 1
                          ? "チェックイン/館内案内などでテンプレを絞り込みます。"
                          : wizardStep === 2
                            ? "想定表示時間と必要入力項目数を見て選択します。"
                            : "不足項目を入力して公開し、URL/QRを配布します。"}
                      </p>
                      {wizardStep === 3 ? (
                        <label className="mt-3 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-900">
                          <input
                            type="checkbox"
                            checked={wizardQrDistributed}
                            onChange={(event) => {
                              setWizardQrDistributed(event.target.checked);
                              setWizardQrDistributedAt(event.target.checked ? new Date().toISOString() : null);
                            }}
                            className="h-4 w-4 rounded border-emerald-400"
                          />
                          QR配布まで完了した
                        </label>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={wizardDropoffReason}
                        onChange={(event) =>
                          setWizardDropoffReason(
                            event.target.value as "manual_close" | "time_shortage" | "content_not_ready" | "other",
                          )
                        }
                        className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
                      >
                        <option value="manual_close">離脱理由: 手動終了</option>
                        <option value="time_shortage">離脱理由: 時間不足</option>
                        <option value="content_not_ready">離脱理由: 素材未準備</option>
                        <option value="other">離脱理由: その他</option>
                      </select>
                      <button
                        type="button"
                        onClick={onWizardClose}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        閉じる
                      </button>
                      <button
                        type="button"
                        onClick={onWizardNext}
                        className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-100"
                      >
                        {wizardStep < 3 ? "次へ" : "完了"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
              )}

              {!createCompactMode && (
              <article className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-violet-900">施設規模別 初回公開ガイド</p>
                  <div className="flex items-center gap-2">
                    <input
                      value={roomCountInput}
                      onChange={(event) => setRoomCountInput(event.target.value)}
                      className="w-20 rounded-md border border-violet-200 bg-white px-2 py-1 text-xs text-slate-700"
                      inputMode="numeric"
                      placeholder="客室数"
                    />
                    <span className="text-xs text-violet-800">{SCALE_LABELS[hotelScale]}</span>
                  </div>
                </div>
                <div className="mt-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-xs text-violet-900">
                  採用率が高い業態を優先表示中: {INDUSTRY_PRESET_LABELS[topAdoptedIndustry]}
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {SCALE_GUIDE[hotelScale].map((step) => (
                    <p key={step} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                      ・{step}
                    </p>
                  ))}
                </div>
                <div className="mt-2 rounded-lg border border-indigo-200 bg-white p-3">
                  <p className="text-xs font-semibold text-indigo-900">公開後48時間アクション（自動提案）</p>
                  <div className="mt-1 space-y-1 text-xs text-slate-700">
                    {week10RecommendedActions48h.map((action) => (
                      <p key={action}>・{action}</p>
                    ))}
                  </div>
                </div>
              </article>
              )}

              {!createCompactMode && (
              <article className="rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 shadow-sm">
                <p className="text-sm font-semibold text-cyan-900">Week12 最短公開導線（規模別）</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {([
                    ["small", "小規模"],
                    ["mid", "中規模"],
                    ["large", "大規模"],
                  ] as const).map(([scale, label]) => {
                    const entry = shortestTemplateByScale[scale];
                    return (
                      <div key={scale} className="rounded-lg border border-cyan-200 bg-white p-3">
                        <p className="text-[11px] font-semibold text-cyan-800">{label}</p>
                        <p className="mt-1 line-clamp-2 text-xs font-semibold text-slate-900">{entry?.template.title ?? "該当なし"}</p>
                        <p className="mt-1 text-[11px] text-slate-600">
                          想定 {entry?.viewSeconds ?? 0}秒 / 入力 {entry?.inputCount ?? 0}項目
                        </p>
                        {entry ? (
                          <button
                            type="button"
                            onClick={() => void onCreateFromTemplate(entry.originalIndex)}
                            className="mt-2 rounded-md border border-cyan-300 bg-cyan-50 px-2 py-1 text-[11px] text-cyan-900 hover:bg-cyan-100"
                          >
                            最短テンプレで作成
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 rounded-lg border border-cyan-200 bg-white px-3 py-2 text-xs text-cyan-900">
                  2本目公開導線: {opsHealth?.week11Preview.secondPublishShortcutReady ? "有効" : "1本目公開後に有効"} /
                  1→2本目 中央 {opsHealth?.week11Preview.secondPublishMedianHours ?? 0} 時間
                </div>
                <div className="mt-2 rounded-lg border border-cyan-200 bg-white p-3 text-xs text-slate-700">
                  <p className="font-semibold text-cyan-900">QR配布後24時間アクション（固定）</p>
                  <p className="mt-1">1. 誤字/リンク切れチェック</p>
                  <p>2. トップ導線のCTAクリック確認</p>
                  <p>3. 現場スタッフへ更新完了共有</p>
                </div>
              </article>
              )}

              {!createCompactMode && (
              <article className="rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4 shadow-sm">
                <p className="text-sm font-semibold text-emerald-900">Week11 立ち上げショートカット</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-2">
                    <p className="text-xs text-slate-500">小規模 完了率</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week11Preview.onboardingCompletionByScale.small ?? 0}%</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-2">
                    <p className="text-xs text-slate-500">中規模 完了率</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week11Preview.onboardingCompletionByScale.mid ?? 0}%</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-2">
                    <p className="text-xs text-slate-500">大規模 完了率</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week11Preview.onboardingCompletionByScale.large ?? 0}%</p>
                  </div>
                </div>
                <div className="mt-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-emerald-900">
                  2本目公開ショートカット: {opsHealth?.week11Preview.secondPublishShortcutReady ? "利用可能" : "1本目公開後に有効"} / 1本目→2本目 中央 {opsHealth?.week11Preview.secondPublishMedianHours ?? 0} 時間
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void onCreateFromTemplate(activeTemplatePreviewEntry?.originalIndex ?? 0)}
                    className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-50"
                  >
                    2本目をテンプレから作成
                  </button>
                  <button
                    type="button"
                    onClick={() => void onCreateFromTemplateQuickPublish(activeTemplatePreviewEntry?.originalIndex ?? 0)}
                    disabled={creatingQuickPublish}
                    className="rounded-md border border-emerald-300 bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {creatingQuickPublish ? "公開中..." : "テンプレ複製→即公開"}
                  </button>
                </div>
              </article>
              )}

              {!createCompactMode && (
              <article className="rounded-2xl border border-emerald-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800">最短1クリックで新規作成</p>
                  <button
                    type="button"
                    onClick={() => void onCreateBlank()}
                    className="lux-btn-primary rounded-xl px-4 py-2 text-sm font-medium"
                  >
                    + ページ作成
                  </button>
                </div>
              </article>
              )}

              <article className="rounded-2xl border border-emerald-200/80 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-emerald-900">施設タイプ別 固定Top3テンプレ</p>
                  <div className="flex items-center gap-2">
                    {top3ReevaluatedAt ? (
                      <p className="text-[11px] text-slate-500">最終再評価: {formatDate(top3ReevaluatedAt)}</p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => void onReevaluateTop3Templates()}
                      disabled={reevaluatingTop3}
                      className="rounded-md border border-emerald-300 bg-white px-2 py-1 text-[11px] text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
                    >
                      {reevaluatingTop3 ? "再評価中..." : "再評価（手動）"}
                    </button>
                    <p className="text-xs text-slate-500">{FACILITY_LABELS[inferredFacilityType]}</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {fixedTopTemplatesByFacility.map((entry, index) => (
                    <button
                      key={`fixed-top-${entry.originalIndex}`}
                      type="button"
                      onClick={() => void onCreateFromTemplate(entry.originalIndex)}
                      className="rounded-lg border border-slate-200 bg-white p-3 text-left hover:border-emerald-300 hover:bg-emerald-50/40"
                    >
                      <p className="text-[11px] font-semibold text-emerald-700">TOP {index + 1}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-900 line-clamp-2">{entry.template.title}</p>
                    </button>
                  ))}
                  {fixedTopTemplatesByFacility.length === 0 && (
                    <p className="text-xs text-slate-500">該当テンプレがありません。</p>
                  )}
                </div>
              </article>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="space-y-4">
                  {groupedTemplateEntries.map((group) => (
                    <section key={group.industry} className="space-y-2">
                      <div className="flex items-center justify-between rounded-xl border border-emerald-100/80 bg-emerald-50/60 px-3 py-2">
                        <p className="text-xs font-semibold tracking-[0.08em] text-emerald-800">{group.label}</p>
                        <p className="text-[11px] text-emerald-700">{group.entries.length}件</p>
                      </div>
                      <div className="grid gap-3 lg:grid-cols-3">
                        {group.entries.map(({ template, originalIndex, purposes, scenes, inputCount, viewSeconds, operators, defaultHints }) => {
                          const requirementHints = getTemplateRequirementHints(template);
                          const slaMs = getTemplateSlaMs(template);
                          const quality = getTemplateQualityScore(template);
                          const usageCount = templateUsageCountByTitle.get(template.title) ?? 0;
                          const firstPublish = templateFirstPublishRateByTitle.get(template.title);
                          return (
                          <article
                            key={`${template.title}-${originalIndex}`}
                            role="button"
                            tabIndex={0}
                            onMouseEnter={() => setPreviewTemplateIndex(originalIndex)}
                            onFocus={() => setPreviewTemplateIndex(originalIndex)}
                            onClick={() => void onCreateFromTemplate(originalIndex)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                void onCreateFromTemplate(originalIndex);
                              }
                            }}
                            aria-label={`${template.title} で作成`}
                            className="cursor-pointer rounded-2xl lux-section-card border border-emerald-100 bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-[11px] uppercase tracking-[0.12em] text-emerald-700">
                                {INDUSTRY_PRESET_LABELS[template.industry]}
                              </p>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onToggleTemplateFavorite(originalIndex);
                                  }}
                                  className={`rounded-md border px-1.5 py-0.5 text-[11px] ${
                                    favoriteTemplateSet.has(originalIndex)
                                      ? "border-amber-300 bg-amber-100 text-amber-800"
                                      : "border-slate-200 bg-white text-slate-500"
                                  }`}
                                  title="お気に入り"
                                >
                                  ★
                                </button>
                              </div>
                            </div>
                            <h3 className="mt-1 text-sm font-semibold text-slate-900">{template.title}</h3>
                            {recommendedTemplateByIndustry.get(template.industry) === originalIndex && (
                              <p className="mt-1 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-emerald-800">
                                おすすめ
                              </p>
                            )}
                            {!createCompactMode && usageCount <= 1 && (
                              <p className="mt-1 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-amber-800">
                                改善候補
                              </p>
                            )}
                            {!createCompactMode && usageCount <= 1 && (
                              <p className="mt-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
                                {getLowUsageTemplateImprovementSuggestion(template.industry)}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap gap-1">
                              {purposes.includes(recommendedPurposeByScale) && (
                                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                                  規模推奨
                                </span>
                              )}
                              {purposes.slice(0, 2).map((purpose) => (
                                <span
                                  key={`${template.title}-${purpose}`}
                                  className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-800"
                                >
                                  {TEMPLATE_PURPOSE_LABELS[purpose]}
                                </span>
                              ))}
                              {scenes.slice(0, 2).map((scene) => (
                                <span
                                  key={`${template.title}-${scene}`}
                                  className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-800"
                                >
                                  {TEMPLATE_SCENE_LABELS[scene]}
                                </span>
                              ))}
                            </div>
                            <div className={`mt-2 grid gap-2 text-[11px] text-slate-600 ${createCompactMode ? "grid-cols-1" : "grid-cols-2"}`}>
                              <p className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">想定表示時間: 約{viewSeconds}秒</p>
                              <p className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">必要入力: {inputCount}項目</p>
                            </div>
                            {!createCompactMode && (
                            <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1">想定運用人数: {operators}</p>
                              <p className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                                初回公開率: {firstPublish ? `${firstPublish.rate}%` : "集計中"}
                              </p>
                            </div>
                            )}
                            {!createCompactMode && (
                            <p className="mt-1 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] text-cyan-900">
                              推奨公開時間: {PUBLISH_WINDOW_LABELS[detectTemplatePublishWindow(template)]}
                            </p>
                            )}
                            {!createCompactMode && (
                            <p className="mt-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] text-indigo-900">
                              速度目標: LCP {slaMs}ms 以下
                            </p>
                            )}
                            {!createCompactMode && (
                            <p className={`mt-1 rounded-md border px-2 py-1 text-[11px] ${
                              quality.score >= 80
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                : quality.score >= 60
                                  ? "border-amber-200 bg-amber-50 text-amber-900"
                                  : "border-rose-200 bg-rose-50 text-rose-900"
                            }`}>
                              品質スコア: {quality.score}/100
                            </p>
                            )}
                            {!createCompactMode && quality.score < 80 && (
                              <p className="mt-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-900">
                                不足補完ガイド: {quality.missing.join(" / ")}
                              </p>
                            )}
                            {!createCompactMode && (
                            <p className="mt-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-900">
                              初期値補完: {defaultHints.join(" / ")}
                            </p>
                            )}
                            {!createCompactMode && (
                            <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                              <p className="font-semibold text-slate-700">必須: {requirementHints.required.join(" / ")}</p>
                              <p>推奨: {requirementHints.recommended.join(" / ")}</p>
                            </div>
                            )}
                            <p className={`mt-2 ${createCompactMode ? "line-clamp-2" : "max-h-24 overflow-hidden"} whitespace-pre-wrap text-xs leading-6 text-slate-600`}>
                              {template.body}
                            </p>
                            <p className="mt-3 inline-flex rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white">
                              このテンプレで作成
                            </p>
                          </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                  {filteredTemplateEntries.length === 0 && (
                    <article className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                      検索条件に一致するテンプレートがありません。
                    </article>
                  )}
                </div>

                <aside className="h-fit rounded-2xl border border-emerald-200/80 bg-white p-4 shadow-sm xl:sticky xl:top-4">
                  <p className="text-xs font-semibold tracking-[0.08em] text-emerald-700">テンプレプレビュー</p>
                  {!activeTemplatePreviewEntry ? (
                    <p className="mt-3 text-sm text-slate-500">テンプレートを選択するとここに表示されます。</p>
                  ) : (
                    <>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-slate-500">
                        {INDUSTRY_PRESET_LABELS[activeTemplatePreviewEntry.template.industry]}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold text-slate-900">
                        {activeTemplatePreviewEntry.template.title}
                      </h3>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                        <p className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          想定表示時間: 約{activeTemplatePreviewEntry.viewSeconds}秒
                        </p>
                        <p className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">
                          必要入力: {activeTemplatePreviewEntry.inputCount}項目
                        </p>
                      </div>
                      {!createCompactMode && (
                      <p className="mt-2 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] text-cyan-900">
                        推奨公開時間: {PUBLISH_WINDOW_LABELS[detectTemplatePublishWindow(activeTemplatePreviewEntry.template)]}
                      </p>
                      )}
                      {!createCompactMode && (
                      <p className="mt-2 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] text-indigo-900">
                        速度目標（SLA）: LCP {activeTemplateSlaMs}ms 以下
                      </p>
                      )}
                      {!createCompactMode && activeTemplateRequirements && (
                        <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[11px] text-slate-700">
                          <p className="font-semibold text-slate-800">不足項目チェック（公開前）</p>
                          <p className="mt-1">必須: {activeTemplateRequirements.required.join(" / ")}</p>
                          <p className="mt-1">推奨: {activeTemplateRequirements.recommended.join(" / ")}</p>
                        </div>
                      )}
                      {!createCompactMode && (
                      <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[11px] text-slate-700">
                        <p className="font-semibold text-amber-900">テンプレ利用ランキング（施設内）</p>
                        <div className="mt-1 space-y-1">
                          {templateUsageRanking.map((row, index) => (
                            <p key={`rank-${row.title}`}>
                              {index + 1}. {row.title}（{row.count}件）
                            </p>
                          ))}
                          {templateUsageRanking.length === 0 && <p>データなし</p>}
                        </div>
                      </div>
                      )}
                      <DashboardTemplateScreenPreview blocks={activeTemplatePreviewEntry.template.blocks} />
                      {!createCompactMode && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(activeTemplatePreviewEntry.template.blocks ?? [])
                          .slice(0, 8)
                          .map((block) => (
                            <span
                              key={`${activeTemplatePreviewEntry.originalIndex}-${block.id}`}
                              className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-800"
                            >
                              {getTemplateBlockLabel(block.type)}
                            </span>
                          ))}
                      </div>
                      )}
                    </>
                  )}
                </aside>
              </div>
            </section>
          ) : activeTab === "project" ? (
            <section className="space-y-4">
              <article className="rounded-2xl lux-section-card border border-emerald-200/80 bg-white p-4 shadow-sm">
                <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">ファイル数</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">{projectFileGroups.length}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">ファイル内ページ</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">{groupedPageCount}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">単体ページ</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">{standaloneProjectItems.length}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      value={projectSearch}
                      onChange={(e) => setProjectSearch(e.target.value)}
                      placeholder="ページ名で検索"
                      className="w-[220px] rounded-lg border border-slate-300 px-3 py-2 text-xs"
                    />
                    {([
                      ["all", "すべて"],
                      ["published", "公開中"],
                      ["draft", "下書き"],
                    ] as Array<[ProjectStatusFilter, string]>).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setProjectStatusFilter(value)}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          projectStatusFilter === value
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowCreateProjectModal(true)}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                    >
                      + 新規プロジェクト
                    </button>
                  </div>
                </div>
              </article>
              <article className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">プロジェクトファイル（複数ページ）</h2>
                  <p className="text-xs text-slate-500">作成したファイルはここから編集できます（まずは親ページを編集）</p>
                </div>
                <div className="space-y-3">
                  {filteredProjectFileGroups.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-600">
                      <p>該当するプロジェクトファイルはありません。</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCreateProjectModal(true)}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
                        >
                          + 新規プロジェクト
                        </button>
                        {projectSearch.trim() || projectStatusFilter !== "all" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setProjectSearch("");
                              setProjectStatusFilter("all");
                            }}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                          >
                            フィルタをリセット
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )}
                  {filteredProjectFileGroups.map((group) => (
                    <article
                      key={group.hub.id}
                      className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 transition hover:-translate-y-[1px] hover:shadow-sm cursor-pointer"
                      onClick={() => router.push(`/editor/${group.hub.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/editor/${group.hub.id}`);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${group.hub.title} を編集`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700">プロジェクトファイル</p>
                          <h3 className="font-medium text-slate-900">{group.hub.title}</h3>
                        </div>
                        <span className="rounded-full border border-emerald-300 bg-white px-2 py-1 text-[11px] text-emerald-800">
                          {group.pages.length}ページ
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">最終更新: {formatDate(group.hub.updatedAt)}</p>
                      <p className="mt-2 rounded-md border border-emerald-200 bg-white/80 px-2 py-1 text-[11px] text-emerald-800">
                        次: 親ページを編集 → ノード接続 → アイコン遷移先を設定
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link
                          href={`/editor/${group.hub.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium !text-white hover:bg-emerald-500 hover:!text-white"
                        >
                          親ページを編集
                        </Link>
                        <a
                          href={buildPublicUrl(group.hub.slug)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                        >
                          QR / 公開ページ
                        </a>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void onDeleteProjectGroup(group);
                          }}
                          disabled={group.pages.concat(group.hub).some((entry) => pendingDeleteIds.has(entry.id))}
                          className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {group.pages.concat(group.hub).some((entry) => pendingDeleteIds.has(entry.id)) ? "保留中..." : "プロジェクト削除"}
                        </button>
                      </div>
                      <div className="mt-3">
                        {group.pages.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-500">
                            関連ページはまだありません。親ページを編集してノード接続を追加してください。
                          </p>
                        ) : (
                          <div className="relative pl-5">
                            <div className="absolute left-1 top-1 bottom-1 w-px bg-emerald-200" />
                            {group.pages.map((page) => (
                              <div key={page.id} className="relative mb-2 pl-4 last:mb-0">
                                <span className="absolute left-0 top-4 h-px w-3 bg-emerald-300" />
                                <span className="absolute -left-[4px] top-[13px] h-2 w-2 rounded-full bg-emerald-400" />
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm text-slate-900">{page.title}</p>
                                    <p className="text-xs text-slate-500">最終更新: {formatDate(page.updatedAt)}</p>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] ${page.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                      {page.status === "published" ? "公開中" : "下書き"}
                                    </span>
                                    <Link
                                      href={`/editor/${page.id}`}
                                      onClick={(event) => event.stopPropagation()}
                                      className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                                    >
                                      編集
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        void onDeleteInformation(page);
                                      }}
                                      disabled={pendingDeleteIds.has(page.id)}
                                      className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                                    >
                                      {pendingDeleteIds.has(page.id) ? "保留中..." : "削除"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </article>
              <article className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">単体ページ（未グループ）</h2>
                  <p className="text-xs text-slate-500">ファイルに所属していないページ</p>
                </div>
                <div className="space-y-3">
                  {filteredStandaloneProjectItems.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                      該当する単体ページはありません。
                    </p>
                  )}
                  {filteredStandaloneProjectItems.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-slate-200 p-4 transition hover:-translate-y-[1px] hover:shadow-sm cursor-pointer"
                      onClick={() => router.push(`/editor/${item.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/editor/${item.id}`);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${item.title} を編集`}
                    >
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">最終更新: {formatDate(item.updatedAt)}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] ${item.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                          {item.status === "published" ? "公開中" : "下書き"}
                        </span>
                        <Link
                          href={`/editor/${item.id}`}
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
                        >
                          編集
                        </Link>
                        <a
                          href={buildPublicUrl(item.slug)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50"
                        >
                          QR / 公開ページ
                        </a>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            void onDeleteInformation(item);
                          }}
                          disabled={pendingDeleteIds.has(item.id)}
                          className="rounded-md border border-rose-300 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          {pendingDeleteIds.has(item.id) ? "保留中..." : "削除"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            </section>
          ) : activeTab === "ops" && canAccessOps ? (
            <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <article className="rounded-2xl lux-section-card border border-emerald-200/70 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">運用センター</h2>
                  <button
                    type="button"
                    onClick={() => void refreshOpsHealth()}
                    disabled={loadingOpsHealth}
                    className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    {loadingOpsHealth ? "更新中..." : "状態更新"}
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-600">障害の復旧・課金同期・環境確認をここで実行できます。</p>
                <div className="mt-2 rounded-lg border border-cyan-200 bg-cyan-50/60 px-3 py-2 text-xs text-cyan-900">
                  優先カード順（自動）: {(opsHealth?.week12Preview.priorityCardOrder ?? ["publish", "billing", "dormancy", "alerts"]).join(" → ")}
                </div>
                <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-xs text-indigo-900">
                  <p className="font-semibold">今週の最優先3施策（自動生成）</p>
                  <div className="mt-1 space-y-1">
                    {(opsHealth?.week13Preview.top3WeeklyActions ?? []).map((task) => (
                      <p key={task}>・{task}</p>
                    ))}
                    {(opsHealth?.week13Preview.top3WeeklyActions ?? []).length === 0 ? <p>・現状は維持運用で問題ありません。</p> : null}
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50/70 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-cyan-900">ホテル獲得→公開→課金 検証ボード（7日）</p>
                    <p className="text-xs text-cyan-800">
                      達成: {hotelRevenueValidation.healthyCount}/3
                    </p>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {hotelRevenueValidation.stages.map((stage) => {
                      const stageHealthy = stage.rate >= stage.target;
                      return (
                        <div key={stage.key} className="rounded-lg border border-slate-200 bg-white p-2">
                          <p className="text-xs font-semibold text-slate-700">{stage.label}</p>
                          <p className="mt-0.5 text-[11px] text-slate-500">{stage.metric}</p>
                          <p className="mt-1 text-base font-semibold text-slate-900">{stage.rate}%</p>
                          <p className="text-[11px] text-slate-600">
                            {stage.value} / 目標 {stage.target}%
                          </p>
                          <p className={`mt-1 text-[11px] font-semibold ${stageHealthy ? "text-emerald-700" : "text-rose-700"}`}>
                            {stageHealthy ? "達成" : "未達"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-700">
                    <p>
                      課金導線補足: Upgradeクリック {hotelRevenueValidation.upgradeClicks} 件 / 14日継続率 {hotelRevenueValidation.retention14dRate}%
                      （目標 {hotelRevenueValidation.targets.retention14d}%）
                    </p>
                    <p className="mt-1 text-[11px] text-rose-700">
                      最優先ボトルネック: {hotelRevenueValidation.bottleneck.label}（{hotelRevenueValidation.bottleneck.rate}%）
                    </p>
                  </div>
                  <div className="mt-2 rounded-md border border-cyan-200 bg-white p-2 text-xs text-slate-700">
                    <p className="font-semibold text-cyan-900">次にやること（収益優先）</p>
                    <div className="mt-1 space-y-1">
                      {hotelRevenueValidation.nextActions.map((action) => (
                        <p key={action}>・{action}</p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-emerald-200/70 bg-emerald-50/40 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-emerald-900">運用インパクト（推定）</p>
                    <button
                      type="button"
                      onClick={() => void onStartStripeCheckout()}
                      disabled={creatingCheckout || isProActive}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                    >
                      {isProActive ? "現在Proプランです" : creatingCheckout ? "遷移中..." : "Proにアップグレード"}
                    </button>
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">推定更新回数 / 月</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{estimatedMonthlyEdits}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">推定削減時間 / 月</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{estimatedSavedHoursPerMonth}h</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">QR導線比率（7日）</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{qrShare7d}%</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    Pro適合シグナル: {proFitSignals}/3（公開枠・複数ページ運用・閲覧規模）
                  </p>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                    <p className="font-medium text-slate-700">環境設定</p>
                    <p className="mt-1">Public Env: {opsHealth?.env.supabasePublic ? "OK" : "NG"}</p>
                    <p>Service Env: {opsHealth?.env.supabaseService ? "OK" : "NG"}</p>
                    <p>Stripe Key: {opsHealth?.env.stripeSecret ? "OK" : "NG"}</p>
                    <p>Webhook Secret: {opsHealth?.env.stripeWebhook ? "OK" : "NG"}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                    <p className="font-medium text-slate-700">課金反映</p>
                    <p className="mt-1">Plan: {opsHealth?.billing.plan ?? "-"}</p>
                    <p>Status: {opsHealth?.billing.status ?? "-"}</p>
                    <p>Stripe Customer: {opsHealth?.billing.hasStripeCustomer ? "あり" : "なし"}</p>
                    <p>最終同期: {opsHealth?.billing.lastSyncAt ? formatDate(opsHealth.billing.lastSyncAt) : "未設定"}</p>
                    <p>Webhook最終受信: {opsHealth?.billing.webhookLastReceivedAt ? formatDate(opsHealth.billing.webhookLastReceivedAt) : "未受信"}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-3">
                  <p className="text-xs font-semibold text-emerald-900">課金CVR（直近7日）</p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <p className="font-medium text-slate-500">指標</p>
                    <p className="font-medium text-slate-500">件数</p>
                    <p className="font-medium text-slate-500">率</p>
                    <p>アップグレードクリック</p>
                    <p>{opsHealth?.billing.funnel7d.upgradeClicks ?? 0}</p>
                    <p>-</p>
                    <p>Checkout到達</p>
                    <p>{opsHealth?.billing.funnel7d.checkoutSessions ?? 0}</p>
                    <p>{opsHealth?.billing.funnel7d.clickToCheckoutRate ?? 0}%</p>
                    <p>Checkout完了</p>
                    <p>{opsHealth?.billing.funnel7d.completedCheckouts ?? 0}</p>
                    <p>{opsHealth?.billing.funnel7d.checkoutToPaidRate ?? 0}%</p>
                    <p>再開クリック</p>
                    <p>{opsHealth?.billing.funnel7d.checkoutResumeClicks ?? 0}</p>
                    <p>{opsHealth?.billing.funnel7d.resumeClickRate ?? 0}%</p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/50 p-3">
                  <p className="text-xs font-semibold text-indigo-900">公開ページ速度（直近7日）</p>
                  <p className="mt-1 text-xs text-slate-600">LCP / Load / CLS / INP を公開ページで自動計測しています。</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LCP 平均 / P75</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {opsHealth?.performance7d.lcpAvgMs ?? 0}ms / {opsHealth?.performance7d.lcpP75Ms ?? 0}ms
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Load 平均 / P75</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {opsHealth?.performance7d.loadAvgMs ?? 0}ms / {opsHealth?.performance7d.loadP75Ms ?? 0}ms
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">CLS 平均 / P75</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {opsHealth?.performance7d.clsAvg ?? 0} / {opsHealth?.performance7d.clsP75 ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">INP 平均 / P75</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {opsHealth?.performance7d.inpAvgMs ?? 0}ms / {opsHealth?.performance7d.inpP75Ms ?? 0}ms
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-600">
                    計測サンプル: {opsHealth?.performance7d.sampleCount ?? 0} 件 / 最終計測:{" "}
                    {opsHealth?.performance7d.lastMeasuredAt ? formatDate(opsHealth.performance7d.lastMeasuredAt) : "未計測"}
                  </p>
                </div>

                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                  <p className="text-xs font-semibold text-amber-900">速度低下ページ（自動抽出）</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-700">
                    {(opsHealth?.performance7d.slowPages ?? []).map((row) => (
                      <p key={`slow-${row.path}`}>
                        {row.path}: LCP {row.lcpMs}ms / Load {row.loadMs}ms / INP {row.inpMs}ms / CLS {row.cls}
                        （工数 {row.effort} / 期待改善 LCP -{row.effort === "L" ? 1500 : row.effort === "M" ? 900 : 450}ms）
                      </p>
                    ))}
                    {(opsHealth?.performance7d.slowPages ?? []).length === 0 && <p>しきい値超過ページはありません。</p>}
                  </div>
                  {(opsHealth?.performance7d.slowPages ?? []).length > 0 && (
                    <div className="mt-2 rounded-md border border-amber-200 bg-white px-2 py-2 text-[11px] text-amber-900">
                      改善提案: 画像ブロックをWebPに置換 / ギャラリー枚数を削減 / 先頭CTAより下に重い画像を移動
                    </div>
                  )}
                  {(opsHealth?.performance7d.slowPages ?? []).length > 0 && (
                    <div className="mt-1 rounded-md border border-indigo-200 bg-white px-2 py-2 text-[11px] text-indigo-900">
                      自動提案: {((opsHealth?.performance7d.inpP75Ms ?? 0) > 200 ? "INP対策（重いJS/イベント削減） / " : "")}
                      {((opsHealth?.performance7d.clsP75 ?? 0) > 0.1 ? "CLS対策（画像縦横指定/プレースホルダ） / " : "")}
                      {((opsHealth?.performance7d.lcpP75Ms ?? 0) > 2500 ? "LCP対策（先頭画像軽量化）" : "Load対策（画像圧縮・遅延読込）")}
                    </div>
                  )}
                  {(opsHealth?.performance7d.slowPages ?? []).length > 0 && (
                    <div className="mt-2 rounded-md border border-rose-200 bg-white px-2 py-2 text-[11px] text-rose-800">
                      優先修正: {(opsHealth?.performance7d.slowPages ?? [])
                        .sort((a, b) => b.priorityScore - a.priorityScore)
                        .map((row, index) => `${index + 1}.${row.path}`)
                        .join(" / ")}
                    </div>
                  )}
                  <p className="mt-2 text-[11px] text-slate-600">しきい値: LCP 2500ms以上 または Load 4000ms以上 または INP 200ms以上 または CLS 0.1以上</p>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-800">テンプレ/ページ別 LCP比較（上位5）</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-700">
                    {(opsHealth?.performance7d.lcpByPage ?? []).map((row) => (
                      <p key={`lcp-page-${row.path}`}>
                        {row.path}: LCP {row.lcpMs}ms / INP {row.inpMs}ms / CLS {row.cls}（{row.samples}件）
                      </p>
                    ))}
                    {(opsHealth?.performance7d.lcpByPage ?? []).length === 0 && <p>計測データがありません。</p>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onCapturePerformanceSnapshot}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                    >
                      改善前スナップショットを記録
                    </button>
                    {perfSnapshot ? (
                      <p className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600">
                        比較基準: {formatDate(perfSnapshot.capturedAt)}
                      </p>
                    ) : null}
                  </div>
                  {speedComparisonByPage.length > 0 ? (
                    <div className="mt-2 rounded-md border border-slate-200 bg-white px-2 py-2 text-[11px] text-slate-700">
                      <p className="font-semibold text-slate-800">実行前後比較（ページ別）</p>
                      {speedComparisonByPage.map((row) => (
                        <p key={`speed-compare-${row.path}`} className="mt-1">
                          {row.path}: LCP {row.beforeLcp}→{row.afterLcp}ms（{row.deltaLcp > 0 ? "+" : ""}{row.deltaLcp}ms） / INP {row.beforeInp}→{row.afterInp}ms（{row.deltaInp > 0 ? "+" : ""}{row.deltaInp}ms）
                        </p>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/50 p-3">
                  <p className="text-xs font-semibold text-rose-900">画像最適化未対応URL（一括検出）</p>
                  <div className="mt-2 space-y-1 text-[11px] text-rose-900">
                    {unoptimizedImageUrls.map((url) => (
                      <p key={`unoptimized-${url}`} className="truncate">{url}</p>
                    ))}
                    {unoptimizedImageUrls.length === 0 && <p>未最適化URLは検出されませんでした。</p>}
                  </div>
                  {unoptimizedImageUrls.length > 0 && (
                    <>
                      <div className="mt-2 rounded-md border border-rose-200 bg-white px-2 py-2 text-[11px] text-rose-900">
                        推定サイズ: 変換前 {imageOptimizationEstimate.beforeKb}KB → 変換後 {imageOptimizationEstimate.afterKb}KB（削減 {imageOptimizationEstimate.reducedKb}KB）
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          void navigator.clipboard
                            .writeText(unoptimizedImageUrls.join("\n"))
                            .then(() => setSuccess("未最適化URL一覧をコピーしました（画像一括変換オペレーション用）"))
                        }
                        className="mt-2 rounded-md border border-rose-300 bg-white px-3 py-1.5 text-[11px] text-rose-800 hover:bg-rose-50"
                      >
                        一括変換用URLリストをコピー
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50/50 p-3">
                  <p className="text-xs font-semibold text-violet-900">更新継続ヘルス（Day6）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">公開成功まで平均時間</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {opsHealth?.execution.avgMinutesToPublish ?? 0} 分
                      </p>
                      <p className="text-[11px] text-slate-500">計測件数: {opsHealth?.execution.samples ?? 0} 件</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">最終更新からの経過</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {opsHealth?.dormancy.daysSinceLastUpdate ?? "-"} 日
                      </p>
                      <p
                        className={`text-[11px] ${
                          opsHealth?.dormancy.stage === "critical14d"
                            ? "text-rose-700"
                            : opsHealth?.dormancy.stage === "warning7d"
                              ? "text-amber-700"
                              : "text-emerald-700"
                        }`}
                      >
                        {opsHealth?.dormancy.message ?? "データ未取得"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-md border border-violet-200 bg-white p-3">
                    <p className="text-xs font-semibold text-slate-700">休眠施設向けの再開導線</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <p className="w-full text-[11px] text-violet-800">
                        施設タイプ別の初期推奨導線: {FACILITY_LABELS[inferredFacilityType]} → {inferredRestartDefaultPath}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          void trackOpsRestartFlowClick("template", inferredFacilityType);
                          setActiveTab("create");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`rounded-md border px-3 py-1.5 text-xs ${
                          inferredRestartDefaultPath === "template"
                            ? "border-violet-300 bg-violet-50 text-violet-800"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        テンプレから再開
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void trackOpsRestartFlowClick("draft", inferredFacilityType);
                          setActiveTab("project");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`rounded-md border px-3 py-1.5 text-xs ${
                          inferredRestartDefaultPath === "draft"
                            ? "border-violet-300 bg-violet-50 text-violet-800"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        下書きを見直す
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void trackOpsRestartFlowClick("publish", inferredFacilityType);
                          setActiveTab("dashboard");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`rounded-md border px-3 py-1.5 text-xs ${
                          inferredRestartDefaultPath === "publish"
                            ? "border-violet-300 bg-violet-50 text-violet-800"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        公開状態を確認
                      </button>
                    </div>
                    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] text-slate-700">
                      再開導線AB: テンプレ {opsHealth?.restart7d.byPath.template ?? 0} / 下書き {opsHealth?.restart7d.byPath.draft ?? 0} / 公開確認 {opsHealth?.restart7d.byPath.publish ?? 0}
                    </div>
                    <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] text-slate-700">
                      施設タイプ比較: ビジネス {opsHealth?.restart7d.byFacility.business ?? 0} / リゾート {opsHealth?.restart7d.byFacility.resort ?? 0} / 温浴 {opsHealth?.restart7d.byFacility.spa ?? 0}
                    </div>
                    <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] text-slate-700">
                      施設タイプ別完了率: ビジネス {opsHealth?.restart7d.byFacilityCompletionRate.business ?? 0}% / リゾート {opsHealth?.restart7d.byFacilityCompletionRate.resort ?? 0}% / 温浴 {opsHealth?.restart7d.byFacilityCompletionRate.spa ?? 0}%
                    </div>
                    <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] text-slate-700">
                      施策別比較（再開クリック比率）: テンプレ{" "}
                      {opsHealth?.restart7d.clicks ? Math.round(((opsHealth?.restart7d.byPath.template ?? 0) / opsHealth.restart7d.clicks) * 100) : 0}%
                      {" / "}下書き{" "}
                      {opsHealth?.restart7d.clicks ? Math.round(((opsHealth?.restart7d.byPath.draft ?? 0) / opsHealth.restart7d.clicks) * 100) : 0}%
                      {" / "}公開確認{" "}
                      {opsHealth?.restart7d.clicks ? Math.round(((opsHealth?.restart7d.byPath.publish ?? 0) / opsHealth.restart7d.clicks) * 100) : 0}%
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600">
                      再開完了率: {opsHealth?.restart7d.completionRate ?? 0}%（再開クリック {opsHealth?.restart7d.clicks ?? 0} 件 / 公開 {opsHealth?.restart7d.publishes ?? 0} 件）
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      再開後7日継続率: {opsHealth?.restart7d.retention7d.rate ?? 0}%（対象 {opsHealth?.restart7d.retention7d.eligible ?? 0} / 継続 {opsHealth?.restart7d.retention7d.retained ?? 0}）
                    </p>
                    <p className="mt-1 text-[11px] text-slate-600">
                      再開後14日継続率: {opsHealth?.restart7d.retention14d.rate ?? 0}%（対象 {opsHealth?.restart7d.retention14d.eligible ?? 0} / 継続 {opsHealth?.restart7d.retention14d.retained ?? 0}）
                    </p>
                    <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] text-slate-700">
                      施策別7日/14日継続率: テンプレ {opsHealth?.restart7d.byPathRetention.template.rate7d ?? 0}% / {opsHealth?.restart7d.byPathRetention.template.rate14d ?? 0}% ・
                      下書き {opsHealth?.restart7d.byPathRetention.draft.rate7d ?? 0}% / {opsHealth?.restart7d.byPathRetention.draft.rate14d ?? 0}% ・
                      公開確認 {opsHealth?.restart7d.byPathRetention.publish.rate7d ?? 0}% / {opsHealth?.restart7d.byPathRetention.publish.rate14d ?? 0}%
                    </div>
                    <button
                      type="button"
                      onClick={() => void onLockRestartWinnerPath()}
                      disabled={lockingRestartWinner}
                      className="mt-1 rounded-md border border-violet-300 bg-violet-50 px-3 py-1.5 text-[11px] text-violet-800 hover:bg-violet-100 disabled:opacity-60"
                    >
                      {lockingRestartWinner ? "固定中..." : "勝ち導線を固定（記録）"}
                    </button>
                    <p className={`mt-1 text-[11px] ${dormancyStage === "critical" ? "text-rose-700" : dormancyStage === "warning" ? "text-amber-700" : "text-emerald-700"}`}>
                      休眠判定: {dormancyStage === "critical" ? "14日以上停止（強リマインド）" : dormancyStage === "warning" ? "7日以上停止（通常リマインド）" : "正常運用"}
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50/50 p-3">
                  <p className="text-xs font-semibold text-cyan-900">LP→登録ファネル（直近7日）</p>
                  <p className="mt-1 text-xs text-slate-600">
                    ref（lp-hero / lp-sticky / lp-bottom）+ src（SNS）+ ab（CTA文言）の集計です。
                  </p>
                  {loadingOnboardingFunnel && (
                    <div className="mt-2 animate-pulse space-y-2">
                      <div className="h-4 w-44 rounded ux-skeleton" />
                    </div>
                  )}
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP経由ログイン</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {onboardingFunnel?.lpAttributedLogins ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">新規登録完了</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {onboardingFunnel?.signupCompleted ?? 0}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP→登録率</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-700">
                        {onboardingFunnel?.lpToSignupRate ?? 0}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs font-semibold text-slate-700">LP別 CVR</p>
                      <div className="mt-1 space-y-1 text-xs text-slate-600">
                        {(onboardingFunnel?.byLandingPage ?? []).map((row) => (
                          <p key={`lp-${row.lp}`}>
                            {row.lp}: {row.logins}→{row.signups}（{row.rate}%）
                          </p>
                        ))}
                        {(onboardingFunnel?.byLandingPage ?? []).length === 0 && <p>データなし</p>}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs font-semibold text-slate-700">SNS別</p>
                      <div className="mt-1 space-y-1 text-xs text-slate-600">
                        {(onboardingFunnel?.byChannel ?? []).slice(0, 4).map((row) => (
                          <p key={`channel-${row.channel}`}>
                            {row.channel}: {row.logins}→{row.signups}（{row.rate}%）
                          </p>
                        ))}
                        {(onboardingFunnel?.byChannel ?? []).length === 0 && <p>データなし</p>}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs font-semibold text-slate-700">CTA A/B別</p>
                      <div className="mt-1 space-y-1 text-xs text-slate-600">
                        {(onboardingFunnel?.byVariant ?? []).map((row) => (
                          <p key={`variant-${row.variant}`}>
                            variant {row.variant.toUpperCase()}: {row.logins}→{row.signups}（{row.rate}%）
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs font-semibold text-slate-700">業態別 勝ちCTA（自動）</p>
                      <div className="mt-1 space-y-1 text-xs text-slate-600">
                        <p>business: {opsHealth?.week7Review.lpWinnerByIndustry.business ?? "-"}</p>
                        <p>resort: {opsHealth?.week7Review.lpWinnerByIndustry.resort ?? "-"}</p>
                        <p>spa: {opsHealth?.week7Review.lpWinnerByIndustry.spa ?? "-"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 rounded-md border border-cyan-200 bg-white p-3">
                    <p className="text-xs font-semibold text-slate-700">Week1結果サマリー（運用者向け）</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="text-xs text-slate-500">LP→登録率</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{week1Snapshot.lpRate}%</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="text-xs text-slate-500">7日閲覧数</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{week1Snapshot.views}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="text-xs text-slate-500">公開ページ数</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">{week1Snapshot.publishedPages}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      判定:{" "}
                      <span className={`font-semibold ${week1Snapshot.level === "good" ? "text-emerald-700" : week1Snapshot.level === "mid" ? "text-amber-700" : "text-rose-700"}`}>
                        {week1Snapshot.level === "good" ? "順調" : week1Snapshot.level === "mid" ? "改善余地あり" : "優先改善が必要"}
                      </span>{" "}
                      （{week1Snapshot.score}/3）
                    </p>
                    <p className="mt-2 rounded-md border border-cyan-200 bg-cyan-50 px-2 py-2 text-xs text-cyan-900">
                      改善提案: {lpOptimizationTip}
                    </p>
                  </div>
                  <div className="mt-3 rounded-md border border-sky-200 bg-white p-3">
                    <p className="text-xs font-semibold text-slate-700">初回公開までの離脱可視化</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-4">
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs">
                        LPログイン {firstPublishDropOff.logins}
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs">
                        登録完了 {firstPublishDropOff.signups}
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs">
                        作成 {firstPublishDropOff.created}
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs">
                        公開 {firstPublishDropOff.publishedCount}
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-700">
                      離脱率: ログイン→登録 {firstPublishDropOff.loginToSignupDrop}% / 登録→作成 {firstPublishDropOff.signupToCreatedDrop}% / 作成→公開 {firstPublishDropOff.createdToPublishedDrop}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-fuchsia-200 bg-fuchsia-50/50 p-3">
                  <p className="text-xs font-semibold text-fuchsia-900">Week2 KPIレビュー（運用者向け）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP→登録率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {opsHealth?.week2Review.kpi.lpToSignupRate ?? 0}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">公開完了率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {opsHealth?.week2Review.kpi.publishCompletionRate ?? 0}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {opsHealth?.week2Review.kpi.proConversionRate ?? 0}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-emerald-200 bg-white p-2">
                      <p className="text-xs font-semibold text-emerald-700">継続強化する施策（強い）</p>
                      <div className="mt-1 space-y-1 text-xs text-slate-700">
                        {(opsHealth?.week2Review.focus.strong ?? []).map((item) => (
                          <p key={`strong-${item}`}>・{item}</p>
                        ))}
                        {(opsHealth?.week2Review.focus.strong ?? []).length === 0 && <p>・該当なし</p>}
                      </div>
                    </div>
                    <div className="rounded-lg border border-rose-200 bg-white p-2">
                      <p className="text-xs font-semibold text-rose-700">停止/縮小する施策（弱い）</p>
                      <div className="mt-1 space-y-1 text-xs text-slate-700">
                        {(opsHealth?.week2Review.focus.weak ?? []).map((item) => (
                          <p key={`weak-${item}`}>・{item}</p>
                        ))}
                        {(opsHealth?.week2Review.focus.weak ?? []).length === 0 && <p>・該当なし</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50/60 p-3">
                  <p className="text-xs font-semibold text-rose-900">Week3 KPIレビュー（運用者向け）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP→登録率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week3Review.kpi.lpToSignupRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">公開完了率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week3Review.kpi.publishCompletionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week3Review.kpi.proConversionRate ?? 0}%</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    開発集中（上位2施策）: {(opsHealth?.week3Review.focusTop2 ?? []).join(" / ") || "なし"}
                  </div>
                  <div className="mt-1 rounded-md border border-rose-200 bg-white px-2 py-2 text-xs text-slate-700">
                    停止/縮小候補: {(opsHealth?.week3Review.weak ?? []).join(" / ") || "なし"}
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                  <p className="text-xs font-semibold text-emerald-900">Week4 KPIレビュー（運用者向け）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP→登録率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week4Review.kpi.lpToSignupRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">公開完了率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week4Review.kpi.publishCompletionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week4Review.kpi.proConversionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">再開後7日継続率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week4Review.kpi.retentionRate ?? 0}%</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    標準化する施策: {(opsHealth?.week4Review.standardize ?? []).join(" / ") || "なし"}
                  </div>
                  <div className="mt-1 rounded-md border border-rose-200 bg-white px-2 py-2 text-xs text-slate-700">
                    停止/修正する施策: {(opsHealth?.week4Review.stopOrFix ?? []).join(" / ") || "なし"}
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50/60 p-3">
                  <p className="text-xs font-semibold text-cyan-900">Week5 KPIレビュー（運用者向け）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP→登録率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{week5Kpi.lp}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">公開完了率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{week5Kpi.publishCompletion}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{week5Kpi.proConversion}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">継続率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{week5Kpi.retention}%</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    標準化候補: {week5Kpi.standardize.join(" / ") || "なし"}
                  </div>
                  <div className="mt-1 rounded-md border border-rose-200 bg-white px-2 py-2 text-xs text-slate-700">
                    停止/修正候補: {week5Kpi.stopOrFix.join(" / ") || "なし"}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void navigator.clipboard.writeText(weeklyOpsReport).then(() => setSuccess("週次レポート文面をコピーしました"))}
                      className="rounded-md border border-cyan-300 bg-white px-3 py-1.5 text-xs text-cyan-800 hover:bg-cyan-50"
                    >
                      週次レポートをコピー
                    </button>
                    <button
                      type="button"
                      onClick={() => void onSendWeeklyReport()}
                      disabled={sendingWeeklyReport}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
                    >
                      {sendingWeeklyReport ? "送信中..." : "週次レポート送信"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text = [
                          "【Infomii 週次レポート自動送信テンプレ】",
                          "送信先: 運用責任者 / 現場責任者",
                          "頻度: 毎週 月曜 09:00",
                          "件名: [Infomii] 週次運用レポート",
                          "本文: LP→登録率 / 公開完了率 / Pro転換率 / 14日継続率 / 紹介流入率",
                        ].join("\n");
                        void navigator.clipboard.writeText(text).then(() => setSuccess("自動送信テンプレをコピーしました"));
                      }}
                      className="rounded-md border border-indigo-300 bg-white px-3 py-1.5 text-xs text-indigo-800 hover:bg-indigo-50"
                    >
                      自動送信テンプレをコピー
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3">
                  <p className="text-xs font-semibold text-indigo-900">Week7 KPIレビュー（運用者向け）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP CVR</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.lpToSignupRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">初回公開率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.firstPublishRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.proConversionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">14日継続率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.retention14dRate ?? 0}%</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700">
                    テンプレ選択→公開 中央値: {opsHealth?.week7Review.templateToPublishMedianMinutes ?? 0} 分
                  </div>
                  <div className="mt-1 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700">
                    業態別中央値: business {opsHealth?.week7Review.templateToPublishMedianByIndustry.business ?? 0}分 / resort {opsHealth?.week7Review.templateToPublishMedianByIndustry.resort ?? 0}分 / spa {opsHealth?.week7Review.templateToPublishMedianByIndustry.spa ?? 0}分
                  </div>
                  <div className="mt-1 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700">
                    休眠通知送信（7日）: 3日 {opsHealth?.week7Review.dormancyNoticeSent7d.day3 ?? 0} / 7日 {opsHealth?.week7Review.dormancyNoticeSent7d.day7 ?? 0} / 14日 {opsHealth?.week7Review.dormancyNoticeSent7d.day14 ?? 0}
                  </div>
                  <div className="mt-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    今週の最優先3施策: {week7PriorityTop3.join(" / ") || "なし"}
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50/70 p-3">
                  <p className="text-xs font-semibold text-emerald-900">Week8 KPIレビュー（運用者向け）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP CVR</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.lpToSignupRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">公開率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.firstPublishRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.proConversionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">14日継続率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.retention14dRate ?? 0}%</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    ウィザード完了者 7日継続率: {onboardingFunnel?.wizard.retention7d.rate ?? 0}%（対象 {onboardingFunnel?.wizard.retention7d.eligible ?? 0} / 継続 {onboardingFunnel?.wizard.retention7d.retained ?? 0}）
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50/70 p-3">
                  <p className="text-xs font-semibold text-teal-900">Week9 Day1 先行プレビュー（運用者向け）</p>
                  <div className="mt-2 rounded-md border border-teal-200 bg-white px-2 py-2 text-xs text-slate-700">
                    勝ち訴求固定モード: {opsHealth?.week9Preview.winnerOnlyMode ? "有効" : "無効"}
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Hero CVR</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week9Preview.sectionCvr.hero ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Sticky CVR</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week9Preview.sectionCvr.sticky ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Bottom CVR</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week9Preview.sectionCvr.bottom ?? 0}%</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700">
                    SNS別 推奨CTA: X={opsHealth?.week9Preview.channelRecommendedVariant.x ?? "-"} / Instagram={opsHealth?.week9Preview.channelRecommendedVariant.instagram ?? "-"} / TikTok={opsHealth?.week9Preview.channelRecommendedVariant.tiktok ?? "-"} / Other={opsHealth?.week9Preview.channelRecommendedVariant.other ?? "-"}
                  </div>
                  <div className="mt-1 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700">
                    テンプレ選択→公開 週次推移（中央値）: {(opsHealth?.week9Preview.templatePublishTrend4w ?? []).map((row) => `${row.label} ${row.medianMinutes}分`).join(" / ") || "データなし"}
                  </div>
                  <div className="mt-1 rounded-md border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700">
                    再開導線 初期推奨: business {opsHealth?.week9Preview.restartDefaultPathByFacility.business ?? "template"} / resort {opsHealth?.week9Preview.restartDefaultPathByFacility.resort ?? "template"} / spa {opsHealth?.week9Preview.restartDefaultPathByFacility.spa ?? "template"}
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-cyan-300 bg-cyan-50/70 p-3">
                  <p className="text-xs font-semibold text-cyan-900">Week9 KPIレビュー（運用者向け）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP CVR</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.lpToSignupRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">公開率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.firstPublishRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.proConversionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">継続率（14日）</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.retention14dRate ?? 0}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-violet-300 bg-violet-50/70 p-3">
                  <p className="text-xs font-semibold text-violet-900">Week10 KPIレビュー（運用者向け）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">初回公開時間（中央値）</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.templateToPublishMedianMinutes ?? 0}分</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">再訪予測スコア</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week10Preview.revisitPredictionScore ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.proConversionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">継続率（14日）</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.retention14dRate ?? 0}%</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-violet-200 bg-white px-2 py-2 text-xs text-slate-700">
                    LPスクロール離脱ヒートマップ（CTA到達件数）:
                    Hero {opsHealth?.week10Preview.lpScrollHeatmap.hero ?? 0} / Sticky {opsHealth?.week10Preview.lpScrollHeatmap.sticky ?? 0} / Bottom {opsHealth?.week10Preview.lpScrollHeatmap.bottom ?? 0}
                  </div>
                  <div className="mt-1 rounded-md border border-violet-200 bg-white px-2 py-2 text-xs text-slate-700">
                    休眠通知の勝ちチャネル（施設別）:
                    business {opsHealth?.week10Preview.dormancyWinnerChannelByFacility.business ?? "mail"} / resort {opsHealth?.week10Preview.dormancyWinnerChannelByFacility.resort ?? "line"} / spa {opsHealth?.week10Preview.dormancyWinnerChannelByFacility.spa ?? "line"}
                  </div>
                  <div className="mt-1 rounded-md border border-violet-200 bg-white px-2 py-2 text-xs text-slate-700">
                    通知送信後24h反応率（週次）:
                    {(opsHealth?.week10Preview.dormancyReactionTrend4w ?? [])
                      .map((row) => `${row.label} ${row.rate}%`)
                      .join(" / ") || "データなし"}
                  </div>
                  <div className="mt-1 rounded-md border border-violet-200 bg-white px-2 py-2 text-xs text-slate-700">
                    改善アクション実行率: {opsHealth?.week10Preview.actionExecutionRate ?? 0}%
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50/70 p-3">
                  <p className="text-xs font-semibold text-emerald-900">Week11 KPIレビュー（運用者向け）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">2本目公開まで</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week11Preview.secondPublishMedianHours ?? 0}h</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.proConversionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">継続率（14日）</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.retention14dRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">休眠復帰（推定）</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{Math.max(opsHealth?.week11Preview.retention7dByDormancyChannel.line ?? 0, opsHealth?.week11Preview.retention7dByDormancyChannel.mail ?? 0, opsHealth?.week11Preview.retention7dByDormancyChannel.dashboard ?? 0)}%</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    CTA遷移率（デバイス）: SP {opsHealth?.week11Preview.ctaRateByDevice.sp ?? 0}% / PC {opsHealth?.week11Preview.ctaRateByDevice.pc ?? 0}% / Unknown {opsHealth?.week11Preview.ctaRateByDevice.unknown ?? 0}%
                  </div>
                  <div className="mt-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    事例セクション閲覧率（スクロール深度）: {opsHealth?.week11Preview.caseSectionViewRate ?? 0}%
                  </div>
                  <div className="mt-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    休眠通知 最適時間帯: {opsHealth?.week11Preview.optimizedDormancySendWindow ?? "09:00-11:00"} / 勝ち文面: {opsHealth?.week11Preview.dormancyWinnerCopyVariant === "short" ? "短文" : "詳細"}
                  </div>
                  <div className="mt-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    通知チャネル別 再開後7日継続（推定）: LINE {opsHealth?.week11Preview.retention7dByDormancyChannel.line ?? 0}% / Mail {opsHealth?.week11Preview.retention7dByDormancyChannel.mail ?? 0}% / Dashboard {opsHealth?.week11Preview.retention7dByDormancyChannel.dashboard ?? 0}%
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-cyan-300 bg-cyan-50/70 p-3">
                  <p className="text-xs font-semibold text-cyan-900">Week12 KPIレビュー（Launch Hardening）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">再公開率（推定）</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {Math.max(
                          opsHealth?.week12Preview.republishRateByDormancyChannel.line ?? 0,
                          opsHealth?.week12Preview.republishRateByDormancyChannel.mail ?? 0,
                          opsHealth?.week12Preview.republishRateByDormancyChannel.dashboard ?? 0,
                        )}%
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.proConversionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">継続率（14日）</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week7Review.kpi.retention14dRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">紹介流入率</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week12Preview.referralInflowRate ?? 0}%</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-cyan-200 bg-white px-2 py-2 text-xs text-slate-700">
                    CTA率（デバイス×流入）:
                    SP(X {opsHealth?.week12Preview.ctaRateByDeviceSource.sp.x ?? 0}% / IG {opsHealth?.week12Preview.ctaRateByDeviceSource.sp.instagram ?? 0}% / TikTok {opsHealth?.week12Preview.ctaRateByDeviceSource.sp.tiktok ?? 0}%)
                    {" ・ "}
                    PC(X {opsHealth?.week12Preview.ctaRateByDeviceSource.pc.x ?? 0}% / IG {opsHealth?.week12Preview.ctaRateByDeviceSource.pc.instagram ?? 0}% / TikTok {opsHealth?.week12Preview.ctaRateByDeviceSource.pc.tiktok ?? 0}%)
                  </div>
                  <div className="mt-1 rounded-md border border-cyan-200 bg-white px-2 py-2 text-xs text-slate-700">
                    事例優先順:
                    {(opsHealth?.week12Preview.casePriorityByIndustry ?? [])
                      .map((row) => `${row.industry} ${row.viewRate}%`)
                      .join(" / ") || "データなし"}
                  </div>
                  <div className="mt-1 rounded-md border border-cyan-200 bg-white px-2 py-2 text-xs text-slate-700">
                    曜日別最適通知:
                    {(opsHealth?.week12Preview.dormancyBestWindowByWeekday ?? [])
                      .map((row) => `${row.weekday} ${row.window} (${row.readRate}%)`)
                      .join(" / ") || "データなし"}
                  </div>
                  <div className="mt-1 rounded-md border border-cyan-200 bg-white px-2 py-2 text-xs text-slate-700">
                    勝ち文面（チャネル別）:
                    LINE {opsHealth?.week12Preview.dormancyWinnerCopyByChannel.line === "short" ? "短文" : "詳細"}
                    {" / "}
                    Mail {opsHealth?.week12Preview.dormancyWinnerCopyByChannel.mail === "short" ? "短文" : "詳細"}
                    {" / "}
                    Dashboard {opsHealth?.week12Preview.dormancyWinnerCopyByChannel.dashboard === "short" ? "短文" : "詳細"}
                  </div>
                  <div className="mt-1 rounded-md border border-cyan-200 bg-white px-2 py-2 text-xs text-slate-700">
                    復旧中央値: {opsHealth?.week12Preview.recoveryShortcutMedianMinutes ?? 0}分 / 週削減時間: {opsHealth?.week12Preview.weeklyOpsSavedHours ?? 0}h
                  </div>
                  <div className="mt-1 rounded-md border border-cyan-200 bg-white px-2 py-2 text-xs text-slate-700">
                    重大通知ルート:
                    Slack {opsHealth?.week12Preview.criticalAlertRoutes.slack ? "ON" : "OFF"} / Mail {opsHealth?.week12Preview.criticalAlertRoutes.mail ? "ON" : "OFF"} / Dashboard {opsHealth?.week12Preview.criticalAlertRoutes.dashboard ? "ON" : "OFF"}
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-indigo-300 bg-indigo-50/70 p-3">
                  <p className="text-xs font-semibold text-indigo-900">Week13 KPIレビュー（Monetization Scale）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-5">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP→登録</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week13Preview.kpiReview.lpToSignupRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">公開完了</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week13Preview.kpiReview.publishCompletionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week13Preview.kpiReview.proConversionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">14日継続</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week13Preview.kpiReview.retention14dRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">紹介流入</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week13Preview.kpiReview.referralRate ?? 0}%</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-indigo-200 bg-white px-2 py-2 text-xs text-slate-700">
                    通知後14日再公開率（推定）: LINE {opsHealth?.week13Preview.republish14dByDormancyChannel.line ?? 0}% / Mail {opsHealth?.week13Preview.republish14dByDormancyChannel.mail ?? 0}% / Dashboard {opsHealth?.week13Preview.republish14dByDormancyChannel.dashboard ?? 0}%
                  </div>
                  <div className="mt-1 rounded-md border border-indigo-200 bg-white px-2 py-2 text-xs text-slate-700">
                    課金完了率（日次7日）: {(opsHealth?.week13Preview.billingCompletionDaily7d ?? [])
                      .map((row) => `${row.label} ${row.rate}%`)
                      .join(" / ") || "データなし"}
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-sky-300 bg-sky-50/70 p-3">
                  <p className="text-xs font-semibold text-sky-900">Week14 KPIレビュー（Scale Ops + Retention）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-6">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP→登録</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week14Preview.kpiReview.lpToSignupRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">公開完了</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week14Preview.kpiReview.publishCompletionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week14Preview.kpiReview.proConversionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">14日継続</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week14Preview.kpiReview.retention14dRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">紹介</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week14Preview.kpiReview.referralRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">復旧時間</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week14Preview.kpiReview.recoveryMinutes ?? 0}分</p>
                    </div>
                  </div>
                  <div className="mt-2 rounded-md border border-sky-200 bg-white px-2 py-2 text-xs text-slate-700">
                    CTA離脱ヒートマップ: Hero {opsHealth?.week14Preview.ctaDropoffHeatmap.hero ?? 0}% / Sticky {opsHealth?.week14Preview.ctaDropoffHeatmap.sticky ?? 0}% / Bottom {opsHealth?.week14Preview.ctaDropoffHeatmap.bottom ?? 0}%
                  </div>
                  <div className="mt-1 rounded-md border border-sky-200 bg-white px-2 py-2 text-xs text-slate-700">
                    LP速度週次: {(opsHealth?.week14Preview.lpSpeedTrend4w ?? []).map((row) => `${row.label} LCP${row.lcpMs}ms`).join(" / ") || "データなし"}
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50/70 p-3">
                  <p className="text-xs font-semibold text-emerald-900">Week15 KPIレビュー（Expansion Readiness）</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-5">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">LP→登録</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week15Preview.kpiReview.lpToSignupRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">初回公開</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week15Preview.kpiReview.firstPublishRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">Pro転換</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week15Preview.kpiReview.proConversionRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">14日継続</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week15Preview.kpiReview.retention14dRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">
                      <p className="text-xs text-slate-500">復旧速度</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{opsHealth?.week15Preview.kpiReview.recoveryMinutes ?? 0}分</p>
                    </div>
                  </div>
                  <p className="mt-2 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    導入不安の解消メッセージ: {opsHealth?.week15Preview.lpAnxietyReliefMessage ?? "データなし"}
                  </p>
                  <p className="mt-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    LPボトルネック: {(opsHealth?.week15Preview.lpLcpBottleneckFactors ?? []).map((row) => `${row.factor}(${row.severity})`).join(" / ") || "データなし"}
                  </p>
                  <p className="mt-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    CTA ref/kw分解: {(opsHealth?.week15Preview.ctaFunnelByRefKeyword ?? []).map((row) => `${row.ref}/${row.keyword} ${row.rate}%`).join(" / ") || "データなし"}
                  </p>
                  <p className="mt-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    週次ボトルネック: {(opsHealth?.week15Preview.weeklyBottlenecks ?? []).join(" / ") || "なし"}
                  </p>
                  <p className="mt-1 rounded-md border border-emerald-200 bg-white px-2 py-2 text-xs text-slate-700">
                    14日継続（新規/既存）: 新規 {opsHealth?.week15Preview.retention14dSplit.newUsers ?? 0}% / 既存 {opsHealth?.week15Preview.retention14dSplit.existingUsers ?? 0}%
                  </p>
                </div>
                <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                  再公開リワード導線: {opsHealth?.week14Preview.rewardRecoveryMessage ?? "データなし"}
                </div>
                {opsHealth?.week14Preview.retentionDownsideAlert.needed ? (
                  <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
                    14日継続率アラート: {opsHealth.week14Preview.retentionDownsideAlert.message}
                  </div>
                ) : null}

                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-800">管理者通知テンプレ（休眠施設向け）</p>
                  <div className="mt-2 space-y-2 text-xs text-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        const winner = opsHealth?.week11Preview.dormancyWinnerCopyVariant ?? "short";
                        const text =
                          winner === "short"
                            ? "【Infomii再開案内】最終更新から7日以上経過しています。テンプレ再開から3分で再公開できます。"
                            : "【Infomii運用再開のお願い】\n最終更新から7日以上経過しています。\n1) ダッシュボード > テンプレから再開\n2) 必要箇所だけ更新\n3) URL/QRを再配布\n本日中に再公開できる状態です。";
                        void navigator.clipboard.writeText(text).then(() => setSuccess("勝ち文面をコピーしました"));
                      }}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] text-emerald-900 hover:bg-emerald-100"
                    >
                      勝ち文面をコピー（自動選択）
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const text =
                          inferredFacilityType === "resort"
                            ? "【Infomii再開案内/リゾート】最終更新から7日以上経過しています。滞在導線テンプレを複製して3分で再公開できます。"
                            : inferredFacilityType === "spa"
                              ? "【Infomii再開案内/温浴】最終更新から7日以上経過しています。温浴ルールページを3分で再公開できます。"
                              : "【Infomii再開案内/ビジネス】最終更新から7日以上経過しています。チェックイン導線テンプレを3分で再公開できます。";
                        void trackDormancyNoticeVariantCopy("short");
                        void navigator.clipboard.writeText(text).then(() => setSuccess("通知テンプレ（短文）をコピーしました"));
                      }}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50"
                    >
                      通知テンプレ（短文）をコピー
                    </button>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void trackDormancyNoticeSent("day3", preferredDormancyChannel).then(() => setSuccess("3日通知の送信ログを記録しました"))}
                        className={`rounded-md border px-3 py-1.5 text-[11px] ${
                          preferredDormancyChannel === "mail" || preferredDormancyChannel === "line" || preferredDormancyChannel === "dashboard"
                            ? "border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
                            : "border-slate-300 bg-white hover:bg-slate-50"
                        }`}
                      >
                        3日通知を送信済みにする
                      </button>
                      <button
                        type="button"
                        onClick={() => void trackDormancyNoticeSent("day7", preferredDormancyChannel).then(() => setSuccess("7日通知の送信ログを記録しました"))}
                        className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] hover:bg-amber-100"
                      >
                        7日通知を送信済みにする
                      </button>
                      <button
                        type="button"
                        onClick={() => void trackDormancyNoticeSent("day14", preferredDormancyChannel).then(() => setSuccess("14日通知の送信ログを記録しました"))}
                        className="rounded-md border border-rose-300 bg-rose-50 px-3 py-1.5 text-[11px] hover:bg-rose-100"
                      >
                        14日通知を送信済みにする
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      現在の自動推奨チャネル（{FACILITY_LABELS[inferredFacilityType]}）: {preferredDormancyChannel}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          void trackDormancyNoticeReaction("mail", "read").then(() =>
                            setSuccess("通知反応（メール既読）を記録しました"),
                          )
                        }
                        className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] hover:bg-emerald-100"
                      >
                        既読（メール）
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void trackDormancyNoticeReaction("line", "read").then(() =>
                            setSuccess("通知反応（LINE既読）を記録しました"),
                          )
                        }
                        className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] hover:bg-emerald-100"
                      >
                        既読（LINE）
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void trackDormancyNoticeReaction("dashboard", "no_response").then(() =>
                            setSuccess("通知反応（未反応）を記録しました"),
                          )
                        }
                        className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] hover:bg-slate-50"
                      >
                        未反応を記録
                      </button>
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white px-2 py-2 text-[11px] text-slate-700">
                      反応集計（7日）:
                      メール 既読 {opsHealth?.week9Preview.dormancyReactionByChannel.mail.read ?? 0} / 未反応 {opsHealth?.week9Preview.dormancyReactionByChannel.mail.noResponse ?? 0}
                      {" ・ "}
                      LINE 既読 {opsHealth?.week9Preview.dormancyReactionByChannel.line.read ?? 0} / 未反応 {opsHealth?.week9Preview.dormancyReactionByChannel.line.noResponse ?? 0}
                      {" ・ "}
                      画面通知 既読 {opsHealth?.week9Preview.dormancyReactionByChannel.dashboard.read ?? 0} / 未反応 {opsHealth?.week9Preview.dormancyReactionByChannel.dashboard.noResponse ?? 0}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const text =
                          inferredFacilityType === "resort"
                            ? "【Infomii運用再開/リゾート】\n最終更新から7日以上経過しています。\n1) 滞在導線テンプレを複製\n2) アクティビティ情報を更新\n3) URL/QRを再配布"
                            : inferredFacilityType === "spa"
                              ? "【Infomii運用再開/温浴】\n最終更新から7日以上経過しています。\n1) 温浴案内テンプレを複製\n2) 営業時間/注意事項を更新\n3) URL/QRを再配布"
                              : "【Infomii運用再開/ビジネス】\n最終更新から7日以上経過しています。\n1) チェックイン導線テンプレを複製\n2) 連絡先を更新\n3) URL/QRを再配布";
                        void trackDormancyNoticeVariantCopy("detail");
                        void navigator.clipboard.writeText(text).then(() => setSuccess("通知テンプレ（詳細）をコピーしました"));
                      }}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50"
                    >
                      通知テンプレ（詳細）をコピー
                    </button>
                    <div className="rounded-md border border-violet-200 bg-violet-50 px-2 py-2 text-[11px] text-violet-900">
                      A/B再テスト（管理者のみ）:
                      <button
                        type="button"
                        onClick={() => void trackDormancyNoticeVariantCopy("short").then(() => setSuccess("Aパターンの再テストを記録しました"))}
                        className="ml-2 rounded border border-violet-300 bg-white px-2 py-0.5"
                      >
                        A（短文）再テスト
                      </button>
                      <button
                        type="button"
                        onClick={() => void trackDormancyNoticeVariantCopy("detail").then(() => setSuccess("Bパターンの再テストを記録しました"))}
                        className="ml-2 rounded border border-violet-300 bg-white px-2 py-0.5"
                      >
                        B（詳細）再テスト
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm text-slate-700">{opsHealth?.billing.message ?? "データ取得中..."}</p>
                  <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-2 text-xs text-amber-900">
                    {opsHealth?.week13Preview.webhookResendCheck.needed
                      ? `Webhook再送チェックが必要です（最終失敗: ${
                          opsHealth?.week13Preview.webhookResendCheck.lastFailureAt
                            ? formatDate(opsHealth.week13Preview.webhookResendCheck.lastFailureAt)
                            : "不明"
                        }）。${opsHealth?.week13Preview.webhookResendCheck.guide}`
                      : "Webhook再送チェック: 現在は重大失敗なし"}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void onRunRecovery("ensure_scope")}
                      disabled={recoveringAction !== null}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
                    >
                      {recoveringAction === "ensure_scope" ? "実行中..." : "施設所属を再同期"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void onRunRecovery("sync_subscription")}
                      disabled={recoveringAction !== null}
                      className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs hover:bg-slate-50 disabled:opacity-60"
                    >
                      {recoveringAction === "sync_subscription" ? "実行中..." : "Stripeを手動同期"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void onRunOpsAlertTest()}
                      disabled={sendingOpsTest}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
                    >
                      {sendingOpsTest ? "送信中..." : "通知テスト送信"}
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-sm font-medium text-slate-800">障害復旧プレイブック（固定）</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-700">
                    {(opsHealth?.week14Preview.recoveryPlaybook ?? []).map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    {(opsHealth?.week14Preview.recoveryPlaybook ?? []).length === 0 ? <p>プレイブック未設定</p> : null}
                  </div>
                  <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] text-slate-700">
                    週次レポート送信監査: 7日 {opsHealth?.week14Preview.weeklyReportAudit.sent7d ?? 0}件 / 最終 {opsHealth?.week14Preview.weeklyReportAudit.lastSentAt ? formatDate(opsHealth.week14Preview.weeklyReportAudit.lastSentAt) : "未送信"}
                  </div>
                  <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] text-slate-700">
                    改善実行率（週次レポート）: {opsHealth?.week15Preview.weeklyReportImprovementExecutionRate ?? 0}%
                  </div>
                  <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] text-slate-700">
                    重大アラート復旧チェック: {opsHealth?.week15Preview.criticalRecoveryChecklist.needed ? "実施必要" : "通常監視"}
                    {" / "}
                    {(opsHealth?.week15Preview.criticalRecoveryChecklist.items ?? []).join(" → ") || "項目なし"}
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-700">本番前チェック</p>
                  <div className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                    <p>Public/Service Env 設定</p>
                    <p>{opsHealth?.env.supabasePublic && opsHealth?.env.supabaseService ? "OK" : "NG"}</p>
                    <p>Stripe Key / Price / Webhook</p>
                    <p>{opsHealth?.env.stripeSecret && opsHealth?.env.stripePrice && opsHealth?.env.stripeWebhook ? "OK" : "NG"}</p>
                    <p>Webhook受信履歴</p>
                    <p>{opsHealth?.billing.webhookLastReceivedAt ? "OK" : "未確認"}</p>
                    <p>課金反映ステータス</p>
                    <p>{opsHealth?.billing.ok ? "OK" : "要確認"}</p>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50/50 p-3">
                  <p className="text-sm font-medium text-sky-900">スマホ実機チェック（運用）</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-700">
                    <p>1. iPhone Safariで文字サイズと改行崩れがない</p>
                    <p>2. Android ChromeでCTAがファーストビュー内に表示される</p>
                    <p>3. 画像ブロックが3G回線で2秒台表示を維持できる</p>
                    <p>4. 子ページのヘッダー左に戻る導線が表示される</p>
                    <p>5. QR遷移（src=qr）で公開ページが正常表示される</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                  <p className="text-sm font-medium text-emerald-900">初回3分導線</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => void onCreateBlank()}
                      className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-left text-xs hover:bg-emerald-50"
                    >
                      1. テンプレから作成
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("project")}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:bg-slate-50"
                    >
                      2. 編集して下書き
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("dashboard")}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:bg-slate-50"
                    >
                      3. 公開とQR確認
                    </button>
                  </div>
                </div>
              </article>

              <article className="rounded-2xl lux-section-card border border-slate-200/80 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold">エラー履歴（時系列）</h2>
                  <div className="flex flex-wrap gap-1">
                    {([
                      ["all", "すべて"],
                      ["webhook", "Webhook"],
                      ["checkout", "Checkout"],
                      ["portal", "Portal"],
                    ] as Array<[OpsActionFilter, string]>).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setOpsActionFilter(value)}
                        className={`rounded-md border px-2 py-1 text-xs ${
                          opsActionFilter === value
                            ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-600">課金・復旧に関する失敗イベントを新しい順で表示します。</p>
                <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700">
                  優先度: 高 {opsErrorTimeline.filter((log) => log.priority === "high").length} / 中 {opsErrorTimeline.filter((log) => log.priority === "medium").length} / 低 {opsErrorTimeline.filter((log) => log.priority === "low").length}
                </div>
                <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50/70 p-2 text-xs text-rose-900">
                  即時通知対象（重大のみ）: {opsHealth?.week11Preview.criticalAlertCount ?? 0} 件
                </div>
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-semibold text-slate-700">導入テスト（3〜5施設）チェック</p>
                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p>1. 初回ログインから公開まで 3分以内に完了できるか</p>
                    <p>2. Pro導線クリック率（目安: 20%以上）</p>
                    <p>3. 決済完了後にプラン反映が 1分以内か</p>
                    <p>4. 障害時に運用センターから復旧できるか</p>
                    <p>5. スマホ実機（iPhone / Android）で視認性を確認したか</p>
                  </div>
                </div>
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                  <p className="text-xs font-semibold text-amber-900">再発防止チェックリスト（固定）</p>
                  <div className="mt-2 space-y-1 text-xs text-amber-900">
                    <p>1. Stripe Webhook受信時刻を毎日1回確認</p>
                    <p>2. checkout失敗が出たら3分以内にPortal経由で再開案内</p>
                    <p>3. 施設所属エラー時は「施設所属を再同期」を先に実行</p>
                    <p>4. エラー修正後にテスト通知送信で再確認</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {opsErrorTimeline.length === 0 && (
                    <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                      現在、エラー履歴はありません。
                    </p>
                  )}
                  {opsErrorTimeline.slice(0, 20).map((log) => (
                    <div key={log.id} className="rounded-lg border border-rose-200 bg-rose-50/40 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-2 text-xs font-medium text-rose-800">
                          <span>{log.action}</span>
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                            log.priority === "high"
                              ? "bg-rose-200 text-rose-900"
                              : log.priority === "medium"
                                ? "bg-amber-200 text-amber-900"
                                : "bg-slate-200 text-slate-700"
                          }`}>
                            {log.priority === "high" ? "高" : log.priority === "medium" ? "中" : "低"}
                          </span>
                        </p>
                        <p className="shrink-0 text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{log.message}</p>
                    </div>
                  ))}
                </div>

                <h3 className="mt-5 text-sm font-semibold text-slate-800">課金イベント（最新20件）</h3>
                <div className="mt-2 max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {opsTimeline.slice(0, 20).map((log) => (
                    <div key={`${log.id}-timeline`} className="rounded-lg border border-slate-200 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium text-slate-700">{log.action}</p>
                        <p className="shrink-0 text-xs text-slate-500">{formatDate(log.createdAt)}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{log.message}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          ) : (
            <section className="grid gap-3 lg:h-[calc(100vh-430px)] lg:grid-cols-[1.05fr_0.95fr] lg:overflow-hidden lg:pb-4">
                <article className="min-w-0 rounded-2xl lux-section-card border border-slate-200/80 bg-white p-3 shadow-sm lg:h-full lg:overflow-y-auto lg:pb-4">
                  <h2 className="text-lg font-semibold">契約・請求</h2>
                  <p className="mt-1 text-sm text-slate-600">プラン変更とStripeアップグレードの導線です。</p>
                  <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">現在プラン</p>
                      <p className="mt-1 font-medium text-slate-900">{subscription?.plan ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">支払い状態</p>
                      <p className="mt-1 font-medium text-slate-900">
                        {subscription ? getStatusLabel(subscription.status) : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">次回更新日</p>
                      <p className="mt-1 font-medium text-slate-900">{nextRenewalLabel}</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>公開枠の使用状況</span>
                      <span>
                        {published.length} / {publishedLimit}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          isLimitReached ? "bg-rose-500" : isNearLimit ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      残り公開可能件数: {remainingPublishSlots} 件
                    </p>
                    {isNearLimit && (
                      <p className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">
                        公開上限が近づいています。必要ならProプランをご検討ください。
                      </p>
                    )}
                    {isLimitReached && (
                      <p className="mt-2 rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-800">
                        公開上限に到達しています。新規公開にはプラン変更が必要です。
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap items-end gap-2">
                    {(isProActive || shouldShowUpgradeCta) && (
                      <button
                        type="button"
                        disabled={primaryBillingCtaDisabled}
                        onClick={isProActive ? onOpenBillingPortal : onStartStripeCheckout}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                      >
                        {primaryBillingCtaLoading ? "遷移中..." : primaryBillingCtaLabel}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={openingPortal || !subscription?.hasStripeCustomer}
                      onClick={onOpenBillingPortal}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                    >
                      {openingPortal ? "遷移中..." : "請求書・カード管理"}
                    </button>
                  </div>
                  <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    {subscription?.status === "active" || subscription?.status === "trialing"
                      ? "現在の契約状態に応じて請求導線を表示しています。Pro契約中は「プラン管理」、Free運用時は必要タイミングでアップグレード導線を表示します。"
                      : subscription?.status === "past_due"
                        ? "お支払いが未完了です。まず「請求書・カード管理」から決済情報を更新してください。"
                        : subscription?.status === "canceled"
                          ? "現在は解約状態です。再開する場合は「Proにアップグレード」から手続きしてください。"
                          : "現在の契約状態に応じて、最適な請求導線を表示します。"}
                  </div>
                  {!subscription?.hasStripeCustomer && (
                    <p className="mt-3 text-xs text-slate-500">
                      請求書・カード管理は、初回アップグレード後に利用できます。
                    </p>
                  )}
                  {!isProActive && !shouldShowUpgradeCta && (
                    <p className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      公開枠が80%に近づくと、この画面にProアップグレード導線を表示します。
                    </p>
                  )}
                  <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                    利用状況別Pro訴求: {utilizationBand === "high" ? "公開枠逼迫のため、複数ページ連携と枠拡張を優先提案" : utilizationBand === "mid" ? "更新頻度増加に備えて請求/運用導線を先行整備" : "まずは1ページ運用を安定させ、必要時にPro化"}。
                  </p>
                  {hasPendingCheckout && latestCheckoutSessionLog && (
                    <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <p className="text-xs font-semibold text-amber-900">checkout未完了リマインド</p>
                      <p className="mt-1 text-xs text-amber-800">
                        {formatAuditDate(latestCheckoutSessionLog.createdAt)} に決済開始しましたが、まだ完了していません。
                      </p>
                      <p className="mt-1 text-[11px] text-amber-800">
                        自動再送: {opsHealth?.week14Preview.checkoutAutoResendReady ? "次回リマインド対象" : "対象なし"}
                      </p>
                      <p className="mt-1 text-[11px] text-amber-800">
                        1クリック再開: {opsHealth?.week15Preview.checkoutResumeOneClickReady ? "有効" : "未設定"}
                      </p>
                      <button
                        type="button"
                        onClick={() => void onResumeCheckout()}
                        disabled={creatingCheckout}
                        className="mt-2 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-400 disabled:opacity-60"
                      >
                        {creatingCheckout ? "遷移中..." : "決済を再開する"}
                      </button>
                    </div>
                  )}
                  <p className="mt-3 rounded-md border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs text-cyan-900">
                    請求・カード管理 遷移完了率（7日）: {opsHealth?.week15Preview.billingPortalTransitionRate7d ?? 0}%
                  </p>
                  {subscription?.status === "past_due" && (
                    <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                      <p className="text-xs font-semibold text-rose-900">決済失敗の再試行ガイド</p>
                      <p className="mt-1 text-xs text-rose-800">
                        1. 請求書・カード管理でカード情報を更新 → 2. 決済を再開する → 3. 反映後に状態更新
                      </p>
                      <p className="mt-1 text-[11px] text-rose-800">
                        自動リマインド推奨間隔: {opsHealth?.week13Preview.autoReminderIntervalHours ?? 24}時間ごと
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={onOpenBillingPortal}
                          disabled={openingPortal || !subscription?.hasStripeCustomer}
                          className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs text-rose-800 hover:bg-rose-100 disabled:opacity-60"
                        >
                          {openingPortal ? "遷移中..." : "カード情報を更新"}
                        </button>
                        <button
                          type="button"
                          onClick={() => void onResumeCheckout()}
                          disabled={creatingCheckout}
                          className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500 disabled:opacity-60"
                        >
                          {creatingCheckout ? "遷移中..." : "決済を再試行"}
                        </button>
                      </div>
                    </div>
                  )}
                  {!hasBillingInsightData ? (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
                      請求分析データは蓄積中です。まずは「アップグレード」または「請求書・カード管理」導線のみ表示しています。
                    </div>
                  ) : (
                    <details className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50/70 p-3">
                      <summary className="cursor-pointer text-xs font-semibold text-indigo-900">請求分析の詳細を表示</summary>
                      <div className="mt-2 rounded-md border border-indigo-200 bg-white px-2 py-2 text-[11px] text-slate-700">
                        請求・カード管理導線 完了率（7日）: {opsHealth?.week10Preview.billingManagementCompletion7d.rate ?? 0}%（開始 {opsHealth?.week10Preview.billingManagementCompletion7d.started ?? 0} / 完了 {opsHealth?.week10Preview.billingManagementCompletion7d.completed ?? 0}）
                      </div>
                      <div className="mt-1 rounded-md border border-indigo-200 bg-white px-2 py-2 text-[11px] text-slate-700">
                        上位理由: {(opsHealth?.week10Preview.proBlockerTopReasons ?? []).map((row) => `${row.reason} ${row.count}件`).join(" / ") || "データなし"}
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-slate-700">
                        {(opsHealth?.week11Preview.blockerImprovementTasks ?? []).map((task) => (
                          <p key={task}>・{task}</p>
                        ))}
                      </div>
                      <div className="mt-2 rounded-md border border-sky-200 bg-white px-2 py-2 text-[11px] text-slate-700">
                        請求導線CVR: Upgrade→Checkout {opsHealth?.week12Preview.billingDropoffByStep.upgradeToCheckout ?? 0}% / Checkout→Paid {opsHealth?.week12Preview.billingDropoffByStep.checkoutToPaid ?? 0}% / Paid→Portal {opsHealth?.week12Preview.billingDropoffByStep.paidToPortal ?? 0}%
                      </div>
                    </details>
                  )}
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
                    <p className="text-xs font-semibold text-emerald-900">カード更新後の再開導線（固定）</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={onOpenBillingPortal}
                        disabled={openingPortal || !subscription?.hasStripeCustomer}
                        className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"
                      >
                        1. カード/請求設定を確認
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("create")}
                        className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-100"
                      >
                        2. テンプレ再公開へ進む
                      </button>
                    </div>
                  </div>
                  <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <summary className="cursor-pointer text-xs font-semibold text-slate-800">導入施設向けFAQ（課金）</summary>
                    <div className="mt-2 space-y-2 text-xs text-slate-700">
                      {billingFaqEntries.map((entry) => (
                        <div key={entry.q}>
                          <p className="font-medium">{entry.q}</p>
                          <p className="mt-0.5 text-slate-600">{entry.a}</p>
                        </div>
                      ))}
                    </div>
                  </details>
                </article>

                <article className="min-w-0 rounded-2xl lux-section-card border border-slate-200/80 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-semibold">スタッフ招待</h2>
                      <p className="mt-1 text-sm text-slate-600">発行→コピー→共有を1画面で完了できます。</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void onCreateInvite()}
                      disabled={creatingInvite}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                    >
                      {creatingInvite ? "発行中..." : "招待コードを発行"}
                    </button>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <p className="text-[11px] text-slate-500">発行数</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{inviteMetrics?.issued ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <p className="text-[11px] text-slate-500">承認数</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{inviteMetrics?.redeemed ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <p className="text-[11px] text-slate-500">承認率</p>
                      <p className="mt-1 text-lg font-semibold text-emerald-700">{inviteMetrics?.redeemRate ?? 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <p className="text-[11px] text-slate-500">有効コード</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{inviteMetrics?.active ?? 0}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                    <p className="font-medium">共有手順</p>
                    <p className="mt-1">1. 招待コードを発行 → 2. コードをコピー → 3. スタッフへ送信</p>
                    <p className="mt-1">ログイン画面の「招待コード（任意）」に入力すると同じ施設へ参加できます。</p>
                  </div>
                  <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900">
                    <p>
                      承認待ち: {inviteMetrics?.pendingApproval ?? 0}件
                      {` / `}24時間超: {inviteMetrics?.pendingOver24h ?? 0}件
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const text = `【Infomii】スタッフ招待の承認が未完了です。\nログイン後に招待コードを入力して参加してください。`;
                        void navigator.clipboard.writeText(text).then(() => setSuccess("承認待ちリマインド文面をコピーしました"));
                      }}
                      className="mt-2 rounded-md border border-amber-300 bg-white px-2 py-1 text-[11px] hover:bg-amber-100/40"
                    >
                      承認待ちリマインド文面をコピー
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {loadingInvites && (
                      <p className="text-xs text-slate-500">招待コードを読み込み中...</p>
                    )}
                    {!loadingInvites && invites.length === 0 && (
                      <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                        まだ招待コードがありません。
                      </p>
                    )}
                    {invites.slice(0, 8).map((invite) => (
                      <div key={invite.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold text-slate-900">{invite.code}</p>
                          <p className="text-[11px] text-slate-500">
                            {invite.isActive ? "有効" : "無効"} / 作成: {formatDate(invite.createdAt)}
                            {invite.consumedAt ? ` / 承認: ${formatDate(invite.consumedAt)}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => void onCopyInvite(invite.code)}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            コピー
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const text = `Infomii スタッフ招待コード: ${invite.code}\nログイン画面で「招待コード（任意）」に入力してください。`;
                              void navigator.clipboard.writeText(text).then(() => setSuccess("共有文面をコピーしました"));
                            }}
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                          >
                            共有文面
                          </button>
                          {invite.isActive && (
                            <button
                              type="button"
                              onClick={() => void onRevokeInvite(invite.id)}
                              disabled={revokingInviteId === invite.id}
                              className="rounded-md border border-rose-300 bg-white px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                            >
                              {revokingInviteId === invite.id ? "無効化中..." : "無効化"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <div className="min-w-0 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-1 lg:pb-4">
                  <article className="min-w-0 rounded-2xl lux-section-card border border-slate-200/80 bg-white p-4 shadow-sm">
                    <h2 className="text-lg font-semibold">閲覧分析（直近7日）</h2>
                    {loadingMetrics && (
                      <div className="mt-2 animate-pulse space-y-2">
                        <div className="h-4 w-44 rounded ux-skeleton" />
                      </div>
                    )}
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">総閲覧数（7日）</p>
                        <p className="mt-1 text-xl font-semibold text-slate-900">
                          {viewMetrics?.totalViews7d ?? 0}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          QR経由: {viewMetrics?.qrViews7d ?? 0}
                        </p>
                      </div>
                      <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">本日の閲覧数</p>
                        <p className="mt-1 text-xl font-semibold text-slate-900">
                          {viewMetrics?.totalViewsToday ?? 0}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          QR経由: {viewMetrics?.qrViewsToday ?? 0}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Top Pages</p>
                      {viewMetrics?.topPages.length ? (
                        <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                          {viewMetrics.topPages.map((page) => (
                            <div
                              key={page.informationId}
                              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                            >
                              <p className="truncate pr-3 text-sm text-slate-800">{page.title}</p>
                              <p className="shrink-0 text-xs text-slate-600">
                                {page.views} view / QR {page.qrViews}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                          まだ閲覧データがありません。
                        </p>
                      )}
                    </div>
                  </article>

                  <article className="min-w-0 rounded-2xl lux-section-card border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div>
                      <h2 className="text-lg font-semibold">監査ログ</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        主要操作の履歴です（最新10件）。
                      </p>
                    </div>
                    {opsHealth && opsHealth.recentBillingLogs.length > 0 && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                        <p className="text-xs font-medium text-slate-700">課金イベント（最新）</p>
                        <div className="mt-1 space-y-1">
                          {opsHealth.recentBillingLogs.slice(0, 3).map((log) => (
                            <p key={log.id} className="truncate text-[11px] text-slate-600">
                              {formatAuditDate(log.created_at)} {log.message}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    {loadingAuditLogs && (
                      <div className="mt-2 animate-pulse space-y-2">
                        <div className="h-4 w-36 rounded ux-skeleton" />
                      </div>
                    )}
                    <div className="mt-3 space-y-2">
                      {auditLogs.length === 0 && (
                        <p className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
                          まだ監査ログはありません。
                        </p>
                      )}
                      {auditLogs.slice(0, 10).map((log) => (
                        <div key={log.id} className="min-w-0 rounded-lg border border-slate-200 px-3 py-2">
                          <div className="flex min-w-0 items-center justify-between gap-3">
                            <p className="min-w-0 flex-1 truncate text-sm text-slate-800">{log.message}</p>
                            <p className="shrink-0 text-right text-sm text-slate-500">
                              {formatAuditDate(log.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
            </section>
          )}
            </div>
          </div>
        </div>
        {(error || success) && (
          <AppToast
            kind={error ? "error" : "success"}
            message={error ?? success ?? ""}
            onClose={() => {
              setError(null);
              setSuccess(null);
            }}
            action={
              error && (error.toLowerCase().includes("row-level security") || error.includes("施設所属")) ? (
                <button
                  type="button"
                  onClick={() => void onRunRecovery("ensure_scope")}
                  disabled={recoveringAction !== null}
                  className="rounded-md border border-rose-300 bg-white px-2 py-1 text-xs text-rose-800 hover:bg-rose-50 disabled:opacity-60"
                >
                  {recoveringAction === "ensure_scope" ? "復旧中..." : "施設所属を再同期する"}
                </button>
              ) : undefined
            }
          />
        )}
      </main>
    </AuthGate>
  );
}
