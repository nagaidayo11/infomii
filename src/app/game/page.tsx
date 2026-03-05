"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AD_BOOST_MS,
  AD_INSTANT_SECONDS,
  adBoostRemainingSec,
  adCooldownRemainingSec,
  adMultiplier,
  isAdBoostActive,
} from "@/lib/game/ad-reward";

type GameState = {
  money: number;
  rooms: number;
  adr: number;
  occupancy: number;
  roomLevel: number;
  totalEarned: number;
  totalCheckIns: number;
  unlockedAchievements: string[];
  adBoostUntil: number;
  lastAdWatchAt: number;
  lastSavedAt: number;
};

type FloatingCoin = {
  id: string;
  x: number;
  y: number;
};

type GuestWalker = {
  id: string;
  roomIndex: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
};

const STORAGE_KEY = "hotel-idle-state-v1";
const GRID_COLS = 6;
const GRID_ROWS_PER_FLOOR = 3;
const CHECKIN_BASE = 12;
const ROOM_COST_BASE = 100;
const ROOM_COST_GROWTH = 1.15;

const initialState: GameState = {
  money: 0,
  rooms: 18,
  adr: 6000,
  occupancy: 0.35,
  roomLevel: 0,
  totalEarned: 0,
  totalCheckIns: 0,
  unlockedAchievements: [],
  adBoostUntil: 0,
  lastAdWatchAt: 0,
  lastSavedAt: Date.now(),
};

const achievementCatalog = [
  { id: "first-checkin", title: "はじめての接客", description: "チェックインを1回実行", condition: (s: GameState) => s.totalCheckIns >= 1 },
  { id: "cash-1k", title: "初回黒字", description: "所持金1,000以上", condition: (s: GameState) => s.money >= 1_000 },
  { id: "rooms-50", title: "中規模ホテル", description: "客室数50以上", condition: (s: GameState) => s.rooms >= 50 },
  { id: "occupancy-80", title: "満室に近い夜", description: "稼働率80%以上", condition: (s: GameState) => s.occupancy >= 0.8 },
  { id: "builder-10", title: "増築マスター", description: "増築レベル10到達", condition: (s: GameState) => s.roomLevel >= 10 },
  { id: "earned-100k", title: "総売上10万", description: "累計収益100,000以上", condition: (s: GameState) => s.totalEarned >= 100_000 },
] as const;

function formatNumber(value: number): string {
  if (value < 1_000) return `${Math.floor(value)}`;
  if (value < 1_000_000) return `${(value / 1_000).toFixed(1)}K`;
  if (value < 1_000_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return `${(value / 1_000_000_000).toFixed(1)}B`;
}

function roomCost(level: number): number {
  return Math.floor(ROOM_COST_BASE * Math.pow(ROOM_COST_GROWTH, level));
}

function incomePerSec(state: GameState): number {
  return (state.rooms * state.adr * state.occupancy) / 86400;
}

function safeParseState(value: string | null): GameState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<GameState>;
    if (
      typeof parsed.money !== "number" ||
      typeof parsed.rooms !== "number" ||
      typeof parsed.adr !== "number" ||
      typeof parsed.occupancy !== "number" ||
      typeof parsed.roomLevel !== "number" ||
      typeof parsed.lastSavedAt !== "number"
    ) {
      return null;
    }
    return {
      money: parsed.money,
      rooms: parsed.rooms,
      adr: parsed.adr,
      occupancy: parsed.occupancy,
      roomLevel: parsed.roomLevel,
      totalEarned: typeof parsed.totalEarned === "number" ? parsed.totalEarned : parsed.money,
      totalCheckIns: typeof parsed.totalCheckIns === "number" ? parsed.totalCheckIns : 0,
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements) ? parsed.unlockedAchievements : [],
      adBoostUntil: typeof parsed.adBoostUntil === "number" ? parsed.adBoostUntil : 0,
      lastAdWatchAt: typeof parsed.lastAdWatchAt === "number" ? parsed.lastAdWatchAt : 0,
      lastSavedAt: parsed.lastSavedAt,
    };
  } catch {
    return null;
  }
}

function withAchievementUpdate(state: GameState): GameState {
  const unlocked = new Set(state.unlockedAchievements);
  for (const achievement of achievementCatalog) {
    if (achievement.condition(state)) unlocked.add(achievement.id);
  }
  return { ...state, unlockedAchievements: Array.from(unlocked) };
}

export default function GamePage() {
  const [state, setState] = useState<GameState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [nowTs, setNowTs] = useState(0);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [coins, setCoins] = useState<FloatingCoin[]>([]);
  const [walkers, setWalkers] = useState<GuestWalker[]>([]);
  const [arrivedRooms, setArrivedRooms] = useState<number[]>([]);
  const [simSpeed, setSimSpeed] = useState(1);
  const [debugOpen, setDebugOpen] = useState(false);
  const hotelViewRef = useRef<HTMLDivElement | null>(null);
  const lobbyRef = useRef<HTMLDivElement | null>(null);
  const roomRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const nextGuestRoomRef = useRef(0);
  const nextWalkerIdRef = useRef(0);

  const currentIncome = useMemo(() => incomePerSec(state), [state]);
  const currentRoomCost = useMemo(() => roomCost(state.roomLevel), [state.roomLevel]);
  const litRooms = useMemo(
    () => Math.max(0, Math.min(state.rooms, Math.floor(state.rooms * state.occupancy))),
    [state.rooms, state.occupancy],
  );
  const arrivedRoomSet = useMemo(() => new Set(arrivedRooms), [arrivedRooms]);
  const adBoostActive = isAdBoostActive(state.adBoostUntil, nowTs);
  const adCooldownSec = adCooldownRemainingSec(state.lastAdWatchAt, nowTs);
  const adBoostSec = adBoostRemainingSec(state.adBoostUntil, nowTs);

  useEffect(() => {
    const saved = safeParseState(window.localStorage.getItem(STORAGE_KEY));
    const nextState = (() => {
      if (!saved) return initialState;
      const secondsOffline = Math.max(0, (Date.now() - saved.lastSavedAt) / 1000);
      const offlineGain = incomePerSec(saved) * secondsOffline;
      return withAchievementUpdate({
        ...saved,
        money: saved.money + offlineGain,
        totalEarned: saved.totalEarned + offlineGain,
        lastSavedAt: Date.now(),
      });
    })();

    const timer = window.setTimeout(() => {
      setState(nextState);
      setNowTs(Date.now());
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const secondTicker = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => window.clearInterval(secondTicker);
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setInterval(() => {
      setState((prev) => {
        const adMul = adMultiplier(prev.adBoostUntil, Date.now());
        const gain = incomePerSec(prev) * 0.25 * simSpeed * adMul;
        return withAchievementUpdate({
          ...prev,
          money: prev.money + gain,
          totalEarned: prev.totalEarned + gain,
        });
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [hydrated, simSpeed]);

  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setInterval(() => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...state,
          lastSavedAt: Date.now(),
        }),
      );
    }, 3000);
    return () => window.clearInterval(timer);
  }, [state, hydrated]);

  function addCoin(x: number, y: number) {
    const id = `${Date.now()}-${Math.random()}`;
    setCoins((prev) => [...prev, { id, x, y }]);
    window.setTimeout(() => {
      setCoins((prev) => prev.filter((coin) => coin.id !== id));
    }, 720);
  }

  function onCheckIn(event: React.MouseEvent<HTMLButtonElement>) {
    const gain = Math.floor(CHECKIN_BASE + (state.adr / 2400) * (0.6 + state.occupancy));
    const rect = event.currentTarget.getBoundingClientRect();
    addCoin(event.clientX - rect.left, event.clientY - rect.top);

    const targetRoom = nextGuestRoomRef.current % Math.max(1, state.rooms);
    nextGuestRoomRef.current += 1;
    window.requestAnimationFrame(() => {
      runGuestWalk(targetRoom);
    });

    setState((prev) =>
      withAchievementUpdate({
        ...prev,
        money: prev.money + gain,
        occupancy: Math.min(0.95, prev.occupancy + 0.003),
        totalEarned: prev.totalEarned + gain,
        totalCheckIns: prev.totalCheckIns + 1,
      }),
    );
  }

  function runGuestWalk(roomIndex: number) {
    const hotelEl = hotelViewRef.current;
    const lobbyEl = lobbyRef.current;
    const roomEl = roomRefs.current.get(roomIndex);
    if (!hotelEl || !lobbyEl || !roomEl) return;

    const hotelRect = hotelEl.getBoundingClientRect();
    const lobbyRect = lobbyEl.getBoundingClientRect();
    const roomRect = roomEl.getBoundingClientRect();

    const startX = lobbyRect.left + lobbyRect.width / 2 - hotelRect.left;
    const startY = lobbyRect.top + lobbyRect.height / 2 - hotelRect.top;
    const endX = roomRect.left + roomRect.width / 2 - hotelRect.left;
    const endY = roomRect.top + roomRect.height / 2 - hotelRect.top;
    const id = `walker-${nextWalkerIdRef.current}`;
    nextWalkerIdRef.current += 1;

    setWalkers((prev) => [
      ...prev,
      {
        id,
        roomIndex,
        startX,
        startY,
        deltaX: endX - startX,
        deltaY: endY - startY,
      },
    ]);

    window.setTimeout(() => {
      setWalkers((prev) => prev.filter((walker) => walker.id !== id));
      setArrivedRooms((prev) => [...prev, roomIndex]);
      window.setTimeout(() => {
        setArrivedRooms((prev) => prev.filter((idx) => idx !== roomIndex));
      }, 500);
    }, 850);
  }

  function onBuyRooms() {
    if (state.money < currentRoomCost) return;
    setState((prev) =>
      withAchievementUpdate({
        ...prev,
        money: prev.money - currentRoomCost,
        rooms: prev.rooms + 6,
        roomLevel: prev.roomLevel + 1,
        occupancy: Math.max(0.15, prev.occupancy - 0.02),
      }),
    );
  }

  function raiseAdr() {
    setState((prev) => withAchievementUpdate({ ...prev, adr: Math.floor(prev.adr * 1.05) }));
  }

  function raiseOccupancy() {
    setState((prev) => withAchievementUpdate({ ...prev, occupancy: Math.min(0.95, prev.occupancy + 0.03) }));
  }

  function setMoneyDelta(delta: number) {
    setState((prev) =>
      withAchievementUpdate({
        ...prev,
        money: Math.max(0, prev.money + delta),
        totalEarned: delta > 0 ? prev.totalEarned + delta : prev.totalEarned,
      }),
    );
  }

  function setRoomsDelta(delta: number) {
    setState((prev) =>
      withAchievementUpdate({
        ...prev,
        rooms: Math.max(1, prev.rooms + delta),
      }),
    );
  }

  function setAdrDelta(delta: number) {
    setState((prev) =>
      withAchievementUpdate({
        ...prev,
        adr: Math.max(100, prev.adr + delta),
      }),
    );
  }

  function setOccupancyDelta(delta: number) {
    setState((prev) =>
      withAchievementUpdate({
        ...prev,
        occupancy: Math.max(0.01, Math.min(0.95, prev.occupancy + delta)),
      }),
    );
  }

  function resetProgress() {
    const next = { ...initialState, lastSavedAt: Date.now() };
    setState(next);
    setWalkers([]);
    setArrivedRooms([]);
    setCoins([]);
    nextGuestRoomRef.current = 0;
    nextWalkerIdRef.current = 0;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function simulateAdReward(kind: "boost" | "instant") {
    if (isAdLoading || adCooldownSec > 0) return;
    setIsAdLoading(true);
    window.setTimeout(() => {
      const watchedAt = Date.now();
      setState((prev) => {
        const base = {
          ...prev,
          lastAdWatchAt: watchedAt,
        };
        if (kind === "boost") {
          return withAchievementUpdate({
            ...base,
            adBoostUntil: watchedAt + AD_BOOST_MS,
          });
        }
        const instantGain = incomePerSec(prev) * AD_INSTANT_SECONDS;
        return withAchievementUpdate({
          ...base,
          money: prev.money + instantGain,
          totalEarned: prev.totalEarned + instantGain,
        });
      });
      setIsAdLoading(false);
      setNowTs(Date.now());
    }, 2500);
  }

  const roomsPerFloor = GRID_COLS * GRID_ROWS_PER_FLOOR;
  const floors = Math.max(1, Math.ceil(state.rooms / roomsPerFloor));
  const totalCells = floors * roomsPerFloor;

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="mx-auto max-w-4xl text-sm text-slate-300">ロード中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_15%_20%,#123347_0%,#0f1b2d_30%,#090f1b_72%)] text-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <header className="rounded-xl border border-cyan-900/70 bg-slate-900/80 backdrop-blur p-4">
          <h1 className="text-lg font-bold tracking-wide">HOTEL IDLE (WEB MVP)</h1>
          <p className="text-sm text-slate-300 mt-1">見た目成長つきのホテル経営インクリメンタル</p>
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-cyan-100/90 md:grid-cols-3">
            <div className="rounded-md border border-cyan-900/70 bg-cyan-950/30 px-2 py-1.5">地区ランク: Seaside District</div>
            <div className="rounded-md border border-cyan-900/70 bg-cyan-950/30 px-2 py-1.5">評判: {Math.min(99, 40 + Math.floor(state.occupancy * 60))}/100</div>
            <div className="rounded-md border border-cyan-900/70 bg-cyan-950/30 px-2 py-1.5">稼働フロア: {floors}F</div>
          </div>
        </header>

        <section ref={hotelViewRef} className="relative overflow-hidden rounded-xl border border-cyan-900/70 bg-slate-900/80 p-4">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(52,125,168,0.22)_0%,rgba(18,30,52,0.12)_38%,rgba(8,12,20,0)_100%)]" />
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-12 animate-[cloudSlide_18s_linear_infinite] opacity-40 bg-[radial-gradient(circle_at_20%_50%,rgba(220,241,255,0.35),transparent_28%),radial-gradient(circle_at_58%_40%,rgba(220,241,255,0.28),transparent_24%),radial-gradient(circle_at_88%_45%,rgba(220,241,255,0.25),transparent_22%)]" />
          <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide text-slate-400">
            <span>Hotel View</span>
            <span>{floors} Floors</span>
          </div>
          <div className="relative space-y-2">
            <div className="mb-2 rounded-md border border-cyan-900/70 bg-cyan-950/20 px-3 py-1 text-[11px] font-semibold tracking-widest text-cyan-100">
              OCEAN CROWN HOTEL
            </div>
            {Array.from({ length: floors }).map((_, floorTopIndex) => {
              const floorFromBottom = floors - 1 - floorTopIndex;
              const start = floorFromBottom * roomsPerFloor;
              return (
                <div key={floorTopIndex} className="grid grid-cols-6 gap-1.5">
                  {Array.from({ length: roomsPerFloor }).map((__, idx) => {
                    const roomIndex = start + idx;
                    const exists = roomIndex < Math.min(state.rooms, totalCells);
                    const lit = exists && roomIndex < litRooms;
                    return (
                      <div
                        key={roomIndex}
                        ref={(el) => {
                          if (el && exists) {
                            roomRefs.current.set(roomIndex, el);
                            return;
                          }
                          roomRefs.current.delete(roomIndex);
                        }}
                        className={[
                          "h-10 rounded-md border text-center leading-10 text-[11px] font-bold transition-all",
                          exists ? "border-slate-700 bg-gradient-to-b from-slate-700/90 to-slate-900 text-slate-500 shadow-[inset_0_-6px_14px_rgba(0,0,0,0.35)]" : "border-transparent bg-transparent",
                          lit
                            ? "border-amber-400/80 bg-gradient-to-b from-amber-200/70 to-amber-500/50 text-amber-50 shadow-[0_0_10px_rgba(251,191,36,0.35)]"
                            : "",
                          arrivedRoomSet.has(roomIndex) ? "ring-2 ring-amber-300 ring-offset-1 ring-offset-slate-900" : "",
                        ].join(" ")}
                      >
                        {exists ? (lit ? "●" : "○") : ""}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div
            ref={lobbyRef}
            className="relative mt-3 rounded-md border border-cyan-700/70 bg-gradient-to-r from-cyan-900/70 via-slate-800 to-cyan-950/70 px-3 py-2 text-center text-xs font-semibold tracking-wider text-cyan-100"
          >
            LOBBY ENTRANCE
          </div>
          {walkers.map((walker) => (
            <span
              key={walker.id}
              className="pointer-events-none absolute text-lg animate-[guestWalk_850ms_cubic-bezier(0.2,0.9,0.2,1)_forwards]"
              style={
                {
                  left: walker.startX - 9,
                  top: walker.startY - 12,
                  "--dx": `${walker.deltaX}px`,
                  "--dy": `${walker.deltaY}px`,
                } as React.CSSProperties
              }
            >
              🧍
            </span>
          ))}
        </section>

        <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <StatCard label="所持金" value={`¥ ${formatNumber(state.money)}`} />
          <StatCard
            label="収益/秒"
            value={`¥ ${formatNumber(currentIncome * simSpeed * adMultiplier(state.adBoostUntil, nowTs))}`}
          />
          <StatCard label="稼働率" value={`${Math.floor(state.occupancy * 100)}%`} />
        </section>
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <StatCard label="累計収益" value={`¥ ${formatNumber(state.totalEarned)}`} />
          <StatCard label="接客回数" value={formatNumber(state.totalCheckIns)} />
        </section>

        <section className="rounded-xl border border-indigo-700/70 bg-slate-900/80 p-4 relative overflow-hidden">
          <button
            type="button"
            onClick={onCheckIn}
            className="w-full rounded-lg border border-cyan-500/80 bg-gradient-to-r from-cyan-700/30 via-cyan-600/20 to-teal-700/30 px-4 py-3 text-left transition hover:brightness-110 active:scale-[0.99]"
          >
            <div className="text-base font-bold">チェックイン対応（タップ）</div>
            <div className="mt-1 text-sm text-slate-300">即時収益 + 稼働率が少し上昇</div>
          </button>
          {coins.map((coin) => (
            <span
              key={coin.id}
              className="pointer-events-none absolute text-lg animate-[coinUp_720ms_ease-out_forwards]"
              style={{ left: coin.x - 8, top: coin.y - 12 }}
            >
              💰
            </span>
          ))}
        </section>

        <section className="rounded-xl border border-slate-700/90 bg-slate-900/80 p-4 space-y-3">
          <h2 className="text-sm font-bold tracking-wide text-slate-200">アップグレード</h2>
          <button
            type="button"
            onClick={onBuyRooms}
            disabled={state.money < currentRoomCost}
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 px-3 py-3 text-left disabled:opacity-50"
          >
            <div>
              <p className="font-semibold text-slate-100">客室を増築（+6部屋）</p>
              <p className="text-xs text-slate-400">収益/秒アップ。購入時は稼働率が少し下がる。</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-100">¥ {formatNumber(currentRoomCost)}</p>
              <p className="text-xs text-slate-400">Lv {state.roomLevel}</p>
            </div>
          </button>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <button
              type="button"
              onClick={raiseAdr}
              className="rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 px-3 py-2 text-sm font-semibold"
            >
              単価UP（ADR +5%）
            </button>
            <button
              type="button"
              onClick={raiseOccupancy}
              className="rounded-lg border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 px-3 py-2 text-sm font-semibold"
            >
              口コミ改善（稼働率 +3%）
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide text-slate-200">実績 / 称号</h2>
            <span className="text-xs text-slate-400">
              {state.unlockedAchievements.length} / {achievementCatalog.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {achievementCatalog.map((achievement) => {
              const unlocked = state.unlockedAchievements.includes(achievement.id);
              return (
                <div
                  key={achievement.id}
                  className={[
                    "rounded-lg border px-3 py-2",
                    unlocked ? "border-emerald-500/60 bg-emerald-900/20" : "border-slate-700 bg-slate-800",
                  ].join(" ")}
                >
                  <p className={["text-sm font-semibold", unlocked ? "text-emerald-100" : "text-slate-200"].join(" ")}>
                    {unlocked ? "🏅 " : "🔒 "}
                    {achievement.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{achievement.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-cyan-700/60 bg-cyan-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide text-cyan-100">広告報酬（モック）</h2>
            <span className="text-xs text-cyan-200/90">
              {adBoostActive ? `2x残り ${Math.floor(adBoostSec / 60)}:${`${adBoostSec % 60}`.padStart(2, "0")}` : "ブーストなし"}
            </span>
          </div>
          <p className="text-xs text-cyan-100/80">
            本番ではAdMob等に置き換える前提。今は視聴シミュレーション（2.5秒）で報酬検証できます。
          </p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <button
              type="button"
              onClick={() => simulateAdReward("boost")}
              disabled={isAdLoading || adCooldownSec > 0}
              className="rounded-lg border border-cyan-700 bg-cyan-900/30 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              広告視聴: 30分 2x ブースト
            </button>
            <button
              type="button"
              onClick={() => simulateAdReward("instant")}
              disabled={isAdLoading || adCooldownSec > 0}
              className="rounded-lg border border-cyan-700 bg-cyan-900/30 px-3 py-2 text-sm font-semibold disabled:opacity-50"
            >
              広告視聴: 10分分の即時収益
            </button>
          </div>
          <div className="text-xs text-cyan-100/80">
            {isAdLoading
              ? "広告再生中..."
              : adCooldownSec > 0
                ? `次の広告まで ${adCooldownSec} 秒`
                : "視聴可能"}
          </div>
        </section>

        <section className="rounded-xl border border-amber-700/60 bg-amber-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide text-amber-200">バランス調整パネル</h2>
            <button
              type="button"
              onClick={() => setDebugOpen((v) => !v)}
              className="rounded-md border border-amber-600 px-2 py-1 text-xs font-semibold text-amber-200"
            >
              {debugOpen ? "閉じる" : "開く"}
            </button>
          </div>

          {debugOpen ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <button type="button" onClick={() => setMoneyDelta(10_000)} className="rounded-md border border-amber-700 bg-amber-900/40 px-2 py-2 text-xs font-semibold">
                  +¥10,000
                </button>
                <button type="button" onClick={() => setMoneyDelta(-5_000)} className="rounded-md border border-amber-700 bg-amber-900/40 px-2 py-2 text-xs font-semibold">
                  -¥5,000
                </button>
                <button type="button" onClick={() => setRoomsDelta(6)} className="rounded-md border border-amber-700 bg-amber-900/40 px-2 py-2 text-xs font-semibold">
                  部屋 +6
                </button>
                <button type="button" onClick={() => setRoomsDelta(-6)} className="rounded-md border border-amber-700 bg-amber-900/40 px-2 py-2 text-xs font-semibold">
                  部屋 -6
                </button>
                <button type="button" onClick={() => setAdrDelta(500)} className="rounded-md border border-amber-700 bg-amber-900/40 px-2 py-2 text-xs font-semibold">
                  ADR +500
                </button>
                <button type="button" onClick={() => setAdrDelta(-500)} className="rounded-md border border-amber-700 bg-amber-900/40 px-2 py-2 text-xs font-semibold">
                  ADR -500
                </button>
                <button type="button" onClick={() => setOccupancyDelta(0.05)} className="rounded-md border border-amber-700 bg-amber-900/40 px-2 py-2 text-xs font-semibold">
                  稼働率 +5%
                </button>
                <button type="button" onClick={() => setOccupancyDelta(-0.05)} className="rounded-md border border-amber-700 bg-amber-900/40 px-2 py-2 text-xs font-semibold">
                  稼働率 -5%
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-amber-200">時間倍率:</span>
                {[1, 2, 5, 10].map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setSimSpeed(speed)}
                    className={[
                      "rounded-md border px-2 py-1 text-xs font-semibold",
                      simSpeed === speed
                        ? "border-amber-400 bg-amber-500/30 text-amber-100"
                        : "border-amber-700 text-amber-200",
                    ].join(" ")}
                  >
                    x{speed}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={resetProgress}
                  className="ml-auto rounded-md border border-rose-500 bg-rose-900/30 px-2 py-1 text-xs font-semibold text-rose-100"
                >
                  進行リセット
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <style jsx>{`
        @keyframes coinUp {
          0% {
            transform: translateY(0) scale(0.85);
            opacity: 1;
          }
          100% {
            transform: translateY(-42px) scale(1.1);
            opacity: 0;
          }
        }
        @keyframes cloudSlide {
          0% {
            transform: translateX(-25%);
          }
          100% {
            transform: translateX(25%);
          }
        }
        @keyframes guestWalk {
          0% {
            transform: translate(0, 0) scale(0.85);
            opacity: 0.95;
          }
          70% {
            transform: translate(var(--dx), var(--dy)) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--dx), var(--dy)) scale(0.9);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3">
      <div className="text-xs font-semibold tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-100">{value}</div>
    </div>
  );
}
