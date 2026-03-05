import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  AD_BOOST_MS,
  AD_INSTANT_SECONDS,
  AdRewardKind,
  adBoostRemainingSec,
  adCooldownRemainingSec,
  adMultiplier,
} from "./src/game/ad-reward";
import { getRewardedAdRuntimeLabel, showRewardedAd } from "./src/ads/rewarded-ad";

type GameState = {
  money: number;
  rooms: number;
  adr: number;
  occupancy: number;
  roomLevel: number;
  totalEarned: number;
  totalCheckIns: number;
  unlockedAchievements: string[];
  claimedAchievementRewards: string[];
  achievementMultiplier: number;
  prestigeStars: number;
  prestigeMultiplier: number;
  adBoostUntil: number;
  lastAdWatchAt: number;
  dailyDateKey: string;
  dailyCheckIns: number;
  dailyEarned: number;
  dailyUpgradeActions: number;
  dailyMissions: DailyMission[];
  lastSavedAt: number;
};

type TabKey = "ops" | "upgrade" | "daily" | "achievement";

type DailyMission = {
  id: string;
  title: string;
  metric: "checkins" | "earned" | "upgrades";
  target: number;
  reward: number;
  claimed: boolean;
};

const STORAGE_KEY = "hotel-idle-mobile-v1";
const CHECKIN_BASE = 12;
const GRID_COLS = 6;
const GRID_ROWS_PER_FLOOR = 1;
const ROOM_COST_BASE = 100;
const ROOM_COST_GROWTH = 1.15;

function currentDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function seededValue(seedBase: number, min: number, max: number): number {
  const x = Math.abs(Math.sin(seedBase) * 10000);
  return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
}

function hashDateKey(dateKey: string): number {
  let h = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    h = (h * 31 + dateKey.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function buildDailyMissions(dateKey: string): DailyMission[] {
  const seed = hashDateKey(dateKey);
  const checkinsTarget = seededValue(seed + 11, 20, 60);
  const earnedTarget = seededValue(seed + 29, 25_000, 120_000);
  const upgradesTarget = seededValue(seed + 47, 4, 14);
  return [
    {
      id: `${dateKey}-checkins`,
      title: `接客を ${checkinsTarget} 回行う`,
      metric: "checkins",
      target: checkinsTarget,
      reward: Math.floor(checkinsTarget * 130),
      claimed: false,
    },
    {
      id: `${dateKey}-earned`,
      title: `本日の売上を ¥${earnedTarget.toLocaleString()} まで伸ばす`,
      metric: "earned",
      target: earnedTarget,
      reward: Math.floor(earnedTarget * 0.16),
      claimed: false,
    },
    {
      id: `${dateKey}-upgrades`,
      title: `アップグレードを ${upgradesTarget} 回実行`,
      metric: "upgrades",
      target: upgradesTarget,
      reward: upgradesTarget * 900,
      claimed: false,
    },
  ];
}

const initialState: GameState = {
  money: 0,
  rooms: 18,
  adr: 6000,
  occupancy: 0.35,
  roomLevel: 0,
  totalEarned: 0,
  totalCheckIns: 0,
  unlockedAchievements: [],
  claimedAchievementRewards: [],
  achievementMultiplier: 1,
  prestigeStars: 0,
  prestigeMultiplier: 1,
  adBoostUntil: 0,
  lastAdWatchAt: 0,
  dailyDateKey: currentDateKey(),
  dailyCheckIns: 0,
  dailyEarned: 0,
  dailyUpgradeActions: 0,
  dailyMissions: buildDailyMissions(currentDateKey()),
  lastSavedAt: Date.now(),
};

const achievementCatalog = [
  { id: "first-checkin", title: "はじめての接客", rewardMul: 0.02, condition: (s: GameState) => s.totalCheckIns >= 1 },
  { id: "cash-1k", title: "初回黒字", rewardMul: 0.03, condition: (s: GameState) => s.money >= 1_000 },
  { id: "rooms-50", title: "中規模ホテル", rewardMul: 0.04, condition: (s: GameState) => s.rooms >= 50 },
  { id: "occupancy-80", title: "満室に近い夜", rewardMul: 0.05, condition: (s: GameState) => s.occupancy >= 0.8 },
  { id: "builder-10", title: "増築マスター", rewardMul: 0.06, condition: (s: GameState) => s.roomLevel >= 10 },
  { id: "earned-100k", title: "総売上10万", rewardMul: 0.08, condition: (s: GameState) => s.totalEarned >= 100_000 },
] as const;

function roomCost(level: number): number {
  return Math.floor(ROOM_COST_BASE * Math.pow(ROOM_COST_GROWTH, level));
}

function incomePerSec(state: GameState): number {
  return ((state.rooms * state.adr * state.occupancy) / 86400) * state.prestigeMultiplier * state.achievementMultiplier;
}

function withAchievementUpdate(state: GameState): GameState {
  const unlocked = new Set(state.unlockedAchievements);
  for (const achievement of achievementCatalog) {
    if (achievement.condition(state)) unlocked.add(achievement.id);
  }
  return { ...state, unlockedAchievements: Array.from(unlocked) };
}

function calcAchievementMultiplier(claimedIds: string[]): number {
  let mul = 1;
  for (const achievement of achievementCatalog) {
    if (claimedIds.includes(achievement.id)) mul += achievement.rewardMul;
  }
  return mul;
}

function formatNumber(value: number): string {
  if (value < 1_000) return `${Math.floor(value)}`;
  if (value < 1_000_000) return `${(value / 1_000).toFixed(1)}K`;
  if (value < 1_000_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return `${(value / 1_000_000_000).toFixed(1)}B`;
}

function formatSec(sec: number): string {
  return `${Math.floor(sec / 60)}:${`${sec % 60}`.padStart(2, "0")}`;
}

function roomLabel(roomIndex: number): string {
  const floor = Math.floor(roomIndex / GRID_COLS) + 1;
  const roomNo = (roomIndex % GRID_COLS) + 1;
  return `${floor}${`${roomNo}`.padStart(2, "0")}`;
}

function floorRoomType(floorNo: number): "STD" | "DELUXE" | "SUITE" {
  if (floorNo >= 7) return "SUITE";
  if (floorNo >= 4) return "DELUXE";
  return "STD";
}

function calcPrestigeGain(totalEarned: number): number {
  if (totalEarned < 50_000) return 0;
  return Math.max(0, Math.floor(Math.sqrt(totalEarned / 50_000)));
}

function missionProgress(state: GameState, metric: DailyMission["metric"]): number {
  if (metric === "checkins") return state.dailyCheckIns;
  if (metric === "earned") return state.dailyEarned;
  return state.dailyUpgradeActions;
}

function isMissionComplete(state: GameState, mission: DailyMission): boolean {
  return missionProgress(state, mission.metric) >= mission.target;
}

function ensureDailyState(state: GameState): GameState {
  const today = currentDateKey();
  if (state.dailyDateKey === today) return state;
  return {
    ...state,
    dailyDateKey: today,
    dailyCheckIns: 0,
    dailyEarned: 0,
    dailyUpgradeActions: 0,
    dailyMissions: buildDailyMissions(today),
  };
}

function hydrateState(raw: Partial<GameState> | null): GameState {
  if (!raw) return initialState;
  const claimedAchievementRewards = Array.isArray(raw.claimedAchievementRewards)
    ? raw.claimedAchievementRewards
    : [];
  const base: GameState = {
    ...initialState,
    ...raw,
    claimedAchievementRewards,
    achievementMultiplier:
      typeof raw.achievementMultiplier === "number"
        ? raw.achievementMultiplier
        : calcAchievementMultiplier(claimedAchievementRewards),
    dailyDateKey: typeof raw.dailyDateKey === "string" ? raw.dailyDateKey : currentDateKey(),
    dailyCheckIns: typeof raw.dailyCheckIns === "number" ? raw.dailyCheckIns : 0,
    dailyEarned: typeof raw.dailyEarned === "number" ? raw.dailyEarned : 0,
    dailyUpgradeActions: typeof raw.dailyUpgradeActions === "number" ? raw.dailyUpgradeActions : 0,
    dailyMissions: Array.isArray(raw.dailyMissions) ? raw.dailyMissions : buildDailyMissions(currentDateKey()),
  };
  return ensureDailyState(base);
}

export default function App() {
  const [state, setState] = useState<GameState>(initialState);
  const [ready, setReady] = useState(false);
  const [nowTs, setNowTs] = useState(0);
  const [simSpeed, setSimSpeed] = useState(1);
  const [adLoading, setAdLoading] = useState(false);
  const [adError, setAdError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("ops");
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);
  const [adRuntimeLabel] = useState(getRewardedAdRuntimeLabel());
  const [lastArrivalRoom, setLastArrivalRoom] = useState<number | null>(null);
  const prevUnlockedRef = useRef<Set<string>>(new Set());
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const income = useMemo(() => incomePerSec(state), [state]);
  const cost = useMemo(() => roomCost(state.roomLevel), [state.roomLevel]);
  const litRooms = useMemo(() => Math.min(state.rooms, Math.floor(state.rooms * state.occupancy)), [state.rooms, state.occupancy]);
  const roomsPerFloor = GRID_COLS * GRID_ROWS_PER_FLOOR;
  const floors = Math.max(1, Math.ceil(state.rooms / roomsPerFloor));
  const adBoostSec = adBoostRemainingSec(state.adBoostUntil, nowTs);
  const adCooldownSec = adCooldownRemainingSec(state.lastAdWatchAt, nowTs);
  const prestigeGain = calcPrestigeGain(state.totalEarned);
  const achievementTitleMap = useMemo(
    () => new Map<string, string>(achievementCatalog.map((a) => [a.id, a.title])),
    [],
  );

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = saved ? (JSON.parse(saved) as Partial<GameState>) : null;
      const hydrated = hydrateState(parsed);
      if (!parsed) {
        setNowTs(Date.now());
        setReady(true);
        return;
      }
      const offlineSec = Math.max(0, (Date.now() - hydrated.lastSavedAt) / 1000);
      const mul = adMultiplier(hydrated.adBoostUntil, Date.now());
      const gain = incomePerSec(hydrated) * offlineSec * mul;
      setState(
        withAchievementUpdate({
          ...hydrated,
          money: hydrated.money + gain,
          totalEarned: hydrated.totalEarned + gain,
          dailyEarned: hydrated.dailyEarned + gain,
          lastSavedAt: Date.now(),
        }),
      );
      setNowTs(Date.now());
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      setState((prev) => {
        const base = ensureDailyState(prev);
        const mul = adMultiplier(base.adBoostUntil, Date.now());
        const gain = incomePerSec(base) * 0.25 * simSpeed * mul;
        return withAchievementUpdate({
          ...base,
          money: base.money + gain,
          totalEarned: base.totalEarned + gain,
          dailyEarned: base.dailyEarned + gain,
        });
      });
    }, 250);
    return () => clearInterval(timer);
  }, [ready, simSpeed]);

  useEffect(() => {
    if (!ready) return;
    const timer = setInterval(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastSavedAt: Date.now() })).catch(() => undefined);
    }, 3000);
    return () => clearInterval(timer);
  }, [ready, state]);

  useEffect(() => {
    if (!ready) return;
    const prev = prevUnlockedRef.current;
    const newlyUnlocked = state.unlockedAchievements.filter((id) => !prev.has(id));
    if (newlyUnlocked.length > 0) {
      const latestTitle = achievementTitleMap.get(newlyUnlocked[newlyUnlocked.length - 1]) ?? "実績";
      triggerFeedback("achievement");
      setToastMessage(`実績解除: ${latestTitle}`);
    }
    prevUnlockedRef.current = new Set(state.unlockedAchievements);
  }, [ready, state.unlockedAchievements, achievementTitleMap]);

  useEffect(() => {
    if (!toastMessage) return;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage("");
    }, 1800);
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [toastMessage]);

  function triggerFeedback(kind: "tap" | "achievement" | "reward") {
    void kind;
  }

  function onCheckIn() {
    const gain = Math.floor(CHECKIN_BASE + (state.adr / 2400) * (0.6 + state.occupancy));
    const targetRoom = Math.floor(Math.random() * Math.max(1, state.rooms));
    setLastArrivalRoom(targetRoom);
    setTimeout(() => setLastArrivalRoom(null), 550);
    triggerFeedback("tap");
    setState((prev) =>
      {
        const daily = ensureDailyState(prev);
        return withAchievementUpdate({
          ...daily,
          money: daily.money + gain,
          totalEarned: daily.totalEarned + gain,
          dailyEarned: daily.dailyEarned + gain,
          totalCheckIns: daily.totalCheckIns + 1,
          dailyCheckIns: daily.dailyCheckIns + 1,
          occupancy: Math.min(0.95, daily.occupancy + 0.003),
        });
      },
    );
  }

  function buyRooms() {
    if (state.money < cost) return;
    triggerFeedback("tap");
    setState((prev) =>
      {
        const daily = ensureDailyState(prev);
        return withAchievementUpdate({
          ...daily,
          money: daily.money - cost,
          rooms: daily.rooms + 6,
          roomLevel: daily.roomLevel + 1,
          dailyUpgradeActions: daily.dailyUpgradeActions + 1,
          occupancy: Math.max(0.15, daily.occupancy - 0.02),
        });
      },
    );
  }

  function applyAdrUpgrade() {
    triggerFeedback("tap");
    setState((prev) => {
      const daily = ensureDailyState(prev);
      return withAchievementUpdate({
        ...daily,
        adr: Math.floor(daily.adr * 1.05),
        dailyUpgradeActions: daily.dailyUpgradeActions + 1,
      });
    });
  }

  function applyOccupancyUpgrade() {
    triggerFeedback("tap");
    setState((prev) => {
      const daily = ensureDailyState(prev);
      return withAchievementUpdate({
        ...daily,
        occupancy: Math.min(0.95, daily.occupancy + 0.03),
        dailyUpgradeActions: daily.dailyUpgradeActions + 1,
      });
    });
  }

  function claimDailyMission(missionId: string) {
    setState((prev) => {
      const daily = ensureDailyState(prev);
      const target = daily.dailyMissions.find((m) => m.id === missionId);
      if (!target || target.claimed || !isMissionComplete(daily, target)) return daily;
      const updatedMissions = daily.dailyMissions.map((m) =>
        m.id === missionId ? { ...m, claimed: true } : m,
      );
      return withAchievementUpdate({
        ...daily,
        dailyMissions: updatedMissions,
        money: daily.money + target.reward,
        totalEarned: daily.totalEarned + target.reward,
        dailyEarned: daily.dailyEarned + target.reward,
      });
    });
    triggerFeedback("reward");
    setToastMessage("日次ミッション報酬を受け取りました");
  }

  function doPrestige() {
    if (prestigeGain <= 0) return;
    const newStars = state.prestigeStars + prestigeGain;
    const newMultiplier = 1 + newStars * 0.08;
    setState({
      ...initialState,
      prestigeStars: newStars,
      prestigeMultiplier: newMultiplier,
      unlockedAchievements: state.unlockedAchievements,
      claimedAchievementRewards: state.claimedAchievementRewards,
      achievementMultiplier: state.achievementMultiplier,
      dailyDateKey: currentDateKey(),
      dailyMissions: buildDailyMissions(currentDateKey()),
      lastSavedAt: Date.now(),
    });
    setNowTs(Date.now());
    setToastMessage(`転生成功: 星 +${prestigeGain}（倍率 x${newMultiplier.toFixed(2)}）`);
    triggerFeedback("reward");
  }

  function claimAchievementReward(achievementId: string) {
    setState((prev) => {
      const daily = ensureDailyState(prev);
      if (!daily.unlockedAchievements.includes(achievementId)) return daily;
      if (daily.claimedAchievementRewards.includes(achievementId)) return daily;
      const nextClaimed = [...daily.claimedAchievementRewards, achievementId];
      return withAchievementUpdate({
        ...daily,
        claimedAchievementRewards: nextClaimed,
        achievementMultiplier: calcAchievementMultiplier(nextClaimed),
      });
    });
    triggerFeedback("reward");
    setToastMessage("実績報酬を受け取りました（恒久倍率アップ）");
  }

  async function applyAdReward(kind: AdRewardKind) {
    if (adLoading || adCooldownSec > 0) return;
    setAdLoading(true);
    setAdError("");
    const watched = await showRewardedAd(kind);
    if (!watched) {
      setAdLoading(false);
      setAdError("広告の読み込みに失敗しました。再試行してください。");
      return;
    }

    const watchedAt = Date.now();
    setState((prev) => {
      const daily = ensureDailyState(prev);
      const base = { ...daily, lastAdWatchAt: watchedAt };
      if (kind === "boost") {
        return withAchievementUpdate({ ...base, adBoostUntil: watchedAt + AD_BOOST_MS });
      }
      const instant = incomePerSec(daily) * AD_INSTANT_SECONDS;
      return withAchievementUpdate({
        ...base,
        money: daily.money + instant,
        totalEarned: daily.totalEarned + instant,
        dailyEarned: daily.dailyEarned + instant,
      });
    });
    setNowTs(Date.now());
    setAdLoading(false);
    triggerFeedback("reward");
    setToastMessage(kind === "boost" ? "広告報酬: 30分 2倍ブースト開始" : "広告報酬: 10分分の即時収益を獲得");
  }

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loading}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      {toastMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
      <View style={styles.container}>
        <Text style={styles.title}>ホテル経営アイドル</Text>
        <Text style={styles.subtitle}>部屋を増やして、収益ループを完成させよう</Text>
        <View style={styles.topInfoRow}>
          <View style={styles.topInfoPill}>
            <Text style={styles.topInfoText}>総フロア {floors}F</Text>
          </View>
          <View style={styles.topInfoPill}>
            <Text style={styles.topInfoText}>転生 x{state.prestigeMultiplier.toFixed(2)}</Text>
          </View>
          <View style={styles.topInfoPill}>
            <Text style={styles.topInfoText}>実績 x{state.achievementMultiplier.toFixed(2)}</Text>
          </View>
        </View>
        {activeTab === "ops" || activeTab === "upgrade" ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ホテルビュー</Text>
            <ScrollView
              style={styles.hotelViewport}
              contentContainerStyle={styles.hotelViewportContent}
              showsVerticalScrollIndicator
            >
              {Array.from({ length: floors }).map((_, floorTopIndex) => {
                const floorFromBottom = floors - 1 - floorTopIndex;
                const floorNo = floorFromBottom + 1;
                const start = floorFromBottom * roomsPerFloor;
                const floorType = floorRoomType(floorNo);
                const floorTypeStyle =
                  floorType === "STD" ? styles.floorTypeSTD : floorType === "DELUXE" ? styles.floorTypeDELUXE : styles.floorTypeSUITE;
                const existsOnFloor = Math.max(0, Math.min(roomsPerFloor, state.rooms - start));
                const litOnFloor = Math.max(0, Math.min(roomsPerFloor, litRooms - start));
                const floorFull = existsOnFloor > 0 && litOnFloor >= existsOnFloor;
                return (
                  <View key={floorTopIndex} style={styles.floorBlock}>
                    <View style={styles.floorMetaRow}>
                      <Text style={[styles.floorLabel, floorFull && styles.floorLabelFull]}>{floorNo}F</Text>
                      <Text style={[styles.floorTypeBadge, floorTypeStyle]}>{floorType}</Text>
                      {floorFull ? <Text style={styles.floorFullText}>満室</Text> : null}
                    </View>
                    <View style={styles.floorRow}>
                      <View style={styles.elevatorLane}>
                        <Text style={styles.elevatorIcon}>🛗</Text>
                        <Text style={styles.corridorIcon}>🚪</Text>
                      </View>
                      <View style={styles.grid}>
                        {Array.from({ length: roomsPerFloor }).map((__, i) => {
                          const idx = start + i;
                          const exists = idx < state.rooms;
                          const lit = exists && idx < litRooms;
                          const arrival = idx === lastArrivalRoom;
                          return (
                            <View key={idx} style={[styles.room, !exists && styles.roomEmpty, lit && styles.roomLit, arrival && styles.roomArrival]}>
                              {exists ? (
                                <>
                                  <Text style={[styles.roomNumber, lit && styles.roomNumberLit]}>{roomLabel(idx)}</Text>
                                  <Text style={[styles.roomState, lit && styles.roomStateLit]}>{lit ? "IN" : "VAC"}</Text>
                                </>
                              ) : null}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <Text style={styles.lobby}>ロビー</Text>
          </View>
        ) : (
          <View style={styles.compactSummary}>
            <Text style={styles.compactSummaryText}>
              客室 {state.rooms} / 稼働率 {Math.floor(state.occupancy * 100)}% / 収益 ¥
              {formatNumber(income * simSpeed * adMultiplier(state.adBoostUntil, nowTs))}/秒
            </Text>
          </View>
        )}
        <ScrollView
          style={styles.tabPanel}
          contentContainerStyle={styles.tabPanelContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "ops" ? (
            <>
              <Text style={styles.sectionHeader}>運営ダッシュボード</Text>
              <View style={styles.statsRow}>
                <Stat label="所持金" value={`¥ ${formatNumber(state.money)}`} />
                <Stat label="収益/秒" value={`¥ ${formatNumber(income * simSpeed * adMultiplier(state.adBoostUntil, nowTs))}`} />
                <Stat label="稼働率" value={`${Math.floor(state.occupancy * 100)}%`} />
              </View>
              <View style={styles.statsRow}>
                <Stat label="累計収益" value={`¥ ${formatNumber(state.totalEarned)}`} />
                <Stat label="接客回数" value={formatNumber(state.totalCheckIns)} />
              </View>
              <Pressable style={styles.mainButton} onPress={onCheckIn}>
                <Text style={styles.mainButtonTitle}>チェックイン対応</Text>
                <Text style={styles.mainButtonSub}>タップで即時収益 + 稼働率アップ</Text>
              </Pressable>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>広告報酬</Text>
                <Text style={styles.subText}>実行モード: {adRuntimeLabel}</Text>
                <Text style={styles.subText}>{adBoostSec > 0 ? `2倍ブースト 残り ${formatSec(adBoostSec)}` : "ブーストなし"}</Text>
                <View style={styles.row}>
                  <Pressable style={[styles.rowButton, (adLoading || adCooldownSec > 0) && styles.disabled]} onPress={() => applyAdReward("boost")} disabled={adLoading || adCooldownSec > 0}>
                    <Text style={styles.buttonText}>視聴: 30分 2倍</Text>
                  </Pressable>
                  <Pressable style={[styles.rowButton, (adLoading || adCooldownSec > 0) && styles.disabled]} onPress={() => applyAdReward("instant")} disabled={adLoading || adCooldownSec > 0}>
                    <Text style={styles.buttonText}>視聴: 10分即時収益</Text>
                  </Pressable>
                </View>
                <Text style={styles.subText}>
                  {adLoading ? "広告再生中..." : adCooldownSec > 0 ? `クールダウン ${adCooldownSec}秒` : "視聴できます"}
                </Text>
                {adError ? <Text style={styles.errorText}>{adError}</Text> : null}
              </View>
            </>
          ) : null}

          {activeTab === "upgrade" ? (
            <>
              <Text style={styles.sectionHeader}>設備・成長管理</Text>
              <View style={styles.statsRow}>
                <Stat label="転生倍率" value={`x${state.prestigeMultiplier.toFixed(2)}`} />
                <Stat label="実績倍率" value={`x${state.achievementMultiplier.toFixed(2)}`} />
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>アップグレード</Text>
                <Pressable style={[styles.rowButton, state.money < cost && styles.disabled]} onPress={buyRooms} disabled={state.money < cost}>
                  <Text style={styles.buttonText}>客室を増築 (+6) Lv {state.roomLevel}</Text>
                  <Text style={styles.subText}>コスト ¥ {formatNumber(cost)}</Text>
                </Pressable>
                <View style={styles.row}>
                  <Pressable style={styles.rowButton} onPress={applyAdrUpgrade}>
                    <Text style={styles.buttonText}>単価アップ +5%</Text>
                  </Pressable>
                  <Pressable style={styles.rowButton} onPress={applyOccupancyUpgrade}>
                    <Text style={styles.buttonText}>稼働率アップ +3%</Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>転生（Prestige）</Text>
                <Text style={styles.subText}>現在の星: {state.prestigeStars}</Text>
                <Text style={styles.subText}>恒久倍率: x{state.prestigeMultiplier.toFixed(2)}</Text>
                <Text style={styles.subText}>
                  今転生すると +{prestigeGain} 星（必要: 累計収益 ¥50,000 以上）
                </Text>
                <Pressable
                  style={[styles.rowButton, prestigeGain <= 0 && styles.disabled]}
                  onPress={doPrestige}
                  disabled={prestigeGain <= 0}
                >
                  <Text style={styles.buttonText}>転生する</Text>
                </Pressable>
              </View>
            </>
          ) : null}

          {activeTab === "daily" ? (
            <>
              <Text style={styles.sectionHeader}>日次チャレンジ</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>日次ミッション ({state.dailyDateKey})</Text>
                <Text style={styles.subText}>
                  進捗: 接客 {state.dailyCheckIns}回 / 売上 ¥{formatNumber(state.dailyEarned)} / 強化 {state.dailyUpgradeActions}回
                </Text>
                {state.dailyMissions.map((mission) => {
                  const progress = missionProgress(state, mission.metric);
                  const complete = isMissionComplete(state, mission);
                  return (
                    <View key={mission.id} style={styles.missionItem}>
                      <Text style={styles.missionTitle}>{mission.title}</Text>
                      <Text style={styles.subText}>
                        {formatNumber(progress)} / {formatNumber(mission.target)} ・報酬 ¥{formatNumber(mission.reward)}
                      </Text>
                      <Pressable
                        style={[styles.rowButton, (!complete || mission.claimed) && styles.disabled]}
                        onPress={() => claimDailyMission(mission.id)}
                        disabled={!complete || mission.claimed}
                      >
                        <Text style={styles.buttonText}>{mission.claimed ? "受取済み" : complete ? "報酬を受け取る" : "未達成"}</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          ) : null}

          {activeTab === "achievement" ? (
            <>
              <Text style={styles.sectionHeader}>実績・報酬</Text>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>実績 ({state.unlockedAchievements.length}/{achievementCatalog.length})</Text>
                {achievementCatalog.map((a) => {
                  const unlocked = state.unlockedAchievements.includes(a.id);
                  const claimed = state.claimedAchievementRewards.includes(a.id);
                  return (
                    <View key={a.id} style={styles.missionItem}>
                      <Text style={[styles.missionTitle, unlocked && styles.achievementUnlocked]}>
                        {unlocked ? "🏅" : "🔒"} {a.title}（恒久 +{Math.floor(a.rewardMul * 100)}%）
                      </Text>
                      <Pressable
                        style={[styles.rowButton, (!unlocked || claimed) && styles.disabled]}
                        onPress={() => claimAchievementReward(a.id)}
                        disabled={!unlocked || claimed}
                      >
                        <Text style={styles.buttonText}>{claimed ? "受取済み" : unlocked ? "報酬を受け取る" : "未達成"}</Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
              <View style={styles.card}>
                <Pressable
                  style={styles.advancedToggle}
                  onPress={() => setShowAdvancedPanel((v) => !v)}
                >
                  <Text style={styles.cardTitle}>詳細設定</Text>
                  <Text style={styles.subText}>{showAdvancedPanel ? "閉じる" : "開く"}</Text>
                </Pressable>
                {showAdvancedPanel ? (
                  <>
                    <View style={styles.row}>
                      {[1, 2, 5, 10].map((speed) => (
                        <Pressable key={speed} style={[styles.rowButton, simSpeed === speed && styles.speedActive]} onPress={() => setSimSpeed(speed)}>
                          <Text style={styles.buttonText}>x{speed}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={styles.row}>
                      <Pressable style={styles.rowButton} onPress={() => setState((p) => withAchievementUpdate({ ...p, money: p.money + 10_000, totalEarned: p.totalEarned + 10_000 }))}>
                        <Text style={styles.buttonText}>+¥10,000</Text>
                      </Pressable>
                      <Pressable style={styles.rowButton} onPress={() => setState({ ...initialState, lastSavedAt: Date.now() })}>
                        <Text style={styles.buttonText}>全リセット</Text>
                      </Pressable>
                    </View>
                  </>
                ) : null}
              </View>
            </>
          ) : null}
        </ScrollView>
      </View>
      <View style={styles.tabBar}>
        <TabButton icon="🏨" label="運営" active={activeTab === "ops"} onPress={() => setActiveTab("ops")} />
        <TabButton icon="🛠" label="強化" active={activeTab === "upgrade"} onPress={() => setActiveTab("upgrade")} />
        <TabButton icon="📅" label="日次" active={activeTab === "daily"} onPress={() => setActiveTab("daily")} />
        <TabButton icon="🏅" label="実績" active={activeTab === "achievement"} onPress={() => setActiveTab("achievement")} />
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function TabButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#071421" },
  toast: {
    position: "absolute",
    top: 10,
    left: 16,
    right: 16,
    zIndex: 50,
    backgroundColor: "#1d3f2e",
    borderColor: "#4f8f6d",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  toastText: { color: "#e9ffe9", fontWeight: "800", textAlign: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loading: { color: "#d6e3ff", fontWeight: "700" },
  container: { flex: 1, padding: 14, gap: 10 },
  title: { color: "#f5fbff", fontSize: 21, fontWeight: "900" },
  subtitle: { color: "#9db8d1", fontSize: 11, fontWeight: "600", marginTop: -4, marginBottom: 2 },
  sectionHeader: { color: "#9ac4e6", fontSize: 12, fontWeight: "800", letterSpacing: 0.4, marginTop: 2 },
  topInfoRow: { flexDirection: "row", gap: 6 },
  topInfoPill: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3a6b8f",
    backgroundColor: "#163853",
    paddingVertical: 6,
    alignItems: "center",
  },
  topInfoText: { color: "#b6d8f5", fontSize: 11, fontWeight: "700" },
  compactSummary: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2a506e",
    backgroundColor: "#12293f",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  compactSummaryText: { color: "#cfe6fb", fontSize: 12, fontWeight: "700", textAlign: "center" },
  card: { backgroundColor: "#0f2237", borderColor: "#2d5272", borderWidth: 1, borderRadius: 12, padding: 10, gap: 7 },
  cardTitle: { color: "#f2f7ff", fontWeight: "900", fontSize: 13 },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  floorBlock: { gap: 4 },
  floorMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginLeft: 2 },
  hotelViewport: {
    maxHeight: 230,
    minHeight: 118,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2b4f6d",
    backgroundColor: "#0b1c2e",
  },
  hotelViewportContent: { padding: 8, gap: 6 },
  floorLabel: { color: "#8fb4d1", fontSize: 11, fontWeight: "800", marginLeft: 2 },
  floorLabelFull: { color: "#f9d470" },
  floorTypeBadge: {
    fontSize: 9,
    fontWeight: "900",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: "hidden",
  },
  floorTypeSTD: { color: "#b8d4ee", borderColor: "#537aa0", backgroundColor: "#1a3750" },
  floorTypeDELUXE: { color: "#d7e8ff", borderColor: "#6d84b6", backgroundColor: "#2a3657" },
  floorTypeSUITE: { color: "#f8e7bb", borderColor: "#ad8e43", backgroundColor: "#4b3a1e" },
  floorFullText: { color: "#f6d78b", fontSize: 10, fontWeight: "900" },
  floorRow: { flexDirection: "row", alignItems: "stretch", gap: 6 },
  elevatorLane: {
    width: 28,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#355a78",
    backgroundColor: "#122538",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 5,
  },
  elevatorIcon: { fontSize: 13 },
  corridorIcon: { fontSize: 12 },
  grid: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6 },
  room: {
    width: "15.8%",
    height: 46,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#3f607f",
    backgroundColor: "#223a51",
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  roomEmpty: { backgroundColor: "transparent", borderColor: "transparent" },
  roomLit: { backgroundColor: "#d3a440", borderColor: "#ffd17c" },
  roomArrival: { borderColor: "#fff5d4", borderWidth: 2 },
  roomNumber: { color: "#dce9f8", fontWeight: "800", fontSize: 11, letterSpacing: 0.3 },
  roomNumberLit: { color: "#1d1710" },
  roomState: {
    color: "#96b4d1",
    fontWeight: "700",
    fontSize: 8,
    letterSpacing: 0.6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#3f607f",
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: "hidden",
  },
  roomStateLit: {
    color: "#1d1710",
    borderColor: "#9d7730",
    backgroundColor: "#f1d48c",
  },
  lobby: { textAlign: "center", color: "#b9d9ff", fontWeight: "700", marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, backgroundColor: "#12304a", borderColor: "#3a6f96", borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 9 },
  statLabel: { color: "#b4d0ea", fontSize: 11, fontWeight: "700" },
  statValue: { color: "#f5fbff", marginTop: 3, fontWeight: "900", fontSize: 16 },
  mainButton: {
    backgroundColor: "#1b7ea1",
    borderRadius: 12,
    borderColor: "#6dc9ef",
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  mainButtonTitle: { color: "#effbff", fontWeight: "900", textAlign: "center", fontSize: 18 },
  mainButtonSub: { color: "#d4eef7", textAlign: "center", fontSize: 11, marginTop: 3, fontWeight: "600" },
  rowButton: { flex: 1, minWidth: 110, backgroundColor: "#173652", borderColor: "#3f7095", borderWidth: 1, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 9 },
  missionItem: { borderColor: "#345d82", borderWidth: 1, borderRadius: 10, padding: 9, gap: 5, backgroundColor: "#112d46" },
  missionTitle: { color: "#eff7ff", fontWeight: "700", fontSize: 13 },
  buttonText: { color: "#eff7ff", fontWeight: "700", textAlign: "center" },
  subText: { color: "#b0c9df", fontSize: 12 },
  disabled: { opacity: 0.5 },
  speedActive: { borderColor: "#66c4ff", backgroundColor: "#1e4865" },
  achievementUnlocked: { color: "#d9ef8f" },
  errorText: { color: "#ffb1b1", fontSize: 12 },
  tabPanel: { flex: 1 },
  tabPanelContent: { gap: 10, paddingBottom: 12 },
  advancedToggle: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tabBar: {
    flexDirection: "row",
    borderTopColor: "#345978",
    borderTopWidth: 1,
    backgroundColor: "#0a2034",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3f6685",
    backgroundColor: "#16324c",
    paddingVertical: 7,
    alignItems: "center",
  },
  tabButtonActive: {
    borderColor: "#7fd4ff",
    backgroundColor: "#255679",
  },
  tabIcon: { fontSize: 16, marginBottom: 2 },
  tabButtonText: { color: "#9cb8d4", fontWeight: "700", fontSize: 12 },
  tabButtonTextActive: { color: "#eef7ff" },
});
