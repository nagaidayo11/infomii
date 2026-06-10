/** First-launch onboarding (pre-login, app only). Web は LP が担当。 */
export const LAUNCH_ONBOARDING_STORAGE_KEY = "infomii_launch_onboarding_v2_completed";

export type LaunchOnboardingStep = {
  id: string;
  title: string;
  body: string;
  /** public/onboarding/app/{id}.png など */
  image: string;
  /** スクショ内の見せ方（全枚 top 基準で高さを揃える） */
  imageObjectPosition?: string;
  imageAlt: string;
};

const ONBOARDING_IMAGES = {
  templates: "/onboarding/app/templates.png",
  editor: "/onboarding/app/editor.png",
  ai: "/onboarding/app/ai.png",
  publish: "/onboarding/app/publish.png",
  works: "/onboarding/app/works.png",
} as const;

export const LAUNCH_ONBOARDING_STEPS: LaunchOnboardingStep[] = [
  {
    id: "templates",
    title: "あなただけの案内を、すぐつくる",
    body: "旅行の日程やリンク、推し活の予定、おでかけのまとめを1ページに。友だちと共有する案内も、自分用のメモにも使えます。",
    image: ONBOARDING_IMAGES.templates,
    imageObjectPosition: "center top",
    imageAlt: "テンプレート一覧",
  },
  {
    id: "editor",
    title: "スマホ1ページに、伝えたいことだけ",
    body: "日程・地図・FAQ・リンクをブロックで並べます。見出しや写真はその場で編集できます。",
    image: ONBOARDING_IMAGES.editor,
    imageObjectPosition: "center top",
    imageAlt: "ページ編集画面",
  },
  {
    id: "ai",
    title: "説明文から、下書きまで一気に",
    body: "「沖縄3泊5人で…」のように書くだけで、カード構成と文案のたたき台を自動で用意。あとから自由に直せます。",
    image: ONBOARDING_IMAGES.ai,
    imageObjectPosition: "center top",
    imageAlt: "AIでページ作成",
  },
  {
    id: "publish",
    title: "リンクとQRで、みんなに届ける",
    body: "公開すると専用URLとQRコードが用意されます。LINEやSNSでシェア。友だちはアプリ不要で開けます。",
    image: ONBOARDING_IMAGES.publish,
    imageObjectPosition: "center top",
    imageAlt: "公開・共有",
  },
  {
    id: "works",
    title: "作ったインフォを、まとめて管理",
    body: "旅行も推し活も、作成したページは一覧で管理。下書きと公開を切り替えながら使えます。",
    image: ONBOARDING_IMAGES.works,
    imageObjectPosition: "center top",
    imageAlt: "ページ一覧",
  },
];

/** App WebView のみ pre-login オンボーディングを表示 */
export function isLaunchOnboardingRequired(isAppShell: boolean): boolean {
  return isAppShell;
}

export function isLaunchOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LAUNCH_ONBOARDING_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function shouldShowLaunchOnboarding(isAppShell: boolean): boolean {
  if (!isLaunchOnboardingRequired(isAppShell)) return false;
  return !isLaunchOnboardingCompleted();
}

const LEGACY_ONBOARDING_KEYS = [
  "infomii_launch_onboarding_v1_completed",
  "infomii_app_onboarding_completed",
  "infomii_app_onboarding_v2_completed",
  "infomii_onboarding_tour_completed",
] as const;

export function markLaunchOnboardingCompleted(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAUNCH_ONBOARDING_STORAGE_KEY, "1");
    for (const key of LEGACY_ONBOARDING_KEYS) {
      localStorage.setItem(key, "1");
    }
  } catch {
    /* private mode */
  }
}
