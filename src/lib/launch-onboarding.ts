/** First-launch onboarding (pre-login). */
export const LAUNCH_ONBOARDING_STORAGE_KEY = "infomii_launch_onboarding_v1_completed";

/** Web とアプリ（?client=app）で別スクショを置ける */
export type LaunchOnboardingImages = {
  web: string;
  app: string;
};

export type LaunchOnboardingStep = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  /**
   * public/onboarding/web/{id}.webp
   * public/onboarding/app/{id}.webp
   * など。幅が違うため web / app でファイルを分ける。
   */
  images: LaunchOnboardingImages;
  imageAlt: string;
};

export function getLaunchOnboardingImageSrc(
  step: LaunchOnboardingStep,
  client: "web" | "app",
): string {
  return client === "app" ? step.images.app : step.images.web;
}

const PLACEHOLDER = {
  templates: {
    web: "/templates/previews/travel/travel-itinerary.jpg",
    app: "/templates/previews/travel/travel-itinerary.jpg",
  },
  editor: {
    web: "/lp/demo/hotel-hero.jpg",
    app: "/lp/demo/hotel-hero.jpg",
  },
  ai: {
    web: "/templates/previews/business/515b796d.jpg",
    app: "/templates/previews/business/515b796d.jpg",
  },
  publish: {
    web: "/templates/previews/resort/69ce1fd3.jpg",
    app: "/templates/previews/resort/69ce1fd3.jpg",
  },
  works: {
    web: "/templates/previews/ryokan/fd3c3f68.jpg",
    app: "/templates/previews/ryokan/fd3c3f68.jpg",
  },
} as const;

export const LAUNCH_ONBOARDING_STEPS: LaunchOnboardingStep[] = [
  {
    id: "templates",
    kicker: "テンプレート",
    title: "館内案内も旅行しおりも、型からすぐ",
    body: "ホテル・旅館向けの館内案内から、個人の旅行・イベントまで。テンプレートを選び、写真と文言を差し替えるだけで形になります。",
    images: PLACEHOLDER.templates,
    imageAlt: "テンプレート一覧",
  },
  {
    id: "editor",
    kicker: "ブロック編集",
    title: "スマホ1ページに、必要な案内だけ",
    body: "ヒーロー・スケジュール・地図・FAQ などをブロックで並べます。見出しや写真はその場で編集できます。",
    images: {
      web: PLACEHOLDER.editor,
      app: PLACEHOLDER.editor,
    },
    imageAlt: "ページ編集画面",
  },
  {
    id: "ai",
    kicker: "AI作成",
    title: "説明文から、下書きまで一気に",
    body: "施設の説明やイベント概要を入力するだけで、カード構成と文案のたたき台を自動で用意。あとから自由に直せます。",
    images: {
      web: PLACEHOLDER.ai,
      app: PLACEHOLDER.ai,
    },
    imageAlt: "AIでページ作成",
  },
  {
    id: "publish",
    kicker: "公開・共有",
    title: "リンクとQRで、ゲストへ届ける",
    body: "公開すると専用URLとQRコードが用意されます。印刷物やフロント掲示、LINE共有にもそのまま使えます。",
    images: {
      web: PLACEHOLDER.publish,
      app: PLACEHOLDER.publish,
    },
    imageAlt: "公開・共有",
  },
  {
    id: "works",
    kicker: "作品管理",
    title: "案内ページを、まとめて管理",
    body: "作成したページは一覧で管理。下書きと公開を切り替えながら、複数施設・複数用途の案内を運用できます。",
    images: {
      web: PLACEHOLDER.works,
      app: PLACEHOLDER.works,
    },
    imageAlt: "作品一覧",
  },
];

export function isLaunchOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(LAUNCH_ONBOARDING_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const LEGACY_ONBOARDING_KEYS = [
  "infomii_app_onboarding_completed",
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

export function resetLaunchOnboarding(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LAUNCH_ONBOARDING_STORAGE_KEY);
    for (const key of LEGACY_ONBOARDING_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    /* private mode */
  }
}

/** Settings dev entry — development build or explicit env flag */
export function isLaunchOnboardingDevToolsEnabled(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_ONBOARDING_DEV_RESET === "true"
  );
}
