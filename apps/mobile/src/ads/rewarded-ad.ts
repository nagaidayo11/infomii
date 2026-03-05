import { AdRewardKind } from "../game/ad-reward";
import { Platform } from "react-native";
import Constants from "expo-constants";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

type MobileAdsModule = {
  default?: () => { initialize: () => Promise<unknown> };
  AdEventType?: { LOADED: string; CLOSED: string; ERROR: string };
  RewardedAdEventType?: { EARNED_REWARD: string };
  RewardedAd?: {
    createForAdRequest: (
      adUnitId: string,
      options?: { requestNonPersonalizedAdsOnly?: boolean },
    ) => {
      load: () => void;
      show: () => Promise<void>;
      addAdEventListener: (eventType: string, listener: (...args: unknown[]) => void) => () => void;
    };
  };
  TestIds?: { REWARDED: string };
};

const MOCK_WATCH_MS = 2500;
let initPromise: Promise<unknown> | null = null;

function getAdsModule(): MobileAdsModule | null {
  // Expo Go does not support custom native modules like react-native-google-mobile-ads.
  if (Constants.appOwnership === "expo") {
    return null;
  }
  try {
    return require("react-native-google-mobile-ads") as MobileAdsModule;
  } catch {
    return null;
  }
}

function getRewardedAdUnitId(module: MobileAdsModule): string {
  const defaultId = module.TestIds?.REWARDED ?? "";
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_ADMOB_REWARDED_IOS ?? defaultId;
  }
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_ADMOB_REWARDED_ANDROID ?? defaultId;
  }
  return defaultId;
}

async function ensureInitialized(module: MobileAdsModule): Promise<void> {
  if (initPromise) {
    await initPromise;
    return;
  }
  const mobileAdsFactory = module.default;
  if (!mobileAdsFactory) return;
  initPromise = mobileAdsFactory().initialize();
  await initPromise;
}

function showMockRewardedAd(): Promise<boolean> {
  return delay(MOCK_WATCH_MS).then(() => true);
}

async function showNativeRewardedAd(module: MobileAdsModule, _kind: AdRewardKind): Promise<boolean> {
  const RewardedAd = module.RewardedAd;
  const AdEventType = module.AdEventType;
  const RewardedAdEventType = module.RewardedAdEventType;

  if (!RewardedAd || !AdEventType || !RewardedAdEventType) {
    return false;
  }

  await ensureInitialized(module);
  const adUnitId = getRewardedAdUnitId(module);
  if (!adUnitId) return false;

  return new Promise<boolean>((resolve) => {
    const ad = RewardedAd.createForAdRequest(adUnitId, { requestNonPersonalizedAdsOnly: true });
    let rewarded = false;
    let settled = false;
    const unsubs: Array<() => void> = [];

    function finish(result: boolean) {
      if (settled) return;
      settled = true;
      for (const unsub of unsubs) {
        try {
          unsub();
        } catch {
          // no-op
        }
      }
      resolve(result);
    }

    unsubs.push(
      ad.addAdEventListener(AdEventType.LOADED, () => {
        ad.show().catch(() => finish(false));
      }),
    );
    unsubs.push(
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        rewarded = true;
      }),
    );
    unsubs.push(
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        finish(rewarded);
      }),
    );
    unsubs.push(
      ad.addAdEventListener(AdEventType.ERROR, () => {
        finish(false);
      }),
    );

    ad.load();
    setTimeout(() => finish(false), 20_000);
  });
}

export function getRewardedAdRuntimeLabel(): string {
  return getAdsModule() ? "AdMob SDK" : "モック（Expo Go）";
}

export async function showRewardedAd(kind: AdRewardKind): Promise<boolean> {
  const module = getAdsModule();
  if (!module) {
    return showMockRewardedAd();
  }
  try {
    return await showNativeRewardedAd(module, kind);
  } catch {
    return false;
  }
}
