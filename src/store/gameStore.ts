import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameStatus =
  | "setup"
  | "first_half"
  | "halftime"
  | "second_half"
  | "finished";

export type EventType = "GOAL" | "CARD" | "PENALTY" | "INJURY";
export type EventSubtype =
  | "SELVMÅL"
  | "YELLOW"
  | "RED"
  | "DIRECT_RED"
  | "STRAFFE"
  | "SKADE";
export type EventTeam = "home" | "away";

export interface GameEvent {
  id: string;
  gameId: string;
  minute: number;
  secondsRaw: number;
  type: EventType;
  subtype?: EventSubtype;
  team: EventTeam;
  playerNumber?: number;
  isSelvmål?: boolean;
  synced?: boolean;
}

export interface CurrentGame {
  id: string;
  homeTeam: string;
  awayTeam: string;
  myTeamIsHome: boolean;
  date: string;
  kickoffTime: string;
  halfDuration: number;
  numHalves: number;
  status: GameStatus;
  timerSeconds: number;
  isRunning: boolean;
  currentHalf: number;
}

interface GameStore {
  currentGame: CurrentGame | null;
  events: GameEvent[];
  myTeamName: string;
  clockDisplay: "spilt" | "igjen";
  screen: "pregame" | "match" | "flip";

  setMyTeamName: (name: string) => void;
  setScreen: (s: "pregame" | "match" | "flip") => void;
  setClockDisplay: (mode: "spilt" | "igjen") => void;

  startGame: (params: {
    homeTeam: string;
    awayTeam: string;
    myTeamIsHome: boolean;
    date: string;
    kickoffTime: string;
    halfDuration: number;
    numHalves: number;
  }) => void;

  resetGame: () => void;

  tick: () => void;
  toggleClock: () => void;
  advanceHalf: () => void;

  addEvent: (event: Omit<GameEvent, "id" | "gameId">) => void;
  updateEvent: (id: string, patch: Partial<GameEvent>) => void;
  deleteEvent: (id: string) => void;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentGame: null,
      events: [],
      myTeamName: "Oppsal",
      clockDisplay: "spilt",
      screen: "pregame",

      setMyTeamName: (name) => set({ myTeamName: name }),
      setScreen: (s) => set({ screen: s }),
      setClockDisplay: (mode) => set({ clockDisplay: mode }),

      startGame: (params) => {
        const id = generateId();
        set({
          currentGame: {
            id,
            homeTeam: params.homeTeam,
            awayTeam: params.awayTeam,
            myTeamIsHome: params.myTeamIsHome,
            date: params.date,
            kickoffTime: params.kickoffTime,
            halfDuration: params.halfDuration,
            numHalves: params.numHalves,
            status: "first_half",
            timerSeconds: 0,
            isRunning: false,
            currentHalf: 1,
          },
          events: [],
          screen: "match",
        });
      },

      resetGame: () =>
        set({ currentGame: null, events: [], screen: "pregame" }),

      tick: () => {
        const { currentGame } = get();
        if (!currentGame || !currentGame.isRunning) return;
        if (
          currentGame.status !== "first_half" &&
          currentGame.status !== "second_half"
        )
          return;
        set({
          currentGame: {
            ...currentGame,
            timerSeconds: currentGame.timerSeconds + 1,
          },
        });
      },

      toggleClock: () => {
        const { currentGame } = get();
        if (!currentGame) return;
        if (
          currentGame.status !== "first_half" &&
          currentGame.status !== "second_half"
        )
          return;
        set({
          currentGame: {
            ...currentGame,
            isRunning: !currentGame.isRunning,
          },
        });
      },

      advanceHalf: () => {
        const { currentGame } = get();
        if (!currentGame) return;
        const { status, numHalves } = currentGame;

        if (status === "first_half") {
          set({
            currentGame: {
              ...currentGame,
              status: "halftime",
              isRunning: false,
            },
          });
        } else if (status === "halftime") {
          if (numHalves > 1) {
            set({
              currentGame: {
                ...currentGame,
                status: "second_half",
                isRunning: false,
                timerSeconds: 0,
                currentHalf: 2,
              },
            });
          } else {
            set({
              currentGame: {
                ...currentGame,
                status: "finished",
                isRunning: false,
              },
            });
          }
        } else if (status === "second_half") {
          set({
            currentGame: {
              ...currentGame,
              status: "finished",
              isRunning: false,
            },
          });
        }
      },

      addEvent: (event) => {
        const { currentGame } = get();
        if (!currentGame) return;
        const newEvent: GameEvent = {
          ...event,
          id: generateId(),
          gameId: currentGame.id,
        };
        set((state) => ({ events: [...state.events, newEvent] }));
      },

      updateEvent: (id, patch) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
      },
    }),
    {
      name: "sidelinja-game",
      partialize: (state) => ({
        currentGame: state.currentGame,
        events: state.events,
        myTeamName: state.myTeamName,
        clockDisplay: state.clockDisplay,
        screen: state.screen,
      }),
    }
  )
);

// ─── Derived selectors ────────────────────────────────────────────────────────

export function useScore() {
  const events = useGameStore((s) => s.events);
  const game = useGameStore((s) => s.currentGame);
  if (!game) return { home: 0, away: 0 };

  let home = 0;
  let away = 0;

  for (const e of events) {
    if (e.type !== "GOAL" && e.type !== "PENALTY") continue;
    if (e.isSelvmål) {
      // selvmål: counts for the opposing team
      if (e.team === "home") away++;
      else home++;
    } else {
      if (e.team === "home") home++;
      else away++;
    }
  }

  return { home, away };
}

export function useCards(team: EventTeam) {
  const events = useGameStore((s) => s.events);
  const yellow = events.filter(
    (e) => e.team === team && e.subtype === "YELLOW"
  ).length;
  const red = events.filter(
    (e) =>
      e.team === team &&
      (e.subtype === "RED" ||
        e.subtype === "DIRECT_RED")
  ).length;
  return { yellow, red };
}

export function usePlayerCards(team: EventTeam, playerNumber: number) {
  const events = useGameStore((s) => s.events);
  const yellows = events.filter(
    (e) =>
      e.team === team &&
      e.playerNumber === playerNumber &&
      e.subtype === "YELLOW"
  ).length;
  return { yellows };
}

export function useClockText(): string {
  const game = useGameStore((s) => s.currentGame);
  const display = useGameStore((s) => s.clockDisplay);
  if (!game) return "00:00";

  const halfDur = game.halfDuration * 60;
  let secs: number;

  if (display === "igjen") {
    secs = Math.max(0, halfDur - game.timerSeconds);
  } else {
    secs = game.timerSeconds;
  }

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useCurrentMinute(): number {
  const game = useGameStore((s) => s.currentGame);
  if (!game) return 0;
  return Math.floor(game.timerSeconds / 60);
}

export function useHalfLabel(): string {
  const game = useGameStore((s) => s.currentGame);
  if (!game) return "";
  switch (game.status) {
    case "first_half":  return "1. omgang";
    case "halftime":    return "Pause";
    case "second_half": return "2. omgang";
    case "finished":    return "Slutt";
    default:            return "";
  }
}

export function useAdvanceLabel(): string | null {
  const game = useGameStore((s) => s.currentGame);
  if (!game) return null;
  switch (game.status) {
    case "first_half":  return "Avslutt 1. omgang";
    case "halftime":    return "Start 2. omgang";
    case "second_half": return "Avslutt kamp";
    case "finished":    return null;
    default:            return null;
  }
}

export function eventIcon(e: GameEvent): string {
  if (e.type === "GOAL" || e.type === "PENALTY") return "⚽";
  if (e.type === "INJURY") return "🤕";
  if (e.subtype === "RED" || e.subtype === "DIRECT_RED") return "🟥";
  return "🟨";
}

export function eventLabel(e: GameEvent, game: CurrentGame): string {
  const teamName = e.team === "home" ? game.homeTeam : game.awayTeam;
  const player = e.playerNumber ? ` #${e.playerNumber}` : "";
  const selvmål = e.isSelvmål ? " (selvmål)" : "";
  return `${teamName}${player}${selvmål}`;
}
